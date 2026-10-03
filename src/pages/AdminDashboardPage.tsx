import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from '../components/art/CountUp';
import { AdminShell, Badge, Button, Field } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../lib/auth';
import { adminRepo, type AdminAlert, type AdminUser, type SiteSetting } from '../lib/adminRepo';
import { jobsRepo } from '../lib/jobsRepo';
import type { Job } from '../types';
import { usePageMeta } from '../lib/seo';

export default function AdminDashboardPage() {
  const { username, changePassword } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [jobQuery, setJobQuery] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  usePageMeta({ title: 'لوحة الإدارة | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const [jr, ur, ar, sr] = await Promise.all([
      adminRepo.listAllJobs(),
      adminRepo.listUsers(),
      adminRepo.listAlerts(),
      adminRepo.listSettings(),
    ]);
    setJobs(jr.data);
    setUsers(ur.data);
    setAlerts(ar.data);
    setSettings(sr.data);
    const firstError = [jr.error, ur.error, ar.error, sr.error].find(Boolean);
    setMessage(firstError ? { tone: 'error', text: firstError as string } : null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const stats = useMemo(() => [
    { label: 'كل الوظائف', value: jobs.length },
    { label: 'منشورة', value: jobs.filter((j) => j.status === 'published').length },
    { label: 'مستخدمون', value: users.length },
    { label: 'ناشرون', value: users.filter((u) => u.role === 'publisher').length },
    { label: 'Admins', value: users.filter((u) => u.role === 'admin').length },
    { label: 'تنبيهات فعالة', value: alerts.filter((a) => a.status === 'active').length },
  ], [jobs, users, alerts]);

  const filteredJobs = useMemo(() => {
    const q = jobQuery.trim().toLowerCase();
    return q ? jobs.filter((j) => (`${j.titleAr} ${j.company} ${j.slug}`).toLowerCase().includes(q)) : jobs;
  }, [jobs, jobQuery]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    return q ? users.filter((u) => (`${u.username} ${u.displayName} ${u.role}`).toLowerCase().includes(q)) : users;
  }, [users, userQuery]);

  const setJobStatus = async (job: Job) => {
    const next = job.status === 'published' ? 'draft' : 'published';
    setSaving(true);
    const res = await jobsRepo.update(job.id, { status: next });
    setSaving(false);
    if (res.error) setMessage({ tone: 'error', text: res.error });
    else await load();
  };

  const deleteJob = async (job: Job) => {
    if (!window.confirm(`حذف «${job.titleAr}» نهائياً؟`)) return;
    setSaving(true);
    const res = await jobsRepo.remove(job.id);
    setSaving(false);
    if (res.error) setMessage({ tone: 'error', text: res.error });
    else await load();
  };

  const setRole = async (user: AdminUser, role: AdminUser['role']) => {
    setSaving(true);
    const res = await adminRepo.setUserRole(user.id, role);
    setSaving(false);
    setMessage(res.ok
      ? { tone: 'success', text: `تم تحديث دور ${user.username}.` }
      : { tone: 'error', text: res.error ?? 'تعذر تحديث الدور.' });
    if (res.ok) await load();
  };

  const saveSetting = async (setting: SiteSetting, value: string) => {
    setSaving(true);
    const res = await adminRepo.saveSetting(setting.key, value, setting.isPublic);
    setSaving(false);
    setMessage(res.ok
      ? { tone: 'success', text: `تم حفظ «${setting.key}».` }
      : { tone: 'error', text: res.error ?? 'تعذر الحفظ.' });
    if (res.ok) await load();
  };

  const addSetting = async () => {
    if (!newKey.trim()) return;
    const res = await adminRepo.saveSetting(newKey, newValue, true);
    if (!res.ok) setMessage({ tone: 'error', text: res.error ?? 'تعذر الإضافة.' });
    setNewKey('');
    setNewValue('');
    await load();
  };

  const removeAlert = async (alert: AdminAlert) => {
    if (!window.confirm(`حذف تنبيه ${alert.email}؟`)) return;
    setSaving(true);
    const res = await adminRepo.removeAlert(alert.email);
    setSaving(false);
    if (res.error) setMessage({ tone: 'error', text: res.error });
    else await load();
  };

  const updatePassword = async () => {
    if (password.length < 8) {
      setMessage({ tone: 'error', text: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' });
      return;
    }
    if (password !== password2) {
      setMessage({ tone: 'error', text: 'كلمتا المرور غير متطابقتين.' });
      return;
    }
    setSaving(true);
    const error = await changePassword(password);
    setSaving(false);
    if (error) setMessage({ tone: 'error', text: error });
    else {
      setPassword('');
      setPassword2('');
      setMessage({ tone: 'success', text: 'تم تغيير كلمة المرور بنجاح.' });
    }
  };

  return (
    <AdminShell
      title="لوحة التحكم"
      eyebrow="ADMIN CONSOLE"
      description={`مرحباً ${username ?? 'Admin'} — كل ما تحتاجه لإدارة ezyjobs في صفحة واحدة واضحة.`}
    >
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        {message && <div className="mb-5"><Notice tone={message.tone}>{message.text}</Notice></div>}
        {loading ? (
          <div className="ez-panel p-14 text-center text-sm text-muted"><Spinner /> جارٍ تجهيز لوحة التحكم</div>
        ) : (
          <Overview
            stats={stats}
            jobs={jobs}
            users={users}
            alerts={alerts}
            settings={settings}
            filteredJobs={filteredJobs}
            jobQuery={jobQuery}
            setJobQuery={setJobQuery}
            onToggleJob={setJobStatus}
            onDeleteJob={deleteJob}
            saving={saving}
            onRole={setRole}
            onDeleteAlert={removeAlert}
            password={password}
            password2={password2}
            setPassword={setPassword}
            setPassword2={setPassword2}
            onChangePassword={updatePassword}
          />
        )}
      </main>
    </AdminShell>
  );
}

function Overview({
  stats,
  jobs,
  users,
  alerts,
  settings,
  filteredJobs,
  jobQuery,
  setJobQuery,
  onToggleJob,
  onDeleteJob,
  saving,
  onRole,
  onDeleteAlert,
  password,
  password2,
  setPassword,
  setPassword2,
  onChangePassword,
}: {
  stats: { label: string; value: number }[];
  jobs: Job[];
  users: AdminUser[];
  alerts: AdminAlert[];
  settings: SiteSetting[];
  filteredJobs: Job[];
  jobQuery: string;
  setJobQuery: (value: string) => void;
  onToggleJob: (job: Job) => void;
  onDeleteJob: (job: Job) => void;
  saving: boolean;
  onRole: (user: AdminUser, role: AdminUser['role']) => void;
  onDeleteAlert: (alert: AdminAlert) => void;
  password: string;
  password2: string;
  setPassword: (value: string) => void;
  setPassword2: (value: string) => void;
  onChangePassword: () => void;
}) {
  const getSetting = (key: string) => settings.find((s) => s.key === key)?.value;
  const publishedJobs = jobs.filter((job) => job.status === 'published').length;
  const draftJobs = jobs.length - publishedJobs;
  const activeAlerts = alerts.filter((alert) => alert.status === 'active');
  const recentJobs = filteredJobs.slice(0, 8);
  const recentUsers = users.slice(0, 6);
  const adminCount = users.filter((user) => user.role === 'admin').length;
  const publisherCount = users.filter((user) => user.role === 'publisher').length;
  const monetizationReady = getSetting('ads_enabled') === 'true' || getSetting('creator_program_enabled') === 'true';
  const adsEnabled = getSetting('ads_enabled') === 'true';
  const creatorsEnabled = getSetting('creator_program_enabled') !== 'false';
  const jobsCoverage = jobs.length ? Math.round((publishedJobs / jobs.length) * 100) : 0;

  return (
    <div className="space-y-7">
      <section className="overflow-hidden rounded-[24px] border border-black/10 bg-[#101016] text-white shadow-[0_30px_80px_-50px_rgba(0,0,0,0.55)]">
        <div className="grid gap-0 lg:grid-cols-[1.35fr_.65fr]">
          <div className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="onDark">ADMIN CONTROL</Badge>
              <span className="text-xs text-white/40">جلسة تشغيلية</span>
            </div>
            <h2 className="mt-4 max-w-2xl text-2xl font-black leading-tight sm:text-3xl">مركز الإدارة اليومي</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">تابع ما يحتاج قرارًا أولًا، ثم انتقل إلى الإدارة التفصيلية. كل الوحدات الأساسية مرتبطة مباشرة من هنا.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/dashboard" className="ez-btn ez-btn-primary px-4 py-2.5 text-sm">إضافة / إدارة وظيفة</Link>
              <Link to="/admin/finance" className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08] hover:text-white">المركز المالي</Link>
              <Link to="/admin/settings" className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08] hover:text-white">الإعدادات</Link>
              <Link to="/" className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-bold text-white/80 transition hover:bg-white/[0.08] hover:text-white">عرض الموقع</Link>
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/[0.025] p-6 lg:border-r lg:border-t-0 lg:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Publication coverage</p>
            <p className="mt-3 text-4xl font-black">{jobsCoverage}%</p>
            <p className="mt-2 text-xs leading-6 text-white/50">نسبة الوظائف المنشورة من إجمالي الوظائف الموجودة حاليًا.</p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${jobsCoverage}%` }} />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-white/50">
              <span>{publishedJobs} منشورة</span>
              <span>{draftJobs} مسودة</span>
            </div>
          </div>
        </div>
      </section>

      {(draftJobs > 0 || activeAlerts.length > 0 || !monetizationReady) && (
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="ez-eyebrow">ATTENTION</span>
              <h2 className="mt-1 text-xl font-black text-ink">أشياء قد تحتاج مراجعة</h2>
            </div>
            <p className="text-xs text-muted">المؤشرات هنا مبنية على البيانات الحالية فقط.</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {draftJobs > 0 && (
              <Link to="/dashboard" className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 transition hover:border-amber-400/40">
                <p className="text-xs font-bold text-muted">وظائف غير منشورة</p>
                <p className="mt-2 text-2xl font-black text-ink">{draftJobs}</p>
                <p className="mt-1 text-xs text-muted">افتح إدارة الوظائف لمراجعتها.</p>
              </Link>
            )}
            {activeAlerts.length > 0 && (
              <Link to="/alerts" className="rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 transition hover:border-amber-400/40">
                <p className="text-xs font-bold text-muted">تنبيهات نشطة</p>
                <p className="mt-2 text-2xl font-black text-ink">{activeAlerts.length}</p>
                <p className="mt-1 text-xs text-muted">راجع قوائم التنبيه وإدارتها.</p>
              </Link>
            )}
            {!monetizationReady && (
              <Link to="/admin/settings" className="rounded-2xl border border-brand/25 bg-brand/10 p-4 transition hover:border-brand/40">
                <p className="text-xs font-bold text-muted">إعدادات الربح</p>
                <p className="mt-2 text-lg font-black text-ink">تحتاج إعداد</p>
                <p className="mt-1 text-xs text-muted">فعّل إعدادًا واحدًا على الأقل للربح أو الإعلانات.</p>
              </Link>
            )}
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {stats.map((item) => (
          <div key={item.label} className="ez-panel p-5">
            <p className="font-display text-2xl font-black text-ink"><CountUp value={item.value} /></p>
            <p className="mt-1.5 text-xs text-muted">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/admin/creators" className="ez-panel group p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between"><Badge tone={creatorsEnabled ? 'positive' : 'caution'}>{creatorsEnabled ? 'مفعل' : 'متوقف'}</Badge><span className="text-xs text-muted">{publisherCount} ناشر</span></div>
          <h2 className="mt-4 font-black text-ink">EzyPublish</h2>
          <p className="mt-1 text-sm leading-6 text-muted">الكتّاب، المقالات، الإيرادات، وعملية السحب.</p>
          <span className="mt-4 inline-block text-xs font-bold text-brand group-hover:underline">فتح الإدارة ←</span>
        </Link>
        <Link to="/admin/tasks" className="ez-panel group p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between"><Badge tone="positive">تشغيلي</Badge><span className="text-xs text-muted">وحدة</span></div>
          <h2 className="mt-4 font-black text-ink">EzyTasks</h2>
          <p className="mt-1 text-sm leading-6 text-muted">الحملات، المهام الممولة، ومراجعة التنفيذات.</p>
          <span className="mt-4 inline-block text-xs font-bold text-brand group-hover:underline">فتح الإدارة ←</span>
        </Link>
        <Link to="/admin/finance" className="ez-panel group p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between"><Badge tone="positive">رقابة</Badge><span className="text-xs text-muted">مركز</span></div>
          <h2 className="mt-4 font-black text-ink">المركز المالي</h2>
          <p className="mt-1 text-sm leading-6 text-muted">الإيرادات الموثقة، الاحتياطيات، السحوبات والمصالحة.</p>
          <span className="mt-4 inline-block text-xs font-bold text-brand group-hover:underline">فتح المركز المالي ←</span>
        </Link>
        <Link to="/admin/settings" className="ez-panel group p-5 transition-transform hover:-translate-y-0.5">
          <div className="flex items-center justify-between"><Badge tone={monetizationReady ? 'positive' : 'caution'}>{monetizationReady ? 'مُهيأ' : 'يحتاج إعداد'}</Badge><span className="text-xs text-muted">{adminCount} Admin</span></div>
          <h2 className="mt-4 font-black text-ink">الإعدادات والربح</h2>
          <p className="mt-1 text-sm leading-6 text-muted">AdSense، EzyPublish، نصوص الموقع وإعدادات المنصة.</p>
          <span className="mt-4 inline-block text-xs font-bold text-brand group-hover:underline">فتح الإعدادات ←</span>
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_.9fr]">
        <div className="ez-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><span className="ez-eyebrow">JOBS</span><h2 className="mt-1 text-xl font-black text-ink">إدارة الوظائف</h2><p className="mt-1 text-xs text-muted">{publishedJobs} وظيفة منشورة حاليًا</p></div>
            <input value={jobQuery} onChange={(e) => setJobQuery(e.target.value)} placeholder="ابحث عن وظيفة أو شركة" className="ez-input w-full sm:max-w-[260px]" />
          </div>
          <div className="overflow-x-auto">
            <table className="ez-table w-full min-w-[780px]">
              <thead><tr>{['الوظيفة','الشركة','الحالة','المشاهدات','إجراءات'].map((x) => <th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {recentJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-5 py-4"><p className="font-bold text-ink">{job.titleAr}</p><p className="text-[11px] text-muted">{job.slug}</p></td>
                    <td className="px-5 py-4 text-sm text-muted">{job.company}</td>
                    <td className="px-5 py-4"><Badge tone={job.status === 'published' ? 'positive' : 'caution'}>{job.status === 'published' ? 'منشورة' : 'مسودة'}</Badge></td>
                    <td className="tnum px-5 py-4 text-sm font-bold text-ink">{job.views.toLocaleString('en-US')}</td>
                    <td className="px-5 py-4"><div className="flex gap-2"><button disabled={saving} onClick={() => onToggleJob(job)} className="ez-btn ez-btn-ghost px-3 py-1.5 text-xs">{job.status === 'published' ? 'إخفاء' : 'نشر'}</button><Link to="/dashboard" className="ez-btn ez-btn-ghost px-3 py-1.5 text-xs">تعديل</Link><button disabled={saving} onClick={() => onDeleteJob(job)} className="ez-btn px-3 py-1.5 text-xs text-danger">حذف</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ez-panel overflow-hidden">
          <div className="border-b border-line p-5"><span className="ez-eyebrow">USERS</span><h2 className="mt-1 text-xl font-black text-ink">المستخدمون</h2><p className="mt-1 text-xs text-muted">آخر الحسابات مع إمكانية تغيير الدور مباشرة.</p></div>
          <div className="divide-y divide-line">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{user.username}</p><p className="truncate text-xs text-muted">{user.displayName || 'بدون اسم'}</p></div>
                <select disabled={saving} value={user.role} onChange={(e) => onRole(user, e.target.value as AdminUser['role'])} className="ez-input w-auto text-xs">
                  <option value="seeker">seeker</option><option value="publisher">publisher</option><option value="admin">admin</option>
                </select>
              </div>
            ))}
            {recentUsers.length === 0 && <p className="p-5 text-sm text-muted">لا يوجد مستخدمون بعد.</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="ez-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line p-5"><div><span className="ez-eyebrow">ALERTS</span><h2 className="mt-1 text-xl font-black text-ink">التنبيهات</h2></div><Badge tone={activeAlerts.length ? 'caution' : 'positive'}>{activeAlerts.length} فعالة</Badge></div>
          <div className="divide-y divide-line">
            {activeAlerts.slice(0, 6).map((alert) => (
              <div key={alert.email} className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-ink">{alert.email}</p><p className="text-xs text-muted">{alert.country} · {alert.frequency}</p></div><button disabled={saving} onClick={() => onDeleteAlert(alert)} className="ez-btn px-3 py-1.5 text-xs text-danger">حذف</button></div>
            ))}
            {!activeAlerts.length && <p className="p-5 text-sm text-muted">لا توجد تنبيهات فعالة.</p>}
          </div>
          <div className="border-t border-line bg-paper-2 p-4"><Link to="/alerts" className="text-xs font-bold text-brand hover:underline">فتح صفحة التنبيهات للمستخدمين ←</Link></div>
        </div>

        <div className="ez-panel p-5">
          <span className="ez-eyebrow">CONTENT & SETTINGS</span>
          <h2 className="mt-1 text-xl font-black text-ink">المحتوى وإعدادات الموقع</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Link to="/admin/pages" className="rounded-xl border border-line bg-paper p-4 transition-colors hover:border-brand-100"><p className="font-bold text-ink">صفحات الموقع</p><p className="mt-1 text-xs text-muted">الصفحات والسياسات الثابتة</p></Link>
            <Link to="/admin/guides" className="rounded-xl border border-line bg-paper p-4 transition-colors hover:border-brand-100"><p className="font-bold text-ink">الأدلة والمقالات</p><p className="mt-1 text-xs text-muted">إنشاء وتعديل المحتوى التعليمي</p></Link>
          </div>
          <div className="mt-3 rounded-xl border border-line bg-paper p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-bold text-ink">إعدادات الصفحة الرئيسية</p><p className="mt-1 text-xs text-muted">{settings.length} إعدادًا محفوظًا في النظام</p></div><Link to="/admin/settings" className="ez-btn ez-btn-ghost px-3 py-2 text-xs">فتح الإعدادات</Link></div></div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="ez-panel p-5">
          <span className="ez-eyebrow">SECURITY</span>
          <h2 className="mt-1 text-xl font-black text-ink">أمان حساب الإدارة</h2>
          <p className="mt-1 text-xs leading-6 text-muted">غيّر كلمة المرور من نفس الصفحة دون الانتقال إلى إعداد منفصل.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Field label="كلمة المرور الجديدة"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="ez-input mt-2" minLength={8} autoComplete="new-password" /></Field>
            <Field label="تأكيد كلمة المرور"><input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="ez-input mt-2" minLength={8} autoComplete="new-password" /></Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><Button disabled={saving} onClick={onChangePassword}>{saving ? 'جارٍ الحفظ' : 'تغيير كلمة المرور'}</Button><Link to="/profile" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">الحساب الشخصي</Link></div>
        </div>

        <div className="ez-panel p-5">
          <span className="ez-eyebrow">QUICK STATUS</span>
          <h2 className="mt-1 text-xl font-black text-ink">حالة المنصة</h2>
          <div className="mt-5 space-y-3">
            <StatusLine label="قاعدة المحتوى" value="متصلة" tone="positive" />
            <StatusLine label="نظام المصالحة المالية" value="متاح" tone="positive" />
            <StatusLine label="EzyPublish" value={creatorsEnabled ? 'مفعل' : 'متوقف'} tone={creatorsEnabled ? 'positive' : 'caution'} />
            <StatusLine label="AdSense" value={adsEnabled ? 'مفعل' : 'غير مفعل'} tone={adsEnabled ? 'positive' : 'neutral'} />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusLine({ label, value, tone }: { label: string; value: string; tone: 'positive' | 'caution' | 'neutral' }) {
  return <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-paper px-4 py-3"><span className="text-sm text-muted">{label}</span><Badge tone={tone}>{value}</Badge></div>;
}
function JobsPanel({ jobs, query, setQuery, onToggle, onDelete, saving }: {
  jobs: Job[]; query: string; setQuery: (v: string) => void; onToggle: (j: Job) => void; onDelete: (j: Job) => void; saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث بالوظيفة أو الشركة أو slug" className="ez-input max-w-md" />
        <Link to="/dashboard" className="ez-btn ez-btn-primary px-5 py-2.5 text-sm">إضافة / تعديل متقدم</Link>
      </div>
      <div className="ez-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ez-table w-full min-w-[900px]">
            <thead><tr>{['الوظيفة', 'الشركة', 'الحالة', 'المشاهدات', 'إجراءات'].map((x) => <th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td className="px-5 py-4"><p className="font-bold text-ink">{j.titleAr}</p><p className="text-xs text-muted">{j.slug}</p></td>
                  <td className="px-5 py-4 text-sm text-muted">{j.company}</td>
                  <td className="px-5 py-4"><Badge tone={j.status === 'published' ? 'positive' : 'caution'}>{j.status === 'published' ? 'منشورة' : 'مسودة'}</Badge></td>
                  <td className="tnum px-5 py-4 text-sm font-bold text-ink">{j.views.toLocaleString('en-US')}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button disabled={saving} onClick={() => onToggle(j)} className="ez-btn ez-btn-ghost px-3 py-1.5 text-xs">{j.status === 'published' ? 'إخفاء' : 'نشر'}</button>
                      <Link to="/dashboard" className="ez-btn ez-btn-ghost px-3 py-1.5 text-xs">تعديل</Link>
                      <button disabled={saving} onClick={() => onDelete(j)} className="ez-btn px-3 py-1.5 text-xs text-danger">حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsersPanel({ users, query, setQuery, onRole, saving }: {
  users: AdminUser[]; query: string; setQuery: (v: string) => void; onRole: (u: AdminUser, r: AdminUser['role']) => void; saving: boolean;
}) {
  return (
    <div className="space-y-5">
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مستخدم" className="ez-input max-w-md" />
      <div className="ez-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="ez-table w-full min-w-[760px]">
            <thead><tr>{['المستخدم', 'الدور', 'تاريخ الإنشاء', 'إدارة الصلاحية'].map((x) => <th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-4"><p className="font-bold text-ink">{u.username}</p><p className="text-xs text-muted">{u.displayName || '—'}</p></td>
                  <td className="px-5 py-4"><Badge tone={u.role === 'admin' ? 'brand' : u.role === 'publisher' ? 'positive' : 'neutral'}>{u.role}</Badge></td>
                  <td className="px-5 py-4 text-xs text-muted">{u.createdAt ? new Date(u.createdAt).toLocaleString('ar-DZ') : '—'}</td>
                  <td className="px-5 py-4">
                    <select disabled={saving} value={u.role} onChange={(e) => onRole(u, e.target.value as AdminUser['role'])} className="ez-input w-auto text-xs">
                      <option value="seeker">seeker</option>
                      <option value="publisher">publisher</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ContentPanel({ settings, newKey, newValue, setNewKey, setNewValue, onSave, onAdd, saving }: {
  settings: SiteSetting[]; newKey: string; newValue: string; setNewKey: (v: string) => void; setNewValue: (v: string) => void; onSave: (s: SiteSetting, v: string) => Promise<void>; onAdd: () => void; saving: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="ez-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-ink">إضافة إعداد/نص جديد</h2><div className="flex gap-2"><Link to="/admin/pages" className="ez-btn ez-btn-ghost px-4 py-2 text-sm">إدارة صفحات الموقع</Link><Link to="/admin/guides" className="ez-btn ez-btn-ghost px-4 py-2 text-sm">الأدلة والمقالات</Link></div></div>
        <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="example_key" className="ez-input" />
          <input value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="القيمة التي ستظهر في الموقع" className="ez-input" />
          <Button disabled={saving || !newKey.trim()} onClick={onAdd}>إضافة</Button>
        </div>
        <p className="mt-3 text-xs text-muted">الإعدادات العامة المنشورة تستخدمها واجهة الموقع مباشرة عندما يكون المفتاح مدعوماً من الصفحة.</p>
      </div>
      <HomepageContentPanel settings={settings} saving={saving} onSave={onSave} />
      <div className="space-y-4">{settings.filter((s) => !homepageSettingGroups.some((group) => group.keys.includes(s.key))).map((s) => <SettingEditor key={s.key} setting={s} saving={saving} onSave={onSave} />)}</div>
    </div>
  );
}

const homepageSettingGroups: Array<{ title: string; keys: string[] }> = [
  { title: 'الصفحة الرئيسية', keys: ['announcement', 'home_hero_eyebrow', 'home_headline', 'home_lead', 'home_ticker', 'home_search_placeholder', 'home_search_button', 'home_search_chips', 'home_hero_stat_geo', 'home_hero_stat_students', 'home_hero_stat_language', 'home_categories_eyebrow', 'home_categories_title', 'home_categories_lead', 'home_eligibility_eyebrow', 'home_eligibility_title', 'home_eligibility_lead', 'home_all_jobs_label', 'home_students_eyebrow', 'home_students_title', 'home_students_lead', 'home_students_button', 'home_value_eyebrow', 'home_value_title', 'home_value_lead', 'home_pillars', 'home_steps_eyebrow', 'home_steps_title', 'home_steps_cards', 'home_transparency_eyebrow', 'home_transparency_title', 'home_transparency_lead', 'home_transparency_cards', 'home_final_title', 'home_final_lead', 'home_final_primary', 'home_final_secondary', 'home_empty_text'] },
  { title: 'الهوية والروابط', keys: ['header_tagline', 'footer_tagline', 'footer_note', 'social_telegram_url', 'social_linkedin_url', 'social_facebook_url', 'social_youtube_url'] },
  { title: 'الأدوات والشركاء', keys: ['tools_eyebrow', 'tools_title', 'tools_lead', 'tools_back_label', 'tools_cv_label', 'tools_ats_label', 'tools_interview_label', 'tools_partners_eyebrow', 'tools_partners_title', 'tools_partners_lead', 'tools_disclosure', 'tools_partner_cards'] },
  { title: 'البحث عن الوظائف', keys: ['jobs_page_copy', 'jobs_search_placeholder_copy', 'jobs_no_results_copy', 'jobs_profile_copy', 'jobs_match_copy'] },
  { title: 'فرص البحث', keys: ['search_opportunity_copy_ar', 'search_opportunity_copy_en', 'search_opportunity_copy_fr'] },
  { title: 'تفاصيل الوظيفة', keys: ['job_detail_copy_ar', 'job_detail_copy_en', 'job_detail_copy_fr'] },
  { title: 'الحساب والتنبيهات والتقديمات', keys: ['auth_copy_ar', 'auth_copy_en', 'auth_copy_fr', 'alerts_copy_ar', 'alerts_copy_en', 'alerts_copy_fr', 'applications_copy_ar', 'applications_copy_en', 'applications_copy_fr', 'profile_copy_ar', 'profile_copy_en', 'profile_copy_fr', 'saved_copy_ar', 'saved_copy_en', 'saved_copy_fr', 'application_kit_copy_ar', 'application_kit_copy_en', 'application_kit_copy_fr'] },
  { title: 'التنقل والرأس والتذييل', keys: ['nav_primary', 'nav_mobile_secondary', 'nav_search_label', 'nav_search_title', 'nav_alerts_label', 'nav_publish_label', 'nav_admin_label', 'nav_dashboard_label', 'nav_profile_label', 'nav_logout_label', 'nav_login_label', 'nav_register_label', 'footer_platform_title', 'footer_platform_nav', 'footer_content_title', 'footer_content_nav', 'footer_country_title', 'footer_browse_title', 'footer_login_label', 'footer_terms_label', 'footer_privacy_label', 'footer_usage_label'] },
  { title: 'SEO', keys: ['seo_site_title', 'seo_site_description'] },
  { title: 'الصفحات العامة والسياسات', keys: ['about_copy_ar', 'terms_copy_ar', 'privacy_copy_ar', 'usage_policy_copy_ar', 'not_found_copy_ar', 'demand_copy_ar', 'demand_copy_en', 'demand_copy_fr'] },
  { title: 'صفحات الدول والمجالات', keys: ['seo_landing_copy_ar'] },
];

const settingLabels: Record<string, string> = {
  announcement: 'شريط الإعلان', home_hero_eyebrow: 'هوية القسم الرئيسي', home_headline: 'العنوان الرئيسي', home_lead: 'وصف الصفحة الرئيسية', home_ticker: 'شريط الكلمات المتحرك', home_search_placeholder: 'نص حقل البحث', home_search_button: 'زر البحث', home_search_chips: 'اقتراحات البحث', home_hero_stat_geo: 'إحصائية الأهلية', home_hero_stat_students: 'إحصائية الطلاب', home_hero_stat_language: 'إحصائية اللغة',
  home_categories_eyebrow: 'التصنيفات — العنوان الصغير', home_categories_title: 'التصنيفات — العنوان', home_categories_lead: 'التصنيفات — الوصف',
  home_eligibility_eyebrow: 'الأهلية — العنوان الصغير', home_eligibility_title: 'الأهلية — العنوان', home_eligibility_lead: 'الأهلية — الوصف',
  home_students_eyebrow: 'الطلاب — العنوان الصغير', home_students_title: 'الطلاب — العنوان', home_students_lead: 'الطلاب — الوصف',
  home_value_eyebrow: 'القيمة — العنوان الصغير', home_value_title: 'القيمة — العنوان', home_value_lead: 'القيمة — الوصف',
  home_steps_eyebrow: 'طريقة العمل — العنوان الصغير', home_steps_title: 'طريقة العمل — العنوان', home_transparency_eyebrow: 'الثقة — العنوان الصغير', home_transparency_title: 'الثقة — العنوان', home_transparency_lead: 'الثقة — الوصف',
  home_final_title: 'الدعوة الأخيرة — العنوان', home_final_lead: 'الدعوة الأخيرة — الوصف', header_tagline: 'الشعار النصي في الرأس', footer_tagline: 'الشعار النصي في التذييل', footer_note: 'وصف التذييل',
  social_telegram_url: 'رابط Telegram', social_linkedin_url: 'رابط LinkedIn', social_facebook_url: 'رابط Facebook', social_youtube_url: 'رابط YouTube',
  tools_eyebrow: 'الأدوات — العنوان الصغير', tools_title: 'الأدوات — العنوان الرئيسي', tools_lead: 'الأدوات — الوصف', tools_back_label: 'الأدوات — زر العودة',
  tools_cv_label: 'اسم أداة إنشاء السيرة الذاتية', tools_ats_label: 'اسم أداة فحص التوافق', tools_interview_label: 'اسم أداة تحضير المقابلة',
  tools_partners_eyebrow: 'الشركاء — العنوان الصغير', tools_partners_title: 'الشركاء — العنوان', tools_partners_lead: 'الشركاء — الوصف', tools_disclosure: 'نص الإفصاح عن الروابط التابعة', tools_partner_cards: 'بطاقات الشركاء — سطر لكل بطاقة',
  jobs_page_copy: 'عناوين ووصف صفحات البحث حسب اللغة والمسار', jobs_search_placeholder_copy: 'نص حقل البحث حسب اللغة', jobs_no_results_copy: 'الحالة الفارغة حسب اللغة', jobs_profile_copy: 'قسم الملف الشخصي حسب اللغة', jobs_match_copy: 'رسالة المطابقة حسب اللغة',
  search_opportunity_copy_ar: 'نصوص صفحات فرص البحث — العربية', search_opportunity_copy_en: 'نصوص صفحات فرص البحث — الإنجليزية', search_opportunity_copy_fr: 'نصوص صفحات فرص البحث — الفرنسية',
  job_detail_copy_ar: 'نصوص تفاصيل الوظيفة — العربية', job_detail_copy_en: 'نصوص تفاصيل الوظيفة — الإنجليزية', job_detail_copy_fr: 'نصوص تفاصيل الوظيفة — الفرنسية',
  auth_copy_ar: 'نصوص المصادقة — العربية', auth_copy_en: 'نصوص المصادقة — الإنجليزية', auth_copy_fr: 'نصوص المصادقة — الفرنسية',
  alerts_copy_ar: 'نصوص التنبيهات — العربية', alerts_copy_en: 'نصوص التنبيهات — الإنجليزية', alerts_copy_fr: 'نصوص التنبيهات — الفرنسية',
  applications_copy_ar: 'نصوص مركز التقديم — العربية', applications_copy_en: 'نصوص مركز التقديم — الإنجليزية', applications_copy_fr: 'نصوص مركز التقديم — الفرنسية',
  profile_copy_ar: 'نصوص الملف المهني — العربية', profile_copy_en: 'نصوص الملف المهني — الإنجليزية', profile_copy_fr: 'نصوص الملف المهني — الفرنسية',
  about_copy_ar: 'محتوى صفحة من نحن — العربية', terms_copy_ar: 'الشروط والأحكام — العربية', privacy_copy_ar: 'سياسة الخصوصية — العربية', usage_policy_copy_ar: 'سياسة الاستخدام — العربية', not_found_copy_ar: 'صفحة 404 — العربية',
  demand_copy_ar: 'اتجاهات البحث — العربية', demand_copy_en: 'اتجاهات البحث — الإنجليزية', demand_copy_fr: 'اتجاهات البحث — الفرنسية',
  saved_copy_ar: 'نصوص الوظائف المحفوظة — العربية', saved_copy_en: 'نصوص الوظائف المحفوظة — الإنجليزية', saved_copy_fr: 'نصوص الوظائف المحفوظة — الفرنسية',
  application_kit_copy_ar: 'نصوص Application Kit — العربية', application_kit_copy_en: 'نصوص Application Kit — الإنجليزية', application_kit_copy_fr: 'نصوص Application Kit — الفرنسية',
  nav_primary: 'روابط التنقل الرئيسية', nav_mobile_secondary: 'روابط التنقل الإضافية للهاتف', nav_search_label: 'نص زر البحث', nav_search_title: 'عنوان زر البحث', nav_alerts_label: 'نص التنبيهات', nav_publish_label: 'نص اكتب واربح', nav_admin_label: 'نص لوحة الإدارة', nav_dashboard_label: 'نص لوحة التحكم', nav_profile_label: 'نص الملف المهني', nav_logout_label: 'نص تسجيل الخروج', nav_login_label: 'نص تسجيل الدخول', nav_register_label: 'نص إنشاء الحساب',
  footer_platform_title: 'عنوان قسم المنصة', footer_platform_nav: 'روابط قسم المنصة', footer_content_title: 'عنوان قسم المحتوى', footer_content_nav: 'روابط قسم المحتوى', footer_country_title: 'عنوان قسم الدول', footer_browse_title: 'عنوان تصفح المجالات', footer_login_label: 'رابط تسجيل الدخول في التذييل', footer_terms_label: 'رابط الشروط في التذييل', footer_privacy_label: 'رابط الخصوصية في التذييل', footer_usage_label: 'رابط سياسة الاستخدام في التذييل',
  seo_site_title: 'عنوان SEO الافتراضي', seo_site_description: 'وصف SEO الافتراضي',
  seo_landing_copy_ar: 'محتوى صفحات الدول والمجالات — العربية',
};

function HomepageContentPanel({ settings, saving, onSave }: { settings: SiteSetting[]; saving: boolean; onSave: (s: SiteSetting, v: string) => Promise<void> }) {
  const map = new Map(settings.map((s) => [s.key, s]));
  return (
    <div className="space-y-6">
      {homepageSettingGroups.map((group) => {
        const available = group.keys.map((key) => map.get(key)).filter((setting): setting is SiteSetting => Boolean(setting));
        if (!available.length) return null;
        return (
          <div key={group.title} className="space-y-3">
            <div className="flex items-center gap-3"><span className="ez-eyebrow">CMS</span><h3 className="font-black text-ink">{group.title}</h3></div>
            <div className="space-y-3">
              {available.map((setting) => <SettingEditor key={setting.key} setting={setting} label={settingLabels[setting.key]} saving={saving} onSave={onSave} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SettingEditor({ setting, label, saving, onSave }: { setting: SiteSetting; label?: string; saving: boolean; onSave: (s: SiteSetting, v: string) => Promise<void> }) {
  const [value, setValue] = useState(setting.value);
  useEffect(() => setValue(setting.value), [setting.value]);
  return (
    <div className="ez-panel p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-ink">{label || setting.key}</p>
          <p className="mt-1 font-mono text-[10px] text-brand/70">{setting.key}</p>
          <textarea value={value} onChange={(e) => setValue(e.target.value)} rows={3} className="ez-input mt-3 w-full resize-y" />
          <p className="mt-2 text-[11px] text-muted">آخر تعديل: {setting.updatedAt ? new Date(setting.updatedAt).toLocaleString('ar-DZ') : '—'}</p>
        </div>
        <Button disabled={saving || value === setting.value} onClick={() => onSave(setting, value)}>حفظ</Button>
      </div>
    </div>
  );
}

function MonetizationPanel({ settings, saving, onSave }: { settings: SiteSetting[]; saving: boolean; onSave: (s: SiteSetting, v: string) => Promise<void> }) {
  const get = (key: string) => settings.find((s) => s.key === key);
  const airtm = get('airtm_referral_url');
  const share = get('creator_default_share_bps');
  const min = get('creator_min_payout_cents');
  const enabled = get('creator_program_enabled');
  const ads = get('ads_enabled');
  const client = get('adsense_client');
  const topSlot = get('adsense_top_slot');
  const inlineSlot = get('adsense_inline_slot');
  const footerSlot = get('adsense_footer_slot');
  const [airtmValue, setAirtmValue] = useState(airtm?.value ?? '');
  const [shareValue, setShareValue] = useState(share?.value ?? '6000');
  const [minValue, setMinValue] = useState(min?.value ?? '2000');
  const [enabledValue, setEnabledValue] = useState(enabled?.value !== 'false');
  const [adsValue, setAdsValue] = useState(ads?.value === 'true');
  const [clientValue, setClientValue] = useState(client?.value ?? '');
  const [topValue, setTopValue] = useState(topSlot?.value ?? '');
  const [inlineValue, setInlineValue] = useState(inlineSlot?.value ?? '');
  const [footerValue, setFooterValue] = useState(footerSlot?.value ?? '');

  useEffect(() => {
    setAirtmValue(airtm?.value ?? '');
    setShareValue(share?.value ?? '6000');
    setMinValue(min?.value ?? '2000');
    setEnabledValue(enabled?.value !== 'false');
    setAdsValue(ads?.value === 'true');
    setClientValue(client?.value ?? '');
    setTopValue(topSlot?.value ?? '');
    setInlineValue(inlineSlot?.value ?? '');
    setFooterValue(footerSlot?.value ?? '');
  }, [settings]);

  const saveKey = (setting: SiteSetting | undefined, value: string) =>
    setting ? onSave(setting, value) : Promise.resolve();

  return (
    <div className="max-w-3xl space-y-5">
      <div className="ez-panel p-7">
        <span className="ez-eyebrow">AIRTM</span>
        <h2 className="mt-2 text-xl font-black text-ink">رابط التسجيل والإحالة</h2>
        <p className="mt-2 text-sm leading-7 text-muted">ضع رابط Airtm الخاص بك هنا. لا يوجد رابط افتراضي مزروع داخل التطبيق.</p>
        <div className="mt-5 flex gap-2">
          <input dir="ltr" value={airtmValue} onChange={(e) => setAirtmValue(e.target.value)} placeholder="https://airtm.com/..." className="ez-input flex-1" />
          <Button disabled={saving || !airtm} onClick={() => void saveKey(airtm, airtmValue.trim())}>حفظ الرابط</Button>
        </div>
      </div>
      <div className="ez-panel p-7">
        <h2 className="font-black text-ink">برنامج EzyPublish</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="حصة الكاتب (basis points)"><input value={shareValue} onChange={(e) => setShareValue(e.target.value)} type="number" min="0" max="10000" className="ez-input" /></Field>
          <Field label="الحد الأدنى للسحب بالسنت"><input value={minValue} onChange={(e) => setMinValue(e.target.value)} type="number" min="2000" className="ez-input" /></Field>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={enabledValue} onChange={(e) => setEnabledValue(e.target.checked)} /> تفعيل برنامج EzyPublish</label>
        <div className="mt-5"><Button disabled={saving || !share || !min || !enabled} onClick={async () => { await saveKey(share, shareValue); await saveKey(min, minValue); await saveKey(enabled, String(enabledValue)); }}>حفظ إعدادات الربح</Button></div>
      </div>
      <div className="ez-panel p-7">
        <span className="ez-eyebrow">ADSENSE</span>
        <h2 className="mt-2 text-xl font-black text-ink">إعلانات الموقع</h2>
        <p className="mt-2 text-sm leading-7 text-muted">لا تظهر أي إعلانات حتى تفعّلها وتضع Client ID وSlot IDs من حساب AdSense.</p>
        <label className="mt-5 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={adsValue} onChange={(e) => setAdsValue(e.target.checked)} /> تفعيل عرض الإعلانات</label>
        <div className="mt-5 space-y-4">
          <Field label="AdSense Client ID"><input dir="ltr" value={clientValue} onChange={(e) => setClientValue(e.target.value)} placeholder="ca-pub-xxxxxxxxxxxxxxxx" className="ez-input" /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="الموضع العلوي"><input value={topValue} onChange={(e) => setTopValue(e.target.value)} placeholder="slot id" className="ez-input" /></Field>
            <Field label="وسط الصفحة"><input value={inlineValue} onChange={(e) => setInlineValue(e.target.value)} placeholder="slot id" className="ez-input" /></Field>
            <Field label="أسفل الموقع"><input value={footerValue} onChange={(e) => setFooterValue(e.target.value)} placeholder="slot id" className="ez-input" /></Field>
          </div>
        </div>
        <div className="mt-5"><Button disabled={saving || (adsValue && !client)} onClick={async () => { await saveKey(ads, String(adsValue)); await saveKey(client, clientValue.trim()); await saveKey(topSlot, topValue.trim()); await saveKey(inlineSlot, inlineValue.trim()); await saveKey(footerSlot, footerValue.trim()); }}>حفظ إعدادات الإعلانات</Button></div>
      </div>
    </div>
  );
}

function AlertsPanel({ alerts, onDelete, saving }: { alerts: AdminAlert[]; onDelete: (a: AdminAlert) => void; saving: boolean }) {
  return (
    <div className="ez-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="ez-table w-full min-w-[800px]">
          <thead><tr>{['البريد', 'الدولة', 'التصنيفات', 'التكرار', 'الحالة', ''].map((x) => <th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {alerts.map((a) => (
              <tr key={a.email}>
                <td className="px-5 py-4 font-mono text-sm text-ink">{a.email}</td>
                <td className="px-5 py-4 text-sm text-muted">{a.country}</td>
                <td className="px-5 py-4 text-sm text-muted">{a.categories.join('، ') || 'كل المجالات'}</td>
                <td className="px-5 py-4 text-sm text-muted">{a.frequency}</td>
                <td className="px-5 py-4"><Badge tone={a.status === 'active' ? 'positive' : 'caution'}>{a.status}</Badge></td>
                <td className="px-5 py-4"><button disabled={saving} onClick={() => onDelete(a)} className="ez-btn px-3 py-1.5 text-xs text-danger">حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityPanel({ password, password2, setPassword, setPassword2, onChange, saving }: {
  password: string; password2: string; setPassword: (v: string) => void; setPassword2: (v: string) => void; onChange: () => void; saving: boolean;
}) {
  return (
    <div className="max-w-xl space-y-6">
      <div className="ez-panel p-7">
        <h2 className="text-lg font-black text-ink">أمان حساب الإدارة</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">غيّر كلمة المرور مباشرة من جلسة Supabase الحالية.</p>
        <div className="mt-6 space-y-4">
          <label className="block"><span className="ez-label">كلمة المرور الجديدة</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="ez-input mt-2" minLength={8} autoComplete="new-password" /></label>
          <label className="block"><span className="ez-label">تأكيد كلمة المرور</span><input type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className="ez-input mt-2" minLength={8} autoComplete="new-password" /></label>
          <Button disabled={saving} onClick={onChange}>{saving ? 'جارٍ الحفظ' : 'تغيير كلمة المرور'}</Button>
        </div>
      </div>
      <div className="ez-panel p-7">
        <h2 className="font-bold text-ink">مسارات الإدارة</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/dashboard" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">إدارة الوظائف</Link>
          <Link to="/profile" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">الملف والحساب</Link>
          <Link to="/terms" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">السياسات</Link>
        </div>
      </div>
    </div>
  );
}
