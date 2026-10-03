import type { ReactNode } from 'react';
import { usePageMeta } from '../lib/seo';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import { SectionHead } from '../components/ui/Primitives';
import PageAura from '../components/art/PageAura';

function useCmsCopy(key: string) {
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings[key]);
  const text = (name: string, fallback: string) => cms[name] || fallback;
  const list = (name: string, fallback: string[]) => (cms[name] || fallback.join(';;')).split(';;').map((item) => item.trim()).filter(Boolean);
  return { text, list };
}

export function TermsPage() {
  const { text } = useCmsCopy('terms_copy_ar');
  usePageMeta({
    title: `${text('title', 'الشروط والأحكام')} | ezyjobs`,
    description: text('lead', 'الشروط التي تنظم استخدام منصة ezyjobs وخدماتها ومحتواها.'),
    noIndex: true,
  });

  return (
    <>
      <LegalHero eyebrow={text('eyebrow', 'TERMS')} title={text('title', 'الشروط والأحكام')} lead={text('lead', 'القواعد الأساسية لاستخدام ezyjobs، تصفح الوظائف، الحسابات، والروابط الخارجية.')} />
      <LegalMain>
        <LegalSection title={text('section1Title', '1. نطاق الخدمة')}><Paragraphs value={text('section1Body', 'ezyjobs منصة معلومات وبحث عن الوظائف. نحن لا نوظف المستخدمين، ولا نمثل أصحاب العمل، ولا نقرر نتائج التوظيف نيابة عن أي جهة.;;قد نعرض معلومات مصدرها جهات خارجية ونرتبها أو نترجمها أو نحللها لتسهيل فهمها.')} /></LegalSection>
        <LegalSection title={text('section2Title', '2. دقة الوظائف وحداثتها')}><Paragraphs value={text('section2Body', 'نبذل جهداً معقولاً في جمع وتنظيف بيانات الوظائف، لكن توفر الوظيفة وشروطها وموعد إغلاقها قد تتغير خارج المنصة.;;قبل التقديم، راجع دائماً صفحة المصدر الأصلي والاشتراطات النهائية لديه.')} /></LegalSection>
        <LegalSection title={text('section3Title', '3. الروابط والمصادر الخارجية')}><Paragraphs value={text('section3Body', 'التقديم على الوظيفة يتم على موقع صاحب العمل أو المصدر الأصلي. عند مغادرة ezyjobs، تصبح شروط الاستخدام والخصوصية الخاصة بالطرف الثالث هي المطبقة هناك.')} /></LegalSection>
        <LegalSection title={text('section4Title', '4. الإفصاح عن الروابط التابعة')}><Paragraphs value={text('section4Body', 'قد تتضمن بعض الموارد أو الخدمات روابط تابعة. عند إجراء مؤهل لدى طرف ثالث عبر رابط تابع، قد تحصل ezyjobs على عمولة من ذلك الطرف دون تكلفة إضافية على المستخدم.;;وجود رابط تابع لا يعني ضمان الوظيفة أو تأييد صاحب العمل، ولا يغيّر المعلومات الأساسية التي نعرضها عن الفرصة.')} /></LegalSection>
        <LegalSection title={text('section5Title', '5. الحسابات والملف المهني')}><Paragraphs value={text('section5Body', 'يمكن إنشاء حساب لحفظ الفرص وبناء الملف المهني وتنظيم التقديمات. يتحمل المستخدم مسؤولية بيانات الدخول والمعلومات التي يضيفها إلى حسابه.;;لا يجوز استخدام حساب شخص آخر أو محاولة تجاوز صلاحيات الوصول.')} /></LegalSection>
        <LegalSection title={text('section6Title', '6. حسابات الناشرين')}><Paragraphs value={text('section6Body', 'قد تمنح ezyjobs صلاحيات نشر وإدارة وظائف لحسابات محددة. هذه الصلاحية إدارية وليست متاحة تلقائياً لكل مستخدم مسجل.;;أي محتوى وظيفي يضيفه ناشر يجب أن يكون دقيقاً وألا ينتهك حقوق الآخرين أو يخالف القوانين المعمول بها.')} /></LegalSection>
        <LegalSection title={text('section7Title', '7. المحتوى والملكية الفكرية')}><Paragraphs value={text('section7Body', 'تبقى حقوق العلامات التجارية والمحتوى الأصلي لأصحابها. استخدامنا لاسم الشركة أو المصدر في سياق عرض الوظيفة لا يعني وجود شراكة أو تمثيل ما لم نذكر ذلك صراحة.')} /></LegalSection>
        <LegalSection title={text('section8Title', '8. إخلاء المسؤولية')}><Paragraphs value={text('section8Body', 'الخدمة مقدمة كما هي وبحسب المعلومات المتاحة. لا نقدم ضماناً بأن كل إعلان متاح أو مناسب أو خالٍ من الأخطاء.;;أي قرار بالتقديم أو مشاركة بيانات إضافية أو الانتقال إلى موقع خارجي يعود إلى المستخدم بعد مراجعة المصدر الأصلي.')} /></LegalSection>
        <LegalSection title={text('section9Title', '9. التعديلات')}><Paragraphs value={text('section9Body', 'قد تتغير الخدمة أو هذه الشروط مع تطور المنصة. سنعرض النسخة المحدثة على هذه الصفحة مع تاريخ آخر تحديث.')} /></LegalSection>
        <LegalSection title={text('section10Title', '10. التواصل')}><Paragraphs value={text('section10Body', 'يمكن استخدام قنوات التواصل المتاحة داخل المنصة للإبلاغ عن خطأ واضح في إعلان، مشكلة في الحساب، أو انتهاك متعلق بالمحتوى.')} /></LegalSection>
        <LegalNote updated={text('updated', '30 سبتمبر 2026')} note={text('note', 'هذه الصفحات تصف طريقة عمل المنصة وليست بديلاً عن استشارة قانونية مهنية.')} />
      </LegalMain>
    </>
  );
}

