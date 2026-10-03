import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import './SpatialDiscovery.css';

type Props = { jobs: Job[] };

const NODES = [
  [12, 20], [25, 11], [41, 18], [58, 9], [77, 18], [90, 28],
  [8, 42], [20, 34], [34, 42], [51, 31], [67, 39], [84, 43],
  [15, 64], [29, 56], [45, 65], [60, 54], [76, 63], [91, 58],
  [21, 82], [38, 88], [54, 79], [70, 88], [84, 78], [93, 89],
] as const;

const STEPS = [
  {
    eyebrow: '01 / DISCOVER',
    title: 'Start from intent, not thousands of results.',
    body: 'Your search becomes a compact map of work style, location, seniority and the constraints that actually matter to you.',
  },
  {
    eyebrow: '02 / FILTER',
    title: 'Noise fades. Relevant opportunities stay.',
    body: 'Instead of showing everything we can find, the experience elevates eligibility and roles that fit your profile.',
  },
  {
    eyebrow: '03 / MATCH',
    title: 'See why a role deserves your time.',
    body: 'The result is more than a number: location, experience, language and the original application source stay visible.',
  },
] as const;

export default function SpatialDiscovery({ jobs }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

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
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      stage.style.setProperty('--spatial-progress', progress.toFixed(4));

      if (!reduced) {
        const next = Math.min(2, Math.floor(progress * 3.05));
        if (next !== activeRef.current) {
          activeRef.current = next;
          setActive(next);
        }
      }
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

  const featured = jobs.find((job) => job.eligibility === 'open') ?? jobs[0];
  const jobTitle = featured?.titleOriginal || 'Customer Support Specialist';
  const source = featured?.company || 'EzyJobs Intelligence';

  return (
    <section id="home-spatial" ref={sectionRef} className="spatial-discovery">
      <div className="spatial-discovery__pin">
        <div className="mx-auto grid h-full max-w-[1380px] items-center gap-10 px-5 lg:grid-cols-[.78fr_1.22fr] lg:px-10">
          <div className="spatial-story">
            <div className="ez-eyebrow">JOB INTELLIGENCE / SCROLL STORY</div>
            <div className="mt-5 max-w-xl">
              <p className="spatial-story__counter">0{active + 1} <span>/</span> 03</p>
              <h2 className="spatial-story__title">{STEPS[active].title}</h2>
              <p className="spatial-story__body">{STEPS[active].body}</p>
            </div>
            <div className="spatial-story__steps" role="tablist" aria-label="Job discovery stages">
              {STEPS.map((step, index) => (
                <button
                  key={step.eyebrow}
                  type="button"
                  onClick={() => {
                    const section = sectionRef.current;
                    if (!section) return;
                    const start = window.scrollY + section.getBoundingClientRect().top;
                    const travel = section.offsetHeight - window.innerHeight;
                    const target = start + (travel * (index / 3));
                    window.scrollTo({ top: target, behavior: 'smooth' });
                  }}
                  className={active === index ? 'is-active' : ''}
                  role="tab"
                  aria-selected={active === index}
                >
                  <span>{step.eyebrow}</span>
                  <i />
                </button>
              ))}
            </div>
            <Link to="/jobs" className="ez-btn ez-btn-ghost mt-8 inline-flex px-5 py-3 text-sm">Explore all jobs</Link>
          </div>

          <div ref={stageRef} className="spatial-stage">
            <div className="spatial-stage__ambient" />
            <div className="spatial-grid" />
            <div className="spatial-orbit spatial-orbit--a" />
            <div className="spatial-orbit spatial-orbit--b" />
            <div className="spatial-core">
              <span className="spatial-core__label">EZY / SIGNAL</span>
              <strong>92%</strong>
              <small>MATCH</small>
            </div>
            <div className="spatial-node-cloud" aria-hidden="true">
              {NODES.map(([left, top], index) => <span key={index} style={{ left: left + '%', top: top + '%' }} />)}
            </div>
            <div className="spatial-filter spatial-filter--remote">REMOTE</div>
            <div className="spatial-filter spatial-filter--student">STUDENTS</div>
            <div className="spatial-filter spatial-filter--geo">WORLDWIDE</div>
            <div className="spatial-match-card">
              <span className="hero-mono">LIVE MATCH</span>
              <strong>{jobTitle}</strong>
              <small>{source} · Remote · Worldwide</small>
              <div><b>92%</b><span>Profile fit</span></div>
            </div>
            <div className="spatial-footnote">The interface moves with you — not against you.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
