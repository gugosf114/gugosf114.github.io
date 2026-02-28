# CLAUDE.md - My Baking Creations (Architect Mode)

## Project Context
- **Repo**: gugosf114.github.io (GitHub Pages)
- **Primary Domain**: www.mybakingcreations.com
- **Owner**: George Abrahamyan (Architect/Operations)
- **Baker**: Yana (Artistic Lead)

## THE "IRON LAWS" (Forensic Audit Mode)
1. **No Telephone Game**: Claude MUST use the `filesystem` tool to see code directly. Never ask George for screenshots. If a visual check is needed, use `puppeteer` or `playwright`.
2. **Sequential Thinking First**: For every bug or task, start with a 5+ step `sequential_thinking` block. Map the "cascade" of the problem before suggesting a fix.
3. **Proactive Validation**: Before declaring a task "done," you MUST run `node .github/scripts/validate-site.js`. 
4. **Token Management**: If the context window feels heavy, proactively suggest the `/compact` command to summarize progress and clear "fog."
5. **Ghost Client Isolation**: When in "Business Mode," use Gemini/Sheets integration to cross-reference 2024 corporate orders vs. current silence to isolate "ghost" leads.

## Critical Business Knowledge (Do Not Ask Again)
- **Wix Migration Scars**: The site moved from Wix. Billing is now direct Google. Workspace is independent but managed via a recovery link to George's personal Gmail. 
- **Double Billing Risk**: Watch for Wix "zombie" subscriptions.
- **Urgency Priority**: Focus on "Scalable Revenue" (Cookies/Corporate) over "Custom Artistic" (Cakes) unless specified.

## Tech Stack & Edge Cases
- **Validator Exceptions**: Ignore media query "conflicts" (responsive design) and 403/404 headers from Yelp/Google Fonts.
- **CSS Architecture**: `style.css` is massive (~2800 lines). Tracing the "cascade" is mandatory to prevent "stupid small shit" (color regressions).

## Working with George (Rule 11)
- **Communication**: Blunt, direct, zero corporate fluff. 
- **Voice-to-Text**: Ignore speech patterns/typos in transcription; focus on the core intent.
- **Behavioral Note**: If George "rabbit holes" on low-priority items, PUSH BACK. Redirect him to the primary business goal (Customer Outreach/Website Stability).
- **Session End**: Listen for "George out" or "Over and out."

## BUSINESS OPERATIONS PROTOCOLS
1. **The "Ghost" Mandate**: Our #1 operational goal is isolating corporate clients who ordered in 2024 but are silent in 2025/2026. Use `google_drive` or `gmail` MCPs to hunt these leads.
2. **Billing Vigilance**: Always flag Wix-related billing or "slave" account issues. Verify all Workspace admin changes against the Direct Google Billing transition.
3. **Communication Logic**: George uses voice-to-text. Extract the core intent, ignore the typos. Be blunt. No corporate fluff.
4. **Revenue Priority**: Cookies are scalable; Cakes are artistic/limited. Prioritize cookie-based corporate inquiries during high-volume periods.

