# Development Guide

**Last Updated:** 2025-12-22 (Simplified for solo development)

---

## Quick Start

### Starting New Work
1. **Check state:** `cat dev/project-state.md`
2. **Find task:** Check `dev/tickets/` or ask Feature Planner
3. **Design:** Use Architect to create architecture doc
4. **Code:** Implement on `main` branch
5. **Commit:** Test, then commit to main

### Simple Git Workflow
```bash
# Work directly on main - no branches needed
git add .
git commit -m "feat: description

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
git push origin main
```

---

## Directory Structure

```
/Users/don/Projects/matchmade/
├── .context/              # Product docs (briefs, values, northstar)
│   ├── briefs/            # 10 feature briefs (01-10)
│   ├── northstar.md       # Product vision
│   ├── the-art-of-vibes.md
│   ├── values-schema.md
│   └── llm-dev-context.md # Build order & constraints
│
├── .claude/               # Claude Code config
│   ├── context.md         # Navigation guide
│   └── settings.local.json
│
├── dev/                   # Project management (SINGLE SOURCE OF TRUTH)
│   ├── project-state.md   # Current state, handoffs, next steps
│   ├── README.md          # This file
│   ├── roles/             # Role definitions
│   ├── protocols/         # Workflow docs
│   ├── logs/              # Architecture documents
│   └── tickets/           # All work specifications
│
└── web/                   # Next.js app
    ├── .claude/agents/    # Subagent definitions
    ├── app/
    ├── prisma/
    └── ...
```

### Key Directories

**`dev/logs/`** - Architecture documents
- Design decisions, trade-offs, alternatives
- Format: `[feature]-architecture-[date].md`
- Created by: Architect

**`dev/tickets/`** - Work specifications
- ALL work items (features, refactors, slices)
- Acceptance criteria, test plans, dependencies
- Created by: Feature Planner

**Principle:** Architecture thinking → `logs/`, work specs → `tickets/`

---

## Development Roles (Streamlined)

### Active Roles (5 core)

**1. Product Manager** - Strategic validation
- When: Starting features, validating ideas
- Has subagent: ✅ `product-manager`
- Output: Go/no-go decision

**2. Feature Planner** - Tactical planning
- When: "What's next?" or breaking down features
- Has subagent: ✅ `feature-planner`
- Output: Ticket with acceptance criteria

**3. Architect** - Solution design
- When: Have ticket, need design
- Has subagent: ❌ (use Task tool with Plan)
- Output: Architecture doc in `dev/logs/`

**4. Implement** - Write code
- When: Have architecture, ready to code
- Has subagent: ✅ `code-implementer`
- Output: Code + tests

**5. Debug** - Fix bugs
- When: Something broken
- Has subagent: ❌ (manual for now)
- Output: Fix + debug notes

### Optional (use as needed)

**6. QA** - Testing validation (can skip for simple features)
**7. Review** - Code review (solo dev might skip)

### Archived (not needed yet)

- **Optimize** - Performance tuning (premature)
- **Planner** - Redundant with feature-planner
- **Backend/Frontend/Agent-Logic** - Swarm mode only

---

## Typical Workflows

### Small Feature
```
Feature Planner → ticket
[Optional] Product Manager → validates
Architect → designs
Implement → codes + tests
Commit → main
```

### Bug Fix
```
Debug → fixes
Test → verifies
Commit → main
```

### Large Feature
```
Feature Planner → multiple slice tickets
For each slice:
  Architect → design
  Implement → code
Commit → main
```

**When to skip:**
- Skip Product Manager for obvious features
- Skip Review for simple changes
- Skip QA if tested during implementation

---

## Build Order (10 Features)

1. ✅ Auth + context selection
2. ✅ Agent chat UI + off-the-record
3. 🟡 DerivedProfile extraction (refactoring)
4. ⏳ Profile preview
5. ⏳ Media upload
6. ⏳ Attraction mode
7. ⏳ Matching engine
8. ⏳ Events
9. ⏳ Notifications
10. ⏳ Feedback + trust

