import type {
  Job,
  JobFilters,
  MatchResult,
  MatchVerdict,
  SeekerProfile,
} from '../types';
import {
  WORLDWIDE,
  countryName,
  experienceOrder,
  languageName,
  proficiencyName,
  proficiencyRank,
  workModeName,
} from '../data/taxonomy';

/* ------------------------------------------------------------------ */
/* الأهلية الجغرافية                                                    */
/* ------------------------------------------------------------------ */

export const acceptsCountry = (job: Job, country: string): boolean | 'unclear' => {
  if (job.eligibility === 'closed') return false;
  if (job.eligibleRegions.includes(WORLDWIDE)) {
    return job.eligibility === 'unclear' ? 'unclear' : true;
  }
  if (job.eligibleRegions.includes(country)) return true;
  return false;
};

const regionsText = (job: Job) => {
  if (job.eligibleRegions.includes(WORLDWIDE)) return 'أي دولة';
  const arab = job.eligibleRegions.filter((r) => r !== WORLDWIDE).map(countryName);
  if (arab.length <= 3) return arab.join('، ');
  return `${arab.slice(0, 3).join('، ')} وغيرها`;
};

/* ------------------------------------------------------------------ */
/* المطابقة النصية                                                      */
/* ------------------------------------------------------------------ */

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[ً-ٰٟ]/g, '')
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}\s+#.]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const jobHaystack = (job: Job) =>
  normalize(
    [
      job.titleAr,
      job.titleOriginal,
      job.company,
      job.summaryAr,
      job.descriptionAr,
      job.skills.join(' '),
      job.requirements.join(' '),
    ].join(' '),
  );

export const matchesQuery = (job: Job, query: string) => {
  const q = normalize(query);
  if (!q) return true;
  const hay = jobHaystack(job);
  return q
    .split(' ')
    .filter(Boolean)
    .every((term) => hay.includes(term));
};

/* ------------------------------------------------------------------ */
/* محرك الملاءمة                                                        */
/* ------------------------------------------------------------------ */

const overlap = <T,>(a: T[], b: T[]): T[] => a.filter((x) => b.includes(x));

