export interface Partner {
  id: string;
  name: string;
  latin: string;
  what: string;
  url: string;
  /** نوع العلاقة: عمولة أو إعلان مدفوع */
  kind: 'affiliate' | 'sponsored';
  price?: string;
}

export const PARTNERS: Partner[] = [
  {
    id: 'cv-builder',
    name: 'منشئ السيرة الذاتية',
    latin: 'CV Builder',
    what: 'قالب جاهز بعمود واحد يمر على الأنظمة الآلية، مع حقول عربية.',
    url: '#',
    kind: 'affiliate',
    price: 'مجاني — مدفوع للميزات',
  },
  {
    id: 'ats-check',
    name: 'فاحص توافق الملف',
    latin: 'ATS Checker',
    what: 'يقيس نسبة الكلمات المفتاحية المطابقة بين ملفك وإعلان الوظيفة.',
    url: '#',
    kind: 'affiliate',
    price: 'فحص مجاني محدود',
  },
  {
    id: 'resume-review',
    name: 'مراجعة السيرة الذاتية',
    latin: 'Resume Review',
    what: 'مراجعة بشري من مختص يراجع ملفك ويعيد كتابته.',
    url: '#',
    kind: 'affiliate',
    price: 'مدفوع',
  },
  {
    id: 'interview-prep',
    name: 'أداة تحضير المقابلات',
    latin: 'Interview Prep',
    what: 'بنك أسئلة متكرر مع تدريب صوتي، وتمارين على المقابلات الحقيقية.',
    url: '#',
    kind: 'affiliate',
    price: 'مجاني جزئياً',
  },
  {
    id: 'career-test',
    name: 'اختبار المسار المهني',
    latin: 'Career Test',
    what: 'يحدد مجالات تناسب قدراتك بدل أن تخمّنها.',
    url: '#',
    kind: 'affiliate',
    price: 'مدفوع',
  },
  {
    id: 'courses',
    name: 'دورات المهارات',
    latin: 'Courses',
    what: 'دورات قصيرة تغطي المهارات التي طلبتها الوظائف الأكثر طلباً.',
    url: '#',
    kind: 'affiliate',
    price: 'مجاني ومدفوع',
  },
];

export const partnerById = (id: string) => PARTNERS.find((p) => p.id === id);

/** نص الإفصاح المطلوب قبل أي رابط تابع */
export const DISCLOSURE =
  'بعض الروابط أدناه روابط تابع: إذا اشتريت أو استخدمت الخدمة من خلالها، قد نحصل على عمولة دون أن يختلف السعر عن السعر المباشر. لا ندفع مقابل ترتيب غير دقيق، ونعرض هنا ما نستخدمه بأنفسنا فقط.';
