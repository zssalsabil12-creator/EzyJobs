import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell, Badge, Button, Field, Section, TextArea, TextInput } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import {
  creatorRepo,
  type CreatorArticle,
  type CreatorPayout,
  type CreatorRevenue,
  type WriterApplication,
  type WriterContract,
} from '../lib/creatorRepo';
import { usePageMeta } from '../lib/seo';

type Tab = 'writers' | 'articles' | 'revenue' | 'payouts';

export default function AdminCreatorsPage() {
  const [tab, setTab] = useState<Tab>('writers');
  const [articles, setArticles] = useState<CreatorArticle[]>([]);
  const [revenue, setRevenue] = useState<CreatorRevenue[]>([]);
  const [payouts, setPayouts] = useState<CreatorPayout[]>([]);
  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [contracts, setContracts] = useState<WriterContract[]>([]);
  const [selectedWriter, setSelectedWriter] = useState('');
  const [contractStatus, setContractStatus] = useState<WriterContract['status']>('active');
  const [monthlyQuota, setMonthlyQuota] = useState('8');
  const [perArticle, setPerArticle] = useState('5');
  const [monthlyCap, setMonthlyCap] = useState('40');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{tone:'success'|'error';text:string}|null>(null);
  const [selectedArticle, setSelectedArticle] = useState('');
  const [source, setSource] = useState('affiliate');
  const [gross, setGross] = useState('');
  const [share, setShare] = useState('60');
  const [reference, setReference] = useState('');

  usePageMeta({ title: 'إدارة EzyPublish | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const [w,a,r,p] = await Promise.all([
      creatorRepo.adminListWriterApplications(),
      creatorRepo.adminListArticles(),
      creatorRepo.adminListRevenue(),
      creatorRepo.adminListPayouts(),
    ]);
    const c = await creatorRepo.adminListWriterContracts();
    setApplications(w.data); setContracts(c.data); setArticles(a.data); setRevenue(r.data); setPayouts(p.data);
    setMessage(w.error || c.error || a.error || r.error || p.error ? {tone:'error',text:w.error || c.error || a.error || r.error || p.error || 'تعذر التحميل.'} : null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const verified = useMemo(() => revenue.filter((r) => r.status === 'verified').reduce((s,r)=>s+r.grossCents,0), [revenue]);
  const creatorPaid = useMemo(() => revenue.filter((r) => r.status === 'verified').reduce((s,r)=>s+r.creatorCents,0), [revenue]);

  const moderate = async (article: CreatorArticle, status: CreatorArticle['status']) => {
    setSaving(true);
    const result = await creatorRepo.adminModerateArticle(article.id,status,status === 'rejected' ? 'تم إخفاء المحتوى من الإدارة.' : '');
    setSaving(false);
    setMessage(result.error ? {tone:'error',text:result.error} : {tone:'success',text:'تم تحديث حالة المقال.'});
    if (!result.error) await load();
  };

  const addRevenue = async () => {
    const article = articles.find((a)=>a.id===selectedArticle);
    const grossCents = Math.round(Number(gross)*100);
    const shareBps = Math.round(Number(share)*100);
    if (!article || !reference.trim() || !Number.isFinite(grossCents) || grossCents <= 0 || !Number.isFinite(shareBps) || shareBps < 0 || shareBps > 10000) {
      setMessage({tone:'error',text:'أدخل مقالاً ومرجعًا ومبلغاً ونسبة صحيحة.'}); return;
    }
    const creatorCents = Math.floor(grossCents * shareBps / 10000);
    setSaving(true);
    const result = await creatorRepo.adminAddRevenue({
      articleId: article.id, authorId: article.authorId, source, reference,
      grossCents, creatorShareBps: shareBps, creatorCents,
      platformCents: grossCents - creatorCents, currency: 'USD', status: 'verified',
    });
    setSaving(false);
    setMessage(result.error ? {tone:'error',text:result.error} : {tone:'success',text:'تم تسجيل الإيراد وتقسيمه.'});
    if (!result.error) { setGross(''); setReference(''); await load(); }
  };

  const updatePayout = async (payout: CreatorPayout, status: CreatorPayout['status']) => {
    const result = await creatorRepo.adminUpdatePayout(payout.id,status,status === 'paid' ? 'تم الدفع عبر Airtm.' : payout.adminNote);
    setMessage(result.error ? {tone:'error',text:result.error} : {tone:'success',text:'تم تحديث طلب السحب.'});
    if (!result.error) await load();
  };

  const reviewApplication = async (application: WriterApplication, status: WriterApplication['status']) => {
    const result = await creatorRepo.adminReviewWriterApplication(application.id, status, status === 'approved' ? 'تم قبولك في برنامج الكاتب.' : 'لم يتم قبول الطلب حالياً.');
    setMessage(result.error ? {tone:'error',text:result.error} : {tone:'success',text:'تم تحديث طلب الكاتب.'});
    if (!result.error) await load();
  };

  const saveContract = async () => {
    const userId = selectedWriter.trim();
    const quota = Number(monthlyQuota);
    const fee = Math.round(Number(perArticle) * 100);
    const cap = Math.round(Number(monthlyCap) * 100);
    if (!userId || !Number.isInteger(quota) || quota < 1 || fee < 100 || cap < fee) {
      setMessage({tone:'error',text:'أدخل User ID وحصة شهرية وأجراً وسقفاً صحيحاً.'}); return;
    }
    setSaving(true);
    const result = await creatorRepo.adminSetWriterContract({
      userId, status: contractStatus, monthlyQuota: quota, perArticleCents: fee, monthlyCapCents: cap,
    });
    setSaving(false);
    setMessage(result.error ? {tone:'error',text:result.error} : {tone:'success',text:'تم حفظ عقد الكاتب.'});
    if (!result.error) await load();
  };
  return (
    <AdminShell title="إدارة EzyPublish" eyebrow="CREATOR ECONOMY" description="إدارة الكتّاب والمحتوى والإيرادات والسحوبات من مساحة واحدة.">
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        {message && <div className="mb-5"><Notice tone={message.tone==='success'?'success':'error'}>{message.text}</Notice></div>}
        <div className="mb-6 flex flex-wrap gap-2">{([['writers','الكتّاب'],['articles','المقالات'],['revenue','الإيرادات'],['payouts','السحوبات']] as [Tab,string][]).map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={"ez-btn px-4 py-2.5 text-sm " + (tab===id?'ez-btn-primary':'ez-btn-ghost')}>{label}</button>)}</div>
        <div className="mb-6 grid gap-4 sm:grid-cols-3"><Metric label="إيراد موثق" value={money(verified)} /><Metric label="حصة الكتاب" value={money(creatorPaid)} /><Metric label="طلبات السحب" value={String(payouts.length)} /></div>
        {loading ? <div className="ez-panel p-10 text-center"><Spinner/></div> : <>
          {tab==='writers' && <WritersAdmin
            applications={applications}
            contracts={contracts}
            selectedWriter={selectedWriter}
            setSelectedWriter={setSelectedWriter}
            contractStatus={contractStatus}
            setContractStatus={setContractStatus}
            monthlyQuota={monthlyQuota}
            setMonthlyQuota={setMonthlyQuota}
            perArticle={perArticle}
            setPerArticle={setPerArticle}
            monthlyCap={monthlyCap}
            setMonthlyCap={setMonthlyCap}
            saving={saving}
            onReview={reviewApplication}
            onSaveContract={saveContract}
          />}
          {tab==='articles' && <ArticlesAdmin articles={articles} saving={saving} onModerate={moderate} onReload={load}/>} 
          {tab==='revenue' && <RevenueAdmin articles={articles} revenue={revenue} selectedArticle={selectedArticle} setSelectedArticle={setSelectedArticle} source={source} setSource={setSource} gross={gross} setGross={setGross} share={share} setShare={setShare} reference={reference} setReference={setReference} saving={saving} onAdd={addRevenue}/>}
          {tab==='payouts' && <PayoutsAdmin payouts={payouts} onUpdate={updatePayout}/>}
        </>}
      </main>
    </AdminShell>
  );
}

