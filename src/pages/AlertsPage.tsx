import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { LanguageCode } from '../types';
import { CATEGORIES, COUNTRIES, LANGUAGES } from '../data/taxonomy';
import { alertsRepo } from '../lib/alerts';
import { useProfile } from '../features/profile/ProfileContext';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import { Button, Field, SectionHead, Select, TextInput, Toggle } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { isSupabaseConfigured } from '../lib/supabase';

import PageAura from '../components/art/PageAura';
type Status = { tone: 'success' | 'error' | 'warn'; text: string } | null;

export default function AlertsPage() {
  const { profile } = useProfile();
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.alerts_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState(profile.country);
  const [language, setLanguage] = useState<LanguageCode | 'any'>('any');
  const [categories, setCategories] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(true);
  const [studentsOnly, setStudentsOnly] = useState(false);
  const [noExp, setNoExp] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  usePageMeta({
    title: 'تنبيهات الوظائف — أرسلها إلى بريدك | ezyjobs',
    description:
      'فعّل تنبيهاً يصلك فيه الجديد من الوظائف عن بُعد المطابقة لدولتك ومستواك، دون النقر على أي موقع.',
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);

    const res = await alertsRepo.subscribe({
      email,
      country,
      categories,
      remoteOnly,
      studentsOnly,
      noExperienceOnly: noExp,
      language,
      frequency,
    });

    setBusy(false);
    setStatus(
      res.ok
        ? {
            tone: 'success',
            text: res.local
              ? 'حُفظ التنبيه في متصفحك. اربط Supabase ليصلك على بريدك فعلاً.'
              : 'تم حفظ تنبيهك في قاعدة البيانات. إرسال الرسائل البريدية يحتاج تفعيل خدمة الإرسال المجدولة.',
          }
        : { tone: 'error', text: res.error ?? 'تعذّر التسجيل.' },
    );
  };

  return (
    <>
      <header className="account-hero alerts-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead
            eyebrow={text('eyebrow', 'تنبيهات')}
            title={text('title', 'الوظائف الجديدة تصلك، وأنت غائب عنها')}
            lead={text('lead', 'الوظائف عن بُعد عمرها يوم أو يومان. من يتصفح يومياً يرى القليل. من يصله تنبيه يرى كل شيء.')}
          />
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <form onSubmit={submit} className="ez-panel space-y-5 p-6">
            <Field label={text('emailLabel', 'بريدك الإلكتروني')} hint={text('emailHint', 'نستخدمه لإرسال التنبيهات فقط. لا نشاركه مع أي جهة.')}>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                placeholder="you@example.com"
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={text('countryLabel', 'دولتك')}>
                <Select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
                />
              </Field>
              <Field label={text('languageLabel', 'اللغة المطلوبة في الوظيفة')}>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as LanguageCode | 'any')}
                  options={[
                    { value: 'any', label: text('anyLanguage', 'أي لغة') },
                    ...LANGUAGES.map((l) => ({ value: l.id, label: l.name })),
                  ]}
                />
              </Field>
            </div>

            <div>
              <span className="ez-label">{text('categoriesLabel', 'المجالات التي تهمّك')}</span>
              <p className="mb-2 text-[11.5px] text-muted">{text('categoriesHint', 'اتركها فارغة لتصلك كل المجالات.')}
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.filter((c) => c.id !== 'other').map((c) => {
                  const on = categories.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() =>
                        setCategories(on ? categories.filter((x) => x !== c.id) : [...categories, c.id])
                      }
                      className={`ez-btn px-3.5 py-1.5 text-[12.5px] ${
                        on ? 'ez-btn-primary' : 'ez-btn-ghost'
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={remoteOnly}
                onChange={setRemoteOnly}
                label={text('remoteLabel', 'عن بُعد فقط')}
                hint={text('remoteHint', 'يُستبعد ما يتطلب حضوراً')}
              />
              <Toggle
                checked={noExp}
                onChange={setNoExp}
                label={text('noExperienceLabel', 'بدون خبرة فقط')}
                hint={text('noExperienceHint', 'لا تشترط سنوات سابقة')}
              />
              <Toggle
                checked={studentsOnly}
                onChange={setStudentsOnly}
                label={text('studentsLabel', 'مناسبة للطلاب')}
                hint={text('studentsHint', 'دوام جزئي أو تدريب')}
              />
              <Field label={text('frequencyLabel', 'التكرار')}>
                <Select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly')}
                  options={[
                    { value: 'daily', label: text('daily', 'يومياً') },
                    { value: 'weekly', label: text('weekly', 'أسبوعياً') },
                  ]}
                />
              </Field>
            </div>

            {status && (
              <Notice tone={status.tone === 'success' ? 'success' : 'error'}>{status.text}</Notice>
            )}

            <Button type="submit" size="lg" block disabled={busy}>
              {busy && <Spinner />}
              {busy ? text('busy', 'جارٍ التسجيل') : text('submit', 'فعّل التنبيه')}
            </Button>

            {!isSupabaseConfigured && (
              <Notice tone="warn" title="وضع المعاينة">
                لن يُرسل بريد فعلياً قبل ربط Supabase. حالياً يُحفظ التنبيه في متصفحك فقط.
              </Notice>
            )}
          </form>

          <div className="space-y-6">
            <div className="ez-panel p-6">
              <h2 className="text-sm font-bold text-ink">ما الذي يصلك فعلاً؟</h2>
              <ul className="mt-4 space-y-3 text-[13.5px] leading-relaxed text-muted">
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                  رسالة واحدة تحتوي على الوظائف الجديدة التي لم تصلك من قبل.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                  لكل وظيفة: المسمى، الشركة، الأهلية، الدوام، والوقت المطلوب أسبوعياً.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                  رابط مباشر إلى صفحة التقديم الأصلي، لا إلى وسيط.
                </li>
                <li className="flex gap-2.5">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                  تفضيلاتك محفوظة، ويمكن إدارة التنبيه من الجهاز الذي أنشأه.
                </li>
              </ul>
            </div>

            <div className="ez-panel border-brand-100 bg-brand-50/70 p-6">
              <h2 className="text-sm font-bold text-ink">لماذا لا نبيع بريدك؟</h2>
              <p className="mt-3 text-[13px] leading-[1.9] text-muted">
                بريدك يُستخدم لحفظ إعدادات التنبيه فقط في هذه المرحلة. لا نبيعه ولا نشاركه، ولا
                يظهر كبيانات عامة على المنصة. إرسال الرسائل المجدولة يُفعّل لاحقاً عبر خدمة الإرسال.
              </p>
            </div>

            <p className="text-[12.5px] text-muted">
              تفضّل التصفح؟ ابدأ من{' '}
              <Link to="/remote" className="font-semibold text-brand">
                الوظائف عن بُعد
              </Link>{' '}
              أو من{' '}
              <Link to="/students" className="font-semibold text-brand">
                قسم الطلاب
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
