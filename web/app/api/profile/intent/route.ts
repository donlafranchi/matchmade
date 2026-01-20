import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { RelationshipContextType } from "@/lib/prisma";
import {
  getContextIntentDto,
  updateContextIntent,
  validateIntentFields,
} from "@/lib/context-intent";
import { ContextIntentPatch } from "@/lib/types";

function isContextType(value: string): value is RelationshipContextType {
  return ["romantic", "friendship", "professional", "creative", "service"].includes(value);
}

/**
 * GET /api/profile/intent?contextType=romantic
 * Fetch context intent for authenticated user
 */
export async function GET(req: Request) {
  const user = await requireSessionUser();
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get("contextType");

  if (!contextType || !isContextType(contextType)) {
    return NextResponse.json({ error: "Invalid or missing contextType" }, { status: 400 });
  }

  try {
    const result = await getContextIntentDto(user.id, contextType);

    return NextResponse.json({
      intent: result.intent,
      completeness: result.completeness,
      missing: result.missing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch intent" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/intent
 * Update context intent for authenticated user
 */
export async function PUT(req: Request) {
  const user = await requireSessionUser();

  let body: { contextType?: string; patch?: ContextIntentPatch };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { contextType, patch } = body;

  if (!contextType || !isContextType(contextType)) {
    return NextResponse.json({ error: "Invalid or missing contextType" }, { status: 400 });
  }

  if (!patch) {
    return NextResponse.json({ error: "Missing patch" }, { status: 400 });
  }

  // Validate that patch fields match the context type
  if (!validateIntentFields(contextType, patch)) {
    return NextResponse.json(
      { error: "Patch contains fields not valid for this context type" },
      { status: 400 }
    );
  }

  try {
    const updated = await updateContextIntent(user.id, contextType, patch);

    // Serialize intent to DTO format
    const intentDto: any = { contextType: updated.contextType };

    // Add only the relevant fields for this context type
    const fieldKeys = Object.keys(updated).filter(k =>
      !['id', 'userId', 'completeness', 'missing', 'createdAt', 'updatedAt'].includes(k)
    );

    for (const key of fieldKeys) {
      const value = (updated as any)[key];
      if (value !== null && value !== undefined && key !== 'contextType') {
        intentDto[key] = value;
      }
    }

    return NextResponse.json({
      ok: true,
      intent: intentDto,
      completeness: updated.completeness,
      missing: updated.missing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to update intent" },
      { status: 500 }
    );
  }
}
