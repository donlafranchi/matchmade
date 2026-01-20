# dev/tickets/ Directory

**Purpose:** Work specifications organized by phase.

---

## Structure

**Tickets organized by phase** in subdirectories:
- `phase-1/` - Phase 1 tickets (scaffolding with rigid forms)
- `phase-2/` - Phase 2 tickets (interpretation engine)
- `phase-N/` - Future phases

Each phase has a README.md with overview.

---

## Naming Conventions

**Phase 2+:** `{phase}-{ticket}-{name}.md`
- Example: `2-01-schema-interpretation-fields.md`

**Phase 1 (legacy):** `slice-{N}-{name}.md`
- Example: `slice-1a-schema-migration.md`

---

## Ticket Workflow

1. **Create:** Feature planner creates ticket in appropriate phase subdirectory
2. **Implement:** Developer references ticket, updates status in ticket file
3. **Track:** Current state in `dev/project-state.md`
4. **Complete:** Keep ticket in place (historical reference), mark status

---

## Current Phases

**Phase 1 (✅ Complete):** Functional scaffolding with rigid forms
- 6 tickets in `phase-1/`

**Phase 2 (🔄 In Progress):** Therapeutic interpretation engine
- 5 tickets in `phase-2/`

---

*For current work status, see `dev/project-state.md`*
