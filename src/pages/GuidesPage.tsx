import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GUIDES, articleJsonLd, guideBySlug, guideCategoryName, type Guide } from '../content/guides';
import { guideRepo } from '../lib/guideRepo';
import { usePageMeta } from '../lib/seo';
import { EmptyState } from '../components/ui/Feedback';
import { Badge, SectionHead } from '../components/ui/Primitives';
import { Breadcrumbs, FaqList, Prose, breadcrumbJsonLd, faqJsonLd } from '../components/seo/Seo';

import PageAura from '../components/art/PageAura';
const dateText = (iso: string) =>
  new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(iso));

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>(GUIDES);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<'all' | Guide['category']>('all');

  useEffect(() => {
    let alive = true;
    void guideRepo.listPublished().then((result) => {
      if (alive && !result.error) setGuides(result.data);
    });
    return () => { alive = false; };
  }, []);

  const categories = useMemo(
    () => [
      { id: 'all' as const, label: 'كل المقالات' },
      ...Object.entries(guideCategoryName).map(([id, label]) => ({
        id: id as Guide['category'],
        label,
      })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('ar');
    return [...guides]
      .filter((g) => category === 'all' || g.category === category)
      .filter((g) => {
        if (!q) return true;
        return [g.title, g.excerpt, guideCategoryName[g.category]]
          .join(' ')
          .toLocaleLowerCase('ar')
          .includes(q);
      })
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  }, [guides, query, category]);

  const featured = filtered[0];
  const rest = filtered.slice(1);

  usePageMeta({
    title: 'المقالات والأدلة المهنية بالعربية | ezyjobs',
    description:
      'مقالات عملية تساعدك على اكتشاف الوظائف عن بُعد، تحسين سيرتك الذاتية، الاستعداد للمقابلات وبناء ملف مهني أقوى.',
  });

  return (
    <>
      <header className="relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <SectionHead
            eyebrow="ezyjobs / مقالات"
            title="المعرفة التي تقرّبك من أول تقديم"
            lead="مقالات عملية قصيرة، مرتبة حسب المرحلة التي أنت فيها: البحث، الملف المهني، العمل عن بُعد، المقابلة والفرص الطلابية."
          />
        </div>
      </header>

      <div className="mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        <div className="article-toolbar ez-panel mb-5">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
            </svg>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="ez-input w-full !rounded-2xl !border-0 !bg-transparent !pr-11"
              placeholder="ابحث داخل المقالات..."
              aria-label="البحث داخل المقالات"
            />
          </div>
          <div className="article-count hidden sm:block">
            <span className="tnum">{filtered.length}</span>
            <small>مقالات متاحة</small>
          </div>
        </div>

        <div className="article-categories mb-8 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="تصنيف المقالات">
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={category === item.id}
              onClick={() => setCategory(item.id)}
              className={`article-filter whitespace-nowrap rounded-full px-4 py-2.5 text-xs font-bold transition-all ${category === item.id ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {filtered[0] && (
          <Link
            to={`/guides/${filtered[0].slug}`}
            className="article-feature group mb-8 grid overflow-hidden rounded-[28px] border border-line bg-surface shadow-[0_24px_70px_-38px_rgba(23,36,59,0.28)] lg:grid-cols-[1.22fr_.78fr]"
          >
            <div className="relative p-7 sm:p-9 lg:p-11">
              <div className="article-feature__glow" aria-hidden />
              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="article-kicker">مقالة بارزة</span>
                  <Badge tone="brand">{guideCategoryName[filtered[0].category]}</Badge>
                </div>
                <h2 className="mt-6 max-w-2xl text-2xl font-black leading-[1.25] text-ink sm:text-3xl lg:text-[36px]">
                  {filtered[0].title}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-[1.95] text-muted sm:text-[15px]">
                  {filtered[0].excerpt}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4 text-[12px] text-muted">
                  <span><span className="tnum">{filtered[0].minutes}</span> دقائق قراءة</span>
                  <span className="h-1 w-1 rounded-full bg-line" />
                  <span>{dateText(filtered[0].publishedAt)}</span>
                </div>
                <span className="article-read-more mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-brand">
                  اقرأ المقال <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                </span>
              </div>
            </div>
            <div className="article-feature__side relative hidden min-h-[280px] lg:block">
              <div className="article-feature__grid" aria-hidden />
              <div className="article-feature__signal">
                <span className="article-feature__signal-dot" />
                <span><b>ezyjobs</b><small>Knowledge layer</small></span>
                <strong>01</strong>
              </div>
              <div className="article-feature__rings" aria-hidden><span /><span /><span /></div>
            </div>
          </Link>
        )}
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="article-section-label">تصفّح حسب الموضوع</span>
            <h2 className="mt-2 text-2xl font-black text-ink">كل المقالات</h2>
          </div>
          <span className="hidden text-xs text-muted sm:block">محدّثة باستمرار</span>
        </div>
        <div className="article-grid mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(1).map((g, i) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="article-card group ez-card flex flex-col overflow-hidden p-0"
            >
              <div className="article-card__top">
                <span className="article-card__number">{String(i + 2).padStart(2, '0')}</span>
                <Badge tone="brand">{guideCategoryName[g.category]}</Badge>
                <span className="mr-auto text-[11px] text-muted"><span className="tnum">{g.minutes}</span> د</span>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
                <h2 className="text-[17px] font-black leading-[1.45] text-ink transition-colors group-hover:text-brand">
                  {g.title}
                </h2>
                <p className="ez-line-3 mt-3 text-[13px] leading-[1.95] text-muted">
                  {g.excerpt}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 text-[12px] text-muted">
                  <span>{dateText(g.publishedAt)}</span>
                  <span className="font-bold text-brand transition-transform duration-300 group-hover:-translate-x-1">←</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {!filtered.length && (
          <div className="mt-6">
            <EmptyState
              title="لا توجد مقالات بهذا البحث"
              body="جرّب كلمة أقصر أو اختر تصنيفاً آخر."
              action={
                <button type="button" onClick={() => { setQuery(''); setCategory('all'); }} className="ez-btn ez-btn-primary px-5 py-3 text-sm">
                  عرض كل المقالات
                </button>
              }
            />
          </div>
        )}
      </div>
    </>
  );
}

export function GuidePage() {
  const { slug } = useParams<{ slug: string }>();
  const staticGuide = guideBySlug(slug ?? '');
  const [liveGuide, setLiveGuide] = useState<Guide | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    void guideRepo.getPublished(slug ?? '').then((result) => {
      if (!alive) return;
      setLiveGuide(result.error ? staticGuide : result.data);
    });
    return () => { alive = false; };
  }, [slug]);

  const guide = liveGuide === undefined ? staticGuide : liveGuide;

  const trail = guide
    ? [
        { label: 'الرئيسية', to: '/' },
        { label: 'المقالات', to: '/articles' },
        { label: guide.title },
      ]
    : [];

  usePageMeta(
    guide
      ? {
          title: `${guide.title} | ezyjobs`,
          description: guide.excerpt,
          jsonLd: {
            '@graph': [
              articleJsonLd(guide),
              breadcrumbJsonLd(trail, 'https://ezyjobs.com'),
              ...(guide.faqs ? [faqJsonLd(guide.faqs)] : []),
            ],
          },
        }
      : { title: 'الدليل غير موجود | ezyjobs', noIndex: true },
  );

  if (!guide) {
    return (
      <div className="mx-auto max-w-[1240px] px-5 py-24">
        <EmptyState
          title="لم نجد هذا الدليل"
          body="ربما تغيّر الرابط. تصفّح قائمة الأدلة كاملة."
          action={
            <Link to="/guides" className="ez-btn ez-btn-primary px-6 py-3 text-sm">
              كل الأدلة
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <header className="relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
          <Breadcrumbs trail={trail} />
          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <Badge tone="brand">{guideCategoryName[guide.category]}</Badge>
            <span className="text-[12px] text-muted">
              <span className="tnum">{guide.minutes}</span> دقائق · {dateText(guide.publishedAt)}
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-black leading-tight text-ink sm:text-4xl">
            {guide.title}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.95] text-muted">{guide.excerpt}</p>
        </div>
      </header>

      <div className="article-detail-body mx-auto max-w-[1240px] px-5 py-12 lg:px-10 lg:py-16">
        <div className="article-detail-grid">
          <div className="article-detail-prose ez-panel p-6 sm:p-9 lg:p-12">
            <Prose>
              {guide.body.map((b, i) => (
            <section key={i}>
              {b.heading && <h2>{b.heading}</h2>}
              {b.paragraphs?.map((p, k) => (
                <p key={k} className="mt-4">
                  {p}
                </p>
              ))}
              {b.bullets && (
                <ul className="mt-4 space-y-2">
                  {b.bullets.map((x, k) => (
                    <li key={k}>{x}</li>
                  ))}
                </ul>
              )}
            </section>
              ))}
            </Prose>
          </div>

          <aside className="article-detail-rail">
            <div className="article-detail-rail__card ez-panel p-5">
              <span className="ez-eyebrow">READING MODE</span>
              <p className="mt-3 text-sm font-black text-ink">{guide.minutes} دقائق قراءة</p>
              <p className="mt-1 text-xs leading-6 text-muted">مقالة مرتبة لتقرأها بسرعة ثم تنتقل مباشرة إلى الخطوة التالية.</p>
            </div>
            {guide.related.length > 0 && (
              <div className="article-detail-rail__card ez-panel p-5">
                <span className="ez-eyebrow">RELATED</span>
                <div className="mt-3 space-y-2">
                  {guide.related.slice(0, 4).map((r) => (
                    <Link key={r.to} to={r.to} className="block rounded-xl px-3 py-2 text-[12px] font-bold text-ink transition hover:bg-brand-50 hover:text-brand">{r.title}</Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {guide.faqs && (
          <section className="article-detail-wide mt-14 max-w-3xl">
            <h2 className="text-2xl font-black text-ink">أسئلة سريعة</h2>
            <div className="mt-6">
              <FaqList faqs={guide.faqs} />
            </div>
          </section>
        )}

        <section className="article-detail-wide mt-14 max-w-3xl">
          <h2 className="text-2xl font-black text-ink">الخطوة التالية</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link to="/jobs" className="ez-card p-5">
              <p className="text-[14px] font-bold text-ink">ابحث عن وظيفة تناسبك</p>
              <p className="mt-1.5 text-[12.5px] text-muted">
                تصفية حسب الدولة والمستوى والدوام، مع شرح ملاءمة كل فرصة.
              </p>
            </Link>
            <Link to="/tools" className="ez-card p-5">
              <p className="text-[14px] font-bold text-ink">جهّز ملفك</p>
              <p className="mt-1.5 text-[12.5px] text-muted">
                منشئ سيرة ذاتية، فاحص توافق، وبنك أسئلة مقابلة — مجاناً.
              </p>
            </Link>
          </div>

          {guide.related.length > 0 && (
            <div className="article-detail-related mt-8 border-t border-line pt-6">
              <h3 className="text-sm font-bold text-ink">اقرأ أيضاً</h3>
              <ul className="mt-3 space-y-2">
                {guide.related.map((r) => (
                  <li key={r.to}>
                    <Link to={r.to} className="text-[13.5px]">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
