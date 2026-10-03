-- Ezyjobs — payout backing guard and concurrent request protection

create or replace function public.request_creator_payout(
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

  -- Serialize payout requests for the same user so two concurrent requests
  -- cannot reserve the same balance twice.
  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  perform public.release_due_task_rewards();

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

  select coalesce(sum(amount_cents), 0)
    into reserved
  from public.creator_payouts
  where user_id = uid
    and status in ('requested', 'approved', 'paid');

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
$$;
create or replace function public.admin_update_creator_payout(
  p_payout_id uuid,
  p_status text,
  p_admin_note text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  current_status text;
  payout_user uuid;
  payout_amount bigint;
  earned bigint;
  reserved bigint;
  backing_available bigint;
begin
  if auth.uid() is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  if p_status not in ('approved','paid','rejected') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_status');
  end if;

  select status, user_id, amount_cents
    into current_status, payout_user, payout_amount
  from public.creator_payouts
  where id = p_payout_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'payout_not_found');
  end if;

  if current_status in ('paid','rejected') then
    return jsonb_build_object('ok', false, 'reason', 'payout_final');
  end if;

  if p_status = 'approved' and current_status <> 'requested' then
    return jsonb_build_object('ok', false, 'reason', 'invalid_transition');
  end if;

  if p_status = 'paid' and current_status <> 'approved' then
    return jsonb_build_object('ok', false, 'reason', 'payout_must_be_approved_first');
  end if;

  if p_status = 'rejected' and current_status not in ('requested','approved') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_transition');
  end if;

  if p_status in ('approved','paid') then
    perform pg_advisory_xact_lock(hashtextextended(payout_user::text, 0));

    update public.task_rewards
    set status = 'available',
        updated_at = now()
    where user_id = payout_user
      and status = 'pending'
      and available_at is not null
      and available_at <= now();

    select
      coalesce((
        select sum(creator_cents)
        from public.creator_revenue_events
        where author_id = payout_user and status = 'verified'
      ), 0)
      +
      coalesce((
        select sum(amount_cents)
        from public.task_rewards
        where user_id = payout_user and status = 'available'
      ), 0)
    into earned;

    select coalesce(sum(amount_cents), 0)
      into reserved
    from public.creator_payouts
    where user_id = payout_user
      and status in ('requested', 'approved', 'paid');

    backing_available := earned - reserved;

    if backing_available < 0 then
      return jsonb_build_object(
        'ok', false,
        'reason', 'payout_underfunded',
        'available_cents', greatest(backing_available, 0),
        'payout_cents', payout_amount
      );
    end if;
  end if;

  update public.creator_payouts
  set status = p_status,
      admin_note = left(trim(coalesce(p_admin_note, '')), 1000),
      processed_at = case
        when p_status in ('paid','rejected') then now()
        else null
      end
  where id = p_payout_id;

  return jsonb_build_object(
    'ok', true,
    'user_id', payout_user,
    'amount_cents', payout_amount,
    'status', p_status
  );
end;
$$;
grant execute on function public.request_creator_payout(bigint,text,text)
  to authenticated;

grant execute on function public.admin_update_creator_payout(uuid,text,text)
  to authenticated;
