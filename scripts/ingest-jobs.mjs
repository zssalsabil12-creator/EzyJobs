import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const OUT = resolve(ROOT, 'src', 'data', 'liveJobs.ts');
const CONFIG_PATH = resolve(ROOT, 'config', 'job-sources.json');
const NOW = new Date();
const MAX_JOBS = 300;
const MAX_PER_SOURCE = 60;

let greenhouseSources = [];
let ashbySources = [];
try {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
  greenhouseSources = Array.isArray(config.greenhouse) ? config.greenhouse : [];
  ashbySources = Array.isArray(config.ashby) ? config.ashby : [];
} catch {
  greenhouseSources = [];
  ashbySources = [];
}

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'EzyJobs/1.0 public-job-ingestion' },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(url + ' -> HTTP ' + response.status);
  return response.json();
};

const decodeHtmlEntities = (value) =>
  String(value)
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, n) => String.fromCodePoint(Number(n)));

const stripHtml = (value = '') =>
  decodeHtmlEntities(String(value))
    .replace(/\\(?=<|>)/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const unique = (items) => [...new Set(items.filter(Boolean))];

const countries = new Map([
  ['united states','US'], ['usa','US'], ['canada','CA'], ['united kingdom','GB'], ['uk','GB'],
  ['ireland','IE'], ['france','FR'], ['germany','DE'], ['spain','ES'], ['italy','IT'],
  ['portugal','PT'], ['netherlands','NL'], ['belgium','BE'], ['switzerland','CH'],
  ['austria','AT'], ['sweden','SE'], ['norway','NO'], ['denmark','DK'], ['finland','FI'],
  ['poland','PL'], ['czech republic','CZ'], ['czechia','CZ'], ['romania','RO'], ['greece','GR'],
  ['algeria','DZ'], ['morocco','MA'], ['tunisia','TN'], ['egypt','EG'], ['saudi arabia','SA'],
  ['united arab emirates','AE'], ['uae','AE'], ['qatar','QA'], ['kuwait','KW'],
  ['bahrain','BH'], ['oman','OM'], ['jordan','JO'], ['lebanon','LB'], ['palestine','PS'],
  ['iraq','IQ'], ['south africa','ZA'], ['nigeria','NG'], ['kenya','KE'], ['india','IN'],
  ['pakistan','PK'], ['philippines','PH'], ['australia','AU'], ['new zealand','NZ'],
  ['brazil','BR'], ['mexico','MX'], ['argentina','AR'],
]);

const eligibilityFromText = (text = '') => {
  const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
  const explicitWorldwide =
    /\bworldwide\b/.test(normalized) ||
    /\bworld[\s-]?wide\b/.test(normalized) ||
    /\bwork from anywhere\b/.test(normalized) ||
    /\banywhere in the world\b/.test(normalized) ||
    /\ball countries\b/.test(normalized) ||
    /\bglobal(?:ly)? remote\b/.test(normalized) ||
    /\bremote anywhere\b/.test(normalized);
  if (explicitWorldwide) {
    return {
      status: 'open',
      regions: ['worldwide'],
      note: 'The source location/eligibility field explicitly describes the role as worldwide or open from anywhere.',
    };
  }

  const found = [];
  for (const [label, code] of countries) {
    const pattern = new RegExp('(^|[^a-z])' + label.replace(/ /g, '[\\s-]+') + '([^a-z]|$)');
    if (pattern.test(normalized)) found.push(code);
  }
  if (found.length) {
    return {
      status: 'limited',
      regions: unique(found),
      note: 'Country eligibility was identified from the source location/eligibility field; review the original posting before applying.',
    };
  }
  return {
    status: 'unclear',
    regions: [],
    note: 'The source confirms a remote role, but its location/eligibility field does not explicitly establish applicant countries.',
  };
};

const categoryFor = (text = '') => {
  const x = text.toLowerCase();
  if (/customer support|customer service|help desk/.test(x)) return 'support';
  if (/software|developer|engineer|frontend|backend|devops|programmer/.test(x)) return 'development';
  if (/data analyst|data science|analytics|business intelligence/.test(x)) return 'data';
  if (/design|designer|ux|ui/.test(x)) return 'design';
  if (/marketing|growth|seo/.test(x)) return 'marketing';
  if (/writer|writing|copywriter|editor|content/.test(x)) return 'writing';
  if (/teacher|teaching|tutor|education|instructor/.test(x)) return 'education';
  if (/finance|accounting|accountant|financial/.test(x)) return 'finance';
  if (/sales|business development|account executive/.test(x)) return 'sales';
  if (/human resources|recruiter|talent acquisition|people operations/.test(x)) return 'hr';
  if (/operations|project coordinator|operations manager/.test(x)) return 'operations';
  return 'other';
};

const commitmentFor = (text = '') => {
  const x = text.toLowerCase();
  if (/intern|internship/.test(x)) return 'internship';
  if (/part[- ]time/.test(x)) return 'part-time';
  if (/freelance|contractor/.test(x)) return 'freelance';
  if (/contract/.test(x)) return 'contract';
  return 'full-time';
};

const experienceFor = (text = '') => {
  const x = text.toLowerCase();
  if (/intern|internship|student/.test(x)) return 'student';
  if (/no experience|entry[- ]level|entry level|graduate|new grad/.test(x)) return 'entry';
  if (/junior|jr\.?/.test(x)) return 'junior';
  if (/senior|sr\.?|lead|principal|staff/.test(x)) return 'senior';
  return 'mid';
};

const skillsFor = (text = '') => {
  const candidates = [
    'JavaScript','TypeScript','React','Next.js','Python','Java','SQL','Excel','Figma',
    'AWS','Azure','Docker','Kubernetes','Git','SEO','Content Writing','Customer Support',
    'Data Analysis','Project Management','Marketing','Sales','English','French','Arabic',
  ];
  const x = text.toLowerCase();
  return candidates.filter((skill) => x.includes(skill.toLowerCase())).slice(0, 12);
};

const salaryFor = (value = '') => {
  const text = String(value).trim();
  const m = text.match(/(?:[$â‚¬Â£]\s*)?(\d[\d,]*(?:\.\d+)?)\s*(?:[-â€“]\s*(?:[$â‚¬Â£]\s*)?(\d[\d,]*(?:\.\d+)?))?/);
  if (!m) return undefined;
  const currency = text.includes('â‚¬') ? 'EUR' : text.includes('Â£') ? 'GBP' : 'USD';
  const period = /hour|hourly/i.test(text) ? 'hour' : /month|monthly/i.test(text) ? 'month' : 'year';
  return {
    min: Number(m[1].replace(/,/g, '')),
    ...(m[2] ? { max: Number(m[2].replace(/,/g, '')) } : {}),
    currency,
    period,
    note: text,
  };
};

const slugify = (value) =>
  value.toLowerCase().normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);

