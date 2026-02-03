import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { matchId, toUserId, safety, profileAccuracy, seeAgain, notes } = body

    if (!toUserId || !safety || !profileAccuracy || !seeAgain) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Prevent self-feedback
    if (toUserId === user.id) {
      return NextResponse.json(
        { error: "Cannot provide feedback for yourself" },
        { status: 400 }
      )
    }

    // Check if feedback already exists for this match
    const existing = await prisma.feedbackResponse.findFirst({
      where: {
        fromUserId: user.id,
        toUserId,
        matchId: matchId || undefined,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Feedback already submitted" },
        { status: 400 }
      )
    }

    await prisma.feedbackResponse.create({
      data: {
        fromUserId: user.id,
        toUserId,
        matchId: matchId || null,
        shouldRemove: safety === 'yes',
        profileAccuracy,
        seeAgain,
        notes: notes || null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error saving feedback:", error)
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    )
  }
}
