'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeftIcon,
  Building2Icon,
  CalendarIcon,
  ClockIcon,
  InfoIcon,
  MapPinIcon,
  SendIcon,
  StarIcon,
  UserIcon,
} from 'lucide-react';
import { requests } from '@/data/requests';
import { categories } from '@/data/categories';
import { StatusBadge } from '@/components/StatusBadge';
import { StatusStepper } from '@/components/StatusStepper';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { formatDateTime } from '@/utils/format';
import type { TimelineEvent } from '@/types/request';

export default function RequestDetailPage() {
  const params = useParams();
  const ref = params?.ref as string;
  const r = requests.find((x) => x.ref === ref);

  const [extra, setExtra] = useState<TimelineEvent[]>([]);
  const [msg, setMsg] = useState('');
  const [msgError, setMsgError] = useState('');
  const [rating, setRating] = useState(0);
  const [rated, setRated] = useState(false);

  if (!r) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <h1 className="text-2xl font-bold text-ink">Request Not Found</h1>
        <p className="mt-2 text-muted">
          No request found with reference <span className="font-mono font-semibold">{ref}</span>.
        </p>
        <Link href="/portal/requests" className="btn-primary mt-6 inline-flex">
          Back to My Requests
        </Link>
      </div>
    );
  }

  const cat = categories.find((c) => c.id === r.category)!;

  const base: TimelineEvent[] = r.timeline.length
    ? r.timeline
    : [
        {
          id: 'b1',
          date: r.submitted,
          title: 'Request submitted',
          body: `Your request was received and given reference ${r.ref}.`,
          author: 'Portal',
          kind: 'submitted',
        },
        ...(r.department
          ? [
              {
                id: 'b2',
                date: r.updated,
                title:
                  r.status === 'Resolved'
                    ? 'Request resolved'
                    : r.status === 'Rejected'
                    ? 'Request closed'
                    : `Assigned to ${r.department}`,
                body:
                  r.statusNote ??
                  (r.status === 'Resolved'
                    ? 'The department has completed the work and closed this request.'
                    : 'The department is reviewing your request.'),
                author: r.department,
                kind: 'status' as const,
              },
            ]
          : []),
      ];

  const events = [...base, ...extra];
  const upcoming =
    r.status === 'Pending'
      ? ['Assigned to department', 'Work in progress', 'Resolved']
      : r.status === 'In Progress'
      ? ['Resolved']
      : [];

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (msg.trim().length < 5) {
      return setMsgError('Write a short message before sending.');
    }
    setExtra((x) => [
      ...x,
      {
        id: `c${x.length}`,
        date: '2026-10-17T10:30:00',
        title: 'Citizen follow-up',
        body: msg,
        author: 'You',
        kind: 'citizen',
      },
    ]);
    setMsg('');
    setMsgError('');
    toast.success('Message sent to the department');
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/portal/requests"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeftIcon className="h-4 w-4" /> My requests
      </Link>

      <header className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm font-semibold text-muted">{r.ref}</span>
            <StatusBadge status={r.status} size="md" />
          </div>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-ink md:text-[28px]">
            {r.title}
          </h1>
        </div>
      </header>

      <div className="card mt-6 p-5 md:px-8 md:py-6">
        <StatusStepper status={r.status} />
        {r.status === 'Rejected' && r.statusNote && (
          <div className="mt-5 flex gap-3 rounded-xl bg-canvas p-4 text-sm text-[#3A433D]">
            <InfoIcon className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Why this request was closed</p>
              <p className="mt-0.5">{r.statusNote}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-5 md:p-6">
            <h2 className="font-bold text-ink">Description</h2>
            <p className="mt-2 leading-relaxed text-[#3A433D]">{r.description}</p>
            {r.evidence.length > 0 && (
              <>
                <h3 className="mt-6 text-sm font-bold text-ink">Uploaded evidence</h3>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {r.evidence.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt={`Evidence photo ${i + 1} for ${r.title}`}
                      className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-line"
                    />
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="card p-5 md:p-6" aria-labelledby="activity">
            <h2 id="activity" className="font-bold text-ink">
              Activity and official updates
            </h2>
            <p className="mt-0.5 text-sm text-muted">Updates published by the county appear here.</p>
            <div className="mt-6">
              <ActivityTimeline events={events} upcoming={upcoming} />
            </div>

            {r.status !== 'Resolved' && r.status !== 'Rejected' && (
              <form onSubmit={send} className="mt-2 border-t border-line pt-5">
                <label htmlFor="followup" className="text-sm font-semibold text-ink">
                  Send a follow-up or clarification
                </label>
                <textarea
                  id="followup"
                  rows={3}
                  value={msg}
                  onChange={(e) => {
                    setMsg(e.target.value);
                    setMsgError('');
                  }}
                  className={`field mt-1.5 ${msgError ? 'field-error' : ''}`}
                  placeholder="Add information that could help the department…"
                  aria-invalid={!!msgError}
                />
                {msgError && (
                  <p role="alert" className="mt-1 text-xs font-medium text-danger">
                    {msgError}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-xs text-muted">Only you and the assigned department can see this.</p>
                  <button type="submit" className="btn-primary">
                    <SendIcon className="h-4 w-4" /> Send
                  </button>
                </div>
              </form>
            )}
          </section>

          {r.status === 'Resolved' && (
            <section className="card p-5 md:p-6" aria-labelledby="feedback">
              <h2 id="feedback" className="font-bold text-ink">
                How satisfied are you with the resolution?
              </h2>
              {rated ? (
                <p role="status" className="mt-3 text-sm font-medium text-success">
                  Thank you — your feedback helps the county improve services.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Satisfaction rating">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n} star${n > 1 ? 's' : ''}`}
                        onClick={() => setRating(n)}
                        className="rounded-md p-1"
                      >
                        <StarIcon
                          className={`h-8 w-8 transition-colors duration-150 ${
                            n <= rating ? 'fill-gold text-gold' : 'text-line'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    className="field mt-3"
                    placeholder="Tell us more (optional)"
                    aria-label="Additional feedback"
                  />
                  <button
                    type="button"
                    disabled={!rating}
                    onClick={() => {
                      setRated(true);
                      toast.success('Feedback submitted');
                    }}
                    className="btn-primary mt-3"
                  >
                    Submit feedback
                  </button>
                </>
              )}
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card p-5">
            <h2 className="font-bold text-ink">Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {[
                {
                  icon: cat.icon,
                  k: 'Category',
                  v: `${cat.name}${r.subcategory ? ` · ${r.subcategory}` : ''}`,
                },
                {
                  icon: MapPinIcon,
                  k: 'Location',
                  v: `${r.landmark}\n${r.ward} Ward, ${r.subCounty} Sub-county${
                    r.coordinates ? `\n${r.coordinates}` : ''
                  }`,
                },
                {
                  icon: Building2Icon,
                  k: 'Assigned department',
                  v: r.department ?? 'Awaiting assignment',
                },
                {
                  icon: UserIcon,
                  k: 'Assigned officer',
                  v: r.officer ? `Officer ${r.officer}` : 'Not yet assigned',
                },
                { icon: CalendarIcon, k: 'Submitted', v: formatDateTime(r.submitted) },
                { icon: ClockIcon, k: 'Last updated', v: formatDateTime(r.updated) },
              ].map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.k} className="flex gap-3">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                    <div>
                      <dt className="text-xs font-medium text-muted">{d.k}</dt>
                      <dd className="mt-0.5 whitespace-pre-line font-medium text-ink">{d.v}</dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </section>
          <section className="rounded-2xl border border-line bg-white p-5 text-sm">
            <h2 className="font-bold text-ink">What happens next?</h2>
            <p className="mt-2 leading-relaxed text-muted">
              {r.status === 'Pending' &&
                `The ${cat.department} team reviews new requests and aims to respond within ${cat.responseTarget}.`}
              {r.status === 'In Progress' &&
                'The department is working on this. You’ll be notified when it publishes an update or marks the request resolved.'}
              {r.status === 'Resolved' &&
                'The county has marked this request resolved. If the issue returns, submit a new request and mention this reference.'}
              {r.status === 'Rejected' &&
                'This request is closed. You can submit a new request if your circumstances change.'}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}