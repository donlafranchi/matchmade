"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { QuestionCard } from "@/app/components/QuestionCard"
import {
  EXPERIENCE_QUESTION,
  getQuestionsForTrack,
  Question,
  ExperienceLevel,
} from "@/lib/matching/questions"

type Answer = {
  questionId: string
  value: string
}

export default function OnboardingQuestionsPage() {
  const router = useRouter()
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentValue, setCurrentValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Set questions once experience level is known
  useEffect(() => {
    if (experienceLevel) {
      setQuestions(getQuestionsForTrack(experienceLevel))
    }
  }, [experienceLevel])

  const totalQuestions = experienceLevel ? questions.length + 1 : 1
  const currentQuestionNumber = experienceLevel ? currentIndex + 2 : 1

  const currentQuestion = experienceLevel === null
    ? EXPERIENCE_QUESTION
    : questions[currentIndex]

  const handleSubmit = async () => {
    if (!currentValue.trim() && currentQuestion.type !== "choice") return

    setIsSubmitting(true)

    try {
      // Save the answer
      const answer: Answer = {
        questionId: currentQuestion.id,
        value: currentValue,
      }

      // For experience question, also save to user profile
      if (currentQuestion.id === "experience") {
        await fetch("/api/onboarding/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ experienceLevel: currentValue }),
        })
        setExperienceLevel(currentValue as ExperienceLevel)
        setCurrentValue("")
        setIsSubmitting(false)
        return
      }

      // Save answer and extract scores
      await fetch("/api/onboarding/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: currentValue,
          dimensions: currentQuestion.dimensions,
          questionType: currentQuestion.questionType,
        }),
      })

      setAnswers([...answers, answer])
      setCurrentValue("")

      // Move to next question or finish
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Done - create context and redirect to photos
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contexts: ["romantic"] }),
        })
        router.push("/onboarding/photos")
      }
    } catch (error) {
      console.error("Error saving answer:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    setIsSubmitting(true)

    try {
      if (currentQuestion.id === "experience") {
        // Default to 'learning' if skipped
        await fetch("/api/onboarding/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ experienceLevel: "learning" }),
        })
        setExperienceLevel("learning")
        setCurrentValue("")
        setIsSubmitting(false)
        return
      }

      // Move to next question
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1)
      } else {
        // Done - redirect to photos
        await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contexts: ["romantic"] }),
        })
        router.push("/onboarding/photos")
      }
    } finally {
      setIsSubmitting(false)
      setCurrentValue("")
    }
  }

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-zinc-500">
            <span>Question {currentQuestionNumber} of {totalQuestions}</span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-200">
            <div
              className="h-1 rounded-full bg-black transition-all duration-300"
              style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <QuestionCard
            question={currentQuestion}
            value={currentValue}
            onChange={setCurrentValue}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-zinc-500">
          Your answers help us find better matches for you.
        </p>
      </main>
    </div>
  )
}
