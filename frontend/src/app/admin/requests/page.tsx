'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowUpDownIcon, DownloadIcon, ExternalLinkIcon, MoreHorizontalIcon, SearchIcon,
  SearchXIcon, SlidersHorizontalIcon, UserPlusIcon, XIcon,
} from 'lucide-react';
import { requests as seed } from '@/data/requests';
import { categories, departments, subCounties } from '@/data/categories';
import { staff } from '@/data/portal';
import { StatusBadge, PriorityBadge } from '@/components/StatusBadge';
import { Modal } from '@/components/Modal';
import { StatusStepper } from '@/components/StatusStepper';
import { PageHeader, EmptyState, Pagination } from '@/components/ui';
import { formatDate, formatDateTime, relativeTime } from '@/utils/format';
import type { RequestStatus, ServiceRequest } from '@/types/request';

const PER_PAGE = 8;
type SortKey = 'submitted' | 'updated' | 'priority';
const prioRank: Record<ServiceRequest['priority'], number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export default function AdminRequestsPage() {
  // Route files can't receive props, so this is a fixed value.
  // Set it to true to get the "Request assignment" view.
  const assignmentMode: boolean = false;

  const [rows, setRows] = useState<ServiceRequest[]>(seed);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [dept, setDept] = useState(assignmentMode ? '__none' : '');
  const [cat, setCat] = useState('');
  const [sub, setSub] = useState('');
  const [prio, setPrio] = useState('');
  const [showAdv, setShowAdv] = useState(false);
  const [sort, setSort] = useState<SortKey>('updated');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignDept, setAssignDept] = useState('');
  const [assignOfficer, setAssignOfficer] = useState('');
  const [drawer, setDrawer] = useState<ServiceRequest | null>(null);
  const [statusDialog, setStatusDialog] = useState<ServiceRequest | null>(null);
  const [nextStatus, setNextStatus] = useState<RequestStatus>('In Progress');

  const filtered = useMemo(() => {
    const needle = q.toLowerCase();
    const list = rows.filter(
      (r) =>
        (!q || (r.ref + r.title + r.ward).toLowerCase().includes(needle)) &&
        (!status || r.status === status) &&
        (!dept || (dept === '__none' ? !r.department : r.department === dept)) &&
        (!cat || r.category === cat) &&
        (!sub || r.subCounty === sub) &&
        (!prio || r.priority === prio),
    );
    return [...list].sort((a, b) =>
      sort === 'priority' ? prioRank[a.priority] - prioRank[b.priority] : b[sort].localeCompare(a[sort]),
    );
  }, [rows, q, status, dept, cat, sub, prio, sort]);

  const pages = Math.ceil(filtered.length / PER_PAGE);
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const allSel = shown.length > 0 && shown.every((r) => selected.includes(r.ref));
  const officers = staff.filter(
    (s) =>
      s.status === 'Active' &&
      (!assignDept || s.department === assignDept) &&
      s.role !== 'Administrator',
  );

  const doAssign = () => {
    setRows((rs) =>
      rs.map((r) =>
        selected.includes(r.ref)
          ? {
              ...r,
              department: assignDept,
              officer: assignOfficer
                ? assignOfficer
                    .split(' ')
                    .map((p, i) => (i === 0 ? `${p[0]}.` : p))
                    .join(' ')
                : r.officer,
              status: r.status === 'Pending' ? 'In Progress' : r.status,
            }
          : r,
      ),
    );
    toast.success(`${selected.length} request${selected.length > 1 ? 's' : ''} assigned to ${assignDept}`);
    setSelected([]);
    setAssignOpen(false);
    setAssignDept('');
    setAssignOfficer('');
  };

  const toggleOne = (ref: string, sel: boolean) =>
    setSelected(sel ? selected.filter((s) => s !== ref) : [...selected, ref]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title={assignmentMode ? 'Request assignment' : 'All requests'}
        description={
          assignmentMode
            ? 'New requests waiting to be routed to a department and officer.'
            : 'Search, filter and manage every service request.'
        }
        actions={
          <button
            type="button"
            onClick={() => toast.success(`Exporting ${filtered.length} rows to CSV`)}
            className="btn-secondary"
          >
            <DownloadIcon className="h-4 w-4" /> Export CSV
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="space-y-3 border-b border-line p-4">
          <div className="flex flex-col gap-2 lg:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search</span>
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
                placeholder="Search reference, title or ward"
                className="field h-10 pl-9"
              />
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <select
                aria-label="Status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="field h-10 sm:w-36"
              >
                <option value="">All statuses</option>
                {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                aria-label="Department"
                value={dept}
                onChange={(e) => {
                  setDept(e.target.value);
                  setPage(1);
                }}
                className="field h-10 sm:w-48"
              >
                <option value="">All departments</option>
                <option value="__none">Unassigned</option>
                {departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowAdv((s) => !s)}
                aria-expanded={showAdv}
                className={`btn-secondary h-10 ${showAdv ? 'border-brand text-brand' : ''}`}
              >
                <SlidersHorizontalIcon className="h-4 w-4" /> More filters
              </button>
              <label className="relative">
                <span className="sr-only">Sort by</span>
                <ArrowUpDownIcon
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="field h-10 pl-9 sm:w-44"
                >
                  <option value="updated">Last updated</option>
                  <option value="submitted">Newest submitted</option>
                  <option value="priority">Highest priority</option>
                </select>
              </label>
            </div>
          </div>
          {showAdv && (
            <div className="grid gap-2 sm:grid-cols-3">
              <select
                aria-label="Category"
                value={cat}
                onChange={(e) => {
                  setCat(e.target.value);
                  setPage(1);
                }}
                className="field h-10"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                aria-label="Sub-county"
                value={sub}
                onChange={(e) => {
                  setSub(e.target.value);
                  setPage(1);
                }}
                className="field h-10"
              >
                <option value="">All sub-counties</option>
                {Object.keys(subCounties).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <select
                aria-label="Priority"
                value={prio}
                onChange={(e) => {
                  setPrio(e.target.value);
                  setPage(1);
                }}
                className="field h-10"
              >
                <option value="">All priorities</option>
                {['Urgent', 'High', 'Medium', 'Low'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div className="flex items-center justify-between gap-3 bg-brand-dark px-4 py-2.5 text-sm text-white">
            <span className="font-semibold">{selected.length} selected</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="btn h-9 bg-gold px-3 text-ink hover:bg-[#E2B946]"
              >
                <UserPlusIcon className="h-4 w-4" /> Assign
              </button>
              <button
                type="button"
                onClick={() => setSelected([])}
                className="btn h-9 px-3 text-white hover:bg-white/10"
              >
                <XIcon className="h-4 w-4" /> Clear
              </button>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <EmptyState
            icon={SearchXIcon}
            title="No requests found"
            body="No requests match these filters. Try widening your search."
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-sm">
                <thead className="bg-canvas text-left text-xs font-semibold text-muted">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all on page"
                        checked={allSel}
                        onChange={() =>
                          setSelected(
                            allSel
                              ? selected.filter((s) => !shown.some((r) => r.ref === s))
                              : Array.from(new Set([...selected, ...shown.map((r) => r.ref)])),
                          )
                        }
                        className="h-4 w-4 accent-brand"
                      />
                    </th>
                    {['Reference', 'Request', 'Location', 'Department / Officer', 'Priority', 'Status', 'Submitted', 'Updated', ''].map(
                      (h, i) => (
                        <th key={`${h}-${i}`} className="whitespace-nowrap px-3 py-3">
                          {h || <span className="sr-only">Actions</span>}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((r) => {
                    const sel = selected.includes(r.ref);
                    return (
                      <tr
                        key={r.ref}
                        className={`transition-colors duration-150 ${sel ? 'bg-brand-50/60' : 'hover:bg-canvas/60'}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Select ${r.ref}`}
                            checked={sel}
                            onChange={() => toggleOne(r.ref, sel)}
                            className="h-4 w-4 accent-brand"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <button
                            type="button"
                            onClick={() => setDrawer(r)}
                            className="font-mono text-xs font-semibold text-brand hover:underline"
                          >
                            {r.ref}
                          </button>
                        </td>
                        <td className="max-w-[240px] px-3 py-3">
                          <p className="truncate font-medium text-ink">{r.title}</p>
                          <p className="text-xs text-muted">
                            {categories.find((c) => c.id === r.category)?.name}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted">
                          {r.ward}
                          <span className="block text-xs">{r.subCounty}</span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          {r.department ? (
                            <>
                              <p className="text-ink">{r.department}</p>
                              <p className="text-xs text-muted">{r.officer ?? 'No officer yet'}</p>
                            </>
                          ) : (
                            <span className="rounded-md bg-warning-50 px-2 py-0.5 text-xs font-semibold text-warning-ink">
                              Unassigned
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3"><PriorityBadge priority={r.priority} /></td>
                        <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted">{formatDate(r.submitted)}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted" suppressHydrationWarning>
                          {relativeTime(r.updated)}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusDialog(r);
                              setNextStatus(r.status === 'Pending' ? 'In Progress' : r.status);
                            }}
                            className="btn-ghost h-8 w-8 px-0"
                            aria-label={`Change status of ${r.ref}`}
                          >
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-line lg:hidden">
              {shown.map((r) => {
                const sel = selected.includes(r.ref);
                return (
                  <li key={r.ref} className={`flex gap-3 p-4 ${sel ? 'bg-brand-50/60' : ''}`}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.ref}`}
                      checked={sel}
                      onChange={() => toggleOne(r.ref, sel)}
                      className="mt-1 h-4 w-4 accent-brand"
                    />
                    <button type="button" onClick={() => setDrawer(r)} className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-semibold text-muted">{r.ref}</span>
                        <StatusBadge status={r.status} />
                      </div>
                      <p className="mt-1 font-semibold text-ink">{r.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <PriorityBadge priority={r.priority} />
                        {r.ward} · {r.department ?? 'Unassigned'}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
            <Pagination page={page} pages={pages} total={filtered.length} onChange={setPage} />
          </>
        )}
      </div>

      <Modal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        title={`Assign ${selected.length} request${selected.length > 1 ? 's' : ''}`}
        description="Assigned officers and citizens will be notified."
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setAssignOpen(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" disabled={!assignDept} onClick={doAssign}>
              Confirm assignment
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="ad" className="text-sm font-semibold text-ink">Department</label>
            <select
              id="ad"
              value={assignDept}
              onChange={(e) => {
                setAssignDept(e.target.value);
                setAssignOfficer('');
              }}
              className="field mt-1.5 h-11"
            >
              <option value="">Choose department…</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ao" className="flex items-center gap-2 text-sm font-semibold text-ink">
              Officer <span className="text-xs font-medium text-muted">Optional</span>
            </label>
            <select
              id="ao"
              value={assignOfficer}
              onChange={(e) => setAssignOfficer(e.target.value)}
              disabled={!assignDept}
              className="field mt-1.5 h-11"
            >
              <option value="">
                {assignDept
                  ? officers.length
                    ? 'Let department head assign'
                    : 'No active officers in this department'
                  : 'Choose a department first'}
              </option>
              {officers.map((o) => (
                <option key={o.id} value={o.name}>
                  {o.name} · {o.openCases} open cases
                </option>
              ))}
            </select>
          </div>
          <ul className="max-h-32 space-y-1 overflow-y-auto rounded-lg bg-canvas p-3 text-xs">
            {selected.map((s) => (
              <li key={s} className="font-mono font-semibold text-ink">{s}</li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal
        open={!!statusDialog}
        onClose={() => setStatusDialog(null)}
        title="Update status"
        description={statusDialog ? `${statusDialog.ref} · currently ${statusDialog.status}` : ''}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setStatusDialog(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setRows((rs) =>
                  rs.map((r) => (r.ref === statusDialog?.ref ? { ...r, status: nextStatus } : r)),
                );
                toast.success(`Status changed to ${nextStatus}`);
                setStatusDialog(null);
              }}
            >
              Save status
            </button>
          </>
        }
      >
        <fieldset className="space-y-2">
          <legend className="sr-only">New status</legend>
          {(['Pending', 'In Progress', 'Resolved', 'Rejected'] as RequestStatus[]).map((s) => (
            <label
              key={s}
              className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 ${
                nextStatus === s ? 'border-brand bg-brand-50' : 'border-line'
              }`}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="ns"
                  checked={nextStatus === s}
                  onChange={() => setNextStatus(s)}
                  className="accent-brand"
                />
                <StatusBadge status={s} />
              </span>
            </label>
          ))}
          {(nextStatus === 'Resolved' || nextStatus === 'Rejected') && (
            <textarea
              rows={3}
              className="field mt-2"
              placeholder={
                nextStatus === 'Resolved'
                  ? 'Resolution summary (required, visible to citizen)'
                  : 'Reason for rejection (required, visible to citizen)'
              }
              aria-label="Summary"
            />
          )}
        </fieldset>
      </Modal>

      <Modal
        open={!!drawer}
        onClose={() => setDrawer(null)}
        variant="drawer"
        title={drawer?.ref ?? ''}
        description={drawer?.title}
        footer={
          drawer && (
            <Link href={`/officer/cases/${drawer.ref}`} className="btn-primary">
              <ExternalLinkIcon className="h-4 w-4" /> Open full case
            </Link>
          )
        }
      >
        {drawer && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={drawer.status} size="md" />
              <PriorityBadge priority={drawer.priority} />
            </div>
            <StatusStepper status={drawer.status} />
            <p className="text-sm leading-relaxed text-[#3A433D]">{drawer.description}</p>
            {drawer.evidence[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drawer.evidence[0]}
                alt="Evidence"
                className="aspect-[16/9] w-full rounded-xl object-cover"
              />
            )}
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-xs text-muted">Location</dt><dd className="font-medium">{drawer.landmark}</dd></div>
              <div><dt className="text-xs text-muted">Ward</dt><dd className="font-medium">{drawer.ward}, {drawer.subCounty}</dd></div>
              <div><dt className="text-xs text-muted">Department</dt><dd className="font-medium">{drawer.department ?? 'Unassigned'}</dd></div>
              <div><dt className="text-xs text-muted">Officer</dt><dd className="font-medium">{drawer.officer ?? '—'}</dd></div>
              <div><dt className="text-xs text-muted">Submitted</dt><dd className="font-medium">{formatDateTime(drawer.submitted)}</dd></div>
              <div><dt className="text-xs text-muted">Last updated</dt><dd className="font-medium">{formatDateTime(drawer.updated)}</dd></div>
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}