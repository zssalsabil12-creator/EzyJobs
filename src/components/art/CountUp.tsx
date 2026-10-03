import { useEffect, useRef, useState } from 'react';

/** عدّاد يتصاعد عند دخوله الشاشة — للأرقام الإحصائية */
export default function CountUp({
  value,
  duration = 1300,
  suffix = '',
  className = 'tnum',
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (done.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value);
      done.current = true;
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        const t0 = performance.now();
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / duration);
          const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setN(value * eased);
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        io.disconnect();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {Math.round(n).toLocaleString('en-US')}
      {suffix}
    </span>
  );
}
