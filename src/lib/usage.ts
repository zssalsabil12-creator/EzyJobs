import { supabase } from './supabase';

const SESSION_KEY = 'ezyjobs.usage.session.v1';
const SENT_PREFIX = 'ezyjobs.usage.sent.v1';

function sessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = globalThis.crypto?.randomUUID?.() ??
      Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
    window.sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
}

function isDuplicate(eventName: string, path: string): boolean {
  try {
    const key = `${SENT_PREFIX}.${eventName}.${path}`;
    const previous = Number(window.sessionStorage.getItem(key) ?? 0);
    if (Number.isFinite(previous) && Date.now() - previous < 30_000) return true;
    window.sessionStorage.setItem(key, String(Date.now()));
  } catch {
    return false;
  }
  return false;
}

export async function trackUsage(eventName: 'page_view' | 'job_view', path: string, jobId?: string): Promise<void> {
  if (!supabase || typeof window === 'undefined') return;
  if (!path || isDuplicate(eventName, path)) return;

  try {
    await supabase.rpc('record_usage_event', {
      p_event_name: eventName,
      p_session_id: sessionId(),
      p_path: path.slice(0, 512),
      p_job_id: jobId ?? null,
      p_metadata: {},
    });
  } catch {
    // Analytics must never block navigation or page rendering.
  }
}
