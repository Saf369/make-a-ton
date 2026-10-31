'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { PRODUCTS_DATA } from '@/data/mockData';
import { Package, Layers, Tag, DollarSign } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState(PRODUCTS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Software Platforms',
    type: 'Recurring SaaS',
    basePrice: '$199.00 / mo'
  });

  const columns: Column<typeof PRODUCTS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Product ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Product Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.sku}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (item) => (
        <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
          {item.category}
        </span>
      )
    },
    {
      key: 'type',
      header: 'Billing Model'
    },
    {
      key: 'basePrice',
      header: 'Base Price',
      render: (item) => <span className="font-bold text-slate-900">{item.basePrice}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      id: `PROD-10${products.length + 1}`,
      name: formData.name || 'New SaaS Product',
      sku: formData.sku || `BL-SKU-${products.length + 1}`,
      category: formData.category,
      type: formData.type,
      basePrice: formData.basePrice || '$99.00 / mo',
      status: 'Active'
    };
    setProducts([newProduct, ...products]);
    setIsModalOpen(false);
    setFormData({ name: '', sku: '', category: 'Software Platforms', type: 'Recurring SaaS', basePrice: '$199.00 / mo' });
  };

  return (
    <DashboardLayout title="Products Catalog" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {/* Top Product Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Active Products"
            value="18 SKUs"
            change="+2 this quarter"
            trend="up"
            period="catalog count"
            iconName="Package"
          />
          <StatCard
            title="Avg Product ARPU"
            value="$420.00"
            change="+6.2%"
            trend="up"
            period="per active subscription"
            iconName="DollarSign"
          />
          <StatCard
            title="Product Categories"
            value="4 Taxonomies"
            change="100% active"
            trend="neutral"
            period="organized"
            iconName="Layers"
          />
        </div>

        <DataTable
          title="Subscription Products Catalog"
          subtitle="Define recurring software services, metered billing products, and standalone licenses"
          data={products}
          columns={columns}
          searchPlaceholder="Search products by title or SKU..."
          searchKey="name"
          addNewLabel="Add Product"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting product catalog to CSV...')}
          onView={(item) => alert(`Viewing details for ${item.name}`)}
          onEdit={(item) => alert(`Editing product: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove product ${item.name}?`)) {
              setProducts(products.filter((p) => p.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Maintenance', value: 'Maintenance' }
          ]}
        />

        {/* Add Product Modal */}
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
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Product
              </button>
            </>
          }
        >
          <form id="add-product-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Product Title</label>
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
                <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Base Price</label>
                <input
                  type="text"
                  required
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="e.g. $149.00 / mo"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Software Platforms</option>
                  <option>Developer Tools</option>
                  <option>Data & Analytics</option>
                  <option>Services</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Model</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Recurring SaaS</option>
                  <option>Usage-Based (Metered)</option>
                  <option>Annual License</option>
                  <option>One-Time Fee</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
