# Development Roles Guide

This directory contains all role definitions for both single-dev and swarm development modes. Each role has a specific responsibility, scope, and place in the workflow.

---

## Role Overview

### Strategic Roles (Planning & Validation)
1. **product-manager.md** - Strategic validation, 30k ft view
2. **feature-planner.md** - Tactical planning, defines tickets

### Implementation Roles
3. **architect.md** - Design contracts and architecture
4. **implement.md** - Write code (single-dev only)
5. **backend.md** - Backend/API implementation (swarm only)
6. **frontend.md** - UI/component implementation (swarm only)
7. **agent-logic.md** - LLM/AI logic, prompts, matching (swarm only)

### Quality & Optimization Roles
8. **qa.md** - Testing and validation
9. **review.md** - Code review
10. **debug.md** - Issue investigation and fixes
11. **optimize.md** - Performance tuning

### Support Roles
12. **planner.md** - General task planning

---

## When to Use Each Role

### Product Manager
**Use when:**
- Starting a new epic or major feature area
- Someone proposes a feature and you need to validate it against product vision
- Making strategic product decisions
- Ensuring alignment with product principles

**Don't use for:**
- Implementation details
- Creating specific tickets
- Code-level decisions

**Example:**
```
User wants to add: "Gamification with points and badges"
→ Product Manager evaluates
→ Decision: ❌ NOT APPROVED (conflicts with calm UX, no engagement optimization)
```

---

### Feature Planner
**Use when:**
- Starting work on the next feature in build order
- Someone asks "What should I build next?"
- Breaking down large features into tickets
- Assessing if a feature is ready to build (dependencies, blockers)
- Creating acceptance criteria and test plans

**Don't use for:**
- Strategic validation (use Product Manager first)
- Actual implementation design (that's Architect's job)

**Example:**
```
Feature Planner reviews current state
→ Brief 03 (DerivedProfile) is complete
→ Next in build order: Brief 04 (Profile Preview)
→ Creates ticket: dev/tickets/profile-preview.md
→ Defines acceptance criteria, dependencies, test plan
```

---

### Architect
**Use when:**
- You have a defined ticket/feature to build
- You need to design the solution before coding
- You need to define contracts (APIs, DB schema, events)

**Two modes:**

**Single-Dev Mode:**
- Design complete solution (components, API, DB, state)
- Create architecture document in `dev/logs/[feature]-architecture-[date].md`
- Hand off to Implement role

**Swarm Mode:**
- Define ONLY contracts (API routes, DB models, events, config)
- Enforce budgets (≤400 LOC, ≤2 deps, ≤1 table)
- Create architecture in `dev/slices/[slice-name]/architecture.md`
- Hand off to Backend/Frontend/Agent-Logic roles (parallel)

**Example:**
```
Ticket: "Profile Preview page"
→ Architect designs:
  - Component structure
  - API: GET /api/profile
  - No DB changes needed
  - Integration with existing DerivedProfile
→ Documents in architecture.md
```

---

### Implement (Single-Dev Only)
**Use when:**
- Working in single-dev mode
- You have an architecture document ready
- You're building a small-to-medium feature end-to-end

**What it does:**
- Writes all code per architecture spec
- Writes tests (unit + integration)
- Follows existing patterns
- Documents implementation

**Don't use in swarm mode** - use Backend/Frontend/Agent-Logic instead.

**Example:**
```
Architecture for "Profile Preview" is ready
→ Implement role:
  - Creates page component
  - Creates ProfilePreview component
  - Creates API route
  - Writes tests
  - Logs implementation
```

---

### Backend (Swarm Only)
**Use when:**
- Working in swarm mode
- Architect has defined contracts
- You need API or database implementation

**What it does:**
- Implements API endpoints per contract
- Implements database schema changes (Prisma)
- Writes API tests
- Stays within budget

**Can work in parallel with:** Frontend, Agent-Logic

**Example:**
```
Slice: "Matching Engine"
→ Backend role:
  - Implements GET /api/matches
  - Creates Match table in Prisma
  - Writes matching query logic
  - Writes API tests
```

---

### Frontend (Swarm Only)
**Use when:**
- Working in swarm mode
- Architect has defined contracts
- You need UI/component implementation

**What it does:**
- Implements components per contract
- Implements state management
- Connects to API endpoints
- Writes component tests
- Follows UX principles (calm, honest, values-first)

