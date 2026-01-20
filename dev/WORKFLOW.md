<!-- Updated: 2026-01-19 -->
# Development Workflow

How we build features in Matchmade.

## The Loop

```
1. WHAT → Pick a feature from docs/FEATURES.md
2. WHY  → Check it aligns with docs/VISION.md
3. HOW  → Design architecture (if complex)
4. DO   → Implement the code
5. TEST → Verify it works
6. LOG  → Update docs/FEATURES.md + dev/project-state.md
```

## Starting Work

```bash
# 1. Check current state
Read dev/project-state.md

# 2. Pick next feature
Look at docs/FEATURES.md - find first unchecked item

# 3. Start working
```

## Feature Development

### Simple Features (< 200 LOC)
Just implement directly:
1. Write the code
2. Test it works
3. Mark complete in docs/FEATURES.md

### Complex Features (> 200 LOC)
Use architecture-first approach:
1. **Design** → Create `dev/logs/[feature]-architecture-[date].md`
2. **Implement** → Write code following the design
3. **Test** → Verify acceptance criteria
4. **Document** → Create `dev/logs/[feature]-implementation-[date].md`

## Ending Work

Always update before stopping:

```markdown
# In dev/project-state.md

## Active Work
**Current Task:** [What you were working on]
**Status:** [Complete / In Progress / Blocked]
**Next:** [What to do next]

## Recent Handoffs
### [Date]: [Feature name]
- What was done
- What's next
```

Also mark features complete in `docs/FEATURES.md`.

## Key Principles

### Memory-First
- Don't read everything - read what's relevant
- Start with `dev/project-state.md` for current context
- Use `docs/FEATURES.md` to know what's built
- Only dig into `.context/` when you need detail

### Feature-Based (Not Phase-Based)
- Work on features, not phases
- Each feature is independent when possible
- Track by feature completion, not phase milestones

### Minimal Context
- Keep context small and relevant
- Archive completed work
- Don't load full project history

## File Reference

| Need | File |
|------|------|
| What to build | `docs/FEATURES.md` |
| Product vision | `docs/VISION.md` |
| Current work | `dev/project-state.md` |
| Past decisions | `dev/decisions.md` |
| Architecture logs | `dev/logs/` |
| Full product spec | `.context/product-spec.md` |
| Detailed roadmap | `.context/roadmap.md` |

## Agents

When to use each:

| Agent | When |
|-------|------|
| **feature-planner** | "What should I build next?" |
| **system-architect** | "How should I structure this complex feature?" |
| **code-implementer** | "Implement this architecture" |
| **product-manager** | "Should we build this?" (strategic decisions) |

## Quick Commands

```bash
# Start dev server
podman start matchmade-postgres
cd web && npm run dev

# Run tests
cd web && npm test

# Check types
cd web && npm run typecheck

# Database GUI
cd web && npx prisma studio
```
