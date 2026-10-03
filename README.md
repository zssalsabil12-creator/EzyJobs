# EzyJobs

منصة عربية للبحث عن الوظائف عن بُعد والفرص المرنة، مع ترجمة وتبسيط الإعلانات، توضيح الأهلية والمتطلبات، وإحالة المستخدم إلى مصدر التقديم الأصلي.

## التقنية

- React 18 + TypeScript
- Vite 6
- React Router
- Tailwind CSS
- Supabase
- SSR/prerender للصفحات القابلة للفهرسة

## التشغيل محلياً

```bash
npm ci
npm run dev
```

## فحص الإصدار

```bash
npm run release-check
```

يشغّل الفحص TypeScript ثم production build/prerender ثم smoke tests.

## متغيرات البيئة

انسخ `.env.example` إلى `.env` وأضف إعدادات Supabase العامة المطلوبة. ملف `.env` مستثنى من Git ولا يجب رفعه إلى المستودع.

## النشر

المشروع مهيأ للنشر كواجهة Vite ثابتة، مع إعدادات Vercel موجودة في المشروع. راجع `PUBLISHING.md` لتسلسل النشر والإعدادات الإنتاجية.

## الحالة الحالية

آخر فحص إصدار ناجح: TypeScript + production build + prerender + smoke tests (55/55).
