import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { RelationshipContextType, prisma } from "@/lib/prisma";
import {
  computeCompleteness,
  getOrCreateProfile,
  mergeProfile,
  sanitizePatch,
  toDto,
} from "@/lib/profile";

function isContextType(value: string): value is RelationshipContextType {
  return ["romantic", "friendship", "professional", "creative", "service"].includes(
    value,
  );
}

export async function GET(req: Request) {
  const user = await requireSessionUser();
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("contextType") as RelationshipContextType | null;

  if (!contextType || !isContextType(contextType)) {
    return NextResponse.json({ error: "Invalid contextType" }, { status: 400 });
  }

  const contextProfile = await prisma.contextProfile.findUnique({
    where: { userId_contextType: { userId: user.id, contextType } },
  });

  if (!contextProfile) {
    return NextResponse.json({ error: "Context profile not found" }, { status: 404 });
  }

  const profileRow = await getOrCreateProfile(contextProfile.id);
  const dto = toDto(profileRow);

  return NextResponse.json({
    profile: dto.profile,
    completeness: dto.completeness,
    missing: dto.missing,
  });
}

export async function PUT(req: Request) {
  const user = await requireSessionUser();
  let body: { contextType?: RelationshipContextType; patch?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contextType, patch } = body;
  if (!contextType || !isContextType(contextType)) {
    return NextResponse.json({ error: "Invalid contextType" }, { status: 400 });
  }

  const contextProfile = await prisma.contextProfile.findUnique({
    where: { userId_contextType: { userId: user.id, contextType } },
  });

  if (!contextProfile) {
    return NextResponse.json({ error: "Context profile not found" }, { status: 404 });
  }

  const cleanPatch = sanitizePatch(patch || {});
  const profileRow = await getOrCreateProfile(contextProfile.id);
  const currentData = (profileRow.data as Record<string, unknown>) || {};
  const merged = mergeProfile(currentData, cleanPatch);
  const { completeness, missing } = computeCompleteness(merged);

  const updated = await prisma.profile.update({
    where: { id: profileRow.id },
    data: {
      data: merged,
      completeness,
      missing,
    },
  });

  const dto = toDto(updated);

  return NextResponse.json({
    profile: dto.profile,
    completeness: dto.completeness,
    missing: dto.missing,
  });
}
