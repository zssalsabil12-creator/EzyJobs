import { useEffect, useMemo, useState } from 'react';
import { AdminShell, Badge, Button, Field } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { guideRepo } from '../lib/guideRepo';
import { GUIDES, type Guide } from '../content/guides';
import { usePageMeta } from '../lib/seo';

type AdminGuide = Guide & { published: boolean; updatedAt: string };

const emptyGuide = (): Guide => ({
  slug: '',
  title: '',
  excerpt: '',
  minutes: 5,
  category: 'remote',
  publishedAt: new Date().toISOString(),
  body: [],
  faqs: [],
  related: [],
});

function bodyToText(body: Guide['body']) {
  return body.map((block) => [
    block.heading ? `## ${block.heading}` : '',
    ...(block.paragraphs ?? []),
    ...(block.bullets ?? []).map((item) => `- ${item}`),
  ].filter(Boolean).join('\n')).join('\n\n');
}

function textToBody(value: string): Guide['body'] {
  const blocks: Guide['body'] = [];
  let current: Guide['body'][number] = {};
  const flush = () => {
    if (current.heading || current.paragraphs?.length || current.bullets?.length) blocks.push(current);
    current = {};
  };
  for (const raw of value.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    if (line.startsWith('## ')) {
      flush();
      current = { heading: line.slice(3).trim() };
      continue;
    }
    if (line.startsWith('- ')) {
      current.bullets = [...(current.bullets ?? []), line.slice(2).trim()];
    } else {
      current.paragraphs = [...(current.paragraphs ?? []), line];
    }
  }
  flush();
  return blocks;
}
function faqToText(faqs: Guide['faqs']) {
  return (faqs ?? []).map((f) => `${f.q} || ${f.a}`).join('\n');
}

function textToFaq(value: string): NonNullable<Guide['faqs']> {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [q, ...rest] = line.split('||');
    return { q: q.trim(), a: rest.join('||').trim() };
  }).filter((item) => item.q && item.a);
}

function relatedToText(items: Guide['related']) {
  return items.map((item) => `${item.title} || ${item.to}`).join('\n');
}

function textToRelated(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
    const [title, ...rest] = line.split('||');
    return { title: title.trim(), to: rest.join('||').trim() };
  }).filter((item) => item.title && item.to);
}

