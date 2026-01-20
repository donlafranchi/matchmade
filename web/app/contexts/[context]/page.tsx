import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth";
import { RelationshipContextType, prisma } from "@/lib/prisma";
import { getSharedProfileDto } from "@/lib/profile-shared";
import { getContextIntentDto } from "@/lib/context-intent";
import ChatProfilePanel from "./ChatProfilePanel";
import type { ChatMessage } from "@/lib/types";

function isContextType(value: string): value is RelationshipContextType {
  return ["romantic", "friendship", "professional", "creative", "service"].includes(
    value,
  );
}

export default async function ContextPage({
  params,
}: {
  params: Promise<{ context: string }>;
}) {
  const { context } = await params;
  const user = await requireSessionUser();

  if (!isContextType(context)) {
    notFound();
  }

  const contextProfile = await prisma.contextProfile.findUnique({
    where: {
      userId_contextType: { userId: user.id, contextType: context },
    },
    include: { chatMessages: { orderBy: { createdAt: "asc" } } },
  });

  if (!contextProfile) {
    redirect("/onboarding");
  }

  // Fetch shared profile and context-specific intent
  const [sharedProfile, contextIntent] = await Promise.all([
    getSharedProfileDto(user.id),
    getContextIntentDto(user.id, context),
  ]);

  // Transform messages for client component
  const messages: ChatMessage[] = contextProfile.chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
    offRecord: msg.offRecord,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      {/* Main Content */}
      <main className="flex-1 px-4 pb-20 pt-6">
        <div className="mx-auto max-w-2xl">
          <ChatProfilePanel
            contextType={context}
            tonePreference={contextProfile.tonePreference}
            initialMessages={messages}
            sharedProfile={sharedProfile}
            contextIntent={contextIntent}
          />
        </div>
      </main>

      {/* Bottom Tab Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-zinc-200 bg-white">
        <div className="flex w-full">
          <Link
            href={`/contexts/${context}/profile`}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-400"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">Profile</span>
          </Link>
          <Link
            href={`/contexts/${context}`}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-900"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">Chat</span>
          </Link>
          <Link
            href="#"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-400"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs">Discover</span>
          </Link>
          <Link
            href="#"
            className="flex flex-1 flex-col items-center gap-1 py-3 text-zinc-400"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">Events</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
