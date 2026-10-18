'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRightIcon,
  ClipboardListIcon,
  InboxIcon,
  Loader2Icon,
  MapPinIcon,
  SearchIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { EmptyState } from '@/components/ui';
import { useCurrentUser } from '@/components/RequireRole';
import { getMyRequests, type ApiRequest } from '@/api/requests';
import { getCategories, type Category } from '@/api/reference';
import { relativeTime } from '@/utils/format';

type Queue = 'assigned' | 'new' | 'open' | 'done' | 'recent';
type BadgeStatus = React.ComponentProps<typeof StatusBadge>['status'];

const isOpen = (r: ApiRequest) => r.status === 'Pending' || r.status === 'In Progress';

const queues: { id: Queue; label: string; filter: (r: ApiRequest, myId: number) => boolean }[] = [
  { id: 'assigned', label: 'Assigned to me', filter: (r, me) => r.assigned_officer === me && isOpen(r) },
  { id: 'new', label: 'Awaiting assignment', filter: (r) => r.assigned_officer === null && isOpen(r) },
  { id: 'open', label: 'All open cases', filter: (r) => isOpen(r) },
  { id: 'done', label: 'Resolved or rejected', filter: (r) => !isOpen(r) },
  { id: 'recent', label: 'Recently updated', filter: () => true },
];

function Assignee({ officerId, myId }: { officerId: number | null; myId: number }) {
  if (officerId === null) {
    return <span className="whitespace-nowrap text-xs font-semibold text-warning-ink">Unassigned</span>;
  }
  if (officerId === myId) {
    return <span className="whitespace-nowrap text-xs font-semibold text-brand">Assigned to you</span>;
  }
  return <span className="whitespace-nowrap text-xs text-muted">Assigned</span>;
}

function OfficerWorkspace() {
  const user = useCurrentUser();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [greeting] = useState(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  });

  const queueParam = params.get('queue');
  const active: Queue = queues.some((x) => x.id === queueParam) ? (queueParam as Queue) : 'assigned';
  const queue = queues.find((x) => x.id === active) ?? queues[0];

  useEffect(() => {
    let alive = true;
    Promise.all([getMyRequests(), getCategories()])
      .then(([r, c]) => {
        if (!alive) return;
        setRequests(r);
        setCategories(c);
      })
      .catch(() => {
        if (alive) setLoadError('Could not load cases. Check that the backend is running, then reload.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const counts = useMemo(() => {
    const out = {} as Record<Queue, number>;
    for (const x of queues) {
      out[x.id] =
        x.id === 'recent'
          ? Math.min(8, requests.length)
          : requests.filter((r) => x.filter(r, user.id)).length;
    }
    return out;
  }, [requests, user.id]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    let out = requests
      .filter((r) => queue.filter(r, user.id))
      .filter(
        (r) =>
          (!needle || `${r.ref_number} ${r.title} ${r.ward}`.toLowerCase().includes(needle)) &&
          (!cat || String(r.category) === cat),
      );
    if (active === 'recent') {
      out = [...out].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 8);
    }
    return out;
  }, [requests, queue, active, q, cat, user.id]);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">
          {greeting}, {user.first_name || user.username}
        </h1>
        <p className="mt-1 text-muted">
          You have <span className="font-semibold text-ink">{counts.assigned} open cases</span> assigned to
          you, and <span className="font-semibold text-ink">{counts.new}</span> waiting for assignment.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5" role="tablist" aria-label="Case queues">
        {queues.map((x) => {
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
              <p className="text-2xl font-extrabold text-ink">{loading ? '–' : counts[x.id]}</p>
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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted">
            <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading cases…
          </div>
        ) : loadError ? (
          <p role="alert" className="p-6 text-sm text-danger">
            {loadError}
          </p>
        ) : list.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            title="Nothing in this queue"
            body="When cases match this queue they’ll appear here."
          />
        ) : (
          <ul className="divide-y divide-line">
            {list.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/officer/cases/${r.id}`}
                  className="group grid gap-3 px-4 py-4 transition-colors duration-150 hover:bg-canvas/70 md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-6 md:px-5"
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-brand">
                      <ClipboardListIcon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-ink">{r.title}</p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
                        <span className="font-mono font-semibold">{r.ref_number}</span>
                        <span>{catName.get(r.category) ?? 'Request'}</span>
                        <span className="flex items-center gap-0.5">
                          <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                          {r.ward}, {r.sub_county}
                        </span>
                        <span>Updated {relativeTime(r.updated_at)}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:contents">
                    <StatusBadge status={r.status as BadgeStatus} />
                    <Assignee officerId={r.assigned_officer} myId={user.id} />
                    <ChevronRightIcon
                      className="ml-auto h-4 w-4 text-muted transition-transform duration-150 group-hover:translate-x-0.5 md:ml-0"
                      aria-hidden="true"
                    />
                  </div>
                </Link>
              </li>
            ))}
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