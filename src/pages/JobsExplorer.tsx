import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Job, JobFilters } from '../types';
import { emptyFilters } from '../types';
import { activeFilterCount, filterJobs, matchJob } from '../lib/match';
import { usePageMeta } from '../lib/seo';
import { SITE_URL, type SiteLocale } from '../lib/seoI18n';
import { useProfile } from '../features/profile/ProfileContext';
import { usePublicSiteSettings } from '../lib/siteSettings';
import JobCard from '../components/jobs/JobCard';
import JobFiltersPanel from '../components/jobs/JobFiltersPanel';
import ProfileBuilder from '../features/profile/ProfileBuilder';
import { EmptyState, SkeletonCard } from '../components/ui/Feedback';
import { SectionHead, TextInput } from '../components/ui/Primitives';
import { CATEGORIES } from '../data/taxonomy';

import PageAura from '../components/art/PageAura';
type PageCopy = { eyebrow: string; title: string; lead: string };
type TripleCopy = { title: string; body: string };
type MatchCopy = { summary: string; country: string; edit: string };

function parsePageCopy(value: string | undefined, key: string, fallback: PageCopy): PageCopy {
  const row = (value ?? '').split(/\r?\n/).map((line) => line.trim()).find((line) => line.startsWith(key + ' || '));
  if (!row) return fallback;
  const parts = row.split('||').map((part) => part.trim());
  return parts.length >= 4 ? { eyebrow: parts[1], title: parts[2], lead: parts.slice(3).join(' || ') } : fallback;
}

function parseLocaleCopy(value: string | undefined, locale: string, fallback: TripleCopy): TripleCopy {
  const row = (value ?? '').split(/\r?\n/).map((line) => line.trim()).find((line) => line.startsWith(locale + ' || '));
  if (!row) return fallback;
  const parts = row.split('||').map((part) => part.trim());
  return parts.length >= 3 ? { title: parts[1], body: parts.slice(2).join(' || ') } : fallback;
}

function parseMatchCopy(value: string | undefined, locale: string, fallback: MatchCopy): MatchCopy {
  const row = (value ?? '').split(/\r?\n/).map((line) => line.trim()).find((line) => line.startsWith(locale + ' || '));
  if (!row) return fallback;
  const parts = row.split('||').map((part) => part.trim());
  return parts.length >= 4 ? { summary: parts[1], country: parts[2], edit: parts[3] } : fallback;
}

function copyKey(locale: SiteLocale, preset: Partial<JobFilters>) {
  if (preset.studentsOnly) return `${locale}:students`;
  if (preset.noExperienceOnly) return `${locale}:no-experience`;
  if (preset.workMode === 'remote') return `${locale}:remote`;
  return `${locale}:default`;
}

interface Props {
  jobs: Job[];
  loading: boolean;
  /** فلاتر مثبّتة تُضاف إلى فلاتر المستخدم */
  preset?: Partial<JobFilters>;
  title?: string;
  eyebrow?: string;
  lead?: string;
  locale?: SiteLocale;
  canonicalPath?: string;
  alternates?: Partial<Record<SiteLocale | 'x-default', string>>;
}

