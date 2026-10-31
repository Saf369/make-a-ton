# Brightloop Hub — Master Six-Hour Hackathon Implementation Plan

**Project:** Subscription Management System for Brightloop Software  
**Repository shown in the supplied screenshot:** `Saf369/make-a-ton`  
**Execution model:** Four people, four bounded workstreams, one integrated application, six hours  
**Technical source of truth:** `PROJECT_SPEC.md`  
**Strategy:** Use the six-hour hackathon plan for sequencing and scope; use `PROJECT_SPEC.md` for domain rules, data integrity, security principles, architecture and acceptance criteria.

> **Important:** This is the team’s operating document. Each teammate must also read their individual task brief. Where a person-specific brief and this master file conflict, stop and ask the team lead before changing a shared contract. Do not silently change database names, API payloads, status values or money calculations.

---

## 1. Outcome and scope

Build **Brightloop Hub**, a single web application that manages the full subscription lifecycle:

`Product / Plan → Quotation → Subscription → Recurring Invoice → Payment → Financial Dashboard`

The six-hour goal is **feature coverage with working end-to-end paths**, not production-grade completeness. Every feature explicitly named in the challenge should have a real implementation path or be marked honestly as simplified/unverified. Do not make claims about features that are only represented by static screens.

### Required feature groups

1. Registration, login, unique email, password policy and email password reset.
2. Admin, Staff and Customer roles; admin-only staff creation; customer record isolation.
3. Products, product types, sales/cost prices, notes, variants and add-ons.
4. Daily, weekly, monthly and yearly plans; minimum quantity; availability dates; auto-close, early close, pause and renewal permissions.
5. Reusable quotation templates, validity periods, quotations and conversion to subscriptions.
6. Subscription number, customer, plan, start/end dates, payment terms, subscription lines, taxes, amounts and lifecycle states.
7. Recurring invoice generation from due subscriptions, with no duplicate or silently skipped billing periods.
8. Configurable taxes and fixed/percentage discount rules, including minimums, date ranges, usage limits and scope.
9. Invoice confirmation, cancellation, sending, printing and status/balance tracking.
10. Manual payment recording by method, amount, date and note; partial/full settlement; outstanding and overdue visibility.
11. Customer self-service for their own subscriptions, invoices, payments and permitted subscription/add-on actions.
12. Dashboard, filters, summary metrics and pagination; under-two-second response target for thousands of subscriptions, to be measured rather than assumed.

The full domain definitions, workflow details and acceptance principles are in `PROJECT_SPEC.md`. This plan does not replace it.

---

## 2. Decisions: how the six-hour strategy uses PROJECT_SPEC

### 2.1 Architecture

Use a **modular monolith**: one Next.js application, one PostgreSQL database and clearly separated domain modules. Do not create microservices or separate databases. This follows the architecture direction in `PROJECT_SPEC.md` and is the lowest-integration-risk choice for four people.

### 2.2 Stack for this hackathon

| Layer | Decision | Reason / relationship to PROJECT_SPEC |
|---|---|---|
| Web app | Next.js App Router + TypeScript | Directly follows the recommended stack. |
| Database | Supabase-hosted PostgreSQL | PostgreSQL remains the source of truth; managed hosting reduces setup work. |
| Authentication | Supabase Auth | A six-hour simplification of the Auth.js option in PROJECT_SPEC. Do not run Auth.js and Supabase Auth together. |
| Data access | `@supabase/ssr` + `@supabase/supabase-js` from server-side code | Avoid a second ORM setup in the hackathon. SQL migrations are the schema source of truth. |
| Authorization | Server-side role checks + PostgreSQL Row Level Security (RLS) | Implements PROJECT_SPEC's requirement that authorization cannot depend on hidden UI buttons. |
| UI | Tailwind CSS + shadcn/ui | Fast, consistent forms, tables, dialogs and navigation. |
| Validation | Zod | Shared server/form validation. |
| Money | PostgreSQL `NUMERIC` + a decimal-safe calculation utility | Follows PROJECT_SPEC: never use JavaScript floating-point for money. |
| Charts | Recharts | Dashboard visualizations. |
| Date helpers | `date-fns` or carefully tested native date utilities | One shared implementation for billing date rules. |
| Recurring billing | One PostgreSQL RPC/function called by both Supabase Cron and the Admin “Run Billing Now” action | Keeps one billing path and gives the database control over transactions and uniqueness. |
| Invoice output | Print-friendly invoice page + browser Print / Save as PDF | Fast implementation of print/download. |
| Email | Supabase Auth email for reset; configured SMTP/provider for invoice/quotation sending | Email configuration must be tested; do not assume default development email will deliver. |
| Tests | Vitest (or Jest) for service rules; Playwright only for essential journeys | Focus on high-risk business rules within the six-hour window. |