const makeJob = (source, raw, opts) => {
  const plain = stripHtml(raw.description || '');
  const combined = [raw.title, plain, raw.location || '', raw.tags || ''].join(' ');
  const eligibilityInput = [raw.eligibilityText, raw.location].filter(Boolean).join(' ');
  const eligibility = opts.eligibility || eligibilityFromText(eligibilityInput || raw.title || '');
  return {
    id: source + '-' + raw.id,
    slug: slugify(raw.title + '-' + raw.company + '-' + raw.id),
    titleAr: raw.title,
    titleOriginal: raw.title,
    company: raw.company,
    ...(raw.companyUrl ? { companyUrl: raw.companyUrl } : {}),
    category: raw.category || categoryFor(combined),
    workMode: 'remote',
    commitment: commitmentFor((raw.jobType || '') + ' ' + combined),
    experience: experienceFor(combined),
    experienceYears: /senior|lead|principal|staff/i.test(combined) ? 5 : 0,
    eligibility: eligibility.status,
    eligibleRegions: eligibility.regions,
    eligibilityEvidence: [{
      kind: 'posting',
      status: eligibility.status,
      countries: eligibility.regions.filter((x) => x !== 'worldwide'),
      label: 'Source posting evidence',
      sourceName: opts.sourceName,
      url: raw.sourceUrl,
      capturedAt: NOW.toISOString(),
      note: opts.note || eligibility.note,
    }],
    languages: [],
    ...(raw.salary ? { salary: raw.salary } : {}),
    summaryAr: plain.slice(0, 420),
    descriptionAr: plain.slice(0, 6000),
    skills: skillsFor(combined),
    requirements: [],
    niceToHave: [],
    suitableForStudents: /student|intern|internship|graduate|entry[- ]level/i.test(combined),
    source: {
      name: opts.sourceName,
      url: raw.sourceUrl,
      redistributable: true,
      partner: false,
      distribution: opts.distribution || 'aggregator',
    },
    applyUrl: raw.applyUrl || raw.sourceUrl,
    publishedAt: raw.publishedAt,
    verifiedAt: NOW.toISOString(),
    status: 'published',
    views: 0,
    views7d: [],
  };
};

