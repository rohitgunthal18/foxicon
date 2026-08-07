'use client';

import { useState } from 'react';
import {
  Phone,
  PhoneOff,
  PhoneMissed,
  Clock,
  ChevronDown,
  ChevronUp,
  Bot,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertCircle,
  HelpCircle,
  DollarSign,
  MessageSquare,
  Play,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types — mirrors what agent_calls returns from Supabase
// ─────────────────────────────────────────────────────────────────────────────

interface TranscriptEntry {
  role: 'agent' | 'user' | 'system';
  content: string;
  timestamp?: string;
}

interface AgentCall {
  id: string;
  attempt_id: string;
  call_status: 'initiated' | 'connected' | 'no_answer' | 'busy' | 'failed';
  language_name: string | null;
  duration_seconds: number | null;
  summary: string | null;
  disposition: string | null;
  transcript: TranscriptEntry[] | null;
  agent_variables: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  interaction_id: string | null;
  started_at: string;
  ended_at: string | null;
}

interface Props {
  calls: AgentCall[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Display helpers
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; colour: string }
> = {
  connected: { label: 'Answered', icon: Phone, colour: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  no_answer: { label: 'No Answer', icon: PhoneMissed, colour: 'text-amber-600 bg-amber-50 border-amber-200' },
  busy: { label: 'Busy', icon: PhoneOff, colour: 'text-orange-600 bg-orange-50 border-orange-200' },
  failed: { label: 'Failed', icon: PhoneOff, colour: 'text-red-600 bg-red-50 border-red-200' },
  initiated: { label: 'Calling…', icon: Phone, colour: 'text-blue-600 bg-blue-50 border-blue-200' },
};

const DISPOSITION_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; colour: string }
> = {
  qualified: {
    label: 'Qualified',
    icon: CheckCircle2,
    colour: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  interested: {
    label: 'Interested',
    icon: CheckCircle2,
    colour: 'text-green-700 bg-green-50 border-green-200',
  },
  callback_later: {
    label: 'Callback Later',
    icon: Calendar,
    colour: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  not_interested: {
    label: 'Not Interested',
    icon: XCircle,
    colour: 'text-red-700 bg-red-50 border-red-200',
  },
  wrong_number: {
    label: 'Wrong Number',
    icon: AlertCircle,
    colour: 'text-gray-700 bg-gray-50 border-gray-200',
  },
  no_decision_maker: {
    label: 'No Decision Maker',
    icon: AlertCircle,
    colour: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  unclear: {
    label: 'Unclear',
    icon: HelpCircle,
    colour: 'text-gray-600 bg-gray-50 border-gray-200',
  },
};

const BUDGET_LABEL: Record<string, string> = {
  under_5k: 'Under ₹5,000',
  '5k_10k': '₹5,000 – ₹10,000',
  '10k_20k': '₹10,000 – ₹20,000',
  above_20k: 'Above ₹20,000',
  unknown: 'Not discussed',
};

const HAS_WEBSITE_LABEL: Record<string, string> = {
  yes: 'Has a website',
  no: 'No website',
  outdated: 'Outdated website',
  unknown: 'Unknown',
};

function formatDuration(seconds: number): string {
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole}s`;
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Transcript viewer (collapsible)
// ─────────────────────────────────────────────────────────────────────────────

function TranscriptViewer({ transcript }: { transcript: TranscriptEntry[] }) {
  const [open, setOpen] = useState(false);

  const conversation = transcript.filter((t) => t.role !== 'system');
  if (conversation.length === 0) return null;

  return (
    <div className="mt-3 rounded-lg border border-primary-200">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-primary-700 hover:bg-primary-50"
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Full transcript ({conversation.length} turns)
        </span>
        {open ? (
          <ChevronUp className="h-3.5 w-3.5 text-primary-400" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-primary-400" />
        )}
      </button>

      {open && (
        <div className="divide-y divide-primary-100 border-t border-primary-200">
          {conversation.map((entry, i) => (
            <div
              key={i}
              className={`px-3 py-2.5 ${
                entry.role === 'agent' ? 'bg-blue-50/40' : 'bg-white'
              }`}
            >
              <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-400">
                {entry.role === 'agent' ? '🤖 Isha (Agent)' : '🧑‍⚕️ Customer'}
              </p>
              <p className="text-xs leading-relaxed text-primary-800">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Single call card
// ─────────────────────────────────────────────────────────────────────────────

function CallCard({ call }: { call: AgentCall }) {
  const statusCfg = STATUS_CONFIG[call.call_status] ?? STATUS_CONFIG.failed;
  const StatusIcon = statusCfg.icon;
  const dispositionCfg = call.disposition ? DISPOSITION_CONFIG[call.disposition] : null;
  const DispositionIcon = dispositionCfg?.icon;

  const meta = (call.meta ?? {}) as Record<string, unknown>;
  const agentVars = (call.agent_variables ?? {}) as Record<string, unknown>;

  const callbackPreference =
    typeof meta.callback_preference === 'string' ? meta.callback_preference : null;
  const interestReason =
    typeof meta.interest_reason === 'string' ? meta.interest_reason : null;
  const objection =
    typeof meta.objection === 'string' ? meta.objection : null;
  const ownerName =
    typeof meta.owner_name === 'string'
      ? meta.owner_name
      : typeof agentVars.owner_name === 'string'
        ? agentVars.owner_name
        : null;
  const hasWebsite =
    typeof meta.has_website === 'string' ? meta.has_website : null;
  const budgetRange =
    typeof meta.budget_range === 'string' ? meta.budget_range : null;
  const audioUrl =
    typeof meta.audio_url === 'string' ? meta.audio_url : null;

  const transcript = Array.isArray(call.transcript) ? (call.transcript as TranscriptEntry[]) : [];

  return (
    <div className="rounded-xl border border-primary-200 bg-white p-4">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusCfg.colour}`}
          >
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </span>

          {call.duration_seconds && call.duration_seconds > 0 && (
            <span className="flex items-center gap-1 text-xs text-primary-500">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration_seconds)}
            </span>
          )}

          {call.language_name && (
            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-medium text-primary-600">
              {call.language_name}
            </span>
          )}
        </div>

        <time className="text-xs text-primary-400">{formatDateTime(call.started_at)}</time>
      </div>

      {/* Disposition badge */}
      {dispositionCfg && DispositionIcon && (
        <div className="mt-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${dispositionCfg.colour}`}
          >
            <DispositionIcon className="h-3 w-3" />
            {dispositionCfg.label}
          </span>
        </div>
      )}

      {/* Summary */}
      {call.summary && (
        <div className="mt-3 rounded-lg bg-primary-50 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary-500">
            📝 Call Summary
          </p>
          <p className="whitespace-pre-line text-xs leading-relaxed text-primary-800">
            {call.summary}
          </p>
        </div>
      )}

      {/* Audio Recording */}
      {call.interaction_id && (
        <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50/50 p-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-500">
            🔊 Call Recording
          </p>
          <audio
            controls
            src={`/api/agent/audio?interaction_id=${encodeURIComponent(call.interaction_id)}`}
            className="w-full h-8 outline-none"
            preload="none"
          >
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* Structured details */}
      {(ownerName || hasWebsite || budgetRange || interestReason || objection || callbackPreference) && (
        <div className="mt-3 grid gap-1.5 text-xs sm:grid-cols-2">
          {ownerName && (
            <div className="flex items-start gap-1.5 text-primary-700">
              <span className="shrink-0 font-medium text-primary-500">Spoke to:</span>
              <span>{ownerName}</span>
            </div>
          )}
          {hasWebsite && (
            <div className="flex items-start gap-1.5 text-primary-700">
              <span className="shrink-0 font-medium text-primary-500">Website:</span>
              <span>{HAS_WEBSITE_LABEL[hasWebsite] ?? hasWebsite}</span>
            </div>
          )}
          {budgetRange && (
            <div className="flex items-center gap-1.5 text-primary-700">
              <DollarSign className="h-3 w-3 shrink-0 text-primary-400" />
              <span className="font-medium text-primary-500">Budget:</span>
              <span>{BUDGET_LABEL[budgetRange] ?? budgetRange}</span>
            </div>
          )}
          {interestReason && (
            <div className="flex items-start gap-1.5 text-primary-700 sm:col-span-2">
              <span className="shrink-0 font-medium text-primary-500">Interested because:</span>
              <span>{interestReason}</span>
            </div>
          )}
          {objection && (
            <div className="flex items-start gap-1.5 text-amber-700 sm:col-span-2">
              <AlertCircle className="mt-px h-3 w-3 shrink-0 text-amber-500" />
              <span className="font-medium text-amber-600">Objection:</span>
              <span>{objection}</span>
            </div>
          )}
          {callbackPreference && (
            <div className="flex items-start gap-1.5 text-blue-700 sm:col-span-2">
              <Calendar className="mt-px h-3 w-3 shrink-0 text-blue-500" />
              <span className="font-medium text-blue-600">Call back:</span>
              <span>{callbackPreference}</span>
            </div>
          )}
        </div>
      )}

      {/* Transcript */}
      {transcript.length > 0 && <TranscriptViewer transcript={transcript} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export — list of all calls for this lead
// ─────────────────────────────────────────────────────────────────────────────

export default function CallHistoryPanel({ calls }: Props) {
  if (calls.length === 0) {
    return (
      <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
        <header className="border-b border-primary-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary-500" />
            <h2 className="text-sm font-semibold text-primary-900">Call History</h2>
          </div>
          <p className="mt-0.5 text-xs text-primary-500">
            Voice agent call records, summaries and transcripts appear here.
          </p>
        </header>
        <div className="px-5 py-8 text-center text-sm text-primary-400">
          No calls placed yet. Use the &quot;AI Call&quot; button to call this lead.
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
      <header className="border-b border-primary-200 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary-500" />
          <h2 className="text-sm font-semibold text-primary-900">Call History</h2>
          <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-600">
            {calls.length}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-primary-500">
          Every AI voice agent call, with summary and full transcript.
        </p>
      </header>

      <div className="space-y-3 p-4">
        {calls.map((call) => (
          <CallCard key={call.id} call={call} />
        ))}
      </div>
    </section>
  );
}
