import Link from 'next/link';
import { ChevronRight, FileSignature, Plus } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  AGREEMENT_STATUS_LABEL,
  AGREEMENT_STATUS_SHORT,
  AGREEMENT_STATUS_STYLE,
  formatInr,
  relativeTime,
  toAgreementStatus,
  type AgreementStatus,
} from '@/lib/admin';

const FILTERS: (AgreementStatus | 'all')[] = ['all', 'draft', 'sent', 'signed', 'voided'];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AgreementsPage({ searchParams }: Props) {
  await verifySession();
  const { status } = await searchParams;

  const query = supabaseAdmin
    .from('agreements')
    .select(
      'id, reference, status, client_name, client_company, project_title, total_inr, created_at, sent_at, signed_at, expires_at'
    )
    .order('created_at', { ascending: false });

  const statusFilter = toAgreementStatus(status);
  if (statusFilter) {
    query.eq('status', statusFilter);
  }

  /**
   * The filtered list and the pill counts in two queries, not five: the
   * second one pulls every status column and tallies them here rather than
   * issuing one `head: true` count per status.
   */
  const [{ data: agreements }, { data: allStatuses }] = await Promise.all([
    query,
    supabaseAdmin.from('agreements').select('status'),
  ]);

  const countMap = (allStatuses ?? []).reduce<Record<string, number>>((acc, row) => {
    acc[row.status] = (acc[row.status] ?? 0) + 1;
    return acc;
  }, {});
  const total = (allStatuses ?? []).length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-primary-900">Agreements</h1>
          <p className="mt-1 text-sm text-primary-600">
            Create, send and track every client agreement.
          </p>
        </div>

        <Link
          href="/admin/agreements/new"
          className="inline-flex items-center gap-1.5 bg-primary-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
        >
          <Plus className="h-4 w-4" />
          New agreement
        </Link>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((value) => {
          const isActive = value === 'all' ? !status || status === 'all' : status === value;
          const count = value === 'all' ? total : countMap[value] ?? 0;
          return (
            <Link
              key={value}
              href={value === 'all' ? '/admin/agreements' : `/admin/agreements?status=${value}`}
              className={`border px-3 py-1 text-xs font-medium capitalize transition ${
                isActive
                  ? 'border-primary-950 bg-primary-950 text-white'
                  : 'border-primary-200 text-primary-600 hover:border-primary-300'
              }`}
            >
              {value === 'all' ? 'All' : AGREEMENT_STATUS_SHORT[value]} ({count})
            </Link>
          );
        })}
      </div>

      <div className="divide-y divide-primary-200 overflow-hidden border border-primary-200 bg-white">
        {(agreements ?? []).length === 0 && (
          <div className="px-6 py-12 text-center">
            <FileSignature aria-hidden className="mx-auto h-8 w-8 text-primary-300" />
            <p className="mt-3 text-sm text-primary-600">No agreements here yet.</p>
            <Link
              href="/admin/agreements/new"
              className="mt-3 inline-block text-sm font-medium text-accent-600 hover:text-accent-500"
            >
              Create the first one →
            </Link>
          </div>
        )}

        {(agreements ?? []).map((agreement) => {
          const hasExpired =
            agreement.status === 'sent' &&
            agreement.expires_at !== null &&
            new Date(agreement.expires_at) < new Date();

          return (
            <Link
              key={agreement.id}
              href={`/admin/agreements/${agreement.id}`}
              className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-primary-50"
            >
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-primary-500">
                    {agreement.reference}
                  </span>
                  <span
                    className={`border px-2 py-0.5 text-[10px] font-medium ${
                      AGREEMENT_STATUS_STYLE[agreement.status as AgreementStatus]
                    }`}
                  >
                    {AGREEMENT_STATUS_LABEL[agreement.status as AgreementStatus]}
                  </span>
                  {hasExpired && (
                    <span className="border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-700">
                      Link expired
                    </span>
                  )}
                </span>
                <span className="mt-1 block truncate text-sm font-medium text-primary-900">
                  {agreement.client_name}
                  {agreement.client_company ? (
                    <span className="font-normal text-primary-500">
                      {' '}
                      · {agreement.client_company}
                    </span>
                  ) : null}
                </span>
                {agreement.project_title && (
                  <span className="block truncate text-xs text-primary-500">
                    {agreement.project_title}
                  </span>
                )}
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-sm font-medium text-primary-900">
                  {formatInr(agreement.total_inr)}
                </span>
                <span className="block text-xs text-primary-400">
                  {agreement.signed_at
                    ? `Signed ${relativeTime(agreement.signed_at)}`
                    : agreement.sent_at
                      ? `Sent ${relativeTime(agreement.sent_at)}`
                      : relativeTime(agreement.created_at)}
                </span>
              </span>

              <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-primary-300" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
