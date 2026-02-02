# Experiential Profiling

**Status:** Core design approach

---

## Philosophy

We don't ask people to describe themselves. We ask about their experiences.

Everyone says they value trust, honesty, and communication. But these words mean different things to different people. By asking "What does trust look like to you?" instead of "Do you value trust?" we reveal what actually matters.

**Key principles:**
- Small set of high-quality questions, not exhaustive surveys
- Let users describe things in their own words
- Always offer: "Is there another way you think about this?"
- How someone answers is itself a matching signal

---

## Communication Style as Signal

How someone responds tells us as much as what they say:

| Response Style | What It Suggests | Match With |
|----------------|------------------|------------|
| Long, detailed, reflective | Deep processor, values thoroughness | Similar or appreciates depth |
| Short, direct, action-oriented | Efficient, gets to the point | Similar or balances with depth |
| Playful, uses humor | Light touch, doesn't take self too seriously | Similar energy |
| Asks clarifying questions | Thoughtful, wants to get it right | Appreciates intentionality |
| Skips or "I don't know" | May not prioritize this, or still figuring out | Flexible partners |

We should be transparent: "How you answer helps us understand how you communicate."

---

## Scoring Model

Each dimension has three components:

```typescript
interface DimensionScore {
  formation: 0 | 1 | 2 | 3 | 4  // How developed is this response?
  position: number              // Where on the spectrum (-2 to +2)
  importance: 0 | 1 | 2 | 3     // How much does this matter to them?
}
```

**Formation levels:**
- 0 = No input (skipped)
- 1 = Minimal (one word, vague)
- 2 = Partial (some detail)
- 3 = Formed (clear perspective)
- 4 = Highly formed (nuanced, specific examples)

**Position:** Where they fall on the dimension's spectrum (varies by dimension)

**Importance:** Inferred from response depth, emotion words, emphasis

---

## Compatibility Logic

| Type | Rule | Example |
|------|------|---------|
| **Similarity** | Same position = high score | Values alignment |
| **Compatibility** | Works together, not necessarily same | Introvert + ambivert |
| **Complementary** | Different but balancing | Planner + flexible |
| **Dealbreaker** | Must match or no match | Children intent |

---

# Core Questions (Small, High-Quality Set)

We don't need dozens of questions. We need a few good ones that open conversation.

## The Essential Five (Onboarding)

These get us enough to start matching:

1. **"What does your ideal weekend look like?"**
   - Reveals: Energy, social style, activity preference
   - Follow-up: "Is there another way you'd describe how you like to spend your time?"

2. **"What are you looking for right now?"**
   - Reveals: Intent, timeline, openness
   - Direct ask is fine here

3. **"What does trust look like to you?"**
   - Reveals: Trust style, what they're sensitive to
   - Follow-up: "What does it feel like when trust is broken?"

4. **"How do you feel when plans change last minute?"**
   - Reveals: Spontaneity, flexibility, need for structure
   - Follow-up: "Is that something you've always felt, or has it changed?"

5. **"What do you need when things get hard?"**
   - Reveals: Support style, communication needs, independence
   - Follow-up: "What doesn't help, even when people mean well?"

---

## Deepening Questions (Drip Over Time)

One per day, optional, after onboarding:

- **"What's a conversation you've had that really stuck with you?"** (communication depth)
- **"What does healthy space look like in a relationship?"** (independence vs togetherness)
- **"Tell me about a disagreement that ended well."** (conflict style)
- **"How do you feel about where work fits in your life?"** (career priority)
- **"What's something about yourself you've worked on changing?"** (growth orientation)

---

## Always Offer an Out

After any question:
- "Is there another way you think about this?"
- "Feel free to describe it differently"
- "Skip if this doesn't resonate"

Some users will surprise us with perspectives we didn't anticipate. That's valuable data too.

---

# Dimension Reference (Scoring Guide)

These are the dimensions we're measuring. The core questions above feed into multiple dimensions. This reference helps map responses to scores.

## Lifestyle Dimensions

| Dimension | Spectrum | Compatibility Rule |
|-----------|----------|-------------------|
| Schedule | Morning ↔ Night | Similarity |
| Energy | High ↔ Low | Similarity (within 2) |
| Social | Extrovert ↔ Introvert | Compatibility |
| Spontaneity | Spontaneous ↔ Planner | Complementary |
| Location | Rooted ↔ Mobile | Compatibility |