**Intentional stack adaptation:** `PROJECT_SPEC.md` lists Prisma and Auth.js as recommendations. For this six-hour build, we use Supabase PostgreSQL/Auth and SQL migrations rather than introducing Prisma and a second auth layer. The underlying technical requirements from the spec remain: relational integrity, transactions, decimal money, server authorization, snapshots, indexes and idempotency. Do not add Prisma midway through the hackathon.

### 2.3 Billing execution decision

Implement a single database function/RPC, provisionally named `process_due_subscriptions()`. Both the Admin action and the scheduler call this same function. The database must enforce a unique recurring invoice key for each subscription and billing period. A second billing run must not create a second invoice.

If the team cannot complete a scheduled trigger in the six-hour window, the Admin “Run Billing Now” button still calls the exact same billing function. Mark scheduled execution **implemented and tested** only after Cron is configured and observed to invoke it. Do not claim a real automatic schedule merely because the button works.

### 2.4 Money, time and locale

- Currency for the demo: INR (₹), stored with an explicit currency code.
- All prices/totals use PostgreSQL `NUMERIC`, not `REAL`, `FLOAT` or JavaScript `number` arithmetic for financial calculations.
- Store timestamps in UTC. Use an explicit business timezone for billing periods; default demo timezone: `Asia/Kolkata`, unless the team lead sets another agreed value.
- Define a single monthly billing anchor rule for 29th/30th/31st month ends. Test the rule with sample dates.
- Historical invoice lines snapshot product descriptions, variant adjustments, price, tax and discount values; later catalogue changes must not rewrite past invoices.

---

## 3. Team ownership and GitHub mapping

The supplied GitHub screenshot shows these team names in the README. The following mapping applies the four technical workstreams to those names:

| Person | Team role | Workstream | Branch |
|---|---|---|---|
| **Safwan Muhammed** | Team Leader / Integrator | Platform, database, auth, permissions, integration and deployment | `feat/safwan-platform` |
| **Afsal** | Team Member 2 | Catalogue, variants, plans, quotations and subscriptions | `feat/afsal-subscriptions` |
| **Rufaid** | Team Member 3 | Taxes, discounts, recurring billing, invoices and payments | `feat/rufaid-billing` |
| **Mishal** | Team Member 4 | UI integration, customer portal, dashboard and QA | `feat/mishal-ui-qa` |

This is the work allocation for this plan; it is not a claim that the screenshot assigned those technical roles already.

### Ownership rule

Each person owns their domain's implementation, screens and focused tests. **Safwan owns shared schema migrations, shared types, merge order and release integration.** Other members can request schema changes through a documented proposal/PR but must not independently modify the canonical migration or shared contract.

### Before coding

1. Add all four teammates as GitHub collaborators with write access.
2. Everyone clones the same repository and checks out the same starting commit.
3. Confirm the default branch is `main` and that all four can push branches.
4. The screenshot shows a repository with a README and one commit at that moment. Re-check the live repository before assuming it is still empty or that no one has added files since the screenshot.
5. Keep `main` runnable. Do not push unreviewed code directly to `main`.

---

## 4. Six-hour phases and gates

### Phase 0 — Contract and planning (00:00–00:20)

**All four together. No feature implementation yet.**

- Read `PROJECT_SPEC.md`, this master plan and each person's brief.
- Agree the role names, status enums, table names, route conventions and invoice calculation order.
- Safwan records the approved shared contract in `docs/TEAM_CONTRACT.md` or adopts Section 7 of this document as the contract.
- Each member opens their Antigravity workspace on their assigned branch/worktree.
- Confirm Supabase project, environment variables and local start command.

**Gate at 00:20:** No unresolved disagreement about shared types, table ownership or who owns a module.

### Phase 1 — Directory and platform foundation (00:20–01:10)

- Safwan creates the Next.js foundation, Supabase clients, initial SQL migration, role/profile tables, RLS baseline and seed/bootstrap approach.
- Afsal builds product/variant/plan services and forms against the agreed schema.
- Rufaid creates finance enums, money/date utilities, invoice/tax/discount schema proposals and initial calculation tests; Safwan applies the agreed migrations.
- Mishal creates app shell, role-aware navigation components, design tokens, form/table primitives and page skeletons.

