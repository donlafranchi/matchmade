import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSessionUser } from "@/lib/auth";
import { RelationshipContextType, prisma } from "@/lib/prisma";
import { getOrCreateProfile, toDto } from "@/lib/profile";
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

  const profileRow = await getOrCreateProfile(contextProfile.id);
  const profileDto = toDto(profileRow);

  const otherContexts = await prisma.contextProfile.findMany({
    where: { userId: user.id, contextType: { not: context } },
    orderBy: { createdAt: "asc" },
  });

  // Transform messages for client component
  const messages: ChatMessage[] = contextProfile.chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
    offRecord: msg.offRecord,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="w-full max-w-3xl space-y-6 rounded-2xl bg-white p-10 shadow-sm">
        <ChatProfilePanel
          contextType={context}
          tonePreference={contextProfile.tonePreference}
          initialMessages={messages}
          initialProfile={profileDto}
        />

        {otherContexts.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-zinc-800">Other contexts</p>
            <div className="flex flex-wrap gap-2">
              {otherContexts.map((ctx) => (
                <Link
                  key={ctx.id}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-sm capitalize text-zinc-800 transition hover:border-zinc-400"
                  href={`/contexts/${ctx.contextType}`}
                >
                  {ctx.contextType}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-600">
            No other contexts yet. You can add more anytime in onboarding.
          </div>
        )}
      </main>
    </div>
  );
}
