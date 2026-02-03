"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UserCard from "@/app/components/UserCard"

interface PoolUser {
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
}

type FilterTab = "all" | "interested" | "mutual"

export default function PoolPage() {
  const router = useRouter()
  const [pool, setPool] = useState<PoolUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>("all")

  useEffect(() => {
    fetchPool()
  }, [])

  const fetchPool = async () => {
    try {
      const response = await fetch("/api/pool")
      if (response.status === 401) {
        router.push("/")
        return
      }
      if (!response.ok) throw new Error("Failed to fetch pool")

      const data = await response.json()
      setPool(data.pool)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleInterestChange = (userId: string, interested: boolean) => {
    setPool((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, interested } : user
      )
    )
  }

  // Filter pool based on selected tab
  const filteredPool = pool.filter((user) => {
    if (filter === "interested") return user.interested
    if (filter === "mutual") return user.mutualInterest
    return true
  })

  const interestedCount = pool.filter((u) => u.interested).length
  const mutualCount = pool.filter((u) => u.mutualInterest).length

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-black" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-6">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              fetchPool()
            }}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <h1 className="text-xl font-semibold text-zinc-900">
            People you could meet
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {pool.length} {pool.length === 1 ? "person" : "people"} in your pool
          </p>
        </div>

        {/* Filter tabs */}
        <div className="mx-auto max-w-4xl px-6 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === "all"
                  ? "bg-black text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              All ({pool.length})
            </button>
            <button
              onClick={() => setFilter("interested")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === "interested"
                  ? "bg-black text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Interested ({interestedCount})
            </button>
            <button
              onClick={() => setFilter("mutual")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === "mutual"
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Mutual ({mutualCount})
            </button>
          </div>
        </div>
      </header>

      {/* Pool grid */}
      <main className="mx-auto max-w-4xl px-6 py-6">
        {filteredPool.length === 0 ? (
          <EmptyState filter={filter} totalPool={pool.length} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPool.map((user) => (
              <UserCard
                key={user.id}
                {...user}
                onInterestChange={handleInterestChange}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState({
  filter,
  totalPool,
}: {
  filter: FilterTab
  totalPool: number
}) {
  if (filter === "mutual") {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-pink-500"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-zinc-900">No mutual matches yet</h2>
        <p className="mt-2 text-zinc-500">
          Express interest in people you'd like to meet.
          <br />
          When they're interested too, you'll see them here.
        </p>
      </div>
    )
  }

  if (filter === "interested") {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-zinc-400"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-zinc-900">No interests yet</h2>
        <p className="mt-2 text-zinc-500">
          Browse your pool and tap the heart on
          <br />
          people you'd like to meet.
        </p>
      </div>
    )
  }

  // All pool is empty
  if (totalPool === 0) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-8 w-8 text-zinc-400"
          >
            <path
              fillRule="evenodd"
              d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z"
              clipRule="evenodd"
            />
            <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-zinc-900">We're still learning about you</h2>
        <p className="mt-2 text-zinc-500">
          As you answer more questions, we'll find
          <br />
          people who are a good match for you.
        </p>
      </div>
    )
  }

  return null
}
