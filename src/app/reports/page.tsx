'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import {
  Download,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  const mrrMovements = [
    { period: 'October 2026', starting: '$224,500', newMrr: '+$24,800', expansion: '+$9,200', contraction: '-$3,100', churn: '-$12,400', ending: '$243,000', netGrowth: '+8.2%' },
    { period: 'September 2026', starting: '$208,900', newMrr: '+$22,100', expansion: '+$7,400', contraction: '-$2,800', churn: '-$11,100', ending: '$224,500', netGrowth: '+7.4%' },
    { period: 'August 2026', starting: '$195,400', newMrr: '+$20,400', expansion: '+$6,800', contraction: '-$1,900', churn: '-$11,800', ending: '$208,900', netGrowth: '+6.9%' },
    { period: 'July 2026', starting: '$182,000', newMrr: '+$19,200', expansion: '+$5,900', contraction: '-$1,700', churn: '-$10,000', ending: '$195,400', netGrowth: '+7.3%' }
  ];

  const planPerformance = [
    { plan: 'Enterprise Cloud Plus', activeCount: 770, mrrContribution: '$92,400', share: '38.0%', avgRenewal: '99.1%' },
    { plan: 'Growth Pro Tier', activeCount: 2210, mrrContribution: '$110,279', share: '45.4%', avgRenewal: '96.4%' },
    { plan: 'Starter Team', activeCount: 1840, mrrContribution: '$40,321', share: '16.6%', avgRenewal: '94.2%' }
  ];

  return (
    <DashboardLayout title="Financial & Subscription Reports" moduleName="MANAGEMENT MODULE">
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Reporting Range:</span>
            </div>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none"
            >
              <option>Last 30 Days</option>
              <option>This Quarter (Q4 2026)</option>
              <option>Year to Date (2026)</option>
              <option>Previous Fiscal Year</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Exporting Financial Report as CSV...')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => alert('Generating Board Presentation PDF...')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Download PDF Summary</span>
            </button>
          </div>
        </div>

        {/* Top Report KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Annual Run Rate (ARR)"
            value="$2,916,000"
            change="+18.4%"
            trend="up"
            period="vs last year"
            iconName="DollarSign"
          />
          <StatCard
            title="Average Revenue Per User (ARPU)"
            value="$50.41"
            change="+$4.20"
            trend="up"
            period="vs last quarter"
            iconName="TrendingUp"
          />
          <StatCard
            title="Customer Lifetime Value (LTV)"
            value="$3,550"
            change="+$320"
            trend="up"
            period="calculated on 1.4% churn"
            iconName="Repeat"
          />
          <StatCard
            title="Net Revenue Retention (NRR)"
            value="114.2%"
            change="+2.1%"
            trend="up"
            period="benchmark: >110%"
            iconName="Percent"
          />
        </div>

        {/* MRR Waterfall Breakdown Table */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">MRR Movement & Waterfall Cohorts</h3>
              <p className="text-xs text-slate-500">Decomposition of subscription revenue changes</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full">
              Automated Reconciliation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Period</th>
                  <th className="py-2.5 px-4">Starting MRR</th>
                  <th className="py-2.5 px-4 text-emerald-600">New MRR</th>
                  <th className="py-2.5 px-4 text-indigo-600">Expansion</th>
                  <th className="py-2.5 px-4 text-amber-600">Contraction</th>
                  <th className="py-2.5 px-4 text-rose-600">Churn</th>
                  <th className="py-2.5 px-4 font-semibold text-slate-800">Ending MRR</th>
                  <th className="py-2.5 px-4 text-right">Net Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mrrMovements.map((row) => (
                  <tr key={row.period} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-900">{row.period}</td>
                    <td className="py-3 px-4 text-slate-600">{row.starting}</td>
                    <td className="py-3 px-4 text-emerald-600 font-medium">{row.newMrr}</td>
                    <td className="py-3 px-4 text-indigo-600 font-medium">{row.expansion}</td>
                    <td className="py-3 px-4 text-amber-600 font-medium">{row.contraction}</td>
                    <td className="py-3 px-4 text-rose-600 font-medium">{row.churn}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.ending}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{row.netGrowth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Plan Performance Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Subscription Plan Contribution Analysis</h3>
            <p className="text-xs text-slate-500">Distribution of subscriptions across active tiers</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-medium">
                <tr>
                  <th className="py-2.5 px-4">Plan Name</th>
                  <th className="py-2.5 px-4">Subscribers</th>
                  <th className="py-2.5 px-4">MRR Contribution</th>
                  <th className="py-2.5 px-4">Portfolio Share</th>
                  <th className="py-2.5 px-4 text-right">Renewal Probability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {planPerformance.map((plan) => (
                  <tr key={plan.plan} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{plan.plan}</td>
                    <td className="py-3 px-4 text-slate-600">{plan.activeCount.toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{plan.mrrContribution}</td>
                    <td className="py-3 px-4 text-indigo-600 font-medium">{plan.share}</td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-600">{plan.avgRenewal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
