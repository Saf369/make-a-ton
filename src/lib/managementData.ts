// Management Module Data Services & Models
// Owned by Mishal (Management Module: Dashboard, Customer Portal, Reports, QA)

export interface CustomerProfile {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  billingAddress: string;
  taxId: string;
  accountManager: string;
  memberSince: string;
  status: 'Active' | 'Suspended' | 'Pending';
}

export interface CustomerQuotation {
  id: string;
  customerId: string;
  templateName: string;
  date: string;
  validUntil: string;
  items: { product: string; variant?: string; qty: number; unitPrice: number; total: number }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Sent' | 'Confirmed' | 'Rejected' | 'Expired';
}

export interface CustomerSalesOrder {
  id: string;
  customerId: string;
  quotationRef: string;
  orderDate: string;
  planName: string;
  totalAmount: number;
  status: 'Confirmed' | 'Converted' | 'Pending';
}

export interface CustomerSubscriptionItem {
  id: string;
  customerId: string;
  planName: string;
  category: string;
  billingInterval: 'Monthly' | 'Annual' | 'Weekly';
  amount: number;
  seats: number;
  startDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  status: 'Active' | 'Paused' | 'Closed' | 'Expired';
  addOns: { name: string; cost: number }[];
}

export interface CustomerInvoiceItem {
  id: string;
  customerId: string;
  customerName: string;
  issueDate: string;
  dueDate: string;
  planOrService: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partially Paid' | 'Confirmed' | 'Overdue' | 'Cancelled';
  paymentMethod?: string;
  lines: { description: string; qty: number; unitPrice: number; total: number }[];
}

export interface CustomerPaymentItem {
  id: string;
  customerId: string;
  customerName: string;
  paymentDate: string;
  amount: number;
  invoiceId: string;
  method: 'Credit Card' | 'UPI' | 'Bank Transfer' | 'Cheque';
  referenceNo: string;
  status: 'Settled' | 'Pending' | 'Failed';
  notes?: string;
}

// ---------------- DEMO CUSTOMERS (Isolated Records) ----------------
export const CUSTOMERS: CustomerProfile[] = [
  {
    id: 'CUST-501',
    name: 'Robert Vance',
    companyName: 'Acme Technologies Inc.',
    email: 'billing@acmetech.com',
    phone: '+1 (555) 234-5678',
    billingAddress: '1200 Market Street, Suite 400, San Francisco, CA 94103',
    taxId: 'US-EIN-94-3829104',
    accountManager: 'Elena Rostova',
    memberSince: 'March 2024',
    status: 'Active'
  },
  {
    id: 'CUST-502',
    name: 'Sara Chen',
    companyName: 'Zenith Retail Group',
    email: 'finance@zenithretail.co',
    phone: '+1 (555) 872-4190',
    billingAddress: '450 Fifth Avenue, Floor 18, New York, NY 10018',
    taxId: 'US-EIN-13-9821450',
    accountManager: 'Marcus Brody',
    memberSince: 'January 2025',
    status: 'Active'
  },
  {
    id: 'CUST-503',
    name: 'Devon Patel',
    companyName: 'Nova Dynamics Ltd',
    email: 'accounts@novadynamics.io',
    phone: '+44 20 7946 0912',
    billingAddress: '88 Kingsway, Holborn, London WC2B 6AA, UK',
    taxId: 'GB-VAT-891-2341-90',
    accountManager: 'Elena Rostova',
    memberSince: 'July 2024',
    status: 'Active'
  }
];

