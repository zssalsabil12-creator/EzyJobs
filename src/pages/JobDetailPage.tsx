import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { Job } from '../types';
import {
  categoryName,
  commitmentName,
  countryName,
  eligibilityHint,
  eligibilityName,
  experienceName,
  languageName,
  proficiencyName,
  workModeName,
  WORLDWIDE,
  ELIGIBILITY,
} from '../data/taxonomy';
import PageAura from '../components/art/PageAura';
import { acceptsCountry, matchJob } from '../lib/match';
import { useProfile } from '../features/profile/ProfileContext';
import { jobPostingJsonLd, usePageMeta } from '../lib/seo';
import { usePublicSiteSettings } from '../lib/siteSettings';
import { getJobSeo, localizedJobCopy, localeFromPath, type SiteLocale } from '../lib/seoI18n';
import { jobsRepo } from '../lib/jobsRepo';
import { applicationsRepo } from '../lib/applications';
import JobCard, { SaveButton, salaryText } from '../components/jobs/JobCard';
import { MatchBadge } from '../components/jobs/JobCard';
import { Badge, DataRow, LinkButton } from '../components/ui/Primitives';
import { EmptyState, FullPageLoader } from '../components/ui/Feedback';
import { SOURCES } from '../data/taxonomy';
import StreamText from '../components/art/StreamText';
import { freshnessHint, freshnessLabel, freshnessTone } from '../lib/jobFreshness';

const days = (iso: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000));

type JobDetailCopy = Record<string, string>;

function parseJobDetailCopy(value: string | undefined): JobDetailCopy {
  const result: JobDetailCopy = {};
  for (const line of (value ?? '').split(/\r?\n/)) {
    const index = line.indexOf('||');
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const text = line.slice(index + 2).trim();
    if (key && text) result[key] = text;
  }
  return result;
}

