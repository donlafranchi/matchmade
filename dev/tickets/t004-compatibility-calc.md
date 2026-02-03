# T004 - Compatibility Calculation

## Goal
Calculate compatibility scores between two users based on their dimension scores, with user-defined dealbreakers as hard filters.

## Acceptance Criteria
- [ ] Function to calculate per-dimension compatibility
- [ ] Different rules: similarity, compatibility, complementary
- [ ] Overall match score combining lifestyle and values
- [ ] Confidence level based on data completeness
- [ ] User-defined dealbreaker detection (from `dealbreaker` flag on ProfileDimension)
- [ ] Dealbreakers filter out matches entirely (not just score 0)

## Constraints
- Dealbreakers are user-defined, not hardcoded per dimension
- If user A marks dimension X as dealbreaker, check if B's position is compatible
- Missing dimensions: if A requires X and B hasn't answered → no match
- Handle answered dimensions gracefully (neutral score for non-dealbreakers)
- Keep math simple and explainable

## Plan
1. Create lib/matching/compatibility.ts
2. Implement dimensionCompatibility function
3. Implement calculateMatch function
4. Add checkDealbreakers helper
5. Create API endpoint for getting match score

## Code

```typescript
// web/lib/matching/compatibility.ts

import { prisma } from '@/lib/prisma'
import { DIMENSIONS, DimensionKey, CompatibilityRule } from './dimensions'

interface DimensionScore {
  formation: number
  position: number
  importance: number
  dealbreaker: boolean
}

interface MatchResult {
  compatible: false
  reason: string[]
} | {
  compatible: true
  lifestyle: number
  values: number
  overall: number
  confidence: 'low' | 'medium' | 'high'
}

// Check if two users can be matched (dealbreaker check)
export function checkDealbreakers(
  a: Map<string, DimensionScore>,
  b: Map<string, DimensionScore>
): string[] {
  const blocked: string[] = []

  // Check A's dealbreakers against B
  for (const [dim, scoreA] of a.entries()) {
    if (!scoreA.dealbreaker) continue

    const scoreB = b.get(dim)

    // B hasn't answered a dimension A requires
    if (!scoreB || scoreB.formation === 0) {
      blocked.push(`${dim}:missing`)
      continue
    }

    // Check if positions are incompatible (opposite ends of spectrum)
    const distance = Math.abs(scoreA.position - scoreB.position)
    if (distance > 2) {
      blocked.push(`${dim}:incompatible`)
    }
  }

  // Check B's dealbreakers against A
  for (const [dim, scoreB] of b.entries()) {
    if (!scoreB.dealbreaker) continue

    const scoreA = a.get(dim)

    if (!scoreA || scoreA.formation === 0) {
      blocked.push(`${dim}:missing`)
      continue
    }

    const distance = Math.abs(scoreA.position - scoreB.position)
    if (distance > 2) {
      blocked.push(`${dim}:incompatible`)
    }
  }

  return [...new Set(blocked)] // dedupe
}

export function dimensionCompatibility(
  a: DimensionScore | null,
  b: DimensionScore | null,
  rule: CompatibilityRule
): number {
  // Missing data = neutral
  if (!a || !b || a.formation === 0 || b.formation === 0) return 50

  const confidence = Math.min(a.formation, b.formation) / 4
  let baseScore: number

  switch (rule) {
    case 'similarity':
      const diff = Math.abs(a.position - b.position)
      baseScore = Math.max(0, 100 - (diff * 25))
      break
    case 'compatibility':
      const distance = Math.abs(a.position - b.position)
      baseScore = distance <= 2 ? 100 - (distance * 15) : 30
      break
    case 'complementary':
      baseScore = 70 // Most combinations work
      break
  }

  const importanceWeight = Math.max(a.importance, b.importance) / 3
  return Math.round(baseScore * (0.5 + (confidence * 0.3) + (importanceWeight * 0.2)))
}

export async function calculateMatch(userAId: string, userBId: string): Promise<MatchResult> {
  const [dimensionsA, dimensionsB] = await Promise.all([
    getDimensionMap(userAId),
    getDimensionMap(userBId)
  ])

  // Check dealbreakers first - these are hard filters
  const blocked = checkDealbreakers(dimensionsA, dimensionsB)
  if (blocked.length > 0) {
    return { compatible: false, reason: blocked }
  }

  // Calculate lifestyle score
  const lifestyleScores = ['schedule', 'energy', 'social', 'spontaneity'].map(dim =>
    dimensionCompatibility(
      dimensionsA.get(dim) || null,
      dimensionsB.get(dim) || null,
      DIMENSIONS[dim as DimensionKey].rule
    )
  )
  const lifestyle = average(lifestyleScores)

  // Calculate values score
  const valuesScores = ['trust', 'communication', 'conflict', 'independence', 'growth'].map(dim =>
    dimensionCompatibility(
      dimensionsA.get(dim) || null,
      dimensionsB.get(dim) || null,
      DIMENSIONS[dim as DimensionKey].rule
    )
  )
  const values = average(valuesScores)

  const overall = Math.round((lifestyle * 0.5) + (values * 0.5))
  const confidence = calculateConfidence(dimensionsA, dimensionsB)

  return { compatible: true, lifestyle, values, overall, confidence }
}

async function getDimensionMap(userId: string): Promise<Map<string, DimensionScore>> {
  const dimensions = await prisma.profileDimension.findMany({ where: { userId } })
  return new Map(dimensions.map(d => [d.dimension, {
    formation: d.formation,
    position: d.position,
    importance: d.importance,
    dealbreaker: d.dealbreaker
  }]))
}

function calculateConfidence(a: Map<string, DimensionScore>, b: Map<string, DimensionScore>): 'low' | 'medium' | 'high' {
  const totalDimensions = Object.keys(DIMENSIONS).length
  const aCount = [...a.values()].filter(d => d.formation > 0).length
  const bCount = [...b.values()].filter(d => d.formation > 0).length
  const avgCompleteness = ((aCount + bCount) / 2) / totalDimensions

  if (avgCompleteness < 0.3) return 'low'
  if (avgCompleteness < 0.6) return 'medium'
  return 'high'
}

function average(nums: number[]): number {
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}
```

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Two users with similar scores get high compatibility
- [ ] User-defined dealbreakers filter out incompatible matches (`compatible: false`)
- [ ] If A requires dimension X and B hasn't answered → no match
- [ ] Missing non-dealbreaker dimensions return neutral (50)
- [ ] Confidence reflects data completeness
- [ ] Sparse profiles work (just smaller candidate pool)

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
