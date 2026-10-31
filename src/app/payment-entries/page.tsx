'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { PAYMENT_ENTRIES_DATA } from '@/data/mockData';
import { CreditCard, CheckCircle2, DollarSign, Wallet } from 'lucide-react';

export default function PaymentEntriesPage() {
  const [payments, setPayments] = useState(PAYMENT_ENTRIES_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    invoice: 'INV-2026-0985',
    amount: '$1,200.00',
    method: 'Credit Card (Stripe)',
    transactionRef: 'ch_manual_ref_1092'
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
    setFormData({ customer: '', invoice: 'INV-2026-0985', amount: '$1,200.00', method: 'Credit Card (Stripe)', transactionRef: 'ch_manual_ref_1092' });
  };

  return (
    <DashboardLayout title="Payment Entries" moduleName="SALES MODULE">
      <div className="space-y-6">
        {/* Payment Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Settled Collections"
            value="$22,749.00"
            change="+11.2%"
            trend="up"
            period="past 7 days"
            iconName="DollarSign"
          />
          <StatCard
            title="Gateway Payout Balance"
            value="$98,500.00"
            change="Stripe Connected"
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
          subtitle="Audit log of all successful and failed payment processor transactions, ACH debits, and wires"
          data={payments}
          columns={columns}
          searchPlaceholder="Search payments by customer or transaction ref..."
          searchKey="customer"
          addNewLabel="Record Payment"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting payment entries...')}
          onView={(item) => alert(`Payment ${item.id}`)}
          filterKey="status"
          filterOptions={[
            { label: 'Settled', value: 'Settled' },
            { label: 'Failed', value: 'Failed' }
          ]}
        />

        {/* Add Payment Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record Manual Payment Entry"
          subtitle="Log a bank wire, check, or external payment against an outstanding invoice"
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
                form="add-pay-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Record Payment
              </button>
            </>
          }
        >
          <form id="add-pay-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer</label>
              <input
                type="text"
                required
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="e.g. Solaria Energy Corp"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={formData.invoice}
                  onChange={(e) => setFormData({ ...formData, invoice: e.target.value })}
                  placeholder="INV-2026-0980"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amount Received</label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="$149.00"
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
                  <option>Wire Transfer</option>
                  <option>Credit Card (Stripe)</option>
                  <option>Direct Debit ACH</option>
                  <option>Manual Bank Deposit</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction / Reference ID</label>
                <input
                  type="text"
                  required
                  value={formData.transactionRef}
                  onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
                  placeholder="WT-REF-90210"
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
