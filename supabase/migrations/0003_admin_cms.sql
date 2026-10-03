-- ezyjobs — Admin CMS v1
-- Execute after the base schema and EzyPublish migration.

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,89}$'),
  title text not null check (char_length(trim(title)) between 1 and 180),
  excerpt text not null default '',
  body text not null default '',
  meta_description text not null default '',
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_pages_published_idx
  on public.content_pages(published, updated_at desc);

alter table public.content_pages enable row level security;

drop policy if exists "public read published content pages" on public.content_pages;
create policy "public read published content pages"
  on public.content_pages for select
  using (published = true or public.is_admin());

drop policy if exists "admins manage content pages" on public.content_pages;
create policy "admins manage content pages"
  on public.content_pages for all
  using (public.is_admin())
  with check (public.is_admin());

drop trigger if exists content_pages_touch on public.content_pages;
create trigger content_pages_touch
before update on public.content_pages
for each row execute function public.touch_updated_at();

insert into public.content_pages(slug,title,excerpt,body,meta_description,published)
values
  ('about','من نحن','','هذه الصفحة تُدار من لوحة التحكم.','معلومات عن ezyjobs',true),
  ('terms','الشروط والأحكام','','يمكنك تعديل هذه الصفحة بالكامل من لوحة الإدارة.','الشروط والأحكام لمنصة ezyjobs',true),
  ('privacy','سياسة الخصوصية','','يمكنك تعديل هذه الصفحة بالكامل من لوحة الإدارة.','سياسة الخصوصية لمنصة ezyjobs',true),
  ('usage-policy','سياسة الاستخدام','','يمكنك تعديل هذه الصفحة بالكامل من لوحة الإدارة.','سياسة الاستخدام لمنصة ezyjobs',true)
on conflict (slug) do nothing;
