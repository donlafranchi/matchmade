// Photo upload API (T007)
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getStorage, validateImage } from '@/lib/storage'

const MAX_PHOTOS = 6

// GET - List user's photos
export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const photos = await prisma.photo.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ photos })
}

// POST - Upload a new photo
export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check photo count limit
  const existingCount = await prisma.photo.count({
    where: { userId: user.id },
  })

  if (existingCount >= MAX_PHOTOS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_PHOTOS} photos allowed` },
      { status: 400 }
    )
  }

  // Parse multipart form data
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Convert to buffer
  const buffer = Buffer.from(await file.arrayBuffer())
  const contentType = file.type

  // Validate
  const validation = validateImage(buffer, contentType)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  // Upload to storage
  const storage = getStorage()
  const { key, url } = await storage.upload(buffer, contentType, user.id)

  // Save to database
  const photo = await prisma.photo.create({
    data: {
      userId: user.id,
      url,
      key,
      order: existingCount, // Add to end
    },
  })

  return NextResponse.json({ photo }, { status: 201 })
}

// DELETE - Delete a photo
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const photoId = searchParams.get('id')

  if (!photoId) {
    return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
  }

  // Find photo (ensure user owns it)
  const photo = await prisma.photo.findFirst({
    where: { id: photoId, userId: user.id },
  })

  if (!photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
  }

  // Delete from storage
  const storage = getStorage()
  await storage.delete(photo.key)

  // Delete from database
  await prisma.photo.delete({ where: { id: photoId } })

  // Reorder remaining photos
  const remainingPhotos = await prisma.photo.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
  })

  // Update order for all remaining photos
  await Promise.all(
    remainingPhotos.map((p, index) =>
      prisma.photo.update({
        where: { id: p.id },
        data: { order: index },
      })
    )
  )

  return NextResponse.json({ success: true })
}

// PATCH - Reorder photos
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { photoIds } = body as { photoIds: string[] }

  if (!Array.isArray(photoIds)) {
    return NextResponse.json({ error: 'photoIds array required' }, { status: 400 })
  }

  // Verify all photos belong to user
  const photos = await prisma.photo.findMany({
    where: { userId: user.id },
  })

  const userPhotoIds = new Set(photos.map((p) => p.id))
  const allValid = photoIds.every((id) => userPhotoIds.has(id))

  if (!allValid || photoIds.length !== photos.length) {
    return NextResponse.json({ error: 'Invalid photo IDs' }, { status: 400 })
  }

  // Update order
  await Promise.all(
    photoIds.map((id, index) =>
      prisma.photo.update({
        where: { id },
        data: { order: index },
      })
    )
  )

  // Return updated photos
  const updatedPhotos = await prisma.photo.findMany({
    where: { userId: user.id },
    orderBy: { order: 'asc' },
  })

  return NextResponse.json({ photos: updatedPhotos })
}
