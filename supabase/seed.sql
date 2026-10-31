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
) VALUES (
  '0f000000-0000-0000-0000-000000000001',
  '0d000000-0000-0000-0000-000000000001',
  47198.82
) ON CONFLICT (payment_id, invoice_id) DO NOTHING;
