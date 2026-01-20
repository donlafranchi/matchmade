Feature: Matching Engine + Match Reveal

Goal: Pair users values-first, attraction-second; reveal matches quietly.

Scope (In):
- Eligibility: same context, within location radius, completeness_score above threshold, required media present.
- Scoring: values similarity (weighted), interaction_style compatibility, penalty for opposing politics when importance high.
- Require mutual attraction votes = Yes before surfacing.
- Match record with score/status; honest “No matches right now.”
- Quiet match reveal (“Worth meeting”) with limited coordination chat cap or quick plan link.

Scope (Out):
- Events integration (next brief).

Models touched:
- Match, AttractionVote, DerivedProfile, ContextProfile, Notification (optional).

UX states:
- No matches; match reveal; limited coordination chat or quick plan CTA.

Guardrails:
- No rankings/popularity; no fireworks; honesty on scarcity.

Acceptance checks:
- Matches only created when eligibility + mutual attraction met.
- “No matches” state appears when empty; no padding.
- Coordination chat capped; quick plan available.

Tests:
- Scoring/eligibility logic; mutual attraction requirement; no-match state; match reveal flow.
