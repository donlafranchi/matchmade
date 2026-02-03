// Extract dimension scores from answers using LLM or direct mapping
// See design/experiential-profiling.md for scoring model

import { generateWithSystem } from '@/lib/llm-client'
import { DIMENSIONS, DimensionKey } from './dimensions'
import { prisma } from '@/lib/prisma'

export type QuestionType = 'scenario' | 'reflective' | 'direct_choice'

export interface ExtractionResult {
  dimension: string
  formation: number  // 0-4
  position: number   // -2 to +2
  importance: number // 0-3
  reasoning: string
}

// System prompts for different question types
const REFLECTIVE_PROMPT = `You analyze responses to relationship questions and extract psychological dimension scores.

For each dimension, score:
- formation: 0-4 (0=skipped/empty, 1=minimal/vague, 2=partial, 3=clear perspective, 4=highly nuanced with examples)
- position: -2 to +2 (where on the spectrum, 0 if unclear)
- importance: 0-3 (how much this seems to matter to them based on emphasis, emotion words, detail)

Return ONLY a JSON array, no other text. Example:
[{"dimension":"energy","formation":3,"position":1,"importance":2,"reasoning":"Shows preference for active lifestyle"}]`

const SCENARIO_PROMPT = `You analyze responses to scenario-based dating questions. These are concrete situations, not abstract reflections.

The user was given a scenario and asked how they'd feel or react. Extract what this reveals about them.

For each dimension, score:
- formation: 0-4 (0=skipped, 1=one word, 2=brief response, 3=clear reaction, 4=detailed with reasoning)
- position: -2 to +2 (where on the spectrum based on their reaction)
- importance: 0-3 (inferred from strength of reaction, emotion words)

Return ONLY a JSON array, no other text. Example:
[{"dimension":"spontaneity","formation":2,"position":-1,"importance":2,"reasoning":"Expressed annoyance at plan changes"}]`

/**
 * Extract dimension scores from a free-text answer
 */
export async function extractDimensionScores(
  question: string,
  answer: string,
  dimensions: DimensionKey[],
  questionType: QuestionType = 'reflective'
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

  // Direct choice answers don't need LLM
  if (questionType === 'direct_choice') {
    return dimensions.map(d => ({
      dimension: d,
      formation: 2, // Direct choices are "partial" formation
      position: 0,  // Will be overwritten by mapDirectChoice
      importance: 1, // Default importance for direct choices
      reasoning: 'Direct choice answer'
    }))
  }

  const systemPrompt = questionType === 'scenario' ? SCENARIO_PROMPT : REFLECTIVE_PROMPT

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
    const response = await generateWithSystem(systemPrompt, userPrompt, {
      temperature: 0.3,
      max_tokens: 500,
    })

    return parseExtractionResponse(response, dimensions)
  } catch (error) {
    console.error('[extract-score] LLM error:', error)
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
 * Map a direct choice answer to dimension scores (no LLM needed)
 */
export function mapDirectChoice(
  dimension: DimensionKey,
  choiceValue: string | number,
  choiceMapping: Record<string | number, { position: number; importance?: number }>
): ExtractionResult {
  const mapping = choiceMapping[choiceValue]

  if (!mapping) {
    return {
      dimension,
      formation: 0,
      position: 0,
      importance: 0,
      reasoning: `Unknown choice: ${choiceValue}`
    }
  }

  return {
    dimension,
    formation: 2, // Direct choices = partial formation
    position: clamp(mapping.position, -2, 2),
    importance: mapping.importance ?? 1,
    reasoning: `Direct choice: ${choiceValue}`
  }
}

/**
 * Common mappings for standard questions
 */
export const CHOICE_MAPPINGS = {
  // "After a long week, do you want company or alone time?"
  socialEnergy: {
    'company': { position: 2, importance: 2 },
    'depends': { position: 0, importance: 1 },
    'alone': { position: -2, importance: 2 },
  },

  // "Plans change last minute - relieved or annoyed?"
  spontaneity: {
    'relieved': { position: 2, importance: 2 },
    'depends': { position: 0, importance: 1 },
    'annoyed': { position: -2, importance: 2 },
  },

  // Experience level
  experienceLevel: {
    'new': { position: -2 },
    'learning': { position: 0 },
    'experienced': { position: 2 },
  },

  // Intent
  intent: {
    'casual': { position: -2, importance: 2 },
    'figuring_it_out': { position: -1, importance: 1 },
    'open': { position: 0, importance: 1 },
    'serious': { position: 1, importance: 2 },
    'marriage_track': { position: 2, importance: 3 },
  },

  // Children
  children: {
    'no': { position: -2, importance: 3 },
    'open': { position: 0, importance: 1 },
    'want': { position: 2, importance: 3 },
    'have_kids': { position: 1, importance: 2 },
  },
} as const

/**
 * Parse LLM response into ExtractionResult array
 */
function parseExtractionResponse(
  response: string,
  dimensions: DimensionKey[]
): ExtractionResult[] {
  try {
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No JSON array found in response')
    }

    const parsed = JSON.parse(jsonMatch[0]) as ExtractionResult[]

    return parsed.map(result => ({
      dimension: result.dimension,
      formation: clamp(Math.round(result.formation), 0, 4),
      position: clamp(result.position, -2, 2),
      importance: clamp(Math.round(result.importance), 0, 3),
      reasoning: result.reasoning || ''
    }))
  } catch (error) {
    console.error('[extract-score] Parse error:', error, 'Response:', response)
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
  rawAnswer: string,
  questionType: QuestionType = 'reflective'
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
        rawAnswer,
        questionType
      },
      update: {
        formation: score.formation,
        position: score.position,
        importance: score.importance,
        rawAnswer,
        questionType
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
  dimensions: DimensionKey[],
  questionType: QuestionType = 'reflective'
): Promise<ExtractionResult[]> {
  const scores = await extractDimensionScores(question, answer, dimensions, questionType)

  const hasScores = scores.some(s => s.formation > 0)
  if (hasScores) {
    await saveScores(userId, scores, answer, questionType)
  }

  return scores
}

/**
 * Save a direct choice answer (no LLM extraction)
 */
export async function saveDirectChoice(
  userId: string,
  dimension: DimensionKey,
  choiceValue: string | number,
  choiceMapping: Record<string | number, { position: number; importance?: number }>,
  rawAnswer?: string
): Promise<ExtractionResult> {
  const result = mapDirectChoice(dimension, choiceValue, choiceMapping)

  await prisma.profileDimension.upsert({
    where: {
      userId_dimension: {
        userId,
        dimension
      }
    },
    create: {
      userId,
      dimension,
      formation: result.formation,
      position: result.position,
      importance: result.importance,
      rawAnswer: rawAnswer ?? String(choiceValue),
      questionType: 'direct_choice'
    },
    update: {
      formation: result.formation,
      position: result.position,
      importance: result.importance,
      rawAnswer: rawAnswer ?? String(choiceValue),
      questionType: 'direct_choice'
    }
  })

  return result
}
