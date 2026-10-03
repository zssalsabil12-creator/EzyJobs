import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import { filterJobs } from '../../lib/match';
import { emptyFilters } from '../../types';
import JobCard from '../jobs/JobCard';
import { Badge, Section, SectionHead } from '../ui/Primitives';
import Reveal from '../art/Reveal';
import Magnetic from '../art/Magnetic';
import OrbitMark from '../art/OrbitMark';
import { usePublicSiteSettings } from '../../lib/siteSettings';
import AdSenseSlot from '../monetization/AdSenseSlot';
import { usePageMeta } from '../../lib/seo';
import { homeJsonLd } from '../../lib/seoI18n';
import EzyHero from './EzyHero';
import SpatialDiscovery from './SpatialDiscovery';
import CinematicJobOrbit from './CinematicJobOrbit';
import './HomeSurface.css';

const ticker = [
  'فرص عن بُعد',
  'أهلية واضحة قبل التقديم',
  'فلاتر حسب الدولة والمجال',
  'وظائف مناسبة للطلاب',
  'فرص بدون خبرة',
  'دوام جزئي وعمل حر',
];

const englishCopy = (value: string | undefined, fallback: string) => {
  const text = value?.trim();
  return text && /[\u0600-\u06FF]/.test(text) ? text : fallback;
};

const englishSetting = (settings: Record<string, string>, key: string, fallback: string) =>
  englishCopy(settings[key], fallback);

