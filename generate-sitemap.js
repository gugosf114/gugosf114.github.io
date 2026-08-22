/**
 * My Baking Creations - Sitemap Generator
 *
 * Scans all HTML files in the project and generates a valid sitemap.xml
 *
 * Usage:
 *   node generate-sitemap.js
 *
 * Output:
 *   sitemap.xml (in project root)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

// Configuration
const CONFIG = {
    baseUrl: 'https://mybakingcreations.com',
    outputFile: 'sitemap.xml',

    // Files/folders to exclude
    exclude: [
        'node_modules',
        '.git',
        'order-form-modal.html',  // Modal, not a page
        '404.html',                // Error page
        'thank-you.html',          // Post-submit page, noindexed
        'cakes.html',              // Raw-markdown leftover, blocked in robots.txt
        'google56fbc2040830820a.html',  // Google verification file
        // WiM (the Android app) legal pages live on this domain for Play Store
        // compliance but are not bakery pages: noindexed, kept out of the sitemap.
        'wim-android',
        'wim-delete-account.html',
        'wim-delete-account',
        'wim-privacy-policy.html',
        'wim-privacy-policy',
        'thursday',                // App page, not marketing content
        'tools'                    // Utility pages, not marketing content
    ],

    // Priority mappings (higher = more important)
    priorities: {
        'index.html': 1.0,
        'contact.html': 0.9,
        'order-form.html': 0.9,
        'gallery.html': 0.9,
        'corporate.html': 0.8,
        'about.html': 0.8,
        'blog.html': 0.8,
        'gallery-cakes.html': 0.8,
        'gallery-cookies.html': 0.8,
        'gallery-cakepops.html': 0.8,
        'gallery-cupcakes.html': 0.8
    },

    // Change frequency mappings
    changefreq: {
        'index.html': 'weekly',
        'blog.html': 'weekly',
        'gallery.html': 'weekly',
        'contact.html': 'monthly',
        'about.html': 'monthly',
        'corporate.html': 'monthly'
    },

    // Default values
    defaultPriority: 0.7,
    defaultChangefreq: 'monthly'
};

/**
 * Recursively find all HTML files
 * @param {string} dir - Directory to scan
 * @param {string[]} files - Accumulated files array
 * @returns {string[]} Array of file paths
 */
function findHtmlFiles(dir, files = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
        // Skip excluded items
        if (CONFIG.exclude.includes(item)) continue;

        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            findHtmlFiles(fullPath, files);
        } else if (item.endsWith('.html')) {
            files.push(fullPath);
        }
    }

    return files;
}

/**
 * Get file modification date from git history (stable across clones/CI,
 * unlike fs mtime which resets on every checkout). Falls back to mtime
 * for files not yet committed.
 * @param {string} filePath - Path to file
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function getLastMod(filePath) {
    try {
        const out = execFileSync(
            'git', ['log', '-1', '--format=%cs', '--', filePath],
            { cwd: __dirname, encoding: 'utf8' }
        ).trim();
        if (out) return out;
    } catch (e) {
        // not a git checkout — fall through to mtime
    }
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().split('T')[0];
}

/**
 * Check whether a page opts out of indexing (robots noindex meta tag).
 * Noindexed pages must not appear in the sitemap.
 * @param {string} filePath - Path to file
 * @returns {boolean}
 */
function isNoindex(filePath) {
    const head = fs.readFileSync(filePath, 'utf8').slice(0, 4000);
    return /<meta[^>]+noindex/i.test(head);
}

/**
 * Convert file path to URL
 * @param {string} filePath - Local file path
 * @param {string} rootDir - Project root directory
 * @returns {string} Full URL
 */
function filePathToUrl(filePath, rootDir) {
    let relativePath = path.relative(rootDir, filePath);
    // Convert Windows backslashes to forward slashes
    relativePath = relativePath.replace(/\\/g, '/');

    // index.html becomes root
    if (relativePath === 'index.html') {
        return CONFIG.baseUrl + '/';
    }

    // Subdirectory index files become directory URLs
    if (path.basename(relativePath) === 'index.html') {
        return CONFIG.baseUrl + '/' + path.dirname(relativePath) + '/';
    }

    // Extensionless URLs — GitHub Pages serves both, and every page's
    // canonical tag uses the extensionless form
    relativePath = relativePath.replace(/\.html$/, '');

    return CONFIG.baseUrl + '/' + relativePath;
}

/**
 * Get priority for a file
 * @param {string} fileName - File name
 * @returns {number} Priority value
 */
function getPriority(fileName) {
    return CONFIG.priorities[fileName] || CONFIG.defaultPriority;
}

/**
 * Get change frequency for a file
 * @param {string} fileName - File name
 * @returns {string} Change frequency
 */
function getChangefreq(fileName) {
    // Blog posts
    if (fileName.startsWith('blog-')) return 'monthly';
    // City pages
    if (fileName.startsWith('custom-cakes-')) return 'monthly';
    // Gallery subpages
    if (fileName.startsWith('gallery-')) return 'weekly';
    // Corporate gallery
    if (fileName.startsWith('gallery-corporate-')) return 'weekly';

    return CONFIG.changefreq[fileName] || CONFIG.defaultChangefreq;
}

/**
 * Generate sitemap XML
 * @param {Object[]} pages - Array of page objects
 * @returns {string} XML string
 */
function generateXml(pages) {
    const urlEntries = pages.map(page => {
        return `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>
`;
}

/**
 * Main function
 */
function main() {
    const rootDir = __dirname;

    console.log('Scanning for HTML files...');
    const htmlFiles = findHtmlFiles(rootDir);
    console.log(`Found ${htmlFiles.length} HTML files`);

    // Drop noindexed pages (Wix redirect stubs, thank-you, drafts, etc.)
    const indexableFiles = htmlFiles.filter(f => {
        if (isNoindex(f)) {
            console.log(`  skipping (noindex): ${path.relative(rootDir, f)}`);
            return false;
        }
        return true;
    });

    // Build page data
    const pages = indexableFiles.map(filePath => {
        // Subdir index pages (wim-privacy-policy/index.html) must not inherit
        // the root index.html priority — key them by relative path instead
        const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
        const fileName = relPath.includes('/') ? relPath : path.basename(filePath);
        return {
            url: filePathToUrl(filePath, rootDir),
            lastmod: getLastMod(filePath),
            changefreq: getChangefreq(fileName),
            priority: getPriority(fileName)
        };
    });

    // Sort by priority (highest first), then alphabetically
    pages.sort((a, b) => {
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        return a.url.localeCompare(b.url);
    });

    // Generate XML
    const xml = generateXml(pages);

    // Write to file
    const outputPath = path.join(rootDir, CONFIG.outputFile);
    fs.writeFileSync(outputPath, xml, 'utf8');

    console.log(`\nSitemap generated: ${outputPath}`);
    console.log(`Total URLs: ${pages.length}`);
    console.log('\nPages included:');
    pages.forEach(page => {
        console.log(`  ${page.priority} | ${page.changefreq.padEnd(8)} | ${page.url}`);
    });
}

// Run
main();
