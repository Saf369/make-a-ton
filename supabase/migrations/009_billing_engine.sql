-- ============================================================
-- BRIGHTLOOP HUB — Migration 009: Recurring Billing Engine & Sequences
-- Dependency Order: 9 / 10
-- Responsible: Rufaid & Afsal
-- ============================================================

-- Sequences for concurrency-safe unique document number generation
CREATE SEQUENCE IF NOT EXISTS public.seq_sub_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_inv_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_so_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_qt_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_pay_number START 1;
CREATE SEQUENCE IF NOT EXISTS public.seq_run_number START 1;

-- Document number generator functions with search_path security
CREATE OR REPLACE FUNCTION generate_subscription_number()
RETURNS TEXT LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 'SUB-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.seq_sub_number')::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 'INV-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.seq_inv_number')::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_sales_order_number()
RETURNS TEXT LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 'SO-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.seq_so_number')::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_quotation_number()
RETURNS TEXT LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 'QT-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.seq_qt_number')::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TEXT LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 'PAY-' || to_char(CURRENT_DATE, 'YYYY') || '-' || lpad(nextval('public.seq_pay_number')::text, 5, '0');
END;
$$;

CREATE OR REPLACE FUNCTION generate_billing_run_number()
RETURNS TEXT LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN 'RUN-' || to_char(CURRENT_DATE, 'YYYYMMDD') || '-' || lpad(nextval('public.seq_run_number')::text, 4, '0');
END;
$$;

