import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/seo';
import type { SiteLocale } from '../lib/seoI18n';
import { keywordIntelligence } from '../data/keywordIntelligence';
import { slugifyKeyword } from '../lib/keywordLanding';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';

const copy = {
  ar: {
    eyebrow: 'ezyjobs / demand intelligence',
    title: 'ما الذي يبحث عنه الناس في وظائف الإنترنت والعمل عن بعد؟',
    lead: 'نربط إشارات البحث العامة بما هو متاح فعلياً من وظائف عن بعد على ezyjobs. المؤشر اتجاهي وليس حجماً رسمياً للبحث الشهري.',
    keywords: 'كلمات البحث ذات الطلب المرتفع',
    roles: 'الوظائف الأكثر ظهوراً في قاعدة الوظائف الحالية',
    signal: 'مؤشر الطلب',
    jobs: 'وظائف مطابقة',
    explore: 'ابحث عن هذه الوظائف',
    remote: 'وظيفة عن بعد',
    total: 'وظيفة',
  },
  en: {
    eyebrow: 'ezyjobs / demand intelligence',
    title: 'What people are searching for in online and remote jobs',
    lead: 'We combine public search-demand signals with live remote-job coverage. The score is directional, not an official monthly Google search-volume figure.',
    keywords: 'High-demand search terms',
    roles: 'Roles most represented in the current job supply',
    signal: 'Demand signal',
    jobs: 'Matched jobs',
    explore: 'Explore jobs',
    remote: 'remote jobs',
    total: 'jobs',
  },
  fr: {
    eyebrow: 'ezyjobs / demand intelligence',
    title: 'Ce que les internautes recherchent dans les emplois en ligne et à distance',
    lead: 'Nous combinons des signaux publics de demande de recherche avec les offres à distance disponibles. Le score est indicatif, pas un volume mensuel officiel.',
    keywords: 'Requêtes à forte demande',
    roles: 'Métiers les plus présents dans les offres actuelles',
    signal: 'Signal de demande',
    jobs: 'Offres correspondantes',
    explore: 'Voir les offres',
    remote: 'offres à distance',
    total: 'offres',
  },
} as const;

export default function DemandPage({ locale = 'ar' }: { locale?: SiteLocale }) {
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings[`demand_copy_${locale}`]);
  const fallback = copy[locale];
  const t = {
    eyebrow: cms.eyebrow || fallback.eyebrow,
    title: cms.title || fallback.title,
    lead: cms.lead || fallback.lead,
    keywords: cms.keywords || fallback.keywords,
    roles: cms.roles || fallback.roles,
    signal: cms.signal || fallback.signal,
    jobs: cms.jobs || fallback.jobs,
    explore: cms.explore || fallback.explore,
    remote: cms.remote || fallback.remote,
    total: cms.total || fallback.total,
  };

  usePageMeta({
    title: t.title + ' | ezyjobs',
    description: t.lead,
    locale,
    canonical: locale === 'ar' ? '/demand' : `/${locale}/job-search-trends`,
  });
  const top = keywordIntelligence.keywords.slice(0, 12);
  const roles = keywordIntelligence.inDemandRoles.slice(0, 12);
  const demandSignal = top.length ? Math.round(top.reduce((sum, row) => sum + row.demandScore, 0) / top.length) : 0;
  const matchedJobs = top.reduce((sum, row) => sum + row.jobMatches, 0);

  return (
    <main className="demand-shell min-h-screen bg-paper">
      <header className="demand-hero">
        <div className="demand-hero__grid" aria-hidden />
        <div className="demand-hero__content">
          <div className="demand-hero__copy">
            <p className="demand-hero__eyebrow">{t.eyebrow}</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{t.lead}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="ez-chip tone-brand">{top.length} إشارات رئيسية</span>
              <span className="ez-chip ez-chip-accent">{matchedJobs.toLocaleString('en-US')} تطابقات</span>
            </div>
          </div>
          <div className="demand-hero__signal" aria-label={`${t.signal}: ${demandSignal}`}>
            <span>{t.signal}</span>
            <strong>{demandSignal}</strong>
            <small>{locale === 'ar' ? 'متوسط اتجاهي للإشارات الحالية' : locale === 'fr' ? 'Moyenne indicative des signaux actuels' : 'Directional average across current signals'}</small>
          </div>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">{t.keywords}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {top.map((row) => (
            <article key={`${row.locale}-${row.keyword}`} className="demand-card ez-card group p-5">
              <h3 className="text-lg font-semibold">{row.keyword}</h3>
              <div className="mt-3 flex items-center justify-between text-sm opacity-75">
                <span>{t.signal}: {row.demandScore}</span>
                <span>{t.jobs}: {row.jobMatches}</span>
              </div>
              {row.suggestions.length ? (
                <p className="mt-3 text-sm leading-6 opacity-70">{row.suggestions.slice(0, 5).join(' · ')}</p>
              ) : null}
              <Link className="mt-4 inline-flex text-sm font-semibold underline underline-offset-4" to={`/search/${slugifyKeyword(row.keyword)}`}>
                {t.explore}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">{t.roles}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Link key={role.title} to={`/jobs?q=${encodeURIComponent(role.title)}`} className="demand-role ez-card group p-4">
              <div className="font-semibold">{role.title}</div>
              <div className="mt-1 text-sm opacity-70">{role.remoteCount} {t.remote} · {role.count} {t.total}</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
