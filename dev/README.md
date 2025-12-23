# Development System Guide

This directory contains the complete development operations system for Matchmade. This README explains how status tracking, context transfer, and agent handoffs work.

---

## The Context Transfer Problem

**Challenge:** Each LLM session is stateless. Agents need to know:
- What happened before them
- What they should work on
- Where to find relevant information
- Who picks up after them

**Solution:** A multi-layered tracking system with a central state file as the single source of truth.

---

## Directory Structure

```
dev/
├── README.md                    ← You are here (status tracking guide)
├── project-state.md             ← CENTRAL STATE FILE (single source of truth)
│
├── protocols/                   ← Development workflows
│   ├── single-dev.md           (Small features, one agent)
│   └── swarm-dev.md            (Large features, parallel agents)
│
├── roles/                       ← Agent role definitions (12 roles)
│   ├── product-manager.md      (Strategic validation)
│   ├── feature-planner.md      (Tactical planning)
│   ├── architect.md            (Design contracts)
│   ├── implement.md            (Code - single-dev)
│   ├── backend.md              (API/DB - swarm)
│   ├── frontend.md             (UI - swarm)
│   ├── agent-logic.md          (AI/LLM logic - swarm)
│   ├── qa.md                   (Testing)
│   ├── review.md               (Code review)
│   ├── debug.md                (Bug fixes)
│   ├── optimize.md             (Performance)
│   └── planner.md              (Task planning)
│
├── tickets/                     ← Work tickets with acceptance criteria
│   ├── slice-1-chat-profile.md (Example: completed)
│   └── [feature-name].md       (Future tickets)
│
├── slices/                      ← Swarm mode work (vertical slices)
│   └── [slice-name]/           (Each slice has architecture, status)
│       ├── architecture.md
│       └── README.md
│
├── swarms/                      ← Swarm execution logs
│   └── [slice-name]-[date].md  (Log of parallel work)
│
├── logs/                        ← Single-dev session logs
│   ├── [feature]-architecture-[date].md
│   ├── [feature]-implementation-[date].md
│   └── [feature]-review-[date].md
│
└── brief/                       ← Platform-specific briefs
    ├── product.md              (Product overview)
    ├── web.md                  (Web platform)
    ├── ios.md                  (iOS platform - future)
    └── android.md              (Android platform - future)
```

---

## Status Tracking System

### Layer 1: Central State File (`project-state.md`)

**Purpose:** Single source of truth for "what's happening right now"