**Gate at 01:10:** App starts; Supabase connection works; shared types compile; no one has invented a competing schema.

### Phase 2 — Core vertical workflows (01:10–02:25)

- Safwan completes role-aware registration/login, profile linking, staff creation protection and server authorization helpers.
- Afsal completes quotations, subscription creation, line items and the main lifecycle transitions.
- Rufaid completes the first working invoice creation/calculation path, tax and discount eligibility checks, payment model and billing period key.
- Mishal connects page routes/forms to actual services as they become available; prioritize navigation and functional tables over polish.

**Gate at 02:25:** At least one real customer can be quoted, converted to a subscription and made billable; billing can create an invoice from a due subscription.

### Phase 3 — Finance, portal and module integration (02:25–03:40)

- Afsal completes add-on enable/disable, plan lifecycle flags, pause/resume/renew/close and validations.
- Rufaid completes recurring billing function, duplicate prevention, invoice lifecycle, payments, discount use tracking, overdue calculation and billing-run logs.
- Mishal connects admin/staff screens and customer portal to live records; implement customer self-service actions only where the plan flags permit them.
- Safwan integrates changes, resolves contracts, verifies route permissions and applies reviewed migrations.

**Gate at 03:40:** The complete quotation → subscription → invoice → payment flow works against the shared database at least once.

### Phase 4 — Feature freeze, security and correctness (03:40–05:20)

**04:35 is the hard feature freeze.** Before then, finish remaining essential connections. After then, do not add new modules.

- Test customer A cannot access customer B's subscription, invoice or payment.
- Test staff cannot create staff or change admin-only tax/discount/product/plan settings.
- Run billing twice and prove no duplicate invoice.
- Test variant price, quantity, discount, tax and total using hand-calculated expected values.
- Test partial payment, full payment and overdue status.
- Verify pause/close/expiry excludes a subscription from billing.
- Replace every fake dashboard value with a database query or mark the card as not implemented.
- Run lint, typecheck, test suite and production build; resolve blocking errors.

### Phase 5 — Demo freeze and presentation (05:20–06:00)

- Stop feature coding.
- Load seed/demo data and confirm all demo accounts work.
- Rehearse the complete demo journey once.
- Confirm the app is accessible from the demo machine/network.
- Keep a short known-limitations note ready.
- Safwan gives the final integrated status; every module owner states what was actually verified.

---

## 5. Six-hour parallel execution table

| Time | Safwan — Platform | Afsal — Catalogue & subscriptions | Rufaid — Billing & finance | Mishal — UI & QA |
|---|---|---|---|---|
| 00:00–00:20 | Contract, repo and setup | Review workflows and fields | Review billing/tax/payment rules | Page map, demo flow and UI shell plan |
| 00:20–01:10 | Next.js, Supabase, profiles, roles, RLS | Product, variant and plan CRUD | Money/date utilities; finance schema proposal; tax/discount rules | Layout, navigation, reusable forms/tables |
| 01:10–02:25 | Auth, staff creation, permission helpers | Templates, quotations, subscription creation | Invoice calculation and initial invoice path | Core screens and live data wiring |
| 02:25–03:40 | Integration, RLS and migration control | Add-ons and subscription lifecycle | Billing RPC, duplicate prevention, payments, overdue | Customer portal, role-specific screens, dashboard data |
| 03:40–04:35 | Integrate and resolve API/schema mismatches | Finish validation and workflow test | Finish tests for billing reliability | End-to-end integration and customer isolation test |
| 04:35–05:20 | Security/build checks | Fix subscription workflow bugs | Fix finance correctness bugs | Fix navigation/UI/portal and run e2e checks |
| 05:20–05:45 | Release/branch freeze | Verify seeded subscriptions | Verify billing and payment demo | Verify dashboard/portal/pagination |
| 05:45–06:00 | Final integrated demo | Catalogue-to-subscription segment | Invoice-to-payment segment | UI and customer-isolation segment |

---

## 6. Directory setup and repository conventions

The repository shown in the screenshot is `Saf369/make-a-ton`. Keep the project name Brightloop Hub in the app, even if the repository remains named `make-a-ton` for the hackathon.

### 6.1 Initial commands

```bash
# Each teammate runs this once
git clone https://github.com/Saf369/make-a-ton.git
cd make-a-ton

git checkout main
git pull origin main

# Create an application in a subdirectory so the current root README remains intact
npx create-next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install shared runtime dependencies from repository root's app directory
cd apps/web
npm install @supabase/supabase-js @supabase/ssr zod decimal.js date-fns recharts lucide-react
npm install -D vitest @testing-library/react @testing-library/jest-dom

# Initialize shadcn/ui when the app shell is ready
npx shadcn@latest init
```

