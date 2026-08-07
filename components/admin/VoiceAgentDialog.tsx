'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, Loader2, Phone, Star, X, Play } from 'lucide-react';

/** Languages the Sarvam app is provisioned for — mirrors `AgentLanguage`. */
const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu'] as const;
type Language = (typeof LANGUAGES)[number];

interface Props {
  leadId: string;
  leadName: string;
  leadCity: string | null;
  leadRating: number | null;
  leadReviewCount: number | null;
  onClose: () => void;
}

type Phase =
  | { name: 'setup' }
  | { name: 'dialling'; attemptId: string }
  | { name: 'live'; attemptId: string }
  | {
      name: 'done';
      outcome: string;
      summary: string | null;
      seconds: number | null;
      disposition: string | null;
      transcript: Array<{ role: string; content: string }> | null;
      agentVariables: Record<string, unknown> | null;
      meta: Record<string, unknown> | null;
      interactionId: string | null;
    }
  | { name: 'error'; message: string };

/*
  Polling cadence, and how long to keep asking before giving up.

  The webhook is the only thing that ends a call, so when it never arrives —
  a webhook URL Sarvam cannot reach, a tunnel that closed, a dropped callback —
  there is nothing to poll for. Without a deadline the dialog spun forever on
  its spinner and the admin had no way to tell a long call from a broken one.
  Ten minutes is well past any real sales call.
*/
const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 10 * 60 * 1000;

/** Sarvam's call status -> what to show while or after the call. */
const OUTCOME_LABEL: Record<string, string> = {
  connected: 'Call finished',
  no_answer: 'No answer',
  busy: 'Line was busy',
  failed: 'Call failed',
};

