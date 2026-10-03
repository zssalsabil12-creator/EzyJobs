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
import EzyHero from './EzyHero';
import SpatialDiscovery from './SpatialDiscovery';
import CinematicJobOrbit from './CinematicJobOrbit';
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
    title: englishSetting(settings, 'seo_site_title', 'EzyJobs Ã¢â‚¬â€ Find remote and flexible jobs that fit you'),
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
  { n: '02', title: 'Check eligibility', body: 'Go beyond the word Ã¢â‚¬Å“RemoteÃ¢â‚¬Â and surface whether your location is clearly accepted.' },
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
              <span className="tnum">{jobs}</span> indexed opportunities Ã¢â‚¬â€ including{' '}
              <span className="tnum font-bold text-brand-700">{confirmed}</span> with verified eligibility.
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
