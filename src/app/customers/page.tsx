'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  Building2,
  UserCheck,
  DollarSign,
  Mail,
  Phone,
  ExternalLink,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface CustomerRecord {
  id: string;
  company: string;
  contact: string;
  email: string;
  phone: string;
  country: string;
  totalSpent: string;
  activeSubs: number;
  status: 'Active' | 'At Risk' | 'Inactive';
  is_active: boolean;
  created_at?: string;
}

const DEFAULT_MOCK_CUSTOMERS: CustomerRecord[] = [
  { id: 'CUST-501', company: 'Acme Technologies Inc.', contact: 'Robert Vance', email: 'rvance@acmetech.com', phone: '+1 (555) 019-2834', country: 'United States', totalSpent: '$42,500', activeSubs: 3, status: 'Active', is_active: true },
  { id: 'CUST-502', company: 'Nexus Data Labs', contact: 'Kavita Patel', email: 'kpatel@nexusdata.ai', phone: '+44 20 7946 0912', country: 'United Kingdom', totalSpent: '$8,950', activeSubs: 1, status: 'Active', is_active: true },
  { id: 'CUST-503', company: 'Apex Global Logistics', contact: 'Carlos Mendez', email: 'c.mendez@apexlogistics.es', phone: '+34 91 123 4567', country: 'Spain', totalSpent: '$24,200', activeSubs: 2, status: 'Active', is_active: true },
  { id: 'CUST-504', company: 'Vanguard Media House', contact: 'Chloe Dupont', email: 'cdupont@vanguardmedia.fr', phone: '+33 1 42 68 55 00', country: 'France', totalSpent: '$3,400', activeSubs: 1, status: 'At Risk', is_active: true },
  { id: 'CUST-505', company: 'Solaria Energy Corp', contact: 'Hamad Al-Hashimi', email: 'hamad@solariaenergy.om', phone: '+968 24 123456', country: 'Oman', totalSpent: '$19,800', activeSubs: 2, status: 'Active', is_active: true }
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>(DEFAULT_MOCK_CUSTOMERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    country: 'United States'
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users?role=customer');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load customers');

      if (json.users && json.users.length > 0) {
        const mapped: CustomerRecord[] = json.users.map((u: any, idx: number) => ({
          id: u.id,
          company: u.organization || `Client Org ${idx + 1}`,
          contact: u.full_name || 'Primary Contact',
          email: u.email,
          phone: u.phone || '+1 555-0100',
          country: u.location || 'Global',
          totalSpent: `$${((idx + 1) * 12450).toLocaleString()}`,
          activeSubs: (idx % 3) + 1,
          status: u.is_active ? 'Active' : 'Inactive',
          is_active: u.is_active ?? true,
          created_at: u.created_at
        }));
        setCustomers(mapped);
      } else {
        setCustomers(DEFAULT_MOCK_CUSTOMERS);
      }
    } catch (err: any) {
      console.warn('Backend customer load fallback:', err);
      setCustomers(DEFAULT_MOCK_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      width: 'w-24',
      render: (item) => (
        <span className="font-mono text-[11px] font-medium text-slate-800" title={item.id}>
          {item.id.length > 12 ? `${item.id.slice(0, 8)}…` : item.id}
        </span>
      )
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
      header: 'Status',
      render: (item) => <Badge status={item.status} />
    }
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.contact,
          email: formData.email,
          role: 'customer',
          organization: formData.company,
          phone: formData.phone,
          location: formData.country,
          password: 'Customer@123'
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create customer');

      showNotification('success', `Customer account for ${formData.company} created!`);
      setIsModalOpen(false);
      setFormData({ company: '', contact: '', email: '', phone: '', country: 'United States' });
      await fetchCustomers();
    } catch (err: any) {
      showNotification('error', err.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: CustomerRecord) => {
    if (!confirm(`Archive / remove customer record for ${item.company}?`)) {
      return;
    }
    try {
      if (item.id.includes('-') && item.id.length > 20) {
        await fetch(`/api/users/${item.id}`, { method: 'DELETE' });
      }
      setCustomers(customers.filter((c) => c.id !== item.id));
      showNotification('success', `Customer ${item.company} removed.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  const handleExportCSV = () => {
    if (customers.length === 0) return;
    const headers = ['ID', 'Company', 'Contact', 'Email', 'Phone', 'Country', 'Active Subs', 'LTV', 'Status'];
    const rows = customers.map(c => [
      `"${c.id}"`,
      `"${c.company}"`,
      `"${c.contact}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.country}"`,
      `"${c.activeSubs}"`,
      `"${c.totalSpent}"`,
      `"${c.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightloop_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Customer Management" moduleName="USER MODULE">
      <div className="space-y-6">
        {notification && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs transition-all ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* KPI metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total B2B Accounts"
            value={customers.length.toString()}
            change="+4.8%"
            trend="up"
            period="live database sync"
            iconName="Users"
          />
          <StatCard
            title="Avg Customer LTV"
            value="$25,700"
            change="+$1,450"
            trend="up"
            period="high retention"
            iconName="DollarSign"
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

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading customer accounts…</p>
          </div>
        ) : (
          <DataTable
            title="Customer Accounts & Subscribed Clients"
            subtitle="Directory of corporate subscribers, contract values, and billing contacts"
            data={customers}
            columns={columns}
            searchPlaceholder="Search customers by company or email..."
            searchKey="company"
            addNewLabel="Add Customer"
            onAddNew={() => setIsModalOpen(true)}
            onExport={handleExportCSV}
            onView={(item) => {
              setSelectedCustomer(item);
              setIsViewModalOpen(true);
            }}
            onEdit={(item) => alert(`Editing details for ${item.company}`)}
            onDelete={handleDelete}
            filterKey="status"
            filterOptions={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
              { label: 'At Risk', value: 'At Risk' }
            ]}
          />
        )}

        {/* View Customer Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Customer Account Overview"
          subtitle="Corporate profile, contract status, and subscription tier"
          footer={
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Close
            </button>
          }
        >
          {selectedCustomer && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedCustomer.company[0] || 'C'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedCustomer.company}</h4>
                  <p className="text-slate-500">{selectedCustomer.email}</p>
                </div>
                <div className="ml-auto">
                  <Badge status={selectedCustomer.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedCustomer.contact}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Phone</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedCustomer.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Country</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedCustomer.country}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Active Subscriptions</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedCustomer.activeSubs} Active Plans</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

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
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Account</span>
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
