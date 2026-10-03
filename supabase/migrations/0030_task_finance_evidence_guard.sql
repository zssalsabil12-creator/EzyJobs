-- EzyTasks — only evidenced approved claims count as verified platform revenue

create or replace function public.get_finance_control()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  verified_platform bigint;
  task_verified_margin bigint;
  platform_revenue bigint;
  active_allocated bigint;
  writer_reserved bigint;
  task_reserved bigint;
  operating_reserved bigint;
  task_missing_evidence bigint;
begin
  if not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  select coalesce(sum(platform_cents), 0)
    into verified_platform
  from public.creator_revenue_events
  where status = 'verified';

  select coalesce(sum(platform_margin_cents), 0)
    into task_verified_margin
  from public.task_claims
  where status = 'approved'
    and char_length(trim(coalesce(partner_revenue_reference, ''))) >= 3
    and partner_revenue_cents >= student_reward_cents
    and platform_margin_cents >= 0;

  select count(*)
    into task_missing_evidence
  from public.task_claims
  where status = 'approved'
    and (
      char_length(trim(coalesce(partner_revenue_reference, ''))) < 3
      or partner_revenue_cents < student_reward_cents
      or platform_margin_cents < 0
    );

  platform_revenue := greatest(verified_platform + task_verified_margin, 0);

  select coalesce(sum(amount_cents), 0)
    into active_allocated
  from public.finance_allocations
  where status = 'active';

  select coalesce(sum(amount_cents), 0)
    into writer_reserved
  from public.finance_allocations
  where status = 'active' and allocation_type = 'writer_reserve';

  select coalesce(sum(amount_cents), 0)
    into task_reserved
  from public.finance_allocations
  where status = 'active' and allocation_type = 'task_reserve';

  select coalesce(sum(amount_cents), 0)
    into operating_reserved
  from public.finance_allocations
  where status = 'active' and allocation_type = 'operating_reserve';

  return jsonb_build_object(
    'ok', true,
    'platform_revenue_cents', platform_revenue,
    'active_allocated_cents', active_allocated,
    'unallocated_platform_cents', greatest(platform_revenue - active_allocated, 0),
    'writer_reserve_cents', writer_reserved,
    'task_reserve_cents', task_reserved,
    'operating_reserve_cents', operating_reserved,
    'task_approved_missing_evidence_count', task_missing_evidence
  );
end;
$$;

grant execute on function public.get_finance_control() to authenticated;

create or replace function public.admin_create_finance_allocation(
  p_allocation_type text,
  p_amount_cents bigint,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  verified_platform bigint;
  task_verified_margin bigint;
  platform_revenue bigint;
  active_allocated bigint;
  allocation_id uuid;
begin
  if uid is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  if p_allocation_type not in ('writer_reserve','task_reserve','operating_reserve')
     or p_amount_cents <= 0 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_allocation');
  end if;

  select coalesce(sum(platform_cents), 0)
    into verified_platform
  from public.creator_revenue_events
  where status = 'verified';

  select coalesce(sum(platform_margin_cents), 0)
    into task_verified_margin
  from public.task_claims
  where status = 'approved'
    and char_length(trim(coalesce(partner_revenue_reference, ''))) >= 3
    and partner_revenue_cents >= student_reward_cents
    and platform_margin_cents >= 0;

  platform_revenue := greatest(verified_platform + task_verified_margin, 0);

  select coalesce(sum(amount_cents), 0)
    into active_allocated
  from public.finance_allocations
  where status = 'active';

  if active_allocated + p_amount_cents > platform_revenue then
    return jsonb_build_object(
      'ok', false,
      'reason', 'allocation_exceeds_available',
      'available_cents', greatest(platform_revenue - active_allocated, 0)
    );
  end if;

  insert into public.finance_allocations (
    allocation_type, amount_cents, note, created_by
  )
  values (
    p_allocation_type, p_amount_cents,
    left(trim(coalesce(p_note, '')), 1000), uid
  )
  returning id into allocation_id;

  return jsonb_build_object(
    'ok', true,
    'allocation_id', allocation_id,
    'available_cents', greatest(platform_revenue - active_allocated - p_amount_cents, 0)
  );
end;
$$;

grant execute on function public.admin_create_finance_allocation(text,bigint,text)
  to authenticated;
