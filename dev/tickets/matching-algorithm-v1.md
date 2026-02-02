# Matching Algorithm V1

## Goal

Build a simple matching algorithm using experiential profiling and dimension scoring.

## Acceptance Criteria

- [ ] Schema: ProfileDimensions table with formation/position/importance per dimension
- [ ] Schema: FeedbackResponse table for post-date feedback
- [ ] API: Score extraction from free-text answers (LLM-based)
- [ ] API: Compatibility calculation between two profiles
- [ ] API: Match ranking for a given user
- [ ] UI: 5 core onboarding questions with open-ended input
- [ ] UI: Post-date feedback form (simple, 3 questions)

---

## Implementation Plan

### Phase 1: Schema & Data Model

**1.1 Add ProfileDimensions to Prisma**

```prisma
model ProfileDimension {
  id        String   @id @default(cuid())
  userId    String
  dimension String   // "schedule", "energy", "trust", etc.

  formation  Int     @default(0)  // 0-4
  position   Float   @default(0)  // -2 to +2
  importance Int     @default(0)  // 0-3

  rawAnswer  String? // Original text
  updatedAt  DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, dimension])
}

model FeedbackResponse {
  id          String   @id @default(cuid())
  fromUserId  String
  toUserId    String

  ease        Int      // 1-4 (easy, warming up, awkward, not a fit)
  seeAgain    Int      // 1-3 (definitely, maybe, no)
  notes       String?

  createdAt   DateTime @default(now())

  fromUser User @relation("FeedbackGiven", fields: [fromUserId], references: [id])
  toUser   User @relation("FeedbackReceived", fields: [toUserId], references: [id])
}
```

**1.2 Dimension Constants**

```typescript
// lib/matching/dimensions.ts

export const DIMENSIONS = {
  // Lifestyle
  schedule: { type: 'lifestyle', rule: 'similarity' },
  energy: { type: 'lifestyle', rule: 'similarity' },
  social: { type: 'lifestyle', rule: 'compatibility' },
  spontaneity: { type: 'lifestyle', rule: 'complementary' },

  // Values
  trust: { type: 'values', rule: 'similarity' },
  communication: { type: 'values', rule: 'similarity' },
  conflict: { type: 'values', rule: 'compatibility' },
  independence: { type: 'values', rule: 'compatibility' },
  growth: { type: 'values', rule: 'similarity' },

  // Direct
  intent: { type: 'direct', rule: 'dealbreaker' },
  children: { type: 'direct', rule: 'dealbreaker' },
} as const

export type DimensionKey = keyof typeof DIMENSIONS
```

---

### Phase 2: Score Extraction

**2.1 LLM-based Answer Scoring**

```typescript
// lib/matching/extract-score.ts

interface ExtractionResult {
  dimension: string
  formation: number  // 0-4
  position: number   // -2 to +2
  importance: number // 0-3
  reasoning: string
}

async function extractDimensionScore(
  question: string,
  answer: string,
  dimension: string
): Promise<ExtractionResult> {
  const prompt = `
    Analyze this answer to extract a dimension score.

    Question: ${question}
    Answer: ${answer}
    Dimension: ${dimension}

    Return JSON:
    {
      "formation": 0-4 (0=skipped, 1=minimal, 2=partial, 3=formed, 4=highly formed),
      "position": -2 to +2 (where they fall on the spectrum),
      "importance": 0-3 (how much this seems to matter to them),
      "reasoning": "brief explanation"
    }

    Spectrum for ${dimension}: [provide spectrum based on dimension]
  `

  // Call LLM and parse response
  return await llmClient.extractJson(prompt)
}
```

**2.2 Communication Style Extraction**

```typescript
// Also extract communication style from HOW they answered

async function extractCommunicationStyle(
  answers: { question: string, answer: string }[]
): Promise<{
  style: 'detailed' | 'direct' | 'playful' | 'thoughtful' | 'minimal'
  confidence: number
}> {
  // Analyze patterns across all answers
  // - Length, tone, humor, questions asked, etc.
}
```

---

### Phase 3: Compatibility Calculation

**3.1 Dimension Compatibility**

```typescript
// lib/matching/compatibility.ts

function dimensionCompatibility(
  a: { formation: number, position: number, importance: number },
  b: { formation: number, position: number, importance: number },
  rule: 'similarity' | 'compatibility' | 'complementary' | 'dealbreaker'
): number {
  // If either has no input, return neutral
  if (a.formation === 0 || b.formation === 0) return 50

  const confidence = Math.min(a.formation, b.formation) / 4
  let baseScore: number

  switch (rule) {
    case 'similarity':
      const diff = Math.abs(a.position - b.position)
      baseScore = Math.max(0, 100 - (diff * 25))
      break
    case 'compatibility':
      const distance = Math.abs(a.position - b.position)
      baseScore = distance <= 2 ? 100 - (distance * 15) : 30
      break
    case 'complementary':
      baseScore = 70 // Most combinations work
      break
    case 'dealbreaker':
      baseScore = a.position === b.position ? 100 : 0
      break
  }

  const importanceWeight = Math.max(a.importance, b.importance) / 3
  return baseScore * (0.5 + (confidence * 0.3) + (importanceWeight * 0.2))
}
```

**3.2 Overall Match Score**

