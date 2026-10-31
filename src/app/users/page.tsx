'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import {
  Users,
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  Loader2,
  Mail,
  Building,
  Briefcase,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw
} from 'lucide-react';

interface UserRecord {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'staff' | 'customer';
  department: string;
  title: string;
  organization: string;
  phone: string;
  is_active: boolean;
  status: 'Active' | 'Inactive';
  created_at: string;
  last_sign_in_at?: string | null;
  lastLogin: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active user selections
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff' | 'customer',
    department: 'Finance & Accounting',
    title: '',
    organization: 'Brightloop Hub',
    phone: '',
    password: ''
  });

  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    role: 'staff' as 'admin' | 'staff' | 'customer',
    department: '',
    title: '',
    organization: '',
    phone: '',
    is_active: true
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load users');

      const mapped: UserRecord[] = (json.users || []).map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name || 'Unnamed User',
        role: u.role || 'staff',
        department: u.department || 'General',
        title: u.title || (u.role === 'admin' ? 'Administrator' : 'Staff Member'),
        organization: u.organization || 'Brightloop Hub',
        phone: u.phone || '',
        is_active: u.is_active ?? true,
        status: (u.is_active ?? true) ? 'Active' : 'Inactive',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        lastLogin: u.last_sign_in_at
          ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'Never logged in'
      }));
      setUsers(mapped);
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Could not connect to user database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Add User
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          title: formData.title,
          organization: formData.organization,
          phone: formData.phone,
          password: formData.password || 'Brightloop@123'
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create user');

      showNotification('success', `User account for ${formData.email} provisioned successfully!`);
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        role: 'staff',
        department: 'Finance & Accounting',
        title: '',
        organization: 'Brightloop Hub',
        phone: '',
        password: ''
      });
      await fetchUsers();
    } catch (err: any) {
      showNotification('error', err.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Edit User
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
          role: editFormData.role,
          department: editFormData.department,
          title: editFormData.title,
          organization: editFormData.organization,
          phone: editFormData.phone,
          is_active: editFormData.is_active
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to update user');

      showNotification('success', `User ${editFormData.name} updated successfully!`);
      setIsEditModalOpen(false);
      await fetchUsers();
    } catch (err: any) {
      showNotification('error', err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete User
  const handleDelete = async (user: UserRecord) => {
    if (!confirm(`Are you sure you want to delete ${user.full_name} (${user.email})? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to delete user');

      showNotification('success', `User ${user.full_name} was removed from the database.`);
      setUsers(users.filter(u => u.id !== user.id));
    } catch (err: any) {
      showNotification('error', err.message || 'Delete failed');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (users.length === 0) return;
    const headers = ['ID', 'Full Name', 'Email', 'Role', 'Department', 'Job Title', 'Organization', 'Status', 'Last Login'];
    const rows = users.map(u => [
      `"${u.id}"`,
      `"${u.full_name}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.department}"`,
      `"${u.title}"`,
      `"${u.organization}"`,
      `"${u.status}"`,
      `"${u.lastLogin}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `brightloop_users_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columns for DataTable
  const columns: Column<UserRecord>[] = [
    {
      key: 'id',
      header: 'User ID',
      width: 'w-24',
      render: (item) => (
        <span className="font-mono text-[11px] font-medium text-slate-700" title={item.id}>
          {item.id.slice(0, 8)}…
        </span>
      )
    },
    {
      key: 'full_name',
      header: 'Name & Email',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.full_name}</div>
          <div className="text-slate-400 text-[11px]">{item.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role & Title',
      render: (item) => {
        const badgeColors = {
          admin: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          staff: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          customer: 'bg-amber-50 text-amber-700 border-amber-200'
        };
        const roleLabel = item.role === 'admin' ? 'Super Admin' : item.role === 'staff' ? 'Staff Operator' : 'Customer';
        return (
          <div>
            <span className={`inline-block font-semibold px-2 py-0.5 rounded text-[10px] uppercase border ${badgeColors[item.role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
              {roleLabel}
            </span>
            {item.title && <div className="text-slate-500 text-[11px] mt-0.5">{item.title}</div>}
          </div>
        );
      }
    },
    {
      key: 'department',
      header: 'Department',
      render: (item) => <span className="text-slate-700 font-medium text-xs">{item.department || '—'}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <Badge status={item.status} />
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      render: (item) => <span className="text-slate-500 font-mono text-[11px]">{item.lastLogin}</span>
    }
  ];

  // Calculate Metrics
  const totalUsers = users.length;
  const activeCount = users.filter(u => u.is_active).length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;

  return (
    <DashboardLayout title="User Management" moduleName="USER MODULE">
      <div className="space-y-6">
        {/* Notification Alert */}
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

        {/* Top Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Users"
            value={totalUsers.toString()}
            change="+100%"
            trend="up"
            period="live backend sync"
            iconName="Users"
          />
          <StatCard
            title="Active Accounts"
            value={activeCount.toString()}
            subValue={`${Math.round((activeCount / (totalUsers || 1)) * 100)}% active rate`}
            change="+0%"
            trend="neutral"
            period="current status"
            iconName="UserCheck"
          />
          <StatCard
            title="System Administrators"
            value={adminCount.toString()}
            subValue="Full hub privileges"
            change="verified"
            trend="up"
            period="admin role"
            iconName="Shield"
          />
          <StatCard
            title="Staff Operators"
            value={staffCount.toString()}
            subValue="Operations & Billing"
            change="verified"
            trend="up"
            period="staff role"
            iconName="Briefcase"
          />
        </div>

        {/* Error banner with reload button */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchUsers}
              className="inline-flex items-center gap-1 font-semibold text-red-800 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Data Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Fetching users from Supabase backend…</p>
          </div>
        ) : (
          <DataTable
            title="System Users & Operators"
            subtitle="Manage credentials, access rights, and activity status across all internal team members and operators"
            data={users}
            columns={columns}
            searchPlaceholder="Search users by name, email, department or title..."
            searchKey="full_name"
            addNewLabel="Add User"
            onAddNew={() => setIsAddModalOpen(true)}
            onExport={handleExportCSV}
            onView={(item) => {
              setSelectedUser(item);
              setIsViewModalOpen(true);
            }}
            onEdit={(item) => {
              setSelectedUser(item);
              setEditFormData({
                id: item.id,
                name: item.full_name,
                email: item.email,
                role: item.role,
                department: item.department,
                title: item.title,
                organization: item.organization,
                phone: item.phone,
                is_active: item.is_active
              });
              setIsEditModalOpen(true);
            }}
            onDelete={handleDelete}
            filterKey="status"
            filterOptions={[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' }
            ]}
          />
        )}

        {/* ── View User Modal ── */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="User Profile Details"
          subtitle="Detailed credentials and operational rights for this account"
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
          {selectedUser && (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {(selectedUser.full_name[0] || 'U').toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{selectedUser.full_name}</h4>
                  <p className="text-slate-500">{selectedUser.email}</p>
                </div>
                <div className="ml-auto">
                  <Badge status={selectedUser.status} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Role</span>
                  <p className="font-semibold text-slate-800 capitalize mt-0.5">{selectedUser.role}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.department || 'None specified'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Job Title</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.title || 'Standard User'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Organization</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{selectedUser.organization}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Database UUID:</span>
                  <span className="font-mono text-slate-700">{selectedUser.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Account Created:</span>
                  <span className="font-medium text-slate-700">
                    {new Date(selectedUser.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Active:</span>
                  <span className="font-mono text-slate-700">{selectedUser.lastLogin}</span>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* ── Add User Modal ── */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New System User"
          subtitle="Provision a new admin, staff operator, or customer in Brightloop Hub"
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
                form="add-user-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Create Account</span>
              </button>
            </>
          }
        >
          <form id="add-user-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Johnathan Smith"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g. jsmith@brightloop.io"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="staff">Staff Operator</option>
                  <option value="admin">Super Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Finance & Accounting</option>
                  <option>Revenue & Sales</option>
                  <option>Customer Success</option>
                  <option>Executive</option>
                  <option>Compliance</option>
                  <option>Infrastructure</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title / Designation</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Billing Specialist"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Default: Brightloop@123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>
          </form>
        </Modal>

        {/* ── Edit User Modal ── */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit System User"
          subtitle="Update account settings, role permissions, or status"
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
                form="edit-user-form"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </>
          }
        >
          <form id="edit-user-form" onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={editFormData.email}
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="staff">Staff Operator</option>
                  <option value="admin">Super Admin</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={editFormData.department}
                  onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Finance & Accounting</option>
                  <option>Revenue & Sales</option>
                  <option>Customer Success</option>
                  <option>Executive</option>
                  <option>Compliance</option>
                  <option>Infrastructure</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editFormData.is_active ? 'Active' : 'Inactive'}
                  onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.value === 'Active' })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
