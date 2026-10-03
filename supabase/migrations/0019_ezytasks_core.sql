-- ezyjobs — EzyTasks performance-income marketplace core
create table if not exists public.task_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  partner_name text not null default '',
  partner_url text not null default '',
  program_type text not null default 'affiliate'
    check (program_type in ('affiliate','sponsored','partner')),
  incentive_allowed boolean not null default false,
  currency text not null default 'USD',
  partner_payout_cents bigint not null default 0 check (partner_payout_cents >= 0),
  student_reward_cents bigint not null default 0 check (student_reward_cents >= 0),
  max_budget_cents bigint not null default 0 check (max_budget_cents >= 0),
  committed_budget_cents bigint not null default 0 check (committed_budget_cents >= 0),
  hold_days integer not null default 0 check (hold_days between 0 and 90),
  validation_mode text not null default 'manual'
    check (validation_mode in ('manual','partner_webhook')),
  terms_url text not null default '',
  status text not null default 'draft'
    check (status in ('draft','active','paused','closed')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (student_reward_cents <= partner_payout_cents),
  check (program_type <> 'affiliate' or incentive_allowed or student_reward_cents = 0)
);create table if not exists public.task_offers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.task_campaigns(id) on delete cascade,
  title text not null,
  description text not null default '',
  category text not null default 'performance',
  steps text not null default '',
  estimated_minutes integer not null default 10 check (estimated_minutes between 1 and 1440),
  proof_required boolean not null default true,
  proof_instructions text not null default '',
  reward_cents bigint not null default 0 check (reward_cents >= 0),
  max_claims integer not null default 100 check (max_claims between 1 and 1000000),
  claims_count integer not null default 0 check (claims_count >= 0),
  status text not null default 'draft'
    check (status in ('draft','active','paused','closed','exhausted')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);create table if not exists public.task_claims (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.task_offers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'claimed'
    check (status in ('claimed','submitted','pending_validation','approved','rejected','reversed','paid')),
  proof_payload jsonb not null default '{}'::jsonb,
  external_reference text not null default '',
  partner_revenue_cents bigint not null default 0 check (partner_revenue_cents >= 0),
  student_reward_cents bigint not null default 0 check (student_reward_cents >= 0),
  platform_margin_cents bigint not null default 0,
  admin_note text not null default '',
  claimed_at timestamptz not null default now(),
  submitted_at timestamptz,
  validated_at timestamptz,
  reversed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (task_id, user_id)
);create table if not exists public.task_rewards (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null unique references public.task_claims(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'USD',
  status text not null default 'pending'
    check (status in ('pending','available','paid','reversed')),
  available_at timestamptz,
  paid_at timestamptz,
  payout_reference text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_events (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid references public.task_claims(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);create index if not exists idx_task_campaigns_status
  on public.task_campaigns(status, starts_at, ends_at);
create index if not exists idx_task_offers_active
  on public.task_offers(status, campaign_id, starts_at, ends_at);
create index if not exists idx_task_claims_user
  on public.task_claims(user_id, status, claimed_at);
create index if not exists idx_task_rewards_user
  on public.task_rewards(user_id, status, created_at);

alter table public.task_campaigns enable row level security;
alter table public.task_offers enable row level security;
alter table public.task_claims enable row level security;
alter table public.task_rewards enable row level security;
alter table public.task_events enable row level security;drop policy if exists "active task offers are public" on public.task_offers;
create policy "active task offers are public"
on public.task_offers for select
using (
  status = 'active'
  and exists (
    select 1 from public.task_campaigns c
    where c.id = campaign_id
      and c.status = 'active'
      and c.max_budget_cents > c.committed_budget_cents
      and (c.program_type <> 'affiliate' or c.incentive_allowed)
      and coalesce(c.starts_at, now()) <= now()
      and (c.ends_at is null or c.ends_at >= now())
  )
);

drop policy if exists "active task campaigns are public" on public.task_campaigns;
create policy "active task campaigns are public"
on public.task_campaigns for select
using (
  status = 'active'
  and max_budget_cents > committed_budget_cents
  and coalesce(starts_at, now()) <= now()
  and (ends_at is null or ends_at >= now())
);

drop policy if exists "admins manage task campaigns" on public.task_campaigns;
create policy "admins manage task campaigns"
on public.task_campaigns for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage task offers" on public.task_offers;
create policy "admins manage task offers"
on public.task_offers for all
using (public.is_admin())
with check (public.is_admin());drop policy if exists "users read own task claims" on public.task_claims;
create policy "users read own task claims"
on public.task_claims for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "users update own submitted task claims" on public.task_claims;
create policy "users update own submitted task claims"
on public.task_claims for update
using (auth.uid() = user_id and status = 'claimed')
with check (auth.uid() = user_id and status in ('claimed','submitted'));

drop policy if exists "admins manage task claims" on public.task_claims;
create policy "admins manage task claims"
on public.task_claims for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "users read own task rewards" on public.task_rewards;
create policy "users read own task rewards"
on public.task_rewards for select
using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins manage task rewards" on public.task_rewards;
create policy "admins manage task rewards"
on public.task_rewards for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "admins manage task events" on public.task_events;
create policy "admins manage task events"
on public.task_events for all
using (public.is_admin())
with check (public.is_admin());create or replace function public.claim_task(p_task_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.task_offers%rowtype;
  v_campaign public.task_campaigns%rowtype;
  v_claim_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_task
  from public.task_offers
  where id = p_task_id
  for update;

  if not found then raise exception 'task_not_found'; end if;

  select * into v_campaign
  from public.task_campaigns
  where id = v_task.campaign_id
  for update;

  if v_campaign.status <> 'active' or v_task.status <> 'active' then
    raise exception 'task_not_active';
  end if;

  if v_task.claims_count >= v_task.max_claims then
    update public.task_offers set status = 'exhausted', updated_at = now() where id = v_task.id;
    raise exception 'task_exhausted';
  end if;

  if v_task.reward_cents <= 0
     or v_task.reward_cents > v_campaign.student_reward_cents then
    raise exception 'task_reward_not_funded';
  end if;

  if v_campaign.max_budget_cents <= 0
     or v_campaign.committed_budget_cents + v_task.reward_cents > v_campaign.max_budget_cents then
    raise exception 'campaign_budget_exhausted';
  end if;

  if v_campaign.program_type = 'affiliate'
     and not v_campaign.incentive_allowed then
    raise exception 'incentive_not_allowed';
  end if;

  insert into public.task_claims(task_id, user_id, student_reward_cents)
  values (v_task.id, auth.uid(), v_task.reward_cents)
  on conflict (task_id, user_id) do nothing
  returning id into v_claim_id;

  if v_claim_id is null then raise exception 'already_claimed'; end if;

  update public.task_offers
  set claims_count = claims_count + 1,
      updated_at = now()
  where id = v_task.id;

  update public.task_campaigns
  set committed_budget_cents = committed_budget_cents + v_task.reward_cents,
      updated_at = now()
  where id = v_campaign.id;  insert into public.task_events(claim_id, actor_id, event_type)
  values (v_claim_id, auth.uid(), 'claimed');

  return v_claim_id;
end;
$$;

create or replace function public.submit_task_claim(
  p_claim_id uuid,
  p_proof_payload jsonb,
  p_external_reference text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;

  update public.task_claims
  set status = 'submitted',
      proof_payload = coalesce(p_proof_payload, '{}'::jsonb),
      external_reference = coalesce(p_external_reference, ''),
      submitted_at = now(),
      updated_at = now()
  where id = p_claim_id
    and user_id = auth.uid()
    and status = 'claimed';

  if not found then raise exception 'claim_not_editable'; end if;

  insert into public.task_events(claim_id, actor_id, event_type, payload)
  values (p_claim_id, auth.uid(), 'submitted', coalesce(p_proof_payload, '{}'::jsonb));

  return true;
end;
$$;create or replace function public.admin_review_task_claim(
  p_claim_id uuid,
  p_status text,
  p_partner_revenue_cents bigint default 0,
  p_admin_note text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim public.task_claims%rowtype;
  v_task public.task_offers%rowtype;
  v_campaign public.task_campaigns%rowtype;
  v_available timestamptz;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;

  select * into v_claim from public.task_claims where id = p_claim_id for update;
  if not found then raise exception 'claim_not_found'; end if;

  select t.* into v_task
  from public.task_offers t
  where t.id = v_claim.task_id;

  select * into v_campaign from public.task_campaigns where id = v_task.campaign_id;

  if p_status = 'approved' then
    if p_partner_revenue_cents < v_claim.student_reward_cents then
      raise exception 'insufficient_verified_revenue';
    end if;

    v_available := now() + make_interval(days => v_campaign.hold_days);

    update public.task_claims
    set status = 'approved',
        partner_revenue_cents = p_partner_revenue_cents,
        platform_margin_cents = p_partner_revenue_cents - student_reward_cents,
        admin_note = coalesce(p_admin_note, ''),
        validated_at = now(),
        updated_at = now()
    where id = p_claim_id;

    insert into public.task_rewards(
      claim_id, user_id, amount_cents, currency, status, available_at
    )
    values (
      v_claim.id, v_claim.user_id, v_claim.student_reward_cents,
      v_campaign.currency,
      case when v_campaign.hold_days = 0 then 'available' else 'pending' end,
      v_available
    )
    on conflict (claim_id) do update
      set amount_cents = excluded.amount_cents,
          available_at = excluded.available_at,
          status = excluded.status,
          updated_at = now();

  elsif p_status in ('rejected','reversed') then
    update public.task_claims
    set status = p_status,
        partner_revenue_cents = greatest(p_partner_revenue_cents, 0),
        platform_margin_cents = greatest(p_partner_revenue_cents - student_reward_cents, 0),
        admin_note = coalesce(p_admin_note, ''),
        validated_at = case when p_status = 'rejected' then now() else validated_at end,
        reversed_at = case when p_status = 'reversed' then now() else reversed_at end,
        updated_at = now()
    where id = p_claim_id;

    if p_status = 'reversed' then
      update public.task_rewards
      set status = 'reversed', updated_at = now()
      where claim_id = p_claim_id;
    end if;
  else
    raise exception 'invalid_review_status';
  end if;

  insert into public.task_events(claim_id, actor_id, event_type, payload)
  values (p_claim_id, auth.uid(), 'reviewed',
          jsonb_build_object('status', p_status, 'partner_revenue_cents', p_partner_revenue_cents));

  return true;
end;
$$;revoke all on function public.claim_task(uuid) from public;
grant execute on function public.claim_task(uuid) to authenticated;
revoke all on function public.submit_task_claim(uuid,jsonb,text) from public;
grant execute on function public.submit_task_claim(uuid,jsonb,text) to authenticated;
revoke all on function public.admin_review_task_claim(uuid,text,bigint,text) from public;
grant execute on function public.admin_review_task_claim(uuid,text,bigint,text) to authenticated;