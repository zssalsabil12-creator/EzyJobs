import { supabase } from './supabase';

export type TaskCampaign = {
  id: string;
  title: string;
  partnerName: string;
  partnerUrl: string;
  programType: 'affiliate' | 'sponsored' | 'partner';
  incentiveAllowed: boolean;
  currency: string;
  partnerPayoutCents: number;
  studentRewardCents: number;
  maxBudgetCents: number;
  fundedBudgetCents: number;
  committedBudgetCents: number;
  holdDays: number;
  validationMode: 'manual' | 'partner_webhook';
  termsUrl: string;
  status: 'draft' | 'active' | 'paused' | 'closed';
};export type TaskOffer = {
  id: string;
  campaignId: string;
  campaign: TaskCampaign | null;
  title: string;
  description: string;
  category: string;
  steps: string;
  estimatedMinutes: number;
  proofRequired: boolean;
  proofInstructions: string;
  rewardCents: number;
  maxClaims: number;
  claimsCount: number;
  status: 'draft' | 'active' | 'paused' | 'closed' | 'exhausted';
};

export type TaskClaim = {
  id: string;
  taskId: string;
  userId: string;
  status: 'claimed' | 'submitted' | 'pending_validation' | 'approved' | 'rejected' | 'reversed' | 'paid';
  proofPayload: Record<string, unknown>;
  externalReference: string;
  partnerRevenueCents: number;
  studentRewardCents: number;
  platformMarginCents: number;
  adminNote: string;
  partnerRevenueReference: string;
  claimedAt: string;
  submittedAt: string | null;
};export type TaskReward = {
  id: string;
  claimId: string;
  userId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'available' | 'paid' | 'reversed';
  availableAt: string | null;
  paidAt: string | null;
  payoutReference: string;
};

const str = (v: unknown, fallback = '') => typeof v === 'string' ? v : fallback;
const num = (v: unknown) => Number(v ?? 0) || 0;

const mapCampaign = (r: Record<string, unknown>): TaskCampaign => ({
  id: str(r.id),
  title: str(r.title),
  partnerName: str(r.partner_name),
  partnerUrl: str(r.partner_url),
  programType: str(r.program_type, 'affiliate') as TaskCampaign['programType'],
  incentiveAllowed: Boolean(r.incentive_allowed),
  currency: str(r.currency, 'USD'),
  partnerPayoutCents: num(r.partner_payout_cents),
  studentRewardCents: num(r.student_reward_cents),
  maxBudgetCents: num(r.max_budget_cents),
  fundedBudgetCents: num(r.funded_budget_cents),
  committedBudgetCents: num(r.committed_budget_cents),
  holdDays: num(r.hold_days),
  validationMode: str(r.validation_mode, 'manual') as TaskCampaign['validationMode'],
  termsUrl: str(r.terms_url),
  status: str(r.status, 'draft') as TaskCampaign['status'],
});const mapOffer = (r: Record<string, unknown>, campaign: TaskCampaign | null): TaskOffer => ({
  id: str(r.id),
  campaignId: str(r.campaign_id),
  campaign,
  title: str(r.title),
  description: str(r.description),
  category: str(r.category, 'performance'),
  steps: str(r.steps),
  estimatedMinutes: num(r.estimated_minutes),
  proofRequired: Boolean(r.proof_required),
  proofInstructions: str(r.proof_instructions),
  rewardCents: num(r.reward_cents),
  maxClaims: num(r.max_claims),
  claimsCount: num(r.claims_count),
  status: str(r.status, 'draft') as TaskOffer['status'],
});

const mapClaim = (r: Record<string, unknown>): TaskClaim => ({
  id: str(r.id),
  taskId: str(r.task_id),
  userId: str(r.user_id),
  status: str(r.status, 'claimed') as TaskClaim['status'],
  proofPayload: (r.proof_payload as Record<string, unknown>) ?? {},
  externalReference: str(r.external_reference),
  partnerRevenueCents: num(r.partner_revenue_cents),
  studentRewardCents: num(r.student_reward_cents),
  platformMarginCents: num(r.platform_margin_cents),
  adminNote: str(r.admin_note),
  partnerRevenueReference: str(r.partner_revenue_reference),
  claimedAt: str(r.claimed_at),
  submittedAt: typeof r.submitted_at === 'string' ? r.submitted_at : null,
});const mapReward = (r: Record<string, unknown>): TaskReward => ({
  id: str(r.id),
  claimId: str(r.claim_id),
  userId: str(r.user_id),
  amountCents: num(r.amount_cents),
  currency: str(r.currency, 'USD'),
  status: str(r.status, 'pending') as TaskReward['status'],
  availableAt: typeof r.available_at === 'string' ? r.available_at : null,
  paidAt: typeof r.paid_at === 'string' ? r.paid_at : null,
  payoutReference: str(r.payout_reference),
});

