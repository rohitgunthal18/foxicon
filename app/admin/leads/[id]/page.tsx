import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  MessageSquare,
  Phone,
  Building2,
  MapPin,
  Star,
} from 'lucide-react';

import { verifySession } from '@/lib/supabase/dal';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  LEAD_STATUS_HINT,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_SHORT,
  LEAD_STATUS_STYLE,
  LEAD_STAGES,
  leadSourceLabel,
  relativeTime,
  telHref,
  whatsappHref,
  type LeadStatus,
} from '@/lib/admin';
import LeadTimeline from '@/components/admin/LeadTimeline';
import LeadDetailActions from '@/components/admin/LeadDetailActions';
import LeadEditor from '@/components/admin/LeadEditor';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * The scraped columns, which `lib/supabase/types.ts` still does not know about
 * — see the same note in `app/admin/leads/page.tsx`. Regenerating the types
 * retires this.
 */
interface ScrapedFields {
  city: string | null;
  address: string | null;
  website: string | null;
  maps_url: string | null;
  category: string | null;
  niche: string | null;
  lead_score: number | null;
  rating: number | null;
  review_count: number | null;
  pitch_angle: string | null;
}

export default async function LeadDetailPage({ params }: Props) {
  await verifySession();
  const { id } = await params;

  const { data: lead } = await supabaseAdmin
    .from('leads')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (!lead) notFound();

  // Real service rows, so the editor offers the same list the public form does
  // rather than a hardcoded copy that can drift.
  const { data: services } = await supabaseAdmin
    .from('services')
    .select('slug, title')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  const stageIndex = LEAD_STAGES.findIndex((stage) => stage === lead.status);

  const { data: neighbors } = await supabaseAdmin
    .from('leads')
    .select('id, name')
    .order('created_at', { ascending: false });

  const all = (neighbors ?? []).map((row) => row.id);
  const currentIndex = all.indexOf(lead.id);
  const prev = currentIndex > 0 ? neighbors?.[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < all.length - 1 ? neighbors?.[currentIndex + 1] : null;

  const canCreateAgreement = [
    'new',
    'contacted',
    'qualified',
    'agreement',
  ].includes(lead.status);

  /**
   * The select is `*`, so these columns are present at runtime even though the
   * generated types omit them.
   */
  const scraped = lead as typeof lead & Partial<ScrapedFields>;

  /**
   * Normalised through the shared helpers rather than hand-built. The WhatsApp
   * link here used to be `wa.me/${phone.replace(/[^\d]/g,'')}`, which keeps the
   * scraper's leading trunk zero — `wa.me/09975715505` opens WhatsApp's "phone
   * number shared via url is invalid" page. `whatsappHref` drops the zero and
   * adds the country code, and returns null when there is no usable number so
   * the button can be hidden rather than rendered dead.
   */
  const tel = telHref(lead.phone);
  const whatsapp = whatsappHref(lead.phone);
  const hasScrapeData =
    scraped.lead_score !== null ||
    scraped.rating !== null ||
    scraped.category != null ||
    scraped.niche != null ||
    scraped.address != null ||
    scraped.website != null;

  return (
    <div className="space-y-6">
      {/* Nav + prev/next */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/leads"
          className="inline-flex items-center gap-1.5 text-sm text-primary-600 transition hover:text-primary-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All leads
        </Link>

        <div className="flex items-center gap-2 text-sm">
          {prev && (
            <Link
              href={`/admin/leads/${prev.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-primary-700 transition hover:border-primary-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Prev</span>
              <span className="hidden md:inline">{prev.name}</span>
            </Link>
          )}
          {next && (
            <Link
              href={`/admin/leads/${next.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-white px-3 py-1.5 text-primary-700 transition hover:border-primary-300"
            >
              <span className="hidden md:inline">{next.name}</span>
              <span className="hidden sm:inline">Next</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold text-primary-900">
              {lead.name}
            </h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${LEAD_STATUS_STYLE[lead.status as LeadStatus]}`}
            >
              {LEAD_STATUS_LABEL[lead.status as LeadStatus]}
            </span>
          </div>
          <p className="mt-1 text-sm text-primary-600">
            {LEAD_STATUS_HINT[lead.status as LeadStatus]}
          </p>
          <p className="mt-0.5 text-xs text-primary-400">
            Received {relativeTime(lead.created_at)}
          </p>
        </div>

        <LeadDetailActions
          leadId={lead.id}
          currentStatus={lead.status as LeadStatus}
          stageIndex={stageIndex}
        />
      </header>

      {/* Pipeline progress */}
      {stageIndex >= 0 && (
        <div className="overflow-hidden rounded-xl border border-primary-200 bg-white p-4 sm:p-5">
          <div className="flex items-center gap-1">
            {LEAD_STAGES.map((stage, index) => (
              <div key={stage} className="flex flex-1 flex-col items-center gap-1.5">
                <span
                  className={`h-2.5 w-full rounded-full ${
                    index <= stageIndex
                      ? 'bg-accent-500'
                      : index === stageIndex + 1
                        ? 'bg-accent-500/30'
                        : 'bg-primary-100'
                  }`}
                />
                <span
                  className={`hidden text-[10px] sm:block ${
                    index === stageIndex
                      ? 'font-semibold text-primary-900'
                      : 'text-primary-400'
                  }`}
                >
                  {LEAD_STATUS_SHORT[stage]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: contact + editable fields */}
        <div className="space-y-6 lg:col-span-2">
          <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
            <header className="border-b border-primary-200 px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                Contact details
              </h2>
            </header>

            <dl className="divide-y divide-primary-100">
              <div className="flex items-start gap-3 px-5 py-3.5">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                <div className="min-w-0">
                  <dt className="text-xs text-primary-500">Email</dt>
                  <dd className="text-sm text-primary-900">
                    {lead.email ? (
                      <a
                        href={`mailto:${lead.email}`}
                        className="hover:text-accent-600"
                      >
                        {lead.email}
                      </a>
                    ) : (
                      <span className="text-primary-400">Not provided</span>
                    )}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3 px-5 py-3.5">
                <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                <div className="min-w-0">
                  <dt className="text-xs text-primary-500">Phone</dt>
                  <dd className="text-sm text-primary-900">
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="hover:text-accent-600">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-primary-400">Not provided</span>
                    )}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3 px-5 py-3.5">
                <Building2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary-400" />
                <div className="min-w-0">
                  <dt className="text-xs text-primary-500">Business</dt>
                  <dd className="text-sm text-primary-900">
                    {lead.company ?? <span className="text-primary-400">Not provided</span>}
                  </dd>
                </div>
              </div>

            </dl>
          </section>

          {/*
            Priority, value, follow-up date and service were read-only text
            here, even though the PATCH route has always accepted all four —
            so there was no way to set them from the UI at all.
          */}
          <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
            <header className="border-b border-primary-200 px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                Deal details
              </h2>
            </header>
            <div className="px-5 py-4">
              <LeadEditor
                leadId={lead.id}
                priority={lead.priority as 'low' | 'normal' | 'high'}
                valueInr={lead.value_inr}
                nextFollowUpAt={lead.next_follow_up_at}
                serviceSlug={lead.service_slug}
                services={services ?? []}
              />
            </div>
          </section>

          {/*
            Everything the scrape knows that the pipeline fields do not cover.
            Hidden entirely for form-submitted leads, where all of it is null and
            the panel would be a list of dashes.
          */}
          {hasScrapeData && (
            <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
              <header className="border-b border-primary-200 px-5 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                  Business intelligence
                </h2>
              </header>

              <div className="grid gap-px bg-primary-100 sm:grid-cols-2">
                {scraped.lead_score !== null &&
                  scraped.lead_score !== undefined && (
                    <div className="bg-white px-5 py-3.5">
                      <p className="text-xs text-primary-500">Lead score</p>
                      <p className="mt-0.5 text-sm font-semibold text-primary-900">
                        {scraped.lead_score} / 100
                      </p>
                    </div>
                  )}

                {scraped.rating !== null && scraped.rating !== undefined && (
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-xs text-primary-500">Google rating</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm font-semibold text-primary-900">
                      <Star
                        aria-hidden
                        className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                      />
                      {scraped.rating.toFixed(1)}
                      {scraped.review_count !== null &&
                        scraped.review_count !== undefined && (
                          <span className="font-normal text-primary-500">
                            ({scraped.review_count.toLocaleString('en-IN')}{' '}
                            reviews)
                          </span>
                        )}
                    </p>
                  </div>
                )}

                {scraped.category && (
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-xs text-primary-500">Category</p>
                    <p className="mt-0.5 text-sm text-primary-900">
                      {scraped.category}
                    </p>
                  </div>
                )}

                {scraped.niche && (
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-xs text-primary-500">Niche</p>
                    <p className="mt-0.5 text-sm text-primary-900">
                      {scraped.niche}
                    </p>
                  </div>
                )}

                {scraped.city && (
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-xs text-primary-500">City</p>
                    <p className="mt-0.5 text-sm text-primary-900">
                      {scraped.city}
                    </p>
                  </div>
                )}

                {scraped.website && (
                  <div className="bg-white px-5 py-3.5">
                    <p className="text-xs text-primary-500">Website</p>
                    <a
                      href={scraped.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-0.5 block truncate text-sm text-blue-700 underline transition hover:text-blue-900"
                    >
                      {scraped.website}
                    </a>
                  </div>
                )}

                {scraped.address && (
                  <div className="bg-white px-5 py-3.5 sm:col-span-2">
                    <p className="text-xs text-primary-500">Address</p>
                    <p className="mt-0.5 text-sm text-primary-900">
                      {scraped.address}
                    </p>
                  </div>
                )}
              </div>

              {scraped.pitch_angle && (
                <div className="border-t border-primary-200 bg-accent-50/50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-accent-700">
                    Pitch angle
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-primary-800">
                    {scraped.pitch_angle}
                  </p>
                </div>
              )}
            </section>
          )}

          {lead.message && (
            <section className="overflow-hidden rounded-xl border border-primary-200 bg-white">
              <header className="border-b border-primary-200 px-5 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
                  Original message
                </h2>
              </header>
              <p className="whitespace-pre-line px-5 py-4 text-sm leading-relaxed text-primary-700">
                {lead.message}
              </p>
            </section>
          )}

          {/* Timeline */}
          <LeadTimeline leadId={lead.id} />
        </div>

        {/* Right: quick actions */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-primary-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
              Quick actions
            </h2>

            <div className="mt-4 space-y-2">
              {canCreateAgreement && (
                <Link
                  href={`/admin/agreements/new?lead=${lead.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-950 py-2.5 text-sm font-medium text-white transition hover:bg-accent-600"
                >
                  Create agreement
                </Link>
              )}

              {/*
                Call, WhatsApp and Maps — the three things actually done from
                this page. Each renders only when it has somewhere to go, rather
                than as a greyed-out stub: a disabled button still costs a tap
                to discover it does nothing.
              */}
              {tel && (
                <a
                  href={tel}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 py-2.5 text-sm font-medium text-emerald-800 transition hover:bg-emerald-100"
                >
                  <Phone aria-hidden className="h-4 w-4" />
                  Call {lead.phone}
                </a>
              )}

              {whatsapp && (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-green-300 bg-green-50 py-2.5 text-sm font-medium text-green-800 transition hover:bg-green-100"
                >
                  <MessageSquare aria-hidden className="h-4 w-4" />
                  WhatsApp
                </a>
              )}

              {scraped.maps_url && (
                <a
                  href={scraped.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 py-2.5 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
                >
                  <MapPin aria-hidden className="h-4 w-4" />
                  View on Google Maps
                </a>
              )}

              {!tel && !whatsapp && !scraped.maps_url && (
                <p className="text-xs text-primary-500">
                  No phone or Maps link on this lead.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-primary-200 bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-primary-700">
              Details
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-primary-500">Source</dt>
                <dd className="text-primary-900">{leadSourceLabel(lead.source)}</dd>
              </div>
              {lead.last_contacted_at && (
                <div className="flex justify-between">
                  <dt className="text-primary-500">Last contacted</dt>
                  <dd className="text-primary-900">{relativeTime(lead.last_contacted_at)}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