export default function HomePage({ jobs }: { jobs: Job[] }) {
  const [q, setQ] = useState('');
  const settings = usePublicSiteSettings();

  useEffect(() => {
    let raf = 0;
    const updateScrollState = () => {
      raf = 0;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--ezy-page-progress', String(window.scrollY / max));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updateScrollState);
    };
    updateScrollState();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  usePageMeta({
    title: englishCopy(settings.seo_site_title, 'EzyJobs — وظائف وفرص عمل عن بُعد'),
    description: englishCopy(settings.seo_site_description, 'اكتشف وظائف عن بُعد وفرصاً مرنة وملائمة للطلاب، مع توضيح الأهلية والمتطلبات ومصدر التقديم قبل اتخاذ قرارك.'),
    canonical: 'https://ezyjobs.com/',
    alternates: {
      ar: 'https://ezyjobs.com/',
      en: 'https://ezyjobs.com/en/jobs',
      fr: 'https://ezyjobs.com/fr/emplois',
      'x-default': 'https://ezyjobs.com/',
    },
    locale: 'ar',
    jsonLd: homeJsonLd(),
  });

  const remoteNoExp = useMemo(
    () =>
      filterJobs(jobs, {
        ...emptyFilters,
        workMode: 'remote',
        noExperienceOnly: true,
        eligibility: 'open',
      }),
    [jobs],
  );

  const forStudents = useMemo(
    () => filterJobs(jobs, { ...emptyFilters, studentsOnly: true, sort: 'newest' }),
    [jobs],
  );

  const geoKnown = useMemo(() => jobs.filter((j) => j.eligibility === 'open' || j.eligibility === 'limited').length, [jobs]);

  return (
    <div className="ezy-home-shell" dir="rtl">
      <div className="ezy-scroll-progress" aria-hidden="true"><span /></div>
      {englishCopy(settings.announcement, '').trim() && (
        <div className="ezy-home-announcement border-b border-line px-5 py-3 text-center text-[12px] font-semibold text-muted">
          {englishCopy(settings.announcement, '')}
        </div>
      )}
      <EzyHero q={q} setQ={setQ} jobs={jobs} settings={settings} />
      <Ticker />
      <AdSenseSlot slot={settings.adsense_top_slot} />

      <section id="home-jobs" className="ezy-home-section ezy-home-section--jobs py-20 lg:py-24">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <Reveal>
            <SectionHead
              eyebrow={englishSetting(settings, 'home_eligibility_eyebrow', 'أهلية واضحة')}
              title={<span>وظائف مع <span className="text-gradient">إشارات واضحة</span> قبل التقديم</span>}
              lead={englishSetting(settings, 'home_eligibility_lead', 'نوضح لك الأهلية الجغرافية والخبرة ونمط العمل والمتطلبات المهمة قبل أن تفتح رابط التقديم.')}
              action={
                <Link to="/jobs" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
                  {englishSetting(settings, 'home_all_jobs_label', 'عرض جميع الوظائف')}
                </Link>
              }
            />
          </Reveal>
          {remoteNoExp.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {remoteNoExp.slice(0, 4).map((job, i) => (
                <Reveal key={job.id} delay={(i % 2) * 100}>
                  <JobCard job={job} locale="ar" />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyLine text={settings.home_empty_text} />
          )}
        </div>
      </section>

      <DiscoverySignal jobs={jobs} />
      <ValueProps settings={settings} />
      <div className="scroll-3d-rail mx-5 my-4 lg:mx-auto" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.18em] text-[#6f87ad]">
          <span>EZY SIGNAL</span>
          <span>DISCOVER</span>
          <span>FILTER</span>
          <span>MATCH</span>
          <span>APPLY</span>
        </div>
      </div>
      <SpatialDiscovery jobs={jobs} />
      <CinematicJobOrbit jobs={jobs} />
      <AdSenseSlot slot={settings.adsense_inline_slot} />

      <section id="home-students" className="ezy-home-section ezy-home-section--students py-20 lg:py-28">
        <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
          <Reveal>
            <SectionHead
              eyebrow={englishSetting(settings, 'home_students_eyebrow', 'فرص للطلاب')}
              title={<span>وظائف مرنة <span className="text-gradient-coral">أثناء الدراسة</span></span>}
              lead={englishSetting(settings, 'home_students_lead', 'استكشف وظائف جزئية وتدريبات وفرصاً مرنة يمكنها التكيف مع جدولك الدراسي.')}
              action={
                <Link to="/students" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
                  {englishSetting(settings, 'home_students_button', 'استكشف وظائف الطلاب')}
                </Link>
              }
            />
          </Reveal>
          {forStudents.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {forStudents.slice(0, 4).map((job, i) => (
                <Reveal key={job.id} delay={(i % 2) * 100}>
                  <JobCard job={job} locale="ar" />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyLine text={settings.home_empty_text} />
          )}
        </div>
      </section>

      <HowItWorksSection settings={settings} />
      <Transparency settings={settings} />
      <FinalCta confirmed={geoKnown} jobs={jobs.length} settings={settings} />
    </div>
  );
}

function EmptyLine({ text }: { text?: string }) {
  return (
    <div className="ez-panel px-6 py-14 text-center">
      <p className="text-sm text-muted">{englishCopy(text, 'لا توجد فرص مطابقة حالياً. جرّب توسيع معايير البحث.')}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function DiscoverySignal({ jobs }: { jobs: Job[] }) {
  const recent = jobs.filter((job) => Date.now() - new Date(job.publishedAt).getTime() <= 7 * 86_400_000);
  const verified = jobs.filter((job) => job.eligibility === 'open').length;
  const student = jobs.filter((job) => job.suitableForStudents).length;
  const total = Math.max(1, jobs.length);

  const signals = [
    { label: 'أضيفت خلال 7 أيام', value: recent.length, tone: 'brand', note: 'وظائف منشورة حديثاً' },
    { label: 'أهلية موثقة', value: verified, tone: 'positive', note: 'إشارات جغرافية واضحة' },
    { label: 'مناسبة للطلاب', value: student, tone: 'accent', note: 'مرنة أو مناسبة للدراسة' },
  ] as const;

  return (
    <section className="home-signal-strip border-b border-line bg-white/72 backdrop-blur-xl">
      <div className="mx-auto max-w-[1240px] px-5 py-4 lg:px-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <span className="live-scan shrink-0" />
            <div>
              <p className="text-[10px] font-black tracking-[0.12em] text-muted">إشارات الفهرسة المباشرة</p>
              <p className="mt-0.5 text-[12px] text-muted">تتحدث الأرقام وفق الوظائف المفهرسة حالياً.</p>
            </div>
          </div>
          {signals.map((signal) => (
            <div key={signal.label} className="signal-card rounded-xl border border-line bg-white/70 px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-6">
                <span className="text-[11px] font-semibold text-muted">{signal.label}</span>
                <span className={`font-display text-lg font-black ${signal.tone === 'positive' ? 'text-mint' : signal.tone === 'accent' ? 'text-accent' : 'text-brand-700'}`}>{signal.value}</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-paper-2">
                <span
                  className={`block h-full rounded-full ${signal.tone === 'positive' ? 'bg-mint' : signal.tone === 'accent' ? 'bg-accent' : 'bg-brand'}`}
                  style={{ width: `${Math.max(8, Math.min(100, (signal.value / total) * 100))}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] text-muted">{signal.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Ticker({ reverse = false, items: configured }: { reverse?: boolean; items?: string }) {
  const source = configured?.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  const items = [...(source?.length ? source : ticker), ...(source?.length ? source : ticker)];
  return (
    <div className="glass-ticker relative overflow-hidden border-y border-line bg-paper-2/60 py-3 backdrop-blur">
      <div className={`${reverse ? 'anim-marquee-reverse' : 'anim-marquee'} flex w-max items-center gap-10 whitespace-nowrap`}>
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-10 text-[12.5px] font-medium text-muted">
            {t}
            <span className="h-1 w-1 rounded-full bg-gradient-to-r from-brand to-accent shadow-[0_0_8px_rgba(47,100,214,0.35)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

type HomePair = { title: string; body: string };

function parsePairSetting(value: string | undefined, fallback: HomePair[]): HomePair[] {
  const rows = (value ?? '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!rows.length) return fallback;
  const parsed = rows.map((line) => {
    const [title, ...rest] = line.split('||');
    return { title: title.trim(), body: rest.join('||').trim() };
  }).filter((item) => item.title && item.body);
  return parsed.length ? parsed : fallback;
}

const pillars = [
  { n: '01', title: 'نبسّط لك الإعلان', body: 'نحوّل وصف الوظيفة الطويل إلى معلومات واضحة تساعدك على فهم الدور بسرعة.' },
  { n: '02', title: 'نتحقق من الأهلية', body: 'لا نكتفي بكلمة «عن بُعد»؛ نوضح ما إذا كان موقعك مقبولاً بوضوح.' },
  { n: '03', title: 'نوضح مستوى الخبرة', body: 'نعرض ما إذا كانت الفرصة للطلاب أو للمبتدئين أو للخبرات المتوسطة والمتقدمة.' },
  { n: '04', title: 'نُظهر ما يهم', body: 'نبرز المهارات والمتطلبات واللغات ونمط العمل قبل أن تبدأ التقديم.' },
];

function ValueProps({ settings }: { settings: Record<string, string> }) {
  const configuredRaw = parsePairSetting(settings.home_pillars, pillars);
  const configured = configuredRaw;
  return (
    <section id="home-value" className="relative py-20 lg:py-28 ezy-value-section">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.07] blur-[120px]" style={{ background: 'radial-gradient(circle, #2f64d6 0%, transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1240px] px-5 lg:px-10">
        <Reveal>
          <SectionHead
            eyebrow={englishSetting(settings, 'home_value_eyebrow', 'ماذا نقدم')}
            title={<span>الفرق بين <span className="text-gradient">قائمة وظائف</span> وقرار واضح</span>}
            lead={englishSetting(settings, 'home_value_lead', 'المشكلة ليست دائماً نقص الوظائف؛ بل الضوضاء واللغة المعقدة ونقص المعلومات. EzyJobs يضع الإشارات المهمة أمامك.')}
          />
        </Reveal>

        <div className="ezy-value-grid grid gap-4 sm:grid-cols-2">
          {configured.map((p, i) => (
            <Reveal key={p.title + i} delay={(i % 2) * 110}>
              <div className="ezy-value-card group h-full p-7 lg:p-9">
                <span className="tnum font-display text-xs font-bold text-brand-700">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-lg font-bold text-ink transition-colors group-hover:text-brand-700">{p.title}</h3>
                <p className="mt-3 text-sm leading-[1.9] text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  { n: '1', title: 'أنشئ ملفك', body: 'حدد موقعك ومستواك ولغاتك ومهاراتك ونمط العمل المفضل لديك.' },
  { n: '2', title: 'صفِّ الضوضاء', body: 'استبعد الفرص التي لا تتوافق مع متطلباتك الأساسية.' },
  { n: '3', title: 'افهم مدى الملاءمة', body: 'شاهد الإشارات التي تشرح لماذا قد تناسبك الوظيفة أو لا تناسبك.' },
  { n: '4', title: 'قدّم من المصدر', body: 'افتح الإعلان الأصلي واتبع المسار الواضح للتقديم.' },
];

function HowItWorksSection({ settings }: { settings: Record<string, string> }) {
  const configuredRaw = parsePairSetting(settings.home_steps_cards, steps);
  const configured = configuredRaw.map((s, i) => ({ n: String(i + 1), title: s.title, body: s.body }));
  return (
    <section id="home-process" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <Reveal>
          <SectionHead
            eyebrow={englishSetting(settings, 'home_steps_eyebrow', 'كيف تعمل المنصة')}
            title={englishSetting(settings, 'home_steps_title', 'من الاكتشاف إلى التقديم في أربع خطوات')}
            align="center"
          />
        </Reveal>
        <div className="steps-grid grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {configured.map((s, i) => (
            <Reveal key={s.title + i} delay={i * 100}>
              <article className="step-glass relative h-full overflow-visible">
                <div className="step-glass__top">
                  <div className="step-number">
                    <span>0{i + 1}</span>
                  </div>
                  <span className="step-status">الخطوة {i + 1}</span>
                </div>
                <div className="step-progress"><span style={{ width: `${((i + 1) / configured.length) * 100}%` }} /></div>
                <h3 className="mt-6 text-base font-extrabold text-ink">{s.title}</h3>
                <p className="mt-3 text-sm leading-[1.9] text-muted">{s.body}</p>
                <span className="step-glass__ghost">{s.n}</span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Transparency({ settings }: { settings: Record<string, string> }) {
  const fallback = [
    { title: 'معلومات الإعلان', body: 'معلومات مأخوذة مباشرة من إعلان الوظيفة الأصلي.' },
    { title: 'تحليل EzyJobs', body: 'قراءة المنصة للملاءمة والمتطلبات وإشارات الأهلية.' },
    { title: 'المصدر الرسمي', body: 'الجهة أو المنصة الأصلية التي يتم التقديم من خلالها.' },
    { title: 'الرابط الربحي', body: 'عندما يكون الرابط جزءاً من نموذج ربحي، نوضح ذلك قبل النقر.' },
  ];
  const raw = parsePairSetting(settings.home_transparency_cards, fallback);
  const cards = raw;
  return (
    <section id="home-trust" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <span className="ez-eyebrow mb-4">{englishSetting(settings, 'home_transparency_eyebrow', 'الثقة والشفافية')}</span>
              <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">
                افصل الإشارات واعرف <span className="text-gradient">ما هو موثق فعلاً</span>
              </h2>
              <p className="mt-5 text-[15px] leading-[1.95] text-muted">
                {englishSetting(settings, 'home_transparency_lead', 'نميز بين معلومات الإعلان وتحليلنا ومصدر التقديم الرسمي وأي رابط ربحي، حتى تعرف بالضبط ما الذي تراه.')}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((x, i) => (
              <Reveal key={x.title + i} delay={i * 90}>
                <div className="ezy-transparency-card h-full p-6">
                  <div className="mb-3 h-0.5 w-8 rounded-full bg-gradient-to-l from-brand to-accent" />
                  <h3 className="text-sm font-bold text-ink">{x.title}</h3>
                  <p className="mt-2 text-[13px] leading-[1.85] text-muted">{x.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ confirmed, jobs, settings }: { confirmed: number; jobs: number; settings: Record<string, string> }) {
  return (
    <Section>
      <Reveal>
        <div id="home-cta" className="ezy-final-cta relative overflow-hidden p-8 text-center lg:p-16">
          <div className="ez-grid-light absolute inset-0" />
          <div className="anim-drift absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]" style={{ background: 'radial-gradient(circle, #76aefc 0%, transparent 70%)' }} />
          <div className="relative">
            <OrbitMark size={54} className="mx-auto mb-6" />
            <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">
              ابدأ بـ <span className="text-gradient">ثلاثة مؤشرات</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.9] text-muted">
              {englishSetting(settings, 'home_final_lead', 'أخبرنا بموقعك ومستواك ونمط العمل الذي تفضله، وسنساعدك في تضييق الطريق إلى الفرص الأنسب.')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Link to="/jobs" className="ez-btn ez-btn-primary px-8 py-4 text-sm">
                  {englishSetting(settings, 'home_final_primary', 'افتح محرك الوظائف')}
                </Link>
              </Magnetic>
              <Link to="/no-experience" className="ez-btn ez-btn-ghost px-8 py-4 text-sm">
                {englishSetting(settings, 'home_final_secondary', 'وظائف بدون خبرة')}
              </Link>
            </div>
            <p className="mt-8 text-[12px] text-muted">
              <span className="tnum">{jobs}</span> فرصة مفهرسة، منها{' '}
              <span className="tnum font-bold text-brand-700">{confirmed}</span> بإشارات أهلية موثقة.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
