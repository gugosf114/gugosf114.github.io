import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';

function element(extra = {}) {
  return Object.assign({
    dataset: {},
    style: {},
    hidden: false,
    textContent: '',
    scrollIntoView() {},
  }, extra);
}

test('browser checkout saves every required file before PayPal and captures on the server', async () => {
  const calls = [];
  const elements = {
    'paypal-paid-note': element(),
    saveProgress: element({ hidden: true }),
    saveProgressText: element(),
    saveProgressFill: element(),
    orderSecurity: element({ dataset: { sitekey: 'site-key' } }),
    'paypal-button-container': element(),
    designTray: element(),
  };
  const selected = new Map();
  ['.pc-ship', '#payLabel', '#payHint', '#orderSecurity'].forEach((selector) => selected.set(selector, element()));

  let paypalConfig;
  const original = new File([new Uint8Array([1, 2, 3])], 'family.jpg', { type: 'image/jpeg' });
  const artwork = new Blob([new Uint8Array([4, 5])], { type: 'image/png' });
  const approved = new Blob([new Uint8Array([6, 7])], { type: 'image/png' });
  const window = {
    __mbcOrderPricing: { getState: () => ({ quantity: 12, photos: 1, fulfil: 'pickup', zip: '', service: 'ground', ready: true }) },
    __mbcDesignStudio: { getDesigns: () => [{ slot: 1, quantity: 12, shape: 'round', background: 'cut', approvedAt: '2026-09-10T12:00:00Z', file: original, artworkBlob: artwork, approvedBlob: approved }] },
    turnstile: {
      render(node, config) { config.callback('turnstile-token'); return 'widget-one'; },
      reset() {},
    },
    paypal: {
      Buttons(config) { paypalConfig = config; return { render() {} }; },
    },
  };
  const document = {
    documentElement: { dataset: { orderApi: 'https://orders.test' } },
    getElementById(id) { return elements[id] || null; },
    querySelector(selector) { return selected.get(selector) || elements[selector.slice(1)] || null; },
  };
  const fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    calls.push({ path, options });
    if (path === '/v1/designs' && options.method === 'POST') return Response.json({ id: 'design-one', token: 'design-token' }, { status: 201 });
    if (path.includes('/files/')) return Response.json({ uploaded: true }, { status: 201 });
    if (path.endsWith('/finalize')) return Response.json({ approved: true }, { status: 201 });
    if (path === '/v1/paypal/orders') return Response.json({ id: 'PAYPAL-ONE' }, { status: 201 });
    if (path === '/v1/paypal/orders/PAYPAL-ONE/capture') return Response.json({ paid: true, orderId: 'design-one' });
    throw new Error(`Unexpected request ${path}`);
  };

  const source = await readFile(new URL('../buy-now-order.js', import.meta.url), 'utf8');
  vm.runInNewContext(source, {
    window,
    document,
    fetch,
    crypto: webcrypto,
    URL,
    Blob,
    File,
    Headers,
    Response,
    setTimeout,
    clearTimeout,
    console,
  });

  assert.ok(paypalConfig, 'PayPal buttons were configured');
  let rejected = false;
  await paypalConfig.onClick({}, { resolve() { return true; }, reject() { rejected = true; return false; } });
  assert.equal(rejected, false);
  assert.equal(calls[0].path, '/v1/designs');
  const uploadPaths = calls.filter((call) => call.options.method === 'PUT').map((call) => call.path);
  assert.deepEqual(uploadPaths, [
    '/v1/designs/design-one/files/1/original',
    '/v1/designs/design-one/files/1/artwork',
    '/v1/designs/design-one/files/1/approved',
  ]);
  assert.equal(calls[4].path, '/v1/designs/design-one/finalize');

  assert.equal(await paypalConfig.createOrder(), 'PAYPAL-ONE');
  assert.equal(calls[5].path, '/v1/paypal/orders');
  await paypalConfig.onApprove({ orderID: 'PAYPAL-ONE' });
  assert.equal(calls[6].path, '/v1/paypal/orders/PAYPAL-ONE/capture');
  assert.match(elements['paypal-paid-note'].textContent, /Payment received/);
  assert.match(elements['paypal-paid-note'].textContent, /design-one/);
});

test('browser checkout rejects payment when a design is missing', async () => {
  const paidNote = element();
  let paypalConfig;
  const window = {
    __mbcOrderPricing: { getState: () => ({ photos: 2, ready: true }) },
    __mbcDesignStudio: { getDesigns: () => [{ slot: 1 }, null] },
    paypal: { Buttons(config) { paypalConfig = config; return { render() {} }; } },
  };
  const document = {
    documentElement: { dataset: {} },
    getElementById(id) {
      if (id === 'paypal-paid-note') return paidNote;
      if (id === 'paypal-button-container' || id === 'designTray') return element();
      return null;
    },
    querySelector() { return null; },
  };
  const source = await readFile(new URL('../buy-now-order.js', import.meta.url), 'utf8');
  vm.runInNewContext(source, { window, document, fetch() { throw new Error('fetch must not run'); }, crypto: webcrypto, URL, Blob, File, Headers, Response, setTimeout, clearTimeout, console });
  let rejected = false;
  await paypalConfig.onClick({}, { resolve() {}, reject() { rejected = true; } });
  assert.equal(rejected, true);
  assert.match(paidNote.textContent, /Approve every cookie design/);
});
