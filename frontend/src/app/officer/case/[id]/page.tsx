import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AlarmClockIcon, ArrowLeftIcon, EyeIcon, LockIcon, MapPinIcon, PaperclipIcon, PhoneIcon, SendIcon, UserIcon } from 'lucide-react';
import { requests } from '../data/requests';
import { categories, departments } from '../data/categories';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { Modal } from '../components/Modal';
import { NotFound } from './NotFound';
import { daysUntil, formatDateTime } from '../utils/format';
import type { RequestStatus, TimelineEvent, TimelineKind } from '../types/request';

type Action = 'update' | 'internal' | 'clarify' | 'work';
const actions: {id: Action;label: string;kind: TimelineKind;title: string;visible: boolean;placeholder: string;}[] = [
{ id: 'update', label: 'Public update', kind: 'update', title: 'Official update', visible: true, placeholder: 'Write an update the citizen will see…' },
{ id: 'internal', label: 'Internal note', kind: 'internal', title: 'Internal note', visible: false, placeholder: 'Notes for county staff only…' },
{ id: 'clarify', label: 'Request clarification', kind: 'update', title: 'Clarification requested', visible: true, placeholder: 'What do you need the citizen to clarify?' },
{ id: 'work', label: 'Record work', kind: 'work', title: 'Work recorded', visible: false, placeholder: 'Describe the work performed, crew and materials…' }];


