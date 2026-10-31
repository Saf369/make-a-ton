-- ============================================================
-- BRIGHTLOOP HUB — Migration 008: Discounts & Redemptions
-- Dependency Order: 8 / 10
-- Responsible: Rufaid & Afsal
-- ============================================================

-- Discounts Table
CREATE TABLE IF NOT EXISTS public.discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('fixed_amount', 'percentage')),
  discount_value NUMERIC(12, 2) NOT NULL,
  min_purchase_amount NUMERIC(12, 2) DEFAULT 0.00,
  min_quantity INTEGER DEFAULT 1,
  start_date DATE,
  end_date DATE,
  usage_limit INTEGER, -- Global cap on total redemptions
  usage_count INTEGER NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  per_customer_limit INTEGER DEFAULT 1,
  applicable_to TEXT NOT NULL DEFAULT 'entire_subscription' CHECK (applicable_to IN ('entire_subscription', 'specific_product', 'specific_plan')),
  applicable_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  applicable_plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_discount_dates CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date),
  CONSTRAINT ck_discount_type_value CHECK (
    (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100.00)
    OR
    (discount_type = 'fixed_amount' AND discount_value > 0)
  )
);

-- Discount Redemptions Table (Audit record of discount applications)
CREATE TABLE IF NOT EXISTS public.discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES public.discounts(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount_discounted NUMERIC(12, 2) NOT NULL CHECK (amount_discounted >= 0),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_discount_invoice UNIQUE (discount_id, invoice_id)
);

-- Concurrency-safe validation & usage counter increment trigger
CREATE OR REPLACE FUNCTION record_discount_redemption()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_discount RECORD;
  v_customer_redemptions INTEGER;
BEGIN
  -- Prevent mutation of immutable redemption audit fields on UPDATE
  IF TG_OP = 'UPDATE' AND (NEW.discount_id IS DISTINCT FROM OLD.discount_id OR NEW.customer_id IS DISTINCT FROM OLD.customer_id OR NEW.invoice_id IS DISTINCT FROM OLD.invoice_id) THEN
    RAISE EXCEPTION 'Discount redemptions are immutable audit records; delete and recreate instead';
  END IF;

  -- Lock the discount row to prevent concurrent race conditions
  SELECT * INTO v_discount
    FROM public.discounts
   WHERE id = NEW.discount_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Discount does not exist';
  END IF;

  IF NOT v_discount.is_active THEN
    RAISE EXCEPTION 'Discount code % is inactive', v_discount.code;
  END IF;

  IF v_discount.start_date IS NOT NULL AND CURRENT_DATE < v_discount.start_date THEN
    RAISE EXCEPTION 'Discount code % is not yet effective', v_discount.code;
  END IF;

  IF v_discount.end_date IS NOT NULL AND CURRENT_DATE > v_discount.end_date THEN
    RAISE EXCEPTION 'Discount code % has expired', v_discount.code;
  END IF;

  -- Enforce global usage cap
  IF v_discount.usage_limit IS NOT NULL AND v_discount.usage_count >= v_discount.usage_limit THEN
    RAISE EXCEPTION 'Discount code % has reached its maximum global usage limit (%)', v_discount.code, v_discount.usage_limit;
  END IF;

  -- Enforce per-customer usage cap
  IF v_discount.per_customer_limit IS NOT NULL THEN
    SELECT COUNT(*) INTO v_customer_redemptions
      FROM public.discount_redemptions
     WHERE discount_id = NEW.discount_id
       AND customer_id = NEW.customer_id;

    IF v_customer_redemptions >= v_discount.per_customer_limit THEN
      RAISE EXCEPTION 'Customer has already reached the maximum redemption limit (%) for discount %',
        v_discount.per_customer_limit, v_discount.code;
    END IF;
  END IF;

  -- Increment usage_count atomically on parent discount
  UPDATE public.discounts
     SET usage_count = usage_count + 1,
         updated_at = now()
   WHERE id = NEW.discount_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_discount_redemption ON public.discount_redemptions;
CREATE TRIGGER trg_record_discount_redemption
  BEFORE INSERT ON public.discount_redemptions
  FOR EACH ROW EXECUTE FUNCTION record_discount_redemption();

-- Concurrency-safe usage counter decrement trigger on explicit deletion (redemption reversal)
-- Note: When an invoice is deleted, invoice_id is set to NULL (ON DELETE SET NULL),
-- leaving the redemption record intact and preserved. If the redemption record itself
-- is explicitly deleted, this trigger ensures usage_count is decremented.
CREATE OR REPLACE FUNCTION handle_discount_redemption_deletion()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Atomically decrement usage_count on parent discount, bounded at 0
  UPDATE public.discounts
     SET usage_count = GREATEST(0, usage_count - 1),
         updated_at = now()
   WHERE id = OLD.discount_id;

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_discount_redemption_delete ON public.discount_redemptions;
CREATE TRIGGER trg_discount_redemption_delete
  AFTER DELETE ON public.discount_redemptions
  FOR EACH ROW EXECUTE FUNCTION handle_discount_redemption_deletion();

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_discounts_updated_at ON public.discounts;
CREATE TRIGGER trg_discounts_updated_at
  BEFORE UPDATE ON public.discounts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
