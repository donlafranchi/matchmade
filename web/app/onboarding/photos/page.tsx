"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import PhotoUpload from "@/app/components/PhotoUpload"

interface Photo {
  id: string
  url: string
  order: number
}

export default function PhotosPage() {
  const router = useRouter()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch existing photos
    fetch("/api/photos")
      .then((res) => res.json())
      .then((data) => {
        setPhotos(data.photos || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleContinue = () => {
    // Navigate to main app or next step
    router.push("/contexts/romantic")
  }

  const handleSkip = () => {
    // Allow skip but warn they won't appear in match pool
    router.push("/contexts/romantic")
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-black" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-800">
            Add your photos
          </h1>
          <p className="mt-2 text-zinc-600">
            Photos help others see who they might be meeting.
          </p>
        </div>

        {/* Photo upload */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            maxPhotos={6}
          />
        </div>

        {/* Info card */}
        <div className="rounded-xl bg-amber-50 p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-5 w-5 text-amber-600"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-amber-800">
                <strong>Why photos matter:</strong> We match you on character first, but people also want to know who they're meeting. Without photos, you won't appear in anyone's match pool.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContinue}
            disabled={photos.length === 0}
            className="w-full rounded-xl bg-black px-5 py-4 text-[15px] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            {photos.length === 0 ? "Add at least one photo" : "Continue"}
          </button>

          <button
            onClick={handleSkip}
            className="w-full rounded-xl px-5 py-3 text-[15px] text-zinc-500 transition hover:text-zinc-700"
          >
            Skip for now
          </button>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-zinc-400">
          You can always add or change photos later in your profile.
        </p>
      </main>
    </div>
  )
}
