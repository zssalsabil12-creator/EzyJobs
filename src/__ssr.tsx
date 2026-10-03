import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AuthProvider } from './lib/auth';
import { ProfileProvider } from './features/profile/ProfileContext';
import { AppRoutes } from './App';
import { seedJobs } from './data/seedJobs';
import { liveJobs } from './data/liveJobs';
import { getJobSeo, jobPostingJsonLd, localeFromPath, homeJsonLd, SITE_URL } from './lib/seoI18n';
import { keywordIntelligence } from './data/keywordIntelligence';
import { keywordLandingRows, keywordRowBySlug, keywordLocaleTitle, slugifyKeyword } from './lib/keywordLanding';
import { GUIDES } from './content/guides';
import { categoryBySlug, countryBySlug } from './data/taxonomy';

const allJobs = (liveJobs.length ? liveJobs : seedJobs).filter((job) => job.status === 'published' && job.eligibility !== 'closed');
export { allJobs };

export function render(url: string) {
  return renderToString(
    <StaticRouter location={url}>
      <AuthProvider>
        <ProfileProvider>
          <AppRoutes initialJobs={allJobs} />
        </ProfileProvider>
      </AuthProvider>
    </StaticRouter>,
  );
}

export function getSeoPayload(url: string) {
  const pathname = url.split('?')[0].replace(/\/+$/, '') || '/';
  const locale = localeFromPath(pathname);
  const searchPrefix = '/search/';
  if (pathname.startsWith(searchPrefix)) {
    const slug = pathname.slice(searchPrefix.length);
    const row = keywordRowBySlug(keywordIntelligence.keywords, slug);
    if (row) return {
      title: keywordLocaleTitle(row) + ' | ezyjobs',
      description: 'Search-demand signals and current remote jobs for ' + row.keyword + '.',
      canonical: 'https://ezyjobs.com/search/' + slugifyKeyword(row.keyword),
      alternates: {},
      locale: row.locale,
      direction: row.locale === 'ar' ? 'rtl' : 'ltr',
    };
  }

  if (pathname.startsWith('/guides/')) {
    const slug = pathname.slice('/guides/'.length);
    const guide = GUIDES.find((item) => item.slug === slug);
    if (guide) {
      const canonical = SITE_URL + pathname;
      return {
        title: guide.title + ' | ezyjobs',
        description: guide.excerpt,
        canonical,
        alternates: {},
        locale: 'ar' as const,
        direction: 'rtl' as const,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: guide.title,
          description: guide.excerpt,
          datePublished: guide.publishedAt,
          dateModified: guide.publishedAt,
          mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
          publisher: { '@type': 'Organization', name: 'EzyJobs', url: SITE_URL },
        },
      };
    }
  }

  if (pathname === '/guides') {
    return {
      title: 'أدلة العمل عن بُعد والسيرة الذاتية | ezyjobs',
      description: 'أدلة عملية بالعربية حول العمل عن بُعد، السيرة الذاتية، أنظمة ATS، مقابلات العمل وفرص الطلاب.',
      canonical: SITE_URL + '/guides',
      alternates: {},
      locale: 'ar' as const,
      direction: 'rtl' as const,
    };
  }

  if (pathname === '/students') {
    return {
      title: 'وظائف للطلاب أثناء الدراسة | ezyjobs',
      description: 'وظائف مرنة وتدريب وفرص عن بُعد للطلاب، مع توضيح الخبرة والساعات والأهلية قبل التقديم.',
      canonical: SITE_URL + '/students',
      alternates: {},
      locale: 'ar' as const,
      direction: 'rtl' as const,
    };
  }

  if (pathname === '/no-experience') {
    return {
      title: 'وظائف بدون خبرة | ابدأ من الصفر | ezyjobs',
      description: 'وظائف عن بُعد لا تشترط خبرة سابقة، مع شرح المهارات والأهلية ومصدر التقديم.',
      canonical: SITE_URL + '/no-experience',
      alternates: {},
      locale: 'ar' as const,
      direction: 'rtl' as const,
    };
  }

  const jobPrefix = locale === 'ar' ? '/jobs/' : '/' + locale + '/jobs/';
  if (pathname.startsWith(jobPrefix)) {
    const slug = pathname.slice(jobPrefix.length);
    const job = allJobs.find((item) => item.slug === slug);
    if (job) return { ...getJobSeo(job, locale), jsonLd: jobPostingJsonLd(job, locale) };
  }

  if (pathname === '/tools' || pathname === '/tools/cv' || pathname === '/tools/ats' || pathname === '/tools/interview') {
    const toolMeta: Record<string, { title: string; description: string }> = {
      '/tools': { title: 'أدوات التوظيف المجانية | ezyjobs', description: 'أدوات مجانية بالعربية لإنشاء السيرة الذاتية، فحص التوافق مع ATS والاستعداد لمقابلة العمل عن بُعد.' },
      '/tools/cv': { title: 'منشئ سيرة ذاتية مجاني | ezyjobs', description: 'أنشئ سيرة ذاتية عربية بعمود واحد واضحة لأنظمة التوظيف الآلية، مع تشخيص سريع لملفك.' },
      '/tools/ats': { title: 'فاحص توافق السيرة الذاتية مع ATS | ezyjobs', description: 'قارن إعلان الوظيفة بسيرتك الذاتية واعرف المهارات والكلمات المفتاحية الناقصة قبل التقديم.' },
      '/tools/interview': { title: 'تحضير مقابلة العمل عن بُعد | ezyjobs', description: 'جهّز إجاباتك وأسئلة المقابلة وخطة اليوم السابق لمقابلة عمل عن بُعد.' },
    };
    const meta = toolMeta[pathname];
    return { title: meta.title, description: meta.description, canonical: SITE_URL + pathname, alternates: {}, locale: 'ar' as const, direction: 'rtl' as const };
  }

  if (pathname === '/about') {
    return {
      title: 'من نحن | ezyjobs',
      description: 'تعرف على ezyjobs وكيف نجمع الوظائف ونوضح الأهلية ونقربك من مصدر التقديم الأصلي.',
      canonical: SITE_URL + '/about',
      alternates: {},
      locale: 'ar' as const,
      direction: 'rtl' as const,
    };
  }

  if (pathname === '/student-writer') {
    return {
      title: 'EzyPublish — انشر محتواك واربح من جمهورك | ezyjobs',
      description: 'مساحة EzyPublish للكتّاب والناشرين لإنتاج محتوى عملي يصل إلى الباحثين عن وظائف وفرص مهنية.',
      canonical: SITE_URL + '/student-writer',
      alternates: {},
      locale: 'ar' as const,
      direction: 'rtl' as const,
    };
  }

  if (pathname.startsWith('/country/')) {
    const item = countryBySlug(pathname.slice('/country/'.length));
    if (item) {
      const canonical = SITE_URL + pathname;
      return {
        title: `وظائف عن بعد ${item.demonym} — ${item.name} | ezyjobs`,
        description: `وظائف عن بعد تقبل المتقدمين من ${item.name}، مع توضيح الأهلية والخبرة ومصدر التقديم.`,
        canonical,
        alternates: {},
        locale: 'ar' as const,
        direction: 'rtl' as const,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `وظائف عن بعد ${item.demonym}`,
          description: `وظائف عن بعد للمتقدمين من ${item.name}`,
          url: canonical,
          inLanguage: 'ar',
        },
      };
    }
  }

  if (pathname.startsWith('/field/')) {
    const item = categoryBySlug(pathname.slice('/field/'.length));
    if (item) {
      const canonical = SITE_URL + pathname;
      return {
        title: `وظائف ${item.name} عن بُعد — شرح بالعربية | ezyjobs`,
        description: `وظائف ${item.name} عن بُعد مترجمة ومحللة بالعربية، مع توضيح الخبرة والمهارات والأهلية قبل التقديم.`,
        canonical,
        alternates: {},
        locale: 'ar' as const,
        direction: 'rtl' as const,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `وظائف ${item.name} عن بُعد`,
          description: `فرص ${item.name} عن بُعد`,
          url: canonical,
          inLanguage: 'ar',
        },
      };
    }
  }

  const collections: Record<string, { title: string; description: string }> = {
    '/': {
      title: 'EzyJobs — وظائف وفرص عمل عن بُعد',
      description: 'اكتشف وظائف عن بُعد وفرصاً مرنة وملائمة للطلاب، مع توضيح الأهلية والمتطلبات ومصدر التقديم قبل اتخاذ قرارك.',
    },
    '/jobs': {
      title: 'الوظائف | ezyjobs',
      description: 'ابحث عن وظائف وفرص عمل عن بعد، وقارن الشروط والأهلية قبل التقديم.',
    },
    '/demand': {
      title: 'Online and Remote Job Search Trends | ezyjobs',
      description: 'Explore search-demand signals and current remote jobs available on ezyjobs.',
    },
    '/en/job-search-trends': {
      title: 'Remote & Online Job Search Trends | ezyjobs',
      description: 'Explore search-demand signals and the remote jobs represented in our live job supply.',
    },
    '/fr/tendances-emploi': {
      title: 'Tendances de recherche d emploi a distance | ezyjobs',
      description: 'Explorez les signaux de demande et les emplois a distance presents dans notre offre actualisee.',
    },
    '/remote': {
      title: 'وظائف عن بعد | ezyjobs',
      description: 'اكتشف وظائف عن بعد واقرأ الأهلية الجغرافية قبل التقديم.',
    },
    '/en/jobs': {
      title: 'Online & Remote Jobs | ezyjobs',
      description: 'Explore online and remote jobs, compare eligibility and prepare your application.',
    },
    '/fr/emplois': {
      title: 'Emplois en ligne et à distance | ezyjobs',
      description: 'Explorez les offres en ligne et à distance, comparez l’éligibilité et préparez votre candidature.',
    },
    '/en/remote-jobs': {
      title: 'Remote Jobs Worldwide | ezyjobs',
      description: 'Find remote jobs worldwide and check geographic eligibility before you apply.',
    },
    '/fr/emploi-teletravail': {
      title: 'Emplois en télétravail | ezyjobs',
      description: 'Trouvez des emplois à distance et vérifiez l’éligibilité géographique avant de postuler.',
    },
  };
  const item = collections[pathname];
  const home = pathname === '/';
  const alternates = {
    '/en/remote-jobs': {
      ar: 'https://ezyjobs.com/remote',
      en: 'https://ezyjobs.com/en/remote-jobs',
      fr: 'https://ezyjobs.com/fr/emploi-teletravail',
      'x-default': 'https://ezyjobs.com/en/remote-jobs',
    },
    '/fr/emploi-teletravail': {
      ar: 'https://ezyjobs.com/remote',
      en: 'https://ezyjobs.com/en/remote-jobs',
      fr: 'https://ezyjobs.com/fr/emploi-teletravail',
      'x-default': 'https://ezyjobs.com/en/remote-jobs',
    },
    '/en/jobs': {
      ar: 'https://ezyjobs.com/jobs',
      en: 'https://ezyjobs.com/en/jobs',
      fr: 'https://ezyjobs.com/fr/emplois',
      'x-default': 'https://ezyjobs.com/en/jobs',
    },
    '/fr/emplois': {
      ar: 'https://ezyjobs.com/jobs',
      en: 'https://ezyjobs.com/en/jobs',
      fr: 'https://ezyjobs.com/fr/emplois',
      'x-default': 'https://ezyjobs.com/en/jobs',
    },
  }[pathname] || {};
  const canonical = SITE_URL + pathname;
  const basePayload = {
    title: item?.title || 'EzyJobs — وظائف وفرص عمل عن بُعد',
    description: item?.description || 'اكتشف الوظائف عن بُعد والفرص المرنة، وافهم الأهلية والمتطلبات قبل التقديم.',
    canonical,
    alternates,
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
  };
  if (home) {
    return {
      ...basePayload,
      alternates: {
        ar: SITE_URL + '/',
        en: SITE_URL + '/en/jobs',
        fr: SITE_URL + '/fr/emplois',
        'x-default': SITE_URL + '/',
      },
      jsonLd: homeJsonLd(),
    };
  }
  return basePayload;
}

export const routes = [
  ...keywordLandingRows(keywordIntelligence.keywords).map((row) => '/search/' + slugifyKeyword(row.keyword)),
  ...allJobs.flatMap((job) => [
    '/jobs/' + job.slug,
    '/en/jobs/' + job.slug,
    '/fr/jobs/' + job.slug,
  ]),
  '/',
  '/jobs',
  '/students',
  '/no-experience',
  '/remote',
  '/demand',
  '/en/job-search-trends',
  '/fr/tendances-emploi',
  '/en/remote-jobs',
  '/fr/emploi-teletravail',
  '/en/jobs',
  '/fr/emplois',
  '/country/algeria',
  '/country/DZ',
  '/country/egypt',
  '/field/customer-support',
  '/field/development',
  '/jobs/does-not-exist',
  '/guides',
  '/guides/remote-jobs-for-beginners',
  '/guides/cv-without-experience',
  '/guides/ats-explained',
  '/tools',
  '/tools/cv',
  '/tools/ats',
  '/tools/interview',
  '/saved',
  '/alerts',
  '/about',
  '/terms',
  '/privacy',
  '/usage-policy',
  '/login',
  '/register',
  '/dashboard',
  '/admin',
  '/zzz-unknown',
];
