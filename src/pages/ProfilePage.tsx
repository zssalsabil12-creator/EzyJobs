import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useProfile } from '../features/profile/ProfileContext';
import ProfileBuilder from '../features/profile/ProfileBuilder';
import { parseCvFile, type ParsedCv } from '../lib/cvParser';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import PageAura from '../components/art/PageAura';
import { Badge, SectionHead } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';

export default function ProfilePage({ jobs }: { jobs: import('../types').Job[] }) {
  const { profile, setProfile } = useProfile();
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.profile_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;
  const { changePassword } = useAuth();
  const [parsed, setParsed] = useState<ParsedCv | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  usePageMeta({
    title: 'ملفي المهني | ezyjobs',
    description: 'ارفع سيرتك الذاتية، راجع ما استخرجه ezyjobs، ثم استخدم الملف نفسه للعثور على فرص مناسبة.',
    noIndex: true,
  });

  const onFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const result = await parseCvFile(file);
      setParsed(result);
      setProfile({
        ...profile,
        skills: [...new Set([...result.skills, ...profile.skills])],
        languages: result.languages.length ? result.languages : profile.languages,
        level: result.level,
        categories: [...new Set([...result.categories, ...profile.categories])],
        cvFileName: result.fileName,
        cvParsedAt: new Date().toISOString(),
        cvEducation: result.education,
        cvExperience: result.experience,
        cvRoles: result.roles,
        cvWarnings: result.warnings,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'تعذر تحليل السيرة.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <header className="account-hero profile-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead eyebrow={text('eyebrow', 'Career Passport')} title={text('title', 'ملفك المهني يبدأ من CV واحد')}
            lead={text('lead', 'ارفع PDF، راجع النتائج قبل اعتمادها، ثم استخدمها مباشرة في مطابقة الوظائف.')} />
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10 lg:py-16">
        <section className="ez-panel p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-black text-ink">{text('cvTitle', 'تحليل السيرة الذاتية')}</h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{text('cvLead', 'التحليل يتم محلياً في المتصفح. لا نرسل ملف PDF إلى خدمة ذكاء اصطناعي خارجية.')}</p>
            </div>
            <label className="ez-btn ez-btn-primary cursor-pointer px-6 py-3 text-sm">
              {busy ? <><Spinner /> {text('analyzing', 'جارٍ التحليل')}</> : text('upload', 'رفع CV بصيغة PDF')}
              <input type="file" accept="application/pdf,.pdf" className="sr-only"
                onChange={(e) => { void onFile(e.target.files?.[0]); e.currentTarget.value = ''; }} />
            </label>
          </div>

          {error && <div className="mt-5"><Notice tone="error">{error}</Notice></div>}

          {parsed ? (
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div>
                <p className="ez-label">الملف</p>
                <p className="mt-1 font-semibold text-ink">{parsed.fileName}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge tone="brand">{parsed.level}</Badge>
                  {parsed.roles.map((r) => <Badge key={r}>{r}</Badge>)}
                </div>
                <h3 className="mt-6 text-sm font-bold text-ink">المهارات المكتشفة</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {parsed.skills.length ? parsed.skills.map((s) => <Badge key={s} tone="positive">{s}</Badge>)
                    : <span className="text-sm text-muted">لم نكتشف مهارات آلياً.</span>}
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-ink">التعليم الذي التقطناه</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {parsed.education.length ? parsed.education.map((x, i) => <li key={i}>— {x}</li>) : <li>لم نحدد مؤهلاً بوضوح.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-ink">الخبرة التي التقطناها</h3>
                  <ul className="mt-2 space-y-1 text-sm text-muted">
                    {parsed.experience.slice(0, 6).map((x, i) => <li key={i}>— {x}</li>)}
                    {!parsed.experience.length && <li>لم نلتقط سطراً واضحاً عن الخبرة.</li>}
                  </ul>
                </div>
                {parsed.warnings.length > 0 && (
                  <Notice tone="warn" title="راجع هذه النقاط">
                    <ul className="space-y-1">{parsed.warnings.map((w) => <li key={w}>— {w}</li>)}</ul>
                  </Notice>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-paper-2 p-8 text-center">
              <p className="font-bold text-ink">{text('noCvTitle', 'لم ترفع CV بعد')}</p>
              <p className="mt-2 text-sm text-muted">{text('noCvLead', 'يمكنك أيضاً تعبئة الملف يدوياً أسفل الصفحة.')}</p>
            </div>
          )}

          {profile.cvFileName && !parsed && (
            <div className="mt-5"><Notice tone="success">
              آخر CV معتمد: {profile.cvFileName}. يمكنك رفع نسخة أحدث في أي وقت.
            </Notice></div>
          )}
        </section>

        <section className="mt-8">
          <ProfileBuilder jobs={jobs} />
        </section>

        <section className="mt-8 ez-panel p-6 sm:p-8">
          <h2 className="text-lg font-black text-ink">{text('accountSettings', 'إعدادات الحساب')}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{text('accountLead', 'غيّر كلمة المرور من هنا في أي وقت.')}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="ez-label">{text('newPassword', 'كلمة المرور الجديدة')}</span><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="ez-input mt-2" minLength={8} autoComplete="new-password" /></label>
            <label className="block"><span className="ez-label">{text('confirmPassword', 'تأكيد كلمة المرور')}</span><input type="password" value={newPassword2} onChange={(e) => setNewPassword2(e.target.value)} className="ez-input mt-2" minLength={8} autoComplete="new-password" /></label>
          </div>
          {passwordNotice && <div className="mt-4"><Notice tone={passwordNotice.startsWith('تم') ? 'success' : 'error'}>{passwordNotice}</Notice></div>}
          <button className="ez-btn ez-btn-primary mt-5 px-5 py-3 text-sm" onClick={async () => {
            setPasswordNotice(null);
            if (newPassword.length < 8) { setPasswordNotice('كلمة المرور يجب أن تكون 8 أحرف على الأقل.'); return; }
            if (newPassword !== newPassword2) { setPasswordNotice('كلمتا المرور غير متطابقتين.'); return; }
            const changeError = await changePassword(newPassword);
            setPasswordNotice(changeError ?? 'تم تغيير كلمة المرور بنجاح.');
            if (!changeError) { setNewPassword(''); setNewPassword2(''); }
          }}>{text('changePassword', 'تغيير كلمة المرور')}</button>
        </section>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link to="/jobs" className="ez-btn ez-btn-primary px-5 py-3 text-sm">{text('showOpportunities', 'شاهد فرصك')}</Link>
          <Link to="/applications" className="ez-btn ez-btn-ghost px-5 py-3 text-sm">{text('myApplications', 'تقديماتي')}</Link>
        </div>
      </main>
    </>
  );
}

