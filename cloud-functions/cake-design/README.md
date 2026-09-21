# Cake Design helper

Quick Sketch and Cake Builder use this dedicated Google Cloud Function. New designs send a text brief; edits send the previous generated image plus a precise change instruction. Missing or invalid reference images fail explicitly rather than generating an unrelated replacement. The full brief is retained up to 12,000 characters and requested writing is allowed.

Deploy from repository root:

    gcloud functions deploy mbc-cake-design-v1 --flags-file=cloud-functions/cake-design/deploy.yaml

Endpoint: https://us-central1-bakers-agent.cloudfunctions.net/mbc-cake-design-v1

Secrets are bound from the existing bakers-agent Secret Manager. DESIGN_SIGNING_KEY is used only to hash IP addresses for shared usage counters; no OpenAI inference is performed. Images and prompts are not persisted or logged. Model defaults to Gemini 2.5 Flash Image, matching the legacy worker source. Edits guide image preservation, but model-generated edits cannot promise pixel-exact results.

The older cake-preview-worker.js is retained as legacy Cloudflare source. This function replaces that endpoint for Design Studio and the order-form widget; the cookie-design service is independent.
