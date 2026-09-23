#!/data/data/com.termux/files/usr/bin/sh
# One-shot installer: run inside Termux.
#   sh tools/termux-claude-alerts/install.sh
# Adds Notification + Stop hooks to ~/.claude/settings.json (global, every repo).
# Safe to re-run: replaces its own entries, leaves everything else alone.
set -e

HERE="$(cd "$(dirname "$0")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
HOOK="$CLAUDE_DIR/hooks/claude-alert.sh"
SETTINGS="$CLAUDE_DIR/settings.json"

if command -v pkg >/dev/null 2>&1; then
  command -v termux-notification >/dev/null 2>&1 || pkg install -y termux-api
  command -v jq >/dev/null 2>&1 || pkg install -y jq
fi
command -v jq >/dev/null 2>&1 || { echo "need jq"; exit 1; }

mkdir -p "$CLAUDE_DIR/hooks"
cp "$HERE/claude-alert.sh" "$HOOK"
chmod +x "$HOOK"

[ -s "$SETTINGS" ] || echo '{}' > "$SETTINGS"
cp "$SETTINGS" "$SETTINGS.pre-alerts.bak"

TMP="$(mktemp)"
jq --arg n "sh $HOOK notify" --arg s "sh $HOOK stop" '
  def strip: map(select((.hooks // []) | all(.command | tostring | contains("claude-alert.sh") | not)));
  .hooks //= {}
  | .hooks.Notification = ((.hooks.Notification // []) | strip) + [{"hooks":[{"type":"command","command":$n}]}]
  | .hooks.Stop         = ((.hooks.Stop // [])         | strip) + [{"hooks":[{"type":"command","command":$s}]}]
' "$SETTINGS" > "$TMP"
mv "$TMP" "$SETTINGS"

echo "Installed. Hooks in $SETTINGS (backup: $SETTINGS.pre-alerts.bak)"
echo "Testing alert now..."
echo '{"notification_type":"permission_prompt","message":"Test: alerts are wired up","cwd":"'"$PWD"'"}' | sh "$HOOK" notify
echo "If nothing buzzed/spoke: install the Termux:API app (F-Droid, same source as Termux) and grant it notification permission."
