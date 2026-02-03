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

**Matching System (T001-T006)**

Goals:
- Dimension-based profile scoring
- User-defined dealbreakers
- Compatibility calculation

Non-goals:
- Actual match surfacing UI (later)
- Notifications (later)

Constraints:
- No fixed profile minimums — sparse profiles = smaller pool
- Dealbreakers filter out, not penalize

---

## Recently Completed

### 2026-02-02
- **T002 Dimension Constants** — Created lib/matching/dimensions.ts with types, rules, spectrums
- **T001 Matching Schema** — Added ProfileDimension and FeedbackResponse models with dealbreaker flag

### 2026-01-24
- **Project Scaffolding** - Created CLAUDE.md, docs/PRODUCT.md, docs/ROADMAP.md, docs/STATUS.md, docs/DECISIONS.md, design/ folder, ticket template

### 2026-01-21
- **Waitlist System** - Basic waitlist signup implemented

### 2026-01-19
- **Phase 3.4 Complete** - Live profile extraction, chat agent, LLM client, frontend integration
- Built multi-provider LLM client (Anthropic + Ollama)
- Created chat agent with adaptive persona
- Implemented profile extraction (runs every 5 messages)
- Added profile shell UI showing what we're learning
- Simplified onboarding flow and messaging
- Created debug view at `/debug`

### 2026-01-16
- **Documentation Simplification** - Created docs/ with VISION, FEATURES, VERSIONS

---

## In Progress

- **T002-T006** — Remaining matching system tickets

---

## Next Up

1. [x] T002 - Dimension Constants
2. [ ] T003 - Score Extraction
3. [ ] T004 - Compatibility Calculation
4. [ ] T005 - Onboarding Questions UI
5. [ ] T006 - Feedback Form

---

## Blockers

*None*

---

## Key URLs (Local Dev)

| Page | URL |
|------|-----|
| Login | http://localhost:3000 |
| Onboarding | http://localhost:3000/onboarding |
| Chat | http://localhost:3000/contexts/romantic |
| Debug | http://localhost:3000/debug |

---

## Key Files

| Purpose | Location |
|---------|----------|
| LLM Client | `web/lib/llm-client.ts` |
| Chat Agent | `web/lib/agents/chat-agent.ts` |
| Extraction Agent | `web/lib/agents/extraction-agent.ts` |
| Chat API | `web/app/api/chat/route.ts` |
| Debug View | `web/app/debug/page.tsx` |
| Decisions | `docs/DECISIONS.md` |

---
*Last updated: 2026-02-02*
