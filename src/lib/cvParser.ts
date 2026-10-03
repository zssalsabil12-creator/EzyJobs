// @ts-expect-error Vite ?url import is runtime-resolved.
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { LanguageCode, LanguageProficiency, SeekerProfile } from '../types';

export interface ParsedCv {
  fileName: string;
  text: string;
  skills: string[];
  languages: { code: LanguageCode; level: LanguageProficiency }[];
  education: string[];
  experience: string[];
  roles: string[];
  categories: string[];
  level: SeekerProfile['level'];
  warnings: string[];
}

const SKILLS = [
  'R', 'Python', 'SQL', 'Excel', 'Figma', 'React', 'TypeScript',
  'JavaScript', 'HTML', 'CSS', 'Tailwind', 'SEO', 'Canva',
  'Data Analysis', 'Data Entry', 'Customer Support', 'Content Writing',
  'Scientific Writing', 'Research', 'Marketing', 'Social Media',
  'Project Management', 'Translation', 'Teaching', 'Microbiology',
  'Bioinformatics', 'Git',
];

const ROLE_HINTS: Record<string, string[]> = {
  development: ['developer', 'frontend', 'backend', 'software', 'react', 'typescript', 'javascript'],
  data: ['data', 'analyst', 'analytics', 'sql', 'excel', 'machine learning'],
  support: ['support', 'customer service', 'customer support', 'خدمة العملاء'],
  writing: ['writer', 'content', 'copywriter', 'scientific writing', 'كاتب', 'محتوى'],
  marketing: ['marketing', 'seo', 'social media', 'growth', 'تسويق'],
  education: ['teacher', 'teaching', 'tutor', 'education', 'مدرس', 'تعليم'],
  science: ['microbiology', 'biology', 'research', 'laboratory', 'bioinformatics', 'microbiologie'],
  design: ['designer', 'design', 'figma', 'ui', 'ux'],
};

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u064B-\u065F]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

const has = (text: string, term: string) => normalize(text).includes(normalize(term));

const detectLevel = (text: string, years: number): SeekerProfile['level'] => {
  if (/student|undergraduate|intern|طالب|تربص|internship/i.test(text)) return 'student';
  if (years >= 5) return 'mid';
  if (years >= 2) return 'junior';
  return 'entry';
};

export async function extractPdfText(file: File): Promise<string> {
  // @ts-expect-error PDF.js v6 ships runtime ESM without a TS declaration for this subpath.
  const pdfjs = (await import('pdfjs-dist/build/pdf.mjs')) as {
    getDocument: (options: { data: Uint8Array }) => {
      promise: Promise<{
        numPages: number;
        getPage: (page: number) => Promise<{
          getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
        }>;
      }>;
    };
  };
  const { GlobalWorkerOptions, getDocument } = pdfjs as typeof pdfjs & { GlobalWorkerOptions?: { workerSrc: string } };
  if (GlobalWorkerOptions) GlobalWorkerOptions.workerSrc = workerUrl;
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i += 1) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: { str?: string }) => item.str ?? '').join(' '));
  }
  return pages.join('\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

export async function parseCvFile(file: File): Promise<ParsedCv> {
  const warnings: string[] = [];
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('يرجى اختيار ملف PDF للسيرة الذاتية.');
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('حجم السيرة كبير جداً. الحد الحالي 8 ميغابايت.');
  }

  const text = await extractPdfText(file);
  if (!text.trim()) {
    warnings.push('لم نتمكن من استخراج نص قابل للقراءة. قد تكون السيرة عبارة عن صور ممسوحة ضوئياً.');
  }

  const skills = SKILLS.filter((skill) => has(text, skill));
  const languages: ParsedCv['languages'] = [];
  if (has(text, 'Arabic') || has(text, 'العربية')) languages.push({ code: 'ar', level: /native|mother tongue|لغة أم/i.test(text) ? 'native' : 'fluent' });
  if (has(text, 'English') || has(text, 'الانجليزية') || has(text, 'الإنجليزية')) {
    const level = /C1|advanced|fluent|professional/i.test(text) ? 'fluent' : /B2|intermediate|متوسط/i.test(text) ? 'intermediate' : 'basic';
    languages.push({ code: 'en', level });
  }
  if (has(text, 'French') || has(text, 'français') || has(text, 'الفرنسية')) languages.push({ code: 'fr', level: 'intermediate' });

  const years = [...text.matchAll(/(\d+)\s*\+?\s*(?:years?|ans|سنوات?)/gi)]
    .map((m) => Number(m[1]))
    .filter(Number.isFinite)
    .reduce((max, n) => Math.max(max, n), 0);

  const roles = Object.entries(ROLE_HINTS)
    .filter(([, terms]) => terms.some((term) => has(text, term)))
    .map(([role]) => role);

  const education = text
    .split(/\n|•|·/)
    .map((line) => line.trim())
    .filter((line) => /bachelor|master|phd|licence|master|doctorat|universit|degree|baccalaureat|ماستر|ليسانس|دكتوراه|جامعة|شهادة/i.test(line))
    .slice(0, 8);

  const experience = text
    .split(/\n|•|·/)
    .map((line) => line.trim())
    .filter((line) => /experience|work history|professional|خبرة|عمل|emploi|stage/i.test(line))
    .slice(0, 12);

  const categories = [...new Set(roles.filter((role) => role !== 'science'))];
  const level = detectLevel(text, years);

  if (!skills.length) warnings.push('لم نكتشف مهارات معروفة آلياً. راجع المهارات يدوياً قبل اعتماد الملف.');
  if (!languages.length) warnings.push('لم نكتشف لغة موثوقة من النص. أضف لغاتك يدوياً.');
  if (!education.length) warnings.push('لم نحدد مؤهلاً تعليمياً بشكل واضح.');

  return {
    fileName: file.name,
    text,
    skills,
    languages,
    education,
    experience,
    roles,
    categories,
    level,
    warnings,
  };
}

