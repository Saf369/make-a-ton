-- ============================================================
-- BRIGHTLOOP HUB — CONSOLIDATED DEPLOYMENT SCRIPT
-- Generated: 2026-10-31T11:14:12.080Z
-- Contains: Migrations 001 to 010 + Seed Data
-- ============================================================


-- ============================================================
-- MIGRATION: 001_shared_profiles_and_customers.sql
-- ============================================================

-- ============================================================
-- BRIGHTLOOP HUB — Migration 001: Shared Profiles & Customers
-- Dependency Order: 1 / 10
-- Responsible: Safwan Muhammed (Platform & Auth)
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (mirrors auth.users with extended application attributes)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  organization TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  department TEXT,
  title TEXT,
  location TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Customers table
-- Rule: customers.user_id references auth.users.id (as mandated by team contract)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  phone TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  tax_id TEXT, -- GSTIN / VAT ID
  currency TEXT NOT NULL DEFAULT 'INR',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Utility trigger function for timestamp management
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ============================================================
-- MIGRATION: 002_product_catalogue.sql
-- ============================================================

-- ============================================================
-- BRIGHTLOOP HUB — Migration 002: Product Catalogue Management
-- Dependency Order: 2 / 10
-- Responsible: Afsal (Product Catalogue & Subscriptions)
-- ============================================================

-- Product Categories
CREATE TABLE IF NOT EXISTS public.product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES public.product_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.product_categories(id) ON DELETE RESTRICT,
  billing_model TEXT NOT NULL CHECK (billing_model IN ('recurring', 'usage_based', 'annual_license', 'one_time')),
  sales_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (sales_price >= 0),
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (cost_price >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_product_id_sku UNIQUE (id, sku)
);

-- Product Variants
-- Composite key UNIQUE (id, product_id) enforces variant-product integrity at database layer
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual')),
  billing_interval_count INTEGER NOT NULL DEFAULT 1 CHECK (billing_interval_count >= 1),
  price_adjustment NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  final_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (final_price >= 0),
  min_quantity INTEGER NOT NULL DEFAULT 1 CHECK (min_quantity >= 1),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_variant_id_product_id UNIQUE (id, product_id)
);

-- Addons (Standardized canonical table name matching PRODUCT_SUBSCRIPTION_SCHEMA.md)
CREATE TABLE IF NOT EXISTS public.addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  cost_price NUMERIC(12, 2) DEFAULT 0.00 CHECK (cost_price >= 0),
  billing_type TEXT NOT NULL CHECK (billing_type IN ('recurring', 'one_time', 'usage_metered')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_categories_updated_at ON public.product_categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON public.product_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_variants_updated_at ON public.product_variants;
CREATE TRIGGER trg_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_addons_updated_at ON public.addons;
CREATE TRIGGER trg_addons_updated_at
  BEFORE UPDATE ON public.addons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ============================================================
-- MIGRATION: 003_subscription_plans.sql
-- ============================================================

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



-- ============================================================
-- MIGRATION: 004_tax_rules_and_sales_orders.sql
-- ============================================================

-- ============================================================
-- BRIGHTLOOP HUB — Migration 004: Tax Rules & Sales Orders
-- Dependency Order: 4 / 10
-- Responsible: Rufaid (Sales & Finance)
-- ============================================================

-- Tax Rules (Canonical table for GST, VAT, and Sales Tax)
CREATE TABLE IF NOT EXISTS public.tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  rate NUMERIC(6, 4) NOT NULL CHECK (rate >= 0), -- e.g., 0.1800 for 18% GST
  type TEXT NOT NULL DEFAULT 'percentage' CHECK (type IN ('percentage', 'fixed')),
  description TEXT,
  effective_start DATE,
  effective_end DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_tax_dates CHECK (effective_end IS NULL OR effective_start IS NULL OR effective_end >= effective_start)
);

-- Quotation Templates
CREATE TABLE IF NOT EXISTS public.quotation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  default_terms TEXT,
  valid_days INTEGER NOT NULL DEFAULT 30 CHECK (valid_days >= 1),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotation Template Items (Reusable line items with default pricing)
