# Deploying FOXI TECH to Vercel

This guide walks through deploying the project to Vercel and connecting it to your existing Supabase project.

## Prerequisites

- A Vercel account (free tier works)
- The GitHub repo `rohitgunthal18/foxicon` pushed and ready
- Your existing Supabase project (`kppbasebdmepfcdeppwr`)

## Step 1: Push to GitHub

The repo is already initialized locally. To push it:

```bash
# Add the GitHub remote (replace with your actual repo URL if different)
git remote add origin https://github.com/rohitgunthal18/foxicon.git

# Stage everything (.gitignore already excludes .env* and node_modules)
git add .

# Commit
git commit -m "Initial commit: FOXI TECH site and admin back office

- Public landing pages (services, pricing, contact)
- Admin back office with leads pipeline and agreements
- Token-gated signing flow with SHA256 hashing
- React PDF agreement generation
- Supabase backend with RLS

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"

# Push to main
git push -u origin main
```

## Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Find `rohitgunthal18/foxicon` in the list (or paste the URL)
4. Click **Import**
5. Vercel auto-detects Next.js — leave **Framework Preset** as `Next.js`
6. Leave **Build Command** and **Output Directory** at their defaults
7. **Do not deploy yet** — click **Environment Variables** first

## Step 3: Configure Environment Variables

Click **Add** for each variable below. All four are **required**.

Get the actual values from your Supabase dashboard (see "Where to find these keys" below) or from your local `.env.local` file. **Never write real keys into a file that gets committed.**

### Public Variables (safe to expose)

| Name | Where to get it | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → **Project URL** | Looks like `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API Keys → **anon / publishable** | Starts with `sb_publishable_`. RLS protects it |

### Server-Only Variables (never expose to browser)

| Name | Where to get it | Notes |
| --- | --- | --- |
| `SUPABASE_SECRET_KEY` | Supabase → Project Settings → API Keys → **service_role / secret** | Starts with `sb_secret_`. **Bypasses RLS** |
| `IP_HASH_SALT` | Generate: `openssl rand -hex 32` | Any long random string. Reuse the one from `.env.local` so existing hashed IPs stay consistent |

**Where to find these keys:**

1. Open the [Supabase dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Project Settings → API Keys**
4. Copy each value into the matching Vercel variable

Your local `.env.local` already has all four filled in — copying from there is the
quickest path, and it guarantees production matches what you tested against.

After adding all four, click **Deploy**.

## Step 4: Update Supabase Auth Redirect URLs

Once the deploy finishes, Vercel gives you a production URL like `foxicon.vercel.app` or `foxicon-rohitgunthal18.vercel.app`.

1. Copy that URL (without `https://`)
2. In the Supabase dashboard, go to **Authentication → URL Configuration**
3. Under **Redirect URLs**, add:
   ```
   https://your-vercel-url.vercel.app/login
   https://your-vercel-url.vercel.app/admin
   ```
4. Click **Save**

This lets admins log in on the production site. Without it, Supabase auth redirects fail.

## Step 5: Verify the Deploy

Open your Vercel URL and check:

- **Public pages load** — `/`, `/services`, `/pricing`
- **Contact form writes to leads** — fill one out, then check the `leads` table in Supabase
- **Admin login works** — `/login`, use the admin account you created with `npm run setup:admin`
- **Agreements generate PDFs** — create one, send it, open the signing link
- **Signing flow works end-to-end** — sign an agreement, download the PDF

## Troubleshooting

**Build fails with "Module not found: Can't resolve '@react-pdf/renderer'"**
- Should not happen — `next.config.ts` already has `serverExternalPackages: ['@react-pdf/renderer']`
- If it does, check that `next.config.ts` was committed

**Admin login redirects to localhost**
- You forgot Step 4 — add your Vercel URL to Supabase's Redirect URLs

**Agreement PDFs are blank**
- Check the Vercel logs (Dashboard → your project → Deployments → click the latest → Runtime Logs)
- Look for errors from `/api/admin/agreements/[id]/pdf` or `/api/sign/[token]/pdf`
- Common cause: missing env var

**Signing link says "Invalid or expired"**
- The agreement was edited after sending (this revokes the link by design)
- Or the token_hash in the database doesn't match — check the `agreements` table

**CSV import times out**
- Vercel's free tier has a 10-second function limit
- Split large CSVs into smaller batches

## Custom Domain (Optional)

To use your own domain instead of `*.vercel.app`:

1. In Vercel: **Project Settings → Domains**
2. Add your domain (e.g. `foxitech.in`)
3. Vercel shows you the DNS records to add
4. After DNS propagates, go back to Supabase and add the custom domain to **Redirect URLs** (Step 4 above)

## Re-deploying After Changes

Vercel auto-deploys every push to `main`. To deploy a change:

```bash
git add .
git commit -m "Your change description"
git push
```

Vercel builds and deploys automatically. You'll get a notification when it's live.

## Environment Variable Updates

To change an env var after the initial deploy:

1. Vercel Dashboard → your project → **Settings → Environment Variables**
2. Find the variable, click the three dots, **Edit**
3. Save the new value
4. **Redeploy** — Vercel doesn't pick up env changes until you redeploy. Go to **Deployments**, click the three dots on the latest, **Redeploy**.

## Security Notes

- Never commit `.env.local` or any file with real keys
- The service role key (`SUPABASE_SECRET_KEY`) bypasses all Row Level Security — keep it server-only, never prefix it with `NEXT_PUBLIC_`
- Signing tokens are SHA256-hashed before storage — a database leak does not hand over working links
- All tables use RLS — the only unprotected write path is the signing endpoint, and it is guarded by token hash, content hash, one-shot conditional update, and a UNIQUE constraint

## Logs and Monitoring

- **Vercel logs**: Dashboard → Deployments → click a deploy → Runtime Logs
- **Supabase logs**: Dashboard → Logs → Database / API / Auth
- Use these to troubleshoot 500 errors, failed auth, or missing data

---

You're live. Send the Vercel URL to clients and they can sign agreements straight from the link.
