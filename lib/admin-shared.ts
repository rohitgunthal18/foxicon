/**
 * Presentation constants and pure formatters for the admin UI.
 *
 * Deliberately free of 'server-only' and of any database import: the lead
 * board, filters and timeline are client components and need these labels.
 * Anything that touches `supabaseAdmin` belongs in `lib/admin.ts` instead —
 * importing that from a client component would pull the secret-key client
 * into the browser bundle.
 */

/** Pipeline stages in the order the board renders them. */
export const LEAD_STAGES = [
  'new',
  'contacted',
  'follow_up',
  'qualified',
  'agreement',
  'development',
  'delivered',
  'paid',
  'closed',
] as const;

/**
 * Dead ends. Kept out of the board; reachable from the lead detail page.
 *
 * Two of them, and the difference is *who* ended it. `lost` is their decision —
 * they went elsewhere, or went quiet, after a real conversation. `rejected` is
 * ours: spam, wrong country, a business we will not work with. That split is
 * worth keeping because it answers different questions — a rising `lost` count
 * means the pitch or the price is wrong, a rising `rejected` count means the
 * scrape is pulling the wrong businesses. The labels and hints below say so
 * outright, since "Lost" and "Rejected" side by side do read as duplicates.
 */
export const LEAD_DEAD_ENDS = ['lost', 'rejected'] as const;

export type LeadStatus =
  | (typeof LEAD_STAGES)[number]
  | (typeof LEAD_DEAD_ENDS)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New enquiry',
  contacted: 'Contacted',
  follow_up: 'Follow up',
  qualified: 'Qualified',
  agreement: 'Agreement sent',
  development: 'In development',
  delivered: 'Delivered',
  paid: 'Paid in full',
  closed: 'Closed',
  lost: 'Lost — they said no',
  rejected: 'Rejected — we said no',
};

/**
 * What the owner should do next at each stage. Shown on the lead card so the
 * board reads as a set of actions rather than a set of labels.
 */
export const LEAD_STATUS_HINT: Record<LeadStatus, string> = {
  new: 'Call or email them today',
  contacted: 'Waiting on their reply',
  follow_up: 'Interested — call back when they asked',
  qualified: 'They are interested — send the agreement',
  agreement: 'Waiting for signature and advance',
  development: 'Build in progress',
  delivered: 'Delivered — collect the balance',
  paid: 'Paid — wrap up and close',
  closed: 'Complete',
  lost: 'They chose someone else, or went quiet',
  rejected: 'We turned this one down — spam or not a fit',
};

/**
 * One-word labels for tight spots: the pipeline progress bar and board
 * headers. The progress bar used to derive these by string-replacing on the
 * long label, which turned "Paid in full" into "Paid full" and left "In
 * development" untouched.
 */
export const LEAD_STATUS_SHORT: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  follow_up: 'Follow up',
  qualified: 'Qualified',
  agreement: 'Agreement',
  development: 'Development',
  delivered: 'Delivered',
  paid: 'Paid',
  closed: 'Closed',
  lost: 'Lost',
  rejected: 'Rejected',
};

/**
 * Tailwind classes per status, matching the site palette.
 *
 * Solid-ish `-100` fills with `-800`/`-900` text, not the `/10` tints these
 * used to be. At 10% opacity behind 700-weight text the label was legible on a
 * white card but not inside the list's status `<select>`, where the browser
 * paints its own chrome over the top — the colour read as "vaguely warm" and
 * the word itself washed out. These are picked to clear WCAG AA at 12px.
 */
export const LEAD_STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-accent-100 text-accent-900 border-accent-300',
  contacted: 'bg-blue-100 text-blue-900 border-blue-300',
  follow_up: 'bg-amber-100 text-amber-900 border-amber-300',
  qualified: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  agreement: 'bg-violet-100 text-violet-900 border-violet-300',
  development: 'bg-cyan-100 text-cyan-900 border-cyan-300',
  delivered: 'bg-teal-100 text-teal-900 border-teal-300',
  paid: 'bg-green-100 text-green-900 border-green-300',
  closed: 'bg-primary-100 text-primary-800 border-primary-300',
  lost: 'bg-red-100 text-red-900 border-red-300',
  rejected: 'bg-slate-200 text-slate-800 border-slate-400',
};

/**
 * Full-strength fills, for anything with no text sitting on top: the row accent
 * bar in the list, the legend dots, the chart bars. Same hues as the pills so a
 * lead reads the same colour wherever it appears — the request was "contacted
 * blue, follow up yellow, qualified green, rejected red", and that mapping is
 * fixed here once rather than restated per component.
 */
export const LEAD_STATUS_DOT: Record<LeadStatus, string> = {
  new: 'bg-accent-500',
  contacted: 'bg-blue-500',
  follow_up: 'bg-amber-500',
  qualified: 'bg-emerald-500',
  agreement: 'bg-violet-500',
  development: 'bg-cyan-500',
  delivered: 'bg-teal-500',
  paid: 'bg-green-600',
  closed: 'bg-primary-400',
  lost: 'bg-red-500',
  rejected: 'bg-slate-500',
};

/**
 * Left-edge accent on each list row. Kept as `border-*` rather than `bg-*`
 * because Tailwind needs the literal class name at build time — a computed
 * `border-${colour}-500` would be purged and silently render no colour at all.
 */
