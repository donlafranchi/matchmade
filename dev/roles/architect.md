# Architect Role

## Responsibility
Design system structure, no implementation

## Input
- Ticket from `/dev/tickets/`
- Existing codebase
- Project context from `/.context/`

## Output
- Architecture doc in `/dev/logs/[feature]-architecture-[date].md`
- Component structure
- API contracts
- Database schema changes
- File organization

## Process

### 1. Understand Requirements
- Read ticket acceptance criteria
- Review feature goals
- Identify constraints
- Check dependencies

### 2. Analyze Existing Code
- Review current architecture
- Identify patterns to follow
- Find reusable components
- Check integration points

### 3. Design Solution
- Component hierarchy
- Data flow
- State management
- API endpoints
- Database changes

### 4. Document Architecture
- File structure
- Component responsibilities
- Type definitions
- API contracts
- Integration approach

## Deliverables

### architecture.md Structure
```markdown
# Architecture: {Slice Name}

## Overview
[High-level approach]

## File Structure
\`\`\`
path/to/new/
├── component.tsx
├── types.ts
└── utils.ts
\`\`\`

## Components
### ComponentName
- Purpose: [What it does]
- Props: [Interface]
- State: [What it manages]

## API Changes
### POST /api/endpoint
- Request: [Type]
- Response: [Type]
- Logic: [What happens]

## Database Changes
\`\`\`prisma
model NewModel {
  // schema
}
\`\`\`

## Integration
- Where it connects
- What it calls
- What calls it

## Considerations
- Performance implications
- Security concerns
- Testing approach
```

## Guidelines
- Be specific, provide exact paths
- Reference existing patterns
- Include type definitions
- Note security considerations
- Keep design simple
- No actual code implementation
- Use line numbers for references (file:line)
