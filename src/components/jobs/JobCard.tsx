import { Link } from 'react-router-dom';
import type { Job, MatchResult } from '../../types';
import {
  categoryName,
  commitmentName,
  countryName,
  eligibilityName,
  experienceName,
  languageName,
  proficiencyShort,
  workModeName,
  ELIGIBILITY,
} from '../../data/taxonomy';
import { VERDICT_LABEL, VERDICT_TONE } from '../../lib/match';
import { localizedJobCopy, localizedJobPath, type SiteLocale } from '../../lib/seoI18n';
import { Badge } from '../ui/Primitives';
import Tilt from '../art/Tilt';
import { useSavedJobs } from '../../lib/savedJobs';
import { freshnessHint, freshnessLabel, freshnessTone } from '../../lib/jobFreshness';

const enWorkMode: Record<string, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  onsite: 'On-site',
  flexible: 'Flexible',
};

const enCommitment: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  internship: 'Internship',
  freelance: 'Freelance',
  contract: 'Contract',
};

const enExperience: Record<string, string> = {
  student: 'Student',
  entry: 'Entry level',
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
};

const enLanguage: Record<string, string> = {
  ar: 'Arabic',
  en: 'English',
  fr: 'French',
  es: 'Spanish',
  de: 'German',
  tr: 'Turkish',
  other: 'Other',
};

const enProficiency: Record<string, string> = {
  native: 'Native',
  fluent: 'Fluent',
  intermediate: 'Intermediate',
  basic: 'Basic',
};

const enEligibility: Record<string, string> = {
  open: 'Open',
  limited: 'Limited',
  unclear: 'Unclear',
  closed: 'Closed',
};

const enFreshness: Record<string, string> = {
  fresh: 'Fresh',
  active: 'Active',
  aging: 'Aging',
  stale: 'Older',
};

const enVerdict: Record<string, string> = {
  strong: 'Strong fit',
  good: 'Good fit',
  fair: 'Possible fit',
  weak: 'Weak fit',
  blocked: 'Not eligible',
};

