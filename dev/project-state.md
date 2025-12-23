# Project State Tracker

**Last Updated:** 2025-12-22 (Structure consolidated - all dev files now in root dev/)

---

## Current Phase: Foundation Building (2.5/10 features complete)
**Note:** Slice 1 architectural refinement in progress before proceeding to Slice 2

### Build Order Progress
- [x] 1. Auth + context selection + basic routing (✅ Complete)
- [x] 2. Agent chat UI + off-the-record (✅ Complete)
- [x] 3. DerivedProfile extraction (🟡 Partially complete - stub implemented)
- [ ] 4. Profile preview + completeness nudges
- [ ] 5. Media upload + gallery
- [ ] 6. Attraction mode + persistence + rate limit
- [ ] 7. Matching engine + match reveal
- [ ] 8. Events: seeded list + match-linked interest + RSVP
- [ ] 9. Notifications inbox
- [ ] 10. Feedback + trust aggregate

---

## Active Work

### Current Task
- **Owner:** Backend Specialist (ready to start Slice 1a)
- **Task:** Implement Slice 1a - Schema & Data Migration
- **Mode:** Swarm (Database refactor)
- **Blocked by:** None - All tickets ready ✅
- **Depends on:** Architecture + tickets complete ✅

### Recent Sessions
- **2025-12-20** - Slice 1 implementation (chat + profile extraction)
  - Architect: Architecture designed
  - Backend: API routes + Prisma schema
  - Frontend: Chat UI + profile preview components
  - QA: Validated and approved
  - **Artifacts:** See `dev/tickets/slice-1-chat-profile.md`

---

## Recent Handoffs

### 2025-12-22: Slice Tickets Complete - Ready to Implement
- **From:** Feature Planner (agent aa2dde6)
- **To:** Backend Specialist (Slice 1a implementation)
- **Artifacts:**
  - `dev/tickets/slice-1a-schema-migration.md` - Schema + migration (~330 LOC)
  - `dev/tickets/slice-1b-backend-api.md` - Backend API refactor (~300 LOC)
  - `dev/tickets/slice-1c-frontend-ui.md` - Frontend UI refactor (~620 LOC)
  - `dev/tickets/slice-1-summary.md` - Planning summary
- **Key Details:**
  - Total scope: ~1,250 LOC split across 3 slices
  - Sequential dependencies: 1a → 1b → 1c
  - Each ticket: comprehensive acceptance criteria, test plans, edge cases
  - Budget verified: All slices within swarm constraints
  - No blockers for Slice 1a
- **Status:** ✅ All tickets ready
- **Next:** Backend Specialist implements Slice 1a (schema + migration)

### 2025-12-22: Architecture Complete - Option 1 (Single Profile + Context-Specific Intent)
- **From:** Architect (agent a12962d)
- **To:** Feature Planner (create 3 slice tickets)
- **Artifacts:**
  - `dev/logs/slice-1-option1-architecture-2025-12-22.md` - Complete architecture design
- **Key Decisions:**
  - Total implementation: ~1,250 LOC (exceeds 400 LOC single slice)
  - Split into 3 slices:
    - Slice 1a: Schema & Data Migration (~330 LOC)
    - Slice 1b: Backend API Refactor (~300 LOC)
    - Slice 1c: Frontend UI Refactor (~620 LOC)
  - New models: Profile (userId FK), ContextIntent (userId + contextType)
  - Shared fields: coreValues, beliefs, interactionStyle, lifestyle, constraints, location, ageRange
  - Context-specific fields: All in ContextIntent (romantic, friendship, professional, creative, service)
  - Trust boundary: Enforced by matching query filters (WHERE contextIntents.some({ contextType }))
  - Migration strategy: Additive first, data migration script, rollback plan
- **Status:** ✅ Architecture complete
- **Next:** Feature Planner creates 3 slice tickets, then Implement starts with Slice 1a

### 2025-12-22: PM Re-Evaluation - Direction Change to Option 1
- **From:** Product Manager (agent a76d6e1)
- **To:** Product Manager / Architect (define boundaries, then architect new approach)
- **Decision:** ✅ APPROVED - Option 1: Single Profile + Context-Specific Intent Fields
- **Artifacts:**
  - PM re-evaluation exploring 3 alternative architectures
- **Key Changes:**
  - Discard Option B (Unified Chat with Context Scope)
  - Move to Single Profile model (agent sees full picture)
  - Most data shared (values, beliefs, lifestyle, interaction style)
  - Only intent fields differ by context (seeking, commitment, availability)
  - Trust boundary in matching filter (not database architecture)
- **Status:** ✅ Direction approved, now defining context boundaries
- **Next:** Define what distinguishes friendship vs romantic vs professional, then Architect new schema

### 2025-12-22: Architecture Complete - Slice 1 Refactor (SUPERSEDED)
- **From:** Architect
- **To:** ~~Implement~~ SUPERSEDED by new direction
- **Artifacts:**
  - `dev/logs/slice-1-refactor-architecture-2025-12-22.md` (SUPERSEDED)
