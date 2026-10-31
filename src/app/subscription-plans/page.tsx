'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PLANS_DATA } from '@/data/mockData';
import { Zap, Check, Plus, Users, Sparkles } from 'lucide-react';

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState(PLANS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: '$799',
    billingFrequency: 'Monthly',
    seats: 'Up to 50 Users',
    features: 'Unlimited Billing Runs, Priority Support, Custom Invoicing'
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan = {
      id: `PLAN-0${plans.length + 1}`,
      name: formData.name || 'Custom Scale Plan',
      code: formData.code || `PLN-CUSTOM-${plans.length + 1}`,
      price: formData.price,
      billingFrequency: formData.billingFrequency,
      seats: formData.seats,
      features: formData.features.split(',').map((f) => f.trim()),
      activeSubscribers: 0,
      popular: false
    };
    setPlans([...plans, newPlan]);
    setIsModalOpen(false);
    setFormData({ name: '', code: '', price: '$799', billingFrequency: 'Monthly', seats: 'Up to 50 Users', features: '' });
  };

  return (
    <DashboardLayout title="Subscription Plans" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {/* Header Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Configured Subscription Tiers</h2>
            <p className="text-xs text-slate-500">
              Manage SaaS packages, standard pricing tiers, features, and active customer distributions
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between relative transition-all ${
                plan.popular
                  ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                  : 'border-slate-200/90 shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full shadow-sm">
                    Most Popular Tier
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                    {plan.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Users className="w-3 h-3 text-slate-400" />
                    {plan.activeSubscribers.toLocaleString()} subscribers
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mt-2">{plan.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{plan.seats}</p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-400">/{plan.billingFrequency.toLowerCase()}</span>
                </div>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Included Capabilities
                  </p>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => alert(`Editing plan settings for: ${plan.name}`)}
                  className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Configure Plan Rules
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Plan Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Subscription Plan"
          subtitle="Define tier pricing, billing frequency, and feature allowances"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-plan-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Publish Plan
              </button>
            </>
          }
        >
          <form id="add-plan-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Business Scale"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Plan Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="PLN-SCALE-BIZ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="$799"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Frequency</label>
                <select
                  value={formData.billingFrequency}
                  onChange={(e) => setFormData({ ...formData, billingFrequency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Monthly</option>
                  <option>Annual</option>
                  <option>Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seats Quota</label>
                <input
                  type="text"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: e.target.value })}
                  placeholder="Up to 50 Users"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Included Features (comma-separated)</label>
              <textarea
                rows={3}
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="Core Engine, Automated Invoicing, Dedicated Slack Connect channel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
