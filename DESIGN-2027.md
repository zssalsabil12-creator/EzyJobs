# FREEBUFF 2027 DESIGN SYSTEM

> التصميم الشمولي للمنصة. نطاق الترجمة: الألوان، الأنماط، الوحدات، الخطوط، الحركة، والصور الجاهزة.
> الهدف: "2027 SMOOTH SCROLL 3D Animated website" — تنقل سلس، عناصر متحركة 3D، وفاعلية عالية.

## 📐 1. اللون (Color)

| الاسم | القيمة | الاستخدام |
|---|---|---|
| --color-sky-50 | #eef6ff | خلفية الهERO (سماء فاتحة) |
| --color-sky-100 | #dce9ff | تدرج السماء الخلفي |
| --color-sky-200 | #b8d2f0 | خطوط مشتقة |
| --color-cyan | #0055FF | الأساسي (أزرق Vita)، زر، تسطير، عناصر نشطة |
| --color-cyan-600 | #003dbf | أزرار وروابط مظلمة |
| --color-ink | #111827 | العناوين الأساسي (أسود كahi) |
| --color-ink-2 | #1e293b | أوضاعdark |
| --color-body | #3f4a5e | نص الجسم المتوسط |
| --color-body-2 | #6b7280 | نص تذييل/مساعدة |
| --color-line | rgba(17,24,39,.10) | خط فاصل رمادي |
| --color-glass | #ffffff | ألواح زجاجية شفافة |
| --color-glass-2 | rgba(255,255,255,.85) | زجاج خفيف |
| --color-mint | #0d9488 | ثمار/نجاح (شارة، حالة إيجابية) |
| --color-mint-soft | rgba(13,148,136,.08) | خلفية شفافة للإيجابية |
| --color-gold | #f59e0b | إشارة لمؤشرات القوة |
| --color-amber | #d97706 | تنبيهاتmoderated |
| --color-rose | #f43f5e | تنبيه عاجل (أخطاء) |

## 🎨 2. الملمس والسطوح (Surface / Glass)

- **ألواح زجاجية** `glass-panel`: خلفية شفافة + `backdrop-filter: blur(14px)` + حد باهت + ظل ناعم.
- **بطاقات منتقيات** `card`: حواف دائرية (16px–20px) + ظل خفيف + لمسة ترتفع عند hover.
- **تدرج شفاف** خلف النصوص الرئيسية في Hero: دقيق، لا يمس وضوح النص.
- **مساحات بيضاء خفيفة** للقسم التالي للكتابة (لا تملأ كل شيء بالشفافية).

## 🔤 3. الخطوط (Typography)

- **العربية:** `Tajawal` (المتاح حالياً في الصورة pulledgoogle) — للعناوين والجسم.
- **العربية الميسرة:** `Cairo` / `Tajawal` بوزن 600–700 للعناوين.
- **الإنجليزية/الأرقام:** `Space Grotesk` (عنوان رئيسي متميز، كـ display).
- **نص برنامج أو كود:** `JetBrains Mono` / `Fira Code` (اختياري).
- **وحدات خطية:** `1rem = 16px`، `1rem = 16px` في الأساس.

## 📐 4. الهيكل والوحدات (Layout & Spacing)

- أنماط تدرج متدرجة للمساحة: `py-16 → py-20 → py-28`.
- أقصى عرض للصفحة `max-w-[1440px]` أو `max-w-[1380px]` متفرع حسب الصفحة.
- `gap-6/8/10/12` لطيفي، `gap-4` للبطاقات الصغيرة.
- `mx-auto` لتوسيط المحتوى دائماً.
- `grid` / `flex` مع قانون `1fr` أو `repeat(auto-fit, minmax(...))`.
- ارتفاع الشاشة الكامل للهERO والسكيما الرأسي: `min-height: 920px` أو `min-height: 100svh` حسب الفيديو.

## 🌈 5. الوحدات القابلة لإعادة الاستخدام (Components)

### 5.1 زر (Button)
- `btn-primary`: أزرق Vita `#0055FF`، حافة دائرية (999px)، نص أبيض، ظل ناعم.
- `btn-ghost`: هامشي مع حدود باهت، hover reveals accent.
- `btn-outline`: حدود فاتحة، نص داكن، hover bg.
- `btn-icon`: أيقونة مع مساحة تفاعل كاملة.
- `btn-sm / btn-md / btn-lg` للمساحة.

### 5.2 بطاقة وظيفة (Job Card)
- ترويسة: السمعة + مرشح دائري وطابعها مع سهم أو تلميح hover.
- العنوان: `text-xl font-semibold` مع hover لا لون.
- وصف: سطرين أو 3، `text-body` مع سطر 1.6.
- شارات صغيرة (منصة، مجال، لغة، عمل عن بُعد) في رد الفعل السفلي.
- نتيجة الملاءمة `match`: بيضة دائرية مع رقم، لمسة تلميح على hover.
- زر "عرض الفرصة" نحو الأعلى، `btn-primary` ملون.

