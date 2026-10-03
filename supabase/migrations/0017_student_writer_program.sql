-- ezyjobs — Student Writer Program v1
-- Fixed per-article income + editorial approval + local SEO gate + featured images

alter table public.creator_articles
  add column if not exists content_html text not null default '',
  add column if not exists seo_title text not null default '',
  add column if not exists seo_description text not null default '',
  add column if not exists focus_keyword text not null default '',
  add column if not exists seo_score integer not null default 0,
  add column if not exists seo_report jsonb not null default '{}'::jsonb,
  add column if not exists featured_image_url text not null default '',
  add column if not exists featured_image_alt text not null default '',
  add column if not exists font_family text not null default 'system',
  add column if not exists font_size integer not null default 18,
  add column if not exists writer_fee_cents bigint not null default 0;

alter table public.creator_articles
  drop constraint if exists creator_articles_seo_score_check;
alter table public.creator_articles
  add constraint creator_articles_seo_score_check
  check (seo_score between 0 and 100);

alter table public.creator_articles
  drop constraint if exists creator_articles_font_family_check;
alter table public.creator_articles
  add constraint creator_articles_font_family_check
  check (font_family in ('system','inter','arial','tahoma','georgia'));

alter table public.creator_articles
  drop constraint if exists creator_articles_font_size_check;
alter table public.creator_articles
  add constraint creator_articles_font_size_check
  check (font_size between 15 and 24);

alter table public.creator_articles
  drop constraint if exists creator_articles_writer_fee_check;
alter table public.creator_articles
  add constraint creator_articles_writer_fee_check
  check (writer_fee_cents >= 0);

alter table public.creator_revenue_events
  drop constraint if exists creator_revenue_events_source_check;
alter table public.creator_revenue_events
  add constraint creator_revenue_events_source_check
  check (source in ('affiliate','sponsored','tips','product','other','writer_fee'));create table if not exists public.writer_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active','paused','suspended','ended')),
  monthly_quota integer not null default 8
    check (monthly_quota between 1 and 100),
  per_article_cents bigint not null default 500
    check (per_article_cents between 100 and 100000),
  monthly_cap_cents bigint not null default 4000
    check (monthly_cap_cents between 100 and 1000000),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists writer_contracts_status_idx
  on public.writer_contracts(status, updated_at desc);

create table if not exists public.writer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  study_status text not null default '',
  field_of_study text not null default '',
  languages text not null default '',
  sample_text text not null default '',
  motivation text not null default '',
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  admin_note text not null default '',
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists writer_applications_status_idx
  on public.writer_applications(status, created_at desc);

