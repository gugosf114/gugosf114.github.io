const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../');
const DATA = require('./city-data.json');

const EXISTING = [
  {name:'Daly City',slug:'daly-city'},{name:'San Francisco',slug:'san-francisco'},
  {name:'San Jose',slug:'san-jose'},{name:'Palo Alto',slug:'palo-alto'},
  {name:'Mountain View',slug:'mountain-view'},{name:'San Rafael',slug:'san-rafael'}
];
const ALL = [...EXISTING,...DATA.map(c=>({name:c.name,slug:c.slug}))].sort((a,b)=>a.name.localeCompare(b.name));

function footerLinks(){return ALL.map(c=>`<a href="custom-cakes-${c.slug}">${c.name}</a>`).join(' &middot;\n                ');}
function neighborBtns(city){return city.neighbors.map(s=>{const c=ALL.find(x=>x.slug===s);return c?`<a href="custom-cakes-${c.slug}" class="btn btn-secondary" style="margin:0.3rem;">${c.name}</a>`:''}).filter(Boolean).join('\n                    ');}

function gen(c){
  const nh=c.neighborhoods.join(', ');
  const p1=`Looking for custom cake delivery in ${c.name}? My Baking Creations delivers handcrafted cakes, cookies, and cake pops to all ${c.name} neighborhoods including ${nh}. Just ${c.miles} miles from our Daly City bakery, your celebration treats arrive fresh in approximately ${c.driveMinutes} minutes.`;
  const p2=`${c.name} celebrations deserve extraordinary cakes. Whether you're hosting a birthday party near ${c.landmarks[0]}, a wedding at a local venue, or an event at ${c.landmarks[1]}, our custom cakes become the centerpiece. We've been creating sculpted 3D cakes, ultra-realistic designs, and hand-decorated cookies for ${c.culturalNote} since 2012.`;
  const p3=`Delivery to ${c.name} takes approximately ${c.driveMinutes} minutes from our Wildwood Avenue bakery in Daly City.${c.corporateNote?' We also serve '+c.corporateNote+' with branded cookies and corporate celebration cakes.':''} Order by ${c.orderBy} for same-day delivery, or book your custom cake 2\u20133 weeks in advance for the perfect design.`;

  const bakery=JSON.stringify({"@context":"https://schema.org","@type":"Bakery","name":"My Baking Creations","description":`Custom cakes, cookies, and cake pops delivered to ${c.name} for birthdays, weddings, and corporate events.`,"url":"https://mybakingcreations.com","telephone":"+1-415-568-8060","email":"info@mybakingcreations.com","address":{"@type":"PostalAddress","streetAddress":"1096 Wildwood Ave","addressLocality":"Daly City","addressRegion":"CA","postalCode":"94015","addressCountry":"US"},"geo":{"@type":"GeoCoordinates","latitude":37.6879,"longitude":-122.4702},"areaServed":{"@type":"City","name":c.name,"sameAs":`https://en.wikipedia.org/wiki/${c.wiki}`},"openingHours":"Mo-Sa 09:00-18:00","priceRange":"$$","servesCuisine":"Bakery","sameAs":["https://www.instagram.com/mybakingcreationscompany/","https://www.facebook.com/MyBakingCreationsCompany","https://www.pinterest.com/MyBakingCreations","https://www.yelp.com/biz/my-baking-creations-san-francisco"]},null,4);
  const bread=JSON.stringify({"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"https://mybakingcreations.com/"},{"@type":"ListItem","position":2,"name":`Custom Cake Delivery ${c.name}`}]},null,4);
  const faq=JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":c.faq.map(f=>({"@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))},null,4);
  const mapsUrl=`https://www.google.com/maps/dir/1096+Wildwood+Ave,+Daly+City,+CA+94015/${encodeURIComponent(c.name+', CA')}`;
  const faqHtml=c.faq.map(f=>`
                <details style="margin-bottom:1rem;background:white;border-radius:12px;padding:1.2rem 1.5rem;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                    <summary style="font-weight:700;font-size:1.05rem;cursor:pointer;color:var(--dark-brown);">${f.q}</summary>
                    <p style="margin-top:0.8rem;line-height:1.7;color:#555;">${f.a}</p>
                </details>`).join('');

