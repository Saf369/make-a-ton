'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { getProducts, createProduct, deleteProduct } from '@/lib/actions/subscription';
import { getCategories } from '@/lib/actions/subscription';
import type { Product, ProductCategory, BillingModel } from '@/lib/types/subscription';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category_id: '',
    billing_model: 'recurring' as BillingModel,
    sales_price: '',
    cost_price: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods);
      setCategories(cats);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const billingModelLabel: Record<BillingModel, string> = {
    recurring: 'Recurring SaaS',
    usage_based: 'Usage-Based',
    annual_license: 'Annual License',
    one_time: 'One-Time Fee',
  };

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.sku}</div>
        </div>
      ),
    },
    {
      key: 'category_id',
      header: 'Category',
      render: (item) => (
        <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
          {item.category?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'billing_model',
      header: 'Billing Model',
      render: (item) => (
        <span className="text-slate-700 text-xs">{billingModelLabel[item.billing_model]}</span>
      ),
    },
    {
      key: 'sales_price',
      header: 'Sales Price',
      render: (item) => (
        <span className="font-bold text-slate-900">${Number(item.sales_price).toFixed(2)}</span>
      ),
    },
    {
      key: 'cost_price',
      header: 'Cost Price',
      render: (item) => (
        <span className="text-slate-500">${Number(item.cost_price).toFixed(2)}</span>
      ),
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
        const created = await createProduct({
          name: formData.name,
          sku: formData.sku,
          category_id: formData.category_id || null,
          billing_model: formData.billing_model,
          sales_price: parseFloat(formData.sales_price) || 0,
          cost_price: parseFloat(formData.cost_price) || 0,
          notes: formData.notes || null,
        });
        setProducts((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData({ name: '', sku: '', category_id: '', billing_model: 'recurring', sales_price: '', cost_price: '', notes: '' });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create product');
      }
    });
  };

  const handleDelete = (item: Product) => {
    if (!confirm(`Remove product "${item.name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      try {
        await deleteProduct(item.id);
        setProducts((prev) => prev.filter((p) => p.id !== item.id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete product');
      }
    });
  };

  const activeCount = products.filter((p) => p.is_active).length;

  return (
    <DashboardLayout title="Products Catalog" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Active Products"
            value={`${activeCount} SKUs`}
            change={`${products.length} total`}
            trend="up"
            period="in catalog"
            iconName="Package"
          />
          <StatCard
            title="Avg Sales Price"
            value={products.length ? `$${(products.reduce((s, p) => s + Number(p.sales_price), 0) / products.length).toFixed(2)}` : '$0'}
            change="across all products"
            trend="neutral"
            period="per product"
            iconName="DollarSign"
          />
          <StatCard
            title="Categories"
            value={`${categories.length} segments`}
            change="organized taxonomy"
            trend="neutral"
            period="active"
            iconName="Layers"
          />
        </div>

        <DataTable
          title="Subscription Products Catalog"
          subtitle="Define recurring software services, metered billing products, and standalone licenses"
          data={products}
          columns={columns}
          searchPlaceholder="Search products by name or SKU..."
          searchKey="name"
          addNewLabel="Add Product"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => {
            const csv = [
              ['Name', 'SKU', 'Category', 'Billing Model', 'Sales Price', 'Cost Price', 'Status'],
              ...products.map((p) => [p.name, p.sku, p.category?.name ?? '', billingModelLabel[p.billing_model], p.sales_price, p.cost_price, p.is_active ? 'Active' : 'Inactive']),
            ].map((r) => r.join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'products.csv';
            a.click();
          }}
          onView={(item) => alert(`Product: ${item.name}\nSKU: ${item.sku}\nSales Price: $${item.sales_price}\nCost: $${item.cost_price}\nNotes: ${item.notes ?? 'None'}`)}
          onEdit={(item) => alert(`Edit product: ${item.name} — (edit form coming in next iteration)`)}
          onDelete={handleDelete}
          filterKey="is_active"
          filterOptions={[
            { label: 'Active', value: true as unknown as string },
            { label: 'Inactive', value: false as unknown as string },
          ]}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Subscription Product"
          subtitle="Add a product definition to the Brightloop Hub catalog"
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
                form="add-product-form"
                disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Product'}
              </button>
            </>
          }
        >
          <form id="add-product-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Brightloop AI Copilot"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">SKU / Code *</label>
                <input
                  type="text"
                  required
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. BL-AI-COPILOT"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing Model *</label>
              <select
                value={formData.billing_model}
                onChange={(e) => setFormData({ ...formData, billing_model: e.target.value as BillingModel })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option value="recurring">Recurring SaaS</option>
                <option value="usage_based">Usage-Based (Metered)</option>
                <option value="annual_license">Annual License</option>
                <option value="one_time">One-Time Fee</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sales Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.sales_price}
                  onChange={(e) => setFormData({ ...formData, sales_price: e.target.value })}
                  placeholder="199.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cost_price}
                  onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                  placeholder="45.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Internal notes about this product..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
