# Cannibalization Fix: corporate cupcakes

## Competing Pages

- https://mybakingcreations.com/corporate
- https://mybakingcreations.com/gallery-corporate-cupcakes

## Recommended Action

# Keyword Cannibalization Consolidation Plan
## Query: "corporate cupcakes"

---

## 1. Canonical Version: `https://mybakingcreations.com/corporate`

**Reasoning:**
- Shorter, cleaner URL slug carries more topical authority and is easier to build backlinks to
- `/corporate` is the logical **service/landing page** — it should own transactional intent ("order corporate cupcakes")
- `/gallery-corporate-cupcakes` reads as a supporting asset, not a destination page — Google likely treats it as lower-authority by URL structure alone
- The root `/corporate` page is more likely to already hold existing backlinks and PageRank

---

## 2. Content to Merge INTO `/corporate`

Before touching redirects, audit `/gallery-corporate-cupcakes` and physically move these elements into `/corporate`:

| Content Element | Action |
|---|---|
| All gallery images of corporate cupcakes | Add as a dedicated gallery section within `/corporate` |
| Image alt text and filenames | Preserve exactly — these carry image SEO signals |
| Any captions describing flavors, quantities, or customization | Merge into existing product/service descriptions |
| Any client testimonials or brand logos shown | Add to a social proof section on `/corporate` |
| Schema markup (if any exists on gallery page) | Consolidate into `/corporate` schema |

**Do this BEFORE implementing redirects** — once you redirect, the gallery content must already live on `/corporate` or it disappears entirely.

---

## 3. Pages That Get 301 Redirects

| From (Redirect Source) | To (Destination) | Reason |
|---|---|---|
| `https://mybakingcreations.com/gallery-corporate-cupcakes` | `https://mybakingcreations.com/corporate` | Passes link equity, eliminates duplicate competition, removes orphaned gallery page |

**Implementation note:** Set this as a **permanent 301**, not a 302. A 302 will not consolidate PageRank and will leave the cannibalization problem partially intact.

---

## 4. rel=canonical Tags

| Page | Canonical Tag to Add |
|---|---|
| `https://mybakingcreations.com/corporate` | Self-referencing canonical: `<link rel="canonical" href="https://mybakingcreations.com/corporate" />` |
| `https://mybakingcreations.com/gallery-corporate-cupcakes` | **Do NOT add a canonical tag here** — use the 301 redirect instead. A canonical tag on a page you're redirecting creates conflicting signals |

> ⚠️ **Important:** rel=canonical and 301 redirect serve different purposes. Since `/gallery-corporate-cupcakes` is being fully retired, the 301 is the correct tool — not a canonical tag.

---

## 5. Internal Linking Changes

**Find every internal link pointing to `/gallery-corporate-cupcakes` and update it:**

| Location to Check | Current Link | Change To |
|---|---|---|
| Homepage (if linked) | `/gallery-corporate-cupcakes` | `/corporate` |
| Main navigation menu | `/gallery-corporate-cupcakes` | `/corporate` |
| Any blog posts referencing corporate orders | `/gallery-corporate-cupcakes` | `/corporate` |
| Footer links | `/gallery-corporate-cupcakes` | `/corporate` |
| Sitemap (`sitemap.xml`) | Remove `/gallery-corporate-cupcakes` entry | Keep only `/corporate` |

**Additionally on `/corporate` itself:**
- Ensure the page links to itself using anchor text variations like "corporate cupcakes," "custom corporate orders," and "branded cupcakes" — not just "click here"
- Remove any internal links FROM `/corporate` that point back to `/gallery-corporate-cupcakes` (circular confusion)

---

## Execution Checklist (In Order)

```
[ ] 1. Copy all gallery images + content from /gallery-corporate-cupcakes
[ ] 2. Integrate that content into /corporate
[ ] 3. Verify /corporate renders correctly with merged content
[ ] 4. Update all internal links site-wide to point to /corporate
[ ] 5. Remove /gallery-corporate-cupcakes from sitemap.xml
[ ] 6. Implement 301 redirect from /gallery-corporate-cupcakes → /corporate
[ ] 7. Add self-referencing canonical to /corporate
[ ] 8. Submit updated sitemap to Google Search Console
[ ] 9. Request indexing of /corporate in GSC
[ ] 10. Monitor GSC coverage report for /gallery-corporate-cupcakes to confirm deindexing
```

---

**Expected outcome:** Within 4–8 weeks, Google consolidates ranking signals behind `/corporate`, improving its position for "corporate cupcakes" and related queries while eliminating split authority between the two competing pages.

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
