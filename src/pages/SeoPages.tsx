import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Job } from '../types';
import { emptyFilters } from '../types';
import { CATEGORIES, COUNTRIES, categoryBySlug, countryBySlug } from '../data/taxonomy';
import { filterJobs, matchJob } from '../lib/match';
import { useProfile } from '../features/profile/ProfileContext';
import { usePageMeta } from '../lib/seo';
import { usePublicSiteSettings } from '../lib/siteSettings';
import JobCard from '../components/jobs/JobCard';
import { EmptyState, SkeletonCard } from '../components/ui/Feedback';
import { Badge } from '../components/ui/Primitives';
import { Breadcrumbs, FaqList, LinkGrid, StatsStrip, breadcrumbJsonLd, faqJsonLd, type Faq } from '../components/seo/Seo';

import PageAura from '../components/art/PageAura';
const SITE = 'https://ezyjobs.com';

const parseLandingCopy = (value: string | undefined) => {
  const map: Record<string, string> = {};
  for (const line of (value ?? '').split(/\r?\n/)) {
    const index = line.indexOf(' || ');
    if (index <= 0) continue;
    const key = line.slice(0, index).trim();
    const text = line.slice(index + 4).trim();
    if (key && text) map[key] = text;
  }
  return map;
};

const fill = (value: string | undefined, fallback: string, vars: Record<string, string>) => {
  let out = value?.trim() || fallback;
  for (const [key, replacement] of Object.entries(vars)) out = out.split('{' + key + '}').join(replacement);
  return out;
};

/* ================================================================== */
/* صفحة الدولة                                                         */
/* ================================================================== */