export function PrivacyPage() {
  const { text } = useCmsCopy('privacy_copy_ar');
  usePageMeta({
    title: `${text('title', 'سياسة الخصوصية')} | ezyjobs`,
    description: text('lead', 'كيف تتعامل ezyjobs مع بيانات الحساب والملف المهني والاستخدام والروابط الخارجية.'),
    noIndex: true,
  });

  return (
    <>
      <LegalHero eyebrow={text('eyebrow', 'PRIVACY')} title={text('title', 'سياسة الخصوصية')} lead={text('lead', 'نوضح هنا ما نجمعه، لماذا نستخدمه، وكيف نتعامل مع بيانات الحساب والملف المهني.')} />
      <LegalMain>
        <LegalSection title={text('section1Title', '1. البيانات التي نتعامل معها')}><Paragraphs value={text('section1Body', 'قد نتعامل مع اسم المستخدم وبيانات المصادقة اللازمة لتسجيل الدخول، إضافة إلى بيانات الملف المهني والوظائف المحفوظة والتقديمات والتنبيهات التي ينشئها المستخدم.')} /></LegalSection>
        <LegalSection title={text('section2Title', '2. السيرة الذاتية والملف المهني')}><Paragraphs value={text('section2Body', 'يمكن للمستخدم رفع ملف PDF لتحليله محلياً داخل المتصفح ضمن أداة تحليل السيرة الحالية. لا تتطلب هذه الوظيفة إرسال ملف PDF إلى خدمة ذكاء اصطناعي خارجية.;;المعلومات التي يختار المستخدم حفظها في ملفه المهني تعامل كبيانات حسابه وتستخدم لتشغيل الميزات المرتبطة بها.')} /></LegalSection>
        <LegalSection title={text('section3Title', '3. بيانات الاستخدام')}><Paragraphs value={text('section3Body', 'قد نسجل أحداثاً محدودة مثل مشاهدة صفحة أو وظيفة بهدف قياس الاستخدام وتحسين الأداء واكتشاف المشكلات.;;نظام تتبع الاستخدام الحالي مصمم لتقليل البيانات الشخصية؛ لا يخزن عنوان IP أو هوية مباشرة ضمن سجل الحدث نفسه.')} /></LegalSection>
        <LegalSection title={text('section4Title', '4. التخزين المحلي')}><Paragraphs value={text('section4Body', 'قد تستخدم بعض الميزات التخزين المحلي أو التخزين الخاص بالجلسة في المتصفح، مثل تذكر تفضيلات مؤقتة أو مزامنة بعض البيانات قبل تسجيل الدخول.;;يمكن حذف بيانات التخزين المحلي من إعدادات المتصفح، لكن ذلك قد يؤدي إلى فقدان بعض البيانات المحلية غير المتزامنة.')} /></LegalSection>
        <LegalSection title={text('section5Title', '5. Supabase والخدمات المستضيفة')}><Paragraphs value={text('section5Body', 'يُستخدم Supabase لتوفير المصادقة وقاعدة البيانات للميزات التي تتطلب حساباً. تخضع البيانات المخزنة هناك أيضاً لسياسات وشروط مزود الخدمة.')} /></LegalSection>
        <LegalSection title={text('section6Title', '6. الروابط والإعلانات والشركاء')}><Paragraphs value={text('section6Body', 'قد تنقلك بعض الروابط إلى أصحاب العمل أو مزودي خدمات خارجيين. تصبح معالجة بياناتك على تلك المواقع خاضعة لسياساتهم الخاصة.;;إذا تم تفعيل خدمات إعلانية أو قياس خارجية، فقد تستخدم تلك الخدمات تقنيات خاصة بها وفق إعداداتها وسياساتها. سنحدّث هذه السياسة عند إضافة تكاملات جديدة تؤثر مادياً على البيانات.')} /></LegalSection>
        <LegalSection title={text('section7Title', '7. الأمان')}><Paragraphs value={text('section7Body', 'نطبق ضوابط وصول وقواعد قاعدة بيانات للحد من الوصول غير المصرح به، لكن لا توجد خدمة متصلة بالإنترنت يمكن ضمان أمنها المطلق.')} /></LegalSection>
        <LegalSection title={text('section8Title', '8. الاحتفاظ والحذف')}><Paragraphs value={text('section8Body', 'نحتفظ ببيانات الحساب طالما كانت لازمة لتشغيل الميزات المرتبطة بها، ما لم يطلب المستخدم حذفها أو توجد حاجة مشروعة للاحتفاظ ببعض السجلات التقنية.;;يمكن طلب المساعدة في حذف الحساب أو البيانات المرتبطة به عبر قنوات التواصل المتاحة في المنصة.')} /></LegalSection>
        <LegalSection title={text('section9Title', '9. التغييرات على هذه السياسة')}><Paragraphs value={text('section9Body', 'قد تتغير هذه السياسة عند إضافة ميزات أو خدمات جديدة. يظهر تاريخ آخر تحديث في أسفل الصفحة.')} /></LegalSection>
        <LegalNote updated={text('updated', '30 سبتمبر 2026')} note={text('note', 'هذه الصفحات تصف طريقة عمل المنصة وليست بديلاً عن استشارة قانونية مهنية.')} />
      </LegalMain>
    </>
  );
}

