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
2. **Thursday** (`/thursday/index.html`) — Order tracker PWA. Firebase-backed, password-gated, real-time sync. Works. Yana uses it daily. This is the Monday.com replacement ($0 vs $350/yr).

### What Needs Work: Baker's Agent
- **Repo**: Likely separate repo `Bakers-Agent` (check GitHub: github.com/gugosf114) or local at `C:\Users\georg\Documents\GitHub\Bakers-Agent`
- **Problem**: The UI is built — tiles, buttons, cards, charts (some with fake data). Looks professional. But clicking anything does nothing. No wiring, no backend calls, no real data flowing.
- **Goal**: Wire it up to the bakery's real systems so it actually functions. Once working for MBC, potentially offer to others.

### Debug Pickup Checklist (Next Session)
1. **Locate the Baker's Agent repo** — check GitHub and `C:\Users\georg\Documents\GitHub\` for `Bakers-Agent` or similar
2. **Inventory the UI** — catalog every tile/button/card and what it's supposed to do
3. **Identify what each tile needs** — real data source, API call, script, or integration
4. **Wire one tile at a time** — get it working end-to-end before moving to the next
5. **UX fix**: Every tile must have an intuitive output location — user clicks, user immediately sees where the result appears. No guessing.

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