**Current:** Refactoring Brief 3 (Single Profile + Context Intent)

---

## Session Protocol

### Starting
```bash
# Read current state
cat dev/project-state.md

# Or ask for guidance
"What should I work on next?"
```

### Ending
1. Update `dev/project-state.md`:
   - Active Work
   - Recent Handoffs
   - Next Up
2. Commit if ready
3. Note blockers

---

## Essential Files

**Must read:**
- `dev/project-state.md` - Current state (START HERE ALWAYS)
- `dev/tickets/[feature].md` - Work spec
- `dev/logs/[feature]-architecture.md` - Design

**Reference:**
- `.context/llm-dev-context.md` - Build order, constraints
- `.context/briefs/[NN]-[name].md` - Feature specs
- `dev/protocols/single-dev.md` - Workflow

---

## Product Principles

1. **Interface gets out of the way** - Uncluttered, clear
2. **Real and honest** - No overpromising
3. **Moves to real meetings** - Chemistry happens IRL
4. **Values-first** - Not surface attraction
5. **No engagement tricks** - No dark patterns

---

## Common Questions

**Q: Where to put architecture docs?**
→ `dev/logs/[feature]-architecture-[date].md`

**Q: Where to put tickets?**
→ `dev/tickets/[feature-name].md`

**Q: What branch?**
→ `main` always

**Q: When to PR?**
→ Never (solo dev)

**Q: Need all 12 roles?**
→ No, just 5 core + 2 optional

**Q: When use Product Manager?**
→ New/uncertain features

**Q: When use Feature Planner?**
→ "What's next?" or large features

**Q: Can skip Architect?**
→ Tiny changes yes, but most benefit from design-first

---

## Subagents Created

In `web/.claude/agents/`:
1. `product-manager.md` - Strategic validation
2. `feature-planner.md` - Tactical planning
3. `code-implementer.md` - Implementation

**Note:** Architect uses Task tool with Plan subagent (not custom agent yet)

---

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind 4
- Backend: Next.js API routes
- Database: PostgreSQL + Prisma 7
- AI: Anthropic Claude
- Auth: NextAuth.js
- Host: Vercel

---

## Need Help?

1. **What to build?** → Feature Planner subagent
2. **Validate idea?** → Product Manager subagent
3. **Need design?** → Architect role
4. **Ready to code?** → Implement (code-implementer)
5. **Bug?** → Debug role
6. **Stuck?** → Read `dev/project-state.md`

---

## Context Transfer (How Agents Work Together)

### The Problem
Each LLM session is stateless. Agents need to know what happened before.

### The Solution
**`dev/project-state.md`** = single source of truth

**Protocol:**
1. **Start session** → Read project-state.md
2. **Do work** → Create artifacts
3. **End session** → Update project-state.md with handoff

**Handoff includes:**
- What was accomplished
- Artifacts created (with paths)
- Who's next
- What they need to read

### Example Flow
```
Feature Planner → Creates ticket
  ↓ Handoff: "Architect, design per ticket"

Architect → Creates architecture doc
  ↓ Handoff: "Implement, build per architecture"

Implement → Writes code + tests
  ↓ Handoff: "Complete! Ready to commit"
```

---

## Simplified Workflow Summary

**Old (Complex):**
- Feature branches
- Pull requests
- Swarm logs
- Slice directories

**New (Simple):**
- Work on main
- Commit when ready
- Single dev/ directory
- Architecture → `logs/`, tickets → `tickets/`

**Why?**
- Solo development
- Faster iteration
- Less overhead
- Can reintroduce branches later if needed

---

**Keep it simple. Work on main. Use subagents for context. Commit when ready.**

For detailed role info: `dev/roles/README.md`
For workflow patterns: `dev/protocols/single-dev.md`
For current state: `dev/project-state.md` (always start here)
