import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth"
import { DimensionKey } from "@/lib/matching/dimensions"
import {
  extractAndSaveScores,
  saveDirectChoice,
  CHOICE_MAPPINGS,
  QuestionType,
} from "@/lib/matching/extract-score"

export async function POST(request: Request) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { questionId, answer, dimensions, questionType } = body as {
      questionId: string
      answer: string
      dimensions: DimensionKey[]
      questionType: QuestionType
    }

    if (!answer || !dimensions || dimensions.length === 0) {
      return NextResponse.json(
        { error: "Answer and dimensions required" },
        { status: 400 }
      )
    }

    // Handle direct choice questions
    if (questionType === "direct_choice") {
      // Map common question IDs to their choice mappings
      const mappingKey = getMappingKey(questionId, dimensions)

      if (mappingKey && mappingKey in CHOICE_MAPPINGS) {
        const mapping = CHOICE_MAPPINGS[mappingKey as keyof typeof CHOICE_MAPPINGS]
        for (const dimension of dimensions) {
          await saveDirectChoice(user.id, dimension, answer, mapping, answer)
        }
      }

      return NextResponse.json({ ok: true })
    }

    // For scenario and reflective questions, use LLM extraction
    const question = getQuestionText(questionId)
    await extractAndSaveScores(user.id, question, answer, dimensions, questionType)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error saving answer:", error)
    return NextResponse.json(
      { error: "Failed to save answer" },
      { status: 500 }
    )
  }
}

// Map question IDs to CHOICE_MAPPINGS keys
function getMappingKey(questionId: string, dimensions: DimensionKey[]): string | null {
  // Direct mapping for known questions
  const mappings: Record<string, string> = {
    social_energy: "socialEnergy",
    plans: "spontaneity",
    intent: "intent",
  }

  if (questionId in mappings) {
    return mappings[questionId]
  }

  // Fallback to first dimension if it exists in CHOICE_MAPPINGS
  if (dimensions[0] in CHOICE_MAPPINGS) {
    return dimensions[0]
  }

  return null
}

// Get the question text for LLM context
function getQuestionText(questionId: string): string {
  const questions: Record<string, string> = {
    fun: "What do you like doing for fun?",
    weekend: "What does your ideal weekend look like?",
    trust: "What does trust look like to you?",
    plans: "How do you feel when plans change last minute?",
    support: "What do you need when things get hard?",
  }

  return questions[questionId] || questionId
}
