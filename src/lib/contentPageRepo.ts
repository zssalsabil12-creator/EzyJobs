import { supabase } from './supabase';

export type ContentPage = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  metaDescription: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

const str = (v: unknown, fallback = '') => typeof v === 'string' ? v : fallback;

function mapPage(row: Record<string, unknown>): ContentPage {
  return {
    id: str(row.id),
    slug: str(row.slug),
    title: str(row.title),
    excerpt: str(row.excerpt),
    body: str(row.body),
    metaDescription: str(row.meta_description),
    published: row.published !== false,
    createdAt: str(row.created_at),
    updatedAt: str(row.updated_at),
  };
}

export const contentPageRepo = {
  async listAdmin() {
    if (!supabase) return { data: [] as ContentPage[], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('content_pages').select('*').order('updated_at', { ascending: false });
    return { data: (data ?? []).map((x) => mapPage(x as Record<string, unknown>)), error: error?.message ?? null };
  },

  async getPublished(slug: string) {
    if (!supabase) return { data: null as ContentPage | null, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('content_pages').select('*').eq('slug', slug).eq('published', true).maybeSingle();
    return { data: data ? mapPage(data as Record<string, unknown>) : null, error: error?.message ?? null };
  },

  async save(input: Partial<ContentPage> & { slug: string; title: string; body: string }) {
    if (!supabase) return { data: null, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase.from('content_pages').upsert({
      id: input.id || undefined,
      slug: input.slug.trim().toLowerCase(),
      title: input.title.trim(),
      excerpt: input.excerpt?.trim() ?? '',
      body: input.body,
      meta_description: input.metaDescription?.trim() ?? '',
      published: input.published !== false,
    }, { onConflict: 'slug' }).select('*').single();
    return { data: data ? mapPage(data as Record<string, unknown>) : null, error: error?.message ?? null };
  },

  async remove(id: string) {
    if (!supabase) return { error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('content_pages').delete().eq('id', id);
    return { error: error?.message ?? null };
  },
};
