const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SKIP_FILES = ['buy-now.html'];

// Get all .html files in root directory only (not subdirectories, not node_modules)
const allFiles = fs.readdirSync(ROOT);
const htmlFiles = allFiles.filter(f => {
  if (!f.endsWith('.html')) return false;
  if (SKIP_FILES.includes(f)) return false;
  const stat = fs.statSync(path.join(ROOT, f));
  return stat.isFile();
});

console.log(`Found ${htmlFiles.length} HTML files to process (skipping: ${SKIP_FILES.join(', ')})\n`);

let totalModified = 0;
let totalImgsChanged = 0;

htmlFiles.forEach(file => {
  const filePath = path.join(ROOT, file);
  const original = fs.readFileSync(filePath, 'utf8');
  let html = original;

  // Track whether we are inside a social-sidebar block
  // We need to find img tags NOT inside social-sidebar, NOT the first logo img,
  // NOT the first carousel-slide img, and NOT already having loading="lazy" or loading="eager"

  let foundFirstLogoImg = false;
  let foundFirstCarouselSlideImg = false;
  let changesInFile = 0;
  let skippedInFile = [];

  // We'll process the HTML by finding each <img tag and deciding whether to add loading="lazy"
  // Strategy: use a regex to find all <img ... > tags, then for each match decide:
  //   1. Already has loading="lazy" or loading="eager"? Skip.
  //   2. Inside a social-sidebar div? Skip.
  //   3. First img with src containing "logo"? Skip (header logo).
  //   4. First carousel-slide img? Skip.
  //   5. Otherwise, add loading="lazy".

  // To detect "inside social-sidebar", we look backwards from the img position
  // for the nearest <div class="social-sidebar"> and check if its closing </div> hasn't appeared yet.
  // Simpler approach: find all social-sidebar regions and carousel-slide regions first.

  // Find social-sidebar regions: from <div class="social-sidebar"> to its closing </div>
  function findSocialSidebarRanges(text) {
    const ranges = [];
    const re = /<div\s+class="social-sidebar">/gi;
    let match;
    while ((match = re.exec(text)) !== null) {
      const start = match.index;
      // Find the closing </div> - social-sidebar is a simple flat div with <a> children
      // We need to find the matching </div>. Since the sidebar is simple (no nested divs),
      // we find the next </div> after the opening tag.
      let depth = 1;
      let pos = start + match[0].length;
      while (pos < text.length && depth > 0) {
        const openDiv = text.indexOf('<div', pos);
        const closeDiv = text.indexOf('</div>', pos);
        if (closeDiv === -1) break;
        if (openDiv !== -1 && openDiv < closeDiv) {
          depth++;
          pos = openDiv + 4;
        } else {
          depth--;
          if (depth === 0) {
            ranges.push([start, closeDiv + 6]);
          }
          pos = closeDiv + 6;
        }
      }
    }
    return ranges;
  }

  const socialSidebarRanges = findSocialSidebarRanges(html);

  function isInsideSocialSidebar(position) {
    for (const [start, end] of socialSidebarRanges) {
      if (position >= start && position < end) return true;
    }
    return false;
  }

  // Find first carousel-slide img position
  function findFirstCarouselSlideImgPos(text) {
    // Look for pattern: carousel-slide ... <img
    const re = /carousel-slide[^>]*>[\s]*<img/gi;
    const match = re.exec(text);
    if (match) {
      // Return the position of the <img within this match
      const imgOffset = match[0].lastIndexOf('<img');
      return match.index + imgOffset;
    }
    return -1;
  }

  const firstCarouselSlideImgPos = findFirstCarouselSlideImgPos(html);

  // Now process all <img tags
  // We use a regex that matches <img ... > (self-closing or not)
  const imgRegex = /<img\s[^>]*>/gi;
  let imgMatch;
  const replacements = []; // {start, end, original, replacement}

  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const imgTag = imgMatch[0];
    const imgPos = imgMatch.index;

    // 1. Already has loading= attribute? Skip.
    if (/loading\s*=\s*["'](lazy|eager)["']/i.test(imgTag)) {
      continue;
    }

    // 2. Inside social-sidebar? Skip.
    if (isInsideSocialSidebar(imgPos)) {
      skippedInFile.push('social-sidebar img');
      continue;
    }

    // 3. First img with src containing "logo"? Skip. (header logo)
    if (!foundFirstLogoImg && /src\s*=\s*["'][^"']*logo[^"']*["']/i.test(imgTag)) {
      foundFirstLogoImg = true;
      skippedInFile.push('first logo img');
      continue;
    }

    // 4. First carousel-slide img? Skip.
    if (!foundFirstCarouselSlideImg && firstCarouselSlideImgPos === imgPos) {
      foundFirstCarouselSlideImg = true;
      skippedInFile.push('first carousel-slide img');
      continue;
    }

    // 5. Add loading="lazy" - insert it after <img
    const newTag = imgTag.replace(/^<img\s/, '<img loading="lazy" ');
    replacements.push({
      start: imgPos,
      end: imgPos + imgTag.length,
      original: imgTag,
      replacement: newTag
    });
    changesInFile++;
  }

  // Apply replacements in reverse order so positions stay valid
  if (replacements.length > 0) {
    let modified = html;
    for (let i = replacements.length - 1; i >= 0; i--) {
      const r = replacements[i];
      modified = modified.substring(0, r.start) + r.replacement + modified.substring(r.end);
    }
    fs.writeFileSync(filePath, modified, 'utf8');
    totalModified++;
    totalImgsChanged += changesInFile;
    console.log(`${file}: ${changesInFile} img(s) updated` + (skippedInFile.length > 0 ? ` (skipped: ${skippedInFile.join(', ')})` : ''));
  } else {
    console.log(`${file}: no changes needed` + (skippedInFile.length > 0 ? ` (skipped: ${skippedInFile.join(', ')})` : ''));
  }
});

console.log(`\n--- SUMMARY ---`);
console.log(`Files processed: ${htmlFiles.length}`);
console.log(`Files modified: ${totalModified}`);
console.log(`Total img tags updated: ${totalImgsChanged}`);
