import { Link } from 'react-router-dom';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import { usePageMeta } from '../lib/seo';

export default function NotFoundPage() {
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.not_found_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;

  usePageMeta({ title: text('metaTitle', 'الصفحة غير موجودة | ezyjobs'), noIndex: true });

  return (
    <div className="not-found-shell mx-auto flex min-h-[62vh] max-w-[1240px] flex-col items-center justify-center px-5 py-24 text-center">
      <p className="tnum font-display text-7xl font-bold text-brand/20 sm:text-8xl">{text('eyebrow', '404')}</p>
      <h1 className="mt-6 text-2xl font-black text-ink">{text('title', 'لم نجد هذه الصفحة')}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{text('lead', 'ربما تغيّر الرابط أو حُذفت الوظيفة. جرّب البحث من جديد.')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/jobs" className="ez-btn ez-btn-primary px-7 py-3 text-sm">{text('jobsButton', 'محرك البحث')}</Link>
        <Link to="/" className="ez-btn ez-btn-ghost px-7 py-3 text-sm">{text('homeButton', 'الرئيسية')}</Link>
      </div>
    </div>
  );
}
