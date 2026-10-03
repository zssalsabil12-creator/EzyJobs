-- EzyPublish / Creator Economy v1
alter table public.profiles
  add column if not exists creator_bio text not null default '',
  add column if not exists creator_status text not null default 'active'
    check (creator_status in ('active','suspended'));

create table if not exists public.creator_articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  slug text unique not null,
  title text not null check (char_length(title) between 8 and 180),
  excerpt text not null default '',
  content text not null,
  status text not null default 'draft'
    check (status in ('draft','pending','published','rejected')),
  rejection_reason text,
  published_at timestamptz,
  views bigint not null default 0 check (views >= 0),
  qualified_reads bigint not null default 0 check (qualified_reads >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists creator_articles_author_idx on public.creator_articles(author_id, updated_at desc);
create index if not exists creator_articles_status_idx on public.creator_articles(status, published_at desc);
create index if not exists creator_articles_slug_idx on public.creator_articles(slug);

create table if not exists public.creator_events (
  id bigint generated always as identity primary key,
  article_id uuid not null references public.creator_articles(id) on delete cascade,
  event_name text not null check (event_name in ('view','qualified_read','airtm_click')),
  session_id text not null check (char_length(session_id) between 8 and 128),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists creator_events_article_idx on public.creator_events(article_id, created_at desc);
create index if not exists creator_events_session_idx on public.creator_events(session_id, created_at desc);

create table if not exists public.creator_revenue_events (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references public.creator_articles(id) on delete set null,
  author_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('affiliate','sponsored','tips','product','other')),
  reference text not null default '',
  gross_cents bigint not null check (gross_cents >= 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  creator_share_bps int not null check (creator_share_bps between 0 and 10000),
  creator_cents bigint not null check (creator_cents >= 0),
  platform_cents bigint not null check (platform_cents >= 0),
  status text not null default 'pending'
    check (status in ('pending','verified','reversed')),
  created_at timestamptz not null default now()
);

create index if not exists creator_revenue_author_idx on public.creator_revenue_events(author_id, created_at desc);
create index if not exists creator_revenue_article_idx on public.creator_revenue_events(article_id, created_at desc);

create table if not exists public.creator_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider = 'airtm'),
  handle text not null check (char_length(handle) between 3 and 254),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, provider)
);

create table if not exists public.creator_payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'airtm' check (provider = 'airtm'),
  destination text not null check (char_length(destination) between 3 and 254),
  amount_cents bigint not null check (amount_cents >= 2000),
  currency text not null default 'USD' check (char_length(currency) = 3),
  status text not null default 'requested'
    check (status in ('requested','approved','paid','rejected')),
  admin_note text not null default '',
  requested_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists creator_payouts_user_idx on public.creator_payouts(user_id, requested_at desc);

alter table public.creator_articles enable row level security;
alter table public.creator_events enable row level security;
alter table public.creator_revenue_events enable row level security;
alter table public.creator_payout_accounts enable row level security;
alter table public.creator_payouts enable row level security;

drop policy if exists "public read published creator articles" on public.creator_articles;
create policy "public read published creator articles"
  on public.creator_articles for select
  using (status = 'published' or author_id = auth.uid() or public.is_admin());

drop policy if exists "users create own creator articles" on public.creator_articles;
create policy "users create own creator articles"
  on public.creator_articles for insert
  with check (author_id = auth.uid());

drop policy if exists "authors update own creator articles" on public.creator_articles;
create policy "authors update own creator articles"
  on public.creator_articles for update
  using (author_id = auth.uid() or public.is_admin())
  with check (author_id = auth.uid() or public.is_admin());

drop policy if exists "authors delete own creator articles" on public.creator_articles;
create policy "authors delete own creator articles"
  on public.creator_articles for delete
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "authors read own revenue" on public.creator_revenue_events;
create policy "authors read own revenue"
  on public.creator_revenue_events for select
  using (author_id = auth.uid() or public.is_admin());

drop policy if exists "admins manage creator revenue" on public.creator_revenue_events;
create policy "admins manage creator revenue"
  on public.creator_revenue_events for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "owners read payout accounts" on public.creator_payout_accounts;
create policy "owners read payout accounts"
  on public.creator_payout_accounts for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "owners create payout accounts" on public.creator_payout_accounts;
create policy "owners create payout accounts"
  on public.creator_payout_accounts for insert
  with check (user_id = auth.uid());

drop policy if exists "owners update payout accounts" on public.creator_payout_accounts;
create policy "owners update payout accounts"
  on public.creator_payout_accounts for update
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "owners read payouts" on public.creator_payouts;
create policy "owners read payouts"
  on public.creator_payouts for select
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "owners create payouts" on public.creator_payouts;
create policy "owners create payouts"
  on public.creator_payouts for insert
  with check (user_id = auth.uid());

