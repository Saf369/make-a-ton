'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  moduleName?: string;
}

// Child component wrapped in Suspense so Next.js static prerendering does not fail on dynamic route params
const RouteScrollPreserver: React.FC = () => {
  const pathname = usePathname();

  // Restore scroll position when returning to this page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedY = sessionStorage.getItem(`brightloop_page_scroll_${pathname}`);
    if (savedY !== null && Number(savedY) > 0) {
      const timer = setTimeout(() => {
        window.scrollTo({ top: Number(savedY), behavior: 'instant' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  // Record scroll position as user scrolls
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          sessionStorage.setItem(`brightloop_page_scroll_${pathname}`, String(window.scrollY));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
};

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  moduleName
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Suspense fallback={null}>
        <RouteScrollPreserver />
      </Suspense>

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
