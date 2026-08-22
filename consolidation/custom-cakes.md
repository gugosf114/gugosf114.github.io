# Cannibalization Fix: custom cakes

## Competing Pages

- https://mybakingcreations.com/custom-cakes-san-francisco
- https://mybakingcreations.com/
- https://mybakingcreations.com/custom-cakes-san-jose
- https://mybakingcreations.com/custom-cakes-hayward
- https://mybakingcreations.com/custom-cakes-palo-alto
- https://mybakingcreations.com/custom-cakes-sunnyvale
- https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
- https://mybakingcreations.com/gallery.html
- http://mybakingcreations.com/
- https://mybakingcreations.com/custom-cakes-daly-city
- https://mybakingcreations.com/custom-cakes-san-rafael
- https://mybakingcreations.com/custom-cakes-mountain-view
- https://mybakingcreations.com/about
- https://mybakingcreations.com/corporate
- https://mybakingcreations.com/design-studio
- https://mybakingcreations.com/gallery
- https://mybakingcreations.com/custom-cakes-san-bruno
- https://mybakingcreations.com/custom-cakes-fremont
- https://mybakingcreations.com/blog-how-to-order-custom-birthday-cake
- https://mybakingcreations.com/custom-cakes-cupertino
- https://mybakingcreations.com/custom-cakes-burlingame
- https://mybakingcreations.com/gallery-cakes

## Recommended Action

# Keyword Cannibalization Analysis: "Custom Cakes"

## Diagnosis

You have **10 competing URLs** fragmenting authority for "custom cakes," including duplicate HTTP/HTTPS versions, UTM-tagged URLs being indexed, and multiple location pages all likely optimized around the same core term.

---

## 1. Canonical Version: `https://mybakingcreations.com/custom-cakes-san-francisco`

**Why this page:**
- San Francisco is the highest-volume, highest-intent local market in the Bay Area for this business
- It likely already carries the most backlinks and engagement signals of the location pages
- A geo-specific page is more defensible than the homepage for a transactional "custom cakes" query — it signals clear relevance to searchers with commercial intent
- The homepage should serve brand/navigational queries, not be the primary landing page for a service keyword

> **Verify before proceeding:** Pull Google Search Console data and confirm `custom-cakes-san-francisco` has the highest impressions/clicks among the location pages. If another location page outperforms it, substitute that URL as canonical throughout this plan.

---

## 2. Content to Merge Into the Canonical Page

Pull unique, valuable content from each competing page and consolidate it into `https://mybakingcreations.com/custom-cakes-san-francisco`:

| Source Page | Content to Extract and Merge |
|---|---|
| `https://mybakingcreations.com/` | Any custom cake service descriptions, trust signals (years in business, testimonials), and schema markup (LocalBusiness, Product) |
| `https://mybakingcreations.com/gallery.html` | Do NOT merge the full gallery — instead embed 6–8 of the highest-quality custom cake images directly on the canonical page with descriptive alt text. Keep gallery.html intact for its own purpose. |
| `custom-cakes-san-jose` | Any unique copy about serving San Jose customers, specific flavor offerings, or pricing mentioned only on that page |
| `custom-cakes-hayward` | Same — extract any unique service details or testimonials specific to that page |
| `custom-cakes-daly-city` | Same — extract unique copy; note the UTM homepage URL targets Daly City, so consolidate that messaging here too |
| `custom-cakes-palo-alto` | Extract any unique copy about corporate orders or upscale events if present |
| `custom-cakes-sunnyvale` | Extract any unique copy about delivery radius or turnaround times if present |

**After merging**, the canonical page should contain:
- A clear H1: "Custom Cakes in San Francisco"
- Consolidated service descriptions from all location pages
- A service area section listing all cities (SF, San Jose, Hayward, Daly City, Palo Alto, Sunnyvale) with brief descriptions — this preserves the geographic relevance without separate competing pages
- Merged testimonials and trust signals from the homepage
- Selected gallery images with keyword-rich alt text

---

## 3. Pages That Should Get 301 Redirects

These pages have no unique purpose that justifies their independent existence:

