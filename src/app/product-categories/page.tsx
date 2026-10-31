'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { getCategories, createCategory, deleteCategory } from '@/lib/actions/subscription';
import type { ProductCategory } from '@/lib/types/subscription';
import { FolderKanban } from 'lucide-react';

export default function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({ name: '', slug: '', description: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      setCategories(await getCategories());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  const columns: Column<ProductCategory>[] = [
    {
      key: 'name',
      header: 'Category Name',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 font-mono text-[11px]">/{item.slug}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => <span className="text-slate-600 text-xs">{item.description ?? '—'}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (item) => <Badge status={item.is_active ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (item) => (
        <span className="text-slate-500 text-[11px]">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const slug = formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const created = await createCategory({ name: formData.name, slug, description: formData.description || null });
        setCategories((prev) => [created, ...prev]);
        setIsModalOpen(false);
        setFormData({ name: '', slug: '', description: '' });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to create category');
      }
    });
  };

  const handleDelete = (item: ProductCategory) => {
    if (!confirm(`Delete category "${item.name}"? Products using this category will become uncategorized.`)) return;
    startTransition(async () => {
      try {
        await deleteCategory(item.id);
        setCategories((prev) => prev.filter((c) => c.id !== item.id));
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to delete category');
      }
    });
  };

  return (
    <DashboardLayout title="Product Categories" moduleName="SUBSCRIPTION MODULE">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span className="font-semibold">Error:</span> {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700 font-bold">✕</button>
          </div>
        )}

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
          onView={(item) => alert(`Category: ${item.name}\nSlug: ${item.slug}\n${item.description ?? ''}`)}
          onEdit={(item) => alert(`Edit category: ${item.name} — (edit form coming soon)`)}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Product Category"
          subtitle="Define a group for organizing subscription products"
          footer={
            <>
              <button type="button" onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button type="submit" form="add-cat-form" disabled={isPending}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs disabled:opacity-50">
                {isPending ? 'Saving...' : 'Save Category'}
              </button>
            </>
          }
        >
          <form id="add-cat-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category Title *</label>
              <input type="text" required value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. AI & Machine Learning Tools"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Slug (URL identifier)</label>
              <input type="text" value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="auto-generated if left blank"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none" />
              <p className="text-slate-400 mt-1">Leave blank to auto-generate from name</p>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea rows={3} value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Explain what kind of products belong in this category..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none" />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
