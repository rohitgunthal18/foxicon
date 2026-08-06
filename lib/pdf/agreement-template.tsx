import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

import { CLAUSE_ORDER, FOXI } from '@/lib/agreement-clauses';

/**
 * The agreement, as a PDF.
 *
 * Two rules govern this file, both learned from bugs it used to have:
 *
 * 1. **It renders; it does not calculate.** Every figure comes from the
 *    agreement row. An earlier version recomputed tax as a percentage of the
 *    pre-discount subtotal while `computeTotals()` taxes the discounted amount,
 *    so a discounted job printed a total the database disagreed with. The PDF
 *    is the document the client signs — it cannot hold a second opinion about
 *    the price.
 *
 * 2. **The terms come from the agreement.** They were hardcoded here once,
 *    which meant editing a clause in the admin changed the signing page and the
 *    content hash but not the printed document, and the client signed text the
 *    PDF did not contain. `CLAUSE_ORDER` is shared with the signing page so the
 *    two cannot drift.
 *
 * Helvetica is a PDF core font, deliberately: registering a webfont would make
 * every render depend on a fetch to fonts.gstatic.com, so a network blip would
 * turn "download your signed agreement" into a 500 — on the one document the
 * client is legally entitled to a copy of. Core fonts need no network at all.
 */

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    paddingTop: 36,
    paddingBottom: 54,
    paddingHorizontal: 40,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2pt solid #1F2937',
    paddingBottom: 10,
    marginBottom: 16,
  },
  companyName: { fontSize: 17, fontFamily: 'Helvetica-Bold' },
  companyMeta: { fontSize: 7.5, color: '#6B7280', marginTop: 3 },
  refLabel: {
    fontSize: 6.5,
    color: '#9CA3AF',
    textAlign: 'right',
    letterSpacing: 1,
  },
  refValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  title: { fontSize: 15, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#6B7280', marginBottom: 14 },
  sectionTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 5,
  },
  section: { marginBottom: 14 },
  parties: { flexDirection: 'row', gap: 24 },
  party: { flex: 1 },
  partyName: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  partyLine: { fontSize: 8.5, color: '#4B5563', marginTop: 1.5 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 5,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottom: '0.5pt solid #E5E7EB',
  },
  thText: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: '#374151' },
  colDesc: { width: '58%' },
  colMid: { width: '14%', textAlign: 'center' },
  colAmt: { width: '28%', textAlign: 'right' },
  itemLabel: { fontSize: 9 },
  itemDetail: { fontSize: 7.5, color: '#6B7280', marginTop: 1 },
  totalsBox: { marginTop: 8, alignSelf: 'flex-end', width: '52%' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  totalsLabel: { fontSize: 9, color: '#4B5563' },
  totalsValue: { fontSize: 9 },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #1F2937',
    marginTop: 4,
    paddingTop: 5,
  },
  grandLabel: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  grandValue: { fontSize: 11, fontFamily: 'Helvetica-Bold' },
  termsGrid: { flexDirection: 'row', gap: 8 },
  termCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 8,
    alignItems: 'center',
  },
  termLabel: { fontSize: 6.5, color: '#9CA3AF', letterSpacing: 0.8 },
  termValue: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  clause: { marginBottom: 7 },
  clauseHeading: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  clauseBody: { fontSize: 8, color: '#374151', lineHeight: 1.45, textAlign: 'justify' },
  signatureSection: { marginTop: 16, borderTop: '1pt solid #E5E7EB', paddingTop: 12 },
  signatureIntro: { fontSize: 8.5, color: '#374151', marginBottom: 14 },
  signatureRow: { flexDirection: 'row', gap: 32 },
  signatureBlock: { flex: 1 },
  signatureRule: { borderTop: '1pt solid #1F2937', marginTop: 22, marginBottom: 4 },
  signedName: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  signatureCaption: { fontSize: 7, color: '#6B7280', marginTop: 2 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    borderTop: '0.5pt solid #E5E7EB',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: { fontSize: 6.5, color: '#9CA3AF' },
});