If the repository already contains a Next.js application when the team starts, **do not create a second app**. Inspect the existing structure and adapt this directory map. Only Safwan should decide the canonical app root.

### 6.2 Recommended directory tree

```text
make-a-ton/
├── README.md
├── PROJECT_SPEC.md
├── BRIGHTLOOP_MASTER_IMPLEMENTATION_PLAN.md
├── docs/
│   ├── TEAM_CONTRACT.md
│   ├── API_CONTRACT.md
│   ├── DEMO_CHECKLIST.md
│   └── KNOWN_LIMITATIONS.md
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_core_identity.sql
│   │   ├── 002_catalog_plans.sql
│   │   ├── 003_quotes_subscriptions.sql
│   │   └── 004_billing_finance.sql
│   ├── seed.sql
│   └── functions/                 # only if using Edge Functions; do not duplicate billing logic
├── apps/
│   └── web/
│       ├── .env.example
│       ├── package.json
│       ├── next.config.ts
│       └── src/
│           ├── app/
│           │   ├── (auth)/login/page.tsx
│           │   ├── (auth)/register/page.tsx
│           │   ├── (auth)/forgot-password/page.tsx
│           │   ├── (auth)/reset-password/page.tsx
│           │   ├── (workspace)/admin/dashboard/page.tsx
│           │   ├── (workspace)/admin/products/page.tsx
│           │   ├── (workspace)/admin/plans/page.tsx
│           │   ├── (workspace)/admin/taxes/page.tsx
│           │   ├── (workspace)/admin/discounts/page.tsx
│           │   ├── (workspace)/admin/staff/page.tsx
│           │   ├── (workspace)/operations/customers/page.tsx
│           │   ├── (workspace)/operations/quotations/page.tsx
│           │   ├── (workspace)/operations/subscriptions/page.tsx
│           │   ├── (workspace)/operations/invoices/page.tsx
│           │   ├── (workspace)/operations/payments/page.tsx
│           │   ├── (workspace)/portal/page.tsx
│           │   ├── (workspace)/portal/subscriptions/page.tsx
│           │   ├── (workspace)/portal/invoices/page.tsx
│           │   ├── (workspace)/portal/payments/page.tsx
│           │   └── api/                     # route handlers if required
│           ├── components/
│           │   ├── ui/
│           │   ├── layout/
│           │   ├── forms/
│           │   └── data-table/
│           ├── features/
│           │   ├── auth/
│           │   ├── catalog/
│           │   ├── plans/
│           │   ├── quotations/
│           │   ├── subscriptions/
│           │   ├── billing/
│           │   ├── invoices/
│           │   ├── payments/
│           │   ├── portal/
│           │   └── dashboard/
│           ├── lib/
│           │   ├── supabase/client.ts
│           │   ├── supabase/server.ts
│           │   ├── auth/permissions.ts
│           │   ├── money.ts
│           │   ├── billing-dates.ts
│           │   ├── validation/
│           │   └── utils.ts
│           └── types/
│               ├── database.ts
│               └── domain.ts
└── scripts/
    ├── seed-demo.ts
    └── smoke-test.md
```

This is a target structure, not a requirement to create every empty file. Create a directory when its first implementation lands. Avoid duplicate route folders or multiple versions of the same service.

### 6.3 Environment variables

