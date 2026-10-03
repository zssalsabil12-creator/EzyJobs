import { useEffect, useRef } from 'react';

export default function CreativeField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer:fine)').matches;

    let raf = 0;
    const root = document.documentElement;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 100;
        const y = (event.clientY / window.innerHeight) * 100;
        node.style.setProperty('--cx', x.toFixed(2) + '%');
        node.style.setProperty('--cy', y.toFixed(2) + '%');
        root.style.setProperty('--light-x', x.toFixed(2) + '%');
        root.style.setProperty('--light-y', y.toFixed(2) + '%');
      });
    };
    const scroll = () => root.style.setProperty('--scroll-depth', reduced ? '0' : Math.min(1, window.scrollY / 2400).toFixed(3));

    scroll();
    if (!reduced && fine) window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true });
    return () => {
      if (!reduced && fine) window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', scroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="creative-field" aria-hidden>
      <span className="creative-field__wash creative-field__wash--blue" />
      <span className="creative-field__wash creative-field__wash--mint" />
      <span className="creative-field__beam creative-field__beam--one" />
      <span className="creative-field__beam creative-field__beam--two" />
      <span className="creative-field__ring creative-field__ring--one" />
      <span className="creative-field__ring creative-field__ring--two" />
      <span className="creative-field__cursor" />
      <span className="creative-field__grain" />
    </div>
  );
}