function money(c:number){ return (c/100).toLocaleString('en-US',{style:'currency',currency:'USD'}); }
function Metric({label,value}:{label:string;value:string}){return <div className="ez-panel p-5"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-2 text-2xl font-black text-ink">{value}</p></div>;}

function WritersAdmin({
  applications,
  contracts,
  selectedWriter,
  setSelectedWriter,
  contractStatus,
  setContractStatus,
  monthlyQuota,
  setMonthlyQuota,
  perArticle,
  setPerArticle,
  monthlyCap,
  setMonthlyCap,
  saving,
  onReview,
  onSaveContract,
}: {
  applications: WriterApplication[];
  contracts: WriterContract[];
  selectedWriter: string;
  setSelectedWriter: (value: string) => void;
  contractStatus: WriterContract['status'];
  setContractStatus: (value: WriterContract['status']) => void;
  monthlyQuota: string;
  setMonthlyQuota: (value: string) => void;
  perArticle: string;
  setPerArticle: (value: string) => void;
  monthlyCap: string;
  setMonthlyCap: (value: string) => void;
  saving: boolean;
  onReview: (application: WriterApplication, status: WriterApplication['status']) => void;
  onSaveContract: () => void;
}) {
  const selectContract = (contract: WriterContract) => {
    setSelectedWriter(contract.userId);
    setContractStatus(contract.status);
    setMonthlyQuota(String(contract.monthlyQuota));
    setPerArticle(String(contract.perArticleCents / 100));
    setMonthlyCap(String(contract.monthlyCapCents / 100));
  };

  return <div className="space-y-6">
    <div className="ez-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <div><span className="ez-eyebrow">APPLICATIONS</span><h2 className="mt-1 text-xl font-black text-ink">طلبات الكتّاب</h2></div>
        <Badge tone="caution">{applications.filter((x) => x.status === 'pending').length} قيد المراجعة</Badge>
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="ez-table w-full min-w-[1050px]">
          <thead><tr>{['المستخدم','الدراسة','التخصص','اللغات','الحالة','الإجراء'].map((x) => <th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead>
          <tbody className="divide-y divide-line">
            {applications.map((a) => <tr key={a.id}>
              <td className="px-5 py-4"><code className="text-xs">{a.userId}</code><div className="mt-1 text-[11px] text-muted">{new Date(a.createdAt).toLocaleDateString('ar-DZ')}</div></td>
              <td className="px-5 py-4 text-sm">{a.studyStatus || '—'}</td>
              <td className="px-5 py-4 text-sm">{a.fieldOfStudy || '—'}</td>
              <td className="px-5 py-4 text-sm">{a.languages || '—'}</td>
              <td className="px-5 py-4"><Badge tone={a.status === 'approved' ? 'positive' : a.status === 'rejected' ? 'negative' : 'caution'}>{a.status}</Badge></td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {a.status === 'pending' && <>
                    <Button size="sm" disabled={saving} onClick={() => onReview(a, 'approved')}>قبول</Button>
                    <Button size="sm" variant="ghost" disabled={saving} onClick={() => onReview(a, 'rejected')}>رفض</Button>
                  </>}
                  <Button size="sm" variant="ghost" onClick={() => setSelectedWriter(a.userId)}>اختيار للعقد</Button>
                </div>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {!applications.length && <p className="mt-5 text-sm text-muted">لا توجد طلبات كتاب بعد.</p>}
    </div>

    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <div className="ez-panel p-6">
        <span className="ez-eyebrow">CONTRACT</span>
        <h2 className="mt-1 text-xl font-black text-ink">إنشاء / تعديل عقد كاتب</h2>
        <p className="mt-2 text-sm leading-6 text-muted">الأجر بالدولار للمقال المقبول، مع حصة وسقف شهري واضحين.</p>
        <div className="mt-5 space-y-4">
          <Field label="User ID"><TextInput dir="ltr" value={selectedWriter} onChange={(e) => setSelectedWriter(e.target.value)} placeholder="UUID للمستخدم" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الحالة"><select value={contractStatus} onChange={(e) => setContractStatus(e.target.value as WriterContract['status'])} className="ez-input"><option value="active">active</option><option value="paused">paused</option><option value="suspended">suspended</option><option value="ended">ended</option></select></Field>
            <Field label="الحصة الشهرية"><TextInput type="number" min="1" value={monthlyQuota} onChange={(e) => setMonthlyQuota(e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="أجر المقال بالدولار"><TextInput type="number" min="1" step="0.01" value={perArticle} onChange={(e) => setPerArticle(e.target.value)} /></Field>
            <Field label="السقف الشهري بالدولار"><TextInput type="number" min="1" step="0.01" value={monthlyCap} onChange={(e) => setMonthlyCap(e.target.value)} /></Field>
          </div>
          <Button disabled={saving} onClick={onSaveContract}>{saving ? 'جارٍ الحفظ' : 'حفظ العقد'}</Button>
        </div>
      </div>

      <div className="ez-panel overflow-hidden">
        <div className="border-b border-line p-6"><h2 className="font-black text-ink">العقود الحالية</h2></div>
        <div className="divide-y divide-line">
          {contracts.map((c) => <button key={c.id} onClick={() => selectContract(c)} className="w-full p-5 text-right transition-colors hover:bg-paper-2">
            <div className="flex items-center justify-between gap-3"><code className="text-xs text-ink">{c.userId}</code><Badge tone={c.status === 'active' ? 'positive' : 'caution'}>{c.status}</Badge></div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted"><span>{c.monthlyQuota} مقال/شهر</span><span>{money(c.perArticleCents)} للمقال</span><span>سقف {money(c.monthlyCapCents)}</span></div>
          </button>)}
          {!contracts.length && <p className="p-6 text-sm text-muted">لا توجد عقود بعد.</p>}
        </div>
      </div>
    </div>
  </div>;
}

function ArticlesAdmin({articles,saving,onModerate,onReload}:{articles:CreatorArticle[];saving:boolean;onModerate:(a:CreatorArticle,s:CreatorArticle['status'])=>void;onReload:()=>Promise<void>}) {
  const [editing, setEditing] = useState<CreatorArticle | null>(null);
  const [title,setTitle]=useState(''); const [excerpt,setExcerpt]=useState(''); const [content,setContent]=useState(''); const [busy,setBusy]=useState(false);
  const startEdit=(a:CreatorArticle)=>{setEditing(a);setTitle(a.title);setExcerpt(a.excerpt);setContent(a.content);};
  const saveEdit=async()=>{if(!editing||title.trim().length<8||content.trim().length<120){return;}setBusy(true);const r=await creatorRepo.adminUpdateArticle(editing.id,{title,excerpt,content,contentHtml:contentToHtml(content)});setBusy(false);if(!r.error){setEditing(null);await onReload();}};
  const remove=async(a:CreatorArticle)=>{if(!confirm('حذف المقال «'+a.title+'» نهائياً؟'))return;setBusy(true);const r=await creatorRepo.adminDeleteArticle(a.id);setBusy(false);if(!r.error)await onReload();};
  return <div className="space-y-5">
    {editing && <div className="ez-panel p-6"><div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-ink">تعديل المقال</h2><p className="text-xs text-muted">@{editing.authorUsername}</p></div><Button variant="ghost" onClick={()=>setEditing(null)}>إلغاء</Button></div><div className="mt-5 space-y-4"><Field label="العنوان"><TextInput value={title} onChange={e=>setTitle(e.target.value)}/></Field><Field label="الملخص"><TextInput value={excerpt} onChange={e=>setExcerpt(e.target.value)}/></Field><Field label="المحتوى"><TextArea rows={18} value={content} onChange={e=>setContent(e.target.value)}/></Field><Button disabled={busy} onClick={saveEdit}>{busy?'جارٍ الحفظ':'حفظ التعديل'}</Button></div></div>}
    <div className="ez-panel overflow-hidden"><div className="overflow-x-auto"><table className="ez-table w-full min-w-[1100px]"><thead><tr>{['المقال','الكاتب','الحالة','المشاهدات','الإجراء'].map(x=><th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead><tbody className="divide-y divide-line">
      {articles.map((a)=><tr key={a.id}><td className="px-5 py-4"><p className="font-bold text-ink">{a.title}</p><p className="text-xs text-muted">/{a.slug}</p></td><td className="px-5 py-4 text-sm text-muted">@{a.authorUsername}</td><td className="px-5 py-4"><Badge tone={a.status==='published'?'positive':a.status==='rejected'?'negative':'caution'}>{a.status}</Badge></td><td className="px-5 py-4 text-sm font-bold">{a.views.toLocaleString('en-US')}</td><td className="px-5 py-4"><div className="flex flex-wrap gap-2"><Button size="sm" disabled={saving||busy} onClick={()=>startEdit(a)}>تعديل</Button><Button size="sm" disabled={saving||busy} onClick={()=>onModerate(a,a.status==='published'?'draft':'published')}>{a.status==='published'?'إخفاء':'نشر'}</Button><Link to={"/publish/"+a.slug} className="ez-btn ez-btn-ghost px-4 py-2 text-xs">فتح</Link><Button size="sm" variant="ghost" disabled={saving||busy} onClick={()=>onModerate(a,'rejected')}>رفض</Button><Button size="sm" variant="ghost" disabled={saving||busy} onClick={()=>remove(a)}>حذف</Button></div></td></tr>)}
    </tbody></table></div></div>
  </div>;
}

function RevenueAdmin({articles,revenue,selectedArticle,setSelectedArticle,source,setSource,gross,setGross,share,setShare,reference,setReference,saving,onAdd}:{articles:CreatorArticle[];revenue:CreatorRevenue[];selectedArticle:string;setSelectedArticle:(v:string)=>void;source:string;setSource:(v:string)=>void;gross:string;setGross:(v:string)=>void;share:string;setShare:(v:string)=>void;reference:string;setReference:(v:string)=>void;saving:boolean;onAdd:()=>void}) {
  return <div className="space-y-6"><div className="ez-panel p-6"><h2 className="font-black text-ink">تسجيل إيراد حقيقي</h2><p className="mt-2 text-sm text-muted">استخدمه عندما يكون لديك إيراد Affiliate أو Sponsored أو Tips موثق. لا نحتسب المال من المشاهدات وحدها.</p><div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-5"><Field label="المقال"><select value={selectedArticle} onChange={(e)=>setSelectedArticle(e.target.value)} className="ez-input"><option value="">اختر المقال</option>{articles.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select></Field><Field label="المصدر"><select value={source} onChange={(e)=>setSource(e.target.value)} className="ez-input"><option value="affiliate">Affiliate</option><option value="sponsored">Sponsored</option><option value="tips">Tips</option><option value="product">Product</option><option value="other">Other</option></select></Field><Field label="الإيراد $"><TextInput value={gross} onChange={(e)=>setGross(e.target.value)} type="number" min="0" step="0.01"/></Field><Field label="حصة الكاتب %"><TextInput value={share} onChange={(e)=>setShare(e.target.value)} type="number" min="0" max="100" step="1"/></Field><Field label="مرجع"><TextInput value={reference} onChange={(e)=>setReference(e.target.value)} placeholder="Affiliate ID / invoice"/></Field></div><div className="mt-4 text-left"><Button disabled={saving} onClick={onAdd}>تسجيل الإيراد</Button></div></div>
  <div className="ez-panel overflow-hidden"><table className="ez-table w-full"><thead><tr>{['المصدر','الإجمالي','الكاتب','المنصة','الحالة'].map(x=><th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead><tbody className="divide-y divide-line">{revenue.map(r=><tr key={r.id}><td className="px-5 py-4 text-sm">{r.source}</td><td className="px-5 py-4 font-bold">{money(r.grossCents)}</td><td className="px-5 py-4">{money(r.creatorCents)}</td><td className="px-5 py-4">{money(r.platformCents)}</td><td className="px-5 py-4"><Badge tone={r.status==='verified'?'positive':'caution'}>{r.status}</Badge></td></tr>)}</tbody></table></div></div>;
}

function PayoutsAdmin({payouts,onUpdate}:{payouts:CreatorPayout[];onUpdate:(p:CreatorPayout,s:CreatorPayout['status'])=>void}) {
  return <div className="ez-panel overflow-hidden"><div className="overflow-x-auto"><table className="ez-table w-full min-w-[900px]"><thead><tr>{['المستفيد','Airtm','المبلغ','الحالة','إجراء'].map(x=><th key={x} className="px-5 py-3 text-right text-xs text-muted">{x}</th>)}</tr></thead><tbody className="divide-y divide-line">
    {payouts.map(p=><tr key={p.id}>
      <td className="px-5 py-4 text-xs font-mono">{p.userId}</td>
      <td className="px-5 py-4 text-sm">{p.destination}</td>
      <td className="px-5 py-4 font-black">{money(p.amountCents)}</td>
      <td className="px-5 py-4"><Badge tone={p.status==='paid'?'positive':p.status==='rejected'?'negative':'caution'}>{p.status}</Badge></td>
      <td className="px-5 py-4"><div className="flex flex-wrap gap-2">
        {p.status === 'requested' && <Button size="sm" onClick={()=>onUpdate(p,'approved')}>اعتماد</Button>}
        {p.status === 'approved' && <Button size="sm" onClick={()=>onUpdate(p,'paid')}>تم الدفع</Button>}
        {(p.status === 'requested' || p.status === 'approved') && <Button size="sm" variant="ghost" onClick={()=>onUpdate(p,'rejected')}>رفض</Button>}
      </div></td>
    </tr>)}
  </tbody></table></div></div>;
}

function contentToHtml(value: string) {
  const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const lines = value.split(/\r?\n/);
  const out: string[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length) { out.push('<ul>' + list.map((item) => '<li>' + item + '</li>').join('') + '</ul>'); list = []; }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith('- ')) { list.push(escape(line.slice(2))); continue; }
    flush();
    if (line.startsWith('## ')) out.push('<h2>' + escape(line.slice(3)) + '</h2>');
    else out.push('<p>' + linkify(escape(line)) + '</p>');
  }
  flush();
  return out.join('');
}

function linkify(escaped: string) {
  return escaped.replace(/\[([^\]]+)\]\((\/(?!\/)[^\s)]+)\)/g, '<a href="$2">$1</a>');
}
