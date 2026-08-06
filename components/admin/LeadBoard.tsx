'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertCircle, GripVertical } from 'lucide-react';

import {
  LEAD_DEAD_ENDS,
  LEAD_STAGES,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_SHORT,
  LEAD_STATUS_HINT,
  formatInr,
  relativeTime,
  type LeadStatus,
} from '@/lib/admin-shared';

export interface LeadCardData {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  priority: 'low' | 'normal' | 'high';
  value_inr: number | null;
  next_follow_up_at: string | null;
  created_at: string;
  /** Decided on the server against one clock reading — see `app/admin/leads/page.tsx`. */
  is_overdue: boolean;
}

interface Props {
  leads: LeadCardData[];
}

const PRIORITY_ORDER: Record<string, number> = { high: 0, normal: 1, low: 2 };

const ALL_STATUSES: readonly LeadStatus[] = [...LEAD_STAGES, ...LEAD_DEAD_ENDS];

/**
 * The pipeline board.
 *
 * Two things made this hard to operate. Every card carried a coloured pill
 * repeating the stage hint — identical for all cards in a column, so it was the
 * same sentence printed eight times down the screen while the genuinely
 * per-lead facts (overdue follow-up, deal value) were the smallest text on the
 * card. And dragging was the only way to move a lead, which does not work on a
 * touch screen at all.
 *
 * So: the hint now appears once in the column header where it belongs, and
 * every card has a stage dropdown. Drag still works if you prefer it.
 */