export default function JobsExplorer({
  jobs,
  loading,
  preset = {},
  title = 'محرك البحث',
  eyebrow = 'كل الفرص',
  lead = 'صنّف النتائج بدل قراءة مئات الإعلانات. ابدأ من دولتك ومستواك، ثم اقرأ ما يهمّك فقط.',
  locale = 'ar',
  canonicalPath,
  alternates,
}: Props) {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState<JobFilters>({ ...emptyFilters, ...preset });
  const { profile, ready } = useProfile();
  const settings = usePublicSiteSettings();
  const key = copyKey(locale, preset);
  const pageCopy = parsePageCopy(settings.jobs_page_copy, key, { eyebrow, title, lead });
  const searchPlaceholder = parseLocaleCopy(settings.jobs_search_placeholder_copy, locale, { title: 'ابحث بكلمة أو مهارة', body: 'Search by keyword or skill' });
  const noResults = parseLocaleCopy(settings.jobs_no_results_copy, locale, { title: 'لا توجد فرص بهذه الشروط', body: 'جرّب توسيع أحد الفلاتر — مثلاً إزالة قيد الخبرة أو اختيار «الأهلية: غير واضحة».' });
  const profileCopy = (() => {
    const row = (settings.jobs_profile_copy ?? '').split(/\r?\n/).map((line) => line.trim()).find((line) => line.startsWith(locale + ' || '));
    if (!row) return { eyebrow: 'ملفك', title: 'غيّر دولتك أو مستواك وشاهد كيف تتغير النتائج', lead: 'يُحفظ ملفك في متصفحك فقط، ولا يُرسل إلى أي خادم.' };
    const parts = row.split('||').map((part) => part.trim());
    return parts.length >= 4 ? { eyebrow: parts[1], title: parts[2], lead: parts.slice(3).join(' || ') } : { eyebrow: 'ملفك', title: 'غيّر دولتك أو مستواك وشاهد كيف تتغير النتائج', lead: 'يُحفظ ملفك في متصفحك فقط، ولا يُرسل إلى أي خادم.' };
  })();
  const matchCopy = parseMatchCopy(settings.jobs_match_copy, locale, { summary: 'رتّبنا النتائج حسب ملفك المحفوظ. أعلى نتيجة {score} من 100.', country: 'مضبوطة على {country}', edit: 'عدّل ملفك' });
  const effectiveTitle = pageCopy.title || title;
  const effectiveLead = pageCopy.lead || lead;

  usePageMeta({
    title: effectiveTitle + ' | ezyjobs',
    description: effectiveLead,
    locale,
    canonical: canonicalPath ? SITE_URL + canonicalPath : undefined,
    alternates,
  });

  useEffect(() => {
    const q = params.get('q');
    const category = params.get('category');
    const view = params.get('view');

    setFilters((f) => ({
      ...f,
      ...(q !== null ? { q } : {}),
      ...(category && CATEGORIES.some((item) => item.id === category) ? { category } : {}),
      ...(view === 'profile' ? { sort: 'relevance' } : {}),
      ...(view === 'student-remote'
        ? { studentsOnly: true, workMode: 'remote', sort: 'newest' }
        : {}),
    }));
  }, [params]);

  const effective = useMemo(() => ({ ...filters, ...preset, q: filters.q }), [filters, preset]);

  const results = useMemo(
    () => filterJobs(jobs, effective, ready ? profile : undefined),
    [jobs, effective, profile, ready],
  );

  const setQuery = (q: string) => {
    setFilters((f) => ({ ...f, q }));
    const next = new URLSearchParams(params);
    if (q) next.set('q', q);
    else next.delete('q');
    setParams(next, { replace: true });
  };

  const active = activeFilterCount(effective);
  const topMatch = results[0] ? matchJob(results[0], profile) : null;
  const renderedSummary = matchCopy.summary.replace('{score}', String(topMatch?.score ?? 0));
  const renderedCountry = matchCopy.country.replace('{country}', profile?.country ?? '');
  const popularCategories = ['writing', 'development', 'design', 'marketing', 'support', 'data']
    .map((id) => CATEGORIES.find((item) => item.id === id))
    .filter((item): item is (typeof CATEGORIES)[number] => Boolean(item));

  const jobsHref = (extra?: Record<string, string>) => {
    const next = new URLSearchParams();
    if (filters.q) next.set('q', filters.q);
    Object.entries(extra ?? {}).forEach(([key, value]) => next.set(key, value));
    const query = next.toString();
    return query ? `/jobs?${query}` : '/jobs';
  };

  return (
    <>
      <nav className="border-b border-line bg-white/92 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center gap-2 overflow-x-auto px-5 py-2.5 text-[12px] lg:px-10">
          <Link to="/jobs" className="whitespace-nowrap rounded-full border border-brand-100 bg-brand-50 px-3 py-1.5 font-bold text-brand-700">
            كل الوظائف
          </Link>
          <span className="whitespace-nowrap px-1 text-muted">حسب النوع:</span>
          {popularCategories.map((category) => (
            <Link
              key={category.id}
              to={jobsHref({ category: category.id })}
              className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-muted transition hover:bg-brand-50 hover:text-brand-700"
            >
              {category.name}
            </Link>
          ))}
          <Link to={jobsHref({ view: 'profile' })} className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-muted transition hover:bg-brand-50 hover:text-brand-700">
            وظائف مطابقة لملفي
          </Link>
          <Link to={jobsHref({ view: 'student-remote' })} className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-muted transition hover:bg-brand-50 hover:text-brand-700">
            عن بُعد للطلاب
          </Link>
          <Link to="/alerts" className="whitespace-nowrap rounded-full px-3 py-1.5 font-semibold text-muted transition hover:bg-brand-50 hover:text-brand-700">
            تنبيهات الوظائف
          </Link>
        </div>
      </nav>

      <header className="jobs-explorer-hero relative overflow-hidden border-b border-line bg-paper">
        <PageAura />
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="bold-grid absolute inset-0" />
          <div className="absolute -left-32 top-0 h-[360px] w-[360px] rounded-full bg-brand/10 blur-[100px]" />
          <div className="absolute -right-24 bottom-0 h-[340px] w-[340px] rounded-full bg-accent/10 blur-[100px]" />
        </div>
        <div className="relative mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
          <div className="job-hero-grid rounded-[2rem] border border-[#17243b] bg-[#10213f] p-5 text-white shadow-[0_35px_80px_-44px_rgba(16,33,63,0.62)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/70">{pageCopy.eyebrow}</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 text-[10px] font-bold text-accent">
                    <span className="live-dot" /> Live index
                  </span>
                </div>
                <h1 className="mt-6 max-w-4xl text-[2.55rem] font-black leading-[.98] tracking-[-0.04em] sm:text-5xl lg:text-[4.45rem]">
                  {pageCopy.title}
                </h1>
                <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-[15px]">
                  {pageCopy.lead}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="metric-tile">
                  <span className="metric-kicker">RESULTS</span>
                  <strong>{results.length}</strong>
                  <span>فرصة حالياً</span>
                </div>
                <div className="metric-tile">
                  <span className="metric-kicker">MATCH</span>
                  <strong>{topMatch?.score ?? 0}</strong>
                  <span>أعلى تطابق</span>
                </div>
                <div className="metric-tile">
                  <span className="metric-kicker">FILTERS</span>
                  <strong>{active}</strong>
                  <span>قيد فعّال</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.06] p-2.5 backdrop-blur">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/35">⌕</span>
                  <TextInput
                    value={filters.q}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder.title}
                    className="!border-white/10 !bg-white !py-3.5 !pr-11 !text-ink"
                  />
                </div>
                <Link
                  to={filters.q ? '/jobs?q=' + encodeURIComponent(filters.q) : '/jobs'}
                  className="ez-btn ez-btn-primary min-h-[48px] px-7 text-sm"
                >
                  اكتشف الوظائف
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <div className="flex flex-wrap gap-2">
                {popularCategories.slice(0, 4).map((category) => (
                  <Link key={category.id} to={jobsHref({ category: category.id })} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">
                    {category.name}
                  </Link>
                ))}
              </div>
              <span className="text-[11px] text-white/40">
                {renderedCountry || 'خصص النتائج حسب ملفك'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10 lg:py-14">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="ez-eyebrow">DISCOVERY WORKSPACE</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">النتائج التي تستحق وقتك</h2>
          </div>
          <div className="rounded-full border border-line bg-white/75 px-4 py-2 text-[12px] text-muted shadow-sm">
            <span className="tnum font-black text-ink">{results.length}</span> نتيجة · <span className="tnum">{active}</span> فلاتر
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
          <aside className="lg:sticky lg:top-24">
            <div className="filter-dock">
              <JobFiltersPanel
                filters={effective}
                onChange={(f) => setFilters({ ...filters, ...f })}
                onReset={() => {
                  setFilters({ ...emptyFilters, ...preset });
                  setParams(new URLSearchParams(), { replace: true });
                }}
                resultCount={results.length}
                activeCount={active}
              />
            </div>
          </aside>

          <div className="space-y-5">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : results.length === 0 ? (
              <EmptyState
                title={noResults.title}
                body={noResults.body}
              />
            ) : (
              <>
                {topMatch && (
                  <div className="match-banner">
                    <div className="flex items-start gap-3">
                      <span className="match-pulse mt-1.5" />
                      <div>
                        <p className="text-[12px] font-bold text-ink">ترتيب شخصي مفعّل</p>
                        <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{renderedSummary}</p>
                      </div>
                    </div>
                    <span className="text-[11px] text-muted">
                      {renderedCountry} · <a href="/jobs" className="font-bold text-brand-700">{matchCopy.edit}</a>
                    </span>
                  </div>
                )}

                {results.map((job, index) => (
                  <div key={job.id} className="result-stack" style={{ ['--result-index' as string]: index }}>
                    <JobCard key={job.id} job={job} match={matchJob(job, profile)} locale={locale} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <section className="border-t border-line bg-surface py-16 lg:py-24">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <SectionHead
            eyebrow={profileCopy.eyebrow}
            title={profileCopy.title}
            lead={profileCopy.lead}
          />
          <ProfileBuilder jobs={jobs} />
        </div>
      </section>
    </>
  );
}
