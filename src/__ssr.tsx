import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { AuthProvider } from './lib/auth';
import { ProfileProvider } from './features/profile/ProfileContext';
import { AppRoutes } from './App';
import { seedJobs } from './data/seedJobs';
import { liveJobs } from './data/liveJobs';
import { getJobSeo, jobPostingJsonLd, localeFromPath } from './lib/seoI18n';
import { keywordIntelligence } from './data/keywordIntelligence';
import { keywordLandingRows, keywordRowBySlug, keywordLocaleTitle, slugifyKeyword } from './lib/keywordLanding';

const allJobs = liveJobs.length ? liveJobs : seedJobs;
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

  const jobPrefix = locale === 'ar' ? '/jobs/' : '/' + locale + '/jobs/';
  if (pathname.startsWith(jobPrefix)) {
    const slug = pathname.slice(jobPrefix.length);
    const job = allJobs.find((item) => item.slug === slug);
    if (job) return { ...getJobSeo(job, locale), jsonLd: jobPostingJsonLd(job, locale) };
  }

  const collections: Record<string, { title: string; description: string }> = {
    '/': {
      title: 'ezyjobs — وظائف وفرص عمل عن بعد',
      description: 'ابحث عن وظائف عن بعد واقرأ الأهلية قبل التقديم.',
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
  return {
    title: item?.title || 'ezyjobs',
    description: item?.description || 'Find jobs and prepare stronger applications with ezyjobs.',
    canonical: 'https://ezyjobs.com' + pathname,
    alternates,
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
  };
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