export function CountryPage({ jobs, loading }: { jobs: Job[]; loading: boolean }) {
  const { slug } = useParams<{ slug: string }>();
  const country = countryBySlug(slug ?? '');
  const { profile } = useProfile();
  const settings = usePublicSiteSettings();
  const cms = parseLandingCopy(settings.seo_landing_copy_ar);

  const results = useMemo(
    () =>
      country
        ? filterJobs(jobs, {
            ...emptyFilters,
            country: country.code,
            workMode: 'remote',
            sort: 'relevance',
          })
        : [],
    [jobs, country],
  );

  const confirmed = results.filter((j) => j.eligibility === 'open').length;
  const noExp = results.filter((j) => j.experienceYears === 0).length;
  const students = results.filter((j) => j.suitableForStudents).length;

  const faqs: Faq[] = useMemo(() => {
    if (!country) return [];
    const d = country.demonym;
    return [
      {
        q: `هل توجد وظائف عن بعد تقبل المتقدمين من ${country.name}؟`,
        a: `نعم، ونضع ذلك كأولوية في التصفية. في هذه الصفحة نعرض فقط الوظائف التي تسمح فعلياً للمتقدمين من ${country.name} بالتقديم. من أصل ${results.length} فرصة معروضة، ${confirmed} منها الأهلية فيها مؤكدة صراحة في نص الإعلان.`,
      },
      {
        q: `كيف أعرف أن وظيفة "عن بعد" تقبل ${d}؟`,
        a: `كل بطاقة في هذه الصفحة تحمل وسم الأهلية. المعنى: «مؤكدة» يعني أن الإعلان يذكر قبول المتقدمين من دولتك صراحة، و«محدودة» يعني أن هناك قائمة دول يجب أن تكون ضمنها، و«غير واضحة» يعني أن الإعلان لم يحدد. افتح أي وظيفة لترى الدول المقبولة كاملة.`,
      },
      {
        q: 'هل أحتاج إلى تأشيرة أو إقامة في بلد الشركة؟',
        a: 'كل بطاقة في هذه الصفحة تحمل وسم الأهلية. المعنى: «مؤكدة» يعني أن الإعلان يذكر قبول المتقدمين من دولتك صراحة، و«محدودة» يعني أن هناك قائمة دول يجب أن تكون ضمنها، و«غير واضحة» يعني أن الإعلان لم يحدد. افتح أي وظيفة لترى الدول المقبولة كاملة.',
      },
      {
        q: 'هل التقديم يتم عبر ezyjobs؟',
        a: 'لا. ezyjobs لا توظّف ولا تمثّل أي شركة. كل وظيفة تحوي زر «التقديم من المصدر الأصلي» الذي ينقلك إلى موقع الشركة أو لوحة التوظيف الرسمية، ومعه اسم المصدر ورابطه.',
      },
      {
        q: 'ما أفضل وقت للتقديم؟',
        a: `الإعلانات عن بُعد تُنشر وتُغلق بسرعة. في الصفحة الرئيسية نرتب حسب "الأحدث نشراً" حتى لا تفوتك فرصة عمرها يومان.`,
      },
    ];
  }, [country, results.length, confirmed]);

  const countryName = country?.name ?? '';
  const countryDemonym = country?.demonym ?? '';
  const countryTitle = fill(cms.countryLead, `كل وظيفة في هذه الصفحة تسمح للمتقدمين من ${countryName} بالتقديم. نعرض الأهلية المؤكدة أولاً، ونشرح لك ما ينقصك قبل أن تتقدم.`, { country: countryName });
  const countryMetaTitle = fill(cms.countryMetaTitle, `وظائف عن بعد ${countryDemonym} — ${countryName} | ezyjobs`, { country: countryName, demonym: countryDemonym });
  const countryMetaDescription = fill(cms.countryMetaDescription, `وظائف عن بعد تقبل المتقدمين من ${countryName}: خدمة عملاء، إدخال بيانات، كتابة، وتدريب. مع تحديد الأهلية ومستوى الخبرة بالعربية قبل التقديم.`, { country: countryName });
  const trail = country
    ? [
        { label: 'الرئيسية', to: '/' },
        { label: 'الدول', to: '/country/algeria' },
        { label: country.name },
      ]
    : [];

  usePageMeta(
    country
      ? {
          title: countryMetaTitle,
          description: countryMetaDescription,
          jsonLd: {
            '@graph': [
              breadcrumbJsonLd(trail, SITE),
              faqJsonLd(faqs),
              {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: `وظائف عن بعد ${country.demonym}`,
                inLanguage: 'ar',
                url: `${SITE}/country/${country.slug}`,
              },
            ],
          },
        }
      : { title: 'الدولة غير موجودة | ezyjobs', noIndex: true },
  );

  if (!country) return <NotSeoPage />;

  return (
    <SeoLanding
      kind="country"
      title={fill(cms.countryTitle, `وظائف عن بعد ${countryDemonym}`, { country: countryName, demonym: countryDemonym })}
      subtitle={countryName}
      lead={countryTitle}
      trail={trail}
      stats={[
        { label: 'فرصة مطابقة', value: results.length },
        { label: 'أهلية مؤكدة', value: confirmed },
        { label: 'بدون خبرة', value: noExp },
        { label: 'مناسبة للطلاب', value: students },
      ]}
      jobs={results}
      loading={loading}
      faqs={faqs}
      links={
        <LinkGrid
          title={cms.countryRelatedTitle?.trim() || 'وظائف عن بعد في بقية الدول'}
          description={cms.countryRelatedDescription?.trim() || 'نفس الطريقة، نفس التوضيح حول الأهلية، لدولة أخرى.'}
          items={COUNTRIES.filter((c) => c.code !== country.code)
            .slice(0, 12)
            .map((c) => ({
              to: `/country/${c.slug}`,
              title: `وظائف عن بعد ${c.demonym}`,
              meta: c.name,
            }))}
        />
      }
      fieldLinks={
        <LinkGrid
          title={cms.countryFieldsTitle?.trim() || 'تصفح حسب المجال'}
          items={CATEGORIES.filter((c) => c.id !== 'other')
            .slice(0, 9)
            .map((c) => ({
              to: `/field/${c.slug}`,
              title: `${c.name} عن بُعد`,
              meta: c.latin,
              count: jobs.filter((j) => j.category === c.id).length,
            }))}
        />
      }
      profile={profile}
    />
  );
}

/* ================================================================== */
/* صفحة المجال                                                         */
/* ================================================================== */

