import { useMemo } from 'react';
import type { Job, LanguageCode, SeekerProfile } from '../../types';
import { CATEGORIES, COMMITMENTS, COUNTRIES } from '../../data/taxonomy';
import { Button, Field, Select, TagInput, Toggle } from '../../components/ui/Primitives';
import { matchJob } from '../../lib/match';
import { useProfile } from './ProfileContext';

const SKILL_SUGGESTIONS = [
  'الكتابة العربية',
  'خدمة العملاء',
  'الإنجليزية',
  'إدخال بيانات',
  'التصميم',
  'Figma',
  'SEO',
  'الترجمة',
  'إدارة مشاريع',
  'الجداول',
  'التسويق الرقمي',
  'كتابة المحتوى',
];

const SKILL_HINT = 'اضغط Enter بعد كل مهارة';

const LEVELS: { value: SeekerProfile['level']; label: string }[] = [
  { value: 'student', label: 'طالب أثناء الدراسة' },
  { value: 'entry', label: 'مبتدئ / خريج جديد' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'خبرة متوسطة' },
];

const LANG_OPTIONS: { value: LanguageCode; label: string }[] = [
  { value: 'ar', label: 'العربية' },
  { value: 'en', label: 'الإنجليزية' },
  { value: 'fr', label: 'الفرنسية' },
  { value: 'es', label: 'الإسبانية' },
];

const PROFICIENCY_OPTIONS = [
  { value: 'native', label: 'لغة أم' },
  { value: 'fluent', label: 'إتقان' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'basic', label: 'مبتدئ' },
] as const;

/** نموذج مبسّط لملف الباحث — يحوّل المدخلات إلى درجة ملاءمة لكل وظيفة. */
export default function ProfileBuilder({ jobs }: { jobs: Job[] }) {
  const { profile, setProfile, reset } = useProfile();
  const set = <K extends keyof SeekerProfile>(k: K, v: SeekerProfile[K]) =>
    setProfile({ ...profile, [k]: v });

  const ranked = useMemo(
    () =>
      jobs
        .map((job) => ({ job, match: matchJob(job, profile) }))
        .filter((x) => x.match.verdict !== 'blocked')
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 5),
    [jobs, profile],
  );

  const toggleIn = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  return (
    <div className="ez-panel overflow-hidden">
      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_1fr] lg:p-8">
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-black text-ink">ماذا تبحث عنه؟</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              حدّد وضعك، وسيحسب لك ezyjobs ملاءمة كل فرصة ويشرح لك النتيجة.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="الدولة">
              <Select
                value={profile.country}
                onChange={(e) => set('country', e.target.value)}
                options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
              />
            </Field>

            <Field label="مستواك">
              <Select
                value={profile.level}
                onChange={(e) => set('level', e.target.value as SeekerProfile['level'])}
                options={LEVELS}
              />
            </Field>
          </div>

          <Toggle
            checked={profile.remoteOnly}
            onChange={(v) => set('remoteOnly', v)}
            label="أريد العمل عن بُعد فقط"
            hint="سيتم استبعاد الوظائف التي تتطلب حضوراً"
          />

          <div>
            <span className="ez-label">أنواع الدوام التي تهمّك</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {COMMITMENTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set('commitments', toggleIn(profile.commitments, c.id))}
                  className={`ez-btn px-4 py-2 text-[13px] ${
                    profile.commitments.includes(c.id)
                      ? 'ez-btn-primary'
                      : 'ez-btn-ghost'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="ez-label">لغاتك</span>
            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              {LANG_OPTIONS.map((l) => {
                const current = profile.languages.find((x) => x.code === l.value);
                return (
                  <label key={l.value} className="flex items-center gap-2 text-[13px]">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand"
                      checked={Boolean(current)}
                      onChange={(e) =>
                        set(
                          'languages',
                          e.target.checked
                            ? [
                                ...profile.languages,
                                { code: l.value, level: 'intermediate' },
                              ]
                            : profile.languages.filter((x) => x.code !== l.value),
                        )
                      }
                    />
                    <span className="text-ink">{l.label}</span>
                    {current && (
                      <select
                        value={current.level}
                        onChange={(e) =>
                          set(
                            'languages',
                            profile.languages.map((x) =>
                              x.code === l.value
                                ? {
                                    ...x,
                                    level: e.target
                                      .value as SeekerProfile['languages'][number]['level'],
                                  }
                                : x,
                            ),
                          )
                        }
                        className="mr-auto rounded-lg border border-line px-2 py-1 text-[12px]"
                      >
                        {PROFICIENCY_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          <Field label="مهاراتك الحالية" hint={SKILL_HINT}>
            <TagInput
              values={profile.skills}
              onChange={(v) => set('skills', v)}
              placeholder="مثال: الكتابة العربية، خدمة العملاء"
              suggestions={SKILL_SUGGESTIONS}
            />
          </Field>

          <div>
            <span className="ez-label">المجالات التي تهمّك</span>
            <div className="mt-1 flex flex-wrap gap-2">
              {CATEGORIES.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => set('categories', toggleIn(profile.categories, c.id))}
                  className={`ez-btn px-3.5 py-1.5 text-[12.5px] ${
                    profile.categories.includes(c.id) ? 'ez-btn-primary' : 'ez-btn-ghost'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <Field label="الوقت المتاح أسبوعياً" hint="بالساعات">
            <input
              type="number"
              min={2}
              max={60}
              value={profile.hoursPerWeek ?? 20}
              onChange={(e) => set('hoursPerWeek', Number(e.target.value) || undefined)}
              className="ez-input"
            />
          </Field>

          <Button variant="ghost" size="sm" onClick={reset}>
            إعادة الضبط
          </Button>
        </div>

        <div className="rounded-2xl bg-abyss p-6 text-white lg:p-7">
          <p className="text-[11px] font-bold tracking-[0.18em] text-accent">
            الأفضل لك
          </p>
          <h3 className="mt-3 text-xl font-bold leading-snug">
            حسب ملفك، هذه أكثر <span className="text-accent">5</span> فرص ملائمة
          </h3>

          {ranked.length === 0 ? (
            <p className="mt-6 text-sm text-white/50">
              لا توجد فرص مطابقة حالياً. جرّب توسيع الدوام أو إزالة قيد اللغة.
            </p>
          ) : (
            <ol className="mt-6 space-y-3">
              {ranked.map(({ job, match }, i) => (
                <li key={job.id} className="rounded-xl bg-white/[0.06] p-4">
                  <div className="flex items-start gap-3">
                    <span className="tnum mt-0.5 font-display text-lg font-bold text-accent">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-snug">{job.titleAr}</p>
                      <p className="mt-0.5 text-[12px] text-white/50">{job.company}</p>
                      <p className="mt-2 text-[12.5px] leading-relaxed text-white/70">
                        {match.pros[0] ?? match.notes[0] ?? 'راجع التفاصيل قبل التقديم.'}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold">
                          <span className="tnum">{match.score}</span> / 100
                        </span>
                        {match.cons[0] && (
                          <span className="truncate text-[11px] text-white/40">
                            {match.cons[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