## Values Dimensions

| Dimension | Spectrum | Compatibility Rule |
|-----------|----------|-------------------|
| Trust style | Consistency / Honesty / Autonomy / Presence | Similarity |
| Communication depth | Deep ↔ Light | Similarity |
| Conflict style | Engage ↔ Withdraw | Compatibility |
| Independence | High ↔ Low | Compatibility (within 2) |
| Growth | Growth-seeking ↔ Self-accepting | Similarity |
| Career | Primary ↔ Secondary | Compatibility |

## Direct Asks (Dealbreakers)

| Dimension | Options | Compatibility Rule |
|-----------|---------|-------------------|
| Intent | casual / open / serious / marriage_track | Must align |
| Children | want / open / no / have_kids | Dealbreaker |
| Politics importance | 0-3 | If 2+, positions must align |
| Religion importance | 0-3 | If 2+, positions must align |

## Psychology (Optional)

| Dimension | Options | Compatibility Rule |
|-----------|---------|-------------------|
| Attachment | secure / anxious / avoidant / disorganized | Compatibility |
| Expression | Expressive ↔ Reserved | Compatibility |
| Novelty | Novelty-seeking ↔ Stability-seeking | Complementary |

---

# Compatibility Calculation

## Per-Dimension Scoring

```typescript
function dimensionCompatibility(a: DimensionScore, b: DimensionScore, rule: CompatibilityRule): number {
  // If either has no input, return neutral
  if (a.formation === 0 || b.formation === 0) return 50

  // Higher formation = more confident score
  const confidence = Math.min(a.formation, b.formation) / 4

  let baseScore: number

  switch (rule) {
    case 'similarity':
      // Same position = 100, each step apart = -25
      const diff = Math.abs(a.position - b.position)
      baseScore = Math.max(0, 100 - (diff * 25))
      break

    case 'compatibility':
      // Within 2 = good, 3 = okay, 4 = poor
      const distance = Math.abs(a.position - b.position)
      baseScore = distance <= 2 ? 100 - (distance * 15) : 30
      break

    case 'complementary':
      // Opposite can be good, same can be good
      baseScore = 70 // Most combinations work
      break

    case 'dealbreaker':
      // Must match or fail
      baseScore = a.position === b.position ? 100 : 0
      break
  }

  // Weight by importance (if one cares a lot, weight heavier)
  const importanceWeight = Math.max(a.importance, b.importance) / 3

  return baseScore * (0.5 + (confidence * 0.3) + (importanceWeight * 0.2))
}
```

## Overall Match Score

```typescript
interface MatchScore {
  lifestyle: number      // 0-100
  values: number         // 0-100
  psychology: number     // 0-100 (if opted in)
  feedback: number       // 0-100 (if available)
  overall: number        // Weighted combination
  confidence: string     // "low" | "medium" | "high"
  dealbreakers: string[] // Any failed dealbreaker checks
}

function calculateMatch(a: Profile, b: Profile): MatchScore {
  // Check dealbreakers first
  const dealbreakers = checkDealbreakers(a, b)
  if (dealbreakers.length > 0) {
    return { overall: 0, dealbreakers, confidence: 'high' }
  }

  const lifestyle = averageScore([
    dimensionCompatibility(a.schedule, b.schedule, 'similarity'),
    dimensionCompatibility(a.energy, b.energy, 'similarity'),
    dimensionCompatibility(a.social, b.social, 'compatibility'),
    dimensionCompatibility(a.spontaneity, b.spontaneity, 'complementary'),
    dimensionCompatibility(a.location, b.location, 'compatibility'),
  ])

  const values = averageScore([
    dimensionCompatibility(a.trust, b.trust, 'similarity'),
    dimensionCompatibility(a.communication, b.communication, 'similarity'),
    dimensionCompatibility(a.conflict, b.conflict, 'compatibility'),
    dimensionCompatibility(a.independence, b.independence, 'compatibility'),
    dimensionCompatibility(a.growth, b.growth, 'similarity'),
    dimensionCompatibility(a.career, b.career, 'compatibility'),
  ])

  const psychology = a.psychOptedIn && b.psychOptedIn
    ? averageScore([
        dimensionCompatibility(a.attachment, b.attachment, 'compatibility'),
        dimensionCompatibility(a.expression, b.expression, 'compatibility'),
        dimensionCompatibility(a.novelty, b.novelty, 'complementary'),
      ])
    : null

  const overall = calculateOverall(lifestyle, values, psychology)
  const confidence = calculateConfidence(a, b)

  return { lifestyle, values, psychology, overall, confidence, dealbreakers: [] }
}
```

