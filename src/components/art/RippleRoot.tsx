import { useEffect } from 'react';

/** تموّجة سائلة عند النقر على أي زر .ez-btn — مستمع واحد مفوَّض */
export default function RippleRoot() {
  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.('.ez-btn') as
        | (HTMLElement & { disabled?: boolean })
        | null;
      if (!el || el.disabled) return;
      const r = el.getBoundingClientRect();
      const d = Math.max(r.width, r.height) * 1.15;
      const s = document.createElement('span');
      s.className = 'ez-ripple';
      s.style.width = `${d}px`;
      s.style.height = `${d}px`;
      s.style.left = `${e.clientX - r.left - d / 2}px`;
      s.style.top = `${e.clientY - r.top - d / 2}px`;
      s.addEventListener('animationend', () => s.remove());
      el.appendChild(s);
    };

    window.addEventListener('pointerdown', onDown, { passive: true });
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return null;
}
