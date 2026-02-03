# Reputation & Trust System

## Goal
Track real-world behavior and create accountability — **ghosting is a cardinal sin**.

## Context (from PRODUCT.md)

### What We Track
- Show-up rate
- Post-meetup feedback
- Response-to-invite ratio
- Profile accuracy

### Post-Meetup Questions (Lightweight)
- Any no-shows?
- Anyone not as they appeared?
- Anyone unkind?
- Any concerns?

### No-Show Policy

**Ghosting is a cardinal sin.**

Users who don't show up without notice get put in timeout. We keep it tongue-in-cheek:
- "Looks like you forgot about someone. That's not very cash money of you."
- "Timeout activated. Use this time to reflect on your choices."
- "Ready to be a grown-up? Welcome back."

### Reputation is Private
- Users see their own feedback
- System uses it for queue priority and feature access
- Others don't see scores directly

### User Moderation
- Flag system with community review
- Transparency reports
- Escalation to team for contested issues

## Acceptance Criteria

### Phase 1: Feedback Collection (T006 - Done)
- [x] Post-meetup feedback form
- [x] Safety flag for serious concerns
- [x] Profile accuracy feedback
- [x] Match quality rating

### Phase 2: Show-Up Tracking
- [ ] Mark meetups as completed/no-show
- [ ] Calculate show-up rate per user
- [ ] No-show timeout system
- [ ] Tongue-in-cheek timeout messaging

### Phase 3: Reputation Scoring
- [ ] Aggregate feedback into reputation score
- [ ] Track response-to-invite ratio
- [ ] Profile accuracy score (from feedback)
- [ ] Private reputation dashboard for user

### Phase 4: System Effects
- [ ] Reputation-based queue priority (high rep = seen first)
- [ ] Feature access gating (low rep = limited actions)
- [ ] "Verified reliable" indicator for high show-up rate

### Phase 5: Moderation
- [ ] Flag system for concerning behavior
- [ ] Community review queue
- [ ] Escalation workflow
- [ ] Transparency reports

## Timeout Rules

| Offense | Timeout Duration | Message |
|---------|------------------|---------|
| First no-show | 24 hours | "Looks like you forgot about someone..." |
| Second no-show | 7 days | "Timeout activated. Use this time to reflect..." |
| Third no-show | 30 days | "We're starting to see a pattern here..." |
| Pattern of no-shows | Permanent review | "Let's talk about this..." |

## Data Model

```typescript
interface ReputationScore {
  userId: string
  showUpRate: number        // 0-100
  responseRate: number      // 0-100
  accuracyScore: number     // 0-100 (profile matches reality)
  feedbackScore: number     // 0-100 (how others rate interactions)
  overall: number           // Weighted combination
  lastUpdated: Date
}

interface Timeout {
  userId: string
  reason: 'no_show' | 'flagged' | 'other'
  startedAt: Date
  endsAt: Date
  message: string
}

interface Flag {
  id: string
  reporterId: string
  reportedUserId: string
  reason: string
  severity: 'concern' | 'serious' | 'safety'
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  createdAt: Date
}
```

## Plan
1. Add show-up tracking to Meetup model
2. Build timeout system with messaging
3. Create reputation calculation service
4. Build private reputation dashboard
5. Implement queue priority based on reputation
6. Add flag system
7. Build moderation review queue

## Dependencies
- Meetup tracking (interaction-flow.md)
- Feedback system (T006 - done)
- Notification system

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Show-up rate calculated correctly
- [ ] Timeouts applied for no-shows
- [ ] Timeout messages display correctly
- [ ] Reputation score aggregates feedback
- [ ] Queue priority reflects reputation
- [ ] Flag system works
- [ ] Users can see their own reputation

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
