Feature: Feedback + Trust Aggregate

Goal: Capture post-event/meet feedback privately and adjust internal trust signals.

Scope (In):
- Feedback submission: honesty, respect, intent alignment, safety (1–5) + short note.
- Optional event_id linkage; applicable to matches/meetups.
- TrustAggregate: internal scores/flags; soft-limit reach on repeated misrepresentation.
- Admin-safe view/logging for debugging (minimal).

Scope (Out):
- Public ratings; shaming; complex reputation algorithms.

Models touched:
- Feedback, TrustAggregate, Match/Event linkage.

UX states:
- Private feedback prompt post-event/meet; submission UI; confirmation.

Guardrails:
- Private, not public; calm tone; no retaliation vectors; do not expose aggregates to users.

Acceptance checks:
- Feedback persists with correct linkage; TrustAggregate updates; soft-limit applied when thresholds crossed.

Tests:
- Feedback save; aggregate update logic; soft-limit gating; access controls to keep private.