- **Status:** ⚠️ SUPERSEDED - New direction chosen (Option 1)

### 2025-12-22: PM Review - Context Architecture Decision (SUPERSEDED)
- **From:** Product Manager (agent evaluation)
- **To:** Architect/Implement (ready to refactor)
- **Decision:** ❌ NOT APPROVED - Remove context switching entirely
- **Decision:** ✅ APPROVED - Option B: Unified Chat with Context Scope
- **Artifacts:**
  - PM Review output (agent ae918ea)
  - Product principles preserved: trust boundaries, consent, no cross-context leakage
- **Approach:**
  - Keep separate ContextProfile records in database (architectural boundary preserved)
  - Show single chat interface that asks "What context?" only when user adds multiple contexts
  - Visual indicator shows current context scope clearly
  - Under the hood: separate matching pools and profiles
- **Status:** ✅ Approved with clear implementation path
- **Next:** Architect to design Option B implementation, then Implement to refactor UI

### 2025-12-22: Project Reorganization Complete
- **From:** Structure consolidation
- **To:** Feature Planner (ready to define next feature)
- **Artifacts:**
  - `.codex/context.md` - Navigation and prompts for Codex users
  - `.claude/context.md` - Navigation and prompts for Claude Code users
  - `dev/roles/*` - All 12 role definitions
  - `dev/protocols/single-dev.md` - Single-dev workflow
  - `dev/protocols/swarm-dev.md` - Swarm workflow
  - Language updated: "easy, natural, gets out of the way"
- **Status:** ✅ Complete
- **Next:** Feature Planner to identify next feature from build order

### 2025-12-20: Slice 1 Complete (Chat + Profile)
- **From:** QA
- **To:** Session log + Ready for next feature
- **Artifacts:**
  - `dev/tickets/slice-1-chat-profile.md`
  - `.context/session-logs/slice-1-implementation-*.md`
- **Status:** ✅ Complete
- **Next:** Continue to Brief 04 (Profile Preview)

---

## Next Up

### Immediate Priority (Next Session)
1. **Feature Planner** → Create 3 slice tickets for Option 1 implementation
   - Read architecture: `dev/logs/slice-1-option1-architecture-2025-12-22.md`
   - Create `dev/tickets/slice-1a-schema-migration.md` (~330 LOC)
   - Create `dev/tickets/slice-1b-backend-api.md` (~300 LOC)
   - Create `dev/tickets/slice-1c-frontend-ui.md` (~620 LOC)
   - Each ticket: acceptance criteria, test plan, dependencies, constraints
   - Output: 3 tickets ready for implementation

2. **Implement (Slice 1a)** → Schema & Data Migration
   - Update `schema.prisma` with Profile + ContextIntent models
   - Create data migration script
   - Test migration on local copy of production data
   - Verify data integrity
   - Output: Additive schema changes + migration script

3. **Implement (Slice 1b)** → Backend API Refactor
   - Create `/lib/profile-shared.ts`, `/lib/context-intent.ts`
   - Update `/app/api/profile/route.ts`, create `/app/api/profile/intent/route.ts`
   - Update `/app/api/chat/route.ts` to write to both models
   - Test API endpoints
   - Output: Backend APIs using new schema

4. **Implement (Slice 1c)** → Frontend UI Refactor
   - Create `ContextScopeIndicator`, `SharedProfileForm`, `ContextIntentForm`
   - Update `ChatProfilePanel.tsx` to split shared + intent
   - Update `/app/contexts/[context]/page.tsx` to fetch both models
   - Test UI flows
   - Output: UI showing shared profile + context-specific intent

5. **After Option 1 Complete** → Continue to Brief 04 (Profile Preview)
   - Feature Planner creates ticket for Brief 04
   - Resume normal build order

---

## Blockers & Dependencies

### Current Blockers
- None

### Upcoming Dependencies (for future features)
- Brief 05 (Media upload) requires:
  - File storage solution (S3 or similar)
  - Image processing library
- Brief 06 (Attraction mode) requires:
  - Brief 05 complete (attraction_set photos)
  - AttractionVote table
- Brief 07 (Matching) requires:
  - Brief 06 complete (mutual attraction)
  - Scoring algorithm designed

---

## Milestones & Checkpoints

### Completed Milestones
- ✅ Project structure reorganized (2025-12-22)
- ✅ Slice 1: Chat + Profile (2025-12-20)
- ✅ Language unified: "easy, natural, gets out of the way" (2025-12-22)
- ✅ Option 1 architecture designed: Single Profile + Context-Specific Intent Fields (2025-12-22)
- ✅ Context boundaries defined for 5 relationship types (2025-12-22)
- ✅ 3 slice tickets created for Option 1 implementation (2025-12-22)

### Upcoming Milestones
- 🎯 MVP Checkpoint 1: Briefs 1-4 complete (user can chat, see profile)
- 🎯 MVP Checkpoint 2: Briefs 5-6 complete (user can upload photos, see attraction cards)
- 🎯 MVP Checkpoint 3: Brief 7 complete (matching engine working)
- 🎯 Beta Launch: Briefs 1-8 complete (users can match and meet at events)
- 🎯 V1 Launch: All 10 briefs complete

