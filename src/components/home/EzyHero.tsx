import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Database,
  Globe2,
  GraduationCap,
  Headphones,
  MapPin,
  Search,
  Sparkles,
  UserRound,
  Briefcase,
} from 'lucide-react';
import type { Job } from '../../types';
import { emptyFilters } from '../../types';
import { filterJobs } from '../../lib/match';
import { CATEGORIES } from '../../data/taxonomy';
import './EzyHero.css';

type Props = {
  q: string;
  setQ: (value: string) => void;
  jobs: Job[];
  settings: Record<string, string>;
};

type Chip = { label: string; query: string; icon: React.ReactNode };

const englishCopy = (value: string | undefined, fallback: string) => {
  const text = value?.trim();
  return text && !/[\u0600-\u06FF]/.test(text) ? text : fallback;
};

export default function EzyHero({ q, setQ, jobs, settings }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const root = heroRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      root.style.setProperty('--hero-progress', progress.toFixed(4));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const chips: Chip[] = useMemo(() => {
    const configured = settings.home_search_chips
      ?.split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];

    if (configured.length && configured.every((item) => !/[\u0600-\u06FF]/.test(item))) {
      return configured.slice(0, 6).map((label) => ({
        label,
        query: label,
        icon: <Sparkles size={13} strokeWidth={1.9} />,
      }));
    }

    return [
      { label: 'Remote', query: 'remote', icon: <Globe2 size={13} strokeWidth={1.9} /> },
      { label: 'Students', query: 'students', icon: <GraduationCap size={13} strokeWidth={1.9} /> },
      { label: 'No Experience', query: 'no experience', icon: <UserRound size={13} strokeWidth={1.9} /> },
      { label: 'Customer Support', query: 'customer support', icon: <Headphones size={13} strokeWidth={1.9} /> },
      { label: 'Data Entry', query: 'data entry', icon: <Database size={13} strokeWidth={1.9} /> },
      { label: 'AI', query: 'ai', icon: <Sparkles size={13} strokeWidth={1.9} /> },
    ];
  }, [settings.home_search_chips]);

  const liveMatches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return filterJobs(jobs, { ...emptyFilters, q: term, sort: 'relevance' }).slice(0, 4);
  }, [jobs, q]);

  const categoryCards = useMemo(() => {
    const ids = ['development', 'marketing', 'design', 'support', 'education'];
    const labels = [
      ['Technology', 'Software · AI · Data', 'blue'],
      ['Business', 'Marketing · Sales · Operations', 'mint'],
      ['Creative', 'Design · Writing · Content', 'violet'],
      ['Support', 'Customer Support · Virtual Assistant', 'sky'],
      ['Students', 'Internships · Entry Level', 'green'],
    ] as const;

    return ids.map((id, i) => {
      const category = CATEGORIES.find((item) => item.id === id);
      if (!category) return null;
      return {
        category,
        label: labels[i][0],
        detail: labels[i][1],
        tone: labels[i][2],
      };
    }).filter(Boolean) as Array<{
      category: (typeof CATEGORIES)[number];
      label: string;
      detail: string;
      tone: string;
    }>;
  }, []);

  const countryCount = useMemo(
    () => new Set(jobs.flatMap((job) => job.eligibleRegions).filter((region) => region && region !== 'worldwide')).size,
    [jobs],
  );
  const remoteCount = useMemo(() => jobs.filter((job) => job.workMode === 'remote').length, [jobs]);

  const featured = jobs.find((job) => job.eligibility === 'open') ?? jobs[0];
  const featuredTitle = featured?.titleAr || 'Product Designer';
  const featuredCompany = featured?.company || 'Global Opportunity';

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate('/jobs' + (params.toString() ? `?${params.toString()}` : ''));
  };

  const chooseQuery = (query: string) => {
    setQ(query);
    navigate('/jobs?q=' + encodeURIComponent(query));
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || !window.matchMedia('(pointer: fine)').matches) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty('--tilt-x', `${y * -4}deg`);
    stage.style.setProperty('--tilt-y', `${x * 5}deg`);
    stage.style.setProperty('--glow-x', `${50 + x * 30}%`);
    stage.style.setProperty('--glow-y', `${50 + y * 30}%`);
  };

  const resetPointer = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--tilt-x', '0deg');
    stage.style.setProperty('--tilt-y', '0deg');
    stage.style.setProperty('--glow-x', '52%');
    stage.style.setProperty('--glow-y', '38%');
  };

  return (
    <section ref={heroRef} className="ezy-hero" dir="ltr">
      <div className="ezy-hero__background" aria-hidden="true">
        <div className="ezy-hero__aurora ezy-hero__aurora--a" />
        <div className="ezy-hero__aurora ezy-hero__aurora--b" />
        <div className="ezy-hero__cloud ezy-hero__cloud--a" />
        <div className="ezy-hero__cloud ezy-hero__cloud--b" />
        <div className="ezy-hero__grid" />
      </div>

      <div className="ezy-hero__container">
        <div className="ezy-hero__content">
          <div className="ezy-hero__eyebrow">
            <span className="ezy-hero__eyebrow-dot" />
            {englishCopy(settings.home_hero_eyebrow, 'Better Jobs. A Brighter Future.')}
          </div>

          <h1 className="ezy-hero__title">
            <span>Find the job</span>
            <span>that truly <em>fits</em> you.</span>
          </h1>

          <p className="ezy-hero__lead">
            {englishCopy(
              settings.home_lead,
              'EzyJobs helps you discover the right opportunities based on your skills, experience, language and location — and makes the path to apply easier.',
            )}
          </p>

          <form className={`ezy-search ${focused ? 'is-focused' : ''}`} onSubmit={submitSearch}>
            <div className="ezy-search__fields">
              <div className="ezy-search__field">
                <Search size={18} strokeWidth={1.8} />
                <div>
                  <span>Job title, skill or keyword</span>
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => window.setTimeout(() => setFocused(false), 160)}
                    placeholder="e.g. Graphic Designer, Python, Marketing..."
                    aria-label="Job title, skill or keyword"
                  />
                </div>
                <kbd>/</kbd>
              </div>

              <div className="ezy-search__divider" />

              <div className="ezy-search__field ezy-search__field--location">
                <MapPin size={18} strokeWidth={1.8} />
                <div>
                  <span>Location</span>
                  <input
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    placeholder="Remote / Worldwide / Any"
                    aria-label="Location"
                  />
                </div>
              </div>

              <button type="submit" className="ezy-search__button">
                Search jobs <ArrowRight size={16} />
              </button>
            </div>

            {focused && (
              <div className="ezy-search__popover">
                <div className="ezy-search__popover-title">{q.trim() ? 'LIVE MATCHES' : 'QUICK SEARCH'}</div>
                {q.trim() && liveMatches.length ? (
                  liveMatches.map((job) => (
                    <Link key={job.id} to={'/jobs/' + job.slug} className="ezy-search__result" onMouseDown={(event) => event.preventDefault()}>
                      <span className="ezy-search__result-dot" />
                      <span className="min-w-0 flex-1">
                        <strong>{job.titleOriginal || job.titleAr}</strong>
                        <small>{job.company}</small>
                      </span>
                      <span>View</span>
                    </Link>
                  ))
                ) : (
                  chips.map((chip) => (
                    <button key={chip.label} type="button" className="ezy-search__quick" onMouseDown={(event) => { event.preventDefault(); chooseQuery(chip.query); }}>
                      {chip.icon}<span>{chip.label}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </form>

          <div className="ezy-hero__chips">
            {chips.map((chip) => (
              <button key={chip.label} type="button" className="ezy-hero__chip" onClick={() => chooseQuery(chip.query)}>
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <div className="ezy-hero__stats">
            <div>
              <span className="ezy-hero__stat-icon"><Briefcase size={18} /></span>
              <strong>{jobs.length.toLocaleString()}</strong>
              <small>{englishCopy(settings.home_stat_jobs, 'Job opportunities')}</small>
            </div>
            <i />
            <div>
              <span className="ezy-hero__stat-icon"><Globe2 size={18} /></span>
              <strong>{countryCount.toLocaleString()}</strong>
              <small>{englishCopy(settings.home_stat_countries, 'Countries & regions')}</small>
            </div>
            <i />
            <div>
              <span className="ezy-hero__stat-icon"><Sparkles size={18} /></span>
              <strong>{remoteCount.toLocaleString()}</strong>
              <small>{englishCopy(settings.home_stat_remote, 'Remote opportunities')}</small>
            </div>
          </div>
        </div>

        <div
          ref={stageRef}
          className="ezy-hero__stage"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetPointer}
        >
          <div className="ezy-hero__stage-glow" aria-hidden="true" />
          <div className="ezy-hero__ring ezy-hero__ring--outer" aria-hidden="true" />
          <div className="ezy-hero__ring ezy-hero__ring--inner" aria-hidden="true" />
          <div className="ezy-hero__island-shadow" aria-hidden="true" />
          <div className="ezy-hero__mascot">
            <img src="/hero-mascot-scene.jpg" alt="" draggable={false} />
          </div>

          <div className="ezy-float-card ezy-float-card--marketing">
            <div className="ezy-float-card__icon"><Sparkles size={16} /></div>
            <div><strong>Marketing Specialist</strong><small>Remote · Worldwide</small></div>
            <b>85%</b>
          </div>

          <div className="ezy-float-card ezy-float-card--data">
            <div className="ezy-float-card__icon"><Database size={16} /></div>
            <div><strong>Data Analyst</strong><small>Remote · Worldwide</small></div>
            <b>87%</b>
          </div>

          <div className="ezy-feature-card">
            <div className="ezy-feature-card__top">
              <span className="ezy-feature-card__badge">E</span>
              <div>
                <strong>{featuredTitle}</strong>
                <small>{featuredCompany} · Remote</small>
              </div>
              <b>92%</b>
            </div>
            <div className="ezy-feature-card__chips"><span>Remote</span><span>Skills match</span><span>English B2</span></div>
            <div className="ezy-feature-card__checks">
              <span>✓ Remote work</span>
              <span>✓ Your skills match</span>
              <span>✓ Clear eligibility</span>
            </div>
            <Link to={featured ? '/jobs/' + featured.slug : '/jobs'}>View opportunity <ArrowRight size={13} /></Link>
          </div>

          <div className="ezy-hero__signal-stack" aria-hidden="true">
            <span><Sparkles size={11} /> Skills</span>
            <span><Globe2 size={11} /> Language</span>
            <span><MapPin size={11} /> Location</span>
            <span><Briefcase size={11} /> Experience</span>
          </div>

          <div className="ezy-hero__orbit-dots" aria-hidden="true">
            <i /><i /><i /><i /><i />
          </div>
        </div>
      </div>

      <div className="ezy-hero__categories">
        <div className="ezy-hero__categories-intro">
          <span>EXPLORE OPPORTUNITIES</span>
          <h2>Find your direction<span>.</span></h2>
          <p>Explore jobs by field and move from discovery to the right opportunity with less noise.</p>
        </div>
        <div className="ezy-hero__categories-grid">
          {categoryCards.map(({ category, label, detail, tone }) => (
            <Link key={category.id} to={'/field/' + category.slug} className={`ezy-category-card ezy-category-card--${tone}`}>
              <div className="ezy-category-card__shape" aria-hidden="true"><span /></div>
              <strong>{label}</strong>
              <small>{detail}</small>
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
