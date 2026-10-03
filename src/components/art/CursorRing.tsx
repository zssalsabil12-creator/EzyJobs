import { useEffect, useRef } from 'react';

/** حلقة مؤشر دقيقة: نقطة ذهبية + حلقة تتبع ببطء وتتسع فوق العناصر التفاعلية */
export default function CursorRing() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dp = { x: -100, y: -100 };
    const rp = { x: -100, y: -100 };
    const t = { x: -100, y: -100 };
    let raf = 0;
    let alive = true;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      t.x = e.clientX;
      t.y = e.clientY;
      if (!shown) {
        shown = true;
        d.style.opacity = '1';
        r.style.opacity = '1';
      }
      const interactive = (e.target as HTMLElement | null)?.closest?.(
        'a, button, input, select, textarea, [role="button"]',
      );
      r.dataset.hot = interactive ? '1' : '';
    };

    const loop = () => {
      if (!alive) return;
      dp.x += (t.x - dp.x) * 0.4;
      dp.y += (t.y - dp.y) * 0.4;
      rp.x += (t.x - rp.x) * 0.16;
      rp.y += (t.y - rp.y) * 0.16;
      d.style.transform = `translate3d(${dp.x}px, ${dp.y}px, 0) translate(-50%,-50%)`;
      const s = r.dataset.hot ? 1.7 : 1;
      r.style.transform = `translate3d(${rp.x}px, ${rp.y}px, 0) translate(-50%,-50%) scale(${s})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    loop();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <>
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full"
        style={{
          opacity: 0,
          background: '#61a4ff',
          boxShadow: '0 0 12px rgba(47,100,214,0.72), 0 0 18px rgba(42,168,132,0.32)',
          transition: 'opacity 0.4s ease',
        }}
      />
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] h-8 w-8 rounded-full"
        style={{
          opacity: 0,
          border: '1px solid rgba(47,100,214,0.48)',
          transition: 'opacity 0.4s ease, border-color 0.25s ease',
        }}
      />
    </>
  );
}
