import { Link } from 'react-router-dom';
import PageAura from '../components/art/PageAura';
import { Badge, Button, Section } from '../components/ui/Primitives';
import { usePageMeta } from '../lib/seo';

export default function StudentWriterLandingPage() {
  usePageMeta({
    title: 'وظيفة كاتب للطلبة عن بُعد | اكتب واكسب | ezyjobs',
    description: 'وظيفة كتابة عن بُعد للطلبة داخل ezyjobs: عقد شهري، أجر ثابت لكل مقال مقبول، محرر SEO وصورة ومعاينة قبل الإرسال.',
    canonical: 'https://ezyjobs.com/student-writer',
  });

  return <div className="min-h-screen bg-paper">
    <header className="relative overflow-hidden border-b border-line bg-surface">
      <PageAura />
      <div className="relative mx-auto max-w-[1180px] px-5 py-16 lg:px-10 lg:py-24">
        <Badge tone="positive">وظيفة أونلاين للطلبة</Badge>
        <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
          اكتب محتوى مفيداً للباحثين عن العمل واحصل على أجر ثابت لكل مقال مقبول
        </h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-muted sm:text-lg">
          وظيفة كتابة عن بُعد داخل ezyjobs مخصصة للطلبة. تعمل من جهازك، تستخدم محرر المقال الداخلي، تحسن الصفحة لمحركات البحث، تضيف صورة مناسبة، ثم ترسلها للمراجعة قبل النشر.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/register"><Button>ابدأ طلب الانضمام</Button></Link>
          <Link to="/publish"><Button variant="ghost">لدي حساب بالفعل</Button></Link>
        </div>
        <p className="mt-4 text-xs leading-6 text-muted">
          الأجر الفعلي يحدده عقد الكاتب: عدد المقالات الشهري، أجر المقال، والسقف الشهري. البرنامج لا يعد براتب غير محدود أو بمبلغ ثابت مستقل عن الإنتاج والمراجعة.
        </p>
      </div>
    </header>

    <Section className="pt-12 lg:pt-16">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ['أجر واضح', 'تعرف سعر المقال والحصة والسقف الشهري قبل البدء.'],
          ['SEO قبل الإرسال', 'فحص داخلي للعناوين والوصف والكلمة المفتاحية والروابط والصورة.'],
          ['نشر بعد المراجعة', 'لا تنشر المقالات مباشرة؛ تمر على مراجعة الجودة قبل أن تصبح عامة.'],
        ].map(([title, text]) => <div key={title} className="ez-panel p-6"><h2 className="font-black text-ink">{title}</h2><p className="mt-3 text-sm leading-7 text-muted">{text}</p></div>)}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_.95fr]">
        <div className="ez-panel p-7">
          <span className="ez-eyebrow">WHAT YOU WRITE</span>
          <h2 className="mt-2 text-2xl font-black text-ink">أنواع المحتوى</h2>
          <ul className="mt-5 space-y-3 text-sm leading-7 text-muted">
            <li>شرح مهارات البحث عن عمل والتقديم للوظائف.</li>
            <li>أدلة للوظائف عن بُعد والعمل للطلبة والمبتدئين.</li>
            <li>شروحات عملية عن السيرة الذاتية وATS والمقابلات.</li>
            <li>مقالات مرتبطة باتجاهات البحث والفرص المطلوبة على المنصة.</li>
          </ul>
        </div>
        <div className="ez-panel p-7">
          <span className="ez-eyebrow">WHY IT MATTERS</span>
          <h2 className="mt-2 text-2xl font-black text-ink">كيف يستفيد الكاتب والموقع معاً؟</h2>
          <p className="mt-4 text-sm leading-7 text-muted">
            الكاتب يحصل على مقابل واضح على إنتاج مقبول، والموقع يحصل على مكتبة محتوى أصلية تساعد الزائر على الوصول إلى الوظائف والأدوات والخدمات الموجودة فعلياً في المنصة. دخل المنصة يأتي من نماذج منفصلة مثل الإعلانات والروابط التابعة والرعايات وفرص الشركاء، لذلك لا نعتمد على مشاهدات وهمية لدفع الكتاب.
          </p>
        </div>
      </div>

      <div className="mt-8 ez-panel p-7">
        <span className="ez-eyebrow">HOW TO START</span>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {[
            ['01', 'أنشئ حساباً', 'سجل دخولك إلى المنصة.'],
            ['02', 'أرسل عينة', 'قدم عينة كتابة وبياناتك الدراسية.'],
            ['03', 'استلم عقدك', 'الإدارة تحدد الحصة والأجر والسقف.'],
            ['04', 'اكتب وأرسل', 'استخدم محرر SEO والصورة والمعاينة ثم أرسل للمراجعة.'],
          ].map(([n, title, text]) => <div key={n} className="rounded-2xl border border-line bg-paper p-5"><span className="text-xs font-black text-brand">{n}</span><h3 className="mt-2 font-black text-ink">{title}</h3><p className="mt-1 text-sm leading-6 text-muted">{text}</p></div>)}
        </div>
        <div className="mt-7"><Link to="/register"><Button>تقديم طلب الانضمام الآن</Button></Link></div>
      </div>
    </Section>
  </div>;
}
