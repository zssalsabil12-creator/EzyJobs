import { supabase } from './supabase';

export type FinanceAllocation = {
  id: string;
  allocationType: 'writer_reserve' | 'task_reserve' | 'operating_reserve';
  amountCents: number;
  currency: string;
  source: string;
  status: 'active' | 'released' | 'cancelled';
  note: string;
  createdAt: string;
  releasedAt: string | null;
};

export type FinanceSnapshot = {
  revenue: { totalVerifiedCents: number; totalPendingCents: number; platformCents: number; taskPartnerCents: number };
  payouts: { requestedCents: number; approvedCents: number; paidCents: number };
  writer: { activeContracts: number; committedMonthlyCents: number };
  tasks: { activeCampaigns: number; budgetCents: number; committedCents: number; availableBudgetCents: number };
  rewards: { pendingCents: number; availableCents: number; reversedCents: number };
  claims: { approvedRevenueCents: number; approvedMarginCents: number; reversedCount: number; missingEvidenceCount: number };
  reconciliation: {
    healthy: boolean;
    issueCount: number;
    creatorRevenueIssues: number;
    taskClaimIssues: number;
    taskRewardIssues: number;
    payoutOverdrawnUsers: number;
    activeAllocationOverageCents: number;
    writerReserveDeficitCents: number;
    taskReserveDeficitCents: number;
    missingTaskEvidence: number;
  };
  reserves: {
    platformRevenueCents: number;
    activeAllocatedCents: number;
    unallocatedPlatformCents: number;
    writerCents: number;
    taskCents: number;
    operatingCents: number;
    writerCommitmentCents: number;
    writerCoverageCents: number;
    writerDeficitCents: number;
    taskFundedCents: number;
    taskCoverageCents: number;
    taskDeficitCents: number;
  };
};

const num = (v: unknown) => Number(v ?? 0) || 0;

