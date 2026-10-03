import type {
  Commitment,
  Eligibility,
  ExperienceLevel,
  LanguageCode,
  LanguageProficiency,
  WorkMode,
} from '../types';

/* ------------------------------------------------------------------ */
/* الدول العربية — محور التصفية الجغرافية                              */
/* ------------------------------------------------------------------ */

export const COUNTRIES: {
  code: string;
  name: string;
  /** مخصص لصفحات SEO: مثال: algeria */
  slug: string;
  /** صيغة نوايا البحث المحلية: للجزائر — للجزائريين */
  demonym: string;
}[] = [
  { code: 'DZ', name: 'الجزائر', slug: 'algeria', demonym: 'للجزائريين' },
  { code: 'MA', name: 'المغرب', slug: 'morocco', demonym: 'للمغاربة' },
  { code: 'TN', name: 'تونس', slug: 'tunisia', demonym: 'للتونسين' },
  { code: 'EG', name: 'مصر', slug: 'egypt', demonym: 'للمصريين' },
  { code: 'SA', name: 'السعودية', slug: 'saudi-arabia', demonym: 'للسعوديين' },
  { code: 'AE', name: 'الإمارات', slug: 'uae', demonym: 'لِلإماراتيين' },
  { code: 'KW', name: 'الكويت', slug: 'kuwait', demonym: 'للكويتيين' },
  { code: 'QA', name: 'قطر', slug: 'qatar', demonym: 'للقطريين' },
  { code: 'BH', name: 'البحرين', slug: 'bahrain', demonym: 'للبحرينيين' },
  { code: 'OM', name: 'عُمان', slug: 'oman', demonym: 'للعمانيين' },
  { code: 'JO', name: 'الأردن', slug: 'jordan', demonym: 'للأردنيين' },
  { code: 'LB', name: 'لبنان', slug: 'lebanon', demonym: 'للبنانيين' },
  { code: 'PS', name: 'فلسطين', slug: 'palestine', demonym: 'للفلسطينيين' },
  { code: 'IQ', name: 'العراق', slug: 'iraq', demonym: 'للعراقيين' },
  { code: 'SY', name: 'سوريا', slug: 'syria', demonym: 'للسوريين' },
  { code: 'YE', name: 'اليمن', slug: 'yemen', demonym: 'لليمنيين' },
  { code: 'SD', name: 'السودان', slug: 'sudan', demonym: 'للسودانيين' },
  { code: 'LY', name: 'ليبيا', slug: 'libya', demonym: 'للليبيين' },
  { code: 'MR', name: 'موريتانيا', slug: 'mauritania', demonym: 'لموريتاني' },
  { code: 'SO', name: 'الصومال', slug: 'somalia', demonym: 'للصوماليين' },
  { code: 'DJ', name: 'جيبوتي', slug: 'djibouti', demonym: 'لجيبوتي' },
  { code: 'KM', name: 'جزر القمر', slug: 'comoros', demonym: 'لجزر القمر' },
];

export const findCountry = (code: string) => COUNTRIES.find((c) => c.code === code);
/** يقبل رمز الدولة أو slugها */
export const countryBySlug = (key: string) =>
  COUNTRIES.find((c) => c.slug === key.toLowerCase()) ?? findCountry(key.toUpperCase());

export const countryName = (code: string) =>
  COUNTRIES.find((c) => c.code === code)?.name ?? OTHER_REGIONS[code] ?? code;

/** أسماء الدول غير العربية التي تظهر في قيود الأهلية */
const OTHER_REGIONS: Record<string, string> = {
  US: 'الولايات المتحدة',
  CA: 'كندا',
  UK: 'بريطانيا',
  GB: 'بريطانيا',
  IE: 'أيرلندا',
  DE: 'ألمانيا',
  NL: 'هولندا',
  BE: 'بلجيكا',
  FR: 'فرنسا',
  ES: 'إسبانيا',
  PT: 'البرتغال',
  IT: 'إيطاليا',
  PL: 'بولندا',
  CZ: 'التشيك',
  RO: 'رومانيا',
  GR: 'اليونان',
  SE: 'السويد',
  NO: 'النرويج',
  DK: 'الدنمارك',
  FI: 'فنلندا',
  CH: 'سويسرا',
  AT: 'النمسا',
  IN: 'الهند',
  PK: 'باكستان',
  PH: 'الفلبين',
  ID: 'إندونيسيا',
  MY: 'ماليزيا',
  SG: 'سنغافورة',
  AU: 'أستراليا',
  NZ: 'نيوزيلندا',
  BR: 'البرازيل',
  MX: 'المكسيك',
  AR: 'الأرجنتين',
  ZA: 'جنوب أفريقيا',
  NG: 'نيجيريا',
  KE: 'كينيا',
  GH: 'غانا',
  AM: 'أرمينيا',
  GE: 'جورجيا',
  KZ: 'كازاخستان',
  UZ: 'أوزبكستان',
  AZ: 'أذربيجان',
  GLOBAL: 'كل الدول',
};

