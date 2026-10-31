'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { CUSTOMERS_DATA } from '@/data/mockData';
import { Building2, UserCheck, DollarSign, Mail, Phone, ExternalLink } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState(CUSTOMERS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    country: 'United States'
  });

  const columns: Column<typeof CUSTOMERS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'company',
      header: 'Company & Contact',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.company}</div>
          <div className="text-slate-500 text-[11px]">{item.contact}</div>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Contact Info',
      render: (item) => (
        <div className="text-[11px] text-slate-600">
          <div>{item.email}</div>
          <div className="text-slate-400">{item.phone}</div>
        </div>
      )
    },
    {
      key: 'country',
      header: 'Country'
    },
    {
      key: 'activeSubs',
      header: 'Active Plans',
      render: (item) => (
        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full text-xs">
          {item.activeSubs} Subs
        </span>
      )
    },
    {
      key: 'totalSpent',
      header: 'Lifetime Value (LTV)',
      render: (item) => <span className="font-bold text-slate-900">{item.totalSpent}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newCust = {
      id: `CUST-50${customers.length + 1}`,
      company: formData.company || 'New Enterprise Client',
      contact: formData.contact || 'Main Contact',
      email: formData.email || 'contact@client.com',
      phone: formData.phone || '+91 98200 12345',
      country: formData.country,
      totalSpent: '₹0.00',
      activeSubs: 1,
      status: 'Active'
    };
    setCustomers([newCust, ...customers]);
    setIsModalOpen(false);
    setFormData({ company: '', contact: '', email: '', phone: '', country: 'India' });
  };

  return (
    <DashboardLayout title="Customer Management" moduleName="USER MODULE">
      <div className="space-y-6">
        {/* KPI metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total B2B Accounts"
            value="1,248"
            change="+4.8%"
            trend="up"
            period="vs last month"
            iconName="Users"
          />
          <StatCard
            title="Avg Customer LTV"
            value="₹16,50,000"
            change="+₹1,25,000"
            trend="up"
            period="high retention"
            iconName="IndianRupee"
          />
          <StatCard
            title="Customer Portal Logins"
            value="892"
            change="92% active"
            trend="up"
            period="past 7 days"
            iconName="Repeat"
          />
        </div>

        <DataTable
          title="Customer Accounts & Subscribed Clients"
          subtitle="Directory of corporate subscribers, contract values, and billing contacts"
          data={customers}
          columns={columns}
          searchPlaceholder="Search customers by company or email..."
          searchKey="company"
          addNewLabel="Add Customer"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting customer accounts to CSV...')}
          onView={(item) => alert(`Opening customer account overview for ${item.company}`)}
          onEdit={(item) => alert(`Editing details for ${item.company}`)}
          onDelete={(item) => {
            if (confirm(`Archive customer record for ${item.company}?`)) {
              setCustomers(customers.filter((c) => c.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'At Risk', value: 'At Risk' }
          ]}
        />

        {/* Add Customer Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Customer Account"
          subtitle="Register an organization for subscription provisioning and billing"
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
                form="add-customer-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Create Account
              </button>
            </>
          }
        >
          <form id="add-customer-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Organization Name</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Acme Technologies Inc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Contact Name</label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="e.g. Robert Vance"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Country</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Billing Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="billing@acmetech.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
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