drop policy if exists "admins manage payouts" on public.creator_payouts;
create policy "admins manage payouts"
  on public.creator_payouts for update
  using (public.is_admin())
  with check (public.is_admin());

create or replace function public.get_public_creator_article(p_slug text)
returns jsonb
language sql
security definer
set search_path = public, pg_catalog
as $$
  select jsonb_build_object(
    'id', a.id,
    'slug', a.slug,
    'title', a.title,
    'excerpt', a.excerpt,
    'content', a.content,
    'status', a.status,
    'published_at', a.published_at,
    'views', a.views,
    'qualified_reads', a.qualified_reads,
    'created_at', a.created_at,
    'updated_at', a.updated_at,
    'author', jsonb_build_object(
      'username', p.username,
      'display_name', coalesce(p.display_name, p.username)
    )
  )
  from public.creator_articles a
  join public.profiles p on p.id = a.author_id
  where a.slug = p_slug and a.status = 'published'
  limit 1;
$$;

grant execute on function public.get_public_creator_article(text) to anon, authenticated;

create or replace function public.record_creator_event(
  p_article_id uuid,
  p_event_name text,
  p_session_id text
)
returns jsonb
language plpgsql
security definer set search_path = public, pg_catalog
as $$
declare
  inserted boolean := false;
begin
  if p_article_id is null or p_event_name not in ('view','qualified_read','airtm_click')
     or char_length(p_session_id) not between 8 and 128 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_input');
  end if;

  if not exists (
    select 1 from public.creator_articles
    where id = p_article_id and status = 'published'
  ) then
    return jsonb_build_object('ok', false, 'reason', 'not_public');
  end if;

  if exists (
    select 1 from public.creator_events
    where article_id = p_article_id
      and event_name = p_event_name
      and session_id = p_session_id
      and created_at > now() - interval '24 hours'
  ) then
    return jsonb_build_object('ok', true, 'duplicate', true);
  end if;

  insert into public.creator_events(article_id,event_name,session_id)
  values(p_article_id,p_event_name,p_session_id);
  inserted := true;

  if p_event_name = 'view' then
    update public.creator_articles set views = views + 1, updated_at = now()
      where id = p_article_id;
  elsif p_event_name = 'qualified_read' then
    update public.creator_articles set qualified_reads = qualified_reads + 1, updated_at = now()
      where id = p_article_id;
  end if;

  return jsonb_build_object('ok', inserted, 'duplicate', false);
end;
$$;

grant execute on function public.record_creator_event(uuid,text,text) to anon, authenticated;

create or replace function public.request_creator_payout(
  p_amount_cents bigint,
  p_provider text,
  p_destination text
)
returns jsonb
language plpgsql
security definer set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  earned bigint;
  reserved bigint;
  available bigint;
  payout_id uuid;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;
  if p_provider <> 'airtm' or p_amount_cents < 2000
     or char_length(p_destination) not between 3 and 254 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_payout');
  end if;

  select coalesce(sum(creator_cents),0) into earned
  from public.creator_revenue_events
  where author_id = uid and status = 'verified';

  select coalesce(sum(amount_cents),0) into reserved
  from public.creator_payouts
  where user_id = uid and status in ('requested','approved','paid');

  available := earned - reserved;
  if available < p_amount_cents then
    return jsonb_build_object('ok', false, 'reason', 'insufficient_balance', 'available_cents', greatest(available,0));
  end if;

  insert into public.creator_payouts(user_id,provider,destination,amount_cents)
  values(uid,p_provider,trim(p_destination),p_amount_cents)
  returning id into payout_id;

  return jsonb_build_object('ok', true, 'payout_id', payout_id);
end;
$$;

grant execute on function public.request_creator_payout(bigint,text,text) to authenticated;

insert into public.site_settings(key,value,is_public)
values
  ('airtm_referral_url', to_jsonb(''::text), true),
  ('creator_default_share_bps', to_jsonb(6000), false),
  ('creator_min_payout_cents', to_jsonb(2000), true),
  ('creator_program_enabled', to_jsonb(true), true)
on conflict (key) do nothing;

drop trigger if exists creator_articles_touch on public.creator_articles;
create trigger creator_articles_touch
before update on public.creator_articles
for each row execute function public.touch_updated_at();

drop trigger if exists creator_payout_accounts_touch on public.creator_payout_accounts;
create trigger creator_payout_accounts_touch
before update on public.creator_payout_accounts
for each row execute function public.touch_updated_at();

drop policy if exists "public cannot insert creator events" on public.creator_events;

