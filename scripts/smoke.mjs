/**
 * فحص رندر: يبني التطبيق كوحدة SSR ويصيّر كل مسار للتأكد
 * من عدم وجود انهيار أو صفحة فارغة.
 *
 *   npm run smoke
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { build } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const root = process.cwd();
const outDir = resolve(root, '.smoke');

const server = await build({
  root,
  logLevel: 'error',
  build: {
    ssr: 'src/__ssr.tsx',
    outDir,
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
void server;

try {
  const entry = resolve(outDir, '__ssr.js');
  const mod = await import(pathToFileURL(entry).href);

  const liveJob = Array.isArray(mod.allJobs) && mod.allJobs[0] ? mod.allJobs[0] : null;
  const keywordRoutes = Array.isArray(mod.routes) ? mod.routes.filter((route) => route.startsWith('/search/')).slice(0, 3) : [];
  const liveJobChecks = liveJob
    ? [
        ['/jobs/' + liveJob.slug, [liveJob.company, liveJob.titleOriginal]],
        ['/en/jobs/' + liveJob.slug, [liveJob.company, liveJob.titleOriginal]],
        ['/fr/jobs/' + liveJob.slug, [liveJob.company, liveJob.titleOriginal]],
        ['/applications/' + liveJob.id + '/kit', ['جارٍ التحقق من الجلسة']],
      ]
    : [];

  const checks = [
    ['/', ['EzyJobs', 'LIVE INDEX SIGNALS']],
    ['/jobs', ['تصفية', 'المجال']],
    ['/students', ['الطلاب']],
    ['/no-experience', ['خبرة']],
    ['/remote', ['بُعد']],
    ['/en/remote-jobs', ['Remote Jobs Worldwide', 'geographic eligibility']],
    ['/fr/emploi-teletravail', ['Emplois en télétravail', 'éligibilité géographique']],
    ['/en/jobs', ['Online', 'Explore jobs']],
    ['/fr/emplois', ['Emplois en ligne et à distance', 'Explorez les offres']],
    ['/demand', ['ezyjobs / demand intelligence', 'ما الذي يبحث']],
    ['/en/job-search-trends', ['What people are searching for', 'High-demand']],
    ['/fr/tendances-emploi', ['Ce que les internautes recherchent', 'Requêtes']],
    ['/country/algeria', ['الجزائر', 'وظائف عن بعد']],
    ['/country/DZ', ['الجزائر', 'وظائف عن بعد']],
    ['/field/customer-support', ['خدمة عملاء']],
    ['/jobs/does-not-exist', ['لم نجد']],
    ['/guides', ['المقالات']],
    ['/articles', ['المعرفة التي تقرّبك من أول تقديم', 'كل المقالات']],
    ['/articles/remote-jobs-for-beginners', ['عن بُعد']],
    ['/guides/remote-jobs-for-beginners', ['عن بُعد']],
    ['/tools', ['أدوات']],
    ['/tools/cv', ['السيرة الذاتية']],
    ['/tools/ats', ['التوافق']],
    ['/tools/interview', ['مقابلة']],
    ['/saved', ['المحفوظة']],
    ['/alerts', ['تنبيه']],
    ['/applications', ['جارٍ التحقق من الجلسة']],
    ['/profile', ['جارٍ التحقق من الجلسة']],
    ['/about', ['من نحن', 'مصادر الوظائف']],
    ['/student-writer', ['وظيفة أونلاين للطلبة', 'أجر ثابت']],
    ['/tasks', ['جارٍ التحقق من الجلسة']],
    ['/terms', ['الشروط والأحكام', 'الإفصاح عن الروابط التابعة']],
    ['/privacy', ['سياسة الخصوصية', 'بيانات الاستخدام']],
    ['/usage-policy', ['سياسة الاستخدام', 'الاستخدامات الممنوعة']],
    ['/login', ['اسم المستخدم', 'تسجيل الدخول']],
    ['/register', ['إنشاء']],
    ['/dashboard', ['جارٍ التحقق من الجلسة']],
    ['/publish', ['جارٍ التحقق من الجلسة']],
    ['/publish/does-not-exist', ['جارٍ تحميل المقال']],
    ['/admin/creators', ['جارٍ التحقق من الجلسة']],
    ['/admin/tasks', ['جارٍ التحقق من الجلسة']],
    ['/admin/finance', ['جارٍ التحقق من الجلسة']],
    ['/admin/pages', ['جارٍ التحقق من الجلسة']],
    ['/admin/guides', ['جارٍ التحقق من الجلسة']],
    ['/admin/settings', ['جارٍ التحقق من الجلسة']],
    ['/page/does-not-exist', ['404']],
    ['/zzz-unknown', ['404']],
  ];
  checks.push(...liveJobChecks);
  for (const route of keywordRoutes) checks.push([route, ['ezyjobs']]);

  let failed = 0;
  const rows = [];

  for (const [url, needles] of checks) {
    try {
      const html = mod.render(url);
      const missing = needles.filter((n) => !html.includes(n));
      const empty = html.length < 2000;
      const bad = missing.length > 0 || empty;
      if (bad) failed++;
      rows.push(
        `${bad ? 'FAIL' : 'ok  '}  ${url.padEnd(44)} ${String(html.length).padStart(7)}` +
          (missing.length ? `  missing: ${missing.join(', ')}` : '') +
          (empty ? '  EMPTY' : ''),
      );
    } catch (e) {
      failed++;
      rows.push(`ERR   ${url.padEnd(44)} ${e?.message ?? e}`);
    }
  }

  // كل مسارات التطبيق يجب أن تُصيَّر دون انهيار
  const routeCount = Array.isArray(mod.routes) ? mod.routes.length : 0;
  let processedRoutes = 0;
  rows.push('ROUTE_COUNT ' + routeCount);
  for (const url of mod.routes) {
    processedRoutes++;
    try {
      const html = mod.render(url);
      if (html.length < 2000) {
        failed++;
        rows.push(`THIN  ${url.padEnd(44)} ${html.length}`);
      }
    } catch (e) {
      failed++;
      rows.push(`ERR   ${url.padEnd(44)} ${e?.message ?? e}`);
    }
  }

  writeFileSync(resolve(outDir, 'report.txt'), rows.join('\n'));
  console.log(rows.join('\n'));
  console.log(`\n${failed === 0 ? 'PASS' : 'FAIL'} — ${rows.length - failed}/${rows.length}`);
  if (failed > 0) process.exitCode = 1;
} finally {
  // لا نحذف المجلد: بعض أنظمة الملفات على Windows تُقفل الملفات فوراً
  try {
    mkdirSync(outDir, { recursive: true });
  } catch {
    /* تجاهل */
  }
}
