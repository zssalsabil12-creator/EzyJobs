-- EzyTasks — enforce verified reserve coverage for active campaigns
alter table public.task_campaigns
  add column if not exists funded_budget_cents bigint not null default 0
  check (funded_budget_cents >= 0);

do $$
declare
  task_reserved bigint;
  existing_committed bigint;
begin
  select coalesce(sum(amount_cents), 0)
    into task_reserved
  from public.finance_allocations
  where allocation_type = 'task_reserve'
    and status = 'active';

  select coalesce(sum(committed_budget_cents), 0)
    into existing_committed
  from public.task_campaigns;

  if existing_committed > task_reserved then
    raise exception 'existing_task_commitments_not_funded';
  end if;

  update public.task_campaigns
  set funded_budget_cents = committed_budget_cents
  where committed_budget_cents > 0;
end $$;

alter table public.task_campaigns
  drop constraint if exists task_campaigns_funded_budget_cap;
alter table public.task_campaigns
  add constraint task_campaigns_funded_budget_cap
  check (funded_budget_cents <= max_budget_cents);

create or replace function public.validate_task_campaign_funding()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  task_reserved bigint;
  other_funded bigint;
begin
  if new.funded_budget_cents < new.committed_budget_cents then
    raise exception 'campaign_funding_below_committed';
  end if;

  if new.status = 'active' and new.funded_budget_cents <= 0 then
    raise exception 'active_campaign_not_funded';
  end if;

  select coalesce(sum(amount_cents), 0)
    into task_reserved
  from public.finance_allocations
  where allocation_type = 'task_reserve'
    and status = 'active';

  select coalesce(sum(funded_budget_cents), 0)
    into other_funded
  from public.task_campaigns
  where id <> new.id;

  if other_funded + new.funded_budget_cents > task_reserved then
    raise exception 'task_campaign_funding_exceeds_reserve';
  end if;

  return new;
end;
$$;

drop trigger if exists task_campaign_funding_guard on public.task_campaigns;
create trigger task_campaign_funding_guard
before insert or update of status, funded_budget_cents, max_budget_cents, committed_budget_cents
on public.task_campaigns
for each row execute function public.validate_task_campaign_funding();

create or replace function public.claim_task(p_task_id uuid)
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

  if v_campaign.funded_budget_cents <= 0 then
    raise exception 'campaign_not_funded';
  end if;

  if v_task.claims_count >= v_task.max_claims then
    update public.task_offers set status = 'exhausted', updated_at = now() where id = v_task.id;
    raise exception 'task_exhausted';
  end if;

  if v_task.reward_cents <= 0
     or v_task.reward_cents > v_campaign.student_reward_cents then
    raise exception 'task_reward_not_funded';
  end if;

  if v_campaign.committed_budget_cents + v_task.reward_cents > v_campaign.funded_budget_cents then
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
  where id = v_campaign.id;

  insert into public.task_events(claim_id, actor_id, event_type)
  values (v_claim_id, auth.uid(), 'claimed');

  return v_claim_id;
end;
$$;

-- Public availability follows funded capacity, not the administrative cap.
drop policy if exists "active task offers are public" on public.task_offers;
create policy "active task offers are public"
on public.task_offers for select
using (
  status = 'active'
  and exists (
    select 1 from public.task_campaigns c
    where c.id = campaign_id
      and c.status = 'active'
      and c.funded_budget_cents > c.committed_budget_cents
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
  and funded_budget_cents > committed_budget_cents
  and coalesce(starts_at, now()) <= now()
  and (ends_at is null or ends_at >= now())
);

create or replace function public.admin_release_finance_allocation(
  p_allocation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  v_type text;
  v_amount bigint;
  remaining_task_reserve bigint;
  active_task_funded bigint;
begin
  if uid is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  select allocation_type, amount_cents
    into v_type, v_amount
  from public.finance_allocations
  where id = p_allocation_id
    and status = 'active'
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'allocation_not_active');
  end if;

  if v_type = 'task_reserve' then
    select coalesce(sum(amount_cents), 0) - v_amount
      into remaining_task_reserve
    from public.finance_allocations
    where allocation_type = 'task_reserve'
      and status = 'active';

    select coalesce(sum(funded_budget_cents), 0)
      into active_task_funded
    from public.task_campaigns;

    if active_task_funded > greatest(remaining_task_reserve, 0) then
      return jsonb_build_object(
        'ok', false,
        'reason', 'task_reserve_below_campaign_funding'
      );
    end if;
  end if;

  update public.finance_allocations
  set status = 'released',
      released_by = uid,
      released_at = now(),
      updated_at = now()
  where id = p_allocation_id
    and status = 'active';

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.admin_release_finance_allocation(uuid) to authenticated;

-- Prevent double-review and release budget when a claim is rejected/reversed.
create or replace function public.admin_review_task_claim(
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
  v_was_committed boolean;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;

  select * into v_claim from public.task_claims where id = p_claim_id for update;
  if not found then raise exception 'claim_not_found'; end if;

  select t.* into v_task
  from public.task_offers t
  where t.id = v_claim.task_id
  for update;

  select * into v_campaign
  from public.task_campaigns
  where id = v_task.campaign_id
  for update;

  v_was_committed := v_claim.status in ('claimed','submitted','pending_validation','approved');

  if p_status = 'approved' then
    if v_claim.status not in ('claimed','submitted','pending_validation') then
      raise exception 'claim_not_reviewable';
    end if;

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

  elsif p_status = 'rejected' then
    if v_claim.status not in ('claimed','submitted','pending_validation') then
      raise exception 'claim_not_reviewable';
    end if;

    update public.task_claims
    set status = 'rejected',
        partner_revenue_cents = 0,
        platform_margin_cents = 0,
        admin_note = coalesce(p_admin_note, ''),
        validated_at = now(),
        updated_at = now()
    where id = p_claim_id;

  elsif p_status = 'reversed' then
    if v_claim.status <> 'approved' then
      raise exception 'claim_not_reversible';
    end if;

    update public.task_claims
    set status = 'reversed',
        partner_revenue_cents = greatest(p_partner_revenue_cents, 0),
        platform_margin_cents = greatest(p_partner_revenue_cents - student_reward_cents, 0),
        admin_note = coalesce(p_admin_note, ''),
        reversed_at = now(),
        updated_at = now()
    where id = p_claim_id;

    update public.task_rewards
    set status = 'reversed', updated_at = now()
    where claim_id = p_claim_id;
  else
    raise exception 'invalid_review_status';
  end if;

  if p_status in ('rejected','reversed') and v_was_committed then
    update public.task_campaigns
    set committed_budget_cents = greatest(
          committed_budget_cents - v_claim.student_reward_cents, 0
        ),
        updated_at = now()
    where id = v_campaign.id;
  end if;

  insert into public.task_events(claim_id, actor_id, event_type, payload)
  values (
    p_claim_id, auth.uid(), 'reviewed',
    jsonb_build_object(
      'status', p_status,
      'partner_revenue_cents', p_partner_revenue_cents
    )
  );

  return true;
end;
$$;

grant execute on function public.admin_review_task_claim(uuid,text,bigint,text) to authenticated;
