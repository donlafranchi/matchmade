# Phase 3: Self-Hosted Agents

**Goal:** Replace Claude API with self-hosted LLM and enable real-time agent conversations

**Duration:** 2-3 weeks
**Status:** Starting
**Priority:** Critical path to beta users

---

## The Problem

**Current state:**
- Chat messages stored (user only)
- Background analysis uses Claude API ($0.01/analysis)
- Interpretations generated but agents don't respond
- Not testable by real users (no conversations)

**What's broken:**
- No agent responses to user messages
- Can't validate profile building from conversations
- Paying API costs
- No beta user testing possible

---

## The Solution

**After Phase 3:**
- Agent responds to every user message (<5s)
- Therapeutic matchmaker persona (Gabor Maté style)
- Live profile extraction from conversations
- Self-hosted LLM (no API costs)
- 5-10 beta users testing real conversations

---

## Implementation Plan

### 3.1: Unified LLM Client (1-2 days)

**Goal:** Replace Anthropic SDK with environment-agnostic client

**Steps:**
1. Install Ollama locally (`ollama pull llama3.2:3b`)
2. Create `web/lib/llm-client.ts` (OpenAI-compatible API)
3. Update `web/lib/interpretation/analyze.ts` (replace Anthropic)
4. Test with local model

**Files:**
- `web/lib/llm-client.ts` (~150 LOC)
- Update `web/lib/interpretation/analyze.ts`

**Environment:**
```bash
# Local testing
LLM_ENDPOINT=http://localhost:11434/v1
LLM_MODEL=llama3.2:3b

# Production (later)
LLM_ENDPOINT=https://llm.matchmade.app/v1
LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
```

**Acceptance:**
- [ ] Ollama running locally
- [ ] `llm-client.ts` works with Ollama
- [ ] `analyze.ts` produces quality interpretations
- [ ] No Anthropic API calls

---

### 3.2: Real-Time Chat Agent (3-4 days)

**Goal:** Agent responds to user messages

**Steps:**
1. Create `web/lib/agents/chat-agent.ts`
2. Update `web/app/api/chat/route.ts` (add agent response)
3. Build system prompt (therapeutic matchmaker persona)
4. Test conversation flow

**Files:**
- `web/lib/agents/chat-agent.ts` (~200 LOC)
- Update `web/app/api/chat/route.ts`

**Agent Persona:**
- Warm, therapeutic, non-judgmental
- Gabor Maté style: curious about underlying needs
- Asks one question at a time
- Reflects back what user shares
- Context-aware (romantic vs friendship)

**Acceptance:**
- [ ] Agent responds to every user message
- [ ] Responses feel therapeutic and natural
- [ ] Conversation context preserved
- [ ] Agent responses stored in database

---

### 3.3: Frontend Integration (1 day)

**Goal:** Show agent messages in chat UI

**Steps:**
1. Update `web/app/contexts/[context]/ChatProfilePanel.tsx`
2. Display agent messages (visual distinction from user)
3. Add typing indicator while agent thinks
4. Auto-scroll to bottom on new messages

**Acceptance:**
- [ ] Chat shows both user and agent messages
- [ ] Typing indicator works
- [ ] Messages persist on reload
- [ ] UI feels responsive

---

### 3.4: Live Profile Extraction (2-3 days)

**Goal:** Extract structured data from conversations

**Steps:**
1. Create `web/lib/agents/extraction-agent.ts`
2. Build extraction prompt (structured JSON output)
3. Trigger extraction after N messages
4. Update Profile + ContextIntent with high-confidence data
5. Agent knows what's missing and asks follow-ups

**Files:**
- `web/lib/agents/extraction-agent.ts` (~250 LOC)

**Extraction Triggers:**
- After every 5 messages
- On profile view
- Manual refresh button

**Acceptance:**
- [ ] Profile auto-updates from conversations
- [ ] Only high-confidence data persists (≥0.80)
- [ ] Agent knows gaps and asks naturally
- [ ] Extraction runs without blocking chat

---

### 3.5: Local Testing (1 day)

**Goal:** Verify everything works locally

**Steps:**
1. Install Ollama (`curl -fsSL https://ollama.com/install.sh | sh`)
2. Pull model (`ollama pull llama3.2:3b`)
3. Start server (`ollama serve`)
4. Set env vars (`LLM_ENDPOINT=http://localhost:11434/v1`)
5. Test full conversation flow
6. Verify profile extraction accuracy

**Performance:**
- Llama 3.2 3B on CPU: ~5-10s per response (acceptable)
- Adjust `max_tokens` to control response length
- Test with different temperatures

**Acceptance:**
- [ ] Ollama running locally
- [ ] Agent responds (even if slow)
- [ ] Extraction works
- [ ] No errors in console

---

### 3.6: VPS Setup with vLLM (2-3 days)

**Goal:** Production-ready LLM server

