<!-- Updated: 2026-01-19 -->
# Development

## Directory Structure

```
matchmade/
├── docs/                   # Human docs (printable)
│   ├── VISION.md          # What we're building
│   ├── FEATURES.md        # Feature checklist
│   └── VERSIONS.md        # Version roadmap
│
├── dev/                    # Development operations
│   ├── WORKFLOW.md        # How to develop
│   ├── project-state.md   # Current work
│   ├── decisions.md       # Key decisions
│   ├── tickets/           # Work specifications
│   └── logs/              # Architecture & implementation logs
│
├── .context/              # LLM detailed specs
│   ├── product-spec.md    # Full product specification
│   ├── roadmap.md         # Detailed phase planning
│   └── interpretation.md  # Therapeutic framework
│
├── .claude/               # Claude configuration
│   ├── context.md         # LLM navigation
│   └── agents/            # Agent definitions
│
└── web/                   # Next.js application
```

## Quick Start

```bash
# 1. Check current state
Read dev/project-state.md

# 2. Find next feature
Look at docs/FEATURES.md - first unchecked item

# 3. Start dev server
podman start matchmade-postgres
cd web && npm run dev
```

## Workflow

See [WORKFLOW.md](WORKFLOW.md) for the full development protocol.

**The loop:**
1. Pick feature from `docs/FEATURES.md`
2. Design if complex → `dev/logs/[feature]-architecture-[date].md`
3. Implement the code
4. Test it works
5. Mark complete in `docs/FEATURES.md`
6. Update `dev/project-state.md`

## Agents

| Agent | When to use |
|-------|-------------|
| `feature-planner` | "What should I build next?" |
| `system-architect` | Complex feature needs design |
| `code-implementer` | Implement an architecture |
| `product-manager` | "Should we build this?" |

## Key Files

| Purpose | File |
|---------|------|
| Current work | `dev/project-state.md` |
| Feature status | `docs/FEATURES.md` |
| Product vision | `docs/VISION.md` |
| Key decisions | `dev/decisions.md` |
| Full spec | `.context/product-spec.md` |

## Git

```bash
# Work directly on main
git add .
git commit -m "feat: description"
git push origin main
```

## Tech Stack

- Next.js + TypeScript + Tailwind
- PostgreSQL + Prisma
- Podman for local DB
