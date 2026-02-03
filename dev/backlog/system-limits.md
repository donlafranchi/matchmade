# System Limits

## Goal
Manage operational costs (LLM API), ensure regional critical mass, and motivate in-person meetings over endless chat.

## Acceptance Criteria
- [ ] Daily message cap with agent (cost management)
- [ ] Regional waitlist until user threshold met
- [ ] No direct user-to-user messaging until in-person meeting

## Constraints
- Frame limits positively ("Your matchmaker checks in daily" not "X messages left")
- Limits can adjust based on tier or activity stage
- No message length limits (feels arbitrary)
- No profile browsing (agent-curated introductions only)

## Plan
1. Add usage tracking to chat API
2. Implement daily message cap with reset
3. Add regional user counts and waitlist mode
4. Block direct messaging (agent-mediated only)

## Dependencies
- Agent chat system with usage tracking
- Regional user counts
- Tier system (for variable limits)

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Message cap enforced correctly
- [ ] Limit resets daily
- [ ] Regional waitlist activates below threshold

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
