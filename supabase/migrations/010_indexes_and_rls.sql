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
