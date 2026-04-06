"""Generate occasion pages from corporate-gifting template."""
import re

with open('corporate-gifting.html', encoding='utf-8') as f:
    template = f.read()

pages = [
    {
        'file': 'baby-shower-cakes.html',
        'title': 'Baby Shower Cakes Bay Area | Custom Designs | MBC',
        'meta': 'Custom baby shower cakes, gender reveal desserts, and themed treats for Bay Area celebrations. Hand-delivered to your venue.',
        'canonical': 'https://mybakingcreations.com/baby-shower-cakes',
        'breadcrumb': '<a href="/">Home</a> / Baby Shower Cakes',
        'h1': '<span class="highlight-yellow">Baby Shower Cakes</span> As <span class="highlight">Unique As Your Story</span>',
        'subtitle': 'Custom baby shower cakes, cookie favors, and dessert tables hand-delivered across the Bay Area. From elegant to playful.',
        'section_title': 'Every Shower <span class="highlight">Deserves This</span>',
        'cards': [
            ('\U0001f37c', 'Themed Cakes', 'Safari, storybook, teddy bears, or match your nursery colors. Every baby shower cake is designed from scratch for your party.'),
            ('\U0001f380', 'Gender Reveals', 'Pink or blue filling inside? We keep the secret until you cut. Cakes, cake pops, and cookies for your big reveal moment.'),
            ('\U0001f9c1', 'Dessert Tables', 'Complete dessert spreads for 20-100 guests. Cupcakes, cake pops, cookies, and a centerpiece cake \u2014 all color-coordinated.'),
        ],
        'cta': 'Get a Baby Shower Quote',
    },
    {
        'file': 'gender-reveal-cakes.html',
        'title': 'Gender Reveal Cakes San Francisco | Pink or Blue Inside | MBC',
        'meta': 'Gender reveal cakes with colored filling, surprise cake pops, and themed desserts for Bay Area families. We keep the secret.',
        'canonical': 'https://mybakingcreations.com/gender-reveal-cakes',
        'breadcrumb': '<a href="/">Home</a> / Gender Reveal Cakes',
        'h1': '<span class="highlight-yellow">Gender Reveal</span> Cakes That Keep <span class="highlight">The Secret</span>',
        'subtitle': 'Pink or blue filling hidden inside a custom cake. Coordinated cake pops, cookies, and cupcakes for your big announcement.',
        'section_title': 'Your Reveal <span class="highlight">Your Way</span>',
        'cards': [
            ('\U0001f382', 'Surprise Inside', 'Cut into a beautiful white cake \u2014 pink or blue buttercream spills out. We work with your doctor to keep the secret safe.'),
            ('\U0001f388', 'Reveal Packages', 'Not just the cake \u2014 matching cake pops, question-mark cookies, and cupcakes for your whole guest list.'),
            ('\U0001f4f8', 'Instagram-Ready', 'Every reveal cake is designed for the video moment. Clean cuts, dramatic color contrast, picture-perfect from every angle.'),
        ],
        'cta': 'Plan Your Reveal',
    },
    {
        'file': 'graduation-cakes.html',
        'title': 'Graduation Cakes Bay Area | Custom School Colors | MBC',
        'meta': 'Custom graduation cakes with school colors, cap-and-gown designs, and celebration desserts for Bay Area grads. Order now.',
        'canonical': 'https://mybakingcreations.com/graduation-cakes',
        'breadcrumb': '<a href="/">Home</a> / Graduation Cakes',
        'h1': '<span class="highlight-yellow">Graduation Cakes</span> Worth <span class="highlight">The Walk</span>',
        'subtitle': 'Custom graduation cakes in your school colors. Cap and gown toppers, diploma scrolls, and celebration desserts for K through PhD.',
        'section_title': 'Celebrate <span class="highlight">Every Milestone</span>',
        'cards': [
            ('\U0001f393', 'School Colors', 'Stanford cardinal, Cal blue and gold, SFSU purple \u2014 we match your exact school colors. Logos, mascots, class year.'),
            ('\U0001f389', 'Grad Party Packages', 'Feed the whole family. Cupcake towers, cookie platters, and a custom cake \u2014 all coordinated. Delivered to your venue.'),
            ('\U0001f4da', 'Every Level', 'Kindergarten cap cakes, high school milestones, college, med school, law school \u2014 every grad deserves a cake.'),
        ],
        'cta': 'Order a Graduation Cake',
    },
    {
        'file': 'holiday-dessert-catering.html',
        'title': 'Holiday Dessert Catering Bay Area | Office & Party Treats | MBC',
        'meta': 'Holiday dessert catering for Bay Area offices and parties. Cookie platters, themed cakes, seasonal treats. Thanksgiving through New Year.',
        'canonical': 'https://mybakingcreations.com/holiday-dessert-catering',
        'breadcrumb': '<a href="/">Home</a> / Holiday Dessert Catering',
        'h1': '<span class="highlight-yellow">Holiday Catering</span> That Steals <span class="highlight">The Show</span>',
        'subtitle': 'Seasonal dessert catering for office parties, family gatherings, and corporate holiday gifts. Bay Area delivery.',
        'section_title': 'Every Season <span class="highlight">Covered</span>',
        'cards': [
            ('\U0001f983', 'Thanksgiving', 'Pumpkin-themed cake pops, fall cookie platters, and custom pies. Complete dessert tables for office Friendsgiving.'),
            ('\U0001f384', 'Christmas & Hanukkah', 'Holiday cookie boxes, gingerbread houses, branded corporate gift packages. Bulk orders for teams up to 500+.'),
            ('\U0001f386', 'New Year', 'Gold-dusted cupcakes, champagne-themed cakes, and midnight dessert bars. Delivery to your venue or office.'),
        ],
        'cta': 'Book Holiday Catering',
    },
    {
        'file': 'sculpted-3d-cakes.html',
        'title': '3D Sculpted Cakes Bay Area | Custom Character & Object Cakes | MBC',
        'meta': '3D sculpted cakes that look like anything \u2014 sneakers, handbags, characters, logos. Realistic custom cakes hand-crafted in the Bay Area.',
        'canonical': 'https://mybakingcreations.com/sculpted-3d-cakes',
        'breadcrumb': '<a href="/">Home</a> / 3D Sculpted Cakes',
        'h1': '<span class="highlight-yellow">3D Sculpted Cakes</span> That Don\'t Look <span class="highlight">Like Cakes</span>',
        'subtitle': 'If you can dream it, we sculpt it. Every cake is 100% edible and hand-crafted in Daly City.',
        'section_title': 'What We <span class="highlight">Sculpt</span>',
        'cards': [
            ('\U0001f45f', 'Brand Replicas', 'Sneakers, handbags, perfume bottles, tech gadgets \u2014 sculpted in cake with realistic detail. The gift that goes viral.'),
            ('\U0001f3ae', 'Character Cakes', 'Minecraft, Mario, Disney, anime, superheroes \u2014 fully 3D sculpted characters on your cake. Actual sculpture, not a flat print.'),
            ('\U0001f3e2', 'Corporate Showpieces', 'Product launch cakes, building replicas, mascot sculptures. Google and Levi\'s trust us with their brand in cake form.'),
        ],
        'cta': 'Design Your Sculpted Cake',
    },
    {
        'file': 'hand-piped-logo-cookies.html',
        'title': 'Hand Piped Logo Cookies Bay Area | Custom Royal Icing | MBC',
        'meta': 'Hand-piped royal icing logo cookies for Bay Area businesses. Premium artisan detail, individually wrapped. Trusted by Google, Meta, Salesforce.',
        'canonical': 'https://mybakingcreations.com/hand-piped-logo-cookies',
        'breadcrumb': '<a href="/">Home</a> / Hand Piped Logo Cookies',
        'h1': '<span class="highlight-yellow">Hand Piped Cookies</span> \u2014 <span class="highlight">Artisan Detail</span> at Scale',
        'subtitle': 'Every stroke piped by hand in royal icing. Not printed \u2014 crafted. The premium cookie for companies that know the difference.',
        'section_title': 'Why <span class="highlight">Hand Piped</span>',
        'cards': [
            ('\U0001f3a8', 'True Artisan Work', 'Each cookie is individually hand-piped. No two are exactly alike \u2014 that\'s the point. Your clients can tell the difference.'),
            ('\U0001f4e6', 'Presentation-Ready', 'Individually wrapped, nestled in branded boxes, with your company card. Ready to hand to a client or ship nationwide.'),
            ('\U0001f3c6', 'Fortune 500 Tested', 'Google, Meta, Salesforce, DocuSign, PayPal, Alaska Airlines, Levi\'s \u2014 they chose hand-piped. When your brand matters.'),
        ],
        'cta': 'Order Hand Piped Cookies',
    },
    {
        'file': 'cake-pops-party-favors.html',
        'title': 'Cake Pops & Party Favors Bay Area | Custom Colors | MBC',
        'meta': 'Custom cake pops and party favors for Bay Area events. Branded colors, individually wrapped. Weddings, birthdays, corporate events.',
        'canonical': 'https://mybakingcreations.com/cake-pops-party-favors',
        'breadcrumb': '<a href="/">Home</a> / Cake Pops & Party Favors',
        'h1': '<span class="highlight-yellow">Cake Pops</span> That Do <span class="highlight">The Talking</span>',
        'subtitle': 'Custom-colored, individually wrapped cake pops for every occasion. The grab-and-go dessert that works everywhere.',
        'section_title': 'Pop For <span class="highlight">Every Occasion</span>',
        'cards': [
            ('\U0001f3a8', 'Match Any Color', 'Pantone-matched to your brand, party theme, or school colors. Gold-dusted for weddings. Neon for kids\' parties.'),
            ('\U0001f3aa', 'Events & Favors', 'Trade shows, weddings, baby showers, birthdays \u2014 cake pops travel well, look great, and need zero utensils.'),
            ('\U0001f4e6', 'Bulk & Nationwide', 'Orders from 24 to 2,000+. Individually wrapped. Local delivery or nationwide shipping for remote teams.'),
        ],
        'cta': 'Order Cake Pops',
    },
    {
        'file': 'custom-cupcake-towers.html',
        'title': 'Custom Cupcake Towers Bay Area | Office Parties & Events | MBC',
        'meta': 'Custom cupcake towers and displays for Bay Area events. Branded toppers, coordinated colors, delivery and setup included.',
        'canonical': 'https://mybakingcreations.com/custom-cupcake-towers',
        'breadcrumb': '<a href="/">Home</a> / Custom Cupcake Towers',
        'h1': '<span class="highlight-yellow">Cupcake Towers</span> Built For <span class="highlight">The Moment</span>',
        'subtitle': 'No plates, no cutting, no mess. Cupcake towers with custom toppers for office parties, birthdays, and events across the Bay Area.',
        'section_title': 'Tower <span class="highlight">Options</span>',
        'cards': [
            ('\U0001f3d7\ufe0f', 'Tower Displays', 'Tiered towers that serve as the centerpiece. 24, 48, 100, or 200+ cupcakes stacked and styled. Setup included.'),
            ('\U0001f3a8', 'Custom Toppers', 'Edible image toppers with your logo, photo, or theme. Every cupcake branded. Great for product launches and milestones.'),
            ('\U0001f370', 'Flavor Variety', 'Mix flavors \u2014 chocolate, vanilla, red velvet, lemon, strawberry. Guests pick their favorite. No one has to agree.'),
        ],
        'cta': 'Design Your Cupcake Tower',
    },
]

