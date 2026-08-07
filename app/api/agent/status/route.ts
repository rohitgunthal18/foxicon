import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { pollCallOutcome } from '@/lib/sarvam';
import { parseOutputVariables } from '@/lib/agent-config';
import { parseCallbackPreference } from '@/lib/date-parser';
import type { Json } from '@/lib/supabase/types';

const statusSchema = z.object({
  attempt_id: z.string(),
});

/**
 * GET /api/agent/status?attempt_id=xxx — poll live call status.
 *
 * When the call is still 'initiated' (webhook hasn't arrived — typically
 * because the app is running on localhost), this route proactively queries
 * Sarvam's Analytics API to see if the call has completed. If it has, it
 * processes the outcome exactly as the webhook would: updates agent_calls,
 * writes a note to lead_activities, moves the lead stage.
 *
 * This makes the system fully self-contained without requiring a public
 * webhook URL during development.
 *
 * Returns: { status, summary, duration_seconds, ended_at, language,
 *            transcript, agent_variables, disposition, meta }
 */
export async function GET(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const attemptId = searchParams.get('attempt_id');

  const parsed = statusSchema.safeParse({ attempt_id: attemptId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Missing or invalid attempt_id.' },
      { status: 422 }
    );
  }

  const { data: call, error } = await supabaseAdmin
    .from('agent_calls')
    .select(
      'call_status, summary, duration_seconds, ended_at, language_name, transcript, agent_variables, disposition, meta, lead_id, interaction_id'
    )
    .eq('attempt_id', parsed.data.attempt_id)
    .maybeSingle();

  if (error || !call) {
    return NextResponse.json({ error: 'Call not found.' }, { status: 404 });
  }

  /*
    If the call is still 'initiated', the webhook hasn't arrived yet.
    Proactively query Sarvam's Analytics API to check whether the call
    has actually completed on their side.
  */
  if (call.call_status === 'initiated') {
    try {
      const outcome = await pollCallOutcome(parsed.data.attempt_id);

      if (outcome) {
        // Call has completed — process it like the webhook would
        const agentVarsRecord = outcome.agentVariables as Record<string, unknown>;
        const parsedOutput = parseOutputVariables(agentVarsRecord);
        const {
          summary,
          disposition,
          businessName,
          ownerName,
          hasWebsite,
          budgetRange,
          callbackPreference,
          interestReason,
          objection,
        } = parsedOutput;

        // Build the structured note body (same logic as webhook)
        const noteBody = buildNoteBody({
          callStatus: outcome.status,
          durationSeconds: outcome.durationSeconds ?? 0,
          summary,
          disposition,
          businessName,
          ownerName,
          hasWebsite,
          budgetRange,
          callbackPreference,
          interestReason,
          objection,
        });

        // Update agent_calls row
        await supabaseAdmin
          .from('agent_calls')
          .update({
            call_status: outcome.status,
            interaction_id: outcome.interactionId,
            duration_seconds: outcome.durationSeconds,
            summary: summary || null,
            disposition: disposition || null,
            transcript: outcome.transcript as Json,
            agent_variables: agentVarsRecord as Json,
            meta: {
              ...(call.meta as Record<string, any> || {}),
              audio_url: outcome.audioUrl,
            },
            ended_at: new Date().toISOString(),
          })
          .eq('attempt_id', parsed.data.attempt_id);

        // Write note to lead timeline
        if (call.lead_id) {
          await supabaseAdmin.from('lead_activities').insert({
            lead_id: call.lead_id,
            author_id: null,
            kind: 'agent_call',
            body: noteBody,
            meta: {
              attempt_id: parsed.data.attempt_id,
              call_status: outcome.status,
              duration_seconds: outcome.durationSeconds,
              disposition,
              has_website: hasWebsite,
              budget_range: budgetRange,
              callback_preference: callbackPreference,
              interest_reason: interestReason,
              objection,
              business_name: businessName,
              owner_name: ownerName,
            },
          });

          // Move lead stage and set follow-up time based on conversation outcome
          let nextStatus: 'contacted' | 'qualified' | 'rejected' | null = null;
          if (outcome.status === 'connected') {
            if (disposition === 'qualified' || disposition === 'interested') {
              nextStatus = 'qualified';
            } else if (disposition === 'not_interested') {
              nextStatus = 'rejected';
            } else {
              nextStatus = 'contacted';
            }
          }

          const followUpDate = callbackPreference ? parseCallbackPreference(callbackPreference) : null;

          if (nextStatus || followUpDate) {
            const { data: current } = await supabaseAdmin
              .from('leads')
              .select('status')
              .eq('id', call.lead_id)
              .maybeSingle();

            const previousStatus = current?.status ?? null;

            if (previousStatus !== nextStatus || followUpDate) {
              const updatePayload: { status?: 'contacted' | 'qualified' | 'rejected'; next_follow_up_at?: string } = {};
              if (previousStatus !== nextStatus && nextStatus) {
                updatePayload.status = nextStatus;
              }
              if (followUpDate) {
                updatePayload.next_follow_up_at = followUpDate.toISOString();
              }

              await supabaseAdmin
                .from('leads')
                .update(updatePayload)
                .eq('id', call.lead_id);

              if (previousStatus !== nextStatus && nextStatus) {
                await supabaseAdmin.from('lead_activities').insert({
                  lead_id: call.lead_id,
                  author_id: null,
                  kind: 'status_change',
                  body: null,
                  meta: { from: previousStatus, to: nextStatus, source: 'agent' },
                });
              }

              if (followUpDate) {
                await supabaseAdmin.from('lead_activities').insert({
                  lead_id: call.lead_id,
                  author_id: null,
                  kind: 'field_update',
                  body: `Scheduled next follow-up for ${followUpDate.toLocaleString('en-IN')}`,
                  meta: { fields: ['next_follow_up_at'] },
                });
              }
            }
          }
        }

        // Return the fresh data
        return NextResponse.json({
          status: outcome.status,
          summary: summary || null,
          duration_seconds: outcome.durationSeconds,
          ended_at: new Date().toISOString(),
          language: call.language_name,
          transcript: outcome.transcript,
          agent_variables: agentVarsRecord,
          disposition: disposition || null,
          meta: {
            has_website: hasWebsite,
            budget_range: budgetRange,
            callback_preference: callbackPreference,
            interest_reason: interestReason,
            objection,
            audio_url: outcome.audioUrl,
          },
          interaction_id: outcome.interactionId,
        });
      }
    } catch (err) {
      // Analytics poll is best-effort — don't break the status check
      console.warn('[api/agent/status] analytics poll failed:', err);
    }
  }

  // Return whatever is in the DB (may still be 'initiated' if call is live)
  return NextResponse.json({
    status: call.call_status,
    summary: call.summary,
    duration_seconds: call.duration_seconds,
    ended_at: call.ended_at,
    language: call.language_name,
    transcript: call.transcript,
    agent_variables: call.agent_variables,
    disposition: call.disposition,
    meta: call.meta,
    interaction_id: call.interaction_id,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Note builder — duplicate of webhook's, kept local to avoid cross-importing
// ─────────────────────────────────────────────────────────────────────────────

const CALL_STATUS_LABEL: Record<string, string> = {
  connected: 'Call connected',
  no_answer: 'No answer',
  busy: 'Line was busy',
  failed: 'Call failed',
};

const DISPOSITION_LABEL: Record<string, string> = {
  qualified: '✅ Qualified — agreed to follow-up',
  interested: '🔥 Interested — open to a website',
  callback_later: '📅 Callback requested',
  not_interested: '❌ Not interested',
  wrong_number: '📵 Wrong number',
  no_decision_maker: '👤 Decision maker not available',
  unclear: '❓ Unclear outcome',
};

const HAS_WEBSITE_LABEL: Record<string, string> = {
  yes: 'Has a website',
  no: 'No website',
  outdated: 'Outdated website',
  unknown: 'Unknown',
};

const BUDGET_LABEL: Record<string, string> = {
  under_5k: 'Under ₹5,000',
  '5k_10k': '₹5,000 – ₹10,000',
  '10k_20k': '₹10,000 – ₹20,000',
  above_20k: 'Above ₹20,000',
  unknown: 'Not discussed',
};

function formatDur(seconds: number): string {
  const whole = Math.round(seconds);
  if (whole < 60) return `${whole}s`;
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

interface NoteParams {
  callStatus: string;
  durationSeconds: number;
  summary: string;
  disposition: string | null;
  businessName: string | null;
  ownerName: string | null;
  hasWebsite: string | null;
  budgetRange: string | null;
  callbackPreference: string | null;
  interestReason: string | null;
  objection: string | null;
}

function buildNoteBody(p: NoteParams): string {
  const lines: string[] = [];
  const statusLabel = CALL_STATUS_LABEL[p.callStatus] ?? p.callStatus;
  const durationStr = p.durationSeconds > 0 ? ` · ${formatDur(p.durationSeconds)}` : '';
  lines.push(`${statusLabel}${durationStr}`);

  if (p.callStatus !== 'connected') return lines.join('\n');

  if (p.disposition) {
    lines.push('');
    lines.push(DISPOSITION_LABEL[p.disposition] ?? p.disposition);
  }

  if (p.summary) {
    lines.push('');
    lines.push('📝 Call Summary');
    lines.push(p.summary);
  }

  const details: string[] = [];
  if (p.ownerName) details.push(`Spoke to: ${p.ownerName}`);
  if (p.hasWebsite) details.push(`Website: ${HAS_WEBSITE_LABEL[p.hasWebsite] ?? p.hasWebsite}`);
  if (p.budgetRange) details.push(`Budget: ${BUDGET_LABEL[p.budgetRange] ?? p.budgetRange}`);
  if (p.interestReason) details.push(`Interested because: ${p.interestReason}`);
  if (p.objection) details.push(`Objection: ${p.objection}`);
  if (p.callbackPreference) details.push(`Callback: ${p.callbackPreference}`);

  if (details.length > 0) {
    lines.push('');
    lines.push('📋 Details');
    lines.push(details.join('\n'));
  }

  return lines.join('\n');
}
