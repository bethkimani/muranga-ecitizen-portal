'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { MailPlusIcon, PencilIcon, SearchIcon, UserXIcon } from 'lucide-react';
import { staff as seed } from '@/data/portal';
import { departments } from '@/data/categories';
import { Modal } from '@/components/Modal';
import { PageHeader, Field } from '@/components/ui';
import { initials, relativeTime } from '@/utils/format';
import type { StaffMember, StaffRole } from '@/types/portal';

const roles: StaffRole[] = ['Administrator', 'Department Head', 'County Officer', 'Customer Service'];
const permissions = [
  'View all requests',
  'Assign requests',
  'Update request status',
  'Publish citizen updates',
  'Manage staff accounts',
  'Export reports',
  'Edit system settings',
];
const statusCls: Record<StaffMember['status'], string> = {
  Active: 'bg-success-50 text-success',
  Invited: 'bg-info-50 text-info',
  Deactivated: 'bg-canvas text-muted',
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState<StaffMember[]>(seed);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [invite, setInvite] = useState(false);
  const [edit, setEdit] = useState<StaffMember | null>(null);
  const [deactivate, setDeactivate] = useState<StaffMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const needle = q.toLowerCase();
  const list = rows.filter(
    (s) =>
      (!q || (s.name + s.email + s.department).toLowerCase().includes(needle)) &&
      (!role || s.role === role),
  );

  const sendInvite = () => {
    if (!/@muranga\.go\.ke$/.test(inviteEmail)) {
      return setInviteError('Use an official county email ending in @muranga.go.ke.');
    }
    setRows((r) => [
      ...r,
      {
        id: `s${r.length + 1}`,
        name: inviteEmail.split('@')[0].replace('.', ' '),
        email: inviteEmail,
        role: 'County Officer',
        department: departments[0],
        status: 'Invited',
        openCases: 0,
        lastActive: '2026-10-17T10:30:00',
      },
    ]);
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInvite(false);
    setInviteEmail('');
  };

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Staff and user management"
        description="Invite staff, set roles and permissions, and deactivate accounts. Passwords are never visible to administrators."
        actions={
          <button type="button" onClick={() => setInvite(true)} className="btn-primary">
            <MailPlusIcon className="h-4 w-4" /> Invite staff
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search staff</span>
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email or department"
              className="field h-10 pl-9"
            />
          </label>
          <select
            aria-label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="field h-10 sm:w-52"
          >
            <option value="">All roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-canvas text-left text-xs font-semibold text-muted">
              <tr>
                {['Staff member', 'Role', 'Department', 'Open cases', 'Status', 'Last active', ''].map((h, i) => (
                  <th key={`${h}-${i}`} className="px-4 py-3">
                    {h || <span className="sr-only">Actions</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {list.map((s) => (
                <tr key={s.id} className="hover:bg-canvas/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand">
                        {initials(s.name)}
                      </span>
                      <div>
                        <p className="font-semibold capitalize text-ink">{s.name}</p>
                        <p className="text-xs text-muted">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{s.role}</td>
                  <td className="px-4 py-3 text-muted">{s.department}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{s.openCases}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCls[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted" suppressHydrationWarning>
                    {relativeTime(s.lastActive)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEdit(s)}
                        className="btn-ghost h-8 w-8 px-0"
                        aria-label={`Edit permissions for ${s.name}`}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeactivate(s)}
                        disabled={s.status === 'Deactivated' || s.role === 'Administrator'}
                        className="btn-ghost h-8 w-8 px-0 text-danger hover:bg-danger-50"
                        aria-label={`Deactivate ${s.name}`}
                      >
                        <UserXIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={invite}
        onClose={() => setInvite(false)}
        title="Invite a staff member"
        description="They’ll receive an email to set their own password."
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setInvite(false)}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={sendInvite}>
              Send invitation
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="County email" htmlFor="ie" error={inviteError}>
            <input
              id="ie"
              value={inviteEmail}
              onChange={(e) => {
                setInviteEmail(e.target.value);
                setInviteError('');
              }}
              placeholder="name@muranga.go.ke"
              className={`field h-11 ${inviteError ? 'field-error' : ''}`}
            />
          </Field>
          <Field label="Role" htmlFor="ir">
            <select id="ir" className="field h-11" defaultValue="County Officer">
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </Field>
          <Field label="Department" htmlFor="idp">
            <select id="idp" className="field h-11">
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </Field>
        </div>
      </Modal>

      <Modal
        open={!!edit}
        onClose={() => setEdit(null)}
        title="Edit role and permissions"
        description={edit?.email}
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                toast.success('Permissions updated');
                setEdit(null);
              }}
            >
              Save changes
            </button>
          </>
        }
      >
        {edit && (
          <div className="space-y-4">
            <Field label="Role" htmlFor="er">
              <select id="er" defaultValue={edit.role} className="field h-11">
                {roles.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </Field>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold text-ink">Permissions</legend>
              <div className="space-y-2">
                {permissions.map((p, i) => (
                  <label key={p} className="flex items-center gap-3 text-sm text-ink">
                    <input
                      type="checkbox"
                      defaultChecked={
                        edit.role === 'Administrator' || i < (edit.role === 'Department Head' ? 6 : 4)
                      }
                      className="h-4 w-4 accent-brand"
                    />
                    {p}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deactivate}
        onClose={() => setDeactivate(null)}
        title={`Deactivate ${deactivate?.name}?`}
        description="They will be signed out immediately and lose portal access."
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setDeactivate(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={() => {
                setRows((r) =>
                  r.map((s) => (s.id === deactivate?.id ? { ...s, status: 'Deactivated' } : s)),
                );
                toast.success('Account deactivated');
                setDeactivate(null);
              }}
            >
              Deactivate account
            </button>
          </>
        }
      >
        {deactivate && deactivate.openCases > 0 && (
          <p className="rounded-lg bg-warning-50 p-3 text-sm text-warning-ink">
            {deactivate.openCases} open cases will return to the {deactivate.department} assignment queue.
          </p>
        )}
      </Modal>
    </div>
  );
}