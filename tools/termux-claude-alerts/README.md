# Termux alerts for Claude Code

Phone buzzes + speaks + drops a notification when Claude Code:
- **needs permission** (the yellow prompt) — long buzz, max priority
- **is waiting on you** (idle 60s+) / has a question
- **finishes a turn** — short buzz

## Install (once, in Termux)

1. Install the **Termux:API** app from the same place you got Termux (F-Droid or GitHub — must match). Allow its notifications.
2. From this repo:
   ```sh
   sh tools/termux-claude-alerts/install.sh
   ```
   It installs `termux-api` + `jq`, copies the hook to `~/.claude/hooks/`, merges hooks into `~/.claude/settings.json` (global, works in every repo), backs up the old file, and fires a test alert.
3. Restart `claude`.

## Toggles (export in `~/.bashrc`)

| Var | Effect |
|---|---|
| `CLAUDE_ALERT_TTS=0` | no voice |
| `CLAUDE_ALERT_VIBRATE=0` | no extra vibration |
| `CLAUDE_ALERT_STOP=0` | no "done" alert, only permission/waiting |

Tap the notification to jump back into Termux.

## Fewer yellow prompts

Alerts fix "I don't hear it." To also get asked less:
- `Shift+Tab` in Claude cycles to **accept edits** mode (file edits stop prompting).
- Or start with `claude --permission-mode acceptEdits`.
- `/permissions` → add allow rules for commands you always approve (e.g. `Bash(git:*)`, `Bash(node:*)`).
