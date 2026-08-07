import {
  ArrowRightLeft,
  Bot,
  FileSignature,
  IndianRupee,
  PencilLine,
  StickyNote,
} from 'lucide-react';

import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  LEAD_STATUS_SHORT,
  absoluteTime,
  relativeTime,
  type LeadStatus,
} from '@/lib/admin-shared';
import NoteComposer from './NoteComposer';

const KIND_ICON = {
  note: StickyNote,
  status_change: ArrowRightLeft,
  agreement_sent: FileSignature,
  agreement_signed: FileSignature,
  payment_recorded: IndianRupee,
  field_update: PencilLine,
  agent_call: Bot,
} as const;

type ActivityKind = keyof typeof KIND_ICON;

/**
 * Column name -> what a person would call it.
 *
 * The log stores the raw keys that changed, which is right for a log but wrong
 * to show: "Updated value_inr, next_follow_up_at" is not English.
 */
const FIELD_LABEL: Record<string, string> = {
  priority: 'priority',
  value_inr: 'deal value',
  next_follow_up_at: 'follow-up date',
  service_slug: 'service',
  name: 'name',
  company: 'company',
  email: 'email',
  phone: 'phone',
};

/**
 * Sarvam's call status -> what actually happened, in words.
 *
 * "no_answer" is a machine's way of saying it; the person reading the timeline
 * wants to know whether to try again, so say so plainly.
 */
const AGENT_CALL_OUTCOME: Record<string, string> = {
  initiated: 'dialling now',
  connected: 'answered',
  no_answer: 'no answer',
  busy: 'line was busy',
  failed: 'call failed',
};

/** 95 -> "1m 35s". Bare seconds stop being readable somewhere around a minute. */
function formatDuration(seconds: number): string {
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole}s`;
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

function listFields(fields: string[]): string {
  const named = fields.map((field) => FIELD_LABEL[field] ?? field);
  if (named.length === 1) return named[0];
  if (named.length === 2) return `${named[0]} and ${named[1]}`;
  return `${named.slice(0, -1).join(', ')} and ${named[named.length - 1]}`;
}

/**
 * The lead's history — a plain-English record of everything that has happened,
 * newest first, plus the box for writing down what was said on a call.
 *
 * This was headed "Activity", which said nothing about what it was for or where
 * the entries came from. Some rows are written by you (notes) and some are
 * written automatically when you change something, so the header now says so.
 */
export default async function LeadTimeline({ leadId }: { leadId: string }) {
  const { data: activities } = await supabaseAdmin
    .from('lead_activities')
    .select('id, kind, body, meta, created_at, author_id, admin_users(full_name)')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
      <header className="border-b border-primary-200 px-5 py-3.5">
        <h2 className="text-sm font-semibold text-primary-900">History</h2>
        <p className="mt-0.5 text-xs text-primary-500">
          Every call, note and change on this lead — newest first. Changes you
          make elsewhere on this page are added here automatically.
        </p>
      </header>

      <div className="border-b border-primary-200 bg-primary-50/50 px-5 py-4">
        <h3 className="mb-2 text-xs font-semibold text-primary-700">
          Log a call or add a note
        </h3>
        <NoteComposer leadId={leadId} />
      </div>

      <ol className="divide-y divide-primary-100">
        {(activities ?? []).length === 0 && (
          <li className="px-5 py-8 text-center text-sm text-primary-500">
            Nothing here yet. After your first call, write down what was said —
            future you will not remember.
          </li>
        )}

        {(activities ?? []).map((activity) => {
          const Icon = KIND_ICON[activity.kind as ActivityKind] ?? StickyNote;
          const meta = (activity.meta ?? {}) as Record<string, unknown>;
          const author = (activity.admin_users as { full_name: string } | null)?.full_name;

          let summary: string;
          switch (activity.kind) {
            case 'status_change':
              summary = `Stage moved from ${
                LEAD_STATUS_SHORT[meta.from as LeadStatus] ?? meta.from
              } to ${LEAD_STATUS_SHORT[meta.to as LeadStatus] ?? meta.to}`;
              break;
            case 'field_update': {
              const fields = meta.fields as string[] | undefined;
              // `body` wins when there is one: an edit logs the changed keys and
              // no body, but the importer logs a written line and no keys.
              // Without this, "Imported from a Google Maps scrape." rendered as
              // the generic "Changed the deal details".
              summary = fields?.length
                ? `Changed the ${listFields(fields)}`
                : (activity.body ?? 'Changed the deal details');
              break;
            }
            case 'agreement_sent':
              summary = activity.body ?? 'Agreement sent to the client';
              break;
            case 'agreement_signed':
              summary = activity.body ?? 'Client signed the agreement';
              break;
            case 'payment_recorded':
              summary = activity.body ?? 'Payment recorded';
              break;
            /*
              The voice agent writes its own summary into `body`, so that is
              what leads the entry. The line above it says how the call went,
              because a summary alone cannot tell you the customer never picked
              up — an unanswered call has no summary at all.
            */
            case 'agent_call': {
              const status = meta.call_status as string | undefined;
              const seconds = meta.duration_seconds as number | undefined;
              const heading =
                status && status !== 'connected'
                  ? `Voice agent called — ${AGENT_CALL_OUTCOME[status] ?? status}`
                  : `Voice agent call${
                      seconds ? ` — ${formatDuration(seconds)}` : ''
                    }`;
              summary = activity.body ? `${heading}\n\n${activity.body}` : heading;
              break;
            }
            default:
              summary = activity.body ?? '—';
          }

          return (
            <li key={activity.id} className="flex gap-3 px-5 py-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Icon aria-hidden className="h-3.5 w-3.5 text-primary-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="whitespace-pre-line text-sm text-primary-800">{summary}</p>
                {/*
                  Exact stamp first, relative second. A note that says "call back
                  at 6" is only useful next to the time it was written, and
                  "2 days ago" cannot be compared against anything.
                  `dateTime` carries the raw ISO value for anything parsing it.
                */}
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                  {author && (
                    <span className="font-medium text-primary-600">{author}</span>
                  )}
                  <time
                    dateTime={activity.created_at}
                    className="font-medium text-primary-600"
                  >
                    {absoluteTime(activity.created_at)}
                  </time>
                  <span className="text-primary-400">
                    ({relativeTime(activity.created_at)})
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
