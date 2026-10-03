import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = fs.readFileSync('src/content/guides.ts', 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const runnable = js
  .replace(/export\s+const\s+GUIDES\s*=/, 'globalThis.GUIDES =')
  .replace(/export\s+const\s+guideBySlug[\s\S]*?;\n/, '')
  .replace(/export\s+const\s+guideCategoryName[\s\S]*?;\n/, '')
  .replace(/export\s+const\s+articleJsonLd[\s\S]*$/, '');
const ctx = { globalThis: {}, Date, Intl };
vm.runInNewContext(runnable, ctx);
const guides = ctx.globalThis.GUIDES;
if (!Array.isArray(guides) || !guides.length) throw new Error('No guides extracted');
const esc = (value) => String(value ?? '').replace(/'/g, "''");
const json = (value) => "'" + JSON.stringify(value ?? []).replace(/'/g, "''") + "'";
const rows = guides.map((g) => `  ('${esc(g.slug)}','${esc(g.title)}','${esc(g.excerpt)}',${g.minutes},'${esc(g.category)}',${json(g.body)}::jsonb,${json(g.faqs || [])}::jsonb,${json(g.related || [])}::jsonb,'${esc(g.publishedAt)}',true)`).join(',\n');
const sql = `-- ezyjobs — Guide CMS v1
create table if not exists public.guide_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,120}$'),
  title text not null check (char_length(trim(title)) between 1 and 180),
  excerpt text not null default '',
  minutes integer not null default 5 check (minutes between 1 and 240),
  category text not null default 'remote',
  body jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  related jsonb not null default '[]'::jsonb,
  published_at timestamptz not null default now(),
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists guide_pages_published_idx on public.guide_pages(published, updated_at desc);
alter table public.guide_pages enable row level security;
drop policy if exists "public read published guides" on public.guide_pages;
create policy "public read published guides" on public.guide_pages for select using (published = true or public.is_admin());
drop policy if exists "admins manage guides" on public.guide_pages;
create policy "admins manage guides" on public.guide_pages for all using (public.is_admin()) with check (public.is_admin());
drop trigger if exists guide_pages_touch on public.guide_pages;
create trigger guide_pages_touch before update on public.guide_pages for each row execute function public.touch_updated_at();

insert into public.guide_pages(slug,title,excerpt,minutes,category,body,faqs,related,published_at,published)
values
${rows}
on conflict (slug) do nothing;
`;
fs.writeFileSync('supabase/migrations/0005_guide_cms.sql', sql, 'utf8');
console.log(`generated ${guides.length} guides`);
