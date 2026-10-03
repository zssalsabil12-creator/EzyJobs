import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { useSavedJobs } from '../lib/savedJobs';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import JobCard from '../components/jobs/JobCard';
import { EmptyState } from '../components/ui/Feedback';
import { Button, SectionHead } from '../components/ui/Primitives';

import PageAura from '../components/art/PageAura';
export default function SavedPage({ jobs }: { jobs: Job[] }) {
  const { ids, remove, clear } = useSavedJobs();
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.saved_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;

  usePageMeta({
    title: text('metaTitle', 'الوظائف المحفوظة | ezyjobs'),
    description: text('metaDescription', 'قائمة الوظائف التي حفظتها لمقارنتها لاحقاً.'),
    noIndex: true,
  });

  const saved = useMemo(() => ids.map((id) => jobs.find((j) => j.id === id)).filter(Boolean) as Job[], [ids, jobs]);

  return (
    <>
      <header className="account-hero saved-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead
            eyebrow={text('eyebrow', 'قائمتك')}
            title={text('title', 'الوظائف المحفوظة')}
            lead={
              saved.length
                ? text('leadSaved', '{count} وظيفة محفوظة في هذا المتصفح. راجع الأهلية قبل أن تتقدم.').replace('{count}', String(saved.length))
                : text('leadEmpty', 'احفظ أي وظيفة للعودة إليها لاحقاً ومقارنتها بغيرها.')
            }
            action={
              saved.length > 1 ? (
                <Button variant="ghost" onClick={clear}>
                  {text('clearAll', 'مسح الكل')}
                </Button>
              ) : undefined
            }
          />
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] space-y-4 px-5 py-12 lg:px-10 lg:py-16">
        {saved.length === 0 ? (
          <EmptyState
            title={text('emptyTitle', 'لا توجد وظائف محفوظة بعد')}
            body={text('emptyBody', 'اضغط «احفظ» في أي بطاقة وظيفة، وستجدها هنا.')}
            action={
              <Link to="/jobs" className="ez-btn ez-btn-primary px-6 py-3 text-sm">
                {text('browseJobs', 'تصفّح الوظائف')}
              </Link>
            }
          />
        ) : (
          saved.map((job) => (
            <div key={job.id}>
              <JobCard job={job} />
              <button
                onClick={() => remove(job.id)}
                className="mt-2 text-[12px] font-semibold text-muted transition-colors hover:text-danger"
              >
                {text('remove', 'إزالة من المحفوظات')}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}