-- Billing Runs Table
CREATE TABLE IF NOT EXISTS public.billing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number TEXT NOT NULL UNIQUE DEFAULT generate_billing_run_number(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'partial')),
  eligible_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  error_details JSONB DEFAULT '[]'::jsonb,
  trigger_source TEXT NOT NULL DEFAULT 'manual_admin' CHECK (trigger_source IN ('scheduled', 'manual_admin', 'api')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Core Recurring Billing Engine RPC Function
-- Transactional, idempotent, concurrency-safe invoice generation
CREATE OR REPLACE FUNCTION public.process_due_subscriptions(p_trigger_source TEXT DEFAULT 'manual_admin')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_run_id UUID;
  v_run_number TEXT;
  v_eligible_count INTEGER := 0;
  v_success_count INTEGER := 0;
  v_failure_count INTEGER := 0;
  v_errors JSONB := '[]'::jsonb;
  v_sub RECORD;
  v_inv_id UUID;
  v_inv_number TEXT;
  v_idempotency_key TEXT;
  v_period_start DATE;
  v_period_end DATE;
  v_next_billing DATE;
  v_item RECORD;
  v_addon RECORD;
  v_already_billed_onetime BOOLEAN;
  v_subtotal NUMERIC(12, 2) := 0.00;
  v_tax_amount NUMERIC(12, 2) := 0.00;
  v_total_amount NUMERIC(12, 2) := 0.00;
  v_line_total NUMERIC(12, 2) := 0.00;
  v_item_tax NUMERIC(12, 2) := 0.00;
BEGIN
  -- 1. Create billing run tracking record
  v_run_number := generate_billing_run_number();
  INSERT INTO public.billing_runs (run_number, trigger_source, status)
  VALUES (v_run_number, p_trigger_source, 'running')
  RETURNING id INTO v_run_id;

  -- 2. Iterate through all active due subscriptions with row locking
  -- Excludes paused, closed, cancelled, expired, and future subscriptions
  FOR v_sub IN
    SELECT s.*, c.name AS customer_name
      FROM public.subscriptions s
      JOIN public.customers c ON c.id = s.customer_id
     WHERE s.status = 'active'
       AND s.next_billing_date IS NOT NULL
       AND s.next_billing_date <= CURRENT_DATE
     ORDER BY s.next_billing_date ASC
       FOR UPDATE OF s SKIP LOCKED
  LOOP
    v_eligible_count := v_eligible_count + 1;

    BEGIN
      -- Calculate period start and end based on inclusive calendar intervals
      v_period_start := v_sub.next_billing_date;

      CASE v_sub.billing_interval
        WHEN 'daily' THEN
          v_period_end := v_period_start + (v_sub.billing_interval_count || ' days')::INTERVAL - INTERVAL '1 day';
        WHEN 'weekly' THEN
          v_period_end := v_period_start + (v_sub.billing_interval_count * 7 || ' days')::INTERVAL - INTERVAL '1 day';
        WHEN 'monthly' THEN
          v_period_end := (v_period_start + (v_sub.billing_interval_count || ' months')::INTERVAL - INTERVAL '1 day')::DATE;
        WHEN 'quarterly' THEN
          v_period_end := (v_period_start + (v_sub.billing_interval_count * 3 || ' months')::INTERVAL - INTERVAL '1 day')::DATE;
        WHEN 'semi_annual' THEN
          v_period_end := (v_period_start + (v_sub.billing_interval_count * 6 || ' months')::INTERVAL - INTERVAL '1 day')::DATE;
        WHEN 'annual' THEN
          v_period_end := (v_period_start + (v_sub.billing_interval_count || ' years')::INTERVAL - INTERVAL '1 day')::DATE;
        ELSE
          v_period_end := (v_period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;
      END CASE;

      -- Next billing date = current_period_end + 1 day
      v_next_billing := (v_period_end + INTERVAL '1 day')::DATE;

      -- Formulate unique idempotency key: subscription_id + cycle dates
      v_idempotency_key := v_sub.id::TEXT || ':' || v_period_start::TEXT || ':' || v_period_end::TEXT;

      -- Skip if invoice for this exact cycle was already generated
      IF EXISTS (SELECT 1 FROM public.invoices WHERE idempotency_key = v_idempotency_key) THEN
        CONTINUE;
      END IF;

      -- Generate unique invoice number
      v_inv_number := generate_invoice_number();

      v_subtotal := 0.00;
      v_tax_amount := 0.00;

      -- Calculate line totals from subscription items
      FOR v_item IN
        SELECT si.*, p.name AS product_name
          FROM public.subscription_items si
          JOIN public.products p ON p.id = si.product_id
         WHERE si.subscription_id = v_sub.id
      LOOP
        v_line_total := ROUND(v_item.quantity * v_item.unit_price, 2);
        v_item_tax := ROUND(v_line_total * COALESCE(v_item.tax_rate_snapshot, 0.0000), 2);
        v_subtotal := v_subtotal + v_line_total;
        v_tax_amount := v_tax_amount + v_item_tax;
      END LOOP;

      -- Calculate line totals from subscription add-ons (respecting billing types)
      FOR v_addon IN
        SELECT sa.*, a.name AS addon_name, a.billing_type AS catalog_billing_type
          FROM public.subscription_addons sa
          JOIN public.addons a ON a.id = sa.addon_id
         WHERE sa.subscription_id = v_sub.id
      LOOP
        -- Check if one-time add-on was already charged in a previous invoice
        IF v_addon.billing_type_snapshot = 'one_time' OR v_addon.catalog_billing_type = 'one_time' THEN
          SELECT EXISTS (
            SELECT 1
              FROM public.invoice_items ii
              JOIN public.invoices inv ON inv.id = ii.invoice_id
             WHERE inv.subscription_id = v_sub.id
               AND ii.description = v_addon.addon_name
          ) INTO v_already_billed_onetime;

          IF v_already_billed_onetime THEN
            CONTINUE; -- Do not charge one-time add-on repeatedly
          END IF;
        END IF;

        v_line_total := ROUND(v_addon.quantity * v_addon.unit_price, 2);
        v_item_tax := ROUND(v_line_total * 0.1800, 2); -- Standard default GST on digital add-ons
        v_subtotal := v_subtotal + v_line_total;
        v_tax_amount := v_tax_amount + v_item_tax;
      END LOOP;

      -- If no items, fallback to agreed_price
      IF v_subtotal = 0.00 AND v_sub.agreed_price > 0.00 THEN
        v_subtotal := v_sub.agreed_price;
        v_tax_amount := ROUND(v_subtotal * 0.1800, 2);
      END IF;

      v_total_amount := v_subtotal + v_tax_amount;

      -- Insert invoice
      INSERT INTO public.invoices (
        invoice_number, customer_id, subscription_id, invoice_date, due_date,
        period_start, period_end, currency, subtotal, discount_amount,
        tax_amount, total_amount, amount_paid, balance_due, status, idempotency_key
      ) VALUES (
        v_inv_number, v_sub.customer_id, v_sub.id, CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days',
        v_period_start, v_period_end, v_sub.currency, v_subtotal, 0.00,
        v_tax_amount, v_total_amount, 0.00, v_total_amount, 'confirmed', v_idempotency_key
      ) RETURNING id INTO v_inv_id;

      -- Insert invoice items for products
      FOR v_item IN
        SELECT si.*, p.name AS product_name
          FROM public.subscription_items si
          JOIN public.products p ON p.id = si.product_id
         WHERE si.subscription_id = v_sub.id
      LOOP
        v_line_total := ROUND(v_item.quantity * v_item.unit_price, 2);
        v_item_tax := ROUND(v_line_total * COALESCE(v_item.tax_rate_snapshot, 0.0000), 2);

        INSERT INTO public.invoice_items (
          invoice_id, description, quantity, unit_price, discount_amount,
          tax_name, tax_rate, tax_amount, line_total
        ) VALUES (
          v_inv_id, v_item.product_name, v_item.quantity, v_item.unit_price, 0.00,
          'GST/VAT', v_item.tax_rate_snapshot, v_item_tax, v_line_total + v_item_tax
        );
      END LOOP;

      -- Insert invoice items for add-ons
      FOR v_addon IN
        SELECT sa.*, a.name AS addon_name, a.billing_type AS catalog_billing_type
          FROM public.subscription_addons sa
          JOIN public.addons a ON a.id = sa.addon_id
         WHERE sa.subscription_id = v_sub.id
      LOOP
        IF v_addon.billing_type_snapshot = 'one_time' OR v_addon.catalog_billing_type = 'one_time' THEN
          SELECT EXISTS (
            SELECT 1
              FROM public.invoice_items ii
              JOIN public.invoices inv ON inv.id = ii.invoice_id
             WHERE inv.subscription_id = v_sub.id
               AND ii.description = v_addon.addon_name
               AND inv.id <> v_inv_id
          ) INTO v_already_billed_onetime;

          IF v_already_billed_onetime THEN
            CONTINUE;
          END IF;
        END IF;

        v_line_total := ROUND(v_addon.quantity * v_addon.unit_price, 2);
        v_item_tax := ROUND(v_line_total * 0.1800, 2);

        INSERT INTO public.invoice_items (
          invoice_id, description, quantity, unit_price, discount_amount,
          tax_name, tax_rate, tax_amount, line_total
        ) VALUES (
          v_inv_id, v_addon.addon_name, v_addon.quantity, v_addon.unit_price, 0.00,
          'GST 18%', 0.1800, v_item_tax, v_line_total + v_item_tax
        );
      END LOOP;

      -- Advance subscription billing schedule atomically ONLY after invoice creation succeeds
      UPDATE public.subscriptions
         SET current_period_start = v_period_start,
             current_period_end = v_period_end,
             next_billing_date = v_next_billing,
             updated_at = now()
       WHERE id = v_sub.id;

      -- Log event into append-only audit trail
      INSERT INTO public.subscription_events (
        subscription_id, event_type, previous_status, new_status, metadata, notes
      ) VALUES (
        v_sub.id, 'billing_generated', 'active', 'active',
        jsonb_build_object('invoice_id', v_inv_id, 'invoice_number', v_inv_number, 'amount', v_total_amount),
        'Recurring invoice ' || v_inv_number || ' generated for period ' || v_period_start || ' to ' || v_period_end
      );

      v_success_count := v_success_count + 1;

    EXCEPTION WHEN OTHERS THEN
      v_failure_count := v_failure_count + 1;
      v_errors := v_errors || jsonb_build_object(
        'subscription_id', v_sub.id,
        'subscription_number', v_sub.subscription_number,
        'error', SQLERRM
      );
    END;
  END LOOP;

  -- 3. Finalize billing run record
  UPDATE public.billing_runs
     SET completed_at = now(),
         status = CASE
           WHEN v_failure_count = 0 THEN 'completed'
           WHEN v_success_count > 0 THEN 'partial'
           ELSE 'failed'
         END,
         eligible_count = v_eligible_count,
         success_count = v_success_count,
         failure_count = v_failure_count,
         error_details = v_errors
   WHERE id = v_run_id;

  RETURN jsonb_build_object(
    'run_id', v_run_id,
    'run_number', v_run_number,
    'eligible_count', v_eligible_count,
    'success_count', v_success_count,
    'failure_count', v_failure_count,
    'errors', v_errors
  );
END;
$$;

-- ────────────────────────────────────────────────────────────
-- FUNCTION EXECUTION PRIVILEGES & SECURITY HARDENING
-- ────────────────────────────────────────────────────────────

-- 1. Document Number Generators: Allow authenticated staff and service role; revoke from public/anon
REVOKE EXECUTE ON FUNCTION public.generate_subscription_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_subscription_number() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_sales_order_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_sales_order_number() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_quotation_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_quotation_number() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_payment_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_payment_number() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.generate_billing_run_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_billing_run_number() TO authenticated, service_role;

-- 2. Billing Engine RPC: Restrict exclusively to privileged server-side execution
-- Architecture Documentation:
-- - Invoking Role: `service_role` (PostgreSQL service_role).
-- - Authentication: Invoked exclusively from trusted Next.js server actions / cron tasks via
--   `createAdminClient()` (defined in `src/lib/supabase/admin.ts`), which authenticates
--   using `SUPABASE_SERVICE_ROLE_KEY`.
-- - PostgREST RPC Protection: Ordinary authenticated customers and unauthenticated anon clients
--   are strictly blocked from invoking `/rest/v1/rpc/process_due_subscriptions`.
REVOKE EXECUTE ON FUNCTION public.process_due_subscriptions(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_due_subscriptions(TEXT) TO service_role;

