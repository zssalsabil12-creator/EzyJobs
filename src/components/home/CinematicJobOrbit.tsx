import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Briefcase, Globe2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import './CinematicJobOrbit.css';

export default function CinematicJobOrbit({ jobs }: { jobs: Job[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const cards = useMemo(() => {
    const source = jobs.filter((job) => job.titleAr).slice(0, 6);
    if (source.length >= 4) return source;
    return [
      ...source,
      {
        id: 'demo-a',
        slug: 'demo',
        titleAr: 'Product Designer',
        company: 'EzyJobs Preview',
        workMode: 'remote',
        eligibility: 'open',
        eligibleRegions: ['worldwide'],
        publishedAt: new Date().toISOString(),
        suitableForStudents: false,
      } as Job,
      {
        id: 'demo-b',
        slug: 'demo',
        titleAr: 'Marketing Specialist',
        company: 'EzyJobs Preview',
        workMode: 'remote',
        eligibility: 'open',
        eligibleRegions: ['worldwide'],
        publishedAt: new Date().toISOString(),
        suitableForStudents: true,
      } as Job,
    ].slice(0, 6);
  }, [jobs]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    let raf = 0;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = Math.max(0, Math.min(1, -rect.top / travel));
      stage.style.setProperty('--orbit-progress', p.toFixed(4));
      if (!reduced) setProgress(p);
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

  const phase = Math.min(cards.length - 1, Math.floor(progress * cards.length));

  return (
    <section id="home-matching" ref={sectionRef} className="cinematic-orbit">
      <div className="cinematic-orbit__pin">
        <div className="mx-auto grid h-full max-w-[1380px] items-center gap-10 px-5 lg:grid-cols-[.78fr_1.22fr] lg:px-10">
          <div className="cinematic-orbit__copy">
            <span className="ez-eyebrow">02 / SPATIAL MATCHING</span>
            <p className="cinematic-orbit__index">0{phase + 1} <span>/</span> 0{cards.length}</p>
            <h2>One opportunity in focus. <em>Every signal behind it.</em></h2>
            <p className="cinematic-orbit__body">
              Instead of a static grid, opportunities move through one spatial layer: freshness, fit, eligibility and the path to apply.
            </p>
            <div className="cinematic-orbit__meta">
              <span><Sparkles size={14} /> Scroll-driven match</span>
              <span><Globe2 size={14} /> Worldwide + local filters</span>
            </div>
            <Link to="/jobs" className="ez-btn ez-btn-primary mt-8 px-6 py-3.5 text-sm">
              Explore all jobs <ArrowUpRight size={15} />
            </Link>
          </div>

          <div ref={stageRef} className="cinematic-orbit__stage">
            <div className="cinematic-orbit__fog" />
            <div className="cinematic-orbit__ring cinematic-orbit__ring--outer" />
            <div className="cinematic-orbit__ring cinematic-orbit__ring--inner" />
            <div className="cinematic-orbit__axis" />

            {cards.map((job, index) => (
              <article
                key={job.id + index}
                className={`cinematic-job-card ${index === phase ? 'is-active' : ''}`}
                style={{ ['--i' as string]: index, ['--count' as string]: cards.length }}
              >
                <div className="cinematic-job-card__glare" />
                <div className="cinematic-job-card__top">
                  <span className="cinematic-job-card__icon"><Briefcase size={17} /></span>
                  <span className="cinematic-job-card__match">{index === phase ? '92% MATCH' : index % 2 ? '87% MATCH' : '84% MATCH'}</span>
                </div>
                <h3>{job.titleOriginal || job.titleAr}</h3>
                <p>{job.company || 'Global Opportunity'} · Remote · Worldwide</p>
                <div className="cinematic-job-card__chips">
                  <span>Remote</span>
                  <span>{job.suitableForStudents ? 'Students' : 'Open level'}</span>
                </div>
                <Link to={'/jobs/' + job.slug} className="cinematic-job-card__cta">View opportunity <ArrowUpRight size={14} /></Link>
              </article>
            ))}

            <div className="cinematic-orbit__center">
              <span>LIVE INDEX</span>
              <strong>92</strong>
              <small>MATCH</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
