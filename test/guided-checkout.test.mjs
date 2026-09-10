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
