# Matchmade Living Roadmap

**Status:** Active Development Guide
**Last Updated:** 2025-12-27
**Current Phase:** Phase 2 (Lifestyle Compatibility Layer)

---

## How to Use This Roadmap

This is the **single source of truth** for what we're building and when. Update this file as work progresses—don't create new documents.

**Status Indicators:**
- ✅ Complete
- 🔄 In Progress
- 🎯 Next Up
- ⏳ Upcoming
- 💭 Future/Exploration

**When to Update:**
- Mark items complete as they ship
- Add new items discovered during implementation
- Adjust priorities based on learning
- Archive completed phases in comments (don't delete)

---

## Phase 1: Attraction Foundation ✅ Complete

**Goal:** Enable photo-based attraction matching with basic event discovery
**Duration:** Week 1-2 of MVP
**Compatibility Layer:** Attraction only (days to weeks)

### Features Shipped

1. ✅ **Auth + Context Selection** (Brief 01)
   - Magic link authentication
   - Context selection (romantic/friendship)
   - Basic routing and session management

2. ✅ **Agent Chat with Off-the-Record** (Brief 02)
   - Chat UI for conversational profiling
   - Off-the-record message support (NOT stored)
   - "Forget that" functionality (zeros out derived fields)

3. ✅ **DerivedProfile Extraction Stub** (Brief 03)
   - Rule-based extraction from chat
   - Rigid forms as temporary scaffolding
   - Completeness tracking and missing fields
   - **Note:** Temporary—will be replaced by interpretation engine

4. ✅ **Profile Preview + Completeness Nudges** (Brief 04)
   - "How you'll be represented" preview
   - Shows completeness score and missing fields
   - CTA "Improve matching" returns to chat
   - **Note:** Temporary—will show interpreted insights later

5. ✅ **Media Upload + Gallery** (Brief 05)
   - Photo upload (3-6 photos)
   - Gallery view
   - Attraction set tagging
   - Media asset management

6. ✅ **Attraction Mode** (Brief 06)
   - Photo-only swipes (no text)
   - Yes/No decisions
   - Rate limiting
   - Swipe persistence
   - **Note:** Attraction is separate from compatibility

7. ✅ **Matching Engine (Attraction-Only)** (Brief 07)
   - Mutual attraction detection
   - Match creation and reveal
   - Match status tracking
   - "No matches yet" honest state
   - **Note:** Will evolve to include lifestyle/decency/values scores

8. ✅ **Events System** (Brief 08)
   - Event creation (user/venue/system)
   - Event discovery and browsing
   - Soft/Hard RSVP
   - Match-linked event interest
   - **Note:** Will add mysterious insights in Phase 2

9. ✅ **Notifications Inbox** (Brief 09)
   - In-app notifications
   - Email notifications (optional)
   - Read/unread tracking
   - Notification types (match, event, interest)

10. ✅ **Feedback + Trust Aggregate (Stub)** (Brief 10)
    - Basic feedback form
    - Trust aggregate model
    - **Note:** Will become full decency system in Phase 3

---

## Phase 2: Interpretation Engine ✅ Complete

**Goal:** Build therapeutic interpretation system for conversational profiling
**Duration:** Week 2-3 of development
**Status:** Complete (2025-12-27)

### Features Shipped

1. ✅ **Schema Migration** (Ticket 2-01)
   - Added interpretations, rawPatterns, lastAnalyzed to Profile and ContextIntent
   - Created InterpretationFeedback table

2. ✅ **MVP Interpretation Pipeline** (Ticket 2-02)
   - Gabor Maté framework analysis
   - Pattern extraction (word frequency, themes, tone)
   - Claude API integration for analysis
   - Confidence thresholds (≥0.70)

3. ✅ **Background Job System** (Ticket 2-03)
   - Analysis job queue (database polling)
   - Triggers: after chat (5+ msgs), on profile view, manual refresh
   - Rate limiting (1 analysis/hour/user)
   - Retry logic with exponential backoff

4. ✅ **API Endpoints** (Ticket 2-04)
   - GET /api/profile/interpretations
   - Query params: contextType, includePatterns
   - Status detection: not_started | pending | processing | completed | failed

5. ✅ **Profile View UI** (Ticket 2-05)
   - Display interpretations in profile view
   - "Here's what we're hearing from you" structure
   - Comprehensive testing complete

**Note:** Phase 2 built the foundation for interpretation, but agents don't respond to users yet. Phase 3 makes agents conversational.

---

## Phase 3: Self-Hosted Agents 🎯 Next Up

**Goal:** Replace Claude API with self-hosted LLM and enable real-time agent conversations
**Duration:** 2-3 weeks (part-time)
**Status:** Ready to start

### Why Agents Before Lifestyle?
- Can't validate compatibility questions without real conversations
- Need real users testing before building complex features
- Self-hosting removes API costs and enables unlimited testing
- Agents are the core UX - everything else builds on this

### Current State (Before Phase 3)
- ✅ Chat messages stored (user only)
- ✅ Background analysis runs (using Claude API)
- ✅ Interpretations generated (but not shown conversationally)
- ❌ No agent responses to users
- ❌ No live profile building from conversations
- ❌ Paying $0.01/analysis (Claude API)
- ❌ Not testable by real users

### Target State (After Phase 3)
- ✅ Agent responds to every user message
- ✅ Therapeutic matchmaker persona (Gabor Maté style)
- ✅ Live profile extraction from conversations
- ✅ Self-hosted LLM (no API costs)
- ✅ 5-10 beta users testing
- ✅ "Here's what we're hearing" shown in real-time

### Features to Build

#### 3.1: Unified LLM Client (1-2 days)
- Replace `@anthropic-ai/sdk` with environment-agnostic client
- Support Ollama (local testing) and vLLM (production)
- OpenAI-compatible API interface
- Environment-based endpoint switching

**Files:**
- `web/lib/llm-client.ts` (~150 LOC)
- Update `web/lib/interpretation/analyze.ts` (replace Anthropic)

**Environment:**
```bash
# Local (testing)
LLM_ENDPOINT=http://localhost:11434/v1
LLM_MODEL=llama3.2:3b

# Production (VPS)
LLM_ENDPOINT=https://llm.matchmade.app/v1
LLM_MODEL=meta-llama/Llama-3.1-70B-Instruct
```

#### 3.2: Real-Time Chat Agent (3-4 days)
- Agent responds to user messages
- Therapeutic matchmaker persona
- Remembers conversation context
- Context-aware (romantic vs friendship)
- Asks clarifying questions about values, lifestyle, attachment

**Files:**
- `web/lib/agents/chat-agent.ts` (~200 LOC)
- Update `web/app/api/chat/route.ts` (add agent response)

**Agent Persona:**
- Warm, therapeutic, non-judgmental
- Gabor Maté style: curious about underlying needs
- Asks one question at a time
- Reflects back what user shares
- Builds trust through empathy

#### 3.3: Frontend Integration (1 day)
- Show agent messages in chat UI
- Typing indicator while agent thinks
- Visual distinction (user vs agent bubbles)
- Scroll to bottom on new messages

**Files:**
- Update `web/app/contexts/[context]/ChatProfilePanel.tsx`

#### 3.4: Live Profile Extraction (2-3 days)
- Extract structured data from conversations
- Update Profile + ContextIntent in real-time
- Only persist high-confidence data (≥0.80)
- Agent knows what's missing and asks follow-ups

**Files:**
- `web/lib/agents/extraction-agent.ts` (~250 LOC)

**Extraction Triggers:**
- After every 5 messages (existing trigger)
- On profile view ("Update what I'm hearing...")
- Manual refresh button

#### 3.5: Local Testing with Ollama (1 day)
- Install Ollama locally
- Pull Llama 3.2 3B (lightweight, CPU-compatible)
- Test full conversation flow
- Verify extraction accuracy

**Setup:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model (2GB, runs on CPU)
ollama pull llama3.2:3b

# Start server
ollama serve  # http://localhost:11434
```

**Performance:** ~5-10s per response on CPU (acceptable for testing)

#### 3.6: VPS Setup with vLLM (2-3 days)
- Provision Hetzner GPU server (€40/month)
- Deploy vLLM with Llama 3.1 70B or Qwen 2.5 32B
- Set up reverse proxy (Caddy for HTTPS)
- Update Vercel env vars

**Infrastructure:**
- Hetzner CAX31 (8GB VRAM, €43/month)
- Podman + nvidia-container-toolkit
- vLLM server (OpenAI-compatible API)
- Caddy reverse proxy for HTTPS

**Performance:** <3s per response with GPU

#### 3.7: Vercel Deployment (1 day)
- Deploy Next.js app to Vercel
- Migrate database (Podman → Railway/Supabase)
- Connect to VPS LLM server
- Test end-to-end in production

#### 3.8: Beta User Testing (ongoing)
- Invite 5-10 users
- Monitor conversation quality
- Gather feedback on agent persona
- Iterate on prompts
- Track extraction accuracy

### Schema Changes
No schema changes needed - `ChatMessage.role` already supports "assistant"

### Acceptance Criteria
- [ ] Agent responds to every user message in <5s
- [ ] Responses feel therapeutic and natural
- [ ] Profile extracts from conversations (>70% accuracy)
- [ ] No Claude/OpenAI API costs (self-hosted)
- [ ] 5 beta users complete 15+ message conversations
- [ ] Users report feeling "understood"

### Cost Comparison
**Current (Claude API):**
- $0.01/analysis
- 100 users × 3 analyses = $3/month
- 1000 users × 3 analyses = $30/month

**Self-Hosted (Hetzner VPS):**
- €43/month flat (~$46)
- Unlimited inference
- Break-even at ~140 analyses/month

---

## Phase 4: Lifestyle Compatibility Layer ⏳ Paused

**Goal:** Add the most critical compatibility factor—day-to-day living patterns
**Duration:** Week 3-4 of user journey (after Phase 3 complete)
**Compatibility Layer:** Attraction × Lifestyle (weeks to months)
**Status:** Paused until Phase 3 complete and beta users are testing

### Why Lifestyle First?
- Most overlooked but most critical for daily life
- Determines if people can actually spend time together
- Can't discover psychological depth if schedules/energy don't align
- Extends relationship duration from days/weeks to weeks/months

### Features to Build

1. 🎯 **Lifestyle Compatibility Questions**
   - Design 10-15 natural language questions:
     - Energy level (morning person, night owl, flexible)
     - Social preference (introvert, extrovert, ambivert)
     - Activity level (high-energy, moderate, low-energy)
     - Spontaneity vs planning
     - Alone time needs
     - Work-life balance
     - Cleanliness/organization
     - Spending habits
     - Travel frequency
     - Home vs social preference
   - Questions asked conversationally in chat
   - Responses stored and interpreted
   - Optional: Allow users to skip and come back

2. 🎯 **Lifestyle Scoring Algorithm**
   - Calculate lifestyle compatibility (0-100) between users
   - Factors to consider:
     - Hard mismatches (morning + night owl = lower score)
     - Complementary traits (introvert + extrovert CAN work)
     - Lifestyle dealbreakers vs workable differences
   - Store lifestyleScore in CompatibilityScore model
   - **TODO:** Define scoring weights and mismatch penalties

3. 🎯 **Update Matching Engine**
   - Add lifestyleScore to matching formula:
     ```
     matchScore = attraction × lifestyleScore
     ```
   - Rank matches by combined score
   - Surface lifestyle compatibility % to users (optional)
   - **TODO:** Decide if we show % or keep it internal

4. 🎯 **Mysterious Insights (Lifestyle-Powered)**
   - Generate event insights based on lifestyle matches:
     - "Someone here shares your energy level"
     - "Another person has a similar work-life balance"
     - "One attendee prefers spontaneity like you"
   - Personalized per user (2-3 insights per event)
   - Don't reveal WHO—let users discover through conversation
   - **TODO:** Build insight generation algorithm

5. 🎯 **Event Recommendations (Lifestyle-Based)**
   - Recommend events where lifestyle-compatible people are attending
   - Filter: "Show events with people who match my lifestyle"
   - Boost events with high lifestyle compatibility in feed
   - **TODO:** Design recommendation algorithm

### Schema Changes Needed

```prisma
// New model for lifestyle compatibility
model LifestyleProfile {
  id              String   @id @default(cuid())
  userId          String   @unique

  // Lifestyle Factors (0-100 scale or enum)
  energyLevel     String?  // MORNING, NIGHT, FLEXIBLE
  socialPreference String? // INTROVERT, AMBIVERT, EXTROVERT
  activityLevel   String?  // HIGH, MODERATE, LOW
  spontaneity     String?  // SPONTANEOUS, FLEXIBLE, PLANNER
  aloneTimeNeeds  String?  // HIGH, MODERATE, LOW
  workLifeBalance String?  // WORK_FOCUSED, BALANCED, LIFE_FOCUSED
  cleanliness     String?  // NEAT, ORGANIZED, CASUAL, MESSY
  spendingHabits  String?  // SAVER, BALANCED, SPENDER
  travelFrequency String?  // FREQUENT, OCCASIONAL, HOMEBODY
  homeVsSocial    String?  // HOMEBODY, BALANCED, SOCIAL_BUTTERFLY

  // Derived from chat responses
  responseData    Json     @default("{}")
  lastUpdated     DateTime @updatedAt
  completeness    Int      @default(0)
}

// Add to existing CompatibilityScore model
model CompatibilityScore {
  // ... existing fields ...

  lifestyleScore  Int?     // 0-100, day-to-day compatibility
  lifestyleDetails Json?   // Which lifestyle factors match/mismatch
}

// Add to EventInterest for mysterious insights
model EventInterest {
  // ... existing fields ...

  mysteriousInsights Json?  // Array of 2-3 personalized lifestyle insights
}
```

### Acceptance Criteria

- [ ] User can answer 10-15 lifestyle questions conversationally
- [ ] System calculates lifestyle compatibility between users
- [ ] Matching engine uses attraction × lifestyle for ranking
- [ ] Events show 2-3 mysterious insights per user (lifestyle-powered)
- [ ] High lifestyle compatibility visible in some way (% or indicator)
- [ ] Users can filter events by lifestyle compatibility (optional)

---

## Phase 5: Decency Foundation ⏳ Future

**Goal:** Build safety through behavioral feedback from real-world events
**Duration:** Week 5-6 of user journey (after Phases 3-4 complete)
**Compatibility Layer:** Attraction × (Decency + Lifestyle) (years)
**Status:** Paused - requires Phase 1 events working and real attendance data

### Why Decency Layer?
- Safety is fundamental (like breathing - necessary but not what makes relationships last)
- Behavioral feedback more reliable than self-reported values
- Requires real event attendance to work (can't build this without users meeting)
- Filters out bad actors before they cause harm

### Features to Build

1. ⏳ **Post-Event Feedback Forms**
   - After each event, prompt attendees for feedback on others:
     - Behavioral: Was respectful? Honest? Would meet again?
     - Safety: Express concern (triggers safety review)
     - Romantic interest: Signal attraction (if applicable)
   - Simple UI: thumbs up/down or quick ratings
   - Optional text field for concerns
   - **TODO:** Design feedback timing (immediately? next day?)

2. ⏳ **Decency Score Aggregation**
   - Calculate decency score (0-100) from feedback:
     - Start at 50 (neutral)
     - Each positive: +2 points (capped at 100)
     - Each negative: -5 points (stronger signal)
     - Safety concern: -20 points (serious)
     - No-show: -10 points (disrespectful of time)
   - Require minimum 5 feedbacks before score is "established"
   - Track component metrics (respectful count, honest count, etc.)
   - **TODO:** Prevent gaming (friends giving fake positive feedback)

3. ⏳ **Decency Status & Enforcement**
   - Status levels based on score:
     - EXCELLENT (85-100): Prioritized in matching
     - GOOD_STANDING (60-84): Normal matching
     - NEEDS_IMPROVEMENT (40-59): Warning issued to user
     - FLAGGED (20-39): Limited matching, review required
     - SUSPENDED (0-19): Removed from platform
   - Automated actions based on status
   - Manual review for safety concerns (moderation queue)
   - **TODO:** Define moderation workflow

4. ⏳ **Update Matching Engine**
   - Add decencyScore to matching formula:
     ```
     matchScore = attraction × (0.4 × decencyScore + 0.6 × lifestyleScore)
     ```
   - High decency users boosted in recommendations
   - Low decency users deprioritized
   - **TODO:** Test formula with sample data

### Acceptance Criteria

- [ ] Post-event feedback forms functional
- [ ] Decency scores calculated and aggregated correctly
- [ ] Low decency users flagged/suspended appropriately
- [ ] Matching engine uses decency + lifestyle scores
- [ ] Mysterious insight: "Everyone at this event has high decency ratings"

---

## Phase 6: Values Alignment ⏳ Future

**Goal:** Add long-term compatibility factors (non-negotiables)
**Duration:** Month 2 of user journey (after Phase 5 complete)
**Compatibility Layer:** Attraction × (Decency + Lifestyle + Values) (lifetime potential)
**Status:** Paused - requires lifestyle layer working first

### Why Values Phase?
- Values determine long-term compatibility (kids, marriage, career)
- Can't compromise on fundamentals
- Extends relationship duration from years to lifetime potential

### Features to Build

1. ⏳ **Values Questions** (8-12 questions)
   - Children (yes/no/maybe/open)
   - Marriage timeline (ASAP, 2-3 years, 5+ years, never)
   - Career ambition (high, moderate, balanced)
   - Family importance (very important, moderate, independent)
   - Religious/spiritual importance
   - Political alignment (if values-relevant)
   - Asked conversationally after lifestyle established
   - **TODO:** Design question flow and phrasing

2. ⏳ **Values Scoring Algorithm**
   - Calculate values alignment (0-100)
   - Hard dealbreakers (want kids vs don't want kids = 0)
   - Partial alignment (maybe kids = 50 with yes/no)
   - Store valuesScore in CompatibilityScore model
   - **TODO:** Define dealbreakers vs workable differences

3. ⏳ **Update Matching Engine**
   - Add valuesScore to matching formula:
     ```
     matchScore = attraction × (0.4 × decencyScore + 0.3 × lifestyleScore + 0.3 × valuesScore)
     ```
   - Surface dealbreakers early (don't show incompatible matches)
   - **TODO:** Decide if we show dealbreaker reasons or just hide matches

4. ⏳ **Mysterious Insights (Values-Powered)**
   - "Another person shares your family goals"
   - "Someone here has similar career ambitions"
   - Don't reveal specific values (privacy protection)

### Acceptance Criteria

- [ ] Users can answer values questions conversationally
- [ ] Values compatibility calculated correctly
- [ ] Matching engine uses full formula with values
- [ ] Dealbreaker matches hidden (don't waste time)
- [ ] Mysterious insights include values alignment hints

---

## Phase 7: Psychological Depth (Progressive Profiling) 💭 Future

**Goal:** Add optional depth layer through attraction-driven progressive profiling
**Duration:** Month 3-4 of user journey (after Phase 6 complete)
**Compatibility Layer:** Full formula with psychology (lifetime partnership)
**Status:** Future - requires values layer and scale

### Why Progressive Profiling?
- Psychological depth requires self-awareness (not everyone has this)
- Users more motivated when attracted to someone who requires it
- Natural filtering: unmotivated users self-select out
- Extends relationships to lifetime partnership potential

### Features to Build

1. ⏳ **Optional Psychological Questions**
   - Attachment style (self-assessed or questionnaire)
   - Communication preferences (direct, indirect, conflict style)
   - Love languages (if useful)
   - Emotional regulation
   - Asked ONLY when user is motivated (not upfront)

2. ⏳ **Profile Depth Requirements**
   - Users can set requirements: "I want matches who know their attachment style"
   - When User A likes User B who requires deeper profile:
   - System nudges User A: "Someone you're interested in values self-awareness. Complete your attachment style to connect."
   - User A's choice: complete (unlock match) or skip (match stays hidden)
   - **TODO:** Design nudge UI and messaging

3. ⏳ **Familiar vs Growth Pattern Detection**
   - Detect familiar patterns (anxious + avoidant = high chemistry)
   - Detect growth patterns (unfamiliar but long-term potential)
   - Apply modifiers:
     - familiarityBoost: +10 for familiar patterns
     - longTermConcern: -12 for challenging dynamics
   - Net effect: rank appropriately, don't block

4. ⏳ **Update Matching Engine (Final Formula)**
   ```
   matchScore = attraction × (
       0.4 × decencyScore +
       0.3 × lifestyleScore +
       0.2 × valuesScore +
       0.1 × psychologyScore +
       familiarityBoost - longTermConcern
   )
   ```

5. ⏳ **Mysterious Insights (Psychology-Powered)**
   - "One person here will feel familiar but may challenge your patterns"
   - "Another person might feel unfamiliar but could unlock growth"
   - Gentle awareness, not lecturing

### Acceptance Criteria

- [ ] Users can set profile depth requirements
- [ ] Progressive profiling nudges functional
- [ ] Users can complete depth questions when motivated
- [ ] Familiar vs growth patterns detected correctly
- [ ] Matching uses full formula with all factors
- [ ] Mysterious insights include psychological hints (subtle)

---

## Phase 8: Advanced Group Dynamics 💭 Future

**Goal:** Optimize event composition and recommendations at scale
**Duration:** Month 5+ (after Phase 7 complete)
**Compatibility Layer:** Full system operating at scale
**Status:** Future - requires significant user base and data

### Features to Explore

1. 💭 **Event Recommendation Engine**
   - Which events should we recommend to which users?
   - Factors: compatibility, geography, interests, group dynamics
   - Predict attendance likelihood
   - **TODO:** Design recommendation algorithm

2. 💭 **Group Composition Optimization**
   - Who brings out the best in a group?
   - Avoid all anxious or all avoidant groups (needs balance)
   - Create mystery and intrigue (mix of patterns)
   - **TODO:** Define optimal group dynamics

3. 💭 **Compatibility Filtering (Paid Feature)**
   - Free: See all matches (attraction-only)
   - Paid: Filter by compatibility threshold (show only 70+%)
   - **TODO:** Define free vs paid feature boundaries

4. 💭 **Advanced Mysterious Insights**
   - More sophisticated pattern matching
   - Multi-factor insights ("Someone shares your energy AND values")
   - Personalized teaser quality improves over time

5. 💭 **"Personality Hire" Event Facilitation**
   - Person responsible for introductions at events
   - Could be: Matchmade employee, venue staff, trained volunteer
   - Facilitates conversation, breaks ice, observes dynamics
   - **TODO:** Define role, compensation, training

---

## Schema Evolution Summary

### Phase 1: Attraction Foundation ✅
- User, ContextProfile, ChatMessage
- DerivedProfile (temporary)
- MediaAsset, AttractionVote
- Match, Event, EventRSVP
- Notification, Feedback, TrustAggregate

### Phase 2: Interpretation Engine ✅
- Profile.interpretations, rawPatterns, lastAnalyzed
- ContextIntent.interpretations, rawPatterns, lastAnalyzed
- InterpretationFeedback
- AnalysisJob (background job queue)

### Phase 3: Self-Hosted Agents
- No schema changes (uses existing ChatMessage.role = 'assistant')

### Phase 4: Lifestyle Compatibility
- LifestyleProfile
- CompatibilityScore (with lifestyleScore)
- EventInterest.mysteriousInsights

### Phase 5: Decency Foundation
- DecencyScore
- SafetyConcern, UserBlock
- Feedback (enhanced with decency ratings)

### Phase 6: Values Alignment
- ValuesProfile
- CompatibilityScore.valuesScore, valuesDetails

### Phase 7: Psychological Depth
- PsychologyProfile
- ProfileDepthRequirement
- ProfileNudge
- CompatibilityScore.psychologyScore, familiarityBoost, longTermConcern

### Phase 8: Advanced Group Dynamics
- EventRecommendation
- GroupComposition
- AdvancedInsights

---

## Success Metrics by Phase

### Phase 1: Attraction Foundation ✅
- User sign-ups
- Photos uploaded per user (target: 4-6)
- Swipes per user per day
- Mutual attraction rate
- Event RSVP rate

### Phase 2: Interpretation Engine ✅
- Interpretation accuracy (user feedback)
- Analysis completion rate
- "This doesn't feel right" usage (should be low)
- Confidence score distribution

### Phase 3: Self-Hosted Agents
- Agent response time (<5s local, <3s VPS)
- Messages per user (target: 15+ for profile building)
- Profile extraction accuracy (>70%)
- Users reporting feeling "understood"
- Beta user retention (return for 2nd session)

### Phase 4: Lifestyle Compatibility
- Lifestyle question completion rate
- Lifestyle compatibility distribution (should be bell curve)
- Do lifestyle-compatible matches attend same events?
- Event attendance rate (vs RSVP)

### Phase 5: Decency Foundation
- Post-event feedback completion rate
- Decency score distribution
- False positive/negative rate (good people flagged vs bad actors not caught)

### Phase 6: Values Alignment
- Values question completion rate
- Dealbreaker match reduction (fewer mismatched expectations)
- Relationship formation rate (do values-aligned matches lead to relationships?)

### Phase 7: Psychological Depth
- Progressive profiling completion rate (when nudged)
- Match unlock rate (complete depth → reveal match)
- Familiar vs growth pattern accuracy
- Long-term relationship rate

### Phase 8: Advanced Group Dynamics
- Event recommendation click-through rate
- Optimal group composition effectiveness
- User satisfaction with event suggestions

---

## Living Document Protocol

**This roadmap should be updated:**
- ✅ Weekly during active development (mark progress)
- ✅ When priorities shift (reprioritize phases)
- ✅ When features are completed (move to next phase)
- ✅ When new features are discovered (add to appropriate phase)
- ✅ When metrics reveal insights (adjust strategy)

**Do NOT:**
- ❌ Create new roadmap documents (update this one)
- ❌ Create separate phase documents (they're all here)
- ❌ Delete completed phases (mark complete, leave for reference)
- ❌ Let this document get stale (update as you go)

**Archive major versions:**
- When a phase is fully complete, archive this version
- Save to `.context/archive/roadmap/roadmap-vN.md`
- Continue updating this file for current work

---

**This is the single source of truth for what we're building. Keep it current, keep it real, keep it simple.**
