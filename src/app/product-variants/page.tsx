'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getVariants, getProducts, createVariant, deleteVariant } from '@/lib/actions/subscription';
import type { ProductVariant, Product, BillingInterval } from '@/lib/types/subscription';

const INTERVAL_LABELS: Record<BillingInterval, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annual: 'Semi-Annual',
  annual: 'Annual',
};

export default function ProductVariantsPage() {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    product_id: '',
    name: '',
    code: '',
    billing_interval: 'monthly' as BillingInterval,
    billing_interval_count: '1',
    final_price: '',
    price_adjustment: '0',
    min_quantity: '1',
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [vars, prods] = await Promise.all([getVariants(), getProducts()]);
      setVariants(vars);
      setProducts(prods);
      if (prods.length > 0) {
        setFormData((prev) => ({ ...prev, product_id: prods[0].id }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load variants');
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<ProductVariant>[] = [
    {
      key: 'name',
      header: 'Variant Tier & Code',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.code}</div>
        </div>
      ),
    },
    {
      key: 'product_id',
      header: 'Parent Product',
      render: (item) => (
        <span className="font-medium text-slate-700">{item.product?.name ?? '—'}</span>
      ),
    },
    {
      key: 'billing_interval',
      header: 'Billing Frequency',
      render: (item) => (
        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[11px] font-medium">
          {INTERVAL_LABELS[item.billing_interval]}
          {item.billing_interval_count > 1 ? ` × ${item.billing_interval_count}` : ''}
        </span>
      ),
    },
    {
      key: 'final_price',
      header: 'Price',
      render: (item) => (
        <span className="font-bold text-slate-900">${Number(item.final_price).toFixed(2)}</span>
      ),
    },
    {
      key: 'min_quantity',
      header: 'Min Qty',
      render: (item) => <span className="text-slate-600">{item.min_quantity}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => <Badge status={item.is_active ? 'Available' : 'Inactive'} />,
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const created = await createVariant({
          product_id: formData.product_id,
          name: formData.name,
          code: formData.code,
          billing_interval: formData.billing_interval,
          billing_interval_count: parseInt(formData.billing_interval_count) || 1,
          final_price: parseFloat(formData.final_price) || 0,
          price_adjustment: parseFloat(formData.price_adjustment) || 0,
          min_quantity: parseInt(formData.min_quantity) || 1,
        });
        setVariants((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData((prev) => ({ ...prev, name: '', code: '', final_price: '', price_adjustment: '0', min_quantity: '1' }));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create variant');
      }
    });
  };

  const handleDelete = (item: ProductVariant) => {
    if (!confirm(`Remove variant "${item.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteVariant(item.id);
        setVariants((prev) => prev.filter((v) => v.id !== item.id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete variant');
      }
    });
  };

  return (
    <DashboardLayout title="Product Variants" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        <DataTable
          title="Product Variants & Billing Cadences"
          subtitle="Configure plan variations by interval (daily/weekly/monthly/annual), usage tiers, and minimum quantities"
          data={variants}
          columns={columns}
          searchPlaceholder="Search variants by name or code..."
          searchKey="name"
          addNewLabel="Add Variant"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting variants...')}
          onView={(item) => alert(`Variant: ${item.name}\nCode: ${item.code}\nInterval: ${INTERVAL_LABELS[item.billing_interval]}\nPrice: $${item.final_price}\nMin Qty: ${item.min_quantity}`)}
          onEdit={(item) => alert(`Edit variant: ${item.name} — (edit form coming soon)`)}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Product Variant"
          subtitle="Configure pricing and frequency options for an existing product"
          footer={
            <>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" form="add-var-form" disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50">
                {isPending ? 'Saving...' : 'Save Variant'}
              </button>
            </>
          }
        >
          <form id="add-var-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Parent Product *</label>
              <select value={formData.product_id} required
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variant Name *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Scale Tier (50 seats)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Variant Code *</label>
                <input type="text" required value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="e.g. BL-CLOUD-SCALE"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none" />
              </div>
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
                <label className="block font-semibold text-slate-700 mb-1">Final Price ($) *</label>
                <input type="number" step="0.01" min="0" required value={formData.final_price}
                  onChange={(e) => setFormData({ ...formData, final_price: e.target.value })}
                  placeholder="149.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Price Adjustment ($)</label>
                <input type="number" step="0.01" value={formData.price_adjustment}
                  onChange={(e) => setFormData({ ...formData, price_adjustment: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
                <p className="text-slate-400 mt-1">Delta on top of product base price</p>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
