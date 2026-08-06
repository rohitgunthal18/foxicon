import { supabase } from './supabase/client';

/**
 * Read-only content helpers for server components.
 *
 * Every function fails soft: on a database error it logs and returns an empty
 * result rather than throwing, so a transient outage degrades one section
 * instead of blanking the whole marketing page.
 */

/** Formats integer rupees with Indian comma grouping. The ₹ is rendered separately. */
export function formatInr(value: number): string {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value);
}

export interface Service {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('slug, title, description, icon')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[content] getServices failed', error);
    return [];
  }
  return data ?? [];
}

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface Plan {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  priceInr: number;
  delivery: string;
  featured: boolean;
  features: PlanFeature[];
}

export async function getPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select(
      'slug, name, tagline, price_inr, delivery_label, is_featured, plan_features(text, included, sort_order)'
    )
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[content] getPlans failed', error);
    return [];
  }

  return (data ?? []).map((plan) => ({
    slug: plan.slug,
    name: plan.name,
    tagline: plan.tagline,
    price: formatInr(plan.price_inr),
    priceInr: plan.price_inr,
    delivery: plan.delivery_label,
    featured: plan.is_featured,
    // Nested selects are not ordered by the parent query, so sort here.
    features: [...(plan.plan_features ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(({ text, included }) => ({ text, included })),
  }));
}

export interface Bonus {
  title: string;
  description: string;
  icon: string;
  worth: string;
  worthInr: number;
  minPlanSort: number;
}

export async function getBonuses(): Promise<Bonus[]> {
  const { data, error } = await supabase
    .from('bonuses')
    .select('title, description, icon, worth_inr, min_plan_sort')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[content] getBonuses failed', error);
    return [];
  }

  return (data ?? []).map((bonus) => ({
    title: bonus.title,
    description: bonus.description,
    icon: bonus.icon,
    worth: formatInr(bonus.worth_inr),
    worthInr: bonus.worth_inr,
    minPlanSort: bonus.min_plan_sort,
  }));
}

export interface Faq {
  question: string;
  answer: string;
}

export async function getFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase
    .from('faqs')
    .select('question, answer')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[content] getFaqs failed', error);
    return [];
  }
  return data ?? [];
}

export interface ProcessStep {
  day: string;
  title: string;
  description: string;
}

export async function getProcessSteps(): Promise<ProcessStep[]> {
  const { data, error } = await supabase
    .from('process_steps')
    .select('day_label, title, description')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[content] getProcessSteps failed', error);
    return [];
  }

  return (data ?? []).map((step) => ({
    day: step.day_label,
    title: step.title,
    description: step.description,
  }));
}

export interface Review {
  id: string;
  quote: string;
  name: string;
  role: string | null;
  rating: number;
}

export async function getApprovedReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, author_name, author_role, rating, body')
    .eq('status', 'approved')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('[content] getApprovedReviews failed', error);
    return [];
  }

  return (data ?? []).map((review) => ({
    id: review.id,
    quote: review.body,
    name: review.author_name,
    role: review.author_role,
    rating: review.rating,
  }));
}

/** Site-wide facts (phone, email, rating, client count) keyed for easy lookup. */
export async function getSiteSettings(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('site_settings').select('key, value');

  if (error) {
    console.error('[content] getSiteSettings failed', error);
    return {};
  }

  return Object.fromEntries((data ?? []).map(({ key, value }) => [key, value]));
}