export const LEAD_ROW_ACCENT: Record<LeadStatus, string> = {
  new: 'border-l-accent-500',
  contacted: 'border-l-blue-500',
  follow_up: 'border-l-amber-500',
  qualified: 'border-l-emerald-500',
  agreement: 'border-l-violet-500',
  development: 'border-l-cyan-500',
  delivered: 'border-l-teal-500',
  paid: 'border-l-green-600',
  closed: 'border-l-primary-400',
  lost: 'border-l-red-500',
  rejected: 'border-l-slate-500',
};

/**
 * Where a lead came from.
 *
 * The lead detail page used to render this as a two-way ternary — anything that
 * was not 'contact_form' was labelled "Quote modal", which turned every
 * manually added lead into a lie about its own origin.
 */
export const LEAD_SOURCE_LABEL: Record<string, string> = {
  contact_form: 'Website contact form',
  quote_modal: 'Website quote form',
  manual: 'Added manually',
  imported: 'Imported from Google Maps',
};

export function leadSourceLabel(source: string | null): string {
  return source ? (LEAD_SOURCE_LABEL[source] ?? source) : 'Unknown';
}

/* Phone numbers ------------------------------------------------------------ */

/*
  Normalisation itself lives in `lib/phone.ts` — one definition of "what is a
  valid Indian mobile", shared by the admin UI here and by the Sarvam outbound
  route, which rejects anything that is not E.164.
*/
import { toE164, toWhatsApp } from './phone';

export { toE164, toTelHref as telHref } from './phone';

/**
 * `wa.me` href, optionally pre-filling the first message.
 *
 * Uses wa.me rather than the `whatsapp://` scheme so it works from desktop
 * Chrome (opens WhatsApp Web) as well as from a phone.
 */
export function whatsappHref(
  phone: string | null,
  message?: string
): string | null {
  const digits = toWhatsApp(phone);
  if (!digits) return null;
  const query = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${query}`;
}

export const AGREEMENT_STATUS_LABEL = {
  draft: 'Draft',
  sent: 'Sent — awaiting signature',
  signed: 'Signed',
  voided: 'Voided',
} as const;

/**
 * Filter-pill labels. Separate from `AGREEMENT_STATUS_LABEL` on purpose —
 * deriving these by splitting the long label on an em dash would break the
 * moment someone rewords it.
 */
export const AGREEMENT_STATUS_SHORT = {
  draft: 'Draft',
  sent: 'Sent',
  signed: 'Signed',
  voided: 'Voided',
} as const;

export const AGREEMENT_STATUS_STYLE = {
  draft: 'bg-primary-100 text-primary-700 border-primary-200',
  sent: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  signed: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  voided: 'bg-red-500/10 text-red-700 border-red-500/20',
} as const;

export type AgreementStatus = keyof typeof AGREEMENT_STATUS_LABEL;

/** Whole-rupee formatter, matching `lib/content.ts`. */
export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/** "3 days ago" / "in 2 days" — short, for timeline and follow-up chips. */
export function relativeTime(iso: string | null): string {
  if (!iso) return '—';

  const then = new Date(iso).getTime();
  const diffMs = then - Date.now();
  const abs = Math.abs(diffMs);

  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000_000],
    ['month', 2_592_000_000],
    ['day', 86_400_000],
    ['hour', 3_600_000],
    ['minute', 60_000],
  ];

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  for (const [unit, ms] of units) {
    if (abs >= ms) {
      return formatter.format(Math.round(diffMs / ms), unit);
    }
  }

  return 'just now';
}

/**
 * "5 Aug 2026, 6:42 pm" — the exact moment, for the history timeline.
 *
 * `relativeTime` alone was not enough there: "2 days ago" cannot be lined up
 * against a note that says "call back at 6pm", and every entry older than a day
 * collapsed into the same vague phrase. The timeline now shows both — this as
 * the primary stamp, the relative form beside it for at-a-glance recency.
 *
 * Asia/Kolkata is pinned deliberately. Left to the runtime, the server renders
 * in UTC and the browser in local time, so the same note would claim two
 * different clock times and React would flag a hydration mismatch.
 */
export function absoluteTime(iso: string | null): string {
  if (!iso) return '—';

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso));
}

/**
 * Stamp each row with whether its follow-up has come due, against one clock
 * reading for the whole list.
 *
 * This lives here, outside any component, on purpose. Deciding "overdue?" while
 * rendering lets the server and the browser reach different answers for the
 * same lead — a hydration mismatch, and an unstable result on any later
 * re-render. Call it on the server, pass the boolean down.
 */
export function markOverdue<T extends { next_follow_up_at: string | null }>(
  rows: readonly T[]
): (T & { is_overdue: boolean })[] {
  const now = Date.now();
  return rows.map((row) => ({
    ...row,
    is_overdue:
      row.next_follow_up_at !== null &&
      new Date(row.next_follow_up_at).getTime() <= now,
  }));
}

/** Narrow an untrusted `?status=` value to a real pipeline stage. */
export function toLeadStatus(value: string | undefined): LeadStatus | null {
  const all: readonly string[] = [...LEAD_STAGES, ...LEAD_DEAD_ENDS];
  return value && all.includes(value) ? (value as LeadStatus) : null;
}

/** Narrow an untrusted `?status=` value to a real agreement status. */
export function toAgreementStatus(value: string | undefined): AgreementStatus | null {
  return value && value in AGREEMENT_STATUS_LABEL ? (value as AgreementStatus) : null;
}
