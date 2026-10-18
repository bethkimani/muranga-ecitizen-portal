'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  InboxIcon,
  UserCheckIcon,
  FlagIcon,
  AlarmClockIcon,
  ClockIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from 'lucide-react';
import { Logo } from '@/components/Logo';

const officerNavLinks = [
  { label: 'Assigned to me', href: '/officer', queue: 'assigned', icon: UserCheckIcon },
  { label: 'Awaiting assignment', href: '/officer?queue=new', queue: 'new', icon: InboxIcon },
  { label: 'Priority cases', href: '/officer?queue=priority', queue: 'priority', icon: FlagIcon },
  { label: 'Near or past deadline', href: '/officer?queue=sla', queue: 'sla', icon: AlarmClockIcon },
  { label: 'Recently updated', href: '/officer?queue=recent', queue: 'recent', icon: ClockIcon },
];

function OfficerSidebar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentQueue = params.get('queue') ?? 'assigned';

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

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between px-3 py-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                JK
              </div>
              <div>
                <p className="text-xs font-bold text-white">James Kariuki</p>
                <p className="text-[11px] text-slate-400">Officer</p>
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

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Suspense fallback={<div className="w-64 bg-slate-900" />}>
        <OfficerSidebar />
      </Suspense>
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}