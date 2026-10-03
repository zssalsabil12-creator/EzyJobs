import { resolve } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://ezyjobs.com';

const staticPages = [
  { loc: '/', priority: '1.0', alternates: [['ar', '/'], ['en', '/en/jobs'], ['fr', '/fr/emplois'], ['x-default', '/']] },
  { loc: '/jobs', priority: '0.95', alternates: [['ar', '/jobs'], ['en', '/en/jobs'], ['fr', '/fr/emplois'], ['x-default', '/en/jobs']] },
  { loc: '/en/jobs', priority: '0.9', alternates: [['ar', '/jobs'], ['en', '/en/jobs'], ['fr', '/fr/emplois'], ['x-default', '/en/jobs']] },
  { loc: '/fr/emplois', priority: '0.9', alternates: [['ar', '/jobs'], ['en', '/en/jobs'], ['fr', '/fr/emplois'], ['x-default', '/en/jobs']] },
  { loc: '/remote', priority: '0.9', alternates: [['ar', '/remote'], ['en', '/en/remote-jobs'], ['fr', '/fr/emploi-teletravail'], ['x-default', '/en/remote-jobs']] },
  { loc: '/en/remote-jobs', priority: '0.95', alternates: [['ar', '/remote'], ['en', '/en/remote-jobs'], ['fr', '/fr/emploi-teletravail'], ['x-default', '/en/remote-jobs']] },
  { loc: '/fr/emploi-teletravail', priority: '0.95', alternates: [['ar', '/remote'], ['en', '/en/remote-jobs'], ['fr', '/fr/emploi-teletravail'], ['x-default', '/en/remote-jobs']] },
  { loc: '/students', priority: '0.85' },
  { loc: '/no-experience', priority: '0.85' },
  { loc: '/guides', priority: '0.8' },
  { loc: '/tools', priority: '0.75' },
  { loc: '/about', priority: '0.6' },
  { loc: '/student-writer', priority: '0.85' },
];

const countries = [
  'algeria','morocco','tunisia','egypt','saudi-arabia','uae','kuwait','qatar',
  'bahrain','oman','jordan','lebanon','palestine','iraq','syria','yemen',
  'sudan','libya','mauritania','somalia','djibouti','comoros'
];

const fields = [
  'data','customer-support','marketing','design','development','writing',
  'teaching','finance','sales','human-resources','operations'
];

const keywordSnapshot = JSON.parse(readFileSync(resolve(process.cwd(), 'public/keyword-intelligence.json'), 'utf8'));
const keywordRows = keywordSnapshot.keywords || [];
const jobSnapshot = JSON.parse(readFileSync(resolve(process.cwd(), 'public/jobs.json'), 'utf8'));
const activeJobs = (Array.isArray(jobSnapshot) ? jobSnapshot : [])
  .filter((job) => job && job.status === 'published' && job.eligibility !== 'closed' && job.slug);

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const normalizeDate = (value) => {
  if (!value) return undefined;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return undefined;
  return new Date(time).toISOString();
};

const row = (loc, priority, alternates = [], lastmod) => [
  '  <url>',
  '    <loc>' + escapeXml(SITE + loc) + '</loc>',
  lastmod ? '    <lastmod>' + escapeXml(lastmod) + '</lastmod>' : '',
  '    <priority>' + priority + '</priority>',
  ...alternates.map(([lang, url]) =>
    '    <xhtml:link rel="alternate" hreflang="' + lang + '" href="' + escapeXml(SITE + url) + '" />'
  ),
  '  </url>',
].filter(Boolean).join('\n');

const urls = [];

for (const page of staticPages) {
  urls.push(row(page.loc, page.priority, page.alternates || []));
}

urls.push(...countries.map((slug) => row('/country/' + slug, '0.75')));
urls.push(...fields.map((slug) => row('/field/' + slug, '0.75')));

const coreKeywords = new Set([
  'remote jobs',
  'online jobs',
  'work from home jobs',
  'وظائف عن بعد',
  'وظائف اونلاين',
  'emploi en ligne',
  'emploi télétravail',
]);

const featuredKeywordUrls = keywordRows.filter(
  (item) => coreKeywords.has(String(item.keyword).toLowerCase()) && item.jobMatches > 0
);
const rankedKeywordUrls = keywordRows
  .filter((item) => item.demandScore >= 38 && item.jobMatches > 0)
  .sort((a, b) => b.demandScore - a.demandScore)
  .filter((item) => !featuredKeywordUrls.some((featured) => featured.keyword === item.keyword));

const keywordUrls = [...featuredKeywordUrls, ...rankedKeywordUrls].slice(0, 24);

urls.push(...keywordUrls.map((item) => {
  const slug = String(item.keyword)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

  return row('/search/' + slug, '0.82');
}));

for (const job of activeJobs) {
  const slug = job.slug;
  const lastmod = normalizeDate(job.verifiedAt || job.publishedAt);
  const ar = '/jobs/' + slug;
  const en = '/en/jobs/' + slug;
  const fr = '/fr/jobs/' + slug;
  const alt = [['ar', ar], ['en', en], ['fr', fr], ['x-default', en]];

  urls.push(row(ar, '0.8', alt, lastmod));
  urls.push(row(en, '0.8', alt, lastmod));
  urls.push(row(fr, '0.8', alt, lastmod));
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urls,
  '</urlset>',
  '',
].join('\n');

writeFileSync(resolve(process.cwd(), 'public', 'sitemap.xml'), xml, 'utf8');
console.log('sitemap.xml written — ' + urls.length + ' urls');
console.log('active published jobs — ' + activeJobs.length);