Create `apps/web/.env.example` with placeholders only:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
BUSINESS_TIMEZONE=Asia/Kolkata
CRON_SECRET=
```

- Never commit `.env.local` or actual keys.
- `SUPABASE_SERVICE_ROLE_KEY` must only be read in server-only code. Never prefix it with `NEXT_PUBLIC_`.
- Do not use the service role key to bypass customer-level authorization in normal user requests.
- Add the local environment file to `.gitignore`.

### 6.4 Shared commands

Run inside `apps/web`:

```bash
npm run dev
npm run lint
npx tsc --noEmit
npm run build
```

Add `test` and `test:watch` scripts when Vitest is configured. Each member must report the exact commands they ran and the result.

---

## 7. Contract between the four teammates

This is a binding implementation contract for the hackathon. It prevents parallel agents from generating incompatible code.

### 7.1 Shared ownership and change process

| Shared item | Owner | Others may do | Change approval |
|---|---|---|---|
| Database migrations and schema | Safwan | Submit migration proposal with rationale | Safwan applies after relevant owner review |
| Auth, roles, RLS and permission helpers | Safwan | Call helpers; request new permissions | Safwan approves and implements shared security changes |
| Product/plan/quotation/subscription logic | Afsal | Consume agreed service functions | Afsal approves domain logic; Safwan approves schema/API impact |
| Tax/discount/invoice/payment/billing logic | Rufaid | Consume finance service/RPC contracts | Rufaid approves finance logic; Safwan approves schema/API impact |
| Shared layout, navigation and design primitives | Mishal | Reuse components; submit component changes | Mishal coordinates visual/API needs with owners |
| Shared types and route response envelope | Safwan maintains | Propose changes in PR | All affected owners agree before merge |
| Final merge/deployment/release | Safwan | Review and test | Safwan performs final merge after required checks |

### 7.2 Git rules

1. `main` must remain runnable. No direct feature coding on `main`.
2. Work only on your assigned branch: `feat/safwan-platform`, `feat/afsal-subscriptions`, `feat/rufaid-billing`, `feat/mishal-ui-qa`.
3. Keep commits small and descriptive: `feat(catalog): add variant pricing`, `fix(billing): prevent duplicate period invoice`.
4. Push early, not only at the end. Open a PR as soon as the first useful slice is ready.
5. Never force-push a teammate's branch. Do not reset another person's work.
6. Only Safwan applies migrations to the shared Supabase project. Other members may test local SQL in an isolated project/branch, then submit SQL for review.
7. Before editing a shared file, message the owner and agree who edits it. Avoid concurrent changes to package files, route groups, shared types and migrations.
8. Merge small PRs in this order when possible: Safwan foundation → Afsal domain → Rufaid finance → Mishal integration. If a dependency blocks that order, integrate the smallest compiling interface first.
9. After each merge, run lint, typecheck and build. Do not wait until the final 15 minutes.
10. If a conflict occurs, the owner of the file resolves it; do not accept a merge result that drops another module's logic.

### 7.3 API contract conventions

- Prefer server actions or Next.js route handlers for authenticated operations.
- Validate all external input with Zod on the server.
- Return a consistent shape: `{ data, error }` (or use standard HTTP errors consistently). Do not mix unrelated response shapes for the same module.
- Never accept `customer_id` from a customer-facing request as proof of ownership. Derive customer identity from the authenticated server session/profile.
- Admin/staff operations must check role on the server. RLS remains enabled as a second boundary.
- Money fields are decimal strings at API boundaries where practical; convert to decimal-safe types for calculation. Do not pass money through JavaScript floating-point arithmetic.
- Date fields use ISO 8601 strings. Clearly distinguish date-only fields from timezone-aware timestamps.
- List endpoints accept a bounded `page`, `pageSize`, `search` and relevant filters. Default page size 20 or 25; cap page size at 100.

### 7.4 Proposed route map

```text
/auth/register                 POST
/auth/login                    Supabase Auth flow
/auth/logout                   Supabase Auth flow
/auth/forgot-password          Supabase Auth reset request
/auth/reset-password           Supabase Auth reset completion
/admin/staff                   GET, POST (POST Admin only)
/products                      GET, POST
/products/:id                  GET, PATCH, deactivate
/plans                         GET, POST
/plans/:id                     GET, PATCH, deactivate
/tax-rules                     GET, POST, PATCH (Admin only)
/discounts                     GET, POST, PATCH (Admin only)
/customers                     GET, POST, PATCH (Staff/Admin policy)
/quotation-templates           GET, POST, PATCH (Admin policy)
/quotations                    GET, POST
/quotations/:id/send           POST
/quotations/:id/confirm         POST
/subscriptions                 GET, POST
/subscriptions/:id             GET, PATCH (restricted fields)
/subscriptions/:id/pause       POST
/subscriptions/:id/resume      POST
/subscriptions/:id/close       POST
/subscriptions/:id/renew       POST
/billing/run                   POST (Admin/authorized Staff; same DB RPC)
/invoices                      GET
/invoices/:id                  GET
/invoices/:id/confirm          POST
/invoices/:id/cancel           POST with reason
/invoices/:id/send             POST
/invoices/:id/print             GET/page
/invoices/:id/payments         POST
/payments                      GET
/reports/summary               GET
/portal/subscriptions           GET (session customer only)
/portal/subscriptions/:id/action POST (allowed actions only)
/portal/invoices                GET (session customer only)
/portal/payments                GET (session customer only)
```

Route names can be implemented as pages/server actions instead of literal REST endpoints, but the authorization and ownership rules remain.

### 7.5 Database domain contract

The detailed schema in `PROJECT_SPEC.md` is authoritative. Use the following core tables and relationships as the minimum shared vocabulary:

| Table | Core responsibility | Main relationships |
|---|---|---|
| `profiles` | Auth user profile, normalized email and role | Supabase `auth.users` |
| `customers` | Business/customer contact and billing details | Optional link to `profiles`; one customer account can own subscriptions |
| `products` | Product catalogue fields and base prices | Has many variants and subscription/quotation lines |
| `product_variants` | Variant attribute/value and price adjustment | Belongs to product |
| `plans` | Interval, price, minimum quantity, availability and lifecycle flags | Has many plan items and subscriptions |
| `plan_items` | Products included in a plan | Links plan and product/variant |
| `quotation_templates` | Reusable quotation defaults and validity | Has template items |
| `quotation_template_items` | Template product/plan lines | Links template to catalogue records |
| `quotations` | Customer quote, validity, state and totals | Belongs to customer; has quote items |
| `quotation_items` | Snapshot lines used in the quote | Belongs to quotation |
| `subscriptions` | Unique number, customer, plan, state, dates, next billing and terms | Belongs to customer/plan; has lines and invoices |
| `subscription_items` | Product/variant/add-on lines, quantity, unit price and active flag | Belongs to subscription |
| `subscription_events` | Actor, old/new state, reason and timestamp | Belongs to subscription |
| `tax_rules` | Admin-configurable tax rate/effective rule | Used when invoices are generated |
| `discounts` | Fixed/percentage, scope, thresholds, dates and usage cap | Can link to products and redemptions |
| `discount_products` | Product scope join table | Links discount and product |
| `discount_redemptions` | Usage record for discount limit | Links discount, invoice and customer |
| `invoices` | Header, billing period, customer snapshot, totals, status and balance | Belongs to customer/subscription |
| `invoice_items` | Description, quantity, unit price, discounts and tax snapshots | Belongs to invoice |
| `payments` | Method, amount, received date, note and reference | Belongs to invoice |
| `billing_runs` | Run start/end, outcome counts and status | Has run items |
| `billing_run_items` | Per-subscription success/failure/invoice/error | Belongs to billing run |
| `audit_logs` | Sensitive actor/action/entity changes | Actor and target entity |

#### Shared enums

```text
Role: ADMIN | STAFF | CUSTOMER
BillingInterval: DAY | WEEK | MONTH | YEAR
SubscriptionStatus: DRAFT | QUOTATION | CONFIRMED | ACTIVE | PAUSED | CLOSED | EXPIRED
QuotationStatus: DRAFT | SENT | CONFIRMED | REJECTED | EXPIRED
InvoiceStatus: DRAFT | CONFIRMED | PARTIALLY_PAID | PAID | CANCELLED
DiscountType: FIXED | PERCENTAGE
DiscountScope: PRODUCT | SUBSCRIPTION
PaymentMethod: UPI | BANK_TRANSFER | CASH | CARD | CHEQUE | OTHER
```

The visible challenge lifecycle remains Draft → Quotation → Confirmed → Active → Closed. `PAUSED` and `EXPIRED` are additional internal states to represent required behaviour. `PARTIALLY_PAID` makes partial payment behaviour explicit.

### 7.6 Shared security contract

- Public registration may create only a Customer account. Do not allow a public request to choose `ADMIN` or `STAFF`.
- Initial Admin bootstrap must be controlled by Safwan, through a secure one-time setup/seed procedure. Do not expose public admin creation.
- Only Admin can create staff. Use Supabase Admin API only from server-only code and validate the current caller as Admin first.
- `SUPABASE_SERVICE_ROLE_KEY` never reaches the browser.
- RLS must be enabled for business tables. Customer policies scope data to the authenticated customer's linked profile.
- Staff access follows the agreed staff policy; Admin can access all business records.
- Do not treat an opaque UUID as authorization. Check role and ownership server-side.
- Test Customer A attempting to access Customer B's record by URL, query parameter and direct API call.

### 7.7 Shared financial contract

1. `unit_price = base_product_price + selected_variant_adjustments`.
2. `line_subtotal = unit_price × quantity`.
3. Apply eligible discount according to scope, minimum quantity/amount, date and usage limit.
4. `taxable_amount = line_subtotal − discount` (unless the configured rule explicitly defines another basis; for this prototype use this consistent convention).
5. `tax = taxable_amount × tax_rate` with a documented rounding rule.
6. `line_total = taxable_amount + tax`.
7. `invoice_total = sum(line_total)`.
8. `balance = invoice_total − sum(successful payments)`.
9. `overdue = due_date < today AND balance > 0 AND invoice is not cancelled`.
10. Invoice snapshots never change when catalogue/tax/discount configuration changes.

**Discount usage:** Reserve/increment usage transactionally when the invoice is successfully created. A failed invoice must not consume a usage. Prevent concurrent redemptions beyond the limit.

### 7.8 Recurring billing reliability contract

- Only due `ACTIVE` subscriptions are candidates. `PAUSED`, `CLOSED` and `EXPIRED` subscriptions must not be billed.
- Determine the period from the plan interval and the agreed timezone/anchor convention.
- Do not bill beyond an applicable subscription expiry/end date.
- Create invoice header and lines and advance `next_billing_at` in one database transaction.
- Add database uniqueness on subscription + billing period + invoice kind, e.g. `UNIQUE(subscription_id, billing_period_start, billing_period_end, invoice_kind)`.
- Use `INSERT ... ON CONFLICT` or equivalent conflict handling. An application-only “does it exist?” query is not enough.
- Log every candidate as created, already processed, skipped or failed. Do not silently skip failures.
- The scheduled trigger and manual button must invoke the same function.

### 7.9 Dashboard metric definitions

Keep these metrics separate as defined in `PROJECT_SPEC.md`:

- **Active subscriptions:** Active and not past the end date.
- **MRR:** Normalized monthly recurring charges, net of recurring discounts and excluding tax and one-time charges. Monthly = monthly value; yearly = yearly/12; weekly = weekly × 52/12; daily = daily × 365/12.
- **Invoiced amount:** Sum of issued/confirmed invoices for the selected period, excluding cancelled/void.
- **Cash collected:** Successful payments received during the selected period.
- **Outstanding:** Remaining balance on issued invoices.
- **Overdue:** Remaining balance on invoices whose due date has passed.
- **Upcoming renewals:** Active subscriptions due in the selected future window.

Never label cash collected as recognized accounting revenue. State the metric definition in a tooltip or report note.

---

## 8. Shared Antigravity instructions

### Rules for every agent

- Read `PROJECT_SPEC.md`, this master file and your personal task file before editing code.
- Inspect the repository before scaffolding. Do not create a duplicate Next.js project if one already exists.
- Work only within your assigned ownership area unless a teammate explicitly approves a shared-file change.
- Consume the shared schema/types; do not invent parallel names.
- Use real persisted data for completed screens. Do not leave fake buttons or hardcoded dashboard numbers.
- Make changes in small commits and keep your branch buildable.
- Run lint, typecheck, relevant tests and build after your changes.
- Report completed, simplified, unverified and unimplemented items separately.
- Do not claim production readiness.

### Master prompt

```text
You are implementing Brightloop Hub, a six-hour hackathon prototype for the
Subscription Management System. Read PROJECT_SPEC.md and
BRIGHTLOOP_MASTER_IMPLEMENTATION_PLAN.md. Your individual task brief defines
module ownership.

