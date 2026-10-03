-- Ezyjobs — creator payout state machine
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

grant execute on function public.admin_update_creator_payout(uuid,text,text)
  to authenticated;

-- Admin payout changes must go through the guarded RPC.
drop policy if exists "admins manage payouts" on public.creator_payouts;
