import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const NOW = new Date().toISOString();
const OUT_JSON = resolve(ROOT, 'public', 'keyword-intelligence.json');
const OUT_TS = resolve(ROOT, 'src', 'data', 'keywordIntelligence.ts');
const USER_AGENT = 'EzyJobs/1.0 search-opportunity-engine';

const seeds = [
  ['remote jobs', 'en', 'US'], ['work from home jobs', 'en', 'US'],
  ['online jobs', 'en', 'US'], ['remote jobs no experience', 'en', 'US'],
  ['remote jobs entry level', 'en', 'US'], ['part time remote jobs', 'en', 'US'],
  ['remote customer service jobs', 'en', 'US'], ['remote data entry jobs', 'en', 'US'],
  ['remote software engineer jobs', 'en', 'US'], ['remote data analyst jobs', 'en', 'US'],
  ['remote marketing jobs', 'en', 'US'], ['remote writing jobs', 'en', 'US'],
  ['remote jobs for students', 'en', 'US'], ['remote jobs worldwide', 'en', 'US'],
  ['remote jobs europe', 'en', 'GB'], ['remote jobs uk', 'en', 'GB'],
  ['remote jobs france', 'fr', 'FR'], ['emploi télétravail', 'fr', 'FR'],
  ['emploi en ligne', 'fr', 'FR'], ['emploi à distance', 'fr', 'FR'],
  ['وظائف عن بعد', 'ar', 'DZ'], ['وظائف اونلاين', 'ar', 'DZ'],
  ['وظائف من المنزل', 'ar', 'DZ'], ['العمل عن بعد', 'ar', 'DZ'],
  ['وظائف عن بعد في الجزائر', 'ar', 'DZ'], ['وظائف اونلاين بدون خبرة', 'ar', 'DZ'],
];

const stopWords = new Set([
  'remote','jobs','job','work','from','home','online','near','me','the','for','to','of','and','in',
  'part','time','entry','level','experience','no','students','worldwide','uk','europe',
  'emploi','travail','teletravail','à','a','en','distance','sans','expérience',
  'وظائف','وظيفة','العمل','عمل','عن','بعد','اونلاين','اون','من','في','ال','بدون','خبرة','خبره',
  'للطلاب','للنساء','الجزائر','البيت','المنزل'
]);

const jobIntent = /(\bjobs?\b|\bwork from home\b|\bonline jobs\b|emploi|travail|télétravail|وظائف|وظيفة|العمل عن بعد|عمل عن بعد)/i;

const normalize = (value) => String(value)
  .toLowerCase()
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const contentTokens = (value) => normalize(value)
  .split(' ')
  .filter((token) => token.length > 1 && !stopWords.has(token));

