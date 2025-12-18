import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSessionUser } from "@/lib/auth";
import {
  ChatRole,
  RelationshipContextType,
  TonePreference,
  prisma,
} from "@/lib/prisma";

function isContextType(value: string): value is RelationshipContextType {
  return ["romantic", "friendship", "professional", "creative", "service"].includes(
    value,
  );
}

const toneCopy: Record<TonePreference, string> = {
  light: "Cruisey, gentle, low-pressure",
  balanced: "A mix of playful and direct",
  serious: "Direct, to the point",
};

async function sendMessage(formData: FormData) {
  "use server";
  const user = await requireSessionUser();
  const contextType = formData.get("contextType") as RelationshipContextType;
  const offRecord = formData.get("offRecord") === "on";
  const content = (formData.get("message") as string | null)?.trim();

  const contextProfile = await prisma.contextProfile.findUnique({
    where: {
      userId_contextType: { userId: user.id, contextType },
    },
    select: { id: true },
  });

  if (!contextProfile) {
    redirect("/onboarding");
  }

  if (!offRecord && content) {
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        contextProfileId: contextProfile.id,
        role: ChatRole.user,
        content,
        offRecord: false,
      },
    });
  } else if (offRecord) {
    await prisma.chatMessage.create({
      data: {
        userId: user.id,
        contextProfileId: contextProfile.id,
        role: ChatRole.user,
        content: null,
        offRecord: true,
      },
    });
  }

  revalidatePath(`/contexts/${contextType}`);
}

async function forgetLast(formData: FormData) {
  "use server";
  const user = await requireSessionUser();
  const contextType = formData.get("contextType") as RelationshipContextType;

  const contextProfile = await prisma.contextProfile.findUnique({
    where: {
      userId_contextType: { userId: user.id, contextType },
    },
    select: { id: true },
  });

  if (!contextProfile) {
    redirect("/onboarding");
  }

  const last = await prisma.chatMessage.findFirst({
    where: { contextProfileId: contextProfile.id },
    orderBy: { createdAt: "desc" },
  });

  if (last) {
    await prisma.chatMessage.delete({ where: { id: last.id } });
  }

  // TODO: zero out derived fields when implemented.
  revalidatePath(`/contexts/${contextType}`);
}

export default async function ContextPage({
  params,
}: {
  params: { context: string };
}) {
  const user = await requireSessionUser();
  if (!isContextType(params.context)) {
    notFound();
  }

  const profile = await prisma.contextProfile.findUnique({
    where: {
      userId_contextType: { userId: user.id, contextType: params.context },
    },
    include: { chatMessages: { orderBy: { createdAt: "asc" } } },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  const otherContexts = await prisma.contextProfile.findMany({
    where: { userId: user.id, contextType: { not: params.context } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12 text-zinc-900">
      <main className="w-full max-w-3xl space-y-6 rounded-2xl bg-white p-10 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Context
          </p>
          <h1 className="text-3xl font-semibold capitalize">{params.context}</h1>
          <p className="text-zinc-600">
            Tone: <span className="font-medium">{toneCopy[profile.tonePreference]}</span>
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-sm font-medium text-zinc-800">
            You’re set up. Next steps:
          </p>
          <ol className="list-decimal space-y-2 pl-5 text-zinc-700">
            <li>Chat with your matchmaker (coming next).</li>
            <li>Fill out values/intent through conversation.</li>
            <li>Add photos to unlock attraction mode.</li>
          </ol>
          <p className="text-sm text-zinc-600">
            This screen will evolve into the per-context home once chat is live.
          </p>
        </div>

        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-800">Chat</p>
              <p className="text-sm text-zinc-600">
                One small question at a time. Off the record stays off.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <form action={sendMessage}>
                <input type="hidden" name="contextType" value={params.context} />
                <input type="hidden" name="message" value="Keep it light" />
                <button
                  className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700 transition hover:border-zinc-400"
                  type="submit"
                >
                  Keep it light
                </button>
              </form>
              <form action={sendMessage}>
                <input type="hidden" name="contextType" value={params.context} />
                <input type="hidden" name="message" value="Go deeper" />
                <button
                  className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700 transition hover:border-zinc-400"
                  type="submit"
                >
                  Go deeper
                </button>
              </form>
              <form action={forgetLast}>
                <input type="hidden" name="contextType" value={params.context} />
                <button
                  className="rounded-full border border-zinc-200 px-3 py-1 text-red-600 transition hover:border-red-300"
                  type="submit"
                >
                  Forget last message
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-3">
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              {profile.chatMessages.length === 0 ? (
                <p className="text-sm text-zinc-500">No messages yet.</p>
              ) : (
                profile.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                      {msg.role === "user" ? "You" : msg.role}
                      {msg.offRecord && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Off the record
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-800">
                      {msg.offRecord ? "Not stored (off the record)" : msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form action={sendMessage} className="space-y-2">
              <input type="hidden" name="contextType" value={params.context} />
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  name="offRecord"
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-black focus:ring-0"
                />
                <span className="text-sm text-zinc-700">
                  Off the record (we won’t store the text, just that you used it)
                </span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  name="message"
                  placeholder="Ask for help, share context, or set boundaries..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800 sm:w-32"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>

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
