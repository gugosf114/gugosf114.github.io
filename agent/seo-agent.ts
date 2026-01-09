/**
 * All-in-One SEO Agent for mybakingcreations.com
 *
 * This agent performs comprehensive SEO tasks:
 * 1. AUDIT - Scans for broken links, missing meta tags, schema errors, image issues
 * 2. OPTIMIZE - Analyzes content and suggests improvements
 * 3. RESEARCH - Spies on competitors and finds keyword opportunities
 *
 * Usage:
 *   npx tsx agent/seo-agent.ts audit          # Run full site audit
 *   npx tsx agent/seo-agent.ts optimize       # Get optimization suggestions
 *   npx tsx agent/seo-agent.ts research       # Competitor & keyword research
 *   npx tsx agent/seo-agent.ts full           # Run everything
 */

import { query } from '@anthropic-ai/claude-agent-sdk';
import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = 'https://mybakingcreations.com';
const SITE_DIR = path.join(process.cwd());

// ============================================================================
// SYSTEM PROMPTS FOR EACH MODE
// ============================================================================

const AUDIT_PROMPT = `You are an expert SEO auditor for mybakingcreations.com, a custom bakery website.

YOUR MISSION: Thoroughly audit the website for SEO issues.

AUDIT CHECKLIST:
1. **Meta Tags** - Check every HTML file for:
   - Title tag (exists, unique, 50-60 chars)
   - Meta description (exists, unique, 150-160 chars)
   - Canonical URL (exists, correct)
   - Open Graph tags (og:title, og:description, og:image)
   - Twitter card tags

2. **Schema Markup** - Validate JSON-LD:
   - LocalBusiness/Bakery schema on homepage
   - BreadcrumbList on subpages
   - Product schema on product pages
   - Check for errors in schema syntax

3. **Images** - Check for:
   - Missing alt text
   - Images without width/height (CLS issues)
   - Large unoptimized images
   - Broken image links

4. **Links** - Find:
   - Broken internal links (404s)
   - Broken external links
   - Missing rel="noopener" on external links
   - Orphan pages (no internal links pointing to them)

5. **Technical SEO**:
   - robots.txt correctness
   - sitemap.xml - all pages included?
   - Mobile viewport meta tag
   - Page speed issues (large files, render-blocking)

6. **Content Issues**:
   - Duplicate title tags across pages
   - Duplicate meta descriptions
   - Thin content pages
   - Missing H1 tags or multiple H1s

OUTPUT FORMAT:
Create a detailed report as a markdown file at: agent/reports/seo-audit-[DATE].md

Structure the report as:
# SEO Audit Report - [DATE]

## 🔴 Critical Issues (Fix Immediately)
## 🟡 Warnings (Should Fix)
## 🟢 Passed Checks
## 📊 Summary Stats

Be specific - include file names, line numbers, and exact issues found.`;

const OPTIMIZE_PROMPT = `You are an expert SEO content optimizer for mybakingcreations.com, a custom bakery in the San Francisco Bay Area.

YOUR MISSION: Analyze content and provide specific optimization suggestions.

OPTIMIZATION AREAS:

1. **Title Tag Optimization**:
   - Are titles compelling and click-worthy?
   - Do they include target keywords?
   - Are they the right length (50-60 chars)?
   - Suggest improved titles for each page

2. **Meta Description Optimization**:
   - Are descriptions compelling with a call-to-action?
   - Do they include target keywords naturally?
   - Are they the right length (150-160 chars)?
   - Suggest improved descriptions

3. **Keyword Opportunities**:
   - What keywords should each page target?
   - Are keywords in H1, H2, first paragraph?
   - Suggest keyword additions for each page
   - Local keywords: "custom cakes [city]", "bakery near me", etc.

4. **Content Gaps**:
   - What topics are missing that competitors cover?
   - What questions do customers ask that aren't answered?
   - Suggest new blog post ideas
   - Suggest new landing page ideas

5. **Internal Linking**:
   - Are pages well-connected?
   - Suggest internal links to add
   - Identify pages that need more internal links

6. **Local SEO**:
   - Are location pages optimized?
   - Google Business Profile optimization tips
   - Local keyword suggestions per city

OUTPUT FORMAT:
Create a detailed recommendations file at: agent/reports/seo-optimizations-[DATE].md

Structure as:
# SEO Optimization Recommendations - [DATE]

## Page-by-Page Recommendations
### index.html
- Current Title: "..."
- Suggested Title: "..."
- Current Description: "..."
- Suggested Description: "..."
- Keyword Opportunities: ...
- Internal Links to Add: ...

## New Content Ideas
## Local SEO Improvements
## Priority Actions (Top 10)`;

