-- Ezyjobs — financial reconciliation diagnostics
-- Read-only: detects legacy or imported inconsistencies without mutating balances.

create or replace function public.get_finance_reconciliation()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  creator_revenue_issues bigint := 0;
  task_claim_issues bigint := 0;
  task_reward_issues bigint := 0;
  payout_overdrawn_users bigint := 0;
  active_allocation_overage bigint := 0;
  writer_reserve_deficit bigint := 0;
  task_reserve_deficit bigint := 0;
  missing_task_evidence bigint := 0;
  total_issues bigint := 0;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  select count(*)
    into creator_revenue_issues
  from public.creator_revenue_events
  where gross_cents <> creator_cents + platform_cents
     or gross_cents < 0
     or creator_cents < 0
     or platform_cents < 0
     or (status = 'verified' and char_length(trim(coalesce(reference, ''))) < 3)
     or (source = 'writer_fee' and (
       creator_share_bps <> 10000
       or platform_cents <> 0
       or creator_cents <> gross_cents
       or left(reference, 10) <> 'fixed-fee:'
     ));

  select count(*)
    into task_claim_issues
  from public.task_claims
  where partner_revenue_cents < 0
     or student_reward_cents < 0
     or platform_margin_cents <> partner_revenue_cents - student_reward_cents
     or (
       status = 'approved'
       and (
         partner_revenue_cents < student_reward_cents
         or platform_margin_cents < 0
       )
     );

  select count(*)
    into task_reward_issues
  from public.task_rewards r
  join public.task_claims c on c.id = r.claim_id
  where r.amount_cents <> c.student_reward_cents
     or r.user_id <> c.user_id
     or (
       r.status in ('available','pending','paid')
       and c.status not in ('approved','paid')
     );

  with earnings as (
    select u.user_id,
      coalesce((
        select sum(creator_cents)
        from public.creator_revenue_events e
        where e.author_id = u.user_id and e.status = 'verified'
      ), 0)
      +
      coalesce((
        select sum(amount_cents)
        from public.task_rewards tr
        where tr.user_id = u.user_id and tr.status in ('available','paid')
      ), 0) as earned,
      coalesce((
        select sum(amount_cents)
        from public.creator_payouts p
        where p.user_id = u.user_id
          and p.status in ('requested','approved','paid')
      ), 0) as reserved
    from (
      select distinct user_id
      from public.creator_payouts
    ) u
  )
  select count(*)
    into payout_overdrawn_users
  from earnings
  where earned < reserved;

  select greatest(
    coalesce((
      select sum(amount_cents)
      from public.finance_allocations
      where status = 'active'
    ), 0)
    -
    (
      coalesce((
        select sum(platform_cents)
        from public.creator_revenue_events
        where status = 'verified'
      ), 0)
      +
      coalesce((
        select sum(platform_margin_cents)
        from public.task_claims
        where status = 'approved'
          and char_length(trim(coalesce(partner_revenue_reference, ''))) >= 3
          and partner_revenue_cents >= student_reward_cents
          and platform_margin_cents >= 0
      ), 0)
    ),
    0
  )
    into active_allocation_overage;

  select greatest(
    coalesce((
      select sum(monthly_cap_cents)
      from public.writer_contracts
      where status = 'active'
        and (ended_at is null or ended_at > now())
    ), 0)
    -
    coalesce((
      select sum(amount_cents)
      from public.finance_allocations
      where allocation_type = 'writer_reserve'
        and status = 'active'
    ), 0),
    0
  )
    into writer_reserve_deficit;

  select greatest(
    coalesce((
      select sum(funded_budget_cents)
      from public.task_campaigns
    ), 0)
    -
    coalesce((
      select sum(amount_cents)
      from public.finance_allocations
      where allocation_type = 'task_reserve'
        and status = 'active'
    ), 0),
    0
  )
    into task_reserve_deficit;

  select count(*)
    into missing_task_evidence
  from public.task_claims
  where status = 'approved'
    and (
      char_length(trim(coalesce(partner_revenue_reference, ''))) < 3
      or partner_revenue_cents < student_reward_cents
      or platform_margin_cents < 0
    );

  total_issues :=
    creator_revenue_issues
    + task_claim_issues
    + task_reward_issues
    + payout_overdrawn_users
    + case when active_allocation_overage > 0 then 1 else 0 end
    + case when writer_reserve_deficit > 0 then 1 else 0 end
    + case when task_reserve_deficit > 0 then 1 else 0 end
    + missing_task_evidence;

  return jsonb_build_object(
    'ok', true,
    'healthy', total_issues = 0,
    'issue_count', total_issues,
    'creator_revenue_issues', creator_revenue_issues,
    'task_claim_issues', task_claim_issues,
    'task_reward_issues', task_reward_issues,
    'payout_overdrawn_users', payout_overdrawn_users,
    'active_allocation_overage_cents', active_allocation_overage,
    'writer_reserve_deficit_cents', writer_reserve_deficit,
    'task_reserve_deficit_cents', task_reserve_deficit,
    'missing_task_evidence', missing_task_evidence
  );
end;
$$;

grant execute on function public.get_finance_reconciliation() to authenticated;
