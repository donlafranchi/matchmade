# Phase 2: Interpretation Engine - Ticket Summary

**Created:** 2025-12-24
**Vision Document:** `/dev/vision/profile-as-interpretation.md`
**Status:** Ready for implementation

---

## Overview

Phase 2 implements the core product vision: conversational profiling with therapeutic interpretation. This moves Matchmade from rigid dropdown forms to a system that analyzes user language through therapeutic frameworks (Gabor Maté, Esther Perel, Gottman, IFS) and reflects back "Here's what we're hearing from you" insights.

### Goals

1. **Build MVP interpretation pipeline** using Gabor Maté framework (attachment theory, emotional needs)
2. **Automate analysis triggers** via background jobs (after chat, on profile view)
3. **Expose interpretations to frontend** via API with proper error handling
4. **Display interpretations in profile view** alongside existing forms (toggle between views)
5. **Establish foundation** for additional frameworks and multi-framework synthesis

### What This Is NOT

- ❌ Not replacing Phase 1 immediately (forms stay as toggle option)
- ❌ Not diagnosing mental health conditions
- ❌ Not claiming to predict chemistry
- ❌ Not exposing raw LLM prompts to users
- ❌ Not launching until MVP validated with real users

---

## Ticket Breakdown

### Core MVP Sequence (Required for Launch)

These 5 tickets build a minimal viable interpretation engine:

| # | Ticket | Mode | LOC | Dependencies | Status |
|---|--------|------|-----|--------------|--------|
| **2-01** | Schema Migration - Interpretation Fields | Single-Dev | ~150 | Phase 1 complete | ✅ Ready |
| **2-02** | MVP Interpretation Pipeline (Gabor Maté) | Single-Dev | ~620 | 2-01 | ✅ Ready |
| **2-03** | Background Job System for Analysis Triggers | Single-Dev | ~550 | 2-02 | ✅ Ready |
| **2-04** | API Endpoint for Fetching Interpretations | Single-Dev | ~300 | 2-03 | ✅ Ready |
| **2-05** | Basic Profile View with Interpretations UI | Single-Dev | ~450 | 2-04 | ✅ Ready |

**Total MVP:** ~2,070 LOC across 5 tickets

---

## Detailed Ticket Descriptions

### 2-01: Schema Migration - Interpretation Fields

**Goal:** Add database fields to store interpretations, patterns, and analysis metadata.

**Key Additions:**
- `Profile.interpretations` (Json) - Therapeutic insights
- `Profile.rawPatterns` (Json) - Word frequency, themes, tone
- `Profile.lastAnalyzed` (DateTime) - Staleness tracking
- Same fields on `ContextIntent` for context-specific insights
- `InterpretationFeedback` table for user corrections (future use)

**Complexity:** Low
**Risk:** Low (additive schema changes only)
**Estimated Time:** 2-3 hours

---

### 2-02: MVP Interpretation Pipeline (Gabor Maté)

**Goal:** Build LLM-powered analysis that interprets chat transcripts through Gabor Maté's therapeutic framework.

**Key Components:**
- Pattern extraction (word frequency, themes, emotional tone)
- LLM prompt template for Gabor Maté analysis
- OpenAI/Anthropic API integration with structured output
- Analyze attachment style, underlying needs, trauma patterns
- Store results in Profile.interpretations with confidence scores
- Manual trigger only (background jobs in next ticket)

**Frameworks Implemented:**
- ✅ Gabor Maté (attachment, emotional needs, authentic self)

**Complexity:** Medium-High
**Risk:** Medium (depends on LLM API quality)
**Estimated Time:** 1 full day
**Cost:** ~$0.04 per analysis (estimate)

---

### 2-03: Background Job System for Analysis Triggers

**Goal:** Automatically trigger analysis at strategic moments with intelligent caching and rate limiting.

**Key Features:**
- Analysis triggered after every 5th chat message
- Analysis triggered on profile view if stale (>1 hour)
- Manual "Refresh my profile" API endpoint
- Job queue with priority (manual > view > auto)
- Retry logic (3 attempts with exponential backoff)
- Rate limiting (max 1 analysis per user per hour)
- Database-based polling (no external dependencies for MVP)

**Complexity:** Medium
**Risk:** Medium (job reliability, cost control)
**Estimated Time:** 6-8 hours

---

### 2-04: API Endpoint for Fetching Interpretations

**Goal:** Expose interpretations to frontend with proper error handling and state management.

