'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { USERS_DATA } from '@/data/mockData';
import { UserCheck, Shield, UserX, UserPlus } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState(USERS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Billing Manager',
    department: 'Finance'
  });

  const columns: Column<typeof USERS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'User ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Name & Email',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.name}</div>
          <div className="text-slate-400 text-[11px]">{item.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (item) => (
        <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md text-[11px]">
          {item.role}
        </span>
      )
    },
    {
      key: 'department',
      header: 'Department'
    },
    {
      key: 'status',
      header: 'Status'
    },
    {
      key: 'lastLogin',
      header: 'Last Active',
      render: (item) => <span className="text-slate-500 font-mono text-[11px]">{item.lastLogin}</span>
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = {
      id: `USR-00${users.length + 1}`,
      name: formData.name || 'New Team Member',
      email: formData.email || 'user@brightloop.io',
      role: formData.role,
      department: formData.department,
      status: 'Active',
      lastLogin: 'Just now'
    };
    setUsers([newUser, ...users]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', role: 'Billing Manager', department: 'Finance' });
  };

  return (
    <DashboardLayout title="User Management" moduleName="USER MODULE">
      <div className="space-y-6">
        <DataTable
          title="System Users & Operators"
          subtitle="Manage credentials, access rights, and activity status across all internal team members"
          data={users}
          columns={columns}
          searchPlaceholder="Search users by name or email..."
          searchKey="name"
          addNewLabel="Add User"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting user directory to CSV...')}
          onView={(item) => alert(`Viewing user profile: ${item.name}`)}
          onEdit={(item) => alert(`Editing user: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove user ${item.name}?`)) {
              setUsers(users.filter((u) => u.id !== item.id));
            }
          }}
          filterKey="status"
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' }
          ]}
        />

        {/* Add User Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New System User"
          subtitle="Provision a new admin or operator account in Brightloop Hub"
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
                form="add-user-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Create Account
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
                <label className="block font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Super Admin</option>
                  <option>Billing Manager</option>
                  <option>Sales Lead</option>
                  <option>Support Specialist</option>
                  <option>Operations Auditor</option>
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
                </select>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
