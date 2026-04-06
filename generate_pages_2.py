"""Generate 11 more occasion/product pages from approved template."""
import re

with open('corporate-gifting.html', encoding='utf-8') as f:
    template = f.read()

pages = [
    # Corporate events (6 pages)
    {'file': 'product-launch-cakes.html', 'title': 'Product Launch Cakes Bay Area | Custom Event Desserts | MBC',
     'meta': 'Custom cakes and branded treats for Bay Area product launches. Make your launch memorable. Trusted by Google, Meta, OpenAI.',
     'slug': 'product-launch-cakes',
     'breadcrumb': '<a href="/">Home</a> / <a href="corporate">Corporate</a> / Product Launches',
     'h1': '<span class="highlight-yellow">Product Launch</span> Cakes That <span class="highlight">Make Headlines</span>',
     'subtitle': 'Your product just shipped. Celebrate with a cake that matches. 3D product replicas, branded dessert bars, and launch party catering.',
     'section': 'Launch Day <span class="highlight">Essentials</span>',
     'cards': [('\U0001f680', 'Product Replicas', 'Your product \u2014 sculpted in cake. iPhones, sneakers, software boxes. 100% edible, 100% on-brand.'),
              ('\U0001f389', 'Launch Party Catering', 'Full dessert spreads for 50-500 people. Branded cupcakes, logo cookies, cake pops \u2014 all matching your launch colors.'),
              ('\U0001f4f1', 'Social-Ready', 'Every cake designed to photograph well. Your marketing team gets content. Your team gets cake.')],
     'cta': 'Plan Your Launch Desserts'},

    {'file': 'conference-desserts.html', 'title': 'Conference Desserts Bay Area | Booth Treats & Giveaways | MBC',
     'meta': 'Conference desserts, booth giveaways, and branded treats for Bay Area tech events. Logo cookies, cake pops. Bulk orders.',
     'slug': 'conference-desserts',
     'breadcrumb': '<a href="/">Home</a> / <a href="corporate">Corporate</a> / Conference Desserts',
     'h1': '<span class="highlight-yellow">Conference Treats</span> That Draw <span class="highlight">A Crowd</span>',
     'subtitle': 'Logo cookies and branded cake pops that make your booth the one people remember. Individually wrapped, bulk-ready.',
     'section': 'Booth <span class="highlight">Essentials</span>',
     'cards': [('\U0001f3ea', 'Booth Giveaways', 'Individually wrapped logo cookies and cake pops. Hand them out \u2014 people come back for seconds and bring colleagues.'),
              ('\U0001f4e6', 'Bulk Ready', 'Orders of 200-2,000+. Packaged for venue delivery. Zero setup from your team.'),
              ('\U0001f91d', 'Speaker Gifts', 'Custom treat boxes for keynote speakers and VIP guests. A branded thank-you that beats another tote bag.')],
     'cta': 'Order Conference Treats'},

    {'file': 'client-appreciation-gifts.html', 'title': 'Client Appreciation Gifts Bay Area | Branded Cookie Boxes | MBC',
     'meta': 'Client appreciation gift boxes with branded cookies, cake pops, and custom treats. Hand-delivered or shipped nationwide.',
     'slug': 'client-appreciation-gifts',
     'breadcrumb': '<a href="/">Home</a> / <a href="corporate">Corporate</a> / Client Appreciation',
     'h1': '<span class="highlight-yellow">Client Gifts</span> They Won\'t <span class="highlight">Regift</span>',
     'subtitle': 'Branded treat boxes that say thank you better than a generic gift card. Hand-delivered or shipped nationwide.',
     'section': 'Gifting <span class="highlight">That Lands</span>',
     'cards': [('\U0001f381', 'Curated Boxes', 'Logo cookies + branded cake pops + handwritten card, in a custom box. Your brand on every touchpoint.'),
              ('\U0001f30e', 'Ship Nationwide', 'Not just Bay Area \u2014 ship to any US office. Insulated packaging, 2-day delivery, arrival confirmation.'),
              ('\U0001f4c5', 'Recurring Programs', 'Quarterly client gifting on autopilot. Set the schedule, we handle production and delivery.')],
     'cta': 'Start Client Gifting'},

    {'file': 'team-building-treats.html', 'title': 'Team Building Treats Bay Area | Office Party Desserts | MBC',
     'meta': 'Team building desserts, office party treats, and celebration cakes for Bay Area companies. From onboarding to offsites.',
     'slug': 'team-building-treats',
     'breadcrumb': '<a href="/">Home</a> / <a href="corporate">Corporate</a> / Team Building',
     'h1': '<span class="highlight-yellow">Team Treats</span> For Every <span class="highlight">Milestone</span>',
     'subtitle': 'New hire welcome kits, sprint celebration cupcakes, offsite dessert bars. Better than store-bought.',
     'section': 'Your Team <span class="highlight">Moments</span>',
     'cards': [('\U0001f44b', 'New Hire Welcome', 'Day-one welcome cookies with your company logo. Works for remote hires too \u2014 we ship.'),
              ('\U0001f3c6', 'Milestone Celebrations', 'Sprint shipped? Funding closed? IPO day? Custom cakes marking the moment.'),
              ('\U0001f3d5\ufe0f', 'Offsite Catering', 'Complete dessert tables for team offsites and all-hands meetings. Setup and cleanup included.')],
     'cta': 'Order Team Treats'},

    {'file': 'office-birthday-cakes.html', 'title': 'Office Birthday Cakes Bay Area | Delivered to Your Desk | MBC',
     'meta': 'Office birthday cakes delivered to Bay Area workplaces. Custom designs, cupcake towers, same-week ordering.',
     'slug': 'office-birthday-cakes',
     'breadcrumb': '<a href="/">Home</a> / Office Birthday Cakes',
     'h1': '<span class="highlight-yellow">Office Birthdays</span> Done <span class="highlight">Right</span>',
     'subtitle': 'Skip the grocery store sheet cake. Custom birthday cakes and cupcake towers delivered to your Bay Area office.',
     'section': 'Better Than <span class="highlight">Store Bought</span>',
     'cards': [('\U0001f382', 'Custom Designs', 'Themed to the person \u2014 hobbies, favorite colors, inside jokes. Your coworker will know you didn\'t phone it in.'),
              ('\U0001f9c1', 'No-Mess Cupcakes', 'Cupcake towers for the conference room. No plates, no cutting, no cleanup.'),
              ('\U0001f4e7', 'Recurring Orders', 'Send us your team\'s birthday list. We deliver on the right day every time.')],
     'cta': 'Order Office Birthday Cake'},

    {'file': 'retirement-party-cakes.html', 'title': 'Retirement Party Cakes Bay Area | Career Celebration | MBC',
     'meta': 'Custom retirement cakes for Bay Area send-offs. Career-themed designs, office delivery, farewell party catering.',
     'slug': 'retirement-party-cakes',
     'breadcrumb': '<a href="/">Home</a> / Retirement Party Cakes',
     'h1': '<span class="highlight-yellow">Retirement Cakes</span> For <span class="highlight">The Legend</span>',
     'subtitle': 'They gave decades. Give them a cake that captures it. Career-themed cakes delivered to your Bay Area office.',
     'section': 'Send Them Off <span class="highlight">In Style</span>',
     'cards': [('\U0001f3c6', 'Career Tributes', 'Cakes shaped like their desk, their product, their favorite thing. Inside jokes sculpted in cake.'),
              ('\U0001f4bc', 'Office Delivery', 'Delivered to the conference room with plates, napkins, serving knife. Full setup included.'),
              ('\U0001f4f8', 'Memory Maker', 'The cake is the centerpiece of the farewell photo. We make sure it\'s worthy.')],
     'cta': 'Order a Retirement Cake'},

    # Life events (5 pages)
    {'file': 'first-birthday-cakes.html', 'title': 'First Birthday Cakes Bay Area | Smash Cakes & Custom Designs | MBC',
     'meta': 'Custom first birthday cakes, smash cakes, and themed desserts for Bay Area families. Hand-delivered for baby\'s big day.',
     'slug': 'first-birthday-cakes',
     'breadcrumb': '<a href="/">Home</a> / First Birthday Cakes',
     'h1': '<span class="highlight-yellow">First Birthday</span> Cakes For <span class="highlight">The Big One</span>',
     'subtitle': 'Smash cakes, themed party cakes, and coordinated desserts for your baby\'s first birthday.',
     'section': 'First Birthday <span class="highlight">Essentials</span>',
     'cards': [('\U0001f370', 'Smash Cakes', 'A mini cake just for baby to destroy on camera. Soft, colorful, photogenic \u2014 the shot every parent wants.'),
              ('\U0001f3a8', 'Themed Party Cakes', 'Safari, rainbows, teddy bears, Disney \u2014 matched to your theme. Plus cupcakes for the adults.'),
              ('\U0001f4f8', 'Photo-Ready', 'Designed for the camera. Clean lines, bright colors, the perfect milestone photo backdrop.')],
     'cta': 'Order a First Birthday Cake'},

    {'file': 'quinceanera-cakes.html', 'title': 'Quincea\u00f1era Cakes Bay Area | Custom 15th Birthday | MBC',
     'meta': 'Custom quincea\u00f1era cakes and desserts for Bay Area celebrations. Tiered designs, coordinated treats, venue delivery.',
     'slug': 'quinceanera-cakes',
     'breadcrumb': '<a href="/">Home</a> / Quincea\u00f1era Cakes',
     'h1': '<span class="highlight-yellow">Quincea\u00f1era Cakes</span> As <span class="highlight">Grand As The Day</span>',
     'subtitle': 'Tiered celebration cakes, coordinated dessert tables, and custom cookies for her quincea\u00f1era.',
     'section': 'Her Day <span class="highlight">Her Way</span>',
     'cards': [('\U0001f451', 'Tiered Elegance', 'Three to five-tier cakes with fondant detailing, sugar flowers, and coordinated colors.'),
              ('\U0001f48e', 'Custom Details', 'Tiaras, butterflies, roses, gold leaf \u2014 matched to her theme and color palette.'),
              ('\U0001f370', 'Full Dessert Tables', 'Cake pops, cupcakes, cookies, and a showpiece cake for 50-300 guests.')],
     'cta': 'Design Her Quincea\u00f1era Cake'},

    {'file': 'sweet-sixteen-cakes.html', 'title': 'Sweet 16 Cakes Bay Area | Custom Teen Party Cakes | MBC',
     'meta': 'Custom Sweet 16 cakes for Bay Area teens. Trendy designs, Instagram-worthy, themed to her style.',
     'slug': 'sweet-sixteen-cakes',
     'breadcrumb': '<a href="/">Home</a> / Sweet 16 Cakes',
     'h1': '<span class="highlight-yellow">Sweet 16</span> Cakes She\'ll Actually <span class="highlight">Post</span>',
     'subtitle': 'Trendy, custom, Instagram-worthy Sweet 16 cakes delivered to your Bay Area venue.',
     'section': 'Her Vibe <span class="highlight">Her Cake</span>',
     'cards': [('\U0001f4f1', 'Trend-Forward', 'Drip cakes, geode cakes, neon, holographic \u2014 whatever\'s trending on TikTok, we make it in cake.'),
              ('\U0001f388', 'Party Packages', 'Cupcake towers, cookie favors, and a statement cake. All matching her party aesthetic.'),
              ('\U0001f4f8', 'Social-Ready', 'Designed for the photo dump. Clean lines, dramatic angles, the backdrop that gets the likes.')],
     'cta': 'Design Her Sweet 16 Cake'},

    {'file': 'anniversary-cakes.html', 'title': 'Anniversary Cakes Bay Area | Custom Celebration Designs | MBC',
     'meta': 'Custom anniversary cakes for Bay Area couples. Elegant designs for every milestone. Delivered to your dinner or party.',
     'slug': 'anniversary-cakes',
     'breadcrumb': '<a href="/">Home</a> / Anniversary Cakes',
     'h1': '<span class="highlight-yellow">Anniversary Cakes</span> For Every <span class="highlight">Chapter</span>',
     'subtitle': 'From your first anniversary to your 50th. Custom cakes delivered to your restaurant, home, or venue.',
     'section': 'Your Milestone <span class="highlight">Your Way</span>',
     'cards': [('\U0001f490', 'Elegant Designs', 'Gold leaf, sugar flowers, tiered elegance. Matching the style of your celebration.'),
              ('\U0001f382', 'Every Year Matters', '1st, 10th, 25th, 50th \u2014 themed details referencing the traditional milestone.'),
              ('\U0001f37d\ufe0f', 'Restaurant Delivery', 'We deliver to Bay Area restaurants for surprise anniversary dinners. Done it hundreds of times.')],
     'cta': 'Order an Anniversary Cake'},

    {'file': 'bridal-shower-cakes.html', 'title': 'Bridal Shower Cakes Bay Area | Custom Designs & Dessert Tables | MBC',
     'meta': 'Custom bridal shower cakes and coordinated desserts for Bay Area celebrations. Matched to her wedding aesthetic.',
     'slug': 'bridal-shower-cakes',
     'breadcrumb': '<a href="/">Home</a> / Bridal Shower Cakes',
     'h1': '<span class="highlight-yellow">Bridal Shower</span> Desserts She\'ll <span class="highlight">Love</span>',
     'subtitle': 'Custom cakes, cookie favors, and dessert tables for Bay Area bridal showers. Matched to her colors and vibe.',
     'section': 'Shower <span class="highlight">Essentials</span>',
     'cards': [('\U0001f490', 'Elegant Cakes', 'Floral, minimalist, rustic, glam \u2014 whatever her wedding aesthetic, the shower cake matches.'),
              ('\U0001f36a', 'Cookie Favors', 'Custom cookies as take-home favors. Bridal motifs, monograms, wedding colors. Individually wrapped.'),
              ('\U0001f370', 'Full Dessert Spreads', 'Cake + cupcakes + cake pops + cookies \u2014 all coordinated for 20-80 guests.')],
     'cta': 'Plan Her Bridal Shower'},
]

