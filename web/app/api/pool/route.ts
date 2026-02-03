// Match Pool API (T008)
import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateMatch, MatchResult } from '@/lib/matching/compatibility'

export interface PoolUser {
  id: string
  name: string | null
  age: string | null
  location: string | null
  photoUrl: string
  compatibility: {
    overall: number
    confidence: 'low' | 'medium' | 'high'
  }
  interested: boolean // Current user has expressed interest
  mutualInterest: boolean // Both users interested
}

// GET - Fetch match pool for current user
export async function GET() {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all other users who have photos
  const candidates = await prisma.user.findMany({
    where: {
      id: { not: user.id },
      photos: { some: {} }, // Must have at least one photo
    },
    include: {
      photos: {
        orderBy: { order: 'asc' },
        take: 1, // Just primary photo
      },
      profile: {
        select: { location: true, ageRange: true },
      },
    },
  })

  // Get current user's interests
  const myInterests = await prisma.interest.findMany({
    where: { fromUserId: user.id },
    select: { toUserId: true },
  })
  const interestedInSet = new Set(myInterests.map((i) => i.toUserId))

  // Get who is interested in current user
  const interestsInMe = await prisma.interest.findMany({
    where: { toUserId: user.id },
    select: { fromUserId: true },
  })
  const interestedInMeSet = new Set(interestsInMe.map((i) => i.fromUserId))

  // Calculate compatibility for each candidate
  const pool: PoolUser[] = []

  for (const candidate of candidates) {
    const result = await calculateMatch(user.id, candidate.id)

    // Skip incompatible users (dealbreakers)
    if (!result.compatible) continue

    // Only show users with decent compatibility (>40)
    if (result.overall < 40) continue

    const interested = interestedInSet.has(candidate.id)
    const theyInterested = interestedInMeSet.has(candidate.id)

    pool.push({
      id: candidate.id,
      name: candidate.name,
      age: candidate.profile?.ageRange || null,
      location: candidate.profile?.location || null,
      photoUrl: candidate.photos[0]?.url || '',
      compatibility: {
        overall: result.overall,
        confidence: result.confidence,
      },
      interested,
      mutualInterest: interested && theyInterested,
    })
  }

  // Sort by compatibility score (highest first)
  pool.sort((a, b) => b.compatibility.overall - a.compatibility.overall)

  return NextResponse.json({ pool })
}
