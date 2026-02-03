# T006 - Post-Date Feedback Form

## Goal
Collect feedback after dates to keep users safe, hold profiles accountable, and validate matching quality.

## Purpose (Priority Order)
1. **Safety** — Flag concerning behavior so we can protect others
2. **Profile honesty** — Were they who they said they were? Catch catfishing, outdated photos, misrepresentation
3. **Match quality** — Did the algorithm work? Would you see them again?

## Acceptance Criteria
- [x] Gate question with opt-out ("no thanks" / "not yet")
- [x] Feedback form with safety, honesty, and match quality questions
- [x] Accessible via link (/feedback/[matchId]?to=[userId])
- [x] Saves response to FeedbackResponse table
- [x] Safety flag (shouldRemove) for moderation
- [x] Quick to complete (< 30 seconds)

## Constraints
- **Optional** — user can decline or defer with "no thanks" / "not yet"
- Gate question first before showing any feedback questions
- Non-judgmental framing — "help us improve and keep each other safe"
- Safety question first once they opt in

## Schema Changes

```prisma
model FeedbackResponse {
  id         String   @id @default(cuid())
  fromUserId String
  toUserId   String
  matchId    String?

  // Safety - should this person be removed?
  shouldRemove    Boolean  @default(false)

  // Profile honesty
  profileAccuracy String  // 'accurate' | 'minor_diff' | 'misleading'

  // Match quality
  seeAgain   String   // 'yes' | 'maybe' | 'no'
  notes      String?

  createdAt  DateTime @default(now())

  fromUser User @relation("FeedbackGiven", fields: [fromUserId], references: [id])
  toUser   User @relation("FeedbackReceived", fields: [toUserId], references: [id])

  @@index([fromUserId])
  @@index([toUserId])
  @@index([shouldRemove])  // For finding flagged users
}
```

## Plan
1. Update FeedbackResponse schema + migration
2. Create feedback page at app/feedback/[matchId]/page.tsx
3. Create FeedbackForm component
4. Create API endpoint to save feedback
5. Add success confirmation

## Questions

```typescript
// GATE QUESTION (shown first)
const GATE_QUESTION = {
  id: 'willProvide',
  question: "Quick feedback helps us improve matching and keep everyone safe. Got a minute?",
  options: [
    { value: 'yes', label: "Sure" },
    { value: 'later', label: "Not yet" },
    { value: 'no', label: "No thanks" }
  ]
}

// Only shown if willProvide === 'yes'
const FEEDBACK_QUESTIONS = [
  // 1. SAFETY - should they be removed? (serious issues = call authorities)
  {
    id: 'safety',
    question: "Should this person be removed from the app?",
    options: [
      { value: 'no', label: "No" },
      { value: 'yes', label: "Yes, remove them" }
    ]
  },

  // 2. PROFILE HONESTY
  {
    id: 'profileAccuracy',
    question: "Were they who they appeared to be in their profile?",
    options: [
      { value: 'accurate', label: "Yes, matched their profile" },
      { value: 'minor_diff', label: "Small differences" },
      { value: 'misleading', label: "Noticeably different" }
    ]
  },

  // 3. MATCH QUALITY (algorithm validation)
  {
    id: 'seeAgain',
    question: "Would you want to see them again?",
    options: [
      { value: 'yes', label: "Yes" },
      { value: 'maybe', label: "Maybe" },
      { value: 'no', label: "No" }
    ]
  },
  {
    id: 'notes',
    question: "Anything else we should know?",
    type: 'text',
    optional: true,
    placeholder: "Optional..."
  }
]
```

---

## Implementation Notes
- Gate question first - user can say "no thanks" or "not yet"
- Safety question simplified to "should they be removed?" (yes/no)
- Serious safety issues = contact authorities (shown in footer)
- All choice questions auto-advance after selection

## Verification
- [ ] Form loads for valid matchId
- [ ] Gate question allows declining
- [ ] Saves to FeedbackResponse table
- [ ] shouldRemove flag stored for moderation
- [ ] Shows confirmation on submit
- [ ] Works on mobile

## Completion

**Date:** 2026-02-02
**Summary:** Optional feedback form with gate question, safety flag, profile accuracy, and match quality
**Files changed:**
- web/prisma/schema.prisma (updated FeedbackResponse)
- web/lib/feedback/questions.ts (new)
- web/app/components/FeedbackForm.tsx (new)
- web/app/feedback/[matchId]/page.tsx (new)
- web/app/api/feedback/route.ts (new)
**Notes:** Access via /feedback/[matchId]?to=[userId]
