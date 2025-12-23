# Codex Development Context

## Project Overview
**Matchmade** - Values-first relationship builder (romantic + friendship)
- Stack: Next.js + TypeScript + Tailwind + Postgres + Prisma
- Approach: Easy, natural interface; gets out of your way; gets people meeting in real life where chemistry happens
- Development: Stateless, role-based, preserves session logs

---

## Directory Map

### Product Knowledge
- `.context/llm-dev-context.md` - Product essence, non-negotiables, stack
- `.context/northstar.md` - Product vision
- `.context/the-art-of-vibes.md` - Chemistry/attraction philosophy
- `.context/values-schema.md` - Matching approach

### Feature Briefs (Build Order)
- `.context/briefs/01-auth-and-context.md` through `10-feedback-trust.md`

### Development Operations
- `dev/protocols/` - single-dev.md, swarm-dev.md
- `dev/roles/` - All role definitions
- `dev/tickets/` - Work tickets
- `dev/slices/` - Vertical slice contracts (swarm mode)
- `dev/swarms/` - Swarm execution logs
- `dev/logs/` - Single-dev session logs
- `dev/brief/` - Platform briefs (product.md, web.md, etc.)

### Session History
- `.context/session-logs/` - All previous sessions (for progress tracking)

### Code
- `web/` - Web platform code
- `docs/` - Documentation (flows, architecture)
- `playbooks/` - Content-as-code (schemas, prompts, rules)

---

## How to Start

### Step 1: Check Current State
Before activating ANY role, run this check:

**Copy-Paste Prompt:**
```
I'm starting work on Matchmade. Before I begin, help me understand the current state:

1. Read the 3 most recent files in .context/session-logs/ (sorted by date)
2. List all files in dev/tickets/
3. List all directories in dev/slices/
4. Summarize: What features are complete? What's in progress? What's next in the build order?

Output a brief status report.
```

---

### Step 2: Choose Your Mode

#### SINGLE-DEV MODE (Small features, bug fixes)
**Copy-Paste Prompt:**
```
Load:
- .codex/context.md (this file)
- dev/protocols/single-dev.md
- .context/llm-dev-context.md
- .context/values-schema.md

I want to work in single-dev mode. Summarize the workflow, then ask me what feature I want to build.
```

#### SWARM MODE (Large features, vertical slices)
**Copy-Paste Prompt:**
```
Load:
- .codex/context.md (this file)
- dev/protocols/swarm-dev.md
- .context/llm-dev-context.md
- .context/values-schema.md

I want to work in swarm mode. Summarize the workflow and budget constraints, then ask me which slice I want to work on.
```

---

## Role Activation Prompts

### Product Manager (Strategic Validation)

**When to Use:**
- Starting a new epic/roadmap
- Validating feature requests
- Ensuring product alignment

**Copy-Paste Prompt:**
```
Activate PRODUCT MANAGER role.

Load:
- dev/roles/product-manager.md
- .context/llm-dev-context.md (product essence, non-negotiables)
- .context/northstar.md
- .context/the-art-of-vibes.md
- .context/values-schema.md
- Latest 3 session logs from .context/session-logs/

Context: [Describe the feature request or epic you want to validate]

Tasks:
1. Summarize current product state from session logs
2. Validate the request against product principles
3. Check alignment with build order
4. Approve, redirect, or request clarification
5. If approved, recommend next step (Feature Planner or direct implementation)

Provide a clear go/no-go decision with reasoning.
```

---

### Feature Planner (Tactical Planning)

**When to Use:**
- Defining new features from build order
- Creating work tickets
- Assessing readiness and dependencies

**Copy-Paste Prompt:**
```
Activate FEATURE PLANNER role.

Load:
- dev/roles/feature-planner.md
- .context/llm-dev-context.md (build order)
- .context/briefs/[XX-feature-name].md (the relevant brief)
- All files in dev/tickets/ (current tickets)
- All directories in dev/slices/ (current slices)
- Latest 5 session logs in .context/session-logs/

Context: [Describe which feature from build order, or "What's next?"]

Tasks:
1. Review current state: What's built? What's in progress?
2. Identify next feature from build order
3. Read relevant brief from .context/briefs/
4. Define acceptance criteria
5. List dependencies and blockers
6. Create test plan
7. Output: Create ticket in dev/tickets/[feature-name].md

Keep me updated on what you find and ask clarifying questions.
```

---

### Architect (Design Contracts)

**Single-Dev Mode:**
```
Activate ARCHITECT role (single-dev).

Load:
- dev/roles/architect.md
- dev/protocols/single-dev.md
- dev/tickets/[ticket-name].md (or describe the feature)
- .context/llm-dev-context.md
- .context/values-schema.md

Context: [Describe the feature to architect]

Tasks:
1. Understand requirements and constraints
2. Review existing codebase patterns
3. Design solution (components, API, DB, state)
4. Document architecture (file structure, contracts, types, integration)
5. Output: Create dev/logs/[feature-name]-architecture-[date].md

Next step: I'll implement based on your design.
```

