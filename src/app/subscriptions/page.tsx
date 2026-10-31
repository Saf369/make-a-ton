'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { RECENT_SUBSCRIPTIONS } from '@/data/mockData';
import { Repeat, Calendar, DollarSign, ArrowUpRight, Eye } from 'lucide-react';

export default function SubscriptionsPage() {
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState(RECENT_SUBSCRIPTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    plan: 'Growth Pro Tier',
    billingCycle: 'Monthly',
    amount: '$499/mo'
  });

  const columns: Column<typeof RECENT_SUBSCRIPTIONS[0]>[] = [
    {
      key: 'id',
      header: 'Subscription ID',
      width: 'w-28',
      render: (item) => (
        <Link
          href="/subscription-details"
          className="font-mono font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          {item.id}
        </Link>
      )
    },
    {
      key: 'customer',
      header: 'Customer Organization',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.customer}</div>
          <div className="text-slate-400 text-[11px]">Started: {item.startDate}</div>
        </div>
      )
    },
    {
      key: 'plan',
      header: 'Subscribed Plan',
      render: (item) => (
        <span className="font-medium text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
          {item.plan}
        </span>
      )
    },
    {
      key: 'billingCycle',
      header: 'Frequency'
    },
    {
      key: 'amount',
      header: 'Recurring Rate',
      render: (item) => <span className="font-bold text-slate-900">{item.amount}</span>
    },
    {
      key: 'nextBilling',
      header: 'Next Invoice',
      render: (item) => <span className="text-slate-600 font-mono text-[11px]">{item.nextBilling}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newSub = {
      id: `SUB-100${subscriptions.length + 25}`,
      customer: formData.customer || 'New Enterprise Client',
      plan: formData.plan,
      billingCycle: formData.billingCycle,
      amount: formData.amount,
      startDate: '2026-10-31',
      nextBilling: '2026-11-30',
      status: 'Active'
    };
    setSubscriptions([newSub, ...subscriptions]);
    setIsModalOpen(false);
    setFormData({ customer: '', plan: 'Growth Pro Tier', billingCycle: 'Monthly', amount: '$499/mo' });
  };

  return (
    <DashboardLayout title="Customer Subscriptions" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {/* KPI stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Active Subscriptions"
            value="4,820"
            change="+14.2%"
            trend="up"
            period="vs last month"
            iconName="Repeat"
          />
          <StatCard
            title="Contracted MRR"
            value="$243,000"
            change="+$18,500"
            trend="up"
            period="in active billing"
            iconName="DollarSign"
          />
          <StatCard
            title="At-Risk Accounts"
            value="3 Subscriptions"
            change="Requires Dunning"
            trend="down"
            period="card expired"
            iconName="Percent"
          />
        </div>

        <DataTable
          title="Active & Past Customer Subscriptions"
          subtitle="Real-time registry of all recurring contracts, billing cycles, and next invoice dates"
          data={subscriptions}
          columns={columns}
          searchPlaceholder="Search subscriptions by customer or ID..."
          searchKey="customer"
          addNewLabel="New Subscription"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting subscriptions to CSV...')}
          onView={(item) => router.push('/subscription-details')}
          onEdit={(item) => alert(`Editing subscription ${item.id}`)}
          onDelete={(item) => {
            if (confirm(`Cancel subscription ${item.id}?`)) {
              setSubscriptions(subscriptions.filter((s) => s.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Past Due', value: 'Past Due' },
            { label: 'Paused', value: 'Paused' }
          ]}
        />

        {/* Add Subscription Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Subscription"
          subtitle="Provision a recurring subscription contract for an existing customer"
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
                form="add-sub-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Activate Subscription
              </button>
            </>
          }
        >
          <form id="add-sub-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Organization</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="e.g. Acme Technologies Inc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subscription Plan</label>
                <select
                  value={formData.plan}
                  onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Starter Team</option>
                  <option>Growth Pro Tier</option>
                  <option>Enterprise Cloud Plus</option>
                  <option>Custom Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Frequency</label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Monthly</option>
                  <option>Annual</option>
                  <option>Quarterly</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Agreed Rate</label>
              <input
                type="text"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. $499/mo"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
