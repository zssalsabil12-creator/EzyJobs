import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  Database,
  Globe2,
  GraduationCap,
  Headphones,
  MapPin,
  Search,
  Sparkles,
  UserRound,
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

type QuickChip = {
  label: string;
  query: string;
  icon: React.ReactNode;
};

const defaultChips: QuickChip[] = [
  { label: 'عن بُعد', query: 'remote', icon: <Globe2 size={13} /> },
  { label: 'للطلاب', query: 'students', icon: <GraduationCap size={13} /> },
  { label: 'بدون خبرة', query: 'no experience', icon: <UserRound size={13} /> },
  { label: 'خدمة عملاء', query: 'customer support', icon: <Headphones size={13} /> },
  { label: 'إدخال بيانات', query: 'data entry', icon: <Database size={13} /> },
  { label: 'الذكاء الاصطناعي', query: 'ai', icon: <Sparkles size={13} /> },
];

export default function EzyHero({ q, setQ, jobs, settings }: Props) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
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

  // 2027: cinematic 3D tilt — the hero stage follows the pointer in space.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const stage = hero.querySelector('.ezy-hero__stage') as HTMLElement | null;
    if (!stage) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      targetY = px * 9;   // rotateY deg
      targetX = -py * 6;  // rotateX deg
      stage.style.setProperty('--glow-x', `${(52 + px * 26).toFixed(1)}%`);
      stage.style.setProperty('--glow-y', `${(38 + py * 22).toFixed(1)}%`);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const loop = () => {
      currentX += (targetX - currentX) * 0.07;
      currentY += (targetY - currentY) * 0.07;
      stage.style.setProperty('--tilt-x', `${currentX.toFixed(2)}deg`);
      stage.style.setProperty('--tilt-y', `${currentY.toFixed(2)}deg`);
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    hero.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  const chips = useMemo<QuickChip[]>(() => {
    const configured = settings.home_search_chips
      ?.split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean) ?? [];
    return configured.length
      ? configured.slice(0, 6).map((label) => ({ label, query: label, icon: <Sparkles size={13} /> }))
      : defaultChips;
  }, [settings.home_search_chips]);

  const liveMatches = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return filterJobs(jobs, { ...emptyFilters, q: term, sort: 'relevance' }).slice(0, 4);
  }, [jobs, q]);

  const categoryCards = useMemo(() => {
    const counts = new Map<string, number>();
    for (const job of jobs) counts.set(job.category, (counts.get(job.category) ?? 0) + 1);

    const presets = [
      ['development', 'التقنية', 'برمجة · ذكاء اصطناعي · بيانات', 'blue'],
      ['marketing', 'الأعمال', 'تسويق · مبيعات · تشغيل', 'mint'],
      ['design', 'الإبداع', 'تصميم · كتابة · محتوى', 'violet'],
      ['support', 'الدعم', 'خدمة عملاء · مساعد افتراضي', 'sky'],
      ['education', 'الطلاب', 'تدريب · بدايات مهنية', 'green'],
    ] as const;

    return presets.map(([id, label, detail, tone]) => {
      const category = CATEGORIES.find((item) => item.id === id);
      if (!category) return null;
      return {
        category,
        label,
        detail,
        tone,
        count: counts.get(category.id) ?? 0,
      };
    }).filter(Boolean) as Array<{
      category: (typeof CATEGORIES)[number];
      label: string;
      detail: string;
      tone: string;
      count: number;
    }>;
  }, [jobs]);

  const featured = jobs.find((job) => job.eligibility === 'open') ?? jobs[0];
  const featuredTitle = featured?.titleAr || 'أخصائي دعم عملاء';
  const featuredCompany = featured?.company || 'فرصة عالمية';

  const countryCount = useMemo(
    () => new Set(jobs.flatMap((job) => job.eligibleRegions).filter(Boolean)).size,
    [jobs],
  );
  const remoteCount = useMemo(() => jobs.filter((job) => job.workMode === 'remote').length, [jobs]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (locationQuery.trim()) params.set('location', locationQuery.trim());
    navigate('/jobs' + (params.toString() ? '?' + params.toString() : ''));
  };

  const chooseQuery = (query: string) => {
    setQ(query);
    navigate('/jobs?q=' + encodeURIComponent(query));
  };

  return (
    <section ref={heroRef} className="ezy-hero" dir="rtl">
      <div className="ezy-hero__background" aria-hidden="true">
        <div className="ezy-hero__aurora ezy-hero__aurora--a" />
        <div className="ezy-hero__aurora ezy-hero__aurora--b" />
        <div className="ezy-hero__cloud ezy-hero__cloud--a" />
        <div className="ezy-hero__cloud ezy-hero__cloud--b" />
      </div>

      <div className="ezy-hero__container">
        <div className="ezy-hero__content">
          <div className="ezy-hero__eyebrow">
            <span className="ezy-hero__eyebrow-dot" />
            {settings.home_hero_eyebrow?.trim() || 'فرص أفضل. مستقبل أكثر وضوحاً.'}
          </div>

          <h1 className="ezy-hero__title">
            <span>اكتشف الوظيفة</span>
            <span>التي <em>تناسبك</em> فعلاً.</span>
          </h1>

          <p className="ezy-hero__subtitle">لا تكتفي بعرض الوظائف. افهمها، وقارنها، واعرف فرصتك قبل أن تتقدم.</p>

          <p className="ezy-hero__lead">
            {settings.home_lead?.trim() || 'نجمع الوظائف من المصادر الموثوقة، نترجمها ونبسطها، ثم نوضح لك الأهلية والخبرة واللغة والموقع قبل التقديم.'}
          </p>

          <form className={`ezy-search ${focused ? 'is-focused' : ''}`} onSubmit={submitSearch}>
            <div className="ezy-search__fields">
              <label className="ezy-search__field">
                <Search size={18} strokeWidth={1.8} />
                <span>
                  <small>ما الوظيفة التي تبحث عنها؟</small>
                  <input
                    ref={inputRef}
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => window.setTimeout(() => setFocused(false), 160)}
                    placeholder="مثال: خدمة عملاء، تصميم، إدخال بيانات"
                    aria-label="ابحث عن وظيفة"
                  />
                </span>
                <kbd>/</kbd>
              </label>

              <span className="ezy-search__divider" aria-hidden="true" />

              <label className="ezy-search__field ezy-search__field--location">
                <MapPin size={18} strokeWidth={1.8} />
                <span>
                  <small>الموقع</small>
                  <input
                    value={locationQuery}
                    onChange={(event) => setLocationQuery(event.target.value)}
                    placeholder="عن بُعد / حول العالم / أي مكان"
                    aria-label="الموقع"
                  />
                </span>
              </label>

              <button type="submit" className="ezy-search__button">
                ابحث عن الوظائف
                <ArrowLeft size={16} />
              </button>
            </div>

            {focused && (
              <div className="ezy-search__popover">
                <div className="ezy-search__popover-title">
                  {q.trim() ? 'نتائج مطابقة مباشرة' : 'ابدأ بسرعة'}
                </div>

                {q.trim() && liveMatches.length > 0 ? (
                  liveMatches.map((job) => (
                    <Link
                      key={job.id}
                      to={'/jobs/' + job.slug}
                      className="ezy-search__result"
                      onMouseDown={(event) => event.preventDefault()}
                    >
                      <span className="ezy-search__result-dot" />
                      <span className="min-w-0 flex-1">
                        <strong>{job.titleAr}</strong>
                        <small>{job.company}</small>
                      </span>
                      <span>عرض</span>
                    </Link>
                  ))
                ) : (
                  <div className="ezy-search__quick-grid">
                    {chips.map((chip) => (
                      <button
                        key={chip.label}
                        type="button"
                        className="ezy-search__quick"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          chooseQuery(chip.query);
                        }}
                      >
                        {chip.icon}
                        <span>{chip.label}</span>
                      </button>
                    ))}
                  </div>
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
              <span className="ezy-hero__stat-icon"><Briefcase size={17} /></span>
              <strong>{jobs.length.toLocaleString('ar-DZ')}</strong>
              <small>فرصة مفهرسة</small>
            </div>
            <i />
            <div>
              <span className="ezy-hero__stat-icon"><Globe2 size={17} /></span>
              <strong>{countryCount.toLocaleString('ar-DZ')}</strong>
              <small>دولة ومنطقة</small>
            </div>
            <i />
            <div>
              <span className="ezy-hero__stat-icon"><Sparkles size={17} /></span>
              <strong>{remoteCount.toLocaleString('ar-DZ')}</strong>
              <small>فرصة عن بُعد</small>
            </div>
          </div>
        </div>

        <div className="ezy-hero__stage-wrap">
          <div className="ezy-hero__stage">
            <div className="ezy-hero__stage-glow" aria-hidden="true" />
            <div className="ezy-hero__ring ezy-hero__ring--outer" aria-hidden="true" />
            <div className="ezy-hero__ring ezy-hero__ring--inner" aria-hidden="true" />

            <div className="ezy-hero__mascot">
              <img src="/hero-mascot-scene.jpg" alt="" draggable={false} />
            </div>

            <div className="ezy-float-card ezy-float-card--marketing">
              <div className="ezy-float-card__icon"><Sparkles size={15} /></div>
              <div><strong>أخصائي تسويق</strong><small>عن بُعد · حول العالم</small></div>
              <b>85%</b>
            </div>

            <div className="ezy-float-card ezy-float-card--data">
              <div className="ezy-float-card__icon"><Database size={15} /></div>
              <div><strong>محلل بيانات</strong><small>عن بُعد · حول العالم</small></div>
              <b>87%</b>
            </div>

            <div className="ezy-feature-card">
              <div className="ezy-feature-card__top">
                <span className="ezy-feature-card__badge">E</span>
                <div>
                  <strong>{featuredTitle}</strong>
                  <small>{featuredCompany} · عن بُعد</small>
                </div>
                <b>92%</b>
              </div>

              <div className="ezy-feature-card__chips">
                <span>عن بُعد</span>
                <span>مطابقة المهارات</span>
                <span>إنجليزية B2</span>
              </div>

              <div className="ezy-feature-card__checks">
                <span>✓ عمل عن بُعد</span>
                <span>✓ مهاراتك متوافقة</span>
                <span>✓ الأهلية واضحة</span>
              </div>

              <Link to={featured ? '/jobs/' + featured.slug : '/jobs'}>
                عرض الفرصة
                <ArrowLeft size={13} />
              </Link>
            </div>

            <div className="ezy-hero__signal-stack" aria-hidden="true">
              <span><Sparkles size={11} /> المهارات</span>
              <span><Globe2 size={11} /> اللغة</span>
              <span><MapPin size={11} /> الموقع</span>
              <span><Briefcase size={11} /> الخبرة</span>
            </div>

            <div className="ezy-hero__orbit-dots" aria-hidden="true">
              <i /><i /><i /><i /><i />
            </div>
          </div>
        </div>
      </div>

      <div className="ezy-hero__categories">
        <div className="ezy-hero__categories-intro">
          <span>استكشف الفرص</span>
          <h2>اعثر على اتجاهك<span>.</span></h2>
          <p>ابدأ من المجال الذي يناسبك، ثم انتقل إلى الفرص الأقرب إلى خبرتك وهدفك.</p>
        </div>

        <div className="ezy-hero__categories-grid">
          {categoryCards.map(({ category, label, detail, tone, count }) => (
            <Link key={category.id} to={'/field/' + category.slug} className={`ezy-category-card ezy-category-card--${tone}`}>
              <div className="ezy-category-card__shape" aria-hidden="true"><span /></div>
              <small>مجال {label}</small>
              <strong>{label}</strong>
              <p>{detail}</p>
              <span className="ezy-category-card__count">{count.toLocaleString('ar-DZ')} فرصة</span>
              <ArrowLeft size={13} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
