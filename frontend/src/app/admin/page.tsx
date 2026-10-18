'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowRightIcon, CalendarIcon, ChevronRightIcon, DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { adminKpis, departmentWorkload, volumeByMonth } from '@/data/analytics';
import { departments } from '@/data/categories';
import { requests } from '@/data/requests';
import { ChartCard, Legend, chartColors, tooltipStyle } from '@/components/ChartCard';
import { PriorityBadge } from '@/components/StatusBadge';
import { PageHeader, SampleDataTag } from '@/components/ui';
import { daysUntil } from '@/utils/format';

export default function AdminOverviewPage() {
  const [range, setRange] = useState('6m');
  const [dept, setDept] = useState('');
  const overdue = requests.filter(
    (r) =>
      r.slaDue &&
      r.status !== 'Resolved' &&
      r.status !== 'Rejected' &&
      daysUntil(r.slaDue) < 0,
  );
  const volume = [
    { label: 'Total requests', value: adminKpis.total.toLocaleString('en-US'), tone: undefined as string | undefined },
    { label: 'Pending', value: adminKpis.pending, tone: 'text-warning-ink' },
    { label: 'In progress', value: adminKpis.inProgress, tone: 'text-info' },
    { label: 'Resolved', value: adminKpis.resolved.toLocaleString('en-US'), tone: 'text-success' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="County service overview"
        description="How requests are flowing across departments."
        actions={
          <>
            <label className="relative">
              <span className="sr-only">Date range</span>
              <CalendarIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="field h-10 w-44 pl-9"
              >
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="6m">Last 6 months</option>
                <option value="ytd">Year to date</option>
              </select>
            </label>
            <select
              aria-label="Department"
              value={dept}
              onChange={(e) => setDept(e.target.value)}
              className="field h-10 w-48"
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => toast.success('Report export started — CSV will download shortly')}
              className="btn-secondary h-10"
            >
              <DownloadIcon className="h-4 w-4" /> Export
            </button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_2fr]">
        <Link
          href="/admin/requests"
          className="group rounded-2xl bg-danger p-5 text-white transition-[background-color] duration-150 hover:bg-[#a51f1f]"
        >
          <p className="text-sm font-semibold text-white/85">Overdue requests</p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight">{adminKpis.overdue}</p>
          <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-white/90">
            Review now{' '}
            <ArrowRightIcon className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </p>
        </Link>
        <div className="rounded-2xl bg-brand-dark p-5 text-white">
          <p className="text-sm font-semibold text-white/80">Average resolution time</p>
          <p className="mt-2 text-5xl font-extrabold tracking-tight">
            {adminKpis.avgDays}
            <span className="ml-1 text-xl font-bold text-white/70">days</span>
          </p>
          <p className="mt-2 text-sm text-gold">↓ 0.4 days vs previous period</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {volume.map((v) => (
            <div key={v.label} className="bg-white p-5">
              <dt className="text-sm font-medium text-muted">{v.label}</dt>
              <dd className={`mt-1 text-2xl font-extrabold ${v.tone ?? 'text-ink'}`}>{v.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-2 flex justify-end">
        <SampleDataTag label="All figures are sample data" />
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <ChartCard title="Request volume" description="Received vs resolved per month">
          <Legend
            items={[
              { label: 'Received', color: chartColors.gold },
              { label: 'Resolved', color: chartColors.green },
            ]}
          />
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <AreaChart data={volumeByMonth} margin={{ left: -16, right: 8, top: 8 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="received" name="Received" stroke={chartColors.gold} strokeWidth={2} fill={chartColors.gold} fillOpacity={0.12} />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke={chartColors.green} strokeWidth={2} fill={chartColors.green} fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Department workload" description="Open and overdue cases">
          <Legend
            items={[
              { label: 'Open', color: chartColors.green },
              { label: 'Overdue', color: chartColors.red },
            ]}
          />
          <div className="mt-3 h-64">
            <ResponsiveContainer>
              <BarChart data={departmentWorkload} layout="vertical" margin={{ left: 8, right: 8 }}>
                <CartesianGrid stroke={chartColors.grid} horizontal={false} />
                <XAxis type="number" tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={70} tick={{ fill: chartColors.axis, fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: '#F5F7F5' }} />
                <Bar dataKey="open" name="Open" stackId="a" fill={chartColors.green} radius={[0, 0, 0, 0]} barSize={14} />
                <Bar dataKey="overdue" name="Overdue" stackId="a" fill={chartColors.red} radius={[0, 4, 4, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <section className="card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="font-bold text-ink">Needs attention</h2>
            <p className="text-sm text-muted">Open requests past their service deadline</p>
          </div>
          <Link href="/admin/requests" className="text-sm font-semibold text-brand">
            All requests
          </Link>
        </div>
        <ul className="divide-y divide-line">
          {overdue.map((r) => (
            <li key={r.ref}>
              <Link
                href={`/officer/cases/${r.ref}`}
                className="grid gap-2 px-5 py-3.5 transition-colors duration-150 hover:bg-canvas/70 md:grid-cols-[150px_1fr_180px_80px_110px_20px] md:items-center md:gap-4"
              >
                <span className="font-mono text-xs font-semibold text-muted">{r.ref}</span>
                <span className="truncate text-sm font-semibold text-ink">{r.title}</span>
                <span className="text-sm text-muted">{r.department ?? 'Unassigned'}</span>
                <PriorityBadge priority={r.priority} />
                <span className="text-xs font-semibold text-danger" suppressHydrationWarning>
                  {Math.abs(daysUntil(r.slaDue!))} days overdue
                </span>
                <ChevronRightIcon className="hidden h-4 w-4 text-muted md:block" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}