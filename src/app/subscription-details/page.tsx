'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldCheck,
  Building2,
  Zap
} from 'lucide-react';

export default function SubscriptionDetailsPage() {
  const [status, setStatus] = useState('Active');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleAction = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <DashboardLayout title="Subscription Details" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6 max-w-6xl">
        {/* Back navigation */}
        <div>
          <Link
            href="/subscriptions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Subscriptions</span>
          </Link>
        </div>

        {/* Notice alert */}
        {actionNotice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">SUB-10024</h2>
                <Badge status={status} />
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-md">
                  Annual Contract
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Customer:{' '}
                <Link href="/customers" className="font-semibold text-indigo-600 hover:underline">
                  Acme Technologies Inc.
                </Link>{' '}
                &bull; Started October 15, 2026 &bull; Billing Cycle: Year 1
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setStatus(status === 'Active' ? 'Paused' : 'Active');
                handleAction(status === 'Active' ? 'Subscription successfully paused.' : 'Subscription resumed.');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              {status === 'Active' ? <Pause className="w-3.5 h-3.5 text-amber-500" /> : <Play className="w-3.5 h-3.5 text-emerald-500" />}
              <span>{status === 'Active' ? 'Pause Subscription' : 'Resume Subscription'}</span>
            </button>

            <button
              onClick={() => handleAction('Plan upgrade modal initiated.')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
            >
              <span>Change / Upgrade Plan</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Cancel this subscription?')) {
                  setStatus('Cancelled');
                  handleAction('Subscription marked as Cancelled.');
                }
              }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Cancel Subscription"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Plan & Terms Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Contract & Billing Parameters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Plan Tier</span>
                  <p className="font-semibold text-slate-800 mt-1">Enterprise Cloud Plus</p>
                </div>
                <div>
                  <span className="text-slate-400">Annual Price</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">₹14,40,000.00 / yr</p>
                </div>
                <div>
                  <span className="text-slate-400">Tax Application</span>
                  <p className="font-semibold text-slate-800 mt-1">GST 18% (₹2,59,200.00)</p>
                </div>
                <div>
                  <span className="text-slate-400">Contract Start Date</span>
                  <p className="font-semibold text-slate-800 mt-1">2026-10-15</p>
                </div>
                <div>
                  <span className="text-slate-400">Next Scheduled Renewal</span>
                  <p className="font-semibold text-indigo-600 mt-1">2027-10-15</p>
                </div>
                <div>
                  <span className="text-slate-400">Auto-Renew Status</span>
                  <p className="font-semibold text-emerald-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enabled (Auto-Debit / e-NACH)
                  </p>
                </div>
              </div>
            </div>

            {/* Subscribed Add-ons on this contract */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Attached Add-on Services</h3>
                <button
                  onClick={() => handleAction('Opening Add-on selection...')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Add Add-on
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-800">Dedicated IP Address (2 instances)</p>
                    <p className="text-slate-400 text-[11px]">Static network endpoints</p>
                  </div>
                  <span className="font-bold text-slate-900">₹4,000.00 / mo</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <p className="font-semibold text-slate-800">24/7 Dedicated Concierge Support</p>
                    <p className="text-slate-400 text-[11px]">Guaranteed 15-min enterprise response time</p>
                  </div>
                  <span className="font-bold text-slate-900">₹25,000.00 / mo</span>
                </div>
              </div>
            </div>

            {/* Invoices History Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Subscription Invoices</h3>
                <button
                  onClick={() => handleAction('Manual invoice generated and queued.')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Generate Manual Invoice
                </button>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Issue Date</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 'INV-2026-0982', date: '2026-10-15', amount: '₹16,99,200.00', status: 'Paid' },
                    { id: 'INV-2025-0540', date: '2025-10-15', amount: '₹16,99,200.00', status: 'Paid' }
                  ].map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.id}</td>
                      <td className="py-3 px-4 text-slate-600">{inv.date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{inv.amount}</td>
                      <td className="py-3 px-4">
                        <Badge status={inv.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => alert(`Downloading PDF for ${inv.id}`)}
                          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Customer Card & Payment Details */}
          <div className="space-y-4">
            {/* Customer Organization Card */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Subscribed Organization
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  TC
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Tata Consultancy Services Ltd.</p>
                  <p className="text-slate-400">Account ID: CUST-IN-101</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-slate-600">
                <p><strong className="text-slate-700">Billing Contact:</strong> Rajesh Sharma</p>
                <p><strong className="text-slate-700">Email:</strong> r.sharma@tcs.example.com</p>
                <p><strong className="text-slate-700">Location:</strong> Mumbai, Maharashtra (GSTIN: 27AAACT2727Q1ZW)</p>
              </div>

              <Link
                href="/customers"
                className="w-full mt-2 inline-flex items-center justify-center gap-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
              >
                <span>View Customer Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Payment Method On File */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">
                Payment Source
              </h4>
              <div className="p-3 rounded-lg border border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="font-semibold text-slate-900">Corporate RuPay / HDFC e-NACH</p>
                    <p className="text-[10px] text-slate-400">Mandate: UMRN-88291048</p>
                  </div>
                </div>
                <Badge status="Active" />
              </div>
              <p className="text-[11px] text-slate-400">
                Billed automatically on renewal date via HDFC Corporate Banking & Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
