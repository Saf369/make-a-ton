-- ============================================================
-- BRIGHTLOOP HUB — Migration 003: Subscription Plan Management
-- Dependency Order: 3 / 10
-- Responsible: Afsal (Product Catalogue & Subscriptions)
-- ============================================================

-- Subscription Plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
  billing_interval_count INTEGER NOT NULL DEFAULT 1 CHECK (billing_interval_count >= 1),
  base_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  pricing_model TEXT NOT NULL DEFAULT 'all_inclusive' CHECK (pricing_model IN ('all_inclusive', 'component_based')),
  min_quantity INTEGER NOT NULL DEFAULT 1 CHECK (min_quantity >= 1),
  available_from DATE,
  available_until DATE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  allow_pause BOOLEAN NOT NULL DEFAULT TRUE,
  allow_self_cancellation BOOLEAN NOT NULL DEFAULT TRUE,
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_plan_availability_dates CHECK (available_until IS NULL OR available_from IS NULL OR available_until >= available_from)
);

-- Plan Items (Bundled Products & Variants within a Plan)
-- Composite foreign key guarantees selected variant belongs to selected product
CREATE TABLE IF NOT EXISTS public.plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  variant_id UUID NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_plan_item_variant_belongs_to_product
    FOREIGN KEY (variant_id, product_id)
    REFERENCES public.product_variants(id, product_id)
    ON DELETE RESTRICT,
  CONSTRAINT uq_plan_product_variant UNIQUE (plan_id, product_id, variant_id)
);

-- Plan Features (Marketing & Tier Feature Highlights)
CREATE TABLE IF NOT EXISTS public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
  feature TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER trg_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
