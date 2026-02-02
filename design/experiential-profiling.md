# Experiential Profiling

**Status:** Core design approach

---

## Philosophy

We don't ask people to describe themselves. We ask about their experiences.

Everyone says they value trust, honesty, and communication. But these words mean different things to different people. By asking "What does trust look like to you?" instead of "Do you value trust?" we reveal what actually matters.

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

# Layer 1: Lifestyle Questions

## Schedule & Rhythm

### Morning vs Night

**Question:** "When do you feel most yourself - early morning or late at night?"

**Follow-up:** "What does that time of day give you that other times don't?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Morning person, early riser | +2 | "I love the quiet before anyone's awake" |
| Leans morning | +1 | "I'm better in the morning but can adapt" |
| Flexible/no preference | 0 | "Depends on the day" |
| Leans night | -1 | "I come alive after dinner" |
| Night owl | -2 | "My best ideas come at 2am" |

**Compatibility:** Similarity preferred. Opposite schedules create friction.

---

### Work Style

**Question:** "What does a typical workday look like for you? How do you feel about that rhythm?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Structured 9-5 | +2 | Values predictability |
| Mostly structured | +1 | Regular but some flexibility |
| Hybrid/varies | 0 | Mix of structure and freedom |
| Flexible hours | -1 | Works when inspired |
| Irregular/non-traditional | -2 | Gig work, creative, shifts |

**Compatibility:** Similar rhythms help. Opposite can work if both are flexible.

---

## Energy & Activity

### Energy Level

**Question:** "Describe your ideal weekend. What would recharge you vs drain you?"

**Follow-up:** "What happens when you have nothing planned?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| High energy, always moving | +2 | "I'd go crazy with nothing to do" |
| Active but with downtime | +1 | "Morning hike, then chill" |
| Balanced | 0 | "Mix of activity and rest" |
| Lower key, selective activity | -1 | "One outing, then home" |
| Homebody, restorative | -2 | "Nothing planned IS the plan" |

**Compatibility:** Within 1-2 points works. Opposite energy creates resentment.

---

### Activity Preference

**Question:** "If you had a free evening with no obligations, where would we find you?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Out - events, bars, activities | +2 | "Probably at a show or trying a new restaurant" |
| Mostly out, sometimes home | +1 | "Out with friends, but I need my couch time" |
| Equal mix | 0 | "Depends on my mood" |
| Mostly home, selective outings | -1 | "Home, unless something really good is happening" |
| Home - reading, cooking, projects | -2 | "On my couch, 100%" |

**Compatibility:** Similarity preferred. Homebody + always out is friction.

---

## Social Style

### Introvert/Extrovert

**Question:** "After a long week, do you want to see people or be alone? What does that feel like?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Energized by people | +2 | "I need to be around others to recharge" |
| Socially inclined | +1 | "People help, but I need some alone time" |
| Ambivert | 0 | "Depends - sometimes people, sometimes solitude" |
| Needs solitude to recharge | -1 | "People are great but drain me" |
| Strong introvert | -2 | "Alone time is essential" |

**Compatibility:** Ambivert pairs well with both. Strong opposites can struggle.

---

### Group Size Preference

**Question:** "What's your ideal social situation? Big party, small dinner, or one-on-one?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Large groups, parties | +2 | "The more the merrier" |
| Medium groups | +1 | "Dinner party with 6-8 people" |
| Flexible | 0 | "Depends on the people" |
| Small groups | -1 | "3-4 close friends" |
| One-on-one only | -2 | "I connect best individually" |

**Compatibility:** Similar preferences reduce social friction.

---

## Planning Style

### Spontaneity

**Question:** "How do you feel when plans change at the last minute? Tell me about a time that happened."

**Follow-up:** "What's your relationship with calendars and to-do lists?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Loves surprises, hates plans | +2 | "Plans are just suggestions" |
| Flexible, goes with flow | +1 | "I adapt easily" |
| Balanced | 0 | "Some structure, some spontaneity" |
| Prefers knowing the plan | -1 | "I like to know what's coming" |
| Strong planner | -2 | "Changed plans stress me out" |

**Compatibility:** Flexible (0) pairs well with either. Strong opposites create friction.

---

## Location

### Location Flexibility

**Question:** "How rooted are you to where you live? What would it take for you to move?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Settled, not moving | +2 | "This is home, period" |
| Prefer to stay | +1 | "Open to it but not seeking" |
| Flexible | 0 | "Right opportunity, right person" |
| Open to relocating | -1 | "I'd move for the right situation" |
| Actively seeking change | -2 | "I want to be somewhere else" |

**Compatibility:** Must be compatible for relationship to work long-term.

---

# Layer 2: Values Questions

## Trust

**Question:** "What does trust look like in a relationship? How do you know when it's there?"

**Opposite:** "What does mistrust feel like? What makes you lose trust?"

| Response Pattern | Position | Spectrum |
|------------------|----------|----------|
| Actions over words | "consistency" | Trust = reliability |
| Transparency, openness | "honesty" | Trust = no secrets |
| Space without suspicion | "autonomy" | Trust = freedom |
| Being there when hard | "presence" | Trust = support |

**Compatibility:** Same trust language = easier. Different can work if understood.

---

## Communication

**Question:** "What's a conversation you've had that really stuck with you? What made it good?"

**Opposite:** "What's a conversation style that doesn't work for you?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Deep, philosophical | +2 | Values intellectual connection |
| Meaningful but not heavy | +1 | Substance with lightness |
| Varies by mood/topic | 0 | Flexible communicator |
| Light, playful | -1 | Values ease over depth |
| Action over talk | -2 | "Talk is cheap" |

**Compatibility:** Similar depth preferences reduce "we never talk about anything real" vs "everything is so heavy" conflicts.

---

