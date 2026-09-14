import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('design approval continues inside the guide through checkout', async () => {
  const html = await readFile(new URL('../buy-now.html', import.meta.url), 'utf8');
  const approve = html.match(/function approveCurrentDesign\(\) \{([\s\S]*?)\n      function startPhotoSlot/);
  assert.ok(approve, 'approveCurrentDesign exists');
  assert.match(approve[1], /showCheckoutStep\(\)/, 'completed designs open guided checkout');
  assert.match(approve[1], /showNextPhotoStep\(next\)/, 'extra photos stay in the guide');
  assert.doesNotMatch(approve[1], /closeCutoutScreen/, 'approval never dumps the buyer back onto the page');
  assert.match(html, /id="cutoutProgressFour"/);
  assert.match(html, /id="guidedCheckoutMount"/);
  assert.match(html, /<div class="pc-order-grid">\s*<div id="orderColumn">/, 'the real order form moves into Step 4');
});

test('wide desktop layout fills the monitor and preserves the photo shape', async () => {
  const html = await readFile(new URL('../buy-now.html', import.meta.url), 'utf8');
  assert.match(html, /@media \(min-width: 1500px\)/);
  assert.match(html, /width: min\(2200px, calc\(100% - 80px\)\)/);
  assert.match(html, /aspect-ratio: 4 \/ 3/);
});

test('portrait tablets stack instead of crushing the photo column', async () => {
  const html = await readFile(new URL('../buy-now.html', import.meta.url), 'utf8');
  assert.match(html, /@media \(min-width: 721px\) and \(max-width: 1100px\) and \(orientation: portrait\)/);
  assert.match(html, /grid-template-areas: "copy" "stage" "promises"/);
});

test('showcase slideshow keeps the approved four-image order', async () => {
  const html = await readFile(new URL('../buy-now.html', import.meta.url), 'utf8');
  const paths = [
    'baby-photo-birthday-cookies-san-francisco.webp',
    'Mario cookies.jpeg',
    'owl-birthday-photo-cookies-bay-area.webp',
    'custom-portrait-photo-cookies-celebration.webp',
  ];
  let last = -1;
  for (const path of paths) {
    const next = html.indexOf("src: 'images/gallery/printed/" + path + "'");
    assert.ok(next > last, `${path} is present in the chosen order`);
    last = next;
  }
  assert.equal((html.match(/data-showcase-slide=/g) || []).length, 4);
  assert.match(html, /Pause cookie slideshow/);
  assert.match(html, /prefers-reduced-motion: reduce/);
});
