import { Profile } from '../app/generated/prisma/client';
import { prisma } from './prisma';
import { calculateSharedCompleteness, findMissingSharedFields } from './completeness';
import { ProfileDto } from './types';

/**
 * Get or create shared Profile for a user
 */
export async function getOrCreateSharedProfile(userId: string): Promise<Profile> {
  let profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.profile.create({
      data: {
        userId,
        coreValues: [],
        beliefs: {},
        interactionStyle: {},
        lifestyle: {},
        constraints: [],
        completeness: 0,
        missing: ['location', 'ageRange', 'coreValues'],
      },
    });
  }

  return profile;
}

/**
 * Update shared Profile fields
 */
export async function updateSharedProfile(
  userId: string,
  patch: Partial<ProfileDto>
): Promise<Profile> {
  // Get or create profile
  const existing = await getOrCreateSharedProfile(userId);

  // Build update data object
  const updateData: any = {};

  if (patch.coreValues !== undefined) updateData.coreValues = patch.coreValues;
  if (patch.beliefs !== undefined) updateData.beliefs = patch.beliefs;
  if (patch.interactionStyle !== undefined) updateData.interactionStyle = patch.interactionStyle;
  if (patch.lifestyle !== undefined) updateData.lifestyle = patch.lifestyle;
  if (patch.constraints !== undefined) updateData.constraints = patch.constraints;
  if (patch.location !== undefined) updateData.location = patch.location;
  if (patch.ageRange !== undefined) updateData.ageRange = patch.ageRange;
  if (patch.name !== undefined) updateData.name = patch.name;

  // Merge with existing data
  const merged: any = {
    coreValues: updateData.coreValues !== undefined ? updateData.coreValues : existing.coreValues,
    beliefs: updateData.beliefs !== undefined ? updateData.beliefs : existing.beliefs,
    interactionStyle: updateData.interactionStyle !== undefined ? updateData.interactionStyle : existing.interactionStyle,
    lifestyle: updateData.lifestyle !== undefined ? updateData.lifestyle : existing.lifestyle,
    constraints: updateData.constraints !== undefined ? updateData.constraints : existing.constraints,
    location: updateData.location !== undefined ? updateData.location : existing.location,
    ageRange: updateData.ageRange !== undefined ? updateData.ageRange : existing.ageRange,
    name: updateData.name !== undefined ? updateData.name : existing.name,
  };

  // Calculate completeness
  const completeness = calculateSharedCompleteness(merged as Profile);
  const missing = findMissingSharedFields(merged as Profile);

  // Update profile
  const updated = await prisma.profile.update({
    where: { userId },
    data: {
      ...updateData,
      completeness,
      missing,
    },
  });

  return updated;
}

/**
 * Get shared Profile as DTO
 */
export async function getSharedProfileDto(userId: string): Promise<{
  profile: ProfileDto;
  completeness: number;
  missing: string[];
}> {
  const profile = await getOrCreateSharedProfile(userId);
  const dto = serializeProfileToDto(profile);

  return {
    profile: dto,
    completeness: profile.completeness,
    missing: profile.missing,
  };
}

/**
 * Serialize Profile model to DTO
 */
function serializeProfileToDto(profile: Profile): ProfileDto {
  return {
    coreValues: Array.isArray(profile.coreValues) ? profile.coreValues as string[] : [],
    beliefs: typeof profile.beliefs === 'object' ? profile.beliefs as Record<string, unknown> : {},
    interactionStyle: typeof profile.interactionStyle === 'object' ? profile.interactionStyle as Record<string, unknown> : {},
    lifestyle: typeof profile.lifestyle === 'object' ? profile.lifestyle as Record<string, unknown> : {},
    constraints: Array.isArray(profile.constraints) ? profile.constraints as string[] : [],
    location: profile.location || undefined,
    ageRange: profile.ageRange || undefined,
    name: profile.name || undefined,
  };
}
