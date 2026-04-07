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
