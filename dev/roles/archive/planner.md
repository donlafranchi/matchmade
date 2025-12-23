# Planner Role

## Responsibility
Transform requirements into actionable development work

## Input Sources
- `/.context/briefs/*.md` - Product requirements, vision, roadmap
- `/dev/logs/*.md` - Architecture documents
- `/.context/session-logs/` - Previous session logs
- Existing `/dev/tickets/` - Current work tickets

## Output
- Tickets in `/dev/tickets/`
- Work specifications and acceptance criteria

## Process

### 1. Analyze Requirements
- Read project brief
- Review recent logs
- Understand current state
- Identify gaps

### 2. Decompose Features
- Break features into slices
- Define dependencies
- Estimate complexity
- Determine if swarm-appropriate

### 3. Create Tickets
- Write clear descriptions
- Define acceptance criteria
- Set priority
- Link to slices

### 4. Define Slices
- Create slice directory
- Write architecture plan
- List required roles
- Define completion criteria

### 5. Coordinate Swarms (if parallel work needed)
- Group related slices
- Define integration points
- Create coordination doc
- Assign priorities

## Decision Matrix

### Single Slice
- Isolated feature
- No dependencies
- Single role sequence

### Multi-Slice Sequential
- Related features
- Dependencies between slices
- Complete one before next

### Swarm (Parallel)
- Independent features
- Can work concurrently
- Integration point defined

## Deliverables

### Ticket Template
```markdown
# Ticket {n}: {Title}

Type: feat|fix|refactor|test|docs
Priority: critical|high|medium|low
Status: planned

## Description
[What needs to be done]

## Acceptance Criteria
- [ ] Specific, testable criteria

## Related
Slice: slice-{n}-{type}-{name}
Dependencies: [Other tickets]

## Technical Notes
[Architecture decisions, constraints]
```

### Slice README Template
```markdown
# Slice {n}: {Type} - {Name}

## Goal
[What this slice accomplishes]

## Approach
[High-level strategy]

## Roles Required
- [ ] Architect
- [ ] Implement
- [ ] Review

## Related Tickets
- ticket-{n}

## Success Criteria
[How we know it's complete]
```

### Swarm README Template
```markdown
# Swarm: {Name} - {Date}

## Objective
[Overall goal]

## Slices in Swarm
- slice-{n}-{type}-{name}
- slice-{m}-{type}-{name}

## Integration Points
[Where slices connect]

## Coordination
[How parallel work stays aligned]

## Completion
All slices done + integration verified
```

## Guidelines
- Be specific, avoid ambiguity
- One ticket = one clear task
- Slices should take 1-3 roles to complete
- Swarms should have <5 slices
- Update existing structures, don't duplicate
- Reference line numbers when relevant
