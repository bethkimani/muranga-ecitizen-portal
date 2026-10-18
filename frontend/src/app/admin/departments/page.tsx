'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { PlusIcon } from 'lucide-react';
import { categories, departments, subCounties } from '@/data/categories';
import { staff } from '@/data/portal';
import { departmentWorkload } from '@/data/analytics';
import { PageHeader } from '@/components/ui';

type Tab = 'departments' | 'categories' | 'locations';

const tabs: { id: Tab; label: string; to: string }[] = [
  { id: 'departments', label: 'Departments', to: '/admin/departments' },
  { id: 'categories', label: 'Service categories & rules', to: '/admin/categories' },
  { id: 'locations', label: 'Locations and wards', to: '/admin/locations' },
];

export default function AdminDepartmentsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const tab: Tab = pathname.startsWith('/admin/categories')
    ? 'categories'
    : pathname.startsWith('/admin/locations')
    ? 'locations'
    : 'departments';

  const [rules, setRules] = useState<Record<string, string>>(
    Object.fromEntries(categories.map((c) => [c.id, c.department]))
  );

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Departments and routing"
        description="Configure who handles what, and where."
        actions={
          <button onClick={() => toast('Add form would open here')} className="btn-primary">
            <PlusIcon className="h-4 w-4" /> Add{' '}
            {tab === 'departments' ? 'department' : tab === 'categories' ? 'category' : 'ward'}
          </button>
        }
      />

      <div className="mb-6 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => router.push(t.to)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold ${
              tab === t.id
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'departments' && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-canvas text-left text-xs font-semibold text-muted">
              <tr>
                {['Department', 'Head', 'Active staff', 'Categories handled', 'Open cases'].map((h) => (
                  <th key={h} className="px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {departments.map((d) => {
                const members = staff.filter((s) => s.department === d && s.status === 'Active');
                const head = staff.find((s) => s.department === d && s.role === 'Department Head');
                const load = departmentWorkload.find((w) =>
                  d.toLowerCase().startsWith(w.name.toLowerCase().slice(0, 4))
                );
                return (
                  <tr key={d} className="hover:bg-canvas/60">
                    <td className="px-5 py-3.5 font-semibold text-ink">{d}</td>
                    <td className="px-5 py-3.5 text-muted">{head?.name ?? 'Not set'}</td>
                    <td className="px-5 py-3.5 text-ink">{members.length}</td>
                    <td className="px-5 py-3.5 text-muted">
                      {categories
                        .filter((c) => rules[c.id] === d)
                        .map((c) => c.name.split(' ')[0])
                        .join(', ') || '—'}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-ink">{load?.open ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'categories' && (
        <div className="card divide-y divide-line">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="grid gap-3 p-5 md:grid-cols-[1.2fr_1fr_160px] md:items-center">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{c.name}</p>
                    <p className="text-xs text-muted">{c.subcategories.length} subcategories</p>
                  </div>
                </div>
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-semibold text-muted">Auto-assign to</span>
                  <select
                    value={rules[c.id]}
                    onChange={(e) => {
                      setRules({ ...rules, [c.id]: e.target.value });
                      toast.success(`${c.name} now routes to ${e.target.value}`);
                    }}
                    className="field h-10"
                  >
                    {departments.map((d) => (
                      <option key={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-xs font-semibold text-muted">Response target</span>
                  <input defaultValue={c.responseTarget} className="field h-10" />
                </label>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'locations' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(subCounties).map(([s, wards]) => (
            <section key={s} className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-ink">{s}</h2>
                <span className="text-xs text-muted">{wards.length} wards</span>
              </div>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {wards.map((w) => (
                  <li key={w} className="rounded-md bg-canvas px-2 py-1 text-xs font-medium text-ink">
                    {w}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}