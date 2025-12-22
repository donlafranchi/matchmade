# Optimize Role

## Responsibility
Improve performance without changing functionality

## Input
- Performance issue or target
- Profiling data
- Current implementation
- Performance budget

## Output
- Optimization implementation
- Before/after metrics
- Performance documentation

## Process

### 1. Measure Baseline
- Profile current performance
- Identify bottlenecks
- Quantify issues
- Set targets

### 2. Analyze
- CPU usage
- Memory usage
- Network requests
- Database queries
- Bundle size
- Render performance

### 3. Optimize
- Target biggest bottleneck first
- Implement optimization
- Measure improvement
- Verify no regressions

### 4. Document
- Metrics before/after
- Techniques used
- Trade-offs made

## Deliverables

### optimization-report.md Structure
```markdown
# Optimization: {Target}

## Baseline
- Metric: {value}
- Bottleneck: [Description]
- Target: {goal}

## Analysis
### Profiling Results
- [Tool used]: [Findings]
- Hot paths: `file:line`
- Issues identified:
  1. [Issue + impact]

## Optimizations Applied

### 1. {Optimization Name}
**Location**: `file:line`
**Technique**: [What was done]
**Impact**: {before} → {after} ({%} improvement)

### 2. {Optimization Name}
**Location**: `file:line`
**Technique**: [What was done]
**Impact**: {before} → {after} ({%} improvement)

## Results
- **Before**: {baseline metric}
- **After**: {new metric}
- **Improvement**: {%}

## Trade-offs
[Code complexity, maintainability, etc.]

## Verification
- [ ] Performance improved
- [ ] Functionality unchanged
- [ ] Tests still pass
- [ ] No new bugs introduced

## Future Opportunities
[Additional optimizations possible]
```

## Optimization Techniques

### React/Frontend
- Memoization (useMemo, memo)
- Virtualization for lists
- Code splitting
- Lazy loading
- Image optimization
- Debouncing/throttling

### Database
- Index optimization
- Query optimization
- N+1 query elimination
- Connection pooling
- Caching strategies

### API
- Response caching
- Pagination
- Field selection
- Batch requests
- CDN usage

### Bundle
- Tree shaking
- Dynamic imports
- Vendor chunking
- Minification
- Compression

## Measurement Tools

### Frontend
- React DevTools Profiler
- Chrome DevTools Performance
- Lighthouse
- Web Vitals
- Bundle Analyzer

### Backend
- Database query logs
- APM tools
- Profilers
- Memory profilers

## Guidelines
- Measure before optimizing
- Target real bottlenecks
- Optimize biggest impact first
- Verify improvements with metrics
- Don't sacrifice readability unnecessarily
- Consider maintenance cost
- Document trade-offs
- Test thoroughly
- Keep changes isolated
