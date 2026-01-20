# Compatibility Hierarchy: The Science of Relationship Duration

**Status:** Core Product Architecture
**Last Updated:** 2025-12-27

---

## The Fundamental Insight

Relationship duration follows three core layers:

```
┌─────────────────────────────────────────┐
│  LIFETIME (All aligned)                 │
│  Values + Lifestyle + Attraction        │
├─────────────────────────────────────────┤
│  WEEKS TO MONTHS (Day-to-day fit)       │
│  Lifestyle + Attraction                 │
├─────────────────────────────────────────┤
│  DAYS TO WEEKS (Initial chemistry)      │
│  Attraction alone                       │
└─────────────────────────────────────────┘

FILTERS (Not hierarchy, but safety/quality checks):
- Decency: Like breathing—necessary but not what makes relationships last
- Psychology: Helps filter readiness, nice-to-have depth
```

**Why this matters:** Traditional dating apps optimize for attraction (days to weeks). We optimize for all three layers, progressively revealing deeper compatibility as relationships develop.

---

## The Three Core Layers

### Layer 1: Attraction (Days to Weeks)
**What it is:** Physical/aesthetic chemistry, initial spark
**Why it fades:** Novelty wears off without deeper compatibility
**Our approach:** Separate attraction system (photo-only swipes), but never the only factor
**When revealed:** Immediately available, always private

### Layer 2: Lifestyle Compatibility (Weeks to Months)
**What it is:** Day-to-day living patterns that create space for connection
**Why it matters:** You can't get to know someone if schedules/energy/habits don't align
**Examples:**
- Morning person + Night owl = misaligned energy
- Homebody + Social butterfly = conflicting social needs
- High-energy + Low-energy = exhausting for both
- Spontaneous + Rigid planner = frustrating coordination

**Ironically critical:** Most overlooked factor, but determines if people can actually spend time together

**Our approach:** Early lifestyle questions (10-15 questions in Phase 2)
**When revealed:** After basic profile (Week 3-4 of user journey)

### Layer 3: Values & Life Goals (Lifetime Potential)
**What it is:** Big-picture alignment—children, marriage, career, family, beliefs
**Why it matters:** Can't compromise on fundamentals; either aligned or not
**Examples:**
- Want kids vs don't want kids
- Marriage soon vs never
- Career-driven vs life-balance focused
- Religious/political alignment (when important to values)

**Our approach:** Asked after lifestyle compatibility established
**When revealed:** Month 2 of user journey

## The Filters (Not Hierarchy)

### Decency (Safety Check)
**What it is:** How people treat others—respect, honesty, reliability
**Why it's not in hierarchy:** Like breathing—necessary but not what makes relationships last
**How measured:** Post-event behavioral feedback from multiple people

**Our approach:**
- Aggregate scores from real-world events
- High decency = prioritized in matching
- Low decency = limited access
- Starts neutral (50), moves based on feedback

**When revealed:** After users attend events (Week 5+)

### Psychology (Readiness Filter)
**What it is:** Attachment patterns, communication styles, emotional regulation
**Why it's not in hierarchy:** Nice-to-have depth, helps filter who's ready
**How used:** Optional progressive profiling—users answer when motivated

**Our approach:**
- Optional depth questions (attachment, communication)
- Used to filter readiness and familiar vs growth patterns
- Not required, but unlocks access to people who value it

**When revealed:** Month 3-4, attraction-driven

---

## Progressive Profiling: Attraction as Motivation

### The Problem with Traditional Profiling
- Asks everything upfront (exhausting)
- Users don't know what matters yet
- Many questions feel irrelevant before connection

### Our Solution: Reveal Depth Progressively
Users only go deeper when motivated by attraction or connection:

**Example Flow:**
1. User A (man, LIFESTYLE depth) swipes YES on User B (woman, PSYCHOLOGICAL depth)
2. System checks: User B requires deeper profile
3. Nudge sent: "Someone you're interested in values emotional awareness. Complete your attachment style to see who wants to meet you."
4. User A's choice: Go deeper (unlock match) or pass

**Benefits:**
- Natural filtering (motivated users complete, unmotivated self-select out)
- Higher quality profiles (completed with intention, not obligation)
- Respects autonomy (choice, not force)
- Works for all genders (anyone can set depth requirements)

---

