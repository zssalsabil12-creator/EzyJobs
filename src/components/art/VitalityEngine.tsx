import { useEffect } from 'react';

/**
 * VitalityEngine — محرك الحيوية 2027
 * يقود متغيرات CSS العالمية التي تُبقي الصفحة "حية":
 *  - --ezy-page-progress : تقدم التمرير (0..1)
 *  - --ezy-scroll-vel    : سرعة التمرير اللحظية (مخمّدة، ~0..30)
 *  - --ezy-hero-shift    : إزاحة البطل البارالاكسية (px)
 * كما يغذي بطاقات الـ spotlight بأحداث المؤشر عبر حدث مخصص واحد.
 */
export default function VitalityEngine() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    let raf = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let heroShift = 0;

    const loop = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      // velocity: smoothed absolute delta, capped for sane transforms
      vel += (Math.min(Math.abs(dy), 60) - vel) * 0.18;
      if (vel < 0.4) vel = 0;

      const max = Math.max(1, root.scrollHeight - window.innerHeight);
      root.style.setProperty('--ezy-page-progress', (y / max).toFixed(4));
      root.style.setProperty('--ezy-scroll-vel', vel.toFixed(2));

      // hero parallax shift (only while hero is on screen)
      const hero = document.querySelector('.ezy-hero');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        heroShift += ((rect.bottom > -200 ? Math.max(0, -rect.top) : 0) - heroShift) * 0.14;
        root.style.setProperty('--ezy-hero-shift', heroShift.toFixed(1));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // spotlight coordinates for cards & magnetic buttons (single global listener)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let moveRaf = 0;
    let pending: PointerEvent | null = null;

    const applySpotlight = (event: PointerEvent) => {
      const el = (event.target as HTMLElement | null)?.closest?.(
        '.ezy-value-card, .step-glass, .ezy-transparency-card, .ez-btn-primary, .ezy-category-card',
      ) as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const gx = (((event.clientX - r.left) / r.width) * 100).toFixed(1);
      const gy = (((event.clientY - r.top) / r.height) * 100).toFixed(1);
      el.style.setProperty('--gx', `${gx}%`);
      el.style.setProperty('--gy', `${gy}%`);
      el.style.setProperty('--mx', `${gx}%`);
      el.style.setProperty('--my', `${gy}%`);
    };

    const onMove = (event: PointerEvent) => {
      if (reduced || coarse || event.pointerType === 'touch') return;
      pending = event;
      if (!moveRaf) {
        moveRaf = requestAnimationFrame(() => {
          moveRaf = 0;
          if (pending) applySpotlight(pending);
        });
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      if (moveRaf) cancelAnimationFrame(moveRaf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div className="ezy-ambient-field" aria-hidden="true">
      <span className="ezy-ambient-orb ezy-ambient-orb--a" />
      <span className="ezy-ambient-orb ezy-ambient-orb--b" />
      <span className="ezy-ambient-orb ezy-ambient-orb--c" />
    </div>
  );
}
