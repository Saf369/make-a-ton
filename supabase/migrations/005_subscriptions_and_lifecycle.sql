-- ============================================================
-- BRIGHTLOOP HUB — Migration 005: Subscriptions & Lifecycle
-- Dependency Order: 5 / 10
-- Responsible: Afsal (Product Catalogue & Subscriptions)
-- ============================================================

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  source_sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'quotation', 'confirmed', 'active', 'paused', 'closed', 'cancelled', 'expired')),
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
  billing_interval_count INTEGER NOT NULL DEFAULT 1 CHECK (billing_interval_count >= 1),
  agreed_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (agreed_price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  start_date DATE NOT NULL,
  end_date DATE,
  current_period_start DATE,
  current_period_end DATE,
  next_billing_date DATE,
  paused_at TIMESTAMPTZ,
  resumed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  terms_and_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_sub_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Subscription Items (Line-level product/variant snapshot)
-- Composite foreign key guarantees selected variant belongs to selected product
CREATE TABLE IF NOT EXISTS public.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  billing_type_snapshot TEXT NOT NULL DEFAULT 'recurring',
  tax_rule_id UUID REFERENCES public.tax_rules(id) ON DELETE SET NULL,
  tax_rate_snapshot NUMERIC(6, 4) DEFAULT 0.0000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_sub_item_variant_belongs_to_product
    FOREIGN KEY (variant_id, product_id)
    REFERENCES public.product_variants(id, product_id)
    ON DELETE RESTRICT,
  CONSTRAINT uq_sub_product_variant UNIQUE (subscription_id, product_id, variant_id)
);

-- Subscription Add-ons (Referencing canonical addons table)
CREATE TABLE IF NOT EXISTS public.subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  addon_id UUID NOT NULL REFERENCES public.addons(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  billing_type_snapshot TEXT NOT NULL DEFAULT 'recurring',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription Events (Append-only immutable audit trail)
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'created', 'quotation_linked', 'confirmed', 'activated',
    'paused', 'resumed', 'renewed', 'closed', 'cancelled',
    'expired', 'billing_generated'
  )),
  previous_status TEXT,
  new_status TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  notes TEXT
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sub_items_updated_at ON public.subscription_items;
CREATE TRIGGER trg_sub_items_updated_at
  BEFORE UPDATE ON public.subscription_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