**Swarm Mode:**
```
Activate ARCHITECT role (swarm).

Load:
- dev/roles/architect.md
- dev/protocols/swarm-dev.md (note budgets: ≤400 LOC, ≤2 deps, ≤1 table)
- dev/tickets/[slice-name].md
- .context/llm-dev-context.md
- .context/values-schema.md

Context: [Describe the slice]

Tasks:
1. Define contracts ONLY (routes, DB schema, events, config)
2. Enforce budgets
3. List non-goals
4. Note risks/questions
5. Output: Create dev/slices/[slice-name]/architecture.md

Next: Hand off to Backend/Frontend roles.
```

---

### Implement (Write Code - Single-Dev)

**Copy-Paste Prompt:**
```
Activate IMPLEMENT role.

Load:
- dev/roles/implement.md
- dev/logs/[feature-name]-architecture-[date].md (the architecture)
- .context/llm-dev-context.md (for schema references)

Context: Implement [feature name]

Tasks:
1. Review architecture spec
2. Implement all files per spec
3. Write tests (unit + integration)
4. Document implementation in dev/logs/[feature-name]-implementation-[date].md
5. Run tests and lint, capture results

Ready for review after implementation.
```

---

### Backend (Swarm Specialist)

**Copy-Paste Prompt:**
```
Activate BACKEND role (swarm).

Load:
- dev/roles/backend.md
- dev/slices/[slice-name]/architecture.md (the contract)
- .context/values-schema.md (for DB schema references)

Context: Implement backend for [slice name]

Tasks:
1. Implement API endpoints per contract
2. Implement DB schema changes (Prisma)
3. Write API tests
4. Stay within budget (≤400 LOC, ≤2 deps, ≤1 table)
5. Log in dev/swarms/[slice-name]-[date].md (backend section)

Output: Working API, tests passing.
```

---

### Frontend (Swarm Specialist)

**Copy-Paste Prompt:**
```
Activate FRONTEND role (swarm).

Load:
- dev/roles/frontend.md
- dev/slices/[slice-name]/architecture.md (the contract)
- .context/llm-dev-context.md (for UX principles: easy, natural, gets out of the way)

Context: Implement UI for [slice name]

Tasks:
1. Implement components per contract
2. Implement state management
3. Connect to API endpoints
4. Write component tests
5. Stay within budget
6. Log in dev/swarms/[slice-name]-[date].md (frontend section)

Output: Working UI, tests passing.
```

---

### QA (Testing & Validation)

**Copy-Paste Prompt:**
```
Activate QA role.

Load:
- dev/roles/qa.md
- dev/tickets/[ticket-name].md (acceptance criteria)
- dev/slices/[slice-name]/ (all deliverables) OR dev/logs/ (single-dev)
- Latest implementation logs

Context: Validate [feature/slice name]

Tasks:
1. Review acceptance criteria
2. Run all tests
3. Manual testing checklist
4. Validate against product principles (interface gets out of the way, real and honest)
5. Create validation report
6. Log in dev/logs/ or dev/swarms/

Output: Test results, validation checklist, go/no-go for merge.
```

---

### Review (Code Review)

**Copy-Paste Prompt:**
```
Activate REVIEW role.

Load:
- dev/roles/review.md
- [The code files to review]
- .context/llm-dev-context.md (for style/convention checks)

Context: Review code for [feature name]

Tasks:
1. Check code quality and style
2. Verify type safety
3. Check for security issues (XSS, SQL injection, etc.)
4. Validate against architecture
5. Check test coverage
6. Provide feedback

Output: Approval or requested changes.
```

---

### Debug (Issue Investigation)

**Copy-Paste Prompt:**
```
Activate DEBUG role.

Load:
- dev/roles/debug.md
- [Relevant code files]
- [Error logs/reproduction steps]

Context: Debug [issue description]

Tasks:
1. Reproduce the issue
2. Identify root cause
3. Propose fix
4. Implement and test fix
5. Log in dev/logs/debug-[issue]-[date].md

Output: Fixed code, explanation of root cause.
```

---

### Agent-Logic (LLM/AI Specialist)

**Copy-Paste Prompt:**
```
Activate AGENT-LOGIC role (swarm).

Load:
- dev/roles/agent-logic.md
- .context/values-schema.md
- .context/the-art-of-vibes.md (chemistry philosophy)
- playbooks/profile-schema.json
- dev/slices/[slice-name]/architecture.md

Context: Implement AI logic for [feature]

Tasks:
1. Implement profile extraction prompts
2. Implement matching logic
3. Implement conversational flows
4. Store prompts in playbooks/
5. Log in dev/swarms/[slice-name]-[date].md (agent-logic section)

Output: Working AI logic, prompts documented.
```

---

### Optimize (Performance Tuning)

