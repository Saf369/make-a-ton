// Realistic Mock Data for Brightloop Hub Subscription Management System

export interface MetricCardData {
  title: string;
  value: string;
  subValue?: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  period: string;
  iconName: string;
}

export const DASHBOARD_METRICS: MetricCardData[] = [
  {
    title: 'Total Monthly Recurring Revenue (MRR)',
    value: '$243,000',
    change: '+8.3%',
    trend: 'up',
    period: 'vs last month',
    iconName: 'DollarSign'
  },
  {
    title: 'Active Subscriptions',
    value: '4,820',
    change: '+14.2%',
    trend: 'up',
    period: 'vs last month',
    iconName: 'Repeat'
  },
  {
    title: 'Net Profit & Cash Flow',
    value: '$123,000',
    change: '+16.8%',
    trend: 'up',
    period: 'vs last month',
    iconName: 'TrendingUp'
  },
  {
    title: 'Churn Rate',
    value: '1.42%',
    change: '-0.3%',
    trend: 'down',
    period: 'lower is better',
    iconName: 'Percent'
  }
];

export const RECENT_SUBSCRIPTIONS = [
  {
    id: 'SUB-10024',
    customer: 'Acme Technologies Inc.',
    plan: 'Enterprise Cloud Plus',
    billingCycle: 'Annual',
    amount: '$14,400/yr',
    startDate: '2026-10-15',
    nextBilling: '2027-10-15',
    status: 'Active'
  },
  {
    id: 'SUB-10023',
    customer: 'Nexus Data Labs',
    plan: 'Growth Pro Tier',
    billingCycle: 'Monthly',
    amount: '$499/mo',
    startDate: '2026-10-12',
    nextBilling: '2026-11-12',
    status: 'Active'
  },
  {
    id: 'SUB-10022',
    customer: 'Apex Global Logistics',
    plan: 'Custom Infrastructure',
    billingCycle: 'Quarterly',
    amount: '$3,850/qtr',
    startDate: '2026-09-28',
    nextBilling: '2026-12-28',
    status: 'Active'
  },
  {
    id: 'SUB-10021',
    customer: 'Vanguard Media House',
    plan: 'Starter Team',
    billingCycle: 'Monthly',
    amount: '$149/mo',
    startDate: '2026-09-10',
    nextBilling: '2026-10-10',
    status: 'Past Due'
  },
  {
    id: 'SUB-10020',
    customer: 'Horizon AI Dynamics',
    plan: 'Growth Pro Tier',
    billingCycle: 'Annual',
    amount: '$4,990/yr',
    startDate: '2026-08-01',
    nextBilling: '2027-08-01',
    status: 'Active'
  },
  {
    id: 'SUB-10019',
    customer: 'Cobalt Studio LLC',
    plan: 'Starter Team',
    billingCycle: 'Monthly',
    amount: '$149/mo',
    startDate: '2026-07-15',
    nextBilling: '2026-11-15',
    status: 'Paused'
  }
];

export const RECENT_INVOICES = [
  {
    invoiceNumber: 'INV-2026-0982',
    customer: 'Acme Technologies Inc.',
    amount: '$14,400.00',
    issueDate: '2026-10-15',
    dueDate: '2026-10-30',
    status: 'Paid',
    method: 'Direct Debit (Stripe)'
  },
  {
    invoiceNumber: 'INV-2026-0981',
    customer: 'Nexus Data Labs',
    amount: '$499.00',
    issueDate: '2026-10-12',
    dueDate: '2026-10-27',
    status: 'Paid',
    method: 'Credit Card (Visa)'
  },
  {
    invoiceNumber: 'INV-2026-0980',
    customer: 'Vanguard Media House',
    amount: '$149.00',
    issueDate: '2026-10-10',
    dueDate: '2026-10-25',
    status: 'Overdue',
    method: 'Wire Transfer'
  },
  {
    invoiceNumber: 'INV-2026-0979',
    customer: 'Hyperion Bio Systems',
    amount: '$7,850.00',
    issueDate: '2026-10-08',
    dueDate: '2026-10-23',
    status: 'Paid',
    method: 'Credit Card (Mastercard)'
  },
  {
    invoiceNumber: 'INV-2026-0978',
    customer: 'Solaria Energy Corp',
    amount: '$2,300.00',
    issueDate: '2026-10-05',
    dueDate: '2026-10-20',
    status: 'Draft',
    method: 'Invoice Net 15'
  }
];

