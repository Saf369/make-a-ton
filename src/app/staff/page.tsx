'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { STAFF_DATA } from '@/data/mockData';
import { Briefcase, Building, ShieldCheck, MapPin } from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState(STAFF_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    department: 'Finance & Accounting',
    location: 'Dubai, UAE',
    accessLevel: 'Tier 2 (Read/Write)'
  });

  const columns: Column<typeof STAFF_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Staff ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
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
      header: 'Department'
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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newStaff = {
      id: `STF-10${staff.length + 1}`,
      name: formData.name || 'Jane Doe',
      email: formData.email || 'staff@brightloop.io',
      title: formData.title || 'Subscription Specialist',
      department: formData.department,
      location: formData.location,
      accessLevel: formData.accessLevel
    };
    setStaff([newStaff, ...staff]);
    setIsModalOpen(false);
    setFormData({
      name: '',
      email: '',
      title: '',
      department: 'Finance & Accounting',
      location: 'Dubai, UAE',
      accessLevel: 'Tier 2 (Read/Write)'
    });
  };

  return (
    <DashboardLayout title="Staff Management" moduleName="USER MODULE">
      <div className="space-y-6">
        {/* Quick Staff KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Active Staff"
            value="42"
            change="+3 new"
            trend="up"
            period="this month"
            iconName="Users"
          />
          <StatCard
            title="Tier 3 Security Clearance"
            value="8 Officers"
            change="Compliant"
            trend="neutral"
            period="SOC2 audited"
            iconName="Percent"
          />
          <StatCard
            title="Global Hubs"
            value="4 Regions"
            change="Dubai / London / Riyadh / Tokyo"
            trend="neutral"
            period="worldwide"
            iconName="TrendingUp"
          />
        </div>

        <DataTable
          title="Internal Staff Directory"
          subtitle="Manage verified employees, clearance privileges, and operational roles"
          data={staff}
          columns={columns}
          searchPlaceholder="Search staff by name or department..."
          searchKey="name"
          addNewLabel="Add Staff"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting staff directory to CSV...')}
          onView={(item) => alert(`Viewing staff file: ${item.name}`)}
          onEdit={(item) => alert(`Editing staff: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove staff record for ${item.name}?`)) {
              setStaff(staff.filter((s) => s.id !== item.id));
            }
          }}
        />

        {/* Add Staff Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Onboard New Staff Member"
          subtitle="Add an internal staff record with assigned permissions and department"
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
                form="add-staff-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Confirm Onboarding
              </button>
            </>
          }
        >
          <form id="add-staff-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="sjenkins@brightloop.io"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Senior Billing Specialist"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Finance & Accounting</option>
                  <option>Customer Success</option>
                  <option>Sales & Revenue</option>
                  <option>Infrastructure & Security</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Access Level</label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Tier 1 (Read Only)</option>
                  <option>Tier 2 (Read/Write)</option>
                  <option>Tier 3 (Full Financial)</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
