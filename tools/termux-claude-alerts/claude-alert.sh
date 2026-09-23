#!/data/data/com.termux/files/usr/bin/sh
# Claude Code hook -> Android alert via Termux:API.
# Called by Notification and Stop hooks; hook JSON arrives on stdin.
#   arg1: "notify" (Notification hook) or "stop" (Stop hook)
# Env toggles (set in ~/.bashrc or settings.json "env"):
#   CLAUDE_ALERT_TTS=0      no spoken voice
#   CLAUDE_ALERT_VIBRATE=0  no vibration
#   CLAUDE_ALERT_STOP=0     no alert when Claude finishes a turn

EVENT="${1:-notify}"
INPUT="$(cat)"

# Not on Termux / termux-api missing -> silently do nothing.
command -v termux-notification >/dev/null 2>&1 || exit 0

field() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r ".$1 // empty" 2>/dev/null
  else
    printf '%s' "$INPUT" | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p" | head -n1
  fi
}

TYPE="$(field notification_type)"
MSG="$(field message)"
PROJECT="$(basename "$(field cwd)")"

case "$EVENT:$TYPE" in
  stop:*)
    [ "${CLAUDE_ALERT_STOP:-1}" = 0 ] && exit 0
    TITLE="Claude done"; SAY="Claude is done"; BUZZ=200; PRIO=default ;;
  notify:permission_prompt)
    TITLE="Claude needs permission"; SAY="Claude needs permission"; BUZZ=800; PRIO=max ;;
  notify:idle_prompt)
    TITLE="Claude is waiting on you"; SAY="Claude is waiting"; BUZZ=400; PRIO=high ;;
  notify:elicitation_dialog)
    TITLE="Claude has a question"; SAY="Claude has a question"; BUZZ=600; PRIO=high ;;
  *)
    TITLE="Claude"; SAY="Claude needs you"; BUZZ=400; PRIO=high ;;
esac
[ -n "$PROJECT" ] && TITLE="$TITLE [$PROJECT]"
[ -z "$MSG" ] && MSG="$TITLE"

# termux-api calls can hang if the Termux:API app is missing; cap each one
# and run in background so the hook never blocks Claude.
T="timeout 8"
command -v timeout >/dev/null 2>&1 || T=""

(
  $T termux-notification --id claude-code --title "$TITLE" --content "$MSG" \
    --priority "$PRIO" --sound --vibrate 0,"$BUZZ" \
    --action "am start -n com.termux/.app.TermuxActivity" >/dev/null 2>&1
  [ "${CLAUDE_ALERT_VIBRATE:-1}" = 0 ] || $T termux-vibrate -f -d "$BUZZ" >/dev/null 2>&1
  [ "${CLAUDE_ALERT_TTS:-1}" = 0 ] || $T termux-tts-speak "$SAY" >/dev/null 2>&1
) </dev/null >/dev/null 2>&1 &

exit 0
