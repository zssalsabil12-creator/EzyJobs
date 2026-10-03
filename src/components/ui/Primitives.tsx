import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as AdminIcons from 'lucide-react';
import Logo from '../art/Logo';

const {
  BarChart3, BookOpen, Briefcase, ChevronLeft, FileText, LayoutDashboard,
  ListTodo, Menu, PenSquare, Settings2, ShieldCheck, Users, WalletCards, X,
} = AdminIcons;

/* ------------------------------------------------------------------ */
/* Button                                                              */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'ink' | 'ghost' | 'onDark';
type Size = 'sm' | 'md' | 'lg';

const VARIANT: Record<Variant, string> = {
  primary: 'ez-btn-primary',
  ink: 'ez-btn-ink',
  ghost: 'ez-btn-ghost',
  onDark: 'ez-btn-onDark',
};

const SIZE: Record<Size, string> = {
  sm: 'px-4 py-2 text-[13px]',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-[15px]',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`ez-btn ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  to,
  href,
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  children,
}: {
  to?: string;
  href?: string;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const cls = `ez-btn ${VARIANT[variant]} ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`;
  if (href)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer nofollow" className={cls}>
        {children}
      </a>
    );
  return (
    <a href={to ?? '#'} className={cls}>
      {children}
    </a>
  );
}

/* ------------------------------------------------------------------ */
/* Badge / Chip                                                        */
/* ------------------------------------------------------------------ */

type Tone = 'neutral' | 'brand' | 'accent' | 'positive' | 'caution' | 'negative' | 'onDark';

const TONE: Record<Tone, string> = {
  neutral: 'ez-chip tone-neutral',
  brand: 'ez-chip tone-brand',
  accent: 'ez-chip ez-chip-accent',
  positive: 'ez-chip tone-positive',
  caution: 'ez-chip tone-caution',
  negative: 'ez-chip tone-negative',
  onDark: 'ez-chip ez-chip-ink',
};

export function Badge({
  tone = 'neutral',
  title,
  children,
  className = '',
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`${TONE[tone]} ${className}`} title={title}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Section wrapper                                                     */
/* ------------------------------------------------------------------ */

export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`py-20 lg:py-28 ${className}`}>
      <div className="mx-auto max-w-[1240px] px-5 lg:px-10">{children}</div>
    </section>
  );
}

