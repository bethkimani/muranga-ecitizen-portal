'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboardIcon,
  PlusCircleIcon,
  FolderKanbanIcon,
  BookOpenIcon,
  BellIcon,
  UserIcon,
  HelpCircleIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

const citizenNavLinks = [
  { label: 'Dashboard', href: '/portal', icon: LayoutDashboardIcon },
  { label: 'New Request', href: '/portal/submit', icon: PlusCircleIcon },
  { label: 'My Requests', href: '/portal/requests', icon: FolderKanbanIcon },
  { label: 'Service Directory', href: '/portal/services', icon: BookOpenIcon },
  { label: 'Notifications', href: '/portal/notifications', icon: BellIcon, badge: '2' },
  { label: 'Profile Settings', href: '/portal/profile', icon: UserIcon },
  { label: 'Help & Support', href: '/portal/help', icon: HelpCircleIcon },
];

function PortalSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Logo subtitle="Citizen Portal" />
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="hidden md:block pb-6 border-b border-slate-800">
            <Logo inverted subtitle="Citizen Portal" />
          </div>

          <nav className="mt-6 space-y-1">
            {citizenNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/portal'
                  ? pathname === '/portal'
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                BK
              </div>
              <div>
                <p className="text-xs font-bold text-white">Beth Kimani</p>
                <p className="text-[11px] text-slate-400">Citizen</p>
              </div>
            </div>
            <Link href="/signin" className="text-slate-400 hover:text-white transition-colors" title="Sign Out">
              <LogOutIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Suspense fallback={<div className="w-64 bg-slate-900" />}>
        <PortalSidebar />
      </Suspense>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}