**Contains:**
- Current phase (which brief/feature we're on)
- Active work (who's working on what)
- Recent handoffs (what just finished)
- Next up (what's coming)
- Blockers and dependencies
- Milestones and checkpoints
- Agent context map (what each role needs to read)

**Update frequency:** End of EVERY session

**Who reads it:** EVERYONE at session start

### Layer 2: Session Logs (`.context/session-logs/`)

**Purpose:** Historical record of what happened

**Contains:**
- Date and feature worked on
- What was accomplished
- Decisions made
- Tests run
- Artifacts created
- Follow-ups noted

**Update frequency:** End of major work sessions

**Who reads it:** Feature Planner, Product Manager (to understand current state)

### Layer 3: Tickets (`dev/tickets/`)

**Purpose:** Work definitions with acceptance criteria

**Contains:**
- Feature description
- Acceptance criteria (what "done" looks like)
- Dependencies
- Technical requirements
- Test plans
- Readiness status

**Update frequency:** When planning features

**Who reads it:** All implementation roles (Architect, Implement, Backend, Frontend, QA)

### Layer 4: Slice/Swarm Logs (`dev/slices/`, `dev/swarms/`)

**Purpose:** Track parallel work in swarm mode

**Contains:**
- Architecture contracts
- Role-specific logs (Backend, Frontend, Agent-Logic)
- Integration status
- Budget tracking

**Update frequency:** During swarm work

**Who reads it:** Swarm participants, QA

### Layer 5: Implementation Logs (`dev/logs/`)

**Purpose:** Detailed technical logs for single-dev mode

**Contains:**
- Architecture decisions
- Implementation notes
- Code changes
- Test results
- Review findings

**Update frequency:** During single-dev work

**Who reads it:** Implementation roles, reviewers

---

## Handoff Protocol

Every agent follows this pattern when finishing work:

### 1. Complete Your Work
- Finish assigned tasks
- Run tests
- Create required artifacts
- Verify acceptance criteria

### 2. Document What You Did
- Update role-specific log (in `dev/logs/` or `dev/swarms/`)
- Note any deviations from plan
- List artifacts created
- Record any issues or follow-ups

### 3. Update Central State (`project-state.md`)
Update these sections:
- **Active Work** → Mark your task complete, clear the owner
- **Recent Handoffs** → Add entry with date, from/to, artifacts, status
- **Next Up** → Update to reflect new priority
- **Blockers** → Add any new blockers discovered

### 4. Explicit Handoff
State clearly:
- **Who's next:** Which role/agent should continue
- **What they need:** List files/docs to read
- **Context they need:** Any critical information
- **Recommended action:** Specific next step

### 5. Create Session Log (if major work)
For significant sessions:
- Create `.context/session-logs/[feature]-[date].md`
- Summarize what was accomplished
- Link to artifacts
- Note follow-ups

---

## Session Start Protocol

**At the start of EVERY session:**

### Step 1: Read Central State
```
Read dev/project-state.md and tell me:
1. What phase are we in?
2. What was the last completed task?
3. Who should I activate (which role)?
4. What artifacts do I need to read?
5. Are there any blockers?
```

### Step 2: Load Role Context
Based on the role you're activating, read:
- Role definition from `dev/roles/[role].md`
- Required context files (see Agent Context Map in project-state.md)
- Recent session logs (if needed for context)
- Active ticket or slice (if continuing work)

### Step 3: Confirm Understanding
Before starting work, confirm:
- What you're building
- Why (alignment with product)
- Acceptance criteria
- Any constraints or dependencies

---

## Session End Protocol

**At the end of EVERY session:**

### Step 1: Update Central State
```
Update dev/project-state.md:
1. Mark my task complete in "Active Work"
2. Add handoff entry in "Recent Handoffs" with:
   - Date
   - From (my role) → To (next role)
   - Artifacts created (with paths)
   - Status (complete, blocked, etc.)
3. Update "Next Up" with recommended next steps
4. Add any new blockers
```

### Step 2: Create Role-Specific Log
- Single-dev: `dev/logs/[feature]-[role]-[date].md`
- Swarm: Append to `dev/swarms/[slice-name]-[date].md`

### Step 3: Update Ticket Status
- Mark completed acceptance criteria
- Note any deviations
- Add follow-ups

### Step 4: Create Session Log (if major milestone)
- `.context/session-logs/[feature]-[date].md`
- High-level summary of session
- Links to detailed logs

---

## Agent Context Map

Each agent has specific reading requirements. See `project-state.md` for the full table.

**Key principle:** Agents should read only what they need, but must read the central state file.

### Strategic Roles
- **Product Manager:** Reads everything, writes strategic decisions
- **Feature Planner:** Reads state + logs + tickets, writes tickets

### Implementation Roles
- **Architect:** Reads ticket + context, writes architecture
- **Implement/Backend/Frontend:** Read architecture, write code
- **Agent-Logic:** Reads architecture + philosophy docs, writes prompts

### Quality Roles
- **QA:** Reads ticket + implementation, writes validation
- **Review:** Reads architecture + code, writes review
- **Debug:** Reads error logs + code, writes fixes

---

## How Context Flows Between Agents

### Example: Profile Preview Feature (Single-Dev)

```
1. Feature Planner
   READ: project-state.md, session-logs/, tickets/
   WRITE: dev/tickets/profile-preview.md
   HANDOFF: "Architect, design the profile preview component per ticket"

2. Architect
   READ: project-state.md, dev/tickets/profile-preview.md
   WRITE: dev/logs/profile-preview-architecture-2025-12-22.md
   HANDOFF: "Implement, build per architecture doc"

3. Implement
   READ: project-state.md, dev/logs/profile-preview-architecture-2025-12-22.md
   WRITE: Code files + dev/logs/profile-preview-implementation-2025-12-22.md
   HANDOFF: "Review, check code quality"

4. Review
   READ: project-state.md, architecture doc, implementation doc, code
   WRITE: dev/logs/profile-preview-review-2025-12-22.md
   HANDOFF: "QA, validate acceptance criteria"

5. QA
   READ: project-state.md, ticket, all logs, code
   WRITE: dev/logs/profile-preview-qa-2025-12-22.md
   HANDOFF: "Complete! Log session and commit."
```

**Key:** Each agent:
1. Reads project-state.md (always)
2. Reads previous agent's output
3. Writes their own artifact
4. Updates project-state.md with handoff

### Example: Matching Engine (Swarm Mode)

```
1. Feature Planner
   READ: project-state.md, session-logs/, tickets/
   WRITE: dev/tickets/slice-7a-matching-engine.md
   HANDOFF: "Architect, define contracts for matching engine"

2. Architect
   READ: project-state.md, ticket
   WRITE: dev/slices/slice-7a-matching/architecture.md
   HANDOFF: "Backend + Agent-Logic, work in parallel per contracts"

3a. Backend (parallel)
   READ: project-state.md, dev/slices/slice-7a-matching/architecture.md
   WRITE: Code + dev/swarms/slice-7a-matching-2025-12-22.md (backend section)
   HANDOFF: "QA, my portion is ready"

3b. Agent-Logic (parallel)
   READ: project-state.md, dev/slices/slice-7a-matching/architecture.md
   WRITE: Prompts + code + dev/swarms/slice-7a-matching-2025-12-22.md (agent section)
   HANDOFF: "QA, my portion is ready"

4. QA
   READ: project-state.md, ticket, architecture, swarm log, all code
   WRITE: dev/swarms/slice-7a-matching-2025-12-22.md (QA section)
   HANDOFF: "Complete! Both backend and agent-logic validated."
```

**Key:** Parallel agents write to the same swarm log file in separate sections.

---

## Quick Reference Commands

### Starting a session
```bash
# General start
"Read dev/project-state.md and tell me what to work on next"

# Specific role
"Activate Feature Planner role. Read dev/project-state.md and identify next feature."

# Continue existing work
"Read dev/project-state.md. Continue from where we left off."

# Debug session
"Read dev/project-state.md. Debug issue: [description]"
```

### Ending a session
```bash
# Update state + handoff
"Update dev/project-state.md with:
1. What I accomplished
2. Artifacts created
3. Who's next and what they need to read"

# Create session log
"Create session log in .context/session-logs/ summarizing today's work"
```

### Checking status
```bash
# Quick status
"Read dev/project-state.md and summarize current status"

# Detailed progress
"Read dev/project-state.md and latest 3 session logs. What's our progress on the build order?"

# Check blockers
"Read dev/project-state.md. Are there any blockers?"
```

---

## Best Practices

### For Status Tracking
1. **Always read project-state.md first** - It's the single source of truth
2. **Update project-state.md at end of session** - Keep it current
3. **Be explicit in handoffs** - Name the next agent, list what they need
4. **Link to artifacts** - Always include file paths
5. **Note blockers immediately** - Don't let them hide

### For Context Transfer
1. **Write for future you** - Assume total memory loss
2. **Be specific** - "See line 45" not "there's a function"
3. **Summarize decisions** - Why did we choose this approach?
4. **List follow-ups** - What needs to happen next?
5. **Cross-reference** - Link related artifacts

### For Agent Handoffs
1. **Read your role definition** - Know your scope
2. **Don't overstep** - Hand off to appropriate role
3. **Complete your work** - Don't leave partial implementations
4. **Document deviations** - If you deviated from plan, say why
5. **Test before handing off** - Don't pass broken work

---

## Troubleshooting

### "I don't know what to work on"
→ Read `dev/project-state.md` section "Next Up"

### "I don't have enough context"
→ Check "Agent Context Map" in `project-state.md` for what your role needs to read

### "The last session left things unclear"
→ Read latest session log in `.context/session-logs/`
→ Check "Recent Handoffs" in `project-state.md`

### "I found a blocker"
→ Add it to "Blockers & Dependencies" section in `project-state.md`
→ Note what needs to happen to unblock

### "Work got interrupted mid-task"
→ Update `project-state.md` with current state
→ Mark task as "in progress" with notes on what's left
→ Create handoff for next session (even if same role)

---

## Integration with Existing Tools

This status tracking system complements (doesn't replace) existing tools:

| Tool | Purpose | Status Tracking Role |
|------|---------|---------------------|
| `.codex/context.md` | Navigation and prompts | Entry point, routes to project-state.md |
| `.claude/context.md` | Navigation and prompts | Entry point, routes to project-state.md |
| `.context/session-logs/` | Historical record | Source of truth for past work |
| `dev/project-state.md` | Current state | Single source of truth for NOW |
| `dev/tickets/` | Work definitions | What to build |
| `dev/protocols/` | How to work | Workflow patterns |
| `dev/roles/` | Role definitions | Agent responsibilities |

**Flow:** Entry file → project-state.md → role → ticket → work → log → update state

---

## Summary

**The core insight:** Context transfer between stateless agents requires:
1. **Central state file** (`project-state.md`) - single source of truth
2. **Explicit handoffs** - each agent names who's next
3. **Linked artifacts** - every output has a file path
4. **Read-before-write** - always read state before starting

**The protocol:**
- **Start:** Read `project-state.md` → activate role → read context
- **Work:** Complete task → create artifacts → test
- **End:** Update `project-state.md` → handoff to next agent → log session

**The result:** Each agent knows exactly what to do, who came before, and who comes next.

---

For detailed role instructions, see `dev/roles/README.md`.

For workflow patterns, see `dev/protocols/single-dev.md` and `dev/protocols/swarm-dev.md`.

For current project state, always check `dev/project-state.md`.
