// Photo utilities (T007)
import { prisma } from './prisma'

/**
 * Check if user has at least one photo uploaded
 * Used to gate match pool visibility
 */
export async function hasPhotos(userId: string): Promise<boolean> {
  const count = await prisma.photo.count({
    where: { userId },
  })
  return count > 0
}

/**
 * Get user's primary photo (first in order)
 */
export async function getPrimaryPhoto(userId: string) {
  return prisma.photo.findFirst({
    where: { userId },
    orderBy: { order: 'asc' },
  })
}

/**
 * Get all photos for a user
 */
export async function getUserPhotos(userId: string) {
  return prisma.photo.findMany({
    where: { userId },
    orderBy: { order: 'asc' },
  })
}

/**
 * Filter user IDs to only those with photos
 * Useful for match pool queries
 */
export async function filterUsersWithPhotos(userIds: string[]): Promise<string[]> {
  if (userIds.length === 0) return []

  const photoCounts = await prisma.photo.groupBy({
    by: ['userId'],
    where: { userId: { in: userIds } },
    _count: true,
  })

  return photoCounts.map((p) => p.userId)
}