const imported = [];
const errors = [];

try {
  const payload = await fetchJson('https://remotive.com/api/remote-jobs?limit=200');
  for (const item of payload.jobs || []) {
    const eligibility = eligibilityFromText(item.candidate_required_location || '');
    imported.push(makeJob('remotive', {
      id: item.id,
      title: item.title,
      company: item.company_name,
      description: item.description,
      category: categoryFor([item.title, item.description, item.category].join(' ')),
      jobType: item.job_type,
      sourceUrl: item.url,
      applyUrl: item.url,
      publishedAt: item.publication_date,
      salary: salaryFor(item.salary),
    }, {
      sourceName: 'Remotive',
      distribution: 'aggregator',
      eligibility,
      note: 'Remotive requires attribution and a link back to the Remotive listing when its public API data is shared.',
    }));
  }
} catch (error) {
  errors.push({ source: 'Remotive', error: String(error) });
}

for (const [sourceName, baseUrl] of [
  ['Arbeitnow', 'https://www.arbeitnow.com/api/job-board-api'],
  ['Arbeitnow UK', 'https://www.arbeitnow.co.uk/api/job-board-api'],
]) {
  try {
    const payload = await fetchJson(baseUrl);
    for (const item of payload.data || []) {
      if (!item.remote) continue;
      imported.push(makeJob('arbeitnow', {
        id: sourceName.toLowerCase().replace(/\s+/g, '-') + '-' + item.slug,
        title: item.title,
        company: item.company_name,
        description: item.description,
        category: categoryFor([item.title, item.description, (item.tags || []).join(' ')].join(' ')),
        jobType: (item.job_types || []).join(' '),
        sourceUrl: item.url,
        applyUrl: item.url,
        publishedAt: new Date(Number(item.created_at) * 1000).toISOString(),
      }, {
        sourceName,
        distribution: 'aggregator',
        note: 'Arbeitnow API access permits use with a link back to Arbeitnow.',
      }));
    }
  } catch (error) {
    errors.push({ source: sourceName, error: String(error) });
  }
}

