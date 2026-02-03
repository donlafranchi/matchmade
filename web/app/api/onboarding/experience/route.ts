import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { experienceLevel } = await request.json()

    if (!["new", "learning", "experienced"].includes(experienceLevel)) {
      return NextResponse.json(
        { error: "Invalid experience level" },
        { status: 400 }
      )
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { experienceLevel },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error saving experience level:", error)
    return NextResponse.json(
      { error: "Failed to save experience level" },
      { status: 500 }
    )
  }
}
