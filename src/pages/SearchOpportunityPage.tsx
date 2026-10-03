import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import type { Job } from '../types';
import { emptyFilters } from '../types';
import { filterJobs } from '../lib/match';
import { keywordIntelligence } from '../data/keywordIntelligence';
import {
  keywordLocaleTitle,
  keywordRowBySlug,
  meaningfulTerms,
  slugifyKeyword,
} from '../lib/keywordLanding';
import { usePageMeta } from '../lib/seo';
import { usePublicSiteSettings } from '../lib/siteSettings';
import JobCard from '../components/jobs/JobCard';
import { Badge } from '../components/ui/Primitives';
import {
  Breadcrumbs,
  FaqList,
  LinkGrid,
  StatsStrip,
  breadcrumbJsonLd,
  faqJsonLd,
  type Faq,
} from '../components/seo/Seo';
import PageAura from '../components/art/PageAura';

const SITE = 'https://ezyjobs.com';

const copy = {
  ar: {
    eyebrow: 'فرصة بحث',
    score: 'إشارة الطلب',
    jobs: 'وظائف مطابقة',
    breadth: 'اتساع الاقتراحات',
    trend: 'إشارة الاتجاه',
    titleSuffix: ' — ezyjobs',
    lead: 'هذه الصفحة مبنية من إشارات بحث عامة ومن الوظائف المتاحة حالياً. الدرجة مؤشر اتجاهي وليست رقماً رسمياً لحجم البحث الشهري.',
    source: 'مصدر الإشارة',
    matched: 'فرص متاحة الآن',
    why: 'لماذا أنشأنا هذه الصفحة؟',
    how: 'نقرأ ترتيب اقتراحات البحث ونقارنه بما هو متاح فعلياً من وظائف عن بعد، حتى لا نقودك إلى كلمة مفتاحية بلا فرص حقيقية.',
    related: 'عبارات بحث مرتبطة',
    browse: 'استكشف النتائج',
    alert: 'فعّل تنبيهاً',
    home: 'الرئيسية',
    demand: 'اتجاهات البحث',
    faq: 'الأسئلة الشائعة',
    faqSearch: 'هل هذه أرقام رسمية لحجم البحث؟',
    faqSelection: 'كيف اخترتم الوظائف في هذه الصفحة؟',
    faqCountry: 'هل كل وظيفة تقبل المتقدمين من الجزائر؟',
    faqCountryAnswer: 'لا. الأهلية الجغرافية تُعرض على كل بطاقة. كلمة Remote وحدها لا تعني أن جميع الدول مقبولة.',
    loading: 'جارٍ تحميل الوظائف الحالية…',
    empty: 'لا توجد وظائف مباشرة تطابق هذه الفرصة حالياً.',
    signalTrend: 'الاتجاه',
    relatedMeta: 'طلب {score} · {jobs} وظائف',
    notFoundTitle: 'صفحة البحث غير موجودة',
    notFoundLead: 'استكشف محرك البحث الرئيسي للوظائف بدلاً منها.',
    notFoundButton: 'استكشف الوظائف',
  },
  en: {
    eyebrow: 'Search opportunity',
    score: 'Demand signal',
    jobs: 'Matched jobs',
    breadth: 'Suggestion breadth',
    trend: 'Trend signal',
    titleSuffix: ' — ezyjobs',
    lead: 'This page combines public search signals with jobs currently available. The score is directional, not an official monthly Google search-volume figure.',
    source: 'Signal source',
    matched: 'Current job supply',
    why: 'Why this page exists',
    how: 'We compare search-suggestion strength with actual remote-job supply so a popular phrase leads to useful results, not an empty SEO page.',
    related: 'Related searches',
    browse: 'Explore results',
    alert: 'Create an alert',
    home: 'Home',
    demand: 'Search trends',
    faq: 'FAQ',
    faqSearch: 'Is this an official search-volume figure?',
    faqSelection: 'How are jobs selected for this page?',
    faqCountry: 'Does every job accept applicants from my country?',
    faqCountryAnswer: 'No. Geographic eligibility is shown on every job card. Remote alone does not mean worldwide eligibility.',
    loading: 'Loading current jobs…',
    empty: 'No live jobs currently match this opportunity.',
    signalTrend: 'Trend',
    relatedMeta: 'Demand {score} · {jobs} jobs',
    notFoundTitle: 'Search page not found',
    notFoundLead: 'Explore the main job search instead.',
    notFoundButton: 'Browse jobs',
  },
  fr: {
    eyebrow: 'Opportunité de recherche',
    score: 'Signal de demande',
    jobs: 'Offres correspondantes',
    breadth: 'Amplitude des suggestions',
    trend: 'Signal de tendance',
    titleSuffix: ' — ezyjobs',
    lead: 'Cette page combine des signaux publics de recherche avec les offres actuellement disponibles. Le score est indicatif, pas un volume mensuel officiel.',
    source: 'Source du signal',
    matched: 'Offres disponibles',
    why: 'Pourquoi cette page existe',
    how: 'Nous comparons la force des suggestions de recherche aux offres à distance réelles pour éviter les pages SEO sans opportunités utiles.',
    related: 'Recherches associées',
    browse: 'Voir les offres',
    alert: 'Créer une alerte',
    home: 'Accueil',
    demand: 'Tendances de recherche',
    faq: 'FAQ',
    faqSearch: 'Ces données sont-elles un volume de recherche officiel ?',
    faqSelection: 'Comment les offres sont-elles sélectionnées ?',
    faqCountry: 'Toutes les offres acceptent-elles mon pays ?',
    faqCountryAnswer: 'Non. L’éligibilité géographique est indiquée sur chaque carte. « Remote » ne signifie pas que tous les pays sont acceptés.',
    loading: 'Chargement des offres actuelles…',
    empty: 'Aucune offre en direct ne correspond actuellement à cette opportunité.',
    signalTrend: 'Tendance',
    relatedMeta: 'Demande {score} · {jobs} offres',
    notFoundTitle: 'Page de recherche introuvable',
    notFoundLead: 'Consultez plutôt le moteur principal de recherche d’emplois.',
    notFoundButton: 'Voir les offres',
  },
} as const;

