import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Debug endpoint - returns full profile data for current user
 * GET /api/debug/profile
 */
export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get all user data
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  const contextProfiles = await prisma.contextProfile.findMany({
    where: { userId: user.id },
    include: {
      chatMessages: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          role: true,
          content: true,
          offRecord: true,
          createdAt: true,
        },
      },
    },
  });

  const contextIntents = await prisma.contextIntent.findMany({
    where: { userId: user.id },
  });

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    profile: profile
      ? {
          id: profile.id,
          name: profile.name,
          location: profile.location,
          ageRange: profile.ageRange,
          coreValues: profile.coreValues,
          beliefs: profile.beliefs,
          interactionStyle: profile.interactionStyle,
          lifestyle: profile.lifestyle,
          constraints: profile.constraints,
          completeness: profile.completeness,
          missing: profile.missing,
          interpretations: profile.interpretations,
          rawPatterns: profile.rawPatterns,
          lastAnalyzed: profile.lastAnalyzed,
        }
      : null,
    contextProfiles: contextProfiles.map((cp) => ({
      id: cp.id,
      contextType: cp.contextType,
      tonePreference: cp.tonePreference,
      messageCount: cp.chatMessages.length,
      messages: cp.chatMessages,
    })),
    contextIntents: contextIntents.map((ci) => ({
      id: ci.id,
      contextType: ci.contextType,
      completeness: ci.completeness,
      missing: ci.missing,
      // Include all intent fields
      relationshipTimeline: ci.relationshipTimeline,
      exclusivityExpectation: ci.exclusivityExpectation,
      familyIntentions: ci.familyIntentions,
      attractionImportance: ci.attractionImportance,
      friendshipDepth: ci.friendshipDepth,
      groupActivityPreference: ci.groupActivityPreference,
      emotionalSupportExpectation: ci.emotionalSupportExpectation,
      partnershipType: ci.partnershipType,
      commitmentHorizon: ci.commitmentHorizon,
      complementarySkills: ci.complementarySkills,
      equityOrRevShare: ci.equityOrRevShare,
      creativeType: ci.creativeType,
      roleNeeded: ci.roleNeeded,
      processStyle: ci.processStyle,
      egoBalance: ci.egoBalance,
      compensationExpectation: ci.compensationExpectation,
      serviceType: ci.serviceType,
      budgetRange: ci.budgetRange,
      timelineNeeded: ci.timelineNeeded,
      credentialsRequired: ci.credentialsRequired,
    })),
  });
}
