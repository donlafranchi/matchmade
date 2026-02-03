// Post-date feedback questions
// Purpose: Safety, profile honesty, match quality validation

export interface FeedbackOption {
  value: string
  label: string
}

export interface FeedbackQuestion {
  id: string
  question: string
  type?: 'choice' | 'text'
  options?: FeedbackOption[]
  optional?: boolean
  placeholder?: string
  conditional?: { field: string; notValue: string }
}

// Gate question - shown first, determines if user wants to provide feedback
export const GATE_QUESTION: FeedbackQuestion = {
  id: 'willProvide',
  question: "Quick feedback helps us improve matching and keep everyone safe. Got a minute?",
  type: 'choice',
  options: [
    { value: 'yes', label: "Sure" },
    { value: 'later', label: "Not yet" },
    { value: 'no', label: "No thanks" }
  ]
}

// Feedback questions - only shown if user opts in
export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  // 1. SAFETY (most important) - should this person be removed?
  {
    id: 'safety',
    question: "Should this person be removed from the app?",
    type: 'choice',
    options: [
      { value: 'no', label: "No" },
      { value: 'yes', label: "Yes, remove them" }
    ]
  },

  // 2. PROFILE HONESTY
  {
    id: 'profileAccuracy',
    question: "Were they who they appeared to be in their profile?",
    type: 'choice',
    options: [
      { value: 'accurate', label: "Yes, matched their profile" },
      { value: 'minor_diff', label: "Small differences" },
      { value: 'misleading', label: "Noticeably different" }
    ]
  },

  // 3. MATCH QUALITY (algorithm validation)
  {
    id: 'seeAgain',
    question: "Would you want to see them again?",
    type: 'choice',
    options: [
      { value: 'yes', label: "Yes" },
      { value: 'maybe', label: "Maybe" },
      { value: 'no', label: "No" }
    ]
  },
  {
    id: 'notes',
    question: "Anything else we should know?",
    type: 'text',
    optional: true,
    placeholder: "Optional..."
  }
]

export type FeedbackAnswers = {
  safety: string  // 'no' | 'yes' (should remove)
  profileAccuracy: string
  seeAgain: string
  notes?: string
}
