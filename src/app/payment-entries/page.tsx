'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { PAYMENT_ENTRIES_DATA } from '@/data/mockData';
import { CreditCard, CheckCircle2, IndianRupee, Wallet, Percent, Building2, Calendar, FileText } from 'lucide-react';

export default function PaymentEntriesPage() {
  const [payments, setPayments] = useState(PAYMENT_ENTRIES_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState<typeof PAYMENT_ENTRIES_DATA[0] | null>(null);
  const [formData, setFormData] = useState({
    customer: '',
    invoice: 'INV-2026-0985',
    amount: '₹12,000.00',
    method: 'UPI (Google Pay / PhonePe)',
    transactionRef: 'UPI/2610319901/OKAXIS'
  });

  const columns: Column<typeof PAYMENT_ENTRIES_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Payment ID',
      width: 'w-28',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => <div className="font-semibold text-slate-900">{item.customer}</div>
    },
    {
      key: 'invoice',
      header: 'Linked Invoice',
      render: (item) => <span className="font-mono text-indigo-600 font-medium text-[11px]">{item.invoice}</span>
    },
    {
      key: 'method',
      header: 'Payment Instrument',
      render: (item) => (
        <div>
          <div className="font-medium text-slate-800 text-xs">{item.method}</div>
          <div className="text-slate-400 font-mono text-[10px]">{item.transactionRef}</div>
        </div>
      )
    },
    {
      key: 'date',
      header: 'Date & Time',
      render: (item) => <span className="text-slate-600 font-mono text-[11px]">{item.date}</span>
    },
    {
      key: 'amount',
      header: 'Settled Amount',
      render: (item) => <span className="font-bold text-slate-900">{item.amount}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newPay = {
      id: `PAY-889${payments.length + 2}`,
      customer: formData.customer || 'Customer Organization',
      invoice: formData.invoice,
      amount: formData.amount,
      method: formData.method,
      transactionRef: formData.transactionRef,
      date: '2026-10-31',
      status: 'Settled'
    };
    setPayments([newPay, ...payments]);
    setIsModalOpen(false);
    setFormData({ customer: '', invoice: 'INV-2026-0985', amount: '₹12,000.00', method: 'UPI (Google Pay / PhonePe)', transactionRef: 'UPI/2610319901/OKAXIS' });
  };

  return (
    <DashboardLayout title="Payment Entries" moduleName="SALES MODULE">
      <div className="space-y-6">
        {/* Payment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Settled Collections"
            value="₹2,27,490.00"
            change="+11.2%"
            trend="up"
            period="past 7 days"
            iconName="IndianRupee"
          />
          <StatCard
            title="Gateway Payout Balance"
            value="₹9,85,000.00"
            change="Razorpay / Bank Connected"
            trend="neutral"
            period="ready for transfer"
            iconName="Wallet"
          />
          <StatCard
            title="Gateway Chargeback Rate"
            value="0.02%"
            change="Excellent"
            trend="neutral"
            period="well below 0.5% threshold"
            iconName="Percent"
          />
        </div>

        <DataTable
          title="Payment Receipts & Gateway Transactions"
          subtitle="Audit log of all successful and failed payment processor transactions, UPI receipts, and NEFT transfers"
          data={payments}
          columns={columns}
          searchPlaceholder="Search payments by customer or transaction ref..."
          searchKey="customer"
          addNewLabel="Record Payment"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting payment ledger...')}
          onView={(item) => setViewingPayment(item)}
          onEdit={(item) => alert(`Editing payment ${item.id}`)}
          onDelete={(item) => {
            if (confirm(`Reverse payment ${item.id}?`)) {
              setPayments(payments.filter((p) => p.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Settled', value: 'Settled' },
            { label: 'Failed', value: 'Failed' }
          ]}
        />

        {/* View Payment Detail Modal (Preserves list scroll position) */}
        {viewingPayment && (
          <Modal
            isOpen={!!viewingPayment}
            onClose={() => setViewingPayment(null)}
            title={`Payment Receipt — ${viewingPayment.id}`}
            subtitle="Financial settlement receipt and reconciliation transaction verification"
            footer={
              <button
                type="button"
                onClick={() => setViewingPayment(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{viewingPayment.id}</span>
                  <Badge status={viewingPayment.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-600 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer: <strong className="text-slate-800">{viewingPayment.customer}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Linked Invoice: <strong className="text-slate-800">{viewingPayment.invoice}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Settled Date: <strong className="text-slate-800">{viewingPayment.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>Amount: <strong className="text-slate-900">{viewingPayment.amount}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment Instrument: <strong className="text-slate-800">{viewingPayment.method}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2 font-mono text-[10px] text-slate-500">
                    <span>Reference: {viewingPayment.transactionRef}</span>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Payment Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Received Payment"
          subtitle="Log a manual check, NEFT bank transfer, or offline payment against an invoice"
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
                form="add-payment-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Log Payment Entry
              </button>
            </>
          }
        >
          <form id="add-payment-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Linked Invoice #</label>
                <input
                  type="text"
                  required
                  value={formData.invoice}
                  onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                  placeholder="INV-2026-0985"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Settled Amount</label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₹12,000.00"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>UPI (Google Pay / PhonePe)</option>
                  <option>NEFT / RTGS Bank Transfer</option>
                  <option>Net Banking (HDFC / ICICI / SBI)</option>
                  <option>Corporate Credit Card</option>
                  <option>Cheque / Demand Draft</option>
                  <option>Cash / Petty Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={formData.transactionRef}
                  onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                  placeholder="UPI/2610319901/OKAXIS"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
