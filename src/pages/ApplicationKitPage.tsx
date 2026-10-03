import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Job } from '../types';
import { useProfile } from '../features/profile/ProfileContext';
import { applicationsRepo, APPLICATION_STATUS } from '../lib/applications';
import { matchJob, sharedSkills } from '../lib/match';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import { Badge, SectionHead } from '../components/ui/Primitives';
import PageAura from '../components/art/PageAura';
import { EmptyState } from '../components/ui/Feedback';

const coverLetter = (job: Job, skills: string[]) =>
  `Dear Hiring Team,

I am writing to apply for the ${job.titleOriginal || job.titleAr} role at ${job.company}.
My background includes ${skills.slice(0, 4).join(', ') || 'relevant skills and professional experience'}.

I am particularly interested in this opportunity because it matches my background and the requirements described in the role. I would be pleased to contribute to the team and discuss how my experience could support the position.

Thank you for your consideration.
Best regards`;

export default function ApplicationKitPage({ jobs }: { jobs: Job[] }) {
  const { jobId } = useParams<{ jobId: string }>();
  const { profile } = useProfile();
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.application_kit_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;
  const job = jobs.find((x) => x.id === jobId);

  useEffect(() => {
    if (!job) return;
    const current = applicationsRepo.ensure(job);
    if (current.status === 'saved') applicationsRepo.updateStatus(job.id, 'preparing');
  }, [job]);

  usePageMeta({
    title: job ? `${text('eyebrow', 'Application Kit')} — ${job.titleAr} | ezyjobs` : text('metaTitle', 'Application Kit | ezyjobs'),
    description: text('metaDescription', 'جهّز عناصر التقديم قبل فتح المصدر الرسمي.'),
    noIndex: true,
  });

  const match = useMemo(() => (job ? matchJob(job, profile) : null), [job, profile]);
  const highlights = useMemo(() => (job ? sharedSkills(job, profile) : []), [job, profile]);

  if (!job || !match) {
    return (
      <EmptyState title={text('notFoundTitle', 'لم نجد الوظيفة')} body={text('notFoundBody', 'قد يكون الرابط قديماً أو أزيلت الوظيفة من البيانات.')} />
    );
  }

  const missing = match.missingSkills.filter(Boolean);
  const status = applicationsRepo.get(job.id)?.status ?? 'preparing';

  return (
    <>
      <header className="application-kit-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead
            eyebrow={text('eyebrow', 'Application Kit')}
            title={job.titleAr}
            lead={text('lead', 'تجهيز موجّه لهذه الوظيفة قبل الانتقال إلى جهة التوظيف الرسمية. الحالة الحالية: {status}.').replace('{status}', APPLICATION_STATUS[status].label)}
            action={<a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="ez-btn ez-btn-primary px-5 py-3 text-sm">{text('openApplication', 'افتح صفحة التقديم')}</a>}
          />
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="ez-panel p-6">
            <h2 className="text-lg font-black text-ink">{text('highlightsTitle', 'ما الذي تبرزه من ملفك؟')}</h2>
            <p className="mt-2 text-sm text-muted">{text('highlightsLead', 'هذه المهارات ظهرت في ملفك وتتقاطع مع إعلان الوظيفة.')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {highlights.length
                ? highlights.map((s) => <Badge key={s} tone="positive">{s}</Badge>)
                : <span className="text-sm text-muted">{text('noHighlights', 'لا يوجد تطابق واضح في المهارات المحفوظة.')}</span>}
            </div>
          </section>

          <section className="ez-panel p-6">
            <h2 className="text-lg font-black text-ink">{text('gapsTitle', 'فجوات تحتاج انتباهاً')}</h2>
            <p className="mt-2 text-sm text-muted">{text('gapsLead', 'ليست حكماً بالرفض؛ فقط عناصر قد تحتاج توضيحاً أو تحضيراً.')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {missing.length
                ? missing.map((s) => <Badge key={s} tone="caution">{s}</Badge>)
                : <span className="text-sm text-muted">{text('noGaps', 'لم نجد فجوات مهارية واضحة.')}</span>}
            </div>
          </section>
        </div>

        <section className="ez-panel mt-6 p-6">
          <h2 className="text-lg font-black text-ink">{text('coverTitle', 'Cover Letter — مسودة قابلة للتعديل')}</h2>
          <p className="mt-2 text-sm text-muted">{text('coverLead', 'راجعها وعدّلها قبل الإرسال؛ هذه مسودة مساعدة وليست رسالة نهائية تلقائياً.')}</p>
          <textarea readOnly value={coverLetter(job, highlights)} className="ez-input mt-4 min-h-72 whitespace-pre-wrap leading-relaxed" />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="ez-panel p-6">
            <h2 className="text-lg font-black text-ink">{text('fitTitle', 'إجابة: Why are you a good fit?')}</h2>
            <textarea readOnly value={`I bring ${highlights.join(', ') || 'relevant experience and transferable skills'} and I am interested in the ${job.titleOriginal || job.titleAr} role. The position matches my background and the way I prefer to work.`} className="ez-input mt-4 min-h-36" />
          </div>
          <div className="ez-panel p-6">
            <h2 className="text-lg font-black text-ink">{text('checklistTitle', 'Checklist قبل التقديم')}</h2>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li>✓ {text('checkCv', 'راجع CV وتأكد أن المهارات الأكثر صلة ظاهرة.')}</li>
              <li>✓ {text('checkEligibility', 'راجع شرط الدولة والأهلية الجغرافية.')}</li>
              <li>✓ {text('checkCover', 'عدّل Cover Letter حسب الشركة والوظيفة.')}</li>
              <li>✓ {text('checkOfficial', 'قدّم من رابط المصدر الرسمي.')}</li>
            </ul>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" className="ez-btn ez-btn-primary px-6 py-3 text-sm">{text('applyNow', 'التقديم الآن')}</a>
          <Link to="/applications" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">{text('backApplications', 'العودة إلى تقديماتي')}</Link>
        </div>
      </main>
    </>
  );
}

