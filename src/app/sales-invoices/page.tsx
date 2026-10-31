'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { RECENT_INVOICES } from '@/data/mockData';
import { FileCheck2, Download, IndianRupee, Clock, AlertCircle, Building2, Calendar, CreditCard } from 'lucide-react';

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState(RECENT_INVOICES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState<typeof RECENT_INVOICES[0] | null>(null);
  const [formData, setFormData] = useState({
    customer: '',
    amount: '₹45,000.00',
    dueDate: '2026-11-15',
    method: 'NEFT / RTGS (HDFC Bank)'
  });

  const columns: Column<typeof RECENT_INVOICES[0]>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      width: 'w-32',
      render: (item) => <span className="font-mono font-semibold text-slate-900">{item.invoiceNumber}</span>
    },
    {
      key: 'customer',
      header: 'Customer Organization',
      render: (item) => <div className="font-semibold text-slate-900">{item.customer}</div>
    },
    {
      key: 'issueDate',
      header: 'Issue Date',
      render: (item) => <span className="text-slate-500 font-mono text-[11px]">{item.issueDate}</span>
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      render: (item) => <span className="text-slate-600 font-mono text-[11px]">{item.dueDate}</span>
    },
    {
      key: 'amount',
      header: 'Total Billed',
      render: (item) => <span className="font-bold text-slate-900">{item.amount}</span>
    },
    {
      key: 'status',
      header: 'Payment Status'
    },
    {
      key: 'method',
      header: 'Collection Method',
      render: (item) => <span className="text-slate-500 text-[11px]">{item.method}</span>
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv = {
      invoiceNumber: `INV-2026-098${invoices.length + 3}`,
      customer: formData.customer || 'Enterprise Client Inc.',
      amount: formData.amount,
      issueDate: '2026-10-31',
      dueDate: formData.dueDate,
      status: 'Unpaid',
      method: formData.method
    };
    setInvoices([newInv, ...invoices]);
    setIsModalOpen(false);
    setFormData({ customer: '', amount: '₹45,000.00', dueDate: '2026-11-15', method: 'NEFT / RTGS (HDFC Bank)' });
  };

  return (
    <DashboardLayout title="Sales Invoices" moduleName="SALES MODULE">
      <div className="space-y-6">
        {/* Invoice KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Invoiced This Month"
            value="₹18,42,000.00"
            change="+9.5%"
            trend="up"
            period="vs last month"
            iconName="IndianRupee"
          />
          <StatCard
            title="Paid & Reconciled"
            value="₹16,84,000.00"
            change="91.4% collected"
            trend="up"
            period="healthy cash flow"
            iconName="TrendingUp"
          />
          <StatCard
            title="Overdue / Pending"
            value="₹1,58,000.00"
            change="3 invoices"
            trend="down"
            period="in dunning retry"
            iconName="Percent"
          />
        </div>

        <DataTable
          title="Tax Invoices & Billing Receivables"
          subtitle="Complete register of all subscription invoices, settlement statuses, and payment receipts"
          data={invoices}
          columns={columns}
          searchPlaceholder="Search invoices by customer or #..."
          searchKey="customer"
          addNewLabel="Create Invoice"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting all sales invoices to CSV...')}
          onView={(item) => setViewingInvoice(item)}
          onEdit={(item) => alert(`Editing invoice ${item.invoiceNumber}`)}
          onDelete={(item) => {
            if (confirm(`Void invoice ${item.invoiceNumber}?`)) {
              setInvoices(invoices.filter((inv) => inv.invoiceNumber !== item.invoiceNumber));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Paid', value: 'Paid' },
            { label: 'Overdue', value: 'Overdue' },
            { label: 'Draft', value: 'Draft' },
            { label: 'Unpaid', value: 'Unpaid' }
          ]}
        />

        {/* View Invoice Detail Modal (Preserves list scroll position) */}
        {viewingInvoice && (
          <Modal
            isOpen={!!viewingInvoice}
            onClose={() => setViewingInvoice(null)}
            title={`Invoice Details — ${viewingInvoice.invoiceNumber}`}
            subtitle="Commercial invoice details, tax snapshots, and reconciliation status"
            footer={
              <button
                type="button"
                onClick={() => setViewingInvoice(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{viewingInvoice.invoiceNumber}</span>
                  <Badge status={viewingInvoice.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-600 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer: <strong className="text-slate-800">{viewingInvoice.customer}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>Total Billed: <strong className="text-slate-900">{viewingInvoice.amount}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issue Date: <strong className="text-slate-800">{viewingInvoice.issueDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Due Date: <strong className="text-slate-800">{viewingInvoice.dueDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment Method: <strong className="text-slate-800">{viewingInvoice.method}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Invoice Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Issue Manual Invoice"
          subtitle="Generate an ad-hoc or standard subscription billing invoice"
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
                form="add-invoice-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Issue Invoice
              </button>
            </>
          }
        >
          <form id="add-invoice-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Organization</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="e.g. Tata Consultancy Services"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Amount</label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₹45,000.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method / Terms</label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              >
                <option>NEFT / RTGS (HDFC Bank)</option>
                <option>UPI (Google Pay / PhonePe)</option>
                <option>Corporate Credit Card</option>
                <option>Net Banking (ICICI Bank)</option>
                <option>Invoice Net 15</option>
              </select>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