const unique = (items) => [...new Set(items.filter(Boolean))];

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json, text/xml, */*' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(url + ' -> HTTP ' + response.status);
  return response.text();
}

async function googleSuggest(query, locale, geo) {
  const url = new URL('https://suggestqueries.google.com/complete/search');
  url.searchParams.set('client', 'firefox');
  url.searchParams.set('hl', locale === 'ar' ? 'ar' : locale === 'fr' ? 'fr' : 'en');
  url.searchParams.set('gl', geo);
  url.searchParams.set('q', query);
  const data = JSON.parse(await fetchText(url));
  return Array.isArray(data?.[1]) ? data[1].map(String).slice(0, 10) : [];
}
const jobs = (() => {
  try { return JSON.parse(readFileSync(resolve(ROOT, 'public', 'jobs.json'), 'utf8')); }
  catch { return []; }
})();

const phraseMap = new Map();
const errors = [];

for (const [seed, locale, geo] of seeds) {
  const words = seed.split(/\s+/);
  const queries = unique([
    words[0],
    words.slice(0, 2).join(' '),
    words.length > 2 ? words.slice(0, 3).join(' ') : seed,
    seed,
  ].filter((query) => query.length >= 3));

  for (const query of queries) {
    try {
      const list = await googleSuggest(query, locale, geo);
      list.forEach((suggestion, index) => {
        const key = normalize(suggestion);
        if (!key || !jobIntent.test(suggestion)) return;
        const row = phraseMap.get(key) || {
          keyword: suggestion,
          normalized: key,
          locale,
          geo,
          weight: 0,
          occurrences: 0,
          sourceQueries: [],
          related: [],
        };
        row.weight += (11 - index);
        row.occurrences += 1;
        if (!row.sourceQueries.includes(query)) row.sourceQueries.push(query);
        if (!row.related.includes(seed)) row.related.push(seed);
        phraseMap.set(key, row);
      });
    } catch (error) {
      errors.push({ kind: 'autocomplete', term: query, geo, error: String(error) });
    }
  }
}

const maxWeight = Math.max(1, ...[...phraseMap.values()].map((row) => row.weight));

const jobText = jobs.map((job) => ({
  job,
  text: normalize([
    job.titleOriginal,
    job.company,
    job.category,
    ...(job.skills || []),
    job.descriptionAr?.slice(0, 1800) || '',
  ].join(' ')),
}));

const jobMatchesFor = (keyword) => {
  const tokens = contentTokens(keyword);
  const generic = tokens.length === 0;
  return jobText.filter(({ job, text }) => {
    if (job.workMode !== 'remote') return false;
    if (generic) return true;
    const matched = tokens.filter((token) => text.includes(token)).length;
    return matched >= Math.max(1, Math.ceil(tokens.length * 0.5));
  }).length;
};

const trafficValue = (value) => {
  const raw = String(value || '').replace(/,/g, '').trim().toUpperCase();
  const match = raw.match(/([\d.]+)\s*([KM]?)/);
  if (!match) return 0;
  const base = Number(match[1]);
  return match[2] === 'M' ? base * 1e6 : match[2] === 'K' ? base * 1e3 : base;
};

const trendItems = [];
try {
  for (const geo of ['DZ', 'US', 'GB', 'FR']) {
    const xml = await fetchText('https://trends.google.com/trending/rss?geo=' + encodeURIComponent(geo));
    for (const block of xml.split('<item>').slice(1)) {
      const title = (block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/s)?.[1] ??
        block.match(/<title>(.*?)<\/title>/s)?.[1] ?? '').trim();
      const traffic = (block.match(/<approx_traffic>(.*?)<\/approx_traffic>/s)?.[1] ?? '').trim();
      if (title) trendItems.push({ title, normalized: normalize(title), geo, traffic, trafficValue: trafficValue(traffic) });
    }
  }
} catch (error) {
  errors.push({ kind: 'trending-rss', error: String(error) });
}
const trendMax = Math.max(1, ...trendItems.map((item) => item.trafficValue));

const rows = [...phraseMap.values()].map((row) => {
  const relatedTrend = trendItems
    .filter((item) => item.geo === row.geo)
    .map((item) => {
      const a = new Set(contentTokens(row.keyword));
      const b = new Set(contentTokens(item.title));
      const overlap = [...a].filter((token) => b.has(token)).length;
      const denominator = Math.max(1, Math.min(a.size || 1, b.size || 1));
      return { item, overlap, ratio: overlap / denominator };
    })
    .filter((candidate) => candidate.ratio >= 0.5 && candidate.overlap >= 1)
    .sort((a, b) => b.item.trafficValue - a.item.trafficValue)[0];

  const jobMatches = jobMatchesFor(row.keyword);
  const searchScore = Math.round((row.weight / maxWeight) * 100);
  const breadthScore = Math.min(100, row.sourceQueries.length * 25 + row.occurrences * 5);
  const supplyMax = Math.max(1, jobs.length);
  const supplyScore = Math.round(Math.min(1, jobMatches / Math.max(5, supplyMax * 0.35)) * 100);
  const trendScore = relatedTrend
    ? Math.round((relatedTrend.item.trafficValue / trendMax) * 100)
    : 0;
  const demandScore = Math.round(
    searchScore * 0.55 +
    breadthScore * 0.20 +
    supplyScore * 0.15 +
    trendScore * 0.10,
  );

  return {
    keyword: row.keyword,
    normalized: row.normalized,
    locale: row.locale,
    geo: row.geo,
    intent: row.keyword.toLowerCase().includes('no experience') ||
      row.keyword.includes('بدون خبرة') || row.keyword.includes('sans expérience') ? 'entry' :
      row.keyword.toLowerCase().includes('part time') || row.keyword.includes('temps partiel') ? 'part-time' :
      /customer service|خدمة العملاء|service client/i.test(row.keyword) ? 'support' :
      /data analyst|data entry|تحليل البيانات/i.test(row.keyword) ? 'data' :
      /software engineer|developer|مطور/i.test(row.keyword) ? 'development' :
      /marketing|تسويق/i.test(row.keyword) ? 'marketing' :
      'jobs',
    suggestions: unique(row.related).slice(0, 8),
    searchScore,
    suggestionCount: row.occurrences,
    sourceQueryCount: row.sourceQueries.length,
    jobMatches,
    trendScore,
    demandScore,
    demandSignals: [
      'google_autocomplete_ranked',
      ...(relatedTrend ? ['google_trends_trending_now'] : []),
      ...(jobMatches ? ['ezyjobs_job_supply'] : []),
    ],
    trendTraffic: relatedTrend?.item.traffic,
    capturedAt: NOW,
  };
}).filter((row) => row.keyword.length >= 4 && jobIntent.test(row.keyword) && !/^remote$/i.test(row.keyword));

const keywords = rows
  .sort((a, b) => b.demandScore - a.demandScore || b.searchScore - a.searchScore || b.jobMatches - a.jobMatches)
  .slice(0, 60);

const roleMap = new Map();
for (const job of jobs) {
  const key = normalize(job.titleOriginal);
  if (!key) continue;
  const row = roleMap.get(key) || { title: job.titleOriginal, count: 0, remoteCount: 0, directCount: 0 };
  row.count += 1;
  row.remoteCount += job.workMode === 'remote' ? 1 : 0;
  row.directCount += job.source?.distribution === 'direct' ? 1 : 0;
  roleMap.set(key, row);
}
const inDemandRoles = [...roleMap.values()]
  .sort((a, b) => b.remoteCount - a.remoteCount || b.directCount - a.directCount)
  .slice(0, 30);

const output = {
  generatedAt: NOW,
  methodology: {
    description: 'EzyJobs combines Google autocomplete ranking across multiple query prefixes, Google Trends Trending Now signals where a relevant trend exists, and live EzyJobs job supply. The demand score is directional and is not an official monthly search-volume number.',
    searchSource: 'Google Autocomplete',
    trendSource: 'Google Trends Trending Now',
    jobSource: 'EzyJobs live jobs snapshot',
  },
  keywords,
  inDemandRoles,
  errors,
};

mkdirSync(resolve(ROOT, 'public'), { recursive: true });
mkdirSync(resolve(ROOT, 'src', 'data'), { recursive: true });
writeFileSync(OUT_JSON, JSON.stringify(output, null, 2), 'utf8');
writeFileSync(
  OUT_TS,
  "import type { KeywordDemandSnapshot } from '../types';\n\n" +
    '// Generated by scripts/keyword-intelligence.mjs — do not edit by hand.\n' +
    'export const keywordIntelligence = ' + JSON.stringify(output, null, 2) + ' as KeywordDemandSnapshot;\n',
  'utf8',
);

console.log('Search opportunity engine: ' + keywords.length + ' phrases, ' + inDemandRoles.length + ' role signals.');
console.log('Top: ' + keywords.slice(0, 12).map((row) => row.keyword + ' [' + row.demandScore + ']').join(' | '));
if (errors.length) console.warn(JSON.stringify({ errors }, null, 2));
