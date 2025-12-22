Feature: Profile Preview + Completeness Nudge

Goal: Show “How you’ll be represented” with summary, key values, intent; nudge to fill gaps.

Scope (In):
- Read DerivedProfile; render summary, top values, intent, key constraints.
- Show completeness_score and missing_fields.
- CTA “Improve matching” → returns to chat with only the next missing field prompt.

Scope (Out):
- Editing schema directly; full attraction flow.

Models touched:
- DerivedProfile, ContextProfile (intent/tone), Chat flow (for CTA).

UX states:
- Preview screen; empty state when incomplete; nudge state linking to chat.

Guardrails:
- No cringe marketing; calm tone; honest about missing data.

Acceptance checks:
- Preview reflects current derived profile.
- Missing fields listed; CTA targets next missing item in chat.
- Incomplete state handled gracefully.

Tests:
- Rendering with partial/complete profiles; CTA targeting logic; safe fallback when no missing fields.
