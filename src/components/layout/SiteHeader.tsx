import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import Logo from '../art/Logo';
import { openPalette } from '../art/CommandPalette';
import { usePublicSiteSettings } from '../../lib/siteSettings';
import { parseNavItems, type NavItem } from '../../lib/siteNavigation';

const primaryFallback: NavItem[] = [
  { to: '/jobs', label: 'أحدث الوظائف أونلاين' },
  { to: '/student-writer', label: 'انضم إلى EzyPublish' },
  { to: '/articles', label: 'المقالات' },
];

const secondaryFallback: NavItem[] = [
  { to: '/no-experience', label: 'وظائف بلا خبرة' },
  { to: '/tools', label: 'الأدوات المهنية' },
  { to: '/about', label: 'عن المنصة' },
];

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { session, isPublisher, isAdmin, signOut } = useAuth();
  const settings = usePublicSiteSettings();
  const links = useMemo(() => {
    const configured = parseNavItems(settings.nav_primary, primaryFallback);
    const withoutArticles = configured.filter((item) => item.to !== '/guides' && item.to !== '/articles');
    const profileIndex = withoutArticles.findIndex((item) => item.to === '/profile');
    const next = { to: '/articles', label: 'المقالات' };
    if (profileIndex >= 0) {
      withoutArticles.splice(profileIndex, 1, next);
    } else if (!withoutArticles.some((item) => item.to === '/articles')) {
      withoutArticles.push(next);
    }
    return withoutArticles;
  }, [settings.nav_primary]);
  const secondaryLinks = parseNavItems(settings.nav_mobile_secondary, secondaryFallback);
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className={`site-header ${isHome ? 'home-header' : ''} z-50 transition-all duration-300 ${
        isHome
          ? scrolled
            ? 'absolute inset-x-0 top-0 border-b border-white/55 bg-white/72 shadow-[0_16px_38px_-28px_rgba(30,86,160,0.28)] backdrop-blur-xl'
            : 'absolute inset-x-0 top-0 border-b border-transparent bg-white/20 backdrop-blur-[3px]'
          : 'sticky top-0 ' +
            (scrolled
              ? 'border-b border-line bg-white/92 shadow-[0_12px_40px_-28px_rgba(23,36,59,0.18)] backdrop-blur-xl'
              : 'border-b border-transparent bg-white/60 backdrop-blur-sm')
      }`}
    >
      <div
        className="absolute inset-x-0 top-0 h-[2px] origin-right bg-gradient-to-l from-brand via-[#7bb0ff] to-accent"
        style={{ transform: `scaleX(${progress})`, boxShadow: '0 0 12px rgba(47,100,214,0.35)' }}
        aria-hidden
      />
      <div className={`home-header__inner mx-auto flex items-center justify-between px-5 lg:px-10 ${
        isHome ? 'max-w-[1380px] py-5 lg:py-6' : 'max-w-[1240px] py-4'
      }`}>
        <Link to="/" className="home-header__brand group flex items-center gap-3" aria-label="EzyJobs">
          <span className="transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
            <Logo size={40} />
          </span>
          <span>
            <span className={`block font-display font-bold leading-none tracking-tight text-ink ${isHome ? 'home-brand-name' : 'text-lg'}`}>
              {isHome ? 'EzyJobs' : 'ezyjobs'}
            </span>
            {!isHome && (
              <span className="mt-0.5 block text-[9px] font-semibold text-ink/60">
                <span className="tracking-in inline-block">{settings.header_tagline?.trim() || 'ARABIC REMOTE JOBS'}</span>
              </span>
            )}
          </span>
        </Link>

        <nav className="home-header__nav hidden items-center gap-8 lg:flex">
          {isHome ? (
            <>
              <NavLink to="/jobs" className="home-nav-link is-active">Jobs</NavLink>
              <NavLink to="/remote" className="home-nav-link">Remote</NavLink>
              <NavLink to="/students" className="home-nav-link">Students</NavLink>
              <NavLink to="/tools" className="home-nav-link">Career Tools</NavLink>
            </>
          ) : (
            links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 shadow-[0_8px_20px_-10px_rgba(47,100,214,0.45)]'
                      : 'text-ink/75 hover:bg-brand-50/70 hover:text-brand-700 hover:shadow-[0_8px_20px_-12px_rgba(47,100,214,0.25)]'
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))
          )}
        </nav>

        <div className={`home-header__actions hidden items-center lg:flex ${isHome ? 'gap-7' : 'gap-2'}`}>
          <button
            onClick={openPalette}
            className={isHome ? 'home-header-search' : 'ez-btn ez-btn-ghost group px-3 py-2.5 text-[13px]'}
            aria-label={isHome ? 'Search jobs' : (settings.nav_search_label?.trim() || 'بحث')}
            title={isHome ? 'Search jobs' : (settings.nav_search_title?.trim() || 'بحث')}
          >
            <svg width={isHome ? 18 : 14} height={isHome ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {!isHome && <span className="text-ink/70">{settings.nav_search_label?.trim() || 'بحث'}</span>}
          </button>

          {session ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                className={isHome ? 'home-account-button' : 'ez-btn ez-btn-ghost gap-2 px-4 py-2.5 text-[13px]'}
                aria-expanded={accountOpen}
              >
                <span className="max-w-[120px] truncate">{isHome ? 'Account' : (session.user.email?.split('@')[0] || 'حسابي')}</span>
                <span className="text-ink/60">⌄</span>
              </button>
              {accountOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-56 rounded-2xl border border-line bg-surface p-2 shadow-2xl">
                  <Link to="/profile" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">{isHome ? 'Profile' : (settings.nav_profile_label?.trim() || 'ملفي المهني')}</Link>
                  <Link to="/applications" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">{isHome ? 'Applications' : 'تقديماتي'}</Link>
                  <Link to="/saved" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">{isHome ? 'Saved jobs' : 'الوظائف المحفوظة'}</Link>
                  <Link to="/tasks" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">EzyTasks</Link>
                  {isPublisher && <Link to="/publish" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">{isHome ? 'EzyPublish' : 'مساحة EzyPublish'}</Link>}
                  {isAdmin && <Link to="/admin" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">{isHome ? 'Admin' : (settings.nav_admin_label?.trim() || 'لوحة الإدارة')}</Link>}
                  {!isAdmin && isPublisher && <Link to="/dashboard" className="block rounded-xl px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-50/70">{isHome ? 'Dashboard' : (settings.nav_dashboard_label?.trim() || 'لوحة التحكم')}</Link>}
                  <button onClick={handleSignOut} className="mt-1 w-full rounded-xl px-4 py-3 text-right text-sm font-semibold text-danger hover:bg-danger-soft">{isHome ? 'Log out' : (settings.nav_logout_label?.trim() || 'تسجيل الخروج')}</button>
                </div>
              )}
            </div>
          ) : isHome ? (
            <>
              <Link to="/login" className="home-login-link">Log in</Link>
              <Link to="/register" className="home-get-started">Get Started <span aria-hidden>→</span></Link>
            </>
          ) : (
            <>
              <Link to="/login" className="ez-btn ez-btn-ghost px-5 py-2.5 text-[13px]">{settings.nav_login_label?.trim() || 'تسجيل الدخول'}</Link>
              <Link to="/register" className="ez-btn ez-btn-primary px-5 py-2.5 text-[13px]">{settings.nav_register_label?.trim() || 'إنشاء حساب'}</Link>
            </>
          )}
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink lg:hidden"
          aria-label={isHome ? 'Menu' : 'القائمة'}
          aria-expanded={open}
        >
          <span className="flex w-4 flex-col gap-[5px]">
            <span
              className={`h-px w-full bg-current transition-transform ${
                open ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span className={`h-px w-full bg-current ${open ? 'opacity-0' : ''}`} />
            <span
              className={`h-px w-full bg-current transition-transform ${
                open ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </span>
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[65px] z-40 h-[calc(100vh-65px)] overflow-y-auto border-t border-line bg-white/98 px-5 py-8 backdrop-blur-xl lg:hidden">
          <nav className={isHome ? 'flex flex-col items-stretch' : 'flex flex-col'}>
            {isHome ? (
              <>
                <NavLink to="/jobs" className="anim-fade-up border-b border-line py-4 text-lg font-bold text-ink">Jobs</NavLink>
                <NavLink to="/remote" className="anim-fade-up border-b border-line py-4 text-lg font-bold text-ink">Remote</NavLink>
                <NavLink to="/students" className="anim-fade-up border-b border-line py-4 text-lg font-bold text-ink">Students</NavLink>
                <NavLink to="/tools" className="anim-fade-up border-b border-line py-4 text-lg font-bold text-ink">Career Tools</NavLink>
              </>
            ) : (
              <>
                {links.map((l, i) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className="anim-fade-up border-b border-line py-4 text-lg font-bold text-ink"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    {l.label}
                  </NavLink>
                ))}
                {secondaryLinks.map((l, i) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className="anim-fade-up border-b border-line py-4 text-lg font-bold text-ink"
                    style={{ animationDelay: `${(links.length + i) * 60}ms` }}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            {session ? (
              <>
                <Link to="/profile" className="ez-btn ez-btn-primary w-full py-3.5">
                  {isHome ? 'Profile' : (settings.nav_profile_label?.trim() || 'ملفي المهني')}
                </Link>
                <Link to="/applications" className="ez-btn ez-btn-ghost w-full py-3.5">
                  {isHome ? 'Applications' : 'تقديماتي'}
                </Link>
                <Link to="/saved" className="ez-btn ez-btn-ghost w-full py-3.5">
                  {isHome ? 'Saved jobs' : 'الوظائف المحفوظة'}
                </Link>
                <Link to="/tasks" className="ez-btn ez-btn-ghost w-full py-3.5">
                  EzyTasks
                </Link>
                {isPublisher && (
                  <Link to="/publish" className="ez-btn ez-btn-ghost w-full py-3.5">
                    {isHome ? 'EzyPublish' : 'مساحة EzyPublish'}
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="ez-btn ez-btn-ghost w-full py-3.5">
                    {isHome ? 'Admin' : (settings.nav_admin_label?.trim() || 'لوحة الإدارة')}
                  </Link>
                )}
                {!isAdmin && isPublisher && (
                  <Link to="/dashboard" className="ez-btn ez-btn-ghost w-full py-3.5">
                    {isHome ? 'Dashboard' : (settings.nav_dashboard_label?.trim() || 'لوحة التحكم')}
                  </Link>
                )}
                <button onClick={handleSignOut} className="ez-btn ez-btn-ghost w-full py-3.5 text-danger">
                  {isHome ? 'Log out' : (settings.nav_logout_label?.trim() || 'تسجيل الخروج')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={isHome ? 'home-mobile-login' : 'ez-btn ez-btn-primary w-full py-3.5'}>
                  {isHome ? 'Log in' : (settings.nav_login_label?.trim() || 'تسجيل الدخول')}
                </Link>
                <Link to="/register" className={isHome ? 'home-mobile-get-started' : 'ez-btn ez-btn-ghost w-full py-3.5'}>
                  {isHome ? 'Get Started →' : (settings.nav_register_label?.trim() || 'إنشاء حساب')}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
