import { z } from 'zod';

/**
 * The agreement payload, shared by create (POST) and edit (PATCH).
 *
 * Lives here rather than in the route file because both handlers must validate
 * identically: an edit that accepted a shape create would have rejected would
 * be a way to write values into an agreement that the create path forbids.
 * One schema, imported twice, makes that divergence impossible.
 */

export const lineSchema = z.object({
  kind: z.enum(['service', 'addon', 'discount']),
  label: z.string().trim().min(1).max(200),
  detail: z.string().max(500).nullable().optional(),
  qty: z.number().int().min(1).max(999),
  unit_inr: z.number().int().min(0).max(100_000_000),
});

export const installmentSchema = z.object({
  label: z.string().trim().min(1).max(80),
  percent: z.number().min(0).max(100),
  amount_inr: z.number().int().min(0),
  due_note: z.string().max(200),
});

export const clausesSchema = z.record(z.string(), z.string().max(8000));

export const agreementSchema = z.object({
  lead_id: z.uuid().nullable().optional(),
  client_name: z.string().trim().min(1).max(160),
  client_email: z.union([z.email(), z.literal('')]).optional(),
  client_phone: z.string().max(24).optional(),
  client_company: z.string().max(160).optional(),
  client_address: z.string().max(400).optional(),
  plan_slug: z.string().max(60).nullable().optional(),
  service_slug: z.string().max(60).nullable().optional(),
  project_title: z.string().max(200).optional(),
  items: z.array(lineSchema).min(1, 'Add at least one line item'),
  tax_percent: z.number().min(0).max(100).default(0),
  installments: z.array(installmentSchema).default([]),
  delivery_days: z.number().int().min(1).max(365).default(7),
  support_months: z.number().int().min(0).max(60).default(1),
  revisions_included: z.number().int().min(0).max(99).default(2),
  content: clausesSchema,
});

export type AgreementInput = z.infer<typeof agreementSchema>;