CREATE TABLE IF NOT EXISTS public.quotation_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.quotation_templates(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID,
  addon_id UUID REFERENCES public.addons(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  template_id UUID REFERENCES public.quotation_templates(id) ON DELETE SET NULL,
  quotation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'cancelled')),
  terms_and_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotation Items
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID,
  addon_id UUID REFERENCES public.addons(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  tax_rule_id UUID REFERENCES public.tax_rules(id) ON DELETE SET NULL,
  tax_rate NUMERIC(6, 4) DEFAULT 0.0000,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales Orders (Distinct business entity from subscriptions)
CREATE TABLE IF NOT EXISTS public.sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  source_quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'processing', 'completed', 'cancelled')),
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales Order Items
CREATE TABLE IF NOT EXISTS public.sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES public.sales_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id UUID,
  addon_id UUID REFERENCES public.addons(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  tax_rate NUMERIC(6, 4) DEFAULT 0.0000,
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_tax_rules_updated_at ON public.tax_rules;
CREATE TRIGGER trg_tax_rules_updated_at
  BEFORE UPDATE ON public.tax_rules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_quotations_updated_at ON public.quotations;
CREATE TRIGGER trg_quotations_updated_at
  BEFORE UPDATE ON public.quotations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_template_items_updated_at ON public.quotation_template_items;
CREATE TRIGGER trg_template_items_updated_at
  BEFORE UPDATE ON public.quotation_template_items
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_sales_orders_updated_at ON public.sales_orders;
CREATE TRIGGER trg_sales_orders_updated_at
  BEFORE UPDATE ON public.sales_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ============================================================
-- MIGRATION: 005_subscriptions_and_lifecycle.sql
-- ============================================================

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



-- ============================================================
-- MIGRATION: 006_invoices.sql
-- ============================================================

-- ============================================================
-- BRIGHTLOOP HUB — Migration 006: Invoices & Invoice Items
-- Dependency Order: 6 / 10
-- Responsible: Rufaid (Sales & Finance)
-- ============================================================

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  sales_order_id UUID REFERENCES public.sales_orders(id) ON DELETE SET NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  currency TEXT NOT NULL DEFAULT 'INR',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
  balance_due NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance_due >= 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'confirmed', 'partially_paid', 'paid', 'overdue', 'cancelled')),
  idempotency_key TEXT UNIQUE, -- Guarantees atomic duplicate invoice protection per subscription & billing cycle
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invoice Items Table (Immutable historical financial snapshots)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_name TEXT,
  tax_rate NUMERIC(6, 4) DEFAULT 0.0000,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();



-- ============================================================
-- MIGRATION: 007_payments.sql
-- ============================================================

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



-- ============================================================
-- MIGRATION: 008_discounts.sql
-- ============================================================

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



-- ============================================================
-- MIGRATION: 009_billing_engine.sql
-- ============================================================

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




-- ============================================================
-- MIGRATION: 010_indexes_and_rls.sql
-- ============================================================

-- ============================================================
-- BRIGHTLOOP HUB — Migration 010: Indexes & Row Level Security (RLS)
-- Dependency Order: 10 / 10
-- Responsible: Safwan (Auth & RLS) & All Team
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PERFORMANCE INDEXES
-- ────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_plan_items_plan ON public.plan_items(plan_id);

CREATE INDEX IF NOT EXISTS idx_subs_customer ON public.subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_due_billing ON public.subscriptions(status, next_billing_date) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_sub_items_sub ON public.subscription_items(subscription_id);
CREATE INDEX IF NOT EXISTS idx_sub_events_sub ON public.subscription_events(subscription_id, event_date DESC);

