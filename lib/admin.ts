import 'server-only';

import { supabaseAdmin } from './supabase/admin';
import { LEAD_DEAD_ENDS, LEAD_STAGES, type LeadStatus } from './admin-shared';

/**
 * Server-side admin helpers.
 *
 * The presentation constants live in `lib/admin-shared.ts` and are re-exported
 * here so server components can keep importing everything from one place.
 * Client components must import from `admin-shared` directly — this module
 * pulls in the secret-key Supabase client and is marked 'server-only'.
 */
export * from './admin-shared';

/** A lead row as every dashboard and board view needs it. */
export interface LeadRow {
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
}

export interface DashboardData {
  /** Counts per pipeline stage, for the board summary. */
  stageCounts: Record<LeadStatus, number>;
  newLeads: number;
  activeLeads: number;
  wonLeads: number;
  pipelineValueInr: number;
  pendingReviews: number;
  openAgreements: number;
  /** New enquiries and overdue follow-ups, merged into one to-do list. */
  needsAttention: (LeadRow & { reason: 'new' | 'overdue' })[];
  /**
   * How many leads qualify, before `needsAttention` is capped — so the page can
   * say "8 of 803" rather than implying the list is everything.
   */
  needsAttentionTotal: number;
  recentLeads: LeadRow[];
}

/**
 * How many to-do rows the dashboard shows.
 *
 * This list was uncapped, which was fine when leads arrived one web form at a
 * time and fell apart the moment 800 scraped businesses landed at status `new`:
 * every one of them qualified, so the dashboard rendered 800 rows and pushed the
 * pipeline counts, the money and the recent list somewhere past the 20th screen.
 * A to-do list nobody can reach the bottom of is not a to-do list — it is the
 * leads page with extra steps, which is exactly what the dashboard stopped
 * looking like. The full set is one click away on /admin/leads.
 */
const TODO_LIMIT = 8;

const ACTIVE_STATUSES: readonly LeadStatus[] = [
  'contacted',
  'qualified',
  'agreement',
  'development',
  'delivered',
];

/**
 * Everything the dashboard renders, in a single wave of three queries.
 *
 * This used to be nine count queries followed by a second wave of two more —
 * eleven sequential-ish round trips. Against a Seoul-hosted project that is
 * roughly 800ms of the page just waiting on the network, which is what made
 * the dashboard feel frozen after a click.
 *
 * Reading the lead rows once and tallying in JS costs one round trip (~190ms)
 * and gives us the stage counts, the money, the to-do list and the recent
 * list from the same bytes. Only the review and agreement counts still need
 * their own queries, and those run in parallel with it.
 *
 * The tradeoff: this pulls every lead row rather than asking Postgres to
 * count. At agency scale (hundreds, not millions) that is a few hundred KB and
 * still four times faster. If the table ever grows past ~10k rows, move the
 * tallying into a Postgres view and select from that instead.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const nowMs = Date.now();

  const [leadsResult, reviewsResult, agreementsResult] = await Promise.all([
    supabaseAdmin
      .from('leads')
      .select(
        'id, name, company, email, phone, status, priority, value_inr, next_follow_up_at, created_at'
      )
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabaseAdmin
      .from('agreements')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent'),
  ]);

  const leads = (leadsResult.data ?? []) as LeadRow[];

  const stageCounts = [...LEAD_STAGES, ...LEAD_DEAD_ENDS].reduce(
    (acc, stage) => {
      acc[stage] = 0;
      return acc;
    },
    {} as Record<LeadStatus, number>
  );

  let activeLeads = 0;
  let wonLeads = 0;
  let pipelineValueInr = 0;
  const overdue: LeadRow[] = [];
  const fresh: LeadRow[] = [];

  for (const lead of leads) {
    if (lead.status in stageCounts) stageCounts[lead.status] += 1;

    const isActive = ACTIVE_STATUSES.includes(lead.status);
    if (isActive) {
      activeLeads += 1;
      pipelineValueInr += lead.value_inr ?? 0;
    }
    if (lead.status === 'paid' || lead.status === 'closed') wonLeads += 1;

    if (lead.status === 'new') {
      fresh.push(lead);
    } else if (
      isActive &&
      lead.next_follow_up_at !== null &&
      new Date(lead.next_follow_up_at).getTime() <= nowMs
    ) {
      overdue.push(lead);
    }
  }

  // Overdue follow-ups first (a promise already broken), then new enquiries
  // oldest-first — the one waiting longest is the most urgent.
  const needsAttention = [
    ...overdue
      .sort(
        (a, b) =>
          new Date(a.next_follow_up_at!).getTime() -
          new Date(b.next_follow_up_at!).getTime()
      )
      .map((lead) => ({ ...lead, reason: 'overdue' as const })),
    ...fresh
      .slice()
      .reverse()
      .map((lead) => ({ ...lead, reason: 'new' as const })),
  ];

  return {
    stageCounts,
    newLeads: stageCounts.new,
    activeLeads,
    wonLeads,
    pipelineValueInr,
    pendingReviews: reviewsResult.count ?? 0,
    openAgreements: agreementsResult.count ?? 0,
    // Sliced after the sort, so the cap keeps the *most* urgent rows rather
    // than an arbitrary eight.
    needsAttention: needsAttention.slice(0, TODO_LIMIT),
    needsAttentionTotal: needsAttention.length,
    recentLeads: leads.slice(0, 5),
  };
}
