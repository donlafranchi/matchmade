Feature: Attraction Mode (Photos-Only) + Rate Limit

Goal: Enable photos-only attraction cards per context once alignment readiness is reached.

Scope (In):
- Gate on completeness_score threshold + required media for context.
- Cards show photos only; actions Yes/No/Skip.
- Persist AttractionVote (viewer, viewed, context_type, decision, timestamp).
- Rate limit (e.g., ~20/day) to prevent feed behavior.

Scope (Out):
- Matching reveal (next brief); social features.

Models touched:
- AttractionVote, MediaAsset, ContextProfile, DerivedProfile (readiness check).

UX states:
- Attraction deck; empty/rate-limit states; unlock messaging once ready.

Guardrails:
- No text in attraction step; private/quiet; honest “no cards” state.

Acceptance checks:
- Readiness gating works; cards limited per day; votes persisted by context.
- Empty and rate-limit states display clearly.

Tests:
- Gating logic; vote persistence; rate limiting; context isolation.
