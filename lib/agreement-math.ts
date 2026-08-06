/**
 * Agreement totals. Imported by both the generator UI and the API route so a
 * client-side total can never disagree with what gets stored: the server
 * recomputes with this same function and ignores whatever the browser sent.
 *
 * No 'server-only' here — that is the point, it runs in both places.
 */

export interface AgreementLine {
  kind: 'service' | 'addon' | 'discount';
  label: string;
  detail?: string | null;
  qty: number;
  unit_inr: number;
}

export interface Installment {
  label: string;
  percent: number;
  amount_inr: number;
  due_note: string;
}

export interface AgreementTotals {
  subtotalInr: number;
  discountInr: number;
  taxInr: number;
  totalInr: number;
}

export function lineTotal(line: AgreementLine): number {
  return Math.max(0, Math.round(line.qty * line.unit_inr));
}

export function computeTotals(
  lines: AgreementLine[],
  taxPercent: number
): AgreementTotals {
  let subtotalInr = 0;
  let discountInr = 0;

  for (const line of lines) {
    const amount = lineTotal(line);
    if (line.kind === 'discount') discountInr += amount;
    else subtotalInr += amount;
  }

  // A discount cannot exceed the work being discounted.
  discountInr = Math.min(discountInr, subtotalInr);

  const taxable = subtotalInr - discountInr;
  const taxInr = Math.round((taxable * taxPercent) / 100);

  return {
    subtotalInr,
    discountInr,
    taxInr,
    totalInr: taxable + taxInr,
  };
}

/**
 * Splits a total across installments by percentage, putting any rounding
 * remainder on the last one so the parts always sum exactly to the total.
 * An agreement whose installments do not add up is an invoice dispute waiting
 * to happen.
 */
export function buildInstallments(
  totalInr: number,
  splits: { label: string; percent: number; due_note: string }[]
): Installment[] {
  if (splits.length === 0) return [];

  const result: Installment[] = splits.map((split) => ({
    label: split.label,
    percent: split.percent,
    due_note: split.due_note,
    amount_inr: Math.floor((totalInr * split.percent) / 100),
  }));

  const allocated = result.reduce((sum, item) => sum + item.amount_inr, 0);
  result[result.length - 1].amount_inr += totalInr - allocated;

  return result;
}

/** The default schedule: half up front, half on delivery. */
export const DEFAULT_SPLITS = [
  { label: 'Advance', percent: 50, due_note: 'Before work begins' },
  { label: 'On delivery', percent: 50, due_note: 'Within 3 days of handover' },
];
