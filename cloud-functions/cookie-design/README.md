# Original cookie designs

`cookie_design` is a dedicated public Gen 2 HTTP function in project `bakers-agent`, region `us-central1`.
It uses Claude Sonnet 5 for three distinct art directions and messages, then Gemini 3 Pro Image for one original 1024px background
per concept. No catalog templates are selected. JPEG artwork and signed regeneration tokens stream to the
browser as newline-delimited JSON; text is drawn separately by the existing cookie renderer.

The browser retains each generated background as a File and canvas. The existing approval flow includes
the background in saved print artwork and the source upload, so checkout needs no new upload contract.
Adding a customer photo does not send that photo to the AI service. Background regeneration preserves
the current wording, font, photo and crop.

## Deployment

Deploy from the repository root with:

```powershell
gcloud functions deploy mbc-cookie-design-v1 --flags-file=cloud-functions/cookie-design/deploy.yaml
```

The dedicated service account has access to the Anthropic and Gemini Secret Manager credentials and
Firestore counters. `DESIGN_SIGNING_KEY` retains the former signing material to preserve existing
regeneration tokens; no OpenAI inference requests are made. Provider model IDs are in `env.yaml`.
Secret values never belong in this repository or the frontend. Raw prompts and images are not logged or
stored by the function. Daily anonymous usage counters live in `cookie_design_usage`; configure TTL on
`expiresAt` for housekeeping. Limits are configurable through `DAILY_CLIENT_IMAGES` (60) and
`DAILY_TOTAL_IMAGES` (1000). Image and text model IDs are environment configuration.

`POST` accepts `{brief, occasion, tone, audience, style}` for three concepts or
`{mode:"background", token, refinement}` for one regenerated background. Tokens are signed and expire
after 24 hours. Partial image failures leave successful concepts available to select. Provider errors
are sanitized before reaching the browser; cancellation and timeouts leave the existing design intact.

API references: [Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation),
[Claude structured output](https://platform.claude.com/docs/en/build-with-claude/structured-outputs).