CREATE INDEX IF NOT EXISTS idx_invoices_customer_status ON public.invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_sub ON public.invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due ON public.invoices(due_date) WHERE status IN ('confirmed', 'partially_paid');
CREATE INDEX IF NOT EXISTS idx_invoice_items_inv ON public.invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_alloc_invoice ON public.payment_allocations(invoice_id);
CREATE INDEX IF NOT EXISTS idx_discounts_code ON public.discounts(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_template_items_template ON public.quotation_template_items(template_id);

-- ────────────────────────────────────────────────────────────
-- 2. SECURITY HELPER FUNCTIONS (WITH SEARCH_PATH SECURITY)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    (auth.role() = 'service_role'),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'staff') FROM public.profiles WHERE id = auth.uid()),
    (auth.role() = 'service_role'),
    FALSE
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_customer_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT id FROM public.customers WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Restrict function execution to authenticated callers
REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_staff() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_current_customer_id() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_current_customer_id() TO authenticated, service_role;

-- ────────────────────────────────────────────────────────────
-- 3. ENABLE RLS ON ALL APPLICATION TABLES
-- ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_runs ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- 4. PROFILE SECURITY & PRIVILEGE ESCALATION PREVENTION
-- ────────────────────────────────────────────────────────────

-- Trigger: Protect profile roles, account activation, and prevent deactivated user self-modification
CREATE OR REPLACE FUNCTION public.protect_profile_role_update()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Prevent deactivated accounts from performing any updates unless caller is an admin
  IF OLD.is_active IS FALSE AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Security Violation: Deactivated user accounts cannot modify profile information';
  END IF;

  -- Prohibit non-admin users from changing their own or other users' roles
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Security Violation: Only system administrators can modify user roles';
    END IF;
  END IF;

  -- Prohibit non-admin users from modifying account activation status (prevents self-reactivation)
  IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
    IF NOT public.is_admin() THEN
      RAISE EXCEPTION 'Security Violation: Only system administrators can modify account activation status';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role_update();

-- Profiles Select & Update Policies
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- Customers: Staff have operational access; Customers can ONLY select their own record
DROP POLICY IF EXISTS "customers_staff_policy" ON public.customers;
CREATE POLICY "customers_staff_policy" ON public.customers
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "customers_customer_select" ON public.customers;
CREATE POLICY "customers_customer_select" ON public.customers
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Product Catalogue: Read access for all authenticated users; write access for staff & admin
DROP POLICY IF EXISTS "categories_read" ON public.product_categories;
CREATE POLICY "categories_read" ON public.product_categories FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "categories_write" ON public.product_categories;
CREATE POLICY "categories_write" ON public.product_categories FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "products_read" ON public.products;
CREATE POLICY "products_read" ON public.products FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "products_write" ON public.products;
CREATE POLICY "products_write" ON public.products FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "variants_read" ON public.product_variants;
CREATE POLICY "variants_read" ON public.product_variants FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "variants_write" ON public.product_variants;
CREATE POLICY "variants_write" ON public.product_variants FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "addons_read" ON public.addons;
CREATE POLICY "addons_read" ON public.addons FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "addons_write" ON public.addons;
CREATE POLICY "addons_write" ON public.addons FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "plans_read" ON public.subscription_plans;
CREATE POLICY "plans_read" ON public.subscription_plans FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "plans_write" ON public.subscription_plans;
CREATE POLICY "plans_write" ON public.subscription_plans FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "plan_items_read" ON public.plan_items;
CREATE POLICY "plan_items_read" ON public.plan_items FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "plan_items_write" ON public.plan_items;
CREATE POLICY "plan_items_write" ON public.plan_items FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "plan_features_read" ON public.plan_features;
CREATE POLICY "plan_features_read" ON public.plan_features FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "plan_features_write" ON public.plan_features;
CREATE POLICY "plan_features_write" ON public.plan_features FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "tax_rules_read" ON public.tax_rules;
CREATE POLICY "tax_rules_read" ON public.tax_rules FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "tax_rules_write" ON public.tax_rules;
CREATE POLICY "tax_rules_write" ON public.tax_rules FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Quotation Templates & Template Items
DROP POLICY IF EXISTS "q_templates_read" ON public.quotation_templates;
CREATE POLICY "q_templates_read" ON public.quotation_templates FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "q_templates_write" ON public.quotation_templates;
CREATE POLICY "q_templates_write" ON public.quotation_templates FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "q_template_items_read" ON public.quotation_template_items;
CREATE POLICY "q_template_items_read" ON public.quotation_template_items FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "q_template_items_write" ON public.quotation_template_items;
CREATE POLICY "q_template_items_write" ON public.quotation_template_items FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Subscriptions: Staff full access; Customer data isolation enforced
DROP POLICY IF EXISTS "subs_staff_policy" ON public.subscriptions;
CREATE POLICY "subs_staff_policy" ON public.subscriptions
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "subs_customer_policy" ON public.subscriptions;
CREATE POLICY "subs_customer_policy" ON public.subscriptions
  FOR SELECT TO authenticated
  USING (customer_id = public.get_current_customer_id());