```typescript
interface MatchScore {
  lifestyle: number
  values: number
  overall: number
  confidence: 'low' | 'medium' | 'high'
  dealbreakers: string[]
}

async function calculateMatch(userA: string, userB: string): Promise<MatchScore> {
  const dimensionsA = await getDimensions(userA)
  const dimensionsB = await getDimensions(userB)

  // Check dealbreakers first
  const dealbreakers = checkDealbreakers(dimensionsA, dimensionsB)
  if (dealbreakers.length > 0) {
    return { overall: 0, dealbreakers, confidence: 'high', lifestyle: 0, values: 0 }
  }

  // Calculate lifestyle score
  const lifestyle = average([
    dimensionCompatibility(dimensionsA.schedule, dimensionsB.schedule, 'similarity'),
    dimensionCompatibility(dimensionsA.energy, dimensionsB.energy, 'similarity'),
    dimensionCompatibility(dimensionsA.social, dimensionsB.social, 'compatibility'),
    dimensionCompatibility(dimensionsA.spontaneity, dimensionsB.spontaneity, 'complementary'),
  ])

  // Calculate values score
  const values = average([
    dimensionCompatibility(dimensionsA.trust, dimensionsB.trust, 'similarity'),
    dimensionCompatibility(dimensionsA.communication, dimensionsB.communication, 'similarity'),
    dimensionCompatibility(dimensionsA.conflict, dimensionsB.conflict, 'compatibility'),
    dimensionCompatibility(dimensionsA.independence, dimensionsB.independence, 'compatibility'),
    dimensionCompatibility(dimensionsA.growth, dimensionsB.growth, 'similarity'),
  ])

  const overall = (lifestyle * 0.5) + (values * 0.5)
  const confidence = calculateConfidence(dimensionsA, dimensionsB)

  return { lifestyle, values, overall, confidence, dealbreakers: [] }
}
```

---

### Phase 4: UI Components

**4.1 Onboarding Questions**

```typescript
// app/onboarding/questions.tsx

const CORE_QUESTIONS = [
  {
    id: 'weekend',
    question: "What does your ideal weekend look like?",
    dimensions: ['energy', 'social'],
    followUp: "Is there another way you'd describe how you like to spend your time?"
  },
  {
    id: 'intent',
    question: "What are you looking for right now?",
    dimensions: ['intent'],
    type: 'direct' // Not free-text
  },
  {
    id: 'trust',
    question: "What does trust look like to you?",
    dimensions: ['trust'],
    followUp: "What does it feel like when trust is broken?"
  },
  {
    id: 'plans',
    question: "How do you feel when plans change last minute?",
    dimensions: ['spontaneity'],
    followUp: "Is that something you've always felt?"
  },
  {
    id: 'support',
    question: "What do you need when things get hard?",
    dimensions: ['independence', 'conflict'],
    followUp: "What doesn't help, even when people mean well?"
  }
]
```

**4.2 Question UI**

- Text area for open-ended response
- "Describe it differently" link to reveal alternative prompt
- Skip option
- Progress indicator
- Save after each question (don't lose progress)

**4.3 Feedback Form**

```typescript
// app/feedback/[matchId]/page.tsx

const FEEDBACK_QUESTIONS = [
  {
    id: 'ease',
    question: "How did it feel to spend time with them?",
    options: [
      { value: 4, label: "Easy and natural" },
      { value: 3, label: "Good but took some warming up" },
      { value: 2, label: "A bit awkward" },
      { value: 1, label: "Not a fit" }
    ]
  },
  {
    id: 'notes',
    question: "Anything stand out?",
    type: 'text',
    optional: true
  },
  {
    id: 'seeAgain',
    question: "Would you see them again?",
    options: [
      { value: 3, label: "Definitely" },
      { value: 2, label: "Maybe" },
      { value: 1, label: "Probably not" }
    ]
  }
]
```

---

## Build Order

1. **Schema migration** - Add ProfileDimension and FeedbackResponse tables
2. **Dimension constants** - Define all dimensions and rules
3. **Score extraction** - LLM-based answer analysis
4. **Compatibility calculation** - Core algorithm
5. **Onboarding UI** - 5 core questions
6. **Match ranking API** - Return sorted matches for a user
7. **Feedback UI** - Post-date form
8. **Feedback integration** - Feed into matching (V2)

---

## Out of Scope (V2)

- Psychology dimensions (attachment, etc.)
- Communication style as matching factor
- Learning from feedback outcomes
- Progressive question drip (week 1)
- User-set importance weights

---

## Verification

- [ ] User can complete onboarding with 5 questions
- [ ] Answers are extracted to dimension scores
- [ ] Two users get a compatibility score
- [ ] Matches are ranked by compatibility
- [ ] Dealbreakers block matches
- [ ] Feedback form works post-date
- [ ] Low-data profiles get "low confidence" flag

---

## Files to Create/Modify

```
web/prisma/schema.prisma          # Add models
web/lib/matching/
  dimensions.ts                   # Constants
  extract-score.ts                # LLM extraction
  compatibility.ts                # Score calculation
  index.ts                        # Public API
web/app/api/matching/
  score/route.ts                  # Calculate match score
  rank/route.ts                   # Get ranked matches
web/app/onboarding/
  questions/page.tsx              # Question flow
  components/QuestionCard.tsx     # UI component
web/app/feedback/
  [matchId]/page.tsx              # Feedback form
```
