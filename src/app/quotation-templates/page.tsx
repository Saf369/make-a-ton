'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { QUOTATION_TEMPLATES } from '@/data/mockData';
import { FileCode } from 'lucide-react';

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState(QUOTATION_TEMPLATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    validDays: 30,
    discountDefault: '10%',
    defaultTerms: 'Net 30 Days'
  });

  const columns: Column<typeof QUOTATION_TEMPLATES[0]>[] = [
    {
      key: 'id',
      header: 'Template ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Proposal Template Name',
      render: (item) => <div className="font-semibold text-slate-900">{item.name}</div>
    },
    {
      key: 'validDays',
      header: 'Validity Period',
      render: (item) => <span className="text-slate-600">{item.validDays} Days</span>
    },
    {
      key: 'discountDefault',
      header: 'Standard Discount',
      render: (item) => (
        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
          {item.discountDefault}
        </span>
      )
    },
    {
      key: 'defaultTerms',
      header: 'Default Payment Terms',
      render: (item) => <span className="text-slate-600 text-xs">{item.defaultTerms}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTemplate = {
      id: `QT-00${templates.length + 1}`,
      name: formData.name || 'New Contract Proposal Template',
      validDays: Number(formData.validDays) || 30,
      discountDefault: formData.discountDefault,
      defaultTerms: formData.defaultTerms,
      status: 'Active'
    };
    setTemplates([newTemplate, ...templates]);
    setIsModalOpen(false);
    setFormData({ name: '', validDays: 30, discountDefault: '10%', defaultTerms: 'Net 30 Days' });
  };

  return (
    <DashboardLayout title="Quotation Templates" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="Sales Proposal & Quotation Templates"
          subtitle="Pre-configured quotation terms, pricing clauses, and standard enterprise discount schedules"
          data={templates}
          columns={columns}
          searchPlaceholder="Search quotation templates..."
          searchKey="name"
          addNewLabel="Add Template"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting templates...')}
          onView={(item) => alert(`Viewing template: ${item.name}`)}
          onEdit={(item) => alert(`Editing template: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove template ${item.name}?`)) {
              setTemplates(templates.filter((t) => t.id !== item.id));
            }
          }}
        />

        {/* Add Template Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create Quotation Template"
          subtitle="Define default parameters and line items for sales proposals"
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
                form="add-template-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Template
              </button>
            </>
          }
        >
          <form id="add-template-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Enterprise Multi-Year SaaS Proposal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Validity (Days)</label>
                <input
                  type="number"
                  required
                  value={formData.validDays}
                  onChange={(e) => setFormData({ ...formData, validDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Discount</label>
                <input
                  type="text"
                  value={formData.discountDefault}
                  onChange={(e) => setFormData({ ...formData, discountDefault: e.target.value })}
                  placeholder="10%"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Payment Terms</label>
              <input
                type="text"
                value={formData.defaultTerms}
                onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
                placeholder="Net 30, 100% due upon counter-signature"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
