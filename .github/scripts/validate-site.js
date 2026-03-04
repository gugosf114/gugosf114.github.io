const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const cssTree = require('css-tree');

const ROOT = process.cwd();
const errors = [];
let warnCount = 0;

// ANSI colors for output
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

function logError(file, line, message) {
    const loc = line ? `:${line}` : '';
    errors.push({ file, line, message });
    console.error(`${RED}ERROR${RESET} ${file}${loc}: ${message}`);
}

function logWarn(message) {
    warnCount++;
    console.log(`${YELLOW}WARN${RESET} ${message}`);
}

function logPass(message) {
    console.log(`${GREEN}PASS${RESET} ${message}`);
}

// Get line number from character position in content
function getLineNumber(content, position) {
    if (position === undefined || position < 0) return null;
    return content.substring(0, position).split('\n').length;
}

// Resolve a relative path from an HTML file
function resolvePath(fromFile, href) {
    if (!href || href.startsWith('http://') || href.startsWith('https://') ||
        href.startsWith('mailto:') || href.startsWith('tel:') ||
        href.startsWith('#') || href.startsWith('javascript:') ||
        href.startsWith('data:')) {
        return null; // External or special link
    }

    const dir = path.dirname(fromFile);
    let resolved;

    if (href.startsWith('/')) {
        // Absolute path from root
        resolved = path.join(ROOT, href);
    } else {
        // Relative path
        resolved = path.join(dir, href);
    }

    // Remove query strings and anchors for file existence check
    resolved = resolved.split('?')[0].split('#')[0];

    return resolved;
}

// Check if file exists (handles GitHub Pages URL resolution)
// GitHub Pages resolves: /about → about.html, / → index.html, /dir/ → dir/index.html
function fileExists(filePath) {
    if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        if (stat.isFile()) return true;
        // It's a directory — check for index.html inside it
        if (stat.isDirectory()) {
            const indexPath = path.join(filePath, 'index.html');
            return fs.existsSync(indexPath);
        }
    }
    // GitHub Pages resolution: try appending .html (e.g., /about → about.html)
    const withHtml = filePath + '.html';
    if (fs.existsSync(withHtml) && fs.statSync(withHtml).isFile()) {
        return true;
    }
    return false;
}

// Validate HTML files
async function validateHTML(htmlFiles) {
    console.log('\n📄 Validating HTML files...');

    for (const file of htmlFiles) {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        let fileErrors = 0;

        // Check internal links (href attributes)
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            const resolved = resolvePath(file, href);

            if (resolved && !fileExists(resolved)) {
                // Find approximate line number
                const hrefMatch = content.indexOf(`href="${href}"`);
                const line = getLineNumber(content, hrefMatch);
                logError(relPath, line, `Broken link: ${href}`);
                fileErrors++;
            }
        });

        // Check images (src attributes)
        $('img[src]').each((_, el) => {
            const src = $(el).attr('src');
            const resolved = resolvePath(file, src);

            if (resolved && !fileExists(resolved)) {
                const srcMatch = content.indexOf(`src="${src}"`);
                const line = getLineNumber(content, srcMatch);
                logError(relPath, line, `Missing image: ${src}`);
                fileErrors++;
            }
        });

        // Check CSS links
        $('link[rel="stylesheet"][href]').each((_, el) => {
            const href = $(el).attr('href');
            const resolved = resolvePath(file, href);

            if (resolved && !fileExists(resolved)) {
                const hrefMatch = content.indexOf(`href="${href}"`);
                const line = getLineNumber(content, hrefMatch);
                logError(relPath, line, `Missing stylesheet: ${href}`);
                fileErrors++;
            }
        });

        // Check script sources
        $('script[src]').each((_, el) => {
            const src = $(el).attr('src');
            const resolved = resolvePath(file, src);

            if (resolved && !fileExists(resolved)) {
                const srcMatch = content.indexOf(`src="${src}"`);
                const line = getLineNumber(content, srcMatch);
                logError(relPath, line, `Missing script: ${src}`);
                fileErrors++;
            }
        });

        // Check background images in inline styles
        $('[style*="url("]').each((_, el) => {
            const style = $(el).attr('style');
            const urlMatch = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
            if (urlMatch) {
                const url = urlMatch[1];
                const resolved = resolvePath(file, url);
                if (resolved && !fileExists(resolved)) {
                    const styleMatch = content.indexOf(style);
                    const line = getLineNumber(content, styleMatch);
                    logError(relPath, line, `Missing background image: ${url}`);
                    fileErrors++;
                }
            }
        });

        if (fileErrors === 0) {
            logPass(relPath);
        }
    }
}

