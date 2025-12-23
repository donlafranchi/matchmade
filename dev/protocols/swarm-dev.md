# Swarm Protocol (ARCHIVED - Not Currently Used)

**Note:** This workflow is archived. The project currently uses a simplified single-branch workflow (see `single-dev.md`) for solo development. This document is preserved for potential future use if parallel development becomes necessary or the team grows.

**Last Used:** December 2025
**Status:** Archived
**Reason:** Solo development - branching and parallel work overhead not justified

---

## When to Use
- Large features spanning multiple areas (backend + frontend + AI logic)
- Complex integrations requiring specialist expertise
- Features that benefit from parallel work across stack layers
- Vertical slice development with clear contracts
- When enforcing strict budgets and boundaries is important

## Not Suitable For
- Small features that can be done quickly by one developer
- Simple bug fixes
- Documentation updates
- Quick refactoring tasks

---

## Philosophy

Swarm development breaks large features into **vertical slices** with clear contracts. Each slice is implemented by multiple specialized agents working in parallel or sequence, with explicit handoffs between roles.

**Key Principles:**
- **Contract-first**: Architect defines all interfaces before implementation
- **Budget-constrained**: Enforce limits to prevent scope creep
- **Specialist roles**: Each agent focuses on their domain expertise
- **Clear handoffs**: Well-defined inputs/outputs between roles
- **Parallel work**: Backend and Frontend can work simultaneously once contracts are set

---

## Budgets (Strictly Enforced)

Every slice must stay within these limits:

- **≤ 400 LOC** (lines of code) per slice
- **≤ 2 new dependencies** added
- **≤ 1 new database table** (or significant schema change)

**Why?**
- Keeps slices small and reviewable
- Prevents feature creep
- Ensures fast iteration cycles
- Makes debugging easier
- Reduces merge conflicts

**If you exceed budgets:**
- Break the feature into multiple slices
- Defer non-essential parts
- Simplify the approach

---

## Workflow Overview

```
Feature Planner → Architect → [Backend + Frontend + Agent-Logic (parallel)] → QA
```

**Handoff points:**
1. Feature Planner → Architect: Ticket with acceptance criteria
2. Architect → Specialists: Contract document with all interfaces
3. Specialists → QA: Implemented code + tests
4. QA → Complete: Validated slice ready to merge

---

## Session Flow

### Phase 1: Planning (Feature Planner)

**Activate Role:** `dev/roles/feature-planner.md`

