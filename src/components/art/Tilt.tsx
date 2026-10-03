import { useRef, type ReactNode } from 'react';

/** إمالة ثلاثية الأبعاد مغناطيسية تتبع المؤشر — للبطاقات على الشاشات الدقيقة */
export default function Tilt({
  children,
  max = 7,
  pull = 0,
  className = 'tilt h-full',
}: {
  children: ReactNode;
  max?: number;
  /** انجذاب بالبكسل نحو المؤشر */
  pull?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const fine = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !fine()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = 'transform 0.12s ease-out';
    el.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg) translate3d(${px * pull}px, ${py * pull}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.6s cubic-bezier(0.22,1,0.36,1)';
    el.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
  };

  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
