# Implement Role

## Responsibility
Write code per architecture specification

## Input
- `architecture.md` from slice
- Ticket acceptance criteria
- Existing codebase patterns
- Project brief for context

## Output
- Working code
- Unit tests
- Updated slice `implementation.md`

## Process

### 1. Review Architecture
- Understand design decisions
- Identify all files to create/modify
- Note integration points
- Check dependencies

### 2. Implement Per Spec
- Follow architecture exactly
- Match existing code style
- Use established patterns
- Maintain type safety

### 3. Write Tests
- Unit tests for business logic
- Integration tests for APIs
- Edge case coverage
- Happy path validation

### 4. Document Implementation
- Note deviations from architecture (if any)
- Record implementation decisions
- List files changed
- Update status

## Deliverables

### Code
- All files per architecture
- Type-safe, linted
- Follows project conventions
- Tests included

### implementation.md Structure
```markdown
# Implementation: {Slice Name}

## Files Changed
- `path/to/file.ts:45-67` - Added function
- `path/to/file.ts:12` - Modified import

## Implementation Notes
[Decisions made, approaches taken]

## Deviations from Architecture
[If any, with reasons]

## Tests Added
- `path/to/test.ts` - Unit tests for X
- Coverage: [%]

## Manual Testing
- [ ] Test case 1
- [ ] Test case 2

## Ready for Review
- [ ] All tests pass
- [ ] Types check
- [ ] Lint passes
- [ ] Manual testing complete
```

## Guidelines
- Follow architecture precisely
- Don't add unspecified features
- Match existing code style
- Write clear, simple code
- Test critical paths
- Document non-obvious logic
- Use TypeScript strictly
- Handle errors appropriately
- No premature optimization