### 5.3 شريط بحث Hero (Search bar)
- حاوية بيضاء شفافة مع ظل، حواف دائرية، حقول إدخال غير واضحة.
- أيقونات مقدمة على كل حقل.
- زر بحث رئيسي ملون، عند hover يظهر مؤشر ضوء "shine".
- شريحة ملصقات "قريبة" سفلية، clickable.

### 5.4 شريط علوي (Header)
- علامة "EzyJobs" + أيقونة دائرية/مخروطية (روبوت ذكي أو نجمة، أو حروف مكشوفة).
- روابط بالجوار: Jobs، Remote، Students، Career Tools، أساسية، مع تلميح خط أمامي عند التمرير.
- أيقونة بحث + "تسجيل الدخول" و"إنشاء حساب" (أزرار).

### 5.5 معلومات الإحصائيات (Stats)
- 3 أعمدة: أيقونة، رقم كبير (animate count up)، وصف.
- `250K+`، `120+`، `35K+` — تظهر بترتيب تدريجي + `count-up` animation.

### 5.6 قسم العروض (Explore)
- عنوان سريع + وصف؟
- سهم أيسر/أيمن للتنقل، وصف/بطاقات.
- بطاقات فئات: Technology (أزرق)، Business (أخضر)، Creative (بنفسجي)، Support (أزرق).
- 3D crystal/ring graphic لكل بطاقة، `animate-spin` بطيئة ومتناوبة.

## 🚀 6. الحركة والترجمة (Motion System)

- `scroll-behavior: smooth` للوحة.
- الانتقالات البطيئة للبطاقات: `duration-300`، وحركات `translateY` عند hover.
- `animate-fade-up`, `animate-parallax`, `animate-marquee`, `animate-spin-slow`, `animate-glow`.
- **Scroll-triggered reveal:** عناصر تظهر مع `offset` (IntersectionObserver) — `data-reveal`, `.reveal` مع `opacity` و`translateY`.
- **3D spatial stage:** العناصر بأوجه 3D `translateZ`، `perspective`, `transform-style: preserve-3d`.
- انعكاسات خفيفة (mouse-move on hero).
- تفعيل الليمبي في `prefers-reduced-motion`.
- أنماط لرؤية الشريط: خط أمامي، وهم "scroll indicator".

## 🧩 7. الأيقونات (Icons)
- متجه (Lucide / Heroicons) دائري/مضغوط.
- أيقونة لكل: بحث، موضوع، مصدر، التسجيل، الدخول، الإنجاز.
- أيقونات بأحجام `h-4 w-4`، `h-5 w-5`، `h-6 w-6`.
- موحّد اللون بواسطة `currentColor`.

## 📱 8. المتجاوبة (Responsive)
- `min-width: 375px` غالباً: `__mobile` variant.
- `lg:` + `xl:` للشاشات المتوسطة والكبيرة.
- `max-width: 768px` للفيديوهات والبطاقات.
- `min-height: 100svh` للهERO، والدخول، والباقي.

## 🌙 9. السمة الداكنة (Dark mode)
- متغيرات `--color-ink-2`, `--color-body-2`, `--color-glass-2`, `--color-line-2`، `--color-sky-50` → `bg-[#0f172a]`.
- تنشيط عبر `prefers-color-scheme` مع `data-theme="dark"`.

## 🟩 10. المصادر والدعم
- `public/vite.svg` أو `public/logo.svg` — أيقونة الجافا سكريبت.
- `src/assets/` — صور مكررة (شخص، روبوت، خلفية).
- الخطوط الممكنة لاستخدامها: `Tajawal` + `Space Grotesk` (ryebrew).

## 🗓️ 11. جدول التسليم (phases)
1. **Phase 0 — مجرد (Design tokens)**: CSS variables + fonts + reset.
2. **Phase 1 — Hero**: hero + search bar + mascot OR إنشاءك.
3. **Phase 2 — Header & Footer** مع توزيع راجع للروابط، إضافة `slash-command` palette.
4. **Phase 3 — Stats + categories + explore**.
5. **Phase 4 — حركة.scroll + reveal + 3D الإحصائيات والبطاقات**.
6. **Phase 5 — التنسيق التفصيلي** (مظهر الكل + خاصية الجهاز).

## 🔒 12. القيود
- الصور المستقلة: لا تملأ ما يزيد عن 120 كيلو بايت لكل في ملف واحد.
- نیازی به استقلال بسته‌ای برای skeleton loading و عندها.
- الوصول للشبكة فقط للـ API وعدم حفظ كل شيء على القرص المعد.
- استعمال	element `canvas` للخرائط والرسوم المتحركة (متابعة `Loading`، `OffscreenCanvas` إذا أردت).

## ✓ 13. Acceptance criteria
- [x] تتسق كل واجهات مع التصميم المعروض (الشكل والنص) — الإجابة موجودة.
- [x] `npm run build` و `npm run check` pass (بعد التطبيق).
- [x] لا توجد متغيرات CSS غير معرّفة تستخدم في الـ HTML.
- [x] لا توجد أيقونات أو نماذج مميزة تترك "loose ends" في المتصفح.

---
*Version: 1.0 — تم صياغة هذا التصميم على أساس المرفق المرئي المرفق في الرسالة.*
