import { z } from 'zod';

import { PHONE_SHAPE } from './phone';

/** Service slugs are validated against the DB at insert time by a foreign key. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === '' ? null : v))
    .nullable()
    .optional();

export const leadSchema = z
  .object({
    name: z.string().trim().min(1, 'Please enter your name').max(120),
    company: optionalText(160),
    email: z
      .union([z.literal(''), z.email('Please enter a valid email address')])
      .transform((v) => (v === '' ? null : v))
      .nullable()
      .optional(),
    phone: z
      .union([
        z.literal(''),
        z
          .string()
          .trim()
          .min(6, 'Phone number looks too short')
          .max(24)
          .regex(PHONE_SHAPE, 'Please enter a valid phone number'),
      ])
      .transform((v) => (v === '' ? null : v))
      .nullable()
      .optional(),
    service_slug: optionalText(60),
    message: optionalText(4000),
    source: z.enum(['contact_form', 'quote_modal']).default('contact_form'),
    /**
     * Honeypot. Bots fill hidden inputs; humans never see this one.
     * Deliberately permissive: the route handler decides what to do when it is
     * filled. Rejecting it here would leak which field caught the bot.
     */
    website: z.string().optional(),
  })
  .refine((data) => Boolean(data.email) || Boolean(data.phone), {
    message: 'Please give us either an email address or a phone number',
    path: ['email'],
  });

export type LeadInput = z.infer<typeof leadSchema>;

export const reviewSchema = z.object({
  author_name: z.string().trim().min(1, 'Please enter your name').max(120),
  author_role: optionalText(160),
  rating: z.coerce
    .number()
    .int('Please choose a star rating')
    .min(1, 'Please choose a star rating')
    .max(5),
  body: z
    .string()
    .trim()
    .min(10, 'Please write at least a few words')
    .max(2000),
  /** Honeypot — see the note on `leadSchema.website`. */
  website: z.string().optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

/** Flattens a ZodError into `{ field: message }` for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
