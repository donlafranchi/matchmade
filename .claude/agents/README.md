# Agents

A minimal 3-agent crew for solo development.

## The Crew

| Agent | Purpose | Context Load |
|-------|---------|--------------|
| `feature-planner` | What to build next | Light (~500 tokens) |
| `system-architect` | Design how to build it | Medium (~3k tokens) |
| `code-implementer` | Build it | Heavy (full codebase) |

## Workflow

```
You decide WHAT to build (you're the PM)
         │
         ▼
┌─────────────────┐
│ feature-planner │  "What's the next unchecked feature?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ system-architect│  "How should we build this?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ code-implementer│  "Build it."
└─────────────────┘
```

## Context Savings

Each agent starts fresh with minimal context:

- **feature-planner**: Only reads `project-state.md` + `FEATURES.md`
- **system-architect**: Explores codebase for patterns, outputs design to chat
- **code-implementer**: Reads architecture from chat + implements

**Why this saves context:**
- Quick questions ("what's next?") use light agents
- Heavy work (implementation) only loads what it needs
- No agent reads unnecessary vision/strategy docs

## When to Use Each

| Situation | Agent |
|-----------|-------|
| "What should I work on?" | feature-planner |
| "How should this feature work?" | system-architect |
| "Build this feature" | code-implementer |
| "Should we build X?" | You decide (you're the PM) |

## Key Files

| Purpose | Location |
|---------|----------|
| Current state | `dev/project-state.md` |
| Feature checklist | `docs/FEATURES.md` |
| Decisions | `dev/decisions.md` |

## Archive

`archive/` contains original verbose agents for reference.