// ---------------- SUBSCRIPTIONS ----------------
export const ALL_SUBSCRIPTIONS: CustomerSubscriptionItem[] = [
  {
    id: 'SUB-10024',
    customerId: 'CUST-501',
    planName: 'Enterprise Cloud Plus',
    category: 'SaaS Platforms',
    billingInterval: 'Annual',
    amount: 14400.00,
    seats: 50,
    startDate: '2025-10-15',
    nextBillingDate: '2026-10-15',
    autoRenew: true,
    status: 'Active',
    addOns: [
      { name: 'Dedicated Outbound IP (2 instances)', cost: 50.00 },
      { name: '24/7 Dedicated Concierge Support', cost: 299.00 }
    ]
  },
  {
    id: 'SUB-10025',
    customerId: 'CUST-501',
    planName: 'AI Intelligence Suite',
    category: 'Analytics Add-on',
    billingInterval: 'Monthly',
    amount: 450.00,
    seats: 10,
    startDate: '2026-04-01',
    nextBillingDate: '2026-11-01',
    autoRenew: true,
    status: 'Active',
    addOns: []
  },
  {
    id: 'SUB-10023',
    customerId: 'CUST-502',
    planName: 'Growth Pro Tier',
    category: 'Productivity',
    billingInterval: 'Monthly',
    amount: 540.00,
    seats: 20,
    startDate: '2025-01-20',
    nextBillingDate: '2026-11-20',
    autoRenew: true,
    status: 'Active',
    addOns: [
      { name: 'Priority API Rate Limit Upgrade', cost: 120.00 }
    ]
  },
  {
    id: 'SUB-10022',
    customerId: 'CUST-503',
    planName: 'Starter Team Edition',
    category: 'Core Tier',
    billingInterval: 'Monthly',
    amount: 199.00,
    seats: 5,
    startDate: '2026-07-10',
    nextBillingDate: '2026-11-10',
    autoRenew: false,
    status: 'Paused',
    addOns: []
  }
];

// ---------------- QUOTATIONS ----------------
export const ALL_QUOTATIONS: CustomerQuotation[] = [
  {
    id: 'QT-2026-041',
    customerId: 'CUST-501',
    templateName: 'Enterprise SaaS Annual Standard',
    date: '2026-09-28',
    validUntil: '2026-11-15',
    items: [
      { product: 'Enterprise Cloud Plus (Annual)', qty: 1, unitPrice: 14400.00, total: 14400.00 },
      { product: 'Concierge SLA 99.99%', qty: 1, unitPrice: 1200.00, total: 1200.00 }
    ],
    subtotal: 15600.00,
    discount: 1560.00,
    tax: 1404.00,
    total: 15444.00,
    status: 'Confirmed'
  },
  {
    id: 'QT-2026-052',
    customerId: 'CUST-501',
    templateName: 'Q4 Seat Expansion Addendum',
    date: '2026-10-20',
    validUntil: '2026-11-30',
    items: [
      { product: 'Additional Enterprise Seats (+25)', qty: 25, unitPrice: 35.00, total: 875.00 }
    ],
    subtotal: 875.00,
    discount: 50.00,
    tax: 82.50,
    total: 907.50,
    status: 'Sent'
  },
  {
    id: 'QT-2026-039',
    customerId: 'CUST-502',
    templateName: 'Retail Growth Package',
    date: '2026-08-15',
    validUntil: '2026-09-15',
    items: [
      { product: 'Growth Pro Tier (Annual)', qty: 1, unitPrice: 5800.00, total: 5800.00 }
    ],
    subtotal: 5800.00,
    discount: 580.00,
    tax: 522.00,
    total: 5742.00,
    status: 'Confirmed'
  },
  {
    id: 'QT-2026-048',
    customerId: 'CUST-503',
    templateName: 'Starter Expansion',
    date: '2026-10-05',
    validUntil: '2026-11-05',
    items: [
      { product: 'Starter Team Tier', qty: 1, unitPrice: 2200.00, total: 2200.00 }
    ],
    subtotal: 2200.00,
    discount: 100.00,
    tax: 210.00,
    total: 2310.00,
    status: 'Sent'
  }
];

