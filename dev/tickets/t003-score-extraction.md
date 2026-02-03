# T003 - Score Extraction

## Goal
Extract dimension scores from free-text answers using LLM.

## Acceptance Criteria
- [x] Function to extract formation/position/importance from answer text
- [x] Uses existing LLM client (lib/llm-client.ts)
- [x] Handles multiple dimensions per question
- [x] Saves extracted scores to ProfileDimension table
- [x] Graceful handling of unclear/short answers

## Constraints
- Use existing Anthropic LLM client
- Keep prompts concise to minimize token usage
- Must handle edge cases (empty answers, gibberish)

## Plan
1. Create lib/matching/extract-score.ts
2. Build extraction prompt with dimension spectrum
3. Parse LLM JSON response
4. Save to database
5. Create API endpoint for processing answers

## Code

```typescript
// web/lib/matching/extract-score.ts

import { llmClient } from '@/lib/llm-client'
import { DIMENSIONS, DimensionKey } from './dimensions'
import { prisma } from '@/lib/prisma'

interface ExtractionResult {
  dimension: string
  formation: number  // 0-4
  position: number   // -2 to +2
  importance: number // 0-3
  reasoning: string
}

export async function extractDimensionScore(
  question: string,
  answer: string,
  dimensions: DimensionKey[]
): Promise<ExtractionResult[]> {
  if (!answer || answer.trim().length < 3) {
    return dimensions.map(d => ({
      dimension: d,
      formation: 0,
      position: 0,
      importance: 0,
      reasoning: 'No meaningful answer provided'
    }))
  }

  const dimensionSpecs = dimensions.map(d =>
    `- ${d}: ${DIMENSIONS[d].spectrum}`
  ).join('\n')

  const prompt = `Analyze this answer and extract scores for each dimension.

Question: "${question}"
Answer: "${answer}"

Dimensions to score:
${dimensionSpecs}

For each dimension, return:
- formation: 0-4 (0=skipped, 1=minimal, 2=partial, 3=formed, 4=highly nuanced)
- position: -2 to +2 (where on spectrum, 0 if unclear)
- importance: 0-3 (how much this seems to matter to them)
- reasoning: brief explanation

Return JSON array: [{ dimension, formation, position, importance, reasoning }]`

  const response = await llmClient.chat({
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(response.content)
}

export async function saveScores(
  userId: string,
  scores: ExtractionResult[],
  rawAnswer: string
) {
  for (const score of scores) {
    await prisma.profileDimension.upsert({
      where: { userId_dimension: { userId, dimension: score.dimension } },
      create: {
        userId,
        dimension: score.dimension,
        formation: score.formation,
        position: score.position,
        importance: score.importance,
        rawAnswer
      },
      update: {
        formation: score.formation,
        position: score.position,
        importance: score.importance,
        rawAnswer
      }
    })
  }
}
```

---

## Implementation Notes
- Used `generateWithSystem` from existing LLM client (not `llmClient.chat` as in ticket spec)
- Added JSON parsing with fallback regex extraction (LLM sometimes adds extra text)
- Value clamping ensures scores stay in valid ranges
- Parallel upserts via `Promise.all` for better performance
- Lower temperature (0.3) for consistent scoring
- `extractAndSaveScores` convenience function combines extraction + save

## Verification
- [x] Extraction returns valid scores for sample answers
- [x] Handles empty/short answers gracefully (returns zero scores)
- [x] Scores are saved to database correctly (upsert pattern)
- [x] Updates existing scores on re-answer (via upsert)

## Completion

**Date:** 2026-02-02
**Summary:** Created score extraction module using LLM to analyze free-text answers
**Files changed:**
- web/lib/matching/extract-score.ts (new)
**Tests:** N/A (no test script configured)
**Notes:** Requires `npx prisma generate` after schema changes to update client types