export function OfficerCase() {
  const { ref } = useParams();
  const r = requests.find((x) => x.ref === ref);
  const [events, setEvents] = useState<TimelineEvent[]>(r?.timeline.length ? r.timeline : r ? [{ id: 's', date: r.submitted, title: 'Request submitted', body: 'Submitted via the citizen portal.', author: 'Portal', kind: 'submitted' }] : []);
  const [action, setAction] = useState<Action>('update');
  const [text, setText] = useState('');
  const [status, setStatus] = useState<RequestStatus>(r?.status ?? 'Pending');
  const [newStatus, setNewStatus] = useState<RequestStatus>(r?.status ?? 'Pending');
  const [summary, setSummary] = useState('');
  const [summaryError, setSummaryError] = useState('');
  const [confirm, setConfirm] = useState(false);
  const [reassign, setReassign] = useState('');

  if (!r) return <NotFound embedded />;
  const cat = categories.find((c) => c.id === r.category)!;
  const a = actions.find((x) => x.id === action)!;
  const d = r.slaDue ? daysUntil(r.slaDue) : null;

  const post = () => {
    if (text.trim().length < 5) return toast.error('Write a message before posting.');
    setEvents((e) => [...e, { id: `n${e.length}`, date: '2026-10-17T10:30:00', title: a.title, body: text, author: a.visible ? r.department ?? 'County' : 'J. Kariuki', kind: a.kind }]);
    setText('');
    toast.success(a.visible ? 'Update published to citizen' : 'Saved — staff only');
  };

  const applyStatus = () => {
    if (newStatus === 'Resolved' && summary.trim().length < 20) {
      setSummaryError('A resolution summary of at least 20 characters is required before resolving.');
      return;
    }
    setConfirm(true);
  };

  const confirmStatus = () => {
    setStatus(newStatus);
    setEvents((e) => [...e, { id: `st${e.length}`, date: '2026-10-17T10:30:00', title: `Status changed to ${newStatus}`, body: newStatus === 'Resolved' ? summary : `Status updated by the assigned officer.`, author: r.department ?? 'County', kind: 'status' }]);
    setConfirm(false);
    setSummary('');
    toast.success(`Case marked ${newStatus}`);
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Link to="/officer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"><ArrowLeftIcon className="h-4 w-4" /> Back to workspace</Link>
      <header className="mt-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-semibold text-muted">{r.ref}</span>
            <StatusBadge status={status} size="md" />
            <PriorityBadge priority={r.priority} />
          </div>
          <h1 className="mt-2 max-w-3xl text-2xl font-extrabold tracking-tight text-ink">{r.title}</h1>
        </div>
        {d !== null && status !== 'Resolved' &&
        <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${d < 0 ? 'bg-danger-50 text-danger' : d <= 1 ? 'bg-warning-50 text-warning-ink' : 'bg-canvas text-ink'}`}>
            <AlarmClockIcon className="h-4 w-4" aria-hidden="true" />
            {d < 0 ? `Service deadline passed ${Math.abs(d)} day(s) ago` : d === 0 ? 'Service deadline is today' : `Service deadline in ${d} day(s)`}
          </div>
        }
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="card p-5 md:p-6">
            <h2 className="font-bold text-ink">Submitted information</h2>
            <p className="mt-2 leading-relaxed text-[#3A433D]">{r.description}</p>
            <dl className="mt-5 grid gap-4 border-t border-line pt-5 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-muted">Category</dt><dd className="font-medium text-ink">{cat.name} · {r.subcategory}</dd></div>
              <div><dt className="text-xs text-muted">Submitted</dt><dd className="font-medium text-ink">{formatDateTime(r.submitted)}</dd></div>
              <div className="flex gap-2"><MapPinIcon className="mt-4 h-4 w-4 text-muted" aria-hidden="true" /><div><dt className="text-xs text-muted">Location</dt><dd className="font-medium text-ink">{r.landmark}<br />{r.ward}, {r.subCounty}{r.coordinates && <span className="block font-mono text-xs text-muted">{r.coordinates}</span>}</dd></div></div>
              <div className="flex gap-2"><UserIcon className="mt-4 h-4 w-4 text-muted" aria-hidden="true" /><div><dt className="text-xs text-muted">Reported by <span className="text-gold-ink">(staff-only)</span></dt><dd className="font-medium text-ink">{r.citizen}<span className="mt-0.5 flex items-center gap-1 text-xs text-muted"><PhoneIcon className="h-3 w-3" /> 07•• ••• 678 · reveal logged</span></dd></div></div>
            </dl>
            {r.evidence.length > 0 &&
            <div className="mt-5 border-t border-line pt-5">
                <h3 className="flex items-center gap-1.5 text-sm font-bold text-ink"><PaperclipIcon className="h-4 w-4" /> Attachments ({r.evidence.length})</h3>
                <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {r.evidence.map((src, i) => <img key={src} src={src} alt={`Attachment ${i + 1}`} className="aspect-[4/3] w-full rounded-xl object-cover ring-1 ring-line" />)}
                </div>
              </div>
            }
          </section>

          <section className="card p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-ink">Activity history</h2>
              <div className="flex gap-3 text-xs font-medium text-muted">
                <span className="flex items-center gap-1"><EyeIcon className="h-3.5 w-3.5 text-brand" /> Visible to citizen</span>
                <span className="flex items-center gap-1"><LockIcon className="h-3.5 w-3.5 text-gold-ink" /> Staff only</span>
              </div>
            </div>
            <div className="mt-6"><ActivityTimeline events={events} showInternal /></div>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <section className="card overflow-hidden">
            <div className="grid grid-cols-2 border-b border-line" role="tablist">
              {actions.map((x) =>
              <button key={x.id} role="tab" aria-selected={action === x.id} onClick={() => setAction(x.id)} className={`border-b-2 px-3 py-3 text-xs font-semibold transition-colors duration-150 ${action === x.id ? 'border-brand bg-white text-brand' : 'border-transparent bg-canvas/60 text-muted hover:text-ink'}`}>
                  {x.label}
                </button>
              )}
            </div>
            <div className="p-4">
              <div className={`mb-3 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${a.visible ? 'bg-brand-50 text-brand' : 'bg-gold-50 text-gold-ink'}`}>
                {a.visible ? <EyeIcon className="h-3.5 w-3.5" /> : <LockIcon className="h-3.5 w-3.5" />}
                {a.visible ? 'The citizen will see this message' : 'Only county staff will see this'}
              </div>
              <label htmlFor="action-text" className="sr-only">{a.label}</label>
              <textarea id="action-text" rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder={a.placeholder} className="field" />
              <button onClick={post} className="btn-primary mt-3 w-full"><SendIcon className="h-4 w-4" /> {a.visible ? 'Publish' : 'Save'}</button>
            </div>
          </section>

          <section className="card p-4">
            <h2 className="font-bold text-ink">Update status</h2>
            <label htmlFor="status" className="mt-3 block text-sm font-semibold text-ink">New status</label>
            <select id="status" value={newStatus} onChange={(e) => {setNewStatus(e.target.value as RequestStatus);setSummaryError('');}} className="field mt-1.5 h-10">
              {['Pending', 'In Progress', 'Resolved', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
            </select>
            {newStatus === 'Resolved' &&
            <div className="mt-3">
                <label htmlFor="summary" className="text-sm font-semibold text-ink">Resolution summary <span className="text-danger">*</span></label>
                <textarea id="summary" rows={3} value={summary} onChange={(e) => {setSummary(e.target.value);setSummaryError('');}} className={`field mt-1.5 ${summaryError ? 'field-error' : ''}`} placeholder="What was done to resolve this? The citizen will see this." aria-invalid={!!summaryError} />
                {summaryError && <p role="alert" className="mt-1 text-xs font-medium text-danger">{summaryError}</p>}
                <button type="button" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand"><PaperclipIcon className="h-3.5 w-3.5" /> Attach completion photo</button>
              </div>
            }
            <button onClick={applyStatus} disabled={newStatus === status} className="btn-secondary mt-3 w-full">Apply status</button>
          </section>

          <section className="card p-4">
            <h2 className="font-bold text-ink">Recommend reassignment</h2>
            <p className="mt-0.5 text-xs text-muted">A department head must approve the move.</p>
            <select aria-label="Department" value={reassign} onChange={(e) => setReassign(e.target.value)} className="field mt-3 h-10">
              <option value="">Choose department…</option>
              {departments.filter((x) => x !== r.department).map((x) => <option key={x}>{x}</option>)}
            </select>
            <button disabled={!reassign} onClick={() => {toast.success(`Reassignment to ${reassign} sent for approval`);setReassign('');}} className="btn-secondary mt-2 w-full">Send recommendation</button>
          </section>
        </aside>
      </div>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title={`Mark as ${newStatus}?`}
        description={newStatus === 'Resolved' ? 'The citizen will be notified and can rate the resolution.' : 'The citizen will be notified of this status change.'}
        footer={<><button className="btn-secondary" onClick={() => setConfirm(false)}>Cancel</button><button className="btn-primary" onClick={confirmStatus}>Confirm</button></>}>
        
        {newStatus === 'Resolved' && <p className="rounded-lg bg-canvas p-3 text-sm text-[#3A433D]">{summary}</p>}
      </Modal>
    </div>);

}