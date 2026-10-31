'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { TAX_TEMPLATES_DATA } from '@/data/mockData';
import { Receipt } from 'lucide-react';

export default function TaxTemplatesPage() {
  const [taxes, setTaxes] = useState(TAX_TEMPLATES_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    countryRegion: 'India (Inter-state)',
    rate: '18.00%',
    taxType: 'Goods & Services Tax (GST)'
  });

  const columns: Column<typeof TAX_TEMPLATES_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Tax ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Tax Template Name',
      render: (item) => <div className="font-semibold text-slate-900">{item.name}</div>
    },
    {
      key: 'countryRegion',
      header: 'Country / Jurisdiction'
    },
    {
      key: 'rate',
      header: 'Tax Rate',
      render: (item) => (
        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded text-xs">
          {item.rate}
        </span>
      )
    },
    {
      key: 'taxType',
      header: 'Tax Category'
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newTax = {
      id: `TAX-0${taxes.length + 1}`,
      name: formData.name || 'GST Standard Rate 18%',
      countryRegion: formData.countryRegion || 'India',
      rate: formData.rate,
      taxType: formData.taxType,
      status: 'Active'
    };
    setTaxes([newTax, ...taxes]);
    setIsModalOpen(false);
    setFormData({ name: '', countryRegion: 'India (Inter-state)', rate: '18.00%', taxType: 'Goods & Services Tax (GST)' });
  };

  return (
    <DashboardLayout title="Tax Templates" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="GST Tax Rules & Jurisdictions"
          subtitle="Define statutory GST percentages (CGST, SGST, IGST), reverse charge schedules, and export/SEZ zero-rating"
          data={taxes}
          columns={columns}
          searchPlaceholder="Search tax templates..."
          searchKey="name"
          addNewLabel="Add Tax Template"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting tax templates...')}
          onView={(item) => alert(`Tax template: ${item.name}`)}
          onEdit={(item) => alert(`Editing tax: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove tax rule ${item.name}?`)) {
              setTaxes(taxes.filter((t) => t.id !== item.id));
            }
          }}
        />

        {/* Add Tax Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Tax Template"
          subtitle="Configure a GST tax rate applied automatically during subscription billing runs"
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
                form="add-tax-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Tax Rule
              </button>
            </>
          }
        >
          <form id="add-tax-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Template Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. IGST 18% (Inter-State B2B)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicable Country / Region</label>
                <input
                  type="text"
                  required
                  value={formData.countryRegion}
                  onChange={(e) => setFormData({ ...formData, countryRegion: e.target.value })}
                  placeholder="e.g. India (Inter-state)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rate (Percentage)</label>
                <input
                  type="text"
                  required
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  placeholder="18.00%"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax Category</label>
              <select
                value={formData.taxType}
                onChange={(e) => setFormData({ ...formData, taxType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option>Goods & Services Tax (GST)</option>
                <option>Integrated GST (IGST 18%)</option>
                <option>Central GST + State GST (CGST 9% + SGST 9%)</option>
                <option>Concessional GST (5%)</option>
                <option>Zero-Rated / SEZ Export (0%)</option>
                <option>Reverse Charge Mechanism (RCM)</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