export const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: '12 New Orders Received',
    desc: 'New automated subscriptions billed via Stripe checkout',
    time: '10 mins ago',
    type: 'order'
  },
  {
    id: 2,
    title: '7 Invoices Awaiting Payment',
    desc: 'Billing run executed for Mid-October cycle',
    time: '1 hour ago',
    type: 'invoice'
  },
  {
    id: 3,
    title: 'Low Stock / Seat Limit Alert',
    desc: '5 accounts near maximum user seat quotas',
    time: '2 hours ago',
    type: 'alert'
  },
  {
    id: 4,
    title: 'Automated Billing Run Completed',
    desc: 'Processed 148 recurring subscription payments',
    time: '4 hours ago',
    type: 'task'
  }
];

// USER MODULE DATA
export const USERS_DATA = [
  { id: 'USR-001', name: 'Rayan Al-Mansoor', email: 'rayan@brightloop.io', role: 'Super Admin', department: 'Executive', status: 'Active', lastLogin: '2026-10-31 09:15' },
  { id: 'USR-002', name: 'Sarah Jenkins', email: 'sarah.j@brightloop.io', role: 'Billing Manager', department: 'Finance', status: 'Active', lastLogin: '2026-10-31 10:45' },
  { id: 'USR-003', name: 'David Chen', email: 'david.chen@brightloop.io', role: 'Support Specialist', department: 'Customer Success', status: 'Active', lastLogin: '2026-10-30 16:20' },
  { id: 'USR-004', name: 'Elena Rostova', email: 'elena.r@brightloop.io', role: 'Sales Lead', department: 'Revenue', status: 'Active', lastLogin: '2026-10-31 08:30' },
  { id: 'USR-005', name: 'Tariq Al-Fahad', email: 'tariq@brightloop.io', role: 'Operations Auditor', department: 'Compliance', status: 'Inactive', lastLogin: '2026-10-18 11:00' }
];

export const STAFF_DATA = [
  { id: 'STF-101', name: 'Sarah Jenkins', email: 'sarah.j@brightloop.io', title: 'Senior Billing Operations Manager', department: 'Finance & Accounting', location: 'Dubai, UAE', accessLevel: 'Tier 3 (Full Financial)' },
  { id: 'STF-102', name: 'Marcus Brody', email: 'marcus.b@brightloop.io', title: 'Customer Support Lead', department: 'Customer Success', location: 'London, UK', accessLevel: 'Tier 2 (Read/Write)' },
  { id: 'STF-103', name: 'Amina Khatib', email: 'amina.k@brightloop.io', title: 'Enterprise Account Executive', department: 'Sales', location: 'Riyadh, KSA', accessLevel: 'Tier 2 (Read/Write)' },
  { id: 'STF-104', name: 'Kenji Sato', email: 'kenji.s@brightloop.io', title: 'Platform Security Specialist', department: 'Infrastructure', location: 'Tokyo, JP', accessLevel: 'Tier 3 (Admin)' }
];

export const CUSTOMERS_DATA = [
  { id: 'CUST-501', company: 'Acme Technologies Inc.', contact: 'Robert Vance', email: 'rvance@acmetech.com', phone: '+1 (555) 019-2834', country: 'United States', totalSpent: '$42,500', activeSubs: 3, status: 'Active' },
  { id: 'CUST-502', company: 'Nexus Data Labs', contact: 'Kavita Patel', email: 'kpatel@nexusdata.ai', phone: '+44 20 7946 0912', country: 'United Kingdom', totalSpent: '$8,950', activeSubs: 1, status: 'Active' },
  { id: 'CUST-503', company: 'Apex Global Logistics', contact: 'Carlos Mendez', email: 'c.mendez@apexlogistics.es', phone: '+34 91 123 4567', country: 'Spain', totalSpent: '$24,200', activeSubs: 2, status: 'Active' },
  { id: 'CUST-504', company: 'Vanguard Media House', contact: 'Chloe Dupont', email: 'cdupont@vanguardmedia.fr', phone: '+33 1 42 68 55 00', country: 'France', totalSpent: '$3,400', activeSubs: 1, status: 'At Risk' },
  { id: 'CUST-505', company: 'Solaria Energy Corp', contact: 'Hamad Al-Hashimi', email: 'hamad@solariaenergy.om', phone: '+968 24 123456', country: 'Oman', totalSpent: '$19,800', activeSubs: 2, status: 'Active' }
];

