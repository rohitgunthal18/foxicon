/**
 * The clauses of an agreement, in the order they are presented.
 *
 * Imported by the signing page, the PDF renderer and the generator form so all
 * three show the same clauses under the same headings in the same order. When
 * the PDF hardcoded its own subset, editing a clause in the admin changed the
 * web page and the content hash but not the printed document — the client
 * signed text the PDF did not contain. One array removes that class of bug.
 *
 * `signing_text` is deliberately absent: it is the consent sentence above the
 * signature box, not a numbered clause.
 *
 * Eight clauses, kept short so the agreement reads like a real invoice, not a
 * wall of legalese. The four legally-required terms survive:
 *   1. No refund once service is delivered  (→ termination)
 *   2. Full refund if cancelled before work  (→ termination)
 *   3. One year free hosting & domain        (→ liability)
 *   4. No responsibility for misuse          (→ liability)
 */

export const CLAUSE_ORDER: readonly [string, string][] = [
  ['scope', 'Scope of work'],
  ['payment_terms', 'Payment'],
  ['delivery', 'Delivery & your inputs'],
  ['support', 'Support & revisions'],
  ['termination', 'Cancellation & refunds'],
  ['liability', 'Hosting, domain & liability'],
  ['ownership', 'Ownership & confidentiality'],
  ['dispute', 'Governing law'],
];

/** Every key the generator form writes, including the consent sentence. */
export const CLAUSE_KEYS: readonly string[] = [
  ...CLAUSE_ORDER.map(([key]) => key),
  'signing_text',
];

/**
 * Our details as they appear on the agreement. One source so the PDF letterhead
 * and the web letterhead cannot drift apart — they showed two different company
 * names and two different email addresses before this existed.
 */
export const FOXI = {
  name: 'FOXI TECH',
  address: 'Shop 4, Tech Plaza, Baner Road, Pune, Maharashtra 411045',
  email: 'contact.foxitech@gmail.com',
  phone: '+91 72186 16190',
} as const;