## Compatibility Scoring Formula

### Phase-by-Phase Evolution

**Phase 1: Attraction Only**
```
score = attraction (yes/no)
```
Duration: Days to weeks

**Phase 2: + Lifestyle**
```
score = attraction × lifestyleScore
```
Duration: Weeks to months

**Phase 3: + Values**
```
score = attraction × (0.6 × lifestyleScore + 0.4 × valuesScore)
```
Duration: Lifetime potential

**Phase 4: + Filters (Decency & Psychology)**
```
score = attraction × (0.6 × lifestyleScore + 0.4 × valuesScore)
multiplied by decencyMultiplier (1.2 if high, 0.5 if low)
adjusted by psychologyModifiers (familiarityBoost/longTermConcern if available)
```
Duration: Lifetime potential with safety/readiness filters

**Note:** All scores 0-100. Attraction is binary gate (must exist). Decency and psychology are multipliers/filters, not core hierarchy.

### Special Modifiers

**familiarityBoost** (+10 points):
- Applied when patterns feel familiar (chemistry)
- Example: Anxious + Avoidant = high chemistry (familiar push-pull)
- System acknowledges: familiar ≠ healthy, but familiar = chemistry

**longTermConcern** (-12 points):
- Applied when patterns might be challenging long-term
- Example: Same anxious-avoidant pairing = -12 concern
- Net effect: +10 - 12 = -2 (ranked lower, but NOT blocked)

**Philosophy:** We don't judge or block challenging patterns. We rank them appropriately and let users choose. Some people need to live a pattern to learn from it.

---

## Group Event Matching System

### Core Concept
We don't match user-to-user. We match groups using group dynamics.

**Key Difference:**
- Traditional: "Here's your 87% match with Sarah"
- Matchmade: "Here's a group of 4-6 people. One will feel familiar (chemistry but maybe challenging), another might surprise you (unfamiliar but high potential). Figure it out."

### Event Discovery with Mysterious Insights

**What Users See:**
- Event details (where, when, what)
- Profile pics of attendees who RSVP'd (first name, age, city)
- 2-3 mysterious insights about OTHER attendees (personalized per user)
- NO individual profiles, NO chat, NO details

**Example Insights:**
- "Someone here shares your energy level"
- "One person will feel familiar but may challenge your patterns"
- "Another person here is a veteran like you"
- "You have 3 shared interests with another attendee"

**The Mystery:** Users don't know which insight applies to which person—they discover through real-life conversation.

### The "Big Deal" Moment

When attraction + compatibility both exist (rare), system highlights this:
- Profile picture visually highlighted at event preview
- Subtle indicator: "You match on paper AND in attraction"
- Encourages attendance without revealing WHO until they meet

### Post-Event: Decency Tracking

After events, users provide feedback on attendees:
- Behavioral: Was respectful? Honest? Would meet again?
- Safety: Express concern if needed
- Romantic interest: Signal attraction (mutual interest = contact exchange)

**Purpose:**
- Keep people honest and safe
- Build decency scores over time
- Community self-regulates quality

---

## Implementation Roadmap

### Phase 1: Attraction Foundation (Week 1-2)
**Build:**
- User profiles (photos, name, age, city)
- Photo-only attraction swiping
- Basic event discovery
- Event RSVP (soft/hard)

**Compatibility:** Attraction only
**Duration:** Days to weeks

---

### Phase 2: Lifestyle Layer (Week 3-4)
**Build:**
- 10-15 lifestyle compatibility questions:
  - Energy level (morning/night person)
  - Social preference (introvert/extrovert/ambivert)
  - Activity level (high-energy/moderate/low)
  - Spontaneity vs planning
  - Alone time needs
  - Work-life balance
- Lifestyle scoring algorithm
- Mysterious insights powered by lifestyle matches

**Compatibility:** Attraction × Lifestyle
**Duration:** Weeks to months
**Insights Unlocked:** "Someone here shares your energy level"

---

### Phase 3: Decency Foundation (Week 5-6)
**Build:**
- Post-event feedback forms
- Decency score aggregation
- Flag/suspend low-decency users
- Prioritize high-decency users in matching

**Compatibility:** Attraction × (Decency + Lifestyle)
**Duration:** Years
**Insights Unlocked:** "Everyone at this event has been highly rated by past attendees"

---

