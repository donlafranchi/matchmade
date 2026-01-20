# Development Decisions Log

**Purpose:** Captures WHY key architectural and implementation decisions were made. References detailed logs in `dev/logs/archive/` for deep dives.

---

## Data Model Architecture (Dec 22, 2025)

**Decision:** Option 1 - Single Profile + Context-Specific Intent Fields

**Why:**
- Agent needs to see full user picture across contexts to make quality matches
- Shared data (values, beliefs, interaction style) shouldn't be duplicated per context
- Trust boundaries enforced via matching query filters, not database separation
- Prevents data drift when user updates shared fields

**Alternatives Considered:**
- Multiple context-scoped profiles (rejected: data duplication, drift issues)
- Fully merged single profile (rejected: context-specific fields don't make sense globally)

**Trade-offs:**
- ✅ Single source of truth for shared data
- ✅ Simpler updates (one location)
- ✅ Agent has full context for matching
- ⚠️ Requires careful query filtering to respect context boundaries in matching

**Reference:** `dev/logs/archive/2025-phase-1/slice-1-option1-architecture-2025-12-22.md`, `slice-1-refactor-architecture-2025-12-22.md`

---

## Interpretation Engine Architecture (Dec 24, 2025)

**Decision:** Multi-framework therapeutic interpretation with transparent display

**Why:**
- Rigid forms reduce nuance; conversational profiling captures richer patterns
- Therapeutic frameworks (Maté, Perel, Gottman, IFS, Attachment) provide validated psychological models
- "Here's what we're hearing from you" creates trust through transparency
- Matching on compatible patterns (not checkbox overlap) produces better fit

**Alternatives Considered:**
- Keep rigid dropdown forms (rejected: loses nuance, feels impersonal)
- Hide interpretations from users (rejected: ethical concerns, reduces trust)
- Single framework only (rejected: misses complementary insights)

**Trade-offs:**
- ✅ Richer understanding of users
- ✅ Better match quality via pattern compatibility
- ✅ Users feel deeply understood
- ⚠️ Requires LLM costs for analysis
- ⚠️ Risk of feeling "psychoanalyzed" if not handled carefully
- ⚠️ Cultural sensitivity needed (frameworks are Western-centric)

**Key Design Choices:**
- Store interpretations in JSON fields (Profile.interpretations, ContextIntent.interpretations)
- Always show users what we're interpreting (transparency)
- Allow users to reject/refine interpretations (user control)
- Use reflective language ("we notice you express...") not diagnostic ("you have anxious attachment")
- Track confidence scores and evidence for each interpretation

**Reference:** `dev/logs/archive/2025-phase-1/interpretation-engine-architecture-2025-12-24.md`, `.context/vision/profile-as-interpretation.md`

---

## Context Intent Separation (Dec 22, 2025)

**Decision:** Separate ContextIntent model for context-specific fields (relationshipTimeline, exclusivityExpectation, friendshipDepth, etc.)

**Why:**
- Some fields only make sense in specific contexts (exclusivity for romantic, not friendship)
- Prevents awkward "N/A" fields or context-mixing
- Clean separation between shared attributes and context-specific goals

**Alternatives Considered:**
- Put all fields in Profile with null values (rejected: messy, confusing)
- Separate profile per context (rejected: data duplication issue)

**Trade-offs:**
- ✅ Clean data model
- ✅ No awkward N/A fields
- ⚠️ Requires join queries (Profile + ContextIntent) for full user view
- ⚠️ Two locations to update (mitigated: ContextIntent is context-specific by design)

**Reference:** `dev/logs/archive/2025-phase-1/slice-1-option1-architecture-2025-12-22.md`

---

## Off-the-Record Implementation (Dec 15, 2025)

**Decision:** Use flag-based approach (off_record boolean in ChatMessage) with NO storage of raw content

**Why:**
- Privacy-first: sensitive disclosures should not persist
- User trust: honor "off the record" and "forget that" requests
- Legal/ethical: reduce liability by not storing sensitive data

**How It Works:**
- off_record=true messages: NOT stored in database (content is empty)
- Agent receives message in context, can extract abstract patterns
- "Forget that" command: deletes message + zeros out any derived fields

**Alternatives Considered:**
- Encrypt sensitive messages (rejected: still stored, decryptable)
- Store everything, rely on soft-delete (rejected: doesn't truly forget)

**Trade-offs:**
- ✅ True privacy (no raw storage)
- ✅ User trust and control
- ⚠️ Agent can't reference exact phrasing later
- ⚠️ Must carefully handle derived insights (zero out if user says "forget")

**Reference:** `dev/logs/archive/2025-phase-1/chat-offrecord-impl-2025-12-15.md`

---

## Completeness Scoring (Phase 1)

**Decision:** Simple count-based scoring (0-100) with missing fields array

**Why:**
- Easy to implement and understand
- Drives user to fill out profile without being prescriptive
- Can nudge users toward better matches via completeness

**How It Works:**
```
completeness = (fieldsPresent / totalRequiredFields) * 100
missing = array of field names that are empty
```

**Alternatives Considered:**
- Weighted scoring (more important fields worth more) - deferred to Phase 2
- No scoring, just show empty fields - rejected (less motivating)

**Trade-offs:**
- ✅ Simple, predictable
- ✅ Motivates users to complete profiles
- ⚠️ All fields weighted equally (not ideal, but good enough for Phase 1)

**Future Enhancement:**
- Phase 2: Weight fields by importance
- Phase 3: Use interpretation confidence as completeness signal

**Reference:** `dev/logs/archive/2025-phase-1/slice-1-chat-profile-architecture-2025-12-15.md`

---

## Authentication Approach (Dec 15, 2025)

**Decision:** Magic link (email-based passwordless auth)

**Why:**
- Reduces friction (no password to remember)
- Modern, expected pattern for relationship apps
- Secure (one-time tokens)

**Alternatives Considered:**
- Email + password (rejected: higher friction, password fatigue)
- Social login (OAuth) (deferred: adds complexity, not MVP-critical)

**Trade-offs:**
- ✅ Low friction
- ✅ Secure
- ⚠️ Requires email delivery reliability
- ⚠️ Slightly slower than saved password (acceptable trade-off)

**Reference:** `dev/logs/archive/2025-phase-1/auth-and-context-impl-2025-12-15.md`

---

## Matching Query Filters (Dec 22, 2025)

**Decision:** Agent has access to full user data but matching queries enforce context boundaries via filters

**Why:**
- Agent needs full picture for quality interpretation (e.g., romantic attachment patterns informed by friendship communication style)
- Trust boundaries enforced at matching logic (WHERE contextType = X), not database separation
- Prevents accidental cross-context recommendations

**How It Works:**
```sql
-- Example: Only match within same context
SELECT * FROM Match
WHERE contextType = 'romantic'
AND user_a_id = X AND user_b_id IN (SELECT id FROM User WHERE ...)
```

**Alternatives Considered:**
- Separate databases per context (rejected: over-engineered, breaks interpretation)
- No filtering (rejected: violates user trust, could leak friendship→romantic)

**Trade-offs:**
- ✅ Agent has full context for interpretation
- ✅ Simple to implement (WHERE clause)
- ⚠️ Must be vigilant about query filters (risk of cross-context leakage if query is wrong)
- ⚠️ Requires testing to ensure no cross-context matches

**Reference:** `dev/logs/archive/2025-phase-1/slice-1-option1-architecture-2025-12-22.md`

---

## Schema Migration Strategy (Dec 22, 2025)

**Decision:** 3-slice incremental migration (1a: schema, 1b: backend, 1c: frontend)

**Why:**
- Large refactor (~1,250 LOC) too risky to do in one commit
- Incremental approach allows testing at each step
- Easier to debug and roll back if issues arise

**Slice Breakdown:**
- 1a: Prisma schema migration + database changes (foundation)
- 1b: Backend API updates (update Profile/ContextIntent endpoints)
- 1c: Frontend UI changes (consume new API structure)

**Alternatives Considered:**
- Single big-bang migration (rejected: too risky, hard to debug)
- More granular slices (rejected: overhead of coordination not worth it)

**Trade-offs:**
- ✅ Lower risk (test at each slice)
- ✅ Easier debugging
- ⚠️ Temporary inconsistency between slices (mitigated: slices completed quickly)

**Reference:** `dev/logs/archive/2025-phase-1/slice-1a-schema-migration-implementation-2025-12-22.md`, `slice-1b-backend-implementation-2025-12-22.md`

---

## JSON Field Usage (Dec 22, 2025)

**Decision:** Use JSON fields for flexible structured data (coreValues, beliefs, interactionStyle, interpretations)

**Why:**
- Schema flexibility: Can evolve structure without migrations
- Rich nested data: interpretations JSON contains frameworks, confidence, evidence
- Postgres JSON support: Queryable via JSON operators if needed

**Examples:**
```json
// Profile.coreValues (array)
["honesty", "growth", "creativity"]

// Profile.beliefs (object)
{
  "politics_importance": 0.8,
  "political_orientation": "progressive",
  "religion_importance": 0.3
}

// Profile.interpretations (complex nested object)
{
  "frameworks": {
    "gabor_mate": {
      "attachment_style": {
        "primary": "secure",
        "confidence": 0.85,
        "evidence": ["consistent language about boundaries"]
      }
    }
  }
}
```

**Alternatives Considered:**
- Fully normalized tables (rejected: too rigid, many migrations)
- String fields (rejected: loses structure, hard to query)

**Trade-offs:**
- ✅ Schema flexibility
- ✅ Rich nested data
- ✅ Fewer migrations
- ⚠️ Harder to enforce constraints (no foreign keys within JSON)
- ⚠️ TypeScript types must be manually kept in sync

**Reference:** `dev/logs/archive/2025-phase-1/slice-1-option1-architecture-2025-12-22.md`, `ticket-2-01-implementation-2025-12-25.md`

---

## Phase 2: Background Job Queue Architecture (Dec 26, 2025)

**Decision:** Database polling approach with job queue table (AnalysisJob model)

**Why:**
- MVP simplicity: No external dependencies (Redis, Inngest, BullMQ, etc.)
- Postgres already in stack: Leverage existing infrastructure
- Single worker sufficient for early-stage load (<100 users)
- Easy to debug: Jobs visible in database, can query directly

**How It Works:**
- Worker polls database every 10 seconds for pending jobs
- Priority queue: high < medium < low (alphabetic sort)
- Retry logic: Max 3 attempts before marking failed
- Cleanup: Stuck jobs (>5 min processing) automatically reset

**Alternatives Considered:**
- Redis + BullMQ (rejected: adds dependency, overkill for MVP)
- Inngest (rejected: external service, cost, complexity)
- Cron jobs (rejected: not real-time enough, hard to prioritize)
- In-memory queue (rejected: loses jobs on restart)

**Trade-offs:**
- ✅ Simple (no new infra)
- ✅ Debuggable (SQL queries)
- ✅ Persistent (survives restarts)
- ⚠️ Polling overhead (10s latency, but acceptable)
- ⚠️ Single worker (must scale to multiple workers if load increases)
- ⚠️ Postgres load (mitigated: indexes on status, priority, createdAt)

**Scaling Strategy:**
- Phase 2 (current): Single worker, 10s polling
- Phase 3 (100-1000 users): Multiple workers, 5s polling
- Phase 4 (1000+ users): Migrate to Redis/BullMQ if needed

**Reference:** `dev/logs/ticket-2-03-implementation-2025-12-26.md`, `web/lib/interpretation/jobs/queue.ts`

---

## Phase 2: Job Priority System (Dec 26, 2025)

**Decision:** Three-tier priority (high/medium/low) based on trigger source

**Priority Mapping:**
- **High:** Manual refresh (user clicked "Refresh" button)
- **Medium:** Profile view trigger (user viewing interpretations tab, >1hr stale)
- **Low:** Chat trigger (5+ new messages since last analysis)

**Why:**
- User-initiated actions (manual refresh) should feel responsive
- Automatic triggers can wait (user not actively watching)
- Balances responsiveness with cost control

**How It Works:**
```typescript
// Priority processed alphabetically: high < medium < low
const job = await prisma.analysisJob.findFirst({
  where: { status: "pending" },
  orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
});
```

**Alternatives Considered:**
- No priority (FIFO only) - rejected: poor UX for manual refresh
- Numeric priority (1-5) - rejected: over-engineered for 3 levels

**Trade-offs:**
- ✅ Responsive to user actions
- ✅ Simple to implement
- ⚠️ Low-priority jobs can starve if many high-priority requests (mitigated: rate limiting)

**Reference:** `dev/logs/ticket-2-03-implementation-2025-12-26.md`, `web/lib/interpretation/jobs/triggers.ts`

---

## Phase 2: Rate Limiting Strategy (Dec 26, 2025)

**Decision:** Max 1 analysis per user per hour (60 minutes)

**Why:**
- Cost control: Each analysis costs ~$0.01-0.02 (Claude API)
- Interpretation stability: Patterns don't change in 10 minutes
- Quality over frequency: Better to encourage more conversation before re-analyzing

**Implementation:**
- Check `Profile.lastAnalyzed` timestamp before enqueueing job
- Skip if analyzed within last hour
- Applies to ALL trigger sources (chat, view, manual)

**Alternatives Considered:**
- No rate limit (rejected: cost explosion, users spamming refresh)
- 5 minutes (rejected: too short, interpretations won't meaningfully change)
- Different limits per source (rejected: complex, confusing to users)

**Trade-offs:**
- ✅ Cost control (~$0.50/user/day max)
- ✅ Encourages substantive conversation
- ⚠️ User frustration if clicking refresh too soon (mitigated: UI should show "refreshed X min ago")
- ⚠️ Can't test quickly (temporarily disabled for development)

**Testing Note:**
- Rate limit TEMPORARILY DISABLED (Dec 26) via commented code in `queue.ts:51-59`
- TODO: Re-enable before production deployment
- Check: `web/lib/interpretation/jobs/queue.ts` for comment block

**Reference:** `dev/logs/ticket-2-03-implementation-2025-12-26.md`, `web/lib/interpretation/jobs/queue.ts:50-59`

---

## Phase 2: Automatic Trigger Logic (Dec 26, 2025)

**Decision:** Trigger analysis after 5 new messages (chat) or 1 hour staleness (view)

**Chat Trigger:**
- When: After user sends message in chat
- Condition: 5+ messages since last analysis
- Priority: Low
- Why: Enough new data to potentially shift interpretation, but not urgent

**View Trigger:**
- When: User clicks "Interpretations" tab
- Condition: Last analysis >1 hour ago OR never analyzed
- Priority: Medium
- Why: User actively viewing, should be reasonably fresh

**Manual Trigger:**
- When: User clicks "Refresh" button
- Condition: Always (bypasses staleness check, still rate-limited)
- Priority: High
- Why: Explicit user request, should feel immediate

**Alternatives Considered:**
- Trigger after every message (rejected: too expensive, noisy)
- Trigger only on manual refresh (rejected: stale data if user never clicks)
- Fixed schedule (every 24 hours) (rejected: not responsive to user activity)

**Trade-offs:**
- ✅ Balance between freshness and cost
- ✅ Responsive to user engagement
- ⚠️ Users might not understand why it didn't update after 3 messages (acceptable: education opportunity)

**Reference:** `dev/logs/ticket-2-03-implementation-2025-12-26.md`, `web/lib/interpretation/jobs/triggers.ts`

---

## Phase 2: API Endpoint Caching Strategy (Dec 26, 2025)

**Decision:** 60-second client-side cache via Cache-Control header

**Implementation:**
```typescript
return NextResponse.json(response, {
  headers: {
    "Cache-Control": "private, max-age=60",
  },
});
```

**Why:**
- Reduce redundant API calls (e.g., tab switching back and forth)
- Interpretations don't change second-to-second
- `private` ensures no CDN caching (user-specific data)

**Alternatives Considered:**
- No caching (rejected: unnecessary server load)
- Longer cache (5 min) (rejected: stale after refresh)
- Server-side caching (rejected: adds complexity, not needed yet)

**Trade-offs:**
- ✅ Reduces API calls
- ✅ Faster UI (instant tab switch)
- ⚠️ Slight staleness (max 60s) - acceptable given interpretations are slow-changing

**Reference:** `dev/logs/ticket-2-04-implementation-2025-12-26.md`, `web/app/api/profile/interpretations/route.ts`

---

## Phase 2: UI State Management (Dec 26, 2025)

**Decision:** Client-side React state (useState) with polling for processing state

**Approach:**
- Fetch interpretations on mount (useEffect)
- Poll every 2 seconds if status is "processing" (max 30 attempts = 1 minute)
- Stop polling when status changes to completed/failed

**Why:**
- Simple: No state management library needed (Redux, Zustand)
- Sufficient: Single component, no complex global state
- Real-time feel: Polling gives near-real-time updates

**Alternatives Considered:**
- WebSockets (rejected: overkill, adds server complexity)
- Server-Sent Events (rejected: not needed for 2s polling)
- Redux/Zustand (rejected: over-engineered for single-component state)

**Trade-offs:**
- ✅ Simple implementation
- ✅ No new dependencies
- ⚠️ Polling overhead (2s * 30 = 60 requests max) - acceptable for short duration

**Reference:** `dev/logs/ticket-2-05-implementation-2025-12-26.md`, `web/app/components/InterpretationsView.tsx:57-75`

---

## Phase 2: Progressive Disclosure UI Pattern (Dec 26, 2025)

**Decision:** Evidence quotes collapsed by default, expandable on click

**Why:**
- Reduce cognitive load: Summary first, details on demand
- Trust building: "Show evidence" proves we're not making it up
- Mobile-friendly: Less scrolling on small screens

**Implementation:**
```tsx
const [showEvidence, setShowEvidence] = useState(false);
<button onClick={() => setShowEvidence(!showEvidence)}>
  {showEvidence ? 'Hide' : 'Show'} evidence
</button>
```

**Alternatives Considered:**
- Always show evidence (rejected: too cluttered, overwhelming)
- Never show evidence (rejected: reduces trust, no transparency)
- Tooltip on hover (rejected: doesn't work on mobile)

**Trade-offs:**
- ✅ Clean, scannable interface
- ✅ User control (optional depth)
- ⚠️ Requires extra click to see evidence (acceptable: most users won't need it every time)

**Similar Pattern Applied:**
- Optional framework sections (trauma_patterns, authentic_self only if present)
- Context-specific insights (only show if exist)

**Reference:** `dev/logs/ticket-2-05-implementation-2025-12-26.md`, `web/app/components/InterpretationsView.tsx:289-335`

---

## Phase 2: Accessibility-First UI Design (Dec 26, 2025)

**Decision:** Full WCAG 2.1 AA compliance from the start

**Key Practices:**
- Semantic HTML (section, h1-h4, button, not div-everything)
- ARIA labels for all interactive elements
- Keyboard navigation (tab order, focus indicators)
- Screen reader support (aria-live, aria-expanded, aria-controls)
- Color contrast ≥4.5:1
- Touch targets ≥44px

**Why:**
- Ethical: Therapy-adjacent app should be accessible to all
- Legal: Avoid accessibility lawsuits
- Quality: Good accessibility = good UX for everyone
- Easier to build in from start than retrofit

**Trade-offs:**
- ⚠️ More code (ARIA attributes, labels)
- ✅ Better for everyone (keyboard users, screen readers, motor impairments)

**Reference:** `dev/logs/ticket-2-05-implementation-2025-12-26.md`, `web/TESTING-INTERPRETATIONS-UI.md:277-305`

---

## Phase 2: Messaging Tone (Dec 26, 2025)

**Decision:** Reflective language, not diagnostic terminology

**Examples:**
- ✅ "You seem to prioritize safety and belonging"
- ❌ "You have anxious attachment disorder"
- ✅ "We're noticing patterns of..."
- ❌ "You are diagnosed with..."

**Why:**
- Not a medical service: We're matching, not therapy
- Reduce stigma: Attachment styles aren't pathologies
- Empower users: Frame as patterns to understand, not problems to fix

**Reference:** `dev/logs/ticket-2-05-implementation-2025-12-26.md`, `.context/vision/profile-as-interpretation.md`

---

## Phase 3: Multi-Provider LLM Client (Jan 19, 2026)

**Decision:** Unified client supporting Anthropic + OpenAI-compatible APIs (Ollama, vLLM)

**Why:**
- Flexibility: Test locally with Ollama, production with Claude or self-hosted vLLM
- Cost control: Can switch providers based on cost/quality tradeoffs
- No vendor lock-in: Same interface regardless of backend

**Implementation:**
- Environment variables control provider: `LLM_PROVIDER`, `LLM_ENDPOINT`, `LLM_MODEL`
- Single `generateCompletion()` function routes to correct backend
- Kept Anthropic SDK (didn't remove) for flexibility

**Reference:** `web/lib/llm-client.ts`

---

## Phase 3: Profile Extraction from Chat (Jan 19, 2026)

**Decision:** Run extraction every 5 messages with 80% confidence threshold

**Why:**
- 5 messages: Enough context for meaningful extraction without constant LLM calls
- 80% threshold: Only save data we're confident about, avoid bad inferences
- Non-blocking: Extraction runs after response, doesn't slow chat

**What's extracted:**
- Shared profile: location, age, name, coreValues, constraints
- Context intent: relationship preferences specific to context type

**Reference:** `web/lib/agents/extraction-agent.ts`, `web/app/api/chat/route.ts`

---

## Phase 3: Adaptive Chat Agent Persona (Jan 19, 2026)

**Decision:** Agent mirrors user's depth and tone rather than pushing therapeutic approach

**Why:**
- Not everyone wants therapy-speak
- Some users are analytical, some emotional, some casual
- Trust builds when agent meets them where they are

**Onboarding flow by message count:**
- 1-2: Welcome, explain approach
- 3-4: Get basics (age, location)
- 5-6: Values and interests
- 7-8: Dealbreakers, must-haves
- 9+: Fill gaps naturally based on missing fields

**Reference:** `web/lib/agents/chat-agent.ts`

---

## Future Decision Points (Unresolved)

These require more data or user feedback before deciding:

### Interpretation Confidence Threshold
**Question:** What confidence % before showing an interpretation to users?
**Options:** 70%? 80%? Dynamic based on user feedback?
**Status:** Deferred to Phase 2 user testing

### Cultural Sensitivity in Frameworks
**Question:** How to adapt Western therapeutic frameworks for non-Western users?
**Options:** Additional frameworks? Cultural context fields? User opt-out?
**Status:** Needs research and diverse user testing

### Matching Algorithm Weights
**Question:** How much to weight attachment compatibility vs value alignment vs communication style?
**Options:** Start equal, tune based on match quality metrics
**Status:** Deferred to Phase 3 (need match outcome data)

---

## Decision Log Maintenance

**When to add:**
- Major architectural choice with alternatives considered
- Technical trade-off with significant implications
- User trust or ethical decision
- Schema design with long-term impact

**When NOT to add:**
- Minor implementation details (CSS styling, variable naming)
- Obvious choices (use TypeScript for type safety)
- Tactical decisions with no lasting impact

**How to update:**
- Add new decision as section with date
- Reference source logs in archive
- Include WHY, alternatives, trade-offs
- Mark "Future Decision Points" when deferred

---

*For detailed implementation notes, see `dev/logs/archive/2025-phase-1/`*
