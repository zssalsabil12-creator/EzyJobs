import type { Job, JobLanguage, Salary } from '../types';
import { supabase } from './supabase';
import { seedJobs } from '../data/seedJobs';
import { cleanJobText } from './jobContent';

const fallbackJobs = seedJobs;


/* ------------------------------------------------------------------ */
/* التحويل بين صف قاعدة البيانات ونموذج التطبيق                          */
/* ------------------------------------------------------------------ */

type Row = Record<string, unknown>;

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);
const num = (v: unknown, fallback = 0) =>
  typeof v === 'number' && Number.isFinite(v) ? v : fallback;
const bool = (v: unknown) => v === true;
const strArr = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
const numArr = (v: unknown) =>
  Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number') : [];

const toJob = (r: Row): Job => ({
  id: str(r.id),
  slug: str(r.slug),
  titleAr: str(r.title_ar),
  titleOriginal: str(r.title_original),
  company: str(r.company),
  companyUrl: str(r.company_url) || undefined,
  category: str(r.category, 'other'),
  workMode: str(r.work_mode, 'remote') as Job['workMode'],
  commitment: str(r.commitment, 'full-time') as Job['commitment'],
  experience: str(r.experience, 'entry') as Job['experience'],
  experienceYears: num(r.experience_years),
  eligibility: str(r.eligibility, 'unclear') as Job['eligibility'],
  eligibleRegions: strArr(r.eligible_regions),
  timezoneNote: str(r.timezone_note) || undefined,
  languages: (Array.isArray(r.languages) ? r.languages : []) as JobLanguage[],
  salary: (r.salary ?? undefined) as Salary | undefined,
  summaryAr: cleanJobText(r.summary_ar),
  descriptionAr: cleanJobText(r.description_ar),
  skills: strArr(r.skills),
  requirements: strArr(r.requirements),
  niceToHave: strArr(r.nice_to_have),
  suitableForStudents: bool(r.suitable_for_students),
  weeklyHours: typeof r.weekly_hours === 'number' ? r.weekly_hours : undefined,
  education: str(r.education) || undefined,
  source: {
    name: str(r.source_name),
    url: str(r.source_url),
    redistributable: bool(r.source_redistributable),
    partner: bool(r.source_partner),
    distribution: str(r.source_kind, 'direct') as Job['source']['distribution'],
  },
  applyUrl: str(r.apply_url),
  publishedAt: str(r.published_at),
  verifiedAt: str(r.verified_at),
  status: str(r.status, 'draft') as Job['status'],
  views: num(r.views),
  views7d: numArr(r.views_7d),
});

/** عمود قاعدة البيانات لكل حقل في النموذج */
const COLUMN: Partial<Record<keyof Job, string>> = {
  slug: 'slug',
  titleAr: 'title_ar',
  titleOriginal: 'title_original',
  company: 'company',
  companyUrl: 'company_url',
  category: 'category',
  workMode: 'work_mode',
  commitment: 'commitment',
  experience: 'experience',
  experienceYears: 'experience_years',
  eligibility: 'eligibility',
  eligibleRegions: 'eligible_regions',
  timezoneNote: 'timezone_note',
  languages: 'languages',
  salary: 'salary',
  summaryAr: 'summary_ar',
  descriptionAr: 'description_ar',
  skills: 'skills',
  requirements: 'requirements',
  niceToHave: 'nice_to_have',
  suitableForStudents: 'suitable_for_students',
  weeklyHours: 'weekly_hours',
  education: 'education',
  applyUrl: 'apply_url',
  publishedAt: 'published_at',
  verifiedAt: 'verified_at',
  status: 'status',
  views: 'views',
  views7d: 'views_7d',
};

/** يبني صفاً جزئياً من الحقول المُعدَّلة فقط */
const patchRow = (patch: Partial<Job>): Row => {
  const row: Row = {};
  for (const key of Object.keys(patch) as (keyof Job)[]) {
    const column = COLUMN[key];
    if (!column || patch[key] === undefined) continue;
    row[column] = patch[key];
  }
  if (patch.source) {
    row.source_name = patch.source.name;
    row.source_url = patch.source.url;
    row.source_redistributable = patch.source.redistributable;
    row.source_partner = patch.source.partner;
    row.source_kind = patch.source.distribution ?? 'direct';
  }
  return row;
};

