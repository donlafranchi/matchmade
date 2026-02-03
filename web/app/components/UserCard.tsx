"use client"

import { useState } from "react"

interface UserCardProps {
  id: string
  name: string | null
  age: string | null
  location: string | null
  photoUrl: string
  compatibility: {
    overall: number
    confidence: "low" | "medium" | "high"
  }
  interested: boolean
  mutualInterest: boolean
  onInterestChange?: (userId: string, interested: boolean) => void
}

export default function UserCard({
  id,
  name,
  age,
  location,
  photoUrl,
  compatibility,
  interested: initialInterested,
  mutualInterest: initialMutual,
  onInterestChange,
}: UserCardProps) {
  const [interested, setInterested] = useState(initialInterested)
  const [mutualInterest, setMutualInterest] = useState(initialMutual)
  const [loading, setLoading] = useState(false)

  const handleInterestClick = async () => {
    setLoading(true)

    try {
      if (interested) {
        // Remove interest
        await fetch(`/api/interest?userId=${id}`, { method: "DELETE" })
        setInterested(false)
        setMutualInterest(false)
      } else {
        // Express interest
        const response = await fetch("/api/interest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: id }),
        })
        const data = await response.json()
        setInterested(true)
        setMutualInterest(data.mutualInterest)
      }

      onInterestChange?.(id, !interested)
    } catch (error) {
      console.error("Failed to update interest:", error)
    } finally {
      setLoading(false)
    }
  }

  // Compatibility indicator color
  const getCompatibilityColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500"
    if (score >= 55) return "bg-amber-500"
    return "bg-zinc-400"
  }

  // Compatibility text hint
  const getCompatibilityHint = (score: number, confidence: string) => {
    if (confidence === "low") return "Still learning..."
    if (score >= 80) return "Strong match"
    if (score >= 65) return "Good potential"
    if (score >= 50) return "Worth exploring"
    return "Different vibes"
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md">
      {/* Photo */}
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={name || "User"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-16 w-16"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Mutual interest badge */}
        {mutualInterest && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-pink-500 px-2.5 py-1 text-xs font-medium text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            Mutual
          </div>
        )}

        {/* Compatibility indicator */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-2 backdrop-blur-sm">
            <div
              className={`h-2.5 w-2.5 rounded-full ${getCompatibilityColor(
                compatibility.overall
              )}`}
            />
            <span className="text-sm text-zinc-700">
              {getCompatibilityHint(compatibility.overall, compatibility.confidence)}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-zinc-900">
              {name || "Anonymous"}
              {age && <span className="text-zinc-500">, {age}</span>}
            </h3>
            {location && (
              <p className="mt-0.5 text-sm text-zinc-500">{location}</p>
            )}
          </div>

          {/* Interest button */}
          <button
            onClick={handleInterestClick}
            disabled={loading}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition ${
              interested
                ? "bg-pink-100 text-pink-600"
                : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
            } ${loading ? "opacity-50" : ""}`}
          >
            {loading ? (
              <svg
                className="h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={interested ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={interested ? 0 : 2}
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
