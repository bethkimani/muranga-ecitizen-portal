'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3Icon,
  Building2Icon,
  FolderKanbanIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { RequireRole, useCurrentUser } from '@/components/RequireRole';
import { displayName, initialsOf, logout, roleLabel } from '@/api/auth';

const adminNavLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboardIcon },
  { label: 'All Requests', href: '/admin/requests', icon: FolderKanbanIcon },
  { label: 'Departments', href: '/admin/departments', icon: Building2Icon },
  { label: 'User Management', href: '/admin/users', icon: UsersIcon },
  { label: 'Analytics & Reports', href: '/admin/analytics', icon: BarChart3Icon },
  { label: 'System Settings', href: '/admin/system', icon: SettingsIcon },
];

function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);

  function signOut() {
    logout();
    router.replace('/signin');
  }

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <Logo inverted subtitle="Admin Portal" />
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white focus:outline-none"
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </header>

      {/* Navigation Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-slate-300 flex flex-col justify-between transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="hidden md:block pb-6 border-b border-slate-800">
            <Logo inverted subtitle="Admin Portal" />
          </div>

          <nav className="mt-6 space-y-1">
            {adminNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Signed-in account */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-sm">
                {initialsOf(user)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-white">{displayName(user)}</p>
                <p className="text-[11px] text-slate-400">{roleLabel(user.role)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="text-slate-400 hover:text-white transition-colors"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={['ADMIN']}>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <Suspense fallback={<div className="w-64 bg-slate-900" />}>
          <AdminSidebar />
        </Suspense>
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </RequireRole>
  );
}