const RESEARCH_PROMPT = `You are an expert SEO researcher and competitive analyst for mybakingcreations.com.

YOUR MISSION: Research competitors and find keyword opportunities.

RESEARCH TASKS:

1. **Competitor Analysis** - Search for and analyze:
   - Other custom cake bakeries in San Francisco Bay Area
   - Their website structure and content
   - What keywords they rank for
   - Their backlink sources
   - Their content strategy (blog topics, etc.)

2. **Keyword Research** - Find opportunities:
   - High-volume keywords for custom cakes, cookies, cake pops
   - Long-tail keywords with less competition
   - Local keywords for each city served
   - Seasonal keywords (wedding season, holidays, etc.)
   - Question-based keywords (how to, what is, etc.)

3. **Content Gap Analysis**:
   - What do competitors write about that we don't?
   - What questions appear in "People Also Ask"?
   - What's trending in the baking/cake industry?

4. **Backlink Opportunities**:
   - Where do competitors get backlinks?
   - Local directories we should be listed in
   - Wedding/event planning sites for partnerships
   - Food blogs for potential features

5. **SERP Analysis**:
   - Search for main keywords and analyze results
   - What type of content ranks? (lists, guides, galleries)
   - Featured snippet opportunities
   - Local pack optimization

SEARCH QUERIES TO RUN:
- "custom cakes San Francisco"
- "custom birthday cakes Bay Area"
- "wedding cake bakery San Jose"
- "best bakery Palo Alto"
- "corporate event desserts San Francisco"
- Competitor names + reviews

OUTPUT FORMAT:
Create a research report at: agent/reports/seo-research-[DATE].md

Structure as:
# SEO Research Report - [DATE]

## Competitor Analysis
### [Competitor 1]
- Website: ...
- Strengths: ...
- Weaknesses: ...
- Keywords they rank for: ...

## Keyword Opportunities
### High Priority Keywords
### Long-Tail Opportunities
### Local Keywords by City

## Content Ideas from Research
## Backlink Opportunities
## Action Items (Prioritized)`;

const FULL_PROMPT = `You are an all-in-one SEO expert for mybakingcreations.com.

YOUR MISSION: Perform a comprehensive SEO analysis including:
1. Full site audit (technical issues, broken links, missing tags)
2. Content optimization recommendations
3. Competitor and keyword research

Work through each phase systematically:

PHASE 1 - AUDIT:
- Read through HTML files and check for SEO issues
- Validate schema markup
- Check for broken links and image issues
- Review robots.txt and sitemap.xml

PHASE 2 - OPTIMIZE:
- Analyze each page's title and meta description
- Suggest improvements with specific rewrites
- Identify keyword opportunities
- Suggest internal linking improvements

PHASE 3 - RESEARCH:
- Search for competitor bakeries
- Research keyword opportunities
- Find content gaps and backlink opportunities

OUTPUT:
Create a comprehensive report at: agent/reports/seo-full-report-[DATE].md

The report should be actionable with specific file names, line numbers, and exact changes to make.
Prioritize findings by impact (critical, important, nice-to-have).`;

// ============================================================================
// AGENT RUNNER
// ============================================================================

