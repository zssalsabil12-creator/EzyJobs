export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export type Commitment =
  | 'full-time'
  | 'part-time'
  | 'internship'
  | 'freelance'
  | 'contract';

export type ExperienceLevel = 'student' | 'entry' | 'junior' | 'mid' | 'senior';

/** حالة التأهل الجغرافي — جوهر قيمة المنصة */
export type Eligibility = 'open' | 'limited' | 'unclear' | 'closed';

export interface KeywordDemandRow {
  keyword: string;
  locale: 'ar' | 'en' | 'fr';
  geo: string;
  intent: string;
  suggestions: string[];
  suggestionCount: number;
  jobMatches: number;
  demandScore: number;
  sourceQueryCount?: number;
  searchScore?: number;
  normalized?: string;
  trendScore?: number;
  demandSignals: string[];
  capturedAt: string;
  trendTraffic?: string;
  trendStarted?: string;
}

export interface KeywordDemandRole {
  title: string;
  count: number;
  remoteCount: number;
  directCount: number;
}

export interface KeywordDemandSnapshot {
  generatedAt: string;
  methodology: { description: string; searchSource: string; trendSource: string; jobSource: string };
  keywords: KeywordDemandRow[];
  inDemandRoles: KeywordDemandRole[];
  errors: { kind?: string; term?: string; geo?: string; error: string }[];
}
export type EligibilityEvidenceKind = 'employer' | 'posting' | 'terms' | 'feed';

export interface EligibilityEvidence {
  kind: EligibilityEvidenceKind;
  status: Eligibility;
  countries: string[];
  label: string;
  sourceName: string;
  url: string;
  capturedAt: string;
  note?: string;
}

export type LanguageCode = 'ar' | 'en' | 'fr' | 'es' | 'de' | 'tr' | 'other';

export type LanguageProficiency = 'native' | 'fluent' | 'intermediate' | 'basic';

export type JobStatus = 'published' | 'draft' | 'expired';

export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface Salary {
  min?: number;
  max?: number;
  currency: string;
  period: 'hour' | 'month' | 'year' | 'project';
  note?: string;
}

export interface JobLanguage {
  code: LanguageCode;
  level: LanguageProficiency;
  required: boolean;
}

export interface JobSource {
  name: string;
  url: string;
  distribution?: 'direct' | 'aggregator';
  /** مصدر يسمح بإعادة توزيع بياناته */
  redistributable: boolean;
  partner: boolean;
}

export interface Job {
  id: string;
  slug: string;

  titleAr: string;
  /** المسمى الأصلي كما ورد في المصدر */
  titleOriginal: string;

  company: string;
  companyUrl?: string;

  category: string;
  workMode: WorkMode;
  commitment: Commitment;
  experience: ExperienceLevel;
  /** 0 = لا تتطلب خبرة سابقة */
  experienceYears: number;

  eligibility: Eligibility;
  eligibilityEvidence?: EligibilityEvidence[];
  /** رموز الدول المقبولة، أو ['worldwide'] */
  eligibleRegions: string[];
  timezoneNote?: string;

  languages: JobLanguage[];
  salary?: Salary;

  /** ملخص عربي مُولَّد */
  summaryAr: string;
  descriptionAr: string;

  skills: string[];
  requirements: string[];
  niceToHave: string[];

  suitableForStudents: boolean;
  weeklyHours?: number;
  education?: string;

  source: JobSource;
  applyUrl: string;

  publishedAt: string;
  verifiedAt: string;
  status: JobStatus;

  views: number;
  views7d: number[];
}

/* ------------------------------------------------------------------ */
/* ملف الباحث عن العمل — يُستخدم في محرك الملاءمة                      */
/* ------------------------------------------------------------------ */

export type SeekerLevel = 'student' | 'entry' | 'junior' | 'mid';

export interface SeekerProfile {
  country: string;
  level: SeekerLevel;
  remoteOnly: boolean;
  commitments: Commitment[];
  languages: { code: LanguageCode; level: LanguageProficiency }[];
  skills: string[];
  categories: string[];
  hoursPerWeek?: number;
  cvFileName?: string;
  cvParsedAt?: string;
  cvEducation?: string[];
  cvExperience?: string[];
  cvRoles?: string[];
  cvWarnings?: string[];
}

export type MatchVerdict = 'strong' | 'good' | 'fair' | 'weak' | 'blocked';

export interface MatchResult {
  score: number;
  verdict: MatchVerdict;
  /** «قد تناسبك لأن…» */
  pros: string[];
  /** «ما الذي قد يمنعك…» */
  cons: string[];
  /** ملاحظات توضيحية / غموض */
  notes: string[];
  missingSkills: string[];
}

/* ------------------------------------------------------------------ */
/* الفلاتر                                                             */
/* ------------------------------------------------------------------ */

export type SortKey = 'relevance' | 'newest' | 'salary-high' | 'salary-low';

export interface JobFilters {
  q: string;
  category: string;
  workMode: WorkMode | 'any';
  commitment: Commitment | 'any';
  experience: ExperienceLevel | 'any';
  country: string;
  language: LanguageCode | 'any';
  eligibility: Eligibility | 'any';
  studentsOnly: boolean;
  noExperienceOnly: boolean;
  sort: SortKey;
}

export const emptyFilters: JobFilters = {
  q: '',
  category: 'all',
  workMode: 'any',
  commitment: 'any',
  experience: 'any',
  country: 'all',
  language: 'any',
  eligibility: 'any',
  studentsOnly: false,
  noExperienceOnly: false,
  sort: 'relevance',
};

/* ------------------------------------------------------------------ */
/* ملفات الناشر                                                         */
/* ------------------------------------------------------------------ */

export interface PublisherProfile {
  id: string;
  username: string;
  role: 'publisher';
  createdAt: string;
}
