'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  DASHBOARD_METRICS,
  RECENT_SUBSCRIPTIONS,
  RECENT_INVOICES,
  RECENT_ACTIVITIES
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
  FileText
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <DashboardLayout title="Dashboard Overview" moduleName="MANAGEMENT MODULE">
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DASHBOARD_METRICS.map((metric) => (
            <StatCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              trend={metric.trend}
              period={metric.period}
              iconName={metric.iconName}
            />
          ))}
        </div>

        {/* Mid Row: Business Chart & Floating Callouts matching screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual: Business Revenue & MRR Growth */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Revenue & MRR Trajectory</h3>
                <p className="text-xs text-slate-500">Monthly subscription collections and forecast</p>
              </div>
              <div className="flex items-center gap-2">
                <select className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none">
                  <option>Current Year (2026)</option>
                  <option>Previous Year (2025)</option>
                </select>
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="py-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-2">
                <span>Peak May: $243,000</span>
                <span>Avg Run-rate: $198,500</span>
              </div>
              <div className="h-48 w-full relative">
                <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="violetGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#6366F1" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#f1f5f9" strokeDasharray="4 4" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeDasharray="4 4" />

                  {/* Shaded Area */}
                  <path
                    d="M 10 130 C 90 120, 150 140, 220 95 C 290 50, 360 85, 430 40 L 490 35 L 490 150 L 10 150 Z"
                    fill="url(#violetGradient)"
                  />

                  {/* Primary Curve */}
                  <path
                    d="M 10 130 C 90 120, 150 140, 220 95 C 290 50, 360 85, 430 40 L 490 35"
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Highlight point */}
                  <circle cx="220" cy="95" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.5" />
                  <circle cx="430" cy="40" r="4.5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2.5" />
                </svg>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-1">
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span className="font-semibold text-indigo-600">May ($243k)</span>
                <span>Jun</span>
                <span>Jul</span>
                <span>Aug</span>
                <span>Sep</span>
                <span>Oct</span>
              </div>
            </div>

            {/* Quick stats footer */}
            <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <p className="text-slate-400">Total Billed</p>
                <p className="font-semibold text-slate-800 text-sm mt-0.5">$1.84M</p>
              </div>
              <div>
                <p className="text-slate-400">Avg Monthly Growth</p>
                <p className="font-semibold text-emerald-600 text-sm mt-0.5">+12.4%</p>
              </div>
              <div>
                <p className="text-slate-400">Renewal Rate</p>
                <p className="font-semibold text-indigo-600 text-sm mt-0.5">97.8%</p>
              </div>
            </div>
          </div>

          {/* Right Column: Key Alerts & Live Bank Balance (matching reference widgets) */}
          <div className="space-y-4 flex flex-col justify-between">
            {/* 12 New Orders Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-slate-900">12 New Orders</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orders worth <span className="font-semibold text-slate-700">$18,500</span> received today.
                  </p>
                  <Link
                    href="/sales-orders"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mt-2.5"
                  >
                    <span>View Orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Stock / Seats Limit Alert */}
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
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Settlement Balance Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium text-slate-600">Settled Account Balance</span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  72% Collected
                </span>
              </div>
              <h4 className="text-xl font-bold text-slate-900">$98,500.00</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Available for payout in Stripe Connect</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '72%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Invoices & Category Breakdown */}
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

          {/* Revenue by Category & Recent Activities */}
          <div className="space-y-4">
            {/* Category Split */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-indigo-600" />
                <span>Sales by Category</span>
              </h3>
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Software Platforms</span>
                    <span className="font-semibold text-slate-800">45% ($109,350)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Developer APIs & Usage</span>
                    <span className="font-semibold text-slate-800">35% ($85,050)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '35%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600">Enterprise Add-ons</span>
                    <span className="font-semibold text-slate-800">20% ($48,600)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Activity Stream */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Recent System Activities</span>
              </h3>
              <div className="space-y-3">
                {RECENT_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex items-start gap-2.5 text-xs">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800">{act.title}</p>
                      <p className="text-slate-400 text-[11px]">{act.desc}</p>
                      <span className="text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