return `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-KB96GDJ011"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-KB96GDJ011');
    </script>
    <script src="ga-events.js" defer></script>
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="logo_icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#EC268F">
    <title>Custom Cake Delivery in ${c.name}, CA | My Baking Creations</title>
    <meta name="description" content="${c.meta}">
    <link rel="canonical" href="https://mybakingcreations.com/custom-cakes-${c.slug}">
    <!-- Open Graph -->
    <meta property="og:title" content="Custom Cake Delivery ${c.name} | My Baking Creations">
    <meta property="og:description" content="${c.heroDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://mybakingcreations.com/custom-cakes-${c.slug}">
    <meta property="og:locale" content="en_US">
    <meta property="og:site_name" content="My Baking Creations">
    <meta property="og:image" content="https://mybakingcreations.com/images/gallery/carousel/carousel%201.jpg">
    <meta property="og:image:width" content="1920">
    <meta property="og:image:height" content="1066">
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Custom Cake Delivery ${c.name} | My Baking Creations">
    <meta name="twitter:description" content="${c.heroDesc}">
    <meta name="twitter:image" content="https://mybakingcreations.com/logo_icon.png">
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    ${bakery}
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
    <script type="application/ld+json">
    ${bread}
    </script>
    <script type="application/ld+json">
    ${faq}
    </script>
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
            <img width="980" height="980" src="images/gallery/companylogos/yelp white black png.webp" alt="Yelp">
        </a>
    </div>

    <!-- HEADER -->
    <header>
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
                    <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" style="width:16px;height:16px;max-width:16px;max-height:16px;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input typewriter-active" id="site-search" placeholder="" autocomplete="off">
                    <span class="typewriter-placeholder" id="search-typewriter"><span class="cursor"></span></span>
                </div>
                <div class="search-results" id="search-results"></div>
            </div>
            <button class="mobile-menu-btn" aria-label="Open menu">&#9776;</button>
        </nav>
    </header>

    <main>

    <!-- HERO -->
    <section class="hero hero-carousel">
        <div class="carousel-track-container">
            <div class="carousel-track">
                <div class="carousel-slide"><img width="1920" height="1066" src="images/gallery/carousel/carousel 1.jpg" alt="Custom cake delivery in ${c.name}"></div>
                <div class="carousel-slide"><img width="1920" height="1166" src="images/gallery/carousel/carousel 2.jpg" alt="Decorated cookies for ${c.name} events"></div>
                <div class="carousel-slide"><img width="1680" height="929" src="images/gallery/carousel/carousel 3.jpg" alt="Wedding cake for ${c.name} celebrations"></div>
            </div>
        </div>
        <div class="hero-content">
            <div class="hero-text-box">
                <p class="hero-breadcrumb"><a href="/">Home</a> / <a href="delivery-areas">Delivery Areas</a> / ${c.name}</p>
                <div class="hero-badge">Delivering to ${c.name} Since 2012</div>
                <h1><span class="highlight">Custom Cake Delivery</span> in <span class="highlight-yellow">${c.name}</span>, CA</h1>
                <p class="hero-description">${c.heroDesc}</p>
                <div class="hero-buttons">
                    <a href="order-form" class="btn btn-primary">Order Your Cake</a>
                    <a href="gallery" class="btn btn-secondary">View Our Work</a>
                </div>
                <a href="javascript:history.back()" class="back-link" style="margin-top: 1rem; display: inline-block;">&larr; Back</a>
            </div>
        </div>
    </section>

    <!-- DELIVERY CALLOUT -->
    <section class="page-content">
        <div class="section-wrapper section-white reveal" style="text-align:center;">
            <div style="display:inline-block;background:linear-gradient(135deg,#EC268F,#ff6b9d);color:white;padding:0.8rem 2rem;border-radius:50px;font-weight:700;font-size:1.1rem;margin-bottom:1.5rem;">
                &#x1F698; Same-day delivery to ${c.name} &mdash; order by ${c.orderBy}
            </div>
            <p style="max-width:700px;margin:0 auto 1.5rem;line-height:1.7;font-size:1.05rem;">
                Just <strong>${c.miles} miles</strong> from our Daly City bakery. Your custom cake arrives in approximately <strong>${c.driveMinutes} minutes</strong>, fresh and ready for your celebration.
            </p>
            <a href="${mapsUrl}" target="_blank" rel="noopener" class="btn btn-secondary">Get Directions from Our Bakery</a>
        </div>
    </section>

    <!-- MAIN CONTENT -->
    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>${c.name}'s Premier <span class="highlight">Custom Cake</span> Delivery</h2>
            </div>
            <div class="seo-content" style="max-width:900px;margin:0 auto;text-align:left;line-height:1.8;">
                <p style="margin-bottom:1.5rem;">${p1}</p>
                <p style="margin-bottom:1.5rem;">${p2}</p>
                <p style="margin-bottom:1.5rem;">${p3}</p>
            </div>
        </div>
    </section>

    <!-- SERVICES -->
    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-white reveal">
            <div class="section-header">
                <h2>What We <span class="highlight">Deliver</span> to ${c.name}</h2>
            </div>
            <div class="tile-grid-4">
                <a href="gallery-cakes" class="service-card reveal reveal-delay-1">
                    <img width="1200" height="1403" src="images/gallery/categoryplaceholder/cakes.jpg" alt="Custom cakes delivered to ${c.name}" style="width:100%;height:150px;object-fit:contain;background-color:#FFF8F0;border-radius:15px;margin-bottom:1rem;">
                    <h3>Custom Cakes</h3>
                    <p>Birthday, wedding, and celebration cakes delivered fresh to ${c.name}.</p>
                    <span class="price">$250 &ndash; $650+</span>
                    <span class="btn btn-secondary">View Cakes</span>
                </a>
                <a href="gallery-cookies" class="service-card reveal reveal-delay-2">
                    <img width="302" height="297" src="images/gallery/categoryplaceholder/cookies.PNG" alt="Custom cookies delivered to ${c.name}" style="width:100%;height:150px;object-fit:contain;background-color:#FFF8F0;border-radius:15px;margin-bottom:1rem;">
                    <h3>Custom Cookies</h3>
                    <p>Decorated cookies and party favors for ${c.name} celebrations.</p>
                    <span class="price">$5 &ndash; $8</span>
                    <span class="btn btn-secondary">View Cookies</span>
                </a>
                <a href="gallery-cakepops" class="service-card reveal reveal-delay-3">
                    <img width="1200" height="1171" src="images/gallery/categoryplaceholder/cakepops.jpg" alt="Cake pops for ${c.name} events" style="width:100%;height:150px;object-fit:contain;background-color:#FFFFFF;border-radius:15px;margin-bottom:1rem;">
                    <h3>Cake Pops</h3>
                    <p>Custom cake pops for ${c.name} birthday parties, baby showers, and events.</p>
                    <span class="price">$5 &ndash; $10</span>
                    <span class="btn btn-secondary">View Cake Pops</span>
                </a>
                <a href="corporate" class="service-card reveal reveal-delay-4">
                    <img width="2048" height="1536" src="images/gallery/categoryplaceholder/Bumble bee themed cupcakes.jpg" alt="Corporate treats delivered to ${c.name}" style="width:100%;height:150px;object-fit:contain;background-color:#FFF8F0;border-radius:15px;margin-bottom:1rem;">
                    <h3>Corporate Orders</h3>
                    <p>Employee appreciation and client gifts for ${c.name} businesses.</p>
                    <span class="price">Custom Quote</span>
                    <span class="btn btn-secondary">Learn More</span>
                </a>
            </div>
        </div>
    </section>

    <!-- FAQ -->
    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>Frequently Asked Questions &mdash; <span class="highlight">${c.name}</span> Delivery</h2>
            </div>
            <div style="max-width:800px;margin:0 auto;">${faqHtml}
            </div>
        </div>
    </section>

    <!-- NEARBY CITIES -->
    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-white reveal" style="text-align:center;">
            <div class="section-header">
                <h2>Also <span class="highlight">Delivering</span> To</h2>
            </div>
            <div style="margin-bottom:1.5rem;">
                    ${neighborBtns(c)}
            </div>
            <a href="delivery-areas" style="color:var(--pink);font-weight:600;">View all 31 delivery areas &rarr;</a>
        </div>
    </section>

    <!-- CTA -->
    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>Order Your ${c.name} <span class="highlight">Custom Cake</span></h2>
                <p style="max-width:700px;margin:0 auto;">Ready to order? We deliver to ${c.name} in about ${c.driveMinutes} minutes, or visit us at 1096 Wildwood Ave in Daly City. We typically book 2&ndash;3 weeks in advance for custom orders.</p>
            </div>
            <div style="text-align:center;margin-top:2rem;">
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
                <a href="blog">Blog</a>
                <a href="contact">Contact</a>
                <a href="book-consultation">Book Consultation</a>
                <a href="corporate-order">Corporate Quote</a>
                <a href="order-printed">Printed Cookies</a>
            </div>
            <div class="footer-sister" style="margin-top:1.2rem;padding:0.8rem 1.5rem;background:rgba(255,255,255,0.05);border-radius:12px;display:inline-flex;align-items:center;gap:0.75rem;">
                <span style="font-size:0.85rem;color:rgba(255,255,255,0.7);">Need party rentals too?</span>
                <a href="https://thewhole.party/" target="_blank" rel="noopener" style="color:#EC268F;font-weight:600;font-size:0.9rem;text-decoration:none;display:inline-flex;align-items:center;gap:0.3rem;">The Whole Party <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg></a>
            </div>
            <div class="footer-locations" style="margin-top:1rem;font-size:0.85rem;line-height:2;">
                <span style="color:var(--yellow);font-weight:600;">Delivering to:</span>
                ${footerLinks()}
                <br><a href="delivery-areas" style="color:var(--pink);font-weight:600;">All delivery areas &rarr;</a>
            </div>
            <div class="social-links">
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
                    <svg viewBox="0 0 24 24"><path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.396-2.529-3.994a.726.726 0 0 1 .086-.89.937.937 0 0 1 .889-.179c.139.048 2.665.921 3.457 1.203.601.214.912.478.976.903zm-7.467-3.937a.902.902 0 0 1 .222.883c-.063.211-.104.347-.104.347-.089.291-1.034 3.375-1.248 4.037-.163.504-.399.741-.811.741-.96 0-3.18-2.083-3.371-2.995-.054-.258-.021-.515.101-.744.078-.147 2.076-3.146 2.726-4.091.178-.259.414-.4.701-.4.325 0 .605.166.875.451.188.198.619.611.909.771zM10.747 9.02c.256.159.474.391.6.697.183.443-.009.943-.193 1.396-.076.188-1.637 3.807-1.637 3.807a.906.906 0 0 1-.761.535.876.876 0 0 1-.749-.323c-.113-.143-.204-.381-.204-.381-.591-1.404-3.158-7.502-3.421-8.337-.139-.441-.086-.835.162-1.201.541-.8 2.664-1.665 3.578-1.665.403 0 .717.187.935.556.083.141 1.162 4.163 1.69 4.916zM11.3 5.592l-.025.018.025-.018zm.244-.167c.074-.041.093-.048.116-.053-.023.005-.042.012-.116.053zm6.12 3.578c.025.748-1.889 3.24-2.586 3.51a.906.906 0 0 1-.342.069c-.312-.001-.561-.149-.766-.458-.128-.193-1.28-3.049-1.55-3.745a.934.934 0 0 1 .076-.887.878.878 0 0 1 .781-.4c.184.005.368.037.541.092.643.204 3.622.949 3.714 1.07.088.116.132.457.132.749zm-5.037-4.47c.012.039.017.079.026.117-.009-.038-.014-.078-.026-.117zm-.044-.156a.823.823 0 0 1 .027.08c-.01-.027-.018-.054-.027-.08zm5.136 4.267l.008.017-.008-.017z"/></svg>
                </a>
            </div>
            <div class="footer-contact">
                <p><a href="tel:4155688060">(415) 568-8060</a> | <a href="mailto:info@mybakingcreations.com">info@mybakingcreations.com</a></p>
                <p>1096 Wildwood Ave, Daly City, CA 94015</p>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 My Baking Creations. All rights reserved.</p>
            </div>
        </div>
    </footer>

    <style>
    .hero-carousel {
        position: relative;
        overflow: hidden;
        background: #ffffff;
        padding: 6rem 2rem 3rem;
        min-height: 450px;
        margin-top: 3rem;
    }
    .hero-carousel::before,
    .hero-carousel::after {
        display: none;
    }
    .carousel-track-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        overflow: hidden;
    }
    .carousel-track {
        display: flex;
        height: 100%;
    }
    .carousel-slide {
        flex: 0 0 33.333%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        box-sizing: border-box;
    }
    .carousel-slide img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        background: #ffffff;
    }
    .hero-carousel .hero-content {
        position: relative;
        z-index: 2;
    }
    .hero-text-box {
        background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.45) 100%);
        padding: 2.5rem 3rem;
        border-radius: 20px;
        max-width: 850px;
        margin: 0 auto;
        text-align: center;
    }
    .hero-carousel .hero-badge {
        background: var(--yellow);
        color: var(--dark-brown);
        text-shadow: none;
        display: inline-block;
        padding: 0.5rem 1.5rem;
        border-radius: 50px;
        font-weight: 700;
        font-size: 0.9rem;
        margin-bottom: 1rem;
    }
    .hero-carousel h1 {
        color: white;
        text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }
    .hero-carousel h1 .highlight {
        color: var(--pink);
        text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
    }
    .hero-carousel h1 .highlight-yellow {
        color: var(--yellow);
        text-shadow: 2px 2px 8px rgba(0,0,0,0.7);
    }
    .hero-carousel .hero-description {
        font-size: 1.2rem;
        color: white;
        font-weight: 600;
        max-width: 700px;
        margin: 0 auto 2rem;
        text-shadow: 1px 1px 4px rgba(0,0,0,0.7);
    }
    .hero-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        flex-wrap: wrap;
    }
    @media (max-width: 768px) {
        .carousel-slide {
            flex: 0 0 100%;
        }
        .hero-text-box {
            padding: 1.5rem 1.5rem;
            margin: 0 1rem;
        }
        .hero-carousel h1 {
            font-size: 1.8rem;
        }
        .hero-carousel {
            min-height: 400px;
        }
    }
    </style>

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

    <!-- AI Chatbot Widget -->
    <link rel="stylesheet" href="chatbot.css?v=2">
    <script src="chatbot.js?v=2" defer></script>
</body>
</html>`;
}