export default function VoiceAgentDialog({
  leadId,
  leadName,
  leadCity,
  leadRating,
  leadReviewCount,
  onClose,
}: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('Hindi');
  const [phase, setPhase] = useState<Phase>({ name: 'setup' });
  const [liveSeconds, setLiveSeconds] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (phase.name !== 'live') {
      setLiveSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setLiveSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase.name]);

  function formatLiveTime(totalSecs: number): string {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Escape closes, and focus starts on the close button so the dialog is
  // reachable without a mouse. Not a full focus trap — this is one form.
  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  /*
    Poll while a call is in flight.

    The webhook is what actually writes the outcome, and it arrives whenever the
    call ends — so the browser has to ask. Every `POLL_INTERVAL_MS` until the row
    stops saying `initiated`, or until `POLL_TIMEOUT_MS` says the webhook is not
    coming. `cancelled` guards against a state update after the dialog is closed
    mid-call.
  */
  useEffect(() => {
    if (phase.name !== 'dialling' && phase.name !== 'live') return;
    const attemptId = phase.attemptId;
    // No id yet: the POST is still in flight, and `?attempt_id=` would only 422.
    if (!attemptId) return;

    let cancelled = false;
    let elapsed = 0;

    const timer = setInterval(async () => {
      elapsed += POLL_INTERVAL_MS;

      if (elapsed >= POLL_TIMEOUT_MS) {
        clearInterval(timer);
        if (!cancelled) {
          setPhase({
            name: 'error',
            message:
              'No outcome came back within ten minutes. The call may still have happened — check the lead timeline. If this repeats, Sarvam probably cannot reach the webhook URL.',
          });
        }
        return;
      }

      try {
        const response = await fetch(
          `/api/agent/status?attempt_id=${encodeURIComponent(attemptId)}`,
          { cache: 'no-store' }
        );
        if (cancelled) return;
        if (!response.ok) {
          // Bounded by the deadline above, so retrying is safe.
          console.warn(
            `[voice agent] status poll returned ${response.status} for ${attemptId}`
          );
          return;
        }
        const data = await response.json();

        if (data.status === 'initiated') return;

        if (cancelled) return;
        setPhase({
          name: 'done',
          outcome: OUTCOME_LABEL[data.status] ?? data.status,
          summary: data.summary ?? null,
          seconds: data.duration_seconds ?? null,
          disposition: data.disposition ?? null,
          transcript: Array.isArray(data.transcript) ? data.transcript : null,
          agentVariables: data.agent_variables ?? null,
          meta: data.meta ?? null,
          interactionId: data.interaction_id ?? null,
        });
        // The call wrote a timeline entry and may have moved the stage.
        router.refresh();
      } catch {
        // A dropped poll is not a failed call — keep waiting until the deadline.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [phase, router]);

  async function startCall() {
    setPhase({ name: 'dialling', attemptId: '' });
    try {
      const response = await fetch('/api/agent/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_id: leadId, language }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPhase({
          name: 'error',
          message: data.error ?? 'Could not start the call.',
        });
        return;
      }

      setPhase({ name: 'live', attemptId: data.attempt_id });
      router.refresh();
    } catch {
      setPhase({ name: 'error', message: 'Could not reach the server.' });
    }
  }

  const isBusy = phase.name === 'dialling' || phase.name === 'live';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-primary-950/50"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voice-agent-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-primary-200 bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-primary-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <Bot aria-hidden className="h-4 w-4 text-primary-700" />
            </span>
            <div className="min-w-0">
              <h2
                id="voice-agent-title"
                className="text-sm font-semibold text-primary-900"
              >
                Voice agent call
              </h2>
              <p className="mt-0.5 truncate text-xs text-primary-500">
                {leadName}
                {leadCity ? ` · ${leadCity}` : ''}
              </p>
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-primary-400 transition hover:text-primary-900"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </header>

        <div className="px-5 py-4">
          {/* What the agent already knows */}
          <div className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary-600">
              Isha will
            </p>
            <ul className="mt-1.5 space-y-0.5 text-xs text-primary-700">
              <li>Open with the clinic name — {leadName}</li>
              {leadCity && <li>Mention their location — {leadCity}</li>}
              {leadRating !== null && (
                <li className="flex items-center gap-1">
                  Use their Google rating —
                  <Star aria-hidden className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {leadRating.toFixed(1)}
                  {leadReviewCount !== null && ` (${leadReviewCount} reviews)`}
                </li>
              )}
              <li>Hook: &quot;No website found for your clinic&quot;</li>
              <li>Pitch: website + social media + free AI chatbot (₹10k offer)</li>
              <li>Save full notes and transcript automatically</li>
            </ul>
          </div>

          {phase.name === 'setup' && (
            <>
              <div className="mt-4">
                <label
                  htmlFor="agent-language"
                  className="block text-xs font-medium text-primary-700"
                >
                  Language to open in
                </label>
                <select
                  id="agent-language"
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Language)}
                  className="mt-1 w-full rounded-lg border border-primary-200 bg-white px-3 py-2 text-sm text-primary-900 outline-none transition focus:border-primary-950"
                >
                  {LANGUAGES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-primary-500">
                  The agent switches to whatever language the customer replies in.
                </p>
              </div>

              <button
                type="button"
                onClick={startCall}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-950 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
              >
                <Phone aria-hidden className="h-4 w-4" />
                Start call
              </button>
            </>
          )}

          {isBusy && (
            <div aria-live="polite" className="mt-4 text-center">
              {phase.name === 'dialling' ? (
                <Loader2
                  aria-hidden
                  className="mx-auto h-5 w-5 animate-spin text-primary-500"
                />
              ) : (
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500"></span>
                  </span>
                </div>
              )}
              <p className="mt-2 text-sm font-medium text-primary-900">
                {phase.name === 'dialling'
                  ? 'Starting the call…'
                  : `Call in progress · ${formatLiveTime(liveSeconds)}`}
              </p>
              <p className="mt-1 text-xs text-primary-500">
                The summary appears here when the call ends, and in this lead&apos;s
                history either way. You can close this — the call keeps going.
              </p>
            </div>
          )}

          {phase.name === 'done' && (
            <div aria-live="polite" className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-primary-900">
                  {phase.outcome}
                  {phase.seconds ? ` · ${Math.round(phase.seconds)}s` : ''}
                </p>
                {phase.disposition && (
                  <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    phase.disposition === 'qualified' || phase.disposition === 'interested'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      : phase.disposition === 'callback_later'
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : phase.disposition === 'not_interested'
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                  }`}>
                    {phase.disposition.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              {phase.summary ? (
                <div className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2.5">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-primary-500">📝 Summary</p>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-primary-800">
                    {phase.summary}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-primary-500">
                  No summary — the agent did not get to speak to anyone.
                </p>
              )}

              {/* Transcript preview */}
              {phase.transcript && phase.transcript.filter(t => t.role !== 'system').length > 0 && (
                <div className="rounded-lg border border-primary-200">
                  <p className="border-b border-primary-100 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-primary-500">
                    Transcript ({phase.transcript.filter(t => t.role !== 'system').length} turns)
                  </p>
                  <div className="max-h-40 overflow-y-auto">
                    {phase.transcript.filter(t => t.role !== 'system').slice(0, 6).map((entry, i) => (
                      <div key={i} className={`px-3 py-2 text-xs ${ entry.role === 'agent' ? 'bg-blue-50/50' : 'bg-white' }`}>
                        <span className="font-medium text-primary-500">
                          {entry.role === 'agent' ? '🤖 Isha' : '🧑‍⚕️ Customer'}:
                        </span>{' '}
                        <span className="text-primary-800">{entry.content}</span>
                      </div>
                    ))}
                    {phase.transcript.filter(t => t.role !== 'system').length > 6 && (
                      <p className="px-3 py-1.5 text-[10px] text-primary-400">
                        + {phase.transcript.filter(t => t.role !== 'system').length - 6} more turns — see Call History on this lead
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Audio Recording */}
              {phase.interactionId && (
                <div className="mt-3 rounded-lg border border-primary-200 bg-primary-50/50 p-2.5">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary-500">
                    🔊 Call Recording
                  </p>
                  <audio
                    controls
                    src={`/api/agent/audio?interaction_id=${encodeURIComponent(phase.interactionId)}`}
                    className="w-full h-8 outline-none"
                    preload="none"
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-lg border border-primary-200 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
              >
                Close
              </button>
            </div>
          )}

          {phase.name === 'error' && (
            <div aria-live="polite" className="mt-4">
              <p className="rounded-lg border-l-2 border-red-500 bg-red-50 px-3 py-2 text-xs text-red-700">
                {phase.message}
              </p>
              <button
                type="button"
                onClick={() => setPhase({ name: 'setup' })}
                className="mt-3 w-full rounded-lg border border-primary-200 py-2.5 text-sm font-medium text-primary-700 transition hover:bg-primary-50"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
