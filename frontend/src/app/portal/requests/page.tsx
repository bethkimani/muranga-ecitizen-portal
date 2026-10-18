'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ChevronRightIcon, FilePlus2Icon, LayoutGridIcon, ListIcon,
  SearchIcon, SearchXIcon, XIcon,
} from 'lucide-react';
import { CURRENT_CITIZEN, requests } from '@/data/requests';
import { categories, departments } from '@/data/categories';
import { PageHeader, EmptyState, Pagination } from '@/components/ui';
import { StatusBadge } from '@/components/StatusBadge';
import { RequestCard } from '@/components/RequestCard';
import { formatDate, relativeTime } from '@/utils/format';

const PER_PAGE = 6;
const STATUSES = ['Pending', 'In Progress', 'Resolved', 'Rejected'] as const;

type ViewMode = 'grid' | 'table';
type SortMode = 'newest' | 'oldest' | 'updated';
type Chip = { label: string; clear: () => void };

export default function MyRequestsPage() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [dept, setDept] = useState('');
  const [sort, setSort] = useState<SortMode>('newest');
  const [view, setView] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    const list = requests.filter(
      (r) =>
        r.citizen === CURRENT_CITIZEN &&
        (!q || r.ref.toLowerCase().includes(needle) || r.title.toLowerCase().includes(needle)) &&
        (!status || r.status === status) &&
        (!category || r.category === category) &&
        (!dept || r.department === dept),
    );
    return list.sort((a, b) =>
      sort === 'oldest'
        ? a.submitted.localeCompare(b.submitted)
        : sort === 'updated'
        ? b.updated.localeCompare(a.updated)
        : b.submitted.localeCompare(a.submitted),
    );
  }, [q, status, category, dept, sort]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chips = [
    status && { label: status, clear: () => setStatus('') },
    category && {
      label: categories.find((c) => c.id === category)?.name ?? category,
      clear: () => setCategory(''),
    },
    dept && { label: dept, clear: () => setDept('') },
  ].filter(Boolean) as Chip[];

  const resetFilters = () => {
    setStatus('');
    setCategory('');
    setDept('');
    setPage(1);
  };

  const resetAll = () => {
    setQ('');
    resetFilters();
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="My requests"
        description="Every issue you’ve reported, with its latest status."
        actions={
          <Link href="/portal/submit" className="btn-primary">
            <FilePlus2Icon className="h-4 w-4" /> New request
          </Link>
        }
      />

      <div className="card p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search by reference or title</span>
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by reference (e.g. MCG-2026-004812) or title"
              className="field h-10 pl-9"
            />
          </label>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="field h-10 lg:w-36"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              aria-label="Filter by category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="field h-10 lg:w-40"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              aria-label="Filter by department"
              value={dept}
              onChange={(e) => {
                setDept(e.target.value);
                setPage(1);
              }}
              className="field h-10 lg:w-44"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              aria-label="Sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="field h-10 lg:w-40"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="updated">Last updated</option>
            </select>
          </div>

          <div className="hidden rounded-lg border border-line p-0.5 md:flex" role="group" aria-label="View">
            {(
              [
                ['grid', LayoutGridIcon],
                ['table', ListIcon],
              ] as const
            ).map(([v, Icon]) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                aria-label={`${v} view`}
                className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors duration-150 ${
                  view === v ? 'bg-brand-50 text-brand' : 'text-muted hover:text-ink'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  c.clear();
                  setPage(1);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand hover:bg-brand-100"
              >
                {c.label} <XIcon className="h-3 w-3" aria-label="Remove filter" />
              </button>
            ))}
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-muted hover:text-ink"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <p className="mt-5 text-sm text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? 'request' : 'requests'}
      </p>

      {filtered.length === 0 ? (
        <div className="card mt-3">
          <EmptyState
            icon={SearchXIcon}
            title="No requests match your search"
            body="Try a different reference number or remove some filters."
            action={
              <button type="button" className="btn-secondary" onClick={resetAll}>
                Reset filters
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div
            className={`mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
              view === 'table' ? 'md:hidden' : ''
            }`}
          >
            {shown.map((r) => (
              <RequestCard key={r.ref} request={r} to={`/portal/requests/${r.ref}`} />
            ))}
          </div>

          {view === 'table' && (
            <div className="card mt-3 hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead className="bg-canvas text-left text-xs font-semibold text-muted">
                  <tr>
                    {['Reference', 'Title', 'Category', 'Location', 'Submitted', 'Status', 'Last update', ''].map(
                      (h, i) => (
                        <th key={`${h}-${i}`} className="px-4 py-3">
                          {h || <span className="sr-only">Actions</span>}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((r) => (
                    <tr key={r.ref} className="hover:bg-canvas/60">
                      <td className="px-4 py-3.5 font-mono text-xs font-semibold">{r.ref}</td>
                      <td className="max-w-[260px] truncate px-4 py-3.5 font-medium text-ink">{r.title}</td>
                      <td className="px-4 py-3.5 text-muted">
                        {categories.find((c) => c.id === r.category)?.name}
                      </td>
                      <td className="px-4 py-3.5 text-muted">{r.ward}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-muted">{formatDate(r.submitted)}</td>
                      <td className="px-4 py-3.5"><StatusBadge status={r.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-muted">{relativeTime(r.updated)}</td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/portal/requests/${r.ref}`}
                          className="inline-flex items-center font-semibold text-brand"
                        >
                          View <ChevronRightIcon className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card mt-4">
            <Pagination page={page} pages={pages} total={filtered.length} onChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}