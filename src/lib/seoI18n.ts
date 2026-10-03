import type { Job } from '../types';
import {
  categoryName,
  commitmentName,
  countryName,
  eligibilityName,
  experienceName,
  workModeName,
} from '../data/taxonomy';

export type SiteLocale = 'ar' | 'en' | 'fr';
export const SITE_URL = 'https://ezyjobs.com';
export const SITE_NAME = 'EzyJobs';
export const SITE_LOGO = SITE_URL + '/favicon.svg';
export const SITE_SOCIALS: string[] = [];

export const localeFromPath = (pathname: string): SiteLocale => {
  if (pathname === '/en' || pathname.startsWith('/en/')) return 'en';
  if (pathname === '/fr' || pathname.startsWith('/fr/')) return 'fr';
  return 'ar';
};

export const localizedJobPath = (locale: SiteLocale, slug: string) =>
  locale === 'ar' ? '/jobs/' + slug : '/' + locale + '/jobs/' + slug;

const regionText = (job: Job, locale: SiteLocale) => {
  if (job.eligibleRegions.includes('worldwide')) {
    return locale === 'fr' ? 'international' : locale === 'en' ? 'worldwide' : 'عالميًا';
  }
  return job.eligibleRegions.map(countryName).join(locale === 'ar' ? '، ' : ', ');
};

export const localizedJobCopy = (job: Job, locale: SiteLocale) => {
  const regions = regionText(job, locale);
  if (locale === 'en') {
    return {
      heading: 'Job details and eligibility',
      intro: job.titleOriginal + ' at ' + job.company + '. Review the known requirements, geographic eligibility and practical details before applying.',
      remote: 'Work mode: ' + workModeName(job.workMode),
      commitment: 'Commitment: ' + commitmentName(job.commitment),
      experience: 'Experience: ' + experienceName(job.experience),
      eligibility: 'Eligibility: ' + eligibilityName(job.eligibility) + ' — ' + regions,
      skills: 'Skills: ' + job.skills.slice(0, 8).join(', '),
      evidence: 'Eligibility evidence',
      evidenceFallback: 'No separate country-eligibility evidence has been recorded yet. Remote alone does not prove that every country is accepted.',
    };
  }
  if (locale === 'fr') {
    return {
      heading: 'Détails du poste et éligibilité',
      intro: job.titleOriginal + ' chez ' + job.company + '. Vérifiez les conditions connues, l’éligibilité géographique et les informations utiles avant de postuler.',
      remote: 'Mode : ' + workModeName(job.workMode),
      commitment: 'Contrat : ' + commitmentName(job.commitment),
      experience: 'Expérience : ' + experienceName(job.experience),
      eligibility: 'Éligibilité : ' + eligibilityName(job.eligibility) + ' — ' + regions,
      skills: 'Compétences : ' + job.skills.slice(0, 8).join(', '),
      evidence: 'Preuves d’éligibilité',
      evidenceFallback: 'Aucune preuve distincte d’éligibilité par pays n’est encore enregistrée. « Remote » seul ne prouve pas que tous les pays sont acceptés.',
    };
  }
  return {
    heading: 'تفاصيل الوظيفة والأهلية',
    intro: job.titleOriginal + ' لدى ' + job.company + '. راجع الشروط المعروفة والأهلية الجغرافية والمعلومات العملية قبل التقديم.',
    remote: 'نمط العمل: ' + workModeName(job.workMode),
    commitment: 'نوع الالتزام: ' + commitmentName(job.commitment),
    experience: 'الخبرة: ' + experienceName(job.experience),
    eligibility: 'الأهلية: ' + eligibilityName(job.eligibility) + ' — ' + regions,
    skills: 'المهارات: ' + job.skills.slice(0, 8).join('، '),
    evidence: 'دليل الأهلية',
    evidenceFallback: 'لا توجد وثيقة أهلية منفصلة مسجلة لهذه الوظيفة حتى الآن. كلمة Remote وحدها لا تثبت قبول كل الدول.',
  };
};

const jobDescription = (job: Job, locale: SiteLocale) => {
  const copy = localizedJobCopy(job, locale);
  const parts = [
    copy.intro,
    job.summaryAr,
    job.descriptionAr,
    copy.remote,
    copy.commitment,
    copy.experience,
    copy.eligibility,
    copy.skills,
    job.requirements.length
      ? (locale === 'fr' ? 'Exigences : ' : locale === 'en' ? 'Requirements: ' : 'المتطلبات: ') + job.requirements.join(locale === 'ar' ? '، ' : ', ')
      : '',
    job.niceToHave.length
      ? (locale === 'fr' ? 'Atouts : ' : locale === 'en' ? 'Nice to have: ' : 'يفضل: ') + job.niceToHave.join(locale === 'ar' ? '، ' : ', ')
      : '',
    job.weeklyHours
      ? (locale === 'fr' ? 'Heures hebdomadaires : ' : locale === 'en' ? 'Weekly hours: ' : 'الساعات الأسبوعية: ') + job.weeklyHours
      : '',
    job.education
      ? (locale === 'fr' ? 'Formation : ' : locale === 'en' ? 'Education: ' : 'التعليم: ') + job.education
      : '',
  ].filter(Boolean);
  return parts.join(' ');
};

