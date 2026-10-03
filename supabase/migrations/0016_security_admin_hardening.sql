-- ezyjobs — Admin / RLS hardening v1
-- Uses the existing base authorization functions and adds the missing
-- publisher helper plus least-privilege RLS policies.

alter table if exists public.profiles enable row level security;
alter table if exists public.jobs enable row level security;
alter table if exists public.site_settings enable row level security;
alter table if exists public.saved_jobs enable row level security;
alter table if exists public.job_alerts enable row level security;

alter table if exists public.jobs
  add column if not exists created_by uuid references auth.users(id);

alter table if exists public.profiles drop constraint if exists profiles_role_check;
alter table if exists public.profiles
  add constraint profiles_role_check check (role in ('admin','publisher','seeker'));

create or replace function public.is_publisher_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_catalog
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('publisher','admin')
  );
$$;

revoke all on function public.is_publisher_or_admin() from public;
grant execute on function public.is_publisher_or_admin() to authenticated;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles update own non-role fields" on public.profiles;
drop policy if exists "admins manage profiles" on public.profiles;
create policy "admins manage profiles"
  on public.profiles for all
  using (public.is_admin())
  with check (public.is_admin());
drop policy if exists "public read published jobs" on public.jobs;
create policy "public read published jobs"
  on public.jobs for select
  using (status = 'published' or public.is_admin() or created_by = auth.uid());

drop policy if exists "publishers create own jobs" on public.jobs;
create policy "publishers create own jobs"
  on public.jobs for insert
  with check (created_by = auth.uid() and public.is_publisher_or_admin());

drop policy if exists "owners or admins update jobs" on public.jobs;
create policy "owners or admins update jobs"
  on public.jobs for update
  using (created_by = auth.uid() or public.is_admin())
  with check (created_by = auth.uid() or public.is_admin());

drop policy if exists "owners or admins delete jobs" on public.jobs;
create policy "owners or admins delete jobs"
  on public.jobs for delete
  using (created_by = auth.uid() or public.is_admin());

drop policy if exists "public read public settings" on public.site_settings;
create policy "public read public settings"
  on public.site_settings for select
  using (is_public = true or public.is_admin());

drop policy if exists "admins manage site settings" on public.site_settings;
create policy "admins manage site settings"
  on public.site_settings for all
  using (public.is_admin())
  with check (public.is_admin());
do $$
begin
  if to_regclass('public.saved_jobs') is not null then
    execute 'drop policy if exists "users read own saved jobs" on public.saved_jobs';
    execute 'create policy "users read own saved jobs" on public.saved_jobs for select using (user_id = auth.uid() or public.is_admin())';
    execute 'drop policy if exists "users create own saved jobs" on public.saved_jobs';
    execute 'create policy "users create own saved jobs" on public.saved_jobs for insert with check (user_id = auth.uid())';
    execute 'drop policy if exists "users delete own saved jobs" on public.saved_jobs';
    execute 'create policy "users delete own saved jobs" on public.saved_jobs for delete using (user_id = auth.uid() or public.is_admin())';
  end if;

  if to_regclass('public.job_alerts') is not null then
    execute 'drop policy if exists "admins read alerts" on public.job_alerts';
    execute 'create policy "admins read alerts" on public.job_alerts for select using (public.is_admin())';
    execute 'drop policy if exists "admins delete alerts" on public.job_alerts';
    execute 'create policy "admins delete alerts" on public.job_alerts for delete using (public.is_admin())';
  end if;
end
$$;

-- Public alert subscription remains mediated by the existing
-- security-definer RPCs; clients never receive broad table write access.
-- Existing creator/content policies continue to rely on public.is_admin().
