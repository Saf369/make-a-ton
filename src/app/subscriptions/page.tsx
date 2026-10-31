'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  getSubscriptions,
  getPlans,
  createSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
} from '@/lib/actions/subscription';
import type { Subscription, SubscriptionPlan, BillingInterval, SubscriptionStatus } from '@/lib/types/subscription';
import { Repeat, DollarSign, Pause, Play, X } from 'lucide-react';

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly',
  quarterly: 'Quarterly', semi_annual: 'Semi-Annual', annual: 'Annual',
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  pending: 'Pending', active: 'Active', paused: 'Paused',
  cancelled: 'Cancelled', expired: 'Expired', past_due: 'Past Due',
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    customer_id: '',
    plan_id: '',
    billing_interval: 'monthly' as BillingInterval,
    billing_interval_count: '1',
    agreed_price: '',
    currency: 'USD',
    start_date: '',
    auto_renew: true,
    notes: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      start_date: prev.start_date || new Date().toISOString().split('T')[0],
    }));
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [subs, planList] = await Promise.all([getSubscriptions(), getPlans()]);
      setSubscriptions(subs);
      setPlans(planList);
      if (planList.length > 0) {
        setFormData((prev) => ({
          ...prev,
          plan_id: planList[0].id,
          billing_interval: planList[0].billing_interval,
          agreed_price: planList[0].base_price.toFixed(2),
        }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    setFormData((prev) => ({
      ...prev,
      plan_id: planId,
      billing_interval: plan?.billing_interval ?? 'monthly',
      agreed_price: plan?.base_price?.toFixed(2) ?? '',
    }));
  };

  const columns: Column<Subscription>[] = [
    {
      key: 'subscription_number',
      header: 'Subscription ID',
      width: 'w-32',
      render: (item) => (
        <Link
          href={`/subscriptions/${item.id}`}
          className="font-mono font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {item.subscription_number}
        </Link>
      ),
    },
    {
      key: 'plan_id',
      header: 'Plan',
      render: (item) => (
        <span className="font-medium text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
          {item.plan?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'billing_interval',
      header: 'Frequency',
      render: (item) => (
        <span className="text-slate-700 text-xs">
          {INTERVAL_LABELS[item.billing_interval]}
          {item.billing_interval_count > 1 ? ` × ${item.billing_interval_count}` : ''}
        </span>
      ),
    },
    {
      key: 'agreed_price',
      header: 'Agreed Rate',
      render: (item) => (
        <span className="font-bold text-slate-900">
          {item.currency} ${Number(item.agreed_price).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'next_billing_date',
      header: 'Next Billing',
      render: (item) => (
        <span className="text-slate-600 font-mono text-[11px]">{item.next_billing_date ?? '—'}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge status={STATUS_LABELS[item.status]} />,
    },
    {
      key: 'id',
      header: 'Actions',
      render: (item) => (
        <div className="flex items-center gap-1">
          {item.status === 'active' && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePause(item); }}
              className="p-1 text-amber-500 hover:bg-amber-50 rounded transition-colors"
              title="Pause"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {item.status === 'paused' && (
            <button
              onClick={(e) => { e.stopPropagation(); handleResume(item); }}
              className="p-1 text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
              title="Resume"
            >
              <Play className="w-3.5 h-3.5" />
            </button>
          )}
          {(item.status === 'active' || item.status === 'paused') && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCancel(item); }}
              className="p-1 text-red-400 hover:bg-red-50 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customer_id) {
      setError('Customer ID is required');
      return;
    }
    startTransition(async () => {
      try {
        await createSubscription({
          customer_id: formData.customer_id,
          plan_id: formData.plan_id,
          billing_interval: formData.billing_interval,
          billing_interval_count: parseInt(formData.billing_interval_count) || 1,
          agreed_price: parseFloat(formData.agreed_price) || 0,
          currency: formData.currency,
          start_date: formData.start_date,
          auto_renew: formData.auto_renew,
          notes: formData.notes || undefined,
        });
        setSubscriptions(await getSubscriptions());
        setIsModalOpen(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create subscription');
      }
    });
  };

  const handlePause = (item: Subscription) => {
    if (!confirm(`Pause subscription ${item.subscription_number}?`)) return;
    startTransition(async () => {
      try {
        await pauseSubscription({ subscription_id: item.id });
        setSubscriptions((prev) =>
          prev.map((s) => s.id === item.id ? { ...s, status: 'paused' as SubscriptionStatus } : s)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to pause subscription');
      }
    });
  };

  const handleResume = (item: Subscription) => {
    startTransition(async () => {
      try {
        await resumeSubscription({ subscription_id: item.id });
        setSubscriptions((prev) =>
          prev.map((s) => s.id === item.id ? { ...s, status: 'active' as SubscriptionStatus } : s)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to resume subscription');
      }
    });
  };

  const handleCancel = (item: Subscription) => {
    const reason = prompt('Cancellation reason (optional):') ?? undefined;
    if (reason === null) return; // user cancelled the prompt
    startTransition(async () => {
      try {
        await cancelSubscription({ subscription_id: item.id, reason });
        setSubscriptions((prev) =>
          prev.map((s) => s.id === item.id ? { ...s, status: 'cancelled' as SubscriptionStatus } : s)
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      }
    });
  };

  const activeCount = subscriptions.filter((s) => s.status === 'active').length;
  const totalMRR = subscriptions
    .filter((s) => s.status === 'active' && s.billing_interval === 'monthly')
    .reduce((sum, s) => sum + Number(s.agreed_price), 0);
  const atRiskCount = subscriptions.filter((s) => s.status === 'past_due').length;

  return (
    <DashboardLayout title="Customer Subscriptions" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Active Subscriptions"
            value={`${activeCount}`}
            change={`${subscriptions.length} total`}
            trend="up"
            period="currently active"
            iconName="Repeat"
          />
          <StatCard
            title="Monthly MRR"
            value={`$${totalMRR.toLocaleString()}`}
            change="from monthly plans"
            trend="up"
            period="active billing"
            iconName="DollarSign"
          />
          <StatCard
            title="At-Risk / Past Due"
            value={`${atRiskCount}`}
            change={atRiskCount > 0 ? 'requires attention' : 'all clear'}
            trend={atRiskCount > 0 ? 'down' : 'up'}
            period="past due subscriptions"
            iconName="Percent"
          />
        </div>

        <DataTable
          title="Active & Past Customer Subscriptions"
          subtitle="Real-time registry of all recurring contracts, billing cycles, and next invoice dates"
          data={subscriptions}
          columns={columns}
          searchPlaceholder="Search by subscription number..."
          searchKey="subscription_number"
          addNewLabel="New Subscription"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting subscriptions...')}
          onView={(item) => router.push(`/subscriptions/${item.id}`)}
          onEdit={(item) => alert(`Edit subscription ${item.subscription_number}`)}
          onDelete={(item) => handleCancel(item)}
          filterKey="status"
          filterOptions={[
            { label: 'Active', value: 'active' },
            { label: 'Paused', value: 'paused' },
            { label: 'Past Due', value: 'past_due' },
            { label: 'Cancelled', value: 'cancelled' },
          ]}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Subscription"
          subtitle="Provision a recurring subscription contract for an existing customer"
          footer={
            <>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" form="add-sub-form" disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50">
                {isPending ? 'Activating...' : 'Activate Subscription'}
              </button>
            </>
          }
        >
          <form id="add-sub-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer ID *</label>
              <input type="text" required value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                placeholder="Paste customer UUID from Customers module"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              <p className="text-slate-400 mt-1">UUID from the customers table (Safwan's module)</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subscription Plan *</label>
              <select value={formData.plan_id} required
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.base_price}/{p.billing_interval}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Interval</label>
                <select value={formData.billing_interval}
                  onChange={(e) => setFormData({ ...formData, billing_interval: e.target.value as BillingInterval })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                  {Object.entries(INTERVAL_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Interval Count</label>
                <input type="number" min="1" value={formData.billing_interval_count}
                  onChange={(e) => setFormData({ ...formData, billing_interval_count: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Currency</label>
                <select value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                  <option>USD</option><option>EUR</option><option>GBP</option><option>AED</option><option>SAR</option><option>OMR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Agreed Rate ($) *</label>
                <input type="number" step="0.01" min="0" required value={formData.agreed_price}
                  onChange={(e) => setFormData({ ...formData, agreed_price: e.target.value })}
                  placeholder="499.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start Date *</label>
                <input type="date" required value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="auto_renew" checked={formData.auto_renew}
                onChange={(e) => setFormData({ ...formData, auto_renew: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
              <label htmlFor="auto_renew" className="text-slate-700 font-semibold cursor-pointer">Enable Auto-Renew</label>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes</label>
              <textarea rows={2} value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this subscription..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