type OpportunityCopy = { [K in keyof (typeof copy)['ar']]: string };

function parseOpportunityCopy(value: string | undefined, fallback: OpportunityCopy): OpportunityCopy {
  const parsed = { ...fallback };
  for (const line of (value ?? '').split(/\r?\n/)) {
    const trimmed = line.trim();
    const index = trimmed.indexOf('||');
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim() as keyof OpportunityCopy;
    const val = trimmed.slice(index + 2).trim();
    if (key in parsed && val) parsed[key] = val as never;
  }
  return parsed;
}

export default function SearchOpportunityPage({
  jobs,
  loading,
}: {
  jobs: Job[];
  loading: boolean;
}) {
  const { slug = '' } = useParams<{ slug: string }>();
  const settings = usePublicSiteSettings();
  const row = keywordRowBySlug(keywordIntelligence.keywords, slug);
  const t = row
    ? parseOpportunityCopy(settings[`search_opportunity_copy_${row.locale}`], copy[row.locale])
    : parseOpportunityCopy(settings.search_opportunity_copy_en, copy.en);
  const terms = useMemo(() => (row ? meaningfulTerms(row.keyword) : []), [row]);

  const results = useMemo(() => {
    if (!row) return [];
    const filters = {
      ...emptyFilters,
      q: terms.join(' '),
      workMode: 'remote' as const,
      sort: 'relevance' as const,
      noExperienceOnly: row.intent === 'entry',
      commitment: row.intent === 'part-time' ? ('part-time' as const) : ('any' as const),
    };
    const filtered = filterJobs(jobs, filters);
    return filtered.length ? filtered : filterJobs(jobs, { ...emptyFilters, workMode: 'remote', sort: 'newest' });
  }, [jobs, row, terms]);

  const faqs: Faq[] = useMemo(() => {
    if (!row) return [];
    return [
      { q: t.faqSearch, a: t.lead },
      { q: t.faqSelection, a: t.how },
      { q: t.faqCountry, a: t.faqCountryAnswer },
    ];
  }, [row, t]);

  usePageMeta(
    row
      ? {
          title: keywordLocaleTitle(row) + t.titleSuffix,
          description: t.lead + ' ' + row.keyword,
          locale: row.locale,
          canonical: SITE + '/search/' + slugifyKeyword(row.keyword),
          jsonLd: {
            '@graph': [
              breadcrumbJsonLd(
                [
                  { label: t.home, to: '/' },
                  { label: t.demand, to: row.locale === 'ar' ? '/demand' : row.locale === 'fr' ? '/fr/tendances-emploi' : '/en/job-search-trends' },
                  { label: row.keyword },
                ],
                SITE,
              ),
              faqJsonLd(faqs),
              {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: keywordLocaleTitle(row),
                description: t.lead,
                inLanguage: row.locale,
                url: SITE + '/search/' + slugifyKeyword(row.keyword),
              },
            ],
          },
        }
      : { title: 'Search page not found | ezyjobs', noIndex: true },
  );

  if (!row) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-16">
        <h1 className="text-3xl font-black text-ink">{t.notFoundTitle}</h1>
        <p className="mt-3 text-muted">{t.notFoundLead}</p>
        <Link to="/jobs" className="ez-btn ez-btn-primary mt-6 inline-flex px-6 py-3">{t.notFoundButton}</Link>
      </main>
    );
  }
  const related = keywordIntelligence.keywords
    .filter((item) => item.keyword !== row.keyword && item.locale === row.locale)
    .slice(0, 9);

  return (
    <>
      <header className="search-opportunity-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
          <Breadcrumbs
            trail={[
              { label: t.home, to: '/' },
              { label: t.demand, to: row.locale === 'ar' ? '/demand' : row.locale === 'fr' ? '/fr/tendances-emploi' : '/en/job-search-trends' },
              { label: row.keyword },
            ]}
          />
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            {t.eyebrow}
          </p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-ink sm:text-5xl">
            {keywordLocaleTitle(row)}
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-[1.95] text-muted">{t.lead}</p>
          <div className="mt-7 flex flex-wrap gap-2">
            <Link to={'/jobs?q=' + encodeURIComponent(row.keyword)} className="ez-btn ez-btn-primary px-6 py-3 text-sm">
              {t.browse}
            </Link>
            <Link to="/alerts" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
              {t.alert}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        <StatsStrip
          items={[
            { label: t.score, value: row.demandScore },
            { label: t.jobs, value: row.jobMatches },
            { label: t.breadth, value: row.suggestionCount },
            { label: t.trend, value: row.trendScore ?? 0 },
          ]}
        />

        <section className="mt-12">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{t.source}: {row.demandSignals.join(' · ')}</Badge>
            {row.trendTraffic && <Badge tone="brand">{t.signalTrend}: {row.trendTraffic}</Badge>}
          </div>
          <h2 className="mt-6 text-2xl font-black text-ink">{t.matched}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
            {t.how}
          </p>
        </section>

        <section className="mt-8 space-y-4">
          {loading ? (
            <p className="text-sm text-muted">{t.loading}</p>
          ) : results.length ? (
            results.slice(0, 24).map((job) => (
              <JobCard key={job.id} job={job} locale={row.locale} />
            ))
          ) : (
            <p className="rounded-2xl border border-line bg-surface p-6 text-sm text-muted">
              {t.empty}
            </p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-black text-ink">{t.why}</h2>
          <p className="mt-3 max-w-3xl text-[14px] leading-[1.9] text-muted">{t.how}</p>
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-black text-ink">{t.related}</h2>
          <LinkGrid
            title={t.related}
            items={related.map((item) => ({
              to: '/search/' + slugifyKeyword(item.keyword),
              title: item.keyword,
              meta: t.relatedMeta.replace('{score}', String(item.demandScore)).replace('{jobs}', String(item.jobMatches)),
            }))}
          />
        </section>

        <section className="mt-14">
          <h2 className="text-2xl font-black text-ink">{t.faq}</h2>
          <div className="mt-5">
            <FaqList faqs={faqs} />
          </div>
        </section>
      </div>
    </>
  );
}
