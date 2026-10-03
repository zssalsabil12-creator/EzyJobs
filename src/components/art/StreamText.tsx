import { useEffect, useMemo, useRef, useState } from 'react';

/** نص يتدفق كلمةً كلمة عند دخوله الشاشة — إحساس التحليل الحي */
export default function StreamText({
  text,
  className = '',
  chunk = 2,
  interval = 45,
}: {
  text: string;
  className?: string;
  chunk?: number;
  interval?: number;
}) {
  const words = useMemo(() => text.split(' ').filter(Boolean), [text]);
  const [n, setN] = useState(0);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setN(0);
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(words.length);
      return;
    }
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        timer = window.setInterval(() => {
          setN((v) => {
            if (v >= words.length) {
              window.clearInterval(timer);
              return v;
            }
            return Math.min(words.length, v + chunk);
          });
        }, interval);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [words, chunk, interval]);

  const done = n >= words.length;

  return (
    <p ref={ref} className={className}>
      {words.slice(0, n).join(' ')}
      {!done && <span className="stream-caret" aria-hidden />}
    </p>
  );
}
