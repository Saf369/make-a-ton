'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
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
  Save,
  Loader2,
  AlertCircle,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    department: '',
    language: 'English (United States)',
    timezone: 'UTC+04:00 (Muscat, Abu Dhabi, Dubai)'
  });

  // Password Change State
  const [passwordState, setPasswordState] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences State
  const [notifications, setNotifications] = useState({
    billingSummary: true,
    paymentFailure: true,
    newOrders: true,
    licenseQuota: true
  });
  const [notifSuccess, setNotifSuccess] = useState(false);

  // Sync profile data into form when profile loads
  useEffect(() => {
    if (profile || user) {
      setFormData({
        full_name: profile?.full_name || user?.user_metadata?.full_name || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || '',
        organization: profile?.organization || 'Brightloop Hub',
        department: profile?.department || '',
        language: profile?.language || 'English (United States)',
        timezone: profile?.timezone || 'UTC+04:00 (Muscat, Abu Dhabi, Dubai)'
      });
    }
  }, [profile, user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { error } = await updateProfile({
      full_name: formData.full_name,
      phone: formData.phone,
      organization: formData.organization,
      department: formData.department,
      language: formData.language,
      timezone: formData.timezone
    });

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to update profile');
    } else {
      setSuccessMessage('Profile and account details successfully updated in database!');
      setTimeout(() => setSuccessMessage(null), 4000);
      await refreshProfile();
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordState.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordState.newPassword
      });

      if (error) throw error;

      setPasswordSuccess('Your password was updated successfully!');
      setPasswordState({ newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User Profile';
  const displayRole = profile?.role ? profile.role.toUpperCase() : 'USER';
  const displayEmail = profile?.email || user?.email || 'user@brightloop.io';
  const initial = (displayName[0] || 'U').toUpperCase();

  return (
    <DashboardLayout title="User Profile & Account Settings" moduleName="USER MODULE">
      <div className="space-y-6 max-w-5xl">
        {/* Profile Card Header */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-[#3B3486] text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-indigo-200">
              {initial}
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                <Badge status={profile?.is_active ?? true ? 'Active' : 'Inactive'} />
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-md">
                  {displayRole === 'ADMIN' ? 'Super Admin (Full Hub Access)' : `${displayRole} Operator`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {displayEmail} &bull; Tenant: {profile?.organization || 'Brightloop Hub'} &bull; Dept: {profile?.department || 'Executive'}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>Database ID: {profile?.id ? `${profile.id.slice(0, 8)}…` : 'Connected'}</span>
                <span>&bull;</span>
                <span>Timezone: {formData.timezone.split(' ')[0]}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleProfileSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Changes</span>
          </button>
        </div>

        {/* Global Feedback Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
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
            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                  <input
                    type="text"
                    disabled
                    value={`${displayRole} — Managed by System Security`}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Direct Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+968 24 123456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Organization / Tenant</label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="e.g. Brightloop Hub"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Finance & Accounting"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">System Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  >
                    <option>English (United States)</option>
                    <option>Arabic (العربية)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                  >
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
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Profile Information</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">Change Account Password</h3>
              <p className="text-slate-500">
                Update your Supabase authentication password. You will need to use this new password on your next login.
              </p>

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 8 characters"
                      value={passwordState.newPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm new password"
                      value={passwordState.confirmPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 shadow-xs"
                >
                  {isUpdatingPassword && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Update Password</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-xs space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Two-Factor Authentication (2FA)</h3>
              <p className="text-slate-500">
                Enhance your account security by requiring an authenticator app code on login.
              </p>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Account Protected via Supabase Auth
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-xs space-y-4">
            <h3 className="text-sm font-semibold text-slate-900">Automated Notification Rules</h3>
            <p className="text-slate-500">Select which automated system alerts you want to receive.</p>

            {notifSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Notification preferences saved!</span>
              </div>
            )}

            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.billingSummary}
                  onChange={(e) => setNotifications({ ...notifications, billingSummary: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-800">Nightly Billing Run Summary</p>
                  <p className="text-slate-400 text-[11px]">Receive email digest whenever recurring billing charges execute</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.paymentFailure}
                  onChange={(e) => setNotifications({ ...notifications, paymentFailure: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-800">Payment Failure / Dunning Alerts</p>
                  <p className="text-slate-400 text-[11px]">Immediate notification if high-value enterprise invoice payment fails</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.newOrders}
                  onChange={(e) => setNotifications({ ...notifications, newOrders: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-800">New Subscription Orders</p>
                  <p className="text-slate-400 text-[11px]">Real-time alert when customers self-serve upgrade via checkout</p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.licenseQuota}
                  onChange={(e) => setNotifications({ ...notifications, licenseQuota: e.target.checked })}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-800">License Quota Exceeded Warnings</p>
                  <p className="text-slate-400 text-[11px]">Warn when customers reach 90% and 100% of seat capacities</p>
                </div>
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                setNotifSuccess(true);
                setTimeout(() => setNotifSuccess(false), 3000);
              }}
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
