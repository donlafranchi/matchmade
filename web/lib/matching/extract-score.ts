// Extract dimension scores from free-text answers using LLM
// See design/experiential-profiling.md for scoring model

import { generateWithSystem } from '@/lib/llm-client'
import { DIMENSIONS, DimensionKey } from './dimensions'
import { prisma } from '@/lib/prisma'

export interface ExtractionResult {
  dimension: string
  formation: number  // 0-4
  position: number   // -2 to +2
  importance: number // 0-3
  reasoning: string
}

const SYSTEM_PROMPT = `You analyze responses to relationship questions and extract psychological dimension scores.

For each dimension, score:
- formation: 0-4 (0=skipped/empty, 1=minimal/vague, 2=partial, 3=clear perspective, 4=highly nuanced with examples)
- position: -2 to +2 (where on the spectrum, 0 if unclear)
- importance: 0-3 (how much this seems to matter to them based on emphasis, emotion words, detail)

Return ONLY a JSON array, no other text. Example:
[{"dimension":"energy","formation":3,"position":1,"importance":2,"reasoning":"Shows preference for active lifestyle"}]`

/**
 * Extract dimension scores from a free-text answer
 */
export async function extractDimensionScores(
  question: string,
  answer: string,
  dimensions: DimensionKey[]
): Promise<ExtractionResult[]> {
  // Handle empty/short answers
  if (!answer || answer.trim().length < 3) {
    return dimensions.map(d => ({
      dimension: d,
      formation: 0,
      position: 0,
      importance: 0,
      reasoning: 'No meaningful answer provided'
    }))
  }

  const dimensionSpecs = dimensions.map(d => {
    const dim = DIMENSIONS[d]
    if ('spectrum' in dim) {
      return `- ${d}: ${dim.spectrum}`
    }
    if ('options' in dim) {
      return `- ${d}: Options: ${dim.options.join(', ')}`
    }
    return `- ${d}`
  }).join('\n')

  const userPrompt = `Question: "${question}"
Answer: "${answer}"

Dimensions to score:
${dimensionSpecs}

Return JSON array with scores for each dimension.`

  try {
    const response = await generateWithSystem(SYSTEM_PROMPT, userPrompt, {
      temperature: 0.3, // Lower temperature for more consistent scoring
      max_tokens: 500,
    })

    return parseExtractionResponse(response, dimensions)
  } catch (error) {
    console.error('[extract-score] LLM error:', error)
    // Return zero scores on error
    return dimensions.map(d => ({
      dimension: d,
      formation: 0,
      position: 0,
      importance: 0,
      reasoning: 'Extraction failed'
    }))
  }
}

/**
 * Parse LLM response into ExtractionResult array
 */
function parseExtractionResponse(
  response: string,
  dimensions: DimensionKey[]
): ExtractionResult[] {
  try {
    // Try to extract JSON from response (in case LLM added extra text)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExtractionResult[]

    // Validate and clamp values
    return parsed.map(result => ({
      dimension: result.dimension,
      formation: clamp(Math.round(result.formation), 0, 4),
      position: clamp(result.position, -2, 2),
      importance: clamp(Math.round(result.importance), 0, 3),
      reasoning: result.reasoning || ''
    }))
  } catch (error) {
    console.error('[extract-score] Parse error:', error, 'Response:', response)
    // Return zero scores on parse error
    return dimensions.map(d => ({
      dimension: d,
      formation: 0,
      position: 0,
      importance: 0,
      reasoning: 'Parse failed'
    }))
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Save extracted scores to database
 */
export async function saveScores(
  userId: string,
  scores: ExtractionResult[],
  rawAnswer: string
): Promise<void> {
  const operations = scores.map(score =>
    prisma.profileDimension.upsert({
      where: {
        userId_dimension: {
          userId,
          dimension: score.dimension
        }
      },
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
  )

  await Promise.all(operations)
}

/**
 * Extract and save scores in one operation
 */
export async function extractAndSaveScores(
  userId: string,
  question: string,
  answer: string,
  dimensions: DimensionKey[]
): Promise<ExtractionResult[]> {
  const scores = await extractDimensionScores(question, answer, dimensions)

  // Only save if we got meaningful scores
  const hasScores = scores.some(s => s.formation > 0)
  if (hasScores) {
    await saveScores(userId, scores, answer)
  }

  return scores
}
