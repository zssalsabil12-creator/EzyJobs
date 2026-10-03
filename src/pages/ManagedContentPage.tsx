import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import PageAura from '../components/art/PageAura';
import { Badge, Section } from '../components/ui/Primitives';
import { contentPageRepo, type ContentPage } from '../lib/contentPageRepo';
import { usePageMeta } from '../lib/seo';

export default function ManagedContentPage({ slug, fallback }: { slug: string; fallback: ReactNode }) {
  const [page, setPage] = useState<ContentPage | null>(null);
  const [checked, setChecked] = useState(false);
  usePageMeta({ title: page ? page.title + ' | ezyjobs' : 'ezyjobs', description: page?.metaDescription, noIndex: slug !== 'about' });
  useEffect(() => { contentPageRepo.getPublished(slug).then(r => { setPage(r.data); setChecked(true); }); }, [slug]);
  if (typeof window === 'undefined') return <>{fallback}</>;
  if (!checked) return <Section><div className="ez-panel p-10 text-center text-muted">جارٍ تحميل الصفحة</div></Section>;
  if (!page || /^يمكنك تعديل هذه الصفحة/.test(page.body)) return <>{fallback}</>;
  const blocks = page.body.split(/\r?\n\s*\r?\n/).map(x => x.trim()).filter(Boolean);
  return <div className="min-h-screen bg-paper">
    <header className="relative overflow-hidden border-b border-line bg-surface"><PageAura/><div className="relative mx-auto max-w-[1000px] px-5 py-14 lg:px-10 lg:py-20"><Badge tone="brand">ezyjobs</Badge><h1 className="mt-5 text-4xl font-black text-ink">{page.title}</h1>{page.excerpt && <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{page.excerpt}</p>}</div></header>
    <Section className="pt-10 lg:pt-14"><article className="mx-auto max-w-[820px] rounded-3xl border border-line bg-surface p-7 shadow-sm sm:p-10 space-y-6">{blocks.map((block,i)=><p key={i} className="whitespace-pre-wrap text-[16px] leading-[2] text-ink/90">{block}</p>)}</article></Section>
  </div>;
}
