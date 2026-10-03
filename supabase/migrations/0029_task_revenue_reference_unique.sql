-- EzyTasks — one partner revenue reference can only fund one claim

do $$
declare
  duplicate_count bigint;
begin
  select count(*) into duplicate_count
  from (
    select partner_revenue_reference
    from public.task_claims
    where char_length(trim(coalesce(partner_revenue_reference, ''))) >= 3
    group by partner_revenue_reference
    having count(*) > 1
  ) duplicates;

  if duplicate_count > 0 then
    raise exception 'duplicate_task_revenue_references_exist:%', duplicate_count;
  end if;
end;
$$;

create unique index if not exists task_claims_partner_revenue_reference_uidx
  on public.task_claims (partner_revenue_reference)
  where char_length(trim(coalesce(partner_revenue_reference, ''))) >= 3;

create or replace function public.prevent_duplicate_task_revenue_reference()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if char_length(trim(coalesce(new.partner_revenue_reference, ''))) >= 3
     and exists (
       select 1
       from public.task_claims
       where partner_revenue_reference = new.partner_revenue_reference
         and id <> new.id
     ) then
    raise exception 'duplicate_partner_revenue_reference';
  end if;

  return new;
end;
$$;

drop trigger if exists task_claims_partner_revenue_reference_guard on public.task_claims;
create trigger task_claims_partner_revenue_reference_guard
before insert or update of partner_revenue_reference
on public.task_claims
for each row execute function public.prevent_duplicate_task_revenue_reference();

grant execute on function public.prevent_duplicate_task_revenue_reference() to authenticated;
