# Matchmade Organization Protocol

**Purpose:** Organizational rules and decision tree for maintaining project structure as it grows.

---

## Directory Structure

```
matchmade/
├── .claude/agents/          # 5 executable agents (root level)
├── .context/
│   ├── product-spec.md      # Single consolidated spec (v2)
│   ├── vision/              # Strategic vision docs
│   ├── briefs/              # Feature specs (01-10)
│   ├── session-logs/        # Progress summaries
│   └── archive/v1/          # Historical versions
├── dev/
│   ├── project-state.md     # SINGLE SOURCE OF TRUTH
│   ├── decisions.md         # WHY decisions were made
│   ├── tickets/phase-N/     # Work specifications
│   ├── logs/                # New logs (archived periodically)
│   ├── protocols/           # Workflow docs
│   └── roles/               # Role concepts (reference)
└── web/                     # Code (NO dev/ or .claude/ inside!)
```

---

## Decision Tree: "Where Does This Go?"

**Product knowledge** → `.context/product-spec.md`
**Strategic vision** → `.context/vision/`
**Feature specs** → `.context/briefs/`
**Current state** → `dev/project-state.md`
**Decision rationale** → `dev/decisions.md`
**Tickets** → `dev/tickets/phase-N/`
**New logs** → `dev/logs/` (archive periodically)
**Agents** → `.claude/agents/` (at root)
**Code** → `web/`, `ios/`, `android/` (NO dev/ inside!)

---

## Naming Conventions

**Logs:** `{feature}-{role}-{date}.md` (date: YYYY-MM-DD)
**Tickets:** `{phase}-{ticket}-{name}.md` (Phase 2+) or `slice-{N}-{name}.md` (Phase 1 legacy)
**Session Logs:** `{topic}-{date}.md`
**Agents:** `{agent-name}.md` (at `.claude/agents/`)

---

## File Lifecycle

**Creation:**
- Agent creates log → `dev/logs/{feature}-{role}-{date}.md`
- Agent creates ticket → `dev/tickets/phase-{N}/{ticket}.md`
- Agent creates vision doc → `.context/vision/{topic}.md`

**Archiving:**
- Phase completion → Extract decisions to `dev/decisions.md`, move logs to `dev/logs/archive/{year}-phase-{N}/`
- Major product change → Version spec as v{N+1}, archive old to `.context/archive/v{N}/`

---

## Agent Responsibilities

**All agents:**
- Read `.context/product-spec.md` at start
- Read `dev/project-state.md` for current state
- Update `dev/project-state.md` at end
- Place logs in `dev/logs/`
- Never modify `.context/product-spec.md` (human-maintained)

**project-manager (organizational agent):**
- Enforces decision tree
- Archives logs after phase completion
- Extracts decisions to `dev/decisions.md`
- Verifies no files in `web/dev/` or `web/.claude/`
- Versions product spec when needed

---

## Organizational Checks

```bash
# Should return empty
find . -path "*/web/dev/*" -name "*.md"
find . -path "*/web/.claude/*" -name "*.md"

# Should have 6 files (5 agents + README)
ls -1 .claude/agents/*.md | wc -l

# Count tickets
ls -1 dev/tickets/phase-1/*.md | wc -l
ls -1 dev/tickets/phase-2/*.md | wc -l
```

---

## Maintenance Schedule

**Per Session:** Update `dev/project-state.md`
**Weekly:** Check for misplaced files
**Per Phase:** Extract decisions, archive logs, create session summary
**Major Changes:** Version product spec

---

## Future Platform Expansion

When adding iOS/Android:
- Create `matchmade/ios/` or `matchmade/android/` at root
- Keep `dev/`, `.context/`, `.claude/` at root (shared)
- Tag platform-specific tickets: `{phase}-{ticket}-{platform}-{name}.md`

---

*This protocol ensures project stays organized as it grows. Run `project-manager` agent for maintenance.*
