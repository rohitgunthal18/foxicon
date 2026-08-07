/**
 * Phone-number normalisation for Indian numbers as stored in `leads.phone`.
 *
 * The scraped data and the import files keep numbers in whatever shape Google
 * Maps and the forms delivered: `094217 96468` (leading zero + space), `94217
 * 96468`, `+91 94217 96468`. Sarvam's outbound API will not touch any of those
 * — it requires E.164 (`+919421796468`), and every other consumer (tel: links,
 * wa.me links) wants its own variant too. Everything funnels through here so
 * the storage format stays exactly as scraped and the consumers each get what
 * they need.
 */

/** Strip everything that is not a digit. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Normalise to E.164 (`+919421796468`), or null when the number cannot be
 * interpreted as an Indian mobile.
 *
 * Accepted, in increasing order of trust:
 *   - already E.164:       `+91 94217 96468` / `+919421796468`
 *   - country code first:  `919421796468` / `91 94217 96468`
 *   - national with zero:  `094217 96468` / `09421796468`
 *   - bare 10 digits:      `9421796468`
 *   - international prefix `00919421796468`
 *
 * Anything else (a short number, a landline with an area code we cannot prove,
 * junk) returns null so the caller can refuse the call with a real message
 * instead of handing Sarvam garbage.
 */
export function toE164(value: string | null | undefined): string | null {
  if (!value) return null;

  let digits = digitsOnly(value);
  if (!digits) return null;

  // International dialling prefix — `00 91 …` is `+91 …`.
  if (digits.startsWith('00')) digits = digits.slice(2);

  // Country code + 10-digit mobile: 12 digits starting `91`.
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  // National format with the trunk prefix: `0` + 10 digits.
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }

  // Bare 10-digit mobile — the common case for form leads.
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  return null;
}

/** `tel:` href — the same E.164, or null when undialable. */
export function toTelHref(value: string | null | undefined): string | null {
  const e164 = toE164(value);
  return e164 ? `tel:${e164}` : null;
}

/**
 * Digits-only with country code, no `+` — what `wa.me` and the WhatsApp
 * deep-link API require. A raw `094217 96468` produces a dead link today, which
 * is exactly the class of bug this module exists to prevent.
 */
export function toWhatsApp(value: string | null | undefined): string | null {
  const e164 = toE164(value);
  return e164 ? e164.slice(1) : null;
}

/** Can we actually dial this? What the UI uses to decide link vs. plain text. */
export function isDialable(value: string | null | undefined): boolean {
  return toE164(value) !== null;
}

/**
 * Does a search box entry match a stored number?
 *
 * Stored numbers keep the scraper's punctuation (`094217 96468`), so a plain
 * substring test failed for every sensible thing an admin would type — neither
 * `9421796468` nor `+919421796468` matches that string. Both sides are reduced
 * to digits and compared on the last ten, which is the part that identifies the
 * subscriber regardless of trunk zero or country code.
 */
export function phoneMatches(
  stored: string | null | undefined,
  needle: string
): boolean {
  const wanted = digitsOnly(needle);
  if (!wanted) return false;

  const held = digitsOnly(stored ?? '');
  if (!held) return false;

  const tail = (digits: string) => digits.slice(-10);
  return held.includes(wanted) || tail(held).includes(tail(wanted));
}

/**
 * Zod-friendly shape check for a number a human typed.
 *
 * Deliberately looser than `toE164`: manual entry and the public forms should
 * not reject a number for having spaces, brackets or a country code we do not
 * recognise, but they should reject prose. Dialability is enforced at the point
 * of dialling, where a real E.164 string is required.
 */
export const PHONE_SHAPE = /^[+\d][\d\s()-]*$/;