export interface AgreementPdfItem {
  kind: string;
  label: string;
  detail: string | null;
  qty: number;
  unit_inr: number;
}

/** The shape stored in `agreements.installments`, used verbatim. */
export interface AgreementPdfInstallment {
  label: string;
  percent: number;
  amount_inr: number;
  due_note: string;
}

export interface AgreementPdfData {
  reference: string;
  clientName: string;
  clientCompany: string | null;
  clientPhone: string | null;
  clientEmail: string | null;
  projectTitle: string | null;
  items: AgreementPdfItem[];
  subtotalInr: number;
  discountInr: number;
  taxPercent: number;
  totalInr: number;
  installments: AgreementPdfInstallment[];
  deliveryDays: number;
  supportMonths: number;
  revisionsIncluded: number;
  clauses: Record<string, string>;
  signedByName?: string | null;
  signedAt?: string | null;
}

function formatInr(amount: number): string {
  // "Rs." rather than "₹": the rupee sign is not in Helvetica's glyph set, and
  // a core font cannot substitute, so it would render as a blank box.
  return `Rs. ${amount.toLocaleString('en-IN')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });
}

export function AgreementPDF({ data }: { data: AgreementPdfData }) {  const workItems = data.items.filter((item) => item.kind !== 'discount');
  const netBeforeTax = data.subtotalInr - data.discountInr;
  // Derived by subtraction rather than recomputed from the percentage, so it
  // always reconciles with the stored total even if the rate had rounding.
  const taxInr = data.totalInr - netBeforeTax;

  return (
    <Document
      title={`Service Agreement ${data.reference}`}
      author={FOXI.name}
      subject={data.projectTitle ?? 'Service Agreement'}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.companyName}>{FOXI.name}</Text>
            <Text style={styles.companyMeta}>{FOXI.address}</Text>
            <Text style={styles.companyMeta}>
              {FOXI.email} · {FOXI.phone}
            </Text>
          </View>
          <View>
            <Text style={styles.refLabel}>AGREEMENT</Text>
            <Text style={styles.refValue}>{data.reference}</Text>
          </View>
        </View>

        <Text style={styles.title}>Service Agreement</Text>
        {data.projectTitle ? (
          <Text style={styles.subtitle}>{data.projectTitle}</Text>
        ) : (
          <View style={{ marginBottom: 14 }} />
        )}

        {/* Parties */}
        <View style={styles.section}>
          <View style={styles.parties}>
            <View style={styles.party}>
              <Text style={styles.sectionTitle}>PREPARED FOR</Text>
              <Text style={styles.partyName}>{data.clientName}</Text>
              {data.clientCompany ? (
                <Text style={styles.partyLine}>{data.clientCompany}</Text>
              ) : null}
              {data.clientPhone ? (
                <Text style={styles.partyLine}>{data.clientPhone}</Text>
              ) : null}
              {data.clientEmail ? (
                <Text style={styles.partyLine}>{data.clientEmail}</Text>
              ) : null}
            </View>
            <View style={styles.party}>
              <Text style={styles.sectionTitle}>PREPARED BY</Text>
              <Text style={styles.partyName}>{FOXI.name}</Text>
              <Text style={styles.partyLine}>{FOXI.email}</Text>
              <Text style={styles.partyLine}>{FOXI.phone}</Text>
            </View>
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WHAT IS INCLUDED</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDesc, styles.thText]}>DESCRIPTION</Text>
            <Text style={[styles.colMid, styles.thText]}>QTY</Text>
            <Text style={[styles.colAmt, styles.thText]}>AMOUNT</Text>
          </View>
          {workItems.map((item, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={styles.colDesc}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.detail ? <Text style={styles.itemDetail}>{item.detail}</Text> : null}
              </View>
              <Text style={[styles.colMid, styles.itemLabel]}>{item.qty}</Text>
              <Text style={[styles.colAmt, styles.itemLabel]}>
                {formatInr(item.qty * item.unit_inr)}
              </Text>
            </View>
          ))}

          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatInr(data.subtotalInr)}</Text>
            </View>
            {data.discountInr > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Discount</Text>
                <Text style={styles.totalsValue}>- {formatInr(data.discountInr)}</Text>
              </View>
            )}
            {data.taxPercent > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>GST ({data.taxPercent}%)</Text>
                <Text style={styles.totalsValue}>{formatInr(taxInr)}</Text>
              </View>
            )}
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>{formatInr(data.totalInr)}</Text>
            </View>
          </View>
        </View>

        {/* Payment schedule */}
        {data.installments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PAYMENT SCHEDULE</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.colDesc, styles.thText]}>STAGE</Text>
              <Text style={[styles.colMid, styles.thText]}>SHARE</Text>
              <Text style={[styles.colAmt, styles.thText]}>AMOUNT</Text>
            </View>
            {data.installments.map((installment, index) => (
              <View key={index} style={styles.tableRow} wrap={false}>
                <View style={styles.colDesc}>
                  <Text style={styles.itemLabel}>{installment.label}</Text>
                  {installment.due_note ? (
                    <Text style={styles.itemDetail}>{installment.due_note}</Text>
                  ) : null}
                </View>
                <Text style={[styles.colMid, styles.itemLabel]}>
                  {installment.percent}%
                </Text>
                <Text style={[styles.colAmt, styles.itemLabel]}>
                  {formatInr(installment.amount_inr)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Key terms */}
        <View style={styles.section}>
          <View style={styles.termsGrid}>
            <View style={styles.termCard}>
              <Text style={styles.termLabel}>DELIVERY</Text>
              <Text style={styles.termValue}>{data.deliveryDays} days</Text>
            </View>
            <View style={styles.termCard}>
              <Text style={styles.termLabel}>SUPPORT</Text>
              <Text style={styles.termValue}>
                {data.supportMonths} {data.supportMonths === 1 ? 'month' : 'months'}
              </Text>
            </View>
            <View style={styles.termCard}>
              <Text style={styles.termLabel}>REVISIONS</Text>
              <Text style={styles.termValue}>{data.revisionsIncluded} rounds</Text>
            </View>
          </View>
        </View>

        {/* Terms — from the agreement, never hardcoded */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TERMS</Text>
          {CLAUSE_ORDER.filter(([key]) => data.clauses[key]?.trim()).map(
            ([key, heading], index) => (
              <View key={key} style={styles.clause} wrap={false}>
                <Text style={styles.clauseHeading}>
                  {index + 1}. {heading}
                </Text>
                <Text style={styles.clauseBody}>{data.clauses[key]}</Text>
              </View>
            )
          )}
        </View>

        {/* Signature */}
        <View style={styles.signatureSection} wrap={false}>
          <Text style={styles.signatureIntro}>
            {data.clauses.signing_text?.trim() ||
              'By signing below, the client confirms they have read, understood and agree to the terms set out in this agreement.'}
          </Text>

          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              {data.signedByName ? (
                <>
                  <Text style={[styles.signedName, { marginTop: 18 }]}>
                    {data.signedByName}
                  </Text>
                  <View style={styles.signatureRule} />
                  <Text style={styles.signatureCaption}>
                    Signed electronically{data.signedAt ? ` on ${formatDate(data.signedAt)} IST` : ''}
                  </Text>
                  <Text style={styles.signatureCaption}>
                    Valid under the Information Technology Act, 2000
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.signatureRule} />
                  <Text style={styles.signatureCaption}>Client signature</Text>
                </>
              )}
            </View>

            <View style={styles.signatureBlock}>
              <Text style={[styles.signedName, { marginTop: 18 }]}>{FOXI.name}</Text>
              <View style={styles.signatureRule} />
              <Text style={styles.signatureCaption}>For and on behalf of {FOXI.name}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {FOXI.name} · {data.reference}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
