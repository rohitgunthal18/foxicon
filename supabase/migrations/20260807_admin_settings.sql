-- Admin Settings — secure credential storage for API integrations
--
-- Stores encrypted credentials for external services (Sarvam AI, future integrations).
-- Each setting has a key, encrypted value, and optional metadata.
-- RLS policies ensure only authenticated admins can read/write.

create table public.admin_settings (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique check (length(key) <= 100),
  value      text not null check (length(value) <= 2000),
  category   text not null default 'general' check (length(category) <= 50),
  metadata   jsonb not null default '{}'::jsonb,
  updated_by uuid references public.admin_users (id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Index for category-based filtering
create index admin_settings_category_idx on public.admin_settings (category);

-- RLS: only authenticated admins can access settings
alter table public.admin_settings enable row level security;

create policy "Admins can read all settings"
  on public.admin_settings for select
  using (exists (
    select 1 from public.admin_users
    where id = auth.uid()
  ));

create policy "Admins can insert settings"
  on public.admin_settings for insert
  with check (exists (
    select 1 from public.admin_users
    where id = auth.uid()
  ));

create policy "Admins can update settings"
  on public.admin_settings for update
  using (exists (
    select 1 from public.admin_users
    where id = auth.uid()
  ));

-- Seed default Sarvam settings with env var fallback markers
insert into public.admin_settings (key, value, category, metadata) values
  ('sarvam_api_key', '', 'sarvam', '{"env_fallback": "SARVAM_API_KEY", "label": "API Key", "type": "password"}'::jsonb),
  ('sarvam_org_id', '', 'sarvam', '{"env_fallback": "SARVAM_ORG_ID", "label": "Organization ID", "type": "text"}'::jsonb),
  ('sarvam_workspace_id', '', 'sarvam', '{"env_fallback": "SARVAM_WORKSPACE_ID", "label": "Workspace ID", "type": "text"}'::jsonb),
  ('sarvam_app_id', '', 'sarvam', '{"env_fallback": "SARVAM_APP_ID", "label": "Agent App ID", "type": "text"}'::jsonb),
  ('sarvam_connection_id', '', 'sarvam', '{"env_fallback": "SARVAM_CONNECTION_ID", "label": "Connection ID", "type": "text"}'::jsonb),
  ('sarvam_agent_phone', '', 'sarvam', '{"env_fallback": "SARVAM_AGENT_PHONE", "label": "Agent Phone Number", "type": "tel"}'::jsonb)
on conflict (key) do nothing;
