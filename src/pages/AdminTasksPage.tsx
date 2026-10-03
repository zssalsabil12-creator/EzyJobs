import { type ReactNode, useEffect, useState } from 'react';
import { AdminShell, Badge, Button, Field, SectionHead, Select, TextArea, TextInput, Toggle } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { tasksRepo, type TaskCampaign, type TaskClaim, type TaskOffer } from '../lib/tasksRepo';
import { usePageMeta } from '../lib/seo';

type Tab = 'campaigns' | 'offers' | 'claims';

const money = (cents: number) => (cents / 100).toFixed(2);

export default function AdminTasksPage() {
  const [tab, setTab] = useState<Tab>('campaigns');
  const [campaigns, setCampaigns] = useState<TaskCampaign[]>([]);
  const [offers, setOffers] = useState<TaskOffer[]>([]);
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [campaign, setCampaign] = useState({
    title: '', partnerName: '', partnerUrl: '', programType: 'affiliate' as TaskCampaign['programType'],
    incentiveAllowed: false, partnerPayout: '0', studentReward: '0', maxBudget: '0', fundedBudget: '0',
    holdDays: '7', termsUrl: '', status: 'draft' as TaskCampaign['status'],
  });
  const [offer, setOffer] = useState({
    campaignId: '', title: '', description: '', category: 'performance', steps: '',
    estimatedMinutes: '10', reward: '0', maxClaims: '100', proofInstructions: '',
    status: 'draft' as TaskOffer['status'],
  });
  const [review, setReview] = useState({ claimId: '', revenue: '', revenueReference: '', note: '' });

  usePageMeta({ title: 'إدارة EzyTasks | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const [c, o, r] = await Promise.all([
      tasksRepo.adminListCampaigns(),
      tasksRepo.adminListOffers(),
      tasksRepo.adminListClaims(),
    ]);
    setCampaigns(c.data);
    setOffers(o.data);
    setClaims(r.data);
    setMessage(c.error || o.error || r.error ? { tone: 'error', text: c.error || o.error || r.error || 'تعذر التحميل.' } : null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const saveCampaign = async () => {
    const partnerPayoutCents = Math.round(Number(campaign.partnerPayout) * 100);
    const studentRewardCents = Math.round(Number(campaign.studentReward) * 100);
    const maxBudgetCents = Math.round(Number(campaign.maxBudget) * 100);
    const fundedBudgetCents = Math.round(Number(campaign.fundedBudget) * 100);
    if (!campaign.title.trim() || partnerPayoutCents < studentRewardCents || maxBudgetCents <= 0 || fundedBudgetCents < 0 || fundedBudgetCents > maxBudgetCents) {
      setMessage({ tone: 'error', text: 'أدخل اسم الحملة، تمويل الشريك، وميزانية موجبة.' });
      return;
    }
    if (campaign.programType === 'affiliate' && studentRewardCents > 0 && !campaign.incentiveAllowed) {
      setMessage({ tone: 'error', text: 'لا يجوز تفعيل مكافأة Affiliate قبل التأكد من السماح بالحوافز.' });
      return;
    }
    setSaving(true);
    const result = await tasksRepo.adminSaveCampaign({
      title: campaign.title.trim(),
      partnerName: campaign.partnerName.trim(),
      partnerUrl: campaign.partnerUrl.trim(),
      programType: campaign.programType,
      incentiveAllowed: campaign.incentiveAllowed,
      currency: 'USD',
      partnerPayoutCents,
      studentRewardCents,
      maxBudgetCents,
      fundedBudgetCents,
      holdDays: Math.max(0, Number(campaign.holdDays) || 0),
      validationMode: 'manual',
      termsUrl: campaign.termsUrl.trim(),
      status: campaign.status,
    });
    setSaving(false);
    setMessage(result.error ? { tone: 'error', text: result.error } : { tone: 'success', text: 'تم إنشاء الحملة.' });
    if (!result.error) {
      setCampaign({ ...campaign, title: '', partnerName: '', partnerUrl: '', partnerPayout: '0', studentReward: '0', maxBudget: '0', fundedBudget: '0' });
      await load();
    }
  };  const saveOffer = async () => {
    const rewardCents = Math.round(Number(offer.reward) * 100);
    const maxClaims = Math.round(Number(offer.maxClaims));
    const estimatedMinutes = Math.round(Number(offer.estimatedMinutes));
    const parent = campaigns.find((item) => item.id === offer.campaignId);
    if (!offer.campaignId || !offer.title.trim() || rewardCents <= 0 || maxClaims <= 0 || estimatedMinutes <= 0) {
      setMessage({ tone: 'error', text: 'أكمل بيانات المهمة الأساسية.' });
      return;
    }
    if (!parent || rewardCents > parent.studentRewardCents) {
      setMessage({ tone: 'error', text: 'مكافأة المهمة تتجاوز التمويل المسموح للحملة.' });
      return;
    }
    setSaving(true);
    const result = await tasksRepo.adminSaveOffer({
      campaignId: offer.campaignId,
      title: offer.title.trim(),
      description: offer.description.trim(),
      category: offer.category.trim(),
      steps: offer.steps.trim(),
      estimatedMinutes,
      proofRequired: true,
      proofInstructions: offer.proofInstructions.trim(),
      rewardCents,
      maxClaims,
      status: offer.status,
    });
    setSaving(false);
    setMessage(result.error ? { tone: 'error', text: result.error } : { tone: 'success', text: 'تم إنشاء المهمة.' });
    if (!result.error) {
      setOffer({ ...offer, title: '', description: '', steps: '', reward: '0', proofInstructions: '' });
      await load();
    }
  };

  const reviewClaim = async (status: 'approved' | 'rejected' | 'reversed') => {
    if (!review.claimId) return;
    const revenueCents = Math.max(0, Math.round(Number(review.revenue) * 100));
    const revenueReference = review.revenueReference.trim();
    if (status === 'approved' && revenueReference.length < 3) {
      setMessage({ tone: 'error', text: 'يجب إدخال مرجع إيراد الشريك قبل الاعتماد.' });
      return;
    }
    setSaving(true);
    const result = await tasksRepo.adminReviewClaim(review.claimId, status, revenueCents, revenueReference, review.note.trim());
    setSaving(false);
    setMessage(result.error ? { tone: 'error', text: result.error } : { tone: 'success', text: 'تم تحديث نتيجة المهمة.' });
    if (!result.error) {
      setReview({ claimId: '', revenue: '', revenueReference: '', note: '' });
      await load();
    }
  };

  return (
    <AdminShell title="إدارة EzyTasks" eyebrow="TASK ECONOMY" description="الحملات الممولة، المهام، وتنفيذات المستخدمين في مساحة تشغيل موحدة.">
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        {message && <div className="mb-5"><Notice tone={message.tone === 'success' ? 'success' : 'error'}>{message.text}</Notice></div>}
        <div className="mb-6 flex flex-wrap gap-2">
          {([['campaigns', 'الحملات'], ['offers', 'المهام'], ['claims', 'التنفيذات']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={tab === id ? 'ez-btn ez-btn-primary px-4 py-2.5 text-sm' : 'ez-btn ez-btn-ghost px-4 py-2.5 text-sm'}>
              {label}
            </button>
          ))}
        </div>
        {loading ? <div className="ez-panel p-14 text-center"><Spinner /></div> : (
          <>
            {tab === 'campaigns' && <CampaignPanel campaigns={campaigns} state={campaign} setState={setCampaign} onSave={saveCampaign} saving={saving} />}
            {tab === 'offers' && <OfferPanel campaigns={campaigns} offers={offers} state={offer} setState={setOffer} onSave={saveOffer} saving={saving} />}
            {tab === 'claims' && <ClaimsPanel claims={claims} state={review} setState={setReview} onReview={reviewClaim} />}
          </>
        )}
      </main>
    </AdminShell>
  );
}

function CampaignPanel({ campaigns, state, setState, onSave, saving }: {
  campaigns: TaskCampaign[];
  state: {
    title: string; partnerName: string; partnerUrl: string; programType: TaskCampaign['programType'];
    incentiveAllowed: boolean; partnerPayout: string; studentReward: string; maxBudget: string; fundedBudget: string;
    holdDays: string; termsUrl: string; status: TaskCampaign['status'];
  };
  setState: (next: typeof state) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <PageSection title="حملة جديدة" eyebrow="مصدر التمويل">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم الحملة"><TextInput value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} /></Field>
          <Field label="الشريك"><TextInput value={state.partnerName} onChange={(e) => setState({ ...state, partnerName: e.target.value })} /></Field>
          <Field label="رابط البرنامج"><TextInput value={state.partnerUrl} onChange={(e) => setState({ ...state, partnerUrl: e.target.value })} /></Field>
          <Field label="النوع"><Select value={state.programType} onChange={(e) => setState({ ...state, programType: e.target.value as TaskCampaign['programType'] })} options={[{ value: 'affiliate', label: 'Affiliate' }, { value: 'sponsored', label: 'Sponsored' }, { value: 'partner', label: 'Partner' }]} /></Field>
          <Field label="تمويل الشريك لكل عملية"><TextInput type="number" value={state.partnerPayout} onChange={(e) => setState({ ...state, partnerPayout: e.target.value })} /></Field>
          <Field label="مكافأة المستخدم لكل عملية"><TextInput type="number" value={state.studentReward} onChange={(e) => setState({ ...state, studentReward: e.target.value })} /></Field>
          <Field label="الميزانية القصوى"><TextInput type="number" value={state.maxBudget} onChange={(e) => setState({ ...state, maxBudget: e.target.value })} /></Field>
          <Field label="الميزانية الممولة فعليًا"><TextInput type="number" value={state.fundedBudget} onChange={(e) => setState({ ...state, fundedBudget: e.target.value })} /></Field>
          <Field label="مدة الحجز بعد الاعتماد"><TextInput type="number" value={state.holdDays} onChange={(e) => setState({ ...state, holdDays: e.target.value })} /></Field>
          <Field label="رابط الشروط"><TextInput value={state.termsUrl} onChange={(e) => setState({ ...state, termsUrl: e.target.value })} /></Field>
          <Field label="الحالة"><Select value={state.status} onChange={(e) => setState({ ...state, status: e.target.value as TaskCampaign['status'] })} options={[{ value: 'draft', label: 'مسودة' }, { value: 'active', label: 'نشطة' }, { value: 'paused', label: 'متوقفة' }]} /></Field>
        </div>
        <div className="mt-5">
          <Toggle checked={state.incentiveAllowed} onChange={(value) => setState({ ...state, incentiveAllowed: value })} label="الحوافز مسموحة" hint="فعّلها فقط بعد مراجعة شروط الشريك." />
        </div>
        <Button className="mt-6" onClick={onSave} disabled={saving}>حفظ الحملة</Button>
      </PageSection>

      <PageSection title="الحملات الحالية" eyebrow="الرقابة المالية">
        <div className="space-y-3">
          {campaigns.length === 0 ? <p className="text-sm text-muted">لا توجد حملات.</p> : campaigns.map((item) => (
            <div key={item.id} className="ez-panel p-4">
              <div className="flex items-center justify-between gap-4">
                <div><p className="font-bold text-ink">{item.title}</p><p className="mt-1 text-xs text-muted">{item.partnerName || 'بدون شريك'}</p></div>
                <Badge tone={item.status === 'active' ? 'positive' : 'caution'}>{item.status}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted">
                <span>المستخدم: USD {money(item.studentRewardCents)}</span>
                <span>الشريك: USD {money(item.partnerPayoutCents)}</span>
                <span>ممول: USD {money(item.fundedBudgetCents)}</span>
                <span>محجوز: USD {money(item.committedBudgetCents)}</span>
              </div>
            </div>
          ))}
        </div>
      </PageSection>
    </div>
  );
}function OfferPanel({ campaigns, offers, state, setState, onSave, saving }: {
  campaigns: TaskCampaign[];
  offers: TaskOffer[];
  state: {
    campaignId: string; title: string; description: string; category: string; steps: string;
    estimatedMinutes: string; reward: string; maxClaims: string; proofInstructions: string; status: TaskOffer['status'];
  };
  setState: (next: typeof state) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <PageSection title="مهمة جديدة" eyebrow="عرض ممول">
        <div className="space-y-4">
          <Field label="الحملة"><Select value={state.campaignId} onChange={(e) => setState({ ...state, campaignId: e.target.value })} options={[{ value: '', label: 'اختر حملة' }, ...campaigns.map((c) => ({ value: c.id, label: c.title }))]} /></Field>
          <Field label="العنوان"><TextInput value={state.title} onChange={(e) => setState({ ...state, title: e.target.value })} /></Field>
          <Field label="الوصف"><TextArea value={state.description} onChange={(e) => setState({ ...state, description: e.target.value })} rows={4} /></Field>
          <Field label="خطوات التنفيذ"><TextArea value={state.steps} onChange={(e) => setState({ ...state, steps: e.target.value })} rows={5} /></Field>
          <Field label="تعليمات الإثبات"><TextArea value={state.proofInstructions} onChange={(e) => setState({ ...state, proofInstructions: e.target.value })} rows={3} /></Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="الفئة"><TextInput value={state.category} onChange={(e) => setState({ ...state, category: e.target.value })} /></Field>
            <Field label="الدقائق"><TextInput type="number" value={state.estimatedMinutes} onChange={(e) => setState({ ...state, estimatedMinutes: e.target.value })} /></Field>
            <Field label="المكافأة USD"><TextInput type="number" value={state.reward} onChange={(e) => setState({ ...state, reward: e.target.value })} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="أقصى حجوزات"><TextInput type="number" value={state.maxClaims} onChange={(e) => setState({ ...state, maxClaims: e.target.value })} /></Field>
            <Field label="الحالة"><Select value={state.status} onChange={(e) => setState({ ...state, status: e.target.value as TaskOffer['status'] })} options={[{ value: 'draft', label: 'مسودة' }, { value: 'active', label: 'نشطة' }, { value: 'paused', label: 'متوقفة' }]} /></Field>
          </div>
          <Button onClick={onSave} disabled={saving}>حفظ المهمة</Button>
        </div>
      </PageSection>

      <PageSection title="المهام الحالية" eyebrow="المراقبة">
        <div className="space-y-3">
          {offers.length === 0 ? <p className="text-sm text-muted">لا توجد مهام.</p> : offers.map((item) => (
            <div key={item.id} className="ez-panel p-4">
              <div className="flex justify-between gap-4">
                <p className="font-bold text-ink">{item.title}</p>
                <Badge tone={item.status === 'active' ? 'positive' : 'caution'}>{item.status}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted">{item.claimsCount}/{item.maxClaims} — USD {money(item.rewardCents)} لكل تنفيذ</p>
            </div>
          ))}
        </div>
      </PageSection>
    </div>
  );
}function ClaimsPanel({ claims, state, setState, onReview }: {
  claims: TaskClaim[];
  state: { claimId: string; revenue: string; revenueReference: string; note: string };
  setState: (next: typeof state) => void;
  onReview: (status: 'approved' | 'rejected' | 'reversed') => void;
}) {
  return (
    <PageSection title="تنفيذات المستخدمين" eyebrow="التحقق من الإيراد">
      <div className="space-y-4">
        {claims.length === 0 ? <p className="text-sm text-muted">لا توجد تنفيذات حتى الآن.</p> : claims.map((claim) => (
          <div key={claim.id} className="ez-panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-ink">Claim {claim.id.slice(0, 8)}</p>
                <p className="mt-1 text-xs text-muted">{claim.status} — المستخدم {claim.userId.slice(0, 8)}</p>
              </div>
              <strong className="text-brand">USD {money(claim.studentRewardCents)}</strong>
            </div>
            <pre className="mt-4 max-h-48 overflow-auto rounded-xl bg-white/5 p-4 text-xs leading-6 text-muted">{JSON.stringify(claim.proofPayload, null, 2)}</pre>
            <div className="mt-3 rounded-xl border border-line bg-white/[0.03] p-3 text-xs text-muted">
              مرجع المستخدم: {claim.externalReference || 'غير مُرسل'}
              {claim.partnerRevenueReference && <> — مرجع إيراد الشريك السابق: {claim.partnerRevenueReference}</>}
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_1.2fr_auto]">
              <TextInput type="number" placeholder="إيراد الشريك USD" value={state.claimId === claim.id ? state.revenue : ''} onChange={(e) => setState({ ...state, claimId: claim.id, revenue: e.target.value })} />
              <TextInput placeholder="مرجع إيراد الشريك" value={state.claimId === claim.id ? state.revenueReference : ''} onChange={(e) => setState({ ...state, claimId: claim.id, revenueReference: e.target.value })} />
              <TextInput placeholder="ملاحظة الإدارة" value={state.claimId === claim.id ? state.note : ''} onChange={(e) => setState({ ...state, claimId: claim.id, note: e.target.value })} />
              <div className="flex gap-2">
                <Button onClick={() => onReview('approved')}>اعتماد</Button>
                <Button variant="ghost" onClick={() => onReview('rejected')}>رفض</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageSection>
  );
}

function PageSection({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="py-8 lg:py-12">
      <SectionHead eyebrow={eyebrow} title={title} />
      {children}
    </section>
  );
}
