# T004 - Compatibility Calculation

## Goal
Calculate compatibility scores between two users based on their dimension scores.

## Acceptance Criteria
- [ ] Function to calculate per-dimension compatibility
- [ ] Different rules: similarity, compatibility, complementary, dealbreaker
- [ ] Overall match score combining lifestyle and values
- [ ] Confidence level based on data completeness
- [ ] Dealbreaker detection that blocks matches

## Constraints
- Return 0 if dealbreakers conflict
- Handle missing dimensions gracefully (neutral score)
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
}

interface MatchScore {
  lifestyle: number
  values: number
  overall: number
  confidence: 'low' | 'medium' | 'high'
  dealbreakers: string[]
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
    case 'dealbreaker':
      baseScore = a.position === b.position ? 100 : 0
      break
  }

  const importanceWeight = Math.max(a.importance, b.importance) / 3
  return Math.round(baseScore * (0.5 + (confidence * 0.3) + (importanceWeight * 0.2)))
}

export async function calculateMatch(userAId: string, userBId: string): Promise<MatchScore> {
  const [dimensionsA, dimensionsB] = await Promise.all([
    getDimensionMap(userAId),
    getDimensionMap(userBId)
  ])

  // Check dealbreakers first
  const dealbreakers = checkDealbreakers(dimensionsA, dimensionsB)
  if (dealbreakers.length > 0) {
    return { lifestyle: 0, values: 0, overall: 0, confidence: 'high', dealbreakers }
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

  return { lifestyle, values, overall, confidence, dealbreakers: [] }
}

async function getDimensionMap(userId: string): Promise<Map<string, DimensionScore>> {
  const dimensions = await prisma.profileDimension.findMany({ where: { userId } })
  return new Map(dimensions.map(d => [d.dimension, {
    formation: d.formation,
    position: d.position,
    importance: d.importance
  }]))
}

function checkDealbreakers(a: Map<string, DimensionScore>, b: Map<string, DimensionScore>): string[] {
  const dealbreakers: string[] = []

  // Intent must align
  const intentA = a.get('intent')
  const intentB = b.get('intent')
  if (intentA && intentB && intentA.position !== intentB.position) {
    dealbreakers.push('intent')
  }

  // Children must be compatible
  const childrenA = a.get('children')
  const childrenB = b.get('children')
  if (childrenA && childrenB) {
    // want + no = dealbreaker
    if ((childrenA.position === 2 && childrenB.position === -2) ||
        (childrenA.position === -2 && childrenB.position === 2)) {
      dealbreakers.push('children')
    }
  }

  return dealbreakers
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
- [ ] Dealbreakers return 0 overall score
- [ ] Missing data returns neutral (50) per dimension
- [ ] Confidence reflects data completeness

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
