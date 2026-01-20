"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The sign-in link is no longer valid. It may have been used already or it may have expired.",
  Default: "An error occurred during sign in.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in error</h1>
      <p className="text-zinc-600">{message}</p>
    </>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 font-sans text-zinc-900">
      <main className="w-full max-w-md space-y-6 rounded-2xl bg-white p-10 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <Suspense fallback={<p className="text-zinc-600">Loading...</p>}>
          <ErrorContent />
        </Suspense>
        <Link
          href="/"
          className="inline-block rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
        >
          Try again
        </Link>
      </main>
    </div>
  );
}
