import type { ReactNode } from 'react';
import OrbitMark from '../art/OrbitMark';

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <span
      className={`anim-spin-slow inline-block rounded-full border-2 border-current border-t-transparent ${className}`}
      aria-hidden
    />
  );
}

export function FullPageLoader({ label = 'جارٍ التحميل' }: { label?: string }) {
  return (
    <div className="feedback-loader flex min-h-[60vh] flex-col items-center justify-center gap-4 text-muted">
      <div className="feedback-loader__core">
        <span className="feedback-loader__halo" aria-hidden />
        <Spinner className="relative z-10 h-7 w-7 text-brand" />
      </div>
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="ez-card ez-sweep p-6">
      <div className="ez-sweep mb-4 h-5 w-2/3 rounded bg-paper-2" />
      <div className="ez-sweep mb-2 h-3 w-1/3 rounded bg-paper-2" />
      <div className="ez-sweep mb-5 h-3 w-full rounded bg-paper-2" />
      <div className="ez-sweep h-3 w-4/5 rounded bg-paper-2" />
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="ez-panel flex flex-col items-center gap-4 px-6 py-16 text-center">
      <OrbitMark size={44} className="opacity-90" />
      <div className="h-px w-12 bg-brand/40" />
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {body && <p className="max-w-md text-sm leading-relaxed text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warn' | 'error' | 'success';
  title?: string;
  children: ReactNode;
}) {
  const map = {
    info: 'tone-brand',
    warn: 'tone-caution',
    error: 'tone-negative',
    success: 'tone-positive',
  } as const;

  return (
    <div className={`feedback-notice rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${map[tone]}`} role="status">
      <span className="feedback-notice__mark" aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="mb-1 font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
