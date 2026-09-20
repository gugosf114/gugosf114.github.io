# Home-page carousel standardization preview

Based on index.html from origin/main at 8233e24. home-hero-preview.html is a copy of that actual page,
with its navigation, branding, hero content, and sections retained. Internal navigation links point to
the live website; this preview is marked noindex.

The only component replacement is the hero controller/style. The live index.html, shared CSS,
carousel.js, hero-lens.js, and photograph files are not edited.

All 12 existing homepage carousel image references are kept in their original order, including their
picture/source elements. No generated or retouched replacement images are used. CSS controls the
presentation through equal full-height slots with consistent sizing and a white background.

The new controller derives its slide/dot count from the page markup, maintains three loop copies
at each end, and adapts between three, two and one visible slots. It preserves the desktop magnified
text panel, handles its resize/touch state, supports swipe/arrows/pause, and suspends work offscreen.
The CSS is scoped to .hero-carousel[data-standard-hero] so the component can later be reused on other
pages with their own existing collections. Only the home-page preview has that attribute at present.
