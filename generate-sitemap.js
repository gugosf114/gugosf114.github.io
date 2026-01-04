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

// Configuration
const CONFIG = {
    baseUrl: 'https://mybakingcreations.com',
    outputFile: 'sitemap.xml',

    // Files/folders to exclude
    exclude: [
        'node_modules',
        '.git',
        'order-form-modal.html',  // Modal, not a page
        '404.html'                 // Error page
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
 * Get file modification date
 * @param {string} filePath - Path to file
 * @returns {string} ISO date string (YYYY-MM-DD)
 */
function getLastMod(filePath) {
    const stat = fs.statSync(filePath);
    return stat.mtime.toISOString().split('T')[0];
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

    // Build page data
    const pages = htmlFiles.map(filePath => {
        const fileName = path.basename(filePath);
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
