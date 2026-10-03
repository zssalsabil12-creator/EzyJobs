import type { Guide } from '../content/guides';
import { supabase } from './supabase';

type Row = Record<string, unknown>;
const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback);

function mapGuide(r: Row): Guide {
  return {
    slug: str(r.slug),
    title: str(r.title),
    excerpt: str(r.excerpt),
    minutes: Number(r.minutes) || 5,
    category: str(r.category, 'remote') as Guide['category'],
    publishedAt: str(r.published_at),
    body: Array.isArray(r.body) ? (r.body as Guide['body']) : [],
    faqs: Array.isArray(r.faqs) ? (r.faqs as Guide['faqs']) : [],
    related: Array.isArray(r.related) ? (r.related as Guide['related']) : [],
  };
}
export const guideRepo = {
  async listPublished(): Promise<{ data: Guide[]; error: string | null }> {
    if (!supabase) return { data: [], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase
      .from('guide_pages')
      .select('slug,title,excerpt,minutes,category,body,faqs,related,published_at')
      .eq('published', true)
      .order('published_at', { ascending: false });
    if (error) return { data: [], error: error.message };
    return { data: (data as Row[]).map(mapGuide), error: null };
  },

  async getPublished(slug: string): Promise<{ data: Guide | null; error: string | null }> {
    if (!supabase) return { data: null, error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase
      .from('guide_pages')
      .select('slug,title,excerpt,minutes,category,body,faqs,related,published_at')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle();
    if (error) return { data: null, error: error.message };
    return { data: data ? mapGuide(data as Row) : null, error: null };
  },

  async listAdmin(): Promise<{ data: Array<Guide & { published: boolean; updatedAt: string }>; error: string | null }> {
    if (!supabase) return { data: [], error: 'Supabase غير مربوط.' };
    const { data, error } = await supabase
      .from('guide_pages')
      .select('slug,title,excerpt,minutes,category,body,faqs,related,published_at,published,updated_at')
      .order('updated_at', { ascending: false });
    if (error) return { data: [], error: error.message };
    return {
      data: (data as Row[]).map((row) => ({
        ...mapGuide(row),
        published: row.published !== false,
        updatedAt: str(row.updated_at),
      })),
      error: null,
    };
  },
  async save(guide: Guide, published = true) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    if (!/^[a-z0-9][a-z0-9-]{0,120}$/.test(guide.slug)) {
      return { ok: false, error: 'الـ slug يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.' };
    }
    const { error } = await supabase.from('guide_pages').upsert({
      slug: guide.slug.trim(),
      title: guide.title.trim(),
      excerpt: guide.excerpt.trim(),
      minutes: Math.max(1, Math.min(240, Math.round(guide.minutes))),
      category: guide.category,
      body: guide.body,
      faqs: guide.faqs ?? [],
      related: guide.related ?? [],
      published_at: guide.publishedAt || new Date().toISOString(),
      published,
    }, { onConflict: 'slug' });
    return { ok: !error, error: error?.message ?? null };
  },

  async remove(slug: string) {
    if (!supabase) return { ok: false, error: 'Supabase غير مربوط.' };
    const { error } = await supabase.from('guide_pages').delete().eq('slug', slug);
    return { ok: !error, error: error?.message ?? null };
  },
};
