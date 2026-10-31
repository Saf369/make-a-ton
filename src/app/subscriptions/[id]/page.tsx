'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import {
  getSubscriptionById,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  renewSubscription,
} from '@/lib/actions/subscription';
import type { Subscription, SubscriptionStatus, BillingInterval } from '@/lib/types/subscription';
import {
  ArrowLeft, Pause, Play, RotateCcw, Trash2, CheckCircle2,
  CreditCard, Building2, Zap, Calendar, DollarSign, FileText,
  AlertCircle, RefreshCw,
} from 'lucide-react';

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
  quarterly: 'Quarterly', semi_annual: 'Semi-Annual', annual: 'Annual',
};

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  active: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  paused: 'text-blue-700 bg-blue-50 border-blue-200',
  cancelled: 'text-slate-600 bg-slate-50 border-slate-200',
  expired: 'text-red-700 bg-red-50 border-red-200',
  past_due: 'text-red-700 bg-red-50 border-red-200',
};

export default function SubscriptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const sub = await getSubscriptionById(id);
      if (!sub) {
        setError('Subscription not found');
      } else {
        setSubscription(sub);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  }

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handlePause = () => {
    if (!subscription || !confirm('Pause this subscription?')) return;
    startTransition(async () => {
      try {
        await pauseSubscription({ subscription_id: subscription.id });
        setSubscription((prev) => prev ? { ...prev, status: 'paused' as SubscriptionStatus } : prev);
        showNotice('Subscription successfully paused.');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to pause');
      }
    });
  };

  const handleResume = () => {
    if (!subscription) return;
    startTransition(async () => {
      try {
        await resumeSubscription({ subscription_id: subscription.id });
        setSubscription((prev) => prev ? { ...prev, status: 'active' as SubscriptionStatus } : prev);
        showNotice('Subscription successfully resumed.');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to resume');
      }
    });
  };

  const handleCancel = () => {
    if (!subscription) return;
    const reason = prompt('Cancellation reason (optional):');
    if (reason === null) return;
    if (!confirm('This will permanently cancel the subscription. Continue?')) return;
    startTransition(async () => {
      try {
        await cancelSubscription({ subscription_id: subscription.id, reason: reason || undefined });
        setSubscription((prev) => prev ? {
          ...prev,
          status: 'cancelled' as SubscriptionStatus,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason || null,
        } : prev);
        showNotice('Subscription has been cancelled.');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to cancel');
      }
    });
  };

  const handleRenew = () => {
    if (!subscription) return;
    if (!confirm('Manually renew this subscription to the next billing period?')) return;
    startTransition(async () => {
      try {
        await renewSubscription({ subscription_id: subscription.id });
        showNotice('Subscription renewed to next billing period.');
        await loadData();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to renew');
      }
    });
  };

  if (loading) {
    return (
      <DashboardLayout title="Subscription Details" moduleName="SUBSCRIPTION MODULE">
        <div className="space-y-4 animate-pulse max-w-6xl">
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-48 bg-slate-100 rounded-xl" />
            <div className="h-48 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !subscription) {
    return (
      <DashboardLayout title="Subscription Details" moduleName="SUBSCRIPTION MODULE">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <div className="flex items-center gap-2 mb-2 font-semibold">
            <AlertCircle className="w-4 h-4" /> Error
          </div>
          {error ?? 'Subscription not found.'}
          <div className="mt-4">
            <Link href="/subscriptions" className="text-indigo-600 font-semibold hover:underline text-xs">
              ← Back to Subscriptions
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = subscription.status;
  const plan = subscription.plan;
  const items = subscription.subscription_items ?? [];
  const addons = subscription.subscription_addons ?? [];
  const totalAddons = addons.reduce((s, a) => s + Number(a.unit_price) * a.quantity, 0);

  return (
    <DashboardLayout title="Subscription Details" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6 max-w-6xl">
        {/* Back navigation */}
        <Link
          href="/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Subscriptions</span>
        </Link>

        {/* Notice */}
        {notice && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>{notice}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
            <button onClick={() => setError(null)} className="ml-auto font-bold">✕</button>
          </div>
        )}

        {/* Header Banner */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{subscription.subscription_number}</h2>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border capitalize ${STATUS_COLORS[status]}`}>
                  {status.replace('_', ' ')}
                </span>
                <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-md">
                  {INTERVAL_LABELS[subscription.billing_interval]}
                  {subscription.billing_interval_count > 1 ? ` × ${subscription.billing_interval_count}` : ''}
                </span>
                {subscription.auto_renew && (
                  <span className="text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full">
                    Auto-Renew ON
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Plan:{' '}
                <span className="font-semibold text-indigo-600">{plan?.name ?? '—'}</span>
                {' '}• Started {subscription.start_date}
              </p>
              {subscription.cancellation_reason && (
                <p className="text-xs text-red-500 mt-1">Cancelled: {subscription.cancellation_reason}</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {status === 'active' && (
              <button
                onClick={handlePause}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                Pause
              </button>
            )}
            {status === 'paused' && (
              <button
                onClick={handleResume}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 text-emerald-500" />
                Resume
              </button>
            )}
            {(status === 'active' || status === 'paused') && (
              <>
                <button
                  onClick={handleRenew}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                  Renew Now
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* 2-Column Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contract & Billing Parameters */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                Contract & Billing Parameters
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Plan Tier</span>
                  <p className="font-semibold text-slate-800 mt-1">{plan?.name ?? '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Agreed Price</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">
                    {subscription.currency} ${Number(subscription.agreed_price).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Billing Frequency</span>
                  <p className="font-semibold text-slate-800 mt-1">
                    {INTERVAL_LABELS[subscription.billing_interval]}
                    {subscription.billing_interval_count > 1 ? ` × ${subscription.billing_interval_count}` : ''}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Start Date</span>
                  <p className="font-semibold text-slate-800 mt-1">{subscription.start_date}</p>
                </div>
                <div>
                  <span className="text-slate-400">Next Billing Date</span>
                  <p className="font-semibold text-indigo-600 mt-1">{subscription.next_billing_date ?? '—'}</p>
                </div>
                <div>
                  <span className="text-slate-400">Period End</span>
                  <p className="font-semibold text-slate-800 mt-1">{subscription.current_period_end ?? '—'}</p>
                </div>
                {subscription.available_from && (
                  <div>
                    <span className="text-slate-400">Available From</span>
                    <p className="font-semibold text-slate-800 mt-1">{subscription.available_from}</p>
                  </div>
                )}
                {subscription.available_until && (
                  <div>
                    <span className="text-slate-400">Available Until</span>
                    <p className="font-semibold text-slate-800 mt-1">{subscription.available_until}</p>
                  </div>
                )}
                {subscription.paused_at && (
                  <div>
                    <span className="text-slate-400">Paused At</span>
                    <p className="font-semibold text-amber-600 mt-1">{new Date(subscription.paused_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Subscription Items */}
            {items.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  Subscribed Products
                </h3>
                <div className="space-y-3 text-xs">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div>
                        <p className="font-semibold text-slate-800">{item.product?.name ?? '—'}</p>
                        <p className="text-slate-400 text-[11px]">
                          Variant: {item.variant?.name ?? item.variant_id} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">${Number(item.unit_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Attached Add-on Services</h3>
                <button
                  onClick={() => showNotice('Add-on selection modal — coming soon')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  + Add Add-on
                </button>
              </div>

              {addons.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No add-ons attached to this subscription.</p>
              ) : (
                <div className="space-y-3 text-xs">
                  {addons.map((sa) => (
                    <div key={sa.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                      <div>
                        <p className="font-semibold text-slate-800">{sa.addon?.name ?? '—'}</p>
                        <p className="text-slate-400 text-[11px]">
                          {sa.addon?.billing_type} • Qty: {sa.quantity}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">${(Number(sa.unit_price) * sa.quantity).toFixed(2)}/period</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notes */}
            {subscription.notes && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">Internal Notes</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{subscription.notes}</p>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Pricing Summary */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Billing Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Plan</span>
                  <span className="font-semibold text-slate-800">${Number(subscription.agreed_price).toFixed(2)}</span>
                </div>
                {totalAddons > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Add-ons ({addons.length})</span>
                    <span className="font-semibold text-slate-800">+${totalAddons.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-100 font-bold">
                  <span className="text-slate-700">Total / Period</span>
                  <span className="text-slate-900 text-sm">${(Number(subscription.agreed_price) + totalAddons).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-xs space-y-3">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Customer</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Customer Account</p>
                  <p className="text-slate-400 font-mono text-[10px]">{subscription.customer_id}</p>
                </div>
              </div>
              <Link
                href="/customers"
                className="w-full mt-2 inline-flex items-center justify-center gap-1 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-100"
              >
                View Customer Profile
              </Link>
            </div>

            {/* Source Info */}
            {subscription.source_sales_order_id && (
              <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-xs space-y-2">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Converted From</h4>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-mono text-slate-700 text-[11px]">{subscription.source_sales_order_id}</span>
                </div>
                <Link href="/sales-orders" className="text-indigo-600 hover:underline text-[11px] font-semibold">
                  View Sales Order →
                </Link>
              </div>
            )}

            {/* Lifecycle Timestamps */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs text-xs space-y-2">
              <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Lifecycle</h4>
              <div className="space-y-1.5 text-slate-600">
                <p><strong className="text-slate-700">Created:</strong> {new Date(subscription.created_at).toLocaleString()}</p>
                <p><strong className="text-slate-700">Updated:</strong> {new Date(subscription.updated_at).toLocaleString()}</p>
                {subscription.paused_at && <p><strong className="text-amber-600">Paused:</strong> {new Date(subscription.paused_at).toLocaleString()}</p>}
                {subscription.resumed_at && <p><strong className="text-emerald-600">Resumed:</strong> {new Date(subscription.resumed_at).toLocaleString()}</p>}
                {subscription.cancelled_at && <p><strong className="text-red-600">Cancelled:</strong> {new Date(subscription.cancelled_at).toLocaleString()}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
