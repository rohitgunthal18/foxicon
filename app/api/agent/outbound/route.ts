import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentAdmin } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  createOutboundCall,
  parseUnknownAgentVariables,
  SarvamApiError,
  SarvamConfigError,
} from '@/lib/sarvam';
import { buildSystemPrompt, formatInputVariables } from '@/lib/agent-config';
import { toE164 } from '@/lib/phone';

const outboundSchema = z.object({
  lead_id: z.string().uuid(),
  language: z.enum(['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu']),
});

/**
 * POST /api/agent/outbound — initiate a voice agent call.
 *
 * Reads the lead, builds the sales prompt with lead context, calls Sarvam,
 * writes an `agent_calls` row with status 'initiated', and logs to timeline.
 */
export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const parsed = outboundSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid data.' },
      { status: 422 }
    );
  }

  const { lead_id, language } = parsed.data;

  // Fetch lead with all fields needed for the sales prompt
  const { data: lead, error: readError } = await supabaseAdmin
    .from('leads')
    .select('id, name, company, phone, city, rating, review_count, category, niche, website')
    .eq('id', lead_id)
    .maybeSingle();

  if (readError || !lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  if (!lead.phone) {
    return NextResponse.json(
      { error: 'This lead has no phone number.' },
      { status: 422 }
    );
  }

  const e164Phone = toE164(lead.phone);
  if (!e164Phone) {
    return NextResponse.json(
      {
        error: `Cannot normalise phone number "${lead.phone}" to E.164 format. Check that it is a valid Indian mobile number.`,
      },
      { status: 422 }
    );
  }

  // Build the webhook URL — must be publicly accessible for Sarvam to POST back
  // Use NEXT_PUBLIC_SITE_URL in production or ngrok URL during development
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const webhookUrl = `${baseUrl}/api/agent/webhook`;

  try {
    const agentVariables = formatInputVariables(lead);
    /*
      Build the full lead-specific sales prompt and send it as
      `app_overrides.system_prompt` on this call. This bakes the business
      name, city, category, website, ratings, recommended plan, FOXI TECH
      credentials, pricing, and call rules into the agent for this dial —
      so the agent has all context regardless of what the Sarvam dashboard
      currently holds.
    */
    const systemPrompt = buildSystemPrompt(lead);
    const attemptId = await createOutboundCall({
      // Sarvam only accepts E.164 — "094217 96468" would 422.
      leadPhone: e164Phone,
      language,
      agentVariables,
      webhookUrl,
      leadId: lead.id,
    });

    /*
      Write the agent_calls row with status 'initiated'.

      Checked, unlike the timeline write below, because this row is the call:
      the webhook updates it by `attempt_id` and the dialog polls it for the
      outcome. Losing it silently — the usual cause being the `agent_calls`
      migration not yet applied — leaves the phone ringing while the browser
      waits on a record that will never exist.
    */
    const { error: callInsertError } = await supabaseAdmin
      .from('agent_calls')
      .insert({
        lead_id: lead.id,
        attempt_id: attemptId,
        mode: 'auto',
        call_status: 'initiated',
        language_name: language,
        started_at: new Date().toISOString(),
      });

    if (callInsertError) {
      console.error('[api/agent/outbound] agent_calls insert failed', callInsertError);
      return NextResponse.json(
        {
          error:
            'The call was placed but could not be recorded, so its outcome will not appear here. Check that the agent_calls migration has been applied.',
          attempt_id: attemptId,
        },
        { status: 500 }
      );
    }

    // Log to timeline. Best-effort: the call is already recorded above.
    const { error: activityError } = await supabaseAdmin
      .from('lead_activities')
      .insert({
        lead_id: lead.id,
        author_id: admin.id,
        kind: 'agent_call',
        body: `Voice agent calling (${language})…`,
        meta: { attempt_id: attemptId, call_status: 'initiated' },
      });

    if (activityError) {
      console.error('[api/agent/outbound] timeline insert failed', activityError);
    }

    return NextResponse.json({ ok: true, attempt_id: attemptId });
  } catch (error) {
    console.error('[api/agent/outbound POST]', error);

    /*
      A config error is the admin's to fix and names the missing field, so pass
      it through. Everything else is Sarvam's side or ours and stays generic —
      an API error body can carry the key back to the browser.
    */
    if (error instanceof SarvamConfigError) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    /*
      One Sarvam failure is worth translating rather than swallowing: a 404 on
      the agent phone number means the caller ID we sent is not one this account
      rents. That is a settings problem the admin can fix in a minute, and
      "Could not initiate the call." sends them looking at the lead instead.

      Matched on the response body because Sarvam returns a bare 404 for a
      handful of causes; only this one names the field. The body is Sarvam's
      prose, not ours, so it is inspected rather than forwarded — an API error
      body can carry the key back to the browser.
    */
    if (
      error instanceof SarvamApiError &&
      error.status === 404 &&
      typeof error.response === 'string' &&
      error.response.includes('Agent phone number')
    ) {
      return NextResponse.json(
        {
          error:
            'Sarvam does not recognise the agent phone number this back office ' +
            'is configured with. Check the number under Settings → Sarvam voice ' +
            'agent against the one rented on your Sarvam account.',
        },
        { status: 503 }
      );
    }

    /*
      The other translatable failure: the app does not declare the variables we
      send. `createOutboundCall` already retries without them, so reaching here
      means even the reduced set was rejected — naming them beats a generic 500,
      since the fix is a few minutes in the Sarvam dashboard.
    */
    if (error instanceof SarvamApiError && error.status === 422) {
      const unknown = parseUnknownAgentVariables(error.response);

      if (unknown.length > 0) {
        return NextResponse.json(
          {
            error:
              `The Sarvam agent app does not have ${unknown
                .map((name) => `"${name}"`)
                .join(', ')} declared as input variables, so it refused the ` +
              'call. Add them under Agent → Variables in the Sarvam dashboard, ' +
              'using these exact names.',
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Could not initiate the call.' },
      { status: 500 }
    );
  }
}
