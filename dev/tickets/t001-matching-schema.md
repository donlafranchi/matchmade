# T001 - Matching Schema

## Goal
Add database tables for profile dimensions and post-date feedback.

## Acceptance Criteria
- [ ] ProfileDimension model with formation/position/importance fields
- [ ] FeedbackResponse model for post-date feedback
- [ ] Migration runs successfully
- [ ] Relations to User model work correctly

## Constraints
- Must work with existing User model
- Dimension scores should be unique per user+dimension combo

## Plan
1. Add ProfileDimension model to schema.prisma
2. Add FeedbackResponse model to schema.prisma
3. Add relations to User model
4. Run migration
5. Test with Prisma Studio

## Schema

```prisma
model ProfileDimension {
  id         String   @id @default(cuid())
  userId     String
  dimension  String   // "schedule", "energy", "trust", etc.

  formation  Int      @default(0)  // 0-4 (none to highly formed)
  position   Float    @default(0)  // -2 to +2 (spectrum position)
  importance Int      @default(0)  // 0-3 (how much it matters)

  rawAnswer  String?  // Original text response
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, dimension])
  @@index([userId])
}

model FeedbackResponse {
  id         String   @id @default(cuid())
  fromUserId String
  toUserId   String
  matchId    String?  // Optional link to Match

  ease       Int      // 1-4 (not a fit to easy)
  seeAgain   Int      // 1-3 (no to definitely)
  notes      String?

  createdAt  DateTime @default(now())

  fromUser User @relation("FeedbackGiven", fields: [fromUserId], references: [id])
  toUser   User @relation("FeedbackReceived", fields: [toUserId], references: [id])

  @@index([fromUserId])
  @@index([toUserId])
}
```

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] `npx prisma migrate dev` runs without errors
- [ ] Can create ProfileDimension records in Prisma Studio
- [ ] Can create FeedbackResponse records in Prisma Studio
- [ ] Unique constraint prevents duplicate user+dimension

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
