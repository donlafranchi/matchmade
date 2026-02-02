# Matching Algorithm

**Status:** Working document

This document has two sections:
1. **Exploration** - Ideas, options, tradeoffs (for ideation)
2. **Implementation Spec** - What we're actually building (for dev)

---

# Part 1: Exploration

## The Core Question

How do we compute compatibility between two people?

---

## Compatibility Hierarchy (from matching-philosophy.md)

| Layer | What It Measures | Weight |
|-------|------------------|--------|
| Attraction | Mutual physical interest | Gate (binary) |
| Lifestyle | Can spend time together | High |
| Values | Want the same things | High |
| Psychology | How they relate (optional) | Modifier |

**Decency** is a filter, not a layer - must pass threshold to match at all.

---

## Approach Options

### Option A: Weighted Sum
```
score = (lifestyle × 0.4) + (values × 0.4) + (psychology × 0.2)
```
Simple, explainable, but treats all dimensions as independent.

### Option B: Multiplicative
```
score = lifestyle × values × psychology_modifier
```
Low score in any dimension tanks the whole match. More realistic?

### Option C: Threshold Gates
```
if lifestyle < 40: no match
if values < 40: no match
score = (lifestyle + values) / 2
```
Ensures minimum compatibility in each dimension.

### Option D: Hierarchical Unlock
```
Phase 1: Match on lifestyle only
Phase 2: Add values (lifestyle × values)
Phase 3: Add psychology modifier
```
Progressive - matches improve as profiles deepen.

---

## Dimension Scoring Ideas

### Lifestyle Compatibility
What makes two people's day-to-day compatible?

| Factor | How to Compare |
|--------|----------------|
| Schedule | Morning/night person overlap |
| Energy | Activity level match |
| Social | Introvert/extrovert compatibility |
| Spontaneity | Planner vs improviser |
| Location | Distance / willingness to travel |

**Scoring approach:**
- Some factors need similarity (schedule)
- Some need compatibility, not sameness (introvert + ambivert works)

### Values Alignment
Do they want the same things long-term?

| Factor | How to Compare |
|--------|----------------|
| Core values | Overlap in top 3-5 values |
| Beliefs | Alignment on important topics |
| Life goals | Compatible trajectories |
| Relationship intent | Same timeline/commitment level |

**Scoring approach:**
- Weight by importance to each user
- "Must match" vs "nice to match" distinction

### Psychology (Optional)
How do their patterns interact?

| Factor | How to Compare |
|--------|----------------|
| Attachment style | Complementary patterns |
| Communication | Compatible styles |
| Conflict approach | Can they resolve disagreements? |

**Scoring approach:**
- Not similarity - complementary patterns
- Secure + anxious may work better than anxious + anxious

---

## Open Questions (Exploration)

1. **Similarity vs Complementarity:** When do we want "same" vs "compatible but different"?
2. **Weighting:** Should users set their own weights? ("Lifestyle matters more to me")
3. **Confidence:** How do we handle low-confidence profile data?
4. **Cold start:** What do we do with minimal profiles?
5. **Learning:** Should the algorithm learn from successful matches?

---

## Rejected Approaches

### Pure ML Black Box
- Can't explain why matches happen
- Users distrust it
- Hard to debug

### Checkbox Overlap
- "You both like hiking" is meaningless
- Shared hobbies ≠ compatibility

### Personality Test Matching
- Too rigid, too clinical
- People don't fit in boxes

### Self-Reported Values
- Everyone says they value "trust" and "honesty"
- Words mean different things to different people
- See `experiential-profiling.md` for interview-based alternative

---

# Part 2: Implementation Spec

## V1: Simple Weighted Algorithm

Start simple, iterate based on real data.

### Data Required

**Derived from interview questions (see experiential-profiling.md):**

```
Lifestyle (from "What does your ideal weekend look like?" etc.):
- energy_pattern: "high" | "moderate" | "low"
- social_pattern: "solo" | "small_group" | "social"
- spontaneity_pattern: "planner" | "flexible" | "spontaneous"

Values (from "What does trust look like to you?" etc.):
- trust_style: "reliability" | "transparency" | "autonomy" | "presence"
- support_style: "space" | "talk" | "presence" | "distraction"
- relationship_intent: "casual" | "serious" | "marriage" (direct ask)
- children_intent: "want" | "open" | "no" (direct ask)

Feedback-Based (from post-date feedback):
- social_ease: 0-100 (aggregated "easy to talk to")
- reliability: 0-100 (aggregated punctuality, follow-through)
- authenticity: 0-100 (aggregated "was who they seemed")
```

