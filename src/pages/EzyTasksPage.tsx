import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageAura from '../components/art/PageAura';
import { Badge, Button, Field, SectionHead, TextArea, TextInput } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { useAuth } from '../lib/auth';
import { tasksRepo, type TaskClaim, type TaskOffer, type TaskReward } from '../lib/tasksRepo';
import { usePageMeta } from '../lib/seo';

type Message = { tone: 'success' | 'error'; text: string };

export default function EzyTasksPage() {
  const { session } = useAuth();
  const [offers, setOffers] = useState<TaskOffer[]>([]);
  const [claims, setClaims] = useState<TaskClaim[]>([]);
  const [rewards, setRewards] = useState<TaskReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');
  const [message, setMessage] = useState<Message | null>(null);
  const [proofClaim, setProofClaim] = useState<TaskClaim | null>(null);
  const [proofText, setProofText] = useState('');
  const [externalReference, setExternalReference] = useState('');

  usePageMeta({ title: 'EzyTasks — مهام مدفوعة | ezyjobs', noIndex: true });

  const load = async () => {
    if (!session?.user.id) return;
    setLoading(true);
    const [o, c, r] = await Promise.all([
      tasksRepo.listActiveOffers(),
      tasksRepo.listMyClaims(session.user.id),
      tasksRepo.listMyRewards(session.user.id),
    ]);
    setOffers(o.data);
    setClaims(c.data);
    setRewards(r.data);
    setMessage(o.error || c.error || r.error
      ? { tone: 'error', text: o.error || c.error || r.error || 'تعذر تحميل المهام.' }
      : null);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [session?.user.id]);

  const claimByTask = useMemo(() => new Map(claims.map((claim) => [claim.taskId, claim])), [claims]);
  const pendingRewards = rewards
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.amountCents, 0);
  const availableRewards = rewards
    .filter((r) => r.status === 'available' || (r.status === 'pending' && r.availableAt && new Date(r.availableAt) <= new Date()))
    .reduce((sum, r) => sum + r.amountCents, 0);  const claimTask = async (offer: TaskOffer) => {
    setBusyId(offer.id);
    setMessage(null);
    const result = await tasksRepo.claimTask(offer.id);
    setBusyId('');
    if (result.error) {
      setMessage({ tone: 'error', text: translateTaskError(result.error) });
      return;
    }
    setMessage({ tone: 'success', text: 'تم حجز المهمة لك. نفّذ الشروط ثم أرسل إثبات الإنجاز.' });
    await load();
  };

  const submit = async () => {
    if (!proofClaim || proofText.trim().length < 10) {
      setMessage({ tone: 'error', text: 'أدخل تفاصيل أو رابطًا يثبت تنفيذ المهمة.' });
      return;
    }
    setBusyId(proofClaim.id);
    const result = await tasksRepo.submitTaskClaim(
      proofClaim.id,
      { proof_text: proofText.trim() },
      externalReference.trim(),
    );
    setBusyId('');
    if (result.error) {
      setMessage({ tone: 'error', text: translateTaskError(result.error) });
      return;
    }
    setProofClaim(null);
    setProofText('');
    setExternalReference('');
    setMessage({ tone: 'success', text: 'تم إرسال المهمة للمراجعة. لا تصبح المكافأة متاحة إلا بعد تحقق العملية.' });
    await load();
  };

  return (
    <main className="tasks-shell min-h-screen bg-paper">
      <section className="tasks-hero relative overflow-hidden border-b border-line bg-surface">
        <PageAura />
        <div className="relative mx-auto max-w-[1240px] px-5 py-14 lg:px-10 lg:py-20">
          <p className="eyebrow">EzyTasks</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight text-ink lg:text-5xl">
            مهام مدفوعة مرتبطة بإيراد حقيقي
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-8 text-muted lg:text-base">
            لا ندفع مقابل مهام داخلية بلا قيمة تجارية. كل مهمة هنا مرتبطة بحملة ممولة،
            وبشروط واضحة، ويتم اعتماد المكافأة بعد تحقق النتيجة.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1240px] px-5 py-10 lg:px-10">
        {message && (
          <div className="mb-6">
            <Notice tone={message.tone === 'success' ? 'success' : 'error'}>
              {message.text}
            </Notice>
          </div>
        )}        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Metric title="المهام المتاحة" value={String(offers.length)} />
          <Metric title="قيد الاعتماد" value={"USD " + (pendingRewards / 100).toFixed(2)} />
          <Metric title="متاح للسحب" value={"USD " + (availableRewards / 100).toFixed(2)} />
        </div>
        <div className="mb-8 flex justify-end">
          <Link to="/publish" className="ez-btn ez-btn-ghost px-5 py-2.5 text-sm">
            فتح مركز الأرباح والسحب
          </Link>
        </div>

        <PageSection title="المهام المتاحة" eyebrow="فرص ممولة">
          {loading ? (
            <div className="py-16"><Spinner /></div>
          ) : offers.length === 0 ? (
            <div className="ez-panel p-8 text-center">
              <h2 className="text-lg font-bold text-ink">لا توجد مهام مؤهلة حاليًا</h2>
              <p className="mt-2 text-sm leading-7 text-muted">
                ستظهر المهام هنا فقط عندما يفعّل Ezyjobs حملة ممولة وتكون ميزانيتها وشروطها صالحة للتنفيذ.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-2">
              {offers.map((offer) => {
                const claim = claimByTask.get(offer.id);
                return (
                  <article key={offer.id} className="ez-panel p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Badge tone="brand">{offer.category}</Badge>
                        <h2 className="mt-3 text-xl font-bold text-ink">{offer.title}</h2>
                      </div>
                      <strong className="text-lg text-brand">USD {(offer.rewardCents / 100).toFixed(2)}</strong>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-muted">{offer.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
                      <span className="rounded-full border border-line px-3 py-1.5">{offer.estimatedMinutes} دقيقة تقريبًا</span>
                      <span className="rounded-full border border-line px-3 py-1.5">اعتماد بعد التحقق</span>
                      <span className="rounded-full border border-line px-3 py-1.5">{offer.claimsCount}/{offer.maxClaims} حجز</span>
                    </div>
                    {offer.steps && (
                      <div className="mt-5 whitespace-pre-line rounded-xl border border-line bg-paper-2 p-4 text-sm leading-7 text-ink">
                        {offer.steps}
                      </div>
                    )}
                    <div className="mt-6">
                      {!claim ? (
                        <Button onClick={() => void claimTask(offer)} disabled={busyId === offer.id}>
                          {busyId === offer.id ? 'جارٍ الحجز…' : 'ابدأ المهمة'}
                        </Button>
                      ) : claim.status === 'claimed' ? (
                        <Button variant="ghost" onClick={() => { setProofClaim(claim); setProofText(''); }}>
                          أرسلت المهمة؟ أضف الإثبات
                        </Button>
                      ) : (
                        <span className="inline-flex rounded-full border border-line px-4 py-2 text-xs font-bold text-muted">
                          الحالة: {claimStatusLabel(claim.status)}
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </PageSection>        <PageSection title="سجل مهامي" eyebrow="متابعة">
          <div className="space-y-3">
            {claims.length === 0 ? (
              <p className="text-sm text-muted">لم تحجز أي مهمة بعد.</p>
            ) : claims.slice(0, 12).map((claim) => (
              <div key={claim.id} className="ez-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-ink">مهمة {claim.id.slice(0, 8)}</p>
                  <p className="mt-1 text-xs text-muted">{claimStatusLabel(claim.status)}</p>
                </div>
                <strong className="text-sm text-brand">USD {(claim.studentRewardCents / 100).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </PageSection>
      </div>

      {proofClaim && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 px-5">
          <div className="w-full max-w-xl rounded-2xl border border-line bg-surface p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-ink">إرسال إثبات المهمة</h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              {offers.find((o) => o.id === proofClaim.taskId)?.proofInstructions || 'أرسل رابطًا أو وصفًا واضحًا يتيح للمراجعة التحقق من النتيجة.'}
            </p>
            <div className="mt-5 space-y-4">
              <Field label="الإثبات" hint="يمكن أن يكون رابطًا أو وصفًا مختصرًا.">
                <TextArea value={proofText} onChange={(e) => setProofText(e.target.value)} rows={5} />
              </Field>
              <Field label="مرجع خارجي" hint="اختياري: رقم العملية أو معرف التحويل لدى الشريك.">
                <TextInput value={externalReference} onChange={(e) => setExternalReference(e.target.value)} />
              </Field>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setProofClaim(null)}>إلغاء</Button>
              <Button onClick={() => void submit()} disabled={busyId === proofClaim.id}>
                {busyId === proofClaim.id ? 'جارٍ الإرسال…' : 'إرسال للمراجعة'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function PageSection({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="py-12 lg:py-16">
      <SectionHead eyebrow={eyebrow} title={title} />
      {children}
    </section>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="ez-panel p-5">
      <div className="text-xs font-semibold text-muted">{title}</div>
      <div className="mt-2 text-2xl font-black text-ink">{value}</div>
    </div>
  );
}function claimStatusLabel(status: TaskClaim['status']) {
  const labels: Record<TaskClaim['status'], string> = {
    claimed: 'محجوزة',
    submitted: 'أُرسلت للمراجعة',
    pending_validation: 'قيد التحقق',
    approved: 'تم الاعتماد',
    rejected: 'مرفوضة',
    reversed: 'تم عكسها',
    paid: 'تم الدفع',
  };
  return labels[status];
}

function translateTaskError(error: string) {
  const map: Record<string, string> = {
    already_claimed: 'سبق أن حجزت هذه المهمة.',
    task_exhausted: 'اكتملت حصة هذه المهمة.',
    campaign_budget_exhausted: 'لم تعد ميزانية الحملة تسمح بحجوزات جديدة.',
    incentive_not_allowed: 'شروط البرنامج لا تسمح بمكافأة تحفيزية لهذه العملية.',
    task_reward_not_funded: 'المهمة غير ممولة بالمبلغ المطلوب.',
    not_authenticated: 'سجّل الدخول أولًا.',
  };
  return map[error] || error;
}