**Infrastructure:**
- Hetzner CAX31 (€43/month, 8GB VRAM)
- vLLM with Llama 3.1 70B or Qwen 2.5 32B
- Caddy reverse proxy (HTTPS)

**Steps:**
1. Provision Hetzner GPU server
2. Install Podman + nvidia-container-toolkit
3. Deploy vLLM container
4. Set up Caddy for HTTPS (`llm.matchmade.app`)
5. Update Vercel env vars

**Performance:** <3s per response with GPU

**Acceptance:**
- [ ] VPS running and accessible
- [ ] vLLM serving on HTTPS endpoint
- [ ] Vercel can reach LLM server
- [ ] Response time <3s

---

### 3.7: Vercel Deployment (1 day)

**Goal:** Deploy app for beta users

**Steps:**
1. Test build locally (`npm run build`)
2. Deploy to Vercel (`vercel deploy`)
3. Migrate database (Podman → Railway/Supabase)
4. Set production env vars
5. Test end-to-end in production

**Acceptance:**
- [ ] App deployed to Vercel
- [ ] Database migrated and connected
- [ ] LLM server reachable
- [ ] Full conversation flow works

---

### 3.8: Beta User Testing (ongoing)

**Goal:** 5-10 users testing real conversations

**Steps:**
1. Invite beta users (`https://matchmade.vercel.app`)
2. Ask for 15-20 messages minimum
3. Monitor agent quality, extraction accuracy, errors
4. Iterate on prompts based on feedback

**Success Metrics:**
- [ ] 5-10 users complete onboarding
- [ ] Average 15+ messages per user
- [ ] Profiles extract correctly (>80% accuracy)
- [ ] Users report feeling "understood"
- [ ] No major bugs

---

## File Structure

```
web/
├── lib/
│   ├── llm-client.ts                    # NEW: Unified LLM interface
│   ├── agents/
│   │   ├── chat-agent.ts                # NEW: Real-time chat agent
│   │   └── extraction-agent.ts          # NEW: Profile extraction
│   ├── interpretation/
│   │   └── analyze.ts                   # MODIFIED: Use llm-client
│   └── prisma.ts
├── app/
│   ├── api/
│   │   └── chat/route.ts                # MODIFIED: Add agent response
│   └── contexts/[context]/
│       └── ChatProfilePanel.tsx         # MODIFIED: Show agent messages
└── package.json                          # MODIFIED: Remove @anthropic-ai/sdk
```

**Total new code:** ~600 LOC
**Modified code:** ~200 LOC

---

## Cost Analysis

**Current (Claude API):**
- $0.01/analysis
- 100 users × 3 analyses = $3/month
- 1000 users × 3 analyses = $30/month

**Self-Hosted (Hetzner VPS):**
- €43/month flat (~$46)
- Unlimited inference
- Break-even at ~140 analyses/month

**During development:**
- Local (free) for testing
- VPS only when deploying for beta users

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Local model too slow (CPU) | Use lightweight 3B model, test only endpoints |
| VPS costs higher than expected | Start with smaller GPU, scale if needed |
| Extraction accuracy low | Iterate on prompts, add confidence thresholds |
| Response quality worse than Claude | Test multiple models, tune prompts |
| VPS downtime | Add health checks, fallback for dev |

---

## Timeline

| Step | Duration | Start After |
|------|----------|-------------|
| 3.1: LLM Client | 1-2 days | - |
| 3.2: Chat Agent | 3-4 days | 3.1 |
| 3.3: Frontend | 1 day | 3.2 |
| 3.4: Extraction | 2-3 days | 3.2 (parallel) |
| 3.5: Local Test | 1 day | 3.1-3.4 |
| 3.6: VPS Setup | 2-3 days | 3.5 |
| 3.7: Deployment | 1 day | 3.6 |
| 3.8: Beta Testing | Ongoing | 3.7 |
| **Total** | **11-15 days** | |

**Realistic:** 2-3 weeks part-time
**Aggressive:** 10 days full-time

---

## Success Criteria

**Must Have:**
- [ ] Agent responds to messages in real-time
- [ ] Profile extracts from conversations (>70% accuracy)
- [ ] No Claude/OpenAI API costs
- [ ] 5 beta users complete full flow
- [ ] Response time <5s (local) or <3s (VPS)

**Nice to Have:**
- [ ] Streaming responses (better UX)
- [ ] Multiple model support (A/B test)
- [ ] Analytics on conversation quality
- [ ] Admin dashboard for monitoring

---

## Getting Started

**Right now:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull lightweight model
ollama pull llama3.2:3b

# Start server
ollama serve

# In another terminal, start your app
cd web && npm run dev
```

**Next:** Work on ticket `3.1-llm-client.md`

---

## Questions?

- **Full roadmap:** `.context/roadmap.md` Phase 3
- **Project state:** `dev/project-state.md`
- **Product vision:** `docs/VISION.md`
