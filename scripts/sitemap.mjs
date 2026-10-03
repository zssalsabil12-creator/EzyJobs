import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SITE = 'https://ezyjobs.com';

const staticUrls = [
  ['/', '1.0'],
  ['/jobs', '0.95'],
  ['/remote', '0.9'],
  ['/en/jobs', '0.9'],
  ['/fr/emplois', '0.9'],
  ['/en/remote-jobs', '0.95'],
  ['/fr/emploi-teletravail', '0.95'],
  ['/students', '0.85'],
  ['/no-experience', '0.85'],
  ['/guides', '0.8'],
  ['/tools', '0.75'],
  ['/about', '0.6'],
  ['/student-writer', '0.85']
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
const live = readFileSync(resolve(process.cwd(), 'src/data/liveJobs.ts'), 'utf8');
const seed = readFileSync(resolve(process.cwd(), 'src/data/seedJobs.ts'), 'utf8');
const liveSlugs = Array.from(live.matchAll(/"slug":\s*"([^"]+)"/g)).map((m) => m[1]);
const seedSlugs = Array.from(seed.matchAll(/slug:\s*'([^']+)'/g)).map((m) => m[1]);
const slugs = liveSlugs.length ? liveSlugs : seedSlugs;

const escapeXml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const row = (loc, priority, alternates) => [
  '  <url>',
  '    <loc>' + escapeXml(SITE + loc) + '</loc>',
  '    <priority>' + priority + '</priority>',
  ...(alternates || []).map(([lang, url]) =>
    '    <xhtml:link rel="alternate" hreflang="' + lang + '" href="' + escapeXml(url) + '" />'
  ),
  '  </url>',
].join('\\n');

const urls = staticUrls.map(([loc, priority]) => row(loc, priority));
urls.push(...countries.map((slug) => row('/country/' + slug, '0.75')));
urls.push(...fields.map((slug) => row('/field/' + slug, '0.75')));
const coreKeywords = new Set(['remote jobs','online jobs','work from home jobs','وظائف عن بعد','وظائف اونلاين','emploi en ligne','emploi télétravail']);
const featuredKeywordUrls = keywordRows.filter((item) => coreKeywords.has(String(item.keyword).toLowerCase()) && item.jobMatches > 0);
const rankedKeywordUrls = keywordRows.filter((item) => item.demandScore >= 38 && item.jobMatches > 0).sort((a,b) => b.demandScore - a.demandScore).filter((item) => !featuredKeywordUrls.some((featured) => featured.keyword === item.keyword));
const keywordUrls = [...featuredKeywordUrls, ...rankedKeywordUrls].slice(0, 24);
urls.push(...keywordUrls.map((item) => row('/search/' + item.keyword.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0,90), '0.82')));

for (const slug of slugs) {
  const ar = SITE + '/jobs/' + slug;
  const en = SITE + '/en/jobs/' + slug;
  const fr = SITE + '/fr/jobs/' + slug;
  const alt = [['ar', ar], ['en', en], ['fr', fr], ['x-default', en]];
  urls.push(row('/jobs/' + slug, '0.8', alt));
  urls.push(row('/en/jobs/' + slug, '0.8', alt));
  urls.push(row('/fr/jobs/' + slug, '0.8', alt));
}

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ...urls,
  '</urlset>',
  ''
].join('\\n');

writeFileSync(resolve(process.cwd(), 'public', 'sitemap.xml'), xml, 'utf8');
console.log('sitemap.xml written — ' + urls.length + ' urls');