export const matchJob = (job: Job, p: SeekerProfile): MatchResult => {
  const pros: string[] = [];
  const cons: string[] = [];
  const notes: string[] = [];
  const missingSkills: string[] = [];

  let score = 0;

  /* 1. الأهلية الجغرافية — عامل حاسم */
  const geo = acceptsCountry(job, p.country);
  if (geo === true) {
    score += 26;
    if (job.eligibility === 'open') {
      pros.push(`الإعلان يذكر صراحة أن المتقدمين من ${countryName(p.country)} مقبولون.`);
    } else {
      pros.push(`${countryName(p.country)} ضمن الدول المقبولة في هذا الإعلان.`);
    }
  } else if (geo === 'unclear') {
    score += 9;
    notes.push(
      `الإعلان يذكر العمل عن بُعد دون تحديد الدول المقبولة. لا تفترض أن ${countryName(p.country)} مؤهلة — راجع صفحة التقديم قبل إرسال ملفك.`,
    );
  } else {
    cons.push(
      `الوظيفة غير متاحة لـ${countryName(p.country)}. الدول المقبولة: ${regionsText(job)}.`,
    );
  }

  /* 2. نوع العمل */
  if (job.workMode === 'remote') {
    score += 16;
    if (p.remoteOnly) {
      pros.push('العمل عن بُعد بالكامل، وهو ما تبحث عنه.');
    } else {
      pros.push('العمل عن بُعد بالكامل.');
    }
  } else if (p.remoteOnly) {
    cons.push(`نمط العمل ${workModeName(job.workMode)} وليس عن بُعد.`);
  } else if (job.workMode === 'hybrid') {
    score += 6;
    notes.push(`نمط العمل ${workModeName(job.workMode)}: سيتطلب حضوراً جزئياً.`);
  }

  /* 3. الخبرة — الفارق الأهم للطالب والمبتدئ */
  const jobLevel = experienceOrder(job.experience);
  const userLevel = experienceOrder(p.level === 'mid' ? 'mid' : p.level);
  const gap = jobLevel - userLevel;

  if (job.experienceYears === 0) {
    score += 18;
    if (p.level === 'student' || p.level === 'entry') {
      pros.push('لا تشترط خبرة سابقة — يمكن التقديم مباشرة.');
    } else {
      pros.push('لا تشترط خبرة سابقة.');
    }
  } else if (gap <= 0) {
    score += 12;
    pros.push('مستوى الخبرة المطلوب يناسب مستواك.');
  } else if (gap === 1) {
    score += 3;
      cons.push(
        `تطلب خبرة تقارب ${job.experienceYears} سنوات، وقد تكون أعلى من مستواك الحالي.`,
      );
  } else {
    cons.push(
      `تطلب خبرة ${job.experienceYears} سنوات على الأقل، وهي أعلى من مستواك بدرجة أو درجتين.`,
    );
  }

  /* 4. الدوام / نوع التعاقد */
  if (p.commitments.includes(job.commitment)) {
    score += 10;
    pros.push('نوع الدوام المطلوب ضمن تفضيلاتك.');
  } else if (job.commitment === 'part-time' || job.commitment === 'internship') {
    score += 4;
    notes.push('دوام جزئي أو تدريب — مختلف عن تفضيلك، لكنه يفتح لك باباً أولياً.');
  }

  if (p.hoursPerWeek && job.weeklyHours) {
    if (job.weeklyHours <= p.hoursPerWeek) {
      score += 6;
      pros.push(`الوقت المطلوب (${job.weeklyHours} ساعة أسبوعياً) يناسب ما تتوفر عليه.`);
    } else {
      cons.push(
        `تحتاج ${job.weeklyHours} ساعة أسبوعياً، وأنت متوفر على ${p.hoursPerWeek}.`,
      );
    }
  }

  /* 5. اللغة */
  const userLangs = new Map(
    p.languages.map((l) => [l.code, proficiencyRank(l.level)] as const),
  );

  for (const l of job.languages.filter((x) => x.required)) {
    const mine = userLangs.get(l.code) ?? 0;
    if (mine >= proficiencyRank(l.level)) {
      score += 8;
    } else if (mine > 0) {
      score += 2;
      cons.push(
        `تتطلب ${languageName(l.code)} بمستوى ${proficiencyName(l.level)}، ومستواك الحالي أقل.`,
      );
    } else {
      cons.push(`تتطلب ${languageName(l.code)}، ولم تُحدّد مستواك فيها.`);
    }
  }
  if (p.languages.some((l) => l.code === 'ar' && l.level === 'native')) {
    const wantsAr = job.languages.some((l) => l.code === 'ar' && l.required);
    if (wantsAr) {
      score += 4;
      pros.push('العربية من متطلبات الوظيفة وأنت متحدث أصلي بها.');
    }
  }

  /* 6. المجال */
  if (p.categories.includes(job.category)) {
    score += 8;
    pros.push('المجال ضمن تفضيلاتك.');
  }

  /* 7. المهارات */
  const mine = p.skills.map(normalize).filter(Boolean);
  if (mine.length) {
    const skills = job.skills.map(normalize);
    const hits = skills.filter((s) => mine.some((m) => s.includes(m) || m.includes(s)));
    if (hits.length) {
      score += Math.min(8, hits.length * 3);
      pros.push(`لديك خبرة في: ${hits.slice(0, 3).join('، ')}.`);
    }
    const gaps = skills.filter((s) => !mine.some((m) => s.includes(m) || m.includes(s)));
    missingSkills.push(...gaps.slice(0, 5));
    if (gaps.length) {
      cons.push(`مهارات مطلوبة لم تُدرجها في ملفك: ${gaps.slice(0, 3).join('، ')}.`);
    }
  }

  /* 8. الطالب */
  if (job.suitableForStudents) {
    score += 5;
    if (p.level === 'student') {
      pros.push('مصنّفة رسمياً كفرصة مناسبة للطلاب.');
    }
  } else if (p.level === 'student') {
    cons.push('ليست مصنّفة كفرصة للطلاب أثناء الدراسة.');
  }

  /* 9. ملاحظات إضافية */
  if (job.eligibility === 'unclear') {
    notes.push('الأهلية الجغرافية غير محددة في الإعلان — تحقق قبل التقديم.');
  }
  if (job.timezoneNote && p.remoteOnly) {
    notes.push(job.timezoneNote);
  }
  if (job.education && job.education.includes('بكالوريوس') && p.level === 'student') {
    notes.push(`المؤهل المطلوب: ${job.education}.`);
  }

  const verdict = resolveVerdict(score, geo, gap);
  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    verdict,
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 4),
    notes: notes.slice(0, 3),
    missingSkills: missingSkills.slice(0, 5),
  };
};

