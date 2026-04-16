# My Baking Creations

**www.mybakingcreations.com** — Custom cakes, cookies, cake pops & cupcakes serving the San Francisco Bay Area since 2012.

Built by George Abrahamyan. Baked by Yana.

## Tech Stack

- **Hosting**: GitHub Pages (`gugosf114.github.io`)
- **Domain**: mybakingcreations.com (via CNAME)
- **CSS**: Single `style.css` (~5,000 lines), CSS custom properties, fully responsive (375px–1100px+)
- **JS**: Vanilla JavaScript, no frameworks
- **Fonts**: Google Fonts (Nunito, Fredoka One)
- **Analytics**: Google Analytics (GA4) + Google Tag Manager
- **Forms**: Web3Forms + Google reCAPTCHA
- **Chatbot**: Cloudflare Worker backend
- **Internal Dashboard**: Firebase Realtime Database + Firebase Storage (thursday/)
- **Images**: All WebP format (converted via `convert-to-webp.py`, quality 82)
- **SEO**: Schema.org structured data, Open Graph, Twitter Cards, sitemap.xml
- **Dev Dependencies**: Node.js (cheerio, css-tree, glob, sharp, png-to-ico)

## Brand Colors

| Color        | Hex       |
|--------------|-----------|
| Pink         | `#EC268F` |
| Yellow       | `#FFC532` |
| Orange/Brown | `#C36239` |
| Dark Brown   | `#622D2B` |
| Cream        | `#9A9590` |

## Pages (44 total)

### Core Pages
| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero carousel (9 slides), services preview, trusted company logos, Instagram feed |
| About | `about.html` | Yana's story, self-taught artist background, process timeline |
| Gallery Hub | `gallery.html` | Main gallery with category navigation |
| Contact | `contact.html` | Contact form (Web3Forms), phone, email, address |
| Blog | `blog.html` | Blog hub with 3 published articles |
| Order Form | `order-form.html` | Full order form with flavor dropdowns, date picker, product selection |

### Ordering & Conversion
| Page | File | Description |
|------|------|-------------|
| Buy Now | `buy-now.html` | Fast checkout for printed image cookies, 48-hour nationwide shipping |
| Order Printed | `order-printed.html` | Photo cookie ordering |
| Corporate Order | `corporate-order.html` | Corporate quote request, 24-hour turnaround, invoice/PO accepted |

### Gallery Pages — Cakes
| Page | File |
|------|------|
| Cakes Hub | `gallery-cakes.html` |
| Sculpted Cakes | `gallery-cakes-sculpted.html` |
| Realistic/Illusion Cakes | `gallery-cakes-realistic.html` |
| Wedding Cakes | `gallery-cakes-wedding.html` |

### Gallery Pages — Cookies
| Page | File |
|------|------|
| Cookies Hub | `gallery-cookies.html` |
| Hand-Piped Cookies | `gallery-cookies-hand-piped.html` |
| Printed Image Cookies | `gallery-cookies-printed.html` |

### Gallery Pages — Other
| Page | File |
|------|------|
| Cake Pops | `gallery-cakepops.html` |
| Cupcakes | `gallery-cupcakes.html` |

### Gallery Pages — Corporate
| Page | File |
|------|------|
| Corporate Cake Pops | `gallery-corporate-cakepops.html` |
| Corporate Cakes | `gallery-corporate-cakes.html` |
| Corporate Cookies Hub | `gallery-corporate-cookies.html` |
| Corporate Printed Cookies | `gallery-corporate-cookies-printed.html` |
| Corporate Cupcakes | `gallery-corporate-cupcakes.html` |

### Business Pages
| Page | File |
|------|------|
| Corporate Services | `corporate.html` |
| Partners (15% referral program) | `partners.html` |

### Blog Posts
| Article | File |
|---------|------|
| Best Wedding Cake Flavors | `blog-best-wedding-cake-flavors.html` |
| Corporate Event Dessert Ideas | `blog-corporate-event-dessert-ideas.html` |
| How to Order a Custom Birthday Cake | `blog-how-to-order-custom-birthday-cake.html` |

