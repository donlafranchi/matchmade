"use client"

import { Question } from "@/lib/matching/questions"

interface QuestionCardProps {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onSkip: () => void
  isSubmitting?: boolean
}

export function QuestionCard({
  question,
  value,
  onChange,
  onSubmit,
  onSkip,
  isSubmitting = false,
}: QuestionCardProps) {
  const isChoice = question.type === "choice" && question.options

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-medium text-zinc-900">{question.question}</h2>

      {isChoice ? (
        <div className="space-y-3">
          {question.options!.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value)
                // Auto-submit after brief delay for choice questions
                setTimeout(onSubmit, 150)
              }}
              disabled={isSubmitting}
              className={`w-full rounded-xl border px-5 py-4 text-left text-[15px] transition ${
                value === option.value
                  ? "border-black bg-black text-white"
                  : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={question.placeholder}
            rows={4}
            disabled={isSubmitting}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-[15px] text-zinc-900 placeholder-zinc-400 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <button
            onClick={onSubmit}
            disabled={isSubmitting || !value.trim()}
            className="w-full rounded-xl bg-black px-5 py-4 text-[15px] text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </div>
      )}

      <button
        onClick={onSkip}
        disabled={isSubmitting}
        className="w-full text-center text-sm text-zinc-500 transition hover:text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Skip this question
      </button>
    </div>
  )
}
