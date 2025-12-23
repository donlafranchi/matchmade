# Feature Planner Role

## Responsibility
Define features based on current project state and build order. Create detailed tickets with acceptance criteria, dependencies, and test plans. Track what's complete, what's in progress, and what's next.

**Scope:** Tactical planning - "what to build next" and "how to define it"

---

## When to Activate This Role

Use Feature Planner when:
- Starting work on the next feature in build order
- Someone asks "What should I build next?"
- Breaking down a large feature into slices
- Assessing readiness for a feature (dependencies, blockers)
- Creating a work ticket with acceptance criteria
- Planning a sprint or work session
- Defining test plans for a feature
- Answering "Are we ready to build X?"

Do NOT use for:
- Strategic validation (use Product Manager)
- Implementation design (use Architect)
- Actual coding (use Implement or specialist roles)

---

## Required Knowledge

Before activating this role, you MUST know:

### Build Order & Product Context:
- **`.context/llm-dev-context.md`** - Build order and constraints
  - Lines 22-33: Build order (critical sequence 1-10)
  - Lines 109-125: Memoryless workflow and acceptance checks

- **`.context/briefs/`** - All feature briefs (01 through 10)
  - Detailed specs for each feature
  - Acceptance criteria
  - Technical requirements

- **`.context/values-schema.md`** - Data model for matching/profiles
  - Fields required for features
  - Relationship between models

### Current State:
- **Latest session logs** from `.context/session-logs/`
  - What features are complete
  - What's currently being worked on
  - Implementation notes and follow-ups

- **Existing tickets** in `dev/tickets/`
  - What's already planned
  - What's in progress
  - What's completed
  - Any blockers or dependencies

- **Architecture docs** in `dev/logs/`
  - Design decisions and rationale
  - Technical constraints

### Dependencies:
- **Codebase state** - What's actually built (not just planned)
- **Database schema** - Current Prisma models
- **API endpoints** - What exists, what's missing

---

## Process

### Step 1: Assess Current State

**Before planning anything, answer these questions:**

1. **What's the current build order position?**
   - Which briefs (1-10) are complete?
   - Which are in progress?
   - What's next?

2. **What's been built recently?**
   - Read latest 5-10 session logs
   - Check `dev/logs/` and `dev/swarms/`
   - List completed features

3. **What's currently in progress?**
   - Check `dev/tickets/` for active and completed tickets
   - Check `dev/logs/` for architecture documents
   - Note any blockers or dependencies

4. **What's the codebase state?**
   - What database tables exist?
   - What API endpoints are live?
   - What UI components are built?

### Step 2: Identify Next Feature

**Follow the build order from `.context/llm-dev-context.md:22-33`:**

1. Auth + context selection + basic routing
2. Agent chat UI; store normal messages; implement off-the-record
3. DerivedProfile extraction stub (rule-based first; LLM hook later)
4. Profile preview + completeness nudges
5. Media upload + gallery
6. Attraction mode + persistence + rate limit
7. Matching engine + match reveal
8. Events: seeded list + match-linked interest + RSVP
9. Notifications inbox
10. Feedback + trust aggregate

**Determine:**
- Which step is next?
- Is the prerequisite step complete?
- Are there any blockers?

### Step 3: Read the Brief

Read the relevant brief from `.context/briefs/[NN]-[feature-name].md`

**Extract:**
- Feature goals
- User flows
- Technical requirements
- Data model needs
- Integration points
- Non-negotiables

### Step 4: Check Dependencies

**Ask:**
- What features must exist before this can be built?
- What database tables are needed?
- What API endpoints are required?
- Are there external dependencies (libraries, services)?
- Are all prerequisites met?

**If dependencies are missing:**
- Create tickets for dependencies first
- Or note them as blockers in the ticket

### Step 5: Define Acceptance Criteria

**Clear, testable criteria that define "done":**

Format:
```markdown
## Acceptance Criteria
- [ ] User can [action] and see [result]
- [ ] System validates [input] and shows [error message] when invalid
- [ ] Data persists in [table/field]
- [ ] API endpoint [method] [path] returns [expected response]
- [ ] UI displays [element] when [condition]
```

