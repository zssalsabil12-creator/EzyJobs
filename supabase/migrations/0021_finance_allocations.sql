create table if not exists public.finance_allocations (
  id uuid primary key default gen_random_uuid(),
  allocation_type text not null
    check (allocation_type in ('writer_reserve','task_reserve','operating_reserve')),
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null default 'USD' check (char_length(currency) = 3),
  source text not null default 'verified_platform_revenue'
    check (source = 'verified_platform_revenue'),
  status text not null default 'active'
    check (status in ('active','released','cancelled')),
  note text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  released_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  released_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists finance_allocations_active_idx
  on public.finance_allocations(status, allocation_type, created_at desc);

alter table public.finance_allocations enable row level security;

drop policy if exists "admins manage finance allocations" on public.finance_allocations;
create policy "admins manage finance allocations"
  on public.finance_allocations for all
  using (public.is_admin())
  with check (public.is_admin());create or replace function public.get_finance_control()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  verified_platform bigint;
  task_verified_margin bigint;
  platform_revenue bigint;
  active_allocated bigint;
  writer_reserved bigint;
  task_reserved bigint;
  operating_reserved bigint;
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
  where status = 'approved';

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
    'operating_reserve_cents', operating_reserved
  );
end;
$$;create or replace function public.admin_create_finance_allocation(
  p_allocation_type text,
  p_amount_cents bigint,
  p_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
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
  where status = 'approved';

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
$$;create or replace function public.admin_release_finance_allocation(
  p_allocation_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  changed boolean;
begin
  if uid is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  update public.finance_allocations
  set status = 'released',
      released_by = uid,
      released_at = now(),
      updated_at = now()
  where id = p_allocation_id
    and status = 'active';

  changed := found;

  if not changed then
    return jsonb_build_object('ok', false, 'reason', 'allocation_not_active');
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.get_finance_control() to authenticated;
grant execute on function public.admin_create_finance_allocation(text,bigint,text) to authenticated;
grant execute on function public.admin_release_finance_allocation(uuid) to authenticated;