export function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'start',
  onDark,
  action,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'start' | 'center';
  onDark?: boolean;
  action?: ReactNode;
}) {
  const centered = align === 'center';
  return (
    <div
      className={`mb-12 flex flex-col gap-6 lg:mb-16 ${
        centered
          ? 'items-center text-center'
          : 'lg:flex-row lg:items-end lg:justify-between'
      }`}
    >
      <div className={centered ? 'max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && (
          <span className={`ez-eyebrow mb-4 ${onDark ? 'text-accent' : ''}`}>{eyebrow}</span>
        )}
        <h2
          className={`text-3xl font-black leading-[1.15] sm:text-4xl lg:text-[3.1rem] ${
            onDark ? 'text-white' : 'text-ink'
          }`}
        >
          {title}
        </h2>
        {lead && (
          <p
            className={`mt-5 text-[15px] leading-[1.9] sm:text-base ${
              onDark ? 'text-white/60' : 'text-muted'
            }`}
          >
            {lead}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="ez-label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-muted/80">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`ez-input ${props.className ?? ''}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`ez-input resize-y ${props.className ?? ''}`} />;
}

export function Select({
  options,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select {...rest} className={`ez-input appearance-none ${rest.className ?? ''}`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-start gap-3 rounded-xl border border-line bg-surface p-3 text-right transition-colors hover:border-brand-100"
    >
      <span
        className={`mt-0.5 h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors ${
          checked ? 'bg-brand' : 'bg-line'
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-abyss shadow transition-transform ${
            checked ? '-translate-x-4' : '-translate-x-0'
          }`}
        />
      </span>
      <span>
        <span className="block text-[13px] font-bold text-ink">{label}</span>
        {hint && <span className="mt-0.5 block text-[11px] text-muted">{hint}</span>}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Tag list input (for skills / regions)                                */
/* ------------------------------------------------------------------ */

export function TagInput({
  values,
  onChange,
  placeholder,
  suggestions = [],
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}) {
  const add = (raw: string) => {
    const v = raw.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
  };

  return (
    <div className="rounded-xl border border-line bg-surface p-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="ez-chip ez-chip-brand">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-brand-700/60 transition-colors hover:text-brand-700"
              aria-label={`حذف ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="min-w-[8rem] flex-1 bg-transparent px-2 py-1 text-sm outline-none"
          placeholder={values.length ? '' : placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              add((e.target as HTMLInputElement).value);
              (e.target as HTMLInputElement).value = '';
            }
            if (e.key === 'Backspace' && !values.length) return;
          }}
          onBlur={(e) => add(e.target.value)}
        />
      </div>
      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 border-t border-line pt-2">
          {suggestions
            .filter((s) => !values.includes(s))
            .slice(0, 10)
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => add(s)}
                className="ez-chip transition-colors hover:border-brand hover:text-brand"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Key-value list                                                      */
/* ------------------------------------------------------------------ */

export function DataRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line py-3 last:border-0">
      <span className="shrink-0 text-[12px] font-medium text-muted">{label}</span>
      <span className="text-left text-[13px] font-semibold text-ink">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Admin workspace shell                                               */
/* ------------------------------------------------------------------ */

type AdminNavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  match?: (pathname: string, search: string) => boolean;
};

const ADMIN_NAV: Array<{ title: string; items: AdminNavItem[] }> = [
  {
    title: 'الرئيسية',
    items: [
      { label: 'لوحة التحكم', to: '/admin', icon: LayoutDashboard, match: (p) => p === '/admin' },
      { label: 'إدارة الوظائف', to: '/dashboard', icon: Briefcase, match: (p) => p === '/dashboard' },
    ],
  },
  {
    title: 'المحتوى والنمو',
    items: [
      { label: 'صفحات الموقع', to: '/admin/pages', icon: FileText, match: (p) => p === '/admin/pages' },
      { label: 'الأدلة والمقالات', to: '/admin/guides', icon: BookOpen, match: (p) => p === '/admin/guides' },
      { label: 'EzyPublish', to: '/admin/creators', icon: PenSquare, match: (p) => p === '/admin/creators' },
      { label: 'EzyTasks', to: '/admin/tasks', icon: ListTodo, match: (p) => p === '/admin/tasks' },
    ],
  },
  {
    title: 'المال والرقابة',
    items: [
      { label: 'المركز المالي', to: '/admin/finance', icon: WalletCards, match: (p) => p === '/admin/finance' },
    ],
  },
  {
    title: 'إدارة المنصة',
    items: [
      { label: 'الإعدادات', to: '/admin/settings', icon: Settings2, match: (p) => p === '/admin/settings' },
    ],
  },
];

function adminNavActive(item: AdminNavItem, pathname: string, search: string) {
  return item.match ? item.match(pathname, search) : pathname === item.to;
}

export function AdminShell({
  children,
  title,
  eyebrow = 'ADMIN CONSOLE',
  description,
}: {
  children: ReactNode;
  title?: string;
  eyebrow?: string;
  description?: string;
}) {
  const { pathname, search } = useLocation();

  return (
    <div className="admin-workspace min-h-screen bg-[#0b0f16] text-white">
      <aside className="admin-sidebar fixed inset-y-0 right-0 z-50 hidden w-[282px] border-l border-white/10 bg-[#09111d]/92 text-white shadow-[-20px_0_70px_-45px_rgba(0,0,0,0.95)] backdrop-blur-2xl lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <Link to="/admin" className="group flex items-center gap-3 rounded-2xl px-2 py-1.5">
            <Logo size={42} glow />
            <div className="min-w-0">
              <p className="font-display text-[18px] font-black tracking-tight text-white">ezyjobs</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.24em] text-white/45">Admin workspace</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5">
          <div className="mb-5 rounded-2xl border border-line bg-white/[0.025] p-3">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_12px_rgba(47,100,214,0.9)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">مساحة الإدارة</p>
            </div>
            <p className="mt-2 text-xs leading-6 text-white/55">تشغيل موحّد للوظائف والمحتوى والمال والصلاحيات.</p>
          </div>

          <nav className="space-y-6" aria-label="تنقل الإدارة">
            {ADMIN_NAV.map((group) => (
              <div key={group.title}>
                <p className="px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">{group.title}</p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = adminNavActive(item, pathname, search);
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-all ${
                          active
                            ? 'border border-brand/25 bg-brand/10 text-brand'
                            : 'border border-transparent text-white/55 hover:border-white/10 hover:bg-white/[0.035] hover:text-white'
                        }`}
                      >
                        <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                        <span className="flex-1">{item.label}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(47,100,214,0.85)]" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="grid grid-cols-2 gap-2">
            <Link to="/" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white">عرض الموقع</Link>
            <Link to="/profile" className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-xs font-bold text-white/65 transition hover:bg-white/[0.06] hover:text-white">الحساب</Link>
          </div>
        </div>
      </aside>

      <div className="lg:pr-[282px]">
        <div className="admin-mobilebar sticky top-0 z-40 border-b border-white/10 px-4 py-3 backdrop-blur-xl lg:hidden">
          <MobileAdminNav pathname={pathname} search={search} />
        </div>

        {title && (
          <header className="admin-topbar border-b border-white/10 bg-white/[0.025]">
            <div className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
              <span className="ez-eyebrow mb-2">{eyebrow}</span>
              <h1 className="text-2xl font-black text-ink sm:text-3xl">{title}</h1>
              {description && <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{description}</p>}
            </div>
          </header>
        )}

        <main>{children}</main>
      </div>
    </div>
  );
}

function MobileAdminNav({ pathname, search }: { pathname: string; search: string }) {
  const [open, setOpen] = useState(false);
  const items = ADMIN_NAV.flatMap((group) => group.items);
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <Link to="/admin" className="flex items-center gap-2">
          <div>
            <p className="font-display text-sm font-black text-ink">ezyjobs <span className="text-muted">/</span> Admin</p>
            <p className="text-[9px] uppercase tracking-[0.16em] text-muted">Control workspace</p>
          </div>
        </Link>
        <button
          type="button"
          aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
          className="ez-btn ez-btn-ghost !h-9 !w-9 !rounded-lg !p-0"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[61px] z-50 border-b border-line bg-[#0c0c12]/98 p-4 shadow-2xl backdrop-blur-xl">
          <nav className="grid gap-1 sm:grid-cols-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = adminNavActive(item, pathname, search);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold ${
                    active ? 'bg-brand-50 text-brand' : 'text-muted hover:bg-white/[0.03] hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
