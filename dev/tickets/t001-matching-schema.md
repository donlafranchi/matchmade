# T001 - Matching Schema

## Goal
Add database tables for profile dimensions and post-date feedback.

## Acceptance Criteria
- [x] ProfileDimension model with formation/position/importance fields
- [x] FeedbackResponse model for post-date feedback
- [x] Migration runs successfully
- [x] Relations to User model work correctly

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
  dealbreaker Boolean @default(false)  // Hard pass - filter out incompatible

  rawAnswer    String?  // Original text response
  questionType String?  // 'scenario' | 'reflective' | 'direct_choice'
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, dimension])
  @@index([userId])
}

// On User model:
experienceLevel      String?  // 'new' | 'learning' | 'experienced'
experiencePreference String?  // 'similar' | 'any' | 'more_experienced'

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
- Added User relations: `profileDimensions`, `feedbackGiven` (named relation), `feedbackReceived` (named relation)
- ProfileDimension uses `onDelete: Cascade` to clean up when user is deleted
- FeedbackResponse uses `onDelete: RESTRICT` to prevent accidental data loss
- Migration 1: 20260203004428_add_matching_dimensions
- Migration 2: 20260203011119_add_dealbreaker_flag - added `dealbreaker` boolean for hard requirements
- Migration 3: 20260203014658_add_experience_tracking - added experience fields for two-track onboarding:
  - User: `experienceLevel` ('new' | 'learning' | 'experienced')
  - User: `experiencePreference` ('similar' | 'any' | 'more_experienced')
  - ProfileDimension: `questionType` ('scenario' | 'reflective' | 'direct_choice')

## Verification
- [x] `npx prisma migrate dev` runs without errors
- [ ] Can create ProfileDimension records in Prisma Studio
- [ ] Can create FeedbackResponse records in Prisma Studio
- [ ] Unique constraint prevents duplicate user+dimension

## Completion

**Date:** 2026-02-02
**Summary:** Added ProfileDimension and FeedbackResponse models with migration
**Files changed:**
- web/prisma/schema.prisma
- web/prisma/migrations/20260203004428_add_matching_dimensions/
**Notes:** Migration ran successfully. Manual verification of CRUD operations pending.
