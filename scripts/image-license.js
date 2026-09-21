#!/usr/bin/env node
// Adds ImageObject licensing JSON-LD (Google Images "Licensable" badge) to every page
// listed in sitemap-images.xml. Idempotent: replaces its own block on each run.
// Runs at deploy (validate-and-deploy.yml) so new gallery images get covered automatically.
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SITE = 'https://mybakingcreations.com';
const LICENSE = SITE + '/image-license';
const xml = fs.readFileSync(path.join(ROOT, 'sitemap-images.xml'), 'utf8');
const START = '<!-- image-license:start -->', END = '<!-- image-license:end -->';
let pages = 0, images = 0;
for (const m of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
  const block = m[1];
  const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  if (!loc) continue;
  const slug = loc.replace(SITE, '').replace(/^\//, '') || 'index';
  const file = path.join(ROOT, slug + '.html');
  if (!fs.existsSync(file)) { console.warn('skip, no file:', slug); continue; }
  const objs = [];
  for (const im of block.matchAll(/<image:image>([\s\S]*?)<\/image:image>/g)) {
    const url = (im[1].match(/<image:loc>([^<]+)<\/image:loc>/) || [])[1];
    const cap = (im[1].match(/<image:caption>([^<]*)<\/image:caption>/) || [])[1] || '';
    if (!url) continue;
    objs.push({
      '@type': 'ImageObject',
      contentUrl: url,
      url: url,
      name: cap.replace(/&amp;/g, '&'),
      caption: cap.replace(/&amp;/g, '&'),
      license: LICENSE,
      acquireLicensePage: LICENSE,
      creditText: 'My Baking Creations',
      copyrightNotice: '© My Baking Creations',
      creator: { '@type': 'Organization', name: 'My Baking Creations', url: SITE + '/' }
    });
  }
  if (!objs.length) continue;
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': objs });
  const tag = `${START}\n<script type="application/ld+json">${json}</script>\n${END}`;
  let html = fs.readFileSync(file, 'utf8');
  const re = new RegExp(START.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&') + '[\\s\\S]*?' + END.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'));
  if (re.test(html)) html = html.replace(re, tag);
  else html = html.replace('</head>', tag + '\n</head>');
  fs.writeFileSync(file, html);
  pages++; images += objs.length;
}
console.log(`image-license: ${images} ImageObjects on ${pages} pages`);
