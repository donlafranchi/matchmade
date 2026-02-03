# Values Matching System

## Goal
Structured compatibility assessment on core dimensions (politics, religion, family goals) with user-defined hard/soft gates.

## Acceptance Criteria
- [ ] Predefined values questions (politics, religion, sex/intimacy, family, red flags)
- [ ] Users set hard gates ("will not date"), soft preferences, or no preference
- [ ] Agent walks user through values during onboarding
- [ ] Gap-filling: agent asks user B to answer when user A has hard gate on unanswered dimension
- [ ] Matching respects hard gates absolutely

## Constraints
- Nothing required, but agent explains benefits
- Gap-filling never reveals who is asking or why
- Agent-to-agent protocol: no raw data sharing, only compatibility assessments
- Questions from predefined pool only

## Plan
1. Define values questions schema
2. Add hard/soft gate UI to onboarding
3. Implement agent gap-filling flow
4. Add values screening to compatibility check

## Dependencies
- Agent chat system
- User profile with values fields
- Agent-to-agent communication layer

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Hard gates block incompatible matches
- [ ] Soft preferences influence scoring
- [ ] Gap-filling prompts work correctly

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
