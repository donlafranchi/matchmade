/**
 * Analysis job triggers
 * Handles automatic triggers for analysis jobs
 */

import { prisma } from "../../prisma";
import { enqueueAnalysis } from "./queue";

/**
 * Trigger after chat message
 * Enqueues analysis if 5+ new messages since last analysis
 * @param userId User ID
 * @param contextType Context type
 */
export async function triggerAfterChatMessage(
  userId: string,
  contextType: string
): Promise<void> {
  console.log(
    `[Triggers] Chat message trigger: userId=${userId}, context=${contextType}`
  );

  // Get profile with last analysis time
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    console.log(`[Triggers] Skipping: profile not found`);
    return;
  }

  // Count messages since last analysis
  const contextProfile = await prisma.contextProfile.findUnique({
    where: {
      userId_contextType: {
        userId,
        contextType: contextType as any,
      },
    },
    include: {
      chatMessages: {
        where: {
          offRecord: false,
          role: "user",
          createdAt: {
            gt: profile.lastAnalyzed || new Date(0),
          },
        },
      },
    },
  });

  const newMessageCount = contextProfile?.chatMessages?.length || 0;

  console.log(
    `[Triggers] New messages since last analysis: ${newMessageCount}`
  );

  // Trigger if 5+ new messages
  if (newMessageCount >= 5) {
    console.log(`[Triggers] Threshold met (${newMessageCount} >= 5), enqueueing`);
    await enqueueAnalysis(userId, contextType, "low", "chat");
  } else {
    console.log(
      `[Triggers] Threshold not met (${newMessageCount} < 5), skipping`
    );
  }
}

/**
 * Trigger on profile view
 * Enqueues analysis if interpretations are stale (>1 hour old)
 * @param userId User ID
 * @param contextType Context type
 */
export async function triggerOnProfileView(
  userId: string,
  contextType: string
): Promise<void> {
  console.log(
    `[Triggers] Profile view trigger: userId=${userId}, context=${contextType}`
  );

  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    console.log(`[Triggers] Skipping: profile not found`);
    return;
  }

  // Check staleness
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const isStale = !profile.lastAnalyzed || profile.lastAnalyzed < oneHourAgo;

  if (isStale) {
    console.log(
      `[Triggers] Interpretations stale (last: ${profile.lastAnalyzed?.toISOString() || "never"}), enqueueing`
    );
    await enqueueAnalysis(userId, contextType, "medium", "view");
  } else {
    console.log(
      `[Triggers] Interpretations fresh (last: ${profile.lastAnalyzed?.toISOString() || "unknown"}), skipping`
    );
  }
}

/**
 * Manual refresh trigger
 * Enqueues high-priority analysis job (bypasses staleness check)
 * @param userId User ID
 * @param contextType Context type
 */
export async function triggerManualRefresh(
  userId: string,
  contextType: string
): Promise<void> {
  console.log(
    `[Triggers] Manual refresh trigger: userId=${userId}, context=${contextType}`
  );

  // High priority, bypass staleness check (rate limit still applies in queue)
  await enqueueAnalysis(userId, contextType, "high", "manual");
}
