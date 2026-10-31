'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { ADDONS_DATA } from '@/data/mockData';
import { Puzzle } from 'lucide-react';

export default function AddOnsPage() {
  const [addons, setAddons] = useState(ADDONS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    unitPrice: '$49.00/mo',
    billingType: 'Recurring',
    description: ''
  });

  const columns: Column<typeof ADDONS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Add-on ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Add-on Title & Code',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.code}</div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => <span className="text-slate-600 text-xs">{item.description}</span>
    },
    {
      key: 'billingType',
      header: 'Billing Type',
      render: (item) => (
        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
          {item.billingType}
        </span>
      )
    },
    {
      key: 'unitPrice',
      header: 'Price',
      render: (item) => <span className="font-bold text-slate-900">{item.unitPrice}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAddon = {
      id: `ADD-30${addons.length + 1}`,
      name: formData.name || 'Custom Feature Add-on',
      code: formData.code || `ADD-CODE-${addons.length + 1}`,
      unitPrice: formData.unitPrice,
      billingType: formData.billingType,
      description: formData.description || 'Optional extra service item',
      status: 'Active'
    };
    setAddons([newAddon, ...addons]);
    setIsModalOpen(false);
    setFormData({ name: '', code: '', unitPrice: '$49.00/mo', billingType: 'Recurring', description: '' });
  };

  return (
    <DashboardLayout title="Subscription Add-ons" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        <DataTable
          title="Add-ons & Supplementary Services"
          subtitle="Define recurring modules, seat packs, static IPs, and one-time implementation concierges"
          data={addons}
          columns={columns}
          searchPlaceholder="Search add-ons..."
          searchKey="name"
          addNewLabel="Add Add-on"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting add-ons...')}
          onView={(item) => alert(`Add-on: ${item.name}`)}
          onEdit={(item) => alert(`Editing add-on: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove add-on ${item.name}?`)) {
              setAddons(addons.filter((a) => a.id !== item.id));
            }
          }}
        />

        {/* Add Add-on Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Add-on"
          subtitle="Configure an optional service customers can add to their active subscriptions"
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
                form="add-addon-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Add-on
              </button>
            </>
          }
        >
          <form id="add-addon-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Add-on Title</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Audit Log Vault (3-Year Retention)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Add-on Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ADD-AUDIT-VAULT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Unit Price</label>
                <input
                  type="text"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="$75.00/mo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Type</label>
                <select
                  value={formData.billingType}
                  onChange={(e) => setFormData({ ...formData, billingType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Recurring</option>
                  <option>One-Time</option>
                  <option>Usage-Metered</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of features unlocked by this add-on..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
