/**
 * Reset database - wipes all data for fresh testing
 * Usage: npx tsx scripts/reset-db.ts
 */

import "dotenv/config";
import { prisma } from "../lib/prisma";

async function resetDatabase() {
  console.log("Resetting database...\n");

  // Delete in order to respect foreign key constraints
  const tables = [
    { name: "ChatMessage", model: prisma.chatMessage },
    { name: "AnalysisJob", model: prisma.analysisJob },
    { name: "ContextIntent", model: prisma.contextIntent },
    { name: "ContextProfile", model: prisma.contextProfile },
    { name: "Profile", model: prisma.profile },
    { name: "User", model: prisma.user },
  ];

  for (const table of tables) {
    try {
      const count = await (table.model as any).deleteMany({});
      console.log(`  Deleted ${count.count} rows from ${table.name}`);
    } catch (error: any) {
      console.log(`  Error deleting ${table.name}: ${error.message}`);
    }
  }

  console.log("\nDatabase reset complete!");
  await prisma.$disconnect();
}

resetDatabase().catch(console.error);
