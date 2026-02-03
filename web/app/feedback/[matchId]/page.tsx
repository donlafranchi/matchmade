"use client"

import { useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { FeedbackForm } from "@/app/components/FeedbackForm"

export default function FeedbackPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [declined, setDeclined] = useState<'later' | 'no' | null>(null)

  const matchId = params.matchId as string
  const toUserId = searchParams.get('to') || ''

  const handleComplete = () => {
    // Could redirect somewhere or show a message
    // For now just stay on the thank you screen
  }

  const handleDecline = (reason: 'later' | 'no') => {
    setDeclined(reason)
  }

  if (declined) {
    return (
      <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
        <main className="w-full max-w-lg">
          <div className="rounded-2xl bg-white p-8 shadow-sm text-center">
            <h2 className="text-xl font-medium text-zinc-900 mb-2">No problem</h2>
            <p className="text-zinc-500">
              {declined === 'later'
                ? "You can come back to this anytime."
                : "Thanks for letting us know."}
            </p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-lg">
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <FeedbackForm
            matchId={matchId}
            toUserId={toUserId}
            onComplete={handleComplete}
            onDecline={handleDecline}
          />
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          For serious safety concerns, please contact local authorities.
        </p>
      </main>
    </div>
  )
}