for p in pages:
    html = template
    html = re.sub(r'<title>[^<]+</title>', f'<title>{p["title"]}</title>', html, count=1)
    html = re.sub(r'<meta name="description" content="[^"]+">',
                  f'<meta name="description" content="{p["meta"]}">', html, count=1)
    html = re.sub(r'<link rel="canonical" href="[^"]+">',
                  f'<link rel="canonical" href="https://mybakingcreations.com/{p["slug"]}">', html, count=1)
    html = re.sub(r'<p class="hero-breadcrumb">.*?</p>',
                  f'<p class="hero-breadcrumb">{p["breadcrumb"]}</p>', html, count=1, flags=re.DOTALL)
    html = re.sub(r'<h1 class="typewriter-headline">.*?</h1>',
                  f'<h1 class="typewriter-headline">{p["h1"]}</h1>', html, count=1, flags=re.DOTALL)
    html = re.sub(r'<p class="hero-subtitle">.*?</p>',
                  f'<p class="hero-subtitle">{p["subtitle"]}</p>', html, count=1, flags=re.DOTALL)
    html = re.sub(r'How Companies <span class="highlight">Use Our Gifts</span>',
                  p["section"], html, count=1)
    cards_html = ""
    for emoji, t, desc in p["cards"]:
        cards_html += f'''
                <div class="service-card" style="text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">{emoji}</div>
                    <h3 style="font-family: 'Fredoka One', cursive; font-size: 1.2rem; margin-bottom: 0.75rem;"><span style="color: var(--pink);">{t}</span></h3>
                    <p style="font-size: 0.95rem; line-height: 1.6; color: var(--dark-brown);">{desc}</p>
                </div>'''
    pattern = r'(<div class="tile-grid-3">\s*)(.*?)(</div>\s*<div style="text-align: center)'
    match = re.search(pattern, html, re.DOTALL)
    if match:
        html = html[:match.start(2)] + cards_html + "\n            " + html[match.end(2):]
    html = html.replace("Get a Gifting Quote", p["cta"])
    with open(p["file"], "w", encoding="utf-8") as f:
        f.write(html)
    print(f'Created: {p["file"]}')

print("\nDone! 11 pages generated (6 corporate + 5 life events).")
