# Review Role

## Responsibility
Validate implementation quality

## Input
- `architecture.md` from slice
- `implementation.md` from slice
- Implemented code
- Test results
- Ticket acceptance criteria

## Output
- `review.md` in slice with findings
- Approval or revision requests

## Process

### 1. Verify Architecture Compliance
- Implementation matches design
- No unauthorized changes
- Integration points correct
- File organization proper

### 2. Code Quality Check
- Follows project patterns
- Type safety enforced
- Error handling appropriate
- No security vulnerabilities
- Performance considerations met

### 3. Test Validation
- Tests exist for critical paths
- Edge cases covered
- Tests actually pass
- Coverage adequate

### 4. Standards Compliance
- Lint passes
- Type check passes
- Naming conventions followed
- Documentation present

### 5. Acceptance Criteria
- All ticket criteria met
- No regressions introduced
- Integration verified

## Deliverables

### review.md Structure
```markdown
# Review: {Slice Name}

## Architecture Compliance
- [x] Matches architecture.md
- [ ] Deviation: [Description + reason]

## Code Quality
### Strengths
- [What was done well]

### Issues
- **file:line** - [Issue description + severity]
  - Suggested fix: [Approach]

## Tests
- [ ] Unit tests present
- [ ] Integration tests present
- [ ] Edge cases covered
- Coverage: [%]

## Security
- [ ] No injection vulnerabilities
- [ ] Auth/authz correct
- [ ] Data validation proper
- [ ] Secrets not exposed

## Performance
- [ ] No obvious bottlenecks
- [ ] Queries optimized
- [ ] Bundle size acceptable

## Standards
- [ ] Lint passes
- [ ] Types check
- [ ] Conventions followed

## Acceptance Criteria
- [ ] Criterion 1 met
- [ ] Criterion 2 met

## Verdict
**APPROVED** | **REVISIONS REQUIRED**

## Required Changes (if any)
1. [Specific change needed]
2. [Specific change needed]

## Blockers
[Anything preventing approval]
```

## Review Checklist

### Security
- SQL injection protected
- XSS prevented
- CSRF tokens used
- Auth checks present
- Input validated
- Secrets in env vars

### Performance
- N+1 queries avoided
- Caching where appropriate
- Large lists paginated
- Heavy computation async

### Code Quality
- DRY principle followed
- Functions single-purpose
- Clear naming
- Reasonable complexity
- Error messages helpful

### Testing
- Critical paths tested
- Error cases tested
- Mocks used appropriately
- Tests deterministic

## Guidelines
- Be constructive, not critical
- Provide specific line numbers
- Suggest solutions, not just problems
- Distinguish blocking vs. nice-to-have
- Check actual acceptance criteria
- Verify nothing broken
- Test manually if needed
