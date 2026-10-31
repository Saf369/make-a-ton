'use client';

import React, { useState, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  moduleName?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  moduleName
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sidebar (Desktop fixed left, mobile drawer) */}
      <Suspense fallback={<aside className="fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#3B3486]" />}>
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
      </Suspense>

      {/* Main Wrapper with Left Margin for Desktop Sidebar */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <TopNav
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          title={title}
          moduleName={moduleName}
        />

        {/* Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