export const getJobSeo = (job: Job, locale: SiteLocale) => {
  const path = localizedJobPath(locale, job.slug);
  return {
    title: locale === 'ar'
      ? job.titleAr + ' — ' + job.company + ' | ezyjobs'
      : job.titleOriginal + ' — ' + job.company + ' | ezyjobs',
    description: jobDescription(job, locale),
    canonical: SITE_URL + path,
    alternates: {
      ar: SITE_URL + localizedJobPath('ar', job.slug),
      en: SITE_URL + localizedJobPath('en', job.slug),
      fr: SITE_URL + localizedJobPath('fr', job.slug),
      'x-default': SITE_URL + localizedJobPath('en', job.slug),
    },
    locale,
    direction: locale === 'ar' ? 'rtl' : 'ltr',
  };
};

export const homeJsonLd = () => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': SITE_URL + '/#organization',
      name: SITE_NAME,
      url: SITE_URL + '/',
      logo: { '@type': 'ImageObject', url: SITE_LOGO },
    },
    {
      '@type': 'WebSite',
      '@id': SITE_URL + '/#website',
      name: SITE_NAME,
      url: SITE_URL + '/',
      publisher: { '@id': SITE_URL + '/#organization' },
      inLanguage: ['ar', 'en', 'fr'],
    },
    {
      '@type': 'WebPage',
      '@id': SITE_URL + '/#webpage',
      url: SITE_URL + '/',
      name: 'EzyJobs — وظائف وفرص عمل عن بُعد',
      isPartOf: { '@id': SITE_URL + '/#website' },
      about: { '@id': SITE_URL + '/#organization' },
      inLanguage: 'ar',
    },
  ],
});

const employmentType: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  internship: 'INTERN',
  freelance: 'CONTRACTOR',
  contract: 'CONTRACTOR',
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const jobPostingJsonLd = (job: Job, locale: SiteLocale = 'en') => {
  if (job.source.distribution === 'aggregator' || job.status !== 'published') return undefined;
  const seo = getJobSeo(job, locale);
  const period =
    job.salary?.period === 'hour' ? 'HOUR' :
    job.salary?.period === 'month' ? 'MONTH' :
    job.salary?.period === 'year' ? 'YEAR' : undefined;
  const baseSalary =
    job.salary && period && (job.salary.min != null || job.salary.max != null)
      ? {
          '@type': 'MonetaryAmount',
          currency: job.salary.currency,
          value: {
            '@type': 'QuantitativeValue',
            ...(job.salary.min != null ? { minValue: job.salary.min } : {}),
            ...(job.salary.max != null ? { maxValue: job.salary.max } : {}),
            unitText: period,
          },
        }
      : undefined;
  const countries = job.eligibleRegions
    .filter((code) => code !== 'worldwide')
    .map((code) => ({ '@type': 'Country', name: countryName(code) }));

  // Google requires a concrete applicant country for remote JobPosting markup.
  // Keep worldwide remote jobs out of JobPosting rich-result markup rather than
  // inventing a country that the source did not specify.
  if (job.workMode === 'remote' && !countries.length) return undefined;

  const htmlDescription = [
    '<p>' + escapeHtml(job.summaryAr || jobDescription(job, locale)) + '</p>',
    job.descriptionAr ? '<p>' + escapeHtml(job.descriptionAr) + '</p>' : '',
    job.requirements.length
      ? '<p><strong>' + escapeHtml(locale === 'ar' ? 'المتطلبات' : locale === 'fr' ? 'Exigences' : 'Requirements') + ':</strong></p><ul>' +
        job.requirements.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>'
      : '',
    job.niceToHave.length
      ? '<p><strong>' + escapeHtml(locale === 'ar' ? 'يفضل' : locale === 'fr' ? 'Atouts' : 'Nice to have') + ':</strong></p><ul>' +
        job.niceToHave.map((item) => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>'
      : '',
  ].filter(Boolean).join('');

  const jobPosting = {
    '@type': 'JobPosting',
    title: locale === 'ar' ? job.titleAr : job.titleOriginal,
    description: htmlDescription,
    identifier: { '@type': 'PropertyValue', name: 'ezyjobs', value: job.id },
    datePosted: job.publishedAt,
    employmentType: employmentType[job.commitment] || job.commitment.toUpperCase(),
    directApply: false,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
      ...(job.companyUrl ? { sameAs: job.companyUrl } : {}),
    },
    ...(job.workMode === 'remote' ? { jobLocationType: 'TELECOMMUTE' } : {}),
    ...(countries.length
      ? { applicantLocationRequirements: countries.length === 1 ? countries[0] : countries }
      : {}),
    occupationalCategory: categoryName(job.category),
    experienceRequirements: experienceName(job.experience),
    skills: job.skills.join(', '),
    ...(baseSalary ? { baseSalary } : {}),
    url: seo.canonical,
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      jobPosting,
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: locale === 'ar' ? 'الرئيسية' : locale === 'fr' ? 'Accueil' : 'Home',
            item: SITE_URL + (locale === 'ar' ? '/' : locale === 'fr' ? '/fr/emplois' : '/en/jobs'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'ar' ? 'الوظائف' : locale === 'fr' ? 'Emplois' : 'Jobs',
            item: SITE_URL + localizedJobPath(locale, job.slug).replace(/\/[^/]+$/, ''),
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: locale === 'ar' ? job.titleAr : job.titleOriginal,
            item: seo.canonical,
          },
        ],
      },
    ],
  };
};
