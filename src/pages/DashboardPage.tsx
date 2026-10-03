import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Eligibility, ExperienceLevel, Job, JobStatus, LanguageCode, WorkMode, Commitment } from '../types';
import {
  CATEGORIES,
  COUNTRIES,
  eligibilityName,
} from '../data/taxonomy';
import PageAura from '../components/art/PageAura';
import { useAuth } from '../lib/auth';
import { jobsRepo } from '../lib/jobsRepo';
import { usePageMeta } from '../lib/seo';
import {
  Badge,
  Button,
  Field,
  SectionHead,
  Select,
  TagInput,
  TextArea,
  TextInput,
} from '../components/ui/Primitives';
import { EmptyState, Notice, Spinner } from '../components/ui/Feedback';
import CountUp from '../components/art/CountUp';

type Tab = 'overview' | 'jobs' | 'new';

const statusLabel: Record<JobStatus, string> = {
  published: 'منشورة',
  draft: 'مسودة',
  expired: 'منتهية',
};

const statusTone: Record<JobStatus, 'positive' | 'caution' | 'negative'> = {
  published: 'positive',
  draft: 'caution',
  expired: 'negative',
};

const emptyDraft = (): Job => {
  const now = new Date().toISOString();
  return {
    id: `job-${Date.now().toString(36)}`,
    slug: '',
    titleAr: '',
    titleOriginal: '',
    company: '',
    category: 'support',
    workMode: 'remote',
    commitment: 'full-time',
    experience: 'entry',
    experienceYears: 0,
    eligibility: 'unclear',
    eligibleRegions: ['worldwide'],
    timezoneNote: '',
    languages: [{ code: 'en', level: 'intermediate', required: true }],
    salary: undefined,
    summaryAr: '',
    descriptionAr: '',
    skills: [],
    requirements: [],
    niceToHave: [],
    suitableForStudents: false,
    weeklyHours: 40,
    education: '',
    source: { name: '', url: '', redistributable: true, partner: false },
    applyUrl: '',
    publishedAt: now,
    verifiedAt: now,
    status: 'draft',
    views: 0,
    views7d: [],
  };
};

const slugify = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70);

