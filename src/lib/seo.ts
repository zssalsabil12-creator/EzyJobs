import { useEffect } from 'react';
import { jobPostingJsonLd as buildJobPostingJsonLd, getJobSeo, type SiteLocale } from './seoI18n';

interface Meta {
  title: string;
  description?: string;
  jsonLd?: Record<string, unknown>;
  noIndex?: boolean;
  canonical?: string;
  alternates?: Partial<Record<SiteLocale | 'x-default', string>>;
  locale?: SiteLocale;
}

const setMeta = (selector: string, attr: 'name' | 'property', key: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
};

const setCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link#ezy-canonical');
  if (!el) {
    el = document.createElement('link');
    el.id = 'ezy-canonical';
    document.head.appendChild(el);
  }
  el.rel = 'canonical';
  el.href = href;
};

export function usePageMeta(meta?: Meta) {
  useEffect(() => {
    if (!meta) return;
    document.title = meta.title;
    if (meta.description) {
      setMeta('meta[name="description"]', 'name', 'description', meta.description);
      setMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
      setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);
    }
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
    setMeta('meta[name="robots"]', 'name', 'robots', meta.noIndex ? 'noindex, nofollow' : 'index, follow');
    const locale = meta.locale || 'ar';
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
    setMeta('meta[property="og:locale"]', 'property', 'og:locale', locale === 'fr' ? 'fr_FR' : locale === 'en' ? 'en_US' : 'ar_AR');
    const canonical = meta.canonical || window.location.origin + window.location.pathname;
    setCanonical(canonical);
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    document.head.querySelectorAll<HTMLLinkElement>('link[data-ezy-hreflang="true"]').forEach((el) => el.remove());
    for (const [lang, href] of Object.entries(meta.alternates || {})) {
      const link = document.createElement('link');
      link.dataset.ezyHreflang = 'true';
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = href;
      document.head.appendChild(link);
    }
    document.getElementById('ezy-jsonld')?.remove();
    if (meta.jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'ezy-jsonld';
      script.textContent = JSON.stringify(meta.jsonLd);
      document.head.appendChild(script);
    }
  }, [meta]);
}

export const jobPostingJsonLd = (
  job: Parameters<typeof buildJobPostingJsonLd>[0],
  locale: SiteLocale = 'en',
) => buildJobPostingJsonLd(job, locale);

export { getJobSeo };
