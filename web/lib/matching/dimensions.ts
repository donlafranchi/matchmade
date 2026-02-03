// Matching dimensions with types and compatibility rules
// See design/experiential-profiling.md for full context

export type DimensionType = 'lifestyle' | 'values' | 'direct'
export type CompatibilityRule = 'similarity' | 'compatibility' | 'complementary'

interface DimensionDef {
  type: DimensionType
  rule: CompatibilityRule
  spectrum: string
}

interface DirectDimensionDef {
  type: 'direct'
  rule: CompatibilityRule
  options: readonly string[]
}

export const DIMENSIONS = {
  // Lifestyle
  schedule: {
    type: 'lifestyle',
    rule: 'similarity',
    spectrum: 'Morning person (+2) to Night owl (-2)',
  },
  energy: {
    type: 'lifestyle',
    rule: 'similarity',
    spectrum: 'High energy, always active (+2) to Low key, restorative (-2)',
  },
  social: {
    type: 'lifestyle',
    rule: 'compatibility',
    spectrum: 'Extrovert, energized by people (+2) to Introvert, needs solitude (-2)',
  },
  spontaneity: {
    type: 'lifestyle',
    rule: 'complementary',
    spectrum: 'Loves surprises, hates plans (+2) to Strong planner, needs structure (-2)',
  },
  location: {
    type: 'lifestyle',
    rule: 'compatibility',
    spectrum: 'Rooted, settled (+2) to Mobile, seeking change (-2)',
  },

  // Values
  trust: {
    type: 'values',
    rule: 'similarity',
    spectrum: 'Categories: consistency, honesty, autonomy, presence',
  },
  communication: {
    type: 'values',
    rule: 'similarity',
    spectrum: 'Deep, philosophical (+2) to Light, action-oriented (-2)',
  },
  conflict: {
    type: 'values',
    rule: 'compatibility',
    spectrum: 'Talk it through immediately (+2) to Need space, withdraw (-2)',
  },
  independence: {
    type: 'values',
    rule: 'compatibility',
    spectrum: 'High independence, separate lives (+2) to Very connected, do everything together (-2)',
  },
  growth: {
    type: 'values',
    rule: 'similarity',
    spectrum: 'Always improving, welcomes feedback (+2) to Self-accepting, take me as I am (-2)',
  },
  career: {
    type: 'values',
    rule: 'compatibility',
    spectrum: 'Career-focused, ambitious (+2) to Life over career (-2)',
  },

  // Direct (user can mark any as dealbreaker via ProfileDimension.dealbreaker)
  intent: {
    type: 'direct',
    rule: 'similarity',
    options: ['casual', 'open', 'serious', 'marriage_track', 'figuring_it_out'],
  },
  children: {
    type: 'direct',
    rule: 'similarity',
    options: ['want', 'open', 'no', 'have_kids'],
  },
} as const satisfies Record<string, DimensionDef | DirectDimensionDef>

export type DimensionKey = keyof typeof DIMENSIONS

// Helper to get dimensions by type
export function getDimensionsByType(type: DimensionType): DimensionKey[] {
  return (Object.keys(DIMENSIONS) as DimensionKey[]).filter(
    (key) => DIMENSIONS[key].type === type
  )
}

// Lifestyle dimensions for compatibility scoring
export const LIFESTYLE_DIMENSIONS = getDimensionsByType('lifestyle')

// Values dimensions for compatibility scoring
export const VALUES_DIMENSIONS = getDimensionsByType('values')

// Direct dimensions (typically dealbreakers)
export const DIRECT_DIMENSIONS = getDimensionsByType('direct')