### Scoring Functions

#### Lifestyle Score (0-100)
```typescript
function lifestyleScore(a: Profile, b: Profile): number {
  let score = 0

  // Energy: same or adjacent = good
  score += patternMatch(a.energyPattern, b.energyPattern, {
    same: 35,
    adjacent: 25, // high-moderate or moderate-low
    opposite: 10
  })

  // Social: compatible pairings
  score += patternMatch(a.socialPattern, b.socialPattern, {
    same: 35,
    compatible: 25, // solo + small_group works
    opposite: 10    // solo + social is harder
  })

  // Spontaneity: flexible middle matches both
  score += patternMatch(a.spontaneityPattern, b.spontaneityPattern, {
    same: 30,
    flexible_match: 25, // flexible + anything
    opposite: 5         // planner + spontaneous is friction
  })

  return score
}
```

#### Values Score (0-100)
```typescript
function valuesScore(a: Profile, b: Profile): number {
  let score = 0

  // Trust style: same or compatible
  score += styleMatch(a.trustStyle, b.trustStyle, 25)

  // Support style: complementary can work
  score += styleMatch(a.supportStyle, b.supportStyle, 25)

  // Relationship intent: must align
  if (a.relationshipIntent === b.relationshipIntent) {
    score += 30
  } else if (isCompatibleIntent(a.relationshipIntent, b.relationshipIntent)) {
    score += 15
  }

  // Children: must be compatible (dealbreaker territory)
  if (isCompatibleChildrenIntent(a.childrenIntent, b.childrenIntent)) {
    score += 20
  }

  return Math.min(100, score)
}
```

#### Feedback Modifier (0.7 - 1.2)
```typescript
function feedbackModifier(a: Profile, b: Profile): number {
  // No feedback yet = neutral
  if (!a.feedbackCount || !b.feedbackCount) return 1.0

  let modifier = 1.0

  // High social ease from both = bonus
  if (a.socialEase > 70 && b.socialEase > 70) modifier += 0.1

  // High authenticity = bonus (they are who they seem)
  if (a.authenticity > 80 && b.authenticity > 80) modifier += 0.1

  // Low reliability from either = penalty
  if (a.reliability < 50 || b.reliability < 50) modifier -= 0.2

  // Flags = significant penalty
  if (a.flagCount > 0 || b.flagCount > 0) modifier -= 0.3

  return Math.max(0.7, Math.min(1.2, modifier))
}
```

#### Final Score
```typescript
function compatibilityScore(a: Profile, b: Profile): number {
  const lifestyle = lifestyleScore(a, b)
  const values = valuesScore(a, b)
  const feedback = feedbackModifier(a, b)

  // Weighted average with feedback modifier
  const base = (lifestyle * 0.5) + (values * 0.5)
  return Math.round(base * feedback)
}
```

### Matching Flow

```
1. Filter by decency (must pass threshold)
2. Filter by mutual attraction (both swiped yes)
3. Compute compatibilityScore
4. Rank matches by score
5. Surface top matches with mysterious insights
```

### What We Show Users

**Never show:** Raw scores, specific factors, "you're 73% compatible"

**Do show:**
- Mysterious insights: "You both value the same thing on weekends"
- Vague indicators: "Strong overlap" / "Worth exploring" / "Different paths"
- One or two specific hints (opt-in)

---

## V2 Considerations (Future)

- User-set weights ("lifestyle matters more to me")
- Learning from outcomes (which matches led to second dates?)
- Location/distance factoring
- Dealbreaker handling (hard no on certain values)
- More interview questions over time (progressive depth)
- Pattern detection from free-text answers (NLP/LLM)
- Cross-referencing stated preferences with feedback patterns

---

## Related Documents

- `experiential-profiling.md` - Interview questions and feedback system
- `values-schema.md` - What dimensions we're measuring
- `matching-philosophy.md` - Why we match this way

---

*Start with V1. Iterate based on real user data and feedback.*
