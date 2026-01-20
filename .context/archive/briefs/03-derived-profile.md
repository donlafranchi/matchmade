Feature: DerivedProfile Extraction Stub

**IMPORTANT CONTEXT:** This brief implements temporary scaffolding with rigid forms/rule-based extraction. The real product vision (Phase 2+) is conversational profiling with therapeutic interpretation using LLM analysis through frameworks like Gabor Mate, Esther Perel, Gottman, IFS, and Attachment Theory. See /dev/vision/profile-as-interpretation.md for the northstar. This scaffolding enables functionality while the interpretation engine is built.

Goal: Maintain structured schema per context from chat, with completeness tracking.

Scope (In):
- DerivedProfile model fields: json_blob, completeness_score, missing_fields, confidence_by_field.
- Rule-based extraction stub from stored chat (ignore off_record).
- Update derived profile on message save; zero-out on forget.
- Completeness threshold setting.
- **Note:** Rigid forms acceptable here as temporary UI to enable data collection.

Scope (Out):
- Full LLM therapeutic interpretation (Phase 2); UI preview (next brief).

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
