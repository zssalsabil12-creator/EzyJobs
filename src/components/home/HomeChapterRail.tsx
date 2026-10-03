import { useEffect, useState } from 'react';

const chapters = [
  { id: 'home-jobs', label: 'Discover' },
  { id: 'home-value', label: 'Signal' },
  { id: 'home-spatial', label: 'Explore' },
  { id: 'home-matching', label: 'Match' },
  { id: 'home-students', label: 'Students' },
  { id: 'home-process', label: 'Process' },
  { id: 'home-trust', label: 'Trust' },
  { id: 'home-cta', label: 'Start' },
];

export default function HomeChapterRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const elements = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

        if (!visible[0]) return;
        const index = chapters.findIndex((chapter) => chapter.id === visible[0].target.id);
        if (index >= 0) setActive(index);
      },
      { rootMargin: '-22% 0px -58% 0px', threshold: [0, .2, .5, .8] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <aside className="ezy-chapter-rail" aria-label="Homepage chapters">
      <div className="ezy-chapter-rail__line" />
      {chapters.map((chapter, index) => (
        <a
          key={chapter.id}
          href={'#' + chapter.id}
          className={`ezy-chapter-dot ${active === index ? 'is-active' : ''}`}
          aria-label={chapter.label}
          aria-current={active === index ? 'step' : undefined}
        >
          <span className="ezy-chapter-dot__label">{chapter.label}</span>
          <i />
        </a>
      ))}
    </aside>
  );
}
