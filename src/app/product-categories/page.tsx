'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { CATEGORIES_DATA } from '@/data/mockData';
import { FolderKanban, Package } from 'lucide-react';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState(CATEGORIES_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  const columns: Column<typeof CATEGORIES_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Category ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Category Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">/{item.slug}</div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => <span className="text-slate-600 text-xs">{item.description}</span>
    },
    {
      key: 'productCount',
      header: 'Assigned Products',
      render: (item) => (
        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
          {item.productCount} SKUs
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCat = {
      id: `CAT-0${categories.length + 1}`,
      name: formData.name || 'New Category',
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.description || 'General product taxonomy',
      productCount: 0,
      status: 'Active'
    };
    setCategories([newCat, ...categories]);
    setIsModalOpen(false);
    setFormData({ name: '', slug: '', description: '' });
  };

  return (
    <DashboardLayout title="Product Categories" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        <DataTable
          title="Product Taxonomies & Classifications"
          subtitle="Organize subscription offerings into structured business segments and pricing families"
          data={categories}
          columns={columns}
          searchPlaceholder="Search categories..."
          searchKey="name"
          addNewLabel="Add Category"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting categories...')}
          onView={(item) => alert(`Category: ${item.name}`)}
          onEdit={(item) => alert(`Editing category: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Delete category ${item.name}?`)) {
              setCategories(categories.filter((c) => c.id !== item.id));
            }
          }}
        />

        {/* Add Category Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Product Category"
          subtitle="Define a group for grouping subscription products and pricing rules"
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
                form="add-cat-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Category
              </button>
            </>
          }
        >
          <form id="add-cat-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category Title</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AI & Machine Learning Tools"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Slug (URL / API)</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="e.g. ai-ml-tools"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what kind of products belong in this category..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
