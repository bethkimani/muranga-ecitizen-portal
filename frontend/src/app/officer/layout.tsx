'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  InboxIcon,
  UserCheckIcon,
  FolderKanbanIcon,
  CheckCircle2Icon,
  ClockIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { RequireRole, useCurrentUser } from '@/components/RequireRole';
import { displayName, initialsOf, logout, roleLabel } from '@/api/auth';

const officerNavLinks = [
  { label: 'Assigned to me', href: '/officer', queue: 'assigned', icon: UserCheckIcon },
  { label: 'Awaiting assignment', href: '/officer?queue=new', queue: 'new', icon: InboxIcon },
  { label: 'All open cases', href: '/officer?queue=open', queue: 'open', icon: FolderKanbanIcon },
  { label: 'Resolved or rejected', href: '/officer?queue=done', queue: 'done', icon: CheckCircle2Icon },
  { label: 'Recently updated', href: '/officer?queue=recent', queue: 'recent', icon: ClockIcon },
];

function OfficerSidebar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const user = useCurrentUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentQueue = params.get('queue') ?? 'assigned';

  function signOut() {
    logout();
    router.replace('/signin');
  }

  return (
    <>
      {/* Mobile top header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Logo subtitle="Officer Workspace" />
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
            <Logo inverted subtitle="Officer Workspace" />
          </div>

          <nav className="mt-6 space-y-1">
            {officerNavLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === '/officer' && currentQueue === item.queue;
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
              <div className="w-9 h-9 shrink-0 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
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

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={['STAFF', 'DEPT_HEAD', 'ADMIN']}>
      <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
        <Suspense fallback={<div className="w-64 bg-slate-900" />}>
          <OfficerSidebar />
        </Suspense>
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </RequireRole>
  );
}