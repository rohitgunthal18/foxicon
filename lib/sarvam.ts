import 'server-only';

import { z } from 'zod';

import { getSarvamCredentials } from './settings';
import { toE164 } from './phone';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const SARVAM_BASE_URL = 'https://apps.sarvam.ai';

/** `app_version` is an integer in Sarvam's schema, not the string `'1'`. */
const SARVAM_APP_VERSION = 1;

/**
 * How long a "this app does not declare that variable" finding is trusted.
 *
 * Long enough that a burst of calls costs one rejected request rather than one
 * each, short enough that declaring the variables in the Sarvam dashboard takes
 * effect on its own. Without the expiry, the full set would not be retried
 * until the server restarted — on a serverless deploy, not at all.
 */
const UNKNOWN_VARIABLE_TTL_MS = 10 * 60 * 1000;

/**
 * Caller IDs that are obviously stand-ins rather than rented numbers.
 *
 * `+919999999999` is the one this repo shipped in `.env.local.example`, and it
 * reached a live call attempt. The others are the usual filler.
 */
const PLACEHOLDER_AGENT_PHONES = new Set([
  '+919999999999',
  '+910000000000',
  '+911234567890',
  '9999999999',
  '1234567890',
]);

/** Human labels for the config error, so a failure names the missing field. */
const CREDENTIAL_LABELS = {
  apiKey: 'API key',
  orgId: 'organisation ID',
  workspaceId: 'workspace ID',
  appId: 'agent app ID',
  connectionId: 'connection ID',
  agentPhone: 'agent phone number',
} as const;

/**
 * Resolve the six credentials, per call rather than per process.
 *
 * These were read from `process.env` at module scope, which meant a credential
 * saved in Settings → Sarvam had no effect until the server restarted — and on
 * a serverless deploy, no effect at all. Reading them here is what lets an
 * admin move the back office onto a different Sarvam account from the browser.
 */
async function resolveConfig() {
  const credentials = await getSarvamCredentials();

  const missing = (
    Object.keys(CREDENTIAL_LABELS) as (keyof typeof CREDENTIAL_LABELS)[]
  ).filter((field) => !credentials[field]);

  if (missing.length > 0) {
    throw new SarvamConfigError(
      `Sarvam is not configured: no ${missing
        .map((field) => CREDENTIAL_LABELS[field])
        .join(', no ')}. Set these in Settings → Sarvam voice agent.`
    );
  }

  const resolved = credentials as { [K in keyof typeof CREDENTIAL_LABELS]: string };

  /*
    The caller ID has to be a number Sarvam has actually rented to this account.
    A present-but-placeholder value passes the `missing` check above and then
    fails at the far end with a 404 that reads

      Agent phone number '+919999999999' not found under org '…', workspace '…'

    which is a long way to travel to learn that a field was never filled in.
    Caught here instead, and as a config error so it surfaces to the admin
    verbatim rather than as "could not initiate the call".
  */
  if (PLACEHOLDER_AGENT_PHONES.has(resolved.agentPhone.replace(/[\s()-]/g, ''))) {
    throw new SarvamConfigError(
      `The agent phone number is still the placeholder ${resolved.agentPhone}. ` +
        'Put the number Sarvam rented to your account in Settings → Sarvam ' +
        'voice agent, in +91 form.'
    );
  }

  /*
    Sarvam matches the caller ID against its own records as an exact string, so
    the same trunk-zero shape that broke the lead number breaks this one too —
    an admin who pastes `094217 96468` here gets a 404 rather than a 422. The
    settings route stores it normalised; this covers a value that arrived from
    the environment variable, which nothing validates.
  */
  const agentPhone = toE164(resolved.agentPhone);
  if (!agentPhone) {
    throw new SarvamConfigError(
      `The agent phone number "${resolved.agentPhone}" is not a valid Indian ` +
        'mobile number. Set it in +91 form in Settings → Sarvam voice agent.'
    );
  }

  return { ...resolved, agentPhone };
}

// ─────────────────────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────────────────────

