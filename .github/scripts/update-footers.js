#!/usr/bin/env node
/**
 * Updates the footer "Serving" / "Bay Area Service Areas" section
 * on all existing pages to include the full 31-city list.
 * Run once, then delete this script.
 */
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');

// Full 31-city footer HTML (alphabetical, same format as generator output)
const ALL_CITIES = [
  ['Belmont', 'belmont'], ['Berkeley', 'berkeley'], ['Burlingame', 'burlingame'],
  ['Campbell', 'campbell'], ['Cupertino', 'cupertino'], ['Daly City', 'daly-city'],
  ['Foster City', 'foster-city'], ['Fremont', 'fremont'], ['Hayward', 'hayward'],
  ['Los Altos', 'los-altos'], ['Menlo Park', 'menlo-park'], ['Millbrae', 'millbrae'],
  ['Milpitas', 'milpitas'], ['Mountain View', 'mountain-view'], ['Novato', 'novato'],
  ['Oakland', 'oakland'], ['Pacifica', 'pacifica'], ['Palo Alto', 'palo-alto'],
  ['Redwood City', 'redwood-city'], ['San Bruno', 'san-bruno'],
  ['San Carlos', 'san-carlos'], ['San Francisco', 'san-francisco'],
  ['San Jose', 'san-jose'], ['San Mateo', 'san-mateo'], ['San Rafael', 'san-rafael'],
  ['Santa Clara', 'santa-clara'], ['Saratoga', 'saratoga'],
  ['South San Francisco', 'south-san-francisco'], ['Sunnyvale', 'sunnyvale'],
  ['Union City', 'union-city'], ['Walnut Creek', 'walnut-creek']
];

// Pattern 1: "Serving:" with · separators (28 pages)
// Match the entire footer-locations div for this pattern
const pattern1_re = /<div class="footer-locations" style="margin-top: 1rem; font-size: 0.9rem;">\s*<span style="color: var\(--yellow\); font-weight: 600;">Serving:<\/span>\s*(?:<a href="custom-cakes-[^"]*">[^<]*<\/a>\s*·?\s*)+\s*<\/div>/gs;

const replacement1 = `<div class="footer-locations" style="margin-top: 1rem; font-size: 0.9rem;">
                <span style="color: var(--yellow); font-weight: 600;">Delivering to:</span>
                ${ALL_CITIES.map(([name, slug]) => `<a href="custom-cakes-${slug}">${name}</a>`).join(' · ')}
                · <a href="delivery-areas" style="color: var(--yellow); font-weight: 600;">All Areas</a>
            </div>`;

// Pattern 2: "Bay Area Service Areas:" with | separators (index.html, order-form.html)
const pattern2_re = /<div class="footer-locations" style="margin-top: 1\.5rem; font-size: 0\.8rem; opacity: 0\.7; line-height: 1\.8;">\s*<strong style="color: var\(--yellow\); display: block; margin-bottom: 5px;">Bay Area Service Areas:<\/strong>\s*(?:<a href="custom-cakes-[^"]*">[^<]*<\/a>\s*\|?\s*)+\s*<\/div>/gs;

const replacement2 = `<div class="footer-locations" style="margin-top: 1.5rem; font-size: 0.8rem; opacity: 0.7; line-height: 1.8;">
                <strong style="color: var(--yellow); display: block; margin-bottom: 5px;">Bay Area Delivery Areas:</strong>
                ${ALL_CITIES.map(([name, slug]) => `<a href="custom-cakes-${slug}">${name}</a>`).join(' | ')} | <a href="delivery-areas" style="color: var(--yellow); font-weight: 600;">View All</a>
            </div>`;

// Get all HTML files in root (not subdirectories, not new generated pages which already have full footer)
const files = fs.readdirSync(root).filter(f => f.endsWith('.html'));

let updated1 = 0, updated2 = 0;

for (const file of files) {
  // Skip the newly generated city pages (they already have the full footer)
  if (file === 'delivery-areas.html') continue;
  const newCities = ['south-san-francisco','san-bruno','pacifica','millbrae','burlingame','san-mateo',
    'foster-city','belmont','san-carlos','redwood-city','menlo-park','sunnyvale','santa-clara',
    'cupertino','los-altos','campbell','milpitas','saratoga','oakland','berkeley','fremont',
    'hayward','union-city','novato','walnut-creek'];
  if (newCities.some(slug => file === `custom-cakes-${slug}.html`)) continue;

  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, 'utf8');
  let changed = false;

  if (pattern1_re.test(html)) {
    pattern1_re.lastIndex = 0;
    html = html.replace(pattern1_re, replacement1);
    changed = true;
    updated1++;
  }
  if (pattern2_re.test(html)) {
    pattern2_re.lastIndex = 0;
    html = html.replace(pattern2_re, replacement2);
    changed = true;
    updated2++;
  }

  if (changed) {
    fs.writeFileSync(fp, html, 'utf8');
    console.log(`OK ${file}`);
  }
}

console.log(`\nDone. Pattern 1 (Serving): ${updated1} files. Pattern 2 (Bay Area): ${updated2} files. Total: ${updated1 + updated2}`);
