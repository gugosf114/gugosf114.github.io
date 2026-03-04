/**
 * SEO Clean URLs + Semantic HTML Transformation Script
 *
 * What it does:
 * 1. Adds aria-label="Main navigation" to <nav> elements
 * 2. Wraps page content in <main> (between </header> and <footer>)
 * 3. Strips .html from internal href links (index.html → /)
 * 4. Strips .html from canonical, og:url, JSON-LD URLs
 * 5. Updates sitemap.xml and sitemap-images.xml
 *
 * GitHub Pages serves foo.html at /foo automatically,
 * so no file restructuring needed — just link updates.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Files to completely skip
const SKIP_FILES = new Set([
    'google56fbc2040830820a.html', // Google verification page
    'order-form-modal.html',       // HTML fragment injected via fetch
]);

// Get all .html files in root directory only
const htmlFiles = fs.readdirSync(ROOT)
    .filter(f => f.endsWith('.html') && !SKIP_FILES.has(f));

let totalChanges = 0;
const changes = [];

for (const filename of htmlFiles) {
    const filepath = path.join(ROOT, filename);
    let content = fs.readFileSync(filepath, 'utf8');
    const original = content;
    const fileChanges = [];

    // === 1. Add aria-label to <nav> (only plain <nav> without existing attributes) ===
    if (content.includes('<nav>')) {
        content = content.replace(/<nav>/g, '<nav aria-label="Main navigation">');
        fileChanges.push('aria-label on <nav>');
    }

    // === 2. Add <main> wrapper around page content ===
    // Only for full pages with header + footer, that don't already have <main>
    const hasHeader = content.includes('</header>');
    const hasFooter = content.includes('<footer');
    const hasMain = /<main[\s>]/.test(content);

    if (hasHeader && hasFooter && !hasMain) {
        content = content.replace('</header>', '</header>\n\n    <main>');
        if (content.includes('<!-- FOOTER -->')) {
            content = content.replace('<!-- FOOTER -->', '</main>\n\n    <!-- FOOTER -->');
        } else {
            content = content.replace(/(\s*)<footer/, '$1</main>\n$1<footer');
        }
        fileChanges.push('<main> wrapper');
    }

    // === 3. Clean internal .html links ===
    // Special case: index.html → /
    const indexPattern = /href="(\/?)index\.html(#[^"]*)?"/g;
    if (indexPattern.test(content)) {
        content = content.replace(/href="(\/?)index\.html(#[^"]*)?"/g, (match, slash, anchor) => {
            return `href="/${anchor || ''}"`;
        });
        fileChanges.push('index.html → /');
    }

    // General case: href="page.html" or href="/page.html" or href="page.html#anchor"
    // Excludes: https://, http://, mailto:, tel:, #, and non-html files
    const linkPattern = /href="(\/?)((?!https?:\/\/|mailto:|tel:|javascript:|#)[a-zA-Z][a-zA-Z0-9_-]*)\.html(#[^"]*)?"/g;
    if (linkPattern.test(content)) {
        content = content.replace(/href="(\/?)((?!https?:\/\/|mailto:|tel:|javascript:|#)[a-zA-Z][a-zA-Z0-9_-]*)\.html(#[^"]*)?"/g,
            (match, slash, page, anchor) => `href="${slash}${page}${anchor || ''}"`
        );
        fileChanges.push('clean internal hrefs');
    }

    // === 4. Clean full-domain URLs (canonical, og:url, twitter, JSON-LD) ===
    // In href attributes (canonical tags)
    const canonicalPattern = /href="https:\/\/mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html"/g;
    if (canonicalPattern.test(content)) {
        content = content.replace(/href="https:\/\/mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html"/g,
            'href="https://mybakingcreations.com/$1"'
        );
        fileChanges.push('clean canonical href');
    }

    // In content attributes (og:url, twitter meta tags)
    const ogPattern = /content="https:\/\/mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html"/g;
    if (ogPattern.test(content)) {
        content = content.replace(/content="https:\/\/mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html"/g,
            'content="https://mybakingcreations.com/$1"'
        );
        fileChanges.push('clean og:url / twitter meta');
    }

    // In JSON-LD (quoted string values)
    const jsonLdPattern = /"https:\/\/mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html"/g;
    if (jsonLdPattern.test(content)) {
        content = content.replace(/"https:\/\/mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html"/g,
            '"https://mybakingcreations.com/$1"'
        );
        fileChanges.push('clean JSON-LD URLs');
    }

    // === 5. Clean meta refresh URLs (redirect pages) ===
    const refreshPattern = /url=\/([\w-]+)\.html/g;
    if (refreshPattern.test(content)) {
        content = content.replace(/url=\/([\w-]+)\.html/g, 'url=/$1');
        fileChanges.push('clean meta refresh');
    }

    // Write if changed
    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        totalChanges++;
        changes.push({ file: filename, what: fileChanges.join(', ') });
        console.log(`  Updated: ${filename} [${fileChanges.join(', ')}]`);
    }
}

// === 6. Update sitemap.xml ===
const sitemapPath = path.join(ROOT, 'sitemap.xml');
if (fs.existsSync(sitemapPath)) {
    let sitemap = fs.readFileSync(sitemapPath, 'utf8');
    const origSitemap = sitemap;
    sitemap = sitemap.replace(
        /mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html/g,
        'mybakingcreations.com/$1'
    );
    if (sitemap !== origSitemap) {
        fs.writeFileSync(sitemapPath, sitemap, 'utf8');
        console.log('  Updated: sitemap.xml');
    }
}

// === 7. Update sitemap-images.xml ===
const imgSitemapPath = path.join(ROOT, 'sitemap-images.xml');
if (fs.existsSync(imgSitemapPath)) {
    let imgSitemap = fs.readFileSync(imgSitemapPath, 'utf8');
    const origImgSitemap = imgSitemap;
    imgSitemap = imgSitemap.replace(
        /mybakingcreations\.com\/([a-zA-Z][a-zA-Z0-9_-]*)\.html/g,
        'mybakingcreations.com/$1'
    );
    if (imgSitemap !== origImgSitemap) {
        fs.writeFileSync(imgSitemapPath, imgSitemap, 'utf8');
        console.log('  Updated: sitemap-images.xml');
    }
}

console.log(`\n  Total HTML files updated: ${totalChanges}`);
console.log('  Done.');