---

# Feedback System

## Post-Date Feedback

After meeting, both people answer:

**Question 1:** "How did it feel to spend time with them?"
- Easy and natural
- Good but took some warming up
- A bit awkward
- Not a fit

**Question 2:** "Anything stand out?" (optional text)

**Question 3:** "Would you see them again?"
- Definitely
- Maybe
- Probably not

## Feedback Aggregation

After 3+ interactions, patterns emerge:

```typescript
interface FeedbackProfile {
  easeScore: number      // How easy to be around (0-100)
  authenticityScore: number  // Were they who they seemed? (0-100)
  reliabilityScore: number   // Did they show up, on time? (0-100)

  positivePatterns: string[] // "Good listener", "Easy to talk to"
  concernPatterns: string[]  // "Ran late", "Different than profile"

  responseCount: number
}
```

## Showing Feedback to Users

**What they see (gentle, aggregated):**

```
People who've met you often mention:
✓ Easy to talk to
✓ Good energy

Something to know:
○ A couple people mentioned you ran late
```

**Rules:**
- Only show after 3+ similar signals
- Lead with positives
- Frame concerns as "something to know" not criticism
- Never show individual feedback

---

# Progressive Questioning

Don't ask everything at once.

## Onboarding (5 min)
1. Location (direct)
2. "What does your ideal weekend look like?" (energy + social)
3. "What are you looking for right now?" (intent - direct)
4. "What does trust look like to you?" (trust style)
5. "How do you feel when plans change?" (spontaneity)

## Week 1 (1 question/day)
- Day 1: Communication style
- Day 2: Independence vs togetherness
- Day 3: Conflict style
- Day 4: Growth orientation
- Day 5: Career priority

## After First Match
- Attachment questions (optional, opt-in prompt)
- Deeper values questions based on match feedback

## After First Date
- Feedback questions
- Refinement: "Anything you've learned about what you want?"

---

# Data Schema

```typescript
interface ProfileDimensions {
  // Lifestyle
  schedule: DimensionScore
  workStyle: DimensionScore
  energy: DimensionScore
  activity: DimensionScore
  social: DimensionScore
  groupSize: DimensionScore
  spontaneity: DimensionScore
  locationFlex: DimensionScore

  // Values
  trust: DimensionScore
  communication: DimensionScore
  conflict: DimensionScore
  independence: DimensionScore
  growth: DimensionScore
  career: DimensionScore

  // Direct asks
  intent: 'casual' | 'open' | 'serious' | 'marriage_track' | 'figuring_it_out'
  children: 'want' | 'open' | 'no' | 'have_kids'
  politicsImportance: 0 | 1 | 2 | 3
  religionImportance: 0 | 1 | 2 | 3

  // Psychology (optional)
  psychOptedIn: boolean
  attachment: DimensionScore | null
  expression: DimensionScore | null
  reassurance: DimensionScore | null
  novelty: DimensionScore | null

  // Metadata
  completeness: number  // 0-100
  lastUpdated: Date
}

interface DimensionScore {
  formation: 0 | 1 | 2 | 3 | 4
  position: number  // -2 to +2
  importance: 0 | 1 | 2 | 3
  rawAnswer?: string  // Original text for reference
}
```

---

# Open Questions

1. **NLP/LLM extraction:** How do we map free-text answers to position scores?
2. **Gaming:** Can people figure out "good" answers? Does it matter?
3. **Sparse data:** How do we match people with few answers?
4. **Position vs compatibility:** Some dimensions may need more nuanced compatibility rules
5. **Importance weighting:** Should user-stated importance outweigh inferred?

---

*This is the core profiling approach. See matching-algorithm.md for how scores combine.*
