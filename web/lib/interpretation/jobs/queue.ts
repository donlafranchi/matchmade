/**
 * Background job queue for profile analysis
 * Uses database polling for MVP simplicity
 */

import { prisma } from "../../prisma";
import { analyzeUserProfile } from "../analyze";

export interface AnalysisJob {
  id: string;
  userId: string;
  contextType: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "processing" | "completed" | "failed";
  source: "chat" | "view" | "manual";
  error?: string | null;
  retries: number;
  createdAt: Date;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

/**
 * Add job to queue
 * @param userId User ID
 * @param contextType Context type (romantic, friendship, etc.)
 * @param priority Job priority (high, medium, low)
 * @param source Trigger source (chat, view, manual)
 */
export async function enqueueAnalysis(
  userId: string,
  contextType: string,
  priority: "high" | "medium" | "low" = "medium",
  source: "chat" | "view" | "manual"
): Promise<void> {
  console.log(
    `[Queue] Enqueue request: userId=${userId}, context=${contextType}, priority=${priority}, source=${source}`
  );

  // Check if profile exists
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  if (!profile) {
    console.log(`[Queue] Skipping: profile not found for ${userId}`);
    return;
  }

  // Rate limit: Skip if analyzed < 1 hour ago
  // TESTING: Rate limit temporarily disabled for testing refresh functionality
  // TODO: Re-enable before production
  // const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  // if (profile.lastAnalyzed && profile.lastAnalyzed > oneHourAgo) {
  //   console.log(
  //     `[Queue] Skipping: analyzed recently (${profile.lastAnalyzed.toISOString()})`
  //   );
  //   return;
  // }

  // Check if already pending/processing
  const existingJob = await prisma.analysisJob.findFirst({
    where: {
      userId,
      contextType,
      status: { in: ["pending", "processing"] },
    },
  });

  if (existingJob) {
    console.log(
      `[Queue] Skipping: job already exists (${existingJob.status}, id=${existingJob.id})`
    );
    return;
  }

  // Create job
  const job = await prisma.analysisJob.create({
    data: {
      userId,
      contextType,
      priority,
      status: "pending",
      source,
      retries: 0,
    },
  });

  console.log(`[Queue] ✅ Enqueued job ${job.id} for ${userId}`);
}

/**
 * Process next job from queue
 * @returns true if job was processed, false if queue empty
 */
export async function processNextJob(): Promise<boolean> {
  // Get highest priority pending job
  // Priority order: high < medium < low (alphabetically)
  const job = await prisma.analysisJob.findFirst({
    where: { status: "pending" },
    orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
  });

  if (!job) {
    return false;
  }

  console.log(
    `[Queue] Processing job ${job.id} (${job.priority}, ${job.source})`
  );

  // Mark as processing
  await prisma.analysisJob.update({
    where: { id: job.id },
    data: {
      status: "processing",
      startedAt: new Date(),
    },
  });

  try {
    // Run analysis
    const result = await analyzeUserProfile(job.userId, job.contextType);

    if (result) {
      // Success
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          completedAt: new Date(),
        },
      });
      console.log(`[Queue] ✅ Completed job ${job.id}`);
      return true;
    } else {
      // No result (insufficient messages or low confidence)
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "completed",
          completedAt: new Date(),
          error: "Insufficient data or low confidence",
        },
      });
      console.log(`[Queue] ⚠️  Job ${job.id} completed with no result`);
      return true;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    console.error(`[Queue] ❌ Job ${job.id} error:`, errorMessage);

    // Retry logic
    if (job.retries < 3) {
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "pending",
          retries: job.retries + 1,
          error: errorMessage,
        },
      });
      console.log(
        `[Queue] 🔄 Retrying job ${job.id} (attempt ${job.retries + 1}/3)`
      );
    } else {
      // Max retries reached
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          completedAt: new Date(),
          error: errorMessage,
        },
      });
      console.error(
        `[Queue] ❌ Job ${job.id} failed after 3 retries:`,
        errorMessage
      );
    }

    return false;
  }
}

/**
 * Background polling worker
 * Polls queue every intervalMs and processes jobs
 * @param intervalMs Polling interval in milliseconds (default: 10000 = 10 seconds)
 */
export async function startJobWorker(intervalMs: number = 10000): Promise<void> {
  console.log(`[Queue] Starting job worker (polling every ${intervalMs}ms)`);

  setInterval(async () => {
    try {
      const processed = await processNextJob();
      if (processed) {
        // Process another immediately if one succeeded
        await processNextJob();
      }
    } catch (error) {
      console.error("[Queue] Worker error:", error);
    }
  }, intervalMs);
}

/**
 * Cleanup stuck jobs (processing for >5 minutes)
 * Should be called periodically (e.g., every hour)
 */
export async function cleanupStuckJobs(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const result = await prisma.analysisJob.updateMany({
    where: {
      status: "processing",
      startedAt: { lt: fiveMinutesAgo },
    },
    data: {
      status: "failed",
      completedAt: new Date(),
      error: "Job timeout (stuck in processing >5min)",
    },
  });

  if (result.count > 0) {
    console.log(`[Queue] ⚠️  Cleaned up ${result.count} stuck jobs`);
  }

  return result.count;
}
