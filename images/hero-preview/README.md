# Consistent hero concept assets

This directory belongs to hero-preview.html only. It does not replace the live site's photographs or carousel.
All nine panels have the same 900 x 600 canvas and white background, with no CSS shadows, borders or glass effect.

Four photographic sample panels (sculpted, celebration, wedding, pops) were prepared through the built-in
image generation tool from the existing carousel 1, carousel 4, white wedding cake, and carousel 10 images.
They are AI-assisted background-cleanup mockups and may reconstruct fine details; they are not production-approved replacements for the source photographs.
The corporate-pops panel crops the branded half of the pops sample. Meta/Nestle, Prism, Structure and baby
SVG panels reuse actual photograph pixels with the previously defined cookie silhouettes on white.

Prompt used for the first two sample panels:
Edit this actual bakery product photograph for a clean website hero mockup. Preserve the depicted cakes
exactly: their shapes, colors, edible decorations, lettering and arrangement. Isolate the complete products
and their cake boards onto a perfectly uniform pure white background. Remove the surrounding photographic
background, all cast shadows, gray patches, seams between photos, and any overlaid bakery photo watermark.
Keep natural lighting and real texture on the products themselves. Do not invent, replace, stylize or redraw
the cake designs. Center the whole group with modest even whitespace in a landscape 3:2 canvas. No added
text, frames, gradients or reflections. Full products visible.

Wedding and cake-pop prompt:
Prepare this provided bakery product photograph for a visual website mockup. Keep all depicted products,
colors, edible decorations, cake boards and stands. Change only the surrounding background to uniform pure
white, remove cast shadows and overlaid photo watermark. Keep natural product detail and existing printed
designs intact. Show the entire group centered on a landscape 3:2 white canvas, with small even margins.
No new products, added text, borders, vignettes, reflections or shadow underneath.

The mockup uses one controller with page-specific data. It measures responsive visible-slot count, derives
pagination from actual images, and repeats end/start images for continuous wrapping in both directions.
Hero heights are fixed per responsive breakpoint and remain the same across all five page configurations.

## Revision 2

Restores the live site's large full-width presentation and central overlay panel. All five page variants use a 600px desktop hero with a 432px title panel and a 480px mobile hero with a 340px title panel. The opening collection uses fuller arrangements, including the existing character-cake and social-cookie collages, rather than isolated single cookies. Header content is centered at the original site scale. Corporate group SVGs repeat the original masked photo cutouts into full arrangements. Production pages remain untouched.
