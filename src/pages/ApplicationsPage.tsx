import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../types';
import { APPLICATION_STATUS, type ApplicationStatus, useApplications } from '../lib/applications';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import PageAura from '../components/art/PageAura';
import { Badge, SectionHead, Select } from '../components/ui/Primitives';
import { EmptyState } from '../components/ui/Feedback';

const ORDER: ApplicationStatus[] = ['saved', 'preparing', 'applied', 'interview', 'offer', 'rejected'];
const date = (v: string) => new Intl.DateTimeFormat('ar-DZ', { dateStyle: 'medium' }).format(new Date(v));

export default function ApplicationsPage({ jobs }: { jobs: Job[] }) {
  const { items, updateStatus, updateNotes, remove } = useApplications();
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.applications_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all');
  usePageMeta({ title: 'مركز التقديم | ezyjobs', description: 'تابع طلباتك في مكان واحد.', noIndex: true });

  const visible = useMemo(
    () => filter === 'all' ? items : items.filter((x) => x.status === filter),
    [filter, items],
  );

  return (
    <>
      <header className="account-hero applications-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead
            eyebrow={text('eyebrow', 'Application Center')}
            title={text('title', 'مسار كل تقديماتك')}
            lead={text('lead', 'من الحفظ والتحضير إلى التقديم والمقابلة والعرض، بدون جدول خارجي.')}
            action={<Link to="/jobs" className="ez-btn ez-btn-primary px-5 py-3 text-sm">{text('openJobs', 'اكتشف وظائف')}</Link>}
          />
          <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ORDER.map((status) => (
              <button key={status} type="button" onClick={() => setFilter(status)}
                className={`rounded-2xl border px-3 py-3 text-right ${filter === status ? 'border-brand bg-brand-50' : 'border-line bg-paper-2'}`}>
                <span className="block text-lg font-black text-ink">{items.filter((x) => x.status === status).length}</span>
                <span className="mt-1 block text-[11px] text-muted">{APPLICATION_STATUS[status].label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10 lg:py-16">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-ink">{text('currentTitle', 'الطلبات الحالية')}</h2>
            <p className="mt-1 text-sm text-muted">{items.length ? text('trackSaved', '{count} وظيفة في المسار').replace('{count}', String(items.length)) : text('trackEmpty', 'لم تضف أي وظيفة بعد.')}</p>
          </div>
          <Select value={filter} onChange={(e) => setFilter(e.target.value as ApplicationStatus | 'all')}
            options={[{ value: 'all', label: text('allStatuses', 'كل الحالات') }, ...ORDER.map((s) => ({ value: s, label: APPLICATION_STATUS[s].label }))]} />
        </div>

        {visible.length === 0 ? (
          <EmptyState title={text('emptyTitle', 'لا توجد طلبات هنا')} body={text('emptyBody', 'من أي صفحة وظيفة، أضفها لمسار التقديم ثم حدّث حالتها مع تقدّمك.')}
            action={<Link to="/jobs" className="ez-btn ez-btn-primary px-5 py-3 text-sm">{text('startSearch', 'ابدأ البحث')}</Link>} />
        ) : (
          <div className="grid gap-4">
            {visible.map((item) => {
              const job = jobs.find((j) => j.id === item.jobId);
              return (
                <article key={item.id} className="ez-panel p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={APPLICATION_STATUS[item.status].tone}>{APPLICATION_STATUS[item.status].label}</Badge>
                        {item.appliedAt && <span className="text-[11px] text-muted">تم التقديم {date(item.appliedAt)}</span>}
                      </div>
                      <h3 className="mt-3 text-lg font-black text-ink">{item.title}</h3>
                      <p className="mt-1 text-sm text-muted">{item.company}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job && <Link to={`/jobs/${job.slug}`} className="ez-btn ez-btn-ghost px-4 py-2.5 text-[13px]">{text('jobPage', 'صفحة الوظيفة')}</Link>}
                      {job && <Link to={`/applications/${job.id}/kit`} className="ez-btn ez-btn-ghost px-4 py-2.5 text-[13px]">{text('prepare', 'جهّز التقديم')}</Link>}
                      <a href={item.applyUrl} target="_blank" rel="noopener noreferrer" className="ez-btn ez-btn-primary px-4 py-2.5 text-[13px]">{text('openApplication', 'فتح التقديم')}</a>
                      <button type="button" onClick={() => remove(item.jobId)} className="ez-btn ez-btn-ghost px-4 py-2.5 text-[13px] text-danger">{text('remove', 'إزالة')}</button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 border-t border-line pt-5 lg:grid-cols-[260px_1fr]">
                    <label className="block">
                      <span className="ez-label">{text('statusLabel', 'الحالة')}</span>
                      <select value={item.status} onChange={(e) => updateStatus(item.jobId, e.target.value as ApplicationStatus)} className="ez-input mt-1">
                        {ORDER.map((s) => <option key={s} value={s}>{APPLICATION_STATUS[s].label}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="ez-label">{text('notesLabel', 'ملاحظاتك')}</span>
                      <textarea defaultValue={item.notes} onBlur={(e) => updateNotes(item.jobId, e.target.value)}
                        placeholder={text('notesPlaceholder', 'مثلاً: CV v2، مقابلة الثلاثاء، متابعة بعد 5 أيام.')} className="ez-input mt-1 min-h-24 resize-y" />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

