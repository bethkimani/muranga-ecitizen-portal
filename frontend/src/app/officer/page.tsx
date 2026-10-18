'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AlarmClockIcon, ChevronRightIcon, InboxIcon, MapPinIcon, SearchIcon } from 'lucide-react';
import { requests } from '@/data/requests';
import { categories } from '@/data/categories';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/ui';
import { daysUntil, relativeTime } from '@/utils/format';
import type { ServiceRequest } from '@/types/request';

type Queue = 'assigned' | 'new' | 'priority' | 'sla' | 'recent';

const open = (r: ServiceRequest) => r.status === 'Pending' || r.status === 'In Progress';
const queues: { id: Queue; label: string; filter: (r: ServiceRequest) => boolean }[] = [
  { id: 'assigned', label: 'Assigned to me', filter: (r) => r.officer === 'J. Kariuki' && open(r) },
  { id: 'new', label: 'Awaiting assignment', filter: (r) => !r.department && open(r) },
  { id: 'priority', label: 'Priority cases', filter: (r) => (r.priority === 'High' || r.priority === 'Urgent') && open(r) },
  { id: 'sla', label: 'Near or past deadline', filter: (r) => !!r.slaDue && open(r) && daysUntil(r.slaDue) <= 1 },
  { id: 'recent', label: 'Recently updated', filter: () => true },
];

function SlaLabel({ due }: { due?: string }) {
  if (!due) return <span className="text-xs text-muted">—</span>;
  const d = daysUntil(due);
  const cls = d < 0 ? 'text-danger' : d <= 1 ? 'text-warning-ink' : 'text-muted';
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold ${cls}`}
      suppressHydrationWarning
    >
      <AlarmClockIcon className="h-3.5 w-3.5" aria-hidden="true" />
      {d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? 'Due today' : `${d}d left`}
    </span>
  );
}

function OfficerWorkspace() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const queueParam = params.get('queue');
  const active: Queue = queues.some((x) => x.id === queueParam) ? (queueParam as Queue) : 'assigned';
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const queue = queues.find((x) => x.id === active) ?? queues[0];

  let list = requests
    .filter(queue.filter)
    .filter(
      (r) =>
        (!q || (r.ref + r.title + r.ward).toLowerCase().includes(q.toLowerCase())) &&
        (!cat || r.category === cat),
    );
  if (active === 'recent') list = [...list].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">Good morning, James</h1>
        <p className="mt-1 text-muted">
          You have{' '}
          <span className="font-semibold text-ink">{requests.filter(queues[0].filter).length} open cases</span>, and{' '}
          <span className="font-semibold text-danger" suppressHydrationWarning>
            {requests.filter(queues[3].filter).length}
          </span>{' '}
          are near or past their deadline.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5" role="tablist" aria-label="Case queues">
        {queues.map((x) => {
          const n = x.id === 'recent' ? Math.min(8, requests.length) : requests.filter(x.filter).length;
          const sel = x.id === active;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={sel}
              onClick={() => router.push(x.id === 'assigned' ? pathname : `${pathname}?queue=${x.id}`)}
              className={`rounded-xl border p-4 text-left transition-colors duration-150 ${
                sel ? 'border-brand bg-white ring-1 ring-brand' : 'border-line bg-white hover:border-brand/40'
              }`}
            >
              <p
                className={`text-2xl font-extrabold ${x.id === 'sla' && n > 0 ? 'text-danger' : 'text-ink'}`}
                suppressHydrationWarning
              >
                {n}
              </p>
              <p className={`mt-1 text-xs font-semibold ${sel ? 'text-brand' : 'text-muted'}`}>{x.label}</p>
            </button>
          );
        })}
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:items-center">
          <h2 className="font-bold text-ink sm:mr-auto">{queue.label}</h2>
          <label className="relative">
            <span className="sr-only">Search cases</span>
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Reference, title or ward"
              className="field h-10 pl-9 sm:w-64"
            />
          </label>
          <select
            aria-label="Filter by category"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="field h-10 sm:w-48"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="Nothing in this queue"
            body="When cases match this queue they’ll appear here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((r) => {
              const c = categories.find((x) => x.id === r.category);
              const Icon = c?.icon;
              return (
                <li key={r.ref}>
                  <Link
                    href={`/officer/cases/${r.ref}`}
                    className="group grid gap-3 px-4 py-4 transition-colors duration-150 hover:bg-canvas/70 md:grid-cols-[1fr_auto_auto_auto_auto] md:items-center md:gap-6 md:px-5"
                  >
                    <div className="flex min-w-0 gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-brand">
                        {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">{r.title}</p>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                          <span className="font-mono font-semibold">{r.ref}</span>
                          <span className="flex items-center gap-0.5">
                            <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                            {r.ward}, {r.subCounty}
                          </span>
                          <span suppressHydrationWarning>Updated {relativeTime(r.updated)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:contents">
                      <PriorityBadge priority={r.priority} />
                      <StatusBadge status={r.status} />
                      <SlaLabel due={r.status === 'Resolved' ? undefined : r.slaDue} />
                      <ChevronRightIcon
                        className="ml-auto h-4 w-4 text-muted transition-transform duration-150 group-hover:translate-x-0.5 md:ml-0"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function OfficerPage() {
  return (
    <Suspense fallback={null}>
      <OfficerWorkspace />
    </Suspense>
  );
}