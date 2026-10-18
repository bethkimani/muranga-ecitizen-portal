'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LaptopIcon, LogOutIcon, ShieldCheckIcon, SmartphoneIcon } from 'lucide-react';
import { PageHeader, Field } from '@/components/ui';
import { Modal } from '@/components/Modal';

type Tab = 'personal' | 'preferences' | 'security';

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="text-sm text-muted">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${
          checked ? 'bg-brand' : 'bg-[#C9D1CB]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-150 ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export default function ProfilePage({ initialTab = 'personal' }: { initialTab?: Tab }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [prefs, setPrefs] = useState({ app: true, sms: true, email: false, announcements: true });
  const [lang, setLang] = useState('en');
  const [signOutAll, setSignOutAll] = useState(false);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'personal', label: 'Personal details' },
    { id: 'preferences', label: 'Communication' },
    { id: 'security', label: 'Password & security' },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={tab === 'preferences' ? 'Settings' : 'My profile'}
        description="Manage your details, how we contact you and your account security."
      />
      <div className="mb-6 flex gap-6 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors duration-150 ${
              tab === t.id ? 'border-brand text-brand' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'personal' && (
        <form
          className="card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success('Profile updated');
          }}
        >
          <div className="flex items-center gap-4 border-b border-line pb-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand">
              BK
            </span>
            <div>
              <p className="font-bold text-ink">Beth Kimani</p>
              <p className="flex items-center gap-1 text-sm text-success">
                <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" /> Phone verified
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" htmlFor="pn">
              <input id="pn" defaultValue="Beth Kimani" className="field h-11" />
            </Field>
            <Field label="Email address" htmlFor="pe">
              <input id="pe" type="email" defaultValue="beth.k@example.com" className="field h-11" />
            </Field>
            <Field label="Phone number" htmlFor="pp" hint="Changing your number requires re-verification.">
              <input id="pp" defaultValue="0712 ••• 678" className="field h-11" />
            </Field>
            <Field label="Home ward" htmlFor="pw" optional hint="Used to show relevant announcements.">
              <input id="pw" defaultValue="Township, Murang'a" className="field h-11" />
            </Field>
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-line pt-5">
            <button type="reset" className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save changes
            </button>
          </div>
        </form>
      )}

      {tab === 'preferences' && (
        <div className="space-y-6">
          <section className="card px-6 py-2">
            <h2 className="pt-4 font-bold text-ink">How we contact you</h2>
            <div className="divide-y divide-line">
              <Toggle
                checked={prefs.app}
                onChange={(v) => setPrefs({ ...prefs, app: v })}
                label="In-app notifications"
                desc="Updates in your portal notification centre."
              />
              <Toggle
                checked={prefs.sms}
                onChange={(v) => setPrefs({ ...prefs, sms: v })}
                label="SMS updates"
                desc="Available once the county enables SMS delivery."
              />
              <Toggle
                checked={prefs.email}
                onChange={(v) => setPrefs({ ...prefs, email: v })}
                label="Email updates"
                desc="Available once the county enables email delivery."
              />
              <Toggle
                checked={prefs.announcements}
                onChange={(v) => setPrefs({ ...prefs, announcements: v })}
                label="County announcements"
                desc="Planned interruptions and service news in your ward."
              />
            </div>
          </section>
          <section className="card p-6">
            <h2 className="font-bold text-ink">Language</h2>
            <div className="mt-3 grid max-w-sm grid-cols-2 gap-2">
              {[
                { v: 'en', l: 'English' },
                { v: 'sw', l: 'Kiswahili' },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setLang(o.v)}
                  aria-pressed={lang === o.v}
                  className={`rounded-lg border py-2.5 text-sm font-semibold transition-colors duration-150 ${
                    lang === o.v
                      ? 'border-brand bg-brand-50 text-brand'
                      : 'border-line text-ink'
                  }`}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-6">
          <form
            className="card p-6"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('Password changed');
            }}
          >
            <h2 className="font-bold text-ink">Change password</h2>
            <div className="mt-4 grid gap-5 sm:max-w-md">
              <Field label="Current password" htmlFor="cpw">
                <input id="cpw" type="password" className="field h-11" autoComplete="current-password" />
              </Field>
              <Field label="New password" htmlFor="npw" hint="At least 8 characters, with upper and lower case and a number.">
                <input id="npw" type="password" className="field h-11" autoComplete="new-password" />
              </Field>
              <Field label="Confirm new password" htmlFor="rpw">
                <input id="rpw" type="password" className="field h-11" autoComplete="new-password" />
              </Field>
            </div>
            <button type="submit" className="btn-primary mt-6">
              Update password
            </button>
          </form>
          <section className="card p-6">
            <h2 className="font-bold text-ink">Signed-in devices</h2>
            <ul className="mt-4 divide-y divide-line text-sm">
              <li className="flex items-center gap-3 py-3">
                <SmartphoneIcon className="h-5 w-5 text-muted" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-ink">Android phone · Chrome</p>
                  <p className="text-muted">Murang’a · Active now</p>
                </div>
                <span className="text-xs font-semibold text-success">This device</span>
              </li>
              <li className="flex items-center gap-3 py-3">
                <LaptopIcon className="h-5 w-5 text-muted" aria-hidden="true" />
                <div className="flex-1">
                  <p className="font-semibold text-ink">Windows laptop · Edge</p>
                  <p className="text-muted">Thika · 3 days ago</p>
                </div>
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
              <button type="button" onClick={() => setSignOutAll(true)} className="btn-secondary">
                Sign out of all devices
              </button>
              <button
                type="button"
                onClick={() => router.push('/signin')}
                className="btn-ghost text-danger hover:bg-danger-50 flex items-center gap-2"
              >
                <LogOutIcon className="h-4 w-4" /> Sign out
              </button>
            </div>
          </section>
        </div>
      )}

      <Modal
        open={signOutAll}
        onClose={() => setSignOutAll(false)}
        title="Sign out of all devices?"
        description="You’ll need to sign in again on every device, including this one."
        footer={
          <>
            <button type="button" className="btn-secondary" onClick={() => setSignOutAll(false)}>
              Cancel
            </button>
            <button type="button" className="btn-danger" onClick={() => router.push('/signin')}>
              Sign out everywhere
            </button>
          </>
        }
      />
    </div>
  );
}