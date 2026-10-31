'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { SALES_ORDERS_DATA } from '@/data/mockData';
import { ShoppingCart, CheckCircle, ArrowRight, FileText, Calendar, DollarSign, Building2 } from 'lucide-react';

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState(SALES_ORDERS_DATA);
  const [selectedOrder, setSelectedOrder] = useState<typeof SALES_ORDERS_DATA[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer: '',
    quotationId: 'Direct Order',
    amount: '$12,000.00'
  });

  const columns: Column<typeof SALES_ORDERS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Order #',
      width: 'w-28',
      render: (item) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(item);
          }}
          className="font-mono font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
        >
          {item.id}
        </span>
      )
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (item) => (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(item);
          }}
          className="font-semibold text-slate-900 hover:text-indigo-600 cursor-pointer"
        >
          {item.customer}
        </div>
      )
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
    setSelectedOrder(newOrder);
    setFormData({ customer: '', quotationId: 'Direct Order', amount: '$12,000.00' });
  };

  const handleConfirmOrder = () => {
    if (!selectedOrder) return;
    setOrders(prev =>
      prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'Completed', fulfillment: 'Fulfilled' } : o)
    );
    setSelectedOrder(prev => prev ? { ...prev, status: 'Completed', fulfillment: 'Fulfilled' } : null);
    alert(`Order ${selectedOrder.id} confirmed and verified!`);
  };

  const handleCreateSubscriptionFromOrder = () => {
    if (!selectedOrder) return;
    handleConfirmOrder();
    setSelectedOrder(null);
    alert(`Success! Subscription provisioned for ${selectedOrder.customer} based on Order ${selectedOrder.id}. Navigating to Subscriptions...`);
    router.push('/subscriptions');
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
          onView={(item) => setSelectedOrder(item)}
          onEdit={(item) => setSelectedOrder(item)}
          onDelete={(item) => {
            if (confirm(`Cancel sales order ${item.id}?`)) {
              setOrders(orders.filter((o) => o.id !== item.id));
              if (selectedOrder?.id === item.id) setSelectedOrder(null);
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Completed', value: 'Completed' },
            { label: 'Processing', value: 'Processing' }
          ]}
        />

        {/* View / Confirm Order Modal */}
        {selectedOrder && (
          <Modal
            isOpen={Boolean(selectedOrder)}
            onClose={() => setSelectedOrder(null)}
            title={`Sales Order: ${selectedOrder.id}`}
            subtitle="Verify customer details, prices, taxes, and provision recurring subscription"
            footer={
              <div className="flex items-center justify-between w-full">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  {selectedOrder.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={handleConfirmOrder}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm Order</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleCreateSubscriptionFromOrder}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                  >
                    <span>Create Subscription</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer Organization</span>
                    <p className="font-bold text-slate-900 text-sm">{selectedOrder.customer}</p>
                  </div>
                  <Badge status={selectedOrder.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Quotation Reference</span>
                    <span className="font-mono font-medium text-indigo-600">{selectedOrder.quotationId}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Order Date</span>
                    <span className="font-mono text-slate-700">{selectedOrder.orderDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Provisioning Status</span>
                    <span className="font-medium text-slate-800">{selectedOrder.fulfillment}</span>
                  </div>
                </div>
              </div>

              {/* Financial Verification */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Product / License Subtotal</span>
                  <span className="font-mono text-slate-900">{selectedOrder.amount}</span>
                </div>
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Calculated Applicable Tax (VAT)</span>
                  <span className="font-mono text-slate-900">Included (0.0%)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 font-bold text-slate-900">
                  <span>Total Confirmed Amount</span>
                  <span className="font-mono text-indigo-600 text-sm">{selectedOrder.amount}</span>
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
                placeholder="e.g. Acme Technologies Inc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quotation Reference</label>
                <input
                  type="text"
                  required
                  value={formData.quotationId}
                  onChange={(e) => setFormData({ ...formData, quotationId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Booked Amount</label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="$12,000.00"
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
