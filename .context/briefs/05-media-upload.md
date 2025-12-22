Feature: Media Upload + Gallery

Goal: Allow users to upload photos (required for romantic) and optional short video; mark attraction readiness.

Scope (In):
- Upload 3–6 photos; optional 1 short video (5–10s).
- Store MediaAsset with context_type, url, type, attraction_set flag.
- Simple gallery view per context; deletion/reorder if feasible.
- Validation: romantic context requires minimum photos before attraction mode unlock.

Scope (Out):
- Attraction voting UI (next briefs); CDN hardening.

Models touched:
- MediaAsset, ContextProfile (context_type), DerivedProfile readiness check.

UX states:
- Upload UI; progress/error; gallery listing; min-count warnings for romantic.

Guardrails:
- Calm, simple UI; no public likes/ratings; respect context separation.

Acceptance checks:
- Photos/videos upload and persist with correct context_type.
- Romantic context enforces min photos for attraction readiness.
- Gallery shows media and allows removal; updates readiness flag.

Tests:
- Upload limits; context scoping; readiness computation; delete/reorder behavior.
