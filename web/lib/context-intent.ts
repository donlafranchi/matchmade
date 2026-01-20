import { ContextIntent, RelationshipContextType } from '../app/generated/prisma/client';
import { prisma } from './prisma';
import { calculateIntentCompleteness, findMissingIntentFields } from './completeness';
import { ContextIntentDto, ContextIntentPatch } from './types';

/**
 * Get or create ContextIntent for a user and context type
 */
export async function getOrCreateContextIntent(
  userId: string,
  contextType: RelationshipContextType
): Promise<ContextIntent> {
  let intent = await prisma.contextIntent.findUnique({
    where: { userId_contextType: { userId, contextType } },
  });

  if (!intent) {
    const missing = findMissingIntentFields(contextType, {} as ContextIntent);
    intent = await prisma.contextIntent.create({
      data: {
        userId,
        contextType,
        completeness: 0,
        missing,
      },
    });
  }

  return intent;
}

/**
 * Update ContextIntent fields
 */
export async function updateContextIntent(
  userId: string,
  contextType: RelationshipContextType,
  patch: ContextIntentPatch
): Promise<ContextIntent> {
  // Get or create intent
  const existing = await getOrCreateContextIntent(userId, contextType);

  // Build update data object
  const updateData: any = {};

  // Romantic fields
  if (patch.relationshipTimeline !== undefined) updateData.relationshipTimeline = patch.relationshipTimeline;
  if (patch.exclusivityExpectation !== undefined) updateData.exclusivityExpectation = patch.exclusivityExpectation;
  if (patch.familyIntentions !== undefined) updateData.familyIntentions = patch.familyIntentions;
  if (patch.attractionImportance !== undefined) updateData.attractionImportance = patch.attractionImportance;

  // Friendship fields
  if (patch.friendshipDepth !== undefined) updateData.friendshipDepth = patch.friendshipDepth;
  if (patch.groupActivityPreference !== undefined) updateData.groupActivityPreference = patch.groupActivityPreference;
  if (patch.emotionalSupportExpectation !== undefined) updateData.emotionalSupportExpectation = patch.emotionalSupportExpectation;

  // Professional fields
  if (patch.partnershipType !== undefined) updateData.partnershipType = patch.partnershipType;
  if (patch.commitmentHorizon !== undefined) updateData.commitmentHorizon = patch.commitmentHorizon;
  if (patch.complementarySkills !== undefined) updateData.complementarySkills = patch.complementarySkills;
  if (patch.equityOrRevShare !== undefined) updateData.equityOrRevShare = patch.equityOrRevShare;

  // Creative fields
  if (patch.creativeType !== undefined) updateData.creativeType = patch.creativeType;
  if (patch.roleNeeded !== undefined) updateData.roleNeeded = patch.roleNeeded;
  if (patch.processStyle !== undefined) updateData.processStyle = patch.processStyle;
  if (patch.egoBalance !== undefined) updateData.egoBalance = patch.egoBalance;
  if (patch.compensationExpectation !== undefined) updateData.compensationExpectation = patch.compensationExpectation;

  // Service fields
  if (patch.serviceType !== undefined) updateData.serviceType = patch.serviceType;
  if (patch.budgetRange !== undefined) updateData.budgetRange = patch.budgetRange;
  if (patch.timelineNeeded !== undefined) updateData.timelineNeeded = patch.timelineNeeded;
  if (patch.credentialsRequired !== undefined) updateData.credentialsRequired = patch.credentialsRequired;

  // Merge with existing
  const merged = { ...existing, ...updateData };

  // Calculate completeness
  const completeness = calculateIntentCompleteness(contextType, merged as ContextIntent);
  const missing = findMissingIntentFields(contextType, merged as ContextIntent);

  // Update intent
  const updated = await prisma.contextIntent.update({
    where: { userId_contextType: { userId, contextType } },
    data: {
      ...updateData,
      completeness,
      missing,
    },
  });

  return updated;
}

/**
 * Get ContextIntent as DTO
 */
export async function getContextIntentDto(
  userId: string,
  contextType: RelationshipContextType
): Promise<{
  intent: ContextIntentDto;
  completeness: number;
  missing: string[];
}> {
  const intent = await getOrCreateContextIntent(userId, contextType);
  const dto = serializeIntentToDto(intent, contextType);

  return {
    intent: dto,
    completeness: intent.completeness,
    missing: intent.missing,
  };
}

/**
 * Serialize ContextIntent model to DTO
 */
function serializeIntentToDto(intent: ContextIntent, contextType: RelationshipContextType): ContextIntentDto {
  const base: any = { contextType };

  // Include only fields relevant to this context type
  switch (contextType) {
    case 'romantic':
      return {
        ...base,
        relationshipTimeline: intent.relationshipTimeline || undefined,
        exclusivityExpectation: intent.exclusivityExpectation || undefined,
        familyIntentions: intent.familyIntentions || undefined,
        attractionImportance: intent.attractionImportance || undefined,
      };

    case 'friendship':
      return {
        ...base,
        friendshipDepth: intent.friendshipDepth || undefined,
        groupActivityPreference: intent.groupActivityPreference || undefined,
        emotionalSupportExpectation: intent.emotionalSupportExpectation || undefined,
      };

    case 'professional':
      return {
        ...base,
        partnershipType: intent.partnershipType || undefined,
        commitmentHorizon: intent.commitmentHorizon || undefined,
        complementarySkills: intent.complementarySkills ? (intent.complementarySkills as string[]) : undefined,
        equityOrRevShare: intent.equityOrRevShare || undefined,
      };

    case 'creative':
      return {
        ...base,
        creativeType: intent.creativeType || undefined,
        roleNeeded: intent.roleNeeded || undefined,
        processStyle: intent.processStyle || undefined,
        egoBalance: intent.egoBalance || undefined,
        compensationExpectation: intent.compensationExpectation || undefined,
      };

    case 'service':
      return {
        ...base,
        serviceType: intent.serviceType || undefined,
        budgetRange: intent.budgetRange || undefined,
        timelineNeeded: intent.timelineNeeded || undefined,
        credentialsRequired: intent.credentialsRequired || undefined,
      };

    default:
      return base;
  }
}

/**
 * Validate that patch fields are valid for the given context type
 */
export function validateIntentFields(
  contextType: RelationshipContextType,
  patch: ContextIntentPatch
): boolean {
  const validFields: Record<RelationshipContextType, string[]> = {
    romantic: ['relationshipTimeline', 'exclusivityExpectation', 'familyIntentions', 'attractionImportance'],
    friendship: ['friendshipDepth', 'groupActivityPreference', 'emotionalSupportExpectation'],
    professional: ['partnershipType', 'commitmentHorizon', 'complementarySkills', 'equityOrRevShare'],
    creative: ['creativeType', 'roleNeeded', 'processStyle', 'egoBalance', 'compensationExpectation'],
    service: ['serviceType', 'budgetRange', 'timelineNeeded', 'credentialsRequired'],
  };

  const allowed = validFields[contextType] || [];
  const patchKeys = Object.keys(patch).filter(k => k !== 'contextType');

  // Check if all patch keys are in the allowed list
  return patchKeys.every(key => allowed.includes(key));
}
