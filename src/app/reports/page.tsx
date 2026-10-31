'use client';

import React, { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Percent,
  DollarSign,
  Search,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
  Repeat,
  CreditCard,
  Building2
} from 'lucide-react';

type ReportType =
  | 'receivable'
  | 'overdue'
  | 'sales-register'
  | 'subscriptions'
  | 'revenue'
  | 'payments';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('receivable');
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Accounts Receivable Data
  const receivableData = [
    { customer: 'Acme Technologies Inc.', invoiced: 16335.00, paid: 16335.00, balance: 0.00, current: 0.00, d30: 0.00, d60Plus: 0.00, status: 'Settled' },
    { customer: 'Zenith Retail Group', invoiced: 682.00, paid: 550.00, balance: 132.00, current: 132.00, d30: 0.00, d60Plus: 0.00, status: 'Current' },
    { customer: 'Nova Dynamics Ltd', invoiced: 238.80, paid: 0.00, balance: 238.80, current: 0.00, d30: 238.80, d60Plus: 0.00, status: 'Overdue' },
    { customer: 'Helios Media Corp', invoiced: 4200.00, paid: 2100.00, balance: 2100.00, current: 2100.00, d30: 0.00, d60Plus: 0.00, status: 'Partially Paid' },
    { customer: 'Vanguard Logistics', invoiced: 18500.00, paid: 18500.00, balance: 0.00, current: 0.00, d30: 0.00, d60Plus: 0.00, status: 'Settled' },
    { customer: 'Quantum Biotech', invoiced: 9400.00, paid: 4700.00, balance: 4700.00, current: 0.00, d30: 4700.00, d60Plus: 0.00, status: 'Overdue' },
    { customer: 'CyberNet Systems', invoiced: 1200.00, paid: 1200.00, balance: 0.00, current: 0.00, d30: 0.00, d60Plus: 0.00, status: 'Settled' }
  ];

  // 2. Overdue Invoices Data
  const overdueData = [
    { invoiceId: 'INV-2026-0785', customer: 'Nova Dynamics Ltd', issueDate: '2026-09-10', dueDate: '2026-10-10', daysOverdue: 21, amount: 238.80, contact: 'Devon Patel', status: 'Overdue' },
    { invoiceId: 'INV-2026-0612', customer: 'Quantum Biotech', issueDate: '2026-08-25', dueDate: '2026-09-25', daysOverdue: 36, amount: 4700.00, contact: 'Dr. Sarah Lin', status: 'Overdue' },
    { invoiceId: 'INV-2026-0590', customer: 'Apex Cloud Systems', issueDate: '2026-08-15', dueDate: '2026-09-15', daysOverdue: 46, amount: 1320.00, contact: 'Tom Jenkins', status: 'Overdue' },
    { invoiceId: 'INV-2026-0511', customer: 'OmniTrade Global', issueDate: '2026-07-28', dueDate: '2026-08-28', daysOverdue: 64, amount: 8900.00, contact: 'Rachel Adams', status: 'Escalated' },
    { invoiceId: 'INV-2026-0480', customer: 'Solaria Energy', issueDate: '2026-07-15', dueDate: '2026-08-15', daysOverdue: 77, amount: 3041.20, contact: 'Carlos Cruz', status: 'Escalated' }
  ];

  // 3. Sales Register Data
  const salesRegisterData = [
    { invoiceId: 'INV-2026-0982', date: '2026-10-15', customer: 'Acme Technologies Inc.', taxable: 14400.00, discount: 0.00, tax: 1440.00, gross: 15840.00, status: 'Paid' },
    { invoiceId: 'INV-2026-1044', date: '2026-10-01', customer: 'Acme Technologies Inc.', taxable: 450.00, discount: 0.00, tax: 45.00, gross: 495.00, status: 'Paid' },
    { invoiceId: 'INV-2026-0899', date: '2026-10-20', customer: 'Zenith Retail Group', taxable: 540.00, discount: 40.00, tax: 50.00, gross: 550.00, status: 'Paid' },
    { invoiceId: 'INV-2026-1090', date: '2026-10-25', customer: 'Zenith Retail Group', taxable: 120.00, discount: 0.00, tax: 12.00, gross: 132.00, status: 'Confirmed' },
    { invoiceId: 'INV-2026-0785', date: '2026-09-10', customer: 'Nova Dynamics Ltd', taxable: 199.00, discount: 0.00, tax: 39.80, gross: 238.80, status: 'Overdue' },
    { invoiceId: 'INV-2026-0955', date: '2026-10-12', customer: 'Helios Media Corp', taxable: 3800.00, discount: 0.00, tax: 400.00, gross: 4200.00, status: 'Partially Paid' },
    { invoiceId: 'INV-2026-0910', date: '2026-10-05', customer: 'Vanguard Logistics', taxable: 16800.00, discount: 0.00, tax: 1700.00, gross: 18500.00, status: 'Paid' }
  ];

  // 4. Subscription Report Data
  const subscriptionReportData = [
    { subId: 'SUB-10024', customer: 'Acme Technologies Inc.', plan: 'Enterprise Cloud Plus', interval: 'Annual', mrr: 1200.00, start: '2025-10-15', renewal: '2026-10-15', status: 'Active' },
    { subId: 'SUB-10025', customer: 'Acme Technologies Inc.', plan: 'AI Intelligence Suite', interval: 'Monthly', mrr: 450.00, start: '2026-04-01', renewal: '2026-11-01', status: 'Active' },
    { subId: 'SUB-10023', customer: 'Zenith Retail Group', plan: 'Growth Pro Tier', interval: 'Monthly', mrr: 540.00, start: '2025-01-20', renewal: '2026-11-20', status: 'Active' },
    { subId: 'SUB-10022', customer: 'Nova Dynamics Ltd', plan: 'Starter Team Edition', interval: 'Monthly', mrr: 199.00, start: '2026-07-10', renewal: '2026-11-10', status: 'Paused' },
    { subId: 'SUB-10021', customer: 'Helios Media Corp', plan: 'Growth Pro Tier', interval: 'Monthly', mrr: 540.00, start: '2025-06-15', renewal: '2026-11-15', status: 'Active' },
    { subId: 'SUB-10020', customer: 'Vanguard Logistics', plan: 'Enterprise Cloud Plus', interval: 'Annual', mrr: 1541.67, start: '2025-09-01', renewal: '2026-09-01', status: 'Active' },
    { subId: 'SUB-10019', customer: 'Quantum Biotech', plan: 'Enterprise Cloud Plus', interval: 'Annual', mrr: 1200.00, start: '2025-08-01', renewal: '2026-08-01', status: 'Active' }
  ];

  // 5. Revenue Report (MRR Waterfall)
  const revenueReportData = [
    { period: 'October 2026', starting: 224500, newMrr: 24800, expansion: 9200, contraction: 3100, churn: 12400, ending: 243000, nrr: '114.2%', growth: '+8.2%' },
    { period: 'September 2026', starting: 208900, newMrr: 22100, expansion: 7400, contraction: 2800, churn: 11100, ending: 224500, nrr: '112.8%', growth: '+7.4%' },
    { period: 'August 2026', starting: 195400, newMrr: 20400, expansion: 6800, contraction: 1900, churn: 11800, ending: 208900, nrr: '113.1%', growth: '+6.9%' },
    { period: 'July 2026', starting: 182000, newMrr: 19200, expansion: 5900, contraction: 1700, churn: 10000, ending: 195400, nrr: '111.9%', growth: '+7.3%' }
  ];

  // 6. Payment Report Data
  const paymentReportData = [
    { payId: 'PAY-2026-4401', date: '2026-10-15', customer: 'Acme Technologies Inc.', invoice: 'INV-2026-0982', method: 'Credit Card', amount: 15840.00, status: 'Settled', ref: 'AUTH_CH_982419_VISA' },
    { payId: 'PAY-2026-4310', date: '2026-10-01', customer: 'Acme Technologies Inc.', invoice: 'INV-2026-1044', method: 'Credit Card', amount: 495.00, status: 'Settled', ref: 'AUTH_CH_981120_VISA' },
    { payId: 'PAY-2026-4299', date: '2026-10-20', customer: 'Zenith Retail Group', invoice: 'INV-2026-0899', method: 'Bank Transfer', amount: 550.00, status: 'Settled', ref: 'ACH-ZENITH-89123' },
    { payId: 'PAY-2026-4215', date: '2026-10-12', customer: 'Helios Media Corp', invoice: 'INV-2026-0955', method: 'UPI', amount: 2100.00, status: 'Settled', ref: 'UPI/2948194819' },
    { payId: 'PAY-2026-4190', date: '2026-10-05', customer: 'Vanguard Logistics', invoice: 'INV-2026-0910', method: 'Bank Transfer', amount: 18500.00, status: 'Settled', ref: 'WIRE-VANGUARD-001' }
  ];

  // Dynamic Filtering based on active report
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (activeReport === 'receivable') {
      return receivableData.filter((r) => {
        const matchQ = !q || r.customer.toLowerCase().includes(q);
        const matchS = statusFilter === 'All' || r.status === statusFilter;
        return matchQ && matchS;
      });
    }
    if (activeReport === 'overdue') {
      return overdueData.filter((o) => {
        const matchQ = !q || o.customer.toLowerCase().includes(q) || o.invoiceId.toLowerCase().includes(q);
        const matchS = statusFilter === 'All' || o.status === statusFilter;
        return matchQ && matchS;
      });
    }
    if (activeReport === 'sales-register') {
      return salesRegisterData.filter((s) => {
        const matchQ = !q || s.customer.toLowerCase().includes(q) || s.invoiceId.toLowerCase().includes(q);
        const matchS = statusFilter === 'All' || s.status === statusFilter;
        return matchQ && matchS;
      });
    }
    if (activeReport === 'subscriptions') {
      return subscriptionReportData.filter((sub) => {
        const matchQ = !q || sub.customer.toLowerCase().includes(q) || sub.plan.toLowerCase().includes(q) || sub.subId.toLowerCase().includes(q);
        const matchS = statusFilter === 'All' || sub.status === statusFilter;
        return matchQ && matchS;
      });
    }
    if (activeReport === 'revenue') {
      return revenueReportData.filter((rev) => {
        return !q || rev.period.toLowerCase().includes(q);
      });
    }
    if (activeReport === 'payments') {
      return paymentReportData.filter((p) => {
        const matchQ = !q || p.customer.toLowerCase().includes(q) || p.payId.toLowerCase().includes(q) || p.invoice.toLowerCase().includes(q);
        const matchS = statusFilter === 'All' || p.status === statusFilter;
        return matchQ && matchS;
      });
    }
    return [];
  }, [activeReport, searchQuery, statusFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (filteredData.length === 0) return;
    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map((row) => Object.values(row).join(',')).join('\n');
    csvContent += headers + '\n' + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Brightloop_${activeReport}_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Financial & Operational Reports" moduleName="MANAGEMENT MODULE">
      <div className="space-y-6">
        {/* Executive Report KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Annual Run Rate (ARR)"
            value="$2,916,000"
            change="+18.4%"
            trend="up"
            period="vs last year"
            iconName="DollarSign"
          />
          <StatCard
            title="Accounts Receivable Balance"
            value="$66,700.00"
            change="5 accounts"
            trend="neutral"
            period="open credit ledger"
            iconName="TrendingUp"
          />
          <StatCard
            title="Total Overdue Amount"
            value="$18,200.00"
            change="+1.2%"
            trend="down"
            period="30+ days overdue"
            iconName="Percent"
          />
          <StatCard
            title="Net Revenue Retention (NRR)"
            value="114.2%"
            change="+2.1%"
            trend="up"
            period="benchmark: >110%"
            iconName="Repeat"
          />
        </div>

        {/* Report Explorer Navigation (All 6 Required Reports) */}
        <div className="border-b border-slate-200 flex gap-4 text-xs font-medium text-slate-500 overflow-x-auto pb-px">
          {[
            { id: 'receivable', label: 'Accounts Receivable', icon: Building2 },
            { id: 'overdue', label: 'Overdue Invoices', icon: AlertTriangle },
            { id: 'sales-register', label: 'Sales Register', icon: Receipt },
            { id: 'subscriptions', label: 'Subscription Report', icon: Repeat },
            { id: 'revenue', label: 'Revenue Report (MRR)', icon: BarChart3 },
            { id: 'payments', label: 'Payment Report', icon: CreditCard }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveReport(tab.id as any);
                  setCurrentPage(1);
                  setSearchQuery('');
                  setStatusFilter('All');
                }}
                className={`pb-3 relative transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                  activeReport === tab.id
                    ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                    : 'hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search report records..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none w-56"
              />
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
              >
                <option>Last 30 Days</option>
                <option>This Quarter (Q4 2026)</option>
                <option>Year to Date (2026)</option>
                <option>All Time</option>
              </select>
            </div>

            {/* Status Filter */}
            {activeReport !== 'revenue' && (
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Settled">Settled / Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
            )}
          </div>

          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-2xs"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Print / PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Dynamic Report Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            {/* 1. Accounts Receivable */}
            {activeReport === 'receivable' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Customer Name</th>
                    <th className="py-2.5 px-4">Total Invoiced</th>
                    <th className="py-2.5 px-4 text-emerald-600">Total Paid</th>
                    <th className="py-2.5 px-4 font-bold text-slate-800">Balance Due</th>
                    <th className="py-2.5 px-4">Current (0-30d)</th>
                    <th className="py-2.5 px-4">31-60 Days</th>
                    <th className="py-2.5 px-4 text-rose-600">60+ Days</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.customer}</td>
                      <td className="py-3 px-4 text-slate-600">${row.invoiced.toFixed(2)}</td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">${row.paid.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${row.balance.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-600">${row.current.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-600">${row.d30.toFixed(2)}</td>
                      <td className="py-3 px-4 text-rose-600 font-medium">${row.d60Plus.toFixed(2)}</td>
                      <td className="py-3 px-4"><Badge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. Overdue Invoices */}
            {activeReport === 'overdue' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Issue Date</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4 text-rose-600 font-bold">Days Overdue</th>
                    <th className="py-2.5 px-4 font-bold">Overdue Balance</th>
                    <th className="py-2.5 px-4">Contact</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{row.invoiceId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.customer}</td>
                      <td className="py-3 px-4 text-slate-500">{row.issueDate}</td>
                      <td className="py-3 px-4 text-slate-500">{row.dueDate}</td>
                      <td className="py-3 px-4 text-rose-600 font-bold">{row.daysOverdue} days</td>
                      <td className="py-3 px-4 font-black text-slate-900">${row.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-600">{row.contact}</td>
                      <td className="py-3 px-4"><Badge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. Sales Register */}
            {activeReport === 'sales-register' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Taxable Value</th>
                    <th className="py-2.5 px-4 text-slate-400">Discount</th>
                    <th className="py-2.5 px-4">Tax Applied</th>
                    <th className="py-2.5 px-4 font-bold">Invoice Gross Total</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{row.invoiceId}</td>
                      <td className="py-3 px-4 text-slate-500">{row.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.customer}</td>
                      <td className="py-3 px-4 text-slate-700">${row.taxable.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-400">${row.discount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-700">${row.tax.toFixed(2)}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">${row.gross.toFixed(2)}</td>
                      <td className="py-3 px-4"><Badge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. Subscription Report */}
            {activeReport === 'subscriptions' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Subscription #</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Plan Name</th>
                    <th className="py-2.5 px-4">Interval</th>
                    <th className="py-2.5 px-4 font-semibold text-indigo-600">MRR Normalized</th>
                    <th className="py-2.5 px-4">Start Date</th>
                    <th className="py-2.5 px-4">Next Renewal</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{row.subId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.customer}</td>
                      <td className="py-3 px-4 text-slate-800">{row.plan}</td>
                      <td className="py-3 px-4 text-slate-500">{row.interval}</td>
                      <td className="py-3 px-4 font-bold text-indigo-600">${row.mrr.toFixed(2)}</td>
                      <td className="py-3 px-4 text-slate-500">{row.start}</td>
                      <td className="py-3 px-4 text-slate-500">{row.renewal}</td>
                      <td className="py-3 px-4"><Badge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. Revenue Report (MRR Waterfall) */}
            {activeReport === 'revenue' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Period</th>
                    <th className="py-2.5 px-4">Starting MRR</th>
                    <th className="py-2.5 px-4 text-emerald-600">New MRR</th>
                    <th className="py-2.5 px-4 text-indigo-600">Expansion</th>
                    <th className="py-2.5 px-4 text-amber-600">Contraction</th>
                    <th className="py-2.5 px-4 text-rose-600">Churn</th>
                    <th className="py-2.5 px-4 font-bold text-slate-900">Ending MRR</th>
                    <th className="py-2.5 px-4">NRR</th>
                    <th className="py-2.5 px-4 text-right">Net Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.period}</td>
                      <td className="py-3 px-4 text-slate-600">${row.starting.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">+${row.newMrr.toLocaleString()}</td>
                      <td className="py-3 px-4 text-indigo-600 font-medium">+${row.expansion.toLocaleString()}</td>
                      <td className="py-3 px-4 text-amber-600 font-medium">-${row.contraction.toLocaleString()}</td>
                      <td className="py-3 px-4 text-rose-600 font-medium">-${row.churn.toLocaleString()}</td>
                      <td className="py-3 px-4 font-black text-slate-900">${row.ending.toLocaleString()}</td>
                      <td className="py-3 px-4 text-indigo-600 font-semibold">{row.nrr}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">{row.growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 6. Payment Report */}
            {activeReport === 'payments' && (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Payment Ref #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Allocated Invoice</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4 font-bold text-emerald-600">Settled Amount</th>
                    <th className="py-2.5 px-4">Reference No</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{row.payId}</td>
                      <td className="py-3 px-4 text-slate-500">{row.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{row.customer}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600">{row.invoice}</td>
                      <td className="py-3 px-4 text-slate-700">{row.method}</td>
                      <td className="py-3 px-4 font-black text-emerald-600">${row.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 font-mono text-slate-400">{row.ref}</td>
                      <td className="py-3 px-4"><Badge status={row.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredData.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching records found for the applied filters.
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of{' '}
              <span className="font-semibold text-slate-700">{filteredData.length}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 inline-flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <span className="text-xs font-medium text-slate-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages || filteredData.length === 0}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 inline-flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
