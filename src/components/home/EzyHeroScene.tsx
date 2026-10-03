import { Link } from 'react-router-dom';
import { Briefcase, Languages, MapPin, Sparkles } from 'lucide-react';
import type { Job } from '../../types';

type Props = {
  jobs: Job[];
  stageRef: { current: HTMLDivElement | null };
  onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
  onPointerLeave: () => void;
};

export default function EzyHeroScene({ jobs, stageRef, onPointerMove, onPointerLeave }: Props) {
  const featured = jobs.find((job) => job.eligibility === 'open') ?? jobs[0];
  const title = featured?.titleAr || 'أخصائي دعم عملاء';
  const company = featured?.company || 'Global Opportunity';

  return (
    <div
      ref={stageRef}
      className="hero-stage-wrap"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero-stage hero-world">
        {/* Sky ambience */}
        <div className="hero-world__sky" />
        <div className="hero-cloud hero-cloud--a" />
        <div className="hero-cloud hero-cloud--b" />

        {/* 3D Centerpiece Artwork: Island, Cute Robot Mascot with Laptop, Companion & Horizon */}
        <div className="hero-artwork-frame" aria-hidden="true">
          <img
            src="/hero-mascot-scene.jpg"
            alt="EzyJobs 3D Mascot on Floating Island"
            className="hero-artwork-img"
            loading="eager"
            decoding="async"
          />
          {/* Subtle blend vignette to merge with surrounding sky gradient */}
          <div className="hero-artwork-mask" />
        </div>

        {/* Floating Glassmorphic 3D Card 1: Marketing Specialist */}
        <div className="hero-floating-card hero-floating-card--marketing">
          <div className="hero-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div className="hero-card-body">
            <span className="hero-card-title">Marketing Specialist</span>
            <span className="hero-card-sub">Remote · Worldwide</span>
          </div>
          <span className="hero-match-pill">85%</span>
        </div>

        {/* Floating Glassmorphic 3D Card 2: Data Analyst */}
        <div className="hero-floating-card hero-floating-card--data">
          <div className="hero-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="hero-card-body">
            <span className="hero-card-title">Data Analyst</span>
            <span className="hero-card-sub">Remote · Worldwide</span>
          </div>
          <span className="hero-match-pill">87%</span>
        </div>

        {/* Floating Glassmorphic 3D Card 3 (Prominent Highlight Card): Product Designer */}
        <div className="hero-fit-card hero-fit-card--featured">
          <div className="hero-fit-header">
            <div className="hero-fit-brand-badge">
              <span>H</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="hero-fit-title font-bold text-ink">Product Designer</span>
                <span className="hero-fit-match-badge">92% Match</span>
              </div>
              <span className="hero-fit-sub">Remote · Worldwide</span>
            </div>
          </div>

          <div className="hero-fit-tags">
            <span>Design</span>
            <span>Figma</span>
            <span>English B2</span>
          </div>

          <div className="hero-fit-checkmarks">
            <div className="hero-fit-check-item">
              <i>✓</i>
              <span>Remote work</span>
            </div>
            <div className="hero-fit-check-item">
              <i>✓</i>
              <span>Your skills match</span>
            </div>
            <div className="hero-fit-check-item">
              <i>✓</i>
              <span>No previous experience required</span>
            </div>
          </div>

          <Link to="/jobs" className="hero-fit-action-btn">
            <span>View opportunity</span>
            <span>→</span>
          </Link>
        </div>

        {/* Floating Skill Stack Pills on the right edge */}
        <div className="hero-skill-stack" aria-hidden="true">
          <span className="skill-pill">
            <i className="pill-icon"><Sparkles size={10} strokeWidth={2} /></i> Skills
          </span>
          <span className="skill-pill">
            <i className="pill-icon"><Languages size={10} strokeWidth={2} /></i> Language
          </span>
          <span className="skill-pill">
            <i className="pill-icon"><MapPin size={10} strokeWidth={2} /></i> Location
          </span>
          <span className="skill-pill">
            <i className="pill-icon"><Briefcase size={10} strokeWidth={2} /></i> Experience
          </span>
        </div>

        {/* Floating Video Preview Card on bottom right */}
        <div className="hero-video-card" aria-hidden="true">
          <div className="hero-video-thumb">
            <div className="hero-video-play-btn">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-0.5">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Floating Live Job Pill from Database */}
        <div className="hero-job-pill-live">
          <span className="live-pulse" />
          <span className="truncate max-w-[140px] font-bold text-ink">{title}</span>
          <span className="text-[10px] text-muted">({company})</span>
          <Link to="/jobs" className="text-brand-700 font-bold text-[11px] hover:underline">
            عرض
          </Link>
        </div>
      </div>
    </div>
  );
}
