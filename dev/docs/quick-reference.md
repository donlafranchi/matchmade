# Quick Reference

## Directory Map

```
.claude/context.md          → Claude's session context
.codex/context.md           → Codex's session context
dev/brief/                  → Product vision & requirements
dev/roles/                  → Agent role definitions (6 roles)
dev/tickets/                → Work tickets
dev/slices/                 → Feature slices
dev/swarms/                 → Parallel work coordination
dev/logs/                   → Session logs
dev/docs/                   → Documentation
PROJECT_ORGANIZATION.md     → Full organization spec
```

## Roles Summary

| Role | Focus | Output |
|------|-------|--------|
| **Planner** | Requirements → Work structure | Tickets, slices, swarms |
| **Architect** | Design system structure | architecture.md |
| **Implement** | Write code per design | Code + implementation.md |
| **Review** | Validate quality | review.md + approval |
| **Debug** | Fix issues | Fixes + debug-report.md |
| **Optimize** | Improve performance | Optimizations + metrics |

## Naming Quick Ref

**Slices**: `slice-{n}-{type}-{name}-{role}`
- Example: `slice-1-feat-auth-architect`

**Types**: `feat` | `fix` | `refactor` | `test` | `docs`

**Roles**: `architect` | `implement` | `debug` | `optimize` | `review`

**Branches**: `{type}/{slice-name}` or `swarm/{name}-{date}`

## Common Commands

### View Organization
```bash
cat PROJECT_ORGANIZATION.md
```

### Check Your Context
```bash
cat .claude/context.md    # or .codex/context.md
```

### See Product Requirements
```bash
cat dev/brief/product.md
```

### List Available Roles
```bash
ls dev/roles/
```

### Check Active Work
```bash
ls dev/tickets/
ls dev/slices/
```

### Read a Role Definition
```bash
cat dev/roles/planner.md
```

## Typical Workflows

### Create New Work (Planner)
1. Read `/dev/brief/product.md`
2. Check `/dev/logs/` for context
3. Create ticket in `/dev/tickets/`
4. Create slice dir in `/dev/slices/`
5. Write slice README

### Design Feature (Architect)
1. Read ticket + slice README
2. Analyze codebase
3. Create `architecture.md` in slice
4. Hand off to implementer

### Build Feature (Implementer)
1. Read `architecture.md`
2. Implement code
3. Write tests
4. Create `implementation.md`
5. Hand off to reviewer

### Review Code (Reviewer)
1. Read architecture + implementation docs
2. Review code
3. Test functionality
4. Create `review.md`
5. Approve or request changes

## File References Format

Always use: `file:line`

Examples:
- `app/page.tsx:42`
- `lib/utils.ts:15-23`

## Slice Status Tracking

Each slice should have `status.md`:
```markdown
Current: architect | implement | review | done
Updated: {date}
Blocked: yes/no
Notes: [Any important info]
```

## Tips

- **Wide, not deep**: Prefer flat directory structure
- **Stateless agents**: All context in docs, not memory
- **Always reference**: Use file:line for precision
- **Sequential by default**: Swarms only for truly parallel work
- **Update as you go**: Keep status current
- **Read first**: Check brief/logs/context before planning
