const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const cheerio = require('cheerio');
const cssTree = require('css-tree');

const ROOT = process.cwd();
const errors = [];

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

function getLineNumber(content, position) {
    if (position === undefined || position < 0) return null;
    return content.substring(0, position).split('\n').length;
}

function resolvePath(fromFile, href) {
    if (!href || href.startsWith('http://') || href.startsWith('https://') || 
        href.startsWith('mailto:') || href.startsWith('tel:') || 
        href.startsWith('#') || href.startsWith('javascript:') ||
        href.startsWith('data:')) {
        return null;
    }
    
    const dir = path.dirname(fromFile);
    let resolved;
    
    if (href.startsWith('/')) {
        resolved = path.join(ROOT, href);
    } else {
        resolved = path.join(dir, href);
    }
    
    resolved = resolved.split('?')[0].split('#')[0];
    return resolved;
}

function fileExists(filePath) {
    if (fs.existsSync(filePath)) {
        return fs.statSync(filePath).isFile();
    }
    const indexPath = path.join(filePath, 'index.html');
    if (fs.existsSync(indexPath)) {
        return true;
    }
    return false;
}

async function validateHTML(htmlFiles) {
    console.log('\n?? Validating HTML files...');
    
    for (const file of htmlFiles) {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        let fileErrors = 0;
        
        $('a[href]').each((_, el) => {
            const href = $(el).attr('href');
            const resolved = resolvePath(file, href);
            if (resolved && !fileExists(resolved)) {
                const hrefMatch = content.indexOf(`href="${href}"`);
                const line = getLineNumber(content, hrefMatch);
                logError(relPath, line, `Broken link: ${href}`);
                fileErrors++;
            }
        });
        
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

async function validateCSS(cssFiles) {
    console.log('\n?? Validating CSS files...');
    
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
            
            const contextProps = new Map();
            let currentContext = 'global';
            
            cssTree.walk(ast, function(node) {
                if (node.type === 'Atrule' && node.name === 'media') {
                    currentContext = `@media ${cssTree.generate(node.prelude)}`;
                }
                
                if (node.type === 'Rule' && node.prelude && node.block) {
                    const selector = cssTree.generate(node.prelude);
                    const contextKey = `${currentContext}|${selector}`;
                    
                    if (!contextProps.has(contextKey)) {
                        contextProps.set(contextKey, new Map());
                    }
                    const propMap = contextProps.get(contextKey);
                    
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
            
            currentContext = 'global';
            
            // Skip CSS conflict detection for media queries (valid responsive design pattern)
            // Per CLAUDE.md: Ignore media query "conflicts" as they are intentional responsive overrides
            for (const [contextKey, propMap] of contextProps) {
                const parts = contextKey.split('|');
                const context = parts[0];
                const selector = parts.slice(1).join('|');

                // Only check for conflicts in global context, not within media queries
                if (context !== 'global') continue;

                for (const [prop, occurrences] of propMap) {
                    if (occurrences.length > 1) {
                        const uniqueValues = new Set(occurrences.map(o => o.value));
                        if (uniqueValues.size > 1) {
                            const lines = occurrences.map(o => o.line).filter(l => l).join(', ');
                            logError(relPath, occurrences[0].line,
                                `Conflicting values for '${prop}' in '${selector}' (lines: ${lines})`);
                            fileErrors++;
                        }
                    }
                }
            }
            
            cssTree.walk(ast, {
                visit: 'Url',
                enter(node) {
                    let url = node.value;
                    if (typeof url === 'object' && url.value) {
                        url = url.value;
                    }
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

async function checkExternalURLs(htmlFiles) {
    console.log('\n?? Checking external resources...');
    
    const externalURLs = new Map();
    
    for (const file of htmlFiles) {
        const relPath = path.relative(ROOT, file);
        const content = fs.readFileSync(file, 'utf-8');
        const $ = cheerio.load(content);
        
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
                for (const file of files) {
                    logWarn(`External URL returned ${response.status}: ${url}`);
                }
                failed++;
            } else {
                checked++;
            }
        } catch (e) {
            logWarn(`Could not verify external URL: ${url} (${e.message})`);
            checked++;
        }
    }
    
    console.log(`  Checked ${checked + failed} external URLs, ${failed} errors`);
}

async function main() {
    console.log('?? MBC Site Validator');
    console.log('='.repeat(50));
    
    const htmlFiles = await glob('**/*.html', { 
        cwd: ROOT, 
        absolute: true,
        ignore: ['node_modules/**', '.git/**', '.github/**']
    });
    
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
    
    console.log('\n' + '='.repeat(50));
    if (errors.length === 0) {
        console.log(`${GREEN}? All validations passed${RESET}`);
        process.exit(0);
    } else {
        console.log(`${RED}? ${errors.length} error(s) found${RESET}`);
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

