Feature: Events Surface + Match-Linked Interest

Goal: Provide seeded/small events across contexts; let matched users mark interest and coordinate.

Scope (In):
- Event model with title, location, time, tags/interests, created_by, context_type.
- Seed script or admin route to create events.
- “Invited list” only (no citywide feed). Suggest 1–3 events per match.
- RSVP states: going/maybe/can’t; “Interested” toggle per user; notify when both interested.

Scope (Out):
- Large-scale discovery feed; payments.

Models touched:
- Event, EventRSVP, Notification, Match (for suggestions).

UX states:
- Events list for eligible users/matches; RSVP interaction; mutual-interest notification.

Guardrails:
- Keep calm UI; avoid browsey feed; default to public/group meet suggestions.

Acceptance checks:
- Seeded events appear; users can mark interest/RSVP; mutual interest triggers notification.
- Events filtered/linked by context/match where applicable.

Tests:
- Seeding; RSVP persistence; mutual-interest notification; context scoping.
