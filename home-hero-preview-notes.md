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

Controls revision: inherited dot-button and pseudo-element shadows are explicitly cleared, and dot circles are centered in their click targets. Autoplay starts enabled for everyone; reduced motion controls transition style only. Playback pauses through the explicit Pause button or when the page/hero is not visible. Hovering does not stop playback.

Sizing sample: the entire original composition is scaled to 80% and centered. Its frame occupies the scaled height (512px desktop, 400px mobile), keeping following content directly below. The magnifier converts screen coordinates back into unscaled coordinates. The single --hero-preview-scale variable controls the proposed shared scale. This sizing sample is local pending approval.

Side-photo experiment removed at user request; restored the centered 80% carousel sample. Local only, pending approval.

Full-width sample: retain 80% visual scale and 512px desktop height, expand the unscaled viewport to compensate for the transform, and show four complete equal-width panels (two on tablet, one on phone). Four clones at either end cover loop boundaries. The new Prism/eightfold.ai + Levi's collage is first in the 13-slide sequence. Original 12 slides remain in order. Image created with the built-in image editing tool from both Downloads/carousel photos; background cleanup and compositing requested, output is an AI-edited sample. No changes to the live homepage.

Collage v2: corrected the Levi's group to six complete cookies in two parallel columns, eliminating the fanned arrangement and clipped edges. Prism half retained. New versioned asset referenced by the local preview.

Original-photo revision: the Levi's half now uses a byte-for-byte copy of Downloads/carousel/Levis_Hand Piped Cookies.jpg. Browser sizing only; no rotation, mirroring, retouching, or generated replacement. Prism uses the left half of the previous collage. Both halves form one slide and move together.

Approved for publication: the final full-width, four-panel carousel and original Levi's photograph are integrated into index.html. Other page carousels are unchanged.
