import { WaitlistChat } from "@/app/components/WaitlistChat";

export default function WaitlistPage() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Join the waitlist
          </h1>
        </div>

        {/* Chat component */}
        <WaitlistChat />

        {/* Footer */}
        <p className="text-center text-sm text-zinc-500">
          Your information stays private. Always.
        </p>
      </main>
    </div>
  );
}
