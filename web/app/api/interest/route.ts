// Interest API (T008)
import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Express interest in a user
export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { userId } = body as { userId: string }

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Can't express interest in yourself
  if (userId === user.id) {
    return NextResponse.json({ error: 'Cannot express interest in yourself' }, { status: 400 })
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Create or update interest (upsert to handle duplicates)
  const interest = await prisma.interest.upsert({
    where: {
      fromUserId_toUserId: {
        fromUserId: user.id,
        toUserId: userId,
      },
    },
    create: {
      fromUserId: user.id,
      toUserId: userId,
    },
    update: {}, // No-op if already exists
  })

  // Check if mutual interest
  const theirInterest = await prisma.interest.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: userId,
        toUserId: user.id,
      },
    },
  })

  return NextResponse.json({
    interest,
    mutualInterest: !!theirInterest,
  })
}

// DELETE - Remove interest in a user
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Delete interest if exists
  await prisma.interest.deleteMany({
    where: {
      fromUserId: user.id,
      toUserId: userId,
    },
  })

  return NextResponse.json({ success: true })
}
