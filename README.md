# FOXI TECH

Marketing site and admin back office for FOXI TECH — a web development agency.
Public pages bring leads in; the admin side tracks them through the pipeline and
turns the ones that convert into signed agreements.

Built with Next.js 16 (App Router), Supabase, and Tailwind CSS.

## What's in here

**Public site** — landing page, services, pricing, testimonials, and contact
forms that write straight into the leads table.

**Admin back office** (`/admin`, auth-gated)
- Leads pipeline — table and board views, CSV import, per-lead detail with
  notes, call/maps shortcuts, and a status history timeline
- Agreements — generate from a lead, edit before sending, send a one-time
  signing link, download the signed PDF

**Signing flow** (`/sign/[token]`, public but token-gated) — the client opens
the link, reads the agreement, types their name, and signs. No account needed.

## Security model

The signing endpoint is the only public write path that matters, so it is worth
knowing how it is guarded:

- **Tokens are hashed.** The raw signing token exists only in the send response
  and the client's browser. The database stores a SHA256 hash, so a database
  leak does not hand over working signing links.
- **One-time use.** Signing is a conditional `UPDATE ... WHERE status = 'sent'`,
  so a replayed request finds nothing to update and fails. A `UNIQUE` constraint
  on `signature_events.agreement_id` backs this at the schema level.
- **Content binding.** The client signs a hash of the exact clause text they
  were shown. If an admin edits the agreement after sending, the hash no longer
  matches and the signature is refused rather than silently applied to different
  terms.
- **Revoke on edit.** Editing a `sent` agreement nulls its token hash and drops
  it back to `draft`, killing the outstanding link instead of letting the terms
  shift under someone mid-read.
- **Immutable once signed.** Signed agreements cannot be edited — the PATCH
  route returns 409 and the edit page refuses to render the form.

Row Level Security is on for every table. The service key is server-only and
never reaches a client component.

## Running it locally

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

You need a Supabase project. Get the keys from **Project Settings → API Keys**,
or run `SUPABASE_ACCESS_TOKEN=sbp_... bash scripts/fetch-keys.sh <project-ref>`.

### Environment variables

| Variable | Where it's used | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | Safe to expose |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | browser + server | Safe to expose; RLS protects it |
| `SUPABASE_SECRET_KEY` | server only | **Bypasses RLS.** Never prefix with `NEXT_PUBLIC_` |
| `IP_HASH_SALT` | server only | Any long random string; salts visitor IPs before storage |

### Creating an admin user

```bash
npm run setup:admin
```

## Database

Migrations live in `supabase/migrations/`. Apply them with the Supabase CLI:

```bash
npx supabase db push
```

Regenerate types after a schema change:

```bash
npx supabase gen types typescript --project-id <ref> --schema public > lib/supabase/types.ts
```

## Deploying

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Vercel and Supabase setup.

## Project layout

```
app/
  (public pages)          landing, services, pricing, contact
  admin/                  auth-gated back office
  sign/[token]/           public signing page
  api/                    route handlers
components/
  admin/                  back-office UI
lib/
  supabase/               clients, DAL, generated types
  pdf/                    React PDF agreement template
  agreement-*.ts          shared clause order, math, schema
supabase/migrations/      schema history
```

One thing worth knowing about the layout: `lib/agreement-clauses.ts` is the
single source of truth for which clauses exist and in what order. The signing
page, the PDF, and the content hash all read from it, so they cannot drift apart.