export default function LeadBoard({ leads }: Props) {
  const router = useRouter();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const byStage = LEAD_STAGES.reduce<Record<string, LeadCardData[]>>((acc, stage) => {
    acc[stage] = leads
      .filter((lead) => lead.status === stage)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return acc;
  }, {});

  const rejected = leads.filter((lead) =>
    (LEAD_DEAD_ENDS as readonly string[]).includes(lead.status)
  );

  function move(leadId: string, status: string) {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.status === status) return;

    setError(null);
    setMovingId(leadId);

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/leads', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: leadId, status }),
        });
        if (response.ok) {
          router.refresh();
        } else {
          const result = await response.json().catch(() => ({}));
          setError(result.error ?? 'Could not move the lead.');
        }
      } catch {
        setError('Network error. The lead was not moved.');
      } finally {
        setMovingId(null);
      }
    });
  }

  function handleDrop(status: string) {
    setOverStage(null);
    if (draggingId) move(draggingId, status);
    setDraggingId(null);
  }

  return (
    <div className="space-y-3">
      {error && (
        <p
          aria-live="polite"
          className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage) => {
          const stageLeads = byStage[stage] ?? [];
          const isOver = overStage === stage;
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.value_inr ?? 0), 0);

          return (
            <section
              key={stage}
              onDragOver={(event) => {
                event.preventDefault();
                setOverStage(stage);
              }}
              onDragLeave={() => setOverStage((prev) => (prev === stage ? null : prev))}
              onDrop={() => handleDrop(stage)}
              className={`flex w-[17rem] shrink-0 flex-col rounded-xl border transition ${
                isOver
                  ? 'border-accent-500 bg-accent-500/5 ring-2 ring-accent-500/20'
                  : 'border-primary-200 bg-primary-50/40'
              }`}
            >
              <header className="border-b border-primary-200/70 px-3.5 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-semibold text-primary-900">
                    {LEAD_STATUS_SHORT[stage]}
                  </h2>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-primary-600 ring-1 ring-primary-200">
                    {stageLeads.length}
                  </span>
                </div>
                {/* The hint, once per column instead of once per card. */}
                <p className="mt-0.5 text-[11px] leading-snug text-primary-500">
                  {LEAD_STATUS_HINT[stage]}
                </p>
                {stageValue > 0 && (
                  <p className="mt-1 text-[11px] font-medium text-primary-600">
                    {formatInr(stageValue)}
                  </p>
                )}
              </header>

              <div className="flex flex-col gap-2 p-2.5">
                {stageLeads.length === 0 && (
                  <p className="rounded-lg border border-dashed border-primary-200 px-3 py-5 text-center text-xs text-primary-400">
                    Nothing here
                  </p>
                )}

                {stageLeads.map((lead) => (
                    <article
                      key={lead.id}
                      draggable
                      onDragStart={() => setDraggingId(lead.id)}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setOverStage(null);
                      }}
                      className={`rounded-lg border border-primary-200 bg-white shadow-sm transition hover:border-primary-300 ${
                        draggingId === lead.id ? 'opacity-40' : ''
                      } ${movingId === lead.id ? 'animate-pulse' : ''}`}
                    >
                      <Link href={`/admin/leads/${lead.id}`} className="block px-3 pt-2.5 pb-2">
                        <div className="flex items-start gap-1.5">
                          <GripVertical
                            aria-hidden
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-grab text-primary-300"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="truncate text-sm font-medium leading-snug text-primary-900">
                                {lead.name}
                              </h3>
                              {lead.priority === 'high' && (
                                <span className="shrink-0 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-600">
                                  Hot
                                </span>
                              )}
                            </div>

                            {lead.company && (
                              <p className="truncate text-xs text-primary-500">
                                {lead.company}
                              </p>
                            )}
                            <p className="mt-1 truncate text-xs text-primary-500">
                              {lead.phone ?? lead.email ?? 'No contact method'}
                            </p>

                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
                              {lead.value_inr ? (
                                <span className="font-medium text-primary-700">
                                  {formatInr(lead.value_inr)}
                                </span>
                              ) : null}

                              {lead.is_overdue ? (
                                <span className="inline-flex items-center gap-1 font-medium text-red-600">
                                  <AlertCircle aria-hidden className="h-3 w-3" />
                                  Due {relativeTime(lead.next_follow_up_at)}
                                </span>
                              ) : lead.next_follow_up_at ? (
                                <span className="text-primary-400">
                                  Follow up {relativeTime(lead.next_follow_up_at)}
                                </span>
                              ) : (
                                <span className="text-primary-400">
                                  Added {relativeTime(lead.created_at)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Works on touch, where dragging does not. */}
                      <div className="border-t border-primary-100 px-2 py-1.5">
                        <label className="sr-only" htmlFor={`move-${lead.id}`}>
                          Move {lead.name} to another stage
                        </label>
                        <select
                          id={`move-${lead.id}`}
                          value={lead.status}
                          disabled={movingId === lead.id}
                          onChange={(event) => move(lead.id, event.target.value)}
                          className="w-full cursor-pointer rounded border-0 bg-transparent px-1 py-0.5 text-[11px] text-primary-600 outline-none transition hover:bg-primary-50 focus:bg-primary-50 disabled:opacity-50"
                        >
                          {ALL_STATUSES.map((option) => (
                            <option key={option} value={option}>
                              {option === lead.status
                                ? `Stage: ${LEAD_STATUS_SHORT[option]}`
                                : `→ ${LEAD_STATUS_SHORT[option]}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    </article>
                ))}
              </div>
            </section>
          );
        })}

        {/* Dead ends. Kept last, dimmed, and droppable so a lost lead has somewhere to go. */}
        <section
          onDragOver={(event) => {
            event.preventDefault();
            setOverStage('lost');
          }}
          onDragLeave={() => setOverStage((prev) => (prev === 'lost' ? null : prev))}
          onDrop={() => handleDrop('lost')}
          className={`flex w-[17rem] shrink-0 flex-col rounded-xl border transition ${
            overStage === 'lost'
              ? 'border-red-400 bg-red-50 ring-2 ring-red-500/20'
              : 'border-primary-200 bg-primary-50/40'
          }`}
        >
          <header className="border-b border-primary-200/70 px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-primary-500">Lost / rejected</h2>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-primary-600 ring-1 ring-primary-200">
                {rejected.length}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] leading-snug text-primary-500">
              Drop here if they went elsewhere
            </p>
          </header>

          <div className="flex flex-col gap-2 p-2.5">
            {rejected.length === 0 && (
              <p className="rounded-lg border border-dashed border-primary-200 px-3 py-5 text-center text-xs text-primary-400">
                Nothing lost or rejected
              </p>
            )}
            {rejected.map((lead) => (
              <article
                key={lead.id}
                className="rounded-lg border border-primary-200 bg-white opacity-70 transition hover:opacity-100"
              >
                <Link href={`/admin/leads/${lead.id}`} className="block px-3 pt-2.5 pb-2">
                  <h3 className="truncate text-sm font-medium text-primary-900">{lead.name}</h3>
                  {lead.company && (
                    <p className="truncate text-xs text-primary-500">{lead.company}</p>
                  )}
                  <p className="mt-1 text-[11px] text-primary-400">
                    {LEAD_STATUS_LABEL[lead.status]}
                  </p>
                </Link>
                <div className="border-t border-primary-100 px-2 py-1.5">
                  <label className="sr-only" htmlFor={`move-${lead.id}`}>
                    Move {lead.name} back into the pipeline
                  </label>
                  <select
                    id={`move-${lead.id}`}
                    value={lead.status}
                    disabled={movingId === lead.id}
                    onChange={(event) => move(lead.id, event.target.value)}
                    className="w-full cursor-pointer rounded border-0 bg-transparent px-1 py-0.5 text-[11px] text-primary-600 outline-none transition hover:bg-primary-50 focus:bg-primary-50 disabled:opacity-50"
                  >
                    {ALL_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option === lead.status
                          ? `Stage: ${LEAD_STATUS_SHORT[option]}`
                          : `→ ${LEAD_STATUS_SHORT[option]}`}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