DROP POLICY IF EXISTS "sub_items_staff_policy" ON public.subscription_items;
CREATE POLICY "sub_items_staff_policy" ON public.subscription_items
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "sub_items_customer_policy" ON public.subscription_items;
CREATE POLICY "sub_items_customer_policy" ON public.subscription_items
  FOR SELECT TO authenticated
  USING (subscription_id IN (SELECT id FROM public.subscriptions WHERE customer_id = public.get_current_customer_id()));

DROP POLICY IF EXISTS "sub_addons_staff_policy" ON public.subscription_addons;
CREATE POLICY "sub_addons_staff_policy" ON public.subscription_addons
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "sub_addons_customer_policy" ON public.subscription_addons;
CREATE POLICY "sub_addons_customer_policy" ON public.subscription_addons
  FOR SELECT TO authenticated
  USING (subscription_id IN (SELECT id FROM public.subscriptions WHERE customer_id = public.get_current_customer_id()));

-- Subscription Events (STRICTLY APPEND-ONLY AUDIT TRAIL — NO UPDATE OR DELETE PERMITTED)
DROP POLICY IF EXISTS "sub_events_staff_policy" ON public.subscription_events;
DROP POLICY IF EXISTS "sub_events_select" ON public.subscription_events;
DROP POLICY IF EXISTS "sub_events_insert" ON public.subscription_events;

CREATE POLICY "sub_events_select" ON public.subscription_events
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "sub_events_insert" ON public.subscription_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

-- Explicitly revoke UPDATE and DELETE on audit trail to enforce append-only invariant
REVOKE UPDATE, DELETE ON public.subscription_events FROM authenticated, anon;

-- Invoices: Staff full access; Customer data isolation enforced
DROP POLICY IF EXISTS "invoices_staff_policy" ON public.invoices;
CREATE POLICY "invoices_staff_policy" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "invoices_customer_policy" ON public.invoices;
CREATE POLICY "invoices_customer_policy" ON public.invoices
  FOR SELECT TO authenticated
  USING (customer_id = public.get_current_customer_id());

DROP POLICY IF EXISTS "invoice_items_staff_policy" ON public.invoice_items;
CREATE POLICY "invoice_items_staff_policy" ON public.invoice_items
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "invoice_items_customer_policy" ON public.invoice_items;
CREATE POLICY "invoice_items_customer_policy" ON public.invoice_items
  FOR SELECT TO authenticated
  USING (invoice_id IN (SELECT id FROM public.invoices WHERE customer_id = public.get_current_customer_id()));

-- Payments: Staff full access; Customer view-only of own records
DROP POLICY IF EXISTS "payments_staff_policy" ON public.payments;
CREATE POLICY "payments_staff_policy" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "payments_customer_policy" ON public.payments;
CREATE POLICY "payments_customer_policy" ON public.payments
  FOR SELECT TO authenticated
  USING (customer_id = public.get_current_customer_id());

