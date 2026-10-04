import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';

/**
 * SmoothScroll — طبحة التمرير السلس 2027 للمنصة بالكامل.
 * يعتمد على Lenis مع تحديث متغير --ezy-page-progress عالمياً،
 * ويحترم prefers-reduced-motion، ويتكامل مع react-router عبر
 * إعادة التمرير الفوري عند تغيير المسار.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      anchors: false,
    });
    lenisRef.current = lenis;
    (window as unknown as { __ezyLenis?: Lenis }).__ezyLenis = lenis;

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      document.documentElement.style.setProperty('--ezy-page-progress', String(window.scrollY / max));
    };
    lenis.on('scroll', onScroll);
    onScroll();

    // تمرير فوري عند تغيير الصفحة (react-router scroll restoration)
    const instantTo = (top: number) => {
      lenis.scrollTo(top, { immediate: true });
    };
    (window as unknown as { __ezyScrollToTop?: () => void }).__ezyScrollToTop = () => instantTo(0);
    const nativeScrollTo = window.scrollTo.bind(window);
    window.scrollTo = ((...args: unknown[]) => {
      const first = args[0];
      if (typeof first === 'number') {
        instantTo(first);
      } else if (first && typeof first === 'object' && 'top' in first) {
        instantTo((first as { top: number }).top);
      } else {
        (nativeScrollTo as (...a: unknown[]) => void)(...args);
      }
    }) as typeof window.scrollTo;

    // روابط #anchor داخل الصفحة
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const el = document.querySelector(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -84 });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __ezyLenis?: Lenis }).__ezyLenis;
      delete (window as unknown as { __ezyScrollToTop?: () => void }).__ezyScrollToTop;
      window.scrollTo = nativeScrollTo;
    };
  }, []);

  return <>{children}</>;
}