export const financeRepo = {
  async getSnapshot() {
    if (!supabase) return { data: null as FinanceSnapshot | null, error: 'Supabase غير مربوط.' };

    const [revenue, payouts, contracts, campaigns, rewards, claims, financeControl, reconciliation] = await Promise.all([
      supabase.from('creator_revenue_events').select('gross_cents,creator_cents,platform_cents,status'),
      supabase.from('creator_payouts').select('amount_cents,status'),
      supabase.from('writer_contracts').select('monthly_cap_cents,status'),
      supabase.from('task_campaigns').select('funded_budget_cents,max_budget_cents,committed_budget_cents,status'),
      supabase.from('task_rewards').select('amount_cents,status'),
      supabase.from('task_claims').select('partner_revenue_cents,platform_margin_cents,student_reward_cents,partner_revenue_reference,status'),
      supabase.rpc('get_finance_control'),
      supabase.rpc('get_finance_reconciliation'),
    ]);

    const firstError = [revenue, payouts, contracts, campaigns, rewards, claims, financeControl, reconciliation].find((x) => x.error);
    if (firstError?.error) return { data: null as FinanceSnapshot | null, error: firstError.error.message };

    if (financeControl.data?.ok === false) {
      return { data: null as FinanceSnapshot | null, error: String(financeControl.data.reason ?? 'تعذر تحميل الرقابة المالية.') };
    }
    if (reconciliation.data?.ok === false) {
      return { data: null as FinanceSnapshot | null, error: String(reconciliation.data.reason ?? 'تعذر تحميل المصالحة المالية.') };
    }

    const control = (financeControl.data ?? {}) as Record<string, unknown>;
    const reconciliationData = (reconciliation.data ?? {}) as Record<string, unknown>;
    const verifiedRevenue = (revenue.data ?? []).filter((r) => r.status === 'verified');
    const pendingRevenue = (revenue.data ?? []).filter((r) => r.status === 'pending');
    const approvedClaims = (claims.data ?? []).filter((r) =>
      r.status === 'approved'
      && typeof r.partner_revenue_reference === 'string'
      && r.partner_revenue_reference.trim().length >= 3
      && num(r.partner_revenue_cents) >= num(r.student_reward_cents)
      && num(r.platform_margin_cents) >= 0
    );
    const missingEvidenceClaims = (claims.data ?? []).filter((r) =>
      r.status === 'approved'
      && (
        typeof r.partner_revenue_reference !== 'string'
        || r.partner_revenue_reference.trim().length < 3
        || num(r.partner_revenue_cents) < num(r.student_reward_cents)
        || num(r.platform_margin_cents) < 0
      )
    );
    const activeContracts = (contracts.data ?? []).filter((r) => r.status === 'active');
    const activeCampaigns = (campaigns.data ?? []).filter((r) => r.status === 'active');
    const requested = (payouts.data ?? []).filter((r) => r.status === 'requested');
    const approvedPayouts = (payouts.data ?? []).filter((r) => r.status === 'approved');
    const paid = (payouts.data ?? []).filter((r) => r.status === 'paid');

    const budget = activeCampaigns.reduce((s, r) => s + num(r.funded_budget_cents), 0);
    const committed = activeCampaigns.reduce((s, r) => s + num(r.committed_budget_cents), 0);

    return {
      data: {
        revenue: {
          totalVerifiedCents: verifiedRevenue.reduce((s, r) => s + num(r.gross_cents), 0)
            + approvedClaims.reduce((s, r) => s + num(r.partner_revenue_cents), 0),
          totalPendingCents: pendingRevenue.reduce((s, r) => s + num(r.gross_cents), 0),
          platformCents: verifiedRevenue.reduce((s, r) => s + num(r.platform_cents), 0),
          taskPartnerCents: approvedClaims.reduce((s, r) => s + num(r.partner_revenue_cents), 0),
        },
        payouts: {
          requestedCents: requested.reduce((s, r) => s + num(r.amount_cents), 0),
          approvedCents: approvedPayouts.reduce((s, r) => s + num(r.amount_cents), 0),
          paidCents: paid.reduce((s, r) => s + num(r.amount_cents), 0),
        },
        writer: {
          activeContracts: activeContracts.length,
          committedMonthlyCents: activeContracts.reduce((s, r) => s + num(r.monthly_cap_cents), 0),
        },
        tasks: {
          activeCampaigns: activeCampaigns.length,
          budgetCents: budget,
          committedCents: committed,
          availableBudgetCents: Math.max(0, budget - committed),
        },
        rewards: {
          pendingCents: (rewards.data ?? []).filter((r) => r.status === 'pending').reduce((s, r) => s + num(r.amount_cents), 0),
          availableCents: (rewards.data ?? []).filter((r) => r.status === 'available').reduce((s, r) => s + num(r.amount_cents), 0),
          reversedCents: (rewards.data ?? []).filter((r) => r.status === 'reversed').reduce((s, r) => s + num(r.amount_cents), 0),
        },        claims: {
          approvedRevenueCents: approvedClaims.reduce((s, r) => s + num(r.partner_revenue_cents), 0),
          approvedMarginCents: approvedClaims.reduce((s, r) => s + num(r.platform_margin_cents), 0),
          reversedCount: (claims.data ?? []).filter((r) => r.status === 'reversed').length,
          missingEvidenceCount: missingEvidenceClaims.length,
        },
        reconciliation: {
          healthy: Boolean(reconciliationData.healthy),
          issueCount: num(reconciliationData.issue_count),
          creatorRevenueIssues: num(reconciliationData.creator_revenue_issues),
          taskClaimIssues: num(reconciliationData.task_claim_issues),
          taskRewardIssues: num(reconciliationData.task_reward_issues),
          payoutOverdrawnUsers: num(reconciliationData.payout_overdrawn_users),
          activeAllocationOverageCents: num(reconciliationData.active_allocation_overage_cents),
          writerReserveDeficitCents: num(reconciliationData.writer_reserve_deficit_cents),
          taskReserveDeficitCents: num(reconciliationData.task_reserve_deficit_cents),
          missingTaskEvidence: num(reconciliationData.missing_task_evidence),
        },
        reserves: {
          platformRevenueCents: num(control.platform_revenue_cents),
          activeAllocatedCents: num(control.active_allocated_cents),
          unallocatedPlatformCents: num(control.unallocated_platform_cents),
          writerCents: num(control.writer_reserve_cents),
          taskCents: num(control.task_reserve_cents),
          operatingCents: num(control.operating_reserve_cents),
          writerCommitmentCents: activeContracts.reduce((s, r) => s + num(r.monthly_cap_cents), 0),
          writerCoverageCents: Math.max(0, num(control.writer_reserve_cents) - activeContracts.reduce((s, r) => s + num(r.monthly_cap_cents), 0)),
          writerDeficitCents: Math.max(0, activeContracts.reduce((s, r) => s + num(r.monthly_cap_cents), 0) - num(control.writer_reserve_cents)),
          taskFundedCents: budget,
          taskCoverageCents: Math.max(0, num(control.task_reserve_cents) - budget),
          taskDeficitCents: Math.max(0, budget - num(control.task_reserve_cents)),
        },
      },
      error: null,
    };
  },

  async listAllocations() {
    if (!supabase) return { data: [] as FinanceAllocation[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('finance_allocations')
      .select('id,allocation_type,amount_cents,currency,source,status,note,created_at,released_at')
      .order('created_at', { ascending: false });
    if (error) return { data: [] as FinanceAllocation[], error: error.message };
    return {
      data: (data ?? []).map((r) => ({
        id: String(r.id),
        allocationType: r.allocation_type as FinanceAllocation['allocationType'],
        amountCents: num(r.amount_cents),
        currency: String(r.currency ?? 'USD'),
        source: String(r.source ?? ''),
        status: r.status as FinanceAllocation['status'],
        note: String(r.note ?? ''),
        createdAt: String(r.created_at ?? ''),
        releasedAt: typeof r.released_at === 'string' ? r.released_at : null,
      })),
      error: null,
    };
  },

  async createAllocation(type: FinanceAllocation['allocationType'], amountCents: number, note: string) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('admin_create_finance_allocation', {
      p_allocation_type: type,
      p_amount_cents: amountCents,
      p_note: note,
    });
    if (error) return { ok: false, error: error.message };
    return data?.ok
      ? { ok: true, error: null }
      : { ok: false, error: data?.reason === 'allocation_exceeds_available'
          ? 'التخصيص يتجاوز الإيراد الموثق غير المخصص. المتاح: ' + ((Number(data.available_cents ?? 0) || 0) / 100).toFixed(2) + ' USD.'
          : String(data?.reason ?? 'تعذر إنشاء التخصيص.') };
  },

  async releaseAllocation(id: string) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('admin_release_finance_allocation', { p_allocation_id: id });
    if (error) return { ok: false, error: error.message };
    return data?.ok ? { ok: true, error: null } : { ok: false, error: String(data?.reason ?? 'تعذر تحرير التخصيص.') };
  },
};