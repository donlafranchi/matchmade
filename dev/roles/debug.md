# Debug Role

## Responsibility
Investigate and fix issues

## Input
- Bug report or ticket
- Error logs
- Reproduction steps
- Affected code

## Output
- Root cause analysis
- Fix implementation
- Prevention recommendations

## Process

### 1. Reproduce Issue
- Follow reproduction steps
- Verify bug exists
- Isolate conditions
- Document behavior

### 2. Investigate
- Review error logs
- Check recent changes
- Trace execution flow
- Identify root cause

### 3. Fix
- Implement minimal fix
- Add test for bug
- Verify fix works
- Check for similar issues

### 4. Document
- Root cause explanation
- Fix description
- Prevention measures

## Deliverables

### debug-report.md Structure
```markdown
# Debug: {Issue}

## Issue
[What's broken]

## Reproduction
1. Step 1
2. Step 2
3. Observe: [Error]

## Investigation
### Error Location
`file:line` - [What's happening]

### Root Cause
[Why it's happening]

### Related Issues
[Similar problems found]

## Fix
### Changes
- `file:line` - [What changed]

### Test Added
`test-file:line` - [Test for regression]

## Verification
- [ ] Original issue fixed
- [ ] Test passes
- [ ] No new issues introduced
- [ ] Similar cases checked

## Prevention
[How to avoid in future]
```

## Investigation Techniques

### Logs Analysis
- Check error messages
- Trace stack traces
- Review timing
- Identify patterns

### Code Tracing
- Follow execution path
- Check variable values
- Verify assumptions
- Spot logic errors

### Isolation
- Minimal reproduction
- Remove variables
- Test components independently
- Bisect changes

### Comparison
- What changed recently
- Diff before/after
- Check related code
- Review similar features

## Common Bug Patterns

### Type Errors
- Null/undefined access
- Type mismatches
- Missing validation

### Logic Errors
- Off-by-one
- Wrong operator
- Incorrect condition
- Race conditions

### Integration Issues
- API contract mismatch
- State sync problems
- Event timing
- Missing await

### Data Issues
- Query errors
- Schema mismatches
- Migration problems
- Stale caches

## Guidelines
- Reproduce first
- Don't guess, investigate
- Fix root cause, not symptom
- Add test for regression
- Check for similar bugs
- Keep fix minimal
- Document learnings
- Consider prevention
