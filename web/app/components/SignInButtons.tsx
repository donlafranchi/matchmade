"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";

type Providers = Awaited<ReturnType<typeof getProviders>>;

export function SignInButtons() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [providers, setProviders] = useState<Providers>(null);

  useEffect(() => {
    getProviders().then(setProviders);
  }, []);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading("email");
    await signIn("email", { email, callbackUrl: "/onboarding" });
  };

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider);
    await signIn(provider, { callbackUrl: "/onboarding" });
  };

  const hasEmail = providers?.email;
  const hasGoogle = providers?.google;
  const hasApple = providers?.apple;
  const hasOAuth = hasGoogle || hasApple;

  // Show loading state while fetching providers
  if (providers === null) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-zinc-100 rounded-lg" />
          <div className="h-10 bg-zinc-100 rounded-lg" />
        </div>
      </div>
    );
  }

  // No providers configured
  if (!hasEmail && !hasOAuth) {
    return (
      <div className="text-center text-zinc-500 py-4">
        <p className="text-sm">No sign-in methods configured.</p>
        <p className="text-xs mt-1">Please set up OAuth credentials in your environment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Email Magic Link */}
      {hasEmail && (
        <form onSubmit={handleEmailSignIn} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-800">Email</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400"
              placeholder="you@example.com"
              disabled={isLoading !== null}
            />
          </label>
          <button
            type="submit"
            disabled={isLoading !== null}
            className="w-full rounded-lg bg-black px-4 py-2 text-white transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {isLoading === "email" ? "Sending link..." : "Continue with email"}
          </button>
        </form>
      )}

      {hasEmail && hasOAuth && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-zinc-500">or</span>
          </div>
        </div>
      )}

      {/* OAuth Buttons */}
      {hasOAuth && (
        <div className="space-y-2">
          {hasGoogle && (
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isLoading === "google" ? "Redirecting..." : "Continue with Google"}
            </button>
          )}

          {hasApple && (
            <button
              onClick={() => handleOAuthSignIn("apple")}
              disabled={isLoading !== null}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              {isLoading === "apple" ? "Redirecting..." : "Continue with Apple"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