const fromJob = (j: Job, userId?: string): Row => ({
  id: j.id,
  slug: j.slug,
  title_ar: j.titleAr,
  title_original: j.titleOriginal,
  company: j.company,
  company_url: j.companyUrl ?? null,
  category: j.category,
  work_mode: j.workMode,
  commitment: j.commitment,
  experience: j.experience,
  experience_years: j.experienceYears,
  eligibility: j.eligibility,
  eligible_regions: j.eligibleRegions,
  timezone_note: j.timezoneNote ?? null,
  languages: j.languages,
  salary: j.salary ?? null,
  summary_ar: j.summaryAr,
  description_ar: j.descriptionAr,
  skills: j.skills,
  requirements: j.requirements,
  nice_to_have: j.niceToHave,
  suitable_for_students: j.suitableForStudents,
  weekly_hours: j.weeklyHours ?? null,
  education: j.education ?? null,
  source_name: j.source.name,
  source_url: j.source.url,
  source_redistributable: j.source.redistributable,
  source_partner: j.source.partner,
  source_kind: j.source.distribution ?? 'direct',
  apply_url: j.applyUrl,
  published_at: j.publishedAt,
  verified_at: j.verifiedAt,
  status: j.status,
  views: j.views,
  views_7d: j.views7d,
  ...(userId ? { created_by: userId } : {}),
});

/* ------------------------------------------------------------------ */
/* الوضع المحلي — يُستخدم قبل ربط Supabase                              */
/* ------------------------------------------------------------------ */

const LS_KEY = 'ezyjobs.jobs.v2';

const readLocal = (): Job[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return fallbackJobs;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? (parsed as Job[]) : fallbackJobs;
  } catch {
    return fallbackJobs;
  }
};

const writeLocal = (jobs: Job[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(jobs));
  } catch {
    /* التخزين ممتلئ أو معطّل — نتجاهل */
  }
};

/* ------------------------------------------------------------------ */
/* واجهة المستودع                                                       */
/* ------------------------------------------------------------------ */

export type RepoResult<T> = { data: T; error: string | null };

export const jobsRepo = {
  /** الوضع المحلي يعمل دائماً كنسخة احتياطية عند غياب Supabase */
  mode: (supabase ? 'supabase' : 'local') as 'supabase' | 'local',

  async list(): Promise<RepoResult<Job[]>> {
    const cached = readLocal();
    let publicJobs = cached;

    try {
      const response = await fetch('/jobs.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('jobs.json -> HTTP ' + response.status);
      const live = await response.json();
      if (Array.isArray(live) && live.length) {
        publicJobs = live as Job[];
        writeLocal(publicJobs);
      }
    } catch (error) {
      if (!supabase) {
        return {
          data: publicJobs.length ? publicJobs : fallbackJobs,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    if (!supabase) return { data: publicJobs, error: null };

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      return {
        data: publicJobs,
        error: error.message,
      };
    }

    const remoteJobs = (data as Row[]).map(toJob);
    const merged = new Map(publicJobs.map((job) => [job.id, job]));
    for (const job of remoteJobs) merged.set(job.id, job);

    return { data: [...merged.values()], error: null };
  },

  async listAll(): Promise<RepoResult<Job[]>> {
    if (!supabase) return { data: readLocal(), error: null };
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: (data as Row[]).map(toJob), error: null };
  },

  async listMine(userId: string | undefined): Promise<RepoResult<Job[]>> {
    if (!supabase) {
      return { data: readLocal(), error: null };
    }
    if (!userId) return { data: [], error: 'لم يتم التعرف على المستخدم.' };

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('created_by', userId)
      .order('updated_at', { ascending: false });

    if (error) return { data: [], error: error.message };
    return { data: (data as Row[]).map(toJob), error: null };
  },

  async create(job: Job, userId?: string): Promise<RepoResult<Job | null>> {
    if (!supabase) {
      const jobs = readLocal();
      const next = [job, ...jobs];
      writeLocal(next);
      return { data: job, error: null };
    }
    const { data, error } = await supabase
      .from('jobs')
      .insert(fromJob(job, userId))
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: toJob(data as Row), error: null };
  },

  async update(id: string, patch: Partial<Job>): Promise<RepoResult<Job | null>> {
    if (!supabase) {
      const jobs = readLocal().map((j) => (j.id === id ? { ...j, ...patch } : j));
      writeLocal(jobs);
      return { data: jobs.find((j) => j.id === id) ?? null, error: null };
    }
    const { data, error } = await supabase
      .from('jobs')
      .update(patchRow(patch))
      .eq('id', id)
      .select()
      .single();
    if (error) return { data: null, error: error.message };
    return { data: toJob(data as Row), error: null };
  },

  async remove(id: string): Promise<RepoResult<boolean>> {
    if (!supabase) {
      writeLocal(readLocal().filter((j) => j.id !== id));
      return { data: true, error: null };
    }
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    return { data: !error, error: error?.message ?? null };
  },

  async incrementViews(id: string): Promise<void> {
    if (!supabase) return;
    await supabase.rpc('increment_job_views', { job_id: id });
  },

  resetToSeed() {
    writeLocal(fallbackJobs);
  },
};
