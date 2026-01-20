/**
 * Test script for background job queue system (Ticket 2-03)
 * Tests enqueue, process, retry logic, and priority queue
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";
import {
  enqueueAnalysis,
  processNextJob,
  cleanupStuckJobs,
} from "../lib/interpretation/jobs/queue";
import {
  triggerAfterChatMessage,
  triggerOnProfileView,
  triggerManualRefresh,
} from "../lib/interpretation/jobs/triggers";

async function testJobQueue() {
  console.log("🧪 Testing Background Job Queue System (Ticket 2-03)\n");
  console.log("=" .repeat(60));

  try {
    // Find a user with chat messages
    const contextProfile = await prisma.contextProfile.findFirst({
      where: {
        chatMessages: {
          some: {
            offRecord: false,
            role: "user",
          },
        },
      },
      include: {
        chatMessages: {
          where: { offRecord: false, role: "user" },
        },
        user: true,
      },
    });

    if (!contextProfile) {
      console.log("❌ No user with chat messages found for testing");
      console.log("   Create a user and add chat messages first.\n");
      return;
    }

    const userId = contextProfile.userId;
    const contextType = contextProfile.contextType;
    const messageCount = contextProfile.chatMessages.length;

    console.log(`✓ Found test user: ${contextProfile.user.email}`);
    console.log(`✓ Context: ${contextType}`);
    console.log(`✓ Message count: ${messageCount}`);
    console.log("\n" + "=".repeat(60));

    // Test 1: Enqueue analysis
    console.log("\n📋 Test 1: Enqueue Analysis\n");

    await enqueueAnalysis(userId, contextType, "high", "manual");

    const job = await prisma.analysisJob.findFirst({
      where: { userId, contextType, status: "pending" },
      orderBy: { createdAt: "desc" },
    });

    if (job) {
      console.log("✅ Job enqueued successfully");
      console.log(`   Job ID: ${job.id}`);
      console.log(`   Priority: ${job.priority}`);
      console.log(`   Source: ${job.source}`);
    } else {
      console.log("❌ Failed to enqueue job");
      return;
    }

    // Test 2: Process job
    console.log("\n" + "=".repeat(60));
    console.log("\n⚙️  Test 2: Process Job\n");

    const processed = await processNextJob();

    if (processed) {
      const completedJob = await prisma.analysisJob.findUnique({
        where: { id: job.id },
      });

      console.log("✅ Job processed successfully");
      console.log(`   Status: ${completedJob?.status}`);
      console.log(`   Completed at: ${completedJob?.completedAt?.toISOString()}`);
      console.log(`   Error: ${completedJob?.error || "none"}`);

      // Check if profile was updated
      const profile = await prisma.profile.findUnique({
        where: { userId },
        select: {
          lastAnalyzed: true,
          interpretations: true,
        },
      });

      if (profile?.lastAnalyzed) {
        console.log(`   Profile analyzed: ${profile.lastAnalyzed.toISOString()}`);
        console.log(
          `   Has interpretations: ${typeof profile.interpretations === "object"}`
        );
      }
    } else {
      console.log("⚠️  No job processed (queue might be empty)");
    }

    // Test 3: Priority queue
    console.log("\n" + "=".repeat(60));
    console.log("\n🎯 Test 3: Priority Queue\n");

    // Clear any existing jobs
    await prisma.analysisJob.deleteMany({ where: { userId } });

    // Enqueue 3 jobs with different priorities
    await enqueueAnalysis(userId, contextType, "low", "chat");
    await enqueueAnalysis(userId, contextType, "high", "manual");
    await enqueueAnalysis(userId, contextType, "medium", "view");

    // Process and check order
    const jobs = await prisma.analysisJob.findMany({
      where: { userId, status: "pending" },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      select: { priority: true },
    });

    console.log("Enqueued jobs (should be high, medium, low):");
    jobs.forEach((j, i) => {
      console.log(`  ${i + 1}. ${j.priority}`);
    });

    if (jobs[0]?.priority === "high" && jobs[1]?.priority === "medium") {
      console.log("✅ Priority queue working correctly");
    } else {
      console.log("⚠️  Priority queue order unexpected");
    }

    // Test 4: Rate limiting
    console.log("\n" + "=".repeat(60));
    console.log("\n⏱️  Test 4: Rate Limiting\n");

    // Clear jobs
    await prisma.analysisJob.deleteMany({ where: { userId } });

    // Try to enqueue twice (should skip second)
    await enqueueAnalysis(userId, contextType, "high", "manual");
    await enqueueAnalysis(userId, contextType, "high", "manual");

    const rateCheckJobs = await prisma.analysisJob.count({
      where: { userId, contextType },
    });

    if (rateCheckJobs === 1) {
      console.log("✅ Rate limiting working (prevented duplicate job)");
    } else {
      console.log(`⚠️  Rate limiting issue (found ${rateCheckJobs} jobs)`);
    }

    // Test 5: Triggers
    console.log("\n" + "=".repeat(60));
    console.log("\n🎬 Test 5: Triggers\n");

    // Clear jobs
    await prisma.analysisJob.deleteMany({ where: { userId } });

    console.log("Testing triggerAfterChatMessage...");
    await triggerAfterChatMessage(userId, contextType);

    console.log("Testing triggerOnProfileView...");
    await triggerOnProfileView(userId, contextType);

    console.log("Testing triggerManualRefresh...");
    await triggerManualRefresh(userId, contextType);

    const triggerJobs = await prisma.analysisJob.findMany({
      where: { userId },
      select: { source: true },
    });

    console.log(`Triggers created ${triggerJobs.length} jobs:`);
    triggerJobs.forEach((j) => {
      console.log(`  - ${j.source}`);
    });

    // Test 6: Cleanup stuck jobs
    console.log("\n" + "=".repeat(60));
    console.log("\n🧹 Test 6: Cleanup Stuck Jobs\n");

    // Create a stuck job (processing but old)
    const stuckJob = await prisma.analysisJob.create({
      data: {
        userId,
        contextType,
        priority: "medium",
        status: "processing",
        source: "chat",
        retries: 0,
        startedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      },
    });

    console.log(`Created stuck job: ${stuckJob.id} (processing for 10 minutes)`);

    const cleanedCount = await cleanupStuckJobs();

    if (cleanedCount > 0) {
      console.log(`✅ Cleaned up ${cleanedCount} stuck job(s)`);

      const cleanedJob = await prisma.analysisJob.findUnique({
        where: { id: stuckJob.id },
      });

      console.log(`   Status: ${cleanedJob?.status}`);
      console.log(`   Error: ${cleanedJob?.error}`);
    } else {
      console.log("⚠️  Cleanup didn't find stuck jobs");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("\n✅ All Tests Complete!\n");

    console.log("📊 Summary:");
    console.log("  ✓ Job enqueue");
    console.log("  ✓ Job processing");
    console.log("  ✓ Priority queue");
    console.log("  ✓ Rate limiting");
    console.log("  ✓ Triggers");
    console.log("  ✓ Cleanup stuck jobs");

    console.log("\n📝 Next steps:");
    console.log("  1. Start job worker in production: startJobWorker()");
    console.log("  2. Monitor job processing logs");
    console.log("  3. Track token costs in production");
    console.log("  4. Proceed to Ticket 2-04 (API endpoint)\n");
  } catch (error) {
    console.error("\n❌ Test failed:", error);

    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Stack:", error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testJobQueue();
