# Cannibalization Fix: my baking creations sf

## Competing Pages

- http://mybakingcreations.com/
- https://mybakingcreations.com/
- https://mybakingcreations.com/gallery.html
- https://mybakingcreations.com/custom-cakes-san-francisco
- https://mybakingcreations.com/custom-cakes-daly-city
- https://mybakingcreations.com/delivery-areas
- https://mybakingcreations.com/gallery-cookies

## Recommended Action

# Keyword Cannibalization Consolidation Plan
## Query: "my baking creations sf"

---

## 1. Canonical Version: `https://mybakingcreations.com/`

**Why:**
- The root domain homepage is the strongest authority signal for branded + location queries like "my baking creations sf"
- It already has the most inbound links and domain authority concentrated at the root
- The HTTP version (`http://mybakingcreations.com/`) should already be 301ing to HTTPS — if it isn't, that's your first technical fix
- Branded queries with a city modifier ("sf") are best served by the homepage, not a subdirectory page

---

## 2. Content to Merge INTO `https://mybakingcreations.com/`

Pull these specific content elements into the homepage **before** redirecting:

| Source Page | Content to Extract |
|---|---|
| `/custom-cakes-san-francisco` | SF-specific service descriptions, any SF neighborhood mentions, pricing or ordering CTAs tied to SF |
| `/custom-cakes-daly-city` | Keep as standalone (different geo target — do NOT merge this one) |
| `/delivery-areas` | Extract the SF delivery zone summary as a short section on the homepage (e.g., "We deliver throughout San Francisco and surrounding areas") |
| `/gallery.html` | Pull 3–6 hero images onto the homepage if not already present |
| `/gallery-cookies` | Pull 2–3 cookie showcase images onto the homepage |

**Important:** Do not remove `/custom-cakes-daly-city` or `/delivery-areas` entirely — they serve different or supplementary intents (see Section 3).

---

## 3. Pages That Should Get 301 Redirects

These pages are directly cannibalizing the homepage for the "my baking creations sf" query and have no unique geo or intent value worth preserving:

| Page | Redirect To | Reason |
|---|---|---|
| `http://mybakingcreations.com/` | `https://mybakingcreations.com/` | HTTP→HTTPS, non-negotiable technical fix |
| `https://mybakingcreations.com/custom-cakes-san-francisco` | `https://mybakingcreations.com/` | SF content merges into homepage; page splits authority on branded SF query |
| `https://mybakingcreations.com/gallery.html` | `https://mybakingcreations.com/gallery-cookies` | Consolidate gallery pages into one; `/gallery-cookies` is more specific and likely has more content |

**Do NOT 301 these:**
- `/custom-cakes-daly-city` — targets a distinct geo keyword, keep it live
- `/delivery-areas` — serves informational intent, keep it live

---

## 4. Pages That Should Get `rel=canonical` Tags

For pages you want to **keep live** but prevent from competing on the branded SF query:

```html
<!-- Add to <head> of /delivery-areas -->
<link rel="canonical" href="https://mybakingcreations.com/delivery-areas" />

<!-- Add to <head> of /custom-cakes-daly-city -->
<link rel="canonical" href="https://mybakingcreations.com/custom-cakes-daly-city" />

<!-- Add to <head> of /gallery-cookies (after gallery.html redirects here) -->
<link rel="canonical" href="https://mybakingcreations.com/gallery-cookies" />
```

> These self-referencing canonicals confirm to Google which version of each remaining page is authoritative and prevents future duplication drift.

---

## 5. Internal Linking Changes

**On `https://mybakingcreations.com/` (homepage) — update all internal links:**

- [ ] Remove any links pointing to `/custom-cakes-san-francisco` (it will 301, but clean links are better than relying on redirects)
- [ ] Remove any links pointing to `/gallery.html` — update to point to `/gallery-cookies`
- [ ] Ensure the homepage links to `/custom-cakes-daly-city` with anchor text like **"Custom Cakes – Daly City"** (keeps geo pages clearly scoped)
- [ ] Ensure the homepage links to `/delivery-areas` with anchor text like **"See Delivery Areas"** — this passes authority to the page while keeping it clearly subordinate

**On `/delivery-areas`:**
- [ ] Add a contextual link back to the homepage using anchor text **"custom cakes in San Francisco"** — reinforces homepage relevance for the SF query

**On `/custom-cakes-daly-city`:**
- [ ] Add a breadcrumb or footer link back to homepage — do NOT use "San Francisco" anchor text here, use **"Home"** or the brand name to avoid cross-geo signal confusion

---

## Implementation Priority Order

```
1. Fix HTTP → HTTPS 301 (immediate, technical)
2. Merge SF content into homepage
3. 301 /custom-cakes-san-francisco → homepage
4. 301 /gallery.html → /gallery-cookies
5. Add self-referencing canonicals to remaining pages
6. Update internal links sitewide
```

---

**Expected outcome:** Consolidating the HTTP/HTTPS split and the `/custom-cakes-san-francisco` page alone should meaningfully concentrate link equity and topical relevance signals onto the homepage for this branded + geo query.

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
