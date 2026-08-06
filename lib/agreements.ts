import 'server-only';

import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Signing-link tokens.
 *
 * The raw token exists in exactly two places: the URL we hand the admin to
 * send on, and the client's browser. The database only ever holds its sha256.
 * A dump of `agreements` therefore yields no working signing links.
 */

/** 32 bytes of entropy, URL-safe. Guessing one is not a realistic attack. */
export function generateSigningToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Constant-time compare of two hex hashes, so response timing cannot be used
 * to narrow down a token character by character.
 */
export function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Canonical hash of the agreement as the client sees it.
 *
 * Keys are sorted so the same agreement always hashes identically regardless
 * of property order. This is what makes "the terms were edited after signing"
 * a detectable event rather than a matter of trust.
 */
export function hashAgreementContent(content: unknown): string {
  return createHash('sha256').update(canonicalise(content)).digest('hex');
}

function canonicalise(value: unknown): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value) ?? 'null';
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalise).join(',')}]`;
  }

  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalise(v)}`);

  return `{${entries.join(',')}}`;
}

/** Default validity window for a signing link. */
export const SIGNING_LINK_DAYS = 14;

export function signingLinkExpiry(days = SIGNING_LINK_DAYS): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
