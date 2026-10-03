import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell, Badge, Button } from '../components/ui/Primitives';
import { Notice, Spinner } from '../components/ui/Feedback';
import { adminRepo, type SiteSetting } from '../lib/adminRepo';
import { usePageMeta } from '../lib/seo';

type Group = { title: string; keys: string[] };

const GROUPS: Group[] = [
  { title: 'الصفحة الرئيسية', keys: ['home_', 'announcement', 'header_tagline', 'footer_tagline', 'footer_note'] },
  { title: 'التنقل والرأس', keys: ['nav_', 'footer_'] },
  { title: 'SEO والنشر', keys: ['seo_', 'jobs_page_copy', 'search_opportunity_', 'job_detail_'] },
  { title: 'الحساب والتجربة', keys: ['auth_', 'alerts_', 'applications_', 'profile_', 'saved_', 'application_kit_'] },
  { title: 'الربح والإعلانات', keys: ['ads_', 'creator_', 'airtm_', 'social_'] },
  { title: 'المحتوى العام', keys: ['about_', 'terms_', 'privacy_', 'usage_policy_', 'not_found_', 'demand_', 'tools_'] },
];

function groupFor(key: string) {
  return GROUPS.find((g) => g.keys.some((prefix) => key === prefix || key.startsWith(prefix)))?.title ?? 'إعدادات أخرى';
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  usePageMeta({ title: 'إعدادات الإدارة | ezyjobs', noIndex: true });

  const load = async () => {
    setLoading(true);
    const result = await adminRepo.listSettings();
    setSettings(result.data);
    setMessage(result.error ? { tone: 'error', text: result.error } : null);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? settings.filter((s) => s.key.toLowerCase().includes(q) || s.value.toLowerCase().includes(q))
      : settings;
  }, [settings, query]);

  const save = async (setting: SiteSetting, value: string) => {
    setSavingKey(setting.key);
    const result = await adminRepo.saveSetting(setting.key, value, setting.isPublic);
    setSavingKey(null);
    setMessage(result.ok
      ? { tone: 'success', text: 'تم حفظ «' + setting.key + '».' }
      : { tone: 'error', text: result.error ?? 'تعذر الحفظ.' });
    if (result.ok) {
      setSettings((current) => current.map((s) => s.key === setting.key ? { ...s, value, updatedAt: new Date().toISOString() } : s));
    }
  };

  const add = async () => {
    const key = newKey.trim();
    if (!key) return;
    setSavingKey('__new__');
    const result = await adminRepo.saveSetting(key, newValue, true);
    setSavingKey(null);
    if (!result.ok) {
      setMessage({ tone: 'error', text: result.error ?? 'تعذر إضافة الإعداد.' });
      return;
    }
    setNewKey('');
    setNewValue('');
    setMessage({ tone: 'success', text: 'تمت إضافة «' + key + '».' });
    await load();
  };

  const grouped = useMemo(() => {
    const map = new Map<string, SiteSetting[]>();
    for (const setting of filtered) {
      const title = groupFor(setting.key);
      const list = map.get(title) ?? [];
      list.push(setting);
      map.set(title, list);
    }
    return [...map.entries()];
  }, [filtered]);

  return (
    <AdminShell
      title="إعدادات المنصة"
      eyebrow="PLATFORM CONTROL"
      description="تحكم مركزي في النصوص والإعلانات والتنقل وSEO والربح، بدون تبويبات مخفية."
    >
      <main className="mx-auto max-w-[1500px] px-5 py-6 lg:px-10 lg:py-8">
        {message && <div className="mb-5"><Notice tone={message.tone}>{message.text}</Notice></div>}

        <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="ez-eyebrow">CONTROL CENTER</span>
                <h2 className="mt-1 text-xl font-black text-ink">إعدادات قابلة للبحث والتحكم</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{settings.length} إعدادًا محفوظًا · عدّل القيمة ثم احفظها في نفس البطاقة.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/admin/pages" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">صفحات الموقع</Link>
                <Link to="/admin/guides" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">الأدلة</Link>
                <Link to="/" className="ez-btn ez-btn-ghost px-4 py-2.5 text-sm">عرض الموقع</Link>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-brand/20 bg-brand/10 p-5 lg:w-72">
            <p className="text-xs font-bold text-brand-700">تذكير تشغيلي</p>
            <p className="mt-2 text-sm leading-6 text-ink">القيم العامة التي تدعمها الواجهة تنعكس مباشرة على الموقع بعد الحفظ.</p>
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ez-input w-full flex-1"
              placeholder="ابحث باسم الإعداد أو جزء من قيمته..."
            />
            <Badge tone={query ? 'brand' : 'neutral'}>{filtered.length} نتيجة</Badge>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <span className="ez-eyebrow">NEW SETTING</span>
              <h3 className="mt-1 text-lg font-black text-ink">إضافة إعداد جديد</h3>
              <p className="mt-1 text-xs leading-6 text-muted">استخدم مفتاحًا واضحًا بنمط snake_case. الإعدادات المدعومة من الواجهة فقط هي التي ستؤثر على الموقع تلقائيًا.</p>
            </div>
            <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
              <input value={newKey} onChange={(e) => setNewKey(e.target.value)} dir="ltr" className="ez-input" placeholder="example_key" />
              <input value={newValue} onChange={(e) => setNewValue(e.target.value)} className="ez-input" placeholder="القيمة" />
            </div>
            <Button disabled={savingKey === '__new__' || !newKey.trim()} onClick={() => void add()}>
              {savingKey === '__new__' ? 'جارٍ الإضافة' : 'إضافة'}
            </Button>
          </div>
        </section>

        {loading ? (
          <div className="ez-panel p-14 text-center"><Spinner /></div>
        ) : grouped.length ? (
          <div className="space-y-8">
            {grouped.map(([title, items]) => (
              <section key={title}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <span className="ez-eyebrow">SETTINGS</span>
                    <h2 className="mt-1 text-xl font-black text-ink">{title}</h2>
                  </div>
                  <Badge tone="neutral">{items.length}</Badge>
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                  {items.map((setting) => (
                    <SettingCard key={setting.key} setting={setting} saving={savingKey === setting.key} onSave={save} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="ez-panel p-14 text-center">
            <p className="text-base font-black text-ink">لا توجد نتائج مطابقة</p>
            <p className="mt-2 text-sm text-muted">جرّب كلمة أقصر أو امسح البحث لعرض جميع الإعدادات.</p>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

function SettingCard({
  setting,
  saving,
  onSave,
}: {
  setting: SiteSetting;
  saving: boolean;
  onSave: (setting: SiteSetting, value: string) => Promise<void>;
}) {
  const [value, setValue] = useState(setting.value);

  useEffect(() => {
    setValue(setting.value);
  }, [setting.value]);

  const dirty = value !== setting.value;

  return (
    <article className="ez-panel overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-black text-ink">{prettyLabel(setting.key)}</h3>
            <p className="mt-1 truncate font-mono text-[10px] text-brand/75">{setting.key}</p>
          </div>
          <Badge tone={dirty ? 'caution' : 'neutral'}>{dirty ? 'غير محفوظ' : 'محفوظ'}</Badge>
        </div>
      </div>
      <div className="p-5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={setting.value.length > 260 ? 7 : 4}
          className="ez-input w-full resize-y"
          dir={looksLikeUrl(setting.value) ? 'ltr' : undefined}
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[10px] text-muted">آخر تعديل: {setting.updatedAt ? new Date(setting.updatedAt).toLocaleString('ar-DZ') : '—'}</p>
          <Button size="sm" disabled={saving || !dirty} onClick={() => void onSave(setting, value)}>
            {saving ? 'جارٍ الحفظ' : 'حفظ التغيير'}
          </Button>
        </div>
      </div>
    </article>
  );
}

function prettyLabel(key: string) {
  const known: Record<string, string> = {
    announcement: 'شريط الإعلان',
    home_headline: 'العنوان الرئيسي',
    home_lead: 'وصف الصفحة الرئيسية',
    home_search_placeholder: 'نص البحث',
    nav_primary: 'روابط التنقل الرئيسية',
    nav_mobile_secondary: 'روابط التنقل للهاتف',
    header_tagline: 'الشعار النصي في الرأس',
    footer_tagline: 'الشعار النصي في التذييل',
    seo_site_title: 'عنوان SEO',
    seo_site_description: 'وصف SEO',
    ads_enabled: 'تفعيل الإعلانات',
    adsense_client: 'AdSense Client ID',
    creator_program_enabled: 'تفعيل EzyPublish',
    creator_default_share_bps: 'حصة الكاتب',
    airtm_referral_url: 'رابط Airtm',
  };
  return known[key] ?? key.split('_').join(' ');
}

function looksLikeUrl(value: string) {
  return /^(https?:\/\/|ca-pub-|[a-z0-9-]+\.)/i.test(value.trim());
}

