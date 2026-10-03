import type { JobFilters, LanguageCode, WorkMode } from '../../types';
import {
  CATEGORIES,
  COMMITMENTS,
  COUNTRIES,
  ELIGIBILITY,
  EXPERIENCE_LEVELS,
  LANGUAGES,
  WORK_MODES,
} from '../../data/taxonomy';
import { Button, Select, Toggle } from '../ui/Primitives';

const opts = (list: { id: string; name: string }[], all: string) => [
  { value: 'all', label: all },
  ...list.map((x) => ({ value: x.id, label: x.name })),
];

interface Props {
  filters: JobFilters;
  onChange: (f: JobFilters) => void;
  onReset: () => void;
  resultCount: number;
  activeCount: number;
}

export default function JobFiltersPanel({
  filters,
  onChange,
  onReset,
  resultCount,
  activeCount,
}: Props) {
  const set = <K extends keyof JobFilters>(key: K, value: JobFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="ez-panel p-5 lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-sm font-bold text-ink">تصفية النتائج</h2>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="text-[12px] font-semibold text-brand transition-colors hover:text-brand-600"
          >
            مسح الكل (<span className="tnum">{activeCount}</span>)
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="ez-label">الدولة</span>
            <Select
              value={filters.country}
              onChange={(e) => set('country', e.target.value)}
              options={[
                { value: 'all', label: 'كل الدول' },
                ...COUNTRIES.map((c) => ({ value: c.code, label: c.name })),
              ]}
            />
          </label>

          <label className="block">
            <span className="ez-label">المجال</span>
            <Select
              value={filters.category}
              onChange={(e) => set('category', e.target.value)}
              options={opts(CATEGORIES, 'كل المجالات')}
            />
          </label>

          <label className="block">
            <span className="ez-label">نوع العمل</span>
            <Select
              value={filters.workMode}
              onChange={(e) => set('workMode', e.target.value as WorkMode | 'any')}
              options={opts(WORK_MODES, 'الكل')}
            />
          </label>

          <label className="block">
            <span className="ez-label">الدوام</span>
            <Select
              value={filters.commitment}
              onChange={(e) => set('commitment', e.target.value as JobFilters['commitment'])}
              options={opts(COMMITMENTS, 'الكل')}
            />
          </label>

          <label className="block">
            <span className="ez-label">مستوى الخبرة</span>
            <Select
              value={filters.experience}
              onChange={(e) => set('experience', e.target.value as JobFilters['experience'])}
              options={opts(EXPERIENCE_LEVELS, 'كل المستويات')}
            />
          </label>

          <label className="block">
            <span className="ez-label">اللغة</span>
            <Select
              value={filters.language}
              onChange={(e) => set('language', e.target.value as LanguageCode | 'any')}
              options={opts(LANGUAGES, 'أي لغة')}
            />
          </label>

          <label className="block">
            <span className="ez-label">الأهلية الجغرافية</span>
            <Select
              value={filters.eligibility}
              onChange={(e) => set('eligibility', e.target.value as JobFilters['eligibility'])}
              options={opts(ELIGIBILITY, 'الكل')}
            />
          </label>

          <label className="block">
            <span className="ez-label">الترتيب</span>
            <Select
              value={filters.sort}
              onChange={(e) => set('sort', e.target.value as JobFilters['sort'])}
              options={[
                { value: 'relevance', label: 'الأكثر ملاءمة' },
                { value: 'newest', label: 'الأحدث نشراً' },
                { value: 'salary-high', label: 'الأعلى راتباً' },
                { value: 'salary-low', label: 'الأدنى راتباً' },
              ]}
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            checked={filters.studentsOnly}
            onChange={(v) => set('studentsOnly', v)}
            label="فرص الطلاب فقط"
            hint="تدريب ودوام جزئي أثناء الدراسة"
          />
          <Toggle
            checked={filters.noExperienceOnly}
            onChange={(v) => set('noExperienceOnly', v)}
            label="بدون خبرة فقط"
            hint="لا تشترط سنوات عمل سابقة"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
        <span className="text-[12px] text-muted">
          <span className="tnum font-bold text-ink">{resultCount}</span> فرصة مطابقة
        </span>
        <Button variant="ghost" size="sm" onClick={onReset}>
          إعادة ضبط
        </Button>
      </div>
    </div>
  );
}
