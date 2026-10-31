'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { QUOTATIONS_DATA } from '@/data/mockData';
import { FileSpreadsheet, Send, CheckCircle, Clock } from 'lucide-react';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState(QUOTATIONS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    title: '',
    total: '$15,000.00',
    expiryDate: '2026-11-30',
    rep: 'Elena Rostova'
  });

  const columns: Column<typeof QUOTATIONS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Quote #',
      width: 'w-28',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'title',
      header: 'Proposal Title & Customer',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.title}</div>
          <div className="text-slate-500 text-[11px]">{item.customer}</div>
        </div>
      )
    },
    {
      key: 'rep',
      header: 'Sales Rep'
    },
    {
      key: 'expiryDate',
      header: 'Valid Until',
      render: (item) => <span className="font-mono text-slate-600 text-[11px]">{item.expiryDate}</span>
    },
    {
      key: 'total',
      header: 'Total Value',
      render: (item) => <span className="font-bold text-slate-900">{item.total}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuo = {
      id: `QUO-2026-08${quotations.length + 2}`,
      customer: formData.customer || 'Prospective Enterprise Client',
      title: formData.title || 'Annual SaaS Subscription License',
      total: formData.total,
      expiryDate: formData.expiryDate,
      status: 'Sent',
      rep: formData.rep
    };
    setQuotations([newQuo, ...quotations]);
    setIsModalOpen(false);
    setFormData({ customer: '', title: '', total: '$15,000.00', expiryDate: '2026-11-30', rep: 'Elena Rostova' });
  };

  return (
    <DashboardLayout title="Quotations & Proposals" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="Sales Quotations & Formal Offers"
          subtitle="Generate, send, and track commercial proposals for custom subscriptions"
          data={quotations}
          columns={columns}
          searchPlaceholder="Search quotations..."
          searchKey="title"
          addNewLabel="New Quotation"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting quotations...')}
          onView={(item) => alert(`Viewing quotation ${item.id}`)}
          onEdit={(item) => alert(`Editing quote: ${item.id}`)}
          onDelete={(item) => {
            if (confirm(`Delete quote ${item.id}?`)) {
              setQuotations(quotations.filter((q) => q.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Sent', value: 'Sent' },
            { label: 'Approved', value: 'Approved' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Declined', value: 'Declined' }
          ]}
        />

        {/* Add Quotation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Draft New Sales Quotation"
          subtitle="Prepare an official commercial offer for a prospective or existing client"
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
                form="add-quote-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Create & Send Quote
              </button>
            </>
          }
        >
          <form id="add-quote-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Proposal Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Enterprise Cloud Annual Subscription Deal"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Organization</label>
                <input
                  type="text"
                  required
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="e.g. Apex Global Logistics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <select
                  value={formData.rep}
                  onChange={(e) => setFormData({ ...formData, rep: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Elena Rostova</option>
                  <option>Amina Khatib</option>
                  <option>Marcus Brody</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Quotation Value</label>
                <input
                  type="text"
                  required
                  value={formData.total}
                  onChange={(e) => setFormData({ ...formData, total: e.target.value })}
                  placeholder="$24,000.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
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
