# Cannibalization Fix: cakes

## Competing Pages

- https://mybakingcreations.com/
- https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
- https://mybakingcreations.com/blog-best-wedding-cake-flavors
- https://mybakingcreations.com/custom-cakes-daly-city
- https://mybakingcreations.com/custom-cakes-hayward
- https://mybakingcreations.com/custom-cakes-palo-alto
- https://mybakingcreations.com/custom-cakes-san-bruno
- https://mybakingcreations.com/custom-cakes-san-rafael
- https://mybakingcreations.com/custom-cakes-sunnyvale

## Recommended Action

# Keyword Cannibalization Analysis: "cakes"

## Diagnosis

You have **9 URLs competing** for the same core "cakes" query. The location-specific pages (`/custom-cakes-[city]`) are particularly problematic because they share nearly identical content intent while the UTM-tagged URL creates a duplicate indexation risk.

---

## 1. Canonical Version: `https://mybakingcreations.com/`

**Why the homepage wins:**
- Highest domain authority signal as the root URL
- Most likely to have the strongest existing backlink profile
- Google already associates brand + category queries with homepages for small local businesses
- Consolidating here captures both branded and generic "cakes" searches in one authoritative page

---

## 2. Unique Content to Merge Into the Homepage

Pull these specific elements from competing pages **before** redirecting them:

| Source Page | Content to Extract & Merge |
|---|---|
| `/custom-cakes-daly-city` | Any Daly City-specific testimonials, neighborhood references, or service area copy |
| `/custom-cakes-hayward` | Hayward-specific testimonials or service details |
| `/custom-cakes-palo-alto` | Palo Alto-specific testimonials or service details |
| `/custom-cakes-san-bruno` | San Bruno-specific testimonials or service details |
| `/custom-cakes-san-rafael` | San Rafael-specific testimonials or service details |
| `/custom-cakes-sunnyvale` | Sunnyvale-specific testimonials or service details |
| `/blog-best-wedding-cake-flavors` | **Do not merge** — keep this page live (see Section 4) |

**Merge format recommendation:** Add a **"Areas We Serve"** section to the homepage listing all six cities with 1–2 sentences each, consolidating the geo-specific signals without creating new content.

---

## 3. Pages That Should Get 301 Redirects

These pages have no standalone ranking justification and should permanently redirect to the homepage:

```
301: https://mybakingcreations.com/?utm_source=gbp&utm_medium=profile&utm_campaign=daly_city
→ https://mybakingcreations.com/

301: https://mybakingcreations.com/custom-cakes-daly-city
→ https://mybakingcreations.com/

301: https://mybakingcreations.com/custom-cakes-hayward
→ https://mybakingcreations.com/

301: https://mybakingcreations.com/custom-cakes-palo-alto
→ https://mybakingcreations.com/

301: https://mybakingcreations.com/custom-cakes-san-bruno
→ https://mybakingcreations.com/

301: https://mybakingcreations.com/custom-cakes-san-rafael
→ https://mybakingcreations.com/

301: https://mybakingcreations.com/custom-cakes-sunnyvale
→ https://mybakingcreations.com/
```

**Priority:** The UTM redirect is **urgent** — that URL should never be indexable. Implement this first.

---

## 4. Pages That Should Get rel=canonical Tags

Only one page warrants a canonical tag rather than a redirect:

```html
<!-- On: https://mybakingcreations.com/blog-best-wedding-cake-flavors -->
<link rel="canonical" href="https://mybakingcreations.com/blog-best-wedding-cake-flavors" />
```

**Why not redirect the blog post:**
- It targets a distinct query ("wedding cake flavors") not "cakes" broadly
- Blog content earns topical authority and potential backlinks
- Self-referencing canonical confirms it as the intended indexable version
- Redirecting it would destroy any ranking equity it has built independently

**Also confirm this tag exists on the homepage itself:**
```html
<!-- On: https://mybakingcreations.com/ -->
<link rel="canonical" href="https://mybakingcreations.com/" />
```

---

## 5. Internal Linking Changes

After implementing redirects, update these internal links:

### Remove/Update Broken Internal Links
- Audit every page that links to the six `/custom-cakes-[city]` URLs and update those links to point directly to `https://mybakingcreations.com/` — **do not rely on the 301 chain for internal links**

### Blog Post → Homepage Link
- Ensure `/blog-best-wedding-cake-flavors` contains at least one contextual link back to the homepage using anchor text like **"custom cakes"** or **"order a cake"** to pass topical relevance upward

### Google Business Profile
- Update your GBP website URL from the UTM version to the clean homepage URL: `https://mybakingcreations.com/`
- UTM parameters are for analytics only — GBP should not be sending Google a UTM URL as your canonical business URL

---

## Implementation Order

```
Step 1 → Fix UTM redirect (indexation risk, do today)
Step 2 → Extract city-specific content from /custom-cakes-[city] pages
Step 3 → Merge "Areas We Serve" section into homepage
Step 4 → Implement 6 city page 301 redirects
Step 5 → Audit and update all internal links
Step 6 → Verify canonical tags on homepage and blog post
Step 7 → Submit updated homepage to Google Search Console for recrawl
```

## Implementation

1. Choose the strongest page as the canonical version
2. Add `rel=canonical` pointing to the canonical page from all others
3. Consider 301 redirecting weaker pages to the canonical
4. Merge unique content from weaker pages into the canonical