### Phase 4: Values Alignment (Month 2)
**Build:**
- 8-12 values questions:
  - Children (yes/no/maybe/open)
  - Marriage timeline
  - Career ambition level
  - Family importance
  - Religious/spiritual importance
  - Political alignment (if values-relevant)
- Values scoring algorithm
- Match quality improves with long-term alignment

**Compatibility:** Full formula with values
**Duration:** Lifetime potential
**Insights Unlocked:** "Another person shares your family goals"

---

### Phase 5: Psychological Depth (Month 3-4)
**Build:**
- Optional attachment style questions
- Communication preference questions
- Progressive profiling nudges (attraction-driven)
- Familiar vs growth pattern detection
- familiarityBoost and longTermConcern modifiers

**Compatibility:** Full formula with psychology
**Duration:** Lifetime partnership
**Insights Unlocked:**
- "One person here will feel familiar but may challenge your patterns"
- "Another person might feel unfamiliar but could unlock growth"

**Progressive Profiling Active:** Users nudged to go deeper when attracted to someone who requires it

---

### Phase 6: Advanced Group Dynamics (Month 5+)
**Build:**
- Event recommendation engine
- Group composition optimization
- Compatibility filtering (paid feature)
- Advanced mysterious insights

---

## Key Design Principles

### 1. No Gating, Only Ranking
- Everyone is matchable (0-100 score)
- Challenging patterns (anxious-avoidant) are ranked lower, NOT blocked
- Users choose their journey; system provides information, not judgment

### 2. Privacy-Protecting
Users at events see:
- Photos, first name, age, city
- 2-3 sentence warm summary
- Compatibility % (e.g., "68% compatible")

Users DON'T see:
- Why the score is what it is
- Red flags or readiness scores
- Psychological interpretations
- What others answered in questions

### 3. Real-World First
- No in-app chatting (prevents pen-pal phase)
- All meaningful interaction happens at events
- Limited pre-event signaling (likes/emojis/winks only)
- Contact exchange only after mutual post-event interest

### 4. Gentle Awareness, Not Lecturing
Agent summaries might include:
✓ "You both value independence and connection. Pay attention to how you communicate needs."

NOT:
✗ "⚠️ Warning: This is an anxious-avoidant pairing which research shows..."

### 5. Lifestyle is Ironically Critical
Most dating apps focus on values/psychology and ignore lifestyle. We prioritize it because:
- Day-to-day patterns determine if people can spend time together
- Can't discover psychological depth if schedules don't align
- Most relationships fail on practical incompatibility, not philosophical differences

### 6. Decency is the Foundation
Everything else is meaningless without respect, honesty, and safety.
- Tracked through real-world behavior (not self-reported)
- Community accountability
- Low decency = limited access (protecting the community)

---

## Success Metrics

### User Journey Depth
- % of users reaching each phase (Lifestyle → Decency → Values → Psychology)
- Time to complete each phase
- Dropout points (where users stop engaging)

### Match Quality by Phase
- Phase 2 (Lifestyle): Do matches lead to successful first dates?
- Phase 3 (Decency): Do matches lead to second/third dates?
- Phase 4 (Values): Do matches lead to relationships?
- Phase 5 (Psychology): Do matches lead to long-term partnerships?

### Event Attendance
- RSVP rate vs actual attendance
- Repeat attendance (users going to multiple events)
- Post-event romantic interest rate
- Contact exchange rate

### Decency System Health
- Distribution of decency scores (should be bell curve)
- False positive rate (good people flagged)
- False negative rate (bad actors not caught)
- Community trust (users feel safe)

### Progressive Profiling Effectiveness
- % of users who complete depth nudges
- Conversion: nudge → completion → match reveal
- Quality difference: motivated completions vs upfront completions

---

## Living Document Protocol

This document should be updated:
- ✅ When compatibility formula changes
- ✅ When new scoring factors added
- ✅ When phase timelines shift
- ✅ When user research reveals new insights
- ✅ When implementation reveals formula flaws

Archive major changes in `.context/archive/compatibility-hierarchy/v{N}.md`

---

**The Secret Sauce:** Lifestyle compatibility (most overlooked) + Decency (most important) + Progressive profiling (motivation-driven) + Real-world validation (event attendance) = Authentic matches who can actually spend time together and treat each other well.
