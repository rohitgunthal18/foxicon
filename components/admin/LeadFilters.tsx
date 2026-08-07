'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { LayoutGrid, List, Search, X } from 'lucide-react';

import {
  LEAD_DEAD_ENDS,
  LEAD_STAGES,
  LEAD_STATUS_DOT,
  LEAD_STATUS_SHORT,
  type LeadStatus,
} from '@/lib/admin-shared';
import { phoneMatches } from '@/lib/phone';
import type { LeadCardData } from './LeadBoard';
import LeadBoard from './LeadBoard';
import LeadsChart from './LeadsChart';
import LeadsTable, { type LeadRow } from './LeadsTable';

interface Props {
  leads: (LeadCardData & LeadRow)[];
  view: 'board' | 'list';
}

/** Derived, not hand-listed — a new stage shows up here automatically. */
const STATUS_OPTIONS: readonly LeadStatus[] = [...LEAD_STAGES, ...LEAD_DEAD_ENDS];

export default function LeadFilters({ leads, view }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeStatus = searchParams.get('status') ?? '';

  const [query, setQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  function setStatus(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set('status', status);
    else params.delete('status');
    startTransition(() => router.replace(`/admin/leads?${params.toString()}`));
  }

  function setView(next: 'board' | 'list') {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', next);
    startTransition(() => router.replace(`/admin/leads?${params.toString()}`));
  }

  /**
   * Search applies to both views. The status filter applies to the list only —
   * on the board every stage is already its own column, so filtering by status
   * there would just blank out the other seven.
   */
  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter(
      (lead) =>
        [lead.name, lead.company, lead.email, lead.city]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(needle)) ||
        /* Phone gets its own comparison: the stored value carries the
           scraper's trunk zero and spacing, so a substring test never
           matched the digits an admin actually types. */
        phoneMatches(lead.phone, needle)
    );
  }, [leads, query]);

  const listed =
    activeStatus && activeStatus !== 'all'
      ? searched.filter((lead) => lead.status === activeStatus)
      : searched;

  return (
    /*
      A flex column rather than `space-y-*`: the controls take the height they
      need and the table (`flex-1` in list view) takes whatever is left, so the
      list ends at the bottom of the screen instead of at some fixed fraction of
      it. See the note in AdminShell for why the page can promise a height here.
    */
    <div className="flex min-h-0 flex-1 flex-col gap-2.5">
      {/* Search + view toggle */}
      <div className="flex shrink-0 items-center gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-400"
          />
          <label className="sr-only" htmlFor="lead-search">
            Search leads
          </label>
          <input
            id="lead-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, company, city, phone…"
            className="w-full rounded-lg border border-primary-200 bg-white py-2 pl-9 pr-8 text-sm text-primary-900 outline-none transition placeholder:text-primary-400 focus:border-primary-950"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-primary-400 transition hover:text-primary-900"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-lg border border-primary-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setView('board')}
            aria-pressed={view === 'board'}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              view === 'board'
                ? 'bg-primary-950 text-white'
                : 'text-primary-500 hover:bg-primary-50'
            }`}
          >
            <LayoutGrid aria-hidden className="h-3.5 w-3.5" />
            Board
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
              view === 'list'
                ? 'bg-primary-950 text-white'
                : 'text-primary-500 hover:bg-primary-50'
            }`}
          >
            <List aria-hidden className="h-3.5 w-3.5" />
            List
          </button>
        </div>

        {view === 'board' && (
          <p className="hidden text-xs text-primary-500 lg:block">
            Drag a card, or use the dropdown on it, to move a lead.
          </p>
        )}
      </div>

      {/* Chart reflects the search but not the status pills — it *is* the
          status breakdown, so filtering to one status would leave a single bar. */}
      <div className="shrink-0">
        <LeadsChart leads={searched} />
      </div>

      {/*
        Status pills — list view only.

        One row that scrolls sideways instead of wrapping. Eleven statuses
        wrapped into four or five stacked lines on a phone and pushed the actual
        leads below the fold; a single scrolling row keeps the table where you
        left it. The negative margin lets the row reach the screen edges inside
        the padded admin shell, so a half-cut pill signals there is more to the
        right — a row that ends flush looks complete.
      */}
      {view === 'list' && (
        <div className="scrollbar-slim -mx-4 shrink-0 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="flex w-max items-center gap-1">
            <button
              type="button"
              onClick={() => setStatus('')}
              className={`shrink-0 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 transition ${
                !activeStatus
                  ? 'border-primary-950 bg-primary-950 text-white'
                  : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300'
              }`}
            >
              All ({searched.length})
            </button>
            {STATUS_OPTIONS.map((status) => {
              const count = searched.filter((lead) => lead.status === status).length;
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatus(isActive ? '' : status)}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 transition ${
                    isActive
                      ? 'border-primary-950 bg-primary-950 text-white'
                      : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300'
                  }`}
                >
                  {/* Same colour the row and the status pill use, so the filter
                      and what it filters to are recognisably the same thing. */}
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full ${LEAD_STATUS_DOT[status]}`}
                  />
                  {LEAD_STATUS_SHORT[status]} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* The board always gets every lead, even if `?status=` lingers in the URL. */}
      {view === 'board' && <LeadBoard leads={searched} />}

      {view === 'list' && <LeadsTable leads={listed} />}

      {isPending && view === 'board' && (
        <p aria-live="polite" className="shrink-0 text-xs text-primary-500">
          Updating…
        </p>
      )}
    </div>
  );
}