---

## Agent Context Map

### What Each Agent Needs to Read

| Agent | Must Read | Should Read | Output |
|-------|-----------|-------------|--------|
| **Product Manager** | project-state.md, northstar.md, llm-dev-context.md, latest 3 session logs | briefs/, the-art-of-vibes.md | Go/no-go decision, strategic guidance |
| **Feature Planner** | project-state.md, llm-dev-context.md (build order), latest 5 session logs, tickets/, slices/ | briefs/[NN]-*.md | Ticket in dev/tickets/ |
| **Architect** | project-state.md, ticket, llm-dev-context.md, values-schema.md | Existing codebase patterns | Architecture doc in dev/logs/ or dev/slices/ |
| **Implement** | project-state.md, architecture doc | llm-dev-context.md, values-schema.md | Code + tests, implementation doc |
| **Backend** | project-state.md, slice architecture | values-schema.md (for DB) | API routes + Prisma schema |
| **Frontend** | project-state.md, slice architecture | llm-dev-context.md (UX principles) | Components + pages |
| **Agent-Logic** | project-state.md, slice architecture | values-schema.md, the-art-of-vibes.md | Prompts in playbooks/, matching logic |
| **QA** | project-state.md, ticket (acceptance criteria), implementation artifacts | All test artifacts | Validation report in dev/logs/ or dev/swarms/ |
| **Review** | project-state.md, architecture, implementation | llm-dev-context.md (conventions) | Review report with approve/revise |
| **Debug** | project-state.md, error logs, relevant code | Recent changes | Fix + debug report in dev/logs/ |

---

## Session Start Protocol

**At the beginning of EVERY session, run:**

```
Read /Users/don/Projects/matchmade/dev/project-state.md and summarize:
1. What phase are we in?
2. What was the last completed task?
3. Who should I activate (which role)?
4. What artifacts do I need to read?
5. Are there any blockers?
```

**If starting a new feature:**
```
Read:
- dev/project-state.md (current state)
- .context/session-logs/ (latest 5 files)
- dev/tickets/ (existing tickets)
- dev/slices/ (active slices)

Summarize current progress and recommend next steps.
```

---

## Session End Protocol

**At the end of EVERY session, update:**

1. **Update this file (project-state.md)**
   - Update "Active Work" section
   - Add entry to "Recent Handoffs"
   - Update "Next Up" section
   - Update blockers if any

2. **Create session log**
   - For single-dev: `dev/logs/[feature]-[role]-[date].md`
   - For swarm: `dev/swarms/[slice-name]-[date].md`
   - Overall session: `.context/session-logs/[feature]-[date].md`

3. **Update ticket/slice status**
   - Mark completed items
   - Note any deviations or follow-ups

4. **Explicit handoff**
   - State which role/agent should continue next
   - List what they need to read
   - Note any context they should know

---

## Notes

- **Stateless Sessions:** Each session starts fresh. This file is the single source of truth.
- **Session Logs:** Historical record in `.context/session-logs/`
- **Tickets:** Work definitions in `dev/tickets/`
- **Slices:** Swarm work contracts in `dev/slices/`
- **This File:** Current state, active work, next steps

**Update this file frequently.** It's the bridge between stateless sessions.

---

## Quick Commands

### Starting a session
```bash
# Option 1: Feature work
"What feature should I work on next? Read dev/project-state.md"

# Option 2: Continue existing work
"Continue from where we left off. Read dev/project-state.md and latest session log."

# Option 3: Debug/fix
"Read dev/project-state.md. I found a bug: [description]"
```

### Ending a session
```bash
# Update state and log
"Update dev/project-state.md with what we accomplished, who's next, and what they need to read."

# Create handoff
"Create a handoff note for the next agent in dev/project-state.md"
```

---

## Directory Structure (2025-12-22)

```
/Users/don/Projects/matchmade/
├── .context/              # Product docs (briefs, values, northstar)
├── .claude/               # Root Claude config (context.md, settings)
├── dev/                   # Project management (SINGLE SOURCE OF TRUTH)
│   ├── project-state.md   # Current state, handoffs, next steps
│   ├── roles/             # 12 role definitions
│   ├── protocols/         # single-dev.md, swarm-dev.md
│   ├── logs/              # Architecture documents
│   ├── tickets/           # All tickets (old + new)
│   ├── slices/            # Swarm slice contracts
│   └── swarms/            # Swarm execution logs
└── web/                   # Next.js application
    ├── .claude/agents/    # Agent definitions (feature-planner, product-manager)
    ├── app/               # Next.js app directory
    ├── prisma/            # Database schema
    └── ...
```

**Note:** `web/dev/` was consolidated into root `dev/` on 2025-12-22. All project management files are now in `/Users/don/Projects/matchmade/dev/`.

---

**Remember:** This file should be updated at the end of EVERY session. It's how context transfers between stateless agents.
