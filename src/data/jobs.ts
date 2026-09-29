export interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  salary: string;
  description: string;
  requirements: string[];
  posted: string;
  source: string;
  sourceUrl: string;
  isNew: boolean;
  isRemote: boolean;
}

export const jobsData: Job[] = [
  {
    id: 1,
    title: "مطور واجهات أمامية React",
    company: "شركة تقنية عالمية",
    location: "عن بُعد - عالمي",
    type: "دوام كامل",
    category: "برمجة وتطوير",
    salary: "3,000 - 5,000 دولار",
    description: "نبحث عن مطور React متمرس للعمل على تطبيقات ويب حديثة مع فريق دولي.",
    requirements: ["خبرة 3+ سنوات في React", "TypeScript", "Tailwind CSS", "Git"],
    posted: "منذ يومين",
    source: "LinkedIn",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 2,
    title: "مصمم جرافيك",
    company: "استوديو إبداعي",
    location: "عن بُعد - الشرق الأوسط",
    type: "دوام جزئي",
    category: "تصميم",
    salary: "1,500 - 2,500 دولار",
    description: "مطلوب مصمم جرافيك مبدع للعمل على مشاريع متنوعة تشمل الهوية البصرية والسوشيال ميديا.",
    requirements: ["إتقان Adobe Suite", "خبرة في Figma", "حقيبة أعمال قوية", "إبداع عالي"],
    posted: "منذ 3 أيام",
    source: "Behance",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 3,
    title: "كاتب محتوى عربي",
    company: "منصة تعليمية",
    location: "عن بُعد - عالمي",
    type: "عمل حر",
    category: "كتابة وترجمة",
    salary: "800 - 1,500 دولار",
    description: "نبحث عن كاتب محتوى عربي متميز لكتابة مقالات تعليمية ومحتوى تسويقي.",
    requirements: ["لغة عربية سليمة", "خبرة في SEO", "القدرة على البحث", "الالتزام بالمواعيد"],
    posted: "منذ أسبوع",
    source: "Upwork",
    sourceUrl: "#",
    isNew: false,
    isRemote: true
  },
  {
    id: 4,
    title: "مدير وسائل التواصل الاجتماعي",
    company: "وكالة تسويق رقمي",
    location: "عن بُعد - الخليج",
    type: "دوام كامل",
    category: "تسويق رقمي",
    salary: "2,000 - 3,500 دولار",
    description: "إدارة حسابات السوشيال ميديا لعملاء متعددين وإنشاء استراتيجيات محتوى.",
    requirements: ["خبرة في إدارة الحملات", "تحليل البيانات", "إبداع في المحتوى", "معرفة بأدوات الجدولة"],
    posted: "منذ 4 أيام",
    source: "Indeed",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 5,
    title: "مطور تطبيقات موبايل Flutter",
    company: "شركة ناشئة",
    location: "عن بُعد - عالمي",
    type: "دوام كامل",
    category: "برمجة وتطوير",
    salary: "4,000 - 6,000 دولار",
    description: "تطوير تطبيقات موبايل متعددة المنصات باستخدام Flutter لفريق منتج عالمي.",
    requirements: ["خبرة 2+ سنوات في Flutter", "Dart", "REST APIs", "Firebase"],
    posted: "منذ يوم",
    source: "Remote.co",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 6,
    title: "مترجم إنجليزي - عربي",
    company: "شركة ترجمة دولية",
    location: "عن بُعد - عالمي",
    type: "عمل حر",
    category: "كتابة وترجمة",
    salary: "1,000 - 2,000 دولار",
    description: "ترجمة مستندات تقنية وقانونية من الإنجليزية إلى العربية والعكس.",
    requirements: ["إتقان اللغتين", "خبرة ترجمة 2+ سنة", "دقة عالية", "شهادة ترجمة (يفضل)"],
    posted: "منذ 5 أيام",
    source: "ProZ",
    sourceUrl: "#",
    isNew: false,
    isRemote: true
  },
  {
    id: 7,
    title: "محلل بيانات",
    company: "شركة استشارات",
    location: "عن بُعد - الشرق الأوسط",
    type: "دوام كامل",
    category: "بيانات وتحليل",
    salary: "2,500 - 4,000 دولار",
    description: "تحليل البيانات وإعداد التقارير لدعم قرارات الأعمال باستخدام أدوات حديثة.",
    requirements: ["Python أو R", "SQL", "Power BI أو Tableau", "خبرة في التحليل الإحصائي"],
    posted: "منذ 3 أيام",
    source: "LinkedIn",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 8,
    title: "معلم لغة عربية أونلاين",
    company: "منصة تعليمية",
    location: "عن بُعد - عالمي",
    type: "دوام جزئي",
    category: "تعليم وتدريب",
    salary: "1,000 - 2,000 دولار",
    description: "تدريس اللغة العربية للناطقين بغيرها عبر الإنترنت.",
    requirements: ["شهادة في اللغة العربية", "خبرة تدريس", "صبر وتواصل جيد", "اتصال إنترنت مستقر"],
    posted: "منذ أسبوع",
    source: "Preply",
    sourceUrl: "#",
    isNew: false,
    isRemote: true
  },
  {
    id: 9,
    title: "مونتير فيديو",
    company: "قناة يوتيوب",
    location: "عن بُعد - عالمي",
    type: "عمل حر",
    category: "تصميم",
    salary: "1,200 - 2,500 دولار",
    description: "مونتاج فيديوهات يوتيوب بجودة عالية مع إضافة مؤثرات وانتقالات احترافية.",
    requirements: ["Premiere Pro أو DaVinci", "After Effects", "سرعة في الإنجاز", "حس إبداعي"],
    posted: "منذ يومين",
    source: "Upwork",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 10,
    title: "مطور Backend - Node.js",
    company: "شركة FinTech",
    location: "عن بُعد - أوروبا/الشرق الأوسط",
    type: "دوام كامل",
    category: "برمجة وتطوير",
    salary: "5,000 - 8,000 دولار",
    description: "تطوير APIs وخدمات خلفية لتطبيق مالي يستخدمه ملايين المستخدمين.",
    requirements: ["Node.js متقدم", "PostgreSQL", "Docker", "خبرة في الأنظمة المالية"],
    posted: "منذ 6 أيام",
    source: "We Work Remotely",
    sourceUrl: "#",
    isNew: false,
    isRemote: true
  },
  {
    id: 11,
    title: "أخصائي SEO",
    company: "وكالة رقمية",
    location: "عن بُعد - الخليج",
    type: "دوام جزئي",
    category: "تسويق رقمي",
    salary: "1,500 - 2,500 دولار",
    description: "تحسين محركات البحث لمواقع العملاء وزيادة الظهور العضوي.",
    requirements: ["خبرة SEO 2+ سنة", "أدوات البحث", "تحليل المنافسين", "كتابة محتوى محسّن"],
    posted: "منذ 4 أيام",
    source: "Remote OK",
    sourceUrl: "#",
    isNew: true,
    isRemote: true
  },
  {
    id: 12,
    title: "محاسب عن بُعد",
    company: "مكتب محاسبة",
    location: "عن بُعد - الشرق الأوسط",
    type: "دوام كامل",
    category: "محاسبة ومالية",
    salary: "1,800 - 3,000 دولار",
    description: "إدارة الحسابات والميزانيات للشركات الصغيرة والمتوسطة عن بُعد.",
    requirements: ["شهادة محاسبة", "إتقان QuickBooks أو Xero", "دقة عالية", "خبرة 3+ سنوات"],
    posted: "منذ أسبوع",
    source: "FlexJobs",
    sourceUrl: "#",
    isNew: false,
    isRemote: true
  }
];

export const categories = [
  { name: "الكل", icon: "🌐", count: 12 },
  { name: "برمجة وتطوير", icon: "💻", count: 3 },
  { name: "تصميم", icon: "🎨", count: 2 },
  { name: "كتابة وترجمة", icon: "✍️", count: 2 },
  { name: "تسويق رقمي", icon: "📱", count: 2 },
  { name: "بيانات وتحليل", icon: "📊", count: 1 },
  { name: "تعليم وتدريب", icon: "📚", count: 1 },
  { name: "محاسبة ومالية", icon: "💰", count: 1 },
];
