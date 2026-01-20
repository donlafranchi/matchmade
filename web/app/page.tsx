import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { SignInButtons } from "./components/SignInButtons";

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

        <SignInButtons />
      </main>
    </div>
  );
}
