import { Link } from 'react-router-dom';
import { SOURCES } from '../data/taxonomy';
import { parseSiteCopy, usePublicSiteSettings } from '../lib/siteSettings';
import { usePageMeta } from '../lib/seo';
import { Badge, SectionHead } from '../components/ui/Primitives';
import { StatsStrip } from '../components/seo/Seo';
import PageAura from '../components/art/PageAura';

export default function AboutPage({ jobCount }: { jobCount: number }) {
  const settings = usePublicSiteSettings();
  const cms = parseSiteCopy(settings.about_copy_ar);
  const text = (key: string, fallback: string) => cms[key] || fallback;
  const list = (key: string, fallback: string[]) => (cms[key] || fallback.join(';;')).split(';;').map((item) => item.trim()).filter(Boolean);

  usePageMeta({
    title: 'من نحن | ezyjobs',
    description: text('lead', 'تعرّف إلى ezyjobs: منصة عربية للبحث عن الوظائف عن بُعد، تنظيم الفرص، وفهم الأهلية قبل التقديم.'),
  });

  return (
    <>
      <header className="about-hero relative overflow-hidden border-b border-line bg-gradient-to-b from-white via-[#f8fbff] to-[#eef5fb] text-ink">
        <div className="ez-grid-light absolute inset-0 opacity-60" />
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-16 lg:px-10 lg:py-24">
          <span className="inline-block text-[11px] font-bold tracking-[0.18em] text-brand-700">{text('eyebrow', 'من نحن')}</span>
          <h1 className="mt-6 max-w-4xl text-3xl font-black leading-tight sm:text-4xl lg:text-6xl">
            {text('titleBefore', 'نحن نبني طبقة أوضح بين الباحث العربي و')}{' '}
            <span className="text-gradient">{text('titleAccent', 'الفرصة المناسبة')}</span>.
          </h1>
          <p className="mt-6 max-w-3xl text-[15px] leading-[2] text-muted">
            {text('lead', 'ezyjobs منصة للبحث عن الوظائف والفرص عن بُعد. نجمع فرصاً من مصادر خارجية متاحة لإعادة التوزيع، ننظمها ونشرحها بالعربية، ثم نوجّهك إلى مصدر التقديم الأصلي.')}
          </p>
        </div>
      </header>
      <main className="mx-auto max-w-[1240px] space-y-16 px-5 py-16 lg:px-10 lg:py-20">
        <StatsStrip
          items={[
            { label: text('statJobs', 'الوظائف المفهرسة'), value: jobCount },
            { label: text('statFields', 'المجالات'), value: 11 },
            { label: text('statCountries', 'الدول العربية'), value: 22 },
            { label: text('statApplication', 'مسار التقديم الأصلي'), value: text('statApplicationValue', 'دائماً') },
          ]}
        />

        <section className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div>
            <SectionHead
              eyebrow={text('whyEyebrow', 'لماذا ezyjobs')}
              title={text('whyTitle', 'المشكلة ليست العثور على إعلان فقط')}
              lead={text('whyLead', 'المشكلة الحقيقية هي معرفة ما إذا كانت الفرصة مفهومة ومناسبة لك قبل أن تضيع وقتك في التقديم.')}
            />
            <div className="mt-7 space-y-5 text-[14px] leading-[2] text-muted">
              {list('whyParagraphs', [
                'الإعلانات موزعة بين عشرات المصادر، ومكتوبة بمصطلحات مختلفة، وبعضها يستخدم كلمة «Remote» من دون توضيح الدول المقبولة فعلياً.',
                'لذلك نركز على طبقة بسيطة: جمع منظم، تنظيف، ترجمة وشرح، ثم توجيه مباشر إلى المصدر الأصلي. لا نستقبل طلبات التوظيف ولا نمثل أصحاب العمل.',
              ]).map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </div>
          <div className="ez-panel p-7">
            <p className="ez-label">{text('promiseLabel', 'ما نعد به')}</p>
            <div className="mt-5 space-y-4">
              {[
                [text('promise1Title', 'وضوح المصدر'), text('promise1Body', 'نعرض مصدر الوظيفة ورابط التقديم الأصلي.')],
                [text('promise2Title', 'وضوح الأهلية'), text('promise2Body', 'نميز بين المعلومات المؤكدة والاستنتاجات التي نكوّنها من الإعلان.')],
                [text('promise3Title', 'سهولة الاستخدام'), text('promise3Body', 'يمكن تصفح الوظائف الأساسية دون إنشاء حساب.')],
                [text('promise4Title', 'تركيز على الباحث'), text('promise4Body', 'الحساب مخصص لحفظ الفرص وبناء الملف وتنظيم التقديمات.')],
              ].map(([title, body]) => (
                <div key={title} className="border-t border-line pt-4 first:border-0 first:pt-0">
                  <h3 className="text-sm font-bold text-ink">{title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow={text('howEyebrow', 'كيف نعمل')}
            title={text('howTitle', 'من الإعلان إلى صفحة مفهومة')}
            lead={text('howLead', 'نحاول فصل المعلومة الأصلية عن التحليل الذي تضيفه ezyjobs، حتى تعرف ما الذي تقرؤه.')}
          />
          <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {[
              ['01', text('how1Title', 'الجمع'), text('how1Body', 'نستخدم مصادر وإطارات نشر تسمح بإعادة توزيع بيانات الوظائف، ونحتفظ باسم المصدر والرابط الأصلي.')],
              ['02', text('how2Title', 'التنظيف'), text('how2Body', 'نزيل التكرار ونوحّد المسميات والحقول الأساسية مثل المجال والمستوى ونوع العمل.')],
              ['03', text('how3Title', 'الشرح'), text('how3Body', 'نترجم ونرتب المعلومات بالعربية، وقد نضيف مؤشرات تحليلية مع توضيح أنها تقدير وليست تصريحاً من صاحب العمل.')],
              ['04', text('how4Title', 'التوجيه'), text('how4Body', 'التقديم يتم لدى الجهة الأصلية. ezyjobs لا يستلم السيرة الذاتية نيابة عن صاحب العمل ولا يقرر نتيجة التوظيف.')],
            ].map(([n, title, body]) => (
              <article key={n} className="bg-surface p-7">
                <span className="tnum text-xs font-bold text-brand">{n}</span>
                <h3 className="mt-3 text-base font-bold text-ink">{title}</h3>
                <p className="mt-3 text-[13.5px] leading-[1.9] text-muted">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionHead
            eyebrow={text('sourcesEyebrow', 'مصادر الوظائف')}
            title={text('sourcesTitle', 'مصادر نراجعها قبل الفهرسة')}
            lead={text('sourcesLead', 'وجود المصدر في هذه القائمة لا يعني أن ezyjobs تمثل الشركة أو أن الوظيفة مضمونة؛ فهو يحدد فقط مصدر البيانات الذي نعتمد عليه.')}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SOURCES.map((source) => (
              <div key={source.name} className="ez-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-ink">{source.name}</h3>
                    <p className="mt-1 text-[12px] text-muted" dir="ltr">{source.latin}</p>
                  </div>
                  <Badge tone="brand">{source.access}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div className="ez-panel p-8">
            <h2 className="text-xl font-black text-ink">{text('notDoTitle', 'ما الذي لا تفعله ezyjobs؟')}</h2>
            <ul className="mt-6 space-y-3 text-[13.5px] leading-relaxed text-muted">
              {list('notDoItems', [
                'لا نوظف ولا نتخذ قرارات قبول أو رفض نيابة عن أي جهة.',
                'لا نستبدل صفحة صاحب العمل أو عملية التقديم الأصلية.',
                'لا نضمن أن الإعلان ما زال متاحاً عند لحظة التقديم.',
                'لا نعتبر كلمة Remote وحدها دليلاً على قبول أي دولة.',
                'لا نعرض التحليل الآلي على أنه تصريح رسمي من صاحب العمل.',
              ]).map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ez-panel p-8">
            <h2 className="text-xl font-black text-ink">{text('startTitle', 'ابدأ من حيث يناسبك')}</h2>
            <p className="mt-4 text-[14px] leading-[2] text-muted">{text('startBody', 'ابحث عن وظيفة، راجع الأهلية، ثم احفظ الفرص التي تريد متابعتها. بعد تسجيل الدخول، يمكنك بناء ملفك المهني وتنظيم تقديماتك في مكان واحد.')}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link to="/jobs" className="ez-btn ez-btn-primary px-5 py-3 text-sm">{text('jobsButton', 'ابحث عن وظيفة')}</Link>
              <Link to="/profile" className="ez-btn ez-btn-ghost px-5 py-3 text-sm">{text('profileButton', 'الملف المهني')}</Link>
              <Link to="/guides" className="ez-btn ez-btn-ghost px-5 py-3 text-sm">{text('guidesButton', 'الأدلة والنصائح')}</Link>
            </div>
          </div>
        </section>

        <section className="border-t border-line pt-8">
          <p className="text-xs leading-relaxed text-muted">{text('updated', 'آخر تحديث لهذه الصفحة: 30 سبتمبر 2026. المعلومات الواردة في هذه الصفحة تعريفية عن طريقة عمل المنصة وليست استشارة قانونية أو مهنية.')}</p>
        </section>
      </main>
    </>
  );
}