// ---------------- SALES ORDERS ----------------
export const ALL_SALES_ORDERS: CustomerSalesOrder[] = [
  {
    id: 'SO-2026-0089',
    customerId: 'CUST-501',
    quotationRef: 'QT-2026-041',
    orderDate: '2026-10-02',
    planName: 'Enterprise Cloud Plus',
    totalAmount: 15444.00,
    status: 'Converted'
  },
  {
    id: 'SO-2026-0074',
    customerId: 'CUST-502',
    quotationRef: 'QT-2026-039',
    orderDate: '2026-08-20',
    planName: 'Growth Pro Tier',
    totalAmount: 5742.00,
    status: 'Converted'
  }
];

// ---------------- INVOICES ----------------
export const ALL_INVOICES: CustomerInvoiceItem[] = [
  {
    id: 'INV-2026-0982',
    customerId: 'CUST-501',
    customerName: 'Acme Technologies Inc.',
    issueDate: '2026-10-15',
    dueDate: '2026-11-14',
    planOrService: 'Enterprise Cloud Plus (Annual)',
    subtotal: 14400.00,
    discount: 0.00,
    tax: 1440.00,
    total: 15840.00,
    paidAmount: 15840.00,
    balance: 0.00,
    status: 'Paid',
    paymentMethod: 'Credit Card',
    lines: [
      { description: 'Enterprise Cloud Plus License (50 Seats, 12 Months)', qty: 1, unitPrice: 14400.00, total: 14400.00 }
    ]
  },
  {
    id: 'INV-2026-1044',
    customerId: 'CUST-501',
    customerName: 'Acme Technologies Inc.',
    issueDate: '2026-10-01',
    dueDate: '2026-10-31',
    planOrService: 'AI Intelligence Suite Add-on',
    subtotal: 450.00,
    discount: 0.00,
    tax: 45.00,
    total: 495.00,
    paidAmount: 495.00,
    balance: 0.00,
    status: 'Paid',
    paymentMethod: 'Credit Card',
    lines: [
      { description: 'AI Intelligence Suite (10 Seats)', qty: 1, unitPrice: 450.00, total: 450.00 }
    ]
  },
  {
    id: 'INV-2026-0899',
    customerId: 'CUST-502',
    customerName: 'Zenith Retail Group',
    issueDate: '2026-10-20',
    dueDate: '2026-11-19',
    planOrService: 'Growth Pro Tier (Monthly)',
    subtotal: 540.00,
    discount: 40.00,
    tax: 50.00,
    total: 550.00,
    paidAmount: 550.00,
    balance: 0.00,
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    lines: [
      { description: 'Growth Pro Tier Monthly Recurring (20 Seats)', qty: 1, unitPrice: 540.00, total: 540.00 }
    ]
  },
  {
    id: 'INV-2026-0785',
    customerId: 'CUST-503',
    customerName: 'Nova Dynamics Ltd',
    issueDate: '2026-09-10',
    dueDate: '2026-10-10',
    planOrService: 'Starter Team Edition (Monthly)',
    subtotal: 199.00,
    discount: 0.00,
    tax: 39.80,
    total: 238.80,
    paidAmount: 0.00,
    balance: 238.80,
    status: 'Overdue',
    paymentMethod: 'None',
    lines: [
      { description: 'Starter Team Edition Monthly Recurring', qty: 1, unitPrice: 199.00, total: 199.00 }
    ]
  },
  {
    id: 'INV-2026-1090',
    customerId: 'CUST-502',
    customerName: 'Zenith Retail Group',
    issueDate: '2026-10-25',
    dueDate: '2026-11-24',
    planOrService: 'Priority API Rate Limit Upgrade',
    subtotal: 120.00,
    discount: 0.00,
    tax: 12.00,
    total: 132.00,
    paidAmount: 0.00,
    balance: 132.00,
    status: 'Confirmed',
    lines: [
      { description: 'Priority API Rate Limit Upgrade', qty: 1, unitPrice: 120.00, total: 120.00 }
    ]
  }
];

