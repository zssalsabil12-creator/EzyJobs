import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { usePageMeta } from '../../lib/seo';

declare global {
  interface Window {
    __ezyScrollToTop?: () => void;
  }
}

export default function Layout() {
  const { pathname } = useLocation();
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  usePageMeta();

  useEffect(() => {
    if (window.__ezyScrollToTop) {
      window.__ezyScrollToTop();
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname]);

  return (
    <div className={isAdminArea ? 'flex min-h-screen flex-col bg-[#f7f5f0]' : 'site-shell public-app flex min-h-screen flex-col bg-paper'}>
      <div className={isAdminArea ? 'hidden' : ''}><SiteHeader /></div>
      <main key={pathname} className="anim-fade flex-1">
        <Outlet />
      </main>
      <div className={isAdminArea ? 'hidden' : ''}><SiteFooter /></div>
      {!isAdminArea && <BackToTop />}
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 900);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const progress = 'var(--ezy-page-progress, 0)';

  return (
    <button
      onClick={() => window.scrollTo({ top: 0 })}
      aria-label="العودة للأعلى"
      className={`ezy-back-to-top ez-btn ez-btn-ghost fixed bottom-6 right-6 z-40 h-12 w-12 !rounded-full !p-0 !gap-0 transition-all duration-500 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <svg className="ezy-back-to-top__ring" viewBox="0 0 48 48" aria-hidden>
        <circle cx="24" cy="24" r="21" fill="none" stroke="rgba(0,85,255,.12)" strokeWidth="2" />
        <circle
          cx="24"
          cy="24"
          r="21"
          fill="none"
          stroke="url(#ezy-btt-grad)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          style={{ strokeDashoffset: `calc(1 - ${progress})` }}
          transform="rotate(-90 24 24)"
        />
        <defs>
          <linearGradient id="ezy-btt-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0055FF" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 19V5" />
        <path d="m5 12 7-7 7 7" />
      </svg>
    </button>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">{children}</div>;
}
