import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Database,
  Globe2,
  GraduationCap,
  Headphones,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { Job } from '../../types';
import { emptyFilters } from '../../types';
import { filterJobs } from '../../lib/match';
import { CATEGORIES } from '../../data/taxonomy';
import EzyHeroScene from './EzyHeroScene';
import './EzyHeroLegacy.css';

type Props = {
  q: string;
  setQ: (value: string) => void;
  jobs: Job[];
  settings: Record<string, string>;
};

export default function EzyHero({ q, setQ, jobs, settings }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
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
    const stage = stageRef.current;
    if (!stage) return;
    const onScroll = () => {
      const depth = Math.min(42, window.scrollY * 0.08);
      stage.style.setProperty('--stage-y', `${depth}px`);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const defaultChips = [
    { label: 'Remote', icon: <Globe2 size={14} strokeWidth={1.8} />, query: 'remote' },
    { label: 'Students', icon: <GraduationCap size={14} strokeWidth={1.8} />, query: 'students' },
    { label: 'No Experience', icon: <UserRound size={14} strokeWidth={1.8} />, query: 'no experience' },
    { label: 'Customer Support', icon: <Headphones size={14} strokeWidth={1.8} />, query: 'customer support' },
    { label: 'Data Entry', icon: <Database size={14} strokeWidth={1.8} />, query: 'data entry' },
    { label: 'AI', icon: <Sparkles size={14} strokeWidth={1.8} />, query: 'ai' },
  ];

  const englishCopy = (value: string | undefined, fallback: string) => {
    const text = value?.trim();
    return text && !/[\u0600-\u06FF]/.test(text) ? text : fallback;
  };

  const quickQueries = useMemo(() => {
    const configured = settings.home_search_chips
      ?.split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];
    if (configured.length > 0 && configured.every((c) => !/[\u0600-\u06FF]/.test(c))) {
      return configured.map((c) => ({
        label: c,
        icon: <Sparkles size={14} strokeWidth={1.8} />,
        query: c,
      }));
    }
    return defaultChips;
  }, [settings.home_search_chips]);

  const liveMatches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return filterJobs(jobs, { ...emptyFilters, q: term, sort: 'relevance' }).slice(0, 3);
  }, [jobs, q]);

  const countryCount = useMemo(
    () => new Set(jobs.flatMap((job) => job.eligibleRegions).filter((region) => region && region !== 'worldwide')).size,
    [jobs],
  );
  const remoteCount = useMemo(() => jobs.filter((job) => job.workMode === 'remote').length, [jobs]);

  const categoryCards = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of jobs) counts.set(job.category, (counts.get(job.category) ?? 0) + 1);
    const visual = [
      ['tech', 'Technology', 'Software · AI · Data', 'blue'],
      ['business', 'Business', 'Marketing · Sales · Operations', 'mint'],
      ['creative', 'Creative', 'Design · Writing · Content', 'violet'],
      ['support', 'Support', 'Customer Support · Virtual Assistant', 'sky'],
      ['students', 'Students', 'Internships · Entry Level', 'green'],
    ] as const;
    const ids = ['development', 'marketing', 'design', 'support', 'education'];
    return ids.map((id, index) => {
      const category = CATEGORIES.find((item) => item.id === id);
      const preset = visual[index];
      return category
        ? {
            category,
            title: preset[1],
            detail: preset[2],
            tone: preset[3],
            count: counts.get(category.id) ?? 0,
          }
        : null;
    }).filter(Boolean) as Array<{
      category: (typeof CATEGORIES)[number];
      title: string;
      detail: string;
      tone: string;
      count: number;
    }>;
  }, [jobs]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.setProperty('--rx', `${y * -5}deg`);
    stage.style.setProperty('--ry', `${x * 6}deg`);
    stage.style.setProperty('--mx', `${50 + x * 28}%`);
    stage.style.setProperty('--my', `${50 + y * 28}%`);
  };

  const resetStage = () => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--rx', '0deg');
    stage.style.setProperty('--ry', '0deg');
    stage.style.setProperty('--mx', '50%');
    stage.style.setProperty('--my', '50%');
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const customHeadline = englishCopy(settings.home_headline, '');

  return (
    <section className="home-hero relative overflow-hidden border-b border-line" dir="ltr">
      <div className="home-hero__wash" aria-hidden />
      <div className="home-hero__grid" aria-hidden />
      <div className="mx-auto max-w-[1380px] px-5 pb-[190px] pt-[118px] lg:px-10 lg:pb-[220px] lg:pt-[132px]">
        <div className="grid items-center gap-10 lg:grid-cols-[.98fr_1.02fr] lg:gap-8">
          <div className="max-w-3xl">
            {/* Eyebrow / Kicker */}
            <div className="hero-kicker anim-fade-up">
              <span className="hero-kicker__dot" />
              {englishCopy(settings.home_hero_eyebrow, 'Better Jobs. A Brighter Future.')}
            </div>

            {/* Headline with glowing styled italic emphasis */}
            {customHeadline ? (
              <h1 className="hero-title anim-fade-up stagger-1 mt-7">{customHeadline}</h1>
            ) : (
              <h1 className="hero-title anim-fade-up stagger-1 mt-7">
                Find the job
                <br />
                that truly <span className="hero-title-highlight">fits</span> you.
              </h1>
            )}

            {/* Description */}
            <p className="hero-lead anim-fade-up stagger-2 mt-5">
              {englishCopy(
                settings.home_lead,
                'EzyJobs helps you discover the right opportunities based on your skills, experience, language and location — and makes the path to apply easier.',
              )}
            </p>

            {/* Segmented Dual Search Bar */}
            <form className="hero-search anim-fade-up stagger-3 mt-8" onSubmit={handleSearchSubmit}>
              <div className={`hero-search__shell ${focused ? 'is-focused' : ''}`}>
                {/* Left Field: Job title or keyword */}
                <div className="hero-search__field flex-1 relative">
                  <div className="hero-search__field-inner">
                    <svg className="hero-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <label className="hero-search__label-small">
                        {englishCopy(settings.home_search_input_label, 'Job title, skill or keyword')}
                      </label>
                      <input
                        ref={inputRef}
                        value={q}
                        onChange={(event) => setQ(event.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => window.setTimeout(() => setFocused(false), 150)}
                        placeholder={englishCopy(settings.home_search_placeholder, 'e.g. Graphic Designer, Python, Marketing...')}
                        className="hero-search__input"
                        aria-expanded={focused}
                        aria-controls="ezyjobs-hero-search"
                      />
                    </div>
                    <kbd className="hero-search__kbd">/</kbd>
                  </div>

                  {/* Popover for live matches */}
                  {focused && (
                    <div id="ezyjobs-hero-search" className="hero-search__popover" role="listbox">
                      {q.trim() && liveMatches.length > 0 ? (
                        <>
                          <div className="hero-search__label">نتائج مطابقة مباشرة</div>
                          {liveMatches.map((job) => (
                            <Link
                              key={job.id}
                              to={'/jobs/' + job.slug}
                              onMouseDown={(event) => event.preventDefault()}
                              className="hero-search__result"
                            >
                              <span className="hero-search__result-dot" />
                              <span className="min-w-0 flex-1">
                                <strong>{job.titleAr}</strong>
                                <small>{job.company}</small>
                              </span>
                              <span>عرض</span>
                            </Link>
                          ))}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-1">
                            <span className="hero-search__label !px-0">اقتراحات سريعة</span>
                            <span className="text-[10px] text-muted">{quickQueries.length} مسارات</span>
                          </div>
                          <div className="grid gap-1 sm:grid-cols-2">
                            {quickQueries.map((item) => (
                              <button
                                key={item.label}
                                type="button"
                                onMouseDown={(event) => {
                                  event.preventDefault();
                                  setQ(item.query);
                                  navigate(`/jobs?q=${encodeURIComponent(item.query)}`);
                                }}
                                className="hero-search__quick text-right"
                              >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Vertical Divider */}
                <div className="hero-search__divider" aria-hidden="true" />

                {/* Right Field: Location */}
                <div className="hero-search__field hero-search__field--location flex-1">
                  <div className="hero-search__field-inner">
                    <svg className="hero-search__icon hero-search__icon--location" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 21s-8-7.5-8-12a8 8 0 1 1 16 0c0 4.5-8 12-8 12Z" />
                      <circle cx="12" cy="9" r="2.5" strokeWidth="2" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <label className="hero-search__label-small">
                        {englishCopy(settings.home_location_input_label, 'Location')}
                      </label>
                      <input
                        ref={locationInputRef}
                        value={locationQuery}
                        onChange={(event) => setLocationQuery(event.target.value)}
                        placeholder="Remote / Worldwide / Any"
                        className="hero-search__input"
                      />
                    </div>
                  </div>
                </div>

                {/* Search Action Button */}
                <button
                  type="submit"
                  className="ez-btn ez-btn-primary hero-search__button"
                >
                  <span>{englishCopy(settings.home_search_button, 'Search jobs')}</span>
                  <span>→</span>
                </button>
              </div>

              {/* Quick Filter Chips Underneath */}
              <div className="hero-search__chips mt-4">
                {quickQueries.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setQ(item.query);
                      navigate(`/jobs?q=${encodeURIComponent(item.query)}`);
                    }}
                    className="hero-search__chip group"
                  >
                    <span className="hero-chip-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </form>

            {/* Social Proof & Platform Statistics */}
            <div className="hero-stats-panel anim-fade-up stagger-4 mt-10">
              <div className="hero-stats-eyebrow">BUILT FOR BETTER MATCHES</div>
              <div className="hero-stats-grid">
                <div className="hero-stat-item">
                  <div className="hero-stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="hero-stat-num">{jobs.length.toLocaleString()}</div>
                    <div className="hero-stat-label">{englishCopy(settings.home_stat_jobs, 'Job opportunities')}</div>
                  </div>
                </div>

                <div className="hero-stat-divider" aria-hidden="true" />

                <div className="hero-stat-item">
                  <div className="hero-stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <div className="hero-stat-num">{countryCount.toLocaleString()}</div>
                    <div className="hero-stat-label">{englishCopy(settings.home_stat_countries, 'Countries & regions')}</div>
                  </div>
                </div>

                <div className="hero-stat-divider" aria-hidden="true" />

                <div className="hero-stat-item">
                  <div className="hero-stat-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="hero-stat-num">{remoteCount.toLocaleString()}</div>
                    <div className="hero-stat-label">{englishCopy(settings.home_stat_remote, 'Remote opportunities')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Animated Hero Scene */}
          <div className="anim-fade-up stagger-4">
            <EzyHeroScene
              jobs={jobs}
              stageRef={stageRef}
              onPointerMove={handlePointerMove}
              onPointerLeave={resetStage}
            />
          </div>
        </div>
      </div>
      <div className="hero-scroll-cue" aria-hidden="true">
        <span>Scroll to explore</span>
        <i />
      </div>

      <div className="hero-category-dock" aria-label="Explore opportunities">
        <div className="hero-category-dock__intro">
          <span>EXPLORE OPPORTUNITIES</span>
          <strong>Find your direction<span className="hero-direction-dot">.</span></strong>
          <p>From tech to creative, customer support to data — explore jobs across different fields and find what fits you.</p>
        </div>
        <div className="hero-category-dock__cards">
          {categoryCards.map(({ category, title, detail, tone, count }) => (
            <Link key={category.id} to={`/field/${category.slug}`} className={`hero-category-card hero-category-card--${tone}`}>
              <span className="hero-category-card__meta">{category.latin}</span>
              <div className="hero-category-card__art" aria-hidden="true">
                <span />
              </div>
              <div className="hero-category-card__body">
                <h3>{title}</h3>
                <p>{detail}</p>
                <small><b>{count}</b> indexed roles</small>
              </div>
              <span className="hero-category-card__arrow">↗</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
