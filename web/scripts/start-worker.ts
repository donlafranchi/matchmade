#!/usr/bin/env tsx

/**
 * Background Job Worker
 * Polls the database every 10 seconds for pending analysis jobs and processes them
 *
 * Usage: npm run worker
 * Or: npx tsx scripts/start-worker.ts
 */

import "dotenv/config";
import { startJobWorker, cleanupStuckJobs } from "../lib/interpretation/jobs/queue";

async function main() {
  console.log("========================================");
  console.log("🚀 Starting Matchmade Job Worker");
  console.log("========================================");
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@')}`);
  console.log("");

  // Cleanup any stuck jobs first
  console.log("🧹 Cleaning up stuck jobs...");
  const cleaned = await cleanupStuckJobs();
  if (cleaned > 0) {
    console.log(`✅ Cleaned up ${cleaned} stuck job(s)`);
  } else {
    console.log("✅ No stuck jobs found");
  }
  console.log("");

  // Start the worker (polls every 10 seconds)
  console.log("👷 Starting job worker (polling every 10 seconds)");
  console.log("Press Ctrl+C to stop");
  console.log("========================================");
  console.log("");

  await startJobWorker(10000);

  // Cleanup stuck jobs every hour
  setInterval(async () => {
    console.log("\n🧹 Running hourly cleanup...");
    const cleaned = await cleanupStuckJobs();
    if (cleaned > 0) {
      console.log(`✅ Cleaned up ${cleaned} stuck job(s)\n`);
    }
  }, 60 * 60 * 1000); // 1 hour
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n👋 Shutting down worker...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n👋 Shutting down worker...");
  process.exit(0);
});

main().catch((error) => {
  console.error("❌ Worker failed to start:", error);
  process.exit(1);
});
