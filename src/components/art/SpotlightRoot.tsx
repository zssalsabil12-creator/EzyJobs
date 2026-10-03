import { useEffect } from 'react';

/**
 * يضيء أي بطاقة .ez-card من الداخل عند موضع المؤشر.
 * مستمع واحد مفوَّض على النافذة — لا تكلفة على كل بطاقة.
 */
export default function SpotlightRoot() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let current: HTMLElement | null = null;

    const onMove = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null;
      const card = el?.closest?.('.ez-card') as HTMLElement | null;
      if (card !== current) {
        current?.classList.remove('lit');
        current = card;
        current?.classList.add('lit');
      }
      if (current) {
        const r = current.getBoundingClientRect();
        current.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        current.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }
    };

    const onLeave = () => {
      current?.classList.remove('lit');
      current = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      current?.classList.remove('lit');
    };
  }, []);

  return null;
}