create table if not exists public.writer_assignments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 8 and 180),
  focus_keyword text not null default '',
  brief text not null default '',
  target_words integer not null default 900 check (target_words between 300 and 5000),
  status text not null default 'open'
    check (status in ('open','claimed','submitted','closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  article_id uuid references public.creator_articles(id) on delete set null,
  due_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists writer_assignments_status_idx
  on public.writer_assignments(status, due_at nulls last, created_at desc);

create index if not exists writer_assignments_writer_idx
  on public.writer_assignments(assigned_to, updated_at desc);alter table public.writer_contracts enable row level security;
alter table public.writer_applications enable row level security;
alter table public.writer_assignments enable row level security;

drop policy if exists "writers read own contract" on public.writer_contracts;
create policy "writers read own contract"
  on public.writer_contracts for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "admins manage writer contracts" on public.writer_contracts;
create policy "admins manage writer contracts"
  on public.writer_contracts for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users read own writer application" on public.writer_applications;
create policy "users read own writer application"
  on public.writer_applications for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "users create own writer application" on public.writer_applications;
create policy "users create own writer application"
  on public.writer_applications for insert
  with check (user_id = auth.uid());

drop policy if exists "users update own pending writer application" on public.writer_applications;
create policy "users update own pending writer application"
  on public.writer_applications for update
  using (user_id = auth.uid() or public.is_admin())
  with check (public.is_admin() or (user_id = auth.uid() and status = 'pending'));drop policy if exists "writers read relevant assignments" on public.writer_assignments;
create policy "writers read relevant assignments"
  on public.writer_assignments for select
  using (
    public.is_admin()
    or assigned_to = auth.uid()
    or (status = 'open' and auth.uid() is not null)
  );

-- Assignment claiming is intentionally mediated by claim_writer_assignment().
-- Writers do not receive broad UPDATE access to assignment rows.

drop policy if exists "admins manage assignments" on public.writer_assignments;
create policy "admins manage assignments"
  on public.writer_assignments for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "users create own creator articles" on public.creator_articles;
create policy "users create own creator articles"
  on public.creator_articles for insert
  with check (
    author_id = auth.uid()
    and (
      public.is_admin()
      or status in ('draft','pending')
    )
  );

drop policy if exists "authors update own creator articles" on public.creator_articles;
create policy "authors update own creator articles"
  on public.creator_articles for update
  using (author_id = auth.uid() or public.is_admin())
  with check (
    public.is_admin()
    or (
      author_id = auth.uid()
      and status in ('draft','pending')
    )
  );create or replace function public.sync_writer_fee()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  contract_rate bigint;
begin
  if auth.uid() is not null and not public.is_admin() then
    select per_article_cents into contract_rate
    from public.writer_contracts
    where user_id = new.author_id
      and status = 'active'
      and (ended_at is null or ended_at > now())
    limit 1;
    new.writer_fee_cents := coalesce(contract_rate, 0);
  end if;
  return new;
end;
$$;

drop trigger if exists creator_articles_writer_fee on public.creator_articles;
create trigger creator_articles_writer_fee
before insert or update of author_id, status on public.creator_articles
for each row execute function public.sync_writer_fee();

create or replace function public.enforce_writer_contract_limits()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  quota integer;
  cap bigint;
  published_count integer;
  paid_this_month bigint;
begin
  if new.status <> 'published' or new.writer_fee_cents <= 0 then
    return new;
  end if;

  select monthly_quota, monthly_cap_cents
    into quota, cap
  from public.writer_contracts
  where user_id = new.author_id
    and status = 'active'
    and (ended_at is null or ended_at > now())
  limit 1;

  if quota is null then
    return new;
  end if;

  select count(*) into published_count
  from public.creator_articles
  where author_id = new.author_id
    and status = 'published'
    and published_at >= date_trunc('month', now())
    and (new.id is null or id <> new.id);

  if published_count >= quota then
    raise exception 'writer_monthly_quota_reached';
  end if;

  select coalesce(sum(creator_cents), 0) into paid_this_month
  from public.creator_revenue_events
  where author_id = new.author_id
    and source = 'writer_fee'
    and status = 'verified'
    and created_at >= date_trunc('month', now())
    and (new.id is null or article_id <> new.id);

  if paid_this_month + new.writer_fee_cents > cap then
    raise exception 'writer_monthly_cap_reached';
  end if;

  return new;
end;
$$;

drop trigger if exists creator_articles_writer_limits on public.creator_articles;
create trigger creator_articles_writer_limits
before insert or update of status, writer_fee_cents on public.creator_articles
for each row execute function public.enforce_writer_contract_limits();

create or replace function public.credit_writer_fee()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if new.status = 'published' and new.writer_fee_cents > 0 then
    insert into public.creator_revenue_events (
      article_id, author_id, source, reference,
      gross_cents, currency, creator_share_bps,
      creator_cents, platform_cents, status
    )
    select
      new.id, new.author_id, 'writer_fee',
      'fixed-fee:' || new.id::text,
      new.writer_fee_cents, 'USD', 10000,
      new.writer_fee_cents, 0, 'verified'
    where not exists (
      select 1
      from public.creator_revenue_events
      where article_id = new.id and source = 'writer_fee'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists creator_articles_credit_writer_fee on public.creator_articles;
create trigger creator_articles_credit_writer_fee
after insert or update of status on public.creator_articles
for each row execute function public.credit_writer_fee();create or replace function public.submit_writer_application(
  p_study_status text,
  p_field_of_study text,
  p_languages text,
  p_sample_text text,
  p_motivation text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  application_id uuid;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;
  if char_length(trim(coalesce(p_sample_text,''))) < 200
     or char_length(trim(coalesce(p_motivation,''))) < 40
     or char_length(trim(coalesce(p_languages,''))) < 2 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_application');
  end if;

  insert into public.writer_applications (
    user_id, study_status, field_of_study, languages, sample_text, motivation
  )
  values (
    uid, left(trim(coalesce(p_study_status,'')),120),
    left(trim(coalesce(p_field_of_study,'')),180),
    left(trim(coalesce(p_languages,'')),180),
    left(trim(p_sample_text),8000),
    left(trim(p_motivation),2000)
  )
  on conflict (user_id) do update
    set study_status = excluded.study_status,
        field_of_study = excluded.field_of_study,
        languages = excluded.languages,
        sample_text = excluded.sample_text,
        motivation = excluded.motivation,
        status = 'pending',
        admin_note = '',
        reviewed_by = null,
        reviewed_at = null,
        updated_at = now()
  returning id into application_id;

  return jsonb_build_object('ok', true, 'application_id', application_id);
end;
$$;

grant execute on function public.submit_writer_application(text,text,text,text,text)
  to authenticated;

create or replace function public.claim_writer_assignment(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  claimed boolean := false;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;
  update public.writer_assignments
    set assigned_to = uid, status = 'claimed', updated_at = now()
  where id = p_assignment_id
    and status = 'open'
    and exists (
      select 1 from public.writer_contracts
      where user_id = uid and status = 'active'
        and (ended_at is null or ended_at > now())
    );
  claimed := found;
  return jsonb_build_object('ok', claimed, 'reason', case when claimed then null else 'not_available' end);
end;
$$;

grant execute on function public.claim_writer_assignment(uuid)
  to authenticated;create or replace function public.admin_set_writer_contract(
  p_user_id uuid,
  p_status text,
  p_monthly_quota integer,
  p_per_article_cents bigint,
  p_monthly_cap_cents bigint
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  contract_id uuid;
begin
  if uid is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;
  if p_status not in ('active','paused','suspended','ended')
     or p_monthly_quota not between 1 and 100
     or p_per_article_cents not between 100 and 100000
     or p_monthly_cap_cents not between 100 and 1000000 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_contract');
  end if;

  insert into public.writer_contracts (
    user_id, status, monthly_quota, per_article_cents, monthly_cap_cents, created_by
  )
  values (
    p_user_id, p_status, p_monthly_quota,
    p_per_article_cents, p_monthly_cap_cents, uid
  )
  on conflict (user_id) do update
    set status = excluded.status,
        monthly_quota = excluded.monthly_quota,
        per_article_cents = excluded.per_article_cents,
        monthly_cap_cents = excluded.monthly_cap_cents,
        created_by = uid,
        updated_at = now()
  returning id into contract_id;

  return jsonb_build_object('ok', true, 'contract_id', contract_id);
end;
$$;

grant execute on function public.admin_set_writer_contract(uuid,text,integer,bigint,bigint)
  to authenticated;

insert into public.site_settings(key,value,is_public)
values
  ('writer_program_title', to_jsonb('برنامج الكاتب الطلابي'::text), true),
  ('writer_program_lead', to_jsonb('اكتب محتوى مفيداً للباحثين عن العمل واحصل على أجر ثابت لكل مقال مقبول.'::text), true),
  ('writer_default_fee_cents', to_jsonb(500), false),
  ('writer_default_monthly_quota', to_jsonb(8), false)
on conflict (key) do nothing;

insert into storage.buckets (id, name, public)
values ('writer-media','writer-media',true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "writer media public read" on storage.objects;
create policy "writer media public read"
  on storage.objects for select
  using (bucket_id = 'writer-media');

drop policy if exists "writers upload own media" on storage.objects;
create policy "writers upload own media"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'writer-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );drop policy if exists "writers update own media" on storage.objects;
create policy "writers update own media"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'writer-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'writer-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "writers delete own media" on storage.objects;
create policy "writers delete own media"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'writer-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop trigger if exists writer_contracts_touch on public.writer_contracts;
create trigger writer_contracts_touch
before update on public.writer_contracts
for each row execute function public.touch_updated_at();

drop trigger if exists writer_applications_touch on public.writer_applications;
create trigger writer_applications_touch
before update on public.writer_applications
for each row execute function public.touch_updated_at();

drop trigger if exists writer_assignments_touch on public.writer_assignments;
create trigger writer_assignments_touch
before update on public.writer_assignments
for each row execute function public.touch_updated_at();