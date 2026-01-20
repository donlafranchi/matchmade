Feature: Profile Preview + Completeness Nudge

**IMPORTANT CONTEXT:** This brief implements temporary scaffolding showing structured data fields. The real product vision (Phase 3) replaces this with interpreted insights: "Here's what we're hearing from you..." displayed as reflective, empathetic text based on therapeutic framework analysis. See /dev/vision/profile-as-interpretation.md. This scaffolding preview enables users to see current state while the interpretation UI is built.

Goal: Show "How you'll be represented" with summary, key values, intent; nudge to fill gaps.

Scope (In):
- Read DerivedProfile; render summary, top values, intent, key constraints.
- Show completeness_score and missing_fields.
- CTA "Improve matching" → returns to chat with only the next missing field prompt.
- **Note:** Structured data display acceptable here; will be replaced with interpreted text in Phase 3.

Scope (Out):
- Interpreted insights display (Phase 3); editing schema directly; full attraction flow.

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
