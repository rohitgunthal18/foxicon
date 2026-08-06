import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import {
  formatInr,
  getDashboardData,
  LEAD_STAGES,
  LEAD_STATUS_SHORT,
  relativeTime,
} from '@/lib/admin';

/**
 * The dashboard answers one question: what do I do today?
 *
 * The numbers come first — the pipeline strip and four tiles — then the to-do
 * list underneath. That ordering was the other way round until 800 scraped
 * businesses were imported at status `new`: the to-do list qualified every one
 * of them, so the page opened on an 800-row list and the counts sat somewhere
 * past the twentieth screen. The list is capped now (see TODO_LIMIT in
 * lib/admin.ts) and the numbers lead, so the page reads as a dashboard whatever
 * the lead count is.
 */
export default async function AdminDashboard() {
  const admin = await verifySession();
  const data = await getDashboardData();

  const firstName = admin.full_name.split(' ')[0];
  const todo = data.needsAttention;
  const hidden = data.needsAttentionTotal - todo.length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-primary-950 sm:text-2xl">
            Hello, {firstName}
          </h1>
          <p className="mt-0.5 text-sm text-primary-600">
            {data.needsAttentionTotal === 0
              ? 'Nothing needs chasing right now.'
              : `${data.needsAttentionTotal} ${data.needsAttentionTotal === 1 ? 'person needs' : 'people need'} your attention.`}
          </p>
        </div>

        <Link
          href="/admin/leads/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-accent-500"
        >
          <Plus aria-hidden className="h-4 w-4" />
          Add lead
        </Link>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* The numbers. First, because that is what a dashboard is for.       */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primary-900">Pipeline</h2>
          <Link
            href="/admin/leads?view=board"
            className="text-xs font-medium text-accent-600 hover:text-accent-500"
          >
            Open board →
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-primary-200 bg-primary-200 sm:grid-cols-5 lg:grid-cols-9">
          {LEAD_STAGES.map((stage) => (
            <Link
              key={stage}
              href={`/admin/leads?view=list&status=${stage}`}
              className="bg-white px-2 py-2.5 text-center transition hover:bg-primary-50"
            >
              <span className="block font-display text-lg font-bold text-primary-950">
                {data.stageCounts[stage]}
              </span>
              <span className="mt-0.5 block text-[10px] leading-tight text-primary-500">
                {LEAD_STATUS_SHORT[stage]}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <div className="rounded-xl border border-primary-200 bg-white px-3 py-2.5">
            <p className="text-[11px] text-primary-500">Pipeline value</p>
            <p className="mt-0.5 font-display text-lg font-bold text-primary-950">
              {formatInr(data.pipelineValueInr)}
            </p>
          </div>
          <div className="rounded-xl border border-primary-200 bg-white px-3 py-2.5">
            <p className="text-[11px] text-primary-500">Won</p>
            <p className="mt-0.5 font-display text-lg font-bold text-primary-950">
              {data.wonLeads}
            </p>
          </div>
          <Link
            href="/admin/agreements?status=sent"
            className="rounded-xl border border-primary-200 bg-white px-3 py-2.5 transition hover:border-primary-300"
          >
            <p className="text-[11px] text-primary-500">Awaiting signature</p>
            <p className="mt-0.5 font-display text-lg font-bold text-primary-950">
              {data.openAgreements}
            </p>
          </Link>
          {/* Not a link yet — the reviews queue page is not built. */}
          <div className="rounded-xl border border-primary-200 bg-white px-3 py-2.5">
            <p className="text-[11px] text-primary-500">Reviews to approve</p>
            <p className="mt-0.5 font-display text-lg font-bold text-primary-950">
              {data.pendingReviews}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* The to-do list. Capped — see TODO_LIMIT.                           */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primary-900">
            Do this today
          </h2>
          {hidden > 0 && (
            <Link
              href="/admin/leads?view=list&status=new"
              className="text-xs font-medium text-accent-600 hover:text-accent-500"
            >
              {hidden.toLocaleString('en-IN')} more →
            </Link>
          )}
        </div>

        <div className="divide-y divide-primary-100 overflow-hidden rounded-xl border border-primary-200 bg-white">
          {todo.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-primary-600">
                All clear. Every new enquiry has been contacted and no follow-up
                is overdue.
              </p>
            </div>
          )}

          {todo.map((lead) => (
            <Link
              key={lead.id}
              href={`/admin/leads/${lead.id}`}
              className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-primary-50"
            >
              <span
                aria-hidden
                className={`h-2 w-2 shrink-0 rounded-full ${
                  lead.reason === 'overdue' ? 'bg-red-500' : 'bg-accent-500'
                }`}
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-primary-900">
                  {lead.name}
                  {lead.company ? (
                    <span className="font-normal text-primary-500">
                      {' '}
                      · {lead.company}
                    </span>
                  ) : null}
                </span>
                <span className="block truncate text-xs text-primary-500">
                  {lead.reason === 'overdue'
                    ? `Follow-up was due ${relativeTime(lead.next_follow_up_at)}`
                    : `Added ${relativeTime(lead.created_at)} — not contacted yet`}
                </span>
              </span>

              <span className="hidden shrink-0 text-xs text-primary-500 sm:block">
                {lead.phone ?? lead.email ?? ''}
              </span>

              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-primary-300"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Recent, for context only.                                          */}
      {/* ------------------------------------------------------------------ */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-primary-900">
            Latest enquiries
          </h2>
          <Link
            href="/admin/leads?view=list"
            className="text-xs font-medium text-accent-600 hover:text-accent-500"
          >
            View all →
          </Link>
        </div>

        <div className="divide-y divide-primary-100 overflow-hidden rounded-xl border border-primary-200 bg-white">
          {data.recentLeads.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-primary-600">
              No leads yet. Add one manually, or wait for the website form.
            </p>
          )}

          {data.recentLeads.map((lead) => (
            <Link
              key={lead.id}
              href={`/admin/leads/${lead.id}`}
              className="flex items-center gap-3 px-4 py-2.5 transition hover:bg-primary-50"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm text-primary-900">
                  {lead.name}
                  {lead.company ? (
                    <span className="text-primary-500"> · {lead.company}</span>
                  ) : null}
                </span>
              </span>
              <span className="shrink-0 text-xs text-primary-400">
                {LEAD_STATUS_SHORT[lead.status]}
              </span>
              <span className="hidden shrink-0 text-xs text-primary-400 sm:block">
                {relativeTime(lead.created_at)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
