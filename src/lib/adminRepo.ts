import type { Job } from '../types';
import { supabase } from './supabase';
import { jobsRepo } from './jobsRepo';

type Row = Record<string, unknown>;

export type AdminUser = {
  id: string;
  username: string;
  role: 'admin' | 'publisher' | 'seeker';
  displayName: string;
  createdAt: string;
};

export type AdminAlert = {
  email: string;
  country: string;
  categories: string[];
  frequency: string;
  status: string;
  updatedAt: string;
};

export type SiteSetting = {
  key: string;
  value: string;
  isPublic: boolean;
  updatedAt: string;
};

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const strArr = (v: unknown) => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];

export const adminRepo = {
  mode: supabase ? 'supabase' : 'local',

  async listUsers(): Promise<{ data: AdminUser[]; error: string | null }> {
    if (!supabase) return { data: [], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('profiles').select('id,username,role,display_name,created_at').order('created_at', { ascending: false });
    if (error) return { data: [], error: error.message };
    return {
      data: (data as Row[]).map((r) => ({
        id: str(r.id),
        username: str(r.username),
        role: (r.role === 'admin' || r.role === 'publisher' ? r.role : 'seeker') as AdminUser['role'],
        displayName: str(r.display_name),
        createdAt: str(r.created_at),
      })),
      error: null,
    };
  },

  async setUserRole(userId: string, role: AdminUser['role']) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.rpc('update_profile_role', { p_user_id: userId, p_role: role });
    if (error) return { ok: false, error: error.message };
    const result = data as { ok?: boolean; reason?: string } | null;
    return result?.ok ? { ok: true, error: null } : { ok: false, error: result?.reason ?? 'تعذر تغيير الدور.' };
  },

  async listAllJobs(): Promise<{ data: Job[]; error: string | null }> {
    if (!supabase) return { data: [], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('jobs').select('*').order('updated_at', { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: (data as Row[]).map(mapJob), error: null };
  },

  async listAlerts(): Promise<{ data: AdminAlert[]; error: string | null }> {
    if (!supabase) return { data: [], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('job_alerts').select('email,country,categories,frequency,status,updated_at').order('updated_at', { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: (data as Row[]).map((r) => ({
      email: str(r.email),
      country: str(r.country, 'all'),
      categories: strArr(r.categories),
      frequency: str(r.frequency, 'daily'),
      status: str(r.status, 'active'),
      updatedAt: str(r.updated_at),
    })), error: null };
  },

  async removeAlert(email: string) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('job_alerts').delete().eq('email', email);
    return { ok: !error, error: error?.message ?? null };
  },

  async listSettings(): Promise<{ data: SiteSetting[]; error: string | null }> {
    if (!supabase) return { data: [], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('site_settings').select('key,value,is_public,updated_at').order('key');
    if (error) return { data: [], error: error.message };
    return { data: (data as Row[]).map((r) => ({
      key: str(r.key),
      value: typeof r.value === 'string' ? r.value : JSON.stringify(r.value ?? ''),
      isPublic: r.is_public !== false,
      updatedAt: str(r.updated_at),
    })), error: null };
  },

  async saveSetting(key: string, value: string, isPublic = true) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('site_settings').upsert({ key: key.trim(), value: JSON.stringify(value), is_public: isPublic });
    return { ok: !error, error: error?.message ?? null };
  },
};

function mapJob(r: Row): Job {
  return {
    id: str(r.id), slug: str(r.slug), titleAr: str(r.title_ar), titleOriginal: str(r.title_original), company: str(r.company),
    companyUrl: str(r.company_url) || undefined, category: str(r.category, 'other'), workMode: str(r.work_mode, 'remote') as Job['workMode'],
    commitment: str(r.commitment, 'full-time') as Job['commitment'], experience: str(r.experience, 'entry') as Job['experience'],
    experienceYears: Number(r.experience_years) || 0, eligibility: str(r.eligibility, 'unclear') as Job['eligibility'], eligibleRegions: strArr(r.eligible_regions),
    timezoneNote: str(r.timezone_note) || undefined, languages: (Array.isArray(r.languages) ? r.languages : []) as Job['languages'], salary: r.salary as Job['salary'],
    summaryAr: str(r.summary_ar), descriptionAr: str(r.description_ar), skills: strArr(r.skills), requirements: strArr(r.requirements), niceToHave: strArr(r.nice_to_have),
    suitableForStudents: r.suitable_for_students === true, weeklyHours: typeof r.weekly_hours === 'number' ? r.weekly_hours : undefined,
    education: str(r.education) || undefined,
    source: { name: str(r.source_name), url: str(r.source_url), redistributable: r.source_redistributable !== false, partner: r.source_partner === true, distribution: str(r.source_kind, 'direct') as Job['source']['distribution'] },
    applyUrl: str(r.apply_url), publishedAt: str(r.published_at), verifiedAt: str(r.verified_at), status: str(r.status, 'draft') as Job['status'],
    views: Number(r.views) || 0, views7d: Array.isArray(r.views_7d) ? r.views_7d.filter((x): x is number => typeof x === 'number') : [],
  };
}
