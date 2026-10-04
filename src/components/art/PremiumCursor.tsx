import { useEffect, useRef } from 'react';

/**
 * PremiumCursor — مؤشر 2027 فاخر:
 *  - نقطة دقيقة تتبع الفأرة فورياً
 *  - حلقة زجاجية بتأخير مرن (lerp) تتفاعل مع العناصر القابلة للنقر
 *  - هالة ضوء خفيفة خلف المؤشر
 * يُعطّل تلقائياً على الأجهزة اللمسية و prefers-reduced-motion.
 */
export default function PremiumCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const glow = glowRef.current!;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPos = { ...pos };
    let scale = 1;
    let targetScale = 1;
    let visible = false;
    let raf = 0;

    const interactiveSelector =
      'a, button, input, textarea, select, [role="button"], [data-cursor="interactive"]';

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pos.x = event.clientX;
      pos.y = event.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        glow.style.opacity = '1';
      }
      const el = event.target as HTMLElement | null;
      targetScale = el?.closest?.(interactiveSelector) ? 1.9 : 1;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
    };

    const onLeave = () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      glow.style.opacity = '0';
    };

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.16;
      ringPos.y += (pos.y - ringPos.y) * 0.16;
      scale += (targetScale - scale) * 0.14;
      ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%) scale(${scale.toFixed(3)})`;
      glow.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0) translate(-50%, -50%)`;
      ring.style.borderColor = targetScale > 1 ? 'rgba(0, 85, 255, 0.65)' : 'rgba(0, 85, 255, 0.28)';
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="ezy-premium-cursor" aria-hidden="true">
      <div ref={glowRef} className="ezy-premium-cursor__glow" />
      <div ref={ringRef} className="ezy-premium-cursor__ring" />
      <div ref={dotRef} className="ezy-premium-cursor__dot" />
    </div>
  );
}
