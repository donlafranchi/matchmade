export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 font-sans text-zinc-900">
      <main className="w-full max-w-md space-y-6 rounded-2xl bg-white p-10 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-zinc-600">
          A sign-in link has been sent to your email address. Click the link to
          sign in to your account.
        </p>
        <p className="text-sm text-zinc-400">
          The link will expire in 24 hours.
        </p>
      </main>
    </div>
  );
}