**Key Features:**
- GET /api/profile/interpretations?contextType=romantic
- Returns shared + context-specific interpretations
- Status tracking (not_started, pending, processing, completed, failed)
- Message count and hasMinimumData flag
- Optional raw patterns for transparency
- <200ms response time (database only, no LLM)

**Complexity:** Low-Medium
**Risk:** Low
**Estimated Time:** 3-4 hours

---

### 2-05: Basic Profile View with Interpretations UI

**Goal:** Display therapeutic insights in profile view with appropriate loading/error states.

**Key Features:**
- "Here's what we're hearing from you" reflective UI
- Loading state during analysis
- Empty state when <10 messages
- Completed state shows insights by framework
- Evidence quotes (collapsible)
- Confidence indicators (subtle)
- "Refresh interpretations" button
- Toggle between form view and interpretations view
- Mobile-first, responsive design

**Complexity:** Medium
**Risk:** Low-Medium (UX polish needed)
**Estimated Time:** 6-8 hours

---

## Implementation Order

**Recommended sequence:**

1. **2-01: Schema Migration** (prerequisite for everything)
   - Run migration
   - Verify schema changes
   - Generate Prisma types

2. **2-02: MVP Pipeline** (core analysis logic)
   - Build pattern extraction
   - Write Gabor Maté prompts
   - Test LLM integration
   - Validate with sample transcripts

3. **2-03: Background Jobs** (automation)
   - Implement job queue
   - Add triggers to chat API
   - Test rate limiting
   - Monitor token costs

4. **2-04: API Endpoint** (expose to frontend)
   - Build interpretations endpoint
   - Test all states (empty, pending, completed, failed)
   - Verify response format

5. **2-05: Profile View UI** (user-facing)
   - Build interpretations component
   - Design loading states
   - Polish UI/UX
   - Test with real users

**Critical Path:** 2-01 → 2-02 → 2-03 → 2-04 → 2-05 (sequential)

**Estimated Total Time:** 3-4 full development days

---

## Success Criteria

### Technical Success

- [ ] All 5 tickets implemented and tested
- [ ] Schema migration applied without data loss
- [ ] Analysis pipeline generates valid interpretations
- [ ] Background jobs process reliably (>95% success rate)
- [ ] API endpoints respond <200ms
- [ ] Frontend displays interpretations correctly
- [ ] All states handled (empty, loading, error, success)
- [ ] Token costs <$50 for 1000 users (one-time analysis)

### Product Success

- [ ] Users feel "deeply understood" (qualitative feedback)
- [ ] Interpretations are empathetic, not clinical
- [ ] Evidence quotes build trust
- [ ] No pathologizing language
- [ ] Interface feels easy and natural
- [ ] 10+ users test and validate quality
- [ ] ≥80% of interpretations marked "accurate" by users (future feedback loop)

### Business Success

- [ ] Demonstrates differentiation vs competitors
- [ ] User retention increases (tracked in analytics)
- [ ] Users share more in conversations (deeper engagement)
- [ ] Foundation for better matching algorithm (Phase 3)

---

## Dependencies & Prerequisites

### Before Starting Phase 2

✅ **Phase 1 Complete:**
- Profile + ContextIntent models exist
- Chat interface functional
- Users can save messages
- Off-the-record implemented

✅ **Infrastructure:**
- Next.js app deployed
- Postgres database running
- Prisma configured
- Authentication working

✅ **External Services:**
- OpenAI API key OR Anthropic API key
- Environment variables configured

### During Phase 2

⚠️ **Monitor:**
- LLM API rate limits
- Token costs (budget: $100 for MVP testing)
- Database performance (Json field queries)
- Job queue health (pending jobs count)

---

## Risks & Mitigations

### Risk 1: LLM Quality Inconsistent

**Impact:** High (core product value)
**Likelihood:** Medium

**Mitigations:**
- Test prompts extensively with varied inputs
- Implement confidence thresholds (≥70%)
- Show evidence quotes (transparency)
- Allow user corrections (future ticket)
- Start with one framework (Gabor Maté) before adding more

### Risk 2: LLM Costs Too High

**Impact:** High (business viability)
**Likelihood:** Low-Medium

**Mitigations:**
- Rate limiting (1 per user per hour)
- Staleness check (skip if recent)
- Minimum message threshold (skip if <10 messages)
- Token usage logging
- Re-analysis only when needed
- Estimated cost: ~$0.04/analysis, $40 for 1000 users (manageable)

### Risk 3: Users Find Interpretations Creepy

**Impact:** Critical (trust violation)
**Likelihood:** Low

