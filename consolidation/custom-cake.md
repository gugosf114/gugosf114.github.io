# Cannibalization Fix: custom cake

## Competing Pages

- https://mybakingcreations.com/
- https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
- https://mybakingcreations.com/blog-how-to-order-custom-birthday-cake
- https://mybakingcreations.com/custom-cakes-cupertino
- https://mybakingcreations.com/custom-cakes-daly-city
- https://mybakingcreations.com/custom-cakes-fremont
- https://mybakingcreations.com/custom-cakes-hayward
- https://mybakingcreations.com/custom-cakes-mountain-view
- https://mybakingcreations.com/custom-cakes-palo-alto
- https://mybakingcreations.com/custom-cakes-san-francisco
- https://mybakingcreations.com/custom-cakes-san-jose
- https://mybakingcreations.com/custom-cakes-san-rafael
- https://mybakingcreations.com/custom-cakes-sunnyvale

## Recommended Action

# Keyword Cannibalization Analysis: "custom cake"
## mybakingcreations.com

---

## 1. Canonical Version: `https://mybakingcreations.com/`

**Why the homepage:**
- It carries the highest domain authority signals as the root URL
- It already competes for broad, non-geo-modified "custom cake" searches
- Consolidating link equity here strengthens the most commercially valuable page
- The UTM variant (`?utm_source=gbp...`) confirms Google Business Profile already points here, meaning Google already associates this URL with the brand's primary identity

---

## 2. Content to Merge INTO the Homepage

Pull these specific content elements from competing pages **before** redirecting them:

| Source Page | Content to Extract & Add to Homepage |
|---|---|
| `/blog-how-to-order-custom-birthday-cake` | The ordering process steps/FAQ content — add as an **"How to Order"** section on the homepage |
| `/custom-cakes-san-francisco` | Any SF-specific testimonials, photos, or service details |
| `/custom-cakes-daly-city` | Any Daly City-specific testimonials or photos |
| `/custom-cakes-cupertino` | Any Cupertino-specific testimonials or photos |
| `/custom-cakes-fremont` | Any Fremont-specific testimonials or photos |
| `/custom-cakes-hayward` | Any Hayward-specific testimonials or photos |
| `/custom-cakes-mountain-view` | Any Mountain View-specific testimonials or photos |
| `/custom-cakes-palo-alto` | Any Palo Alto-specific testimonials or photos |

**Specifically add to the homepage:**
- A **service area section** listing all cities (Cupertino, Daly City, Fremont, Hayward, Mountain View, Palo Alto, San Francisco) with brief geo-specific copy — this preserves local relevance signals without separate competing pages
- The ordering guide content from the blog post as a condensed section (e.g., "How It Works" or "How to Order Your Custom Cake")

---

## 3. Pages That Should Get 301 Redirects

These pages have no justification for independent existence for the "custom cake" query and should permanently redirect to the homepage:

```
301: https://mybakingcreations.com/custom-cakes-cupertino → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-daly-city → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-fremont → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-hayward → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-mountain-view → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-palo-alto → https://mybakingcreations.com/
301: https://mybakingcreations.com/custom-cakes-san-francisco → https://mybakingcreations.com/
301: https://mybakingcreations.com/blog-how-to-order-custom-birthday-cake → https://mybakingcreations.com/
```

**Implement these only AFTER** the content from each page has been merged into the homepage per Section 2 above.

---

## 4. Pages That Should Get rel=canonical Tags

**Only one page needs a canonical tag — the UTM variant:**

```html
<!-- Add to <head> of: -->
<!-- https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city -->

<link rel="canonical" href="https://mybakingcreations.com/" />
```

**Why canonical instead of 301 here:**
The UTM URL must remain live and functional because it tracks Google Business Profile traffic. A 301 redirect would break that attribution. The `rel=canonical` tag tells Google the homepage is the authoritative version while keeping the tracking URL operational.

> ⚠️ **Also verify** in Google Search Console that URL parameters are configured so Googlebot doesn't index UTM variants as separate pages.

---

## 5. Internal Linking Changes

**Remove or update these links sitewide:**

| Find This Link | Replace With |
|---|---|
| Any internal link pointing to `/custom-cakes-[city]` pages | Point to `https://mybakingcreations.com/` instead |
| Any internal link pointing to `/blog-how-to-order-custom-birthday-cake` | Point to `https://mybakingcreations.com/` with anchor text like "how to order a custom cake" |
| Any navigation menu items for individual city pages | Replace with a single "Service Areas" anchor link to the new service area section on the homepage (e.g., `/#service-areas`) |

**Add these new internal links:**
- From any remaining blog posts or pages that mention cities → link to `https://mybakingcreations.com/` using anchor text variations like **"custom cakes in the Bay Area"** or **"custom cake delivery"**
- Ensure the Google Business Profile link continues pointing to `https://mybakingcreations.com/` (not the UTM version — GBP appends UTM automatically)

---

## Implementation Order (Critical)

```
Step 1: Audit & screenshot all city pages and blog post for content
Step 2: Merge identified content into homepage
Step 3: Add rel=canonical to UTM variant page
Step 4: Implement all 301 redirects
Step 5: Update all internal links sitewide
Step 6: Verify in Google Search Console (Coverage + URL Inspection)
Step 7: Request indexing of updated homepage via GSC
```

> **Do not implement redirects before Step 2.** Redirecting first risks permanently losing content that currently exists only on those city pages.

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
