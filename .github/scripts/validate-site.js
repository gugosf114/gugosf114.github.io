const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const cssTree = require('css-tree');

const ROOT = process.cwd();
const errors = [];

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

// Check if file exists (handles directory index.html)
function fileExists(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).isFile();
    }
    // Check for index.html if it's a directory path
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
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
            
            // Track selectors and their properties for duplicate detection
            const selectorProps = new Map(); // selector -> Map(property -> [{value, line}])
            
            cssTree.walk(ast, {
                visit: 'Rule',
                enter(node) {
                    if (node.prelude && node.block) {
                        const selector = cssTree.generate(node.prelude);
                        
                        if (!selectorProps.has(selector)) {
                            selectorProps.set(selector, new Map());
                        }
                        const propMap = selectorProps.get(selector);
                        
                        cssTree.walk(node.block, {
                            visit: 'Declaration',
                            enter(decl) {
                                const prop = decl.property;
                                const value = cssTree.generate(decl.value);
                                const line = decl.loc?.start?.line;
                                
                                if (!propMap.has(prop)) {
                                    propMap.set(prop, []);
                                }
                                propMap.get(prop).push({ value, line });
                            }
                        });
                    }
                }
            });
            
            // Check for duplicate properties with conflicting values
            for (const [selector, propMap] of selectorProps) {
                for (const [prop, occurrences] of propMap) {
                    if (occurrences.length > 1) {
                        // Check if values actually conflict
                        const uniqueValues = new Set(occurrences.map(o => o.value));
                        if (uniqueValues.size > 1) {
                            const lines = occurrences.map(o => o.line).filter(l => l).join(', ');
                            logError(relPath, occurrences[0].line, 
                                `Conflicting values for '${prop}' in '${selector}' (lines: ${lines})`);
                            fileErrors++;
                        } else if (occurrences.length > 1) {
                            // Same value duplicated - warning only
                            logWarn(`${relPath}: Duplicate '${prop}' in '${selector}' (identical values)`);
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

// Check external URLs (with timeout, non-blocking warnings)
async function checkExternalURLs(htmlFiles) {
    console.log('\n🌐 Checking external resources...');
    
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
    let failed = 0;
    
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
                // 405 = Method Not Allowed (some servers reject HEAD)
                for (const file of files) {
                    logError(file, null, `External URL returned ${response.status}: ${url}`);
                }
                failed++;
            } else {
                checked++;
            }
        } catch (e) {
            // Timeouts and network errors are warnings, not errors
            // (external sites can be flaky)
            logWarn(`Could not verify external URL: ${url} (${e.message})`);
            checked++;
        }
    }
    
    console.log(`  Checked ${checked + failed} external URLs, ${failed} errors`);
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
    if (errors.length === 0) {
        console.log(`${GREEN}✓ All validations passed${RESET}`);
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
