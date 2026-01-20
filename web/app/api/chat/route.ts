import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth";
import { ChatRole, RelationshipContextType, prisma } from "@/lib/prisma";
import { getSharedProfileDto, updateSharedProfile } from "@/lib/profile-shared";
import { getContextIntentDto, updateContextIntent } from "@/lib/context-intent";
import { triggerAfterChatMessage } from "@/lib/interpretation/jobs/triggers";
import { generateChatResponse } from "@/lib/agents/chat-agent";
import { extractFromMessages, hasExtractedData, getExtractionSummary } from "@/lib/agents/extraction-agent";

// Extraction runs every message while basics are incomplete, then stops (nightly batch takes over)

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

  // Get conversation history for agent context
  const existingMessages = await prisma.chatMessage.findMany({
    where: {
      contextProfileId: contextProfile.id,
      offRecord: false,
      content: { not: null },
    },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  const messageHistory = existingMessages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content || "",
  }));

  // Get current profile state to know what's missing
  const currentProfile = await getSharedProfileDto(user.id);
  const currentIntent = await getContextIntentDto(user.id, contextType);

  // Store user message (offRecord stores marker only)
  const userMsg = await prisma.chatMessage.create({
    data: {
      userId: user.id,
      contextProfileId: contextProfile.id,
      role: ChatRole.user,
      content: offRecord ? null : message?.trim() || null,
      offRecord: Boolean(offRecord),
    },
  });

  let agentResponse: string | null = null;
  let agentMsg = null;

  // Generate and store agent response (only for on-record messages)
  if (!offRecord && message?.trim()) {
    try {
      agentResponse = await generateChatResponse(message.trim(), {
        contextType,
        tonePreference: contextProfile.tonePreference || "balanced",
        messageHistory,
        missingProfileFields: currentProfile.missing,
        missingIntentFields: currentIntent.missing,
      });

      // Store agent response
      agentMsg = await prisma.chatMessage.create({
        data: {
          userId: user.id,
          contextProfileId: contextProfile.id,
          role: ChatRole.assistant,
          content: agentResponse,
          offRecord: false,
        },
      });
    } catch (error) {
      console.error("[Chat API] Agent response failed:", error);
      // Continue without agent response - don't fail the whole request
    }
  }

  // Trigger deep analysis if threshold met (5+ new messages)
  // Don't await - run in background
  if (!offRecord) {
    triggerAfterChatMessage(user.id, contextType).catch((error) =>
      console.error("[Chat API] Failed to trigger analysis:", error)
    );
  }

  // Run extraction while basics are incomplete (once complete, nightly batch handles updates)
  let profileUpdated = false;
  let intentUpdated = false;
  const basicsIncomplete = currentProfile.completeness < 100 || currentIntent.completeness < 100;

  if (!offRecord && basicsIncomplete) {
    try {
      // Build full message history including new messages
      const fullHistory = [
        ...messageHistory,
        { role: "user" as const, content: message?.trim() || "" },
      ];
      if (agentResponse) {
        fullHistory.push({ role: "assistant" as const, content: agentResponse });
      }

      const extraction = await extractFromMessages(fullHistory, contextType);

      if (extraction && hasExtractedData(extraction)) {
        console.log(`[Chat API] Extraction: ${getExtractionSummary(extraction)}`);

        // Update profile if we extracted profile data
        if (Object.keys(extraction.profile).length > 0) {
          await updateSharedProfile(user.id, extraction.profile);
          profileUpdated = true;
        }

        // Update intent if we extracted intent data
        if (Object.keys(extraction.intent).length > 0) {
          await updateContextIntent(user.id, contextType, extraction.intent);
          intentUpdated = true;
        }
      }
    } catch (error) {
      console.error("[Chat API] Extraction failed:", error);
      // Don't fail the request if extraction fails
    }
  }

  // Get updated profile data
  const profileResult = await getSharedProfileDto(user.id);
  const intentResult = await getContextIntentDto(user.id, contextType);

  return NextResponse.json({
    ok: true,
    agentMessage: agentMsg ? {
      id: agentMsg.id,
      role: agentMsg.role,
      content: agentMsg.content,
      offRecord: agentMsg.offRecord,
      createdAt: agentMsg.createdAt.toISOString(),
    } : null,
    userMessage: {
      id: userMsg.id,
      role: userMsg.role,
      content: userMsg.content,
      offRecord: userMsg.offRecord,
      createdAt: userMsg.createdAt.toISOString(),
    },
    profileUpdated,
    intentUpdated,
    profile: profileResult.profile,
    intent: intentResult.intent,
    completeness: {
      profile: profileResult.completeness,
      intent: intentResult.completeness,
    },
    missing: {
      profile: profileResult.missing,
      intent: intentResult.missing,
    },
  });
}

function isContextType(value: string): value is RelationshipContextType {
  return ["romantic", "friendship", "professional", "creative", "service"].includes(
    value,
  );
}
