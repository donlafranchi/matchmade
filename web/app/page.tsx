import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    const firstContext = sessionUser.contextProfiles[0]?.contextType;
    redirect(firstContext ? `/contexts/${firstContext}` : "/onboarding");
  }

  // Get current waitlist count for social proof
  const waitlistCount = await prisma.waitlistEntry.count();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-lg space-y-8 text-center">
        {/* Manifesto headline */}
        <h1 className="text-4xl font-semibold leading-tight text-zinc-900">
          You deserve better than endless swiping
        </h1>

        {/* Subtext */}
        <p className="text-lg leading-relaxed text-zinc-600">
          We're building something different. Meet people based on what actually
          matters — values, interests, and real connection. No games, no
          algorithms optimizing for addiction.
        </p>

        {/* CTA Button */}
        <Link
          href="/waitlist"
          className="inline-block rounded-xl bg-black px-8 py-4 text-lg text-white transition hover:bg-zinc-800"
        >
          Join the waitlist
        </Link>

        {/* Social proof */}
        {waitlistCount > 0 && (
          <p className="text-sm text-zinc-500">
            Join {waitlistCount.toLocaleString()}+ people waiting for launch
          </p>
        )}

        {/* Already have account link */}
        <p className="pt-4 text-sm text-zinc-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-zinc-700 underline hover:text-black">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