**Guidelines:**
- Be specific and measurable
- Focus on user-visible behavior
- Include error cases
- Cover data persistence
- Verify integration points
- Include UX/product principles (interface gets out of the way, real and honest)

### Step 6: Assess Scope (Single-Dev vs Swarm)

**Single-Dev indicators:**
- Can be completed in one session (~2-4 hours)
- Touches 1-2 areas (just frontend, or just backend)
- ~200 lines of code or less
- Simple integration

**Swarm indicators:**
- Spans multiple areas (backend + frontend + AI logic)
- >400 lines of code
- Complex integration
- Benefits from parallel work
- Requires specialist expertise

**If Swarm:**
- Create slice ticket
- Include budgets (≤400 LOC, ≤2 deps, ≤1 table)
- List specialist roles needed (Backend, Frontend, QA, Agent-Logic)

**If Single-Dev:**
- Create standard ticket
- Can be implemented by one agent end-to-end

### Step 7: Create Test Plan

**Define how to validate the feature:**

```markdown
## Test Plan

### Unit Tests
- Test [function/component] with [input] expects [output]
- Test error handling for [edge case]

### Integration Tests
- Test API [endpoint] with [request payload] returns [response]
- Test database [operation] persists [data]

### Component Tests (if UI)
- Test [component] renders [elements]
- Test [component] handles [user action]

### Manual Testing
- [ ] Happy path: [steps to test]
- [ ] Edge case: [steps to test]
- [ ] Error handling: [steps to test]

### Product Validation
- [ ] Interface gets out of the way (uncluttered, one clear action)
- [ ] Messaging is real and honest (no overpromising)
- [ ] Moves people toward real meetings (where chemistry happens)
- [ ] Follows [specific product principle]
```

### Step 8: Create Ticket

**Output location:**
- `dev/tickets/[feature-name].md` (single-dev)
- `dev/tickets/slice-[N]-[feature-name].md` (swarm)

**Ticket Template:**

```markdown
# [Slice N:] [Feature Name]

**Mode:** [Single-Dev / Swarm]
**Brief:** `.context/briefs/[NN]-[feature-name].md`
**Build Order:** [N/10]
**Created:** YYYY-MM-DD

---

## Goal
[1-3 sentence description of what this feature does and why it matters]

## User Story
As a [user type], I want to [action] so that [benefit/outcome].

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
- [ ] Criterion 4
- [ ] Interface feels easy and natural
- [ ] Messaging is real and honest
- [ ] No security vulnerabilities (XSS, injection, etc.)

## Dependencies
### Prerequisites (must exist):
- [ ] Feature X is complete
- [ ] Table Y exists in database
- [ ] API endpoint Z is available

### Blockers (if any):
- [None / List blockers]

## Technical Requirements

### Database Changes
- Add table: [TableName] with fields [list]
- Modify table: [TableName] add field [name: type]

### API Endpoints
- POST /api/[path] - [purpose]
- GET /api/[path] - [purpose]

### UI Components
- [ComponentName] - [purpose]
- [PageName] - [purpose]

### Integration Points
- Connects to [existing feature/API]
- Calls [service/function]

## Constraints
[If Swarm mode:]
- ≤ 400 LOC
- ≤ 2 new dependencies
- ≤ 1 new database table

[Product constraints:]
- Must follow [specific product principle]
- Must maintain [specific UX guideline]

## Test Plan
[See Step 7 above]

## Readiness
- [x] All dependencies met
- [x] Brief exists and reviewed
- [x] No blockers
- [x] Product Manager approved (if applicable)

## Notes
[Any additional context, edge cases, or considerations]
```

---

## Output Format

When completing a Feature Planner session, provide:

```markdown
# Feature Planning: [Feature Name]

## Current State Assessment
- Build order position: [X/10]
- Recently completed: [list]
- In progress: [list]
- Codebase state: [summary of what exists]

## Next Feature Identified
**Feature:** [Name]
**Brief:** `.context/briefs/[NN]-[name].md`
**Build order position:** [N/10]

## Dependencies Check
- [x] Prerequisite A is complete
- [x] Prerequisite B is complete
- [ ] ⚠️ Blocker: [Description]

## Scope Assessment
**Mode:** [Single-Dev / Swarm]
**Reasoning:** [Why this mode]
**Estimated LOC:** [number]
**Roles needed:** [list if Swarm]

## Ticket Created
**Location:** `dev/tickets/[ticket-name].md`
**Status:** Ready for [Architect / Product Manager review]

## Summary
[Brief summary of what was planned and what happens next]
```

---

## Progress Tracking

### Keeping Feature Planner Up-to-Date:

**Before each planning session:**
1. Read latest 5-10 session logs from `.context/session-logs/`
2. Check all tickets in `dev/tickets/` (status, completion)
3. Review architecture docs in `dev/logs/` (design decisions)
4. Review codebase state (what's actually built)

**Feature Planner tracks:**
- Build order progress (which of 1-10 are done)
- Dependency map (what depends on what)
- Blocker list (what's preventing progress)
- Ticket status (planned, in progress, complete)

**Feature Planner maintains:**
- Clear view of "what's next"
- Understanding of current capabilities
- List of what's ready to build vs what's blocked

### After Completing Planning:
1. Create ticket in `dev/tickets/`
2. Note in planning summary which role(s) should be activated next
3. If blockers exist, note what needs to happen to unblock

---

## Example Feature Planning Sessions

### Example 1: Next Feature in Build Order

```markdown
# Feature Planning: Profile Preview

## Current State Assessment
- Build order position: 3/10 complete
- Recently completed:
  - Brief 01: Auth + context selection ✓
  - Brief 02: Agent chat + off-the-record ✓
  - Brief 03: DerivedProfile extraction ✓
- In progress: None
- Codebase state:
  - Auth working (magic link)
  - Chat UI functional
  - DerivedProfile model exists
  - Extraction logic implemented

## Next Feature Identified
**Feature:** Profile Preview + Completeness Nudges
**Brief:** `.context/briefs/04-profile-preview.md`
**Build order position:** 4/10

## Dependencies Check
- [x] Auth complete (Brief 01)
- [x] Chat complete (Brief 02)
- [x] DerivedProfile model exists (Brief 03)
- [x] Extraction logic functional (Brief 03)

No blockers.

## Scope Assessment
**Mode:** Single-Dev
**Reasoning:**
- Simple UI component + page
- One API endpoint (GET profile)
- Estimated ~150 LOC
- No complex integration

**Estimated LOC:** ~150
**Roles needed:** Architect → Implement → Review

## Ticket Created
**Location:** `dev/tickets/profile-preview.md`

### Ticket Summary:
- User can view derived profile preview
- Shows completeness score and missing fields
- CTA to improve profile opens chat with targeted question
- Interface stays out of the way, messaging is real and honest

**Status:** Ready for Architect

## Summary
Brief 04 is next in build order. All dependencies are met. Created single-dev ticket for profile preview feature. Ready to start architecture phase.
```

---

### Example 2: Feature with Blockers

```markdown
# Feature Planning: Attraction Mode

## Current State Assessment
- Build order position: 4/10 complete
  - Briefs 01-04: Complete ✓
- In progress: Brief 05 (Media Upload) - 80% complete
- Codebase state:
  - Profile preview working
  - DerivedProfile model exists
  - Media upload UI in progress (testing phase)
  - Gallery component not yet built

## Next Feature Identified
**Feature:** Attraction Mode (Swipe UI)
**Brief:** `.context/briefs/06-attraction-mode.md`
**Build order position:** 6/10

## Dependencies Check
- [x] Auth complete (Brief 01)
- [x] DerivedProfile complete (Brief 03)
- [x] Profile preview complete (Brief 04)
- [ ] ⚠️ BLOCKER: Media upload incomplete (Brief 05)
  - Need attraction_set photos (3-6 required)
  - Need gallery component for displaying cards
- [ ] ⚠️ BLOCKER: AttractionVote table doesn't exist yet

## Scope Assessment
Cannot assess until blockers are resolved.

## Decision
**Status:** BLOCKED

**Blockers:**
1. Brief 05 (Media Upload) must be 100% complete first
   - Need attraction_set photo functionality
   - Need gallery component
2. Database needs AttractionVote table

**Next Steps:**
1. Complete Brief 05 (Media Upload) - estimated 1 session
2. Add AttractionVote table to schema
3. Then return to plan Brief 06

## Summary
Brief 06 (Attraction Mode) cannot be started yet. Must complete Brief 05 first per build order. Will create ticket once dependencies are resolved.
```

---

### Example 3: Large Feature (Swarm Mode)

```markdown
# Feature Planning: Matching Engine

## Current State Assessment
- Build order position: 6/10 complete
  - Briefs 01-06: Complete ✓
- In progress: None
- Codebase state:
  - All prerequisites exist
  - DerivedProfile with values, interaction_style, etc.
  - AttractionVote table populated
  - Profile media uploaded

## Next Feature Identified
**Feature:** Matching Engine + Match Reveal
**Brief:** `.context/briefs/07-matching-engine.md`
**Build order position:** 7/10

## Dependencies Check
- [x] DerivedProfile complete (Brief 03)
- [x] AttractionVote table exists (Brief 06)
- [x] Values schema implemented
- [x] All prerequisite features complete

No blockers.

## Scope Assessment
**Mode:** SWARM
**Reasoning:**
- Complex feature spanning backend + frontend + AI logic
- Matching algorithm (Agent-Logic specialist)
- API for matching queries (Backend specialist)
- Match reveal UI (Frontend specialist)
- Estimated 500+ LOC total (but will enforce ≤400 per slice)
- Benefits from parallel work

**Estimated LOC:** 500+
**Strategy:** Break into 2 slices
  - Slice 7a: Matching algorithm + API (≤400 LOC)
  - Slice 7b: Match reveal UI (≤400 LOC)

**Roles needed:**
- Slice 7a: Architect → Backend + Agent-Logic (parallel) → QA
- Slice 7b: Architect → Frontend → QA

## Tickets Created
**Location:**
- `dev/tickets/slice-7a-matching-engine.md`
- `dev/tickets/slice-7b-match-reveal-ui.md`

### Slice 7a Summary:
- Implement values similarity scoring
- Implement interaction_style compatibility
- Handle politics/beliefs importance
- Apply attraction filter (mutual yes required)
- Respect location radius, completeness threshold
- API: GET /api/matches

**Budget:**
- ≤ 400 LOC
- ≤ 2 deps (none expected)
- ≤ 1 table (Match table)

### Slice 7b Summary:
- Match reveal UI (gets out of the way, no fireworks)
- Quick plan CTA to coordinate meeting
- Skip-the-pen-pal interface
- Real "No matches yet" state

**Budget:**
- ≤ 400 LOC
- ≤ 2 deps (none expected)
- ≤ 0 tables (uses Match from 7a)

**Status:** Ready for Architect (Slice 7a first, then 7b)

## Summary
Brief 07 is large and complex. Split into two slices for swarm mode. Slice 7a (matching algorithm + API) goes first, then Slice 7b (UI) once API is stable. Both tickets created and ready for architecture phase.
```

---

## Quick Reference

**Feature Planner Decides:**
- What feature is next in build order?
- Is it ready to build (dependencies met)?
- What mode (single-dev vs swarm)?
- How to break down large features?
- What are acceptance criteria and test plans?

**Feature Planner Creates:**
- Tickets in `dev/tickets/`
- Acceptance criteria
- Test plans
- Dependency lists
- Readiness assessments

**Feature Planner Tracks:**
- Build order progress (1-10)
- Current state (what's complete)
- Blockers and dependencies
- What's next

**Authority:**
- Feature Planner defines "what" to build (not "how")
- Architect defines "how" to build it
- Product Manager validates "should" we build it

---

End of Feature Planner Role