DROP POLICY IF EXISTS "payment_alloc_staff_policy" ON public.payment_allocations;
CREATE POLICY "payment_alloc_staff_policy" ON public.payment_allocations
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Quotations & Sales Orders
DROP POLICY IF EXISTS "quotes_staff_policy" ON public.quotations;
CREATE POLICY "quotes_staff_policy" ON public.quotations
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "quotes_customer_policy" ON public.quotations;
CREATE POLICY "quotes_customer_policy" ON public.quotations
  FOR SELECT TO authenticated
  USING (customer_id = public.get_current_customer_id());

DROP POLICY IF EXISTS "quotes_items_staff_policy" ON public.quotation_items;
CREATE POLICY "quotes_items_staff_policy" ON public.quotation_items
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "so_staff_policy" ON public.sales_orders;
CREATE POLICY "so_staff_policy" ON public.sales_orders
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "so_customer_policy" ON public.sales_orders;
CREATE POLICY "so_customer_policy" ON public.sales_orders
  FOR SELECT TO authenticated
  USING (customer_id = public.get_current_customer_id());

DROP POLICY IF EXISTS "so_items_staff_policy" ON public.sales_order_items;
CREATE POLICY "so_items_staff_policy" ON public.sales_order_items
  FOR ALL TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- Discounts & Redemptions
DROP POLICY IF EXISTS "discounts_read" ON public.discounts;
CREATE POLICY "discounts_read" ON public.discounts FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "discounts_write" ON public.discounts;
CREATE POLICY "discounts_write" ON public.discounts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "discount_redemptions_staff" ON public.discount_redemptions;
CREATE POLICY "discount_redemptions_staff" ON public.discount_redemptions FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());

-- Billing Runs: Operational logging (Append & Select only; NO DELETE)
DROP POLICY IF EXISTS "billing_runs_staff_policy" ON public.billing_runs;
DROP POLICY IF EXISTS "billing_runs_select" ON public.billing_runs;
DROP POLICY IF EXISTS "billing_runs_insert" ON public.billing_runs;
DROP POLICY IF EXISTS "billing_runs_update" ON public.billing_runs;

CREATE POLICY "billing_runs_select" ON public.billing_runs
  FOR SELECT TO authenticated
  USING (public.is_staff());

CREATE POLICY "billing_runs_insert" ON public.billing_runs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff());

CREATE POLICY "billing_runs_update" ON public.billing_runs
  FOR UPDATE TO authenticated
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

REVOKE DELETE ON public.billing_runs FROM authenticated, anon;

-- Trigger: Protect billing_runs audit integrity
-- Ensures audit metadata (id, run_number, started_at, trigger_source, created_at) is strictly immutable
-- Restricts updates to intended status and completion fields (completed_at, status, counts, error_details)
CREATE OR REPLACE FUNCTION public.protect_billing_run_immutability()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'Audit Violation: billing_runs.id is immutable';
  END IF;

  IF NEW.run_number IS DISTINCT FROM OLD.run_number THEN
    RAISE EXCEPTION 'Audit Violation: billing_runs.run_number is immutable';
  END IF;

  IF NEW.started_at IS DISTINCT FROM OLD.started_at THEN
    RAISE EXCEPTION 'Audit Violation: billing_runs.started_at execution timestamp is immutable';
  END IF;

  IF NEW.trigger_source IS DISTINCT FROM OLD.trigger_source THEN
    RAISE EXCEPTION 'Audit Violation: billing_runs.trigger_source is immutable';
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Audit Violation: billing_runs.created_at timestamp is immutable';
  END IF;

  -- Prevent reverting a finalized billing run back to 'running'
  IF OLD.status IN ('completed', 'failed') AND NEW.status = 'running' THEN
    RAISE EXCEPTION 'Audit Violation: Finalized billing runs cannot be reopened';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_billing_run ON public.billing_runs;
CREATE TRIGGER trg_protect_billing_run
  BEFORE UPDATE ON public.billing_runs
  FOR EACH ROW EXECUTE FUNCTION public.protect_billing_run_immutability();



-- ============================================================
-- INITIAL SEED DATA (DEVELOPMENT / CATALOGUE)
-- ============================================================

