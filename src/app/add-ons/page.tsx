'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getAddons, createAddon, deleteAddon } from '@/lib/actions/subscription';
import type { AddOn, BillingType } from '@/lib/types/subscription';

const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  recurring: 'Recurring',
  one_time: 'One-Time',
  usage_metered: 'Usage-Metered',
};

export default function AddOnsPage() {
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    unit_price: '',
    billing_type: 'recurring' as BillingType,
    description: '',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      setAddons(await getAddons());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load add-ons');
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<AddOn>[] = [
    {
      key: 'name',
      header: 'Add-on Title & Code',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.code}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => <span className="text-slate-600 text-xs">{item.description ?? '—'}</span>,
    },
    {
      key: 'billing_type',
      header: 'Billing Type',
      render: (item) => (
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
          {BILLING_TYPE_LABELS[item.billing_type]}
        </span>
      ),
    },
    {
      key: 'unit_price',
      header: 'Unit Price',
      render: (item) => <span className="font-bold text-slate-900">${Number(item.unit_price).toFixed(2)}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => <Badge status={item.is_active ? 'Active' : 'Inactive'} />,
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const created = await createAddon({
          name: formData.name,
          code: formData.code,
          unit_price: parseFloat(formData.unit_price) || 0,
          billing_type: formData.billing_type,
          description: formData.description || null,
        });
        setAddons((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData({ name: '', code: '', unit_price: '', billing_type: 'recurring', description: '' });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create add-on');
      }
    });
  };

  const handleDelete = (item: AddOn) => {
    if (!confirm(`Remove add-on "${item.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteAddon(item.id);
        setAddons((prev) => prev.filter((a) => a.id !== item.id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete add-on');
      }
    });
  };

  return (
    <DashboardLayout title="Subscription Add-ons" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        <DataTable
          title="Add-ons & Supplementary Services"
          subtitle="Define recurring modules, seat packs, static IPs, and one-time implementation concierges"
          data={addons}
          columns={columns}
          searchPlaceholder="Search add-ons by name or code..."
          searchKey="name"
          addNewLabel="Add Add-on"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting add-ons...')}
          onView={(item) => alert(`Add-on: ${item.name}\nCode: ${item.code}\nType: ${BILLING_TYPE_LABELS[item.billing_type]}\nPrice: $${item.unit_price}`)}
          onEdit={(item) => alert(`Edit: ${item.name} — (edit form coming soon)`)}
          onDelete={handleDelete}
          filterKey="billing_type"
          filterOptions={[
            { label: 'Recurring', value: 'recurring' },
            { label: 'One-Time', value: 'one_time' },
            { label: 'Usage-Metered', value: 'usage_metered' },
          ]}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Add-on"
          subtitle="Configure an optional service customers can add to their active subscriptions"
          footer={
            <>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" form="add-addon-form" disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50">
                {isPending ? 'Saving...' : 'Save Add-on'}
              </button>
            </>
          }
        >
          <form id="add-addon-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Add-on Title *</label>
              <input type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Audit Log Vault (3-Year Retention)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Add-on Code *</label>
                <input type="text" required value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ADD-AUDIT-VAULT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Price ($) *</label>
                <input type="number" step="0.01" min="0" required value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="75.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Type</label>
                <select value={formData.billing_type}
                  onChange={(e) => setFormData({ ...formData, billing_type: e.target.value as BillingType })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                  <option value="recurring">Recurring</option>
                  <option value="one_time">One-Time</option>
                  <option value="usage_metered">Usage-Metered</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea rows={2} value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of features unlocked by this add-on..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
