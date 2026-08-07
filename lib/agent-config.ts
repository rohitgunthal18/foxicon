import 'server-only';

/**
 * FOXI TECH voice-agent configuration — Agent: Isha
 *
 * Three pieces, one per leg of a call:
 *   1. `buildSystemPrompt`    — the sales prompt, with this lead's context baked in.
 *   2. `formatInputVariables` — lead fields to Sarvam `agent_variables`.
 *   3. `parseOutputVariables` — what the agent learned, back out of the webhook.
 *
 * Target audience: dental clinic doctors/owners who do NOT have a business website.
 * Agent persona: Isha, female, calling from FOXI TECH marketing agency, Pune.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The lead fields the prompt reads. Matches the `select` in
 * `app/api/agent/outbound/route.ts` — every field beyond `name` is optional
 * because form leads and scraped Maps leads populate different columns.
 */
export interface AgentLead {
  id?: string | null;
  name: string;
  company?: string | null;
  phone?: string | null;
  city?: string | null;
  rating?: number | null;
  review_count?: number | null;
  category?: string | null;
  niche?: string | null;
  website?: string | null;
  pitch_angle?: string | null;
}

/** Languages the Sarvam app is provisioned for. */
export type AgentLanguage = 'Hindi' | 'English' | 'Marathi' | 'Tamil' | 'Telugu';

/**
 * Call outcome the agent sets before hanging up.
 *
 * `qualified` and `interested` promote the lead; `not_interested` rejects it —
 * see the disposition branch in `app/api/agent/webhook/route.ts`. Renaming any
 * of these three silently breaks that mapping.
 */
export type QualificationStatus =
  | 'qualified'
  | 'interested'
  | 'callback_later'
  | 'not_interested'
  | 'wrong_number'
  | 'no_decision_maker'
  | 'unclear';

/** Whether the business already has a website, as established on the call. */
export type HasWebsiteAnswer = 'yes' | 'no' | 'outdated' | 'unknown';

/** Budget bracket, bucketed to the three plans. */
export type BudgetRange =
  | 'under_5k'
  | '5k_10k'
  | '10k_20k'
  | 'above_20k'
  | 'unknown';

/** Variables handed to the agent at dial time. All values are strings — Sarvam
 *  interpolates them into the prompt, so numbers arrive pre-formatted. */
export interface AgentInputVariables extends Record<string, string> {
  lead_id: string;
  business_name: string;
  contact_name: string;
  city: string;
  category: string;
  rating: string;
  review_count: string;
  has_website_hint: string;
  website_url: string;
  pitch_angle: string;
  recommended_plan: string;
}

/** Raw shape of `final_agent_variables` on the webhook payload. */
export interface AgentOutputVariables {
  call_summary?: unknown;
  business_name?: unknown;
  owner_name?: unknown;
  qualification_status?: unknown;
  has_website?: unknown;
  budget_range?: unknown;
  callback_preference?: unknown;
  interest_reason?: unknown;
  objection?: unknown;
}

/** Normalised call result. `summary` and `disposition` are what the webhook
 *  writes to `agent_calls`; the rest is captured for the timeline. */