## MASTER TOOLKIT (ALWAYS ON)
- **Sequential Thinking**: Mandatory for planning business outreach or complex email sorting.
- **Google Workspace**: Use to cross-reference customer emails with order spreadsheets.
- **Filesystem**: Scopes to `C:\Users\georg\Documents\GitHub\` for site audits.

---

## CURRENT WORK: BAKER'S AGENT — WIRING & DEBUG
**Status**: UI exists, nothing wired. Needs full integration.
**Last updated**: 2026-02-28

### What's Done (DO NOT TOUCH)
1. **mybakingcreations.com** — Production website. Works. Brings in revenue. Stable.
2. **Thursday** (`/thursday/index.html`) — Order tracker PWA. Works. Yana uses it daily. Monday.com replacement ($0 vs $350/yr).

### Thursday Architecture Reference (2,794 lines, single-file PWA)
- **Location**: `/thursday/index.html` + `manifest.json` + icons
- **Backend**: Firebase Realtime Database + Firebase Storage (project: `mbc-thursday`)
- **Auth**: Simple password gate (not Firebase Auth)
- **Data model**: `orders[]` and `archive[]` synced to Firebase refs `/orders` and `/archive`
- **3 Views**: Dashboard (`renderDashboard`), Active Orders (`renderOrdersView`), Archive
- **Dashboard tiles** (all wired to real order data, not fake):
  - Active Orders count → clicks to Orders view
  - Due This Week count
  - Unpaid Invoices → clicks to filtered Orders view
  - Sketches Pending → clicks to filtered Orders view
  - Revenue (Paid) / Outstanding / Avg Order Value — calculated from order prices
  - Alert banners: overdue (red), due today (orange), due tomorrow (yellow)
  - Mini calendar with order dots
  - Upcoming due dates list
  - Quick Actions: New Order, View All, Export CSV
- **Order CRUD**: Add/edit/archive/restore, per-field inline editing (`updateField`)
- **Order fields**: customerName, email, phone, item type, flavor, quantity, price, dueDateTime, invoice status, sketch status, person (Yana/TopG), notes, components, attachments
- **Email parser**: Paste raw customer email → regex extraction → auto-populate new order (`parseOrderFromEmail`, 200+ lines of parsing logic)
- **Attachments**: Upload to Firebase Storage per order
- **Views**: Table mode + Card mode toggle for orders
- **Extras**: Haiku emotional support button, "Just World" button (Yana's morale features)
- **Offline capable**: Falls back to localStorage when Firebase unavailable

### What Needs Work: Baker's Agent
- **Repo**: Separate repo `Bakers-Agent` — local at `C:\Users\georg\Documents\GitHub\bakers-agent`
- **Scale**: 198 files, 36,290 lines — ~41 Cloud Functions + shared library + tests + UI (React/Vite)
- **Problem**: UI is built (tiles, buttons, cards, charts) but nothing wired. No backend calls, no real data flowing.
- **Goal**: Wire it up to the bakery's real systems. Once working for MBC, potentially offer to others.
- **UI tiles**: The Pope, AI Visibility, Brand Check, SEO Scan (4 Agent Fleet tiles in AgentTiles.tsx)

### Baker's Agent Full Audit (2026-02-28, completed on desktop)
**Method**: 198 files partitioned into 6 non-overlapping groups, 6 parallel reviewer agents, zero gaps.
**Result**: 8 CRITICAL, 20 HIGH, 12 MEDIUM findings. **612 tests passing after fixes.**

#### CRITICAL FIXES COMPLETED
1. `shared/bakers_shared/secrets.py` — Added `.strip()` to Secret Manager reads (trailing newlines corrupted all API keys)
2. `shared/bakers_shared/pubsub.py` — Silent `except: pass` → logged exception (was eating errors silently)
3. `shared/bakers_shared/pubsub.py` — Top-level `pubsub_v1` import → lazy wrapper `_pubsub_v1()` (prevented crash in functions without pubsub dep)
4. `shared/bakers_shared/config.py` — Removed `ghp_` and `sk-` from `_PLACEHOLDER_SNIPPETS` (false-positived on real GitHub/OpenAI tokens)
5. `ai-visibility-v1`, `gbp-reviews-agent-v1`, `seo-brief-v1`, `bakers-agent-v1` requirements — Removed banned `google-cloud-aiplatform` SDK (corrupts gRPC, breaks Firestore)
6. `segment-builder-v1/requirements.txt` — Added missing `functions-framework`

#### HIGH FIXES COMPLETED
7. `shared/bakers_shared/firestore.py` — `FIRESTORE_DB` env var moved from module-level to inside `client()` function
8. `shared/google_oauth.py` — Added `.strip()` on secret reads
9. `seo-brief-v1/main.py` — Full Vertex AI SDK → REST API migration, model → gemini-2.5-flash
10. `bakers-agent-v1/main.py` — Full multimodal Vertex AI SDK → REST API migration (GCS image URIs via `fileData.fileUri`)
11. `dun-curiosity-v1`, `dun-pope-v1` — Model defaults gemini-2.0-flash → gemini-2.5-flash
12. `ui/AgentTiles.tsx` — Fixed stale closure in 180s timeout (functional `setTiles` updater)
13. `local-seo-feeder-v1`, `reorder-predictor-v1`, `reorder-reminder-activator-v1` — Gen1 → Gen2 CloudEvent signatures

#### KNOWN RULES (from audit — DO NOT VIOLATE)
- **BANNED SDK**: Never use `google-cloud-aiplatform` or `google-generativeai` — corrupts global gRPC auth, breaks Firestore. Use REST API (`requests.post`) instead.
- **Vertex AI REST**: For GCS URI support (multimodal), use `https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent` with OAuth2 service account auth
- **Shared `llm.py`**: Uses `generativelanguage.googleapis.com` REST with API key. Does NOT support multimodal/GCS URIs — that's why `bakers-agent-v1` has its own REST call.
- **Gen2 signatures**: All Cloud Functions must use `@functions_framework.cloud_event` + `decode_pubsub(cloud_event)`, NOT Gen1 `(event, context)`
- **Secret Manager values**: Always `.strip()` — trailing newlines are invisible killers
- **Model standard**: `gemini-2.5-flash` (not 2.0-flash, not 2.5-pro unless specified)

#### UNFIXED (MEDIUM — next session)
- `shared/bakers_shared/rate_limit.py:64` — `assert` in production code path (removed under `-O`)
- `shared/bakers_shared/llm.py:133` — JSON fence-stripping regex fails if Gemini adds preamble before fence
- `shared/bakers_shared/mcp_client.py:423` — `except Exception: pass` with zero logging
- `shared/bakers_shared/firestore_store.py:78` — Silent `except Exception: return False` in lock claim
- `shared/bakers_shared/pubsubutil.py:28` — `stable_json_dumps` (sorted keys) vs `pubsub.py` plain `json.dumps` — two `publish_json` behave differently
- `commerce-feeds-v1/main.py:453` — Content-Type header unpacked but never returned to client
- `attribution-v1/main.py:322` — Non-idempotent `snapshot_id` (uses `datetime.now()`) — Pub/Sub retries create duplicates
- `ui-trigger-v1/main.py:130` — `print()` instead of structured logger
- `seo-pr-writer-v1/main.py:111` — Module-level Secret Manager call on cold start
- `ui/AgentTiles.tsx:163` — Score field names hardcoded to one schema (3/4 tiles show "Complete" with no number)
- `ui/OpsView.tsx:160` — `draft.caption.slice()` crashes on missing Firestore field

#### DEAD CODE (cleanup when convenient)
- `ui/EmailView.tsx` + `ui/CustomersView.tsx` — defined but never routed in App.tsx
- `ui/styles.css` — 833-line legacy CSS not imported anywhere
- `ui/config.json` — contains `passwordHash` and Firebase keys but never read by React app
- `deploy_helpers.sh` — syncs to `shared/` instead of `bakers_shared/`, incompatible with current layout
- `poster-pinterest-v1/adapter.py:31-33` — 3 computed values silently discarded
- `tests/test_directory_feeds.py:78` — tautological assertion `f1["feed_id"] == f1["feed_id"]`
- `tests/test_reorder_reminder_activator.py:136` — test with zero assertions

#### SECURITY NOTE
- `gbp_secret.json` — Live OAuth `client_secret` + `refresh_token` was in git. Credentials must be rotated in GCP Console. Deleting the file doesn't purge git history.

### Debug Pickup Checklist (Next Session — WIRING)
1. **Open Baker's Agent repo on desktop** — `C:\Users\georg\Documents\GitHub\bakers-agent`
2. **Fix remaining MEDIUM issues** — list above, all surgical edits
3. **Wire the UI**: Inventory every tile in AgentTiles.tsx, OpsView.tsx — map each to its Cloud Function
4. **UX fix**: Every tile must show output in an obvious place. Click → result. No guessing.
5. **Test**: `python -m pytest tests/ -v` (should stay at 612+ passing)

### Key Principle (From George)
> "It's a brand new TV and all the cables are just hanging."
> The UI is there. The design is there. What's missing is the wiring — real data, real actions, real outputs in obvious places.

### Environment Notes
- **Desktop sessions** (C drive) have full power: Puppeteer, Desktop Commander, MCP tools, browser jumping between Search Console and Analytics
- **Cloud/phone sessions** (GitHub web) are limited — no browser control, no MCP, no desktop tools
- **This work should be done on desktop** for full capability

### DO NOT
- Split work across Perplexity, Codex, Grok, etc. — one AI, one context, no telephone game
- Add fake data or placeholder outputs — wire to real sources or don't wire at all
- Make tiles that show a single number with no context — that's a "flag for bullshit"