### Local SEO Landing Pages
| City | File |
|------|------|
| San Francisco | `custom-cakes-san-francisco.html` |
| Palo Alto | `custom-cakes-palo-alto.html` |
| Mountain View | `custom-cakes-mountain-view.html` |
| San Jose | `custom-cakes-san-jose.html` |
| Daly City | `custom-cakes-daly-city.html` |
| San Rafael | `custom-cakes-san-rafael.html` |

### Utility & Internal
| Page | File |
|------|------|
| 404 Error | `404.html` |
| Order Form Modal | `order-form-modal.html` |
| Color Preview (internal) | `color-preview.html` |
| Thursday Dashboard (internal) | `thursday/index.html` |

### Legacy Stubs (Wix migration redirects)
`about-1.html`, `contact-3.html`, `gallery-7.html`, `services-5.html`, `cakes.html`, `cookies.html`

## JavaScript Files

| File | Lines | Purpose |
|------|-------|---------|
| `script.js` | ~1,470 | Main site: mobile menu, dropdowns, smooth scroll, order form modal, search, form validation |
| `carousel.js` | 44 | Hero carousel: 9 slides, auto-rotate (4s), dot nav, responsive breakpoints |
| `nav-particles.js` | 154 | Canvas-based animated balloon particles in header, collision detection, brand colors |
| `tilt-effects.js` | 232 | 3D tilt hover effects on service cards, Instagram posts, company logos, spark effects |
| `activity-feed-widget.js` | 42 | Live recent-orders feed widget (fetches `recent-orders.json`) |
| `chatbot.js` | ~350 | AI chatbot widget, Cloudflare Worker integration, conversation history |
| `chatbot-worker.js` | — | Chatbot backend worker logic |
| `consultation-widget.js` | — | Consultation booking widget |
| `activity-feed.js` | — | Activity feed functionality |
| `generate-sitemap.js` | 209 | Node.js sitemap generator, scans all HTML, generates `sitemap.xml` |
| `add-lazy-loading.js` | — | Adds lazy loading attributes to images |
| `add-theme-color.js` | — | Theme color management |
| `cake-preview-worker.js` | — | Cake preview worker |
| `js/schema-component.js` | — | Schema.org structured data injection |

## CSS Architecture (`style.css` — ~5,000 lines)

| Section | Description |
|---------|-------------|
| CSS Variables & Foundation | Brand colors, shadows, font fallbacks, responsive breakpoints |
| Halo Glow Frame | Fixed-position animated glow effect around page edges |
| Header & Navigation | Logo, dropdown menus with subcategories, mobile hamburger, search bar |
| Hero & Carousel | Multi-slide hero, text box with badge/logo/buttons, dot navigation |
| Service Cards & Grids | Tile grids (2/3/4-column), hover effects, 3D tilt animations |
| Order Form Modal | Full-screen modal, flavor dropdowns, form fields |
| Gallery Grid System | Masonry layout, lightbox, category filtering, lazy loading |
| Corporate Section | Company logo grid, trust indicators, activity feed |
| Consultation Page | Animated gradient orbs background |
| Corporate Order Page | Particles canvas, premium badge styling |
| Blog Post Styling | Article layout, featured images, typography |
| Partners Page | Referral program layout |
| Footer & Social Sidebar | Site footer, floating social links |
| Responsive Breakpoints | 375px, 480px, 768px, 968px, 1100px |

Additional: `chatbot.css` (~10,000 lines) for the chatbot widget.

## External Integrations

| Service | Purpose |
|---------|---------|
| **Firebase** | Realtime Database + Storage for thursday dashboard (order management, file attachments) |
| **Google Analytics (GA4)** | Traffic tracking (G-KB96GDJ011) |
| **Google Tag Manager** | Event tracking |
| **Google Fonts** | Nunito, Fredoka One |
| **Calendly** | Consultation booking |
| **Web3Forms** | Form submission handling |
| **Google reCAPTCHA** | Spam protection |
| **Cloudflare Workers** | Chatbot backend, cake preview worker |

## Corporate Clients

25 Fortune 500 / major company logos displayed: Google, Meta, Microsoft, Salesforce, OpenAI, Stripe, Pinterest, Instagram, Facebook, Yelp, PayPal, Discord, DocuSign, Gap, Levi's, Kaiser, Alaska Airlines, Golden State Warriors, and more.

## Image Structure

