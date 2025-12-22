import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma, RelationshipContextType, TonePreference } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { contexts } = body as {
      contexts: RelationshipContextType[];
    };

    if (!contexts || contexts.length === 0) {
      return NextResponse.json(
        { error: "At least one context required" },
        { status: 400 }
      );
    }

    // Create context profiles with default tone (light/cool) and welcome messages
    for (const contextType of contexts) {
      // Create or get the context profile
      const contextProfile = await prisma.contextProfile.upsert({
        where: {
          userId_contextType: {
            userId: user.id,
            contextType,
          },
        },
        update: {},
        create: {
          userId: user.id,
          contextType,
          tonePreference: TonePreference.light,
        },
      });

      // Check if this is a new context (no messages yet)
      const messageCount = await prisma.chatMessage.count({
        where: { contextProfileId: contextProfile.id },
      });

      // Create welcome message if this is a fresh context
      if (messageCount === 0) {
        const welcomeMessages: Record<RelationshipContextType, string> = {
          romantic:
            "Cool. So you're here to meet someone you could fall for. Let's figure out what that actually looks like for you—not what you think you should want, but what actually matters. Where are you at right now? What's your situation?",
          friendship:
            "Nice. So you're looking to find your people. Let's talk about what kind of friendships you're actually hoping for. What's missing right now? What would make a friendship feel right for you?",
          professional:
            "Got it. You're here to connect professionally. Let's figure out what kind of connections would actually be useful for you. What are you working on? What kind of people would be helpful to know?",
          creative:
            "Cool. So you're looking for creative collaborators. Let's talk about what you're working on and what kind of creative partnership would actually help. What's your project? What are you trying to build?",
          service:
            "Alright. You're here to find service connections. Let's figure out what you need or what you're offering. What kind of help are you looking for, or what can you provide?",
        };

        await prisma.chatMessage.create({
          data: {
            userId: user.id,
            contextProfileId: contextProfile.id,
            role: "assistant",
            content: welcomeMessages[contextType],
            offRecord: false,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error creating contexts:", error);
    return NextResponse.json(
      { error: "Failed to create contexts" },
      { status: 500 }
    );
  }
}
