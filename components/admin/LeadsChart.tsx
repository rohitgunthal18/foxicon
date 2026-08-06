'use client';

import { useMemo, useState } from 'react';
import { BarChart3, ChevronDown } from 'lucide-react';

import {
  LEAD_DEAD_ENDS,
  LEAD_STAGES,
  LEAD_STATUS_SHORT,
  type LeadStatus,
} from '@/lib/admin-shared';

/**
 * Solid fills for the bars.
 *
 * `LEAD_STATUS_STYLE` is deliberately not reused here — those are the pill
 * styles, tinted to /10 so text stays readable on top of them. A bar has no
 * text on it, and at 10% opacity the whole chart washes out into one grey
 * smear.
 */
const BAR_COLOUR: Record<LeadStatus, string> = {
  new: 'bg-accent-500',
  contacted: 'bg-amber-500',
  follow_up: 'bg-orange-500',
  qualified: 'bg-violet-500',
  agreement: 'bg-blue-500',
  development: 'bg-cyan-500',
  delivered: 'bg-teal-500',
  paid: 'bg-emerald-500',
  closed: 'bg-primary-400',
  lost: 'bg-red-500',
  rejected: 'bg-primary-300',
};

const STATUS_OPTIONS: readonly LeadStatus[] = [...LEAD_STAGES, ...LEAD_DEAD_ENDS];

/** Buckets for the score histogram, coarse enough to stay readable. */
const SCORE_BUCKETS = [
  { label: '90+', min: 90, max: Infinity, colour: 'bg-emerald-500' },
  { label: '75–89', min: 75, max: 90, colour: 'bg-blue-500' },
  { label: '60–74', min: 60, max: 75, colour: 'bg-amber-500' },
  { label: '< 60', min: -Infinity, max: 60, colour: 'bg-primary-400' },
] as const;

/** One bar. Declared so the `as const` bucket table does not narrow the rows. */
interface ChartRow {
  key: string;
  label: string;
  count: number;
  colour: string;
}

interface ChartLead {
  status: LeadStatus;
  city: string | null;
  lead_score: number | null;
}

interface Props {
  leads: ChartLead[];
}

type Panel = 'status' | 'city' | 'score';

export default function LeadsChart({ leads }: Props) {
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>('status');

  const byStatus = useMemo(
    () =>
      STATUS_OPTIONS.map((status) => ({
        key: status,
        label: LEAD_STATUS_SHORT[status],
        count: leads.filter((lead) => lead.status === status).length,
        colour: BAR_COLOUR[status],
      })).filter((row) => row.count > 0),
    [leads]
  );

  /**
   * Cities are long-tailed — a scrape of one region yields a handful of towns
   * with one lead each. Showing all of them turns the panel into a scroll, so
   * the tail is rolled into a single "Other" row rather than dropped, which
   * would make the bars stop adding up to the total.
   */
  const byCity = useMemo(() => {
    const tally = new Map<string, number>();
    let unknown = 0;

    for (const lead of leads) {
      const city = lead.city?.trim();
      if (!city) {
        unknown += 1;
        continue;
      }
      tally.set(city, (tally.get(city) ?? 0) + 1);
    }

    const ranked = [...tally.entries()].sort((a, b) => b[1] - a[1]);
    const top = ranked.slice(0, 8);
    const tail = ranked.slice(8).reduce((sum, [, count]) => sum + count, 0);

    const rows: ChartRow[] = top.map(([city, count]) => ({
      key: city,
      label: city,
      count,
      colour: 'bg-accent-500',
    }));

    if (tail > 0) {
      rows.push({
        key: '__other',
        label: `Other (${ranked.length - 8} cities)`,
        count: tail,
        colour: 'bg-primary-400',
      });
    }
    if (unknown > 0) {
      rows.push({
        key: '__unknown',
        label: 'No city',
        count: unknown,
        colour: 'bg-primary-300',
      });
    }

    return rows;
  }, [leads]);

  const byScore = useMemo(() => {
    const scored = leads.filter((lead) => lead.lead_score !== null);
    const rows: ChartRow[] = SCORE_BUCKETS.map((bucket) => ({
      key: bucket.label,
      label: bucket.label,
      count: scored.filter(
        (lead) => lead.lead_score! >= bucket.min && lead.lead_score! < bucket.max
      ).length,
      colour: bucket.colour,
    }));

    const unscored = leads.length - scored.length;
    if (unscored > 0) {
      rows.push({
        key: '__unscored',
        label: 'Not scored',
        count: unscored,
        colour: 'bg-primary-300',
      });
    }

    return rows.filter((row) => row.count > 0);
  }, [leads]);

  const rows = panel === 'status' ? byStatus : panel === 'city' ? byCity : byScore;

  // Bars are scaled against the largest bar, not the total. Against the total,
  // a realistic spread (one stage holding most leads) squashes every other bar
  // to a few invisible pixels.
  const peak = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2 text-left transition hover:bg-primary-50"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-primary-900">
          <BarChart3 aria-hidden className="h-3.5 w-3.5 text-primary-500" />
          Breakdown
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-primary-500">
          {leads.length} leads
          <ChevronDown
            aria-hidden
            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {open && (
        <div className="border-t border-primary-200 p-4">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {(
              [
                ['status', 'By stage'],
                ['city', 'By city'],
                ['score', 'By score'],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPanel(value)}
                aria-pressed={panel === value}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  panel === value
                    ? 'border-primary-950 bg-primary-950 text-white'
                    : 'border-primary-200 bg-white text-primary-600 hover:border-primary-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-primary-500">
              Nothing to chart yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {rows.map((row) => {
                const share = leads.length
                  ? Math.round((row.count / leads.length) * 100)
                  : 0;
                return (
                  <li key={row.key} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-xs text-primary-600">
                      {row.label}
                    </span>
                    <div className="h-5 min-w-0 flex-1 overflow-hidden rounded bg-primary-100">
                      <div
                        className={`h-full rounded transition-all ${row.colour}`}
                        style={{ width: `${(row.count / peak) * 100}%` }}
                      />
                    </div>
                    <span className="w-16 shrink-0 text-right text-xs tabular-nums text-primary-700">
                      <strong className="font-semibold">{row.count}</strong>
                      <span className="ml-1 text-primary-400">{share}%</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