```
images/
├── Branding/          Logo variations, cake box mockup
├── gallery/
│   ├── cakepops/      33 cake pop photos
│   ├── cakes/         Sculpted & themed cakes
│   ├── realist/       Realistic illusion cakes
│   ├── wedding/       Wedding cakes
│   ├── cupcakes/      Cupcake photos
│   └── cookies/
│       ├── hand piped/  Hand-decorated cookies
│       └── printed/     Photo cookies
├── carousel 1-9.webp  Hero carousel slides
company logos/          25 corporate partner logos
```

All images are WebP format. `convert-to-webp.py` automates JPG/PNG conversion at quality 82.

## Build Scripts & Tools

| Script | Language | Purpose |
|--------|----------|---------|
| `convert-to-webp.py` | Python | Batch convert images to WebP (quality 82) |
| `compress_images.py` | Python | Image compression |
| `resize_images.py` | Python | Image resizing |
| `generate-sitemap.js` | Node.js | Auto-generate sitemap.xml from HTML files |
| `add-lazy-loading.js` | Node.js | Add lazy loading to all images |

## Site Validator

Automated validation runs on every push and PR via GitHub Actions. It checks for broken internal links, missing images/assets, CSS syntax errors, and conflicting CSS declarations.

**Run locally before pushing:**

```bash
npm install cheerio css-tree glob
node .github/scripts/validate-site.js
```

- Internal broken links and missing assets are **blocking errors** (build fails)
- External URL issues (Yelp 403s, CDN timeouts) are **non-blocking warnings**
- CSS conflicts in the same selector are blocking (prevents cascade regressions in `style.css`)

The GitHub Actions workflow (`.github/workflows/validate-and-deploy.yml`) runs validate first, then deploys to Pages only if validation passes.

## Thursday Dashboard (Internal)

Password-protected PWA at `/thursday/` for internal order management:
- Firebase Realtime Database for order tracking
- Firebase Storage for file attachments
- Revenue dashboard with price columns
- Calendar view for active orders
- Due date alerts
- Smart email parser for extracting order details
- Contact links and gold-accented UI

## SEO & Indexing

- **sitemap.xml**: 30+ URLs with priority hierarchy and change frequencies
- **robots.txt**: Allows all crawlers including AI bots (GPTBot, ClaudeBot, PerplexityBot)
- **Schema.org**: Bakery, Product, Service, FAQPage, BreadcrumbList on every page
- **Open Graph + Twitter Cards**: Social media preview support
- **Canonical URLs**: Duplicate content prevention
- **6 Local SEO pages**: City-specific landing pages for Bay Area coverage
- **3 Blog articles**: SEO-optimized content for wedding, corporate, and birthday markets

## Social Links

