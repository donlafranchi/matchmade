# Project State

**Last Updated:** 2026-01-19

---

## Current Phase: Phase 3 - Self-Hosted Agents

### What's Done
- Phase 1: Foundation (auth, chat, profile, photos, swiping, matching, events, notifications, feedback)
- Phase 2: Interpretation Engine (therapeutic analysis, background jobs, API, UI)
- Phase 3.1: Unified LLM Client (multi-provider support)
- Phase 3.2: Real-time Chat Agent (conversational AI)
- Phase 3.3: Frontend Integration (typing indicator, profile shell)
- Phase 3.4: Live Profile Extraction (auto-fill from conversations)

### What's Next
- Phase 3.5: Local Testing (verify full flow)
- Phase 3.6: VPS Setup with vLLM
- Phase 3.7: Vercel Deployment
- Phase 3.8: Beta User Testing

---

## Active Work

**Current Task:** Testing & Refinement
**Status:** Ready for user testing

**Recent Session (2026-01-19):**
- Built multi-provider LLM client (Anthropic + Ollama)
- Created chat agent with adaptive persona
- Implemented profile extraction (runs every 5 messages)
- Added profile shell UI showing what we're learning
- Simplified onboarding flow and messaging
- Created debug view at `/debug`

---

## Key URLs (Local Dev)

| Page | URL |
|------|-----|
| Login | http://localhost:3000 |
| Onboarding | http://localhost:3000/onboarding |
| Chat | http://localhost:3000/contexts/romantic |
| Debug | http://localhost:3000/debug |

---

## Recent Handoffs

### 2026-01-19: Phase 3 Core Complete
- LLM client supports Anthropic + Ollama
- Chat agent responds in real-time
- Profile extraction every 5 messages
- New onboarding messaging
- Debug view for profile inspection
- See: `dev/decisions.md` (Phase 3 section)

### 2026-01-16: Documentation Simplification
- Created `docs/` with 3 printable pages (VISION, FEATURES, VERSIONS)
- Simplified project-state.md
- Archived historical handoffs

### 2025-12-27: Phase 2 Complete
- Interpretation engine working
- Uses Claude API ($0.01/analysis)

---

## Blockers

None currently.

---

## Key Files

| Purpose | Location |
|---------|----------|
| LLM Client | `web/lib/llm-client.ts` |
| Chat Agent | `web/lib/agents/chat-agent.ts` |
| Extraction Agent | `web/lib/agents/extraction-agent.ts` |
| Chat API | `web/app/api/chat/route.ts` |
| Debug View | `web/app/debug/page.tsx` |
| Decisions | `dev/decisions.md` |

---

## Quick Start

```bash
# Start database
podman start matchmade-postgres

# Start dev server
cd web && npm run dev

# Reset database (fresh user testing)
npx tsx scripts/reset-db.ts

# Test LLM client
npx tsx scripts/test-llm-client.ts anthropic
npx tsx scripts/test-llm-client.ts openai

# Local LLM (Ollama)
ollama serve
```

---

## Environment Variables

```bash
# LLM Provider (default: anthropic)
LLM_PROVIDER=anthropic
LLM_ENDPOINT=http://localhost:11434/v1
LLM_MODEL=llama3.2:3b

# Required
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://...
```
