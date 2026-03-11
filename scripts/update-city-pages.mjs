#!/usr/bin/env node
/**
 * City Page Template Updater
 *
 * Reads each custom-cakes-{city}.html, extracts city-specific content,
 * and regenerates the page using the current homepage template features.
 *
 * Usage: node scripts/update-city-pages.mjs [--dry-run] [--city=daly-city]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const dryRun = process.argv.includes('--dry-run');
const singleCity = process.argv.find(a => a.startsWith('--city='))?.split('=')[1];

// ─── Extract city-specific data from existing page ───────────────────────

function extractCityData(html, slug) {
  const get = (re) => {
    const m = html.match(re);
    return m ? m[1].trim() : '';
  };

  // Title
  const title = get(/<title>([^<]+)<\/title>/);

  // Meta description
  const metaDesc = get(/<meta\s+name="description"\s+content="([^"]+)"/);

  // Canonical
  const canonical = get(/<link\s+rel="canonical"\s+href="([^"]+)"/);

  // OG tags
  const ogTitle = get(/<meta\s+property="og:title"\s+content="([^"]+)"/);
  const ogDesc = get(/<meta\s+property="og:description"\s+content="([^"]+)"/);

  // Twitter tags
  const twitterTitle = get(/<meta\s+name="twitter:title"\s+content="([^"]+)"/);
  const twitterDesc = get(/<meta\s+name="twitter:description"\s+content="([^"]+)"/);

  // JSON-LD areaServed
  const areaServedMatch = html.match(/"areaServed"\s*:\s*\{[^}]+\}/s);
  const areaServed = areaServedMatch ? areaServedMatch[0].replace('"areaServed" :', '"areaServed":') : '';

  // Hero badge text
  const heroBadge = get(/<div class="hero-badge">([^<]+)<\/div>/);

  // Hero H1 (may contain spans)
  const heroH1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  const heroH1 = heroH1Match ? heroH1Match[1].trim() : '';

  // Hero description
  const heroDesc = get(/<p class="hero-description">([^<]+)<\/p>/);

  // Hero breadcrumb
  const breadcrumbMatch = html.match(/<p class="hero-breadcrumb">([\s\S]*?)<\/p>/);
  const heroBreadcrumb = breadcrumbMatch ? breadcrumbMatch[1].trim() : '';

  // Breadcrumb JSON-LD
  const breadcrumbJsonMatch = html.match(/<script type="application\/ld\+json">\s*\{[^{]*"@type"\s*:\s*"BreadcrumbList"[\s\S]*?\}\s*<\/script>/);
  const breadcrumbJson = breadcrumbJsonMatch ? breadcrumbJsonMatch[0] : '';

  // SEO content paragraphs (inside .seo-content div)
  const seoMatch = html.match(/<div class="seo-content"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
  const seoContent = seoMatch ? seoMatch[1].trim() : '';

  // City name from hero H1 (extract from highlight-yellow span or after "in ")
  const cityNameMatch = heroH1.match(/<span class="highlight-yellow">([^<]+)<\/span>/);
  const cityName = cityNameMatch ? cityNameMatch[1] : slug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');

  // Service cards section - extract city-localized descriptions
  const servicesMatch = html.match(/<div class="tile-grid-4">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
  const servicesHtml = servicesMatch ? servicesMatch[1].trim() : '';

  // Extract individual service card texts
  const cakeCardDesc = get(/<h3>Custom Cakes<\/h3>\s*<p>([^<]+)<\/p>/);
  const cookieCardDesc = get(/<h3>Custom Cookies<\/h3>\s*<p>([^<]+)<\/p>/);
  const cakepopCardDesc = get(/<h3>Cake Pops<\/h3>\s*<p>([^<]+)<\/p>/);

  // CTA section heading
  const ctaHeadingMatch = html.match(/<h2>([^<]*<span class="highlight">Custom Cake<\/span>[^<]*)<\/h2>\s*<\/div>\s*<div class="section-header">/);
  // Try alternate pattern
  const ctaMatch = html.match(/Order Your\s+([^<]+)\s*<span class="highlight">Custom Cake<\/span>/);
  const ctaCityPrefix = ctaMatch ? ctaMatch[1].trim() : cityName;

  // Services section header
  const servicesHeaderMatch = html.match(/What We\s*<span class="highlight">Create<\/span>\s*(?:for\s+([^<]+))?/);
  const servicesCitySuffix = servicesHeaderMatch && servicesHeaderMatch[1] ? servicesHeaderMatch[1].trim() : cityName;

  // Bakery JSON-LD description
  const jsonLdDescMatch = html.match(/"@type"\s*:\s*"Bakery"[\s\S]*?"description"\s*:\s*"([^"]+)"/);
  const jsonLdDesc = jsonLdDescMatch ? jsonLdDescMatch[1] : '';

  // JSON-LD sameAs
  const sameAsMatch = html.match(/"sameAs"\s*:\s*\[([\s\S]*?)\]/);
  const sameAs = sameAsMatch ? sameAsMatch[1].trim() : '';

  return {
    slug,
    cityName,
    title,
    metaDesc,
    canonical,
    ogTitle,
    ogDesc,
    twitterTitle,
    twitterDesc,
    areaServed,
    heroBadge,
    heroH1,
    heroDesc,
    heroBreadcrumb,
    breadcrumbJson,
    seoContent,
    cakeCardDesc,
    cookieCardDesc,
    cakepopCardDesc,
    ctaCityPrefix,
    servicesCitySuffix,
    jsonLdDesc,
    sameAs,
  };
}

// ─── Generate updated city page ──────────────────────────────────────────

function generateCityPage(d) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="google-site-verification" content="google56fbc2040830820a" />
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-KB96GDJ011"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-KB96GDJ011');
    </script>
    <script src="ga-events.js" defer></script>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src 'self'; connect-src 'self' https://www.google-analytics.com https://*.workers.dev;">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="logo_icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#EC268F">
    <title>${d.title}</title>
    <meta name="description" content="${d.metaDesc}">
    <meta name="referrer" content="strict-origin-when-cross-origin">
    <link rel="canonical" href="${d.canonical}">
    <meta property="og:title" content="${d.ogTitle}">
    <meta property="og:description" content="${d.ogDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${d.canonical}">
    <meta property="og:locale" content="en_US">
    <meta property="og:site_name" content="My Baking Creations">
    <meta property="og:image" content="https://mybakingcreations.com/images/gallery/carousel/carousel%201.jpg">
    <meta property="og:image:width" content="1920">
    <meta property="og:image:height" content="1066">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${d.twitterTitle}">
    <meta name="twitter:description" content="${d.twitterDesc}">
    <meta name="twitter:image" content="https://mybakingcreations.com/logo_icon.png">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Bakery",
        "name": "My Baking Creations",
        "description": "${d.jsonLdDesc || `Custom cakes, cookies, and cake pops for ${d.cityName} birthdays, weddings, and corporate events.`}",
        "url": "https://mybakingcreations.com",
        "telephone": "+1-415-568-8060",
        "email": "info@mybakingcreations.com",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "1096 Wildwood Ave",
            "addressLocality": "Daly City",
            "addressRegion": "CA",
            "postalCode": "94015",
            "addressCountry": "US"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": 37.6879,
            "longitude": -122.4702
        },
        ${d.areaServed || `"areaServed": {
            "@type": "City",
            "name": "${d.cityName}"
        }`},
        "openingHours": "Mo-Sa 09:00-18:00",
        "priceRange": "$$",
        "servesCuisine": "Bakery",
        "foundingDate": "2012",
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Custom Cakes", "description": "Sculpted, tiered, and ultra-realistic cake designs" },
                "priceCurrency": "USD",
                "priceSpecification": { "@type": "PriceSpecification", "minPrice": "250", "maxPrice": "650", "priceCurrency": "USD" }
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Custom Cookies", "description": "Logo cookies and decorated sugar cookies" },
                "priceCurrency": "USD",
                "priceSpecification": { "@type": "PriceSpecification", "minPrice": "5", "maxPrice": "8", "priceCurrency": "USD" }
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Cake Pops", "description": "Hand-decorated cake pops in any theme" },
                "priceCurrency": "USD",
                "priceSpecification": { "@type": "PriceSpecification", "minPrice": "5", "maxPrice": "10", "priceCurrency": "USD" }
            },
            {
                "@type": "Offer",
                "itemOffered": { "@type": "Service", "name": "Cupcakes", "description": "Elegantly decorated cupcakes for celebrations and events" },
                "priceCurrency": "USD",
                "priceSpecification": { "@type": "PriceSpecification", "minPrice": "5", "maxPrice": "8", "priceCurrency": "USD" }
            }
        ],
        "sameAs": [
            ${d.sameAs || `"https://www.instagram.com/mybakingcreationscompany/",
            "https://www.facebook.com/MyBakingCreationsCompany",
            "https://www.pinterest.com/MyBakingCreations",
            "https://www.yelp.com/biz/my-baking-creations-san-francisco"`}
        ]
    }
    </script>
    ${d.breadcrumbJson}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://www.google-analytics.com">
    <link rel="dns-prefetch" href="https://www.googletagmanager.com">
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media='all'">
    <noscript><link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet"></noscript>
    <link rel="preload" href="style.css" as="style">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- FLOATING SOCIAL SIDEBAR -->
    <div class="social-sidebar">
        <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" class="social-instagram" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
        </a>
        <a href="https://www.facebook.com/MyBakingCreationsCompany" target="_blank" rel="noopener" class="social-facebook" aria-label="Facebook">
            <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
        </a>
        <a href="https://www.pinterest.com/MyBakingCreations/" target="_blank" rel="noopener" class="social-pinterest" aria-label="Pinterest">
            <svg viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
        </a>
        <a href="https://www.yelp.com/biz/my-baking-creations-san-francisco" target="_blank" rel="noopener" class="social-yelp" aria-label="Yelp">
            <img src="images/gallery/companylogos/yelp white black png.webp" alt="Yelp" width="20" height="20">
        </a>
    </div>

    <!-- HEADER -->
    <header>
        <canvas id="nav-particles"></canvas>
        <nav aria-label="Main navigation">
            <a href="buy-now" class="order-now-btn">Order Now</a>
            <a href="/" class="logo">
                <img width="1330" height="1222" src="logo_icon.png" alt="My Baking Creations logo" class="logo-icon">
                <div class="logo-text">
                    <span class="my">my</span><span class="baking">baking</span>
                    <span class="creations">CREATIONS</span>
                </div>
            </a>
            <ul class="nav-links">
                <li><a href="/">Home</a></li>
                <li><a href="about">About Us</a></li>
                <li class="dropdown">
                    <a href="gallery">Gallery</a>
                    <ul class="dropdown-menu">
                        <li><a href="gallery-cakes">Cakes</a></li>
                        <li class="dropdown-subcategory"><a href="gallery-cakes-sculpted">Sculpted Cakes</a></li>
                        <li class="dropdown-subcategory"><a href="gallery-cakes-realistic">Realistic Cakes</a></li>
                        <li class="dropdown-subcategory"><a href="gallery-cakes-wedding">Wedding Cakes</a></li>
                        <li><a href="gallery-cookies">Cookies</a></li>
                        <li class="dropdown-subcategory"><a href="gallery-cookies-hand-piped">Hand Piped</a></li>
                        <li class="dropdown-subcategory"><a href="gallery-cookies-printed">Printed Image</a></li>
                        <li><a href="gallery-cakepops">Cake Pops</a></li>
                        <li><a href="gallery-cupcakes">Cupcakes</a></li>
                        <li class="dropdown-divider"></li>
                        <li><a href="gallery-corporate-cakes">Corporate Cakes</a></li>
                        <li><a href="gallery-corporate-cookies">Corporate Cookies</a></li>
                        <li class="dropdown-subcategory"><a href="gallery-corporate-cookies-printed">Corporate Printed</a></li>
                        <li><a href="gallery-corporate-cakepops">Corporate Cake Pops</a></li>
                        <li><a href="gallery-corporate-cupcakes">Corporate Cupcakes</a></li>
                    </ul>
                </li>
                <li><a href="corporate">Corporate Orders</a></li>
                <li><a href="blog">Blog</a></li>
                <li><a href="https://thewhole.party/" target="_blank" rel="noopener">Party Rentals</a></li>
                <li><a href="contact">Contact Us</a></li>
                <li><a href="order-form" class="nav-cta">Get a Quote</a></li>
            </ul>
            <div class="search-container">
                <div class="search-wrapper">
                    <label for="site-search" class="visually-hidden">Search gallery and blog</label>
                    <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" style="width:16px;height:16px;max-width:16px;max-height:16px;" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input typewriter-active" id="site-search" placeholder="Search..." autocomplete="off">
                    <span class="typewriter-placeholder" id="search-typewriter" aria-hidden="true"><span class="cursor"></span></span>
                </div>
                <div class="search-results" id="search-results" role="listbox" aria-label="Search results"></div>
            </div>
            <button class="mobile-menu-btn" aria-label="Open menu">☰</button>
        </nav>
    </header>

    <main>

    <!-- HERO -->
    <section class="hero hero-carousel">
        <div class="carousel-track-container">
            <div class="carousel-track">
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 1.webp" type="image/webp"><img src="images/gallery/carousel/carousel 1.jpg" alt="Custom birthday cake delivery in ${d.cityName}" width="707" height="393" fetchpriority="high"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 2.webp" type="image/webp"><img src="images/gallery/carousel/carousel 2.jpg" alt="Decorated cookies for ${d.cityName} events" width="707" height="429" fetchpriority="high"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 3.webp" type="image/webp"><img src="images/gallery/carousel/carousel 3.jpg" alt="Wedding cake for ${d.cityName} celebrations" width="707" height="391" fetchpriority="high"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 4.webp" type="image/webp"><img src="images/gallery/carousel/carousel 4.jpg" alt="Custom themed cake pops for ${d.cityName}" width="707" height="321" loading="lazy"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 5.webp" type="image/webp"><img src="images/gallery/carousel/carousel 5.jpg" alt="Corporate logo cookies for ${d.cityName} businesses" width="707" height="388" loading="lazy"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 10.webp" type="image/webp"><img src="images/gallery/carousel/carousel 10.jpg" alt="Realistic sculpted cake design for ${d.cityName}" width="707" height="365" loading="lazy"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 7.webp" type="image/webp"><img src="images/gallery/carousel/carousel 7.jpg" alt="Hand-piped decorated cookies for ${d.cityName}" width="707" height="509" loading="lazy"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 8.webp" type="image/webp"><img src="images/gallery/carousel/carousel 8.jpg" alt="Custom cupcakes for ${d.cityName} parties" width="707" height="292" loading="lazy"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 9.webp" type="image/webp"><img src="images/gallery/carousel/carousel 9.jpg" alt="Artisan baked goods delivered to ${d.cityName}" width="707" height="437" loading="lazy"></picture></div>
                <div class="carousel-slide"><picture><source srcset="images/gallery/carousel/carousel 6.webp" type="image/webp"><img src="images/gallery/carousel/carousel 6.jpg" alt="Custom celebration cake for ${d.cityName}" width="707" height="342" loading="lazy"></picture></div>
            </div>
        </div>
        <div class="hero-content">
            <div class="hero-text-box">
                <p class="hero-breadcrumb">${d.heroBreadcrumb}</p>
                <div class="hero-badge">${d.heroBadge}</div>
                <h1>${d.heroH1}</h1>
                <p class="hero-description">${d.heroDesc}</p>
                <div class="hero-buttons">
                    <a href="order-form" class="btn btn-primary">Order Your Cake</a>
                    <a href="gallery" class="btn btn-secondary">View Our Work</a>
                </div>
            </div>
        </div>
        <div class="hero-dots">
            <button class="hero-dot active" onclick="goToSlide(0)" aria-label="Slide 1"></button>
            <button class="hero-dot" onclick="goToSlide(1)" aria-label="Slide 2"></button>
            <button class="hero-dot" onclick="goToSlide(2)" aria-label="Slide 3"></button>
            <button class="hero-dot" onclick="goToSlide(3)" aria-label="Slide 4"></button>
            <button class="hero-dot" onclick="goToSlide(4)" aria-label="Slide 5"></button>
            <button class="hero-dot" onclick="goToSlide(5)" aria-label="Slide 6"></button>
            <button class="hero-dot" onclick="goToSlide(6)" aria-label="Slide 7"></button>
            <button class="hero-dot" onclick="goToSlide(7)" aria-label="Slide 8"></button>
            <button class="hero-dot" onclick="goToSlide(8)" aria-label="Slide 9"></button>
            <button class="hero-dot" onclick="goToSlide(9)" aria-label="Slide 10"></button>
        </div>
        <a href="#services" class="scroll-indicator" aria-label="Scroll down">
            <span class="scroll-indicator-text">Scroll</span>
            <div class="scroll-indicator-arrow">
                <svg viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/></svg>
            </div>
        </a>
    </section>

    <!-- CITY SEO CONTENT -->
    <section class="page-content">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>${d.cityName}'s Premier <span class="highlight">Custom Cake Bakery</span></h2>
            </div>
            <div class="seo-content" style="max-width: 900px; margin: 0 auto; text-align: left; line-height: 1.8;">
                ${d.seoContent}
            </div>
        </div>
    </section>

    <!-- SERVICES -->
    <section id="services" class="page-content" style="padding-top: 0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>What We <span class="highlight">Create</span> for ${d.servicesCitySuffix}</h2>
                <p>From elegant wedding cakes to playful birthday treats, every creation is custom-designed for your ${d.cityName} celebration.</p>
            </div>
            <div class="tile-grid-4">
                <a href="gallery-cakes" class="service-card reveal reveal-delay-1">
                    <picture><source srcset="images/gallery/categoryplaceholder/cakes.webp" type="image/webp"><img src="images/gallery/categoryplaceholder/cakes.jpg" alt="Custom cakes for ${d.cityName}" width="280" height="150" loading="lazy" style="width: 100%; height: 150px; object-fit: contain; background-color: #FFF8F0; border-radius: 15px; margin-bottom: 1rem;"></picture>
                    <h3>Custom Cakes</h3>
                    <p>${d.cakeCardDesc || `Birthday, wedding, and celebration cakes for ${d.cityName} families and events.`}</p>
                    <span class="price">$250 – $650+</span>
                    <span class="btn btn-secondary">View Cakes</span>
                </a>
                <a href="gallery-cookies" class="service-card reveal reveal-delay-2">
                    <picture><source srcset="images/gallery/categoryplaceholder/cookies.webp" type="image/webp"><img src="images/gallery/categoryplaceholder/cookies.PNG" alt="Custom cookies for ${d.cityName}" width="280" height="150" loading="lazy" style="width: 100%; height: 150px; object-fit: contain; background-color: #FFF8F0; border-radius: 15px; margin-bottom: 1rem;"></picture>
                    <h3>Custom Cookies</h3>
                    <p>${d.cookieCardDesc || `Decorated cookies and party favors for ${d.cityName} celebrations and events.`}</p>
                    <span class="price">$5 – $8</span>
                    <span class="btn btn-secondary">View Cookies</span>
                </a>
                <a href="gallery-cakepops" class="service-card reveal reveal-delay-3">
                    <picture><source srcset="images/gallery/categoryplaceholder/cakepops.webp" type="image/webp"><img src="images/gallery/categoryplaceholder/cakepops.jpg" alt="Cake pops for ${d.cityName} events" width="280" height="150" loading="lazy" style="width: 100%; height: 150px; object-fit: cover; background-color: #FFFFFF; border-radius: 15px; margin-bottom: 1rem;"></picture>
                    <h3>Cake Pops</h3>
                    <p>${d.cakepopCardDesc || `Custom cake pops for ${d.cityName} birthday parties, baby showers, and special events.`}</p>
                    <span class="price">$5 – $10</span>
                    <span class="btn btn-secondary">View Cake Pops</span>
                </a>
                <a href="gallery-cupcakes" class="service-card reveal reveal-delay-4">
                    <picture><source srcset="images/gallery/categoryplaceholder/Bumble bee themed cupcakes.webp" type="image/webp"><img src="images/gallery/categoryplaceholder/Bumble bee themed cupcakes.jpg" alt="Custom cupcakes for ${d.cityName}" width="280" height="150" loading="lazy" style="width: 100%; height: 150px; object-fit: cover; background-color: #FFF8F0; border-radius: 15px; margin-bottom: 1rem;"></picture>
                    <h3>Cupcakes</h3>
                    <p>Custom cupcakes for ${d.cityName} office parties, team celebrations, and birthday events. Easy to serve, no cutting required.</p>
                    <span class="price">$5 – $8</span>
                    <span class="btn btn-secondary">View Cupcakes</span>
                </a>
            </div>
        </div>
    </section>

    <!-- INSTAGRAM FEED -->
    <section class="page-content instagram-section" style="padding-top: 0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>Follow Us on <span class="highlight">Instagram</span></h2>
                <p>See our latest creations and behind-the-scenes moments</p>
            </div>
            <div class="ig-feed">
                <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" class="ig-post ig-video-post">
                    <div class="ig-post-header">
                        <img src="logo_icon.png" alt="MBC" class="ig-avatar">
                        <div class="ig-user-info">
                            <span class="ig-username">mybakingcreationscompany</span>
                            <span class="ig-location">Daly City, California</span>
                        </div>
                        <span class="ig-reel-badge">Reel</span>
                    </div>
                    <div class="ig-post-video">
                        <video autoplay muted loop playsinline>
                            <source src="insta/cube-web.mp4" type="video/mp4">
                        </video>
                    </div>
                    <div class="ig-post-actions">
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg>
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z"/></svg>
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M22 3L9.218 10.083M22 3l-7.782 18-3.635-8.302M22 3l-12.417 6.781L6 21l3.582-8.217"/></svg>
                    </div>
                    <div class="ig-post-likes">Ice Cube's 55th Birthday</div>
                    <div class="ig-post-caption"><strong>mybakingcreationscompany</strong> Custom cake for Ice Cube's 55th birthday celebration!</div>
                </a>
                <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" class="ig-post ig-video-post">
                    <div class="ig-post-header">
                        <img src="logo_icon.png" alt="MBC" class="ig-avatar">
                        <div class="ig-user-info">
                            <span class="ig-username">mybakingcreationscompany</span>
                            <span class="ig-location">Daly City, California</span>
                        </div>
                        <span class="ig-reel-badge">Reel</span>
                    </div>
                    <div class="ig-post-video">
                        <video autoplay muted loop playsinline>
                            <source src="insta/video2-web.mp4" type="video/mp4">
                        </video>
                    </div>
                    <div class="ig-post-actions">
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg>
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z"/></svg>
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M22 3L9.218 10.083M22 3l-7.782 18-3.635-8.302M22 3l-12.417 6.781L6 21l3.582-8.217"/></svg>
                    </div>
                    <div class="ig-post-likes">Client Appreciation</div>
                    <div class="ig-post-caption"><strong>mybakingcreationscompany</strong> Behind the scenes of our corporate orders!</div>
                </a>
                <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" class="ig-post ig-video-post">
                    <div class="ig-post-header">
                        <img src="logo_icon.png" alt="MBC" class="ig-avatar">
                        <div class="ig-user-info">
                            <span class="ig-username">mybakingcreationscompany</span>
                            <span class="ig-location">Daly City, California</span>
                        </div>
                        <span class="ig-reel-badge">Reel</span>
                    </div>
                    <div class="ig-post-video">
                        <video autoplay muted loop playsinline>
                            <source src="insta/video3-web.mp4" type="video/mp4">
                        </video>
                    </div>
                    <div class="ig-post-actions">
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M16.792 3.904A4.989 4.989 0 0 1 21.5 9.122c0 3.072-2.652 4.959-5.197 7.222-2.512 2.243-3.865 3.469-4.303 3.752-.477-.309-2.143-1.823-4.303-3.752C5.141 14.072 2.5 12.167 2.5 9.122a4.989 4.989 0 0 1 4.708-5.218 4.21 4.21 0 0 1 3.675 1.941c.84 1.175.98 1.763 1.12 1.763s.278-.588 1.11-1.766a4.17 4.17 0 0 1 3.679-1.938z"/></svg>
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22z"/></svg>
                        <svg class="ig-icon" viewBox="0 0 24 24"><path d="M22 3L9.218 10.083M22 3l-7.782 18-3.635-8.302M22 3l-12.417 6.781L6 21l3.582-8.217"/></svg>
                    </div>
                    <div class="ig-post-likes">Watch More</div>
                    <div class="ig-post-caption"><strong>mybakingcreationscompany</strong> See more creations on our Instagram!</div>
                </a>
            </div>
            <div style="text-align: center; margin-top: 1.5rem;">
                <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" class="btn btn-instagram">
                    <svg viewBox="0 0 24 24" width="18" height="18" style="margin-right: 8px; vertical-align: middle;"><path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    Follow @mybakingcreationscompany
                </a>
            </div>
        </div>
    </section>

    <!-- TRUSTED BY -->
    <section class="page-content" style="padding-top: 0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>Trusted by Leading Companies</h2>
                <p>Silicon Valley's trusted bakery for employee appreciation gifts, client thank-you packages, product launches, and company milestone celebrations.</p>
            </div>
            <div class="corporate-logos-grid">
                <img src="company logos/google-logo.png" alt="Google" width="176" height="59" loading="lazy">
                <img src="company logos/meta-logo.png" alt="Meta" width="106" height="59" loading="lazy">
                <img src="images/gallery/companylogos/microsoft logo.jpg" alt="Microsoft" width="162" height="59" loading="lazy">
                <img src="company logos/salesforce-logo.png" alt="Salesforce" width="85" height="59" loading="lazy">
                <img src="company logos/docusign-logo.png" alt="DocuSign" width="250" height="50" loading="lazy">
                <img src="company logos/OpenAI Logo.png" alt="OpenAI" width="106" height="59" loading="lazy">
                <img src="company logos/instagram-logo.png" alt="Instagram" width="60" height="60" loading="lazy">
                <img src="company logos/paypal-logo.png" alt="PayPal" width="60" height="59" loading="lazy">
                <img src="company logos/gap-logo.png" alt="Gap" width="60" height="60" loading="lazy">
                <img src="company logos/alaska-airlines-logo.png" alt="Alaska Airlines" width="106" height="59" loading="lazy">
                <img src="company logos/warriors-logo.png" alt="Golden State Warriors" width="49" height="59" loading="lazy">
                <img src="company logos/twitch-logo.webp" alt="Twitch" width="60" height="60" loading="lazy">
                <img src="images/gallery/companylogos/cooley logo.png" alt="Cooley" width="183" height="59" loading="lazy">
                <img src="company logos/Stripe Logo.png" alt="Stripe" width="106" height="59" loading="lazy">
                <img src="images/gallery/companylogos/Levi's logo.png" alt="Levi's" width="143" height="59" loading="lazy">
                <img src="company logos/Kaiser Logo.png" alt="Kaiser Permanente" width="69" height="59" loading="lazy">
            </div>
            <div style="text-align: center;">
                <a href="corporate" class="btn btn-primary" style="margin-top: 1.5rem;">Learn About Corporate Orders</a>
            </div>
        </div>
    </section>

    <!-- CTA -->
    <section class="page-content" style="padding-top: 0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>Order Your ${d.ctaCityPrefix} <span class="highlight">Custom Cake</span></h2>
                <p style="max-width: 700px; margin: 0 auto;">Ready to order? Visit us at 1096 Wildwood Ave or contact us for a free consultation. We typically book 2-3 weeks in advance for custom orders.</p>
            </div>
            <div style="text-align: center; margin-top: 2rem;">
                <a href="order-form" class="btn btn-primary">Request a Quote</a>
            </div>
        </div>
    </section>

    </main>

    <!-- FOOTER -->
    <footer>
        <div class="footer-content">
            <div class="footer-logo">
                <span class="my">my</span><span class="baking">baking</span> Creations
            </div>
            <p class="footer-tagline">Family-owned Bay Area bakery since 2012</p>
            <div class="footer-links">
                <a href="/">Home</a>
                <a href="about">About Us</a>
                <a href="gallery">Gallery</a>
                <a href="corporate">Corporate Orders</a>
                <a href="partners">Partner With Us</a>
                <a href="blog">Blog</a>
                <a href="contact">Contact</a>
                <a href="book-consultation">Book Consultation</a>
                <a href="corporate-order">Corporate Quote</a>
                <a href="order-printed">Printed Cookies</a>
            </div>
            <div class="footer-sister" style="margin-top: 1.2rem; padding: 0.8rem 1.5rem; background: rgba(255,255,255,0.05); border-radius: 12px; display: inline-flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 0.85rem; color: rgba(255,255,255,0.7);">Need party rentals too?</span>
                <a href="https://thewhole.party/" target="_blank" rel="noopener" style="color: #EC268F; font-weight: 600; font-size: 0.9rem; text-decoration: none; display: inline-flex; align-items: center; gap: 0.3rem;">The Whole Party <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></a>
            </div>
            <div class="footer-locations" style="margin-top: 1.5rem; font-size: 0.8rem; opacity: 0.7; line-height: 1.8;">
                <strong style="color: var(--yellow); display: block; margin-bottom: 5px;">Bay Area Delivery Areas:</strong>
                <a href="custom-cakes-belmont">Belmont</a> | <a href="custom-cakes-berkeley">Berkeley</a> | <a href="custom-cakes-burlingame">Burlingame</a> | <a href="custom-cakes-campbell">Campbell</a> | <a href="custom-cakes-cupertino">Cupertino</a> | <a href="custom-cakes-daly-city">Daly City</a> | <a href="custom-cakes-foster-city">Foster City</a> | <a href="custom-cakes-fremont">Fremont</a> | <a href="custom-cakes-hayward">Hayward</a> | <a href="custom-cakes-los-altos">Los Altos</a> | <a href="custom-cakes-menlo-park">Menlo Park</a> | <a href="custom-cakes-millbrae">Millbrae</a> | <a href="custom-cakes-milpitas">Milpitas</a> | <a href="custom-cakes-mountain-view">Mountain View</a> | <a href="custom-cakes-novato">Novato</a> | <a href="custom-cakes-oakland">Oakland</a> | <a href="custom-cakes-pacifica">Pacifica</a> | <a href="custom-cakes-palo-alto">Palo Alto</a> | <a href="custom-cakes-redwood-city">Redwood City</a> | <a href="custom-cakes-san-bruno">San Bruno</a> | <a href="custom-cakes-san-carlos">San Carlos</a> | <a href="custom-cakes-san-francisco">San Francisco</a> | <a href="custom-cakes-san-jose">San Jose</a> | <a href="custom-cakes-san-mateo">San Mateo</a> | <a href="custom-cakes-san-rafael">San Rafael</a> | <a href="custom-cakes-santa-clara">Santa Clara</a> | <a href="custom-cakes-saratoga">Saratoga</a> | <a href="custom-cakes-south-san-francisco">South San Francisco</a> | <a href="custom-cakes-sunnyvale">Sunnyvale</a> | <a href="custom-cakes-union-city">Union City</a> | <a href="custom-cakes-walnut-creek">Walnut Creek</a> | <a href="delivery-areas" style="color: var(--yellow); font-weight: 600;">View All</a>
            </div>
            <div class="social-links" style="margin-top: 1.5rem;">
                <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" aria-label="Instagram">
                    <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/MyBakingCreationsCompany" target="_blank" rel="noopener" aria-label="Facebook">
                    <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="https://www.pinterest.com/MyBakingCreations" target="_blank" rel="noopener" aria-label="Pinterest">
                    <svg viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                </a>
                <a href="https://www.yelp.com/biz/my-baking-creations-san-francisco" target="_blank" rel="noopener" aria-label="Yelp">
                    <img src="images/gallery/companylogos/yelp white black png.webp" alt="Yelp" width="24" height="24" loading="lazy">
                </a>
            </div>
            <div class="footer-contact">
                <p><a href="tel:4155688060">(415) 568-8060</a> | <a href="mailto:info@mybakingcreations.com">info@mybakingcreations.com</a></p>
                <p>Main Kitchen: 1096 Wildwood Ave, Daly City, CA 94015</p>
                <p>SF Pickup: 1800 23rd Ave, San Francisco, CA 94122</p>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2026 My Baking Creations. All rights reserved. | <a href="privacy-policy" style="color: rgba(255,255,255,0.6);">Privacy Policy</a> | <a href="terms-of-service" style="color: rgba(255,255,255,0.6);">Terms of Service</a></p>
            </div>
            <div class="footer-ai-credit" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 0.5rem; opacity: 0.7;">
                <span style="font-size: 0.75rem; color: rgba(255,255,255,0.6);">AI features powered by</span>
                <img src="images/anthropic-logo.svg" alt="Anthropic" style="height: 12px; filter: brightness(0) invert(1); opacity: 0.8;">
                <span style="font-size: 0.75rem; color: rgba(255,255,255,0.8); font-weight: 600;">Claude</span>
            </div>
        </div>
    </footer>

    <script>
    fetch('order-form-modal.html')
        .then(r => r.text())
        .then(h => {
            document.body.insertAdjacentHTML('beforeend', h);
            const script = document.createElement('script');
            script.src = 'script.js';
            document.body.appendChild(script);
        });
    </script>

    <script src="carousel.js" defer></script>
    <script src="tilt-effects.js" defer></script>
    <script src="nav-particles.js" defer></script>
    <script src="activity-feed-widget.js" defer></script>
    <script src="consultation-widget.js?v=2" defer></script>

    <link rel="stylesheet" href="chatbot.css?v=2">
    <script src="chatbot.js?v=2" defer></script>
</body>
</html>`;
}

// ─── Main ────────────────────────────────────────────────────────────────

const files = readdirSync(ROOT)
  .filter(f => f.startsWith('custom-cakes-') && f.endsWith('.html'))
  .sort();

console.log(`Found ${files.length} city pages`);

let updated = 0;
let errors = 0;

for (const file of files) {
  const slug = file.replace('custom-cakes-', '').replace('.html', '');

  if (singleCity && slug !== singleCity) continue;

  try {
    const html = readFileSync(join(ROOT, file), 'utf-8');
    const data = extractCityData(html, slug);

    if (!data.heroH1 || !data.seoContent) {
      console.warn(`  WARN: ${file} — missing hero H1 or SEO content, skipping`);
      errors++;
      continue;
    }

    const newHtml = generateCityPage(data);

    if (dryRun) {
      console.log(`  [DRY] ${file} — ${data.cityName} (${data.title})`);
    } else {
      writeFileSync(join(ROOT, file), newHtml, 'utf-8');
      console.log(`  OK: ${file} — ${data.cityName}`);
    }
    updated++;
  } catch (err) {
    console.error(`  ERR: ${file} — ${err.message}`);
    errors++;
  }
}

console.log(`\nDone: ${updated} updated, ${errors} errors${dryRun ? ' (dry run)' : ''}`);
