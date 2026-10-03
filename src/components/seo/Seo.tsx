import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface Faq {
  q: string;
  a: string;
}

export interface LinkCard {
  to: string;
  title: string;
  meta?: string;
  count?: number;
}

/* ------------------------------------------------------------------ */

export function Breadcrumbs({ trail }: { trail: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="مسار التنقل" className="flex flex-wrap items-center gap-2 text-[12px] text-muted">
      {trail.map((t, i) => (
        <span key={t.label} className="flex items-center gap-2">
          {i > 0 && <span className="text-line">/</span>}
          {t.to ? (
            <Link to={t.to} className="transition-colors hover:text-brand">
              {t.label}
            </Link>
          ) : (
            <span className="text-ink">{t.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export const breadcrumbJsonLd = (trail: { label: string; to?: string }[], siteUrl: string) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((t, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: t.label,
    ...(t.to ? { item: `${siteUrl}${t.to}` } : {}),
  })),
});

export const faqJsonLd = (faqs: Faq[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

/* ------------------------------------------------------------------ */

export function FaqList({ faqs }: { faqs: Faq[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
      {faqs.map((f, i) => (
        <div key={f.q}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-right transition-colors hover:bg-paper-2/50"
          >
            <span className="text-[14px] font-bold text-ink">{f.q}</span>
            <span
              className={`shrink-0 text-lg leading-none text-muted transition-transform ${
                open === i ? 'rotate-45' : ''
              }`}
              aria-hidden
            >
              +
            </span>
          </button>
          {open === i && (
            <p className="px-5 pb-5 text-[13.5px] leading-[1.95] text-muted">{f.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function LinkGrid({
  title,
  description,
  items,
}: {
  title: string;
  description?: string;
  items: LinkCard[];
}) {
  return (
    <section>
      <h2 className="text-2xl font-black text-ink">{title}</h2>
      {description && <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>}
      <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            className="group bg-surface p-5 transition-colors hover:bg-brand-50/50"
          >
            <p className="text-[14px] font-bold text-ink transition-colors group-hover:text-brand">
              {i.title}
            </p>
            {i.meta && <p className="mt-1 text-[12px] text-muted">{i.meta}</p>}
            {typeof i.count === 'number' && (
              <p className="mt-2 text-[11.5px] font-semibold text-brand">
                <span className="tnum">{i.count}</span> فرصة
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function StatsStrip({
  items,
  onDark,
}: {
  items: { label: string; value: string | number }[];
  onDark?: boolean;
}) {
  return (
    <div
      className={`grid gap-px overflow-hidden rounded-2xl ${
        onDark ? 'bg-white/10' : 'bg-line'
      } border ${onDark ? 'border-white/10' : 'border-line'} sm:grid-cols-4`}
    >
      {items.map((s) => (
        <div key={s.label} className={`p-5 ${onDark ? 'bg-abyss' : 'bg-surface'}`}>
          <p
            className={`tnum font-display text-2xl font-bold ${
              onDark ? 'text-white' : 'text-ink'
            }`}
          >
            {s.value}
          </p>
          <p className={`mt-1 text-[12px] ${onDark ? 'text-white/45' : 'text-muted'}`}>
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="ez-prose max-w-3xl text-[15px] leading-[2] text-ink/80 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-ink [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-ink [&_li]:mb-2 [&_ol]:list-decimal [&_ol]:pr-5 [&_strong]:font-bold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:pr-5">
      {children}
    </div>
  );
}
