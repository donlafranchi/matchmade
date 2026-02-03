import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { SignInButtons } from "@/app/components/SignInButtons";

export default async function SignInPage() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    const firstContext = sessionUser.contextProfiles[0]?.contextType;
    redirect(firstContext ? `/contexts/${firstContext}` : "/onboarding");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-sm">
        <div className="space-y-3 text-center">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500">
            Sign in to continue
          </p>
        </div>

        <SignInButtons />

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{" "}
          <Link href="/waitlist" className="text-zinc-700 underline hover:text-black">
            Join the waitlist
          </Link>
        </p>
      </main>
    </div>
  );
}
