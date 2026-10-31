'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { DataTable, Column } from '@/components/ui/DataTable';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { PRICING_RULES_DATA } from '@/data/mockData';
import { Percent } from 'lucide-react';

export default function PricingRulesPage() {
  const [rules, setRules] = useState(PRICING_RULES_DATA);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ruleType: 'Billing Term',
    discount: '15.0%',
    applyTo: 'All Subscription Plans',
    validTill: '2027-12-31'
  });

  const columns: Column<typeof PRICING_RULES_DATA[0]>[] = [
    {
      key: 'id',
      header: 'Rule ID',
      width: 'w-24',
      render: (item) => <span className="font-mono font-medium text-slate-800">{item.id}</span>
    },
    {
      key: 'name',
      header: 'Pricing Rule Name',
      render: (item) => <div className="font-semibold text-slate-900">{item.name}</div>
    },
    {
      key: 'ruleType',
      header: 'Type'
    },
    {
      key: 'discount',
      header: 'Discount Offered',
      render: (item) => (
        <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded text-xs">
          {item.discount}
        </span>
      )
    },
    {
      key: 'applyTo',
      header: 'Applies To'
    },
    {
      key: 'validTill',
      header: 'Expiry Date',
      render: (item) => <span className="font-mono text-slate-600 text-[11px]">{item.validTill}</span>
    },
    {
      key: 'status',
      header: 'Status'
    }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule = {
      id: `RULE-0${rules.length + 1}`,
      name: formData.name || 'Custom Discount Rule',
      ruleType: formData.ruleType,
      discount: formData.discount,
      applyTo: formData.applyTo,
      validTill: formData.validTill,
      status: 'Active'
    };
    setRules([newRule, ...rules]);
    setIsModalOpen(false);
    setFormData({ name: '', ruleType: 'Billing Term', discount: '15.0%', applyTo: 'All Subscription Plans', validTill: '2027-12-31' });
  };

  return (
    <DashboardLayout title="Pricing Rules & Discounts" moduleName="SALES MODULE">
      <div className="space-y-6">
        <DataTable
          title="Automated Pricing Rules & Coupons"
          subtitle="Configure volume discounts, term-length incentives, promotional codes, and custom client concessions"
          data={rules}
          columns={columns}
          searchPlaceholder="Search pricing rules..."
          searchKey="name"
          addNewLabel="Add Pricing Rule"
          onAddNew={() => setIsModalOpen(true)}
          onExport={() => alert('Exporting pricing rules...')}
          onView={(item) => alert(`Rule: ${item.name}`)}
          onEdit={(item) => alert(`Editing rule: ${item.name}`)}
          onDelete={(item) => {
            if (confirm(`Remove pricing rule ${item.name}?`)) {
              setRules(rules.filter((r) => r.id !== item.id));
            }
          }}
        />

        {/* Add Rule Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Pricing Rule"
          subtitle="Define discount parameters and applicability criteria"
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
                form="add-rule-form"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Save Pricing Rule
              </button>
            </>
          }
        >
          <form id="add-rule-form" onSubmit={handleCreate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rule Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Black Friday Annual Pre-pay Special"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rule Type</label>
                <select
                  value={formData.ruleType}
                  onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                >
                  <option>Billing Term (Annual)</option>
                  <option>Volume Tiered</option>
                  <option>Coupon Code</option>
                  <option>Customer Specific</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discount Rate / Amount</label>
                <input
                  type="text"
                  required
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="20.0%"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicable Target</label>
                <input
                  type="text"
                  value={formData.applyTo}
                  onChange={(e) => setFormData({ ...formData, applyTo: e.target.value })}
                  placeholder="All Plans or Specific SKU"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Valid Until</label>
                <input
                  type="date"
                  required
                  value={formData.validTill}
                  onChange={(e) => setFormData({ ...formData, validTill: e.target.value })}
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