export function FieldPage({ jobs, loading }: { jobs: Job[]; loading: boolean }) {
  const { slug } = useParams<{ slug: string }>();
  const category = categoryBySlug(slug ?? '');
  const { profile } = useProfile();
  const settings = usePublicSiteSettings();
  const cms = parseLandingCopy(settings.seo_landing_copy_ar);

  const results = useMemo(
    () =>
      category
        ? filterJobs(jobs, { ...emptyFilters, category: category.id, workMode: 'remote' })
        : [],
    [jobs, category],
  );

  const countriesUsed = useMemo(() => {
    const set = new Set<string>();
    for (const j of results) for (const r of j.eligibleRegions) set.add(r);
    return [...set];
  }, [results]);

  const faqs: Faq[] = useMemo(() => {
    if (!category) return [];
    return [
      {
        q: `ما أفضل وظائف ${category.name} عن بُعد للمبتدئين؟`,
        a: `في هذه الصفحة تجد ${results.filter((j) => j.experienceYears === 0).length} فرصة لا تشترط خبرة سابقة. ركّز عليها أولاً، ثم انتقل للفرص التي تشترط سنة أو سنتين بعد أن يبني ملفك الأول.`,
      },
      {
        q: `كم تتعلم قبل التقديم على وظيفة ${category.name}؟`,
        a: `يعتمد على الوظيفة تحديداً، لكن قاعدة عملية: إذا كان الإعلان يذكر أداتين أو ثلاث أدوات (مثلاً منصة تصميم أو برنامج تحليل)، فتعلّمها على الأقل بتطبيق واحد صغير خلال أسبوع إلى أسبوعين. هذا كافٍ في معظم الإعلانات التي لا تطلب خبرة.`,
      },
      {
        q: `هل توجد وظائف ${category.name} تقبل الدول العربية؟`,
        a: countriesUsed.length
          ? `نعم. الوظائف المعروضة تشمل دولاً عربية من: ${countriesUsed
              .slice(0, 8)
              .map((c) => COUNTRIES.find((x) => x.code === c)?.name ?? c)
              .join('، ')}. افتح أي بطاقة لترى حالة الأهلية كاملة.`
          : 'لا توجد حالياً وظائف في هذا المجال مفتوحة للدول العربية في فهرسنا. جرّب مجالاً آخر أو فعّل التنبيهات.',
      },
      {
        q: 'هل أحتاج شهادة معتمدة؟',
        a: `معظم الوظائف عن بُعد في هذا المجال تقبل ما هو أهم من الشهادة: عمل سابق يمكن أن تعرضه. الشهادة تفيد إن كانت الوظيفة تطلبها صراحة، وتظهر كشرط في وسم "المؤهل" داخل صفحة كل وظيفة.`,
      },
    ];
  }, [category, results, countriesUsed]);

  const categoryName = category?.name ?? '';
  const fieldTitle = fill(cms.fieldTitle, `وظائف ${categoryName} عن بُعد`, { category: categoryName });
  const fieldLead = fill(cms.fieldLead, `صفحة واحدة تجمع كل وظائف ${categoryName} عن بُعد، مع ترجمة الإعلان ومستوى الخبرة والمهارات — قبل أن تضغط على التقديم.`, { category: categoryName });
  const fieldMetaTitle = fill(cms.fieldMetaTitle, `وظائف ${categoryName} عن بُعد — شرح بالعربية | ezyjobs`, { category: categoryName });
  const fieldMetaDescription = fill(cms.fieldMetaDescription, `وظائف ${categoryName} عن بُعد مترجمة ومحلّلة بالعربية، مع تحديد الأهلية ومستوى الخبرة والمهارات المطلوبة قبل التقديم.`, { category: categoryName });

  const trail = category
    ? [
        { label: 'الرئيسية', to: '/' },
        { label: 'المجالات', to: '/field/customer-support' },
        { label: category.name },
      ]
    : [];

  usePageMeta(
    category
      ? {
          title: fieldMetaTitle,
          description: fieldMetaDescription,
          jsonLd: {
            '@graph': [
              breadcrumbJsonLd(trail, SITE),
              faqJsonLd(faqs),
              {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: `وظائف ${category.name} عن بُعد`,
                inLanguage: 'ar',
                url: `${SITE}/field/${category.slug}`,
              },
            ],
          },
        }
      : { title: 'المجال غير موجود | ezyjobs', noIndex: true },
  );

  if (!category) return <NotSeoPage />;

  return (
    <SeoLanding
      kind="field"
      title={fieldTitle}
      subtitle={category.latin}
      lead={fieldLead}
      trail={trail}
      stats={[
        { label: 'فرصة في المجال', value: results.length },
        {
          label: 'أهلية مؤكدة',
          value: results.filter((j) => j.eligibility === 'open').length,
        },
        { label: 'بدون خبرة', value: results.filter((j) => j.experienceYears === 0).length },
        { label: 'للمبتدئين', value: results.filter((j) => j.experience === 'entry').length },
      ]}
      jobs={results}
      loading={loading}
      faqs={faqs}
      links={
        <LinkGrid
          title={cms.fieldRelatedTitle?.trim() || 'مجالات أخرى'}
          items={CATEGORIES.filter((c) => c.id !== category.id && c.id !== 'other').map((c) => ({
            to: `/field/${c.slug}`,
            title: `وظائف ${c.name} عن بُعد`,
            meta: c.latin,
            count: jobs.filter((j) => j.category === c.id).length,
          }))}
        />
      }
      fieldLinks={
        <LinkGrid
          title={cms.fieldCountriesTitle?.trim() || 'أو تصفّح حسب الدولة'}
          items={COUNTRIES.slice(0, 9).map((c) => ({
            to: `/country/${c.slug}`,
            title: `وظائف عن بعد ${c.demonym}`,
            meta: c.name,
          }))}
        />
      }
      profile={profile}
    />
  );
}

/* ================================================================== */

