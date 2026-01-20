/**
 * API endpoint for fetching profile interpretations
 * GET /api/profile/interpretations?contextType=romantic&includePatterns=true
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  InterpretationsResponse,
  AnalysisStatus,
} from "@/lib/interpretation/api-types";

const VALID_CONTEXT_TYPES = [
  "romantic",
  "friendship",
  "professional",
  "creative",
  "service",
];

/**
 * GET /api/profile/interpretations
 * Fetch therapeutic interpretations for authenticated user
 *
 * Query params:
 * - contextType: romantic | friendship | professional | creative | service (required)
 * - includePatterns: true | false (optional, default: false)
 */
export async function GET(req: NextRequest) {
  // 1. Auth check
  const user = await requireSessionUser();

  // 2. Parse query params
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("contextType");
  const includePatterns = searchParams.get("includePatterns") === "true";

  // 3. Validate contextType
  if (!contextType) {
    return NextResponse.json(
      { error: "contextType query parameter required" },
      { status: 400 }
    );
  }

  if (!VALID_CONTEXT_TYPES.includes(contextType)) {
    return NextResponse.json(
      { error: `Invalid contextType. Must be one of: ${VALID_CONTEXT_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  try {
    // 4. Fetch profile with interpretations
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: {
        interpretations: true,
        rawPatterns: true,
        lastAnalyzed: true,
      },
    });

    // 5. Fetch context intent with interpretations
    const contextIntent = await prisma.contextIntent.findUnique({
      where: {
        userId_contextType: {
          userId: user.id,
          contextType: contextType as any,
        },
      },
      select: {
        interpretations: true,
      },
    });

    // 6. Check for active/pending jobs
    const activeJob = await prisma.analysisJob.findFirst({
      where: {
        userId: user.id,
        contextType,
        status: { in: ["pending", "processing"] },
      },
      orderBy: { createdAt: "desc" },
      select: {
        status: true,
        error: true,
      },
    });

    // 7. Count messages for metadata
    const contextProfile = await prisma.contextProfile.findUnique({
      where: {
        userId_contextType: {
          userId: user.id,
          contextType: contextType as any,
        },
      },
      select: {
        _count: {
          select: {
            chatMessages: {
              where: {
                offRecord: false,
                role: "user",
              },
            },
          },
        },
      },
    });

    const messageCount = contextProfile?._count.chatMessages || 0;
    const hasMinimumData = messageCount >= 10;

    // 8. Determine status
    let status: AnalysisStatus = "not_started";
    let error: string | undefined;

    if (activeJob) {
      status = activeJob.status as "pending" | "processing";
      error = activeJob.error || undefined;
    } else if (profile?.lastAnalyzed) {
      status = "completed";
    } else if (!hasMinimumData) {
      status = "not_started";
    }

    // Check for failed jobs (most recent completed job with error)
    if (status === "not_started" && !activeJob) {
      const failedJob = await prisma.analysisJob.findFirst({
        where: {
          userId: user.id,
          contextType,
          status: "failed",
        },
        orderBy: { completedAt: "desc" },
        select: {
          error: true,
        },
      });

      if (failedJob) {
        status = "failed";
        error = failedJob.error || "Analysis failed";
      }
    }

    // 9. Parse interpretations (Json → typed objects)
    const sharedInterpretations =
      profile?.interpretations &&
      typeof profile.interpretations === "object" &&
      Object.keys(profile.interpretations).length > 0
        ? (profile.interpretations as any)
        : null;

    const contextSpecificInterpretations =
      contextIntent?.interpretations &&
      typeof contextIntent.interpretations === "object" &&
      Object.keys(contextIntent.interpretations).length > 0
        ? (contextIntent.interpretations as any)
        : null;

    const rawPatterns =
      includePatterns &&
      profile?.rawPatterns &&
      typeof profile.rawPatterns === "object"
        ? (profile.rawPatterns as any)
        : undefined;

    // 10. Build response
    const response: InterpretationsResponse = {
      shared: sharedInterpretations,
      contextSpecific: contextSpecificInterpretations,
      meta: {
        lastAnalyzed: profile?.lastAnalyzed?.toISOString() || null,
        status,
        error,
        messageCount,
        hasMinimumData,
      },
      ...(rawPatterns && { patterns: rawPatterns }),
    };

    // 11. Add cache control header (1 minute)
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("[Interpretations API] Error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
