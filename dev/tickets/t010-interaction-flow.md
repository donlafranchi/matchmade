# T010 - Interaction Flow (Nudge → Crush Note → Accept)

## Goal
Implement the core interaction system that moves users from interest to meeting IRL — **no direct messaging**.

## Context (from PRODUCT.md)

### The Interaction Flow

| Action | Who (Default) | Description |
|--------|---------------|-------------|
| **Nudge** | Her | Signals openness to being invited |
| **Wink** | Either | Acknowledges interest |
| **Crush Note** | Him | Proposes a meetup |
| **Counter** | Her | Suggests an alternative |
| **Playful Decline** | Her | Passes on this one, invites another try |
| **Accept** | Her | Confirms the plan |

### Crush Notes

Structured proposals instead of free text:

**He selects:**
- Activity: Coffee / Drinks / Walk / Activity
- Timing: Morning / Afternoon / Evening / Weeknight / Weekend
- Location: Selected from maps (can add brief context)

**She responds:**
- Accept with timing preference
- Counter with alternative
- Playful decline (invites another attempt)
- Pass

**Decline limits:**
- Two playful declines allowed
- After two, the ball moves to her court
- She proposes or passes entirely

### LGBTQ+ Considerations
- Users set preference: "I prefer to initiate" / "I prefer to be approached" / "Either"
- Or default to symmetric

## Acceptance Criteria

### Phase 1: Nudge & Wink (extends T008 Interest)
- [ ] Rename "Interested" to "Nudge" in UI
- [ ] Add "Wink" as acknowledgment (visible to nudger)
- [ ] Show who has nudged you
- [ ] LGBTQ+ preference setting in profile

### Phase 2: Crush Note Creation
- [ ] Crush Note form with:
  - Activity picker (Coffee, Drinks, Walk, Activity)
  - Timing picker (Morning, Afternoon, Evening, Weeknight, Weekend)
  - Location input (text for MVP, maps later)
  - Optional brief context (20 char max)
- [ ] Can only send Crush Note after mutual nudge/wink
- [ ] Store Crush Note in database

### Phase 3: Crush Note Response
- [ ] Recipient sees pending Crush Notes
- [ ] Response options:
  - Accept (with preferred timing)
  - Counter (modify activity/timing/location)
  - Playful Decline (with canned message)
  - Pass (remove from pool)
- [ ] Track decline count per pair

### Phase 4: Decline Limits & Role Reversal
- [ ] After 2 playful declines, notify "Your turn to propose"
- [ ] Ball-in-court indicator in UI
- [ ] If she doesn't propose within X days, match expires

### Phase 5: Accepted → Meetup
- [ ] Confirmed meetup record created
- [ ] Both users see meetup details
- [ ] Link to feedback form after meetup date

## Data Model

```prisma
model CrushNote {
  id             String   @id @default(cuid())
  fromUserId     String
  toUserId       String

  activity       String   // 'coffee' | 'drinks' | 'walk' | 'activity'
  timing         String   // 'morning' | 'afternoon' | 'evening' | 'weeknight' | 'weekend'
  location       String?
  context        String?  // Max 20 chars

  status         String   // 'pending' | 'accepted' | 'countered' | 'declined' | 'passed'
  declineCount   Int      @default(0)

  response       String?  // Her response message (for counter/decline)
  respondedAt    DateTime?

  createdAt      DateTime @default(now())

  fromUser       User     @relation("CrushNotesSent", fields: [fromUserId], references: [id])
  toUser         User     @relation("CrushNotesReceived", fields: [toUserId], references: [id])
  meetup         Meetup?

  @@index([fromUserId])
  @@index([toUserId])
  @@index([status])
}

model Meetup {
  id           String   @id @default(cuid())
  crushNoteId  String   @unique

  activity     String
  timing       String
  location     String?
  scheduledFor DateTime?

  status       String   // 'confirmed' | 'completed' | 'cancelled' | 'no_show'

  createdAt    DateTime @default(now())

  crushNote    CrushNote @relation(fields: [crushNoteId], references: [id])

  @@index([status])
}
```

Also update User model:
```prisma
model User {
  // ... existing fields

  interactionPreference String? // 'initiate' | 'be_approached' | 'either'

  crushNotesSent     CrushNote[] @relation("CrushNotesSent")
  crushNotesReceived CrushNote[] @relation("CrushNotesReceived")
}
```

## UI Components

### Nudge/Wink (update UserCard)
- Rename heart to "Nudge"
- Show "Winked at you" indicator
- Show "Your turn" when they nudged first

### Crush Note Modal
- Activity pills (Coffee, Drinks, Walk, Activity)
- Timing pills
- Location text input
- Optional context (20 char)
- "Send Crush Note" button

### Crush Notes Inbox
- List of received Crush Notes
- Each shows: who, activity, timing, location
- Action buttons: Accept, Counter, Decline, Pass

### Response Modal
- For Accept: confirm or adjust timing
- For Counter: modify any field
- For Decline: select canned playful message

### Meetup Card
- Shows confirmed meetup details
- Countdown to date
- Link to feedback after

## Constraints
- No free-text messaging — structured proposals only
- Context field max 20 chars
- Two decline limit before role reversal
- Must have mutual interest before sending Crush Note

## Dependencies
- T008 Match Pool (done) — Interest model becomes Nudge
- T007 Photo Upload (done)
- T006 Feedback Form (done) — linked from Meetup

## Plan

1. Add CrushNote and Meetup models to schema
2. Add interactionPreference to User
3. Update Interest → Nudge/Wink semantics
4. Build Crush Note creation API and form
5. Build Crush Note response API and UI
6. Implement decline counting and role reversal
7. Create Meetup from accepted Crush Note
8. Build Meetup display and link to feedback

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Nudge/Wink flow works
- [ ] Can create Crush Note after mutual interest
- [ ] All response types work (accept, counter, decline, pass)
- [ ] Decline limits enforced (2 max)
- [ ] Role reversal triggers at limit
- [ ] Accepted Crush Note creates Meetup
- [ ] Meetup links to feedback

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
