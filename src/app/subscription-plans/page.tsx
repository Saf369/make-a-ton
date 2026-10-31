'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getPlans, createPlan, deletePlan } from '@/lib/actions/subscription';
import type { SubscriptionPlan, BillingInterval } from '@/lib/types/subscription';
import { Check, Plus, Users, Calendar, Trash2 } from 'lucide-react';

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
};

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    billing_interval: 'monthly' as BillingInterval,
    billing_interval_count: '1',
    base_price: '',
    min_quantity: '1',
    available_from: '',
    available_until: '',
    is_popular: false,
    features: '',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      setPlans(await getPlans());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await createPlan({
          name: formData.name,
          code: formData.code,
          description: formData.description || null,
          billing_interval: formData.billing_interval,
          billing_interval_count: parseInt(formData.billing_interval_count) || 1,
          base_price: parseFloat(formData.base_price) || 0,
          min_quantity: parseInt(formData.min_quantity) || 1,
          available_from: formData.available_from || null,
          available_until: formData.available_until || null,
          is_popular: formData.is_popular,
          features: formData.features ? formData.features.split(',').map((f) => f.trim()).filter(Boolean) : [],
        });
        // Reload to get full plan with features
        setPlans(await getPlans());
        setIsModalOpen(false);
        setFormData({
          name: '', code: '', description: '', billing_interval: 'monthly', billing_interval_count: '1',
          base_price: '', min_quantity: '1', available_from: '', available_until: '', is_popular: false, features: '',
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create plan');
      }
    });
  };

  const handleDelete = (plan: SubscriptionPlan) => {
    if (!confirm(`Delete plan "${plan.name}"? All associated plan items and features will be removed.`)) return;
    startTransition(async () => {
      try {
        await deletePlan(plan.id);
        setPlans((prev) => prev.filter((p) => p.id !== plan.id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete plan');
      }
    });
  };

  return (
    <DashboardLayout title="Subscription Plans" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        {/* Header Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Configured Subscription Tiers</h2>
            <p className="text-xs text-slate-500">
              Manage SaaS packages, standard pricing tiers, features, and billing intervals
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>

        {/* Plan Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200/90 p-6 animate-pulse">
                <div className="h-4 bg-slate-100 rounded mb-3 w-24" />
                <div className="h-6 bg-slate-100 rounded mb-2 w-40" />
                <div className="h-8 bg-slate-100 rounded mb-4 w-32" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => <div key={j} className="h-3 bg-slate-100 rounded" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                  plan.is_popular
                    ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                    : 'border-slate-200/90 shadow-xs'
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                      Most Popular Tier
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">{plan.code}</span>
                    <div className="flex items-center gap-2">
                      <Badge status={plan.is_active ? 'Active' : 'Inactive'} />
                      <button
                        onClick={() => handleDelete(plan)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{plan.description}</p>
                  )}

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">${Number(plan.base_price).toFixed(0)}</span>
                    <span className="text-xs text-slate-400">
                      /{INTERVAL_LABELS[plan.billing_interval].toLowerCase()}
                      {plan.billing_interval_count > 1 ? ` × ${plan.billing_interval_count}` : ''}
                    </span>
                  </div>

                  {(plan.available_from || plan.available_until) && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {plan.available_from ?? '—'} → {plan.available_until ?? 'ongoing'}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">Min qty:</span> {plan.min_quantity}
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Included Capabilities</p>
                    {(plan.plan_features ?? []).map((feat) => (
                      <div key={feat.id} className="flex items-start gap-2 text-xs text-slate-600">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat.feature}</span>
                      </div>
                    ))}
                    {(plan.plan_features ?? []).length === 0 && (
                      <p className="text-xs text-slate-400 italic">No features defined yet</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => alert(`Configure plan rules for: ${plan.name}`)}
                    className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    Configure Plan Rules
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Plan Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Subscription Plan"
          subtitle="Define tier pricing, billing frequency, availability dates, and feature allowances"
          footer={
            <>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" form="add-plan-form" disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50">
                {isPending ? 'Publishing...' : 'Publish Plan'}
              </button>
            </>
          }
        >
          <form id="add-plan-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Name *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Business Scale"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Code *</label>
                <input type="text" required value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PLN-SCALE-BIZ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <input type="text" value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of this plan tier"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
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
                <label className="block font-semibold text-slate-700 mb-1">Min Quantity</label>
                <input type="number" min="1" value={formData.min_quantity}
                  onChange={(e) => setFormData({ ...formData, min_quantity: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Base Price ($) *</label>
                <input type="number" step="0.01" min="0" required value={formData.base_price}
                  onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                  placeholder="799.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.is_popular}
                    onChange={(e) => setFormData({ ...formData, is_popular: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5" />
                  <span className="text-slate-700 font-semibold">Mark as Most Popular</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available From</label>
                <input type="date" value={formData.available_from}
                  onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available Until</label>
                <input type="date" value={formData.available_until}
                  onChange={(e) => setFormData({ ...formData, available_until: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Included Features (comma-separated)</label>
              <textarea rows={3} value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Core Engine, Automated Invoicing, Dedicated Slack Connect channel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
