# Project Organization

## Directory Structure

```
/
├── .claude/              # Claude-specific context docs
│   └── context.md
├── .codex/               # Codex-specific context docs
│   └── context.md
├── dev/                  # Development organization (shared)
│   ├── brief/           # Product requirements, vision, roadmap
│   ├── roles/           # Agent role definitions
│   ├── tickets/         # Work tickets
│   ├── slices/          # Feature slices
│   ├── swarms/          # Swarm definitions
│   ├── logs/            # Session logs for context
│   └── docs/            # Development documentation
├── app/                  # Next.js app (MVP web)
├── mobile/               # Future: React Native
├── ios/                  # Future: Native iOS
├── android/              # Future: Native Android
├── lib/                  # Shared libraries
└── prisma/               # Database schema
```

## Naming Conventions

### Feature Slices
Format: `slice-{n}-{type}-{name}-{role}`

Examples:
- `slice-1-feat-auth-architect`
- `slice-1-feat-auth-implement`
- `slice-2-fix-validation-debug`
- `slice-3-refactor-api-optimize`

Types: `feat`, `fix`, `refactor`, `test`, `docs`
Roles: `architect`, `implement`, `debug`, `optimize`, `review`

### Swarms
Format: `swarm-{name}-{date}`

Examples:
- `swarm-auth-20251220`
- `swarm-payment-20251221`

### Branches
Format: `{type}/{slice-or-swarm-name}`

Examples:
- `feat/slice-1-auth-architect`
- `swarm/auth-20251220`

## Development Modes

### Slice Development
Single feature, multiple roles, sequential execution
- Architect designs
- Implementer builds
- Reviewer validates

### Swarm Development
Multiple features, parallel execution, coordinated integration
- Multiple slices in parallel
- Defined integration points
- Coordinated completion

### Traditional Development
Single agent, single task, immediate execution

## LLM Context Structure

Each LLM has identical structure in their directory:

### `.claude/context.md` and `.codex/context.md`

```markdown
# Development Context for {LLM}

## Locations
- Roles: `/dev/roles/`
- Tickets: `/dev/tickets/`
- Slices: `/dev/slices/`
- Swarms: `/dev/swarms/`
- Documentation: `/dev/docs/`

## Current Focus
[Updated per session]

## Active Work
[Current tickets/slices]

## Guidelines
[LLM-specific preferences]
```

## Role Definitions

Located in `/dev/roles/{role}.md`

### planner.md
- Analyze requirements from briefs/logs
- Create tickets, slices, swarms
- Define work structure
- No implementation

### architect.md
- System design
- Component structure
- API contracts
- Database schema
- No implementation

### implement.md
- Write code per architecture
- Follow established patterns
- Unit tests
- Document as needed

### debug.md
- Investigate issues
- Reproduce bugs
- Identify root cause
- Fix implementation

### optimize.md
- Performance analysis
- Optimization implementation
- Metrics tracking
- Trade-off documentation

### review.md
- Code review
- Test coverage check
- Security audit
- Approve or request revisions

## Ticket Structure

Located in `/dev/tickets/ticket-{n}.md`

```markdown
# Ticket {n}: {Title}

Type: feat|fix|refactor|test|docs
Priority: critical|high|medium|low
Status: planned|active|review|done|blocked

## Description
[Clear, concise description]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Related
Slice: slice-{n}-{type}-{name}
Swarm: swarm-{name} (if applicable)

## Notes
[Additional context]
```

## Slice Structure

Located in `/dev/slices/slice-{n}-{type}-{name}/`

```
slice-{n}-{type}-{name}/
├── README.md           # Slice overview
├── architecture.md     # Design (from architect)
├── implementation.md   # Build notes (from implementer)
├── review.md          # Review notes (from reviewer)
└── status.md          # Current status
```

## Swarm Structure

Located in `/dev/swarms/swarm-{name}-{date}/`

```
swarm-{name}-{date}/
├── README.md          # Swarm overview
├── coordination.md    # Integration plan
├── slices.md         # List of slices in swarm
└── status.md         # Overall progress
```

## Agent Workflow

### Starting Work
1. Read LLM context: `.claude/context.md` or `.codex/context.md`
2. Check assigned role: `/dev/roles/{role}.md`
3. Load ticket: `/dev/tickets/ticket-{n}.md`
4. Review slice: `/dev/slices/slice-{n}-{type}-{name}/`
5. Execute per role definition

### Completing Work
1. Update slice status
2. Document in role-specific file
3. Update ticket status
4. Commit with naming convention
5. Update LLM context if needed

## Multi-Platform Considerations

### Current: Web MVP
- Next.js app directory
- Shared lib/ for reusable logic
- Prisma for data layer

### Future: Native Apps
- mobile/ for React Native shared
- ios/ for native iOS
- android/ for native Android
- Extract business logic to lib/
- Platform-specific UI in respective dirs

## File Location Reference

**Agent contexts**: `.claude/context.md`, `.codex/context.md`
**Project brief**: `/dev/brief/*.md` - Product vision, requirements, roadmap
**Roles**: `/dev/roles/*.md` - Agent role definitions
**Tickets**: `/dev/tickets/ticket-*.md` - Work tickets
**Slices**: `/dev/slices/slice-*/` - Feature slices
**Swarms**: `/dev/swarms/swarm-*/` - Coordinated parallel work
**Logs**: `/dev/logs/*.md` - Session logs for planner context
**Docs**: `/dev/docs/*.md` - Technical documentation
**Code**: `/app`, `/lib`, `/prisma` (current), `/mobile`, `/ios`, `/android` (future)
