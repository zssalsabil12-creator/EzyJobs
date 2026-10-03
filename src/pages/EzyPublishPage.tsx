import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Link } from 'react-router-dom';
import PageAura from '../components/art/PageAura';
import { Badge, Button, Field, Section, TextInput } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../lib/auth';
import { creatorRepo, type CreatorArticle, type CreatorPayout, type CreatorRevenue, type EarningsSummary, type WriterApplication, type WriterContract } from '../lib/creatorRepo';
import { tasksRepo, type TaskReward } from '../lib/tasksRepo';
import { uploadWriterImage } from '../lib/writerMedia';
import { analyzeWriterSeo, canSubmitWriterArticle, type WriterSeoResult } from '../lib/writerSeo';
import { usePageMeta } from '../lib/seo';

type Tab = 'program' | 'articles' | 'editor' | 'earnings';
type FontFamily = CreatorArticle['fontFamily'];

type Draft = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  featuredImageUrl: string;
  featuredImageAlt: string;
  fontFamily: FontFamily;
  fontSize: number;
};

const emptyDraft = (): Draft => ({
  slug: '', title: '', excerpt: '', content: '', seoTitle: '', seoDescription: '',
  focusKeyword: '', featuredImageUrl: '', featuredImageAlt: '', fontFamily: 'system', fontSize: 18,
});export default function EzyPublishPage() {
  const { session, username } = useAuth();
  const [tab, setTab] = useState<Tab>('program');
  const [articles, setArticles] = useState<CreatorArticle[]>([]);
  const [revenue, setRevenue] = useState<CreatorRevenue[]>([]);
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [taskRewards, setTaskRewards] = useState<TaskReward[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningsSummary>({
    publishVerifiedCents: 0, publishPendingCents: 0,
    taskAvailableCents: 0, taskPendingCents: 0,
    verifiedCents: 0, pendingCents: 0, reservedCents: 0, availableCents: 0,
  });
  const [application, setApplication] = useState<WriterApplication | null>(null);
  const [contract, setContract] = useState<WriterContract | null>(null);
  const [programEnabled, setProgramEnabled] = useState(true);
  const [airtmUrl, setAirtmUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [airtmHandle, setAirtmHandle] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [applicationDraft, setApplicationDraft] = useState({
    studyStatus: 'طالب جامعي', fieldOfStudy: '', languages: 'العربية، الإنجليزية', sampleText: '', motivation: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  usePageMeta({ title: 'العمل ككاتب طلابي | ezyjobs', noIndex: true });

  const load = async () => {
    if (!session?.user.id) return;
    setLoading(true);
    const [a, r, p, summary, rewards, settings, app, writerContract] = await Promise.all([
      creatorRepo.getMyArticles(),
      creatorRepo.getMyRevenue(session.user.id),
      creatorRepo.getMyPayouts(session.user.id),
      creatorRepo.getMyEarningsSummary(),
      tasksRepo.listMyRewards(session.user.id),
      creatorRepo.getPublicSettings(),
      creatorRepo.getMyWriterApplication(session.user.id),
      creatorRepo.getMyWriterContract(session.user.id),
    ]);
    setArticles(a.data);
    setRevenue(r.data);
    setPayouts(p.data);
    setEarningsSummary(summary.data ?? earningsSummary);
    setTaskRewards(rewards.data);
    setAirtmUrl(settings.airtmReferralUrl);
    setProgramEnabled(settings.enabled);
    setApplication(app.data);
    setContract(writerContract.data);
    setMessage(a.error || r.error || p.error || summary.error || rewards.error || app.error || writerContract.error
      ? { tone: 'error', text: a.error || r.error || p.error || summary.error || rewards.error || app.error || writerContract.error || 'تعذر تحميل البيانات.' } : null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [session?.user.id]);

  const lifetime = earningsSummary.verifiedCents;
  const pending = earningsSummary.pendingCents;
  const reserved = earningsSummary.reservedCents;
  const available = earningsSummary.availableCents;
  const monthlyPublished = useMemo(() => {
    const now = new Date();
    return articles.filter((a) => {
      if (a.status !== 'published' || !a.publishedAt) return false;
      const date = new Date(a.publishedAt);
      return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    }).length;
  }, [articles]);  const openEditor = (article?: CreatorArticle) => {
    setEditingId(article?.id ?? null);
    setDraft(article ? {
      slug: article.slug, title: article.title, excerpt: article.excerpt, content: article.content,
      seoTitle: article.seoTitle, seoDescription: article.seoDescription, focusKeyword: article.focusKeyword,
      featuredImageUrl: article.featuredImageUrl, featuredImageAlt: article.featuredImageAlt,
      fontFamily: article.fontFamily, fontSize: article.fontSize,
    } : emptyDraft());
    setTab('editor'); setMessage(null);
  };

  const seo: WriterSeoResult = useMemo(() => analyzeWriterSeo({
    title: draft.title, seoTitle: draft.seoTitle, seoDescription: draft.seoDescription, focusKeyword: draft.focusKeyword,
    slug: draft.slug, content: draft.content, contentHtml: contentToHtml(draft.content),
    featuredImageUrl: draft.featuredImageUrl, featuredImageAlt: draft.featuredImageAlt,
  }), [draft]);

  const save = async (status: 'draft' | 'pending') => {
    if (!session?.user.id) return;
    if (draft.title.trim().length < 8 || draft.content.trim().length < 120) {
      setMessage({ tone: 'error', text: 'اكتب عنواناً واضحاً ومحتوى أولياً مناسباً قبل الحفظ.' }); return;
    }
    if (status === 'pending' && contract?.status !== 'active') {
      setMessage({ tone: 'error', text: 'يجب قبولك في برنامج الكاتب وتفعيل عقدك قبل إرسال المقال للمراجعة.' }); return;
    }
    if (status === 'pending' && !canSubmitWriterArticle(seo)) {
      setMessage({ tone: 'error', text: 'لا يمكن إرسال المقال قبل الوصول إلى 80/100 وإكمال العناصر الأساسية في فحص SEO.' }); return;
    }
    setSaving(true);
    const payload = {
      slug: draft.slug.trim(), title: draft.title, excerpt: draft.excerpt, content: draft.content,
      contentHtml: contentToHtml(draft.content), seoTitle: draft.seoTitle, seoDescription: draft.seoDescription,
      focusKeyword: draft.focusKeyword, seoScore: seo.score, seoReport: seo,
      featuredImageUrl: draft.featuredImageUrl, featuredImageAlt: draft.featuredImageAlt,
      fontFamily: draft.fontFamily, fontSize: draft.fontSize, status,
    };
    const result = editingId ? await creatorRepo.updateArticle(editingId, payload) : await creatorRepo.createArticle(payload, session.user.id);
    setSaving(false);
    if (result.error) { setMessage({ tone: 'error', text: result.error }); return; }
    setMessage({ tone: 'success', text: status === 'pending' ? 'تم إرسال المقال للمراجعة ولن ينشر قبل الموافقة.' : 'تم حفظ المسودة.' });
    setDraft(emptyDraft()); setEditingId(null); await load(); setTab('articles');
  };  const remove = async (article: CreatorArticle) => {
    if (!window.confirm('حذف هذا المقال نهائياً؟')) return;
    setSaving(true); const result = await creatorRepo.deleteArticle(article.id); setSaving(false);
    if (result.error) setMessage({ tone: 'error', text: result.error }); else await load();
  };

  const uploadImage = async (file: File) => {
    if (!session?.user.id) return;
    setUploadingImage(true); const result = await uploadWriterImage(session.user.id, file); setUploadingImage(false);
    setMessage(result.error ? { tone: 'error', text: result.error } : { tone: 'success', text: 'تم رفع الصورة وتحسين حجمها تلقائياً.' });
    if (!result.error) setDraft((x) => ({ ...x, featuredImageUrl: result.url }));
  };

  const submitApplication = async () => {
    if (applicationDraft.sampleText.trim().length < 200 || applicationDraft.motivation.trim().length < 40) {
      setMessage({ tone: 'error', text: 'أضف عينة كتابة لا تقل عن 200 حرف ودافعاً لا يقل عن 40 حرفاً.' }); return;
    }
    setSaving(true); const result = await creatorRepo.submitWriterApplication(applicationDraft); setSaving(false);
    setMessage(result.ok ? { tone: 'success', text: 'تم إرسال طلب الانضمام للمراجعة.' } : { tone: 'error', text: result.error ?? 'تعذر إرسال الطلب.' });
    if (result.ok) await load();
  };

  const withdraw = async () => {
    const amount = Math.round(Number(withdrawAmount) * 100);
    if (!Number.isFinite(amount) || amount < 2000) { setMessage({ tone: 'error', text: 'الحد الأدنى للسحب هو 20 USD.' }); return; }
    if (amount > available) { setMessage({ tone: 'error', text: 'المبلغ أكبر من رصيدك المتاح.' }); return; }
    if (airtmHandle.trim().length < 3) { setMessage({ tone: 'error', text: 'أدخل بريد أو معرف Airtm صالحاً.' }); return; }
    setSaving(true); const account = await creatorRepo.savePayoutAccount(session?.user.id ?? '', airtmHandle);
    const result = account.error ? { ok: false, error: account.error } : await creatorRepo.requestPayout(amount, airtmHandle); setSaving(false);
    setMessage(result.ok ? { tone: 'success', text: 'تم إنشاء طلب السحب.' } : { tone: 'error', text: result.error ?? 'تعذر إنشاء الطلب.' });
    if (result.ok) { setWithdrawAmount(''); await load(); }
  };

  if (!programEnabled) return <div className="min-h-screen bg-paper"><Section><div className="ez-panel mx-auto max-w-2xl p-8 text-center"><h1 className="text-3xl font-black text-ink">برنامج الكاتب</h1><p className="mt-3 text-muted">البرنامج غير متاح حالياً.</p></div></Section></div>;
  const activeContract = contract?.status === 'active';
  const tabs: [Tab, string][] = [['program', 'البرنامج'], ['articles', 'مقالاتي'], ['editor', 'اكتب مقالاً'], ['earnings', 'أرباحي']];

  return <div className="publish-shell min-h-screen bg-paper">
    <header className="publish-hero relative overflow-hidden border-b border-line bg-surface"><PageAura/><div className="relative mx-auto max-w-[1320px] px-5 py-12 lg:px-10">
      <span className="ez-eyebrow mb-4">STUDENT WRITER</span><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><h1 className="text-3xl font-black text-ink sm:text-4xl">وظيفة كاتب للطلبة داخل ezyjobs</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-muted">تكتب محتوى أصلياً مفيداً للباحثين عن العمل، وتحصل على أجر ثابت لكل مقال مقبول ضمن عقدك الشهري.</p></div><Link to="/profile" className="ez-btn ez-btn-ghost px-5 py-2.5 text-sm">الحساب {username ? '@' + username : ''}</Link></div>
      <div className="mt-7 flex flex-wrap gap-2">{tabs.map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={'ez-btn px-4 py-2.5 text-sm '+(tab===id?'ez-btn-primary':'ez-btn-ghost')}>{label}</button>)}</div>
    </div></header>
    <Section className="pt-10 lg:pt-14">{message && <div className="mb-6"><Notice tone={message.tone === 'success' ? 'success' : 'error'}>{message.text}</Notice></div>}{loading ? <div className="ez-panel p-10 text-center"><Spinner/></div> : <>
      {tab==='program' && <ProgramPanel contract={contract} application={application} monthlyPublished={monthlyPublished} applicationDraft={applicationDraft} setApplicationDraft={setApplicationDraft} saving={saving} onApply={submitApplication}/>} 
      {tab==='articles' && <ArticlesPanel articles={articles} onNew={()=>openEditor()} onEdit={openEditor} onDelete={remove}/>} 
      {tab==='editor' && (activeContract ? <EditorPanel draft={draft} setDraft={setDraft} editingId={editingId} saving={saving} uploadingImage={uploadingImage} seo={seo} onUploadImage={uploadImage} onSave={save}/> : <div className="ez-panel mx-auto max-w-2xl p-8 text-center"><h2 className="text-xl font-black text-ink">المحرر متاح للكتّاب المقبولين</h2><p className="mt-2 text-sm leading-7 text-muted">أرسل طلب الانضمام أولاً، وبعد قبولك سيظهر لك العقد والمحرر الكامل.</p><Button className="mt-5" onClick={()=>setTab('program')}>عرض البرنامج</Button></div>)}
      {tab==='earnings' && <EarningsPanel lifetime={lifetime} pending={pending} available={available} reserved={reserved} revenue={revenue} taskRewards={taskRewards} payouts={payouts} airtmUrl={airtmUrl} airtmHandle={airtmHandle} setAirtmHandle={setAirtmHandle} withdrawAmount={withdrawAmount} setWithdrawAmount={setWithdrawAmount} onWithdraw={withdraw} saving={saving}/>}</>}</Section>
  </div>;
}function ProgramPanel({ contract, application, monthlyPublished, applicationDraft, setApplicationDraft, saving, onApply }: {
  contract: WriterContract | null; application: WriterApplication | null; monthlyPublished: number;
  applicationDraft: { studyStatus:string; fieldOfStudy:string; languages:string; sampleText:string; motivation:string };
  setApplicationDraft: Dispatch<SetStateAction<{ studyStatus:string; fieldOfStudy:string; languages:string; sampleText:string; motivation:string }>>;
  saving: boolean; onApply: () => void;
}) {
  const money = (c:number) => (c/100).toLocaleString('en-US',{style:'currency',currency:'USD'});
  return <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
    <div className="space-y-5">
      <div className="ez-panel p-7"><span className="ez-eyebrow">HOW IT WORKS</span><h2 className="mt-2 text-2xl font-black text-ink">دخل ثابت بطريقة قابلة للاستمرار</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">{[['1','طلب انضمام','تقدم عينة كتابة حقيقية وبياناتك الدراسية.'],['2','عقد شهري','تحدد الإدارة حصتك الشهرية وسعر المقال وسقف الدخل.'],['3','أجر ثابت','كل مقال مقبول ومنشور يضيف الأجر المتفق عليه إلى رصيدك.']].map(([n,t,x])=><div key={n} className="rounded-2xl border border-line bg-paper p-4"><span className="text-sm font-black text-brand">{n}</span><h3 className="mt-2 font-black text-ink">{t}</h3><p className="mt-1 text-xs leading-6 text-muted">{x}</p></div>)}</div>
      </div>
      {contract?.status === 'active' ? <div className="ez-panel p-7"><div className="flex flex-wrap items-start justify-between gap-4"><div><span className="ez-eyebrow">YOUR CONTRACT</span><h2 className="mt-2 text-xl font-black text-ink">عقدك الحالي</h2></div><Badge tone="positive">نشط</Badge></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="أجر المقال" value={money(contract.perArticleCents)}/><Metric label="الحصة الشهرية" value={String(contract.monthlyQuota)}/><Metric label="السقف الشهري" value={money(contract.monthlyCapCents)}/></div>
        <p className="mt-4 text-sm text-muted">أنجزت هذا الشهر {monthlyPublished} من {contract.monthlyQuota} مقال منشور.</p></div> :
      <div className="ez-panel p-7"><div className="flex items-center justify-between gap-3"><div><span className="ez-eyebrow">JOIN</span><h2 className="mt-2 text-xl font-black text-ink">اطلب الانضمام إلى وظيفة الكاتب</h2></div>{application && <Badge tone={application.status==='approved'?'positive':application.status==='rejected'?'negative':'caution'}>{application.status}</Badge>}</div>
        {application?.adminNote && <p className="mt-4 rounded-xl bg-paper p-4 text-sm text-muted">ملاحظة الإدارة: {application.adminNote}</p>}
        <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="وضعك الدراسي"><TextInput value={applicationDraft.studyStatus} onChange={e=>setApplicationDraft(x=>({...x,studyStatus:e.target.value}))}/></Field><Field label="التخصص"><TextInput value={applicationDraft.fieldOfStudy} onChange={e=>setApplicationDraft(x=>({...x,fieldOfStudy:e.target.value}))} placeholder="مثال: إعلام آلي، اقتصاد..."/></Field></div>
        <Field label="اللغات التي تكتب بها"><TextInput value={applicationDraft.languages} onChange={e=>setApplicationDraft(x=>({...x,languages:e.target.value}))}/></Field>
        <Field label="عينة كتابية *"><textarea value={applicationDraft.sampleText} onChange={e=>setApplicationDraft(x=>({...x,sampleText:e.target.value}))} rows={9} className="ez-input mt-2 resize-y" placeholder="اكتب فقرة حقيقية تبيّن قدرتك على الشرح..."/></Field>
        <Field label="لماذا تريد هذه الوظيفة؟ *"><textarea value={applicationDraft.motivation} onChange={e=>setApplicationDraft(x=>({...x,motivation:e.target.value}))} rows={5} className="ez-input mt-2 resize-y"/></Field>
        <Button disabled={saving} onClick={onApply}>{saving?'جارٍ الإرسال':'إرسال / تحديث الطلب'}</Button>
      </div>}
    </div>
    <div className="space-y-5"><div className="ez-panel p-7"><h2 className="font-black text-ink">ما الذي ندفع عليه؟</h2><ul className="mt-4 space-y-3 text-sm leading-7 text-muted"><li>مقال أصلي ومفيد للباحثين عن العمل.</li><li>مقال اجتاز فحص SEO الداخلي قبل الإرسال.</li><li>صورة رئيسية مناسبة + نص بديل.</li><li>لا نسخ، لا حشو كلمات، ولا زيارات مصطنعة.</li></ul></div>
      <div className="ez-panel p-7"><h2 className="font-black text-ink">مصدر ربح الموقع</h2><p className="mt-3 text-sm leading-7 text-muted">المقالات تجلب الباحثين إلى الوظائف، أدوات السيرة الذاتية، الروابط التابعة، والإعلانات. لذلك ندفع للكاتب على الإنتاج المقبول لا على مشاهدات وهمية.</p></div></div>
  </div>;
}function ArticlesPanel({ articles, onNew, onEdit, onDelete }: { articles:CreatorArticle[]; onNew:()=>void; onEdit:(a:CreatorArticle)=>void; onDelete:(a:CreatorArticle)=>void }) {
  return <div className="space-y-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black text-ink">مقالاتك</h2><p className="mt-1 text-sm text-muted">المقال لا يصبح عاماً إلا بعد مراجعة الإدارة.</p></div><Button onClick={onNew}>+ مقال جديد</Button></div>
    {articles.length===0 ? <div className="ez-panel p-10 text-center"><h3 className="text-lg font-black text-ink">لا توجد مقالات بعد</h3><p className="mt-2 text-sm text-muted">ابدأ من المحرر عندما يكون عقد الكاتب نشطاً.</p><Button className="mt-5" onClick={onNew}>ابدأ الكتابة</Button></div> : <div className="space-y-3">{articles.map(a=><article key={a.id} className="ez-panel p-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><Badge tone={a.status==='published'?'positive':a.status==='rejected'?'negative':'caution'}>{statusLabel(a.status)}</Badge><span className="text-xs text-muted">SEO {a.seoScore}/100 · {a.views.toLocaleString('en-US')} قراءة</span></div><h3 className="mt-2 text-lg font-black text-ink">{a.title}</h3><p className="mt-1 text-sm text-muted">{a.excerpt||'بدون ملخص'}</p></div><div className="flex shrink-0 gap-2"><Button size="sm" variant="ghost" onClick={()=>onEdit(a)}>تعديل</Button>{a.status==='published'&&<Link to={"/publish/"+a.slug} className="ez-btn ez-btn-ghost px-4 py-2 text-[13px]">فتح</Link>}<Button size="sm" variant="ghost" onClick={()=>onDelete(a)}>حذف</Button></div></div></article>)}</div>}
  </div>;
}

function EditorPanel({ draft, setDraft, editingId, saving, uploadingImage, seo, onUploadImage, onSave }: { draft:Draft; setDraft:Dispatch<SetStateAction<Draft>>; editingId:string|null; saving:boolean; uploadingImage:boolean; seo:WriterSeoResult; onUploadImage:(file:File)=>void; onSave:(status:'draft'|'pending')=>void }) {
  const previewHtml=contentToHtml(draft.content);
  return <div className="mx-auto grid max-w-[1280px] gap-6 xl:grid-cols-[1fr_360px]"><div className="space-y-5">
    <div className="ez-panel p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="ez-eyebrow">EDITOR</span><h2 className="mt-1 text-xl font-black text-ink">{editingId?'تحرير المقال':'مقال جديد'}</h2></div><Badge tone={seo.score>=80?'positive':'caution'}>SEO {seo.score}/100</Badge></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="عنوان المقال *"><TextInput value={draft.title} onChange={e=>setDraft(x=>({...x,title:e.target.value,seoTitle:x.seoTitle||e.target.value}))} maxLength={180} placeholder="مثال: أفضل وظائف عن بُعد للطلبة..."/></Field><Field label="Slug SEO *"><TextInput dir="ltr" value={draft.slug} onChange={e=>setDraft(x=>({...x,slug:e.target.value}))} placeholder="remote-jobs-for-students"/></Field></div>
      <Field label="الملخص"><TextInput value={draft.excerpt} onChange={e=>setDraft(x=>({...x,excerpt:e.target.value}))} maxLength={300} placeholder="ما الفائدة التي سيحصل عليها القارئ؟"/></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="الكلمة المفتاحية الأساسية *"><TextInput value={draft.focusKeyword} onChange={e=>setDraft(x=>({...x,focusKeyword:e.target.value}))} placeholder="وظائف اونلاين للطلبة"/></Field><Field label="عنوان SEO *"><TextInput value={draft.seoTitle} onChange={e=>setDraft(x=>({...x,seoTitle:e.target.value}))} maxLength={70}/></Field></div>
      <Field label="وصف SEO *"><textarea value={draft.seoDescription} onChange={e=>setDraft(x=>({...x,seoDescription:e.target.value}))} rows={4} maxLength={180} className="ez-input mt-2 resize-y"/></Field>
    </div>
    <div className="ez-panel p-7"><div className="grid gap-4 sm:grid-cols-2"><Field label="نوع الخط"><select value={draft.fontFamily} onChange={e=>setDraft(x=>({...x,fontFamily:e.target.value as FontFamily}))} className="ez-input"><option value="system">System Arabic</option><option value="inter">Inter</option><option value="tahoma">Tahoma</option><option value="arial">Arial</option><option value="georgia">Georgia</option></select></Field><Field label="حجم النص"><select value={draft.fontSize} onChange={e=>setDraft(x=>({...x,fontSize:Number(e.target.value)}))} className="ez-input">{[16,17,18,19,20,21,22].map(n=><option key={n} value={n}>{n}px</option>)}</select></Field></div>
      <Field label="المحتوى *" hint="استخدم ## قبل عنوان فرعي، و- قبل عناصر القائمة، و[text](/jobs) للرابط الداخلي."><textarea dir="rtl" value={draft.content} onChange={e=>setDraft(x=>({...x,content:e.target.value}))} rows={24} className="ez-input mt-2 resize-y leading-[1.9]" placeholder={"ابدأ بفقرة قوية...\n\n## عنوان فرعي\n\n- نقطة مهمة"}/></Field></div>
    <div className="ez-panel p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><span className="ez-eyebrow">IMAGE</span><h2 className="mt-1 text-lg font-black text-ink">الصورة الرئيسية</h2></div><label className="ez-btn ez-btn-ghost cursor-pointer px-4 py-2 text-sm">{uploadingImage?'جارٍ التحسين...':'رفع صورة'}<input type="file" accept="image/*" className="hidden" disabled={uploadingImage} onChange={e=>{const file=e.target.files?.[0];if(file)onUploadImage(file);e.currentTarget.value='';}}/></label></div>{draft.featuredImageUrl&&<img src={draft.featuredImageUrl} alt="" className="mt-5 aspect-video w-full rounded-2xl object-cover"/>}<Field label="نص بديل للصورة *"><TextInput value={draft.featuredImageAlt} onChange={e=>setDraft(x=>({...x,featuredImageAlt:e.target.value}))} placeholder="مثال: طالب يكتب مقالاً للعمل عن بُعد"/></Field><p className="mt-2 text-xs leading-6 text-muted">يتم ضغط الصورة إلى WebP وبعرض مناسب قبل الرفع.</p></div>
    <div className="ez-panel overflow-hidden"><div className="border-b border-line p-5"><h2 className="font-black text-ink">المعاينة</h2></div><article className="p-7" style={{fontFamily:fontCss(draft.fontFamily),fontSize:draft.fontSize}}>{draft.featuredImageUrl&&<img src={draft.featuredImageUrl} alt={draft.featuredImageAlt} className="mb-6 aspect-video w-full rounded-2xl object-cover"/>}<h1 className="text-3xl font-black text-ink">{draft.title||'عنوان المقال'}</h1><p className="mt-3 text-muted">{draft.excerpt}</p><div className="mt-7 max-w-none leading-[1.9]" dangerouslySetInnerHTML={{__html:previewHtml}}/></article></div>
    <div className="flex flex-wrap justify-end gap-2"><Button variant="ghost" disabled={saving} onClick={()=>onSave('draft')}>حفظ مسودة</Button><Button disabled={saving||!canSubmitWriterArticle(seo)} onClick={()=>onSave('pending')}>{saving?'جارٍ الإرسال':'إرسال للمراجعة'}</Button></div>
  </div><aside className="space-y-5 xl:sticky xl:top-6 xl:self-start"><div className="ez-panel p-6"><div className="flex items-center justify-between"><h2 className="font-black text-ink">فحص SEO الداخلي</h2><span className="text-2xl font-black text-brand">{seo.score}</span></div><p className="mt-2 text-xs leading-6 text-muted">أداة تحرير داخلية ولا تعني ضمان ترتيب محدد في Google.</p><div className="mt-4 space-y-3">{seo.checks.map(c=><div key={c.key} className="rounded-xl border border-line p-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-ink">{c.label}</span><Badge tone={c.passed?'positive':'caution'}>{c.passed?'✓':'!'}</Badge></div>{!c.passed&&<p className="mt-1 text-xs leading-5 text-muted">{c.note}</p>}</div>)}</div></div><div className="ez-panel p-6"><h2 className="font-black text-ink">جودة التحرير</h2><p className="mt-3 text-sm leading-7 text-muted">نراجع المحتوى قبل النشر لحماية الموقع والكاتب من النسخ والحشو والمعلومات غير الموثوقة.</p><div className="mt-4 rounded-xl bg-paper p-4 text-sm text-muted">عدد الكلمات: <b className="text-ink">{seo.wordCount.toLocaleString('en-US')}</b></div></div></aside></div>;
}function EarningsPanel({
  lifetime, pending, available, reserved, revenue, taskRewards, payouts, airtmUrl, airtmHandle,
  setAirtmHandle, withdrawAmount, setWithdrawAmount, onWithdraw, saving,
}: {
  lifetime:number;
  pending:number;
  available:number;
  reserved:number;
  revenue:CreatorRevenue[];
  taskRewards:TaskReward[];
  payouts:CreatorPayout[];
  airtmUrl:string;
  airtmHandle:string;
  setAirtmHandle:(v:string)=>void;
  withdrawAmount:string;
  setWithdrawAmount:(v:string)=>void;
  onWithdraw:()=>void;
  saving:boolean;
}) {
  const money=(c:number)=>(c/100).toLocaleString('en-US',{style:'currency',currency:'USD'});
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="أرباح موثقة" value={money(lifetime)}/>
      <Metric label="معلقة" value={money(pending)}/>
      <Metric label="متاح للسحب" value={money(available)}/>
      <Metric label="محجوز" value={money(reserved)}/>
    </div>
    <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
      <div className="space-y-5">
        <div className="ez-panel p-6">
          <h2 className="font-black text-ink">دخل EzyPublish</h2>
          <div className="mt-4 space-y-2">
            {revenue.length ? revenue.map(r =>
              <div key={r.id} className="flex items-center justify-between border-b border-line py-3 text-sm">
                <span><b>{revenueLabel(r.source)}</b><span className="ml-2 text-xs text-muted">{r.reference||'بدون مرجع'}</span></span>
                <span className="font-black text-ink">{money(r.creatorCents)}</span>
              </div>
            ) : <p className="text-sm text-muted">لا توجد إيرادات EzyPublish موثقة بعد.</p>}
          </div>
        </div>
        <div className="ez-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <div><h2 className="font-black text-ink">أرباح EzyTasks</h2><p className="mt-1 text-xs text-muted">تدخل في نفس الرصيد بعد الاعتماد وانتهاء فترة الحجز.</p></div>
            <Badge tone="neutral">{taskRewards.length} عملية</Badge>
          </div>
          <div className="mt-4 space-y-2">
            {taskRewards.length ? taskRewards.map(r =>
              <div key={r.id} className="flex items-center justify-between border-b border-line py-3 text-sm">
                <span>
                  <b>مهمة ممولة</b>
                  <span className="ml-2 text-xs text-muted">{r.status === 'available' ? 'متاح' : r.status === 'pending' ? 'قيد الاعتماد' : r.status}</span>
                </span>
                <span className="font-black text-ink">{money(r.amountCents)}</span>
              </div>
            ) : <p className="text-sm text-muted">لا توجد مكافآت Tasks بعد.</p>}
          </div>
        </div>
      </div>
      <div className="space-y-5">
        <div className="ez-panel p-6">
          <h2 className="font-black text-ink">السحب عبر Airtm</h2>
          <p className="mt-2 text-sm leading-6 text-muted">رصيد EzyPublish وEzyTasks يجتمع في نفس نظام السحب. الحد الأدنى 20 USD.</p>
          {airtmUrl&&<a href={airtmUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 block rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm font-bold text-brand">ليس لديك Airtm؟ استخدم رابط EzyJobs</a>}
          <div className="mt-4 space-y-3"><TextInput value={airtmHandle} onChange={e=>setAirtmHandle(e.target.value)} placeholder="بريد/معرف Airtm"/><TextInput value={withdrawAmount} onChange={e=>setWithdrawAmount(e.target.value)} placeholder="المبلغ بالدولار" type="number" min="20" step="0.01"/><Button block disabled={saving} onClick={onWithdraw}>{saving?'جارٍ الإرسال':'طلب السحب'}</Button></div>
        </div>
        <div className="ez-panel p-6">
          <h2 className="font-black text-ink">طلبات السحب</h2>
          <div className="mt-3 space-y-2">{payouts.length?payouts.map(p=><div key={p.id} className="flex items-center justify-between border-b border-line py-3 text-sm"><Badge tone={p.status==='paid'?'positive':p.status==='rejected'?'negative':'caution'}>{p.status}</Badge><b>{money(p.amountCents)}</b></div>):<p className="text-sm text-muted">لا توجد طلبات بعد.</p>}</div>
        </div>
      </div>
    </div>
  </div>;
}

function Metric({label,value}:{label:string;value:string}){return <div className="ez-panel p-5"><p className="text-xs font-bold uppercase tracking-wide text-muted">{label}</p><p className="mt-2 text-2xl font-black text-ink">{value}</p></div>;}
function statusLabel(status:CreatorArticle['status']){return {draft:'مسودة',pending:'بانتظار المراجعة',published:'منشور',rejected:'مرفوض'}[status];}
function revenueLabel(source:string){return {affiliate:'Affiliate',sponsored:'Sponsored',tips:'Tips',product:'Product',writer_fee:'أجر ثابت',other:'Other'}[source]??source;}
function fontCss(font:FontFamily){return {system:'system-ui, "Segoe UI", Tahoma, sans-serif',inter:'"Inter", "Segoe UI", sans-serif',arial:'Arial, sans-serif',tahoma:'Tahoma, sans-serif',georgia:'Georgia, serif'}[font];}
function contentToHtml(value:string){
  const escape=(text:string)=>text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  const lines=value.split(/\r?\n/); const out:string[]=[]; let list:string[]=[];
  const flush=()=>{if(list.length){out.push('<ul>'+list.map(item=>'<li>'+item+'</li>').join('')+'</ul>');list=[];}};
  for(const raw of lines){const line=raw.trim();if(!line){flush();continue;}if(line.startsWith('- ')){list.push(escape(line.slice(2)));continue;}flush();if(line.startsWith('## '))out.push('<h2>'+escape(line.slice(3))+'</h2>');else out.push('<p>'+linkify(escape(line))+'</p>');}
  flush(); return out.join('');
}
function linkify(escaped:string){return escaped.replace(/\[([^\]]+)\]\((\/(?!\/)[^\s)]+)\)/g,'<a href="$2">$1</a>');}
