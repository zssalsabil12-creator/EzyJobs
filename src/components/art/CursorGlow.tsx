import { useEffect, useRef } from 'react';

/** توهج محيطي يتبع المؤشر — للشاشات بمؤشر دقيق فقط، ويحترم تقليل الحركة */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = { x: -600, y: -600 };
    const pos = { x: -600, y: -600 };
    let raf = 0;
    let alive = true;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!shown) {
        shown = true;
        el.style.opacity = '1';
      }
    };

    const loop = () => {
      if (!alive) return;
      pos.x += (target.x - pos.x) * 0.1;
      pos.y += (target.y - pos.y) * 0.1;
      el.style.transform = `translate3d(${pos.x - 260}px, ${pos.y - 260}px, 0)`;
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
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden h-[520px] w-[520px] rounded-full [@media(pointer:fine)]:block"
      style={{
        opacity: 0,
        background:
          'radial-gradient(circle, rgba(47,100,214,0.13) 0%, rgba(42,168,132,0.07) 35%, transparent 65%)',
        mixBlendMode: 'screen',
        transition: 'opacity 0.8s ease',
      }}
    />
  );
}
