import { supabase } from './supabase';

export type CreatorArticle = {
  id: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  rejectionReason: string;
  publishedAt: string | null;
  views: number;
  qualifiedReads: number;
  createdAt: string;
  updatedAt: string;
  contentHtml: string;
  seoTitle: string;
  seoDescription: string;
  focusKeyword: string;
  seoScore: number;
  seoReport: Record<string, unknown>;
  featuredImageUrl: string;
  featuredImageAlt: string;
  fontFamily: 'system' | 'inter' | 'arial' | 'tahoma' | 'georgia';
  fontSize: number;
  writerFeeCents: number;
};

export type WriterContract = {
  id: string;
  userId: string;
  status: 'active' | 'paused' | 'suspended' | 'ended';
  monthlyQuota: number;
  perArticleCents: number;
  monthlyCapCents: number;
  startedAt: string;
  endedAt: string | null;
};

export type WriterApplication = {
  id: string;
  userId: string;
  studyStatus: string;
  fieldOfStudy: string;
  languages: string;
  sampleText: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote: string;
  reviewedAt: string | null;
  createdAt: string;
};

export type CreatorRevenue = {
  id: string;
  articleId: string | null;
  authorId: string;
  source: string;
  reference: string;
  grossCents: number;
  creatorShareBps: number;
  creatorCents: number;
  platformCents: number;
  currency: string;
  status: string;
  createdAt: string;
};

export type CreatorPayout = {
  id: string;
  userId: string;
  provider: string;
  destination: string;
  amountCents: number;
  currency: string;
  status: string;
  adminNote: string;
  requestedAt: string;
  processedAt: string | null;
};

export type EarningsSummary = {
  publishVerifiedCents: number;
  publishPendingCents: number;
  taskAvailableCents: number;
  taskPendingCents: number;
  verifiedCents: number;
  pendingCents: number;
  reservedCents: number;
  availableCents: number;
};const str = (v: unknown, fallback = '') => typeof v === 'string' ? v : fallback;
const num = (v: unknown) => typeof v === 'number' ? v : Number(v) || 0;

function mapArticle(row: Record<string, unknown>): CreatorArticle {
  const author = row.profiles as Record<string, unknown> | null;
  return {
    id: str(row.id),
    authorId: str(row.author_id),
    authorUsername: str(author?.username, 'writer'),
    authorName: str(author?.display_name, str(author?.username, 'Writer')),
    slug: str(row.slug),
    title: str(row.title),
    excerpt: str(row.excerpt),
    content: str(row.content),
    status: str(row.status, 'draft') as CreatorArticle['status'],
    rejectionReason: str(row.rejection_reason),
    publishedAt: typeof row.published_at === 'string' ? row.published_at : null,
    views: num(row.views),
    qualifiedReads: num(row.qualified_reads),
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
    contentHtml: str(row.content_html),
    seoTitle: str(row.seo_title),
    seoDescription: str(row.seo_description),
    focusKeyword: str(row.focus_keyword),
    seoScore: num(row.seo_score),
    seoReport: (row.seo_report as Record<string, unknown> | null) ?? {},
    featuredImageUrl: str(row.featured_image_url),
    featuredImageAlt: str(row.featured_image_alt),
    fontFamily: str(row.font_family, 'system') as CreatorArticle['fontFamily'],
    fontSize: num(row.font_size) || 18,
    writerFeeCents: num(row.writer_fee_cents),
  };
}

function mapWriterContract(row: Record<string, unknown>): WriterContract {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    status: str(row.status, 'active') as WriterContract['status'],
    monthlyQuota: num(row.monthly_quota),
    perArticleCents: num(row.per_article_cents),
    monthlyCapCents: num(row.monthly_cap_cents),
    startedAt: str(row.started_at),
    endedAt: typeof row.ended_at === 'string' ? row.ended_at : null,
  };
}

function mapWriterApplication(row: Record<string, unknown>): WriterApplication {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    studyStatus: str(row.study_status),
    fieldOfStudy: str(row.field_of_study),
    languages: str(row.languages),
    sampleText: str(row.sample_text),
    motivation: str(row.motivation),
    status: str(row.status, 'pending') as WriterApplication['status'],
    adminNote: str(row.admin_note),
    reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : null,
    createdAt: str(row.created_at),
  };
}