const outboundCallParamsSchema = z.object({
  /*
    E.164 or nothing. Sarvam rejects anything else with a 422 whose message
    names the field, and the scraped numbers arrive as `094217 96468` — trunk
    zero and an embedded space — so a presence-only check here just moved the
    failure to their side of the wire. Callers run `toE164` from `lib/phone.ts`
    first; this makes that a requirement rather than a convention.
  */
  leadPhone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{7,14}$/, 'Lead phone number must be in E.164 format'),
  language: z.string().trim().default('English'),
  agentVariables: z.record(z.string(), z.unknown()).default({}),
  webhookUrl: z.string().url('Invalid webhook URL'),
  leadId: z.string().optional(),
  /*
    Full sales prompt built by `buildSystemPrompt` in `lib/agent-config.ts`,
    with this lead's business context already baked in. Sent as
    `app_overrides.system_prompt` so the agent gets the complete FOXI TECH
    script — including business name, city, category, website, recommended
    plan, pricing, and call rules — on every dial, regardless of what the
    Sarvam dashboard holds.
  */
  systemPrompt: z.string().optional(),
});

const outboundResponseSchema = z.object({
  attempt_id: z.string(),
});

const webhookPayloadSchema = z.object({
  attempt_id: z.string(),
  status: z.string(),
  /*
    Sarvam has sent this as both a number and a numeric string. Accepting only
    one shape 422s the entire payload — and the payload is the only record of
    how the call went, so the outcome would be lost over a formatting detail.
    Coerced here so the handler receives `number | undefined` and nothing
    downstream has to re-guess.
  */
  duration: z
    .union([z.number(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      const seconds = typeof value === 'number' ? value : parseFloat(value);
      return Number.isFinite(seconds) ? seconds : undefined;
    }),
  interaction_id: z.string().optional(),
  final_agent_variables: z.record(z.string(), z.unknown()).optional(),
  interaction_transcript: z.array(z.unknown()).optional(),
  webhook_config: z
    .object({
      metadata: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

const transcriptEntrySchema = z.object({
  role: z.enum(['agent', 'user', 'system']),
  content: z.string(),
  timestamp: z.string().optional(),
});

const interactionTranscriptSchema = z.object({
  transcript: z.array(transcriptEntrySchema),
});

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type OutboundCallParams = z.infer<typeof outboundCallParamsSchema>;
export type OutboundCallResponse = z.infer<typeof outboundResponseSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type TranscriptEntry = z.infer<typeof transcriptEntrySchema>;
export type InteractionTranscript = z.infer<typeof interactionTranscriptSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Error classes
// ─────────────────────────────────────────────────────────────────────────────

export class SarvamApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'SarvamApiError';
  }
}

export class SarvamConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SarvamConfigError';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Undeclared agent variables
// ─────────────────────────────────────────────────────────────────────────────

/*
  Sarvam accepts only the variables an app declares in its Variables tab, and
  rejects the whole call otherwise:

    Agent variables '{'category', 'contact_name', …}' not found in agent
    variables of app 'Conversatio-…'

  There is no API to declare a variable and no prompt field on `app_overrides`
  to carry the context another way, so the only thing code can do is send the
  subset the app knows and name the rest for the admin to add. Parsed from the
  message because the 422 body is the only place Sarvam reports the set.
*/
const UNKNOWN_VARIABLE_MARKER = 'not found in agent variables of app';

/** Names Sarvam rejected, per app ID, with the time the finding was made. */
const unknownVariablesByApp = new Map<
  string,
  { names: Set<string>; recordedAt: number }
>();

/**
 * Pull the rejected variable names out of a Sarvam 422 body.
 *
 * Returns an empty array for any other failure, so the caller can use a
 * non-empty result as the signal that this specific rejection happened.
 */
export function parseUnknownAgentVariables(body: unknown): string[] {
  const text =
    typeof body === 'string'
      ? body
      : body === undefined || body === null
        ? ''
        : JSON.stringify(body);

  if (!text.includes(UNKNOWN_VARIABLE_MARKER)) return [];

  /*
    Sarvam prints a Python set repr — `'{'a', 'b'}'`. Taking the quoted words
    from the text before the marker avoids depending on the brace positions,
    which the doubled quoting makes ambiguous.
  */
  const head = text.slice(0, text.indexOf(UNKNOWN_VARIABLE_MARKER));
  const names = new Set<string>();

  for (const match of head.matchAll(/'([A-Za-z_][A-Za-z0-9_]*)'/g)) {
    names.add(match[1]);
  }

  return [...names];
}

function rememberUnknownVariables(appId: string, names: string[]) {
  if (names.length === 0) return;

  const existing = unknownVariablesByApp.get(appId);
  const merged = new Set(existing?.names ?? []);
  for (const name of names) merged.add(name);

  unknownVariablesByApp.set(appId, { names: merged, recordedAt: nowMs() });
}

function knownUnknownVariables(appId: string): Set<string> {
  const entry = unknownVariablesByApp.get(appId);
  if (!entry) return new Set();

  if (nowMs() - entry.recordedAt > UNKNOWN_VARIABLE_TTL_MS) {
    unknownVariablesByApp.delete(appId);
    return new Set();
  }

  return entry.names;
}

function nowMs(): number {
  return Date.now();
}

function omitKeys(
  variables: Record<string, unknown>,
  drop: Set<string>
): Record<string, unknown> {
  if (drop.size === 0) return variables;

  return Object.fromEntries(
    Object.entries(variables).filter(([key]) => !drop.has(key))
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// API client
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create an outbound call using the Sarvam Voice Agents API.
 *
 * @param params - Call parameters including phone numbers, language, and webhook config
 * @returns The attempt ID for tracking this call
 * @throws {SarvamConfigError} If API key or required config is missing
 * @throws {SarvamApiError} If the API request fails
 */
export async function createOutboundCall(
  params: OutboundCallParams
): Promise<string> {
  const config = await resolveConfig();

  const validated = outboundCallParamsSchema.parse(params);

  const url = `${SARVAM_BASE_URL}/api/outbounds/v1/orgs/${config.orgId}/workspaces/${config.workspaceId}/outbounds`;

  const buildBody = (agentVariables: Record<string, unknown>) => ({
    app_config: {
      app_id: config.appId,
      app_version: SARVAM_APP_VERSION,
      connection_config: {
        connection_id: config.connectionId,
        agent_phone_number: config.agentPhone,
      },
      agent_variables: agentVariables,
      app_overrides: {
        initial_language_name: validated.language,
        /*
          Override the dashboard prompt with the full lead-specific sales
          script on every outbound dial. This ensures the agent always has:
          - FOXI TECH credentials and pricing
          - This lead's business name, city, category, website, ratings
          - The recommended plan and call rules
          If `systemPrompt` is not supplied the field is omitted and Sarvam
          falls back to whatever the dashboard app has configured.
        */
        ...(validated.systemPrompt ? { system_prompt: validated.systemPrompt } : {}),
      },
    },
    user_config: {
      user_phone_number: validated.leadPhone,
    },
    webhook_config: {
      url: validated.webhookUrl,
      metadata: validated.leadId ? { lead_id: validated.leadId } : {},
    },
  });

  const send = async (agentVariables: Record<string, unknown>) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': config.apiKey,
      },
      body: JSON.stringify(buildBody(agentVariables)),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new SarvamApiError(
        `Sarvam API request failed: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    return outboundResponseSchema.parse(await response.json());
  };

  try {
    /*
      Drop anything a previous call already proved this app does not declare.
      The rejection is all-or-nothing — one unknown name loses the whole call —
      so carrying a stale key costs a connected conversation, while dropping a
      known-good one only costs the agent some context it can ask for.
    */
    const alreadyRejected = knownUnknownVariables(config.appId);
    const firstAttempt = omitKeys(validated.agentVariables, alreadyRejected);

    try {
      return (await send(firstAttempt)).attempt_id;
    } catch (error) {
      if (!(error instanceof SarvamApiError) || error.status !== 422) throw error;

      const unknown = parseUnknownAgentVariables(error.response);
      if (unknown.length === 0) throw error;

      rememberUnknownVariables(config.appId, unknown);

      const retryVariables = omitKeys(
        firstAttempt,
        knownUnknownVariables(config.appId)
      );

      /*
        Nothing left to remove means the 422 named a variable we were not
        sending, so a retry would send the identical body. Surface the original.
      */
      if (
        Object.keys(retryVariables).length === Object.keys(firstAttempt).length
      ) {
        throw error;
      }

      console.warn(
        `[sarvam] app ${config.appId} does not declare ${unknown
          .map((name) => `"${name}"`)
          .join(', ')} — calling without them. Add them as input variables in ` +
          'the Sarvam dashboard (Agent → Variables) so the agent gets that context.'
      );

      return (await send(retryVariables)).attempt_id;
    }
  } catch (error) {
    if (error instanceof SarvamApiError || error instanceof z.ZodError) {
      throw error;
    }

    throw new SarvamApiError(
      `Failed to create outbound call: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Parse and validate a webhook payload received from Sarvam.
 *
 * @param body - Raw webhook payload body
 * @returns Parse result with `success`, `data`, and `error` properties
 */
export function parseWebhookPayload(body: unknown) {
  return webhookPayloadSchema.safeParse(body);
}

/**
 * Fetch the full interaction transcript for a completed call.
 *
 * @param interactionId - The interaction ID from the webhook payload
 * @returns The full conversation transcript
 * @throws {SarvamConfigError} If API key is missing
 * @throws {SarvamApiError} If the API request fails
 */
export async function getInteractionTranscript(
  interactionId: string
): Promise<TranscriptEntry[]> {
  const config = await resolveConfig();

  if (!interactionId || !interactionId.trim()) {
    throw new SarvamApiError('Interaction ID is required');
  }

  const url = `${SARVAM_BASE_URL}/api/interactions/v1/orgs/${config.orgId}/workspaces/${config.workspaceId}/interactions/${interactionId}/transcript`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': config.apiKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => 'Unknown error');
      throw new SarvamApiError(
        `Failed to fetch transcript: ${response.statusText}`,
        response.status,
        errorBody
      );
    }

    const data = await response.json();
    const parsed = interactionTranscriptSchema.parse(data);

    return parsed.transcript;
  } catch (error) {
    if (error instanceof SarvamApiError || error instanceof z.ZodError) {
      throw error;
    }

    throw new SarvamApiError(
      `Failed to get interaction transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics API — poll call outcome directly (webhook-free fallback)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What we know about a call after querying the Analytics API.
 * `null` means the attempt wasn't found or the call isn't finished yet.
 */
export interface CallOutcome {
  attemptId: string;
  interactionId: string | null;
  status: 'connected' | 'no_answer' | 'busy' | 'failed';
  durationSeconds: number | null;
  agentVariables: Record<string, unknown>;
  transcript: TranscriptEntry[];
  audioUrl: string | null;
}

const ANALYTICS_STATUS_MAP: Record<string, CallOutcome['status']> = {
  connected: 'connected',
  no_answer: 'no_answer',
  busy: 'busy',
  failed: 'failed',
  no_answer_hangup: 'no_answer',
  not_reachable: 'no_answer',
  call_dropped: 'failed',
  rejected: 'busy',
};

/**
 * Poll Sarvam's Analytics API for the outcome of a specific call attempt.
 *
 * Used as the primary mechanism to resolve call outcomes when running on
 * localhost (where Sarvam cannot POST to the webhook). Queries the last
 * 24 hours of attempts and matches by attempt_id.
 *
 * Returns null when:
 * - The attempt_id is not yet visible in Analytics (call still in progress)
 * - The call is still 'initiated'
 */
export async function pollCallOutcome(
  attemptId: string
): Promise<CallOutcome | null> {
  const config = await resolveConfig();

  // Query the last 24 hours — cast wide enough to always catch today's calls
  const endDate = new Date();
  const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    start_datetime: startDate.toISOString().replace(/\.\d{3}Z$/, ''),
    end_datetime: endDate.toISOString().replace(/\.\d{3}Z$/, ''),
    page_size: '100',
  });

  const url =
    `${SARVAM_BASE_URL}/api/analytics/v1/${config.orgId}/${config.workspaceId}/${config.appId}/attempts?${params}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'X-API-Key': config.apiKey },
    cache: 'no-store',
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new SarvamApiError(
      `Analytics API error: ${response.statusText}`,
      response.status,
      body
    );
  }

  const data = (await response.json()) as {
    items?: Array<{
      attempt_id?: string;
      interaction_id?: string;
      connectivity_status?: string;
      duration_in_seconds?: number;
      agent_variables?: Record<string, unknown>;
      audio_url?: string;
    }>;
  };

  const attempts = data.items ?? [];

  // Find our specific attempt
  const match = attempts.find((a) => a.attempt_id === attemptId);
  if (!match) return null;

  const rawStatus = match.connectivity_status ?? 'failed';

  // Not finished yet
  if (rawStatus === 'initiated' || rawStatus === 'dialing') return null;

  const mappedStatus = ANALYTICS_STATUS_MAP[rawStatus] ?? 'failed';

  // Fetch transcript if we have an interaction_id
  let transcript: TranscriptEntry[] = [];
  if (match.interaction_id) {
    try {
      transcript = await getInteractionTranscript(match.interaction_id);
    } catch {
      // transcript is best-effort — don't fail the whole sync
    }
  }

  return {
    attemptId,
    interactionId: match.interaction_id ?? null,
    status: mappedStatus,
    durationSeconds:
      typeof match.duration_in_seconds === 'number' ? match.duration_in_seconds : null,
    agentVariables: match.agent_variables ?? {},
    transcript,
    audioUrl: match.audio_url ?? null,
  };
}