| URL to Redirect | Redirect Destination | Reason |
|---|---|---|
| `http://mybakingcreations.com/` | `https://mybakingcreations.com/` | HTTP → HTTPS fix; this is a technical duplicate leaking link equity |
| `https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city` | `https://mybakingcreations.com/custom-cakes-san-francisco` | UTM URLs should **never** be indexable; redirect to canonical service page |
| `https://mybakingcreations.com/custom-cakes-san-jose` | `https://mybakingcreations.com/custom-cakes-san-francisco` | After content is merged; consolidates location page authority |
| `https://mybakingcreations.com/custom-cakes-hayward` | `https://mybakingcreations.com/custom-cakes-san-francisco` | After content is merged |
| `https://mybakingcreations.com/custom-cakes-daly-city` | `https://mybakingcreations.com/custom-cakes-san-francisco` | After content is merged |
| `https://mybakingcreations.com/custom-cakes-palo-alto` | `https://mybakingcreations.com/custom-cakes-san-francisco` | After content is merged |
| `https://mybakingcreations.com/custom-cakes-sunnyvale` | `https://mybakingcreations.com/custom-cakes-san-francisco` | After content is merged |

**Implementation note:** Set up the HTTP→HTTPS redirect at the server level (`.htaccess` or hosting config), not just in your CMS, to ensure it catches all URL variants.

---

## 4. Pages That Should Get `rel=canonical` Tags

Only two pages need canonical tags rather than redirects because they serve distinct user purposes and should remain live:

| Page | Canonical Tag to Add | Reason |
|---|---|---|
| `https://mybakingcreations.com/` | `<link rel="canonical" href="https://mybakingcreations.com/" />` | Homepage self-canonicalizes; ensure it does NOT point to the SF page, as the homepage serves brand queries separately |
| `https://mybakingcreations.com/gallery.html` | `<link rel="canonical" href="https://mybakingcreations.com/gallery.html" />` | Keep gallery as its own page (it serves a distinct browsing intent), but self-canonicalize to confirm it's intentionally standalone |

> **Do not** add a canonical tag pointing the homepage to the SF page — that would break your brand/navigational traffic. The homepage and the canonical service page serve different query intents.

---

## 5. Internal Linking Changes

### On `https://mybakingcreations.com/` (Homepage):
- Change the primary CTA button and any "custom cakes" text links to point to `https://mybakingcreations.com/custom-cakes-san-francisco`
- Anchor text should be: "Order Custom Cakes" or "Custom Cakes in the Bay Area" — avoid exact-match "custom cakes" as anchor text on every link

### On `https://mybakingcreations.com/gallery.html`:
- Add a contextual link in the page body: *"Interested in ordering? See our [custom cakes in San Francisco](https://mybakingcreations.com/custom-cakes-san-francisco)."*
- This passes gallery page authority to the canonical and creates a logical user path

### On `https://mybakingcreations.com/custom-cakes-san-francisco` (Canonical):
- Add a link back to `gallery.html` with anchor text "View our cake gallery" — creates a logical content cluster
- Add a link to the homepage with anchor text "About My Baking Creations" for brand navigation

### Google Business Profile:
- Update the GBP website URL from the UTM-tagged homepage URL to `https://mybakingcreations.com/custom-cakes-san-francisco`
- GBP tracking should be handled via GA4 referral source recognition, not by making UTM URLs indexable

---

## Implementation Order

Execute in this exact sequence to avoid ranking drops:

1. **Fix HTTP→HTTPS redirect** (server level) — zero risk, immediate technical fix
2. **Block UTM URL indexation** — add `noindex` to the UTM page immediately, then 301 after 2 weeks
3. **Merge content** from all location pages into the SF canonical page
4. **Implement 301 redirects** for all location pages after content is confirmed live on canonical
5. **Update internal links** on homepage and gallery
6. **Update GBP link**
7. **Submit updated sitemap** in Google Search Console
8. **Monitor GSC** for 60 days — watch for impression consolidation onto the canonical URL

---

## Expected Outcome

All link equity currently split across 10 URLs consolidates into one page. Google receives an unambiguous signal about which URL represents "custom cakes" for this site, and the canonical page competes with the combined authority of all the pages it absorbed.

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
