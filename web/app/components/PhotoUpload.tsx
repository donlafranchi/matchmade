"use client"

import { useState, useRef, useCallback } from "react"

interface Photo {
  id: string
  url: string
  order: number
}

interface PhotoUploadProps {
  photos: Photo[]
  onPhotosChange: (photos: Photo[]) => void
  maxPhotos?: number
}

export default function PhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 6,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const remainingSlots = maxPhotos - photos.length
      if (remainingSlots <= 0) {
        setError(`Maximum ${maxPhotos} photos allowed`)
        return
      }

      setUploading(true)
      setError(null)

      const filesToUpload = Array.from(files).slice(0, remainingSlots)

      for (const file of filesToUpload) {
        try {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/photos", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || "Upload failed")
          }

          const { photo } = await response.json()
          onPhotosChange([...photos, photo])
        } catch (err) {
          setError(err instanceof Error ? err.message : "Upload failed")
          break
        }
      }

      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    },
    [photos, maxPhotos, onPhotosChange]
  )

  const handleDelete = useCallback(
    async (photoId: string) => {
      try {
        const response = await fetch(`/api/photos?id=${photoId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Delete failed")
        }

        onPhotosChange(photos.filter((p) => p.id !== photoId))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed")
      }
    },
    [photos, onPhotosChange]
  )

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newPhotos = [...photos]
    const draggedPhoto = newPhotos[draggedIndex]
    newPhotos.splice(draggedIndex, 1)
    newPhotos.splice(index, 0, draggedPhoto)

    // Update order values
    newPhotos.forEach((p, i) => (p.order = i))

    setDraggedIndex(index)
    onPhotosChange(newPhotos)
  }

  const handleDragEnd = async () => {
    if (draggedIndex === null) return

    // Save new order to server
    try {
      const photoIds = photos.map((p) => p.id)
      await fetch("/api/photos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoIds }),
      })
    } catch (err) {
      console.error("Failed to save order:", err)
    }

    setDraggedIndex(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    handleDragEnd()
  }

  return (
    <div className="space-y-4">
      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square cursor-move overflow-hidden rounded-xl bg-zinc-100 ${
              draggedIndex === index ? "opacity-50" : ""
            } ${index === 0 ? "ring-2 ring-black ring-offset-2" : ""}`}
          >
            <img
              src={photo.url}
              alt={`Photo ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {/* Primary badge */}
            {index === 0 && (
              <div className="absolute left-2 top-2 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                Primary
              </div>
            )}
            {/* Delete button */}
            <button
              onClick={() => handleDelete(photo.id)}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add photo button */}
        {photos.length < maxPhotos && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-zinc-400 hover:bg-zinc-100 disabled:opacity-50"
          >
            {uploading ? (
              <div className="flex flex-col items-center text-zinc-500">
                <svg
                  className="h-6 w-6 animate-spin"
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
              </div>
            ) : (
              <div className="flex flex-col items-center text-zinc-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-8 w-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="mt-1 text-xs">Add photo</span>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <p className="text-center text-sm text-red-500">{error}</p>
      )}

      {/* Help text */}
      <p className="text-center text-sm text-zinc-500">
        {photos.length === 0
          ? "Add at least one photo to continue"
          : "Drag to reorder. First photo is your primary."}
      </p>
    </div>
  )
}
