'use client';

import { useState, useTransition, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  StickyNote,
  Trash2,
} from 'lucide-react';

import {
  LEAD_DEAD_ENDS,
  LEAD_ROW_ACCENT,
  LEAD_STAGES,
  LEAD_STATUS_SHORT,
  LEAD_STATUS_STYLE,
  formatInr,
  telHref,
  whatsappHref,
  type LeadStatus,
} from '@/lib/admin-shared';
import VoiceAgentButton from './VoiceAgentButton';

const STATUS_OPTIONS: readonly LeadStatus[] = [...LEAD_STAGES, ...LEAD_DEAD_ENDS];

/**
 * One screen of leads.
 *
 * 800 rows in a single page meant the browser laid out 800 rows on every
 * keystroke in the search box, and the horizontal scrollbar — which lives at the
 * bottom of the scrolling element — sat 800 rows down where nobody would find
 * it. Twenty rows in a fixed-height box fixes both: the layout is cheap, and the
 * scrollbar is at the bottom of the box, on screen, next to the rows it scrolls.
 */
const PAGE_SIZE = 20;

export interface LeadRow {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  lead_score: number | null;
  rating: number | null;
  review_count: number | null;
  maps_url: string | null;
  status: LeadStatus;
  priority: 'low' | 'normal' | 'high';
  value_inr: number | null;
  next_follow_up_at: string | null;
  created_at: string;
  is_overdue: boolean;
  /** True when someone has written a note on this lead — see the dot below. */
  has_note: boolean;
}

interface Props {
  leads: LeadRow[];
}

type SortField = 'lead_score' | 'rating' | 'review_count' | 'city' | 'created_at';

const SORT_FIELDS: { field: SortField; label: string }[] = [
  { field: 'lead_score', label: 'Lead score' },
  { field: 'rating', label: 'Rating' },
  { field: 'review_count', label: 'Reviews' },
  { field: 'city', label: 'City' },
  { field: 'created_at', label: 'Date added' },
];

/**
 * Eight columns, down from nine.
 *
 * Rating and review count were separate, which is how the scrape stores them but
 * not how anyone reads them — "4.6 ★" and "128" mean little apart and read as
 * one fact together ("4.6 ★ · 128"). Merging them takes ~10rem off the table and
 * is most of what let the minimum width drop from 68rem to 58rem, so a laptop
 * now shows every column without scrolling sideways at all.
 */
const COLUMNS = [
  { label: 'Name', align: '' },
  { label: 'Contact', align: '' },
  { label: 'City', align: '' },
  { label: 'Score', align: 'text-center' },
  { label: 'Rating', align: 'text-center' },
  { label: 'Status', align: '' },
  { label: 'Value', align: 'text-right' },
  { label: 'Actions', align: 'text-right' },
] as const;

