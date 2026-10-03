import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const ssrOut = resolve(root, '.prerender-ssr');

await build({
  root,
  logLevel: 'error',
  build: {
    ssr: 'src/__ssr.tsx',
    outDir: ssrOut,
    emptyOutDir: true,
    copyPublicDir: false,
  },
});

const mod = await import(pathToFileURL(resolve(ssrOut, '__ssr.js')).href + '?v=' + Date.now());
// Use Vite's production HTML so prerendered pages keep the emitted asset URLs
// (rather than falling back to /src/main.tsx from the source index).
const baseHtml = readFileSync(resolve(root, 'dist', 'index.html'), 'utf8');

const isIndexable = (route) => {
  if (route === '/' || route === '/jobs' || route === '/remote') return true;
  if (route === '/en/jobs' || route === '/fr/emplois') return true;
  if (route === '/en/remote-jobs' || route === '/fr/emploi-teletravail') return true;
  if (route === '/demand' || route === '/en/job-search-trends' || route === '/fr/tendances-emploi') return true;
  if (route === '/student-writer') return true;
  if (route.startsWith('/country/') || route.startsWith('/field/')) return true;
  if (route.startsWith('/guides') || route.startsWith('/tools')) return true;
  if (route.startsWith('/search/')) return true;
  if (route.startsWith('/jobs/') || route.startsWith('/en/jobs/') || route.startsWith('/fr/jobs/')) {
    return !route.includes('does-not-exist');
  }
  return false;
};

const escHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const setMeta = (html, attr, key, value) => {
  const selector = new RegExp('<meta\\s+' + attr + '="' + key + '"[^>]*>', 'i');
  const tag = '<meta ' + attr + '="' + key + '" content="' + escHtml(value) + '" />';
  return html.match(selector)
    ? html.replace(selector, tag)
    : html.replace('</head>', '    ' + tag + '\n  </head>');
};

const renderDocument = (route, rendered) => {
  const payload = mod.getSeoPayload(route);
  let html = baseHtml;

  const htmlStart = html.indexOf('<html');
  const htmlEnd = html.indexOf('>', htmlStart);
  if (htmlStart >= 0 && htmlEnd > htmlStart) {
    html = html.slice(0, htmlStart)
      + '<html lang="' + payload.locale + '" dir="' + payload.direction + '">'
      + html.slice(htmlEnd + 1);
  }

  const titleStart = html.indexOf('<title>');
  const titleEnd = html.indexOf('</title>');
  if (titleStart >= 0 && titleEnd > titleStart) {
    html = html.slice(0, titleStart)
      + '<title>' + escHtml(payload.title) + '</title>'
      + html.slice(titleEnd + 8);
  }

  html = setMeta(html, 'name', 'description', payload.description);
  html = setMeta(html, 'property', 'og:title', payload.title);
  html = setMeta(html, 'property', 'og:description', payload.description);
  html = setMeta(html, 'property', 'og:url', payload.canonical);

  html = html.split('\n').filter((line) => {
    return !line.includes('rel="canonical"')
      && !line.includes('rel="alternate"')
      && !line.includes('ezy-prerender-jsonld');
  }).join('\n');

  const links = [];
  if (payload.canonical) {
    links.push('<link rel="canonical" href="' + escHtml(payload.canonical) + '" />');
  }
  for (const [lang, href] of Object.entries(payload.alternates || {})) {
    links.push('<link rel="alternate" hreflang="' + escHtml(lang) + '" href="' + escHtml(href) + '" />');
  }
  if (payload.jsonLd) {
    const json = JSON.stringify(payload.jsonLd).replace(/</g, '\\u003c');
    links.push('<script id="ezy-prerender-jsonld" type="application/ld+json">' + json + '</script>');
  }

  html = html.replace('</head>', links.map((line) => '    ' + line).join('\n') + '\n  </head>');
  return html.replace('<div id="root"></div>', '<div id="root">' + rendered + '</div>');
};

let count = 0;
for (const route of mod.routes.filter(isIndexable)) {
  const rendered = mod.render(route);
  const html = renderDocument(route, rendered);
  const output = route === '/'
    ? resolve(root, 'dist', 'index.html')
    : resolve(root, 'dist', route.replace(/^\/+/, ''), 'index.html');
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, html, 'utf8');
  count += 1;
}

console.log('prerendered ' + count + ' indexable routes');
