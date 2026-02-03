# Regional Waitlist

## Goal
Don't open matching in a region until minimum user threshold met. Build anticipation while waiting.

## Acceptance Criteria
- [ ] Collect location during onboarding
- [ ] Region stays in waitlist mode until threshold met
- [ ] Show waitlist position ("You're #347 in [City]")
- [ ] Notify users when region opens
- [ ] Transparency about waiting for critical mass

## Constraints
- Build anticipation, not frustration
- Clear communication about why waiting
- Auto-activate when threshold hit

## Plan
1. Add region field to user/waitlist
2. Track user counts per region
3. Define threshold per region
4. Build waitlist position display
5. Trigger activation and notifications

## Dependencies
- Waitlist system (done)
- Email notification system
- Regional user counts

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Region counts tracked correctly
- [ ] Waitlist position shows correctly
- [ ] Activation triggers at threshold
- [ ] Notifications sent

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
