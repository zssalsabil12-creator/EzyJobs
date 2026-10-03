import { useRef, type ReactNode } from 'react';

/** عنصر ينجذب قليلاً نحو المؤشر ثم يرتد — للأزرار الرئيسية على الشاشات الدقيقة */
export default function Magnetic({
  children,
  strength = 7,
  className = 'magnetic',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const fine = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || !fine()) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const dist = Math.max(1, Math.hypot(dx, dy));
    const pull = Math.min(1, 120 / dist);
    el.style.transition = 'transform 0.12s ease-out';
    el.style.transform = `translate3d(${(dx / dist) * strength * pull}px, ${(dy / dist) * strength * pull}px, 0)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'transform 0.45s cubic-bezier(0.22,1,0.36,1)';
    el.style.transform = 'translate3d(0,0,0)';
  };

  return (
    <span ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </span>
  );
}
