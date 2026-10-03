-- EzyTasks — approval requires an admin-supplied partner revenue evidence reference
alter table public.task_claims
  add column if not exists partner_revenue_reference text not null default '';

alter table public.task_claims
  drop constraint if exists task_claims_partner_revenue_reference_length;

alter table public.task_claims
  add constraint task_claims_partner_revenue_reference_length
  check (char_length(partner_revenue_reference) <= 500);

drop function if exists public.admin_review_task_claim(uuid,text,bigint,text);

create or replace function public.admin_review_task_claim(
  p_claim_id uuid,
  p_status text,
  p_partner_revenue_cents bigint default 0,
  p_partner_revenue_reference text default '',
  p_admin_note text default ''
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare  v_claim public.task_claims%rowtype;
  v_task public.task_offers%rowtype;
  v_campaign public.task_campaigns%rowtype;
  v_reward_status text;
  v_available timestamptz;
  v_revenue_reference text;
begin
  if not public.is_admin() then
    raise exception 'forbidden';
  end if;

  select * into v_claim
  from public.task_claims
  where id = p_claim_id
  for update;

  if not found then
    raise exception 'claim_not_found';
  end if;  select t.* into v_task
  from public.task_offers t
  where t.id = v_claim.task_id
  for update;

  select * into v_campaign
  from public.task_campaigns
  where id = v_task.campaign_id
  for update;

  select status into v_reward_status
  from public.task_rewards
  where claim_id = p_claim_id
  for update;

  v_revenue_reference := trim(coalesce(p_partner_revenue_reference, ''));

  if p_status = 'approved' then
    if v_claim.status not in ('claimed','submitted','pending_validation') then
      raise exception 'claim_not_reviewable';
    end if;
    if p_partner_revenue_cents < v_claim.student_reward_cents then
      raise exception 'insufficient_verified_revenue';
    end if;

    if char_length(v_revenue_reference) < 3 then
      raise exception 'partner_revenue_reference_required';
    end if;

    v_available := now() + make_interval(days => v_campaign.hold_days);

    update public.task_claims
    set status = 'approved',
        partner_revenue_cents = p_partner_revenue_cents,
        partner_revenue_reference = v_revenue_reference,
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
        partner_revenue_reference = '',
        platform_margin_cents = 0,
        admin_note = coalesce(p_admin_note, ''),
        validated_at = now(),
        updated_at = now()
    where id = p_claim_id;

  elsif p_status = 'reversed' then
    if v_claim.status <> 'approved' then
      raise exception 'claim_not_reversible';
    end if;

    if v_reward_status = 'paid' then
      raise exception 'paid_claim_requires_recovery';
    end if;
    update public.task_claims
    set status = 'reversed',
        partner_revenue_cents = greatest(p_partner_revenue_cents, 0),
        partner_revenue_reference = case
          when char_length(v_revenue_reference) >= 3 then v_revenue_reference
          else partner_revenue_reference
        end,
        platform_margin_cents = greatest(p_partner_revenue_cents - student_reward_cents, 0),
        admin_note = coalesce(p_admin_note, ''),
        reversed_at = now(),
        updated_at = now()
    where id = p_claim_id;

    update public.task_rewards
    set status = 'reversed',
        updated_at = now()
    where claim_id = p_claim_id;
  else
    raise exception 'invalid_review_status';
  end if;
  if p_status in ('rejected','reversed') then
    update public.task_campaigns
    set committed_budget_cents = greatest(
          committed_budget_cents - v_claim.student_reward_cents, 0
        ),
        updated_at = now()
    where id = v_campaign.id;
  end if;

  insert into public.task_events(
    claim_id, actor_id, event_type, payload
  )
  values (
    p_claim_id,
    auth.uid(),
    'reviewed',
    jsonb_build_object(
      'status', p_status,
      'partner_revenue_cents', p_partner_revenue_cents,
      'partner_revenue_reference', case when p_status = 'approved' then v_revenue_reference else v_claim.partner_revenue_reference end,
      'reward_status_before_review', v_reward_status
    )
  );

  return true;
end;
$$;
revoke all on function public.admin_review_task_claim(uuid,text,bigint,text,text) from public;
grant execute on function public.admin_review_task_claim(uuid,text,bigint,text,text)
  to authenticated;
