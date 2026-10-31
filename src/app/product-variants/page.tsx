'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { VARIANTS_DATA } from '@/data/mockData';
import { Layers } from 'lucide-react';

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState(VARIANTS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product: 'Brightloop Hub Cloud',
    name: '',
    code: '',
    billingPeriod: 'Monthly',
    price: '₹11,999.00'
  });

  const columns: Column<typeof VARIANTS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Variant ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Variant Tier & Code',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.code}</div>
        </div>
      )
    },
    {
      key: 'product',
      header: 'Parent Product',
      render: (item) => <span className="font-medium text-slate-700">{item.product}</span>
    },
    {
      key: 'billingPeriod',
      header: 'Billing Frequency',
      render: (item) => (
        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-medium">
          {item.billingPeriod}
        </span>
      )
    },
    {
      key: 'price',
      header: 'Price Point',
      render: (item) => <span className="font-bold text-slate-900">{item.price}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newVariant = {
      id: `VAR-20${variants.length + 1}`,
      product: formData.product,
      name: formData.name || 'Custom Scale Variant',
      code: formData.code || `VAR-CODE-${variants.length + 1}`,
      billingPeriod: formData.billingPeriod,
      price: formData.price || '₹7,999.00',
      status: 'Available'
    };
    setVariants([newVariant, ...variants]);
    setIsModalOpen(false);
    setFormData({ product: 'Brightloop Hub Cloud', name: '', code: '', billingPeriod: 'Monthly', price: '₹11,999.00' });
  };

  return (
    <DashboardLayout title="Product Variants" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        <DataTable
          title="Product Variants & Billing Cadences"
          subtitle="Configure plan variations by frequency (monthly/annual), usage tiers, and user seat quotas"
          data={variants}
          columns={columns}
          searchPlaceholder="Search variants by name or parent product..."
          searchKey="name"
          addNewLabel="Add Variant"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting variants...')}
          onView={(item) => alert(`Variant: ${item.name}`)}
          onEdit={(item) => alert(`Editing variant: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove variant ${item.name}?`)) {
              setVariants(variants.filter((v) => v.id !== item.id));
            }
          }}
        />

        {/* Add Variant Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Product Variant"
          subtitle="Configure pricing and frequency options for an existing product"
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
                form="add-var-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Variant
              </button>
            </>
          }
        >
          <form id="add-var-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Product</label>
              <select
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option>Brightloop Hub Cloud</option>
                <option>Brightloop API Gateway</option>
                <option>Enterprise Data Lake Sync</option>
                <option>Premium Support Concierge</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variant Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Scale Tier (50 seats)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variant Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. BL-CLOUD-SCALE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Period</label>
                <select
                  value={formData.billingPeriod}
                  onChange={(e) => setFormData({ ...formData, billingPeriod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Monthly</option>
                  <option>Quarterly</option>
                  <option>Semi-Annual</option>
                  <option>Annual</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price</label>
                <input
                  type="text"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="₹18,999.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
