# Cannibalization Fix: cake delivery

## Competing Pages

- https://mybakingcreations.com/custom-cakes-hayward
- https://mybakingcreations.com/custom-cakes-san-jose
- https://mybakingcreations.com/custom-cakes-sunnyvale
- https://mybakingcreations.com/
- https://mybakingcreations.com/custom-cakes-palo-alto
- https://mybakingcreations.com/custom-cakes-san-rafael

## Recommended Action

# Keyword Cannibalization Consolidation Plan: "cake delivery"

---

## Diagnosis

All six pages are likely competing for "cake delivery" because each city-specific page and the homepage probably mention delivery without a dedicated, authoritative delivery page. The homepage is diluting its own authority by competing with location pages, and the location pages are cannibalizing each other.

---

## 1. Canonical Version: `https://mybakingcreations.com/`

**Why the homepage wins:**

- It has the strongest domain authority signal as the root URL
- It likely already earns the most backlinks and internal links sitewide
- "Cake delivery" is a broad, non-geo-modified query — a city-specific page would only rank well for "cake delivery [city]", not the head term
- Google most commonly surfaces homepages for brand + service head terms

---

## 2. Unique Content to Merge INTO the Homepage

Audit each competing page and pull these specific elements into the homepage **before** redirecting:

| Source Page | Content to Extract & Merge |
|---|---|
| `/custom-cakes-hayward` | Any delivery radius details, Hayward-specific delivery fees or cutoff times |
| `/custom-cakes-san-jose` | San Jose delivery zone details, any testimonials mentioning delivery |
| `/custom-cakes-sunnyvale` | Sunnyvale delivery scheduling info, any unique delivery FAQ content |
| `/custom-cakes-palo-alto` | Palo Alto delivery coverage details, any pricing tiers mentioned |
| `/custom-cakes-san-rafael` | San Rafael delivery notes, any mentions of minimum order for delivery |

**Specifically add to the homepage:**

- A consolidated delivery coverage section listing all served cities (Hayward, San Jose, Sunnyvale, Palo Alto, San Rafael) — this satisfies local intent without separate competing pages
- Any delivery-specific FAQs currently buried on city pages
- Aggregate customer reviews that mention delivery experience

> ⚠️ Do not copy-paste duplicate text blocks. Synthesize the information into one cohesive homepage section.

---

## 3. Pages That Should Get 301 Redirects

These pages have no standalone justification for ranking on "cake delivery" and should permanently redirect:

```
301: https://mybakingcreations.com/custom-cakes-hayward → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-san-jose → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-sunnyvale → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-palo-alto → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-san-rafael → https://mybakingcreations.com/
```

**Implementation order:** Merge content first → verify homepage is updated → then activate redirects. Never redirect before the content is live on the destination page.

---

## 4. rel=canonical Tags

Since you are implementing hard 301 redirects on all competing pages, **rel=canonical tags are not needed here** — 301s are the stronger, preferred signal for consolidation.

**The one canonical tag to confirm:**

```html
<!-- On https://mybakingcreations.com/ — verify this self-referencing canonical exists -->
<link rel="canonical" href="https://mybakingcreations.com/" />
```

> If for any business reason you cannot redirect a city page (e.g., it has active ad campaigns pointing to it), add a `rel=canonical` pointing to the homepage as a temporary fallback — but 301 remains the goal.

---

## 5. Internal Linking Changes

**Remove:**
- Any internal links across the site that use anchor text "cake delivery" pointing to city pages — these are actively splitting link equity

**Update these specific link patterns:**

| Find This | Replace With |
|---|---|
| Links to `/custom-cakes-hayward` with "delivery" anchor text | Point to `https://mybakingcreations.com/` |
| Links to `/custom-cakes-san-jose` with "delivery" anchor text | Point to `https://mybakingcreations.com/` |
| Any footer/nav links listing city delivery pages separately | Consolidate into a single "Delivery Areas" section linking to homepage |
| Any blog posts or other pages linking to city pages for delivery context | Update to link to homepage with anchor text "cake delivery" |

**Add:**
- From any remaining city-relevant content elsewhere on the site, add contextual links back to the homepage using anchor text variations: "cake delivery," "order cake delivery," "custom cake delivery"

---

## Implementation Checklist

```
[ ] 1. Audit all 5 city pages — document unique delivery content
[ ] 2. Merge that content into homepage (delivery section + FAQ)
[ ] 3. Confirm self-referencing canonical on homepage
[ ] 4. Audit all internal links site-wide pointing to city pages
[ ] 5. Update internal links to point to homepage
[ ] 6. Activate 301 redirects for all 5 city pages
[ ] 7. Submit updated homepage to Google Search Console for indexing
[ ] 8. Monitor "cake delivery" ranking position over 4–6 weeks
[ ] 9. Check GSC Coverage report to confirm city pages are no longer indexed
```

---

**Expected outcome:** Consolidating link equity, content signals, and crawl authority into a single URL gives the homepage a significantly stronger relevance and authority signal for "cake delivery" than any one of the six diluted pages currently achieves.

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