-- ============================================================
-- BRIGHTLOOP HUB — Development & Testing Seed Data
-- Target Location: supabase/seed.sql
-- Note: Optional development seed. DO NOT RUN IN PRODUCTION.
-- ============================================================

-- 1. Customers (Safely links to auth.users if account exists, otherwise NULL)
INSERT INTO public.customers (id, user_id, name, email, company_name, phone, billing_address, tax_id, currency)
VALUES
  (
    'f1000000-0000-0000-0000-000000000001',
    (SELECT id FROM auth.users WHERE email = 'rvance@acmetech.com' LIMIT 1),
    'Robert Vance',
    'rvance@acmetech.com',
    'Acme Technologies Inc.',
    '+1 (555) 019-2834',
    '100 Tech Blvd, Suite 400, San Francisco, CA 94107',
    'US-EIN-94-1234567',
    'INR'
  ),
  (
    'f1000000-0000-0000-0000-000000000002',
    (SELECT id FROM auth.users WHERE email = 'kpatel@nexusdata.ai' LIMIT 1),
    'Kavita Patel',
    'kpatel@nexusdata.ai',
    'Nexus Data Labs',
    '+44 20 7946 0912',
    '25 Silicon Roundabout, Shoreditch, London EC1V 1AB',
    'GB-VAT-123-4567-89',
    'INR'
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Product Categories
INSERT INTO public.product_categories (id, name, slug, description)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Software Platforms', 'software-platforms', 'Core SaaS platforms and cloud software suites'),
  ('a1000000-0000-0000-0000-000000000002', 'Developer Tools & APIs', 'dev-tools-api', 'SDKs, webhooks, and REST/GraphQL gateways'),
  ('a1000000-0000-0000-0000-000000000003', 'Data & Analytics', 'data-analytics', 'Real-time telemetry, reporting, and ETL connectors'),
  ('a1000000-0000-0000-0000-000000000004', 'Services & Add-ons', 'services-addons', 'Dedicated account managers, SLA packages, and consulting')
ON CONFLICT (id) DO NOTHING;

-- 3. Products
INSERT INTO public.products (id, name, sku, category_id, billing_model, sales_price, cost_price, currency, notes)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Brightloop Hub Cloud', 'BL-CLOUD-CORE', 'a1000000-0000-0000-0000-000000000001', 'recurring', 15999.00, 3500.00, 'INR', 'Flagship enterprise subscription management portal'),
  ('b1000000-0000-0000-0000-000000000002', 'Brightloop API Gateway', 'BL-API-GTW', 'a1000000-0000-0000-0000-000000000002', 'usage_based', 3999.00, 900.00, 'INR', 'High throughput API metering and proxy'),
  ('b1000000-0000-0000-0000-000000000003', 'Enterprise Data Lake Sync', 'BL-LAKE-SYNC', 'a1000000-0000-0000-0000-000000000003', 'recurring', 64999.00, 14000.00, 'INR', 'Real-time bidirectional event pipeline'),
  ('b1000000-0000-0000-0000-000000000004', 'Premium Support Concierge', 'BL-SUPP-VIP', 'a1000000-0000-0000-0000-000000000004', 'recurring', 24999.00, 5000.00, 'INR', '24/7 15-minute SLA with dedicated technical account manager')
ON CONFLICT (id) DO NOTHING;

-- 4. Product Variants
INSERT INTO public.product_variants (id, product_id, name, code, billing_interval, billing_interval_count, price_adjustment, final_price, min_quantity)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Starter Edition (up to 5 users)', 'BL-CLOUD-STRT', 'monthly', 1, -4000.00, 11999.00, 1),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Growth Edition (up to 25 users)', 'BL-CLOUD-GRW', 'monthly', 1, 24000.00, 39999.00, 1),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Enterprise Annual Edition', 'BL-CLOUD-ENT-YR', 'annual', 1, 0.00, 399990.00, 1),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Metered Tier (1M calls included)', 'BL-API-1M', 'monthly', 1, 0.00, 3999.00, 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Addons
INSERT INTO public.addons (id, name, code, description, unit_price, cost_price, billing_type)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Dedicated IP Address', 'ADD-IP-DEDICATED', 'Static IP address for enterprise deliverability', 2000.00, 500.00, 'recurring'),
  ('d1000000-0000-0000-0000-000000000002', 'Additional 10 Team Seats', 'ADD-SEATS-10', 'Pack of 10 concurrent team licenses', 6500.00, 1000.00, 'recurring'),
  ('d1000000-0000-0000-0000-000000000003', 'Custom Domain White-labeling', 'ADD-WHITELABEL', 'Custom domain and full branding removal', 12000.00, 2000.00, 'recurring'),
  ('d1000000-0000-0000-0000-000000000004', '1-on-1 Onboarding Concierge', 'ADD-ONBOARDING', 'Dedicated technical implementation specialist', 68000.00, 15000.00, 'one_time')
