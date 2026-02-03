# Ice Breakers

## Goal
Agent-generated conversation starters that give both users something to **talk about** when they meet.

## Context (from PRODUCT.md)

Both users have seen photos and know there's compatibility. Ice breakers give them something to talk about:

- **Asymmetric** — each gets different info
- **Lightweight and fun** — not a test
- **Pulled from agent conversation** — personalized, not generic

**Examples:**
- "She just got into rock climbing"
- "Ask him about his pizza opinions"
- "She has thoughts about that show you like"

## Acceptance Criteria

### Core Features
- [ ] Generate ice breakers from agent conversation data
- [ ] Asymmetric delivery (each person gets different hints)
- [ ] Prioritize specific/esoteric over generic ("both think X comedian is underrated" > "both like music")
- [ ] Deliver before 1:1 meetups (Crush Note accepts)
- [ ] Deliver day-of for group events

### Agent Integration
- [ ] User can ask "Why do you think we'd be compatible?"
- [ ] Agent surfaces shared interests naturally in conversation

## How It Works

**Input:** Both users' agent conversation history + profile dimensions

**Output:** 2-3 short hints per person, different for each

**Quality signals:**
- Specific > generic
- Recent interests > stale data
- Unique overlaps > common ones
- Fun/playful tone

## Constraints
- Not a test or evaluation
- Each user sees different ice breakers (asymmetric)
- Interaction not required before meeting
- Never reveal raw conversation data

## Plan
1. Extract interests/topics from agent conversation history
2. Find overlaps between two users
3. Rank by specificity and recency
4. Generate asymmetric hints (you know X about them, they know Y about you)
5. Deliver via notification before meetup
6. Add "why compatible" agent response

## Dependencies
- Agent conversation history stored
- Profile extraction (done)
- Match pool / meetup coordination
- Notification system

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Ice breakers reflect actual shared interests
- [ ] Each user gets different ice breakers
- [ ] Specific interests prioritized over generic
- [ ] "Why compatible" gives meaningful answers
- [ ] Delivered at right time (pre-meetup, day-of event)

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
