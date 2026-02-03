# CLAUDE.md

Read this first every session.

## Workflow

1. Read `docs/STATUS.md` for current state
2. Pick ONE ticket from `dev/tickets/`
3. Implement
4. Run `npm test` and `npm run build` — **commit only if passing**
5. If UI changes: Create review ticket in `dev/review/` with manual test steps
6. Update ticket's Completion section
7. Update `docs/STATUS.md`

## Structure

| Folder | Purpose |
|--------|---------|
| docs/ | PRODUCT, ROADMAP, DECISIONS, STATUS |
| design/ | Specs in progress (don't implement) |
| dev/backlog/ | Ready for implementation |
| dev/tickets/ | Active work |
| dev/review/ | Manual testing checklists for UI features |
| dev/archive/ | Completed and shelved work |
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

Before ending a session:
1. Ensure all ticket Completion sections are filled
2. Update `docs/STATUS.md`:
   - Add completed work to Recently Completed (date, ticket, summary)
   - Update In Progress / Next Up
   - Note any blockers