function SeoLanding({
  kind,
  title,
  subtitle,
  lead,
  trail,
  stats,
  jobs,
  loading,
  faqs,
  links,
  fieldLinks,
  profile,
}: {
  kind: 'country' | 'field';
  title: string;
  subtitle: string;
  lead: string;
  trail: { label: string; to?: string }[];
  stats: { label: string; value: number }[];
  jobs: Job[];
  loading: boolean;
  faqs: Faq[];
  links: React.ReactNode;
  fieldLinks: React.ReactNode;
  profile: { country: string; remoteOnly: boolean };
}) {
  const settings = usePublicSiteSettings();
  const cms = parseLandingCopy(settings.seo_landing_copy_ar);
  const vars: Record<string, string> = { country: subtitle, category: subtitle };
  const searchButton = fill(cms[kind === 'country' ? 'countrySearchButton' : 'fieldSearchButton'], 'ابحث بكل المعايير', vars);
  const alertButton = fill(cms[kind === 'country' ? 'countryAlertsButton' : 'fieldAlertsButton'], 'فعّل تنبيهاً لهذه الفئة', vars);
  const loadingText = fill(cms[kind === 'country' ? 'countryJobsLoading' : 'fieldJobsLoading'], 'جارٍ التحميل', vars);
  const jobsHeading = fill(cms[kind === 'country' ? 'countryJobsHeading' : 'fieldJobsHeading'], '{count} فرصة في هذه الصفحة', { ...vars, count: String(jobs.length) });
  const emptyTitle = fill(cms[kind === 'country' ? 'countryEmptyTitle' : 'fieldEmptyTitle'], 'لا توجد فرص في هذه الفئة بعد', vars);
  const emptyBody = fill(cms[kind === 'country' ? 'countryEmptyBody' : 'fieldEmptyBody'], 'الفهرس ما زال ينمو. فعّل التنبيهات ليصلك الجديد أولاً، أو تصفّح فئة مجاورة.', vars);
  const emptyButton = fill(cms[kind === 'country' ? 'countryEmptyButton' : 'fieldEmptyButton'], 'فعّل تنبيهاً', vars);
  const faqHeading = fill(cms[kind === 'country' ? 'countryFaqHeading' : 'fieldFaqHeading'], 'أسئلة متكررة', vars);
  const faqLead = fill(cms[kind === 'country' ? 'countryFaqLead' : 'fieldFaqLead'], 'إجابات مباشرة بدون حشو.', vars);
  return (
    <>
      <header className="relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
          <Breadcrumbs trail={trail} />
          <p className="mt-8 font-display text-sm tracking-[0.14em] text-muted uppercase">
            {subtitle}
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.95] text-muted">{lead}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            <Link to="/jobs" className="ez-btn ez-btn-primary px-6 py-3 text-sm">
              {searchButton}
            </Link>
            <Link to="/alerts" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
              {alertButton}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        <StatsStrip items={stats} />

        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-black text-ink">
            {loading ? loadingText : jobsHeading}
          </h2>

          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : jobs.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              body={emptyBody}
              action={
                <Link to="/alerts" className="ez-btn ez-btn-primary px-6 py-3 text-sm">
                  {emptyButton}
                </Link>
              }
            />
          ) : (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} match={matchJob(job, profile as never)} />
            ))
          )}
        </div>

        {jobs.length > 0 && kind === 'country' && (
          <p className="mt-8 text-[12.5px] leading-relaxed text-muted">
            <Badge tone="neutral">{fill(cms.countryAlertBadge, 'تنبيه', vars)}</Badge>{' '}
            {fill(cms.countryAlertBody, 'الأهلية في هذه الصفحة محسوبة آلياً من نص الإعلان وليست تأكيداً من الشركة. افتح أي وظيفة لتقرأ ما ورد فيها بالضبط، وتحقّق من صفحة التقديم الأصلية قبل الإرسال.', vars)}
          </p>
        )}
      </div>

      <div className="border-t border-line bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-[1240px] space-y-14 px-5 lg:px-10">
          {faqs.length > 0 && (
            <section>
              <h2 className="text-2xl font-black text-ink">{faqHeading}</h2>
              <p className="mt-2 text-sm text-muted">{faqLead}</p>
              <div className="mt-6">
                <FaqList faqs={faqs} />
              </div>
            </section>
          )}
          {links}
          {fieldLinks}
        </div>
      </div>
    </>
  );
}

function NotSeoPage() {
  const settings = usePublicSiteSettings();
  const cms = parseLandingCopy(settings.seo_landing_copy_ar);
  return (
    <div className="mx-auto max-w-[1240px] px-5 py-24">
      <EmptyState
        title={cms.notFoundTitle?.trim() || 'هذه الصفحة غير موجودة'}
        body={cms.notFoundBody?.trim() || 'ربما تغيّر الرابط. ابدأ من محرك البحث أو من الصفحة الرئيسية.'}
        action={
          <Link to="/jobs" className="ez-btn ez-btn-primary px-6 py-3 text-sm">
            {cms.notFoundButton?.trim() || 'محرك البحث'}
          </Link>
        }
      />
    </div>
  );
}
