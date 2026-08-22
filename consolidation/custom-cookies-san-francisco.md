# Cannibalization Fix: custom cookies san francisco

## Competing Pages

- https://mybakingcreations.com/
- http://mybakingcreations.com/
- https://mybakingcreations.com/gallery.html
- https://mybakingcreations.com/custom-cakes-san-francisco
- https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
- https://mybakingcreations.com/about
- https://mybakingcreations.com/corporate
- https://mybakingcreations.com/design-studio
- https://mybakingcreations.com/gallery

## Recommended Action

# Keyword Cannibalization Analysis: "custom cookies san francisco"

---

## Diagnosis

You have **9 competing URLs** for the same query, including duplicate protocol variants, UTM-polluted URLs, and fragmented content across multiple pages — a textbook cannibalization scenario.

---

## 1. Canonical Version

**Winner: `https://mybakingcreations.com/`**

**Reasoning:**
- The homepage almost certainly has the strongest domain authority signals concentrated on it
- It likely already ranks highest for this query
- Custom cookies in a local service business is a **primary offering**, not a subcategory — it belongs on the root URL, not a subfolder page
- Consolidating here avoids creating new pages (per your constraint)

---

## 2. Content to Merge INTO the Canonical Homepage

Audit each competing page and pull these specific elements into `https://mybakingcreations.com/`:

| Source Page | Content to Extract & Merge |
|---|---|
| `/gallery.html` and `/gallery` | Embed a **curated 6–9 image grid** of custom cookie photos directly on the homepage with alt text containing "custom cookies San Francisco" |
| `/corporate` | Add a **short section or bullet list** referencing corporate cookie orders (events, gifting) — this captures commercial intent searchers |
| `/design-studio` | Add a **brief description** of the custom design/ordering process (e.g., "How It Works" — 3 steps) |
| `/custom-cakes-san-francisco` | If this page contains any **cookie-specific copy** (not cake copy), extract it; if it's purely cakes, leave it alone |
| `/about` | If the about page mentions San Francisco, Daly City, or Bay Area service area, **replicate that geographic language** verbatim on the homepage |

---

## 3. Pages That Get 301 Redirects

These pages have no independent ranking justification and must redirect permanently:

```
http://mybakingcreations.com/          → 301 → https://mybakingcreations.com/
https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city  → 301 → https://mybakingcreations.com/
https://mybakingcreations.com/gallery.html  → 301 → https://mybakingcreations.com/gallery
```

**Explanation:**
- The `http://` version is a protocol duplicate — this redirect may already exist but verify it's in place and returning a true 301, not a 302
- The UTM URL should **never be indexable**; block via 301 or `robots.txt` disallow — the GBP profile link should use the clean homepage URL
- `/gallery.html` and `/gallery` are the same content with two URLs — redirect the `.html` version to the clean `/gallery`

---

## 4. Pages That Get rel=canonical Tags

These pages have legitimate standalone purposes but may be pulling ranking signals away from the homepage:

| Page | Canonical Action | Reason |
|---|---|---|
| `https://mybakingcreations.com/gallery` | `rel=canonical` pointing to **itself** (self-referencing) | Keep it indexable for visual search, but ensure it doesn't compete — add a canonical and make sure its title/H1 is "Cookie & Cake Gallery" not "Custom Cookies San Francisco" |
| `https://mybakingcreations.com/about` | Self-referencing canonical | Not a competitor for this query; just ensure it's clean |
| `https://mybakingcreations.com/corporate` | Self-referencing canonical | Legitimate page, but H1/title should target "corporate cookie orders" not "custom cookies SF" |
| `https://mybakingcreations.com/design-studio` | Self-referencing canonical | Same — title/H1 should be process-focused, not keyword-matching the homepage |
| `https://mybakingcreations.com/custom-cakes-san-francisco` | Self-referencing canonical | Ensure its title/H1 says **cakes**, not cookies — if it currently targets "custom cookies," that's your biggest cannibalization culprit and the H1 must be changed |

> ⚠️ **Priority flag:** Check `/custom-cakes-san-francisco` immediately. If its on-page copy or title tag contains "custom cookies," that single page is likely your worst cannibalizer given its keyword-rich URL structure.

---

## 5. Internal Linking Changes

**Current problem:** Link equity is likely scattered across all these URLs with no clear hierarchy.

### Specific changes to make:

**A. Fix all internal links site-wide**
- Do a crawl (Screaming Frog or Sitebulb) and find every internal link pointing to:
  - `http://mybakingcreations.com/` → update to `https://mybakingcreations.com/`
  - `/gallery.html` → update to `/gallery`
  - Any UTM-appended URL used in internal navigation → strip UTM parameters

**B. Add contextual links TO the homepage from:**
- `/corporate` — add anchor text: **"custom cookies for your San Francisco event"** linking to homepage
- `/design-studio` — add anchor text: **"order custom cookies in San Francisco"** linking to homepage
- `/gallery` — add a CTA above or below the gallery: **"Order Custom Cookies"** linking to homepage
- `/about` — add anchor text referencing the service + city linking to homepage

**C. Remove or re-anchor any homepage links that use generic anchors**
- Change any nav or footer links using "Home" as anchor text to something like **"Custom Cookies — San Francisco"** where contextually appropriate (footer is the safest place for this)

---

## Implementation Priority Order

```
1. [URGENT]  301: http:// → https:// (if not already active)
2. [URGENT]  301: UTM URL → clean homepage
3. [URGENT]  Audit /custom-cakes-san-francisco for cookie keyword overlap — fix H1/title
4. [HIGH]    301: /gallery.html → /gallery
5. [HIGH]    Merge gallery images + corporate section + design process onto homepage
6. [HIGH]    Fix all internal links site-wide (crawl first)
7. [MEDIUM]  Add contextual internal links from /corporate, /design-studio, /gallery, /about
8. [MEDIUM]  Add self-referencing canonicals to /gallery, /corporate, /design-studio, /about
```

---

## Expected Outcome

Consolidating signals from 9 competing URLs into one authoritative homepage should result in:
- Reduced crawl budget waste
- Stronger PageRank concentration on the canonical URL
- Clearer topical relevance signal to Google for "custom cookies san francisco"
- Elimination of the index bloat from duplicate protocol and UTM variants

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
