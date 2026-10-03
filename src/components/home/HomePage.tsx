import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import { filterJobs } from '../../lib/match';
import { emptyFilters } from '../../types';
import JobCard from '../jobs/JobCard';
import { Badge, Section, SectionHead } from '../ui/Primitives';
import Starfield from '../art/Starfield';
import Reveal from '../art/Reveal';
import Magnetic from '../art/Magnetic';
import Tilt from '../art/Tilt';
import CountUp from '../art/CountUp';
import OrbitMark from '../art/OrbitMark';
import { usePublicSiteSettings } from '../../lib/siteSettings';
import AdSenseSlot from '../monetization/AdSenseSlot';
import { usePageMeta } from '../../lib/seo';
import EzyHero from './EzyHero';
import SpatialDiscovery from './SpatialDiscovery';
import CinematicJobOrbit from './CinematicJobOrbit';
import HomeChapterRail from './HomeChapterRail';
import './HomeSurface.css';

const ticker = [
  'Remote opportunities',
  'Clear eligibility signals',
  'Worldwide and local filters',
  'Student-friendly roles',
  'No-experience opportunities',
  'Part-time and freelance work',
];

const englishCopy = (value: string | undefined, fallback: string) => {
  const text = value?.trim();
  return text && !/[\u0600-\u06FF]/.test(text) ? text : fallback;
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
    title: englishSetting(settings, 'seo_site_title', 'EzyJobs — Find remote and flexible jobs that fit you'),
    description: englishSetting(settings, 'seo_site_description', 'Discover remote, flexible and student-friendly opportunities with clear job matching, eligibility signals and direct application links.'),
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
    <div className="ezy-home-shell" dir="ltr">
      <div className="ezy-scroll-progress" aria-hidden="true"><span /></div>
      <HomeChapterRail />
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
              eyebrow={englishSetting(settings, 'home_eligibility_eyebrow', 'Verified eligibility')}
              title={<span>Jobs with <span className="text-gradient">clear fit signals</span> before you apply</span>}
              lead={englishSetting(settings, 'home_eligibility_lead', 'We surface the important details early: location eligibility, experience level, working style and the requirements that matter before you open the application.')} 
              action={
                <Link to="/jobs" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
                  {englishSetting(settings, 'home_all_jobs_label', 'View all jobs')}
                </Link>
              }
            />
          </Reveal>
          {remoteNoExp.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {remoteNoExp.slice(0, 4).map((job, i) => (
                <Reveal key={job.id} delay={(i % 2) * 100}>
                  <JobCard job={job} locale="en" />
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
              eyebrow={englishSetting(settings, 'home_students_eyebrow', 'Student opportunities')}
              title={<span>Flexible jobs <span className="text-gradient-coral">while you study</span></span>}
              lead={englishSetting(settings, 'home_students_lead', 'Explore part-time roles, internships and flexible opportunities designed to work around your study schedule.')}
              action={
                <Link to="/students" className="ez-btn ez-btn-ghost px-6 py-3 text-sm">
                  {englishSetting(settings, 'home_students_button', 'Explore student jobs')}
                </Link>
              }
            />
          </Reveal>
          {forStudents.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {forStudents.slice(0, 4).map((job, i) => (
                <Reveal key={job.id} delay={(i % 2) * 100}>
                  <JobCard job={job} locale="en" />
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
      <p className="text-sm text-muted">{englishCopy(text, 'No matching opportunities right now. Try broadening your search filters.')}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const CYCLE = ['تُترجَم', 'تُحلَّل', 'تُصفَّى'];

function RotatingWord() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((v) => (v + 1) % CYCLE.length), 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <span className="relative inline-block min-w-[4ch] text-gradient" aria-live="polite">
      <span key={i} className="anim-fade inline-block">
        {CYCLE[i]}
      </span>
    </span>
  );
}

function Hero({ q, setQ, jobs, settings }: { q: string; setQ: (v: string) => void; jobs: Job[]; settings: Record<string, string> }) {
  const ref = useRef<HTMLInputElement>(null);
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const geoKnown = jobs.filter((j) => j.eligibility === 'open' || j.eligibility === 'limited').length;
  const students = jobs.filter((j) => j.suitableForStudents).length;
  const quickQueries = useMemo(() => {
    const configured = settings.home_search_chips?.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) ?? [];
    const jobTitles = jobs.slice(0, 8).map((job) => job.titleAr).filter(Boolean);
    return Array.from(new Set([...configured, ...jobTitles])).slice(0, 8);
  }, [jobs, settings.home_search_chips]);
  const liveMatches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return filterJobs(jobs, { ...emptyFilters, q: term, sort: 'relevance' }).slice(0, 3);
  }, [jobs, q]);

  return (
    <section className="home-hero relative overflow-hidden border-b border-line bg-gradient-to-b from-white via-[#f7fbff] to-[#eaf3fb] text-ink">
      <Starfield className="absolute inset-0 h-full w-full opacity-90" density={1.1} />
      <div className="beam-conic absolute -top-[30%] left-1/2 h-[900px] w-[900px] -translate-x-1/2 opacity-40" aria-hidden />
      <div className="ez-grid-light absolute inset-0 opacity-50" />
      <div className="ez-grain anim-grain absolute inset-0 opacity-[0.12]" />
      <div className="anim-drift absolute -left-40 top-0 h-[560px] w-[560px] rounded-full opacity-30 blur-[130px]" style={{ background: 'radial-gradient(circle, #2f64d6 0%, transparent 70%)' }} />
      <div className="anim-drift absolute -right-40 bottom-0 h-[480px] w-[480px] rounded-full opacity-20 blur-[120px]" style={{ background: 'radial-gradient(circle, #2aa884 0%, transparent 70%)', animationDelay: '-6s' }} />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[500px] -translate-x-1/2 rounded-full opacity-10 blur-[100px]" style={{ background: 'radial-gradient(circle, #7bb0ff 0%, transparent 70%)' }} />
      <div
        className="glass-orb anim-breathe right-[6%] top-[16%] hidden h-[120px] w-[120px] lg:block"
        style={{ ['--orb' as string]: 'rgba(47,100,214,0.10)', ['--breathe-max' as string]: 0.72 }}
      />
      <div
        className="glass-orb anim-breathe bottom-[14%] left-[5%] hidden h-[84px] w-[84px] lg:block"
        style={{ ['--orb' as string]: 'rgba(42,168,132,0.10)', ['--breathe-max' as string]: 0.66, animationDelay: '-4s' }}
      />

      <div className="relative mx-auto max-w-[1240px] px-5 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <span className="anim-fade-up pill-glow inline-flex items-center gap-2.5 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-[12px] font-semibold text-brand-700 backdrop-blur">
              <span className="anim-pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-brand" />
              {settings.home_hero_eyebrow?.trim() || 'طبقة ذكاء وظيفي عربية فوق مصادر التوظيف العالمية'}
            </span>

            {settings.home_headline?.trim() ? (
              <h1 className="anim-fade-up stagger-1 mt-7 max-w-4xl text-[2.9rem] font-black leading-[1.04] sm:text-6xl lg:text-[4.6rem]">
                {settings.home_headline}
              </h1>
            ) : (
              <h1 className="anim-fade-up stagger-1 mt-7 text-[2.9rem] font-black leading-[1.04] sm:text-6xl lg:text-[4.6rem]">
                الوظيفة لا تُعرض،
                <br />
                بل <RotatingWord />
                <br />
                <span className="text-ink">ثم تُفهم</span>
              </h1>
            )}

            <p className="anim-fade-up stagger-2 mt-7 max-w-xl text-[15px] leading-[1.95] text-muted sm:text-base">
              {settings.home_lead?.trim() || 'تجمع ezyjobs الوظائف عن بُعد من مصادر تسمح بإعادة التوزيع، تترجمها وتبسطها، وتحدد لك بوضوح: هل تقبل دولتك؟ كم خبرة تطلب؟ وما الذي تحتاجه قبل التقديم.'}
            </p>

            {/* Command-center search */}
            <form className="anim-fade-up stagger-3 mt-9" action="/jobs" onSubmit={(e) => e.preventDefault()}>
              <div
                className={`flex flex-col gap-2 rounded-2xl border bg-white/92 p-2 shadow-[0_22px_50px_-30px_rgba(23,36,59,0.28)] backdrop-blur-xl transition-all duration-300 sm:flex-row ${
                  focus ? 'border-brand shadow-[0_0_36px_-10px_rgba(47,100,214,0.42)]' : 'border-line'
                }`}
              >
                <div className="relative flex-1">
                  <svg className="absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    ref={ref}
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onFocus={() => setFocus(true)}
                    onBlur={() => window.setTimeout(() => setFocus(false), 120)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setFocus(false);
                    }}
                    aria-expanded={focus}
                    aria-controls="ezyjobs-live-search"
                    placeholder={settings.home_search_placeholder?.trim() || 'ماذا تبحث عنه؟ مثال: خدمة عملاء، إدخال بيانات، كتابة'}
                    className="w-full bg-transparent py-3.5 pl-14 pr-14 text-[15px] text-ink outline-none placeholder:text-muted"
                  />
                  <kbd className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-line bg-paper-2 px-2 py-0.5 font-display text-[11px] text-muted sm:block">
                    /
                  </kbd>
                  {focus && (
                    <div id="ezyjobs-live-search" role="listbox" className="query-popover absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl border border-line bg-white/98 p-2 text-right shadow-[0_30px_70px_-32px_rgba(23,36,59,0.28)] backdrop-blur-xl">
                      {q.trim() && liveMatches.length > 0 ? (
                        <>
                          <div className="px-3 pb-2 pt-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted">نتائج مباشرة</div>
                          {liveMatches.map((job) => (
                            <Link
                              key={job.id}
                              to={'/jobs/' + job.slug}
                              onMouseDown={(e) => e.preventDefault()}
                              className="query-item group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-brand-50"
                            >
                              <span className="live-dot shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] font-bold text-ink group-hover:text-brand-700">{job.titleAr}</span>
                                <span className="mt-0.5 block truncate text-[11px] text-muted">{job.company}</span>
                              </span>
                              <span className="text-[10px] font-bold text-brand-700">عرض</span>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between px-3 pb-2 pt-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">ابدأ بسرعة</span>
                            <span className="text-[10px] text-muted">{quickQueries.length} اقتراحات</span>
                          </div>
                          <div className="grid gap-1 sm:grid-cols-2">
                            {quickQueries.slice(0, 6).map((term) => (
                              <Link
                                key={term}
                                to={'/jobs?q=' + encodeURIComponent(term)}
                                onMouseDown={(e) => e.preventDefault()}
                                className="query-item rounded-xl px-3 py-2.5 text-[12px] font-semibold text-muted transition-colors hover:bg-brand-50 hover:text-brand-700"
                              >
                                {term}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Magnetic strength={6}>
                  <Link to={`/jobs${q ? `?q=${encodeURIComponent(q)}` : ''}`} className="ez-btn ez-btn-primary whitespace-nowrap px-8 py-3.5 text-sm">
                    {settings.home_search_button?.trim() || 'ابحث في الوظائف'}
                  </Link>
                </Magnetic>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {quickQueries.slice(0, 6).map((t) => (
                  <Link key={t} to={`/jobs?q=${encodeURIComponent(t)}`} className="ez-chip ez-chip-ink transition-all hover:-translate-y-0.5 hover:border-brand-100 hover:text-brand-700 hover:shadow-[0_0_18px_-4px_rgba(47,100,214,0.35)]">
                    {t}
                  </Link>
                ))}
              </div>
            </form>

            <div className="anim-fade-up stagger-4 mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-line pt-8">
              {[
                { n: geoKnown, l: settings.home_hero_stat_geo?.trim() || 'فرصة لها نطاق جغرافي معروف', numeric: true },
                { n: students, l: settings.home_hero_stat_students?.trim() || 'فرصة للطلاب', numeric: true },
                { n: '100%', l: settings.home_hero_stat_language?.trim() || 'تحليل بالعربية', numeric: false },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-2xl font-bold text-ink lg:text-3xl">
                    {s.numeric ? <CountUp value={s.n as number} suffix="+" /> : s.n}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-muted">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="anim-fade-up stagger-4 relative hidden lg:block">
            <Tilt max={6}>
              <GlassCommandDeck />
            </Tilt>
            <OrbitChips />
          </div>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex" aria-hidden>
        <span className="text-[10px] tracking-[0.3em] text-muted">اكتشف</span>
        <span className="block h-9 w-px bg-gradient-to-b from-brand to-transparent" />
      </div>
    </section>
  );
}

function OrbitChips() {
  const chips = [
    { t: 'Remote', s: 'مؤكد', cls: 'tone-positive', pos: '-top-4 -right-3', d: '0s' },
    { t: 'B2', s: 'إنجليزية', cls: 'tone-caution', pos: 'top-[38%] -left-8', d: '-2s' },
    { t: '+12', s: 'فرصة اليوم', cls: 'tone-brand', pos: '-bottom-4 right-[12%]', d: '-4s' },
  ];
  return (
    <>
      {chips.map((c) => (
        <span
          key={c.t}
          className={`anim-rise absolute ${c.pos} z-10 flex items-center gap-2 rounded-2xl border border-line bg-white/96 px-3.5 py-2 shadow-[0_16px_40px_-18px_rgba(23,36,59,0.24)] backdrop-blur-xl`}
          style={{ animationDelay: c.d }}
        >
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.cls}`}>{c.t}</span>
          <span className="text-[11.5px] font-semibold text-ink/70">{c.s}</span>
        </span>
      ))}
    </>
  );
}

function AnatomyCard() {
  return (
    <div className="ez-card overflow-hidden p-6">
      <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
        <span className="text-[11px] font-bold tracking-[0.16em] text-muted">قبل / بعد</span>
        <span className="tone-caution rounded-full px-2.5 py-1 text-[10px] font-bold">نموذج حي</span>
      </div>

      <div className="space-y-5">
        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-muted">الإعلان الأصلي</p>
          <p dir="ltr" className="mt-2 text-left font-display text-[13px] leading-relaxed text-muted">
            Customer Support Specialist — Remote, worldwide. 1+ year experience preferred. English B2.
          </p>
        </div>

        <div className="ez-hr-glow" />

        <div>
          <p className="text-[10px] font-bold tracking-[0.16em] text-accent">ما تعرضه ezyjobs</p>
          <p className="mt-2 text-lg font-bold text-ink">أخصائي دعم عملاء عن بُعد</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge tone="positive">الأهلية: مؤكدة</Badge>
            <Badge tone="brand">بدون خبرة</Badge>
            <Badge tone="neutral">دوام كامل</Badge>
          </div>

          <div className="mt-4 space-y-2.5 border-t border-line pt-4 text-[12.5px] leading-relaxed">
            <p className="text-ink/75">
              <span className="font-bold text-mint">قد تناسبك لأن: </span>
              تقبل المتقدمين من الجزائر والمغرب ومصر، ولا تشترط خبرة سابقة.
            </p>
            <p className="text-muted">
              <span className="font-bold text-caution">انتبه: </span>
              تحتاج إنجليزية بمستوى B2 على الأقل.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
            <span className="text-[11px] text-muted">المصدر: Remote OK</span>
            <span className="ez-btn ez-btn-primary px-4 py-2 text-[11px]">التقديم من المصدر</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverySignal({ jobs }: { jobs: Job[] }) {
  const recent = jobs.filter((job) => Date.now() - new Date(job.publishedAt).getTime() <= 7 * 86_400_000);
  const verified = jobs.filter((job) => job.eligibility === 'open').length;
  const student = jobs.filter((job) => job.suitableForStudents).length;
  const total = Math.max(1, jobs.length);

  const signals = [
    { label: 'Added in the last 7 days', value: recent.length, tone: 'brand', note: 'Recently published roles' },
    { label: 'Verified eligibility', value: verified, tone: 'positive', note: 'Clear geographic signals' },
    { label: 'Student-friendly', value: student, tone: 'accent', note: 'Flexible or study-friendly' },
  ] as const;

  return (
    <section className="home-signal-strip border-b border-line bg-white/72 backdrop-blur-xl">
      <div className="mx-auto max-w-[1240px] px-5 py-4 lg:px-10">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <span className="live-scan shrink-0" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted">LIVE INDEX SIGNALS</p>
              <p className="mt-0.5 text-[12px] text-muted">Numbers update with the jobs currently indexed.</p>
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
  { n: '01', title: 'Translate & simplify', body: 'Turn dense job descriptions into clear, useful language so you understand the role quickly.' },
  { n: '02', title: 'Check eligibility', body: 'Go beyond the word “Remote” and surface whether your location is clearly accepted.' },
  { n: '03', title: 'Clarify seniority', body: 'See whether a role is aimed at students, entry-level candidates, juniors or experienced professionals.' },
  { n: '04', title: 'Show what matters', body: 'Surface the skills, requirements, languages and working pattern before you apply.' },
];

function ValueProps({ settings }: { settings: Record<string, string> }) {
  const configuredRaw = parsePairSetting(settings.home_pillars, pillars);
  const configured = configuredRaw.every((item) => !/[\u0600-\u06FF]/.test(item.title + item.body)) ? configuredRaw : pillars;
  return (
    <section id="home-value" className="relative py-20 lg:py-28 ezy-value-section">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.07] blur-[120px]" style={{ background: 'radial-gradient(circle, #2f64d6 0%, transparent 70%)' }} />
      <div className="relative mx-auto max-w-[1240px] px-5 lg:px-10">
        <Reveal>
          <SectionHead
            eyebrow={englishSetting(settings, 'home_value_eyebrow', 'What we do')}
            title={<span>The difference between a <span className="text-gradient">job list</span> and a clear decision</span>}
            lead={englishSetting(settings, 'home_value_lead', 'The problem is rarely a lack of jobs. It is noise, unclear language and missing context. EzyJobs brings the useful signals forward.')}
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
  { n: '1', title: 'Build your profile', body: 'Set your location, level, languages, skills and preferred working pattern.' },
  { n: '2', title: 'Filter the noise', body: 'Remove roles that do not match your basic requirements.' },
  { n: '3', title: 'Understand the fit', body: 'See the signals that explain why a role may or may not fit you.' },
  { n: '4', title: 'Apply at the source', body: 'Open the original posting with a clear path to apply.' },
];

function HowItWorksSection({ settings }: { settings: Record<string, string> }) {
  const configuredRaw = parsePairSetting(settings.home_steps_cards, steps);
  const configured = configuredRaw.every((item) => !/[\u0600-\u06FF]/.test(item.title + item.body)) ? configuredRaw.map((s, i) => ({ n: String(i + 1), title: s.title, body: s.body })) : steps;
  return (
    <section id="home-process" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <Reveal>
          <SectionHead
            eyebrow={englishSetting(settings, 'home_steps_eyebrow', 'How it works')}
            title={englishSetting(settings, 'home_steps_title', 'From discovery to application in four steps')}
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
                  <span className="step-status">STEP {i + 1}</span>
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
    { title: 'Posting facts', body: 'Information taken directly from the original job posting.' },
    { title: 'EzyJobs analysis', body: 'Our interpretation of fit, requirements and eligibility signals.' },
    { title: 'Official source', body: 'The employer or original platform where the application is submitted.' },
    { title: 'Affiliate link', body: 'When a link is monetized, we identify it clearly before you click.' },
  ];
  const raw = parsePairSetting(settings.home_transparency_cards, fallback);
  const cards = raw.every((item) => !/[\u0600-\u06FF]/.test(item.title + item.body)) ? raw : fallback;
  return (
    <section id="home-trust" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <span className="ez-eyebrow mb-4">{englishSetting(settings, 'home_transparency_eyebrow', 'Trust & transparency')}</span>
              <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">
                Separate the signals, <span className="text-gradient">show what is factual</span>
              </h2>
              <p className="mt-5 text-[15px] leading-[1.95] text-muted">
                {englishSetting(settings, 'home_transparency_lead', 'We distinguish posting facts, our analysis, the official application source and any monetized link so you know exactly what you are seeing.')}
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
          <div className="anim-drift absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full opacity-25 blur-[100px]" style={{ background: 'radial-gradient(circle, #d4af6a 0%, transparent 70%)' }} />
          <div className="relative">
            <OrbitMark size={54} className="mx-auto mb-6" />
            <h2 className="text-3xl font-black leading-tight text-ink sm:text-4xl">
              Start with <span className="text-gradient">three signals</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-[1.9] text-muted">
              {englishSetting(settings, 'home_final_lead', 'Tell us your location, level and preferred working pattern. We will take it from there.')}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <Link to="/jobs" className="ez-btn ez-btn-primary px-8 py-4 text-sm">
                  {englishSetting(settings, 'home_final_primary', 'Open job search')}
                </Link>
              </Magnetic>
              <Link to="/no-experience" className="ez-btn ez-btn-ghost px-8 py-4 text-sm">
                {englishSetting(settings, 'home_final_secondary', 'Find no-experience roles')}
              </Link>
            </div>
            <p className="mt-8 text-[12px] text-muted">
              <span className="tnum">{jobs}</span> indexed opportunities — including{' '}
              <span className="tnum font-bold text-brand-700">{confirmed}</span> with verified eligibility.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

function GlassCommandDeck() {
  return (
    <div className="glass-deck relative mx-auto w-full max-w-[540px]" aria-hidden>
      <div className="glass-deck__halo" />
      <div className="glass-deck__orbit glass-deck__orbit--a" />
      <div className="glass-deck__orbit glass-deck__orbit--b" />
      <div className="glass-deck__float glass-deck__float--top">
        <span className="glass-mini-dot" />
        <span><b>Live match</b><small>مطابقة حيّة</small></span>
        <strong>92%</strong>
      </div>
      <div className="glass-deck__float glass-deck__float--bottom">
        <span className="glass-mini-icon">↗</span>
        <span><b>12 فرص جديدة</b><small>منذ آخر فحص</small></span>
      </div>

      <div className="glass-deck__shell">
        <div className="glass-deck__topline">
          <span className="glass-deck__brand"><span /> EZY SIGNAL</span>
          <span className="glass-deck__live">LIVE INDEX</span>
        </div>

        <div className="glass-deck__main">
          <div className="glass-score"><div className="glass-score__ring"><div className="glass-score__core"><span>92</span><small>MATCH</small></div></div></div>
          <div className="glass-deck__copy">
            <span className="glass-kicker">فرصة قريبة من ملفك</span>
            <h3>أخصائي دعم عملاء</h3>
            <p>Remote · Worldwide · English B2</p>
            <div className="glass-tags"><span>مؤهلة للجزائر</span><span>بدون خبرة</span></div>
          </div>
        </div>

        <div className="glass-deck__wave" />
        <div className="glass-deck__metrics">
          <div><b>01</b><span>أهلية</span></div>
          <div><b>03</b><span>مهارات</span></div>
          <div><b>24h</b><span>تحديث</span></div>
        </div>

        <div className="glass-deck__source">
          <span>المصدر الأصلي</span><b>Remote OK</b><span className="glass-source-pill">موثوق</span>
        </div>
      </div>
    </div>
  );
}