for p in pages:
    html = template
    html = re.sub(r'<title>[^<]+</title>', f'<title>{p["title"]}</title>', html, count=1)
    html = re.sub(r'<meta name="description" content="[^"]+">',
                  f'<meta name="description" content="{p["meta"]}">', html, count=1)
    html = re.sub(r'<link rel="canonical" href="[^"]+">',
                  f'<link rel="canonical" href="{p["canonical"]}">', html, count=1)
    html = re.sub(r'<p class="hero-breadcrumb">.*?</p>',
                  f'<p class="hero-breadcrumb">{p["breadcrumb"]}</p>', html, count=1, flags=re.DOTALL)
    html = re.sub(r'<h1 class="typewriter-headline">.*?</h1>',
                  f'<h1 class="typewriter-headline">{p["h1"]}</h1>', html, count=1, flags=re.DOTALL)
    html = re.sub(r'<p class="hero-subtitle">.*?</p>',
                  f'<p class="hero-subtitle">{p["subtitle"]}</p>', html, count=1, flags=re.DOTALL)
    html = re.sub(r'How Companies <span class="highlight">Use Our Gifts</span>',
                  p["section_title"], html, count=1)
    # Replace use-case cards
    cards_html = ""
    for emoji, title, desc in p["cards"]:
        cards_html += f'''
                <div class="service-card" style="text-align: center;">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">{emoji}</div>
                    <h3 style="font-family: 'Fredoka One', cursive; font-size: 1.2rem; margin-bottom: 0.75rem;"><span style="color: var(--pink);">{title}</span></h3>
                    <p style="font-size: 0.95rem; line-height: 1.6; color: var(--dark-brown);">{desc}</p>
                </div>'''
    # Find and replace the 3 existing cards
    pattern = r'(<div class="tile-grid-3">\s*)(.*?)(</div>\s*<div style="text-align: center)'
    match = re.search(pattern, html, re.DOTALL)
    if match:
        html = html[:match.start(2)] + cards_html + "\n            " + html[match.end(2):]
    html = html.replace("Get a Gifting Quote", p["cta"])
    with open(p["file"], "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Created: {p['file']}")

print("\nDone! 8 pages generated.")
