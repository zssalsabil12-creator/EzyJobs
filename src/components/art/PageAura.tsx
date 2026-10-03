import { useEffect, useRef } from 'react';

/**
 * هالة حية لرؤوس الصفحات: شبكة + توهجات ذهبية/ياقوتية منزلقة
 * + كرات زجاجية عائمة بتأثير parallax خفيف مع التمرير.
 */
export default function PageAura({ dense = false }: { dense?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el || !el.parentElement) return;
      const r = el.parentElement.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // يتحرك فقط أثناء مرور الرأس في الشاشة
      if (r.bottom > -100 && r.top < vh + 100) {
        const p = Math.max(-140, Math.min(140, -r.top * 0.14));
        el.style.setProperty('--px', `${p.toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="ez-grid absolute inset-0 opacity-70" />
      <div
        className="anim-drift absolute -top-32 right-[8%] h-[380px] w-[520px] rounded-full opacity-25 blur-[110px]"
        style={{ background: 'radial-gradient(circle, #8a6a2f 0%, transparent 70%)' }}
      />
      <div
        className="anim-drift absolute -bottom-40 left-[4%] h-[320px] w-[420px] rounded-full opacity-25 blur-[110px]"
        style={{
          background: 'radial-gradient(circle, #3a5696 0%, transparent 70%)',
          animationDelay: '-7s',
        }}
      />
      {dense && (
        <div
          className="anim-drift absolute right-[42%] top-[10%] h-[200px] w-[300px] rounded-full opacity-[0.14] blur-[90px]"
          style={{
            background: 'radial-gradient(circle, #c98a6d 0%, transparent 70%)',
            animationDelay: '-3s',
          }}
        />
      )}
      {/* طبقة parallax البطيئة */}
      <div
        className="absolute inset-0"
        style={{ transform: 'translate3d(0, var(--px, 0px), 0)' }}
      >
        <div
          className="glass-orb anim-breathe left-[10%] top-[6%] h-[130px] w-[130px]"
          style={{ ['--orb' as string]: 'rgba(212,175,106,0.16)', ['--breathe-max' as string]: 0.8 }}
        />
        <div
          className="glass-orb anim-breathe right-[16%] top-[46%] h-[86px] w-[86px]"
          style={{
            ['--orb' as string]: 'rgba(224,165,140,0.16)',
            ['--breathe-max' as string]: 0.7,
            animationDelay: '-4.5s',
          }}
        />
      </div>
    </div>
  );
}