Use the agreed stack: Next.js App Router + TypeScript, Supabase PostgreSQL,
Supabase Auth, server-side authorization + RLS, Tailwind/shadcn, Zod,
decimal-safe money calculations and shared billing-date rules.

PROJECT_SPEC.md is the source of truth for domain behaviour. The six-hour
plan is the source of truth for delivery order and scope. Preserve all feature
areas, simplifying implementation depth only where documented.

Do not edit another member's owned module or shared schema without approval.
Do not expose service-role secrets to the browser. Customer identity comes
from the authenticated session. Only Admin may create Staff.

All money uses NUMERIC/Decimal, never floating-point arithmetic. Invoice
prices, product descriptions, tax and discount values are snapshots.
Recurring billing must be idempotent using a database unique key per
subscription billing period and a transaction. The scheduler and manual
billing action call one shared billing function.

Use real database records, server-side permissions and validation. Add
focused tests for critical rules. Run lint, typecheck, tests and build.

At completion report: changed files, schema changes requested, commands run,
tests passed/failed, features implemented, simplifications, unverified items,
known bugs and manual verification steps. Do not claim a feature works unless
it has been executed and verified.
```

---

## 9. Demo dataset and complete journey

Use the same values across all four members to avoid inconsistent demo calculations.

### Seed scenario

- Product: `Brightloop CRM`.
- Base sales price: ₹2,000 per seat/period (demo convention; choose one clear unit).
- Variant: Brand `Odoo`, price adjustment +₹560.
- Plan: Monthly; minimum quantity 5; availability dates cover demo date.
- Discount: 10% with minimum quantity 5; valid demo date range; usage cap set to at least 1.
- Tax: Create a clearly labelled demo percentage rule. Do not claim the percentage is legally correct GST unless independently validated.
- Customer A: one business with one subscription.
- Customer B: a second customer used for isolation testing.
- Staff: one sales/operations account.
- Admin: one administrator account.
- Invoice A: generated from due subscription, initially unpaid.
- Invoice B: separate seeded overdue example if time permits.

### Demo order

1. Admin logs in and creates/views product, Odoo variant, plan, tax and discount.
2. Staff creates a quotation from a reusable template for Customer A.
3. Show quote validity date and its product/plan lines.
4. Customer A logs in, sees only their quotation/subscription and performs an allowed action (accept quote or permitted subscription action).
5. Subscription moves Draft → Quotation → Confirmed → Active.
6. Make `next_billing_at` due in seed/test data and run billing.
7. Show invoice line calculation: base price + Odoo adjustment, quantity, discount, tax and total.
8. Run billing again; show no second invoice for the same period.
9. Record partial payment, show remaining balance, then record remaining payment and show Paid.
10. Show an overdue unpaid invoice.
11. Show dashboard metrics separately: MRR, invoiced amount, cash collected, outstanding and overdue.
12. Log in as Customer B and prove Customer A's invoice cannot be accessed.
13. Show billing run and subscription/audit event history if present.

Do not wait for a real monthly renewal during a hackathon. Use a controlled due timestamp/test dataset and say it is a demonstration clock.

---

## 10. Acceptance checklist and status reporting

### Core workflow

- [ ] Register a Customer with valid email/password; duplicate email is rejected.
- [ ] Password policy is strictly more than 8 characters, with uppercase, lowercase and special character.
- [ ] Password reset email/link works in configured environment.
- [ ] Admin can create Staff; Staff/Customer cannot.
- [ ] Staff cannot change protected settings unless explicitly granted.
- [ ] Product, variant and add-on pricing is correct.
- [ ] Plan interval, minimum quantity and availability are validated.
- [ ] Quotation template can create a quotation with a validity date.
- [ ] Quotation converts into a numbered subscription.
- [ ] Subscription lifecycle and plan permissions are enforced.
- [ ] Customer portal only shows authenticated customer's own records and allowed actions.
- [ ] Due active subscription creates a complete invoice automatically.
- [ ] Repeating the billing run does not duplicate the same billing period.
- [ ] Billing failures are logged and visible for retry; no silent skip.
- [ ] Discount conditions/usage limit and tax rule are applied and snapshotted.
- [ ] Invoice can be confirmed, cancelled with reason, sent and printed.
- [ ] Partial and full payments reconcile balances.
- [ ] Overdue is determined by due date and positive balance.
- [ ] Dashboard values come from database queries and match hand-calculated records.
- [ ] List pages use pagination and relevant indexes.
- [ ] Build succeeds and no critical console/server errors block the demo.

### Performance

The challenge specifies under two seconds with thousands of subscriptions. Seed at least 5,000 subscriptions and meaningful invoice/payment data if time and environment permit. Measure dashboard and subscription-list requests, preferably using repeatable requests and p95 timings. If this test cannot be completed, report **performance target not verified**. Never infer a benchmark from a small demo dataset.

### Final status labels

Every requirement must be reported with exactly one of these statuses:

- **Implemented and tested** — executed and verified.
- **Implemented, not fully tested** — code exists but verification is incomplete.
- **Simplified** — working path exists with a documented limit.
- **Not implemented** — no working path exists.

---

## 11. Final team rules

1. Feature coverage is the target; production readiness is not.
2. Billing correctness and customer isolation outrank visual polish.
3. No shared schema/API/status change without approval.
4. No one edits the same migration or shared type file concurrently.
5. A feature is not complete because Antigravity generated code; it must run.
6. Do not add ML churn prediction, live payment gateways, multi-company tenancy, microservices or elaborate animations during the six-hour build.
7. Freeze features at 04:35 and spend the rest on integration, verification and demonstration.
8. Keep `PROJECT_SPEC.md` in the repository as the project technical reference.

**The team's definition of success:** one integrated application that demonstrates a customer moving through a real subscription and billing workflow, with role isolation, correct invoice arithmetic, duplicate-billing protection, payment reconciliation and a useful finance dashboard.
