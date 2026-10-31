'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { BILLING_RUNS_DATA } from '@/data/mockData';
import { RefreshCw, Play, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function BillingRunsPage() {
  const [runs, setRuns] = useState(BILLING_RUNS_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    schedule: 'Ad-hoc Manual Trigger',
    targetDate: '2026-10-31'
  });

  const columns: Column<typeof BILLING_RUNS_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Run Batch ID',
      width: 'w-36',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'schedule',
      header: 'Run Description & Schedule',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-900">{item.schedule}</div>
          <div className="text-slate-400 font-mono text-[11px]">{item.triggeredAt}</div>
        </div>
      )
    },
    {
      key: 'totalSubscriptions',
      header: 'Processed Subs',
      render: (item) => (
        <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
          {item.totalSubscriptions} items
        </span>
      )
    },
    {
      key: 'successCount',
      header: 'Success',
      render: (item) => (
        <span className="font-bold text-emerald-600">{item.successCount} ok</span>
      )
    },
    {
      key: 'failedCount',
      header: 'Dunning / Failed',
      render: (item) => (
        <span className={`font-semibold ${item.failedCount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
          {item.failedCount} failed
        </span>
      )
    },
    {
      key: 'totalBilled',
      header: 'Amount Captured',
      render: (item) => <span className="font-bold text-slate-900">{item.totalBilled}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRun = {
      id: `RUN-${new Date().toISOString().slice(0, 10)}-MANUAL`,
      schedule: formData.schedule,
      triggeredAt: 'Just now',
      totalSubscriptions: 64,
      successCount: 64,
      failedCount: 0,
      totalBilled: '$12,480.00',
      status: 'Completed'
    };
    setRuns([newRun, ...runs]);
    setIsModalOpen(false);
  };

  return (
    <DashboardLayout title="Automated Billing Runs" moduleName="SALES MODULE">
      <div className="space-y-6">
        {/* Billing Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Batch Collection Success Rate"
            value="98.6%"
            change="+0.4%"
            trend="up"
            period="past 30 days"
            iconName="Percent"
          />
          <StatCard
            title="Recurring Charges Billed"
            value="$153,980.00"
            change="1,034 payments"
            trend="up"
            period="this calendar month"
            iconName="DollarSign"
          />
          <StatCard
            title="Active Automated Schedules"
            value="Daily Nightly 00:00"
            change="Next in 12h"
            trend="neutral"
            period="automated"
            iconName="Repeat"
          />
        </div>

        <DataTable
          title="Recurring Billing Executions & Batch History"
          subtitle="Automated payment captures, dunning attempts, renewal charges, and invoice issuances"
          data={runs}
          columns={columns}
          searchPlaceholder="Search billing runs..."
          searchKey="id"
          addNewLabel="Trigger Billing Run"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting billing run audit log...')}
          onView={(item) => alert(`Run batch: ${item.id}`)}
        />

        {/* Trigger Run Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Trigger Ad-hoc Billing Run"
          subtitle="Execute automated charges and invoice generation for pending subscriptions"
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
                form="add-run-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute Batch Now</span>
              </button>
            </>
          }
        >
          <form id="add-run-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Batch Label / Description</label>
              <input
                type="text"
                required
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="e.g. End-of-Month Ad-hoc Catchup"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Billing As-of Date</label>
              <input
                type="date"
                required
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Triggering a batch run immediately attempts payment gateway settlement for all customers whose renewal dates are due on or before the selected date.
              </span>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
