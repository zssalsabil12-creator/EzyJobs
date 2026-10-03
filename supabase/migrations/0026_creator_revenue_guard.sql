-- EzyPublish — verified revenue must be structurally consistent
create or replace function public.admin_record_creator_revenue(
  p_article_id uuid,
  p_author_id uuid,
  p_source text,
  p_reference text,
  p_gross_cents bigint,
  p_creator_share_bps integer,
  p_status text default 'verified'
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  uid uuid := auth.uid();
  actual_author uuid;
  creator_amount bigint;
  platform_amount bigint;
  revenue_id uuid;
begin
  if uid is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  if p_source not in ('affiliate','sponsored','tips','product','other') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_source');
  end if;

  if p_status not in ('pending','verified') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_status');
  end if;

  if p_gross_cents <= 0
     or p_creator_share_bps < 0
     or p_creator_share_bps > 10000
     or char_length(trim(coalesce(p_reference, ''))) < 3 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_revenue');
  end if;

  select author_id
    into actual_author
  from public.creator_articles
  where id = p_article_id;

  if actual_author is null or actual_author <> p_author_id then
    return jsonb_build_object('ok', false, 'reason', 'article_author_mismatch');
  end if;

  creator_amount := floor(p_gross_cents * p_creator_share_bps / 10000.0);
  platform_amount := p_gross_cents - creator_amount;

  insert into public.creator_revenue_events (
    article_id,
    author_id,
    source,
    reference,
    gross_cents,
    currency,
    creator_share_bps,
    creator_cents,
    platform_cents,
    status
  )
  values (
    p_article_id,
    p_author_id,
    p_source,
    left(trim(p_reference), 254),
    p_gross_cents,
    'USD',
    p_creator_share_bps,
    creator_amount,
    platform_amount,
    p_status
  )
  returning id into revenue_id;

  return jsonb_build_object(
    'ok', true,
    'revenue_id', revenue_id,
    'creator_cents', creator_amount,
    'platform_cents', platform_amount
  );
end;
$$;

grant execute on function public.admin_record_creator_revenue(
  uuid,uuid,text,text,bigint,integer,text
) to authenticated;

drop policy if exists "admins manage creator revenue" on public.creator_revenue_events;
create policy "admins read creator revenue"
on public.creator_revenue_events for select
using (public.is_admin());

create or replace function public.validate_creator_revenue_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if new.gross_cents <> new.creator_cents + new.platform_cents then
    raise exception 'revenue_split_mismatch';
  end if;

  if new.status = 'verified'
     and char_length(trim(coalesce(new.reference, ''))) < 3 then
    raise exception 'verified_revenue_requires_reference';
  end if;

  if new.source = 'writer_fee' then
    if new.creator_share_bps <> 10000
       or new.platform_cents <> 0
       or new.creator_cents <> new.gross_cents
       or left(new.reference, 10) <> 'fixed-fee:' then
      raise exception 'invalid_writer_fee_event';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists creator_revenue_integrity on public.creator_revenue_events;
create trigger creator_revenue_integrity
before insert or update of source, reference, gross_cents, creator_share_bps,
  creator_cents, platform_cents, status
on public.creator_revenue_events
for each row execute function public.validate_creator_revenue_event();

grant execute on function public.validate_creator_revenue_event() to authenticated;
