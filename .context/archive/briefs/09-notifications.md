Feature: Notifications Inbox

Goal: Deliver in-app/email notifications for key events (auth, matches, mutual event interest) with a simple inbox.

Scope (In):
- Notification model (user_id, type, payload, read_at).
- Trigger notifications for: auth (optional), match creation, mutual event interest, quick plan prompts.
- In-app inbox UI; mark-as-read.
- Email fallback for critical items (match created).

Scope (Out):
- Web push; granular preferences UI.

Models touched:
- Notification, Match, EventRSVP (for triggers), User.

UX states:
- Inbox list; empty state; read/unread.

Guardrails:
- Calm tone; no spam; relevant, sparse notifications.

Acceptance checks:
- Notifications created for defined events; inbox shows them; read status updates.
- Email sent for critical events if configured.

Tests:
- Trigger logic; inbox rendering; read/unread; email fallback toggling.
