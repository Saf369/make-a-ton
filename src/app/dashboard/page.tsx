'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  RECENT_INVOICES
} from '@/data/mockData';
import {
  Bell,
  TrendingUp,
  CreditCard,
  ArrowRight,
  ShieldAlert,
  Wallet,
  PieChart as PieIcon,
  Clock,
  Layers,
  CheckCircle,
  FileText,
  DollarSign,
  Repeat,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  UserCheck,
  BarChart2
} from 'lucide-react';

export default function DashboardPage() {
  const [chartPeriod, setChartPeriod] = useState<'2026' | '2025'>('2026');
  const [viewMetric, setViewMetric] = useState<'mrr' | 'subs'>('mrr');

  return (
    <DashboardLayout title="Analytics & Executive Dashboard" moduleName="MANAGEMENT MODULE">
      <div className="space-y-6">
        {/* Executive Subtitle & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">Brightloop Subscription Operations Hub</h2>
            <p className="text-xs text-slate-500">Live operational overview across subscriptions, billing, and cash reconciliation</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/customer-portal"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Customer Portal</span>
            </Link>
            <Link
              href="/reports"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Financial Reports</span>
            </Link>
          </div>
        </div>

        {/* Primary Required Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Monthly Recurring Revenue (MRR)"
            value="$243,000"
            change="+8.3%"
            trend="up"
            period="vs last month"
            iconName="DollarSign"
          />
          <StatCard
            title="Active Subscriptions"
            value="4,820"
            change="+14.2%"
            trend="up"
            period="paying organizations"
            iconName="Repeat"
          />
          <StatCard
            title="Total Invoiced (Gross)"
            value="$345,600"
            change="+$34,200"
            trend="up"
            period="cumulative billing runs"
            iconName="TrendingUp"
          />
          <StatCard
            title="Cash Collected"
            value="$278,900"
            change="80.7%"
            trend="up"
            period="settled payments rate"
            iconName="Wallet"
          />
        </div>

        {/* Secondary Financial Health Metrics (Outstanding, Overdue, Upcoming Renewals) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Outstanding Amount</span>
              <p className="text-xl font-bold text-slate-900 mt-1">$66,700.00</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Open & confirmed unpaid invoices</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider">Overdue Invoices</span>
              <p className="text-xl font-bold text-rose-600 mt-1">$18,200.00</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Past due net balance (5 accounts)</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">Upcoming Renewals</span>
              <p className="text-xl font-bold text-indigo-600 mt-1">34 Plans ($48.2k)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Due in the next 7 billing days</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Charts Section: Revenue Trajectory & Subscription Growth */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual: Revenue & MRR or Subscription Growth Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {viewMetric === 'mrr' ? 'Revenue & MRR Trajectory' : 'Subscription Growth & Cohort Trajectory'}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewMetric === 'mrr' ? 'Monthly subscription collections and run-rate forecast' : 'Active subscriber count growth by month'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                  <button
                    onClick={() => setViewMetric('mrr')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      viewMetric === 'mrr' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Revenue ($)
                  </button>
                  <button
                    onClick={() => setViewMetric('subs')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      viewMetric === 'subs' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Subscriptions
                  </button>
                </div>
                <select
                  value={chartPeriod}
                  onChange={(e) => setChartPeriod(e.target.value as any)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none"
                >
                  <option value="2026">Current Year (2026)</option>
                  <option value="2025">Previous Year (2025)</option>
                </select>
              </div>
            </div>

            {/* Custom SVG Line / Area Chart */}
            <div className="py-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
                <span>{viewMetric === 'mrr' ? 'Peak Oct: $243,000' : 'Peak Oct: 4,820 Active'}</span>
                <span>{viewMetric === 'mrr' ? 'Avg Monthly Run-rate: $208,500' : 'Monthly Net Addition: +340 Subs'}</span>
              </div>
              <div className="h-52 w-full relative">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="violetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

                  {/* Shaded Area */}
                  <path
                    d={
                      viewMetric === 'mrr'
                        ? 'M 10 135 C 70 125, 130 115, 190 100 C 250 85, 320 65, 380 45 L 490 30 L 490 150 L 10 150 Z'
                        : 'M 10 140 C 70 130, 130 118, 190 95 C 260 75, 330 55, 400 40 L 490 25 L 490 150 L 10 150 Z'
                    }
                    fill={viewMetric === 'mrr' ? 'url(#violetGradient)' : 'url(#emeraldGradient)'}
                  />

                  {/* Primary Curve */}
                  <path
                    d={
                      viewMetric === 'mrr'
                        ? 'M 10 135 C 70 125, 130 115, 190 100 C 250 85, 320 65, 380 45 L 490 30'
                        : 'M 10 140 C 70 130, 130 118, 190 95 C 260 75, 330 55, 400 40 L 490 25'
                    }
                    fill="none"
                    stroke={viewMetric === 'mrr' ? '#4F46E5' : '#059669'}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Highlight points */}
                  <circle cx="190" cy={viewMetric === 'mrr' ? 100 : 95} r="4.5" fill={viewMetric === 'mrr' ? '#4F46E5' : '#059669'} stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="380" cy={viewMetric === 'mrr' ? 45 : 40} r="4.5" fill={viewMetric === 'mrr' ? '#4F46E5' : '#059669'} stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="490" cy={viewMetric === 'mrr' ? 30 : 25} r="5" fill={viewMetric === 'mrr' ? '#4F46E5' : '#059669'} stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-2">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span className="font-semibold text-indigo-600">
                  {viewMetric === 'mrr' ? 'Oct ($243k)' : 'Oct (4.8k subs)'}
                </span>
              </div>
            </div>

            {/* Quick stats footer */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400">Total Billed YTD</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">$345,600</p>
              </div>
              <div>
                <p className="text-slate-400">Net Growth MoM</p>
                <p className="font-semibold text-emerald-600 text-sm mt-0.5">+14.2%</p>
              </div>
              <div>
                <p className="text-slate-400">Cohort Renewal Rate</p>
                <p className="font-semibold text-indigo-600 text-sm mt-0.5">97.8%</p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Alerts & Live Settlement Status */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* New Orders Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">12 New Orders</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orders worth <span className="font-semibold text-slate-700">$18,500</span> received this cycle.
                  </p>
                  <Link
                    href="/sales-orders"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-2.5"
                  >
                    <span>View Sales Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stock / License Quota Alert */}
            <div className="bg-[#4338CA] rounded-xl text-white p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-indigo-200 uppercase tracking-wide">License Quota Alert</p>
                  <h4 className="text-2xl font-extrabold text-white mt-1">5</h4>
                  <p className="text-xs text-indigo-100 mt-0.5">Accounts reached 90% seat limit</p>
                  <Link
                    href="/subscriptions"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 hover:text-white mt-2.5"
                  >
                    <span>Inspect Accounts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Settled Bank Balance Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-600">Settled Account Balance</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  80.7% Collected
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">$278,900.00</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Reconciled in bank and payment entries</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '80.7%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Invoices & Plan Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Invoices Table */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recent Transactions & Invoices</h3>
                <p className="text-xs text-slate-500">Live feed from billing runs and payments</p>
              </div>
              <Link
                href="/sales-invoices"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500">
                    <th className="py-2.5 px-4 font-medium">Invoice</th>
                    <th className="py-2.5 px-4 font-medium">Customer</th>
                    <th className="py-2.5 px-4 font-medium">Amount</th>
                    <th className="py-2.5 px-4 font-medium">Status</th>
                    <th className="py-2.5 px-4 font-medium">Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RECENT_INVOICES.map((inv) => (
                    <tr key={inv.invoiceNumber} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-700">{inv.customer}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{inv.amount}</td>
                      <td className="py-3 px-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-slate-500">{inv.method}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue by Tier Distribution */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                <span>MRR by Plan Tier</span>
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Growth Pro Tier</span>
                    <span className="font-bold text-slate-900">$110,279 (45%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Enterprise Cloud Plus</span>
                    <span className="font-bold text-slate-900">$92,400 (38%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '38%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-medium text-slate-700 mb-1">
                    <span>Starter Team Edition</span>
                    <span className="font-bold text-slate-900">$40,321 (17%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: '17%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-4 shadow-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
                <CheckCircle className="w-4 h-4 text-indigo-600" />
                <span>Audited Metrics Engine</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                All numbers are normalized and aggregated from active transactional records in accordance with the Brightloop spec.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
