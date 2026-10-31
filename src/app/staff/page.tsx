'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  Briefcase,
  Building,
  ShieldCheck,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface StaffRecord {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  location: string;
  phone: string;
  role: 'staff' | 'admin';
  accessLevel: string;
  is_active: boolean;
  created_at: string;
}

export default function StaffPage() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [staff, setStaff] = useState<StaffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffRecord | null>(null);

  // Add Form Data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    department: 'Finance & Accounting',
    location: 'Dubai, UAE',
    phone: '',
    accessLevel: 'Tier 2 (Read/Write)'
  });

  // Edit Form Data
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    title: '',
    department: '',
    location: '',
    phone: '',
    is_active: true
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load staff records');

      // Filter users who are staff or admin team members
      const staffList = (json.users || [])
        .filter((u: any) => u.role === 'staff' || u.role === 'admin')
        .map((u: any) => ({
          id: u.id,
          name: u.full_name || 'Staff Member',
          email: u.email,
          title: u.title || (u.role === 'admin' ? 'Super Admin' : 'Operations Specialist'),
          department: u.department || 'Operations',
          location: u.location || 'Dubai, UAE',
          phone: u.phone || '',
          role: u.role,
          accessLevel: u.role === 'admin' ? 'Tier 3 (Admin)' : 'Tier 2 (Read/Write)',
          is_active: u.is_active ?? true,
          created_at: u.created_at
        }));

      setStaff(staffList);
    } catch (err: any) {
      console.error('Failed to fetch staff:', err);
      setError(err.message || 'Could not connect to database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Create Staff
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      showNotification('error', 'Security Policy: Only the administrator can add a new member of staff.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: 'staff',
          department: formData.department,
          title: formData.title || 'Subscription Specialist',
          location: formData.location,
          phone: formData.phone,
          password: 'Staff@123'
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to provision staff account');

      showNotification('success', `Staff account for ${formData.name} created successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        title: '',
        department: 'Finance & Accounting',
        location: 'Dubai, UAE',
        phone: '',
        accessLevel: 'Tier 2 (Read/Write)'
      });
      await fetchStaff();
    } catch (err: any) {
      showNotification('error', err.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Staff
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.id) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: editFormData.name,
          department: editFormData.department,
          title: editFormData.title,
          location: editFormData.location,
          phone: editFormData.phone,
          is_active: editFormData.is_active
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update staff record');

      showNotification('success', `Staff details for ${editFormData.name} updated!`);
      setIsEditModalOpen(false);
      await fetchStaff();
    } catch (err: any) {
      showNotification('error', err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Staff
  const handleDelete = async (member: StaffRecord) => {
    if (!confirm(`Are you sure you want to remove staff member ${member.name} (${member.email})?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${member.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete staff member');

      showNotification('success', `Staff member ${member.name} deleted.`);
      setStaff(staff.filter(s => s.id !== member.id));
    } catch (err: any) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (staff.length === 0) return;
    const headers = ['Staff ID', 'Full Name', 'Email', 'Role', 'Department', 'Job Title', 'Location', 'Access Tier'];
    const rows = staff.map(s => [
      `"${s.id}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.role}"`,
      `"${s.department}"`,
      `"${s.title}"`,
      `"${s.location}"`,
      `"${s.accessLevel}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightloop_staff_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: Column<StaffRecord>[] = [
    {
      key: 'id',
      header: 'Staff ID',
      width: 'w-24',
      render: (item) => (
        <span className="font-mono text-[11px] font-medium text-slate-700" title={item.id}>
          {item.id.slice(0, 8)}…
        </span>
      )
    },
    {
      key: 'name',
      header: 'Staff Member',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 text-[11px]">{item.email}</div>
        </div>
      )
    },
    {
      key: 'title',
      header: 'Job Title',
      render: (item) => <span className="font-medium text-slate-800">{item.title}</span>
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => <span className="text-slate-700 font-medium">{item.department}</span>
    },
    {
      key: 'location',
      header: 'Location',
      render: (item) => (
        <span className="inline-flex items-center gap-1 text-slate-600">
          <MapPin className="w-3 h-3 text-slate-400" />
          <span>{item.location}</span>
        </span>
      )
    },
    {
      key: 'accessLevel',
      header: 'Access Tier',
      render: (item) => <Badge status={item.accessLevel} />
    }
  ];

  // Dynamic Metrics
  const totalStaff = staff.length;
  const uniqueDepartments = new Set(staff.map(s => s.department)).size;
  const uniqueLocations = new Set(staff.map(s => s.location)).size;

  return (
    <DashboardLayout title="Staff Management" moduleName="USER MODULE">
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

        {/* Quick Staff KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Active Staff"
            value={totalStaff.toString()}
            change="+100%"
            trend="up"
            period="live backend sync"
            iconName="Users"
          />
          <StatCard
            title="Operational Departments"
            value={`${uniqueDepartments} Departments`}
            change="Compliant"
            trend="neutral"
            period="Finance, Sales, Tech"
            iconName="Briefcase"
          />
          <StatCard
            title="Global Hubs & Regions"
            value={`${uniqueLocations} Regions`}
            change="Worldwide"
            trend="neutral"
            period="Dubai, London, Riyadh"
            iconName="Globe"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchStaff}
              className="inline-flex items-center gap-1 font-semibold text-red-800 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Fetching staff directory from Supabase backend…</p>
          </div>
        ) : (
          <DataTable
            title="Internal Staff Directory"
            subtitle="Manage verified employees, clearance privileges, and operational roles"
            data={staff}
            columns={columns}
            searchPlaceholder="Search staff by name, title or department..."
            searchKey="name"
            addNewLabel="Add Staff"
            onAddNew={() => {
              if (!isAdmin) {
                showNotification('error', 'Security Policy: Only the administrator can add a new member of staff.');
                return;
              }
              setIsAddModalOpen(true);
            }}
            onExport={handleExportCSV}
            onView={(item) => {
              setSelectedStaff(item);
              setIsViewModalOpen(true);
            }}
            onEdit={(item) => {
              setSelectedStaff(item);
              setEditFormData({
                id: item.id,
                name: item.name,
                email: item.email,
                title: item.title,
                department: item.department,
                location: item.location,
                phone: item.phone,
                is_active: item.is_active
              });
              setIsEditModalOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}

        {/* ── View Staff Modal ── */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Staff Member Profile"
          subtitle="Clearance tier and operational credentials"
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
          {selectedStaff && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {(selectedStaff.name[0] || 'S').toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedStaff.name}</h4>
                  <p className="text-slate-500">{selectedStaff.email}</p>
                </div>
                <div className="ml-auto">
                  <Badge status={selectedStaff.accessLevel} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStaff.department}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Job Title</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStaff.title}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Office Location</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStaff.location}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Direct Contact</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedStaff.phone || 'Not recorded'}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Database ID:</span>
                  <span className="font-mono text-slate-700">{selectedStaff.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Role:</span>
                  <span className="font-semibold text-indigo-700 uppercase">{selectedStaff.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered:</span>
                  <span className="text-slate-700">
                    {new Date(selectedStaff.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Add Staff Modal ── */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Onboard New Staff Member"
          subtitle="Provision operational access and clearance privileges for internal employee"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-staff-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Provision Account</span>
              </button>
            </>
          }
        >
          <form id="add-staff-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff Member Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Marcus Brody"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Internal Corporate Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marcus.b@brightloop.io"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Finance & Accounting</option>
                  <option>Customer Success</option>
                  <option>Revenue & Sales</option>
                  <option>Executive</option>
                  <option>Compliance</option>
                  <option>Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Billing Manager"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Office / Region</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Dubai, UAE</option>
                  <option>London, UK</option>
                  <option>Riyadh, KSA</option>
                  <option>Muscat, Oman</option>
                  <option>Singapore, SG</option>
                  <option>Tokyo, JP</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Security Clearance Tier</label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Tier 1 (Read-Only)</option>
                  <option>Tier 2 (Read/Write)</option>
                  <option>Tier 3 (Admin)</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>

        {/* ── Edit Staff Modal ── */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Staff Member"
          subtitle="Update department, location, job title or clearance"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-staff-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Updates</span>
              </button>
            </>
          }
        >
          <form id="edit-staff-form" onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Staff Member Full Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                disabled
                value={editFormData.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Finance & Accounting</option>
                  <option>Customer Success</option>
                  <option>Revenue & Sales</option>
                  <option>Executive</option>
                  <option>Compliance</option>
                  <option>Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Office</label>
                <select
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Dubai, UAE</option>
                  <option>London, UK</option>
                  <option>Riyadh, KSA</option>
                  <option>Muscat, Oman</option>
                  <option>Singapore, SG</option>
                  <option>Tokyo, JP</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Direct Phone</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+971 4 321 0000"
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