for (const config of greenhouseSources) {
  try {
    const token = String(config.token || '').trim();
    if (!token) continue;
    const board = await fetchJson('https://boards-api.greenhouse.io/v1/boards/' + encodeURIComponent(token) + '/jobs?content=true');
    const boardName = board.name || config.name || token;
    for (const item of board.jobs || []) {
      const location = item.location?.name || '';
      const body = [item.title || '', item.content || '', location].join(' ');
      if (!/remote|work from home|work-from-home|distributed/i.test(body)) continue;
      imported.push(makeJob('greenhouse', {
        id: token + '-' + item.id,
        title: item.title,
        company: boardName,
        description: item.content || '',
        category: categoryFor([item.title || '', item.content || '', location].join(' ')),
        sourceUrl: item.absolute_url,
        applyUrl: item.absolute_url,
        publishedAt: item.updated_at || NOW.toISOString(),
      }, {
        sourceName: boardName,
        distribution: 'direct',
        note: 'Public Greenhouse Job Board posting linked directly to the employer career posting.',
      }));
    }
  } catch (error) {
    errors.push({ source: 'Greenhouse', token: config?.token || '', error: String(error) });
  }
}

for (const config of ashbySources) {
  try {
    const board = String(config.board || '').trim();
    if (!board) continue;
    const payload = await fetchJson(
      'https://api.ashbyhq.com/posting-api/job-board/' + encodeURIComponent(board) + '?includeCompensation=true',
    );
    for (const item of payload.jobs || []) {
      if (item.isListed === false || item.isRemote !== true) continue;
      const secondaryLocations = (item.secondaryLocations || [])
        .map((entry) => entry?.location)
        .filter(Boolean);
      const locationEvidence = [item.location, ...secondaryLocations].filter(Boolean).join('; ');
      const eligibility = eligibilityFromText(locationEvidence);
      const sourceName = config.name || board;
      imported.push(makeJob('ashby', {
        id: board + '-' + item.id,
        title: item.title,
        company: sourceName,
        description: item.descriptionHtml || item.descriptionPlain || '',
        category: categoryFor([item.title || '', item.descriptionPlain || '', item.department || '', item.team || ''].join(' ')),
        jobType: item.employmentType || '',
        location: locationEvidence,
        eligibilityText: locationEvidence,
        sourceUrl: item.jobUrl,
        applyUrl: item.applyUrl || item.jobUrl,
        publishedAt: item.publishedAt || NOW.toISOString(),
      }, {
        sourceName,
        distribution: 'direct',
        eligibility,
        note: config.note || 'Public Ashby Job Postings board linked directly to the employer job posting.',
      }));
    }
  } catch (error) {
    errors.push({ source: 'Ashby', board: config?.board || '', error: String(error) });
  }
}

if (imported.length === 0) {
  console.error('No jobs were imported; preserving the previous snapshot.');
  process.exitCode = 1;
} 

const deduped = new Map();
for (const job of imported) {
  if (!deduped.has(job.id)) deduped.set(job.id, job);
}

const sortedJobs = [...deduped.values()]
  .filter((job) => job.titleOriginal && job.company && job.applyUrl)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

const sourceCounts = new Map();
const jobs = [];
for (const job of sortedJobs) {
  const sourceKey = job.source.distribution + ':' + job.source.name;
  const count = sourceCounts.get(sourceKey) || 0;
  if (count >= MAX_PER_SOURCE) continue;
  sourceCounts.set(sourceKey, count + 1);
  jobs.push(job);
  if (jobs.length >= MAX_JOBS) break;
}

mkdirSync(resolve(ROOT, 'src', 'data'), { recursive: true });
const output = [
  "import type { Job } from '../types';",
  '',
  '// Generated by scripts/ingest-jobs.mjs â€” do not edit by hand.',
  'export const liveJobs: Job[] = ' + JSON.stringify(jobs, null, 2) + ';',
  '',
].join('\n');
writeFileSync(OUT, output, 'utf8');
mkdirSync(resolve(ROOT, 'public'), { recursive: true });
writeFileSync(resolve(ROOT, 'public', 'jobs.json'), JSON.stringify(jobs), 'utf8');

console.log('Imported ' + jobs.length + ' remote jobs.');
console.log('Sources: ' + [...new Set(jobs.map((job) => job.source.name))].join(', '));
if (errors.length) console.warn(JSON.stringify({ sourceErrors: errors }, null, 2));