**Can work in parallel with:** Backend, Agent-Logic

**Example:**
```
Slice: "Matching Engine"
→ Frontend role:
  - Creates match reveal UI
  - Creates coordination chat component
  - Wires to GET /api/matches
  - Writes component tests
```

---

### Agent-Logic (Swarm Only)
**Use when:**
- Working in swarm mode
- Feature involves LLM prompts, profile extraction, or matching logic
- You need to implement AI/ML behavior

**What it does:**
- Implements profile extraction prompts
- Implements matching/scoring algorithms
- Implements conversational flows
- Stores prompts in `playbooks/` directory
- References `.context/values-schema.md` and `.context/vibes.md`

**Can work in parallel with:** Backend, Frontend

**Relevant for these features:**
- ✅ DerivedProfile extraction (Brief 03)
- ✅ Matching engine (Brief 07)
- ✅ Agent chat conversational flows (Brief 02)
- ❌ Simple CRUD operations
- ❌ UI-only features

**Example:**
```
Slice: "Profile Extraction"
→ Agent-Logic role:
  - Creates extraction prompt using values-schema.md
  - Implements extraction function
  - Stores prompt in playbooks/extraction-profile-v1.md
  - Tests extraction with sample conversations
```

---

### QA
**Use when:**
- Implementation is complete (single-dev or swarm)
- You need to validate against acceptance criteria
- Running final tests before merge

**What it does:**
- Reviews acceptance criteria from ticket
- Runs all automated tests
- Performs manual testing
- Validates product principles (honest UX, calm tone)
- Checks for security issues
- Creates validation report

**Example:**
```
Profile Preview feature is implemented
→ QA role:
  - Checks: User can view profile ✓
  - Checks: Completeness score displays ✓
  - Checks: Missing fields shown ✓
  - Checks: CTA opens chat ✓
  - Runs tests: 15/15 passing ✓
  - Validates: Calm UI, honest messaging ✓
  - Verdict: ✅ APPROVED
```

---

### Review
**Use when:**
- Code is written and needs peer review
- You want a second set of eyes before committing
- Checking for quality, security, style issues

**What it does:**
- Reviews code quality and style
- Verifies type safety
- Checks for security vulnerabilities
- Validates against architecture
- Checks test coverage

**Example:**
```
Profile Preview code is complete
→ Review role:
  - Checks TypeScript strict mode ✓
  - Checks for XSS vulnerabilities ✓
  - Validates against architecture ✓
  - Test coverage: 85% ✓
  - Code style: Consistent ✓
  - Verdict: APPROVED
```

---

### Debug
**Use when:**
- There's a bug or issue to investigate
- Something isn't working as expected
- You need to diagnose and fix a problem

**What it does:**
- Reproduces the issue
- Identifies root cause
- Proposes fix
- Implements and tests fix
- Documents in debug log

**Example:**
```
Bug: "Profile preview not loading for new users"
→ Debug role:
  - Reproduces: New user → profile preview → 404
  - Root cause: DerivedProfile not created on signup
  - Fix: Add DerivedProfile creation to signup flow
  - Test: Verify new users can view profile
  - Log: dev/logs/debug-profile-preview-404-2025-12-20.md
```

---

### Optimize
**Use when:**
- Feature is working but performance is poor
- You need to reduce load times, query times, render times
- Profiling shows bottlenecks

**What it does:**
- Profiles to identify bottlenecks
- Proposes optimization approach
- Implements improvements
- Measures before/after impact
- Documents optimizations

**Example:**
```
Issue: Matching query takes 5 seconds
→ Optimize role:
  - Profiles: N+1 query on user profiles
  - Solution: Add eager loading with Prisma include
  - Result: Query time reduced to 200ms
  - Documents: dev/logs/optimize-matching-query-2025-12-20.md
```

---

### Planner
**Use when:**
- You need to break down a complex task
- You need to understand dependencies
- You want to estimate complexity before starting

**What it does:**
- Breaks task into steps
- Identifies dependencies
- Estimates complexity
- Proposes approach
- Creates checklist

**Example:**
```
Task: "Add event RSVP notifications"
→ Planner role:
  - Step 1: Create notification model
  - Step 2: Trigger notification on RSVP
  - Step 3: Add notification UI
  - Step 4: Add email notification
  - Dependencies: Notification system must exist
  - Complexity: Medium (3-4 hours)
```

