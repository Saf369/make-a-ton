'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import {
  CreditCard,
  Download,
  ExternalLink,
  Shield,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';

export default function CustomerPortalPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payment' | 'usage'>('overview');

  return (
    <DashboardLayout title="Customer Portal Preview" moduleName="MANAGEMENT MODULE">
      <div className="space-y-6">
        {/* Banner / Header */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              AC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Acme Technologies Inc.</h2>
                <Badge status="Active" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer ID: CUST-501 &bull; Account Rep: Elena Rostova &bull; Member since March 2024
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
              Switch Customer View
            </button>
            <button className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              Simulate Live Portal
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex gap-6 text-xs font-medium text-slate-500">
          {[
            { id: 'overview', label: 'Subscription Plan' },
            { id: 'invoices', label: 'Invoices & Receipts' },
            { id: 'payment', label: 'Payment Methods' },
            { id: 'usage', label: 'Usage & Quotas' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 relative transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Plan Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Active Plan Card */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      CURRENT ACTIVE PLAN
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">Enterprise Cloud Plus</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Annual recurring license billed every 12 months.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">₹14,40,000.00</p>
                    <p className="text-xs text-slate-400">per year (excl. GST)</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Next Renewal Date</span>
                    <p className="font-semibold text-slate-800 mt-1">October 15, 2027</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Auto-Renew Status</span>
                    <p className="font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Included Seats</span>
                    <p className="font-semibold text-slate-800 mt-1">Unlimited Seats</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                      Upgrade / Change Plan
                    </button>
                    <button className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200">
                      Add-on Licenses
                    </button>
                  </div>
                  <button className="text-xs text-rose-600 hover:text-rose-700 font-medium">
                    Cancel Subscription
                  </button>
                </div>
              </div>

              {/* Active Add-ons Card */}
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Subscribed Add-ons</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                    <div>
                      <p className="font-medium text-slate-900">Dedicated Dedicated IP (2 instances)</p>
                      <p className="text-slate-400">High deliverability static outbound IPs</p>
                    </div>
                    <span className="font-semibold text-slate-800">₹4,000.00 / mo</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 text-xs">
                    <div>
                      <p className="font-medium text-slate-900">24/7 Dedicated Concierge Support</p>
                      <p className="text-slate-400">15-minute guaranteed SLA response time</p>
                    </div>
                    <span className="font-semibold text-slate-800">₹25,000.00 / mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Payment Details & Quick Invoices */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Default Payment Method
                </h4>
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                      VISA
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">&bull;&bull;&bull;&bull; 4242</p>
                      <p className="text-[11px] text-slate-500">Expires 09/2029</p>
                    </div>
                  </div>
                  <Badge status="Active" />
                </div>
                <button className="w-full mt-3 py-1.5 text-xs font-medium text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50">
                  Update Payment Method
                </button>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Billing Contact
                </h4>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <p className="font-semibold text-slate-900">Robert Vance</p>
                  <p>billing@acmetech.com</p>
                  <p>1200 Market Street, Suite 400</p>
                  <p>San Francisco, CA 94103</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Invoices */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Billing History & Tax Receipts</h3>
              <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                Download All (ZIP)
              </button>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Invoice #</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'INV-2026-0982', date: 'Oct 15, 2026', amount: '₹16,99,200.00', status: 'Paid' },
                  { id: 'INV-2025-0540', date: 'Oct 15, 2025', amount: '₹16,99,200.00', status: 'Paid' },
                  { id: 'INV-2024-0112', date: 'Oct 15, 2024', amount: '₹14,16,000.00', status: 'Paid' }
                ].map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">{row.id}</td>
                    <td className="py-3 px-4 text-slate-600">{row.date}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{row.amount}</td>
                    <td className="py-3 px-4"><Badge status={row.status} /></td>
                    <td className="py-3 px-4 text-right">
                      <button className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium">
                        <Download className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Payment */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs max-w-xl space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Manage Payment Cards & Bank Accounts</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                  <div>
                    <p className="text-xs font-semibold text-slate-900">Visa ending in 4242 (Default)</p>
                    <p className="text-[11px] text-slate-500">Expires 09/2029</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">Default</span>
              </div>
            </div>
            <button className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
              + Add New Payment Method
            </button>
          </div>
        )}

        {/* Tab Content: Usage */}
        {activeTab === 'usage' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase">API Monthly Quota</h4>
              <p className="text-2xl font-bold text-slate-900 mt-2">642,800 / 1,000,000 calls</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '64.2%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Resets on Nov 1, 2026</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h4 className="text-xs font-bold text-slate-500 uppercase">Storage Meter</h4>
              <p className="text-2xl font-bold text-slate-900 mt-2">18.4 GB / 100 GB</p>
              <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18.4%' }} />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">18% utilized</p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
