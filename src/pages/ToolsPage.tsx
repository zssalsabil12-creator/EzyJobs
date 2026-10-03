import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DISCLOSURE, PARTNERS, type Partner } from '../content/partners';
import { usePublicSiteSettings } from '../lib/siteSettings';
import { usePageMeta } from '../lib/seo';
import { Button, Field, SectionHead, TextArea, TextInput } from '../components/ui/Primitives';
import { Notice } from '../components/ui/Feedback';
import { Prose } from '../components/seo/Seo';

import PageAura from '../components/art/PageAura';
type Tab = 'cv' | 'ats' | 'interview';

const TOOL_DEFS: { id: Tab; path: string; fallback: string; setting: string }[] = [
  { id: 'cv', path: '/tools/cv', fallback: 'منشئ السيرة الذاتية', setting: 'tools_cv_label' },
  { id: 'ats', path: '/tools/ats', fallback: 'فاحص التوافق', setting: 'tools_ats_label' },
  { id: 'interview', path: '/tools/interview', fallback: 'تحضير المقابلة', setting: 'tools_interview_label' },
];

const isTab = (v?: string): v is Tab => v === 'cv' || v === 'ats' || v === 'interview';

function parsePartnerCards(value: string | undefined): Partner[] {
  const rows = (value ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const parsed = rows.map((line, index) => {
    const [name, latin, what, url, kind, price] = line.split('||').map((part) => part.trim());
    return {
      id: `cms-${index}-${name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'partner'}`,
      name: name || '',
      latin: latin || '',
      what: what || '',
      url: url || '#',
      kind: kind === 'sponsored' ? 'sponsored' : 'affiliate',
      price: price || undefined,
    } satisfies Partner;
  }).filter((item) => item.name && item.what);
  return parsed.length ? parsed : PARTNERS;
}

export default function ToolsPage() {
  const { tool } = useParams<{ tool: string }>();
  const navigate = useNavigate();
  const settings = usePublicSiteSettings();
  const tab: Tab = isTab(tool) ? tool : 'cv';
  const tools = TOOL_DEFS.map((item) => ({
    id: item.id,
    path: item.path,
    label: settings[item.setting]?.trim() || item.fallback,
  }));
  const partners = useMemo(() => parsePartnerCards(settings.tools_partner_cards), [settings.tools_partner_cards]);
  const title = tools.find((t) => t.id === tab)?.label ?? 'الأدوات';

  usePageMeta({
    title: `${title} — مجانية | ezyjobs`,
    description:
      'أدوات مجانية بالعربية: أنشئ سيرة ذاتية بعمود واحد، افحص توافق ملفك مع إعلان الوظيفة، واستعد لمقابلة عمل عن بُعد.',
  });

  return (
    <>
      <header className="tools-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead
            eyebrow={settings.tools_eyebrow?.trim() || 'أدوات'}
            title={settings.tools_title?.trim() || 'السيرة الذاتية والتقديم هي نصف المعركة'}
            lead={settings.tools_lead?.trim() || 'عثرت على الوظيفة المناسبة وفهمتها؟ الخطوة التالية هي الملف الذي يوصلك إليها. هذه الأدوات مجانية وتعمل داخل متصفحك.'}
            action={
              <Link to="/jobs" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
                {settings.tools_back_label?.trim() || 'ارجع للوظائف'}
              </Link>
            }
          />
          <div className="mt-10 flex flex-wrap gap-2">
            {tools.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(t.path)}
                className={`ez-btn px-6 py-3 text-sm ${tab === t.id ? 'ez-btn-primary' : 'ez-btn-ghost'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        {tab === 'cv' && <CvBuilder />}
        {tab === 'ats' && <AtsChecker />}
        {tab === 'interview' && <InterviewPrep />}
      </div>

      <section className="border-t border-line bg-surface py-16 lg:py-20">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <SectionHead
            eyebrow={settings.tools_partners_eyebrow?.trim() || 'شركاء'}
            title={settings.tools_partners_title?.trim() || 'خدمات نرشّحها لك'}
            lead={settings.tools_partners_lead?.trim() || 'أدوات مفيدة، مذكورة بصراحة كأدوات. بعضها مجاني وبعضها مدفوع، وبعضها نربح منه عمولة إذا استخدمته.'}
          />
          <div className="mb-6">
            <Notice tone="info" title="إفصاح">
              {settings.tools_disclosure?.trim() || DISCLOSURE}
            </Notice>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((p) => (
              <div key={p.id} className="bg-surface p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-[15px] font-bold text-ink">{p.name}</h3>
                  <span className="rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-bold text-caution">
                    {p.kind === 'affiliate' ? 'رابط تابع' : 'محتوى مدفوع'}
                  </span>
                </div>
                <p className="text-[12px] text-muted" dir="ltr">
                  {p.latin}
                </p>
                <p className="mt-3 text-[13px] leading-relaxed text-ink/75">{p.what}</p>
                {p.price && <p className="mt-3 text-[11.5px] text-muted">{p.price}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

/* ================================================================== */
/* منشئ السيرة الذاتية                                                 */
/* ================================================================== */

const emptyCv = () => ({
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  links: '',
  summary: '',
  skills: '',
  experience: '',
  education: '',
});

const listOf = (s: string) =>
  s
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);

export function CvBuilder() {
  const [cv, setCv] = useState(emptyCv);
  const set = (k: keyof ReturnType<typeof emptyCv>, v: string) => setCv((c) => ({ ...c, [k]: v }));

  const filled = Object.values(cv).filter((v) => v.trim()).length;
  const complete = filled >= 6;
  const chars = cv.experience.length + cv.summary.length;

  usePageMeta({
    title: 'منشئ سيرة ذاتية مجاني بعمود واحد | ezyjobs',
    description:
      'أنشئ سيرة ذاتية عربية بعمود واحد تقرأها أنظمة التوظيف الآلية، مع نصائح فورية على الجمل الضعيفة.',
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="ez-panel p-6">
        <h2 className="text-lg font-black text-ink">بياناتك</h2>
        <p className="mt-1.5 text-[12.5px] text-muted">
          تُحفظ في متصفحك فقط، ولا تُرسل إلى أي خادم.
        </p>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الاسم الكامل">
              <TextInput value={cv.fullName} onChange={(e) => set('fullName', e.target.value)} />
            </Field>
            <Field label="المسمى المستهدف" hint="ما الذي تتقدم له تحديداً؟">
              <TextInput
                value={cv.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="أخصائي دعم عملاء"
              />
            </Field>
            <Field label="البريد الإلكتروني">
              <TextInput
                value={cv.email}
                onChange={(e) => set('email', e.target.value)}
                dir="ltr"
              />
            </Field>
            <Field label="الهاتف">
              <TextInput
                value={cv.phone}
                onChange={(e) => set('phone', e.target.value)}
                dir="ltr"
              />
            </Field>
          </div>

          <Field label="المدينة أو الدولة">
            <TextInput
              value={cv.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="الجزائر"
            />
          </Field>

          <Field label="روابط" hint="لينكدن، موقع، معرض أعمال — سطر لكل رابط">
            <TextArea rows={2} value={cv.links} onChange={(e) => set('links', e.target.value)} />
          </Field>

          <Field label="نبذة في سطرين" hint="من أنت + ما تقدم له. لا تكتب فقرة.">
            <TextArea rows={3} value={cv.summary} onChange={(e) => set('summary', e.target.value)} />
          </Field>

          <Field label="المهارات" hint="كل مهارة في سطر مستقل — مهم جداً لأنظمة الفرز">
            <TextArea rows={5} value={cv.skills} onChange={(e) => set('skills', e.target.value)} />
          </Field>

          <Field
            label="الخبرة أو المشاريع"
            hint="اكتب لكل عنصر: المسمى — التاريخ — ما فعلت — النتيجة"
          >
            <TextArea
              rows={8}
              value={cv.experience}
              onChange={(e) => set('experience', e.target.value)}
            />
          </Field>

          <Field label="التعليم والشهادات">
            <TextArea rows={3} value={cv.education} onChange={(e) => set('education', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="lg:sticky lg:top-24">
        <div className="ez-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h2 className="text-sm font-bold text-ink">المعاينة</h2>
            <Button size="sm" onClick={() => window.print()}>
              طباعة أو حفظ PDF
            </Button>
          </div>

          <div className="space-y-6 p-6">
            {cv.fullName || cv.title ? (
              <div>
                <p className="text-xl font-black text-ink">{cv.fullName || 'الاسم'}</p>
                {cv.title && <p className="mt-0.5 text-[13px] text-brand">{cv.title}</p>}
                <p className="mt-2 text-[12px] text-muted" dir="ltr">
                  {[cv.email, cv.phone, cv.location].filter(Boolean).join('  ·  ')}
                </p>
                {cv.links && <p className="mt-1 text-[12px] text-muted">{listOf(cv.links).join(' · ')}</p>}
              </div>
            ) : (
              <p className="text-[13px] text-muted">ابدأ بملء الاسم والمسمى.</p>
            )}

            {cv.summary && (
              <Block title="نبذة">
                <p className="text-[13px] leading-[1.9] text-ink/80">{cv.summary}</p>
              </Block>
            )}

            {cv.skills && (
              <Block title="المهارات">
                <div className="flex flex-wrap gap-1.5">
                  {listOf(cv.skills).map((s) => (
                    <span key={s} className="ez-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </Block>
            )}

            {cv.experience && (
              <Block title="الخبرة والمشاريع">
                <ul className="space-y-3">
                  {listOf(cv.experience).map((line, i) => (
                    <li key={i} className="text-[13px] leading-[1.85] text-ink/80">
                      {line}
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            {cv.education && (
              <Block title="التعليم">
                <ul className="space-y-1.5">
                  {listOf(cv.education).map((line, i) => (
                    <li key={i} className="text-[13px] text-ink/80">
                      {line}
                    </li>
                  ))}
                </ul>
              </Block>
            )}
          </div>
        </div>

        <div className="mt-4">
          <Notice tone={complete ? 'success' : 'warn'} title="تشخيص سريع">
            <ul className="mt-1 space-y-1">
              <li>
                {complete ? '✓' : '○'} اكتملت البيانات الأساسية (
                <span className="tnum">{filled}</span> من 8 حقول)
              </li>
              <li>
                {cv.skills.split('\n').filter((x) => x.trim()).length >= 3 ? '✓' : '○'} ثلاث
                مهارات على الأقل، كل واحدة في سطر
              </li>
              <li>
                {/\d/.test(cv.experience) ? '✓' : '○'} يوجد رقم (نسبة، حجم، مدة) في الخبرة —
                الأرقام ترفع المطابقة
              </li>
              <li>
                {chars < 1200 ? '○' : '✓'} الطول مناسب (الأنظمة الآلية تفضّل أقل من 1200 حرفاً
                في الخبرة)
              </li>
              <li>{cv.email ? '✓' : '○'} بريد إلكتروني بصيغة صحيحة</li>
            </ul>
          </Notice>
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2.5 border-b border-line pb-1.5 text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

/* ================================================================== */
/* فاحص التوافق                                                       */
/* ================================================================== */

const WEAK = ['مسؤول عن', 'العمل على', 'المشاركة في', 'العمل مع', 'المساهمة في', 'القيام بـ'];

export function AtsChecker() {
  const [ad, setAd] = useState('');
  const [cv, setCv] = useState('');

  usePageMeta({
    title: 'فاحص توافق السيرة الذاتية مع إعلان الوظيفة | ezyjobs',
    description:
      'الصق إعلان الوظيفة وسيرتك الذاتية، واحصل على نسبة تطابق وقائمة بالمهارات الناقصة.',
  });

  const report = useMemo(() => analyze(ad, cv), [ad, cv]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
      <div className="ez-panel space-y-5 p-6">
        <Field label="نص إعلان الوظيفة" hint="انسخ الإعلان كاملاً، أو الفقرة الأولى منه على الأقل">
          <TextArea
            rows={8}
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            placeholder="Customer Support Specialist — Remote, worldwide. English B2. 1+ year experience preferred…"
          />
        </Field>
        <Field label="نص سيرتك الذاتية" hint="انسخه كما هو من ملفك، حتى لو كان ممسوحاً ضوئياً">
          <TextArea rows={8} value={cv} onChange={(e) => setCv(e.target.value)} />
        </Field>
      </div>

      <div className="space-y-5 lg:sticky lg:top-24">
        {!ad.trim() || !cv.trim() ? (
          <div className="ez-panel p-8 text-center">
            <p className="text-sm text-muted">
              الصق نص الإعلان ونص سيرتك، وستحصل على نسبة تطابق ومهارات ناقصة.
            </p>
          </div>
        ) : (
          <>
            <div className="ez-panel p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
                    نسبة التطابق
                  </p>
                  <p className="tnum mt-2 font-display text-5xl font-bold text-ink">
                    {report.score}
                    <span className="text-2xl text-muted">/100</span>
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-[12px] font-bold ${
                    report.score >= 70
                      ? 'bg-brand-50 text-brand-700'
                      : report.score >= 40
                        ? 'bg-accent-50 text-caution'
                        : 'bg-danger-soft text-danger'
                  }`}
                >
                  {report.verdict}
                </span>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${report.score}%` }}
                />
              </div>
            </div>

            <div className="ez-panel p-6">
              <h3 className="text-sm font-bold text-ink">مطابق</h3>
              {report.matched.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {report.matched.map((k) => (
                    <span key={k} className="ez-chip ez-chip-brand">
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-muted">لا يوجد تداخل واضح بعد.</p>
              )}
            </div>

            <div className="ez-panel p-6">
              <h3 className="text-sm font-bold text-ink">مفقود من ملفك</h3>
              {report.missing.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {report.missing.map((k) => (
                    <span key={k} className="ez-chip ez-chip-accent">
                      {k}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-muted">ملفك يغطي كل الكلمات المطلوبة.</p>
              )}
            </div>

            {report.weak.length > 0 && (
              <Notice tone="warn" title="جمل ضعيفة في ملفك">
                <ul className="mt-1 space-y-1">
                  {report.weak.map((w, i) => (
                    <li key={i}>
                      «{w}» — استبدلها بفعل واضح ثم أضف رقماً. مثال: كتبت، قدّمت، نظّمت، 200
                      طلب، 12,000 سجل.
                    </li>
                  ))}
                </ul>
              </Notice>
            )}

            <Prose>
              <p className="text-[13px]">
                هذه الأداة تقارث النص فقط ولا تحاكي نظام توظيف بعينه. استخدمها لاكتشاف الكلمات
                الناقصة، ثم اقرأ{' '}
                <Link to="/guides/ats-explained">دليل أنظمة الفرز الآلي</Link> للفهم الأعمق.
              </p>
            </Prose>
          </>
        )}
      </div>
    </div>
  );
}

const STOP = new Set([
  'the','and','for','with','you','are','our','will','have','this','that','from','your','not',
  'a','an','of','to','in','on','or','is','as','at','be','we','it','or','by','as','remote',
  'jobs','job','work','company','team','about','who','can','all','new','have','more','than',
  'العمل','وظيفة','عن','بعد','دوام','كامل','جزئي','نحن','تقدم','العملية','الشركة',
]);

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[\u0623\u0625\u0622\u0627]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/[^\p{L}\p{N}+#.\-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function analyze(ad: string, cv: string) {
  const a = normalize(ad);
  const c = normalize(cv);
  const aWords = new Set(a.split(' ').filter((w) => w.length > 2 && !STOP.has(w)));
  const cWords = new Set(c.split(' ').filter(Boolean));

  const matched: string[] = [];
  const missing: string[] = [];
  for (const w of aWords) {
    (cWords.has(w) ? matched : missing).push(w);
  }

  const weak: string[] = [];
  for (const w of WEAK) {
    const n = normalize(w);
    if (n && c.includes(n)) weak.push(w);
  }

  const base = aWords.size ? (matched.length / aWords.size) * 70 : 0;
  const hasNumbers = /\d/.test(cv) ? 15 : 0;
  const hasActions = /\n/.test(cv) ? 10 : 0;
  const noWeak = weak.length === 0 ? 5 : 0;
  const score = Math.max(0, Math.min(100, Math.round(base + hasNumbers + hasActions + noWeak)));

  return {
    score,
    matched: matched.slice(0, 24),
    missing: missing.slice(0, 24),
    weak,
    verdict:
      score >= 70 ? 'جيد جداً' : score >= 40 ? 'يحتاج تحسينات' : 'ضعيف المطابقة',
  };
}

/* ================================================================== */
/* تحضير المقابلة                                                      */
/* ================================================================== */

const QUESTIONS: { q: string; a: string; tag: string }[] = [
  {
    tag: 'عام',
    q: 'عرّف بنفسك في ثلاث جمل.',
    a: 'ابدأ بمن أنت مهنياً، ثم بالمهمة التي تتقدم لها، ثم بدليل واحد على قدرتك. لا تبدأ بالدراسة كاملة ولا بالسنة — ابدأ بما يخص الوظيفة.',
  },
  {
    tag: 'عام',
    q: 'لماذا هذه الشركة تحديداً؟',
    a: 'اذكر شيئاً محدداً عن منتجها أو عملائها، وبيّن كيف تتقاطع خبرتك مع حاجتها. الإجابة العامة «لأنها شركة كبيرة» تُقرأ كإجابة محفوظة.',
  },
  {
    tag: 'عام',
    q: 'ما أكبر إنجاز أنجزته؟',
    a: 'استخدم بنية: الموقف، ما فعلت أنت تحديداً، النتيجة بالأرقام. لا تحكي عن الفريق — المسؤول يريد أن يعرف دورك أنت.',
  },
  {
    tag: 'خدمة عملاء',
    q: 'كيف تتعامل مع عميل غاضب؟',
    a: 'أظهر تسلسلاً واضحاً: الإنصات حتى ينتهي، إعادة صياغة المشكلة للتأكد من فهمها، حل أو تصعيد مع مهلة محددة، ثم متابعة بعد الإغلاق. اذكر مثالاً حقيقياً واحداً.',
  },
  {
    tag: 'خدمة عملاء',
    q: 'كيف تقيس نجاحك في هذا الدور؟',
    a: 'اربط بمؤشرات الدور: زمن الرد الأول، زمن الحل، رضا العميل، نسبة التصعيد. ثم اذكر رقماً من خدمتك السابقة إن وُجد.',
  },
  {
    tag: 'بيانات',
    q: 'كيف تتعامل مع بيانات ناقصة أو غير نظيفة؟',
    a: 'اذكر خطوات: فحص القيم الفارغة، توحيد الصيغ، توثيق القاعدة المطبقة، ثم قياس نسبة الأخطاء قبل وبعد. الأرقام هنا تُقنع فوراً.',
  },
  {
    tag: 'كتابة',
    q: 'كيف تعرف الجمهور المستهدف قبل الكتابة؟',
    a: 'اذكر ثلاث إشارات عملية: من يقرأ، ماذا يعرف مسبقاً، وما الإجراء المطلوب بعد القراءة. وضّح أنك تختبر العنوانين بدل الاعتماد على جملة واحدة.',
  },
  {
    tag: 'تصميم',
    q: 'كيف توازن بين البساطة وكثرة الخيارات؟',
    a: 'ابدأ بالمهمة التي يريد إنجازها المستخدم، لا بالتصميم. اذكر مثالاً خفّفت فيه عنصراً وحسّنت التحويل أو زمن الإنجاز.',
  },
  {
    tag: 'برمجة',
    q: 'كيف تتعامل مع كود لا تفهمه؟',
    a: 'أظهر منهجية: اقرأ الاختبارات أولاً، أعد إنتاج الخطأ، اعزل أقرب سبب، ثم راجع التاريخ. من المهم أن تقول إنك لا تعرف بدل التخمين.',
  },
  {
    tag: 'العمل عن بُعد',
    q: 'كيف تنظّم يومك بلا إشراف مباشر؟',
    a: 'اذكر روتيناً ملموساً: قائمة مهام تُجهَّز في اليوم السابق، وأوقات رد متفق عليها، ونظام متابعة أسبوعي. وأضف كيف تعرف أنك تأخرت عن هدف.',
  },
  {
    tag: 'العمل عن بُعد',
    q: 'ماذا تفعل حين تختلف مع زميل عن بُعد؟',
    a: 'اذكر أنك تكتب المسألة أولاً لتفصل الرأي عن الطلب، ثم تقترح حلاً معقولاً بدل انتظار اجتماع. أضف مثالاً.',
  },
  {
    tag: 'الراتب',
    q: 'ما توقعاتك للراتب؟',
    a: 'لا تعتذر ولا تعطي رقماً قبل أن تعرف النطاق. قل: «بناءً على [نطاق شفاه في الإعلان]، توقعي هو [رقم]، وأنا منفتح للمناقشة حسب الحزمة الكاملة».',
  },
];

export function InterviewPrep() {
  const [tag, setTag] = useState('الكل');
  const tags = ['الكل', ...new Set(QUESTIONS.map((q) => q.tag))];
  const list = tag === 'الكل' ? QUESTIONS : QUESTIONS.filter((q) => q.tag === tag);

  usePageMeta({
    title: 'تحضير مقابلات العمل عن بُعد — أسئلة وأجوبة | ezyjobs',
    description:
      'بنك أسئلة مقابلة عمل عن بُعد مع نموذج إجابة لكل سؤال، مقسّم حسب مجال الوظيفة.',
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTag(t)}
            className={`ez-btn px-4 py-2 text-[13px] ${tag === t ? 'ez-btn-primary' : 'ez-btn-ghost'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((item, i) => (
          <div key={item.q} className="ez-card p-5">
            <div className="mb-2.5 flex items-center gap-2.5">
              <span className="tnum font-display text-xs font-bold text-brand/50">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="ez-chip">{item.tag}</span>
            </div>
            <h3 className="text-[15px] font-bold text-ink">{item.q}</h3>
            <p className="mt-2.5 text-[13.5px] leading-[1.9] text-muted">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Prose>
          <h2>قبل أن تغلق هذه الصفحة</h2>
          <p>
            اقرأ <Link to="/guides/remote-interview-guide">دليل المقابلة عن بُعد</Link> —
            فيه الإعدادات التقنية، وأخطاء لغة الجسد داخل الإطار، وماذا تفعل عند انقطاع
            الاتصال. هذه التفاصيل تفرق أكثر من حفظ إجابة.
          </p>
        </Prose>
      </div>
    </div>
  );
}