**Copy-Paste Prompt:**
```
Activate OPTIMIZE role.

Load:
- dev/roles/optimize.md
- [Code to optimize]
- Performance metrics/profiling data

Context: Optimize [feature/component]

Tasks:
1. Profile and identify bottlenecks
2. Propose optimization approach
3. Implement improvements
4. Measure impact
5. Document in dev/logs/optimize-[feature]-[date].md

Output: Optimized code with before/after metrics.
```

---

### Planner (Task Planning)

**Copy-Paste Prompt:**
```
Activate PLANNER role.

Load:
- dev/roles/planner.md
- [Context about the task]

Context: Plan [task description]

Tasks:
1. Break down task into steps
2. Identify dependencies
3. Estimate complexity
4. Propose approach
5. Create checklist

Output: Detailed plan with steps and considerations.
```

---

## Progress Tracking Protocol

### Before Starting ANY Session:

**Copy-Paste Prompt:**
```
Before I start working, help me track progress:

1. Read the last 5 files in .context/session-logs/ (sorted by date)
2. List all files in dev/tickets/
3. List all directories in dev/slices/
4. Check dev/logs/ for recent activity

Summarize:
- What features are complete (from session logs)
- What's in progress (from tickets/slices)
- What's next in the build order
- Any blockers or follow-ups noted

Give me a clear status report.
```

### After Completing Work:

**For Single-Dev:**
1. Log in `.context/session-logs/[feature]-[date].md`
2. Log in `dev/logs/[feature]-implementation-[date].md`
3. Update ticket in `dev/tickets/` (mark complete)
4. Note follow-ups

**For Swarm:**
1. Log role work in `dev/swarms/[slice]-[date].md`
2. Create session log in `.context/session-logs/[slice]-[date].md` (after QA complete)
3. Update slice README in `dev/slices/[slice-name]/README.md`
4. Note follow-ups

---

## Epic/Roadmap Planning

### Starting a New Epic:

**Copy-Paste Prompt:**
```
I want to plan a new epic for Matchmade.

Step 1 - PRODUCT MANAGER:
Load:
- .codex/context.md
- dev/roles/product-manager.md
- .context/llm-dev-context.md
- .context/northstar.md
- Latest 3 session logs

Context: [Describe the epic/big feature]

Validate this against product principles and build order. Provide go/no-go.

---

If approved, proceed to Step 2:

Step 2 - FEATURE PLANNER:
Load:
- dev/roles/feature-planner.md
- .context/briefs/ (all relevant briefs)
- Current state (session logs, tickets, slices)

Break down the epic into features/tickets with:
- Acceptance criteria
- Dependencies
- Test plans
- Sequence/priority

Output: Create tickets in dev/tickets/ for the epic.
```

---

## Quick Reference

### Most Common Workflows:

**1. "What should I build next?"**
```
Activate Feature Planner role
→ Review current state
→ Identify next feature from build order
→ Create ticket
```

**2. "Is this feature aligned with our vision?"**
```
Activate Product Manager role
→ Validate against product principles
→ Go/no-go decision
```

**3. "Build small feature/fix bug"**
```
Single-dev mode:
→ Architect (design)
→ Implement (code + tests)
→ Review (self-review)
→ Log and commit
```

**4. "Build large feature (vertical slice)"**
```
Swarm mode:
→ Feature Planner (create ticket)
→ Architect (define contracts)
→ Backend + Frontend + Agent-Logic (parallel implementation)
→ QA (validate)
→ Log and merge
```

**5. "Debug an issue"**
```
Activate Debug role
→ Reproduce and diagnose
→ Fix and test
→ Log
```

---

## Keeping Roles Up-to-Date

### Product Manager:
- Reads latest session logs before validating
- Stays current on what's been built
- Knows which briefs are complete

### Feature Planner:
- **MUST** read recent session logs, tickets, slices before planning
- Tracks build order progress (1-10)
- Maintains dependency map

### All Implementation Roles:
- Read latest logs to understand current state
- Check existing tickets/slices for context
- Note progress in session logs after work

---

## Platform-Specific Notes

### Web Platform:
- Brief: `dev/brief/web.md`
- Code: `web/`

### iOS Platform (Future):
- Brief: `dev/brief/ios.md`
- Code: `ios/`

### Android Platform (Future):
- Brief: `dev/brief/android.md`
- Code: `android/`

---

## Key Principles

1. **Stateless Development**
   - Each session starts fresh
   - Session logs preserve context
   - Always read recent logs before starting

2. **Role-Based Work**
   - Activate appropriate role for the task
   - Follow role boundaries
   - Hand off between roles clearly

3. **Progress Tracking**
   - Log all work in session logs
   - Update tickets/slices status
   - Note follow-ups and blockers

4. **Product Alignment**
   - Always validate against product principles
   - Easy, natural interface that gets out of the way
   - Real and honest; gets people meeting IRL where chemistry happens
   - No overpromising chemistry

5. **Budget Discipline** (Swarm mode)
   - ≤400 LOC per slice
   - ≤2 new dependencies
   - ≤1 new database table

---

End of Codex context. Copy prompts above to start your session.
