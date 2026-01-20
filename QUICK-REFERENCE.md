<!-- Updated: 2026-01-19 -->
# Quick Reference

## Start Development

```bash
# Start database
podman start matchmade-postgres

# Start dev server
cd web && npm run dev

# Open http://localhost:3000
```

## Database

**Connection:** localhost:5433 / matchmade / postgres / postgres

```bash
# Connect to database
podman exec -it matchmade-postgres psql -U postgres -d matchmade

# View in GUI
cd web && npx prisma studio

# Apply schema changes
cd web && npx prisma migrate dev
```

## Git

```bash
git status              # See changes
git add .               # Stage all
git commit -m "msg"     # Commit
git push origin main    # Push
```

## Project Structure

```
docs/                   # Human docs (printable)
  VISION.md            # What we're building
  FEATURES.md          # Feature checklist
  VERSIONS.md          # Version roadmap

.context/              # LLM detailed specs
  product-spec.md
  roadmap.md
  interpretation.md

dev/
  project-state.md     # Current work
  decisions.md         # Key decisions
  tickets/             # Work items

web/                   # Next.js app
  app/                 # Routes
  prisma/              # Database
```

## Troubleshooting

```bash
# Database won't start
podman logs matchmade-postgres
podman restart matchmade-postgres

# Prisma errors
cd web && npx prisma generate

# Port 5433 in use
lsof -i :5433
```
