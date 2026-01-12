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
