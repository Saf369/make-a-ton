'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PAYMENT_TERMS_DATA } from '@/data/mockData';
import { CalendarClock } from 'lucide-react';

export default function PaymentTermsPage() {
  const [terms, setTerms] = useState(PAYMENT_TERMS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    days: 30,
    description: ''
  });

  const columns: Column<typeof PAYMENT_TERMS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Term ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Payment Term Schedule',
      render: (item) => <div className="font-semibold text-slate-900">{item.name}</div>
    },
    {
      key: 'days',
      header: 'Maturity / Days',
      render: (item) => (
        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs">
          {item.days === 0 ? 'Immediate' : `${item.days} Days`}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Application & Description',
      render: (item) => <span className="text-slate-600 text-xs">{item.description}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTerm = {
      id: `TERM-0${terms.length + 1}`,
      name: formData.name || 'Custom Maturity Term',
      days: Number(formData.days) || 0,
      description: formData.description || 'Enterprise payment policy',
      status: 'Active'
    };
    setTerms([newTerm, ...terms]);
    setIsModalOpen(false);
    setFormData({ name: '', days: 30, description: '' });
  };

  return (
    <DashboardLayout title="Payment Terms" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="Invoicing Maturity & Credit Term Policies"
          subtitle="Configure default due date offsets for corporate invoices, credit accounts, and wire payments"
          data={terms}
          columns={columns}
          searchPlaceholder="Search payment terms..."
          searchKey="name"
          addNewLabel="Add Payment Term"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting payment terms...')}
          onView={(item) => alert(`Term: ${item.name}`)}
          onEdit={(item) => alert(`Editing term: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove term ${item.name}?`)) {
              setTerms(terms.filter((t) => t.id !== item.id));
            }
          }}
        />

        {/* Add Payment Term Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Payment Term Schedule"
          subtitle="Define maturity terms applied on sales invoices"
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
                form="add-term-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Payment Term
              </button>
            </>
          }
        >
          <form id="add-term-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Term Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Net 45 Days Enterprise"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Days Until Due</label>
              <input
                type="number"
                required
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                placeholder="45"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Applies to vetted institutional partners..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
