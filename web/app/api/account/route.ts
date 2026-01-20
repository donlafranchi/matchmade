import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Delete user - all related data cascades automatically (including sessions)
  await prisma.user.delete({
    where: { id: user.id },
  });

  return NextResponse.json({ success: true });
}
