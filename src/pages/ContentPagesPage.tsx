import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell, Badge, Button, Field, Section, TextArea, TextInput } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { contentPageRepo, type ContentPage } from '../lib/contentPageRepo';
import { usePageMeta } from '../lib/seo';

type Draft = { slug: string; title: string; excerpt: string; body: string; metaDescription: string; published: boolean };

const emptyDraft = (): Draft => ({ slug: '', title: '', excerpt: '', body: '', metaDescription: '', published: true });

export default function ContentPagesPage() {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{tone:'success'|'error';text:string}|null>(null);

  usePageMeta({ title: 'إدارة صفحات الموقع | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const r = await contentPageRepo.listAdmin();
    setPages(r.data);
    setMessage(r.error ? {tone:'error',text:r.error} : null);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const startNew = () => { setDraft(emptyDraft()); setEditingId(null); setMessage(null); };
  const edit = (page: ContentPage) => {
    setEditingId(page.id);
    setDraft({slug:page.slug,title:page.title,excerpt:page.excerpt,body:page.body,metaDescription:page.metaDescription,published:page.published});
    window.scrollTo({top:0,behavior:'smooth'});
  };
  const save = async () => {
    if (!/^[a-z0-9][a-z0-9-]{0,89}$/.test(draft.slug) || !draft.title.trim() || !draft.body.trim()) {
      setMessage({tone:'error',text:'أدخل slug صحيحاً وعنواناً ومحتوى الصفحة.'}); return;
    }
    setSaving(true);
    const r = await contentPageRepo.save({...draft,id:editingId ?? undefined});
    setSaving(false);
    setMessage(r.error ? {tone:'error',text:r.error} : {tone:'success',text:'تم حفظ الصفحة.'});
    if (!r.error) { await load(); startNew(); }
  };
  const remove = async (page: ContentPage) => {
    if (!confirm('حذف الصفحة «'+page.title+'» نهائياً؟')) return;
    const r = await contentPageRepo.remove(page.id);
    setMessage(r.error ? {tone:'error',text:r.error} : {tone:'success',text:'تم حذف الصفحة.'});
    if (!r.error) await load();
  };

  return (
    <AdminShell title="صفحات الموقع" eyebrow="CONTENT CMS" description="إنشاء وتعديل ونشر الصفحات النصية والسياسات من مكان واحد.">
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        <div className="mb-5 flex justify-end"><Button onClick={startNew}>صفحة جديدة</Button></div>
        {message && <div className="mb-5"><Notice tone={message.tone}>{message.text}</Notice></div>}
        <div className="cms-editor-grid grid gap-6 lg:grid-cols-[1fr_1.35fr]">
          <div className="cms-page-list space-y-3">{loading ? <div className="ez-panel p-10 text-center"><Spinner/></div> : pages.map((page)=><div key={page.id} className="ez-panel p-5"><div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge tone={page.published?'positive':'caution'}>{page.published?'منشورة':'مسودة'}</Badge><span className="font-mono text-xs text-muted">/{page.slug}</span></div><h2 className="mt-2 font-black text-ink">{page.title}</h2><p className="mt-1 text-xs text-muted">{page.excerpt || 'بدون وصف'}</p></div><div className="flex gap-1"><Button size="sm" variant="ghost" onClick={()=>edit(page)}>تعديل</Button><Button size="sm" variant="ghost" onClick={()=>remove(page)}>حذف</Button></div></div></div>)}</div>
          <div className="cms-editor ez-panel p-6">
            <h2 className="text-xl font-black text-ink">{editingId ? 'تعديل الصفحة' : 'إنشاء صفحة'}</h2>
            <div className="mt-5 space-y-4">
              <Field label="المسار slug"><TextInput dir="ltr" value={draft.slug} onChange={e=>setDraft({...draft,slug:e.target.value})} placeholder="about"/></Field>
              <Field label="العنوان"><TextInput value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></Field>
              <Field label="الوصف المختصر"><TextInput value={draft.excerpt} onChange={e=>setDraft({...draft,excerpt:e.target.value})}/></Field>
              <Field label="وصف SEO"><TextInput value={draft.metaDescription} onChange={e=>setDraft({...draft,metaDescription:e.target.value})}/></Field>
              <Field label="المحتوى"><TextArea rows={20} value={draft.body} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder={'اكتب كل فقرة في سطر فارغ بين الفقرات...'} /></Field>
              <label className="flex items-center gap-2 text-sm font-bold text-ink"><input type="checkbox" checked={draft.published} onChange={e=>setDraft({...draft,published:e.target.checked})}/> نشر الصفحة</label>
              <div className="flex gap-2"><Button disabled={saving} onClick={save}>{saving?'جارٍ الحفظ':'حفظ الصفحة'}</Button><Button variant="ghost" disabled={saving} onClick={startNew}>إلغاء</Button></div>
            </div>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}