export default function DashboardPage() {
  const { username, session, isAdmin } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');
  const [draft, setDraft] = useState<Job>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [q, setQ] = useState('');

  usePageMeta({ title: isAdmin ? 'إدارة الوظائف | ezyjobs' : 'لوحة تحكم الناشر | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const { data, error } = isAdmin
      ? await jobsRepo.listAll()
      : await jobsRepo.listMine(session?.user.id);
    setJobs(data);
    setLoading(false);
    if (error) setMessage({ tone: 'error', text: `تعذّر تحميل الوظائف: ${error}` });
  };

  useEffect(() => {
    void load();
  }, [session?.user.id, isAdmin]);

  const stats = useMemo(() => {
    const published = jobs.filter((j) => j.status === 'published');
    const drafts = jobs.filter((j) => j.status === 'draft');
    const openGeo = published.filter((j) => j.eligibility === 'open');
    const students = published.filter((j) => j.suitableForStudents);
    const views = published.reduce((s, j) => s + j.views, 0);
    return [
      { label: 'إجمالي الوظائف', value: jobs.length },
      { label: 'منشورة', value: published.length },
      { label: 'مسودات', value: drafts.length },
      { label: 'أهلية مؤكدة', value: openGeo.length },
      { label: 'فرص للطلاب', value: students.length },
      { label: 'إجمالي المشاهدات', value: views },
    ];
  }, [jobs]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return jobs;
    return jobs.filter(
      (j) =>
        j.titleAr.toLowerCase().includes(t) ||
        j.titleOriginal.toLowerCase().includes(t) ||
        j.company.toLowerCase().includes(t),
    );
  }, [jobs, q]);

  const set = <K extends keyof Job>(k: K, v: Job[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const resetDraft = () => {
    setDraft(emptyDraft());
    setEditingId(null);
    setMessage(null);
  };

  const save = async (status: JobStatus) => {
    if (!draft.titleAr.trim() || !draft.company.trim() || !draft.applyUrl.trim()) {
      setMessage({ tone: 'error', text: 'العنوان والشركة ورابط التقديم حقول إلزامية.' });
      return;
    }
    if (!draft.summaryAr.trim()) {
      setMessage({ tone: 'error', text: 'الملخص العربي مطلوب — هو ما يقرأه المستخدم أولاً.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload: Job = {
      ...draft,
      slug: draft.slug || slugify(draft.titleOriginal || draft.titleAr) || draft.id,
      status,
      verifiedAt: new Date().toISOString(),
      publishedAt:
        draft.status === 'published' && editingId ? draft.publishedAt : new Date().toISOString(),
    };

    const res = editingId
      ? await jobsRepo.update(editingId, payload)
      : await jobsRepo.create(payload, session?.user.id);

    setSaving(false);

    if (res.error || !res.data) {
      setMessage({ tone: 'error', text: res.error ?? 'تعذّر الحفظ.' });
      return;
    }

    setMessage({
      tone: 'success',
      text: status === 'published' ? 'تم نشر الوظيفة بنجاح.' : 'تم حفظ المسودة.',
    });
    resetDraft();
    await load();
    setTab('jobs');
  };

  const toggleStatus = async (job: Job) => {
    const next: JobStatus = job.status === 'published' ? 'draft' : 'published';
    await jobsRepo.update(job.id, { status: next });
    await load();
  };

  const remove = async (job: Job) => {
    if (!confirm(`حذف «${job.titleAr}» نهائياً؟`)) return;
    const res = await jobsRepo.remove(job.id);
    if (res.error) setMessage({ tone: 'error', text: res.error });
    else await load();
  };

  const startEdit = (job: Job) => {
    setDraft(job);
    setEditingId(job.id);
    setMessage(null);
    setTab('new');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-shell bg-paper">
      {/* ترويسة */}
      <header className="dashboard-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="ez-eyebrow mb-4">لوحة الناشر</span>
              <h1 className="text-3xl font-black text-ink sm:text-4xl">
                مرحباً، <span className="text-brand">{username ?? 'ناشر'}</span>
              </h1>
              <p className="mt-3 text-sm text-muted">
                {jobsRepo.mode === 'supabase'
                  ? 'متصل بقاعدة البيانات — كل تغيير يُحفظ فوراً.'
                  : 'وضع محلي — البيانات محفوظة في متصفحك فقط. اربط Supabase للحفظ الدائم.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { resetDraft(); setTab('new'); }}>
                إضافة وظيفة
              </Button>
              <Link to="/" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
                عرض الموقع
              </Link>
            </div>
          </div>

          <nav className="mt-10 flex gap-1 border-b border-line">
            {(
              [
                { id: 'overview', label: 'نظرة عامة' },
                { id: 'jobs', label: 'إدارة الوظائف' },
                { id: 'new', label: editingId ? 'تعديل وظيفة' : 'وظيفة جديدة' },
              ] as { id: Tab; label: string }[]
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? 'border-brand text-brand'
                    : 'border-transparent text-muted hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10 lg:py-14">
        {message && (
          <div className="mb-6">
            <Notice tone={message.tone === 'success' ? 'success' : 'error'}>
              {message.text}
            </Notice>
          </div>
        )}

        {tab === 'overview' && <Overview stats={stats} jobs={jobs} loading={loading} />}

        {tab === 'jobs' && (
          <>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <TextInput
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="ابحث في وظائفك"
                className="sm:max-w-xs"
              />
              <p className="text-[12px] text-muted">
                <span className="tnum font-bold text-ink">{filtered.length}</span> نتيجة
              </p>
            </div>

            {loading ? (
              <div className="ez-panel p-10 text-center text-sm text-muted">جارٍ التحميل</div>
            ) : filtered.length === 0 ? (
              <EmptyState
                title="لا توجد وظائف بعد"
                body="ابدأ بإضافة أول وظيفة لتظهر في الموقع."
                action={<Button onClick={() => setTab('new')}>إضافة وظيفة</Button>}
              />
            ) : (
              <div className="ez-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="ez-table w-full min-w-[820px]">
                    <thead className="bg-paper-2">
                      <tr>
                        {['الوظيفة', 'المصدر', 'الأهلية', 'الحالة', 'المشاهدات', ''].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-5 py-3.5 text-right text-[11px] font-bold tracking-wide text-muted"
                            >
                              {h}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filtered.map((job) => (
                        <tr key={job.id} className="transition-colors hover:bg-paper-2/50">
                          <td className="px-5 py-4">
                            <Link
                              to={`/jobs/${job.slug}`}
                              className="text-[14px] font-bold text-ink transition-colors hover:text-brand"
                            >
                              {job.titleAr}
                            </Link>
                            <p className="mt-0.5 text-[12px] text-muted">{job.company}</p>
                          </td>
                          <td className="px-5 py-4 text-[13px] text-muted">
                            {job.source.name || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              tone={
                                job.eligibility === 'open'
                                  ? 'positive'
                                  : job.eligibility === 'closed'
                                    ? 'negative'
                                    : job.eligibility === 'limited'
                                      ? 'caution'
                                      : 'neutral'
                              }
                            >
                              {eligibilityName(job.eligibility)}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <Badge tone={statusTone[job.status]}>{statusLabel[job.status]}</Badge>
                          </td>
                          <td className="tnum px-5 py-4 text-[13px] font-semibold text-ink">
                            {job.views.toLocaleString('en-US')}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEdit(job)}
                                className="ez-btn ez-btn-ghost px-3 py-1.5 text-[12px]"
                              >
                                تعديل
                              </button>
                              <button
                                onClick={() => toggleStatus(job)}
                                className="ez-btn ez-btn-ghost px-3 py-1.5 text-[12px]"
                              >
                                {job.status === 'published' ? 'إخفاء' : 'نشر'}
                              </button>
                              <button
                                onClick={() => remove(job)}
                                className="ez-btn px-3 py-1.5 text-[12px] text-danger transition-colors hover:bg-danger-soft"
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'new' && (
          <JobForm
            draft={draft}
            set={set}
            editingId={editingId}
            saving={saving}
            onSave={save}
            onCancel={resetDraft}
          />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Overview({
  stats,
  jobs,
  loading,
}: {
  stats: { label: string; value: number }[];
  jobs: Job[];
  loading: boolean;
}) {
  const top = useMemo(() => [...jobs].sort((a, b) => b.views - a.views).slice(0, 5), [jobs]);

  return (
    <div className="space-y-8">
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface p-6">
            <p className="font-display text-3xl font-bold text-ink">
              {loading ? '—' : <CountUp value={s.value} />}
            </p>
            <p className="mt-1.5 text-[12.5px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="ez-panel p-6">
        <h2 className="text-sm font-bold text-ink">الأكثر مشاهدة</h2>
        {top.length === 0 ? (
          <p className="mt-4 text-[13px] text-muted">لا توجد بيانات بعد.</p>
        ) : (
          <ol className="mt-5 space-y-3">
            {top.map((job, i) => (
              <li key={job.id} className="flex items-center gap-4">
                <span className="tnum w-6 shrink-0 font-display text-sm font-bold text-brand/50">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-semibold text-ink">{job.titleAr}</p>
                  <p className="text-[12px] text-muted">{job.company}</p>
                </div>
                <div className="flex h-8 w-32 shrink-0 items-end gap-0.5">
                  {job.views7d.length ? (
                    job.views7d.map((v, k) => (
                      <span
                        key={k}
                        className="flex-1 rounded-sm bg-brand/20"
                        style={{ height: `${Math.min(100, v * 1.5)}%` }}
                      />
                    ))
                  ) : (
                    <span className="h-1.5 w-full rounded-sm bg-line" />
                  )}
                </div>
                <span className="tnum w-16 shrink-0 text-left text-[13px] font-bold text-ink">
                  {job.views.toLocaleString('en-US')}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function JobForm({
  draft,
  set,
  editingId,
  saving,
  onSave,
  onCancel,
}: {
  draft: Job;
  set: <K extends keyof Job>(k: K, v: Job[K]) => void;
  editingId: string | null;
  saving: boolean;
  onSave: (status: JobStatus) => void;
  onCancel: () => void;
}) {
  const regions = draft.eligibleRegions.filter((r) => r !== 'worldwide');

  return (
    <div className="space-y-8">
      <SectionHead
        eyebrow={editingId ? 'تعديل' : 'وظيفة جديدة'}
        title={editingId ? `تعديل: ${draft.titleAr || '—'}` : 'أضف فرصة جديدة'}
        lead="الحقول المطلوبة بعلامة نجمة. اكتب الملخص العربي كأنك تشرح لصديق: هذه أهم معلومة في الصفحة."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* الهوية */}
        <FormCard title="هوية الوظيفة">
          <Field label="المسمى بالعربية *">
            <TextInput
              value={draft.titleAr}
              onChange={(e) => set('titleAr', e.target.value)}
              placeholder="أخصائي دعم عملاء"
            />
          </Field>
          <Field label="المسمى الأصلي في الإعلان" hint="كما ورد في المصدر، بلغة المصدر">
            <TextInput
              value={draft.titleOriginal}
              onChange={(e) => set('titleOriginal', e.target.value)}
              dir="ltr"
              placeholder="Customer Support Specialist"
            />
          </Field>
          <Field label="الشركة *">
            <TextInput
              value={draft.company}
              onChange={(e) => set('company', e.target.value)}
              dir="ltr"
              placeholder="اسم الشركة"
            />
          </Field>
          <Field label="رابط موقع الشركة">
            <TextInput
              value={draft.companyUrl ?? ''}
              onChange={(e) => set('companyUrl', e.target.value)}
              dir="ltr"
              placeholder="https://"
            />
          </Field>
          <Field label="المجال">
            <Select
              value={draft.category}
              onChange={(e) => set('category', e.target.value)}
              options={CATEGORIES.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Field>
        </FormCard>

        {/* التصنيف */}
        <FormCard title="التصنيف والتحليل">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="نوع العمل">
              <Select
                value={draft.workMode}
                onChange={(e) => set('workMode', e.target.value as WorkMode)}
                options={[
                  { value: 'remote', label: 'عن بُعد بالكامل' },
                  { value: 'hybrid', label: 'هجين' },
                  { value: 'onsite', label: 'في الموقع' },
                ]}
              />
            </Field>
            <Field label="الدوام">
              <Select
                value={draft.commitment}
                onChange={(e) => set('commitment', e.target.value as Commitment)}
                options={[
                  { value: 'full-time', label: 'دوام كامل' },
                  { value: 'part-time', label: 'دوام جزئي' },
                  { value: 'internship', label: 'تدريب' },
                  { value: 'freelance', label: 'عمل حر' },
                  { value: 'contract', label: 'عقد مؤقت' },
                ]}
              />
            </Field>
            <Field label="مستوى الخبرة">
              <Select
                value={draft.experience}
                onChange={(e) => set('experience', e.target.value as ExperienceLevel)}
                options={[
                  { value: 'student', label: 'طالب' },
                  { value: 'entry', label: 'مبتدئ / بدون خبرة' },
                  { value: 'junior', label: 'Junior' },
                  { value: 'mid', label: 'خبرة متوسطة' },
                  { value: 'senior', label: 'خبرة متقدمة' },
                ]}
              />
            </Field>
            <Field label="سنوات الخبرة المطلوبة" hint="0 = لا تُشترط">
              <TextInput
                type="number"
                min={0}
                max={20}
                value={draft.experienceYears}
                onChange={(e) => set('experienceYears', Number(e.target.value) || 0)}
              />
            </Field>
            <Field label="الساعات أسبوعياً">
              <TextInput
                type="number"
                min={1}
                max={80}
                value={draft.weeklyHours ?? ''}
                onChange={(e) => set('weeklyHours', Number(e.target.value) || undefined)}
              />
            </Field>
            <Field label="المؤهل المطلوب">
              <TextInput
                value={draft.education ?? ''}
                onChange={(e) => set('education', e.target.value)}
                placeholder="غير مطلوب"
              />
            </Field>
          </div>

          <label className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand"
              checked={draft.suitableForStudents}
              onChange={(e) => set('suitableForStudents', e.target.checked)}
            />
            <span className="text-[13px] font-semibold text-ink">
              مناسبة للطلاب أثناء الدراسة
            </span>
          </label>
        </FormCard>

        {/* الأهلية */}
        <FormCard title="الأهلية الجغرافية" note="أهم ما يميز المنصة — كن دقيقاً هنا.">
          <Field label="حالة الأهلية">
            <Select
              value={draft.eligibility}
              onChange={(e) => set('eligibility', e.target.value as Eligibility)}
              options={[
                { value: 'open', label: 'مؤكدة — تقبل دولنا' },
                { value: 'limited', label: 'محدودة — دول محددة' },
                { value: 'unclear', label: 'غير واضحة — لم يحدد الإعلان' },
                { value: 'closed', label: 'غير مؤهلة — إقامة أو تأشيرة' },
              ]}
            />
          </Field>

          <Field
            label="الدول المقبولة"
            hint="اتركها فارغة مع اختيار «أي دولة» إن كان الإعلان عن بُعد عالمياً"
          >
            <TagInput
              values={regions}
              onChange={(v) => set('eligibleRegions', v.length ? v : ['worldwide'])}
              placeholder="DZ, MA, EG"
              suggestions={COUNTRIES.map((c) => c.code)}
            />
          </Field>

          <label className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
            <input
              type="checkbox"
              className="h-4 w-4 accent-brand"
              checked={draft.eligibleRegions.includes('worldwide')}
              onChange={(e) =>
                set(
                  'eligibleRegions',
                  e.target.checked ? ['worldwide'] : regions.length ? regions : ['DZ'],
                )
              }
            />
            <span className="text-[13px] font-semibold text-ink">
              أي دولة (worldwide)
            </span>
          </label>

          <Field label="ملاحظة المنطقة الزمنية">
            <TextArea
              rows={2}
              value={draft.timezoneNote ?? ''}
              onChange={(e) => set('timezoneNote', e.target.value)}
              placeholder="مثال: تداخل مع ساعات الفريق في برلين"
            />
          </Field>
        </FormCard>

        {/* اللغات والراتب */}
        <FormCard title="اللغات والراتب">
          <span className="ez-label">اللغات المطلوبة</span>
          <div className="mb-4 space-y-2">
            {draft.languages.map((l, i) => (
              <div key={i} className="flex gap-2">
                <Select
                  value={l.code}
                  onChange={(e) =>
                    set(
                      'languages',
                      draft.languages.map((x, k) =>
                        k === i ? { ...x, code: e.target.value as LanguageCode } : x,
                      ),
                    )
                  }
                  options={[
                    { value: 'ar', label: 'العربية' },
                    { value: 'en', label: 'الإنجليزية' },
                    { value: 'fr', label: 'الفرنسية' },
                    { value: 'es', label: 'الإسبانية' },
                    { value: 'de', label: 'الألمانية' },
                    { value: 'tr', label: 'التركية' },
                    { value: 'other', label: 'أخرى' },
                  ]}
                />
                <Select
                  value={l.level}
                  onChange={(e) =>
                    set(
                      'languages',
                      draft.languages.map((x, k) =>
                        k === i
                          ? { ...x, level: e.target.value as 'native' | 'fluent' | 'intermediate' | 'basic' }
                          : x,
                      ),
                    )
                  }
                  options={[
                    { value: 'native', label: 'لغة أم' },
                    { value: 'fluent', label: 'إتقان' },
                    { value: 'intermediate', label: 'متوسط B1–B2' },
                    { value: 'basic', label: 'مبتدئ A1–A2' },
                  ]}
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      'languages',
                      draft.languages.filter((_, k) => k !== i),
                    )
                  }
                  className="ez-btn ez-btn-ghost px-3 text-[12px] text-danger"
                >
                  حذف
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                set('languages', [
                  ...draft.languages,
                  { code: 'ar', level: 'fluent', required: false },
                ])
              }
            >
              + إضافة لغة
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="العملة">
              <Select
                value={draft.salary?.currency ?? 'USD'}
                onChange={(e) =>
                  set('salary', {
                    currency: e.target.value,
                    period: draft.salary?.period ?? 'month',
                    ...(draft.salary?.min != null ? { min: draft.salary.min } : {}),
                    ...(draft.salary?.max != null ? { max: draft.salary.max } : {}),
                  })
                }
                options={[
                  { value: 'USD', label: 'دولار' },
                  { value: 'EUR', label: 'يورو' },
                  { value: 'SAR', label: 'ريال سعودي' },
                  { value: 'AED', label: 'درهم' },
                  { value: 'DZD', label: 'دينار جزائري' },
                  { value: 'MAD', label: 'درهم مغربي' },
                  { value: 'EGP', label: 'جنيه مصري' },
                ]}
              />
            </Field>
            <Field label="الفترة">
              <Select
                value={draft.salary?.period ?? 'month'}
                onChange={(e) =>
                  set('salary', {
                    currency: draft.salary?.currency ?? 'USD',
                    period: e.target.value as 'hour' | 'month' | 'year' | 'project',
                    ...(draft.salary?.min != null ? { min: draft.salary.min } : {}),
                    ...(draft.salary?.max != null ? { max: draft.salary.max } : {}),
                  })
                }
                options={[
                  { value: 'hour', label: 'بالساعة' },
                  { value: 'month', label: 'شهرياً' },
                  { value: 'year', label: 'سنوياً' },
                  { value: 'project', label: 'للمشروع' },
                ]}
              />
            </Field>
            <Field label="الحد الأدنى">
              <TextInput
                type="number"
                value={draft.salary?.min ?? ''}
                onChange={(e) =>
                  set('salary', {
                    currency: draft.salary?.currency ?? 'USD',
                    period: draft.salary?.period ?? 'month',
                    min: Number(e.target.value) || undefined,
                    ...(draft.salary?.max != null ? { max: draft.salary.max } : {}),
                  })
                }
              />
            </Field>
            <Field label="الحد الأعلى">
              <TextInput
                type="number"
                value={draft.salary?.max ?? ''}
                onChange={(e) =>
                  set('salary', {
                    currency: draft.salary?.currency ?? 'USD',
                    period: draft.salary?.period ?? 'month',
                    max: Number(e.target.value) || undefined,
                    ...(draft.salary?.min != null ? { min: draft.salary.min } : {}),
                  })
                }
              />
            </Field>
          </div>
        </FormCard>

        {/* المحتوى */}
        <FormCard title="المحتوى العربي">
          <Field label="الملخص العربي *" hint="سطران يجيبان: ما العمل؟ ولماذا يهمني؟">
            <TextArea
              rows={3}
              value={draft.summaryAr}
              onChange={(e) => set('summaryAr', e.target.value)}
            />
          </Field>
          <Field label="الوصف الكامل">
            <TextArea
              rows={6}
              value={draft.descriptionAr}
              onChange={(e) => set('descriptionAr', e.target.value)}
            />
          </Field>
          <Field label="المهارات" hint="اضغط Enter بعد كل مهارة">
            <TagInput values={draft.skills} onChange={(v) => set('skills', v)} />
          </Field>
          <Field label="شروط أساسية">
            <TagInput values={draft.requirements} onChange={(v) => set('requirements', v)} />
          </Field>
          <Field label="مستحسن (اختياري)">
            <TagInput values={draft.niceToHave} onChange={(v) => set('niceToHave', v)} />
          </Field>
        </FormCard>

        {/* المصدر */}
        <FormCard title="المصدر ورابط التقديم">
          <Field label="اسم المصدر *">
            <TextInput
              value={draft.source.name}
              onChange={(e) => set('source', { ...draft.source, name: e.target.value })}
              placeholder="Remote OK"
            />
          </Field>
          <Field label="رابط المصدر">
            <TextInput
              value={draft.source.url}
              onChange={(e) => set('source', { ...draft.source, url: e.target.value })}
              dir="ltr"
              placeholder="https://"
            />
          </Field>
          <Field label="رابط التقديم الرسمي *" hint="الرابط الذي سيذهب إليه المستخدم">
            <TextInput
              value={draft.applyUrl}
              onChange={(e) => set('applyUrl', e.target.value)}
              dir="ltr"
              placeholder="https://"
            />
          </Field>
          <div className="space-y-2">
            <label className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                checked={draft.source.redistributable}
                onChange={(e) =>
                  set('source', { ...draft.source, redistributable: e.target.checked })
                }
              />
              <span className="text-[13px] font-semibold text-ink">
                المصدر يسمح بإعادة التوزيع
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
              <input
                type="checkbox"
                className="h-4 w-4 accent-brand"
                checked={draft.source.partner}
                onChange={(e) => set('source', { ...draft.source, partner: e.target.checked })}
              />
              <span className="text-[13px] font-semibold text-ink">رابط تابع (عمولة)</span>
            </label>
          </div>
        </FormCard>
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-3 border-t border-line bg-paper/95 py-4 backdrop-blur">
        <Button variant="ghost" onClick={onCancel}>
          إلغاء
        </Button>
        <Button onClick={() => onSave('draft')} disabled={saving}>
          {saving && <Spinner />}
          حفظ كمسودة
        </Button>
        <Button onClick={() => onSave('published')} disabled={saving}>
          {saving && <Spinner />}
          نشر الآن
        </Button>
      </div>
    </div>
  );
}

function FormCard({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ez-panel p-6">
      <h2 className="text-sm font-bold text-ink">{title}</h2>
      {note && <p className="mt-1 text-[12px] text-muted">{note}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
