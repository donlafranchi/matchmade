import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeLocation } from "@/lib/waitlist/normalize";

type WaitlistBody = {
  intro?: string;
  email: string;
  location: string;
};

export async function POST(request: Request) {
  let body: WaitlistBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { intro, email, location } = body;

  // Validate required fields
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  if (!location || location.trim().length < 2) {
    return NextResponse.json({ error: "Location required" }, { status: 400 });
  }

  // Normalize location
  const normalizedLocation = normalizeLocation(location.trim());
  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check for existing entry
    const existing = await prisma.waitlistEntry.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json({
        ok: true,
        position: existing.position,
        regionPosition: existing.regionPosition,
        location: existing.location,
        message: "You're already on the waitlist!",
        alreadyExists: true,
      });
    }

    // Get or create regional metrics
    await prisma.regionalMetrics.upsert({
      where: { location: normalizedLocation },
      update: { userCount: { increment: 1 } },
      create: {
        location: normalizedLocation,
        userCount: 1,
        minimumThreshold: 50,
        status: "collecting",
      },
    });

    // Calculate positions
    const globalCount = await prisma.waitlistEntry.count();
    const regionCount = await prisma.waitlistEntry.count({
      where: { location: normalizedLocation },
    });

    // Create waitlist entry
    const entry = await prisma.waitlistEntry.create({
      data: {
        email: normalizedEmail,
        intro: intro?.substring(0, 500), // Limit intro length
        location: normalizedLocation,
        position: globalCount + 1,
        regionPosition: regionCount + 1,
        status: "pending",
      },
    });

    // Check if region hit threshold (for future notification triggers)
    const region = await prisma.regionalMetrics.findUnique({
      where: { location: normalizedLocation },
    });

    if (region && region.userCount >= region.minimumThreshold && region.status === "collecting") {
      await prisma.regionalMetrics.update({
        where: { location: normalizedLocation },
        data: { status: "threshold" },
      });
      // TODO: Trigger notification to users in this region
    }

    return NextResponse.json({
      ok: true,
      position: entry.position,
      regionPosition: entry.regionPosition,
      location: normalizedLocation,
    });
  } catch (error) {
    console.error("Waitlist submission error:", error);

    // Handle unique constraint violation (race condition)
    if (error instanceof Error && error.message?.includes("Unique constraint")) {
      const existing = await prisma.waitlistEntry.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        return NextResponse.json({
          ok: true,
          position: existing.position,
          regionPosition: existing.regionPosition,
          location: existing.location,
          alreadyExists: true,
        });
      }
    }

    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

// GET endpoint to check waitlist stats
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location");

  const globalCount = await prisma.waitlistEntry.count();

  if (location) {
    const normalizedLocation = normalizeLocation(location);
    const regionCount = await prisma.waitlistEntry.count({
      where: { location: normalizedLocation },
    });
    const region = await prisma.regionalMetrics.findUnique({
      where: { location: normalizedLocation },
    });

    return NextResponse.json({
      globalCount,
      regionCount,
      region: region
        ? {
            status: region.status,
            threshold: region.minimumThreshold,
            progress: Math.min(100, Math.round((regionCount / region.minimumThreshold) * 100)),
          }
        : null,
    });
  }

  return NextResponse.json({ globalCount });
}
