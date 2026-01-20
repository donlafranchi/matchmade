import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { getSharedProfileDto, updateSharedProfile } from "@/lib/profile-shared";
import { ProfileDto } from "@/lib/types";

/**
 * GET /api/profile
 * Fetch shared profile for authenticated user (no contextType needed)
 */
export async function GET() {
  const user = await requireSessionUser();

  const result = await getSharedProfileDto(user.id);

  return NextResponse.json({
    profile: result.profile,
    completeness: result.completeness,
    missing: result.missing,
  });
}

/**
 * PUT /api/profile
 * Update shared profile for authenticated user
 */
export async function PUT(req: Request) {
  const user = await requireSessionUser();

  let body: { patch?: Partial<ProfileDto> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { patch } = body;
  if (!patch) {
    return NextResponse.json({ error: "Missing patch" }, { status: 400 });
  }

  try {
    const updated = await updateSharedProfile(user.id, patch);

    return NextResponse.json({
      ok: true,
      profile: {
        coreValues: updated.coreValues,
        beliefs: updated.beliefs,
        interactionStyle: updated.interactionStyle,
        lifestyle: updated.lifestyle,
        constraints: updated.constraints,
        location: updated.location,
        ageRange: updated.ageRange,
        name: updated.name,
      },
      completeness: updated.completeness,
      missing: updated.missing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
