import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import { usePageMeta } from '../../lib/seo';

export default function Layout() {
  const { pathname } = useLocation();
  const isAdminArea = pathname === '/admin' || pathname.startsWith('/admin/');
  usePageMeta();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
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

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة للأعلى"
      className={`ez-btn ez-btn-ghost fixed bottom-6 right-6 z-40 h-11 w-11 !rounded-full !p-0 !gap-0 transition-all duration-500 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
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