export default function LeadsTable({ leads }: Props) {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(field);
      setSortDesc(true);
    }
    setPage(1);
  }

  const sorted = [...leads].sort((a, b) => {
    const aVal: number | string | null = a[sortBy];
    const bVal: number | string | null = b[sortBy];

    // Nulls last regardless of direction.
    if (aVal === null && bVal === null) return 0;
    if (aVal === null) return 1;
    if (bVal === null) return -1;

    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDesc ? -cmp : cmp;
  });

  /**
   * Clamped on read rather than reset by an effect. The search box above this
   * table shrinks `leads` as you type, so a page number that was valid a
   * keystroke ago can point past the end — deriving the current page keeps that
   * impossible instead of leaving a blank table for one render.
   */
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        alert('Could not delete the lead. Try again.');
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setDeleting(null);
    }
  }

  async function handleStatusChange(id: string, status: LeadStatus) {
    setSaving(id);
    try {
      const response = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!response.ok) {
        alert('Could not update the status. Try again.');
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    } finally {
      setSaving(null);
    }
  }

  /**
   * Quick note straight from the list.
   *
   * The full history lives on the lead detail page, but the common case —
   * "said call back at 6" right after hanging up — should not cost a page
   * load. Notes append, so a lead accumulates as many as it needs.
   */
  async function handleAddNote(leadId: string) {
    const body = noteText.trim();
    if (!body) return;

    setSavingNote(true);
    try {
      const response = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, body }),
      });

      if (!response.ok) {
        alert('Could not save the note. Try again.');
        return;
      }

      setNoteFor(null);
      setNoteText('');
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setSavingNote(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/*
        Sort controls, one row that scrolls sideways on a phone rather than
        wrapping into four stacked lines. `-mx-4 px-4` lets the row bleed to the
        screen edges inside the padded admin shell, so the last chip is visibly
        cut off — the cue that there is more to the right.
      */}
      <div className="scrollbar-slim -mx-4 shrink-0 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex w-max items-center gap-1.5">
          <span className="shrink-0 text-[11px] font-medium leading-5 text-primary-700">
            Sort:
          </span>
          {SORT_FIELDS.map(({ field, label }) => (
            <button
              key={field}
              type="button"
              onClick={() => toggleSort(field)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 transition ${
                sortBy === field
                  ? 'border-primary-950 bg-primary-950 text-white'
                  : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300'
              }`}
            >
              {label} {sortBy === field && (sortDesc ? '↓' : '↑')}
            </button>
          ))}
        </div>
      </div>

      {/*
        One scrolling box for both axes, filling whatever is left of the screen.

        Two earlier attempts measured the space instead of asking for it —
        `max-h-[62dvh]`, then a `lg:` override with a hand-counted
        `calc(100dvh - 19rem)`. Both were wrong at most widths, because the
        chrome above the table (header, search row, chart, two chip rows) wraps
        differently at every breakpoint, so no single constant describes it. The
        symptom was a band of empty page under the pager.

        `flex-1` asks for the remainder instead of guessing at it, which is
        correct at every width — but only because every ancestor up to the
        viewport is a flex column with `min-h-0`; see the note in AdminShell.
        `min-h-0` here is what lets the box be shorter than the table inside it
        and scroll, rather than growing to fit and pushing the pager off-screen.

        The horizontal scrollbar sits at the bottom of this box — visible with
        the rows, rather than at the bottom of the document where it used to be.
        `min-w` on the table is what gives it something to scroll: without it the
        table squeezes its columns to fit and the data becomes unreadable.
      */}
      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-primary-200 bg-white">
        <table className="w-full min-w-[58rem] text-sm">
          <thead className="sticky top-0 z-10">
            <tr className="text-left">
              {COLUMNS.map(({ label, align }) => (
                <th
                  key={label}
                  className={`border-b border-primary-200 bg-primary-50 px-3 py-2.5 font-semibold text-primary-700 ${align}`}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-3 py-8 text-center text-primary-500"
                >
                  No leads match these filters.
                </td>
              </tr>
            )}

            {visible.map((lead) => {
              const tel = telHref(lead.phone);
              const whatsapp = whatsappHref(lead.phone);
              const composing = noteFor === lead.id;

              return (
                <Fragment key={lead.id}>
                <tr
                  className={`transition hover:bg-primary-50 ${
                    deleting === lead.id ? 'opacity-50' : ''
                  }`}
                >
                  {/*
                    Name, with the status colour as a left edge. The bar is on
                    this cell rather than the `<tr>` because a border set on a
                    row is not painted reliably across browsers, while a border
                    on the first cell is.
                  */}
                  <td
                    className={`border-l-4 px-3 py-2.5 ${LEAD_ROW_ACCENT[lead.status]}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-medium text-primary-900 transition hover:text-accent-500"
                      >
                        {lead.name}
                      </Link>
                      {/*
                        Someone has written on this lead — go read it before
                        calling. Automatic rows do not count; see the note on the
                        `kind = 'note'` filter in app/admin/leads/page.tsx.
                      */}
                      {lead.has_note && (
                        <span
                          title="Has a note — open the lead to read it"
                          className="inline-flex h-2 w-2 shrink-0 rounded-full bg-amber-400 ring-2 ring-amber-100"
                        >
                          <span className="sr-only">Has a note</span>
                        </span>
                      )}
                    </div>
                    {lead.company && (
                      <span className="block text-xs text-primary-500">
                        {lead.company}
                      </span>
                    )}
                  </td>

                  {/* Contact — phone buttons + email */}
                  <td className="px-3 py-2.5">
                    {(tel || whatsapp) && (
                      <div className="mb-1 flex gap-1">
                        {tel && (
                          <a
                            href={tel}
                            className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 transition hover:bg-emerald-200"
                            title="Call"
                          >
                            <Phone className="h-3 w-3" />
                            Call
                          </a>
                        )}
                        {whatsapp && (
                          <a
                            href={whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800 transition hover:bg-green-200"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="block truncate text-xs text-primary-600 transition hover:text-primary-900"
                      >
                        {lead.email}
                      </a>
                    )}
                    {!tel && !whatsapp && !lead.email && !lead.maps_url && (
                      <span className="text-xs text-primary-400">—</span>
                    )}
                  </td>

                  {/* City */}
                  <td className="max-w-[9rem] truncate px-3 py-2.5 text-primary-700">
                    {lead.city || <span className="text-primary-400">—</span>}
                  </td>

                  {/* Lead score */}
                  <td className="px-3 py-2.5 text-center">
                    {lead.lead_score !== null ? (
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                          lead.lead_score >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : lead.lead_score >= 75
                              ? 'bg-blue-100 text-blue-800'
                              : lead.lead_score >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-primary-100 text-primary-600'
                        }`}
                      >
                        {lead.lead_score}
                      </span>
                    ) : (
                      <span className="text-primary-400">—</span>
                    )}
                  </td>

                  {/* Rating, with the review count beside it rather than in a
                      column of its own — see the note on COLUMNS. */}
                  <td className="px-3 py-2.5 text-center text-primary-700">
                    {lead.rating !== null ? (
                      <span className="whitespace-nowrap">
                        <span className="font-medium">{lead.rating.toFixed(1)} ★</span>
                        {lead.review_count !== null && (
                          <span className="ml-1 text-xs text-primary-500">
                            · {lead.review_count.toLocaleString('en-IN')}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-primary-400">—</span>
                    )}
                  </td>

                  {/* Status — editable inline, so moving a lead along the
                      pipeline does not require opening it first. */}
                  <td className="px-3 py-2.5">
                    <div className="relative w-32">
                      <select
                        value={lead.status}
                        onChange={(event) =>
                          handleStatusChange(lead.id, event.target.value as LeadStatus)
                        }
                        disabled={saving === lead.id}
                        aria-label={`Status for ${lead.name}`}
                        className={`w-full cursor-pointer appearance-none rounded-full border py-1 pl-2.5 pr-6 text-xs font-semibold outline-none transition disabled:cursor-wait ${
                          LEAD_STATUS_STYLE[lead.status]
                        }`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status} className="bg-white text-primary-900">
                            {LEAD_STATUS_SHORT[status]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-70"
                      />
                    </div>
                    {lead.is_overdue && (
                      <span className="mt-1 block text-xs font-medium text-red-600">
                        Overdue
                      </span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="whitespace-nowrap px-3 py-2.5 text-right text-primary-700">
                    {lead.value_inr ? (
                      formatInr(lead.value_inr)
                    ) : (
                      <span className="text-primary-400">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {/*
                        Maps was an `ExternalLink` — the generic "opens in a new
                        tab" glyph, which says nothing about where. A pin in
                        Google's map red is recognisable without reading the
                        tooltip.
                      */}
                      {lead.maps_url && (
                        <a
                          href={lead.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          title="View on Google Maps"
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="sr-only">View on Google Maps</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setNoteFor(composing ? null : lead.id);
                          setNoteText('');
                        }}
                        aria-expanded={composing}
                        className={`rounded p-1.5 transition hover:bg-amber-50 hover:text-amber-700 ${
                          composing ? 'bg-amber-100 text-amber-800' : 'text-amber-600'
                        }`}
                        title="Add note"
                      >
                        <StickyNote className="h-4 w-4" />
                        <span className="sr-only">Add note</span>
                      </button>
                      {/*
                        The voice agent. Only for a lead with a number — the
                        route rejects the rest, so an icon there would be a tap
                        that only ever returns an error.
                      */}
                      {lead.phone && (
                        <VoiceAgentButton
                          inline
                          leadId={lead.id}
                          leadName={lead.company || lead.name}
                          leadCity={lead.city}
                          leadRating={lead.rating}
                          leadReviewCount={lead.review_count}
                        />
                      )}
                      {/*
                        `Eye`, not the `ChevronDown` that used to be here — a
                        downward chevron reads as "expand this row", and this
                        opens a different page.
                      */}
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="rounded p-1.5 text-blue-600 transition hover:bg-blue-50 hover:text-blue-800"
                        title="View lead"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View lead</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(lead.id, lead.name)}
                        disabled={deleting === lead.id}
                        className="rounded p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Note composer, directly under the lead it belongs to. */}
                {composing && (
                  <tr className="bg-primary-50/50">
                    <td colSpan={COLUMNS.length} className="px-3 py-4">
                      <div className="max-w-2xl">
                        <label
                          htmlFor={`note-${lead.id}`}
                          className="mb-1 block text-xs font-semibold text-primary-700"
                        >
                          Note for {lead.name}
                        </label>
                        <textarea
                          id={`note-${lead.id}`}
                          value={noteText}
                          onChange={(event) => setNoteText(event.target.value)}
                          placeholder="Call back at 6pm — asked for pricing first."
                          rows={3}
                          autoFocus
                          className="w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-primary-900 outline-none transition placeholder:text-primary-400 focus:border-primary-950"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddNote(lead.id)}
                            disabled={savingNote || !noteText.trim()}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {savingNote ? 'Saving…' : 'Save note'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setNoteFor(null);
                              setNoteText('');
                            }}
                            className="text-xs text-primary-500 transition hover:text-primary-900"
                          >
                            Cancel
                          </button>
                          <span className="text-xs text-primary-400">
                            Saved to this lead&rsquo;s history, and marked with a
                            yellow dot.
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/*
        Pager and the row count on one line. Both were on their own line with a
        gap between, which cost ~40px of vertical space to say very little; the
        "Refreshing…" note joins them here for the same reason.
      */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <p className="text-xs text-primary-600">
          {sorted.length === 0
            ? 'No leads'
            : `Showing ${start + 1}–${Math.min(start + PAGE_SIZE, sorted.length)} of ${sorted.length}`}
          {isPending && (
            <span aria-live="polite" className="ml-2 text-primary-400">
              Refreshing…
            </span>
          )}
        </p>

        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 1}
              className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-2 py-1 text-xs font-medium text-primary-700 transition hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft aria-hidden className="h-3.5 w-3.5" />
              Prev
            </button>
            <span className="px-1.5 text-xs font-medium text-primary-700">
              {current} / {pageCount}
            </span>
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current === pageCount}
              className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-2 py-1 text-xs font-medium text-primary-700 transition hover:border-primary-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