ON CONFLICT (id) DO NOTHING;

-- 6. Subscription Plans
INSERT INTO public.subscription_plans (id, name, code, description, billing_interval, billing_interval_count, base_price, is_popular, available_from)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Starter Plan', 'PLN-STARTER', 'Core subscription engine for small teams', 'monthly', 1, 11999.00, FALSE, '2026-01-01'),
  ('e1000000-0000-0000-0000-000000000002', 'Growth Pro', 'PLN-GROWTH', 'Advanced billing and revenue operations for growing teams', 'monthly', 1, 39999.00, TRUE, '2026-01-01'),
  ('e1000000-0000-0000-0000-000000000003', 'Enterprise Cloud', 'PLN-ENTERPRISE', 'Unlimited scale with dedicated infrastructure and SLA', 'annual', 1, 399990.00, FALSE, '2026-01-01')
ON CONFLICT (id) DO NOTHING;

-- 7. Plan Features
INSERT INTO public.plan_features (plan_id, feature, sort_order)
VALUES
  ('e1000000-0000-0000-0000-000000000001', 'Core Subscription Management', 1),
  ('e1000000-0000-0000-0000-000000000001', 'Automated Invoicing & GST', 2),
  ('e1000000-0000-0000-0000-000000000001', 'Email Support', 3),
  ('e1000000-0000-0000-0000-000000000002', 'Everything in Starter', 1),
  ('e1000000-0000-0000-0000-000000000002', 'Multi-currency & UPI Invoicing', 2),
  ('e1000000-0000-0000-0000-000000000002', 'Quotation to Order Conversion', 3),
  ('e1000000-0000-0000-0000-000000000002', 'Priority 24/7 SLA Support', 4),
  ('e1000000-0000-0000-0000-000000000003', 'Everything in Growth Pro', 1),
  ('e1000000-0000-0000-0000-000000000003', 'Dedicated Technical Account Manager', 2),
  ('e1000000-0000-0000-0000-000000000003', 'Custom ERP & SAP Connectors', 3)
ON CONFLICT DO NOTHING;

-- 8. Tax Rules
INSERT INTO public.tax_rules (id, name, code, rate, type, description)
VALUES
  ('0a000000-0000-0000-0000-000000000001', 'Goods and Services Tax (GST 18%)', 'GST-18', 0.1800, 'percentage', 'Standard Indian GST rate for SaaS and digital services'),
  ('0a000000-0000-0000-0000-000000000002', 'Value Added Tax (VAT 5%)', 'VAT-5', 0.0500, 'percentage', 'GCC standard VAT rate'),
  ('0a000000-0000-0000-0000-000000000003', 'Zero Tax Export', 'TAX-ZERO', 0.0000, 'percentage', 'Tax exempt for overseas export clients')
ON CONFLICT (id) DO NOTHING;