export const WORLDWIDE = 'worldwide';

/* ------------------------------------------------------------------ */
/* التصنيفات                                                           */
/* ------------------------------------------------------------------ */

export const CATEGORIES: {
  id: string;
  name: string;
  latin: string;
  /** مخصص لصفحات SEO: customer-support */
  slug: string;
}[] = [
  { id: 'data', name: 'بيانات وتحليل', latin: 'Data', slug: 'data' },
  {
    id: 'support',
    name: 'خدمة عملاء',
    latin: 'Customer Support',
    slug: 'customer-support',
  },
  { id: 'marketing', name: 'تسويق رقمي', latin: 'Marketing', slug: 'marketing' },
  { id: 'design', name: 'تصميم', latin: 'Design', slug: 'design' },
  { id: 'development', name: 'برمجة وتطوير', latin: 'Development', slug: 'development' },
  { id: 'writing', name: 'كتابة وترجمة', latin: 'Writing', slug: 'writing' },
  { id: 'education', name: 'تعليم وتدريب', latin: 'Education', slug: 'teaching' },
  { id: 'finance', name: 'محاسبة ومالية', latin: 'Finance', slug: 'finance' },
  { id: 'sales', name: 'مبيعات', latin: 'Sales', slug: 'sales' },
  { id: 'hr', name: 'موارد بشرية', latin: 'Human Resources', slug: 'human-resources' },
  { id: 'operations', name: 'تشغيل وإدارة', latin: 'Operations', slug: 'operations' },
  { id: 'other', name: 'أخرى', latin: 'Other', slug: 'other' },
];

export const categoryName = (id: string) =>
  CATEGORIES.find((c) => c.id === id)?.name ?? 'أخرى';

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
export const findCategory = (id: string) => CATEGORIES.find((c) => c.id === id);

/* ------------------------------------------------------------------ */
/* خصائص الوظيفة                                                       */
/* ------------------------------------------------------------------ */

export const WORK_MODES: { id: WorkMode; name: string; short: string }[] = [
  { id: 'remote', name: 'عن بُعد بالكامل', short: 'Remote' },
  { id: 'hybrid', name: 'هجين', short: 'Hybrid' },
  { id: 'onsite', name: 'في الموقع', short: 'On-site' },
];

export const workModeName = (id: WorkMode) =>
  WORK_MODES.find((m) => m.id === id)?.name ?? id;

export const COMMITMENTS: { id: Commitment; name: string; short: string }[] = [
  { id: 'full-time', name: 'دوام كامل', short: 'Full-time' },
  { id: 'part-time', name: 'دوام جزئي', short: 'Part-time' },
  { id: 'internship', name: 'تدريب', short: 'Internship' },
  { id: 'freelance', name: 'عمل حر', short: 'Freelance' },
  { id: 'contract', name: 'عقد مؤقت', short: 'Contract' },
];

export const commitmentName = (id: Commitment) =>
  COMMITMENTS.find((c) => c.id === id)?.name ?? id;

export const EXPERIENCE_LEVELS: {
  id: ExperienceLevel;
  name: string;
  short: string;
  years: number;
  order: number;
}[] = [
  { id: 'student', name: 'طالب / أثناء الدراسة', short: 'Student', years: 0, order: 0 },
  { id: 'entry', name: 'مبتدئ / بدون خبرة', short: 'Entry', years: 0, order: 1 },
  { id: 'junior', name: 'junior', short: 'Junior', years: 1, order: 2 },
  { id: 'mid', name: 'خبرة متوسطة', short: 'Mid', years: 3, order: 3 },
  { id: 'senior', name: 'خبرة متقدمة', short: 'Senior', years: 5, order: 4 },
];

export const experienceName = (id: ExperienceLevel) =>
  EXPERIENCE_LEVELS.find((e) => e.id === id)?.name ?? id;

