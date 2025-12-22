Feature: DerivedProfile Extraction Stub

Goal: Maintain structured schema per context from chat, with completeness tracking.

Scope (In):
- DerivedProfile model fields: json_blob, completeness_score, missing_fields, confidence_by_field.
- Rule-based extraction stub from stored chat (ignore off_record).
- Update derived profile on message save; zero-out on forget.
- Completeness threshold setting.

Scope (Out):
- Full LLM extraction; UI preview (next brief).

Models touched:
- DerivedProfile, ChatMessage.

UX states:
- None (backend/service); minimal admin debug endpoint/log ok.

Guardrails:
- Use values schema fields; skip off_record data.
- Admit uncertainty; leave fields missing rather than guessing.

Acceptance checks:
- DerivedProfile created per context after first messages.
- completeness_score and missing_fields update as data arrives.
- Forget clears relevant derived fields.

Tests:
- Extraction stub populates expected fields; completeness math; forget handling; ignores off_record.
