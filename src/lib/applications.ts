import { useEffect, useState } from 'react';
import type { Job } from '../types';

export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected';

export const APPLICATION_STATUS: Record<
  ApplicationStatus,
  { label: string; tone: 'neutral' | 'brand' | 'positive' | 'caution' | 'negative' }
> = {
  saved: { label: 'محفوظة', tone: 'neutral' },
  preparing: { label: 'قيد التحضير', tone: 'brand' },
  applied: { label: 'تم التقديم', tone: 'positive' },
  interview: { label: 'مقابلة', tone: 'caution' },
  offer: { label: 'عرض', tone: 'positive' },
  rejected: { label: 'مرفوضة', tone: 'negative' },
};

export interface TrackedApplication {
  id: string;
  jobId: string;
  slug: string;
  title: string;
  company: string;
  applyUrl: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  appliedAt?: string;
  notes: string;
}

const KEY = 'ezyjobs.applications.v1';
const EVENT = 'ezyjobs:applications-changed';

const read = (): TrackedApplication[] => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? (parsed.filter((x) => x && typeof x.jobId === 'string') as TrackedApplication[])
      : [];
  } catch {
    return [];
  }
};

const write = (items: TrackedApplication[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* التخزين غير متاح */
  }
  window.dispatchEvent(new CustomEvent(EVENT));
};

const now = () => new Date().toISOString();

export const applicationsRepo = {
  list: read,

  get(jobId: string) {
    return read().find((x) => x.jobId === jobId) ?? null;
  },

  ensure(job: Job): TrackedApplication {
    const items = read();
    const existing = items.find((x) => x.jobId === job.id);
    if (existing) return existing;

    const timestamp = now();
    const item: TrackedApplication = {
      id: `app-${job.id}-${Date.now().toString(36)}`,
      jobId: job.id,
      slug: job.slug,
      title: job.titleAr,
      company: job.company,
      applyUrl: job.applyUrl,
      status: 'saved',
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: '',
    };
    write([item, ...items]);
    return item;
  },

  updateStatus(jobId: string, status: ApplicationStatus) {
    const items = read().map((item) =>
      item.jobId === jobId
        ? {
            ...item,
            status,
            appliedAt: status === 'applied' ? item.appliedAt ?? now() : item.appliedAt,
            updatedAt: now(),
          }
        : item,
    );
    write(items);
    return items.find((item) => item.jobId === jobId) ?? null;
  },

  updateNotes(jobId: string, notes: string) {
    const items = read().map((item) =>
      item.jobId === jobId ? { ...item, notes, updatedAt: now() } : item,
    );
    write(items);
    return items.find((item) => item.jobId === jobId) ?? null;
  },

  remove(jobId: string) {
    write(read().filter((item) => item.jobId !== jobId));
  },

  clear() {
    write([]);
  },
};

export function useApplications() {
  const [items, setItems] = useState<TrackedApplication[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return {
    items,
    ensure: applicationsRepo.ensure,
    updateStatus: applicationsRepo.updateStatus,
    updateNotes: applicationsRepo.updateNotes,
    remove: applicationsRepo.remove,
    clear: applicationsRepo.clear,
  };
}
