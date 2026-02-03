<!-- Updated: 2026-01-20 -->
# Development

## Directory Structure

```
dev/
├── tickets/           # Active work (1-3 items max)
├── backlog/           # Prioritized queue of future features
├── archive/           # Completed and shelved work
│   ├── done/          # Shipped features
│   └── shelved/       # Decided not to build (with reasons)
├── logs/              # Implementation logs
├── roles/             # Agent role definitions
├── protocols/         # Development protocols
├── decisions.md       # Key architectural decisions
├── project-state.md   # Current state summary
└── WORKFLOW.md        # Development workflow
```

## Workflow

### Working on Features

1. **Pick from backlog** → Pull top priority into `tickets/`
2. **Break it down** → If too big, split into 1-3 session chunks
3. **Implement** → Write code, test it
4. **Archive** → Move to `archive/done/` when complete

### Managing Scope

- **Deprioritized?** → Move to `backlog/` (might do later)
- **Won't build?** → Move to `archive/shelved/` with a SHELVED.md explaining why
- **Partially done?** → Either finish it minimally or split: done parts → archive, remaining → backlog

## Quick Start

```bash
# 1. Check current state
cat dev/project-state.md

# 2. See what's active
ls dev/tickets/

# 3. See what's next
cat dev/backlog/README.md

# 4. Start dev server
podman start matchmade-postgres
cd web && npm run dev
```

## Key Files

| Purpose | File |
|---------|------|
| Current work | `tickets/` |
| What's next | `backlog/README.md` |
| Key decisions | `decisions.md` |
| Full spec | `.context/product-spec.md` |

## Agents

| Agent | When to use |
|-------|-------------|
| `feature-planner` | "What should I build next?" |
| `system-architect` | Complex feature needs design |
| `code-implementer` | Implement an architecture |
| `product-manager` | "Should we build this?" |

## Tech Stack

- Next.js + TypeScript + Tailwind
- PostgreSQL + Prisma
- Podman for local DB
- Claude API for LLM
