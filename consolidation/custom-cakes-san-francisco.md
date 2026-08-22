# Cannibalization Fix: custom cakes san francisco

## Competing Pages

- https://mybakingcreations.com/
- https://mybakingcreations.com/custom-cakes-san-francisco
- http://mybakingcreations.com/
- https://mybakingcreations.com/gallery.html
- https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
- https://mybakingcreations.com/about
- https://mybakingcreations.com/corporate
- https://mybakingcreations.com/design-studio
- https://mybakingcreations.com/gallery

## Recommended Action

# Keyword Cannibalization Analysis: "custom cakes san francisco"

---

## Diagnosis

You have **multiple pages competing for the same query**, with the homepage appearing in **three duplicate variants** alone. This splits crawl budget, dilutes link equity, and sends conflicting signals to Google about which page should rank.

**Cannibalization severity: HIGH**
The dedicated landing page (`/custom-cakes-san-francisco`) should be winning this query but is being undermined by the homepage variants and overlapping service pages.

---

## 1. Canonical Version: `https://mybakingcreations.com/custom-cakes-san-francisco`

**Why this page wins:**
- The URL contains the exact target keyword — Google weighs URL relevance as a ranking signal
- It is a dedicated landing page, meaning it can be fully optimized for conversion and query intent without compromising site-wide navigation
- Keeping the homepage as canonical would force it to serve too many competing intents (brand, all services, local SEO), weakening it for every query
- A dedicated page allows you to concentrate all backlinks, internal links, and signals into one focused URL

---

## 2. Content to Merge INTO the Canonical Page

Before executing any redirects, audit these pages and pull unique content into `/custom-cakes-san-francisco`:

| Source Page | What to Extract and Merge |
|---|---|
| `https://mybakingcreations.com/gallery` and `/gallery.html` | Pull the **custom cake gallery images specifically** (wedding, birthday, specialty cakes) with keyword-relevant alt text. Do not merge unrelated work. |
| `https://mybakingcreations.com/design-studio` | Extract any **custom order process descriptions** (consultation steps, flavor options, design process) — this directly supports the custom cakes query intent |
| `https://mybakingcreations.com/about` | Extract **San Francisco/local credibility signals** — years in business, SF neighborhood mentions, local awards — and add them as a trust section on the canonical page |
| `https://mybakingcreations.com/corporate` | If corporate cakes are a subset of custom cakes, add a **brief mention with an internal link** to `/corporate` rather than merging full content (corporate deserves its own page for that separate query) |

---

## 3. Pages That Need 301 Redirects

These pages pass zero unique value and must redirect permanently:

```
301: http://mybakingcreations.com/
  → https://mybakingcreations.com/

301: https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
  → https://mybakingcreations.com/custom-cakes-san-francisco

301: https://mybakingcreations.com/gallery.html
  → https://mybakingcreations.com/gallery
```

**Notes on these redirects:**
- The `http://` → `https://` redirect should already exist — if it does not, this is a critical technical fix independent of cannibalization
- The UTM URL appearing as an indexable page means **Google Bot is crawling your GBP tracking links**. Add `?utm_*` parameters to your **Google Search Console parameter handling** AND add `<meta name="robots" content="noindex">` as a fallback on any UTM-appended page variant. The 301 above handles the specific variant found in SERPs.
- `/gallery.html` and `/gallery` are duplicate gallery pages — consolidate to the clean `/gallery` URL

---

## 4. Pages That Need `rel=canonical` Tags

These pages should remain live for their own query purposes but must explicitly defer to the canonical for the "custom cakes san francisco" signal:

```html
<!-- On https://mybakingcreations.com/ -->
<link rel="canonical" href="https://mybakingcreations.com/" />
```
*(Self-referencing canonical — confirms homepage is its own canonical, not the custom cakes page)*

```html
<!-- On https://mybakingcreations.com/design-studio -->
<link rel="canonical" href="https://mybakingcreations.com/design-studio" />
```

```html
<!-- On https://mybakingcreations.com/corporate -->
<link rel="canonical" href="https://mybakingcreations.com/corporate" />
```

```html
<!-- On https://mybakingcreations.com/about -->
<link rel="canonical" href="https://mybakingcreations.com/about" />
```

**The canonical page itself must have:**
```html
<link rel="canonical" href="https://mybakingcreations.com/custom-cakes-san-francisco" />
```

---

## 5. Internal Linking Changes

This is where most sites fail after fixing redirects — internal links are left pointing to old URLs or the wrong page, which re-signals the wrong canonical to Google.

**Immediate changes required:**

| Location | Current Link | Change To |
|---|---|---|
| Homepage main navigation or hero CTA | Likely links to `/` or no dedicated page | Add explicit link: `"Order Custom Cakes in San Francisco"` → `/custom-cakes-san-francisco` |
| `/about` page | Likely mentions custom cakes generically | Anchor text `"custom cakes"` or `"custom cakes in San Francisco"` → `/custom-cakes-san-francisco` |
| `/gallery` page | Gallery images likely unlinked or link to homepage | Add CTA link below gallery: `"Order a Custom Cake"` → `/custom-cakes-san-francisco` |
| `/design-studio` page | Describes the process but likely doesn't link to the conversion page | Add bottom-of-page CTA → `/custom-cakes-san-francisco` |
| `/corporate` page | Separate intent, but custom cakes are related | Add one contextual link: `"Looking for a personal custom cake?"` → `/custom-cakes-san-francisco` |
| Google Business Profile website URL | Currently pointing to UTM homepage variant | Update GBP website field to `https://mybakingcreations.com/custom-cakes-san-francisco` directly, without UTM parameters (GBP tracks clicks natively) |

---

## Execution Priority Order

```
Week 1 — Stop the bleeding:
  ✅ Fix http → https redirect (if broken)
  ✅ 301 redirect /gallery.html → /gallery
  ✅ 301 redirect UTM variant → /custom-cakes-san-francisco
  ✅ Add self-referencing canonicals to all surviving pages
  ✅ Update GBP website URL

Week 2 — Consolidate signals:
  ✅ Merge content from design-studio, gallery, about into canonical page
  ✅ Update all internal links to point to /custom-cakes-san-francisco
  ✅ Block UTM parameters in Google Search Console

Week 3 — Validate:
  ✅ Crawl site with Screaming Frog to confirm no orphaned redirects
  ✅ Check Google Search Console Coverage report for redirect chains
  ✅ Resubmit /custom-cakes-san-francisco in GSC for indexing
```

---

**Expected outcome:** Within 4–8 weeks of implementation, Google should consolidate ranking signals to `/custom-cakes-san-francisco`, and you should see that URL replace the homepage in SERPs for this query.

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
