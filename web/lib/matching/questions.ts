// Onboarding questions with two tracks based on experience level
// See design/experiential-profiling.md for rationale

import { DimensionKey } from './dimensions'
import { QuestionType } from './extract-score'

export interface QuestionOption {
  value: string
  label: string
}

export interface Question {
  id: string
  question: string
  dimensions: DimensionKey[]
  questionType: QuestionType
  type?: 'choice' | 'text'
  options?: QuestionOption[]
  placeholder?: string
  followUp?: string
}

// First question determines which track to use
export const EXPERIENCE_QUESTION: Question = {
  id: 'experience',
  question: "How much dating experience do you have?",
  dimensions: ['social'], // placeholder dimension, we store experienceLevel on User
  questionType: 'direct_choice',
  type: 'choice',
  options: [
    { value: 'new', label: "Pretty new to this" },
    { value: 'learning', label: "Some, but still figuring things out" },
    { value: 'experienced', label: "I know what I'm looking for" }
  ]
}

// Track A: New to dating - concrete scenarios, simple choices
export const TRACK_A_QUESTIONS: Question[] = [
  {
    id: 'fun',
    question: "What do you like doing for fun?",
    dimensions: ['energy', 'social'],
    questionType: 'scenario',
    type: 'text',
    placeholder: "Activities, hobbies, how you spend your time..."
  },
  {
    id: 'intent',
    question: "What are you looking for?",
    dimensions: ['intent'],
    questionType: 'direct_choice',
    type: 'choice',
    options: [
      { value: 'casual', label: "Something casual" },
      { value: 'open', label: "Open to whatever happens" },
      { value: 'serious', label: "Something serious" },
      { value: 'figuring_it_out', label: "Still figuring it out" }
    ]
  },
  {
    id: 'social_energy',
    question: "After a long week, do you want to see people or be alone?",
    dimensions: ['social'],
    questionType: 'direct_choice',
    type: 'choice',
    options: [
      { value: 'company', label: "See people" },
      { value: 'depends', label: "Depends on the week" },
      { value: 'alone', label: "Be alone" }
    ]
  },
  {
    id: 'plans',
    question: "Plans change last minute — relieved or annoyed?",
    dimensions: ['spontaneity'],
    questionType: 'direct_choice',
    type: 'choice',
    options: [
      { value: 'relieved', label: "Relieved" },
      { value: 'depends', label: "Depends what changes" },
      { value: 'annoyed', label: "Annoyed" }
    ]
  }
]

// Track B: More experienced - reflective questions
export const TRACK_B_QUESTIONS: Question[] = [
  {
    id: 'weekend',
    question: "What does your ideal weekend look like?",
    dimensions: ['energy', 'social'],
    questionType: 'reflective',
    type: 'text',
    placeholder: "What recharges you...",
    followUp: "Is there another way you'd describe how you spend your time?"
  },
  {
    id: 'intent',
    question: "What are you looking for right now?",
    dimensions: ['intent'],
    questionType: 'direct_choice',
    type: 'choice',
    options: [
      { value: 'casual', label: "Something casual" },
      { value: 'open', label: "Open to something serious" },
      { value: 'serious', label: "Looking for a relationship" },
      { value: 'marriage_track', label: "Want to find my person" }
    ]
  },
  {
    id: 'trust',
    question: "What does trust look like to you?",
    dimensions: ['trust'],
    questionType: 'reflective',
    type: 'text',
    placeholder: "How you know when you trust someone..."
  },
  {
    id: 'plans',
    question: "How do you feel when plans change last minute?",
    dimensions: ['spontaneity'],
    questionType: 'reflective',
    type: 'text',
    placeholder: "Your reaction to unexpected changes..."
  }
]

export type ExperienceLevel = 'new' | 'learning' | 'experienced'

export function getQuestionsForTrack(experienceLevel: ExperienceLevel): Question[] {
  // 'new' and 'learning' use Track A (scenarios)
  // 'experienced' uses Track B (reflective)
  return experienceLevel === 'experienced' ? TRACK_B_QUESTIONS : TRACK_A_QUESTIONS
}
