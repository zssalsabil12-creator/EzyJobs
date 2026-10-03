import { useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Job } from '../../types';
import Reveal from '../art/Reveal';
import './BentoCategories.css';

const SHOWCASE_ITEMS = [
  {
    title: 'Technology',
    titleAr: 'تكنولوجيا وبرمجة',
    subtitle: 'Software · AI · Data · Cybersecurity',
    to: '/field/development',
    orb: 'blue',
    shape: 'diamond',
  },
  {
    title: 'Business',
    titleAr: 'أعمال وتسويق',
    subtitle: 'Marketing · Sales · Operations',
    to: '/field/marketing',
    orb: 'mint',
    shape: 'gem',
  },
  {
    title: 'Creative',
    titleAr: 'تصميم وإبداع',
    subtitle: 'Design · Writing · Content',
    to: '/field/design',
    orb: 'violet',
    shape: 'flower',
  },
  {
    title: 'Support',
    titleAr: 'خدمة عملاء ودعم',
    subtitle: 'Customer Support · Virtual Assistant',
    to: '/field/customer-support',
    orb: 'sky',
    shape: 'ring',
  },
  {
    title: 'Students',
    titleAr: 'فرص للطلاب',
    subtitle: 'Internships · Entry Level · Flexible',
    to: '/students',
    orb: 'green',
    shape: 'cube',
  },
];

export default function BentoCategories({ jobs }: { jobs: Job[] }) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollRail = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const offset = direction === 'left' ? -320 : 320;
    railRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="bento-direction-section">
      {/* Section Header: Find your direction + Arrows */}
      <div className="bento-direction-header flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <span className="bento-direction-eyebrow">Explore opportunities</span>
          <h2 className="bento-direction-title mt-2">
            Find your <span className="text-gradient">direction</span>.
          </h2>
          <p className="bento-direction-lead mt-2">
            From tech to creative, customer support to data — explore jobs across different fields and find what fits you.
          </p>
        </div>

        {/* Carousel Slider Arrows */}
        <div className="bento-direction-controls flex items-center gap-3" aria-label="تنقل بين المجالات">
          <button
            type="button"
            onClick={() => scrollRail('left')}
            className="bento-arrow-btn"
            aria-label="السابق"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => scrollRail('right')}
            className="bento-arrow-btn"
            aria-label="التالي"
          >
            →
          </button>
        </div>
      </div>

      {/* 5 Bento Category Cards with 3D crystal icons */}
      <div className="category-showcase">
        <div ref={railRef} className="category-showcase__rail">
          {SHOWCASE_ITEMS.map((item, i) => (
            <Reveal key={item.title} delay={i * 80}>
              <Link to={item.to} className="category-card group">
                {/* 3D Art Element */}
                <div className={`category-art category-art--${item.orb}`}>
                  <span className={`category-shape category-shape--${item.shape}`} />
                </div>

                {/* Card Content */}
                <div className="category-card__copy">
                  <span className="category-card-kicker">{item.title}</span>
                  <h3 className="category-card-title">{item.titleAr}</h3>
                  <p className="category-card-sub">{item.subtitle}</p>
                </div>

                {/* Action Arrow */}
                <span className="category-card__arrow">
                  <span>→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
