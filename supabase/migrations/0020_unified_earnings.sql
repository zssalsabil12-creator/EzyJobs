-- Unified earnings bridge: EzyPublish + EzyTasks use the existing creator payout rail.
create or replace function public.release_due_task_rewards()
returns integer
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  released integer;
begin
  if uid is null then
    raise exception 'not_authenticated';
  end if;

  update public.task_rewards
  set status = 'available',
      updated_at = now()
  where user_id = uid
    and status = 'pending'
    and available_at is not null
    and available_at <= now();

  get diagnostics released = row_count;
  return released;
end;
$$;create or replace function public.get_my_earnings_summary()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  publish_verified bigint;
  publish_pending bigint;
  task_available bigint;
  task_pending bigint;
  payouts_reserved bigint;
  verified_total bigint;
  pending_total bigint;
  available_total bigint;
begin
  if uid is null then
    return jsonb_build_object('ok', false, 'reason', 'not_authenticated');
  end if;

  perform public.release_due_task_rewards();

  select coalesce(sum(creator_cents), 0)
    into publish_verified
  from public.creator_revenue_events
  where author_id = uid and status = 'verified';

  select coalesce(sum(creator_cents), 0)
    into publish_pending
  from public.creator_revenue_events
  where author_id = uid and status = 'pending';

  select coalesce(sum(amount_cents), 0)
    into task_available
  from public.task_rewards
  where user_id = uid and status = 'available';

  select coalesce(sum(amount_cents), 0)
    into task_pending
  from public.task_rewards
  where user_id = uid and status = 'pending';

  select coalesce(sum(amount_cents), 0)
    into payouts_reserved
  from public.creator_payouts
  where user_id = uid and status in ('requested', 'approved', 'paid');

  verified_total := publish_verified + task_available;
  pending_total := publish_pending + task_pending;
  available_total := greatest(verified_total - payouts_reserved, 0);

  return jsonb_build_object(
    'ok', true,
    'publish_verified_cents', publish_verified,
    'publish_pending_cents', publish_pending,
    'task_available_cents', task_available,
    'task_pending_cents', task_pending,
    'verified_cents', verified_total,
    'pending_cents', pending_total,
    'reserved_cents', payouts_reserved,
    'available_cents', available_total
  );
end;
$$;create or replace function public.request_creator_payout(
  p_amount_cents bigint,
  p_provider text,
  p_destination text
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
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

  if p_provider <> 'airtm'
     or p_amount_cents < 2000
     or char_length(p_destination) not between 3 and 254 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_payout');
  end if;

  perform public.release_due_task_rewards();

  -- Add the already-verified task balance to the EzyPublish balance.
  select
    coalesce((
      select sum(creator_cents)
      from public.creator_revenue_events
      where author_id = uid and status = 'verified'
    ), 0)
    +
    coalesce((
      select sum(amount_cents)
      from public.task_rewards
      where user_id = uid and status = 'available'
    ), 0)
  into earned;

  select coalesce(sum(amount_cents), 0) into reserved
  from public.creator_payouts
  where user_id = uid and status in ('requested', 'approved', 'paid');

  available := earned - reserved;
  if available < p_amount_cents then
    return jsonb_build_object(
      'ok', false,
      'reason', 'insufficient_balance',
      'available_cents', greatest(available, 0)
    );
  end if;

  insert into public.creator_payouts(user_id, provider, destination, amount_cents)
  values (uid, p_provider, trim(p_destination), p_amount_cents)
  returning id into payout_id;

  return jsonb_build_object(
    'ok', true,
    'payout_id', payout_id,
    'available_cents', greatest(available - p_amount_cents, 0)
  );
end;
$$;grant execute on function public.release_due_task_rewards() to authenticated;
grant execute on function public.get_my_earnings_summary() to authenticated;
grant execute on function public.request_creator_payout(bigint,text,text) to authenticated;