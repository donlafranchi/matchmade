Session Log (per feature / stateless runs)

- Date: 2025-12-15
- Author: Codex
- Branch: feat/slice-1-architect
- Feature/Brief: slice-1-chat-profile (Architect role)
- Context loaded: (llm-dev-context.md, values-schema.md, NORTHSTAR-MVP-PROMPT.MD v3, .codex/tickets/slice-1-chat-profile.md, .codex/roles/architect.md, playbooks/profile-schema.json)

## Constraints recalled
- Budgets: ≤400 LOC, ≤2 deps, ≤1 DB table per feature; 5–15 agent runs per ticket.
- Role: Architect only—contracts, not implementation.
- Stack: Next.js App Router, TS, Tailwind, Postgres, Prisma; magic link auth; in-app/email notifications.
- Core rules: no bios/swipe feeds; off-record/forget with no raw storage; values/lifestyle/tastes first; attraction second; honest scarcity; minimal messaging.
- Slice goal: chat → profile; APIs POST /api/chat, GET/PUT /api/profile; profile JSON includes name, ageRange, location, intent, dealbreakers, prefs; content-as-code in playbooks/profile-schema.json.

## Plan
- Step 1: Define API contracts (paths, methods, req/resp, errors).
- Step 2: Define DB/Prisma model changes (Profile vs reuse DerivedProfile).
- Step 3: Define events/side-effects/config flags and non-goals/risks.

## Changes made
- Contracts below (no code changes).

### Contracts (Architect)

- API
  - POST `/api/chat`  
    - Req: `{ contextType: RelationshipContextType, message: string, offRecord?: boolean }`  
    - Resp: `{ ok: true, profileUpdated: boolean, profile?: ProfileDto, completeness?: number, missing?: string[] }`  
    - Behavior: store ChatMessage unless offRecord; if offRecord, store marker only (no content); trigger extraction to update Profile for that context; return updated profile summary (optional).
    - Errors: 401 unauthorized; 400 invalid contextType/missing message; 409 no context profile.
  - GET `/api/profile?contextType=<>`  
    - Resp: `{ profile: ProfileDto | null, completeness: number, missing: string[] }`  
    - Errors: 401, 400 invalid contextType, 404 if context profile missing.
  - PUT `/api/profile`  
    - Req: `{ contextType: RelationshipContextType, patch: Partial<ProfileDto> }`  
    - Resp: `{ profile: ProfileDto, completeness: number, missing: string[] }`  
    - Behavior: merge patch, recompute completeness/missing; keep within schema; reject extra fields.
    - Errors: 401, 400 invalid fields/contextType, 404 context profile missing.

- Profile schema (ProfileDto) — mirrors playbooks/profile-schema.json
  - Fields: `name?: string; ageRange?: "18-24" | "25-34" | "35-44" | "45-54" | "55+"; location?: string; intent?: string; dealbreakers?: string[]; preferences?: string[]`
  - Metadata: `completeness: number; missing: string[]; confidenceByField?: Record<string, number>`
  - Storage: JSON column per ContextProfile (new Profile model or reuse DerivedProfile JSON; see DB).

- DB (Prisma)
  - Option A (preferred for clarity): new `Profile` model linked 1:1 to `ContextProfile` with `data Json`, `completeness Int`, `missing String[]`. No new tables beyond this (within budget).
  - Option B (reuse existing DerivedProfile) if already created: add fields to existing derived_profile JSON. For greenfield, proceed with Profile table to keep scope clear.

- Events/side effects
  - Extraction trigger after POST /api/chat (skip offRecord content). Stub can be synchronous rule-based.
  - Future notification/event bus: not in scope for this slice.

- Config/flags
  - Profile schema version in code to align with `playbooks/profile-schema.json` (e.g., `PROFILE_SCHEMA_VERSION = "v1"`).
  - Extraction enabled flag (for later experimentation) default true.

- Non-goals (this slice)
  - No attraction/photos/matching.
  - No notifications.
  - No multi-language.
  - No cross-context blending.

- Risks/Questions
  - How to handle partial/empty profile on GET? → return null profile with completeness 0 and all fields missing.
  - OffRecord handling: ensure message content not stored; only marker. Backend must guard against accidental logging.
  - Rate limits for chat? Not specified; out of scope for this slice.

## Tests
- Not applicable (architect role).

## Follow-ups / Next session
- Backend to implement contracts/migrations; frontend to consume; QA to test.