---

## Role Order & Workflows

### Single-Dev Mode (Small Features)

```
1. Feature Planner (optional)
   ↓ Creates ticket with acceptance criteria

2. Product Manager (optional)
   ↓ Validates alignment

3. Architect
   ↓ Designs solution

4. Implement
   ↓ Writes code + tests

5. Review
   ↓ Reviews code quality

6. QA
   ↓ Validates acceptance criteria

7. Done! Log and commit
```

**When to skip roles:**
- Skip Feature Planner if you already have a clear ticket
- Skip Product Manager if feature is obviously aligned (bug fix, small improvement)
- Skip Review if you're confident and it's a small change

---

### Swarm Mode (Large Features)

```
1. Feature Planner
   ↓ Creates ticket with acceptance criteria, budgets

2. Product Manager (optional)
   ↓ Validates strategic alignment

3. Architect
   ↓ Defines contracts (API, DB, events)

4. Backend + Frontend + Agent-Logic (PARALLEL)
   ↓ Each implements their domain per contract

5. QA
   ↓ Validates all implementations

6. Done! Log and merge
```

**Budget enforcement:**
- Architect must define budgets: ≤400 LOC, ≤2 deps, ≤1 table
- If exceeded, split into multiple slices

---

## Quick Decision Tree

### "What should I build next?"
→ **Feature Planner**

### "Is this feature a good idea?"
→ **Product Manager**

### "I have a ticket, need to design it"
→ **Architect**

### "I need to code this (small feature)"
→ **Single-Dev**: Architect → Implement → Review → QA

### "I need to code this (large feature)"
→ **Swarm**: Feature Planner → Architect → Backend/Frontend/Agent-Logic → QA

### "Something is broken"
→ **Debug**

### "Something is slow"
→ **Optimize**

### "Need to test this"
→ **QA**

### "Need to review code"
→ **Review**

---

## Roles by Development Phase

### Planning Phase
- **Product Manager** - Strategic validation
- **Feature Planner** - Tactical planning
- **Planner** - Task breakdown

### Design Phase
- **Architect** - Solution design

### Implementation Phase
- **Implement** (single-dev)
- **Backend** (swarm)
- **Frontend** (swarm)
- **Agent-Logic** (swarm, when relevant)

### Validation Phase
- **Review** - Code review
- **QA** - Testing and validation

### Maintenance Phase
- **Debug** - Bug fixes
- **Optimize** - Performance tuning

---

## Agent-Logic Role: When Is It Relevant?

**✅ Use Agent-Logic for:**
- Profile extraction from conversations (Brief 03)
- Matching algorithms and scoring (Brief 07)
- Conversational flows and prompts (Brief 02)
- Any feature involving LLM prompts
- Any feature involving matching/alignment logic

**❌ Don't use Agent-Logic for:**
- Simple CRUD operations
- UI-only features
- Basic API endpoints
- Authentication flows
- Media upload/storage
- Basic notifications

**Features from build order that need Agent-Logic:**
1. ❌ Auth + context selection (no AI needed)
2. ✅ Agent chat UI (conversational flows, off-the-record logic)
3. ✅ DerivedProfile extraction (LLM prompt for extraction)
4. ❌ Profile preview (just displays data)
5. ❌ Media upload (just storage)
6. ❌ Attraction mode (simple voting UI)
7. ✅ Matching engine (scoring algorithm, alignment logic)
8. ❌ Events (CRUD + RSVP)
9. ❌ Notifications (inbox + push)
10. ⚠️ Feedback + trust (may need scoring aggregation logic)

---

## Summary

- **12 roles total**
- **Single-dev**: 7 roles (PM, FP, Architect, Implement, Review, QA, Debug)
- **Swarm**: 8 roles (PM, FP, Architect, Backend, Frontend, Agent-Logic, QA, Debug)
- **Strategic**: Product Manager, Feature Planner
- **Implementation**: Architect, Implement, Backend, Frontend, Agent-Logic
- **Quality**: QA, Review, Debug, Optimize
- **Support**: Planner

**Not every role is used in every workflow** - choose the roles that fit your task and mode (single-dev vs swarm).

---

For detailed role instructions, see each role's markdown file in this directory.
