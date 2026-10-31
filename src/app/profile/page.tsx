'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Shield,
  Bell,
  Key,
  CheckCircle2,
  Building,
  Mail,
  Phone,
  Clock,
  Save
} from 'lucide-react';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <DashboardLayout title="User Profile & Account Settings" moduleName="USER MODULE">
      <div className="space-y-6 max-w-5xl">
        {/* Profile Card Header */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-[#3B3486] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-indigo-200">
              A
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-900">Vrinda Techapps</h2>
                <Badge status="Active" />
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
                  System Manager
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                admin@brightloop.io &bull; Tenant: Vrinda Techapps Ltd. &bull; Registered Office: Oman
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>Last login: 10 mins ago</span>
                <span>&bull;</span>
                <span>Timezone: UTC+04:00 (Gulf Standard Time)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSavedMessage(true);
              setTimeout(() => setSavedMessage(false), 3000);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>

        {savedMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Profile and security preferences successfully updated!</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 flex gap-6 text-xs font-medium text-slate-500">
          {[
            { id: 'profile', label: 'Personal & Organization Details' },
            { id: 'security', label: 'Password & Authentication' },
            { id: 'notifications', label: 'System Alert Preferences' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 relative transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 font-semibold border-b-2 border-indigo-600'
                  : 'hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Account Information</h3>
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    defaultValue="Vrinda Techapps"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <input
                    type="text"
                    disabled
                    value="System Manager (Full Access)"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    defaultValue="admin@brightloop.io"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Direct Phone</label>
                  <input
                    type="tel"
                    defaultValue="+968 24 123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Language</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                    <option>English (United States)</option>
                    <option>Arabic (العربية)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                  <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none">
                    <option>UTC+04:00 (Muscat, Abu Dhabi, Dubai)</option>
                    <option>UTC+03:00 (Riyadh, Kuwait)</option>
                    <option>UTC+00:00 (London, GMT)</option>
                    <option>UTC-05:00 (Eastern Time US)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
                >
                  Save Profile Information
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Change Password</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
              <button
                onClick={() => alert('Password successfully changed!')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                Update Password
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-slate-500">
                Enhance your account security by requiring an authenticator app code on login.
              </p>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  2FA Authenticator Enabled
                </span>
                <button className="text-indigo-600 hover:underline">Reconfigure</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Automated Notification Rules</h3>
            <div className="space-y-3">
              {[
                { title: 'Nightly Billing Run Summary', desc: 'Receive email digest whenever recurring billing charges execute' },
                { title: 'Payment Failure / Dunning Alerts', desc: 'Immediate notification if high-value enterprise invoice payment fails' },
                { title: 'New Subscription Orders', desc: 'Real-time alert when customers self-serve upgrade via checkout' },
                { title: 'License Quota Exceeded Warnings', desc: 'Warn when customers reach 90% and 100% of seat capacities' }
              ].map((item) => (
                <label key={item.title} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                  <input type="checkbox" defaultChecked className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                  <div>
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="text-slate-400 text-[11px]">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <button
              onClick={() => alert('Preferences saved!')}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
            >
              Save Notification Preferences
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