// SUBSCRIPTION MODULE DATA
export const PRODUCTS_DATA = [
  { id: 'PROD-101', name: 'Brightloop Hub Cloud', sku: 'BL-CLOUD-CORE', category: 'Software Platforms', type: 'Recurring SaaS', basePrice: '$199.00 / mo', status: 'Active' },
  { id: 'PROD-102', name: 'Brightloop API Gateway', sku: 'BL-API-GTW', category: 'Developer Tools', type: 'Usage-Based', basePrice: '$49.00 / mo + meter', status: 'Active' },
  { id: 'PROD-103', name: 'Enterprise Data Lake Sync', sku: 'BL-LAKE-SYNC', category: 'Data & Analytics', type: 'Recurring SaaS', basePrice: '$799.00 / mo', status: 'Active' },
  { id: 'PROD-104', name: 'Premium Support Concierge', sku: 'BL-SUPP-VIP', category: 'Services', type: 'Recurring Add-on', basePrice: '$299.00 / mo', status: 'Active' },
  { id: 'PROD-105', name: 'Legacy On-Prem Connector', sku: 'BL-LEGACY-CON', category: 'Integration', type: 'Annual License', basePrice: '$1,499.00 / yr', status: 'Maintenance' }
];

export const CATEGORIES_DATA = [
  { id: 'CAT-01', name: 'Software Platforms', slug: 'software-platforms', description: 'Core SaaS products and cloud software suites', productCount: 6, status: 'Active' },
  { id: 'CAT-02', name: 'Developer Tools & APIs', slug: 'dev-tools-api', description: 'SDKs, webhooks, and REST/GraphQL gateways', productCount: 4, status: 'Active' },
  { id: 'CAT-03', name: 'Data & Analytics', slug: 'data-analytics', description: 'Real-time telemetry, reporting, and ETL connectors', productCount: 3, status: 'Active' },
  { id: 'CAT-04', name: 'Services & Add-ons', slug: 'services-addons', description: 'Dedicated account managers, SLA packages, and consulting', productCount: 8, status: 'Active' }
];

export const VARIANTS_DATA = [
  { id: 'VAR-201', product: 'Brightloop Hub Cloud', name: 'Starter Edition (up to 5 users)', code: 'BL-CLOUD-STRT', billingPeriod: 'Monthly', price: '$149.00', status: 'Available' },
  { id: 'VAR-202', product: 'Brightloop Hub Cloud', name: 'Growth Edition (up to 25 users)', code: 'BL-CLOUD-GRW', billingPeriod: 'Monthly', price: '$499.00', status: 'Available' },
  { id: 'VAR-203', product: 'Brightloop Hub Cloud', name: 'Enterprise Edition (Unlimited)', code: 'BL-CLOUD-ENT', billingPeriod: 'Annual', price: '$14,400.00', status: 'Available' },
  { id: 'VAR-204', product: 'Brightloop API Gateway', name: 'Metered Tier (1M calls included)', code: 'BL-API-1M', billingPeriod: 'Monthly', price: '$49.00', status: 'Available' }
];

export const ADDONS_DATA = [
  { id: 'ADD-301', name: 'Dedicated Dedicated IP', code: 'ADD-IP-DEDICATED', unitPrice: '$25.00/mo', billingType: 'Recurring', description: 'Static IP for high deliverability and whitelisting', status: 'Active' },
  { id: 'ADD-302', name: 'Additional 10 Team Seats', code: 'ADD-SEATS-10', unitPrice: '$80.00/mo', billingType: 'Recurring', description: 'Pack of 10 concurrent team licenses', status: 'Active' },
  { id: 'ADD-303', name: 'Custom Domain White-labeling', code: 'ADD-WHITELABEL', unitPrice: '$150.00/mo', billingType: 'Recurring', description: 'Custom domain and full branding removal', status: 'Active' },
  { id: 'ADD-304', name: '1-on-1 Onboarding Concierge', code: 'ADD-ONBOARDING', unitPrice: '$850.00', billingType: 'One-Time', description: 'Dedicated implementation specialist session', status: 'Active' }
];