**Prerequisites:**
- **Read `dev/project-state.md`** (ALWAYS START HERE - current state, what's next)
- Read `.context/llm-dev-context.md` (build order)
- Read relevant brief from `.context/briefs/[step].md`
- Read latest session logs (if needed for deeper context)
- Check existing tickets in `dev/tickets/`
- Check existing slices in `dev/slices/`

**Tasks:**
1. Identify next feature from build order
2. Define acceptance criteria
3. List technical dependencies
4. Identify blockers or readiness issues
5. Create test plan
6. Estimate if feature fits in one slice or needs multiple

**Output:**
Create ticket: `dev/tickets/slice-[N]-[feature-name].md`

```markdown
# Slice [N]: [Feature Name]

## Goal
[1-2 sentence description]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Dependencies
- Slice X must be complete
- Feature Y must exist
- Table Z must be in schema

## Constraints
- ≤ 400 LOC
- ≤ 2 deps
- ≤ 1 table
- Must maintain [specific product principle]

## Test Plan
1. Test scenario 1
2. Test scenario 2
3. Test scenario 3

## Readiness
- [x] All dependencies met
- [x] Brief exists
- [x] No blockers
```

**Hand off to:** Architect

---

### Phase 2: Architecture (Architect)

**Activate Role:** `dev/roles/architect.md` (swarm mode)

**Prerequisites:**
- Read `dev/project-state.md` (current state)
- Read `dev/tickets/slice-[N]-[feature-name].md`
- Read `.context/llm-dev-context.md` (product constraints)
- Read `.context/values-schema.md` (data model)
- Review existing codebase patterns
- Verify budgets are achievable

**Tasks:**
1. Define all contracts (no implementation):
   - **API routes**: Method, path, request/response types
   - **Database changes**: Prisma models, fields, relations
   - **Events/Messages**: What gets emitted, when, with what payload
   - **Config flags**: Feature flags or environment variables
2. Identify non-goals (what's explicitly out of scope)
3. Note risks, open questions, or uncertainties
4. Verify budgets are respected

**Do NOT:**
- Write any implementation code
- Add features not in the ticket
- Exceed budgets

**Output:**
Create directory: `dev/slices/slice-[N]-[feature-name]/`
Create file: `dev/slices/slice-[N]-[feature-name]/architecture.md`

```markdown
# Architecture: Slice [N] - [Feature Name]

## Overview
[High-level approach in 2-3 sentences]

## Contracts

### API Routes
**POST /api/endpoint**
- Request: `{ field: string, field2: number }`
- Response: `{ success: boolean, data: TypeName }`
- Logic: [What happens when called]

### Database Changes
\`\`\`prisma
model NewModel {
  id        String   @id @default(cuid())
  field     String
  createdAt DateTime @default(now())
}
\`\`\`

### Events Emitted
- `event.name` with payload `{ userId: string, action: string }`

### Config Flags
- `FEATURE_ENABLED` - boolean flag to enable feature

## File Structure
\`\`\`
web/app/api/endpoint/route.ts
web/components/FeatureComponent.tsx
web/types/feature.ts
prisma/schema.prisma (update)
\`\`\`

## Integration Points
- Connects to existing API at [location]
- Calls service function from [module]
- Updates UI component at [path]

## Non-Goals
- Feature X is deferred to next slice
- Optimization Y is out of scope
- Edge case Z will be handled later

## Budgets
- Estimated LOC: ~350
- New deps: 1 (library-name)
- New tables: 1 (NewModel)

## Risks/Questions
- [Any uncertainties or decisions needed]
```

**Hand off to:** Backend, Frontend, Agent-Logic (in parallel)

---

### Phase 3: Implementation (Specialists)

#### Backend Role

**Activate Role:** `dev/roles/backend.md`

**Prerequisites:**
- Read `dev/slices/slice-[N]-[feature-name]/architecture.md`
- Read `.context/values-schema.md` for schema references

**Tasks:**
1. Implement API routes per contract
2. Implement database schema changes (Prisma)
3. Write API tests (unit + integration)
4. Stay within budget (≤400 LOC, ≤2 deps, ≤1 table)
5. Do NOT change UI or add features not in contract

**Output:**
- API routes implemented
- Database migrations created
- Tests written and passing
- Log work in `dev/swarms/slice-[N]-[date].md` (Backend section)

```markdown
### Backend Implementation

**Files Changed:**
- `web/app/api/endpoint/route.ts` - Implemented POST handler
- `prisma/schema.prisma:45-52` - Added NewModel

**Tests:**
- `web/app/api/endpoint/route.test.ts` - 8 tests, all passing

**Deviations:**
- None

**LOC Count:** 285
```

---

#### Frontend Role

**Activate Role:** `dev/roles/frontend.md`

**Prerequisites:**
- Read `dev/slices/slice-[N]-[feature-name]/architecture.md`
- Read `.context/llm-dev-context.md` for UX principles (calm, honest, values-first)

**Tasks:**
1. Implement components per contract
2. Implement state management
3. Connect to API endpoints (per contract)
4. Write component tests
5. Stay within budget
6. Follow UX principles: calm UI, honest messaging, no overpromising
7. Do NOT change API contracts without architect approval

**Output:**
- Components implemented
- State management wired
- Tests written and passing
- Log work in `dev/swarms/slice-[N]-[date].md` (Frontend section)

```markdown
### Frontend Implementation

**Files Changed:**
- `web/components/FeatureComponent.tsx` - Main component
- `web/app/feature/page.tsx` - Page wrapper
- `web/hooks/useFeature.ts` - State hook

**Tests:**
- `web/components/FeatureComponent.test.tsx` - 6 tests, all passing

**UX Notes:**
- Followed calm UI principles (whitespace, quiet tone)
- Messaging is honest (no overpromising)

**Deviations:**
- None

**LOC Count:** 220
```

---

#### Agent-Logic Role (If Applicable)

**Activate Role:** `dev/roles/agent-logic.md`

**Prerequisites:**
- Read `dev/slices/slice-[N]-[feature-name]/architecture.md`
- Read `.context/values-schema.md` (matching/extraction logic)
- Read `.context/vibes.md` (chemistry philosophy)
- Check `playbooks/profile-schema.json`

**Tasks:**
1. Implement profile extraction prompts
2. Implement matching/scoring logic
3. Implement conversational flows
4. Store prompts/playbooks in `playbooks/` directory
5. Stay within budget
6. Do NOT alter DB schema or touch frontend styling

**Output:**
- AI logic implemented
- Prompts stored in playbooks/
- Tests written and passing
- Log work in `dev/swarms/slice-[N]-[date].md` (Agent-Logic section)

```markdown
### Agent-Logic Implementation

**Files Changed:**
- `web/lib/extraction/profile.ts` - Extraction logic
- `playbooks/extraction-profile-v1.md` - Prompt template

**Tests:**
- `web/lib/extraction/profile.test.ts` - 5 tests, all passing

**Deviations:**
- None

**LOC Count:** 180
```

---

### Phase 4: QA (Quality Assurance)

**Activate Role:** `dev/roles/qa.md`

**Prerequisites:**
- Read `dev/tickets/slice-[N]-[feature-name].md` (acceptance criteria)
- Read `dev/slices/slice-[N]-[feature-name]/architecture.md`
- Read all implementation logs from `dev/swarms/slice-[N]-[date].md`
- Access to implemented code

**Tasks:**
1. Review acceptance criteria from ticket
2. Run all automated tests
3. Perform manual testing (checklist)
4. Validate against product principles:
   - Honest UX (no overpromising chemistry)
   - Calm UI (whitespace, quiet tone)
   - Values-first approach
5. Check for security issues (XSS, injection, etc.)
6. Verify budgets were respected
7. Create validation report

**Output:**
Log in `dev/swarms/slice-[N]-[date].md` (QA section)

```markdown
### QA Validation

**Acceptance Criteria:**
- [x] Criterion 1 - Verified
- [x] Criterion 2 - Verified
- [x] Criterion 3 - Verified

**Automated Tests:**
- Unit tests: 19/19 passing
- Integration tests: 5/5 passing
- Component tests: 6/6 passing

**Manual Testing:**
- [x] Happy path works
- [x] Edge case X handled
- [x] Error handling correct

**Product Principles:**
- [x] Honest messaging (no overpromising)
- [x] Calm UI (whitespace, quiet tone)
- [x] Values-first approach maintained

**Security Review:**
- [x] No XSS vulnerabilities
- [x] No SQL injection risks
- [x] Input validation present

**Budget Verification:**
- LOC: 285 + 220 + 180 = 685 ⚠️ OVER BUDGET
- New deps: 1 ✓
- New tables: 1 ✓

**Verdict:**
- ⚠️ Need to reduce LOC by ~285 lines
- OR split into two slices

**Blockers:**
- [Any issues preventing merge]
```

**Hand off to:**
- If passed: Ready to merge
- If failed: Back to relevant specialist role to fix issues

---

## Update Project State & Handoff

**After QA completes, update `dev/project-state.md`:**

1. **Mark slice complete in "Active Work":**
   - Clear all role owners
   - Mark status as complete

2. **Add handoff entry in "Recent Handoffs":**
   ```markdown
   ### YYYY-MM-DD: Slice [N] - [Feature Name] Complete
   - **From:** QA (swarm complete)
   - **To:** [Next Role/Agent or "Ready for next feature"]
   - **Artifacts:**
     - `dev/tickets/slice-[N]-[feature-name].md`
     - `dev/slices/slice-[N]-[feature-name]/architecture.md`
     - `dev/swarms/slice-[N]-[date].md`
     - `.context/session-logs/slice-[N]-[date].md`
     - Code files: [list key files]
   - **Status:** ✅ Complete
   - **Next:** [Specific next step]
   ```

3. **Update "Next Up" section:**
   - What feature/slice is next?
   - Feature Planner to plan next work

4. **Update "Build Order Progress":**
   - Check off completed brief
   - Update percentage complete

5. **Create session log:**
   - `.context/session-logs/slice-[N]-[feature-name]-[date].md`
   - High-level summary of slice work
   - Link to swarm log and artifacts

---

## Progress Tracking

### Before Starting Swarm Session:
**ALWAYS read `dev/project-state.md` first to understand:**
- Current phase and build order progress
- Active work (who's working on what)
- Recent completions (what just finished)
- Next up (what's ready to build)
- Blockers and dependencies

**Then check supporting context:**
1. Read latest 5 session logs from `.context/session-logs/` (if needed)
2. Check all tickets in `dev/tickets/` (what's planned)
3. Check all slices in `dev/slices/` (what's in progress)
4. Summarize current state

### During Swarm Session:
Each role logs their work in:
`dev/swarms/slice-[N]-[date].md`

Format:
```markdown
# Swarm Log: Slice [N] - [Feature Name]

**Date:** YYYY-MM-DD
**Ticket:** dev/tickets/slice-[N]-[feature-name].md
**Architecture:** dev/slices/slice-[N]-[feature-name]/architecture.md

---

## Architect
[Architect's output]

---

## Backend
[Backend's output]

---

## Frontend
[Frontend's output]

---

## Agent-Logic
[Agent-Logic's output]

---

## QA
[QA's output]

---

## Summary
- Status: [Complete/Blocked/In Progress]
- Budget: [Within/Over]
- Blockers: [None/List]
- Next steps: [What's next]
```

### After Completing Swarm Session:
1. Create session log in `.context/session-logs/slice-[N]-[feature]-[date].md`
2. Update ticket status in `dev/tickets/`
3. Update slice README in `dev/slices/slice-[N]-[feature-name]/README.md`
4. Note any follow-ups or next slices needed

---

## Role Handoff Rules

### Sequential Handoffs:
- Feature Planner → Architect (ticket → contract)
- Architect → Backend/Frontend/Agent-Logic (contract → implementation)
- All Specialists → QA (code → validation)

### Parallel Work:
- Backend, Frontend, and Agent-Logic can work **simultaneously** once Architect completes contracts
- They must NOT modify each other's domains
- They must follow contracts exactly

### Communication:
- If a specialist discovers contract issues, flag in implementation log
- Architect can be recalled to revise contracts if needed
- QA has final authority on acceptance

---

## Example Swarm Session

**Feature:** "Slice 3: Profile Extraction from Chat"

### Step 1: Feature Planner
```
Read:
- .context/briefs/03-derived-profile.md
- Latest session logs
- Current tickets

Output:
- dev/tickets/slice-3-profile-extraction.md (acceptance criteria, dependencies, test plan)
```

### Step 2: Architect
```
Read:
- dev/tickets/slice-3-profile-extraction.md
- .context/values-schema.md

Output:
- dev/slices/slice-3-profile-extraction/architecture.md
  - Contract: POST /api/chat/extract
  - Contract: DerivedProfile model
  - Contract: Extraction function signature
  - File structure
  - Budgets: ~350 LOC, 1 dep (ai-sdk), 1 table
```

### Step 3: Parallel Implementation
**Backend:**
```
- Implement POST /api/chat/extract
- Add DerivedProfile table to schema
- Write API tests
- Log in dev/swarms/slice-3-2025-12-20.md (Backend section)
```

**Frontend:**
```
- Create ProfilePreview component
- Add /profile/preview page
- Wire to API
- Write component tests
- Log in dev/swarms/slice-3-2025-12-20.md (Frontend section)
```

**Agent-Logic:**
```
- Implement extraction logic using values-schema.md
- Create prompt in playbooks/extraction-profile-v1.md
- Write extraction tests
- Log in dev/swarms/slice-3-2025-12-20.md (Agent-Logic section)
```

### Step 4: QA
```
Read:
- dev/tickets/slice-3-profile-extraction.md (acceptance criteria)
- dev/swarms/slice-3-2025-12-20.md (all implementations)

Validate:
- All acceptance criteria met
- Tests passing
- Product principles followed
- Budgets respected

Output:
- QA section in dev/swarms/slice-3-2025-12-20.md
- Verdict: ✅ Ready to merge
```

---

## Quick Reference

**Start Swarm Session:**
```
1. Feature Planner: Create ticket
2. Architect: Define contracts
3. Backend + Frontend + Agent-Logic: Implement in parallel
4. QA: Validate and approve
```

**Key Principles:**
- Contract-first development
- Strict budget enforcement (≤400 LOC, ≤2 deps, ≤1 table)
- Specialist roles with clear boundaries
- Parallel work where possible
- Comprehensive logging in swarm logs

**When Budgets Are Exceeded:**
- Break into multiple slices
- Defer non-essential parts
- Simplify approach

---

End of Swarm Protocol
