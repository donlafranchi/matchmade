import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import {
  ChatRole,
  RelationshipContextType,
  prisma,
} from "@/lib/prisma";
import {
  getOrCreateProfile,
  toDto,
} from "@/lib/profile";

type Body = {
  contextType?: RelationshipContextType;
  message?: string;
  offRecord?: boolean;
};

export async function POST(req: Request) {
  const user = await requireSessionUser();
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contextType, message, offRecord } = body;
  if (!contextType || !isContextType(contextType)) {
    return NextResponse.json({ error: "Invalid contextType" }, { status: 400 });
  }

  if (!offRecord && (!message || !message.trim())) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const contextProfile = await prisma.contextProfile.findUnique({
    where: { userId_contextType: { userId: user.id, contextType } },
  });

  if (!contextProfile) {
    return NextResponse.json({ error: "Context profile not found" }, { status: 409 });
  }

  // Store message (offRecord stores marker only)
  await prisma.chatMessage.create({
    data: {
      userId: user.id,
      contextProfileId: contextProfile.id,
      role: ChatRole.user,
      content: offRecord ? null : message?.trim() || null,
      offRecord: Boolean(offRecord),
    },
  });

  // Extraction stub: ensure profile exists; no real extraction logic yet.
  const profileRow = await getOrCreateProfile(contextProfile.id);
  const dto = toDto(profileRow);

  return NextResponse.json({
    ok: true,
    profileUpdated: false,
    profile: dto.profile,
    completeness: dto.completeness,
    missing: dto.missing,
  });
}

function isContextType(value: string): value is RelationshipContextType {
  return ["romantic", "friendship", "professional", "creative", "service"].includes(
    value,
  );
}
