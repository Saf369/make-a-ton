'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Globe,
  BarChart3,
  Users,
  Briefcase,
  UserCheck,
  UserCircle,
  Package,
  Puzzle,
  Zap,
  Repeat,
  FileText,
  FileSpreadsheet,
  ShoppingCart,
  Receipt,
  Percent,
  CalendarClock,
  RefreshCw,
  FileCheck2,
  CreditCard,
  Building2,
  ChevronDown,
  ShieldCheck,
  Shield,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface ModuleGroup {
  name: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { profile, user } = useAuth();

  // Role Priority Hierarchy:
  // - High Priority: 'admin' (Controls whole system, manages staff, billing runs, rules)
  // - Medium Priority: 'staff' (Day-to-day operations, no staff addition)
  // - Low Priority: 'customer' (Isolated portal access to their own subscriptions/invoices)
  const role = profile?.role || (user?.user_metadata?.role as 'admin' | 'staff' | 'customer') || 'admin';

  // Base module definitions
  const allModules: ModuleGroup[] = [
    {
      name: 'MANAGEMENT MODULE',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Customer Portal', href: '/customer-portal', icon: Globe },
        { name: 'Reports', href: '/reports', icon: BarChart3 },
        { name: 'QA & Isolation Audit', href: '/qa-verification', icon: ShieldCheck }
      ]
    },
    {
      name: 'USER MODULE',
      items: [
        { name: 'User Management', href: '/users', icon: Users },
        { name: 'Staff Management', href: '/staff', icon: Briefcase },
        { name: 'Customer Management', href: '/customers', icon: UserCheck },
        { name: 'User Profile', href: '/profile', icon: UserCircle }
      ]
    },
    {
      name: 'SUBSCRIPTION MODULE',
      items: [
        { name: 'Products', href: '/products', icon: Package },
        { name: 'Add-ons', href: '/add-ons', icon: Puzzle },
        { name: 'Subscription Plans', href: '/subscription-plans', icon: Zap },
        { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
        { name: 'Subscription Details', href: '/subscription-details', icon: FileText }
      ]
    },
    {
      name: 'SALES MODULE',
      items: [
        { name: 'Quotations', href: '/quotations', icon: FileSpreadsheet },
        { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
        { name: 'Tax Templates', href: '/tax-templates', icon: Receipt },
        { name: 'Pricing Rules', href: '/pricing-rules', icon: Percent },
        { name: 'Payment Terms', href: '/payment-terms', icon: CalendarClock },
        { name: 'Billing Runs', href: '/billing-runs', icon: RefreshCw },
        { name: 'Sales Invoices', href: '/sales-invoices', icon: FileCheck2 },
        { name: 'Payment Entries', href: '/payment-entries', icon: CreditCard }
      ]
    }
  ];

  // Dynamic Filtering by Role Priority per PDF specification:
  let modules: ModuleGroup[] = [];

  if (role === 'customer') {
    // Low Priority: Customer sees ONLY portal and personal profile
    modules = [
      {
        name: 'CUSTOMER PORTAL (LOW PRIORITY)',
        items: [
          { name: 'My Subscriptions & Invoices', href: '/customer-portal', icon: Globe },
          { name: 'My Profile', href: '/profile', icon: UserCircle }
        ]
      }
    ];
  } else if (role === 'staff') {
    // Medium Priority: Staff handles day-to-day work with limited access
    // Per PDF: "Only the admin can add a new member of staff" -> hide /users and /staff
    modules = [
      {
        name: 'OPERATIONS MODULE (MED PRIORITY)',
        items: [
          { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { name: 'Customer Management', href: '/customers', icon: UserCheck },
          { name: 'Reports', href: '/reports', icon: BarChart3 }
        ]
      },
      {
        name: 'SUBSCRIPTIONS & CATALOGUE',
        items: [
          { name: 'Products', href: '/products', icon: Package },
          { name: 'Add-ons', href: '/add-ons', icon: Puzzle },
          { name: 'Subscription Plans', href: '/subscription-plans', icon: Zap },
          { name: 'Subscriptions', href: '/subscriptions', icon: Repeat },
          { name: 'Subscription Details', href: '/subscription-details', icon: FileText }
        ]
      },
      {
        name: 'SALES & INVOICING',
        items: [
          { name: 'Quotations', href: '/quotations', icon: FileSpreadsheet },
          { name: 'Sales Orders', href: '/sales-orders', icon: ShoppingCart },
          { name: 'Sales Invoices', href: '/sales-invoices', icon: FileCheck2 },
          { name: 'Payment Entries', href: '/payment-entries', icon: CreditCard },
          { name: 'Payment Terms', href: '/payment-terms', icon: CalendarClock },
          { name: 'User Profile', href: '/profile', icon: UserCircle }
        ]
      }
    ];
  } else {
    // High Priority: Admin controls the whole system
    modules = allModules;
  }

  const isCurrentActive = (href: string) => {
    if (href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) {
      return true;
    }
    return pathname === href;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#3B3486] text-white flex flex-col shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-18 px-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center group">
            <Logo variant="white" size="sm" showTagline={true} />
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-indigo-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {modules.map((group) => (
            <div key={group.name} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold text-indigo-300/80 uppercase tracking-wider mb-2">
                {group.name}
              </h4>
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isCurrentActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={`flex items-center gap-3 px-3 py-2 text-xs rounded-xl font-medium transition-all ${
                        active
                          ? 'bg-white text-[#3B3486] font-semibold shadow-sm'
                          : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#3B3486]' : 'text-indigo-200'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Profile / Tenant Card with Priority Level */}
        <div className="p-3 border-t border-white/10 bg-[#342D75]">
          <Link
            href="/profile"
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/40 flex items-center justify-center shrink-0 border border-white/15">
                <Building2 className="w-4 h-4 text-indigo-100" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {profile?.organization || profile?.full_name || (role === 'admin' ? 'Brightloop Admin' : 'Customer Account')}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                    role === 'admin'
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : role === 'staff'
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-blue-400/20 text-blue-300 border border-blue-400/30'
                  }`}>
                    {role === 'admin' ? 'High Priority' : role === 'staff' ? 'Med Priority' : 'Low Priority'}
                  </span>
                  <span className="text-[10px] text-indigo-200 capitalize truncate">{role}</span>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-indigo-200 shrink-0" />
          </Link>
        </div>
      </aside>
    </>
  );
};