export interface ParsedAgentOutput {
  summary: string;
  disposition: QualificationStatus | null;
  businessName: string | null;
  ownerName: string | null;
  hasWebsite: HasWebsiteAnswer | null;
  budgetRange: BudgetRange | null;
  callbackPreference: string | null;
  interestReason: string | null;
  objection: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Company facts
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pricing plans. Keep in sync with `components/Pricing.tsx`.
 */
const PLANS = [
  {
    name: 'Single Page',
    price: '₹4,999',
    delivery: '3 days',
    pitch:
      'one page, mobile-friendly, click-to-call & WhatsApp buttons, Google Maps embed, enquiry form, 6 months support',
    bonuses: false,
  },
  {
    name: 'Static',
    price: '₹9,999',
    delivery: '7 days',
    pitch:
      'up to 5 pages, contact form, WhatsApp button, basic Google search setup, hosting, 1 year support',
    bonuses: true,
  },
  {
    name: 'Dynamic',
    price: '₹19,999',
    delivery: '10–12 days',
    pitch:
      'up to 10 pages, edit content yourself, 24/7 online appointment booking, accept payments by card/UPI, blog, customer dashboard, advanced Google ranking, 2 years priority support',
    bonuses: true,
  },
] as const;

/** Free with Static and Dynamic — never with Single Page. */
const BONUSES =
  'Google Business Profile setup (worth ₹4,000) + Instagram page setup with 2 reels and 5 posts ready to go (worth ₹3,000). ₹7,000 of value, free.';

/** Limited-time AI chatbot offer — exclusive angle for this campaign. */
const AI_CHATBOT_OFFER =
  'Free AI chatbot on your website (worth ₹10,000) — books appointments, answers patient questions, and works 24/7 even when your clinic is closed. LIMITED TIME offer, available only this month.';

const CREDENTIALS =
  'FOXI TECH is a web design and marketing agency in Pune. We have put 120+ clinics and businesses online. Rated 4.9 out of 5 on Google from 120+ reviews.';

const CONTACT = 'FOXI TECH, Pune. Phone: +91 72186 16190. Website: www.foxitech.in';

// ─────────────────────────────────────────────────────────────────────────────
// 1. System prompt
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The sales prompt with this lead's context baked in.
 *
 * Sent as `app_overrides.system_prompt` on every outbound call so the agent
 * always has the full context regardless of what the Sarvam dashboard holds.
 *
 * Strategy for dental clinic leads:
 * - Open with the clinic name — feels researched, not spam
 * - Hook: "saw your clinic on Google Maps, reviews look great, but no website"
 * - Urgency: patients check online before booking; AI changed everything
 * - Offer: website + social + FREE AI chatbot (₹10k value, limited time)
 * - Keep it SHORT — doctors are busy, get to the point fast
 */
export function buildSystemPrompt(lead: AgentLead): string {
  const clinicName = lead.company?.trim() || lead.name;
  const ownerName = lead.name?.trim();
  const city = lead.city?.trim();
  const rating = typeof lead.rating === 'number' ? lead.rating : null;
  const reviews = typeof lead.review_count === 'number' ? lead.review_count : null;
  const hasWebsite = !!lead.website?.trim();
  const plan = recommendPlan(lead);

  const presenceLine = buildPresenceLine(rating, reviews, clinicName);

  return `You are Isha, a friendly sales representative calling from FOXI TECH (a web design and software agency in Pune).

Objective: Contact ${clinicName} (located in ${city || 'Pune'}) to offer our web development plans. We noticed they have no website online.

# Context:
- Clinic: ${clinicName}
${ownerName && ownerName !== clinicName ? `- Owner name: ${ownerName}\n` : ''}${city ? `- City: ${city}\n` : ''}${presenceLine ? `- Google Maps: ${presenceLine}\n` : ''}- Website Status: ${hasWebsite ? `Has website (${lead.website})` : 'We could not find any website online for them.'}
- Recommended Plan: ${plan}

# Plans & Offer:
- Single Page Plan: ₹4,999 (live in 3 days)
- Static Plan (Recommended): ₹9,999 (live in 7 days). Includes free Google Maps setup (worth ₹4,000) and Instagram setup (worth ₹3,000)
- Dynamic Plan: ₹19,999 (live in 10-12 days). Includes 24/7 appointment booking and online payments
- Special Campaign: All plans started this month include a FREE AI chatbot (worth ₹10,000) that answers patient questions and books appointments 24/7!

# Call Outline & Guidelines:
- Start the call naturally with: "Hello! Am I speaking with the owner of ${clinicName}? I'm Isha calling from FOXI TECH, Pune. We came across your clinic profile on Google Maps — your reviews look great! But we noticed you don't have a website. Since patients check online before booking, we wanted to offer you a professional website with a free AI appointment booking chatbot. Do you have two minutes to talk?"
- If they confirm or show interest, ask: "Do you have any website currently, or are you looking to get one?"
- Pitch the Static Plan (₹9,999, live in 7 days) and emphasize the free AI chatbot worth ₹10,000 that works 24/7.
- Keep your replies extremely short and natural (1-2 sentences max). Do not lecture or list all plans.
- Speak in English, Hindi, or Marathi. Switch to whichever language the client answers in.
- If they want a callback, ask for their preferred time (e.g. tomorrow morning) and end politely.
- If not interested, say thank you and hang up. Do not pitch twice.

# Post-Call Variables to Set:
- call_summary: 2-4 sentences summarizing user needs and callback agreement.
- business_name: name of the clinic.
- owner_name: name of the person you spoke to.
- qualification_status: one of: qualified, interested, callback_later, not_interested, wrong_number, no_decision_maker, unclear.
- has_website: one of: yes, no, outdated, unknown.
- budget_range: one of: under_5k, 5k_10k, 10k_20k, above_20k, unknown.
- callback_preference: preferred time in their words, or "none given".`;
}

/** Build a natural Google presence sentence for the opening hook. */
function buildPresenceLine(
  rating: number | null,
  reviews: number | null,
  clinicName: string
): string | null {
  if (rating && reviews && reviews >= 5) {
    return `${rating.toFixed(1)} stars from ${reviews} reviews on Google Maps — "${clinicName}" has a solid reputation`;
  }
  if (rating && rating >= 4.0) {
    return `Listed on Google Maps with a ${rating.toFixed(1)} star rating`;
  }
  if (reviews === 0) {
    return 'Listed on Google Maps but no reviews yet';
  }
  if (reviews && reviews > 0) {
    return `${reviews} reviews on Google Maps`;
  }
  return null;
}

/**
 * Which plan to lead with.
 *
 * Dental clinics with a strong Google presence (reviews, high rating) are
 * ready for the full Dynamic plan — they have patients to convert. New or
 * small clinics start with Static.
 */
function recommendPlan(lead: AgentLead): string {
  const reviews = typeof lead.review_count === 'number' ? lead.review_count : 0;
  const rating = typeof lead.rating === 'number' ? lead.rating : 0;
  if (reviews >= 30 || (rating >= 4.3 && reviews >= 15)) return 'Dynamic (₹19,999)';
  if (reviews >= 10 || rating >= 4.0) return 'Static (₹9,999)';
  return 'Single Page (₹4,999) to start — easiest first yes';
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Input variables
// ─────────────────────────────────────────────────────────────────────────────

/** Sarvam interpolates these into the prompt, so every value is a string and
 *  every gap is filled with something the agent can read out loud. */
export function formatInputVariables(lead: AgentLead): AgentInputVariables {
  const business = lead.company?.trim() || lead.name;

  return {
    lead_id: lead.id ?? '',
    business_name: business,
    contact_name: lead.name?.trim() || business,
    city: lead.city?.trim() || 'not known',
    category: lead.category?.trim() || lead.niche?.trim() || 'dental clinic',
    rating: typeof lead.rating === 'number' ? String(lead.rating) : 'not known',
    review_count:
      typeof lead.review_count === 'number' ? String(lead.review_count) : 'not known',
    has_website_hint: lead.website?.trim() ? 'yes' : 'none found',
    website_url: lead.website?.trim() || '',
    pitch_angle: lead.pitch_angle?.trim() || '',
    recommended_plan: recommendPlan(lead),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Output variables
// ─────────────────────────────────────────────────────────────────────────────

const QUALIFICATION_VALUES: readonly QualificationStatus[] = [
  'qualified',
  'interested',
  'callback_later',
  'not_interested',
  'wrong_number',
  'no_decision_maker',
  'unclear',
];

const HAS_WEBSITE_VALUES: readonly HasWebsiteAnswer[] = [
  'yes',
  'no',
  'outdated',
  'unknown',
];

const BUDGET_VALUES: readonly BudgetRange[] = [
  'under_5k',
  '5k_10k',
  '10k_20k',
  'above_20k',
  'unknown',
];

/** Trimmed string, or null for anything empty or not a string. */
function str(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Match against a known set, case- and separator-insensitively.
 */
function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  const raw = str(value);
  if (!raw) return null;
  const key = raw.toLowerCase().replace(/[\s-]+/g, '_');
  return allowed.find((option) => option === key) ?? null;
}

/**
 * What the agent learned, out of `final_agent_variables`.
 *
 * Everything is defensive: these values are written by a model mid-conversation
 * and the webhook is the only chance to record them.
 */
export function parseOutputVariables(
  variables: AgentOutputVariables | Record<string, unknown>
): ParsedAgentOutput {
  const vars = (variables ?? {}) as AgentOutputVariables;

  const hasWebsiteRaw = str(vars.has_website)?.toLowerCase() ?? null;

  return {
    summary: str(vars.call_summary) ?? '',
    disposition: oneOf(vars.qualification_status, QUALIFICATION_VALUES),
    businessName: str(vars.business_name),
    ownerName: str(vars.owner_name),
    // The live agent sometimes answers "no_website" where the prompt asks for "no".
    hasWebsite:
      hasWebsiteRaw === 'no_website'
        ? 'no'
        : hasWebsiteRaw === 'has_website'
          ? 'yes'
          : oneOf(vars.has_website, HAS_WEBSITE_VALUES),
    budgetRange: oneOf(vars.budget_range, BUDGET_VALUES),
    callbackPreference: (() => {
      const raw = str(vars.callback_preference);
      if (!raw) return null;
      const key = raw.toLowerCase();
      return key === 'none given' || key === 'not discussed' || key === 'none'
        ? null
        : raw;
    })(),
    interestReason: str(vars.interest_reason),
    objection: (() => {
      const raw = str(vars.objection);
      if (!raw) return null;
      return raw.toLowerCase() === 'none' ? null : raw;
    })(),
  };
}
