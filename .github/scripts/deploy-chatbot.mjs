// Uploads chatbot-worker.js to the Cloudflare Worker (default "mbc-chatbot") in the
// info@mybakingcreations.com account. Keeps existing bindings (the ANTHROPIC_API_KEY secret).
// Env: CF_API_KEY (Global API Key), CF_EMAIL, CF_ACCOUNT_ID, optional WORKER_NAME, optional ANTHROPIC_API_KEY (sets the secret).
// GitHub Actions runs this on every push to main that changes chatbot-worker.js.
import { readFileSync } from 'node:fs';

const { CF_API_KEY, CF_EMAIL, CF_ACCOUNT_ID } = process.env;
const name = process.env.WORKER_NAME || 'mbc-chatbot';
if (!CF_API_KEY || !CF_EMAIL || !CF_ACCOUNT_ID) { console.error('missing CF_API_KEY / CF_EMAIL / CF_ACCOUNT_ID'); process.exit(1); }
const base = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/workers/scripts/${name}`;
const auth = { 'X-Auth-Email': CF_EMAIL, 'X-Auth-Key': CF_API_KEY };

async function check(res, what) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) { console.error(what, 'failed', res.status, JSON.stringify(body.errors || body)); process.exit(1); }
  console.log(what, 'ok');
}

const code = readFileSync(new URL('../../chatbot-worker.js', import.meta.url), 'utf8');
const form = new FormData();
form.append('metadata', new Blob([JSON.stringify({
  main_module: 'worker.js',
  compatibility_date: '2024-09-23',
  keep_bindings: ['secret_text', 'plain_text'],
})], { type: 'application/json' }));
form.append('worker.js', new Blob([code], { type: 'application/javascript+module' }), 'worker.js');
await check(await fetch(base, { method: 'PUT', headers: auth, body: form }), `upload ${name}`);

if (process.env.ANTHROPIC_API_KEY) {
  await check(await fetch(`${base}/secrets`, {
    method: 'PUT', headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'ANTHROPIC_API_KEY', text: process.env.ANTHROPIC_API_KEY, type: 'secret_text' }),
  }), 'secret ANTHROPIC_API_KEY');
}
