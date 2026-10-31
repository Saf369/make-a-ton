-- ============================================================================
-- Migration: 004_billing_finance.sql
-- Domain: SALES MODULE & RECURRING BILLING (Rufaid's Domain)
-- Integration Contracts:
--   - User Module (Safwan): profiles(id), customers(id)
--   - Subscription Module (Afsal): products(id), product_variants(id), plans(id), subscriptions(id)
--   - Master Plan: BRIGHTLOOP_MASTER_IMPLEMENTATION_PLAN.md Section 7.5 & 7.7
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE discount_type AS ENUM ('FIXED', 'PERCENTAGE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_scope AS ENUM ('PRODUCT', 'SUBSCRIPTION');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE discount_redemption_status AS ENUM ('RESERVED', 'CONSUMED', 'RELEASED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quotation_status AS ENUM ('DRAFT', 'SENT', 'CONFIRMED', 'REJECTED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sales_order_status AS ENUM ('DRAFT', 'CONFIRMED', 'INVOICED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('DRAFT', 'CONFIRMED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_kind AS ENUM ('STANDARD', 'RECURRING', 'ONE_TIME');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('UPI', 'BANK_TRANSFER', 'CASH', 'CARD', 'CHEQUE', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_run_status AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL_SUCCESS');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE billing_run_item_status AS ENUM ('SUCCESS', 'ALREADY_PROCESSED', 'SKIPPED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- ----------------------------------------------------------------------------
-- 2. SALES MODULE CONFIGURATION TABLES (Tax, Discounts, Payment Terms)
-- ----------------------------------------------------------------------------

-- Tax Rules / Templates
CREATE TABLE IF NOT EXISTS tax_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rate NUMERIC(6, 4) NOT NULL CHECK (rate >= 0 AND rate <= 1),
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Discounts / Pricing Rules
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type discount_type NOT NULL,
  value NUMERIC(12, 2) NOT NULL CHECK (value >= 0),
  scope discount_scope NOT NULL DEFAULT 'PRODUCT',
  min_quantity INTEGER CHECK (min_quantity IS NULL OR min_quantity > 0),
  min_amount NUMERIC(12, 2) CHECK (min_amount IS NULL OR min_amount >= 0),
  start_date DATE NOT NULL,
  end_date DATE,
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  current_usage INTEGER NOT NULL DEFAULT 0 CHECK (current_usage >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Join table for Product-specific discounts (depends on discounts and products)
CREATE TABLE IF NOT EXISTS discount_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(discount_id, product_id)
);

-- Payment Terms Templates
CREATE TABLE IF NOT EXISTS payment_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  days_due INTEGER NOT NULL DEFAULT 0 CHECK (days_due >= 0),
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 3. QUOTATION TEMPLATES & QUOTATIONS
-- ----------------------------------------------------------------------------

-- Quotation Templates
CREATE TABLE IF NOT EXISTS quotation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  validity_days INTEGER NOT NULL DEFAULT 30 CHECK (validity_days > 0),
  payment_terms_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotation Template Items
CREATE TABLE IF NOT EXISTS quotation_template_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES quotation_templates(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotations
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  template_id UUID REFERENCES quotation_templates(id) ON DELETE SET NULL,
  payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
  status quotation_status NOT NULL DEFAULT 'DRAFT',
  valid_until DATE NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotation Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  tax_rule_id UUID REFERENCES tax_rules(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  line_subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  line_total NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 4. SALES ORDERS & SALES ORDER ITEMS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) NOT NULL UNIQUE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE SET NULL,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
  status sales_order_status NOT NULL DEFAULT 'CONFIRMED',
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sales Order Line Items (Required to preserve configuration when converting to Subscriptions & Invoices)
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  tax_rule_id UUID REFERENCES tax_rules(id) ON DELETE SET NULL,
  discount_id UUID REFERENCES discounts(id) ON DELETE SET NULL,
  product_name_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT,
  sku_snapshot TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  line_subtotal NUMERIC(12, 2) NOT NULL CHECK (line_subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 5. INVOICES & INVOICE ITEMS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE RESTRICT,
  sales_order_id UUID REFERENCES sales_orders(id) ON DELETE SET NULL,
  payment_term_id UUID REFERENCES payment_terms(id) ON DELETE SET NULL,
  replaces_invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  invoice_kind invoice_kind NOT NULL DEFAULT 'STANDARD',
  status invoice_status NOT NULL DEFAULT 'DRAFT',
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  currency VARCHAR(3) NOT NULL DEFAULT 'INR',
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
  paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  notes TEXT,
  cancellation_reason TEXT,
  -- Immutability Snapshots of Customer Data at generation time
  customer_name_snapshot TEXT NOT NULL,
  customer_email_snapshot TEXT NOT NULL,
  customer_address_snapshot TEXT,
  customer_tax_id_snapshot TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Mathematical Consistency Constraints
  CONSTRAINT chk_invoice_balance_math CHECK (balance = total_amount - paid_amount),
  CONSTRAINT chk_invoice_paid_not_exceed_total CHECK (paid_amount <= total_amount),
  CONSTRAINT chk_cancelled_invoice_no_payments CHECK (status != 'CANCELLED' OR paid_amount = 0),
  -- Recurring Invoice Idempotency Precondition
  CONSTRAINT chk_recurring_invoice_fields CHECK (
    invoice_kind != 'RECURRING' OR (
      subscription_id IS NOT NULL AND
      billing_period_start IS NOT NULL AND
      billing_period_end IS NOT NULL
    )
  )
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  tax_rule_id UUID REFERENCES tax_rules(id) ON DELETE SET NULL,
  discount_id UUID REFERENCES discounts(id) ON DELETE SET NULL,
  -- Immutability Snapshots
  product_name_snapshot TEXT NOT NULL,
  variant_name_snapshot TEXT,
  sku_snapshot TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  line_subtotal NUMERIC(12, 2) NOT NULL CHECK (line_subtotal >= 0),
  discount_description TEXT,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
  taxable_amount NUMERIC(12, 2) NOT NULL CHECK (taxable_amount >= 0),
  tax_name_snapshot TEXT,
  tax_rate_snapshot NUMERIC(6, 4) NOT NULL DEFAULT 0.0000 CHECK (tax_rate_snapshot >= 0),
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
  line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 6. DISCOUNT REDEMPTIONS (References both discounts and generated invoices/quotes)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS discount_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_id UUID NOT NULL REFERENCES discounts(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  status discount_redemption_status NOT NULL DEFAULT 'RESERVED',
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_redemption_target CHECK (invoice_id IS NOT NULL OR quotation_id IS NOT NULL)
);


-- ----------------------------------------------------------------------------
-- 7. PAYMENTS & RECONCILIATION
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  payment_method payment_method NOT NULL,
  payment_type VARCHAR(20) NOT NULL DEFAULT 'PAYMENT' CHECK (payment_type IN ('PAYMENT', 'REFUND', 'REVERSAL')),
  reversed_payment_id UUID REFERENCES payments(id) ON DELETE RESTRICT,
  status payment_status NOT NULL DEFAULT 'PENDING',
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  transaction_reference VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 8. BILLING RUNS & LOG ITEMS (Recurring Engine History)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS billing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_number VARCHAR(50) NOT NULL UNIQUE,
  initiated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status billing_run_status NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  target_date DATE NOT NULL,
  total_candidates INTEGER NOT NULL DEFAULT 0 CHECK (total_candidates >= 0),
  successful_count INTEGER NOT NULL DEFAULT 0 CHECK (successful_count >= 0),
  skipped_count INTEGER NOT NULL DEFAULT 0 CHECK (skipped_count >= 0),
  failed_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  total_amount_billed NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount_billed >= 0),
  error_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_run_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_run_id UUID NOT NULL REFERENCES billing_runs(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
  -- Snapshot subscription number for permanent historical traceability
  subscription_number_snapshot VARCHAR(50) NOT NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  status billing_run_item_status NOT NULL,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
  error_message TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ----------------------------------------------------------------------------
-- 9. INDEXES & RECURRING IDEMPOTENCY UNIQUE INDEX
-- ----------------------------------------------------------------------------

-- Recurring Invoice Idempotency Partial Unique Index
-- Protects the billing period unconditionally so automated runs can never double-bill a period.
-- If a replacement invoice is explicitly authorized, it links through replaces_invoice_id.
CREATE UNIQUE INDEX IF NOT EXISTS uq_recurring_subscription_period
  ON invoices (subscription_id, billing_period_start, billing_period_end)
  WHERE invoice_kind = 'RECURRING';

-- Indexes for Fast Lookups and High-Performance Join Operations
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_replaces_invoice ON invoices(replaces_invoice_id);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_quotations_customer_id ON quotations(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);

CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_id ON sales_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_orders_quotation_id ON sales_orders(quotation_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_order_id ON sales_order_items(sales_order_id);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_reversed_payment ON payments(reversed_payment_id);

CREATE INDEX IF NOT EXISTS idx_billing_run_items_run_id ON billing_run_items(billing_run_id);
CREATE INDEX IF NOT EXISTS idx_billing_run_items_sub_id ON billing_run_items(subscription_id);

CREATE INDEX IF NOT EXISTS idx_discount_redemptions_discount ON discount_redemptions(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_redemptions_customer ON discount_redemptions(customer_id);


-- ----------------------------------------------------------------------------
-- 10. RECONCILIATION FUNCTION & TRIGGER (Guarantees Invoice Balance Consistency)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION reconcile_invoice_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_invoice_id UUID;
  v_total_amount NUMERIC(12, 2);
  v_total_paid NUMERIC(12, 2);
  v_new_balance NUMERIC(12, 2);
  v_current_status invoice_status;
  v_new_status invoice_status;
BEGIN
  -- Determine affected invoice ID
  IF TG_OP = 'DELETE' THEN
    v_invoice_id := OLD.invoice_id;
  ELSE
    v_invoice_id := NEW.invoice_id;
  END IF;

  -- Lock and query parent invoice to serialize concurrent payments
  SELECT total_amount, status
    INTO v_total_amount, v_current_status
    FROM invoices
   WHERE id = v_invoice_id
     FOR UPDATE;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Compute sum of all successful payments minus reversals/refunds
  SELECT COALESCE(SUM(
    CASE 
      WHEN payment_type = 'PAYMENT' THEN amount 
      ELSE -amount 
    END
  ), 0.00)
    INTO v_total_paid
    FROM payments
   WHERE invoice_id = v_invoice_id
     AND status = 'SUCCESS';

  IF v_total_paid < 0.00 THEN
    v_total_paid := 0.00;
  END IF;

  -- Prevent overpayment
  IF v_total_paid > v_total_amount THEN
    RAISE EXCEPTION 'Total settled payments (₹%) cannot exceed invoice total amount (₹%)',
      v_total_paid, v_total_amount;
  END IF;

  v_new_balance := v_total_amount - v_total_paid;

  -- Maintain status transition based on payment reconciliation
  IF v_current_status != 'CANCELLED' THEN
    IF v_total_paid >= v_total_amount AND v_total_amount > 0 THEN
      v_new_status := 'PAID';
    ELSIF v_total_paid > 0 THEN
      v_new_status := 'PARTIALLY_PAID';
    ELSIF v_current_status = 'PAID' OR v_current_status = 'PARTIALLY_PAID' THEN
      v_new_status := 'CONFIRMED';
    ELSE
      v_new_status := v_current_status;
    END IF;
  ELSE
    v_new_status := 'CANCELLED';
  END IF;

  -- Update invoice balance and status
  UPDATE invoices
     SET paid_amount = v_total_paid,
         balance = v_new_balance,
         status = v_new_status,
         updated_at = now()
   WHERE id = v_invoice_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reconcile_invoice_on_payment ON payments;
CREATE TRIGGER trg_reconcile_invoice_on_payment
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION reconcile_invoice_on_payment();


-- ----------------------------------------------------------------------------
-- 11. ROW-LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

ALTER TABLE tax_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_run_items ENABLE ROW LEVEL SECURITY;

-- Helper function to check role from JWT or profiles
CREATE OR REPLACE FUNCTION auth_user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'app_metadata' ->> 'role'),
    (SELECT role::text FROM profiles WHERE id = auth.uid())
  );
$$ LANGUAGE sql STABLE;

-- Staff and Admin Full Access Policies
DO $$
DECLARE
  t TEXT;
  sales_tables TEXT[] := ARRAY[
    'tax_rules', 'discounts', 'discount_products', 'discount_redemptions',
    'payment_terms', 'quotation_templates', 'quotation_template_items',
    'quotations', 'quotation_items', 'sales_orders', 'sales_order_items', 'invoices',
    'invoice_items', 'payments', 'billing_runs', 'billing_run_items'
  ];
BEGIN
  FOREACH t IN ARRAY sales_tables LOOP
    EXECUTE format('
      DROP POLICY IF EXISTS p_%I_admin_staff_all ON %I;
      CREATE POLICY p_%I_admin_staff_all ON %I
        FOR ALL
        USING (auth_user_role() IN (''ADMIN'', ''STAFF''))
        WITH CHECK (auth_user_role() IN (''ADMIN'', ''STAFF''));
    ', t, t, t, t);
  END LOOP;
END $$;

-- Public / Customer Read Policies on Active Catalog Configuration
DROP POLICY IF EXISTS p_tax_rules_customer_select ON tax_rules;
CREATE POLICY p_tax_rules_customer_select ON tax_rules
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS p_discounts_customer_select ON discounts;
CREATE POLICY p_discounts_customer_select ON discounts
  FOR SELECT USING (is_active = true);

-- Customer Scoped Policies for Invoices, Payments, Quotations
DROP POLICY IF EXISTS p_invoices_customer_select ON invoices;
CREATE POLICY p_invoices_customer_select ON invoices
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS p_invoice_items_customer_select ON invoice_items;
CREATE POLICY p_invoice_items_customer_select ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE customer_id IN (
        SELECT id FROM customers WHERE profile_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS p_payments_customer_select ON payments;
CREATE POLICY p_payments_customer_select ON payments
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );

DROP POLICY IF EXISTS p_quotations_customer_select ON quotations;
CREATE POLICY p_quotations_customer_select ON quotations
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE profile_id = auth.uid())
  );
