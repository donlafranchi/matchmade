# STATUS.md

> Updated by agents after each session.

## Contents

- [Current Phase](#current-phase)
- [Recently Completed](#recently-completed)
- [In Progress](#in-progress)
- [Next Up](#next-up)
- [Blockers](#blockers)

---

## Current Phase

**Match Pool & Attraction (T007-T008)**

Goals:
- Photo upload for two-stage filter
- Match pool display showing compatible users
- Interest/attraction actions

Non-goals:
- Crush Notes / interaction flow (later)
- Events (later)

Constraints:
- Users without photos don't appear in match pool
- No detailed profiles — info scarcity is intentional

---

## Recently Completed

### 2026-02-03
- **T008 Match Pool Display** — Match pool page showing compatible users with photos, compatibility indicators (not percentages), interest tracking, mutual interest detection. Filter tabs for All/Interested/Mutual.
- **T007 Photo Upload** — Photo upload system with S3-compatible storage, drag-and-drop UI, onboarding step. Max 6 photos, 5MB each. Users without photos won't appear in match pool.

### 2026-02-02
- **T006 Feedback Form** — Optional post-date feedback with safety flag, profile accuracy, match quality
- **T005 Onboarding Questions UI** — Two-track onboarding with experience-based question routing
- **T001/T003 Update** — Added experience tracking (User.experienceLevel) and question type support (scenario/reflective/direct_choice)
- **T004 Compatibility Calculation** — Match scoring with user-defined dealbreakers as hard filters
- **T003 Score Extraction** — LLM-based extraction of dimension scores from free-text answers
- **T002 Dimension Constants** — Created lib/matching/dimensions.ts with types, rules, spectrums
- **T001 Matching Schema** — Added ProfileDimension and FeedbackResponse models with dealbreaker flag

### 2026-01-24
- **Project Scaffolding** - Created CLAUDE.md, docs/PRODUCT.md, docs/ROADMAP.md, docs/STATUS.md, docs/DECISIONS.md, design/ folder, ticket template

### 2026-01-21
- **Waitlist System** - Basic waitlist signup implemented

### 2026-01-19
- **Phase 3.4 Complete** - Live profile extraction, chat agent, LLM client, frontend integration

---

## In Progress

*None*

---

## Next Up

**Match Pool & Attraction (T007-T008) Complete**

Next phase: Interaction Flow (from backlog)
1. **interaction-flow.md** — Nudge → Wink → Crush Note → Accept

---

## Blockers

*None*

---

## Key URLs (Local Dev)

| Page | URL |
|------|-----|
| Login | http://localhost:3000 |
| Onboarding Intro | http://localhost:3000/onboarding |
| Onboarding Questions | http://localhost:3000/onboarding/questions |
| Onboarding Photos | http://localhost:3000/onboarding/photos |
| Match Pool | http://localhost:3000/pool |
| Chat | http://localhost:3000/contexts/romantic |
| Feedback | http://localhost:3000/feedback/[matchId]?to=[userId] |
| Debug | http://localhost:3000/debug |

---

## Key Files

| Purpose | Location |
|---------|----------|
| LLM Client | `web/lib/llm-client.ts` |
| Chat Agent | `web/lib/agents/chat-agent.ts` |
| Extraction Agent | `web/lib/agents/extraction-agent.ts` |
| Dimensions | `web/lib/matching/dimensions.ts` |
| Compatibility | `web/lib/matching/compatibility.ts` |
| Questions | `web/lib/matching/questions.ts` |
| Photo Storage | `web/lib/storage.ts` |
| Photo Utils | `web/lib/photos.ts` |
| Photo API | `web/app/api/photos/route.ts` |
| Photo Upload UI | `web/app/components/PhotoUpload.tsx` |
| Match Pool API | `web/app/api/pool/route.ts` |
| Interest API | `web/app/api/interest/route.ts` |
| User Card | `web/app/components/UserCard.tsx` |
| Pool Page | `web/app/pool/page.tsx` |

---
*Last updated: 2026-02-03*
