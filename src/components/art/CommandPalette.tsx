import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Job } from '../../types';
import { matchesQuery } from '../../lib/match';
import { categoryName } from '../../data/taxonomy';

export const PALETTE_EVENT = 'ezyjobs:palette';
export const openPalette = () => window.dispatchEvent(new CustomEvent(PALETTE_EVENT));

interface Entry {
  label: string;
  hint: string;
  to: string;
  kind: 'page' | 'job';
}

const PAGES: Entry[] = [
  { label: 'محرك البحث', hint: 'jobs', to: '/jobs', kind: 'page' },
  { label: 'فرص الطلاب', hint: 'students', to: '/students', kind: 'page' },
  { label: 'ابدأ من الصفر', hint: 'no experience', to: '/no-experience', kind: 'page' },
  { label: 'العمل عن بُعد', hint: 'remote', to: '/remote', kind: 'page' },
  { label: 'الأدوات المهنية', hint: 'tools cv', to: '/tools', kind: 'page' },
  { label: 'الأدلة والمقالات', hint: 'guides', to: '/guides', kind: 'page' },
  { label: 'تنبيهات الوظائف', hint: 'alerts', to: '/alerts', kind: 'page' },
  { label: 'المحفوظات', hint: 'saved', to: '/saved', kind: 'page' },
  { label: 'عن المنصة', hint: 'about', to: '/about', kind: 'page' },
  { label: 'لوحة تحكم الناشر', hint: 'dashboard', to: '/dashboard', kind: 'page' },
];

const norm = (s: string) => s.trim().toLowerCase();

/** لوحة أوامر ⌘K: تنقل فوري + بحث حي في الوظائف */
export default function CommandPalette({ jobs }: { jobs: Job[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener(PALETTE_EVENT, toggle);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(PALETTE_EVENT, toggle);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQ('');
    setActive(0);
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => inputRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = '';
      clearTimeout(t);
    };
  }, [open ]);

  const items = useMemo<Entry[]>(() => {
    const query = norm(q);
    if (!query) return PAGES.slice(0, 6);
    const pageHits = PAGES.filter(
      (p) => norm(p.label).includes(query) || norm(p.hint).includes(query),
    );
    const jobHits: Entry[] = jobs
      .filter((j) => j.status === 'published' && matchesQuery(j, q))
      .slice(0, 6)
      .map((j) => ({
        label: j.titleAr,
        hint: `${j.company} · ${categoryName(j.category)}`,
        to: `/jobs/${j.slug}`,
        kind: 'job' as const,
      }));
    return [...pageHits, ...jobHits].slice(0, 9);
  }, [q, jobs]);

  useEffect(() => setActive(0), [q]);

  const go = (to: string) => {
    setOpen(false);
    navigate(to);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter' && items[active]) {
      e.preventDefault();
      go(items[active].to);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal aria-label="بحث سريع">
      <div
        className="anim-fade absolute inset-0 bg-black/65 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div className="pointer-events-none absolute inset-x-0 top-[10vh] mx-auto w-[calc(100%-2.5rem)] max-w-xl">
        <div className="ez-panel anim-fade-up pointer-events-auto overflow-hidden !rounded-2xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-muted" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onInputKey}
              placeholder="ابحث عن صفحة أو وظيفة…"
              className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/60"
              aria-label="بحث سريع"
            />
            <kbd className="rounded-md border border-line bg-white/5 px-2 py-0.5 font-display text-[10px] text-muted">
              ESC
            </kbd>
          </div>

          <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                لا نتائج. جرّب كلمة أخرى — مثال: خدمة عملاء، طلاب، أدوات.
              </p>
            ) : (
              items.map((it, i) => (
                <button
                  key={`${it.kind}-${it.to}`}
                  data-idx={i}
                  onClick={() => go(it.to)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-right transition-colors ${
                    i === active ? 'bg-brand-50 shadow-[inset_0_0_24px_-12px_rgba(212,175,106,0.5)]' : ''
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block truncate text-[14px] font-bold ${i === active ? 'text-brand-700' : 'text-ink'}`}>
                      {it.label}
                    </span>
                    <span className="mt-0.5 block truncate text-[11.5px] text-muted">{it.hint}</span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      it.kind === 'job' ? 'tone-brand' : 'tone-neutral'
                    }`}
                  >
                    {it.kind === 'job' ? 'وظيفة' : 'صفحة'}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> تنقل
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>Enter</Kbd> فتح
            </span>
            <span className="mr-auto hidden sm:block">⌘K في أي وقت</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded border border-line bg-white/5 px-1.5 py-px font-display text-[10px]">
      {children}
    </kbd>
  );
}