// Validate CSS files
async function validateCSS(cssFiles) {
    console.log('\n🎨 Validating CSS files...');

    for (const file of cssFiles) {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, 'utf-8');
        let fileErrors = 0;

        try {
            const ast = cssTree.parse(content, {
                positions: true,
                onParseError: (error) => {
                    logError(relPath, error.line, `CSS syntax error: ${error.message}`);
                    fileErrors++;
                }
            });

            // Track selectors scoped by @media context to avoid false positives
            // from responsive overrides (same selector, different breakpoints = intentional).
            // Key: "mediaContext|selector" → Map(property → [{value, line}])
            const selectorProps = new Map();

            // Helper: process direct-child rules of a block, tagged with media context
            function collectDirectRules(children, mediaContext) {
                children.forEach(node => {
                    if (node.type === 'Rule' && node.prelude && node.block) {
                        const selector = cssTree.generate(node.prelude);
                        const key = `${mediaContext}|${selector}`;

                        if (!selectorProps.has(key)) {
                            selectorProps.set(key, { selector, media: mediaContext, props: new Map() });
                        }
                        const propMap = selectorProps.get(key).props;

                        // Only collect direct declarations (not nested rules)
                        node.block.children.forEach(child => {
                            if (child.type === 'Declaration') {
                                const prop = child.property;
                                const value = cssTree.generate(child.value);
                                const line = child.loc?.start?.line;
                                if (!propMap.has(prop)) {
                                    propMap.set(prop, []);
                                }
                                propMap.get(prop).push({ value, line });
                            }
                        });
                    }
                });
            }

            // Collect top-level rules (global scope — direct children of stylesheet)
            collectDirectRules(ast.children, 'global');

            // Collect rules inside each @media block (scoped by media query)
            ast.children.forEach(node => {
                if (node.type === 'Atrule' && node.name === 'media' && node.block) {
                    const mediaQuery = node.prelude ? cssTree.generate(node.prelude) : 'unknown';
                    collectDirectRules(node.block.children, `@media ${mediaQuery}`);
                }
            });

            // Check for duplicate properties with conflicting values (within same scope only)
            for (const [, { selector, media, props: propMap }] of selectorProps) {
                for (const [prop, occurrences] of propMap) {
                    if (occurrences.length > 1) {
                        const uniqueValues = new Set(occurrences.map(o => o.value));
                        const scope = media === 'global' ? '' : ` [${media}]`;
                        if (uniqueValues.size > 1) {
                            const lines = occurrences.map(o => o.line).filter(l => l).join(', ');
                            logError(relPath, occurrences[0].line,
                                `Conflicting values for '${prop}' in '${selector}'${scope} (lines: ${lines})`);
                            fileErrors++;
                        } else {
                            logWarn(`${relPath}: Duplicate '${prop}' in '${selector}'${scope} (identical values)`);
                        }
                    }
                }
            }

            // Check for url() references in CSS
            cssTree.walk(ast, {
                visit: 'Url',
                enter(node) {
                    let url = node.value;
                    if (typeof url === 'object' && url.value) {
                        url = url.value;
                    }
                    // Remove quotes if present
                    url = url.replace(/^['"]|['"]$/g, '');

                    const resolved = resolvePath(file, url);
                    if (resolved && !fileExists(resolved)) {
                        const line = node.loc?.start?.line;
                        logError(relPath, line, `Missing resource: ${url}`);
                        fileErrors++;
                    }
                }
            });

        } catch (e) {
            logError(relPath, null, `Failed to parse CSS: ${e.message}`);
            fileErrors++;
        }

        if (fileErrors === 0) {
            logPass(relPath);
        }
    }
}

// Check external URLs (non-blocking — warnings only, never fails the build)
async function checkExternalURLs(htmlFiles) {
    console.log('\n🌐 Checking external resources (non-blocking)...');

    const externalURLs = new Map(); // url -> [files that reference it]

    for (const file of htmlFiles) {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);

        // Collect external URLs
        $('a[href^="http"], link[href^="http"], script[src^="http"], img[src^="http"]').each((_, el) => {
            const url = $(el).attr('href') || $(el).attr('src');
            if (url) {
                if (!externalURLs.has(url)) {
                    externalURLs.set(url, []);
                }
                externalURLs.get(url).push(relPath);
            }
        });
    }

    if (externalURLs.size === 0) {
        console.log('  No external URLs found.');
        return;
    }

    // Check each unique external URL (with timeout)
    const TIMEOUT = 5000;
    let checked = 0;
    let warned = 0;

    for (const [url, files] of externalURLs) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), TIMEOUT);

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal,
                redirect: 'follow'
            });

            clearTimeout(timeout);

            if (!response.ok && response.status !== 405) {
                // Non-blocking: external site issues are warnings, not errors
                // (Yelp 403s, Google Fonts flakiness, etc. should never block a deploy)
                for (const file of files) {
                    logWarn(`${file}: External URL returned ${response.status}: ${url}`);
                }
                warned++;
            } else {
                checked++;
            }
        } catch (e) {
            // Timeouts and network errors are warnings
            logWarn(`Could not verify external URL: ${url} (${e.message})`);
            checked++;
        }
    }

    console.log(`  Checked ${checked + warned} external URLs, ${warned} warnings`);
}

// Main
async function main() {
    console.log('🔍 MBC Site Validator');
    console.log('='.repeat(50));

    // Find all HTML files
    const htmlFiles = await glob('**/*.html', {
        cwd: ROOT,
        absolute: true,
        ignore: ['node_modules/**', '.git/**', '.github/**']
    });

    // Find all CSS files
    const cssFiles = await glob('**/*.css', {
        cwd: ROOT,
        absolute: true,
        ignore: ['node_modules/**', '.git/**', '.github/**']
    });

    console.log(`Found ${htmlFiles.length} HTML files, ${cssFiles.length} CSS files`);

    if (htmlFiles.length === 0) {
        logError('site', null, 'No HTML files found in repository');
    }

    await validateHTML(htmlFiles);
    await validateCSS(cssFiles);
    await checkExternalURLs(htmlFiles);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log(`  errors: ${errors.length}  |  warnings: ${warnCount}`);
    if (errors.length === 0) {
        console.log(`${GREEN}✓ All validations passed${RESET}`);
        if (warnCount > 0) {
            console.log(`${YELLOW}  (${warnCount} non-blocking warnings — review if count increases)${RESET}`);
        }
        process.exit(0);
    } else {
        console.log(`${RED}✗ ${errors.length} error(s) found${RESET}`);
        console.log('\nErrors summary:');
        errors.forEach(e => {
            const loc = e.line ? `:${e.line}` : '';
            console.log(`  ${e.file}${loc}: ${e.message}`);
        });
        process.exit(1);
    }
}

main().catch(e => {
    console.error(`${RED}FATAL${RESET}: ${e.message}`);
    process.exit(1);
});
