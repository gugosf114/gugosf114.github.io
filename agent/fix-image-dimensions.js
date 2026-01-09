/**
 * Image Dimension Fixer
 *
 * Scans all HTML files and adds width/height attributes to <img> tags
 * based on actual file dimensions.
 *
 * Usage:
 *   node agent/fix-image-dimensions.js           # Dry run - shows diff only
 *   node agent/fix-image-dimensions.js --apply   # Actually modify files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if we should apply changes or just show diff
const DRY_RUN = !process.argv.includes('--apply');

// Track stats
const stats = {
  filesScanned: 0,
  imagesFound: 0,
  imagesFixed: 0,
  imagesSkipped: 0,
  imagesMissingFile: 0,
  errors: []
};

// ANSI colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  dim: '\x1b[2m'
};

console.log(`\n${colors.cyan}📐 Image Dimension Fixer${colors.reset}`);
console.log(`${colors.dim}${'='.repeat(50)}${colors.reset}`);
console.log(`Mode: ${DRY_RUN ? `${colors.yellow}DRY RUN${colors.reset} (no files will be modified)` : `${colors.red}APPLY${colors.reset} (files will be modified)`}\n`);

/**
 * Get image dimensions using file analysis
 */
function getImageDimensions(imagePath) {
  try {
    if (!fs.existsSync(imagePath)) {
      return null;
    }

    const buffer = fs.readFileSync(imagePath);

    // PNG: dimensions at bytes 16-24
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    // JPEG: need to parse segments
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      let offset = 2;
      while (offset < buffer.length) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];

        // SOF markers (Start of Frame) contain dimensions
        if (marker >= 0xC0 && marker <= 0xCF && marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }

        // Skip to next segment
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
    }

    // GIF: dimensions at bytes 6-10
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height };
    }

    // WebP
    if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
      // VP8 format
      if (buffer.toString('ascii', 12, 16) === 'VP8 ') {
        const width = buffer.readUInt16LE(26) & 0x3FFF;
        const height = buffer.readUInt16LE(28) & 0x3FFF;
        return { width, height };
      }
      // VP8L format (lossless)
      if (buffer.toString('ascii', 12, 16) === 'VP8L') {
        const bits = buffer.readUInt32LE(21);
        const width = (bits & 0x3FFF) + 1;
        const height = ((bits >> 14) & 0x3FFF) + 1;
        return { width, height };
      }
      // VP8X format (extended)
      if (buffer.toString('ascii', 12, 16) === 'VP8X') {
        const width = ((buffer[24] | (buffer[25] << 8) | (buffer[26] << 16)) & 0xFFFFFF) + 1;
        const height = ((buffer[27] | (buffer[28] << 8) | (buffer[29] << 16)) & 0xFFFFFF) + 1;
        return { width, height };
      }
    }

    // SVG - try to parse viewBox or width/height
    if (buffer.toString('utf8', 0, 5).includes('<?xml') || buffer.toString('utf8', 0, 4) === '<svg') {
      const svgContent = buffer.toString('utf8');

      // Try viewBox first
      const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/);
      if (viewBoxMatch) {
        const [, , , w, h] = viewBoxMatch[1].split(/\s+/);
        if (w && h) {
          return { width: Math.round(parseFloat(w)), height: Math.round(parseFloat(h)) };
        }
      }

      // Try width/height attributes
      const widthMatch = svgContent.match(/width=["'](\d+)/);
      const heightMatch = svgContent.match(/height=["'](\d+)/);
      if (widthMatch && heightMatch) {
        return { width: parseInt(widthMatch[1]), height: parseInt(heightMatch[1]) };
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

/**
 * Find all HTML files
 */
function findHtmlFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules and hidden directories
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      files.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && /\.(html|htm|jsx|tsx)$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Resolve image path relative to HTML file
 */
function resolveImagePath(imgSrc, htmlFilePath, rootDir) {
  // Skip external URLs and data URIs
  if (imgSrc.startsWith('http://') || imgSrc.startsWith('https://') || imgSrc.startsWith('data:')) {
    return null;
  }

  // Remove leading slash for absolute paths (relative to root)
  if (imgSrc.startsWith('/')) {
    return path.join(rootDir, imgSrc);
  }

  // Relative path - resolve from HTML file location
  const htmlDir = path.dirname(htmlFilePath);
  return path.join(htmlDir, imgSrc);
}

/**
 * Process a single HTML file
 */
function processHtmlFile(filePath, rootDir) {
  const relativePath = path.relative(rootDir, filePath);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  let fileChanges = [];

  stats.filesScanned++;

  // Match all img tags
  const imgRegex = /<img\s+([^>]*?)\/?>/gi;
  let match;

  while ((match = imgRegex.exec(originalContent)) !== null) {
    stats.imagesFound++;

    const fullMatch = match[0];
    const attributes = match[1];

    // Skip if already has both width and height
    const hasWidth = /\bwidth\s*=/i.test(attributes);
    const hasHeight = /\bheight\s*=/i.test(attributes);

    if (hasWidth && hasHeight) {
      stats.imagesSkipped++;
      continue;
    }

    // Extract src
    const srcMatch = attributes.match(/src\s*=\s*["']([^"']+)["']/i);
    if (!srcMatch) {
      stats.imagesSkipped++;
      continue;
    }

    const imgSrc = srcMatch[1];
    const imgPath = resolveImagePath(imgSrc, filePath, rootDir);

    if (!imgPath) {
      stats.imagesSkipped++; // External URL or data URI
      continue;
    }

    const dimensions = getImageDimensions(imgPath);

    if (!dimensions) {
      stats.imagesMissingFile++;
      stats.errors.push(`${relativePath}: Cannot read dimensions for "${imgSrc}"`);
      continue;
    }

    // Build new attributes
    let newAttributes = attributes;

    if (!hasWidth) {
      // Add width before src or at the end
      if (newAttributes.includes('src=')) {
        newAttributes = newAttributes.replace(/src=/i, `width="${dimensions.width}" src=`);
      } else {
        newAttributes += ` width="${dimensions.width}"`;
      }
    }

    if (!hasHeight) {
      // Add height after width
      if (newAttributes.includes('width=')) {
        newAttributes = newAttributes.replace(/width="(\d+)"/i, `width="$1" height="${dimensions.height}"`);
      } else {
        newAttributes += ` height="${dimensions.height}"`;
      }
    }

    // Reconstruct img tag
    const selfClosing = fullMatch.endsWith('/>') ? '/>' : '>';
    const newImgTag = `<img ${newAttributes.trim()}${selfClosing}`;

    if (newImgTag !== fullMatch) {
      content = content.replace(fullMatch, newImgTag);
      stats.imagesFixed++;

      fileChanges.push({
        old: fullMatch.length > 80 ? fullMatch.substring(0, 77) + '...' : fullMatch,
        new: newImgTag.length > 80 ? newImgTag.substring(0, 77) + '...' : newImgTag,
        src: imgSrc,
        dimensions
      });
    }
  }

  // Output diff for this file
  if (fileChanges.length > 0) {
    console.log(`\n${colors.blue}📄 ${relativePath}${colors.reset} (${fileChanges.length} changes)`);

    for (const change of fileChanges) {
      console.log(`   ${colors.dim}${change.src}${colors.reset} → ${colors.green}${change.dimensions.width}x${change.dimensions.height}${colors.reset}`);
      console.log(`   ${colors.red}- ${change.old}${colors.reset}`);
      console.log(`   ${colors.green}+ ${change.new}${colors.reset}`);
    }

    // Write changes if not dry run
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }

  return fileChanges.length;
}

// Main execution
const rootDir = process.cwd();
const htmlFiles = findHtmlFiles(rootDir);

console.log(`Found ${htmlFiles.length} HTML files to scan...\n`);

let totalChanges = 0;
for (const file of htmlFiles) {
  totalChanges += processHtmlFile(file, rootDir);
}

// Summary
console.log(`\n${colors.dim}${'='.repeat(50)}${colors.reset}`);
console.log(`${colors.cyan}📊 Summary${colors.reset}\n`);
console.log(`   Files scanned:     ${stats.filesScanned}`);
console.log(`   Images found:      ${stats.imagesFound}`);
console.log(`   ${colors.green}Images fixed:       ${stats.imagesFixed}${colors.reset}`);
console.log(`   Already have dims: ${stats.imagesSkipped}`);
console.log(`   Missing files:     ${stats.imagesMissingFile}`);

if (stats.errors.length > 0 && stats.errors.length <= 10) {
  console.log(`\n${colors.yellow}⚠️  Warnings:${colors.reset}`);
  for (const err of stats.errors) {
    console.log(`   ${colors.dim}${err}${colors.reset}`);
  }
} else if (stats.errors.length > 10) {
  console.log(`\n${colors.yellow}⚠️  ${stats.errors.length} warnings (showing first 10):${colors.reset}`);
  for (const err of stats.errors.slice(0, 10)) {
    console.log(`   ${colors.dim}${err}${colors.reset}`);
  }
}

if (DRY_RUN) {
  console.log(`\n${colors.yellow}🔍 DRY RUN - No files were modified${colors.reset}`);
  console.log(`   Run with --apply to make changes:\n`);
  console.log(`   ${colors.cyan}node agent/fix-image-dimensions.js --apply${colors.reset}\n`);
} else {
  console.log(`\n${colors.green}✅ Changes applied to ${totalChanges} images${colors.reset}\n`);
}
