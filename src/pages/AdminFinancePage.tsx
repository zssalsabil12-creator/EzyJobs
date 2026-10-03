import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell, Badge, Button } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { financeRepo, type FinanceAllocation, type FinanceSnapshot } from '../lib/financeRepo';
import { usePageMeta } from '../lib/seo';

const money = (cents: number) => (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function AdminFinancePage() {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot | null>(null);
  const [allocations, setAllocations] = useState<FinanceAllocation[]>([]);
  const [allocationType, setAllocationType] = useState<FinanceAllocation['allocationType']>('writer_reserve');
  const [allocationAmount, setAllocationAmount] = useState('');
  const [allocationNote, setAllocationNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  usePageMeta({ title: 'المركز المالي | ezyjobs', noIndex: true });

  const load = async (initial = false) => {
    initial ? setLoading(true) : setRefreshing(true);
    const [result, allocationsResult] = await Promise.all([
      financeRepo.getSnapshot(),
      financeRepo.listAllocations(),
    ]);
    setSnapshot(result.data);
    setAllocations(allocationsResult.data);
    setError(result.error ?? allocationsResult.error ?? '');
    initial ? setLoading(false) : setRefreshing(false);
  };

  useEffect(() => { void load(true); }, []);

  const payoutCommitted = useMemo(() => snapshot
    ? snapshot.payouts.requestedCents + snapshot.payouts.approvedCents
    : 0, [snapshot]);

  const allocationTypeLabel = (type: FinanceAllocation['allocationType']) => ({
    writer_reserve: 'Writer Reserve',
    task_reserve: 'Task Reserve',
    operating_reserve: 'Operating Reserve',
  }[type]);

  const createAllocation = async () => {
    const cents = Math.round(Number(allocationAmount) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError('أدخل مبلغ تخصيص صحيح.');
      return;
    }
    setSaving(true);
    const result = await financeRepo.createAllocation(allocationType, cents, allocationNote);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? 'تعذر إنشاء التخصيص.');
      return;
    }
    setAllocationAmount('');
    setAllocationNote('');
    setError('');
    await load(false);
  };

  const releaseAllocation = async (allocation: FinanceAllocation) => {
    if (!window.confirm('تحرير هذا التخصيص وإعادة المبلغ إلى الإيراد غير المخصص؟')) return;
    setSaving(true);
    const result = await financeRepo.releaseAllocation(allocation.id);
    setSaving(false);
    if (!result.ok) {
      setError(result.error ?? 'تعذر تحرير التخصيص.');
      return;
    }
    setError('');
    await load(false);
  };

  return (
    <AdminShell title="المركز المالي" eyebrow="FINANCIAL CONTROL" description="الإيرادات الموثقة، الالتزامات، الاحتياطيات، السحوبات والمصالحة المالية.">
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        <div className="mb-6 flex justify-end">
          <Button variant="ghost" disabled={refreshing} onClick={() => void load(false)}>
            {refreshing ? 'جارٍ التحديث' : 'تحديث البيانات'}
          </Button>
        </div>
        {error && <div className="mb-6"><Notice tone="error">{error}</Notice></div>}
        {loading ? (
          <div className="ez-panel p-14 text-center"><Spinner /></div>
        ) : snapshot ? (
          <div className="space-y-8">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><span className="ez-eyebrow">REVENUE</span><h2 className="mt-1 text-xl font-black text-ink">الإيرادات والتحقق</h2></div>
                <Badge tone="positive">Revenue First</Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="إيراد موثق" value={money(snapshot.revenue.totalVerifiedCents)} />
                <Metric label="إيراد معلق" value={money(snapshot.revenue.totalPendingCents)} />
                <Metric label="هامش المنصة الموثق" value={money(snapshot.revenue.platformCents + snapshot.claims.approvedMarginCents)} />
                <Metric label="إيراد Tasks الموثق" value={money(snapshot.claims.approvedRevenueCents)} />
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div><span className="ez-eyebrow">RECONCILIATION</span><h2 className="mt-1 text-xl font-black text-ink">المصالحة المالية</h2></div>
                <Badge tone={snapshot.reconciliation.healthy ? 'positive' : 'negative'}>
                  {snapshot.reconciliation.healthy ? 'لا توجد تناقضات مكتشفة' : snapshot.reconciliation.issueCount + ' حالة تحتاج مراجعة'}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="مشكلات إجمالية" value={String(snapshot.reconciliation.issueCount)} />
                <Metric label="مشكلات إيرادات EzyPublish" value={String(snapshot.reconciliation.creatorRevenueIssues)} />
                <Metric label="مشكلات EzyTasks" value={String(snapshot.reconciliation.taskClaimIssues + snapshot.reconciliation.taskRewardIssues)} />
                <Metric label="مستخدمون برصيد سحب غير مغطى" value={String(snapshot.reconciliation.payoutOverdrawnUsers)} />
              </div>
              {!snapshot.reconciliation.healthy && (
                <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-5 text-sm leading-7 text-ink">
                  <p className="font-black">الحماية الجديدة تمنع الحالات المستقبلية، لكن هذه المصالحة تكشف أي بيانات قديمة تحتاج مراجعة يدوية.</p>
                  <p className="mt-2 text-muted">
                    نقص Writer Reserve: {money(snapshot.reconciliation.writerReserveDeficitCents)} · نقص Task Reserve: {money(snapshot.reconciliation.taskReserveDeficitCents)} · تجاوز التخصيص: {money(snapshot.reconciliation.activeAllocationOverageCents)} · تنفيذات Tasks بلا إثبات كافٍ: {snapshot.reconciliation.missingTaskEvidence}
                  </p>
                </div>
              )}
            </section>

            <section>
              <div className="mb-4"><span className="ez-eyebrow">BUDGETS</span><h2 className="mt-1 text-xl font-black text-ink">الالتزامات والميزانيات</h2></div>
              <div className="grid gap-5 lg:grid-cols-2">
                <BudgetCard
                  title="Writer Budget"
                  subtitle="السقف الشهري للعقود النشطة"
                  value={money(snapshot.writer.committedMonthlyCents)}
                  meta={snapshot.writer.activeContracts + ' عقد نشط'}
                  tone="brand"
                />
                <BudgetCard
                  title="Task Budget"
                  subtitle="الميزانية الممولة للحملات النشطة"
                  value={money(snapshot.tasks.budgetCents)}
                  meta={snapshot.tasks.activeCampaigns + ' حملة نشطة · ' + money(snapshot.tasks.committedCents) + ' ملتزم بها'}
                  tone="positive"
                  footer={'المتاح للحجوزات الجديدة: ' + money(snapshot.tasks.availableBudgetCents)}
                />
              </div>
            </section>            <section>
              <div className="mb-4"><span className="ez-eyebrow">RESERVE COVERAGE</span><h2 className="mt-1 text-xl font-black text-ink">تغطية الالتزامات</h2></div>
              <div className="grid gap-5 lg:grid-cols-2">
                <CoverageCard
                  title="Writer Reserve"
                  commitment={snapshot.reserves.writerCommitmentCents}
                  reserve={snapshot.reserves.writerCents}
                  available={snapshot.reserves.writerCoverageCents}
                  deficit={snapshot.reserves.writerDeficitCents}
                />
                <CoverageCard
                  title="Task Reserve"
                  commitment={snapshot.reserves.taskFundedCents}
                  reserve={snapshot.reserves.taskCents}
                  available={snapshot.reserves.taskCoverageCents}
                  deficit={snapshot.reserves.taskDeficitCents}
                />
              </div>
              <p className="mt-4 text-xs leading-6 text-muted">
                التغطية محسوبة بعد خصم الالتزامات الحالية من الاحتياطي الفعلي. قواعد قاعدة البيانات تمنع إنشاء التزام جديد يتجاوز الاحتياطي.
              </p>
            </section>

            <section>
              <div className="mb-4"><span className="ez-eyebrow">USER LIABILITIES</span><h2 className="mt-1 text-xl font-black text-ink">التزامات المستخدمين</h2></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Tasks قيد الاعتماد" value={money(snapshot.rewards.pendingCents)} />
                <Metric label="Tasks متاحة" value={money(snapshot.rewards.availableCents)} />
                <Metric label="طلبات سحب معلقة" value={money(payoutCommitted)} />
                <Metric label="مدفوعات منفذة" value={money(snapshot.payouts.paidCents)} />
              </div>
            </section>

            <section>
              <div className="mb-4"><span className="ez-eyebrow">RESERVES</span><h2 className="mt-1 text-xl font-black text-ink">تخصيص الإيراد الموثق</h2></div>
              <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
                <div className="ez-panel p-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Mini label="الإيراد الموثق المتاح للتخصيص" value={money(snapshot.reserves.unallocatedPlatformCents)} />
                    <Mini label="Writer Reserve" value={money(snapshot.reserves.writerCents)} />
                    <Mini label="Task Reserve" value={money(snapshot.reserves.taskCents)} />
                  </div>
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <Mini label="Operating Reserve" value={money(snapshot.reserves.operatingCents)} />
                    <Mini label="إجمالي التخصيصات النشطة" value={money(snapshot.reserves.activeAllocatedCents)} />
                  </div>
                  <p className="mt-5 text-xs leading-6 text-muted">
                    لا يمكن إنشاء تخصيص يتجاوز الإيراد الموثق غير المخصص. تحرير التخصيص يعيد المبلغ إلى الرصيد القابل للتخصيص ولا يغيّر سجلات الإيراد الأصلية.
                  </p>
                </div>
                <div className="ez-panel p-6">
                  <span className="ez-eyebrow">NEW ALLOCATION</span>
                  <h3 className="mt-1 text-xl font-black text-ink">تخصيص جديد</h3>
                  <div className="mt-5 space-y-4">
                    <label className="block text-sm font-bold text-ink">الغرض
                      <select value={allocationType} onChange={(e) => setAllocationType(e.target.value as FinanceAllocation['allocationType'])} className="ez-input mt-2 w-full">
                        <option value="writer_reserve">Writer Reserve</option>
                        <option value="task_reserve">Task Reserve</option>
                        <option value="operating_reserve">Operating Reserve</option>
                      </select>
                    </label>
                    <label className="block text-sm font-bold text-ink">المبلغ بالدولار
                      <input type="number" min="0.01" step="0.01" value={allocationAmount} onChange={(e) => setAllocationAmount(e.target.value)} className="ez-input mt-2 w-full" placeholder="مثال: 100" />
                    </label>
                    <label className="block text-sm font-bold text-ink">ملاحظة
                      <textarea value={allocationNote} onChange={(e) => setAllocationNote(e.target.value)} rows={3} className="ez-input mt-2 w-full resize-y" placeholder="سبب التخصيص أو الفترة المستهدفة" />
                    </label>
                    <Button disabled={saving} onClick={createAllocation}>{saving ? 'جارٍ الحفظ' : 'حجز التخصيص'}</Button>
                  </div>
                </div>
              </div>
            </section>

            <section className="ez-panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line p-6">
                <div><span className="ez-eyebrow">ALLOCATION LEDGER</span><h2 className="mt-1 text-xl font-black text-ink">سجل التخصيصات</h2></div>
                <Badge tone="neutral">{allocations.filter((a) => a.status === 'active').length} نشطة</Badge>
              </div>
              {allocations.length ? (
                <div className="divide-y divide-line">
                  {allocations.map((allocation) => (
                    <div key={allocation.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={allocation.status === 'active' ? 'positive' : 'neutral'}>{allocationTypeLabel(allocation.allocationType)}</Badge>
                          <span className="text-xs text-muted">{new Date(allocation.createdAt).toLocaleString('ar-DZ')}</span>
                        </div>
                        <p className="mt-2 text-lg font-black text-ink">{money(allocation.amountCents)}</p>
                        <p className="mt-1 text-sm text-muted">{allocation.note || 'بدون ملاحظة'}</p>
                      </div>
                      {allocation.status === 'active' && (
                        <Button size="sm" variant="ghost" disabled={saving} onClick={() => void releaseAllocation(allocation)}>تحرير التخصيص</Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-sm text-muted">لا توجد تخصيصات مالية بعد.</div>
              )}
            </section>

            <section className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
              <div className="ez-panel p-6">
                <span className="ez-eyebrow">TASK CONTROL</span>
                <h2 className="mt-1 text-xl font-black text-ink">رقابة EzyTasks</h2>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <Mini label="إيراد الشركاء المعتمد" value={money(snapshot.claims.approvedRevenueCents)} />
                  <Mini label="هامش المنصة من Tasks" value={money(snapshot.claims.approvedMarginCents)} />
                  <Mini label="مكافآت متاحة للمستخدمين" value={money(snapshot.rewards.availableCents)} />
                  <Mini label="عمليات معكوسة" value={String(snapshot.claims.reversedCount)} />
                </div>
                {snapshot.claims.missingEvidenceCount > 0 && (
                  <div className="mt-5 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-7 text-ink">
                    توجد {snapshot.claims.missingEvidenceCount} عملية approved قديمة بلا مرجع إيراد شريك صالح. هذه العمليات لا تُحتسب ضمن الإيراد الموثق القابل للتخصيص حتى استكمال التحقق.
                  </div>
                )}
                <p className="mt-5 text-xs leading-6 text-muted">
                  الإيراد هنا يُحتسب فقط من العمليات المعتمدة التي تحمل مرجع إيراد شريك صالحًا وقيمة إيراد تغطي المكافأة. العمليات المعلقة أو غير المكتملة الإثبات لا تُعامل كأموال متاحة.
                </p>
              </div>
              <div className="ez-panel p-6">
                <span className="ez-eyebrow">OPERATING RESERVE</span>
                <h2 className="mt-1 text-xl font-black text-ink">احتياطي التشغيل</h2>
                <div className="mt-6 rounded-2xl border border-line bg-paper-2 p-5">
                  <p className="text-3xl font-black text-ink">{money(snapshot.reserves.operatingCents)}</p>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    هذا المبلغ يمثل تخصيص التشغيل النشط من الإيراد الموثق. لا يُعامل كإيراد جديد.
                  </p>
                </div>
              </div>
            </section>            <section className="ez-panel overflow-hidden">
              <div className="flex flex-col gap-2 border-b border-line p-6 sm:flex-row sm:items-center sm:justify-between">
                <div><span className="ez-eyebrow">ACCOUNTING VIEW</span><h2 className="mt-1 text-xl font-black text-ink">طريقة قراءة الأرقام</h2></div>
                <Badge tone="neutral">تشغيلي</Badge>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-4">
                <FlowStep n="01" title="Revenue" text="إيراد تحقق أو تم توثيقه." />
                <FlowStep n="02" title="Budget" text="جزء يمكن تخصيصه لعقد أو حملة." />
                <FlowStep n="03" title="Commitment" text="التزام مالي تم حجزه فعليًا." />
                <FlowStep n="04" title="Reward / Payout" text="مكافأة أصبحت مستحقة أو تم دفعها." />
              </div>
              <div className="border-t border-line bg-paper-2 px-6 py-5 text-sm leading-7 text-muted">
                هذه الصفحة هي طبقة الرقابة التشغيلية الحالية. الاحتياطيات والتزامات Writer وTasks مرتبطة الآن بقيود قاعدة البيانات ولا يمكن إنشاء التزامات جديدة فوق التمويل المتاح.
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </AdminShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="ez-panel p-5"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-2 text-2xl font-black text-ink">{value}</p></div>;
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-line bg-paper p-5"><p className="text-xs font-bold text-muted">{label}</p><p className="mt-2 text-xl font-black text-ink">{value}</p></div>;
}

function BudgetCard({
  title, subtitle, value, meta, footer, tone,
}: {
  title: string; subtitle: string; value: string; meta: string; footer?: string; tone: 'brand' | 'positive';
}) {
  return <div className="ez-panel p-6">
    <div className="flex items-start justify-between gap-4">
      <div><span className="ez-eyebrow">{title}</span><p className="mt-2 text-sm text-muted">{subtitle}</p></div>
      <Badge tone={tone}>{tone === 'brand' ? 'Writer' : 'Tasks'}</Badge>
    </div>
    <p className="mt-6 text-3xl font-black text-ink">{value}</p>
    <p className="mt-2 text-xs text-muted">{meta}</p>
    {footer && <p className="mt-4 rounded-xl bg-paper-2 p-3 text-sm font-bold text-ink">{footer}</p>}
  </div>;
}

function CoverageCard({
  title, commitment, reserve, available, deficit,
}: {
  title: string;
  commitment: number;
  reserve: number;
  available: number;
  deficit: number;
}) {
  const covered = deficit <= 0;
  return <div className="ez-panel p-6">
    <div className="flex items-center justify-between gap-3">
      <div><span className="ez-eyebrow">{title}</span><p className="mt-2 text-sm text-muted">الاحتياطي مقابل الالتزام الحالي</p></div>
      <Badge tone={covered ? 'positive' : 'negative'}>{covered ? 'مغطى' : 'عجز'}</Badge>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <Mini label="الاحتياطي" value={money(reserve)} />
      <Mini label="الالتزام" value={money(commitment)} />
      <Mini label={covered ? 'المتاح بعد الالتزام' : 'العجز'} value={money(covered ? available : deficit)} />
    </div>
  </div>;
}

function FlowStep({ n, title, text }: { n: string; title: string; text: string }) {
  return <div className="rounded-2xl border border-line bg-paper p-5"><span className="text-xs font-black text-brand">{n}</span><h3 className="mt-2 font-black text-ink">{title}</h3><p className="mt-1 text-sm leading-6 text-muted">{text}</p></div>;
}