function mapRevenue(row: Record<string, unknown>): CreatorRevenue {
  return {
    id: str(row.id),
    articleId: typeof row.article_id === 'string' ? row.article_id : null,
    authorId: str(row.author_id),
    source: str(row.source),
    reference: str(row.reference),
    grossCents: num(row.gross_cents),
    creatorShareBps: num(row.creator_share_bps),
    creatorCents: num(row.creator_cents),
    platformCents: num(row.platform_cents),
    currency: str(row.currency, 'USD'),
    status: str(row.status, 'pending'),
    createdAt: str(row.created_at),
  };
}

function mapPayout(row: Record<string, unknown>): CreatorPayout {
  return {
    id: str(row.id),
    userId: str(row.user_id),
    provider: str(row.provider, 'airtm'),
    destination: str(row.destination),
    amountCents: num(row.amount_cents),
    currency: str(row.currency, 'USD'),
    status: str(row.status, 'requested'),
    adminNote: str(row.admin_note),
    requestedAt: str(row.requested_at),
    processedAt: typeof row.processed_at === 'string' ? row.processed_at : null,
  };
}

export function makeCreatorSlug(title: string): string {
  const base = title.toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
  const suffix = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return base ? base.slice(0, 78) + '-' + suffix : 'article-' + suffix;
}export const creatorRepo = {
  async getMyArticles() {
    if (!supabase) return { data: [] as CreatorArticle[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('creator_articles')
      .select('*,profiles(username,display_name)')
      .order('updated_at', { ascending: false });
    return {
      data: (data ?? []).map((x) => mapArticle(x as Record<string, unknown>)),
      error: error?.message ?? null,
    };
  },

  async getPublishedBySlug(slug: string) {
    if (!supabase) return { data: null, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('get_public_creator_article', { p_slug: slug });
    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: null };
    const raw = data as Record<string, unknown>;
    const author = raw.author as Record<string, unknown> | undefined;
    return {
      data: mapArticle({ ...raw, profiles: author ?? {} }),
      error: null,
    };
  },

  async createArticle(input: {
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    contentHtml: string;
    seoTitle: string;
    seoDescription: string;
    focusKeyword: string;
    seoScore: number;
    seoReport: Record<string, unknown>;
    featuredImageUrl: string;
    featuredImageAlt: string;
    fontFamily: CreatorArticle['fontFamily'];
    fontSize: number;
    status: 'draft' | 'pending';
  }, authorId: string) {
    if (!supabase) return { data: null, error: 'Supabase غير مربوط.' };
    const slug = input.slug.trim() || makeCreatorSlug(input.title);
    const { data, error } = await supabase.from('creator_articles').insert({
      author_id: authorId,
      slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content,
      content_html: input.contentHtml,
      seo_title: input.seoTitle.trim(),
      seo_description: input.seoDescription.trim(),
      focus_keyword: input.focusKeyword.trim(),
      seo_score: input.seoScore,
      seo_report: input.seoReport,
      featured_image_url: input.featuredImageUrl.trim(),
      featured_image_alt: input.featuredImageAlt.trim(),
      font_family: input.fontFamily,
      font_size: input.fontSize,
      status: input.status,
      published_at: null,
    }).select('*,profiles(username,display_name)').single();
    return { data: data ? mapArticle(data as Record<string, unknown>) : null, error: error?.message ?? null };
  },

  async updateArticle(id: string, input: Partial<Pick<CreatorArticle,
    'slug' | 'title' | 'excerpt' | 'content' | 'contentHtml' | 'seoTitle' | 'seoDescription' |
    'focusKeyword' | 'seoScore' | 'seoReport' | 'featuredImageUrl' | 'featuredImageAlt' |
    'fontFamily' | 'fontSize' | 'status' | 'rejectionReason'
  >>) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const payload: Record<string, unknown> = {};
    if (input.slug !== undefined && input.slug.trim()) payload.slug = input.slug.trim();
    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.excerpt !== undefined) payload.excerpt = input.excerpt.trim();
    if (input.content !== undefined) payload.content = input.content;
    if (input.contentHtml !== undefined) payload.content_html = input.contentHtml;
    if (input.seoTitle !== undefined) payload.seo_title = input.seoTitle.trim();
    if (input.seoDescription !== undefined) payload.seo_description = input.seoDescription.trim();
    if (input.focusKeyword !== undefined) payload.focus_keyword = input.focusKeyword.trim();
    if (input.seoScore !== undefined) payload.seo_score = input.seoScore;
    if (input.seoReport !== undefined) payload.seo_report = input.seoReport;
    if (input.featuredImageUrl !== undefined) payload.featured_image_url = input.featuredImageUrl.trim();
    if (input.featuredImageAlt !== undefined) payload.featured_image_alt = input.featuredImageAlt.trim();
    if (input.fontFamily !== undefined) payload.font_family = input.fontFamily;
    if (input.fontSize !== undefined) payload.font_size = input.fontSize;
    if (input.status !== undefined) payload.status = input.status;
    if (input.rejectionReason !== undefined) payload.rejection_reason = input.rejectionReason;
    if (input.status === 'published') payload.published_at = new Date().toISOString();
    const { error } = await supabase.from('creator_articles').update(payload).eq('id', id);
    return { error: error?.message ?? null };
  },  async deleteArticle(id: string) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('creator_articles').delete().eq('id', id);
    return { error: error?.message ?? null };
  },

  async getMyWriterContract(userId: string) {
    if (!supabase) return { data: null as WriterContract | null, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('writer_contracts').select('*').eq('user_id', userId).maybeSingle();
    return { data: data ? mapWriterContract(data as Record<string, unknown>) : null, error: error?.message ?? null };
  },

  async getMyWriterApplication(userId: string) {
    if (!supabase) return { data: null as WriterApplication | null, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('writer_applications').select('*').eq('user_id', userId).maybeSingle();
    return { data: data ? mapWriterApplication(data as Record<string, unknown>) : null, error: error?.message ?? null };
  },

  async submitWriterApplication(input: {
    studyStatus: string;
    fieldOfStudy: string;
    languages: string;
    sampleText: string;
    motivation: string;
  }) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('submit_writer_application', {
      p_study_status: input.studyStatus,
      p_field_of_study: input.fieldOfStudy,
      p_languages: input.languages,
      p_sample_text: input.sampleText,
      p_motivation: input.motivation,
    });
    if (error) return { ok: false, error: error.message };
    return data?.ok ? { ok: true, error: null } : { ok: false, error: data?.reason ?? 'تعذر إرسال الطلب.' };
  },

  async recordEvent(articleId: string, eventName: 'view' | 'qualified_read' | 'airtm_click') {
    if (!supabase) return;
    let sessionId = localStorage.getItem('ezy_creator_session');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('ezy_creator_session', sessionId);
    }
    await supabase.rpc('record_creator_event', {
      p_article_id: articleId,
      p_event_name: eventName,
      p_session_id: sessionId,
    });
  },

  async getMyRevenue(userId: string) {
    if (!supabase) return { data: [] as CreatorRevenue[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('creator_revenue_events')
      .select('*').eq('author_id', userId).order('created_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapRevenue(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async getMyEarningsSummary() {
    if (!supabase) {
      return {
        data: {
          publishVerifiedCents: 0,
          publishPendingCents: 0,
          taskAvailableCents: 0,
          taskPendingCents: 0,
          verifiedCents: 0,
          pendingCents: 0,
          reservedCents: 0,
          availableCents: 0,
        } as EarningsSummary,
        error: 'Supabase غير مربوط.',
      };
    }
    const { data, error } = await supabase.rpc('get_my_earnings_summary');
    if (error) {
      return {
        data: null as EarningsSummary | null,
        error: error.message,
      };
    }
    const row = (data ?? {}) as Record<string, unknown>;
    if (row.ok === false) {
      return {
        data: null as EarningsSummary | null,
        error: String(row.reason ?? 'تعذر تحميل ملخص الأرباح.'),
      };
    }
    const n = (key: string) => num(row[key]);
    return {
      data: {
        publishVerifiedCents: n('publish_verified_cents'),
        publishPendingCents: n('publish_pending_cents'),
        taskAvailableCents: n('task_available_cents'),
        taskPendingCents: n('task_pending_cents'),
        verifiedCents: n('verified_cents'),
        pendingCents: n('pending_cents'),
        reservedCents: n('reserved_cents'),
        availableCents: n('available_cents'),
      },
      error: null,
    };
  },

  async getMyPayouts(userId: string) {
    if (!supabase) return { data: [] as CreatorPayout[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('creator_payouts')
      .select('*').eq('user_id', userId).order('requested_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapPayout(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async savePayoutAccount(userId: string, handle: string) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('creator_payout_accounts').upsert({
      user_id: userId, provider: 'airtm', handle: handle.trim(),
    }, { onConflict: 'user_id,provider' });
    return { error: error?.message ?? null };
  },  async requestPayout(amountCents: number, destination: string) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('request_creator_payout', {
      p_amount_cents: amountCents,
      p_provider: 'airtm',
      p_destination: destination.trim(),
    });
    if (error) return { ok: false, error: error.message };
    const result = data as { ok?: boolean; reason?: string; available_cents?: number };
    return result?.ok
      ? { ok: true, error: null }
      : { ok: false, error: result?.reason === 'insufficient_balance'
          ? 'الرصيد المتاح ' + ((result.available_cents ?? 0) / 100).toFixed(2) + ' USD فقط.'
          : result?.reason ?? 'تعذر إنشاء طلب السحب.' };
  },

  async getPublicSettings() {
    if (!supabase) return { airtmReferralUrl: '', enabled: true, minPayoutCents: 2000 };
    const { data } = await supabase.from('site_settings').select('key,value')
      .in('key', ['airtm_referral_url','creator_program_enabled','creator_min_payout_cents']);
    const map = Object.fromEntries((data ?? []).map((r) => [
      r.key, typeof r.value === 'string' ? r.value : JSON.stringify(r.value ?? ''),
    ]));
    return {
      airtmReferralUrl: parseJsonString(map.airtm_referral_url),
      enabled: parseJsonBoolean(map.creator_program_enabled, true),
      minPayoutCents: Number(parseJsonString(map.creator_min_payout_cents) || 2000),
    };
  },

  async adminListWriterApplications() {
    if (!supabase) return { data: [] as WriterApplication[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('writer_applications').select('*').order('created_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapWriterApplication(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async adminListWriterContracts() {
    if (!supabase) return { data: [] as WriterContract[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('writer_contracts').select('*').order('updated_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapWriterContract(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async adminSetWriterContract(input: {
    userId: string;
    status: WriterContract['status'];
    monthlyQuota: number;
    perArticleCents: number;
    monthlyCapCents: number;
  }) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('admin_set_writer_contract', {
      p_user_id: input.userId,
      p_status: input.status,
      p_monthly_quota: input.monthlyQuota,
      p_per_article_cents: input.perArticleCents,
      p_monthly_cap_cents: input.monthlyCapCents,
    });
    if (error) return { ok: false, error: error.message };
    return data?.ok ? { ok: true, error: null } : { ok: false, error: data?.reason ?? 'تعذر حفظ العقد.' };
  },

  async adminReviewWriterApplication(id: string, status: WriterApplication['status'], note: string) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('writer_applications').update({
      status,
      admin_note: note,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    return { error: error?.message ?? null };
  },

  async adminListArticles() {
    if (!supabase) return { data: [] as CreatorArticle[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('creator_articles')
      .select('*,profiles(username,display_name)').order('updated_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapArticle(x as Record<string, unknown>)), error: error?.message ?? null };
  },  async adminModerateArticle(id: string, status: CreatorArticle['status'], reason = '') {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('creator_articles').update({
      status, rejection_reason: reason,
      published_at: status === 'published' ? new Date().toISOString() : null,
    }).eq('id', id);
    return { error: error?.message ?? null };
  },

  async adminUpdateArticle(id: string, input: Partial<Pick<CreatorArticle,
    'slug' | 'title' | 'excerpt' | 'content' | 'contentHtml' | 'seoTitle' | 'seoDescription' |
    'focusKeyword' | 'seoScore' | 'seoReport' | 'featuredImageUrl' | 'featuredImageAlt' |
    'fontFamily' | 'fontSize' | 'status'
  >>) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const payload: Record<string, unknown> = {};
    if (input.slug !== undefined && input.slug.trim()) payload.slug = input.slug.trim();
    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.excerpt !== undefined) payload.excerpt = input.excerpt.trim();
    if (input.content !== undefined) payload.content = input.content;
    if (input.contentHtml !== undefined) payload.content_html = input.contentHtml;
    if (input.seoTitle !== undefined) payload.seo_title = input.seoTitle.trim();
    if (input.seoDescription !== undefined) payload.seo_description = input.seoDescription.trim();
    if (input.focusKeyword !== undefined) payload.focus_keyword = input.focusKeyword.trim();
    if (input.seoScore !== undefined) payload.seo_score = input.seoScore;
    if (input.seoReport !== undefined) payload.seo_report = input.seoReport;
    if (input.featuredImageUrl !== undefined) payload.featured_image_url = input.featuredImageUrl.trim();
    if (input.featuredImageAlt !== undefined) payload.featured_image_alt = input.featuredImageAlt.trim();
    if (input.fontFamily !== undefined) payload.font_family = input.fontFamily;
    if (input.fontSize !== undefined) payload.font_size = input.fontSize;
    if (input.status !== undefined) {
      payload.status = input.status;
      payload.published_at = input.status === 'published' ? new Date().toISOString() : null;
    }
    const { error } = await supabase.from('creator_articles').update(payload).eq('id', id);
    return { error: error?.message ?? null };
  },

  async adminDeleteArticle(id: string) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('creator_articles').delete().eq('id', id);
    return { error: error?.message ?? null };
  },

  async adminListRevenue() {
    if (!supabase) return { data: [] as CreatorRevenue[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('creator_revenue_events')
      .select('*').order('created_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapRevenue(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async adminAddRevenue(input: Omit<CreatorRevenue, 'id' | 'createdAt'>) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('admin_record_creator_revenue', {
      p_article_id: input.articleId,
      p_author_id: input.authorId,
      p_source: input.source,
      p_reference: input.reference,
      p_gross_cents: input.grossCents,
      p_creator_share_bps: input.creatorShareBps,
      p_status: input.status,
    });
    if (error) return { error: error.message };
    if (!data?.ok) {
      const messages: Record<string, string> = {
        forbidden: 'ليس لديك صلاحية تسجيل الإيراد.',
        invalid_source: 'مصدر الإيراد غير صالح.',
        invalid_status: 'حالة الإيراد غير صالحة.',
        invalid_revenue: 'أدخل إيرادًا موجبًا ومرجعًا صالحًا.',
        duplicate_reference: 'مرجع الإيراد مستخدم مسبقًا ولا يمكن تسجيل الحدث مرتين.',
        article_author_mismatch: 'المقال والكاتب المحددان غير متطابقين.',
      };
      return { error: messages[String(data?.reason ?? '')] ?? String(data?.reason ?? 'تعذر تسجيل الإيراد.') };
    }
    return { error: null };
  },  async adminListPayouts() {
    if (!supabase) return { data: [] as CreatorPayout[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('creator_payouts')
      .select('*').order('requested_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapPayout(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async adminUpdatePayout(id: string, status: CreatorPayout['status'], note: string) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('admin_update_creator_payout', {
      p_payout_id: id,
      p_status: status,
      p_admin_note: note,
    });
    if (error) return { error: error.message };
    if (!data?.ok) {
      const messages: Record<string, string> = {
        invalid_transition: 'انتقال حالة السحب غير مسموح.',
        payout_must_be_approved_first: 'يجب اعتماد طلب السحب قبل تسجيل الدفع.',
        payout_final: 'هذا الطلب نهائي ولا يمكن تعديله.',
        payout_not_found: 'طلب السحب غير موجود.',
        payout_underfunded: 'تعذر اعتماد/دفع السحب لأن الرصيد الموثق الحالي لا يغطي الالتزامات القائمة.',
        forbidden: 'ليس لديك صلاحية تعديل السحوبات.',
      };
      return { error: messages[String(data?.reason ?? '')] ?? String(data?.reason ?? 'تعذر تحديث طلب السحب.') };
    }
    return { error: null };
  },
};

function parseJsonString(value: string | undefined): string {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return typeof parsed === 'string' ? parsed : String(parsed ?? '');
  } catch { return value; }
}

function parseJsonBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  try { return Boolean(JSON.parse(value)); } catch { return fallback; }
}