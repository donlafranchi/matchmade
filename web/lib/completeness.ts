import { Profile, ContextIntent, RelationshipContextType } from '../app/generated/prisma/client';

// Required fields for shared Profile
const REQUIRED_SHARED_FIELDS = ['location', 'ageRange', 'coreValues'];
const OPTIONAL_SHARED_FIELDS = ['beliefs', 'interactionStyle', 'lifestyle', 'constraints'];

// Required fields per context type
const REQUIRED_INTENT_FIELDS: Record<RelationshipContextType, string[]> = {
  romantic: ['relationshipTimeline', 'exclusivityExpectation', 'familyIntentions'],
  friendship: ['friendshipDepth', 'groupActivityPreference'],
  professional: ['partnershipType', 'commitmentHorizon'],
  creative: ['creativeType', 'roleNeeded', 'processStyle'],
  service: ['serviceType', 'budgetRange', 'timelineNeeded'],
};

/**
 * Check if a field value is considered "filled"
 */
function isFilled(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

/**
 * Calculate completeness score for shared Profile (0-100)
 */
export function calculateSharedCompleteness(profile: Profile): number {
  let filled = 0;
  let total = REQUIRED_SHARED_FIELDS.length;

  // Check required fields
  for (const field of REQUIRED_SHARED_FIELDS) {
    const value = (profile as any)[field];
    if (isFilled(value)) {
      filled++;
    }
  }

  // Check optional fields (count as 0.5 each)
  for (const field of OPTIONAL_SHARED_FIELDS) {
    const value = (profile as any)[field];
    if (isFilled(value)) {
      filled += 0.5;
      total += 0.5;
    }
  }

  return total > 0 ? Math.round((filled / total) * 100) : 0;
}

/**
 * Calculate completeness score for ContextIntent (0-100)
 */
export function calculateIntentCompleteness(
  contextType: RelationshipContextType,
  intent: ContextIntent
): number {
  const requiredFields = REQUIRED_INTENT_FIELDS[contextType] || [];
  if (requiredFields.length === 0) return 0;

  let filled = 0;
  for (const field of requiredFields) {
    const value = (intent as any)[field];
    if (isFilled(value)) {
      filled++;
    }
  }

  return Math.round((filled / requiredFields.length) * 100);
}

/**
 * Find missing required fields in shared Profile
 */
export function findMissingSharedFields(profile: Profile): string[] {
  const missing: string[] = [];

  for (const field of REQUIRED_SHARED_FIELDS) {
    const value = (profile as any)[field];
    if (!isFilled(value)) {
      missing.push(field);
    }
  }

  return missing;
}

/**
 * Find missing required fields in ContextIntent
 */
export function findMissingIntentFields(
  contextType: RelationshipContextType,
  intent: ContextIntent
): string[] {
  const requiredFields = REQUIRED_INTENT_FIELDS[contextType] || [];
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = (intent as any)[field];
    if (!isFilled(value)) {
      missing.push(field);
    }
  }

  return missing;
}