// ---------------- PAYMENTS ----------------
export const ALL_PAYMENTS: CustomerPaymentItem[] = [
  {
    id: 'PAY-2026-4401',
    customerId: 'CUST-501',
    customerName: 'Acme Technologies Inc.',
    paymentDate: '2026-10-15',
    amount: 15840.00,
    invoiceId: 'INV-2026-0982',
    method: 'Credit Card',
    referenceNo: 'AUTH_CH_982419_VISA',
    status: 'Settled',
    notes: 'Auto-charged on primary corporate Visa card ending 4242'
  },
  {
    id: 'PAY-2026-4310',
    customerId: 'CUST-501',
    customerName: 'Acme Technologies Inc.',
    paymentDate: '2026-10-01',
    amount: 495.00,
    invoiceId: 'INV-2026-1044',
    method: 'Credit Card',
    referenceNo: 'AUTH_CH_981120_VISA',
    status: 'Settled',
    notes: 'Monthly recurring add-on collection'
  },
  {
    id: 'PAY-2026-4299',
    customerId: 'CUST-502',
    customerName: 'Zenith Retail Group',
    paymentDate: '2026-10-20',
    amount: 550.00,
    invoiceId: 'INV-2026-0899',
    method: 'Bank Transfer',
    referenceNo: 'ACH-ZENITH-89123',
    status: 'Settled',
    notes: 'Direct ACH corporate disbursement'
  }
];

// ---------------- AGGREGATED METRICS & QA AUDIT SERVICES ----------------

export function getCustomerScopedData(customerId: string) {
  const customer = CUSTOMERS.find((c) => c.id === customerId) || CUSTOMERS[0];
  const subscriptions = ALL_SUBSCRIPTIONS.filter((s) => s.customerId === customerId);
  const quotations = ALL_QUOTATIONS.filter((q) => q.customerId === customerId);
  const salesOrders = ALL_SALES_ORDERS.filter((so) => so.customerId === customerId);
  const invoices = ALL_INVOICES.filter((i) => i.customerId === customerId);
  const payments = ALL_PAYMENTS.filter((p) => p.customerId === customerId);

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalPaid = payments.reduce((acc, pay) => acc + pay.amount, 0);
  const outstandingBalance = invoices.reduce((acc, inv) => acc + inv.balance, 0);

  return {
    customer,
    subscriptions,
    quotations,
    salesOrders,
    invoices,
    payments,
    stats: {
      totalInvoiced,
      totalPaid,
      outstandingBalance,
      activeSubsCount: subscriptions.filter((s) => s.status === 'Active').length
    }
  };
}

export function getOverallManagementMetrics() {
  const activeSubs = ALL_SUBSCRIPTIONS.filter((s) => s.status === 'Active');
  
  // Normalized MRR calculation: Annual / 12, Monthly * 1, Weekly * (52/12)
  const normalizedMRR = ALL_SUBSCRIPTIONS.reduce((acc, s) => {
    if (s.status !== 'Active') return acc;
    if (s.billingInterval === 'Annual') return acc + (s.amount / 12);
    if (s.billingInterval === 'Monthly') return acc + s.amount;
    if (s.billingInterval === 'Weekly') return acc + (s.amount * 52 / 12);
    return acc;
  }, 0);

  const totalInvoiced = ALL_INVOICES.reduce((acc, i) => i.status !== 'Cancelled' ? acc + i.total : acc, 0);
  const cashCollected = ALL_PAYMENTS.reduce((acc, p) => p.status === 'Settled' ? acc + p.amount : acc, 0);
  const outstandingAmount = ALL_INVOICES.reduce((acc, i) => i.status !== 'Cancelled' ? acc + i.balance : acc, 0);
  const overdueAmount = ALL_INVOICES.reduce((acc, i) => i.status === 'Overdue' ? acc + i.balance : acc, 0);

  return {
    mrr: normalizedMRR,
    activeSubscriptionsCount: activeSubs.length,
    totalInvoiced,
    cashCollected,
    outstandingAmount,
    overdueAmount,
    upcomingRenewalsCount: 34,
    upcomingRenewalsValue: 48200.00,
    churnRate: 1.42
  };
}
