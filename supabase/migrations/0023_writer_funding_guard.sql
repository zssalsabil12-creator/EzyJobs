-- EzyPublish — writer contracts require verified Writer Reserve
do $$
declare
  writer_reserved bigint;
  active_writer_commitment bigint;
begin
  select coalesce(sum(amount_cents), 0)
    into writer_reserved
  from public.finance_allocations
  where allocation_type = 'writer_reserve'
    and status = 'active';

  select coalesce(sum(monthly_cap_cents), 0)
    into active_writer_commitment
  from public.writer_contracts
  where status = 'active'
    and (ended_at is null or ended_at > now());

  if active_writer_commitment > writer_reserved then
    raise exception 'existing_writer_commitments_not_funded';
  end if;
end $$;

create or replace function public.validate_writer_contract_funding()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  writer_reserved bigint;
  other_active_commitment bigint;
begin
  if new.status = 'active' then
    if new.monthly_cap_cents <= 0 then
      raise exception 'active_writer_contract_not_funded';
    end if;

    select coalesce(sum(amount_cents), 0)
      into writer_reserved
    from public.finance_allocations
    where allocation_type = 'writer_reserve'
      and status = 'active';

    select coalesce(sum(monthly_cap_cents), 0)
      into other_active_commitment
    from public.writer_contracts
    where id <> new.id
      and status = 'active'
      and (ended_at is null or ended_at > now());

    if other_active_commitment + new.monthly_cap_cents > writer_reserved then
      raise exception 'writer_contract_funding_exceeds_reserve';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists writer_contract_funding_guard on public.writer_contracts;
create trigger writer_contract_funding_guard
before insert or update of status, monthly_cap_cents, ended_at
on public.writer_contracts
for each row execute function public.validate_writer_contract_funding();

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
  remaining_reserve bigint;
  active_commitment bigint;
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
      into remaining_reserve
    from public.finance_allocations
    where allocation_type = 'task_reserve'
      and status = 'active';

    select coalesce(sum(funded_budget_cents), 0)
      into active_commitment
    from public.task_campaigns;

    if active_commitment > greatest(remaining_reserve, 0) then
      return jsonb_build_object(
        'ok', false,
        'reason', 'task_reserve_below_campaign_funding'
      );
    end if;
  elsif v_type = 'writer_reserve' then
    select coalesce(sum(amount_cents), 0) - v_amount
      into remaining_reserve
    from public.finance_allocations
    where allocation_type = 'writer_reserve'
      and status = 'active';

    select coalesce(sum(monthly_cap_cents), 0)
      into active_commitment
    from public.writer_contracts
    where status = 'active'
      and (ended_at is null or ended_at > now());

    if active_commitment > greatest(remaining_reserve, 0) then
      return jsonb_build_object(
        'ok', false,
        'reason', 'writer_reserve_below_contract_funding'
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
