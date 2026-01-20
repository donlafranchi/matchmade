/**
 * API endpoint for triggering and checking profile analysis jobs
 * POST: Manually trigger analysis (high priority)
 * GET: Check status of analysis job
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { triggerManualRefresh } from "@/lib/interpretation/jobs/triggers";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/profile/analyze
 * Manually trigger profile analysis (high priority)
 */
export async function POST(req: NextRequest) {
  // Auth check
  const user = await requireSessionUser();

  let body: { contextType?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contextType } = body;

  if (!contextType) {
    return NextResponse.json(
      { error: "contextType required" },
      { status: 400 }
    );
  }

  // Enqueue high-priority analysis job
  await triggerManualRefresh(user.id, contextType);

  return NextResponse.json({
    message: "Analysis queued",
    status: "pending",
  });
}

/**
 * GET /api/profile/analyze?contextType=romantic
 * Check status of analysis job
 */
export async function GET(req: NextRequest) {
  // Auth check
  const user = await requireSessionUser();

  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("contextType");

  if (!contextType) {
    return NextResponse.json(
      { error: "contextType required" },
      { status: 400 }
    );
  }

  // Check for pending/processing job
  const job = await prisma.analysisJob.findFirst({
    where: {
      userId: user.id,
      contextType,
      status: { in: ["pending", "processing"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (job) {
    return NextResponse.json({
      status: job.status,
      retries: job.retries,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
    });
  }

  // Check last completed analysis
  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { lastAnalyzed: true },
  });

  return NextResponse.json({
    status: profile?.lastAnalyzed ? "completed" : "not_started",
    lastAnalyzed: profile?.lastAnalyzed,
  });
}
