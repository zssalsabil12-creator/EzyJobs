import type { Job } from '../types';

export type JobFreshness = 'new' | 'recent' | 'aging' | 'stale' | 'unknown';

const DAY = 86_400_000;

export function jobAgeDays(job: Job, now = Date.now()): number | null {
  const time = Date.parse(job.publishedAt);
  if (!Number.isFinite(time)) return null;
  return Math.max(0, Math.floor((now - time) / DAY));
}

export function jobFreshness(job: Job, now = Date.now()): JobFreshness {
  const age = jobAgeDays(job, now);
  if (age === null) return 'unknown';
  if (age <= 3) return 'new';
  if (age <= 14) return 'recent';
  if (age <= 30) return 'aging';
  return 'stale';
}

export function freshnessLabel(job: Job, locale: 'ar' | 'en' | 'fr' = 'ar'): string {
  const state = jobFreshness(job);
  const labels = {
    ar: { new: 'جديدة', recent: 'حديثة', aging: 'تحتاج مراجعة', stale: 'قديمة', unknown: 'تاريخ غير واضح' },
    en: { new: 'New', recent: 'Recent', aging: 'Review age', stale: 'Stale', unknown: 'Date unclear' },
    fr: { new: 'Nouvelle', recent: 'Récente', aging: 'À vérifier', stale: 'Ancienne', unknown: 'Date incertaine' },
  } as const;
  return labels[locale][state];
}

export function freshnessHint(job: Job, locale: 'ar' | 'en' | 'fr' = 'ar'): string {
  const age = jobAgeDays(job);
  const state = jobFreshness(job);
  if (age === null) {
    return locale === 'fr'
      ? 'La date de publication n’a pas pu être vérifiée.'
      : locale === 'en'
        ? 'The publication date could not be verified.'
        : 'تعذر التحقق من تاريخ نشر الإعلان.';
  }
  if (state === 'stale') {
    const text = 'Published ' + age + ' days ago.';
    return locale === 'fr'
      ? 'Annonce publiée il y a ' + age + ' jours. Vérifiez qu’elle est toujours ouverte avant de postuler.'
      : locale === 'en'
        ? text + ' Verify that the original posting is still open before applying.'
        : 'نُشر الإعلان منذ ' + age + ' يومًا. تحقق من بقاء الإعلان مفتوحًا قبل التقديم.';
  }
  if (state === 'aging') {
    return locale === 'fr'
      ? 'Annonce publiée il y a ' + age + ' jours; une vérification récente est recommandée.'
      : locale === 'en'
        ? 'Published ' + age + ' days ago; a recent re-check is recommended.'
        : 'نُشر الإعلان منذ ' + age + ' يومًا؛ يُنصح بإعادة التحقق منه قبل التقديم.';
  }
  return locale === 'fr'
    ? 'La date de publication est suffisamment récente.'
    : locale === 'en'
      ? 'The publication date is recent enough for normal review.'
      : 'تاريخ النشر حديث بما يكفي للمراجعة العادية.';
}

export function freshnessTone(job: Job): 'positive' | 'caution' | 'negative' | 'neutral' {
  const state = jobFreshness(job);
  if (state === 'new' || state === 'recent') return 'positive';
  if (state === 'aging') return 'caution';
  if (state === 'stale') return 'negative';
  return 'neutral';
}