function resolveVerdict(
  score: number,
  geo: boolean | 'unclear',
  gap: number,
): MatchVerdict {
  if (geo === false) return 'blocked';
  if (geo === 'unclear' && score < 55) return 'weak';
  if (score >= 78) return 'strong';
  if (score >= 62) return 'good';
  if (score >= 45) return 'fair';
  if (gap >= 2) return 'blocked';
  return 'weak';
}

export const VERDICT_LABEL: Record<MatchVerdict, string> = {
  strong: 'ملاءمة عالية',
  good: 'ملاءمة جيدة',
  fair: 'ملاءمة مقبولة',
  weak: 'ملاءمة ضعيفة',
  blocked: 'غير مؤهلة لك',
};

export const VERDICT_TONE: Record<MatchVerdict, string> = {
  strong: 'tone-positive',
  good: 'tone-brand',
  fair: 'tone-caution',
  weak: 'tone-neutral',
  blocked: 'tone-negative',
};

/* ------------------------------------------------------------------ */
/* الفلترة والترتيب                                                     */
/* ------------------------------------------------------------------ */

export const filterJobs = (
  jobs: Job[],
  f: JobFilters,
  profile?: SeekerProfile,
): Job[] => {
  const out = jobs.filter((job) => {
    if (job.status !== 'published') return false;
    if (!matchesQuery(job, f.q)) return false;
    if (f.category !== 'all' && job.category !== f.category) return false;
    if (f.workMode !== 'any' && job.workMode !== f.workMode) return false;
    if (f.commitment !== 'any' && job.commitment !== f.commitment) return false;
    if (f.experience !== 'any' && job.experience !== f.experience) return false;
    if (f.language !== 'any' && !job.languages.some((l) => l.code === f.language))
      return false;
    if (f.eligibility !== 'any' && job.eligibility !== f.eligibility) return false;
    if (f.studentsOnly && !job.suitableForStudents) return false;
    if (f.noExperienceOnly && job.experienceYears > 0) return false;
    if (f.country !== 'all' && acceptsCountry(job, f.country) !== true) return false;
    return true;
  });

  const withScore = out.map((job) => ({
    job,
    score: profile ? matchJob(job, profile).score : relevanceScore(job, f.q),
  }));

  switch (f.sort) {
    case 'newest':
      withScore.sort(
        (a, b) =>
          new Date(b.job.publishedAt).getTime() - new Date(a.job.publishedAt).getTime(),
      );
      break;
    case 'salary-high':
      withScore.sort((a, b) => salaryValue(b.job) - salaryValue(a.job));
      break;
    case 'salary-low':
      withScore.sort((a, b) => salaryValue(a.job) - salaryValue(b.job));
      break;
    default:
      withScore.sort((a, b) => b.score - a.score);
  }

  return withScore.map((x) => x.job);
};

const relevanceScore = (job: Job, q: string) => {
  let s = 0;
  const firstTerm = normalize(q).split(' ')[0];
  if (firstTerm && jobHaystack(job).includes(firstTerm)) s += 30;
  if (job.eligibility === 'open') s += 25;
  if (job.workMode === 'remote') s += 20;
  if (job.experienceYears === 0) s += 15;
  if (job.suitableForStudents) s += 10;
  return s;
};

const salaryValue = (job: Job) => {
  const s = job.salary;
  if (!s?.max) return -1;
  const perMonth =
    s.period === 'hour' ? s.max * 160 : s.period === 'year' ? s.max / 12 : s.max;
  return perMonth;
};

export const activeFilterCount = (f: JobFilters) =>
  [
    f.category !== 'all',
    f.workMode !== 'any',
    f.commitment !== 'any',
    f.experience !== 'any',
    f.language !== 'any',
    f.eligibility !== 'any',
    f.studentsOnly,
    f.noExperienceOnly,
    f.country !== 'all',
  ].filter(Boolean).length;

export const topMissingSkills = (jobs: Job[], profile: SeekerProfile) => {
  const counter = new Map<string, number>();
  for (const job of jobs) {
    for (const s of matchJob(job, profile).missingSkills) {
      counter.set(s, (counter.get(s) ?? 0) + 1);
    }
  }
  return [...counter.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
};

export const sharedSkills = (job: Job, profile: SeekerProfile) => {
  const mine = profile.skills.map(normalize);
  return job.skills.filter((s) => {
    const n = normalize(s);
    return mine.some((m) => n.includes(m) || m.includes(n));
  });
};