export const experienceOrder = (id: ExperienceLevel) =>
  EXPERIENCE_LEVELS.find((e) => e.id === id)?.order ?? 0;

/* ------------------------------------------------------------------ */
/* الأهلية الجغرافية                                                   */
/* ------------------------------------------------------------------ */

export const ELIGIBILITY: {
  id: Eligibility;
  name: string;
  hint: string;
  tone: 'positive' | 'caution' | 'negative' | 'muted';
}[] = [
  {
    id: 'open',
    name: 'مؤكدة',
    hint: 'الإعلان يذكر صراحة أن Toledo تطبيق من منطقتنا.',
    tone: 'positive',
  },
  {
    id: 'limited',
    name: 'محدودة',
    hint: 'يقبل مجموعة دول محددة، والدولة المطلوبة يجب التحقق منها.',
    tone: 'caution',
  },
  {
    id: 'unclear',
    name: 'غير واضحة',
    hint: 'الإعلان يذكر «Remote» دون تحديد الدول المقبولة.',
    tone: 'muted',
  },
  {
    id: 'closed',
    name: 'غير مؤهلة',
    hint: 'مقتضيات الإقامة أو التأشيرة تمنع التقديم من منطقتنا.',
    tone: 'negative',
  },
];

export const eligibilityName = (id: Eligibility) =>
  ELIGIBILITY.find((e) => e.id === id)?.name ?? id;

export const eligibilityHint = (id: Eligibility) =>
  ELIGIBILITY.find((e) => e.id === id)?.hint ?? '';

/* ------------------------------------------------------------------ */
/* اللغات                                                              */
/* ------------------------------------------------------------------ */

export const LANGUAGES: { id: LanguageCode; name: string; latin: string }[] = [
  { id: 'ar', name: 'العربية', latin: 'Arabic' },
  { id: 'en', name: 'الإنجليزية', latin: 'English' },
  { id: 'fr', name: 'الفرنسية', latin: 'French' },
  { id: 'es', name: 'الإسبانية', latin: 'Spanish' },
  { id: 'de', name: 'الألمانية', latin: 'German' },
  { id: 'tr', name: 'التركية', latin: 'Turkish' },
  { id: 'other', name: 'أخرى', latin: 'Other' },
];

export const languageName = (id: LanguageCode) =>
  LANGUAGES.find((l) => l.id === id)?.name ?? id;

export const LANGUAGE_PROFICIENCY: {
  id: LanguageProficiency;
  name: string;
  short: string;
  rank: number;
}[] = [
  { id: 'native', name: 'لغة أم', short: 'Native', rank: 3 },
  { id: 'fluent', name: 'إتقان تام', short: 'Fluent', rank: 3 },
  { id: 'intermediate', name: 'مستوى متوسط', short: 'B1–B2', rank: 2 },
  { id: 'basic', name: 'مستوى مبتدئ', short: 'A1–A2', rank: 1 },
];

export const proficiencyName = (id: LanguageProficiency) =>
  LANGUAGE_PROFICIENCY.find((l) => l.id === id)?.name ?? id;

export const proficiencyShort = (id: LanguageProficiency) =>
  LANGUAGE_PROFICIENCY.find((l) => l.id === id)?.short ?? id;

export const proficiencyRank = (id: LanguageProficiency) =>
  LANGUAGE_PROFICIENCY.find((l) => l.id === id)?.rank ?? 0;

/* ------------------------------------------------------------------ */
/* المصادر المسموح بإعادة توزيع بياناتها                                */
/* ------------------------------------------------------------------ */

export const SOURCES = [
  {
    name: 'Remote OK',
    latin: 'remoteok.com',
    access: 'API / RSS',
    redistributable: true,
  },
  {
    name: 'Remote.co',
    latin: 'remote.co',
    access: 'Job feed',
    redistributable: true,
  },
  {
    name: 'We Work Remotely',
    latin: 'weworkremotely.com',
    access: 'RSS feed',
    redistributable: true,
  },
  {
    name: ' Arbeitnow',
    latin: 'arbeitnow.com',
    access: 'API عام',
    redistributable: true,
  },
  {
    name: 'الوظائف الحكومية',
    latin: 'Official feeds',
    access: 'مصادر رسمية',
    redistributable: true,
  },
  {
    name: 'شركاء التوظيف',
    latin: 'Partners',
    access: 'شراكات نشر',
    redistributable: true,
  },
];
