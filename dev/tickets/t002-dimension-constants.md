# T002 - Dimension Constants

## Goal
Define all matching dimensions with their types and compatibility rules.

## Acceptance Criteria
- [ ] All dimensions defined with type (lifestyle/values/direct)
- [ ] Compatibility rules assigned (similarity/compatibility/complementary/dealbreaker)
- [ ] TypeScript types exported for use in other modules
- [ ] Spectrum definitions for each dimension (for LLM prompts)

## Constraints
- Keep it simple - can expand dimensions later
- Must align with experiential-profiling.md design doc

## Plan
1. Create lib/matching/dimensions.ts
2. Define DIMENSIONS constant with all dimensions
3. Add spectrum descriptions for LLM extraction
4. Export types

## Code

```typescript
// web/lib/matching/dimensions.ts

export const DIMENSIONS = {
  // Lifestyle
  schedule: {
    type: 'lifestyle',
    rule: 'similarity',
    spectrum: 'Morning person (+2) to Night owl (-2)'
  },
  energy: {
    type: 'lifestyle',
    rule: 'similarity',
    spectrum: 'High energy, always active (+2) to Low key, restorative (-2)'
  },
  social: {
    type: 'lifestyle',
    rule: 'compatibility',
    spectrum: 'Extrovert, energized by people (+2) to Introvert, needs solitude (-2)'
  },
  spontaneity: {
    type: 'lifestyle',
    rule: 'complementary',
    spectrum: 'Loves surprises, hates plans (+2) to Strong planner, needs structure (-2)'
  },

  // Values
  trust: {
    type: 'values',
    rule: 'similarity',
    spectrum: 'Categories: consistency, honesty, autonomy, presence'
  },
  communication: {
    type: 'values',
    rule: 'similarity',
    spectrum: 'Deep, philosophical (+2) to Light, action-oriented (-2)'
  },
  conflict: {
    type: 'values',
    rule: 'compatibility',
    spectrum: 'Talk it through immediately (+2) to Need space, avoid (-2)'
  },
  independence: {
    type: 'values',
    rule: 'compatibility',
    spectrum: 'High independence, separate lives (+2) to Very connected, do everything together (-2)'
  },
  growth: {
    type: 'values',
    rule: 'similarity',
    spectrum: 'Always improving, welcomes feedback (+2) to Self-accepting, take me as I am (-2)'
  },

  // Direct (dealbreakers)
  intent: {
    type: 'direct',
    rule: 'dealbreaker',
    options: ['casual', 'open', 'serious', 'marriage_track', 'figuring_it_out']
  },
  children: {
    type: 'direct',
    rule: 'dealbreaker',
    options: ['want', 'open', 'no', 'have_kids']
  },
} as const

export type DimensionKey = keyof typeof DIMENSIONS
export type DimensionType = 'lifestyle' | 'values' | 'direct'
export type CompatibilityRule = 'similarity' | 'compatibility' | 'complementary' | 'dealbreaker'
```

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] File compiles without TypeScript errors
- [ ] Types are exported correctly
- [ ] Can import and use in other files

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
