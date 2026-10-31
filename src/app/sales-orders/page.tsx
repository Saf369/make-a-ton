'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { SALES_ORDERS_DATA } from '@/data/mockData';
import { ShoppingCart, Building2, Calendar, FileSpreadsheet, IndianRupee, CheckCircle } from 'lucide-react';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState(SALES_ORDERS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<typeof SALES_ORDERS_DATA[0] | null>(null);
  const [formData, setFormData] = useState({
    customer: '',
    quotationId: 'Direct Order',
    amount: '₹1,20,000.00'
  });

  const columns: Column<typeof SALES_ORDERS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Order #',
      width: 'w-28',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => <div className="font-semibold text-slate-900">{item.customer}</div>
    },
    {
      key: 'quotationId',
      header: 'Quotation Ref',
      render: (item) => <span className="font-mono text-slate-500 text-[11px]">{item.quotationId}</span>
    },
    {
      key: 'orderDate',
      header: 'Order Date',
      render: (item) => <span className="text-slate-600 font-mono text-[11px]">{item.orderDate}</span>
    },
    {
      key: 'amount',
      header: 'Total Amount',
      render: (item) => <span className="font-bold text-slate-900">{item.amount}</span>
    },
    {
      key: 'fulfillment',
      header: 'Provisioning',
      render: (item) => <Badge status={item.fulfillment} />
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = {
      id: `SO-2026-44${orders.length + 1}`,
      customer: formData.customer || 'Enterprise Client',
      quotationId: formData.quotationId,
      orderDate: '2026-10-31',
      amount: formData.amount,
      fulfillment: 'In Progress',
      status: 'Processing'
    };
    setOrders([newOrder, ...orders]);
    setIsModalOpen(false);
    setFormData({ customer: '', quotationId: 'Direct Order', amount: '₹1,20,000.00' });
  };

  return (
    <DashboardLayout title="Sales Orders" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="Sales Orders & Confirmed Bookings"
          subtitle="Orders converted from quotations or received via direct self-serve portal checkouts"
          data={orders}
          columns={columns}
          searchPlaceholder="Search orders..."
          searchKey="customer"
          addNewLabel="New Sales Order"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting sales orders...')}
          onView={(item) => setViewingOrder(item)}
          onEdit={(item) => alert(`Editing order: ${item.id}`)}
          onDelete={(item) => {
            if (confirm(`Cancel sales order ${item.id}?`)) {
              setOrders(orders.filter((o) => o.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Completed', value: 'Completed' },
            { label: 'Processing', value: 'Processing' }
          ]}
        />

        {/* View Order Detail Modal (Preserves list scroll position) */}
        {viewingOrder && (
          <Modal
            isOpen={!!viewingOrder}
            onClose={() => setViewingOrder(null)}
            title={`Sales Order Details — ${viewingOrder.id}`}
            subtitle="Confirmed booking parameters, linked quotation, and provisioning state"
            footer={
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Close
              </button>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 text-sm">{viewingOrder.id}</span>
                  <Badge status={viewingOrder.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-slate-600 pt-2 border-t border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Customer: <strong className="text-slate-800">{viewingOrder.customer}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
                    <span>Quotation Ref: <strong className="text-slate-800">{viewingOrder.quotationId}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Order Date: <strong className="text-slate-800">{viewingOrder.orderDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    <span>Total Value: <strong className="text-slate-900">{viewingOrder.amount}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span>Provisioning Status: <Badge status={viewingOrder.fulfillment} /></span>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Add Order Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Record New Sales Order"
          subtitle="Convert a signed contract or manual purchase order into a system order"
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
                form="add-so-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Book Order
              </button>
            </>
          }
        >
          <form id="add-so-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Customer Name</label>
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
                <label className="block font-semibold text-slate-700 mb-1">Quotation Reference</label>
                <input
                  type="text"
                  value={formData.quotationId}
                  onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                  placeholder="QUO-2026-080"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Order Amount</label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="₹1,44,000.00"
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