const dateText = (iso: string, locale: SiteLocale = 'ar') => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (locale === 'en') {
    if (days <= 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  }
  if (days <= 0) return 'اليوم';
  if (days === 1) return 'منذ يوم';
  if (days < 7) return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} أشهر`;
};

export const salaryText = (job: Job, locale: SiteLocale = 'ar') => {
  const s = job.salary;
  if (!s) return locale === 'en' ? 'Salary not listed' : 'الراتب غير مذكور';

  const unitAr = s.period === 'hour' ? 'ساعة' : s.period === 'month' ? 'شهرياً' : s.period === 'year' ? 'سنوياً' : 'للمشروع';
  const unitEn = s.period === 'hour' ? 'hour' : s.period === 'month' ? 'month' : s.period === 'year' ? 'year' : 'project';
  const unit = locale === 'en' ? unitEn : unitAr;

  if (s.min == null && s.max == null) return locale === 'en' ? `Not specified${unit === 'project' ? '' : ` / ${unit}`}` : `غير محدد ${unit === unitAr && unitAr === 'للمشروع' ? '' : unitAr}`;
  if (s.min != null && s.max != null) {
    return `${s.min.toLocaleString('en-US')}–${s.max.toLocaleString('en-US')} ${s.currency} / ${unit}`;
  }
  const one = s.min ?? s.max ?? 0;
  return `${one.toLocaleString('en-US')} ${s.currency} / ${unit}`;
};

const eligibilityTone = (job: Job) =>
  ({
    open: 'positive',
    limited: 'caution',
    unclear: 'neutral',
    closed: 'negative',
  })[job.eligibility] as 'positive' | 'caution' | 'neutral' | 'negative';

export function EligibilityBadge({ job, locale = 'ar' }: { job: Job; locale?: SiteLocale }) {
  const label = locale === 'en'
    ? enEligibility[job.eligibility] ?? job.eligibility
    : `الأهلية: ${eligibilityName(job.eligibility)}`;

  return (
    <Badge tone={eligibilityTone(job)} title={ELIGIBILITY.find((e) => e.id === job.eligibility)?.hint}>
      {label}
    </Badge>
  );
}

export function MatchBadge({ match, locale = 'ar' }: { match: MatchResult; locale?: SiteLocale }) {
  const verdict = locale === 'en' ? enVerdict[match.verdict] ?? match.verdict : VERDICT_LABEL[match.verdict];

  return (
    <span
      className={`match-score inline-flex items-center gap-2 rounded-full border px-2 py-1.5 text-[11px] font-bold ${VERDICT_TONE[match.verdict]}`}
      style={{ ['--match' as string]: `${match.score}%` }}
    >
      <span className="match-score__ring" aria-hidden><span>{match.score}</span></span>
      <span className="flex flex-col text-right leading-none">
        <strong>{verdict}</strong>
        <small className="mt-1 opacity-65">{locale === 'en' ? 'Profile fit' : 'ملاءمة الملف'}</small>
      </span>
    </span>
  );
}

export function SaveButton({ id, locale = 'ar' }: { id: string; locale?: SiteLocale }) {
  const { isSaved, toggle } = useSavedJobs();
  const saved = isSaved(id);

  return (
    <button
      onClick={() => toggle(id)}
      aria-pressed={saved}
      className={`ez-btn px-4 py-2.5 text-[13px] ${saved ? 'ez-btn-primary' : 'ez-btn-ghost'}`}
    >
      {saved ? (locale === 'en' ? 'Saved' : 'محفوظة') : (locale === 'en' ? 'Save' : 'احفظ')}
    </button>
  );
}

export default function JobCard({ job, match, locale = 'ar' }: { job: Job; match?: MatchResult; locale?: SiteLocale }) {
  const workMode = locale === 'en' ? enWorkMode[String(job.workMode)] ?? String(job.workMode) : workModeName(job.workMode);
  const commitment = locale === 'en' ? enCommitment[String(job.commitment)] ?? String(job.commitment) : commitmentName(job.commitment);
  const experience = locale === 'en' ? enExperience[String(job.experience)] ?? String(job.experience) : experienceName(job.experience);
  const freshness = locale === 'en'
    ? enFreshness[String(freshnessTone(job))] ?? freshnessLabel(job, locale)
    : freshnessLabel(job, locale);
  const title = locale === 'en' ? job.titleOriginal : job.titleAr;
  const copy = localizedJobCopy(job, locale);

  return (
    <Tilt max={3.5} pull={5}>
      <article className="ez-card job-card-shell group h-full p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {match && <MatchBadge match={match} locale={locale} />}
              <Badge tone="neutral">
                {locale === 'en' ? job.category.replace(/[-_]/g, ' ') : categoryName(job.category)}
              </Badge>
              {job.suitableForStudents && (
                <Badge tone="brand">{locale === 'en' ? 'Student-friendly' : 'مناسبة للطلاب'}</Badge>
              )}
              {job.experienceYears === 0 && (
                <Badge tone="brand">{locale === 'en' ? 'No experience' : 'بدون خبرة'}</Badge>
              )}
            </div>

            <h3 className="text-lg font-bold leading-snug text-ink sm:text-xl">
              <Link to={localizedJobPath(locale, job.slug)} className="transition-colors hover:text-brand">
                {title}
              </Link>
            </h3>

            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted">
              <span className="font-semibold text-ink">{job.company}</span>
              <span className="h-1 w-1 rounded-full bg-line" />
              <span dir="ltr" className="font-display text-[13px]">{job.titleOriginal}</span>
            </p>

            <p className="ez-line-2 mt-3 text-sm leading-[1.9] text-muted">{copy.intro}</p>

            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              <Badge>{workMode}</Badge>
              <Badge>{commitment}</Badge>
              <Badge>{experience}</Badge>
              {job.languages.slice(0, 2).map((language) => (
                <Badge key={language.code}>
                  {locale === 'en'
                    ? `${enLanguage[language.code] ?? language.code} ${enProficiency[language.level] ?? ''}`.trim()
                    : `${languageName(language.code)} ${proficiencyShort(language.level)}`}
                </Badge>
              ))}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-[12px] text-muted">
              <EligibilityBadge job={job} locale={locale} />
              <Badge tone={freshnessTone(job)} title={freshnessHint(job, locale)}>
                {freshness}
              </Badge>
              <span>
                {locale === 'en' ? 'Source:' : 'المصدر:'}{' '}
                <span className="font-semibold text-ink">{job.source.name}</span>
              </span>
              <span className="tnum">{dateText(job.publishedAt, locale)}</span>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-3 lg:w-52 lg:items-end">
            <div className="lg:text-left">
              <p className="font-display text-base font-bold text-ink lg:text-lg">
                {salaryText(job, locale)}
              </p>
              {job.weeklyHours && (
                <p className="mt-0.5 text-[12px] text-muted">
                  <span className="tnum">{job.weeklyHours}</span> {locale === 'en' ? 'hours / week' : 'ساعة أسبوعياً'}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <SaveButton id={job.id} locale={locale} />
              <Link to={localizedJobPath(locale, job.slug)} className="ez-btn ez-btn-primary px-4 py-2.5 text-[13px]">
                {locale === 'en' ? 'View & Apply' : 'التفاصيل والتقديم'}
              </Link>
            </div>
          </div>
        </div>

        {match && (match.pros.length > 0 || match.cons.length > 0) && (
          <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            {match.pros.length > 0 && (
              <div className="rounded-xl bg-brand-50/70 p-3">
                <p className="mb-1.5 text-[11px] font-bold tracking-wide text-brand-700">
                  {locale === 'en' ? 'Why it may fit' : 'قد تناسبك لأن'}
                </p>
                <ul className="space-y-1">
                  {match.pros.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-[12.5px] leading-relaxed text-brand-700/85">— {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {match.cons.length > 0 && (
              <div className="rounded-xl bg-accent-50/70 p-3">
                <p className="mb-1.5 text-[11px] font-bold tracking-wide text-caution">
                  {locale === 'en' ? 'Potential blockers' : 'ما الذي قد يمنعك'}
                </p>
                <ul className="space-y-1">
                  {match.cons.slice(0, 3).map((item, i) => (
                    <li key={i} className="text-[12.5px] leading-relaxed text-caution/85">— {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {job.eligibility === 'open' && job.eligibleRegions.length <= 6 && locale === 'ar' && (
          <p className="mt-3 text-[11.5px] text-muted">
            تقبل المتقدمين من:{' '}
            {job.eligibleRegions.map((region) => countryName(region)).join('، ')}
          </p>
        )}
      </article>
    </Tilt>
  );
}
