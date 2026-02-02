# CLAUDE.md

Read this first every session.

## Quick Start

1. Read `docs/STATUS.md` for current state
2. Check `dev/tickets/` for active work
3. One ticket at a time
4. Update STATUS.md after completing work

## Structure

| Folder | Purpose |
|--------|---------|
| docs/ | PRODUCT, ROADMAP, DECISIONS, STATUS, VISION, FEATURES |
| design/ | Specs in progress (don't implement) |
| dev/backlog/ | Ready for implementation |
| dev/tickets/ | Active work |
| dev/archive/ | Completed and shelved work |
| dev/logs/ | Implementation logs |
| .claude/agents/ | Sub-agent definitions |

## Workflow Stages

design/ -> dev/backlog/ -> dev/tickets/ -> STATUS.md (Recently Completed)

## Permissions

| File | PM | Agents |
|------|-----|--------|
| PRODUCT.md | write | read-only |
| ROADMAP.md | write | read-only |
| design/* | write | read-only |
| DECISIONS.md | read | append |
| STATUS.md | read | write |
| dev/backlog/* | write | move to dev/tickets/ |
| dev/tickets/* | read | write |

## Sub-Agents

Spawn task agents for isolated work. See `.claude/agents/` for definitions.

Available:
- feature-planner - break features into tickets
- system-architect - design systems, evaluate tradeoffs
- code-implementer - focused implementation
- product-manager - strategic product decisions
- copywriter - app messaging and UI text

When to spawn:
- Research that might bloat context
- Risky/exploratory changes
- Parallel investigation

## Rules

1. Never modify PRODUCT.md or ROADMAP.md
2. Always update STATUS.md after completing work
3. Log significant decisions in DECISIONS.md
4. Don't implement from /design/ - wait for /dev/backlog/
5. One ticket at a time

## Tech Stack

- Next.js + TypeScript + Tailwind
- PostgreSQL + Prisma
- Podman for local DB
- Claude API for LLM

## Quick Commands

```bash
# Start database
podman start matchmade-postgres

# Start dev server
cd web && npm run dev

# Reset database (fresh user testing)
cd web && npx tsx scripts/reset-db.ts
```

## Session Handoff

End every session by updating docs/STATUS.md:
- Move completed items to Recently Completed
- Note blockers or open questions
- Update Next Up if priorities changed
