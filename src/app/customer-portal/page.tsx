'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import {
  CUSTOMERS,
  getCustomerScopedData,
  CustomerInvoiceItem,
  CustomerQuotation,
  CustomerSubscriptionItem
} from '@/lib/managementData';
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
  Sparkles,
  Building2,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  FileText,
  UserCheck,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  XCircle,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';

export default function CustomerPortalPage() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-501');
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'quotations' | 'orders' | 'invoices' | 'payments' | 'profile'>('subscriptions');

  // Interactive Modal States
  const [viewingInvoice, setViewingInvoice] = useState<CustomerInvoiceItem | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<CustomerInvoiceItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'UPI' | 'Bank Transfer'>('Credit Card');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Scoped Data for the authenticated customer (Customer Isolation)
  const scoped = getCustomerScopedData(selectedCustomerId);
  const { customer, subscriptions, quotations, salesOrders, invoices, payments, stats } = scoped;

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handlePayInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice) return;
    payingInvoice.status = 'Paid';
    payingInvoice.paidAmount = payingInvoice.total;
    payingInvoice.balance = 0;
    payingInvoice.paymentMethod = paymentMethod;
    setPayingInvoice(null);
    showNotice(`Payment of $${payingInvoice.total.toFixed(2)} recorded successfully via ${paymentMethod}! Invoice settled.`);
  };

  const handleAcceptQuote = (quoteId: string) => {
    const q = quotations.find((quote) => quote.id === quoteId);
    if (q) {
      q.status = 'Confirmed';
      showNotice(`Quotation ${quoteId} accepted! Converted to confirmed Sales Order.`);
    }
  };

  const handleSubscriptionAction = (subId: string, action: 'pause' | 'resume' | 'renew' | 'cancel') => {
    const sub = subscriptions.find((s) => s.id === subId);
    if (!sub) return;
    if (action === 'pause') {
      sub.status = 'Paused';
      showNotice(`Subscription ${subId} has been paused.`);
    } else if (action === 'resume') {
      sub.status = 'Active';
      showNotice(`Subscription ${subId} is now active again.`);
    } else if (action === 'renew') {
      showNotice(`Subscription ${subId} manual renewal initiated.`);
    } else if (action === 'cancel') {
      sub.status = 'Closed';
      showNotice(`Subscription ${subId} has been closed.`);
    }
  };

  return (
    <DashboardLayout title="Customer Self-Service Portal" moduleName="MANAGEMENT MODULE">
      <div className="space-y-6">
        {/* Customer Isolation Switcher & Authenticated Profile Banner */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              {customer.companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{customer.companyName}</h2>
                <Badge status={customer.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Customer ID: <span className="font-mono font-medium text-slate-700">{customer.id}</span> &bull; Account Rep: {customer.accountManager} &bull; Member since {customer.memberSince}
              </p>
            </div>
          </div>

          {/* Customer Record Switcher (QA Requirement: Customer A vs Customer B Isolation) */}
          <div className="flex items-center gap-2.5 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-1">Customer View:</span>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                setSelectedCustomerId(e.target.value);
                showNotice(`Switched authenticated session to ${e.target.value}. Customer records isolated.`);
              }}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none shadow-2xs"
            >
              {CUSTOMERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName} ({c.id})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Summary Metric Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Active Plans</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{stats.activeSubsCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Invoiced</p>
            <p className="text-xl font-bold text-slate-900 mt-1">${stats.totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Settled Payments</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">${stats.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Due Balance</p>
            <p className={`text-xl font-bold mt-1 ${stats.outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              ${stats.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex gap-6 text-xs font-medium text-slate-500 overflow-x-auto">
          {[
            { id: 'subscriptions', label: `Subscriptions (${subscriptions.length})`, icon: Zap },
            { id: 'quotations', label: `Quotations (${quotations.length})`, icon: FileSpreadsheet },
            { id: 'orders', label: `Sales Orders (${salesOrders.length})`, icon: ShoppingCart },
            { id: 'invoices', label: `Invoices & Receipts (${invoices.length})`, icon: Receipt },
            { id: 'payments', label: `Payment History (${payments.length})`, icon: CreditCard },
            { id: 'profile', label: 'Billing Profile', icon: Building2 }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 relative transition-colors inline-flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === tab.id
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

        {/* TAB 1: SUBSCRIPTIONS & PERMITTED ACTIONS */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
                No subscriptions found for {customer.companyName}.
              </div>
            ) : (
              subscriptions.map((sub) => (
                <div key={sub.id} className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {sub.category.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-slate-400">{sub.id}</span>
                        <Badge status={sub.status} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-2">{sub.planName}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sub.billingInterval} recurring schedule &bull; {sub.seats} allocated seats
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-2xl font-black text-slate-900">
                        ${sub.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs text-slate-400">per {sub.billingInterval.toLowerCase()} cycle</p>
                    </div>
                  </div>

                  {/* Add-ons list if any */}
                  {sub.addOns.length > 0 && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                      <p className="font-semibold text-slate-700 mb-1.5">Active Add-ons:</p>
                      <div className="space-y-1">
                        {sub.addOns.map((add, idx) => (
                          <div key={idx} className="flex justify-between text-slate-600">
                            <span>&bull; {add.name}</span>
                            <span className="font-medium text-slate-900">+${add.cost.toFixed(2)}/mo</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400">Start Date</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{sub.startDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Next Billing Date</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{sub.nextBillingDate}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Auto-Renew</span>
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {sub.autoRenew ? 'Enabled (Automatic)' : 'Manual Renewal'}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Licenses Active</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{sub.seats} Seats Active</p>
                    </div>
                  </div>

                  {/* Permitted Customer Lifecycle Actions */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {sub.status === 'Active' ? (
                        <button
                          onClick={() => handleSubscriptionAction(sub.id, 'pause')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                        >
                          <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                          <span>Pause Subscription</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscriptionAction(sub.id, 'resume')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Resume Subscription</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleSubscriptionAction(sub.id, 'renew')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                        <span>Renew Now</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleSubscriptionAction(sub.id, 'cancel')}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700"
                    >
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: QUOTATIONS OVERVIEW */}
        {activeTab === 'quotations' && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Quotations & Pricing Proposals</h3>
                <p className="text-xs text-slate-500">Proposals issued by sales team for your review</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Quote #</th>
                    <th className="py-2.5 px-4">Template / Description</th>
                    <th className="py-2.5 px-4">Date Issued</th>
                    <th className="py-2.5 px-4">Valid Until</th>
                    <th className="py-2.5 px-4">Subtotal</th>
                    <th className="py-2.5 px-4">Total Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotations.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No quotations on record for this customer.
                      </td>
                    </tr>
                  ) : (
                    quotations.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{q.id}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{q.templateName}</td>
                        <td className="py-3 px-4 text-slate-500">{q.date}</td>
                        <td className="py-3 px-4 text-slate-500">{q.validUntil}</td>
                        <td className="py-3 px-4 text-slate-600">${q.subtotal.toFixed(2)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">${q.total.toFixed(2)}</td>
                        <td className="py-3 px-4"><Badge status={q.status} /></td>
                        <td className="py-3 px-4 text-right">
                          {q.status === 'Sent' ? (
                            <button
                              onClick={() => handleAcceptQuote(q.id)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md shadow-2xs"
                            >
                              Accept Quote
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">No action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SALES ORDERS OVERVIEW */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Customer Sales Orders</h3>
                <p className="text-xs text-slate-500">Confirmed orders serving as the source for active subscriptions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Sales Order #</th>
                    <th className="py-2.5 px-4">Quotation Ref</th>
                    <th className="py-2.5 px-4">Order Date</th>
                    <th className="py-2.5 px-4">Plan Item</th>
                    <th className="py-2.5 px-4">Order Total</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {salesOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No sales orders on record for this customer.
                      </td>
                    </tr>
                  ) : (
                    salesOrders.map((so) => (
                      <tr key={so.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{so.id}</td>
                        <td className="py-3 px-4 font-mono text-indigo-600">{so.quotationRef}</td>
                        <td className="py-3 px-4 text-slate-600">{so.orderDate}</td>
                        <td className="py-3 px-4 text-slate-800 font-medium">{so.planName}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">${so.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4"><Badge status={so.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: INVOICES & TAX RECEIPTS */}
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Invoices & Billing History</h3>
                <p className="text-xs text-slate-500">Tax invoices generated by recurring billing runs</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-4">Issue Date</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Plan / Service</th>
                    <th className="py-2.5 px-4">Total Amount</th>
                    <th className="py-2.5 px-4">Balance Due</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400">
                        No invoices on record for this customer.
                      </td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{inv.id}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.issueDate}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.dueDate}</td>
                        <td className="py-3 px-4 text-slate-800">{inv.planOrService}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">${inv.total.toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          ${inv.balance.toFixed(2)}
                        </td>
                        <td className="py-3 px-4"><Badge status={inv.status} /></td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            <FileText className="w-3.5 h-3.5" /> View
                          </button>
                          {inv.balance > 0 && inv.status !== 'Cancelled' && (
                            <button
                              onClick={() => setPayingInvoice(inv)}
                              className="px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                            >
                              Pay Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: PAYMENT HISTORY */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Recorded Customer Payments</h3>
                <p className="text-xs text-slate-500">History of disbursements, credit card debits, and UPI transactions</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2.5 px-4">Payment Entry #</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Allocated Invoice</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Reference No</th>
                    <th className="py-2.5 px-4">Amount Paid</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400">
                        No payments recorded for this customer.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">{p.id}</td>
                        <td className="py-3 px-4 text-slate-600">{p.paymentDate}</td>
                        <td className="py-3 px-4 font-mono text-indigo-600">{p.invoiceId}</td>
                        <td className="py-3 px-4 text-slate-700">{p.method}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{p.referenceNo}</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">${p.amount.toFixed(2)}</td>
                        <td className="py-3 px-4"><Badge status={p.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMER PROFILE & BILLING DETAILS */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Organization Information</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block">Company Name</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{customer.companyName}</p>
                </div>
                <div>
                  <label className="text-slate-400 block">Primary Billing Contact</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{customer.name} ({customer.email})</p>
                </div>
                <div>
                  <label className="text-slate-400 block">Phone Number</label>
                  <p className="font-semibold text-slate-800 mt-0.5">{customer.phone}</p>
                </div>
                <div>
                  <label className="text-slate-400 block">Tax Registration / GSTIN</label>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">{customer.taxId}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Official Billing Address</h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">{customer.companyName}</p>
                <p>{customer.billingAddress}</p>
                <p className="pt-2 text-slate-500">Assigned Account Manager: <span className="font-medium text-slate-800">{customer.accountManager}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: VIEW INVOICE DETAILS & PRINT */}
        {viewingInvoice && (
          <Modal
            isOpen={!!viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            title={`Invoice Details: ${viewingInvoice.id}`}
          >
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Brightloop Software Ltd</h4>
                  <p className="text-slate-500">Subscription & Cloud Billing Services</p>
                </div>
                <div className="text-right">
                  <Badge status={viewingInvoice.status} />
                  <p className="text-slate-400 mt-1">Issue Date: {viewingInvoice.issueDate}</p>
                  <p className="text-slate-400">Due Date: {viewingInvoice.dueDate}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Billed To</p>
                <p className="font-bold text-slate-900 text-sm mt-0.5">{viewingInvoice.customerName}</p>
                <p className="text-slate-600">{customer.billingAddress}</p>
              </div>

              {/* Line items table */}
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 text-slate-400">
                  <tr>
                    <th className="py-2">Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewingInvoice.lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium text-slate-800">{line.description}</td>
                      <td className="py-2 text-center text-slate-600">{line.qty}</td>
                      <td className="py-2 text-right text-slate-600">${line.unitPrice.toFixed(2)}</td>
                      <td className="py-2 text-right font-bold text-slate-900">${line.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 space-y-1 text-right">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal:</span>
                  <span>${viewingInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Tax (10%):</span>
                  <span>${viewingInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
                  <span>Invoice Gross Total:</span>
                  <span>${viewingInvoice.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Paid Amount:</span>
                  <span>${viewingInvoice.paidAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-600 font-bold text-sm">
                  <span>Remaining Balance:</span>
                  <span>${viewingInvoice.balance.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Invoice</span>
                </button>
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* MODAL: PAY INVOICE */}
        {payingInvoice && (
          <Modal
            isOpen={!!payingInvoice}
            onClose={() => setPayingInvoice(null)}
            title={`Pay Invoice: ${payingInvoice.id}`}
          >
            <form onSubmit={handlePayInvoice} className="space-y-4 text-xs">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <p className="text-slate-600">Total Balance to Settle:</p>
                <p className="text-2xl font-black text-indigo-700 mt-1">${payingInvoice.balance.toFixed(2)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{payingInvoice.planOrService}</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Select Settlement Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Credit Card', 'UPI', 'Bank Transfer'] as const).map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-lg border text-center transition-all ${
                        paymentMethod === m
                          ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === 'Credit Card' && (
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-semibold text-slate-800">Primary Card on File</p>
                  <p className="text-slate-500">Visa ending in 4242 &bull; Exp 09/2029</p>
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="space-y-1">
                  <label className="text-slate-600 block">UPI Virtual Payment Address (VPA)</label>
                  <input
                    type="text"
                    defaultValue="acme.corporate@okaxis"
                    className="w-full p-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              )}

              {paymentMethod === 'Bank Transfer' && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px]">
                  <p className="font-semibold text-slate-800">Wire to Virtual Escrow Account:</p>
                  <p>Bank: JPMorgan Chase NA</p>
                  <p>Account: 89201948194</p>
                  <p>Routing / IFSC: CHASE00129</p>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayingInvoice(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs"
                >
                  Authorize Payment of ${payingInvoice.balance.toFixed(2)}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
