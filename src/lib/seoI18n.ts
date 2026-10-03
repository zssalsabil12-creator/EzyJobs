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
  return [
    copy.intro,
    copy.remote,
    copy.commitment,
    copy.experience,
    copy.eligibility,
    copy.skills,
  ].join(' ');
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

const employmentType: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  internship: 'INTERN',
  freelance: 'CONTRACTOR',
  contract: 'CONTRACTOR',
};

export const jobPostingJsonLd = (job: Job, locale: SiteLocale = 'en') => {
  if (job.source.distribution === 'aggregator') return undefined;
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
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: locale === 'ar' ? job.titleAr : job.titleOriginal,
    description: jobDescription(job, locale),
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
};
