import type { KeywordDemandRow } from '../types';

const STOP_WORDS = new Set([
  'remote','jobs','job','work','from','home','online','near','me','the','for','to','of','and','in',
  'part','time','entry','level','experience','no','students','worldwide','uk','europe',
  'emploi','travail','teletravail','a','en','distance','sans','experience',
  'وظائف','وظيفة','العمل','عمل','عن','بعد','اونلاين','اون','من','في','ال','بدون','خبرة','خبره',
  'للطلاب','للنساء','الجزائر','البيت','المنزل',
]);

export const slugifyKeyword = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);

export const meaningfulTerms = (keyword: string) =>
  keyword
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter((term) => !STOP_WORDS.has(term) && term.length > 1);

const CORE_KEYWORDS = new Set(['remote jobs','online jobs','work from home jobs','وظائف عن بعد','وظائف اونلاين','emploi en ligne','emploi télétravail']);

export const keywordLandingRows = (rows: KeywordDemandRow[]) => {
  const featured = rows.filter((row) => CORE_KEYWORDS.has(row.keyword.toLowerCase()) && row.jobMatches > 0);
  const ranked = rows
    .filter((row) => row.demandScore >= 38 && row.jobMatches > 0)
    .sort((a, b) => b.demandScore - a.demandScore || b.jobMatches - a.jobMatches);
  const merged = [...featured, ...ranked.filter((row) => !featured.some((item) => item.keyword === row.keyword))];
  return merged.slice(0, 24);
};

export const keywordRowBySlug = (rows: KeywordDemandRow[], slug: string) =>
  keywordLandingRows(rows).find((row) => slugifyKeyword(row.keyword) === slug);

export const keywordLocaleTitle = (row: KeywordDemandRow) => {
  if (row.locale === 'ar') return 'وظائف عن بعد: ' + row.keyword;
  if (row.locale === 'fr') return row.keyword + ' — Emplois à distance';
  return row.keyword + ' — Remote & Online Jobs';
};
