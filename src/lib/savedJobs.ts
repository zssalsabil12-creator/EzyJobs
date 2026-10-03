import { useEffect, useState } from 'react';
import { supabase } from './supabase';

const KEY = 'ezyjobs.saved.v1';
const EVENT = 'ezyjobs:saved-changed';

let currentIds: string[] = [];
let remoteUserId: string | null = null;
let remoteReady = false;

const readLocal = (): string[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
};

const notify = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
};

const writeLocal = (ids: string[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* تجاهل */
  }
};

currentIds = readLocal();

export async function initSavedJobsSync(userId: string | null): Promise<void> {
  if (remoteUserId === userId && remoteReady) return;

  remoteUserId = userId;
  remoteReady = false;

  if (!supabase || !userId) {
    currentIds = readLocal();
    remoteReady = true;
    notify();
    return;
  }

  const localIds = readLocal();

  try {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('job_id')
      .eq('user_id', userId);

    if (error) {
      currentIds = localIds;
      remoteReady = true;
      notify();
      return;
    }

    const remoteIds = (data ?? [])
      .map((row) => row.job_id)
      .filter((id): id is string => typeof id === 'string');
    const merged = [...new Set([...remoteIds, ...localIds])];

    if (localIds.length) {
      const { error: migrationError } = await supabase
        .from('saved_jobs')
        .upsert(
          localIds.map((jobId) => ({ user_id: userId, job_id: jobId })),
          { onConflict: 'user_id,job_id' },
        );
      if (!migrationError) writeLocal([]);
    }

    currentIds = merged;
  } catch {
    currentIds = localIds;
  } finally {
    remoteReady = true;
    notify();
  }
}

export const savedJobs = {
  list: () => [...currentIds],

  has: (id: string) => currentIds.includes(id),

  toggle(id: string): boolean {
    const nextSaved = !currentIds.includes(id);
    const next = nextSaved
      ? [...currentIds, id]
      : currentIds.filter((x) => x !== id);

    currentIds = next;
    if (!remoteUserId || !remoteReady || !supabase) {
      writeLocal(next);
      notify();
      return nextSaved;
    }

    void (async () => {
      const result = nextSaved
        ? await supabase
            .from('saved_jobs')
            .upsert(
              { user_id: remoteUserId as string, job_id: id },
              { onConflict: 'user_id,job_id' },
            )
        : await supabase
            .from('saved_jobs')
            .delete()
            .eq('user_id', remoteUserId as string)
            .eq('job_id', id);

      if (result.error) {
        currentIds = nextSaved
          ? currentIds.filter((x) => x !== id)
          : [...currentIds, id];
        notify();
      }
    })();

    notify();
    return nextSaved;
  },

  remove(id: string) {
    const wasSaved = currentIds.includes(id);
    if (!wasSaved) return;

    currentIds = currentIds.filter((x) => x !== id);
    notify();

    if (!remoteUserId || !remoteReady || !supabase) {
      writeLocal(currentIds);
      return;
    }

    void (async () => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', remoteUserId as string)
        .eq('job_id', id);
      if (error) {
        currentIds = [...currentIds, id];
        notify();
      }
    })();
  },

  clear() {
    if (!currentIds.length) return;
    const previous = [...currentIds];
    currentIds = [];
    notify();

    if (!remoteUserId || !remoteReady || !supabase) {
      writeLocal([]);
      return;
    }

    void (async () => {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', remoteUserId as string);
      if (error) {
        currentIds = previous;
        notify();
      }
    })();
  },
};export function useSavedJobs() {
  const [ids, setIds] = useState<string[]>(() => savedJobs.list());

  useEffect(() => {
    const sync = () => setIds(savedJobs.list());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    ids,
    isSaved: (id: string) => ids.includes(id),
    toggle: (id: string) => savedJobs.toggle(id),
    remove: (id: string) => savedJobs.remove(id),
    clear: () => savedJobs.clear(),
  };
}