export const tasksRepo = {
  async listActiveOffers() {
    if (!supabase) return { data: [] as TaskOffer[], error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.from('task_offers').select('*').eq('status', 'active').order('created_at', { ascending: false });
    if (error) return { data: [] as TaskOffer[], error: error.message };
    const ids = [...new Set((data ?? []).map((r) => str(r.campaign_id)).filter(Boolean))];
    const campaigns = ids.length
      ? await supabase.from('task_campaigns').select('*').in('id', ids)
      : { data: [], error: null };
    const byId = new Map((campaigns.data ?? []).map((r) => [str(r.id), mapCampaign(r as Record<string, unknown>)]));
    return { data: (data ?? []).map((r) => mapOffer(r as Record<string, unknown>, byId.get(str(r.campaign_id)) ?? null)), error: campaigns.error?.message ?? null };
  },  async listMyClaims(userId: string) {
    if (!supabase) return { data: [] as TaskClaim[], error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.from('task_claims').select('*').eq('user_id', userId).order('claimed_at', { ascending: false });
    return { data: (data ?? []).map((r) => mapClaim(r as Record<string, unknown>)), error: error?.message ?? null };
  },

  async releaseDueRewards() {
    if (!supabase) return { data: 0, error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.rpc('release_due_task_rewards');
    return { data: num(data), error: error?.message ?? null };
  },

  async listMyRewards(userId: string) {
    if (!supabase) return { data: [] as TaskReward[], error: 'قاعدة البيانات غير متاحة.' };
    await supabase.rpc('release_due_task_rewards');
    const { data, error } = await supabase.from('task_rewards').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    return { data: (data ?? []).map((r) => mapReward(r as Record<string, unknown>)), error: error?.message ?? null };
  },

  async claimTask(taskId: string) {
    if (!supabase) return { data: null as string | null, error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.rpc('claim_task', { p_task_id: taskId });
    return { data: typeof data === 'string' ? data : null, error: error?.message ?? null };
  },

  async submitTaskClaim(claimId: string, proofPayload: Record<string, unknown>, externalReference = '') {
    if (!supabase) return { data: false, error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.rpc('submit_task_claim', {
      p_claim_id: claimId,
      p_proof_payload: proofPayload,
      p_external_reference: externalReference,
    });
    return { data: Boolean(data), error: error?.message ?? null };
  },  async adminListCampaigns() {
    if (!supabase) return { data: [] as TaskCampaign[], error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.from('task_campaigns').select('*').order('created_at', { ascending: false });
    return { data: (data ?? []).map((r) => mapCampaign(r as Record<string, unknown>)), error: error?.message ?? null };
  },

  async adminListOffers() {
    if (!supabase) return { data: [] as TaskOffer[], error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.from('task_offers').select('*').order('created_at', { ascending: false });
    return { data: (data ?? []).map((r) => mapOffer(r as Record<string, unknown>, null)), error: error?.message ?? null };
  },

  async adminListClaims() {
    if (!supabase) return { data: [] as TaskClaim[], error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.from('task_claims').select('*').order('claimed_at', { ascending: false });
    return { data: (data ?? []).map((r) => mapClaim(r as Record<string, unknown>)), error: error?.message ?? null };
  },

  async adminSaveCampaign(input: Omit<TaskCampaign, 'id' | 'committedBudgetCents'>) {
    if (!supabase) return { data: null, error: 'قاعدة البيانات غير متاحة.' };
    const payload = {
      title: input.title, partner_name: input.partnerName, partner_url: input.partnerUrl,
      program_type: input.programType, incentive_allowed: input.incentiveAllowed,
      currency: input.currency, partner_payout_cents: input.partnerPayoutCents,
      student_reward_cents: input.studentRewardCents, max_budget_cents: input.maxBudgetCents,
      funded_budget_cents: input.fundedBudgetCents,
      hold_days: input.holdDays, validation_mode: input.validationMode, terms_url: input.termsUrl,
      status: input.status,
    };
    const { data, error } = await supabase.from('task_campaigns').insert(payload).select('*').single();
    return { data: data ? mapCampaign(data as Record<string, unknown>) : null, error: error?.message ?? null };
  },  async adminSaveOffer(input: Omit<TaskOffer, 'id' | 'campaign' | 'claimsCount'>) {
    if (!supabase) return { data: null, error: 'قاعدة البيانات غير متاحة.' };
    const payload = {
      campaign_id: input.campaignId, title: input.title, description: input.description,
      category: input.category, steps: input.steps, estimated_minutes: input.estimatedMinutes,
      proof_required: input.proofRequired, proof_instructions: input.proofInstructions,
      reward_cents: input.rewardCents, max_claims: input.maxClaims, status: input.status,
    };
    const { data, error } = await supabase.from('task_offers').insert(payload).select('*').single();
    return { data: data ? mapOffer(data as Record<string, unknown>, null) : null, error: error?.message ?? null };
  },

  async adminReviewClaim(claimId: string, status: 'approved' | 'rejected' | 'reversed', partnerRevenueCents: number, partnerRevenueReference: string, note: string) {
    if (!supabase) return { data: false, error: 'قاعدة البيانات غير متاحة.' };
    const { data, error } = await supabase.rpc('admin_review_task_claim', {
      p_claim_id: claimId,
      p_status: status,
      p_partner_revenue_cents: partnerRevenueCents,
      p_partner_revenue_reference: partnerRevenueReference,
      p_admin_note: note,
    });
    if (error) {
      return {
        data: false,
        error: error.message === 'duplicate_partner_revenue_reference'
          ? 'مرجع إيراد الشريك مستخدم مسبقًا في تنفيذ آخر.'
          : error.message,
      };
    }
    return { data: Boolean(data), error: null };
  },
};