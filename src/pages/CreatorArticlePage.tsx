import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageAura from '../components/art/PageAura';
import { Badge, Section } from '../components/ui/Primitives';
import { creatorRepo, type CreatorArticle } from '../lib/creatorRepo';
import { usePageMeta } from '../lib/seo';

export default function CreatorArticlePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<CreatorArticle | null>(null);
  const [error, setError] = useState('');
  const [airtmReferralUrl, setAirtmReferralUrl] = useState('');

  usePageMeta({
    title: article ? (article.seoTitle || article.title + ' | ezyjobs') : 'برنامج الكاتب | ezyjobs',
    description: article?.seoDescription || article?.excerpt,
    canonical: article ? window.location.origin + '/publish/' + article.slug : undefined,
  });

  useEffect(() => {
    creatorRepo.getPublishedBySlug(slug).then((result) => {
      setArticle(result.data);
      if (result.error) setError(result.error);
      if (result.data) void creatorRepo.recordEvent(result.data.id, 'view');
    });
    creatorRepo.getPublicSettings().then((settings) => setAirtmReferralUrl(settings.airtmReferralUrl));
  }, [slug]);

  useEffect(() => {
    if (!article) return;
    const timer = window.setTimeout(() => { void creatorRepo.recordEvent(article.id, 'qualified_read'); }, 30000);
    return () => window.clearTimeout(timer);
  }, [article]);

  if (error) {
    return <Section><div className="ez-panel p-8 text-center text-danger">{error}</div></Section>;
  }

  if (!article) {
    return <Section><div className="ez-panel p-10 text-center"><div className="text-3xl">…</div><p className="mt-3 text-sm text-muted">جارٍ تحميل المقال.</p></div></Section>;
  }

  const paragraphs = article.content.split(/\r?\n\s*\r?\n/).filter(Boolean);

  return (
    <div className="publish-article-shell min-h-screen bg-paper">
      <header className="publish-article-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[980px] px-5 py-16 lg:px-10">
          <Badge tone="brand">EzyPublish</Badge>
          <h1 className="mt-5 text-4xl font-black leading-tight text-ink sm:text-5xl">{article.title}</h1>
          {article.excerpt && <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{article.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted">
            <span>بقلم <b className="text-ink">{article.authorName}</b></span>
            <span>·</span><span>@{article.authorUsername}</span>
            <span>·</span><span>{article.views.toLocaleString('en-US')} قراءة</span>
            <span>·</span><span>{article.qualifiedReads.toLocaleString('en-US')} قراءة مؤهلة</span>
          </div>
        </div>
      </header>

      <Section className="publish-article-body pt-10 lg:pt-14">
        <article className="mx-auto max-w-[900px]">
          <div
            className="publish-article-content ez-panel space-y-6 p-6 sm:p-10 lg:p-12"
            style={{ fontFamily: fontCss(article.fontFamily), fontSize: article.fontSize }}
          >
            {article.featuredImageUrl && (
              <figure>
                <img src={article.featuredImageUrl} alt={article.featuredImageAlt || article.title} className="aspect-video w-full rounded-2xl object-cover" />
                {article.featuredImageAlt && <figcaption className="mt-2 text-xs text-muted">{article.featuredImageAlt}</figcaption>}
              </figure>
            )}
            {article.contentHtml
              ? <div className="leading-[1.9] text-ink/90" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
              : paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-wrap leading-[2] text-ink/90">{paragraph}</p>)}
          </div>

          <div className="mt-6 rounded-3xl border border-brand/20 bg-brand/5 p-6">
            <h2 className="text-lg font-black text-ink">ابحث عن فرصتك التالية</h2>
            <p className="mt-2 text-sm leading-7 text-muted">انتقل من القراءة إلى الفعل: استكشف الوظائف المناسبة لك داخل ezyjobs.</p>
            <Link to="/jobs" className="mt-4 inline-flex ez-btn ez-btn-primary px-5 py-2.5 text-sm">استكشف الوظائف</Link>
          </div>

          {airtmReferralUrl && (
            <div className="mt-5 rounded-3xl border border-line bg-surface p-6">
              <h2 className="text-lg font-black text-ink">تحتاج وسيلة لاستلام أرباحك؟</h2>
              <p className="mt-2 text-sm leading-7 text-muted">EzyJobs يوفر Airtm كخيار للسحب في برنامج EzyPublish عندما تكون إعدادات الدفع مفعلة.</p>
              <a
                href={airtmReferralUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={() => void creatorRepo.recordEvent(article.id, 'airtm_click')}
                className="mt-4 inline-flex ez-btn ez-btn-ghost px-5 py-2.5 text-sm"
              >
                فتح Airtm
              </a>
            </div>
          )}
        </article>
      </Section>
    </div>
  );
}
function fontCss(font: CreatorArticle['fontFamily']) {
  return {
    system: 'system-ui, "Segoe UI", Tahoma, sans-serif',
    inter: '"Inter", "Segoe UI", sans-serif',
    arial: 'Arial, sans-serif',
    tahoma: 'Tahoma, sans-serif',
    georgia: 'Georgia, serif',
  }[font];
}
