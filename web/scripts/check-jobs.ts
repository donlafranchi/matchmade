#!/usr/bin/env tsx

/**
 * Check Analysis Job Status
 * Quick script to see what's happening with analysis jobs
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("========================================");
  console.log("📊 Analysis Job Status");
  console.log("========================================\n");

  // Get all jobs (most recent first)
  const jobs = await prisma.analysisJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  if (jobs.length === 0) {
    console.log("No jobs found.\n");
  } else {
    console.log(`Found ${jobs.length} recent job(s):\n`);

    jobs.forEach((job, i) => {
      const statusEmoji =
        job.status === "completed"
          ? "✅"
          : job.status === "processing"
            ? "⏳"
            : job.status === "failed"
              ? "❌"
              : "⏸️";

      console.log(`${i + 1}. ${statusEmoji} Job ${job.id.slice(0, 8)}...`);
      console.log(`   User: ${job.user.email}`);
      console.log(`   Context: ${job.contextType}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Priority: ${job.priority}`);
      console.log(`   Source: ${job.source}`);
      console.log(`   Created: ${job.createdAt.toLocaleString()}`);
      if (job.completedAt) {
        const duration =
          (job.completedAt.getTime() - job.createdAt.getTime()) / 1000;
        console.log(`   Completed: ${job.completedAt.toLocaleString()} (${duration}s)`);
      }
      if (job.error) {
        console.log(`   Error: ${job.error}`);
      }
      console.log("");
    });
  }

  // Check last analysis time for each user
  console.log("========================================");
  console.log("👤 User Last Analysis Times");
  console.log("========================================\n");

  const profiles = await prisma.profile.findMany({
    include: {
      user: {
        select: { email: true },
      },
    },
  });

  profiles.forEach((profile) => {
    const timeSince = profile.lastAnalyzed
      ? Math.round((Date.now() - profile.lastAnalyzed.getTime()) / 1000 / 60)
      : null;

    console.log(`${profile.user.email}:`);
    console.log(
      `  Last analyzed: ${profile.lastAnalyzed ? profile.lastAnalyzed.toLocaleString() : "Never"}`
    );
    if (timeSince !== null) {
      console.log(`  Time since: ${timeSince} minutes ago`);
      console.log(
        `  Rate limit: ${timeSince < 60 ? `🔒 ${60 - timeSince} min remaining` : "✅ Ready"}`
      );
    }
    console.log("");
  });

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
