export type SeoCheck = {
  key: string;
  label: string;
  points: number;
  passed: boolean;
  note: string;
  critical?: boolean;
};

export type WriterSeoResult = {
  score: number;
  wordCount: number;
  checks: SeoCheck[];
};

function words(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function countInternalLinks(html: string) {
  return (html.match(/href=["']\/(?!\/)/gi) ?? []).length;
}

function countHeadings(html: string) {
  return (html.match(/<h2\b/gi) ?? []).length + (html.match(/<h3\b/gi) ?? []).length;
}

export function analyzeWriterSeo(input: {
  title: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  slug: string;
  content: string;
  contentHtml: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
}): WriterSeoResult {
  const plainWords = words(input.content || input.contentHtml);
  const keyword = input.focusKeyword.trim().toLocaleLowerCase();
  const haystack = (input.title + ' ' + input.seoTitle + ' ' + input.seoDescription + ' ' + input.content)
    .toLocaleLowerCase();
  const checks: SeoCheck[] = [
    {
      key: 'title',
      label: 'عنوان المقال',
      points: 15,
      passed: input.seoTitle.trim().length >= 30 && input.seoTitle.trim().length <= 65,
      note: 'اجعل عنوان SEO بين 30 و65 حرفاً.',
      critical: true,
    },
    {
      key: 'description',
      label: 'وصف SEO',
      points: 15,
      passed: input.seoDescription.trim().length >= 120 && input.seoDescription.trim().length <= 165,
      note: 'اجعل الوصف بين 120 و165 حرفاً.',
      critical: true,
    },
    {
      key: 'keyword',
      label: 'الكلمة المفتاحية',
      points: 15,
      passed: keyword.length >= 2 && haystack.includes(keyword),
      note: 'أدخل كلمة مفتاحية واضحة واستخدمها طبيعياً في المحتوى.',
      critical: true,
    },
    {
      key: 'slug',
      label: 'الرابط',
      points: 10,
      passed: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim()) && input.slug.length <= 90,
      note: 'استخدم Slug لاتينياً قصيراً وواضحاً.',
      critical: true,
    },
    {
      key: 'content',
      label: 'محتوى كافٍ',
      points: 15,
      passed: plainWords.length >= 700,
      note: 'الحد الأدنى الداخلي للبرنامج 700 كلمة لضمان مادة قابلة للتحرير والمراجعة؛ هذا ليس رقماً تفرضه Google.',
      critical: true,
    },
    {
      key: 'headings',
      label: 'عناوين الأقسام',
      points: 10,
      passed: countHeadings(input.contentHtml) >= 2,
      note: 'أضف عنوانين فرعيين على الأقل لتنظيم القراءة.',
    },
    {
      key: 'image',
      label: 'الصورة الرئيسية',
      points: 10,
      passed: Boolean(input.featuredImageUrl.trim() && input.featuredImageAlt.trim()),
      note: 'الصورة مع نص بديل واضح مطلوبة قبل النشر.',
      critical: true,
    },
    {
      key: 'internal-links',
      label: 'روابط داخلية',
      points: 5,
      passed: countInternalLinks(input.contentHtml) >= 1,
      note: 'أضف رابطاً داخلياً واحداً على الأقل إلى صفحة مفيدة في ezyjobs.',
    },
    {
      key: 'title-keyword',
      label: 'الكلمة داخل العنوان',
      points: 5,
      passed: keyword.length >= 2 && input.seoTitle.toLocaleLowerCase().includes(keyword),
      note: 'ضع الكلمة المفتاحية في عنوان SEO عندما يكون ذلك طبيعياً.',
    },
  ];
  const score = checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0);
  return { score, wordCount: plainWords.length, checks };
}

export function canSubmitWriterArticle(result: WriterSeoResult) {
  return result.score >= 80 && result.checks.every((check) => !check.critical || check.passed);
}