## Conflict Style

**Question:** "Tell me about a disagreement that ended well. What made it work?"

**Opposite:** "What happens in arguments that makes things worse?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Talk it through immediately | +2 | "Let's hash it out now" |
| Discuss when calm | +1 | "Give me an hour, then let's talk" |
| Depends on the issue | 0 | Adaptable |
| Need space first | -1 | "I need to process alone" |
| Avoid/smooth over | -2 | "I'd rather let it go" |

**Compatibility:** Must be compatible - pursuer + withdrawer is classic trap.

---

## Independence vs Togetherness

**Question:** "What does healthy space look like in a relationship?"

**Opposite:** "What does too much togetherness feel like? Or too much distance?"

| Response Pattern | Position | Spectrum |
|------------------|----------|----------|
| Lots of independence | +2 | "We should have separate lives that overlap" |
| Value alone time | +1 | "I need my own friends and hobbies" |
| Balanced | 0 | "Mix of together and apart" |
| Prefer togetherness | -1 | "I want to share most things" |
| Very connected | -2 | "Best friends who do everything together" |

**Compatibility:** Within 1-2 points. Opposite ends feel suffocating or abandoned.

---

## Growth & Change

**Question:** "What's something about yourself you've worked on changing? How did that go?"

**Follow-up:** "How do you feel when a partner wants you to change something?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Always improving | +2 | Growth-oriented, welcomes feedback |
| Open to growth | +1 | Will work on things, not obsessive |
| Selective | 0 | "Some things, not everything" |
| Accepting of self | -1 | "I am who I am, mostly" |
| Resistant to change | -2 | "Take me as I am" |

**Compatibility:** Similar growth orientation prevents "you're never satisfied" vs "you never improve" conflicts.

---

## Relationship Intent (Direct Ask)

**Question:** "What are you looking for right now? And how do you feel about timelines?"

| Response | Code | Notes |
|----------|------|-------|
| "Casual, nothing serious" | casual | No pressure |
| "Open to something serious" | open | See where it goes |
| "Looking for a relationship" | serious | Intentional dating |
| "Want to find my person" | marriage_track | Long-term focused |
| "Honestly not sure" | figuring_it_out | Exploring |

**Compatibility:** Must align. Casual + marriage_track is a mismatch.

---

## Children (Direct Ask)

**Question:** "How do you feel about kids - having them, not having them?"

| Response | Code | Notes |
|----------|------|-------|
| "Definitely want kids" | want | Dealbreaker if partner doesn't |
| "Open to it" | open | Flexible |
| "Don't want kids" | no | Dealbreaker if partner does |
| "Already have kids" | have_kids | Different considerations |

**Compatibility:** Dealbreaker category. Want + No = no match.

---

## Career Priority

**Question:** "Where does work fit in your life? How important is career ambition to you?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Career-focused | +2 | "Work is a huge part of my identity" |
| Ambitious but balanced | +1 | "Career matters but not everything" |
| Balanced | 0 | "Work to live, not live to work" |
| Life over career | -1 | "Career is fine, life is better" |
| Minimal career focus | -2 | "Work is just money" |

**Compatibility:** Similar priorities reduce resentment about time/focus.

---

## Beliefs & Politics

**Question:** "How important is it that a partner shares your political views? What about religion?"

| Response | Importance | Notes |
|----------|------------|-------|
| "Doesn't matter at all" | 0 | Non-factor |
| "Somewhat, but not critical" | 1 | Preference |
| "Pretty important" | 2 | Strong preference |
| "Dealbreaker" | 3 | Must align |

**Note:** We ask about importance, not position. Position can be asked directly if importance > 0.

**Compatibility:** If either person rates 2-3, positions must be compatible.

---

# Layer 3: Psychology Questions (Optional)

## Attachment Style

**Question:** "How do you feel when a partner needs space? What about when they want more closeness?"

**Follow-up:** "What do you need when you're feeling disconnected from someone?"

| Response Pattern | Style | Notes |
|------------------|-------|-------|
| Comfortable with both | secure | "Space is fine, closeness is fine" |
| Worry when they're distant | anxious | "I need to know we're okay" |
| Relief when they back off | avoidant | "I need room to breathe" |
| Both anxious and avoidant | disorganized | Push-pull patterns |

**Compatibility:** Secure + any works. Anxious + avoidant is difficult.

---

## Emotional Expression

**Question:** "When something's bothering you, how does it come out? How do you know when someone else is upset?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Very expressive | +2 | "You'll know how I feel" |
| Open when comfortable | +1 | "I share with people I trust" |
| Moderate | 0 | "Depends on the situation" |
| Private | -1 | "I process internally" |
| Reserved | -2 | "I keep things to myself" |

**Compatibility:** Similar expressiveness or complementary (expressive + good listener).

---

## Security & Reassurance

**Question:** "What makes you feel secure in a relationship? What does reassurance look like for you?"

| Response Pattern | Need Level | Notes |
|------------------|------------|-------|
| Very little needed | low | "I'm pretty self-assured" |
| Occasional check-ins | moderate | "Nice to hear, not essential" |
| Regular affirmation | high | "I need to know where I stand" |

**Compatibility:** Must be compatible with partner's ability/willingness to provide.

---

## Novelty vs Stability

**Question:** "Do you prefer the comfort of routine or the excitement of something new?"

| Response Pattern | Position | Notes |
|------------------|----------|-------|
| Craves novelty | +2 | "I get bored with routine" |
| Likes variety | +1 | "Mix it up regularly" |
| Balanced | 0 | "Some routine, some adventure" |
| Prefers stability | -1 | "Routine is comforting" |
| Strong stability | -2 | "I like knowing what to expect" |

**Compatibility:** Moderate differences work (keeps things interesting). Extremes can clash.

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
