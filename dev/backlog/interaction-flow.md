# Interaction Flow (Nudge → Crush Note → Accept)

## Goal
Implement the core interaction system that moves users from interest to in-person meeting — **no direct messaging**.

## Context (from PRODUCT.md)

The app facilitates the journey from interest to meeting IRL without endless texting.

### The Interaction Flow

| Action | Who (Default) | Description |
|--------|---------------|-------------|
| **Nudge** | Her | Signals openness to being invited |
| **Wink** | Either | Acknowledges interest |
| **Crush Note** | Him | Proposes a meetup |
| **Counter** | Her | Suggests an alternative |
| **Playful Decline** | Her | Passes on this one, invites another try |
| **Accept** | Her | Confirms the plan |

This mirrors how it works naturally:
1. She signals interest
2. He proposes
3. She accepts or adjusts
4. Both show up

### Crush Notes

Remember passing notes in class? "Do you like me? ☐ Yes ☐ No"

Crush Notes are the grown-up version — structured proposals instead of free text:

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

### Agent-Facilitated Coordination

Agents act as go-betweens:

> **Her agent:** "Someone from your list is interested. Likes hiking, has a dog. Send a nudge?"
>
> **Him, after receiving nudge:** "Send a crush note—coffee this weekend"
>
> **Her agent:** "He suggested coffee downtown this weekend. Accept, counter, or pass?"

### LGBTQ+ Considerations

The "who proposes" dynamic is less scripted for same-sex matching:
- Users set preference: "I prefer to initiate" / "I prefer to be approached" / "Either"
- Or default to symmetric
- System is flexible enough to handle it

## Acceptance Criteria

### Phase 1: Basic Interest
- [ ] "Interested" button on match pool cards (from T007)
- [ ] Track who expressed interest in whom
- [ ] Detect mutual interest

### Phase 2: Nudge & Wink
- [ ] Nudge action (signal openness)
- [ ] Wink action (acknowledge interest)
- [ ] Agent notification: "Someone's interested..."
- [ ] LGBTQ+ preference setting (initiate/be approached/either)

### Phase 3: Crush Notes
- [ ] Crush Note creation form (activity, timing, location)
- [ ] Send Crush Note to user
- [ ] Agent delivers: "He suggested..."
- [ ] Response options: Accept, Counter, Playful Decline, Pass

### Phase 4: Decline Limits & Role Reversal
- [ ] Track decline count per pair
- [ ] After 2 playful declines, prompt her to propose or pass
- [ ] Handle role reversal gracefully

### Phase 5: Meetup Confirmation
- [ ] Accepted Crush Note → Confirmed meetup
- [ ] Both receive ice breakers + location details
- [ ] Day-of reminder
- [ ] Post-meetup feedback (T006)

## Constraints
- No direct messaging — this is intentional
- No free text in Crush Notes — structured proposals only
- Decline limits prevent infinite back-and-forth
- Agent facilitates, humans decide

## Data Model

```typescript
interface Interest {
  fromUserId: string
  toUserId: string
  type: 'interested' | 'nudge' | 'wink'
  createdAt: Date
}

interface CrushNote {
  id: string
  fromUserId: string
  toUserId: string
  activity: 'coffee' | 'drinks' | 'walk' | 'activity'
  timing: 'morning' | 'afternoon' | 'evening' | 'weeknight' | 'weekend'
  locationId?: string
  locationContext?: string  // Brief context, not free text message
  status: 'pending' | 'accepted' | 'countered' | 'declined' | 'passed'
  declineCount: number
  createdAt: Date
}

interface Meetup {
  id: string
  crushNoteId: string
  users: string[]
  confirmedAt: Date
  scheduledFor?: Date
  location?: string
  status: 'confirmed' | 'completed' | 'no_show' | 'cancelled'
}
```

## Plan
1. Add Interest model to schema
2. Implement interest/nudge/wink actions
3. Add CrushNote model
4. Build Crush Note creation UI
5. Build response UI (accept/counter/decline/pass)
6. Add decline counting and role reversal
7. Create Meetup model for confirmed plans
8. Integrate with ice breakers
9. Add LGBTQ+ preference settings

## Dependencies
- Match pool (T007)
- Photo upload
- Agent notification system
- Ice breakers system
- Feedback system (T006)

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Nudge/Wink flow works
- [ ] Crush Notes can be created and sent
- [ ] All response types work (accept, counter, decline, pass)
- [ ] Decline limits enforced
- [ ] Role reversal triggers correctly
- [ ] Meetups confirmed and tracked
- [ ] LGBTQ+ preferences respected

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
