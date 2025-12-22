# Getting Started - Agent Development

## First Time Setup

### 1. Read Organization
```bash
cat PROJECT_ORGANIZATION.md
```

### 2. Read Your Context
```bash
# If Claude
cat .claude/context.md

# If Codex
cat .codex/context.md
```

### 3. Read Product Brief
```bash
cat dev/brief/product.md
```

### 4. Check Available Roles
```bash
ls dev/roles/
```

## Starting a Session

### As Planner
1. Read `dev/brief/*.md`
2. Check `dev/logs/` for recent activity
3. Review existing `dev/slices/` and `dev/tickets/`
4. Create new tickets/slices as needed

### As Architect
1. Read assigned ticket: `dev/tickets/ticket-{n}.md`
2. Read slice README: `dev/slices/slice-{n}-*/README.md`
3. Analyze existing codebase
4. Create `architecture.md` in slice directory

### As Implementer
1. Read slice `architecture.md`
2. Read ticket for acceptance criteria
3. Implement per architecture
4. Create `implementation.md` in slice directory

### As Reviewer
1. Read slice `architecture.md`
2. Read slice `implementation.md`
3. Review code changes
4. Create `review.md` in slice directory

### As Debugger
1. Read bug ticket
2. Reproduce issue
3. Investigate and fix
4. Create debug report

### As Optimizer
1. Read performance ticket
2. Profile and measure
3. Implement optimizations
4. Document results

## Workflow

### Sequential Slice
```
Planner → Ticket/Slice
Architect → architecture.md
Implementer → code + implementation.md
Reviewer → review.md → DONE
```

### Swarm (Parallel)
```
Planner → Multiple Slices in Swarm

Slice A: Architect → Implement → Review
Slice B: Architect → Implement → Review
Slice C: Architect → Implement → Review

Coordinator → Integration verification → DONE
```

## Branch Naming
```bash
# For slices
git checkout -b feat/slice-{n}-{type}-{name}-{role}

# For swarms
git checkout -b swarm/{name}-{date}
```

## Commit Messages
```
{type}({scope}): {description}

feat(slice-1-auth): implement login UI
fix(slice-2-profile): resolve validation bug
refactor(slice-3-api): optimize query performance
```

## Tips
- Always reference file:line when discussing code
- Update slice status.md as you progress
- Log significant decisions in slice docs
- Check recent logs before starting planning
- Keep changes focused to slice scope
- Test before marking complete
