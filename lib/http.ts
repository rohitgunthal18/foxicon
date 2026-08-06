import 'server-only';

import { createHash } from 'node:crypto';

/** Get the visitor's real IP behind a reverse proxy. */
export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim();
  return req.headers.get('x-real-ip')?.trim() || undefined;
}

/**
 * Hash an IP so we can spot repeat abusers without storing raw addresses.
 * The salt lives only in server env; the hash is not reversible.
 */
export function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  const salt = process.env.IP_HASH_SALT ?? '';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex');
}
