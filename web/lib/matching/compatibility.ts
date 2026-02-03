// Compatibility calculation between two users
// See design/experiential-profiling.md for scoring logic

import { prisma } from '@/lib/prisma'
import {
  DIMENSIONS,
  DimensionKey,
  CompatibilityRule,
  LIFESTYLE_DIMENSIONS,
  VALUES_DIMENSIONS,
} from './dimensions'

interface DimensionScore {
  formation: number
  position: number
  importance: number
  dealbreaker: boolean
}

type DimensionMap = Map<string, DimensionScore>

export type MatchResult =
  | { compatible: false; reason: string[] }
  | {
      compatible: true
      lifestyle: number
      values: number
      overall: number
      confidence: 'low' | 'medium' | 'high'
    }

/**
 * Check if two users have incompatible dealbreakers
 * Returns list of blocking reasons, empty if compatible
 */
export function checkDealbreakers(a: DimensionMap, b: DimensionMap): string[] {
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

/**
 * Calculate compatibility score for a single dimension
 */
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
    case 'similarity': {
      // Same position = 100, each step apart = -25
      const diff = Math.abs(a.position - b.position)
      baseScore = Math.max(0, 100 - diff * 25)
      break
    }
    case 'compatibility': {
      // Within 2 = good, beyond = poor
      const distance = Math.abs(a.position - b.position)
      baseScore = distance <= 2 ? 100 - distance * 15 : 30
      break
    }
    case 'complementary':
      // Most combinations work
      baseScore = 70
      break
  }

  // Weight by formation confidence and importance
  const importanceWeight = Math.max(a.importance, b.importance) / 3
  return Math.round(baseScore * (0.5 + confidence * 0.3 + importanceWeight * 0.2))
}

/**
 * Calculate overall match score between two users
 */
export async function calculateMatch(
  userAId: string,
  userBId: string
): Promise<MatchResult> {
  const [dimensionsA, dimensionsB] = await Promise.all([
    getDimensionMap(userAId),
    getDimensionMap(userBId),
  ])

  // Check dealbreakers first - these are hard filters
  const blocked = checkDealbreakers(dimensionsA, dimensionsB)
  if (blocked.length > 0) {
    return { compatible: false, reason: blocked }
  }

  // Calculate lifestyle score
  const lifestyleScores = LIFESTYLE_DIMENSIONS.map((dim) =>
    dimensionCompatibility(
      dimensionsA.get(dim) || null,
      dimensionsB.get(dim) || null,
      DIMENSIONS[dim].rule
    )
  )
  const lifestyle = average(lifestyleScores)

  // Calculate values score
  const valuesScores = VALUES_DIMENSIONS.map((dim) =>
    dimensionCompatibility(
      dimensionsA.get(dim) || null,
      dimensionsB.get(dim) || null,
      DIMENSIONS[dim].rule
    )
  )
  const values = average(valuesScores)

  const overall = Math.round(lifestyle * 0.5 + values * 0.5)
  const confidence = calculateConfidence(dimensionsA, dimensionsB)

  return { compatible: true, lifestyle, values, overall, confidence }
}

/**
 * Calculate match without database lookup (for testing or batch processing)
 */
export function calculateMatchFromMaps(
  dimensionsA: DimensionMap,
  dimensionsB: DimensionMap
): MatchResult {
  const blocked = checkDealbreakers(dimensionsA, dimensionsB)
  if (blocked.length > 0) {
    return { compatible: false, reason: blocked }
  }

  const lifestyleScores = LIFESTYLE_DIMENSIONS.map((dim) =>
    dimensionCompatibility(
      dimensionsA.get(dim) || null,
      dimensionsB.get(dim) || null,
      DIMENSIONS[dim].rule
    )
  )
  const lifestyle = average(lifestyleScores)

  const valuesScores = VALUES_DIMENSIONS.map((dim) =>
    dimensionCompatibility(
      dimensionsA.get(dim) || null,
      dimensionsB.get(dim) || null,
      DIMENSIONS[dim].rule
    )
  )
  const values = average(valuesScores)

  const overall = Math.round(lifestyle * 0.5 + values * 0.5)
  const confidence = calculateConfidence(dimensionsA, dimensionsB)

  return { compatible: true, lifestyle, values, overall, confidence }
}

/**
 * Get dimension scores for a user as a Map
 */
async function getDimensionMap(userId: string): Promise<DimensionMap> {
  const dimensions = await prisma.profileDimension.findMany({
    where: { userId },
  })
  return new Map(
    dimensions.map((d) => [
      d.dimension,
      {
        formation: d.formation,
        position: d.position,
        importance: d.importance,
        dealbreaker: d.dealbreaker,
      },
    ])
  )
}

/**
 * Calculate confidence based on profile completeness
 */
function calculateConfidence(
  a: DimensionMap,
  b: DimensionMap
): 'low' | 'medium' | 'high' {
  const totalDimensions = Object.keys(DIMENSIONS).length
  const aCount = [...a.values()].filter((d) => d.formation > 0).length
  const bCount = [...b.values()].filter((d) => d.formation > 0).length
  const avgCompleteness = (aCount + bCount) / 2 / totalDimensions

  if (avgCompleteness < 0.3) return 'low'
  if (avgCompleteness < 0.6) return 'medium'
  return 'high'
}

function average(nums: number[]): number {
  if (nums.length === 0) return 50
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length)
}