export function UsagePolicyPage() {
  const { text, list } = useCmsCopy('usage_policy_copy_ar');
  usePageMeta({
    title: `${text('title', 'سياسة الاستخدام')} | ezyjobs`,
    description: text('lead', 'قواعد الاستخدام المقبول لمنصة ezyjobs وحساباتها ومحتواها.'),
    noIndex: true,
  });

  return (
    <>
      <LegalHero eyebrow={text('eyebrow', 'ACCEPTABLE USE')} title={text('title', 'سياسة الاستخدام')} lead={text('lead', 'استخدم ezyjobs للبحث والتعلّم والتقديم المشروع، واحترم المستخدمين والمصادر وأمن المنصة.')} />
      <LegalMain>
        <LegalSection title={text('section1Title', '1. الاستخدام المقبول')}><Paragraphs value={text('section1Body', 'يجوز لك تصفح الوظائف، البحث، حفظ الفرص، بناء ملفك المهني، تنظيم تقديماتك، واستخدام الأدوات المتاحة للأغراض المشروعة.')} /></LegalSection>
        <LegalSection title={text('section2Title', '2. الاستخدامات الممنوعة')}>
          <ul>
            {list('section2Items', [
              'استخدام المنصة للاحتيال أو انتحال الهوية أو نشر معلومات مضللة عمداً.',
              'محاولة الوصول إلى حسابات أو وظائف أو بيانات لا تملك صلاحية الوصول إليها.',
              'تعطيل الخدمة أو اختبار ثغرات بطريقة تضر المستخدمين أو البنية التحتية.',
              'إرسال طلبات آلية بكميات تضر بالمصادر أو تتجاوز القيود التقنية أو شروط المصدر.',
              'استخدام المحتوى لإرسال رسائل مزعجة أو تنفيذ حملات غير مرغوبة.',
            ]).map((item) => <li key={item}>{item}</li>)}
          </ul>
        </LegalSection>
        <LegalSection title={text('section3Title', '3. جمع البيانات آلياً')}><Paragraphs value={text('section3Body', 'لا يجوز استخدام الزحف أو الاستخراج الآلي لنسخ محتوى المنصة بكميات كبيرة أو تجاوز آليات الوصول أو إعادة استخدام البيانات بما يخالف حقوق أصحابها أو شروط المصادر.')} /></LegalSection>
        <LegalSection title={text('section4Title', '4. الحسابات')}><Paragraphs value={text('section4Body', 'يجب أن تقدم معلومات غير مضللة عند إنشاء الحساب وألا تشارك بيانات الدخول مع أشخاص لا تخولهم باستخدام الحساب.')} /></LegalSection>
        <LegalSection title={text('section5Title', '5. ناشرو الوظائف')}><Paragraphs value={text('section5Body', 'يجب على الناشر نشر فرص حقيقية وواضحة، واحترام حقوق العلامات التجارية والمحتوى، وعدم إدراج وظائف احتيالية أو شروط غير مشروعة أو روابط ضارة.')} /></LegalSection>
        <LegalSection title={text('section6Title', '6. التبليغ عن إساءة الاستخدام')}><Paragraphs value={text('section6Body', 'إذا وجدت وظيفة مشبوهة، رابطاً ضاراً، انتحالاً، أو استخداماً غير مقبول، استخدم قنوات التواصل المتاحة لإبلاغنا بالمشكلة مع أكبر قدر ممكن من التفاصيل.')} /></LegalSection>
        <LegalSection title={text('section7Title', '7. إجراءات الإنفاذ')}><Paragraphs value={text('section7Body', 'قد نقيد أو نوقف حساباً أو محتوى عندما يكون ذلك ضرورياً لحماية المستخدمين أو الخدمة أو الالتزام بالقانون، مع مراعاة طبيعة الحالة والمعلومات المتاحة لنا.')} /></LegalSection>
        <LegalSection title={text('section8Title', '8. تحديث السياسة')}><Paragraphs value={text('section8Body', 'قد نحدّث سياسة الاستخدام مع نمو المنصة وظهور أساليب إساءة جديدة. سيتم نشر النسخة المحدثة هنا مع تاريخ التعديل.')} /></LegalSection>
        <LegalNote updated={text('updated', '30 سبتمبر 2026')} note={text('note', 'هذه الصفحات تصف طريقة عمل المنصة وليست بديلاً عن استشارة قانونية مهنية.')} />
      </LegalMain>
    </>
  );
}

function LegalHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead: string }) {
  return (
    <header className="legal-hero relative overflow-hidden border-b border-line bg-surface">
      <PageAura />
      <div className="relative mx-auto max-w-[1000px] px-5 py-14 lg:px-10 lg:py-20">
        <SectionHead eyebrow={eyebrow} title={title} lead={lead} />
      </div>
    </header>
  );
}

function LegalMain({ children }: { children: ReactNode }) {
  return <main className="legal-main mx-auto max-w-[1000px] space-y-4 px-5 py-10 lg:px-10 lg:py-16">{children}</main>;
}

function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="legal-section ez-panel p-6 sm:p-7">
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <div className="mt-4 space-y-3 text-[14px] leading-[2] text-muted">{children}</div>
    </section>
  );
}

function Paragraphs({ value }: { value: string }) {
  return <>{value.split(';;').map((paragraph) => <p key={paragraph}>{paragraph.trim()}</p>)}</>;
}

function LegalNote({ updated, note }: { updated: string; note: string }) {
  return (
    <section className="pt-8">
      <p className="text-xs leading-relaxed text-muted">آخر تحديث: {updated}. {note}</p>
    </section>
  );
}