export default function AdminGuidesPage() {
  const [rows, setRows] = useState<AdminGuide[]>([]);
  const [guide, setGuide] = useState<Guide>(emptyGuide());
  const [published, setPublished] = useState(true);
  const [bodyText, setBodyText] = useState('');
  const [faqText, setFaqText] = useState('');
  const [relatedText, setRelatedText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  usePageMeta({ title: 'إدارة الأدلة | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const result = await guideRepo.listAdmin();
    if (result.error) {
      setMessage({ tone: 'error', text: result.error });
    } else {
      setRows(result.data);
      if (result.data.length && !guide.slug) selectRow(result.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const sorted = useMemo(() => [...rows].sort((a, b) => a.title.localeCompare(b.title, 'ar')), [rows]);

  function selectRow(row: AdminGuide) {
    setGuide({
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      minutes: row.minutes,
      category: row.category,
      publishedAt: row.publishedAt,
      body: row.body,
      faqs: row.faqs,
      related: row.related,
    });
    setPublished(row.published);
    setBodyText(bodyToText(row.body));
    setFaqText(faqToText(row.faqs));
    setRelatedText(relatedToText(row.related));
    setMessage(null);
  }

  function newGuide() {
    const next = emptyGuide();
    setGuide(next);
    setPublished(true);
    setBodyText('');
    setFaqText('');
    setRelatedText('');
    setMessage(null);
  }
  async function save() {
    setSaving(true);
    const payload: Guide = {
      ...guide,
      slug: guide.slug.trim(),
      title: guide.title.trim(),
      excerpt: guide.excerpt.trim(),
      minutes: Number(guide.minutes) || 5,
      body: textToBody(bodyText),
      faqs: textToFaq(faqText),
      related: textToRelated(relatedText),
      publishedAt: guide.publishedAt || new Date().toISOString(),
    };
    const result = await guideRepo.save(payload, published);
    setSaving(false);
    setMessage(result.ok
      ? { tone: 'success', text: 'تم حفظ الدليل.' }
      : { tone: 'error', text: result.error ?? 'تعذر حفظ الدليل.' });
    if (result.ok) {
      const reloaded = await guideRepo.listAdmin();
      if (!reloaded.error) {
        setRows(reloaded.data);
        const updated = reloaded.data.find((item) => item.slug === payload.slug);
        if (updated) selectRow(updated);
      }
    }
  }

  async function remove() {
    if (!guide.slug || !window.confirm(`حذف الدليل «${guide.title}»؟`)) return;
    setSaving(true);
    const result = await guideRepo.remove(guide.slug);
    setSaving(false);
    setMessage(result.ok
      ? { tone: 'success', text: 'تم حذف الدليل.' }
      : { tone: 'error', text: result.error ?? 'تعذر حذف الدليل.' });
    if (result.ok) {
      setGuide(emptyGuide());
      setBodyText('');
      setFaqText('');
      setRelatedText('');
      await load();
    }
  }
  return (
    <AdminShell title="الأدلة والمقالات" eyebrow="CONTENT CMS" description="إنشاء وتعديل ونشر الأدلة التعليمية من محرر إداري واحد.">
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        {message && <div className="mb-6"><Notice tone={message.tone}>{message.text}</Notice></div>}
        {loading ? (
          <div className="ez-panel p-14 text-center text-sm text-muted"><Spinner /> جارٍ تحميل الأدلة</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[310px_1fr]">
            <aside className="ez-panel h-fit overflow-hidden">
              <div className="flex items-center justify-between border-b border-line p-4">
                <h2 className="font-bold text-ink">الأدلة</h2>
                <Button onClick={newGuide} className="px-3 py-1.5 text-xs">جديد</Button>
              </div>
              <div className="max-h-[720px] overflow-y-auto divide-y divide-line">
                {sorted.map((row) => (
                  <button key={row.slug} onClick={() => selectRow(row)} className={`w-full p-4 text-right transition-colors ${row.slug === guide.slug ? 'bg-brand-50' : 'hover:bg-paper-2'}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-2 text-sm font-bold text-ink">{row.title}</span>
                      <Badge tone={row.published ? 'positive' : 'caution'}>{row.published ? 'منشور' : 'مخفي'}</Badge>
                    </div>
                    <span className="mt-1 block text-[11px] text-muted">{row.slug}</span>
                  </button>
                ))}
              </div>
              {!rows.length && <p className="p-5 text-sm text-muted">لا توجد أدلة في قاعدة البيانات بعد.</p>}
            </aside>
            <section className="space-y-6">
              <div className="ez-panel p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><span className="ez-eyebrow">EDITOR</span><h2 className="mt-1 text-xl font-black text-ink">محرر الدليل</h2></div>
                  <div className="flex gap-2"><Button disabled={saving} onClick={() => void save()}>حفظ ونشر</Button><button disabled={saving || !guide.slug} onClick={() => void remove()} className="ez-btn px-4 py-2 text-sm text-danger">حذف</button></div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="العنوان"><input value={guide.title} onChange={(e) => setGuide({ ...guide, title: e.target.value })} className="ez-input" /></Field>
                  <Field label="Slug"><input dir="ltr" value={guide.slug} onChange={(e) => setGuide({ ...guide, slug: e.target.value })} placeholder="remote-jobs-for-beginners" className="ez-input" /></Field>
                  <Field label="التصنيف"><select value={guide.category} onChange={(e) => setGuide({ ...guide, category: e.target.value as Guide['category'] })} className="ez-input"><option value="remote">العمل عن بُعد</option><option value="cv">السيرة الذاتية</option><option value="search">البحث عن وظيفة</option><option value="students">الطلاب</option><option value="interview">المقابلات</option></select></Field>
                  <Field label="دقائق القراءة"><input type="number" min="1" max="240" value={guide.minutes} onChange={(e) => setGuide({ ...guide, minutes: Number(e.target.value) })} className="ez-input" /></Field>
                </div>
                <Field label="المقدمة / Excerpt"><textarea value={guide.excerpt} onChange={(e) => setGuide({ ...guide, excerpt: e.target.value })} rows={3} className="ez-input mt-2 resize-y" /></Field>
                <label className="mt-4 flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> منشور للعامة</label>
              </div>

              <div className="ez-panel p-7">
                <Field label="محتوى الدليل"><textarea dir="rtl" value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={22} className="ez-input mt-2 resize-y font-sans leading-[1.9]" /></Field>
                <p className="mt-2 text-xs text-muted">استخدم <code>## عنوان</code> لعناوين الأقسام، وسطرًا عادياً للفقرات، و<code>- نص</code> للقوائم.</p>
              </div>

              <div className="ez-panel p-7">
                <Field label="الأسئلة الشائعة"><textarea value={faqText} onChange={(e) => setFaqText(e.target.value)} rows={8} className="ez-input mt-2 resize-y" /></Field>
                <p className="mt-2 text-xs text-muted">سطر واحد لكل سؤال: السؤال || الإجابة</p>
              </div>

              <div className="ez-panel p-7">
                <Field label="الروابط ذات الصلة"><textarea value={relatedText} onChange={(e) => setRelatedText(e.target.value)} rows={6} className="ez-input mt-2 resize-y" /></Field>
                <p className="mt-2 text-xs text-muted">سطر واحد لكل رابط: العنوان || /المسار</p>
              </div>

              {guide.slug && <p className="text-xs text-muted">المصدر الحالي: <span className="font-mono">{guide.slug}</span>. ويمكن معاينته من <a className="text-brand underline" href={`/guides/${guide.slug}`}>الصفحة العامة</a>.</p>}
            </section>
          </div>
        )}
      </main>
    </AdminShell>
  );
}
