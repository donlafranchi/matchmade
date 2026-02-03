"use client"

import { useState } from "react"
import {
  GATE_QUESTION,
  FEEDBACK_QUESTIONS,
  FeedbackQuestion,
  FeedbackAnswers,
} from "@/lib/feedback/questions"

interface FeedbackFormProps {
  matchId: string
  toUserId: string
  onComplete: () => void
  onDecline: (reason: 'later' | 'no') => void
}

export function FeedbackForm({
  matchId,
  toUserId,
  onComplete,
  onDecline,
}: FeedbackFormProps) {
  const [stage, setStage] = useState<'gate' | 'questions' | 'submitting' | 'done'>('gate')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  // All questions are now unconditional
  const visibleQuestions = FEEDBACK_QUESTIONS

  const currentQuestion = visibleQuestions[currentIndex]
  const isLastQuestion = currentIndex >= visibleQuestions.length - 1

  const handleGateAnswer = (value: string) => {
    if (value === 'yes') {
      setStage('questions')
    } else {
      onDecline(value as 'later' | 'no')
    }
  }

  const handleAnswer = async (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value }
    setAnswers(newAnswers)

    // For choice questions, auto-advance
    if (currentQuestion.type === 'choice') {
      if (isLastQuestion) {
        await submitFeedback(newAnswers)
      } else {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  const handleTextSubmit = async () => {
    if (isLastQuestion) {
      await submitFeedback(answers)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSkip = async () => {
    if (isLastQuestion) {
      await submitFeedback(answers)
    } else {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const submitFeedback = async (finalAnswers: Record<string, string>) => {
    setStage('submitting')
    setError(null)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          toUserId,
          ...finalAnswers,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      setStage('done')
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStage('questions')
    }
  }

  // Gate stage
  if (stage === 'gate') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-zinc-900">{GATE_QUESTION.question}</h2>
        <div className="space-y-3">
          {GATE_QUESTION.options!.map((option) => (
            <button
              key={option.value}
              onClick={() => handleGateAnswer(option.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-5 py-4 text-left text-[15px] text-zinc-900 transition hover:border-zinc-300 hover:bg-zinc-50"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Submitting stage
  if (stage === 'submitting') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-500">Saving...</div>
      </div>
    )
  }

  // Done stage
  if (stage === 'done') {
    return (
      <div className="space-y-4 text-center py-8">
        <h2 className="text-xl font-medium text-zinc-900">Thanks for the feedback</h2>
        <p className="text-zinc-500">This helps us improve matching and keep everyone safe.</p>
      </div>
    )
  }

  // Questions stage
  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-sm text-zinc-500">
          <span>Question {currentIndex + 1} of {visibleQuestions.length}</span>
        </div>
        <div className="h-1 w-full rounded-full bg-zinc-200">
          <div
            className="h-1 rounded-full bg-black transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / visibleQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h2 className="text-xl font-medium text-zinc-900">{currentQuestion.question}</h2>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {currentQuestion.type === 'choice' ? (
        <div className="space-y-3">
          {currentQuestion.options!.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(option.value)}
              className={`w-full rounded-xl border px-5 py-4 text-left text-[15px] transition ${
                answers[currentQuestion.id] === option.value
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
            placeholder={currentQuestion.placeholder}
            rows={3}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
          />
          <div className="flex gap-3">
            <button
              onClick={handleTextSubmit}
              disabled={!currentQuestion.optional && !answers[currentQuestion.id]?.trim()}
              className="flex-1 rounded-xl bg-black px-5 py-3 text-[15px] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastQuestion ? "Submit" : "Continue"}
            </button>
            {currentQuestion.optional && (
              <button
                onClick={handleSkip}
                className="rounded-xl border border-zinc-200 px-5 py-3 text-[15px] text-zinc-600 transition hover:bg-zinc-50"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
