# Quote reference files

The quote form keeps its existing Web3Forms recipient routing, autoresponder, lead event and thank-you page. This function handles reference images and PDFs separately so inquiry emails contain working download links for all selected files, including AI sketches.

Files are stored in a private bucket with uniform access and enforced public-access prevention. Download links require an HMAC signature, expire after one year, and are served as attachments with no indexing or content sniffing. The signing secret is a dedicated Secret Manager binding. Uploaded contents are never placed in the public website repository.

The browser submits a UUID request ID with up to three files, each at most 5 MB. Matching retries reuse the private objects. The frontend caches uploaded references during a retry; it retains the draft if uploads or inquiry delivery fail.

Deploy from the repository root:

    gcloud functions deploy mbc-quote-references-v1 --flags-file=cloud-functions/quote-references/deploy.yaml

Production endpoint: https://us-central1-bakers-agent.cloudfunctions.net/mbc-quote-references-v1

The service account needs Secret Manager accessor for the dedicated signing key, storage object access limited to the reference bucket, and Firestore access for upload budgets/idempotency records. This service does not send emails or change prices.