**Mitigations:**
- Empathetic, non-judgmental language
- Show evidence (transparency)
- Allow corrections (future)
- Toggle between form view (user control)
- Never hide analysis (always visible to user)
- Clear about what we're doing (not secret profiling)

### Risk 4: Background Jobs Fail

**Impact:** Medium (analysis doesn't complete)
**Likelihood:** Low

**Mitigations:**
- Retry logic (3 attempts)
- Error logging (review failures)
- Manual refresh option (user can trigger)
- Graceful degradation (forms still work)
- Job queue monitoring (alert if >10 failures)

### Risk 5: Mobile UX Overwhelming

**Impact:** Medium (poor user experience)
**Likelihood:** Low

**Mitigations:**
- Mobile-first design
- Progressive disclosure (summary first, details on demand)
- Collapsible evidence
- Toggle to simple form view
- Test with 320px width (smallest devices)

---

## Future Enhancements (Post-MVP)

### Additional Tickets (Not in Core MVP)

**2-06: User Refinement Flow** (~400 LOC)
- Chat-based interpretation corrections
- "This doesn't feel right" button
- Re-analysis with user context
- Store corrections in InterpretationFeedback

**2-07: Additional Framework - Esther Perel** (~300 LOC)
- Romantic context only
- Desire paradox analysis
- Intimacy style interpretation
- Cultural narrative recognition

**2-08: Additional Framework - Gottman** (~300 LOC)
- Communication pattern analysis
- Four Horsemen detection (criticism, contempt, defensiveness, stonewalling)
- Conflict resolution style
- Love language inference

**2-09: Additional Framework - IFS (Internal Family Systems)** (~300 LOC)
- Parts work identification
- Self-energy vs parts-driven behavior
- Inner critic, protector, wounded child detection

**2-10: Multi-Framework Synthesis** (~400 LOC)
- Combine insights from multiple frameworks
- Resolve conflicts between frameworks
- Weighted synthesis based on confidence
- Holistic summary across all lenses

**Total Future Enhancements:** ~1,700 LOC (5 more tickets)

---

## Testing Strategy

### Unit Testing

Each ticket includes comprehensive unit tests:
- Pattern extraction functions
- LLM prompt builders
- Job queue logic
- API endpoint responses
- React component rendering

**Target Coverage:** ≥80% for business logic

### Integration Testing

Full-stack flows:
- Chat → Analysis trigger → Job processing → API fetch → UI display
- Error scenarios: LLM failure, insufficient data, rate limiting
- State transitions: Empty → Loading → Completed

### Manual Testing

Real user scenarios:
- 10 test users with varied conversation styles
- Romantic, friendship, and professional contexts
- Quality assessment of interpretations
- Mobile device testing (iOS + Android)

### Load Testing

Performance validation:
- 100 concurrent analysis jobs
- 1000 API requests/minute
- Database query performance with 10,000 interpretations

---

## Cost Analysis

### Development Cost

**Engineering Time:**
- 3-4 full days for MVP (5 tickets)
- 2-3 additional days for enhancements (5 more tickets)
- Total: ~1 week of focused development

### Infrastructure Cost

**Per 1000 Users (One-Time Analysis):**
- LLM API: ~$40 (1000 users × $0.04)
- Database storage: Negligible (Json fields)
- Background jobs: $0 (database polling)

**Per 1000 Users (Ongoing):**
- Re-analysis (assuming 10% monthly): ~$4/month
- API requests: Negligible (database queries)
- Total: ~$44 one-time, ~$4/month ongoing

**Scalability:**
- At 10,000 users: ~$440 one-time, ~$40/month
- At 100,000 users: ~$4,400 one-time, ~$400/month
- Cost per user decreases with better caching strategies

---

## Launch Checklist

Before deploying Phase 2 to production:

### Pre-Launch

- [ ] All 5 MVP tickets complete and tested
- [ ] Migration tested on staging with production data copy
- [ ] LLM prompts validated with 20+ sample transcripts
- [ ] User testing with 10+ real users
- [ ] Qualitative feedback collected and addressed
- [ ] Token cost monitoring in place
- [ ] Error alerting configured (failed jobs, LLM errors)
- [ ] Rollback plan documented and tested

### Launch

- [ ] Feature flag created (gradual rollout)
- [ ] Monitoring dashboard live (job queue health, token costs)
- [ ] User onboarding updated (explain interpretations)
- [ ] Support documentation written (what are interpretations?)
- [ ] Privacy policy updated (LLM analysis disclosed)

### Post-Launch

- [ ] Monitor user engagement (do they use interpretations?)
- [ ] Track accuracy (user feedback when available)
- [ ] Optimize prompts based on real data
- [ ] Adjust rate limits if costs too high
- [ ] Iterate on UI based on user behavior

---

## Metrics to Track

### Product Metrics

- **Interpretation View Rate:** % of users who view interpretations
- **Toggle Preference:** % using interpretations vs forms
- **Refresh Usage:** How often users manually refresh
- **Time on Interpretations Page:** Engagement indicator
- **Message Count Growth:** Do users share more after seeing interpretations?

### Technical Metrics

- **Analysis Success Rate:** % of jobs completing successfully
- **Average Analysis Time:** Should be <60 seconds
- **LLM Token Usage:** Daily/weekly cost tracking
- **API Response Time:** Should be <200ms (p95)
- **Error Rate:** Failed jobs, API errors

### Quality Metrics

- **Confidence Distribution:** Avg confidence of stored interpretations
- **Framework Coverage:** % of users with each framework detected
- **Evidence Quality:** Manual review of sample insights
- **User Feedback:** "Accurate" vs "Not quite right" (future)

---

## Related Documents

### Vision & Strategy

- `/dev/vision/profile-as-interpretation.md` - Comprehensive architectural vision
- `.context/northstar.md` - Product north star (updated with interpretation vision)
- `.context/llm-dev-context.md` - Build order and phasing
- `.context/concept-summary.md` - Product overview

### Architecture & Logs

- `/dev/logs/slice-1-option1-architecture-2025-12-22.md` - Profile + ContextIntent model design
- `.context/session-logs/vision-integration-2025-12-24.md` - Vision documentation update log

### Current State

- `/dev/project-state.md` - Current phase, active work, handoffs
- `/dev/tickets/slice-1a-schema-migration.md` - Example ticket format
- `/dev/protocols/single-dev.md` - Development workflow

---

## Key Contacts & Roles

**Product Manager:** Defines strategic priority, go/no-go decisions
**Architect:** Reviews technical design before implementation
**Feature Planner:** You (created these tickets)
**Backend Specialist:** Implements 2-01, 2-02, 2-03, 2-04
**Frontend Specialist:** Implements 2-05
**QA:** Validates all tickets before marking complete
**Agent-Logic:** Optimizes LLM prompts based on results

---

## Summary

Phase 2 transforms Matchmade from a form-based dating app into a conversational relationship platform that uses therapeutic frameworks to help users feel deeply understood. The 5 MVP tickets (~2,070 LOC) establish:

1. Database schema for storing interpretations
2. LLM-powered analysis pipeline (Gabor Maté framework)
3. Automated background job system
4. API for frontend consumption
5. User-facing interpretations display

This foundation enables:
- Better user engagement (feeling understood)
- Richer profile data (beyond checkboxes)
- Improved matching algorithm (Phase 3)
- Competitive differentiation (therapeutic insight)

**Estimated delivery:** 3-4 full development days
**Estimated cost:** ~$100 for MVP testing (1000 users)
**Risk level:** Medium (LLM quality dependency)
**Value:** High (core product vision realized)

---

## Questions & Open Items

### Technical Questions

1. **OpenAI vs Anthropic?** Recommend OpenAI GPT-4o for structured output. Anthropic Claude 3.5 Sonnet also works but requires more prompt engineering.

2. **Job queue infrastructure?** Start with database polling (simple). Migrate to Inngest/BullMQ if >1000 active users.

3. **Caching strategy?** Current: 1-hour staleness. Consider: Cache interpretations in Redis for faster API responses.

4. **Rate limiting approach?** Current: 1 per user per hour. Adjust based on cost monitoring.

### Product Questions

1. **How much interpretation is too much?** Test with users. Start conservative (only high-confidence insights).

2. **When to replace forms entirely?** After 100+ users validate interpretations quality. Keep forms as fallback.

3. **Privacy concerns?** Always show interpretations to users. Never hidden profiling. Disclose in terms.

4. **Multi-language support?** English only for MVP. Future: Language detection + translated prompts.

### Business Questions

1. **Pricing implications?** LLM costs manageable at scale. Consider premium tier with deeper analysis.

2. **Competitive moat?** Therapeutic interpretation is differentiator. Patent/IP considerations?

3. **Partnerships?** Therapist/coach network? "Powered by [Framework]" attribution?

---

**Status:** ✅ Ready for implementation
**Next Step:** Product Manager review → Architect validation → Backend Specialist starts 2-01

---

**Document maintained by:** Feature Planner
**Last updated:** 2025-12-24
