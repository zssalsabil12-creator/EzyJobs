import { Link } from 'react-router-dom';
import { COUNTRIES, CATEGORIES } from '../../data/taxonomy';
import Logo from '../art/Logo';
import { usePublicSiteSettings } from '../../lib/siteSettings';
import { parseNavItems } from '../../lib/siteNavigation';
import AdSenseSlot from '../monetization/AdSenseSlot';

const year = new Date().getFullYear();

export default function SiteFooter() {
  const settings = usePublicSiteSettings();
  const platformItems = parseNavItems(settings.footer_platform_nav, [
    { to: '/jobs', label: 'البحث عن وظائف' }, { to: '/students', label: 'وظائف للطلاب' },
    { to: '/remote', label: 'العمل عن بُعد' }, { to: '/no-experience', label: 'وظائف بلا خبرة' },
    { to: '/alerts', label: 'تنبيهات الوظائف' }, { to: '/terms', label: 'الشروط والأحكام' },
    { to: '/privacy', label: 'سياسة الخصوصية' }, { to: '/usage-policy', label: 'سياسة الاستخدام' },
  ]);
  const contentItems = parseNavItems(settings.footer_content_nav, [
    { to: '/tools', label: 'أدوات التوظيف' }, { to: '/articles', label: 'المقالات' },
    { to: '/saved', label: 'الوظائف المحفوظة' }, { to: '/about', label: 'من نحن' },
  ]);

  return (
    <footer className="site-footer relative overflow-hidden border-t border-white/10 bg-abyss text-white/75">
      <div className="footer-aura" aria-hidden />
      <div className="ez-line-flow absolute inset-x-0 top-0 opacity-70" aria-hidden />
      <AdSenseSlot slot={settings.adsense_footer_slot} className="!px-0" />
      <div className="mx-auto max-w-[1240px] px-5 py-16 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="footer-brand-card">
            <div className="flex items-center gap-3">
              <Logo size={40} />
              <span>
                <span className="block font-display text-lg font-bold tracking-tight text-white">
                  ezyjobs
                </span>
                <span className="block text-[10px] font-medium text-white/40">
                  <span className="tracking-in inline-block">{settings.footer_tagline?.trim() || 'وظائف عن بُعد للناطقين بالعربية'}</span>
                </span>
              </span>
            </div>
            <p className="mt-6 max-w-xs text-sm leading-[1.9]">
              {settings.footer_note?.trim() || 'منصة عربية تجمع الوظائف عن بُعد من مصادر تسمح بإعادة التوزيع، تترجمها وتشرح ملاءمتها، ثم تودك إلى مصدر التقديم الأصلي.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                ['social_telegram_url', 'Telegram'],
                ['social_linkedin_url', 'LinkedIn'],
                ['social_facebook_url', 'Facebook'],
                ['social_youtube_url', 'YouTube'],
              ].map(([key, label]) => settings[key]?.trim() && (
                <a key={key} href={settings[key]} target="_blank" rel="noreferrer" className="ez-chip ez-chip-ink transition-colors hover:border-white/30 hover:text-white">{label}</a>
              ))}
            </div>
          </div>

          <FooterCol
            title={settings.footer_platform_title?.trim() || 'المنصة'}
            items={platformItems}
          />

          <FooterCol
            title={settings.footer_content_title?.trim() || 'المحتوى'}
            items={contentItems}
          />

          <FooterCol
            title={settings.footer_country_title?.trim() || 'دول'}
            items={COUNTRIES.slice(0, 5).map((c) => ({
              to: `/country/${c.slug}`,
              label: `وظائف عن بعد ${c.demonym}`,
            }))}
          />
        </div>

        <div className="mt-12 border-t border-white/10 pt-6">
          <p className="mb-4 text-[10px] font-bold tracking-[0.16em] text-white/30">
            {settings.footer_browse_title?.trim() || 'تصفّح حسب المجال'}
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => c.id !== 'other')
              .slice(0, 8)
              .map((c) => (
                <Link
                  key={c.id}
                  to={`/field/${c.slug}`}
                  className="ez-chip ez-chip-ink transition-colors hover:border-white/30 hover:text-white"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>

        <div aria-hidden className="pointer-events-none mt-14 select-none overflow-hidden">
          <p
            dir="ltr"
            className="text-gradient whitespace-nowrap text-center font-display text-[19vw] font-bold leading-[0.85] tracking-tight opacity-25 lg:text-[11rem]"
          >
            ezyjobs
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-8 text-[12px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <span className="tnum">{year}</span> ezyjobs. جميع الحقوق محفوظة.
          </p>
          <div className="flex flex-wrap gap-5">
            <Link to="/login" className="transition-colors hover:text-white">
              {settings.footer_login_label?.trim() || 'تسجيل الدخول'}
            </Link>
            <Link to="/terms" className="transition-colors hover:text-white">
              {settings.footer_terms_label?.trim() || 'الشروط والأحكام'}
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-white">
              {settings.footer_privacy_label?.trim() || 'سياسة الخصوصية'}
            </Link>
            <Link to="/usage-policy" className="transition-colors hover:text-white">
              {settings.footer_usage_label?.trim() || 'سياسة الاستخدام'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: { to: string; label: string }[];
}) {
  return (
    <nav>
      <h3 className="mb-5 text-[11px] font-bold tracking-[0.18em] text-white/40">{title}</h3>
      <ul className="space-y-3 text-sm">
        {items.map((i) => (
          <li key={i.to + i.label}>
            <Link to={i.to} className="transition-colors hover:text-white">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