export default function JobDetailPage({
  job,
  allJobs,
  loading,
  locale,
}: {
  job: Job | undefined;
  allJobs: Job[];
  loading: boolean;
  locale?: SiteLocale;
}) {
  const { slug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const pageLocale = locale || localeFromPath(pathname);
  const { profile } = useProfile();
  const settings = usePublicSiteSettings();
  const cmsCopy = useMemo(
    () => parseJobDetailCopy(settings[`job_detail_copy_${pageLocale}`]),
    [pageLocale, settings],
  );
  const copy = (key: string, fallback: string) => cmsCopy[key] || fallback;

  const match = useMemo(() => (job ? matchJob(job, profile) : null), [job, profile]);
  const similar = useMemo(
    () =>
      job
        ? allJobs
            .filter((j) => j.id !== job.id && j.category === job.category && j.status === 'published')
            .slice(0, 3)
        : [],
    [job, allJobs],
  );

  usePageMeta(
    job
      ? {
          ...getJobSeo(job, pageLocale),
          jsonLd: jobPostingJsonLd(job, pageLocale),
        }
      : { title: copy('notFoundTitle', 'الوظيفة غير موجودة') + ' | ezyjobs', noIndex: true },
  );

  useEffect(() => {
    if (job) void jobsRepo.incrementViews(job.id);
  }, [job?.id]);

  if (loading) return <FullPageLoader label={copy('loading', 'جارٍ فتح الوظيفة')} />;
  if (!job)
    return (
      <div className="mx-auto max-w-[1240px] px-5 py-24">
        <EmptyState
          title={copy('notFoundTitle', 'لم نجد هذه الوظيفة')}
          body={copy('notFoundBody', 'قد يكون الناشر قد حذفها أو أن الرابط قديم.')}
          action={
            <Link to="/jobs" className="ez-btn ez-btn-primary px-6 py-3 text-sm">
              العودة إلى محرك البحث
            </Link>
          }
        />
      </div>
    );

  const geo = acceptsCountry(job, profile.country);
  const eligibilityMeta = ELIGIBILITY.find((e) => e.id === job.eligibility);

  return (
    <article>
      {/* ترويسة */}
      <header className="job-detail-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
          <nav className="mb-8 flex items-center gap-2 text-[12px] text-muted">
            <Link to="/" className="transition-colors hover:text-brand">
              {copy('breadcrumbHome', 'الرئيسية')}
            </Link>
            <span>/</span>
            <Link to="/jobs" className="transition-colors hover:text-brand">
              الوظائف
            </Link>
            <span>/</span>
            <Link
              to={`/jobs?cat=${job.category}`}
              className="transition-colors hover:text-brand"
            >
              {categoryName(job.category)}
            </Link>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {match && <MatchBadge match={match} />}
                <Badge tone="neutral">{categoryName(job.category)}</Badge>
                <Badge tone={freshnessTone(job)} title={freshnessHint(job, pageLocale)}>{freshnessLabel(job, pageLocale)}</Badge>
                {job.suitableForStudents && <Badge tone="brand">{copy('studentBadge', 'مناسبة للطلاب')}</Badge>}
                {job.experienceYears === 0 && <Badge tone="brand">{copy('noExperienceBadge', 'بدون خبرة')}</Badge>}
              </div>

              <h1 className="text-3xl font-black leading-tight text-ink sm:text-4xl">
                {pageLocale === 'ar' ? job.titleAr : job.titleOriginal}
              </h1>
              <p dir="ltr" className="mt-2 text-left font-display text-base text-muted">
                {job.titleOriginal}
              </p>

              <p className="mt-5 text-lg font-bold text-ink">{job.company}</p>
            </div>

            <div className="shrink-0 lg:text-left">
              <p className="font-display text-2xl font-bold text-ink">{salaryText(job)}</p>
              {job.weeklyHours && (
                <p className="mt-1 text-sm text-muted">
                  <span className="tnum">{job.weeklyHours}</span> {copy('weeklyHoursSuffix', 'ساعة أسبوعياً')}
                </p>
              )}
              <div className="mt-5">
                <LinkButton
                  href={job.applyUrl}
                  variant="primary"
                  size="lg"
                  className="w-full lg:w-auto"
                >
                  {copy('applyOriginal', 'التقديم من المصدر الأصلي')}
                </LinkButton>
              </div>
              <p className="mt-2 text-[11px] text-muted">
                {job.source.partner ? copy('partnerLink', 'رابط تابع') : copy('directLink', 'رابط مباشر')} — {copy('applyVia', 'التقديم يتم عند')} {' '}
                {job.source.name}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <SaveButton id={job.id} />
                <TrackApplicationButton job={job} locale={pageLocale} />
                <CopyLink locale={pageLocale} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        <section className="ez-panel mb-8 p-6" dir={pageLocale === 'ar' ? 'rtl' : 'ltr'}>
          <h2 className="text-lg font-black text-ink">{localizedJobCopy(job, pageLocale).heading}</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{localizedJobCopy(job, pageLocale).intro}</p>
          <div className="mt-4 grid gap-2 text-[13px] text-ink sm:grid-cols-2">
            <p>{localizedJobCopy(job, pageLocale).remote}</p>
            <p>{localizedJobCopy(job, pageLocale).commitment}</p>
            <p>{localizedJobCopy(job, pageLocale).experience}</p>
            <p>{localizedJobCopy(job, pageLocale).eligibility}</p>
            <p className="sm:col-span-2">{localizedJobCopy(job, pageLocale).skills}</p>
          </div>
        </section>
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* المحتوى */}
          <div className="space-y-8">
            {/* تحليل المنصة */}
            {match && (
              <section className="ez-panel overflow-hidden">
                <div className="border-b border-line px-6 py-5">
                  <h2 className="text-lg font-black text-ink">{copy('platformAnalysisTitle', 'لماذا هذه الصفحة موجودة')}</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {copy('platformAnalysisLead', 'تحليل ezyjobs لملفك، وليس معلومة من الإعلان. قد يخطئ التقدير — راجع النص الأصلي قبل قرارك.')}
                  </p>
                </div>

                <div className="grid gap-px bg-line sm:grid-cols-2">
                  <div className="bg-surface p-6">
                    <h3 className="mb-3 text-sm font-bold text-brand-700">{copy('prosTitle', 'قد تناسبك لأن')}</h3>
                    {match.pros.length ? (
                      <ul className="space-y-2.5">
                        {match.pros.map((p, i) => (
                          <li key={i} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/80">
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-muted">{copy('noPros', 'لا توجد نقاط إيجابية واضحة.')}</p>
                    )}
                  </div>

                  <div className="bg-surface p-6">
                    <h3 className="mb-3 text-sm font-bold text-caution">{copy('consTitle', 'ما الذي قد يمنعك')}</h3>
                    {match.cons.length ? (
                      <ul className="space-y-2.5">
                        {match.cons.map((c, i) => (
                          <li
                            key={i}
                            className="flex gap-2.5 text-[13px] leading-relaxed text-ink/80"
                          >
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-muted">{copy('noCons', 'لا توجد عوائق ظاهرة.')}</p>
                    )}
                  </div>
                </div>

                {match.notes.length > 0 && (
                  <div className="border-t border-line bg-accent-50/50 px-6 py-5">
                    <h3 className="mb-2.5 text-sm font-bold text-caution">{copy('notesTitle', 'تنبيهات')}</h3>
                    <ul className="space-y-2">
                      {match.notes.map((n, i) => (
                        <li key={i} className="text-[13px] leading-relaxed text-caution/85">
                          — {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}

            {/* الملخص العربي — لا نكرره إذا كان مجرد بداية الوصف */}
            {job.summaryAr.trim() && !job.descriptionAr.trim().startsWith(job.summaryAr.trim()) && (
              <section>
                <h2 className="text-xl font-black text-ink">{copy('summaryTitle', 'الملخص')}</h2>
                <StreamText text={job.summaryAr} className="mt-4 text-[15px] leading-[2] text-ink/80" />
              </section>
            )}

            {/* الوصف */}
            <section>
              <h2 className="text-xl font-black text-ink">{copy('aboutTitle', 'عن الوظيفة')}</h2>
              <p className="mt-4 whitespace-pre-line text-[15px] leading-[2] text-ink/80">
                {job.descriptionAr}
              </p>
            </section>

            {/* المهارات */}
            <section>
              <h2 className="text-xl font-black text-ink">{copy('skillsTitle', 'المهارات المطلوبة')}</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((s) => (
                  <Badge key={s} tone="brand">
                    {s}
                  </Badge>
                ))}
              </div>

              {job.requirements.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-ink">{copy('requirementsTitle', 'شروط أساسية')}</h3>
                  <ul className="mt-3 space-y-2">
                    {job.requirements.map((r) => (
                      <li key={r} className="flex gap-2.5 text-[14px] leading-relaxed text-ink/80">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.niceToHave.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-ink">{copy('niceToHaveTitle', 'مستحسن')}</h3>
                  <ul className="mt-3 space-y-2">
                    {job.niceToHave.map((r) => (
                      <li key={r} className="flex gap-2.5 text-[14px] leading-relaxed text-muted">
                        <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-line" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* المصدر */}
            <section className="ez-panel p-6">
              <h2 className="text-sm font-bold text-ink">{copy('sourceTitle', 'عن المصدر')}</h2>
              <p className="mt-3 text-[13.5px] leading-[1.9] text-muted">
                {copy('sourceAllowed', 'نعرض هذه الوظيفة لأن مصدرها يسمح بإعادة التوزيع.')}{' '}
                {job.source.redistributable
                  ? copy('sourceRights', 'جميع الحقوق محفوظة للجهة الناشرة، والتقديم يتم عبر موقعها الرسمي.')
                  : copy('sourceReview', 'نراجع ترخيص هذا المصدر قبل الاعتماد عليه.')}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <a
                  href={job.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ez-btn ez-btn-ghost px-5 py-2.5 text-[13px]"
                >
                  {job.source.name}
                </a>
                {job.companyUrl && (
                  <a
                    href={job.companyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ez-btn ez-btn-ghost px-5 py-2.5 text-[13px]"
                  >
                    {copy('companyWebsite', 'موقع الشركة')}
                  </a>
                )}
              </div>
            </section>
          </div>

          {/* الشريط الجانبي */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <div className="ez-panel p-6">
              <h2 className="mb-4 text-sm font-bold text-ink">{copy('jobCardTitle', 'بطاقة الوظيفة')}</h2>
              <DataRow label={copy('workType', 'نوع العمل')} value={workModeName(job.workMode)} />
              <DataRow label={copy('commitment', 'الدوام')} value={commitmentName(job.commitment)} />
              <DataRow label={copy('experienceLevel', 'مستوى الخبرة')} value={experienceName(job.experience)} />
              <DataRow
                label={copy('experienceYears', 'سنوات الخبرة')}
                value={job.experienceYears === 0 ? copy('experienceNotRequired', 'لا تُشترط') : `${job.experienceYears}+`}
              />
              {job.weeklyHours && (
                <DataRow label={copy('weeklyHours', 'الساعات أسبوعياً')} value={`${job.weeklyHours}`} />
              )}
              {job.education && <DataRow label={copy('education', 'المؤهل')} value={job.education} />}
              <DataRow label={copy('publishedAt', 'تاريخ النشر')} value={`${days(job.publishedAt)} ${copy('daysAgo', 'يوماً مضياً')}`} />
              <DataRow label={copy('verifiedAt', 'آخر تحقق')} value={`${days(job.verifiedAt)} ${copy('daysAgo', 'يوماً مضياً')}`} />
            </div>

            <div className="ez-panel p-6">
              <h2 className="mb-4 text-sm font-bold text-ink">{copy('geoTitle', 'الأهلية الجغرافية')}</h2>
              <div
                className={`mb-4 rounded-xl border p-4 ${
                  job.eligibility === 'open'
                    ? 'border-brand-100 bg-brand-50'
                    : job.eligibility === 'closed'
                      ? 'border-danger-line bg-danger-soft'
                      : job.eligibility === 'limited'
                        ? 'border-caution-line bg-accent-50'
                        : 'border-line bg-paper-2'
                }`}
              >
                <p className="text-sm font-bold text-ink">{eligibilityName(job.eligibility)}</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">
                  {eligibilityHint(job.eligibility)}
                </p>
              </div>

              <p className="text-[12.5px] leading-relaxed text-muted">
                {job.eligibleRegions.includes(WORLDWIDE)
                  ? copy('geoGeneric', 'الإعلان لا يحدد دولاً بعينها.')
                  : `${copy('geoCountries', 'الدول المقبولة')}: ${job.eligibleRegions.map(countryName).join('، ')}`}
              </p>

              <div
                className={`mt-4 border-t border-line pt-4 text-[12.5px] leading-relaxed ${
                  geo === true ? 'text-brand-700' : geo === false ? 'text-danger' : 'text-muted'
                }`}
              >
                {geo === true && copy('profileEligible', 'ملفك مسجّل من {country} — مؤهل.').replace('{country}', countryName(profile.country))}
                {geo === false && copy('profileIneligible', 'ملفك مسجّل من {country} — غير مؤهل لهذه الوظيفة.').replace('{country}', countryName(profile.country))}
                {geo === 'unclear' && copy('profileUnclear', 'لا يمكن تأكيد أهلية {country} من نص الإعلان.').replace('{country}', countryName(profile.country))}
              </div>
            </div>

            {job.eligibilityEvidence && job.eligibilityEvidence.length > 0 ? (
              <div className="ez-panel p-6">
                <h2 className="mb-4 text-sm font-bold text-ink">{localizedJobCopy(job, pageLocale).evidence}</h2>
                <div className="space-y-4">
                  {job.eligibilityEvidence.map((evidence, index) => (
                    <div key={evidence.url + evidence.capturedAt + index} className="rounded-xl border border-line bg-paper-2 p-4">
                      <p className="text-sm font-bold text-ink">{evidence.label}</p>
                      <p className="mt-1 text-[12.5px] text-muted">
                        {eligibilityName(evidence.status)} · {evidence.countries.length ? evidence.countries.map(countryName).join('، ') : 'غير محدد'}
                      </p>
                      {evidence.note && <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{evidence.note}</p>}
                      <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-[12px] font-bold text-brand underline">
                        {evidence.sourceName}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ez-panel p-6">
                <h2 className="mb-4 text-sm font-bold text-ink">{localizedJobCopy(job, pageLocale).evidence}</h2>
                <p className="text-[12.5px] leading-relaxed text-muted">{localizedJobCopy(job, pageLocale).evidenceFallback}</p>
              </div>
            )}

            {job.languages.length > 0 && (
              <div className="ez-panel p-6">
                <h2 className="mb-4 text-sm font-bold text-ink">{copy('languagesTitle', 'اللغات')}</h2>
                {job.languages.map((l) => (
                  <DataRow
                    key={l.code}
                    label={languageName(l.code)}
                    value={
                      <span className="flex items-center gap-2">
                        {proficiencyName(l.level)}
                        {l.required && (
                          <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[10px] font-bold text-muted">
                            {copy('requiredBadge', 'مطلوبة')}
                          </span>
                        )}
                      </span>
                    }
                  />
                ))}
              </div>
            )}

            {match && match.missingSkills.length > 0 && (
              <div className="ez-panel border-accent-50 bg-gradient-to-br from-brand-50 to-accent-50 p-6">
                <h2 className="text-sm font-bold text-ink">{copy('missingSkillsTitle', 'مهارات ناقصة في ملفك')}</h2>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  {copy('missingSkillsLead', 'هذه ما طلبته هذه الوظيفة ولم تجده في مهاراتك المحفوظة.')}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {match.missingSkills.map((s) => (
                    <span key={s} className="ez-chip">
                      {s}
                    </span>
                  ))}
                </div>
                <Link
                  to="/jobs"
                  className="mt-5 block text-[12px] font-semibold text-brand-700 transition-colors hover:text-brand-600"
                >
                  {copy('missingSkillsSearch', 'ابحث عن فرص لا تطلب هذه المهارات ←')}
                </Link>
              </div>
            )}
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="border-t border-line bg-surface py-16 lg:py-24">
          <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
            <h2 className="text-2xl font-black text-ink">{copy('similarTitle', 'فرص مشابهة')}</h2>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {similar.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line py-14">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <h2 className="text-sm font-bold text-ink">{copy('sourcesTitle', 'مصادر نجمع منها الوظائف')}</h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {SOURCES.map((s) => (
              <Badge key={s.name}>
                {s.name} — {s.access}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <StickyApplyBar job={job} locale={pageLocale} />
    </article>
  );
}

function TrackApplicationButton({ job, locale }: { job: Job; locale: SiteLocale }) {
  const settings = usePublicSiteSettings();
  const copy = (key: string, fallback: string) => parseJobDetailCopy(settings[`job_detail_copy_${locale}`])[key] || fallback;
  const [tracked, setTracked] = useState(() => Boolean(applicationsRepo.get(job.id)));

  const track = () => {
    applicationsRepo.ensure(job);
    setTracked(true);
  };

  if (tracked) {
    return (
      <Link
        to="/applications"
        className="ez-btn ez-btn-ghost px-4 py-2.5 text-[13px]"
      >
        {copy('followApplication', 'متابعة التقديم')}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={track}
      className="ez-btn ez-btn-ghost px-4 py-2.5 text-[13px]"
    >
      {copy('addApplication', 'أضف لمسار التقديم')}
    </button>
  );
}

function CopyLink({ locale }: { locale: SiteLocale }) {
  const settings = usePublicSiteSettings();
  const text = (key: string, fallback: string) => parseJobDetailCopy(settings[`job_detail_copy_${locale}`])[key] || fallback;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} className="ez-btn ez-btn-ghost px-4 py-2.5 text-[13px]">
      {copied ? text('copied', 'تم النسخ') : text('copyLink', 'نسخ الرابط')}
    </button>
  );
}

function StickyApplyBar({ job, locale }: { job: Job; locale: SiteLocale }) {
  const settings = usePublicSiteSettings();
  const copy = (key: string, fallback: string) => parseJobDetailCopy(settings[`job_detail_copy_${locale}`])[key] || fallback;
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-3 bottom-3 z-40 transition-all duration-500 sm:inset-x-auto sm:bottom-6 sm:right-1/2 sm:w-[560px] sm:translate-x-1/2 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div className="ez-panel flex items-center gap-4 !rounded-2xl px-5 py-3.5 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.9)]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-ink">{job.titleAr}</p>
          <p className="tnum mt-0.5 text-[12px] text-muted">{salaryText(job)}</p>
        </div>
        <LinkButton href={job.applyUrl} variant="primary" size="sm" className="shrink-0">
          {copy('applyNow', 'قدّم الآن')}
        </LinkButton>
      </div>
    </div>
  );
}