// ---- GENERATE ALL PAGES ----
DATA.forEach(city => {
  const html = gen(city);
  const filePath = path.join(ROOT, `custom-cakes-${city.slug}.html`);
  fs.writeFileSync(filePath, html);
  console.log(`OK custom-cakes-${city.slug}.html`);
});

// ---- GENERATE HUB PAGE ----
const hubCities = [...EXISTING, ...DATA.map(c=>({name:c.name,slug:c.slug,miles:c.miles,driveMinutes:c.driveMinutes,orderBy:c.orderBy}))].sort((a,b)=>a.name.localeCompare(b.name));
const hubCards = hubCities.map(c => {
  const dist = c.miles ? `${c.miles} mi &middot; ~${c.driveMinutes} min` : 'Local';
  return `
            <a href="custom-cakes-${c.slug}" class="service-card reveal" style="text-decoration:none;">
                <h3 style="margin-bottom:0.3rem;">${c.name}</h3>
                <p style="color:#777;font-size:0.9rem;">${dist}</p>
                <span class="btn btn-secondary" style="margin-top:0.5rem;">View ${c.name}</span>
            </a>`;
}).join('');

const hubHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-KB96GDJ011"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-KB96GDJ011');
    </script>
    <script src="ga-events.js" defer></script>
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="logo_icon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#EC268F">
    <title>Bay Area Cake Delivery Areas | My Baking Creations</title>
    <meta name="description" content="My Baking Creations delivers custom cakes, cookies, and cake pops to 31 Bay Area cities. Find your city and order today for same-day delivery!">
    <link rel="canonical" href="https://mybakingcreations.com/delivery-areas">
    <meta property="og:title" content="Bay Area Cake Delivery Areas | My Baking Creations">
    <meta property="og:description" content="We deliver custom cakes to 31 Bay Area cities. Find your city!">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://mybakingcreations.com/delivery-areas">
    <meta property="og:locale" content="en_US">
    <meta property="og:site_name" content="My Baking Creations">
    <meta property="og:image" content="https://mybakingcreations.com/images/gallery/carousel/carousel%201.jpg">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Bay Area Cake Delivery Areas | My Baking Creations">
    <meta name="twitter:description" content="We deliver custom cakes to 31 Bay Area cities.">
    <meta name="twitter:image" content="https://mybakingcreations.com/logo_icon.png">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybakingcreations.com/"},
            {"@type": "ListItem", "position": 2, "name": "Delivery Areas"}
        ]
    }
    </script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="social-sidebar">
        <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" class="social-instagram" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
        <a href="https://www.facebook.com/MyBakingCreationsCompany" target="_blank" rel="noopener" class="social-facebook" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
        <a href="https://www.pinterest.com/MyBakingCreations/" target="_blank" rel="noopener" class="social-pinterest" aria-label="Pinterest"><svg viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></a>
        <a href="https://www.yelp.com/biz/my-baking-creations-san-francisco" target="_blank" rel="noopener" class="social-yelp" aria-label="Yelp"><img width="980" height="980" src="images/gallery/companylogos/yelp white black png.webp" alt="Yelp"></a>
    </div>
    <header>
        <nav aria-label="Main navigation">
            <a href="buy-now" class="order-now-btn">Order Now</a>
            <a href="/" class="logo">
                <img width="1330" height="1222" src="logo_icon.png" alt="My Baking Creations logo" class="logo-icon">
                <div class="logo-text"><span class="my">my</span><span class="baking">baking</span><span class="creations">CREATIONS</span></div>
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
                    <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" style="width:16px;height:16px;"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
                    <input type="text" class="search-input typewriter-active" id="site-search" placeholder="" autocomplete="off">
                    <span class="typewriter-placeholder" id="search-typewriter"><span class="cursor"></span></span>
                </div>
                <div class="search-results" id="search-results"></div>
            </div>
            <button class="mobile-menu-btn" aria-label="Open menu">&#9776;</button>
        </nav>
    </header>

    <main>
    <section class="hero hero-carousel">
        <div class="carousel-track-container">
            <div class="carousel-track">
                <div class="carousel-slide"><img width="1920" height="1066" src="images/gallery/carousel/carousel 1.jpg" alt="Bay Area custom cake delivery"></div>
                <div class="carousel-slide"><img width="1920" height="1166" src="images/gallery/carousel/carousel 2.jpg" alt="Decorated cookies for Bay Area events"></div>
                <div class="carousel-slide"><img width="1680" height="929" src="images/gallery/carousel/carousel 3.jpg" alt="Wedding cakes delivered across the Bay Area"></div>
            </div>
        </div>
        <div class="hero-content">
            <div class="hero-text-box">
                <p class="hero-breadcrumb"><a href="/">Home</a> / Delivery Areas</p>
                <div class="hero-badge">Delivering Across the Bay Area Since 2012</div>
                <h1><span class="highlight">Bay Area</span> Cake <span class="highlight-yellow">Delivery Areas</span></h1>
                <p class="hero-description">We deliver custom cakes, cookies, and cake pops to 31 cities across the Bay Area. Find your city below and order today!</p>
                <div class="hero-buttons">
                    <a href="order-form" class="btn btn-primary">Order Your Cake</a>
                    <a href="gallery" class="btn btn-secondary">View Our Work</a>
                </div>
            </div>
        </div>
    </section>

    <section class="page-content">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>We Deliver to <span class="highlight">31 Bay Area Cities</span></h2>
                <p style="max-width:700px;margin:0 auto;">From our bakery at 1096 Wildwood Ave in Daly City, we deliver handcrafted custom cakes, decorated cookies, and cake pops across the San Francisco Bay Area. Click your city to learn about delivery times and order.</p>
            </div>
        </div>
    </section>

    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-white reveal">
            <div class="tile-grid-4">${hubCards}
            </div>
        </div>
    </section>

    <section class="page-content" style="padding-top:0;">
        <div class="section-wrapper section-beige reveal">
            <div class="section-header">
                <h2>Order Your <span class="highlight">Custom Cake</span> Today</h2>
                <p style="max-width:700px;margin:0 auto;">Ready to celebrate? Request a free quote and we'll create something extraordinary for your event. We typically book 2&ndash;3 weeks in advance for custom orders.</p>
            </div>
            <div style="text-align:center;margin-top:2rem;">
                <a href="order-form" class="btn btn-primary">Request a Quote</a>
            </div>
        </div>
    </section>
    </main>

    <footer>
        <div class="footer-content">
            <div class="footer-logo"><span class="my">my</span><span class="baking">baking</span> Creations</div>
            <p class="footer-tagline">Family-owned Bay Area bakery since 2012</p>
            <div class="footer-links">
                <a href="/">Home</a><a href="about">About Us</a><a href="gallery">Gallery</a><a href="corporate">Corporate Orders</a><a href="blog">Blog</a><a href="contact">Contact</a><a href="book-consultation">Book Consultation</a><a href="corporate-order">Corporate Quote</a><a href="order-printed">Printed Cookies</a>
            </div>
            <div class="footer-sister" style="margin-top:1.2rem;padding:0.8rem 1.5rem;background:rgba(255,255,255,0.05);border-radius:12px;display:inline-flex;align-items:center;gap:0.75rem;">
                <span style="font-size:0.85rem;color:rgba(255,255,255,0.7);">Need party rentals too?</span>
                <a href="https://thewhole.party/" target="_blank" rel="noopener" style="color:#EC268F;font-weight:600;font-size:0.9rem;text-decoration:none;">The Whole Party</a>
            </div>
            <div class="footer-locations" style="margin-top:1rem;font-size:0.85rem;line-height:2;">
                <span style="color:var(--yellow);font-weight:600;">Delivering to:</span>
                ${footerLinks()}
            </div>
            <div class="social-links">
                <a href="https://www.instagram.com/mybakingcreationscompany/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
                <a href="https://www.facebook.com/MyBakingCreationsCompany" target="_blank" rel="noopener" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
                <a href="https://www.pinterest.com/MyBakingCreations" target="_blank" rel="noopener" aria-label="Pinterest"><svg viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg></a>
                <a href="https://www.yelp.com/biz/my-baking-creations-san-francisco" target="_blank" rel="noopener" aria-label="Yelp"><svg viewBox="0 0 24 24"><path d="M21.111 18.226c-.141.969-2.119 3.483-3.029 3.847-.311.124-.611.094-.85-.09-.154-.12-.314-.396-2.529-3.994a.726.726 0 0 1 .086-.89.937.937 0 0 1 .889-.179c.139.048 2.665.921 3.457 1.203.601.214.912.478.976.903zm-7.467-3.937a.902.902 0 0 1 .222.883c-.063.211-.104.347-.104.347-.089.291-1.034 3.375-1.248 4.037-.163.504-.399.741-.811.741-.96 0-3.18-2.083-3.371-2.995-.054-.258-.021-.515.101-.744.078-.147 2.076-3.146 2.726-4.091.178-.259.414-.4.701-.4.325 0 .605.166.875.451.188.198.619.611.909.771zM10.747 9.02c.256.159.474.391.6.697.183.443-.009.943-.193 1.396-.076.188-1.637 3.807-1.637 3.807a.906.906 0 0 1-.761.535.876.876 0 0 1-.749-.323c-.113-.143-.204-.381-.204-.381-.591-1.404-3.158-7.502-3.421-8.337-.139-.441-.086-.835.162-1.201.541-.8 2.664-1.665 3.578-1.665.403 0 .717.187.935.556.083.141 1.162 4.163 1.69 4.916zM11.3 5.592l-.025.018.025-.018zm.244-.167c.074-.041.093-.048.116-.053-.023.005-.042.012-.116.053zm6.12 3.578c.025.748-1.889 3.24-2.586 3.51a.906.906 0 0 1-.342.069c-.312-.001-.561-.149-.766-.458-.128-.193-1.28-3.049-1.55-3.745a.934.934 0 0 1 .076-.887.878.878 0 0 1 .781-.4c.184.005.368.037.541.092.643.204 3.622.949 3.714 1.07.088.116.132.457.132.749zm-5.037-4.47c.012.039.017.079.026.117-.009-.038-.014-.078-.026-.117zm-.044-.156a.823.823 0 0 1 .027.08c-.01-.027-.018-.054-.027-.08zm5.136 4.267l.008.017-.008-.017z"/></svg></a>
            </div>
            <div class="footer-contact">
                <p><a href="tel:4155688060">(415) 568-8060</a> | <a href="mailto:info@mybakingcreations.com">info@mybakingcreations.com</a></p>
                <p>1096 Wildwood Ave, Daly City, CA 94015</p>
            </div>
            <div class="footer-bottom"><p>&copy; 2025 My Baking Creations. All rights reserved.</p></div>
        </div>
    </footer>

    <style>
    .hero-carousel{position:relative;overflow:hidden;background:#fff;padding:6rem 2rem 3rem;min-height:450px;margin-top:3rem}
    .hero-carousel::before,.hero-carousel::after{display:none}
    .carousel-track-container{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;overflow:hidden}
    .carousel-track{display:flex;height:100%}
    .carousel-slide{flex:0 0 33.333%;height:100%;display:flex;align-items:center;justify-content:center;padding:0 4px;box-sizing:border-box}
    .carousel-slide img{width:100%;height:100%;object-fit:contain;background:#fff}
    .hero-carousel .hero-content{position:relative;z-index:2}
    .hero-text-box{background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.45) 100%);padding:2.5rem 3rem;border-radius:20px;max-width:850px;margin:0 auto;text-align:center}
    .hero-carousel .hero-badge{background:var(--yellow);color:var(--dark-brown);text-shadow:none;display:inline-block;padding:.5rem 1.5rem;border-radius:50px;font-weight:700;font-size:.9rem;margin-bottom:1rem}
    .hero-carousel h1{color:#fff;text-shadow:2px 2px 8px rgba(0,0,0,.7);font-size:2.5rem;margin-bottom:1rem}
    .hero-carousel h1 .highlight{color:var(--pink);text-shadow:2px 2px 8px rgba(0,0,0,.7)}
    .hero-carousel h1 .highlight-yellow{color:var(--yellow);text-shadow:2px 2px 8px rgba(0,0,0,.7)}
    .hero-carousel .hero-description{font-size:1.2rem;color:#fff;font-weight:600;max-width:700px;margin:0 auto 2rem;text-shadow:1px 1px 4px rgba(0,0,0,.7)}
    .hero-buttons{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap}
    @media(max-width:768px){.carousel-slide{flex:0 0 100%}.hero-text-box{padding:1.5rem;margin:0 1rem}.hero-carousel h1{font-size:1.8rem}.hero-carousel{min-height:400px}}
    </style>

    <script>
    fetch('order-form-modal.html').then(r=>r.text()).then(h=>{document.body.insertAdjacentHTML('beforeend',h);const a=document.createElement('script');a.src='autoresponder.js';document.body.appendChild(a);const s=document.createElement('script');s.src='script.js';document.body.appendChild(s);});
    </script>
    <link rel="stylesheet" href="chatbot.css?v=2">
    <script src="chatbot.js?v=2" defer></script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, 'delivery-areas.html'), hubHtml);
console.log('OK delivery-areas.html');

// ---- GENERATE SITEMAP ENTRIES ----
const newEntries = DATA.map(c => `  <url>
    <loc>https://mybakingcreations.com/custom-cakes-${c.slug}</loc>
    <lastmod>2026-03-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
const hubEntry = `  <url>
    <loc>https://mybakingcreations.com/delivery-areas</loc>
    <lastmod>2026-03-11</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
console.log('\n--- ADD TO SITEMAP ---');
console.log(hubEntry);
console.log(newEntries);
console.log('--- END SITEMAP ---');

console.log(`\nDone! Generated ${DATA.length} city pages + hub page.`);
