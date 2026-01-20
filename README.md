<!-- Updated: 2026-01-19 -->
# Matchmade

Personality matching platform. Technology does the sorting; people discover chemistry in person.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/VISION.md](docs/VISION.md) | What we're building |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature checklist |
| [docs/VERSIONS.md](docs/VERSIONS.md) | Version roadmap |
| [dev/project-state.md](dev/project-state.md) | Current work |

## Quick Start

```bash
# Start database
podman start matchmade-postgres

# Install dependencies
cd web && npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Stack

- Next.js + TypeScript + Tailwind
- Postgres + Prisma
- Podman for local DB
