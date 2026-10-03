-- EzyPublish — one revenue reference can only represent one revenue event

do $$
declare
  duplicate_count bigint;
begin
  select count(*) into duplicate_count
  from (
    select reference
    from public.creator_revenue_events
    where char_length(trim(coalesce(reference, ''))) >= 3
    group by reference
    having count(*) > 1
  ) duplicates;

  if duplicate_count > 0 then
    raise exception 'duplicate_creator_revenue_references_exist:%', duplicate_count;
  end if;
end;
$$;

create unique index if not exists creator_revenue_reference_uidx
  on public.creator_revenue_events (reference)
  where char_length(trim(coalesce(reference, ''))) >= 3;
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
  clean_reference text;
begin
  if uid is null or not public.is_admin() then
    return jsonb_build_object('ok', false, 'reason', 'forbidden');
  end if;

  clean_reference := left(trim(coalesce(p_reference, '')), 254);

  if p_source not in ('affiliate','sponsored','tips','product','other') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_source');
  end if;

  if p_status not in ('pending','verified') then
    return jsonb_build_object('ok', false, 'reason', 'invalid_status');
  end if;

  if p_gross_cents <= 0
     or p_creator_share_bps < 0
     or p_creator_share_bps > 10000
     or char_length(clean_reference) < 3 then
    return jsonb_build_object('ok', false, 'reason', 'invalid_revenue');
  end if;

  if exists (
    select 1
    from public.creator_revenue_events
    where reference = clean_reference
  ) then
    return jsonb_build_object('ok', false, 'reason', 'duplicate_reference');
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
    clean_reference,
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
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'reason', 'duplicate_reference');
end;
$$;

grant execute on function public.admin_record_creator_revenue(
  uuid,uuid,text,text,bigint,integer,text
) to authenticated;
