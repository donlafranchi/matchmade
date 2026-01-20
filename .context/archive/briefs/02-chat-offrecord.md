Feature: Agent Chat UI with Off-the-Record and Forget

Goal: Per-context chat thread with basic controls, storing normal messages, and respecting “off the record” + “forget” behaviors.

Scope (In):
- Per-context chat UI and API.
- Store normal messages; flag off_record messages and do NOT persist raw content.
- Controls: Keep it light / Go deeper; Off the record; Forget last message/topic (delete stored + zero derived fields).
- Tone applied per ContextProfile.

Scope (Out):
- DerivedProfile extraction (stubbed next brief).
- Notifications.

Models touched:
- ChatMessage (off_record flag), ContextProfile (tone), DerivedProfile (zero-out on forget).

UX states:
- Chat thread; controls; off-record indicator; confirmation for forget.

Guardrails:
- No interrogation; one small question at a time.
- Off-record content not stored; forget clears derived fields tied to forgotten content.

Acceptance checks:
- Normal messages persist; off-record messages not retrievable.
- Forget removes last stored message and clears related derived fields.
- Tone reflected in agent replies.

Tests:
- Store vs skip storage; forget behavior; tone application; controls visible per context.
