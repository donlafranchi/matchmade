import { redirect } from "next/navigation";
import { getSessionUser, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function login(formData: FormData) {
  "use server";
  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const name = (formData.get("name") as string | null)?.trim();

  if (!email) {
    return;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name || undefined },
    create: { email, name: name || undefined },
  });

  await setSessionCookie(user.id);
  redirect("/onboarding");
}

export default async function Home() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    const firstContext = sessionUser.contextProfiles[0]?.contextType;
    redirect(firstContext ? `/contexts/${firstContext}` : "/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 font-sans text-zinc-900">
      <main className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-sm">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-semibold leading-tight">
            A better way to meet someone
          </h1>
        </div>

        <form action={login} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-800">Email</span>
            <input
              required
              type="email"
              name="email"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400"
              placeholder="you@example.com"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
          >
            Get started
          </button>
        </form>
      </main>
    </div>
  );
}