-- 9. Discounts
INSERT INTO public.discounts (id, name, code, discount_type, discount_value, min_purchase_amount, is_active)
VALUES
  ('d2000000-0000-0000-0000-000000000001', 'Early Adopter 15%', 'EARLY15', 'percentage', 15.00, 10000.00, TRUE),
  ('d2000000-0000-0000-0000-000000000002', 'Enterprise Flat ₹5,000 Off', 'ENT5000', 'fixed_amount', 5000.00, 30000.00, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 10. Sample Subscriptions
INSERT INTO public.subscriptions (
  id, subscription_number, customer_id, plan_id, status,
  billing_interval, billing_interval_count, agreed_price, currency,
  start_date, current_period_start, current_period_end, next_billing_date
) VALUES (
  '0b000000-0000-0000-0000-000000000001',
  'SUB-2026-00001',
  'f1000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000002',
  'active',
  'monthly', 1, 39999.00, 'INR',
  '2026-10-01', '2026-10-01', '2026-10-31', '2026-11-01'
), (
  '0b000000-0000-0000-0000-000000000002',
  'SUB-2026-00002',
  'f1000000-0000-0000-0000-000000000002',
  'e1000000-0000-0000-0000-000000000001',
  'active',
  'monthly', 1, 11999.00, 'INR',
  '2026-10-15', '2026-10-15', '2026-11-14', '2026-11-15'
) ON CONFLICT (id) DO NOTHING;

-- 11. Subscription Items
INSERT INTO public.subscription_items (
  id, subscription_id, product_id, variant_id, quantity, unit_price,
  billing_type_snapshot, tax_rule_id, tax_rate_snapshot
) VALUES (
  '0c000000-0000-0000-0000-000000000001',
  '0b000000-0000-0000-0000-000000000001',
  'b1000000-0000-0000-0000-000000000001',
  'c1000000-0000-0000-0000-000000000002',
  1, 39999.00, 'recurring',
  '0a000000-0000-0000-0000-000000000001', 0.1800
) ON CONFLICT (id) DO NOTHING;

-- 12. Sample Invoices
INSERT INTO public.invoices (
  id, invoice_number, customer_id, subscription_id, invoice_date, due_date,
  period_start, period_end, currency, subtotal, discount_amount, tax_amount,
  total_amount, amount_paid, balance_due, status, idempotency_key
) VALUES (
  '0d000000-0000-0000-0000-000000000001',
  'INV-2026-00001',
  'f1000000-0000-0000-0000-000000000001',
  '0b000000-0000-0000-0000-000000000001',
  '2026-10-01', '2026-10-15',
  '2026-10-01', '2026-10-31',
  'INR', 39999.00, 0.00, 7199.82,
  47198.82, 47198.82, 0.00, 'paid',
  'seed-sub-1-cycle-1'
) ON CONFLICT (id) DO NOTHING;

-- 13. Sample Invoice Items
INSERT INTO public.invoice_items (
  id, invoice_id, description, quantity, unit_price, discount_amount,
  tax_name, tax_rate, tax_amount, line_total
) VALUES (
  '0e000000-0000-0000-0000-000000000001',
  '0d000000-0000-0000-0000-000000000001',
  'Brightloop Hub Cloud - Growth Edition (up to 25 users)',
  1, 39999.00, 0.00,
  'GST 18%', 0.1800, 7199.82, 47198.82
) ON CONFLICT (id) DO NOTHING;

-- 14. Sample Payment & Allocation
INSERT INTO public.payments (
  id, payment_number, customer_id, payment_date, payment_method,
  amount, currency, transaction_reference, notes, status
) VALUES (
  '0f000000-0000-0000-0000-000000000001',
  'PAY-2026-00001',
  'f1000000-0000-0000-0000-000000000001',
  '2026-10-02', 'upi',
  47198.82, 'INR', 'UPI-REF-99281923', 'Settlement for Invoice INV-2026-00001', 'completed'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.payment_allocations (
  payment_id, invoice_id, allocated_amount
)
SELECT
  '0f000000-0000-0000-0000-000000000001',
  '0d000000-0000-0000-0000-000000000001',
  47198.82
WHERE NOT EXISTS (
  SELECT 1 FROM public.payment_allocations
  WHERE payment_id = '0f000000-0000-0000-0000-000000000001'
    AND invoice_id = '0d000000-0000-0000-0000-000000000001'
);