export const PLANS_DATA = [
  {
    id: 'PLAN-01',
    name: 'Starter Plan',
    code: 'PLN-STARTER',
    price: '$149',
    billingFrequency: 'Monthly',
    seats: 'Up to 5 Users',
    features: ['Core Subscription Engine', 'Automated Invoicing', 'Stripe & PayPal Integration', 'Email Support'],
    activeSubscribers: 1840,
    popular: false
  },
  {
    id: 'PLAN-02',
    name: 'Growth Pro',
    code: 'PLN-GROWTH',
    price: '$499',
    billingFrequency: 'Monthly',
    seats: 'Up to 25 Users',
    features: ['Everything in Starter', 'Multi-currency Billing', 'Automated Dunning Runs', 'Custom Quotation Templates', 'Priority 24/7 SLA Support'],
    activeSubscribers: 2210,
    popular: true
  },
  {
    id: 'PLAN-03',
    name: 'Enterprise Cloud',
    code: 'PLN-ENTERPRISE',
    price: '$1,200',
    billingFrequency: 'Monthly (or $12k/yr)',
    seats: 'Unlimited Users',
    features: ['Everything in Growth Pro', 'Dedicated Account Executive', 'Custom ERP & Tax Connectors', 'Custom SLAs & Audit Trails', 'Dedicated Isolated Database'],
    activeSubscribers: 770,
    popular: false
  }
];

// SALES MODULE DATA
export const QUOTATION_TEMPLATES = [
  { id: 'QT-001', name: 'Enterprise Annual Software Agreement', validDays: 30, discountDefault: '10%', defaultTerms: 'Net 30, 100% due upon counter-signature', status: 'Active' },
  { id: 'QT-002', name: 'Mid-Market Monthly Multi-Seat Tier', validDays: 14, discountDefault: '5%', defaultTerms: 'Credit Card on file, billed on day 1 of month', status: 'Active' },
  { id: 'QT-003', name: 'Professional Services & Custom Setup', validDays: 21, discountDefault: '0%', defaultTerms: '50% upfront deposit, 50% on milestone sign-off', status: 'Active' }
];

export const QUOTATIONS_DATA = [
  { id: 'QUO-2026-081', customer: 'Apex Global Logistics', title: 'Global Multi-Region SaaS Expansion', total: '$46,200.00', expiryDate: '2026-11-20', status: 'Sent', rep: 'Elena Rostova' },
  { id: 'QUO-2026-080', customer: 'Solaria Energy Corp', title: 'Renewals & API Gateway Integration', total: '$18,500.00', expiryDate: '2026-11-15', status: 'Approved', rep: 'Amina Khatib' },
  { id: 'QUO-2026-079', customer: 'Horizon AI Dynamics', title: 'Enterprise Data Lake Sync Bundle', total: '$9,588.00', expiryDate: '2026-11-05', status: 'Draft', rep: 'Elena Rostova' },
  { id: 'QUO-2026-078', customer: 'Fintech Aurora Group', title: 'Core Banking Payment Gateway Plugin', total: '$32,000.00', expiryDate: '2026-10-28', status: 'Declined', rep: 'Marcus Brody' }
];

export const SALES_ORDERS_DATA = [
  { id: 'SO-2026-440', customer: 'Acme Technologies Inc.', quotationId: 'QUO-2026-072', orderDate: '2026-10-15', amount: '$14,400.00', fulfillment: 'Fulfilled', status: 'Completed' },
  { id: 'SO-2026-439', customer: 'Nexus Data Labs', quotationId: 'QUO-2026-075', orderDate: '2026-10-12', amount: '$499.00', fulfillment: 'Fulfilled', status: 'Completed' },
  { id: 'SO-2026-438', customer: 'Solaria Energy Corp', quotationId: 'QUO-2026-080', orderDate: '2026-10-10', amount: '$18,500.00', fulfillment: 'In Progress', status: 'Processing' },
  { id: 'SO-2026-437', customer: 'Cobalt Studio LLC', quotationId: 'Direct Order', orderDate: '2026-10-02', amount: '$1,788.00', fulfillment: 'Fulfilled', status: 'Completed' }
];

