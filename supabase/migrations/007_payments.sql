-- ============================================================
-- BRIGHTLOOP HUB — Migration 007: Payments & Invoice Allocation
-- Dependency Order: 7 / 10
-- Responsible: Rufaid (Sales & Finance)
-- ============================================================

-- Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('bank_transfer', 'cash', 'card', 'upi', 'stripe', 'other')),
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  transaction_reference TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Allocations Table (Many-to-Many Payment to Invoice Allocation)
CREATE TABLE IF NOT EXISTS public.payment_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE RESTRICT,
  allocated_amount NUMERIC(12, 2) NOT NULL CHECK (allocated_amount > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payment_invoice UNIQUE (payment_id, invoice_id)
);

-- Validation Trigger: Prevent over-allocating payment amount and invoice total
-- Locks payment and invoice rows in deterministic order to prevent race conditions and deadlocks
CREATE OR REPLACE FUNCTION validate_payment_allocation()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_payment_total NUMERIC(12, 2);
  v_other_allocations NUMERIC(12, 2);
  v_invoice_total NUMERIC(12, 2);
  v_other_inv_allocations NUMERIC(12, 2);
BEGIN
  -- 1. Deterministically lock payment row(s) to serialize allocations against the same payment
  -- When updating payment_id, lock both old and new payments in deterministic order (ORDER BY id)
  IF TG_OP = 'UPDATE' AND OLD.payment_id IS DISTINCT FROM NEW.payment_id THEN
    PERFORM id FROM public.payments
      WHERE id IN (OLD.payment_id, NEW.payment_id)
      ORDER BY id
      FOR UPDATE;
  ELSE
    PERFORM id FROM public.payments
      WHERE id = NEW.payment_id
      FOR UPDATE;
  END IF;

  -- 2. Deterministically lock invoice row(s) to serialize allocations against the same invoice
  -- When updating invoice_id (reassignment), lock both old and new invoices in deterministic order
  IF TG_OP = 'UPDATE' AND OLD.invoice_id IS DISTINCT FROM NEW.invoice_id THEN
    PERFORM id FROM public.invoices
      WHERE id IN (OLD.invoice_id, NEW.invoice_id)
      ORDER BY id
      FOR UPDATE;
  ELSE
    PERFORM id FROM public.invoices
      WHERE id = NEW.invoice_id
      FOR UPDATE;
  END IF;

  -- 3. Check against Payment total amount
  SELECT amount INTO v_payment_total
    FROM public.payments
   WHERE id = NEW.payment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced payment % does not exist', NEW.payment_id;
  END IF;

  SELECT COALESCE(SUM(allocated_amount), 0.00) INTO v_other_allocations
    FROM public.payment_allocations
   WHERE payment_id = NEW.payment_id
     AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (v_other_allocations + NEW.allocated_amount) > v_payment_total THEN
    RAISE EXCEPTION 'Allocation exceeds payment total amount (Payment: %, Current allocated: %, Attempted: %)',
      v_payment_total, v_other_allocations, NEW.allocated_amount;
  END IF;

  -- 4. Check against Invoice total amount
  SELECT total_amount INTO v_invoice_total
    FROM public.invoices
   WHERE id = NEW.invoice_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referenced invoice % does not exist', NEW.invoice_id;
  END IF;

  SELECT COALESCE(SUM(allocated_amount), 0.00) INTO v_other_inv_allocations
    FROM public.payment_allocations
   WHERE invoice_id = NEW.invoice_id
     AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

  IF (v_other_inv_allocations + NEW.allocated_amount) > v_invoice_total THEN
    RAISE EXCEPTION 'Allocation exceeds invoice balance (Invoice Total: %, Already allocated: %, Attempted: %)',
      v_invoice_total, v_other_inv_allocations, NEW.allocated_amount;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_payment_allocation ON public.payment_allocations;
CREATE TRIGGER trg_validate_payment_allocation
  BEFORE INSERT OR UPDATE ON public.payment_allocations
  FOR EACH ROW EXECUTE FUNCTION validate_payment_allocation();

-- Function to recalculate invoice balances upon payment allocation
-- Correctly handles INSERT, DELETE, and UPDATE (including moving allocation across invoices)
CREATE OR REPLACE FUNCTION update_invoice_payment_totals()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inv_id UUID;
  v_total_paid NUMERIC(12, 2);
  v_invoice_total NUMERIC(12, 2);
BEGIN
  -- If a DELETE occurs, lock the affected invoice row to prevent concurrent race conditions
  IF TG_OP = 'DELETE' THEN
    PERFORM id FROM public.invoices WHERE id = OLD.invoice_id FOR UPDATE;
  END IF;

  -- If an UPDATE changed invoice_id, recalculate the OLD invoice first
  IF TG_OP = 'UPDATE' AND OLD.invoice_id IS DISTINCT FROM NEW.invoice_id THEN
    SELECT COALESCE(SUM(allocated_amount), 0.00) INTO v_total_paid
      FROM public.payment_allocations
     WHERE invoice_id = OLD.invoice_id;

    SELECT total_amount INTO v_invoice_total
      FROM public.invoices
     WHERE id = OLD.invoice_id;

    IF v_invoice_total IS NOT NULL THEN
      UPDATE public.invoices
         SET amount_paid = v_total_paid,
             balance_due = GREATEST(0.00, v_invoice_total - v_total_paid),
             status = CASE
               WHEN v_total_paid >= v_invoice_total AND v_invoice_total > 0 THEN 'paid'
               WHEN v_total_paid > 0 THEN 'partially_paid'
               ELSE 'confirmed'
             END,
             updated_at = now()
       WHERE id = OLD.invoice_id;
    END IF;
  END IF;

  -- Recalculate target invoice (NEW for INSERT/UPDATE, OLD for DELETE)
  v_inv_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.invoice_id ELSE NEW.invoice_id END;

  SELECT COALESCE(SUM(allocated_amount), 0.00) INTO v_total_paid
    FROM public.payment_allocations
   WHERE invoice_id = v_inv_id;

  SELECT total_amount INTO v_invoice_total
    FROM public.invoices
   WHERE id = v_inv_id;

  IF v_invoice_total IS NOT NULL THEN
    UPDATE public.invoices
       SET amount_paid = v_total_paid,
           balance_due = GREATEST(0.00, v_invoice_total - v_total_paid),
           status = CASE
             WHEN v_total_paid >= v_invoice_total AND v_invoice_total > 0 THEN 'paid'
             WHEN v_total_paid > 0 THEN 'partially_paid'
             ELSE 'confirmed'
           END,
           updated_at = now()
     WHERE id = v_inv_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_payment_alloc_totals ON public.payment_allocations;
CREATE TRIGGER trg_payment_alloc_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_allocations
  FOR EACH ROW EXECUTE FUNCTION update_invoice_payment_totals();

DROP TRIGGER IF EXISTS trg_payments_updated_at ON public.payments;
CREATE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