async function runSEOAgent(mode: 'audit' | 'optimize' | 'research' | 'full') {
  const date = new Date().toISOString().split('T')[0];

  // Ensure reports directory exists
  const reportsDir = path.join(process.cwd(), 'agent', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Select the appropriate prompt
  let systemPrompt: string;
  let taskPrompt: string;

  switch (mode) {
    case 'audit':
      systemPrompt = AUDIT_PROMPT;
      taskPrompt = `Perform a comprehensive SEO audit of mybakingcreations.com.
The site files are in the current directory. Read HTML files to analyze meta tags, schema, images, and links.
Save your report to: agent/reports/seo-audit-${date}.md`;
      break;
    case 'optimize':
      systemPrompt = OPTIMIZE_PROMPT;
      taskPrompt = `Analyze mybakingcreations.com and provide detailed optimization recommendations.
Read the HTML files to understand current content, then suggest specific improvements.
Save your report to: agent/reports/seo-optimizations-${date}.md`;
      break;
    case 'research':
      systemPrompt = RESEARCH_PROMPT;
      taskPrompt = `Research competitors and keyword opportunities for mybakingcreations.com (custom bakery in SF Bay Area).
Use web search to find competitors, analyze their strategies, and identify opportunities.
Save your report to: agent/reports/seo-research-${date}.md`;
      break;
    case 'full':
      systemPrompt = FULL_PROMPT;
      taskPrompt = `Perform a complete SEO analysis of mybakingcreations.com including audit, optimization, and research.
Site files are in the current directory. Use web search for competitor research.
Save your comprehensive report to: agent/reports/seo-full-report-${date}.md`;
      break;
  }

  console.log(`\n🔍 SEO Agent - ${mode.toUpperCase()} Mode\n`);
  console.log('='.repeat(60));
  console.log(`Site: ${SITE_URL}`);
  console.log(`Report will be saved to: agent/reports/`);
  console.log('='.repeat(60) + '\n');

  const q = query({
    prompt: taskPrompt,
    options: {
      maxTurns: 50,
      cwd: process.cwd(),
      model: 'sonnet',
      allowedTools: [
        'Read',           // Read HTML files
        'Glob',           // Find files
        'Grep',           // Search in files
        'Write',          // Write report
        'WebSearch',      // Research competitors
        'WebFetch',       // Fetch competitor pages
        'Bash',           // Run validation tools if needed
      ],
      systemPrompt,
    },
  });

  // Stream the agent's work
  for await (const msg of q) {
    if (msg.type === 'assistant' && msg.message) {
      for (const block of msg.message.content) {
        if (block.type === 'text') {
          console.log(block.text);
        }
        if (block.type === 'tool_use') {
          const input = block.input as Record<string, unknown>;
          if (block.name === 'WebSearch' && input?.query) {
            console.log(`\n🔍 Searching: "${input.query}"`);
          } else if (block.name === 'Read' && input?.file_path) {
            const filePath = String(input.file_path);
            console.log(`\n📄 Reading: ${path.basename(filePath)}`);
          } else if (block.name === 'Write' && input?.file_path) {
            const filePath = String(input.file_path);
            console.log(`\n💾 Writing: ${path.basename(filePath)}`);
          } else if (block.name === 'Glob') {
            console.log(`\n🔎 Finding files...`);
          } else if (block.name === 'Grep' && input?.pattern) {
            console.log(`\n🔎 Searching for: "${input.pattern}"`);
          } else {
            console.log(`\n🔧 ${block.name}`);
          }
        }
      }
    }
    if (msg.type === 'result' && msg.subtype === 'tool_result') {
      // Show truncated results
      const resultStr = JSON.stringify(msg.content).slice(0, 150);
      console.log(`   ↳ ${resultStr}${resultStr.length >= 150 ? '...' : ''}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ SEO Agent completed!');
  console.log(`📊 Check agent/reports/ for your report`);
  console.log('='.repeat(60) + '\n');
}

// ============================================================================
// CLI
// ============================================================================

const mode = process.argv[2] as 'audit' | 'optimize' | 'research' | 'full';

if (!mode || !['audit', 'optimize', 'research', 'full'].includes(mode)) {
  console.log(`
🔍 SEO Agent for mybakingcreations.com

Usage:
  npx tsx agent/seo-agent.ts <mode>

Modes:
  audit     - Scan for broken links, missing tags, schema errors
  optimize  - Get title/description improvements, keyword suggestions
  research  - Competitor analysis, keyword opportunities
  full      - Run all of the above (comprehensive)

Examples:
  npx tsx agent/seo-agent.ts audit
  npx tsx agent/seo-agent.ts full
`);
  process.exit(1);
}

runSEOAgent(mode).catch(console.error);