export const TAX_TEMPLATES_DATA = [
  { id: 'TAX-01', name: 'GCC Standard VAT (5%)', countryRegion: 'Oman / UAE / KSA', rate: '5.00%', taxType: 'Value Added Tax', status: 'Active' },
  { id: 'TAX-02', name: 'EU Digital Services VAT (Standard 20%)', countryRegion: 'European Union', rate: '20.00%', taxType: 'Digital VAT OSS', status: 'Active' },
  { id: 'TAX-03', name: 'US State Sales Tax (Dynamic Avalara)', countryRegion: 'United States', rate: 'Variable (0-9.5%)', taxType: 'Sales Tax', status: 'Active' },
  { id: 'TAX-04', name: 'Zero Rated / Tax Exempt', countryRegion: 'B2B Reverse Charge', rate: '0.00%', taxType: 'Exempt', status: 'Active' }
];

export const PRICING_RULES_DATA = [
  { id: 'RULE-01', name: 'Annual Pre-payment Discount (2 Months Free)', ruleType: 'Billing Term', discount: '16.6%', applyTo: 'All Subscription Plans', validTill: '2027-12-31', status: 'Active' },
  { id: 'RULE-02', name: 'Volume Tier: 50+ User Seats', ruleType: 'Volume Tiered', discount: '20.0%', applyTo: 'Add-on User Packs', validTill: '2026-12-31', status: 'Active' },
  { id: 'RULE-03', name: 'Early Bird Q4 2026 Promo', ruleType: 'Coupon Code (BRIGHTQ4)', discount: '15.0%', applyTo: 'Growth Pro Plan', validTill: '2026-11-30', status: 'Active' }
];

export const PAYMENT_TERMS_DATA = [
  { id: 'TERM-01', name: 'Immediate (Due on Receipt)', days: 0, description: 'Default for credit card, debit, and instant ACH checkouts', status: 'Active' },
  { id: 'TERM-02', name: 'Net 15 Days', days: 15, description: 'Invoiced business customers with approved credit standing', status: 'Active' },
  { id: 'TERM-03', name: 'Net 30 Days', days: 30, description: 'Standard enterprise invoice term for annual contracts', status: 'Active' },
  { id: 'TERM-04', name: '50/50 Milestone Contract', days: 45, description: '50% upon order execution, 50% after deployment acceptance', status: 'Active' }
];

export const BILLING_RUNS_DATA = [
  { id: 'RUN-2026-10-31', schedule: 'Scheduled (Daily Nightly Batch)', triggeredAt: '2026-10-31 00:00', totalSubscriptions: 218, successCount: 215, failedCount: 3, totalBilled: '$34,920.00', status: 'Completed' },
  { id: 'RUN-2026-10-30', schedule: 'Daily Nightly Batch', triggeredAt: '2026-10-30 00:00', totalSubscriptions: 194, successCount: 192, failedCount: 2, totalBilled: '$28,450.00', status: 'Completed' },
  { id: 'RUN-2026-10-29', schedule: 'Daily Nightly Batch', triggeredAt: '2026-10-29 00:00', totalSubscriptions: 180, successCount: 180, failedCount: 0, totalBilled: '$22,110.00', status: 'Completed' },
  { id: 'RUN-2026-10-15', schedule: 'Mid-Month Batch Run', triggeredAt: '2026-10-15 00:00', totalSubscriptions: 342, successCount: 338, failedCount: 4, totalBilled: '$68,500.00', status: 'Completed' }
];

export const PAYMENT_ENTRIES_DATA = [
  { id: 'PAY-8891', customer: 'Acme Technologies Inc.', invoice: 'INV-2026-0982', amount: '$14,400.00', method: 'Stripe ACH Transfer', transactionRef: 'ch_3N82bX2eZvKYlo2C', date: '2026-10-16', status: 'Settled' },
  { id: 'PAY-8890', customer: 'Nexus Data Labs', invoice: 'INV-2026-0981', amount: '$499.00', method: 'Visa Credit Card', transactionRef: 'ch_3N81aY3dKlo19M', date: '2026-10-12', status: 'Settled' },
  { id: 'PAY-8889', customer: 'Hyperion Bio Systems', invoice: 'INV-2026-0979', amount: '$7,850.00', method: 'Mastercard Enterprise', transactionRef: 'ch_3N79mP9pWkLq89', date: '2026-10-09', status: 'Settled' },
  { id: 'PAY-8888', customer: 'Vanguard Media House', invoice: 'INV-2026-0980', amount: '$149.00', method: 'Wire Transfer', transactionRef: 'WT-99210-FAILED', date: '2026-10-11', status: 'Failed' }
];