- **Instagram**: [@mybakingcreationscompany](https://instagram.com/mybakingcreationscompany)
- **Facebook**: [MyBakingCreationsCompany](https://facebook.com/MyBakingCreationsCompany)
- **Pinterest**: [MyBakingCreations](https://pinterest.com/MyBakingCreations)
- **Yelp**: Business page linked from floating sidebar

## Key Features

- 9-slide auto-rotating hero carousel
- Canvas-based animated balloon particles with collision detection
- 3D tilt hover effects with light reflection
- Electric spark effects on CTA buttons
- Live activity feed showing recent corporate orders
- AI chatbot with Cloudflare Worker backend
- 700+ products indexed in site search (`search-data.json`)
- Masonry gallery grids with lightbox viewing
- Mobile-responsive across all breakpoints
- `.nojekyll` file to prevent Jekyll processing on GitHub Pages

## Contact

- **Phone**: (415) 568-8060
- **Website**: [mybakingcreations.com](https://www.mybakingcreations.com)


---

## Operations Log

This section tracks ongoing SEO/indexing work and Claude-assisted sessions. If you're a future Claude session picking this up: read here first, then check Google Search Console for the latest numbers.

### Current State (as of 2026-04-15)

**Google Search Console — mybakingcreations.com (sc-domain property)**

| Metric | Value |
|---|---|
| Total clicks (90d) | 1,120, trending up (~15–21/day mid-April) |
| Indexed pages | 60 |
| Not-indexed pages | 82 |
| Indexing ratio | ~42% |

**Not-indexed breakdown:**

| Reason | Count | Source | Notes |
|---|---|---|---|
| Discovered – currently not indexed | 34 | Google | Templated city/event/corporate pages. **Do NOT request indexing** — see warning below. |
| Alternate page with proper canonical | 18 | Website | Benign www/non-www duplicates. |
| Page with redirect | 13 | Website | Likely the working half of old→new URL migration. |
| Redirect error | 10 | Website | Old `www./custom-cakes-{city}.html` loops. **Self-resolved.** Google validation started 3/28/26. |
| Not found (404) | 5 | Website | Trending down, aging out naturally. |
| Blocked by robots.txt | 1 | Website | `/gallery-7` — Wix stub, correctly blocked. |
| Crawled – not indexed | 1 | Google | `/favicon.ico` — benign, not a page. |
| Indexed-though-blocked (warning) | 1 | Website | `www./gallery-7` — removal request submitted 4/15/26. |

### ⚠️ Google March 2026 Spam Update — Do Not Force-Index

Google rolled out a **March 2026 Spam Update (Mar 24–25)** + **March 2026 Core Update (Mar 27 – Apr 8)** that explicitly targeted:

- Scaled content abuse
- Templated AI-written pages
- Doorway pages
- Mass city-page networks

The 34 "Discovered – not indexed" URLs on this site (12 city + 11 event + 4 corporate + 7 misc templated pages) match this fingerprint. The jump from 15→34 URLs in this bucket occurred around the spam update window = passive classifier rejection.

**Do not click "Request Indexing" on these.** Doing so can trigger site-wide scaled-content classification. Options if you want to address them:

1. **Consolidate** the 27 templated clones → 1 rich hub page (safest)
2. **Differentiate** heavily — unique content, stats, photos per page (most work)
3. **Wait and watch** — let them stay uncrawled
4. Leave as-is; they contribute zero clicks today anyway

### Footer Link-Matrix Remediation (shipped 2026-04-15)

**Problem:** 33 HTML files (index, order-form, and 31 `custom-cakes-{city}.html` files) each contained a footer block linking to all 30 city pages = **~930 internal matrix links** sitewide. That's a textbook bipartite doorway-network topology signature — exactly what Google's March 2026 spam update flags.

**Fix:** Replaced the 30-city matrix footer with a single hub link to `/delivery-areas`. Commit: `a9ae151`.

**Net change:** 33 files, 66 deletions → 33 insertions. 930 matrix links removed. Topology is now hub-and-spoke instead of bipartite.

**Fix script:** was `_fix_footer.py` (DOTALL regex match for `<div class="footer-locations">...View All...</div>` block). Removed before commit. If this pattern comes back elsewhere, recreate the script.

### GSC Reason-Code Item Keys

For quick drilldown navigation — `https://search.google.com/search-console/index/drilldown?resource_id=sc-domain%3Amybakingcreations.com&item_key={CODE}`:

| Code | Reason |
|---|---|
| `CAMYFiAC` | Discovered – not indexed |
| `CAMYFCAC` | Redirect error |
| `CAMYCyAC` | Page with redirect |
| `CAMYGCAC` | Alternate page with proper canonical |
| `CAMYFyAC` | Crawled – not indexed |
| `CAMYDSAC` | Not found (404) |
| `CAMYByAC` | Blocked by robots.txt |
| `CAMYBCAD` | Indexed, though blocked by robots.txt (warning) |
| `CAMYCCAC` | Excluded by noindex tag |
| `CAMYECAC` | Duplicate, Google chose different canonical |


---

## Session Log

### 2026-04-15 — GSC Indexing Audit & Footer Cleanup (Claude session)

**Goals:** Diagnose why 82 pages weren't indexed; address specific GSC issues flagged as "Failed" or "Not Started" validation.

**Work done:**

1. **Pulled full GSC indexing report.** Mapped all 9 not-indexed reason codes to item_keys for future drilldown.
2. **Identified footer link-matrix as programmatic-SEO fingerprint.** All 33 pages with footer linked to all 30 city pages = 930 matrix links. Replaced with single `/delivery-areas` hub link.
3. **Traced 10 "Redirect error" URLs** — all old `www./custom-cakes-{city}.html` chains that were looping at time of March 11 crawl. Verified via PowerShell `Invoke-WebRequest` that loops are now gone (single clean 301 → 200). GSC validation already started 3/28/26; no action needed.
4. **Drilled all 3 single-URL buckets:**
   - Crawled-not-indexed → `/favicon.ico` (benign)
   - Blocked-by-robots → `/gallery-7` (Wix stub, correctly blocked)
   - Indexed-though-blocked warning → `www./gallery-7` (ghost from old Wix site)
5. **Submitted GSC Removals** for both `/gallery-7` variants (non-www and www). Both "Processing request" as of 4/15. Prior Jan 12 removal had expired.
6. **Did NOT fix structured data errors** (FAQ 4, Breadcrumbs 3, Merchant 2, Product 2) — ran out of tool budget. Next session should pick this up.

**Educational context shared with operator:** March 2026 Google spam update mechanics, AI fingerprint detection stack (structural HTML hashing, cross-page similarity matrices, publishing velocity, perplexity/burstiness, entity density, internal linking topology), programmatic-SEO industry carnage post-update.

**Files changed:** 33 HTML files (footer block), committed `a9ae151`, pushed to main.

### Earlier notable work

- **2026-04-06:** README.md created (11 KB, full site inventory).
- **2026-01-12:** Bulk GSC removal submissions for 9 Wix-era stubs (`/about-1`, `/contact-3`, `/_frog`, `/cart`, `/_api/*`, `/services-5`, `/gallery-7`). All marked "Removal expired" as of 4/15 — Google only holds removals for ~6 months. Re-submission is expected if warnings recur.

---

## Notes for Next Claude Session

If you're a fresh Claude instance picking this up, here's what will save you 30 minutes of re-discovery:

**Environment setup:**
- Repo lives at `C:\Users\georg\Documents\GitHub\gugosf114.github.io\`. CNAME → mybakingcreations.com.
- GSC access: user is logged in to Google at `gugosf@gmail.com`. Launch a CDP Chrome session via `C:\Users\georg\Desktop\launch-chrome-cdp.ps1`, then use `unified-automation` tools with session name `gsc`.
- Branch protection is on `main`. Pushes succeed with owner bypass; the "Cannot update this protected ref" message is noise, not an error — check the ref-update line at the end of git push output.

**Things NOT to do:**
- ❌ **Don't "Request Indexing"** on any of the 34 Discovered-not-indexed URLs. That's the programmatic-SEO trap the March 2026 update was built for.
- ❌ **Don't push back** on the homepage live-activity feed or the Fortune 500 corporate-client logos. Those are real orders/real clients with photos. Operator is a JD-trained compliance specialist who stress-tests adversarially — he'll correct you hard if you reflexively audit without substantiation. Already been through that loop.
- ❌ **Don't create new programmatic city/event/corporate template pages.** Pattern is what Google flags, not content. If something like that comes up, the answer is "consolidate into a rich hub, don't expand."

**Things TO do:**
- ✅ Read this README's Operations Log + Session Log before doing any SEO work.
- ✅ Use direct GSC drilldown URLs with `item_key` codes (table above) instead of clicking through the UI — faster and uses fewer tool calls.
- ✅ When in doubt about operator intent, proceed with reasonable defaults rather than asking. He wants execution, not clarifying questions. `userPreferences` explicitly says so.
- ✅ Keep the hub-and-spoke internal linking topology. If you add new landing pages, link to them from the appropriate hub (e.g., `/delivery-areas`), not from every other page.

**Open items (priority order):**
1. **Structured data errors** (highest-impact unfinished work). FAQ=4, Breadcrumbs=3, Merchant listings=2, Product snippets=2. Navigate via GSC sidebar (Enhancements → FAQ, Shopping → Product snippets/Merchant listings). Direct URLs like `/structured-data/faq` 404 — use the sidebar navigation. Drill each error row to get affected URL + specific schema field violation. Then fix JSON-LD in the affected HTML files.
2. **34 Discovered-not-indexed URLs** — strategic decision needed: consolidate, differentiate, or leave. Not urgent; they contribute zero traffic.
3. **Confirm `/gallery-7` removal processing** completes (~24–48hr typical). If it flips back to "expired" before 6 months, that's a Google-side bug worth noting.

**Operator communication style:**
- Direct, concise, no corporate hedging.
- Reads thinking tags primarily, not polished output.
- Expects push-back when warranted — don't fold to agree.
- "LETS GO SIR" = execute. "hold on" = stop and think.
- Tone-match. He is in stress-test mode by default.

---

*— Claude (session 2026-04-15)*
