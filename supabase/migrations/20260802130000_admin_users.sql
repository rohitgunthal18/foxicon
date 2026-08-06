-- Admin authentication and authorisation.
--
-- Admin identity lives in Supabase Auth (auth.users). This table adds the
-- application-level facts: display name, role and whether the account is still
-- allowed in. Membership of this table IS the admin grant — a Supabase Auth
-- user with no active row here can log in but reaches nothing.
--
-- There is deliberately no self-signup path. Accounts are created by an
-- existing owner (or the provisioning script) using the secret key.

create type public.admin_role as enum ('owner', 'admin', 'staff');

create table public.admin_users (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null check (length(trim(full_name)) between 1 and 120),
  email      text not null unique,
  role       public.admin_role not null default 'staff',
  is_active  boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index admin_users_active_idx on public.admin_users (is_active) where is_active;

create trigger admin_users_set_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();

alter table public.admin_users enable row level security;

-- An admin may read only their own row, and only while active. This is defence
-- in depth: the Data Access Layer is the primary gate, but if a session token
-- ever leaked into the browser it still could not enumerate the admin list.
create policy "admins read their own row"
  on public.admin_users for select to authenticated
  using (id = (select auth.uid()) and is_active);

-- No insert/update/delete policies: account management happens server-side
-- with the secret key.

/**
 * True when the current JWT belongs to an active admin.
 * Used by RLS policies on the admin-only tables below.
 */
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = (select auth.uid()) and is_active
  );
$$;
