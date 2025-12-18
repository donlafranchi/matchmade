import {
  Prisma,
  RelationshipContextType,
} from "@/app/generated/prisma";
import { prisma } from "./prisma";

export type ProfileDto = {
  name?: string;
  ageRange?: "18-24" | "25-34" | "35-44" | "45-54" | "55+";
  location?: string;
  intent?: string;
  dealbreakers?: string[];
  preferences?: string[];
};

const profileFields: (keyof ProfileDto)[] = [
  "name",
  "ageRange",
  "location",
  "intent",
  "dealbreakers",
  "preferences",
];

export function sanitizePatch(patch: Record<string, unknown>): ProfileDto {
  const result: ProfileDto = {};
  for (const key of profileFields) {
    const value = patch[key as string];
    if (value === undefined || value === null) continue;
    if (key === "dealbreakers" || key === "preferences") {
      if (Array.isArray(value)) {
        const cleaned = value
          .map((v) => (typeof v === "string" ? v.trim() : ""))
          .filter(Boolean);
        result[key] = cleaned;
      }
      continue;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed) {
        result[key] = trimmed as any;
      }
    }
  }
  return result;
}

export function mergeProfile(
  existing: ProfileDto | null,
  patch: ProfileDto,
): ProfileDto {
  return { ...(existing ?? {}), ...patch };
}

export function computeCompleteness(profile: ProfileDto) {
  const total = profileFields.length;
  const missing: string[] = [];
  let present = 0;

  for (const key of profileFields) {
    const value = profile[key];
    const isArray =
      key === "dealbreakers" || key === "preferences"
        ? Array.isArray(value) && value.length > 0
        : typeof value === "string" && value.trim().length > 0;

    if (isArray) {
      present += 1;
    } else if (typeof value === "string" && value.trim().length > 0) {
      present += 1;
    } else {
      missing.push(key);
    }
  }

  const completeness = Math.round((present / total) * 100);
  return { completeness, missing };
}

export async function getOrCreateProfile(contextProfileId: string) {
  const existing = await prisma.profile.findUnique({
    where: { contextProfileId },
  });
  if (existing) return existing;
  const { completeness, missing } = computeCompleteness({});
  return prisma.profile.create({
    data: {
      contextProfileId,
      data: {},
      completeness,
      missing,
    },
  });
}

export function toDto(profile: Prisma.ProfileGetPayload<{}>): {
  profile: ProfileDto | null;
  completeness: number;
  missing: string[];
} {
  const data = (profile.data as ProfileDto) || {};
  return {
    profile: Object.keys(data).length ? data : null,
    completeness: profile.completeness,
    missing: profile.missing,
  };
}
