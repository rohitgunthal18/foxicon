import 'server-only';

import type { AgreementPdfData } from './agreement-template';

/**
 * Map database rows to the shape the PDF renders.
 *
 * Shared by the admin route and the public token route so the two cannot
 * produce different documents from the same agreement — the client's copy and
 * our copy must be byte-identical apart from the filename.
 */

interface AgreementRow {
  reference: string;
  client_name: string;
  client_company: string | null;
  client_phone: string | null;
  client_email: string | null;
  project_title: string | null;
  subtotal_inr: number;
  discount_inr: number;
  tax_percent: number;
  total_inr: number;
  installments: unknown;
  delivery_days: number;
  support_months: number;
  revisions_included: number;
  content: unknown;
}

interface ItemRow {
  kind: string;
  label: string;
  detail: string | null;
  qty: number;
  unit_inr: number;
}

interface SignatureRow {
  signer_name: string;
  signed_at: string;
}

export function buildAgreementPdfData(
  agreement: AgreementRow,
  items: ItemRow[],
  signature: SignatureRow | null
): AgreementPdfData {
  return {
    reference: agreement.reference,
    clientName: agreement.client_name,
    clientCompany: agreement.client_company,
    clientPhone: agreement.client_phone,
    clientEmail: agreement.client_email,
    projectTitle: agreement.project_title,
    items: items.map((item) => ({
      kind: item.kind,
      label: item.label,
      detail: item.detail,
      qty: item.qty,
      unit_inr: item.unit_inr,
    })),
    // Straight off the row. The template renders these; it does not recompute
    // them — see the note at the top of agreement-template.tsx.
    subtotalInr: agreement.subtotal_inr,
    discountInr: agreement.discount_inr,
    taxPercent: agreement.tax_percent,
    totalInr: agreement.total_inr,
    installments: Array.isArray(agreement.installments)
      ? (agreement.installments as AgreementPdfData['installments'])
      : [],
    deliveryDays: agreement.delivery_days,
    supportMonths: agreement.support_months,
    revisionsIncluded: agreement.revisions_included,
    clauses: (agreement.content ?? {}) as Record<string, string>,
    signedByName: signature?.signer_name ?? null,
    signedAt: signature?.signed_at ?? null,
  };
}
