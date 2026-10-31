'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface TopNavProps {
  onOpenMobileSidebar: () => void;
  title?: string;
  moduleName?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenMobileSidebar,
  title,
  moduleName
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          {moduleName && (
            <>
              <span className="text-slate-400 font-medium hidden sm:inline">{moduleName}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
            </>
          )}
          <span className="text-slate-800 font-semibold text-sm sm:text-base">
            {title || 'Dashboard'}
          </span>
        </div>
      </div>

      {/* Center/Right: Search bar, notification alerts, user menu */}
      <div className="flex items-center gap-3">
        {/* Command Search (matches screenshot "Search or type a command (Ctrl + G)") */}
        <div className="relative hidden md:block w-64 lg:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search or type a command (Ctrl + G)"
            className="w-full pl-9 pr-14 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-sans border border-slate-200 px-1.5 py-0.5 rounded bg-white shadow-2xs">
            Ctrl+G
          </kbd>
        </div>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown Panel (matching screenshot floating cards) */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-slate-900 text-sm">Notifications & Alerts</span>
                <span className="text-[11px] bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">
                  3 unread
                </span>
              </div>

              <div className="py-2 divide-y divide-slate-100 space-y-2">
                {/* 12 New Orders Card */}
                <div className="pt-2 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">12 New Orders</p>
                      <span className="text-[10px] text-slate-400">10m ago</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">Orders worth ₹1,85,000 received today via checkout.</p>
                    <Link
                      href="/sales-orders"
                      onClick={() => setShowNotifications(false)}
                      className="mt-1.5 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View Orders &rarr;
                    </Link>
                  </div>
                </div>

                {/* Stock / Quota Alert Card */}
                <div className="pt-3 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">Subscription Quota Alert</p>
                      <span className="text-[10px] text-slate-400">1h ago</span>
                    </div>
                    <p className="text-slate-500 mt-0.5">5 customer accounts have reached 90% seat allowance.</p>
                    <Link
                      href="/subscriptions"
                      onClick={() => setShowNotifications(false)}
                      className="mt-1.5 inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1 pl-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100">
              A
            </div>
            <span className="hidden sm:inline font-semibold text-slate-800">Admin</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-900">Admin Manager</p>
                <p className="text-[11px] text-slate-500">admin@brightloop.io</p>
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/customer-portal"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                  <span>Customer Portal</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
