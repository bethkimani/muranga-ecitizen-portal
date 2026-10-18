'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BellOffIcon, CheckCheckIcon, CircleCheckIcon, FileCheck2Icon, HelpCircleIcon, MegaphoneIcon, RefreshCwIcon, UserCheckIcon } from 'lucide-react';
import { notifications as seed, announcements } from '@/data/portal';
import { PageHeader, EmptyState } from '@/components/ui';
import { formatDate, relativeTime } from '@/utils/format';
import type { NotificationType } from '@/types/portal';

const typeIcon: Record<NotificationType, { icon: typeof MegaphoneIcon; cls: string }> = {
  submitted: { icon: FileCheck2Icon, cls: 'bg-canvas text-ink' },
  assigned: { icon: UserCheckIcon, cls: 'bg-info-50 text-info' },
  status: { icon: RefreshCwIcon, cls: 'bg-info-50 text-info' },
  clarification: { icon: HelpCircleIcon, cls: 'bg-warning-50 text-warning-ink' },
  resolved: { icon: CircleCheckIcon, cls: 'bg-success-50 text-success' },
  announcement: { icon: MegaphoneIcon, cls: 'bg-gold-50 text-gold-ink' }
};

export default function NotificationsPage() {
  const [items, setItems] = useState(seed);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [tab, setTab] = useState<'notifications' | 'announcements'>('notifications');
  const shown = items.filter((n) => filter === 'all' || !n.read);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Notifications"
        description="Updates on your requests and announcements from the county."
        actions={unread > 0 && tab === 'notifications' ? <button onClick={() => setItems((i) => i.map((n) => ({ ...n, read: true })))} className="btn-secondary"><CheckCheckIcon className="h-4 w-4" /> Mark all as read</button> : undefined} />
      
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line">
        <div className="flex gap-6" role="tablist">
          {(['notifications', 'announcements'] as const).map((t) =>
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 text-sm font-semibold capitalize transition-colors duration-150 ${tab === t ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'}`}>
              {t}{t === 'notifications' && unread > 0 && <span className="ml-1.5 rounded-full bg-brand px-1.5 text-[11px] text-white">{unread}</span>}
            </button>
          )}
        </div>
        {tab === 'notifications' &&
          <div className="mb-2 flex rounded-lg bg-canvas p-0.5 text-sm">
            {(['all', 'unread'] as const).map((f) =>
              <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`rounded-md px-3 py-1 font-semibold capitalize ${filter === f ? 'bg-white text-ink shadow-card' : 'text-muted'}`}>{f}</button>
            )}
          </div>
        }
      </div>

      {tab === 'notifications' ?
        shown.length === 0 ?
        <div className="card mt-6"><EmptyState icon={BellOffIcon} title="You’re all caught up" body="New updates on your requests will appear here." /></div> :

        <ul className="card mt-6 divide-y divide-line overflow-hidden">
          {shown.map((n) => {
            const t = typeIcon[n.type];
            const Icon = t.icon;
            const inner = (
              <>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.cls}`}><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm ${n.read ? 'font-medium text-ink' : 'font-bold text-ink'}`}>{n.title}{!n.read && <span className="sr-only"> (unread)</span>}</p>
                    <time className="shrink-0 text-xs text-muted" dateTime={n.date}>{relativeTime(n.date)}</time>
                  </div>
                  <p className="mt-0.5 text-sm text-muted">{n.body}</p>
                  {n.ref && <p className="mt-1.5 font-mono text-xs font-semibold text-brand">{n.ref} →</p>}
                </div>
                {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />}
              </>
            );

            return (
              <li key={n.id} className={n.read ? '' : 'bg-brand-50/40'}>
                {n.ref ?
                  <Link href={`/portal/requests/${n.ref}`} onClick={() => setItems((i) => i.map((x) => x.id === n.id ? { ...x, read: true } : x))} className="flex gap-4 p-4 transition-colors duration-150 hover:bg-canvas md:p-5">{inner}</Link> :
                  <div className="flex gap-4 p-4 md:p-5">{inner}</div>
                }
              </li>
            );
          })}
        </ul> :

        <ul className="mt-6 space-y-3">
          {announcements.map((a) =>
            <li key={a.id} className="card p-5">
              <div className="flex items-center gap-3 text-xs">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 font-bold text-brand">{a.category}</span>
                <time className="text-muted" dateTime={a.date}>Published {formatDate(a.date)}</time>
              </div>
              <h2 className="mt-2 font-bold text-ink">{a.title}</h2>
              <p className="mt-1 text-sm text-muted">{a.summary}</p>
            </li>
          )}
        </ul>
      }
      <p className="mt-6 text-center text-xs text-muted">Email and SMS notifications will be available once the county connects these channels.</p>
    </div>
  );
}