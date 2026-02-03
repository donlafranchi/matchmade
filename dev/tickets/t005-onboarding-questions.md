# T005 - Onboarding Questions UI

## Goal
Build the 5-question onboarding flow with two tracks based on experience level.

## Acceptance Criteria
- [x] Experience level question first (determines track)
- [x] Track A (new): Scenario-based questions
- [x] Track B (experienced): Reflective questions
- [x] Choice questions render as buttons
- [x] Text questions have textarea with placeholder
- [x] Skip option for each question
- [x] Progress indicator
- [x] Saves after each question (no lost progress)
- [x] Extracts and saves dimension scores on submit

## Constraints
- Mobile-first design
- Keep it conversational, not form-like
- Use existing UI components where possible

## Plan
1. Define ONBOARDING_QUESTIONS constant with both tracks
2. Create QuestionCard component (handles choice + text)
3. Create onboarding questions page at /onboarding/questions
4. Wire up API to save answers and extract scores
5. Add progress indicator

## Questions (Two Tracks)

```typescript
// Shared first question - determines track
const EXPERIENCE_QUESTION = {
  id: 'experience',
  question: "How much dating experience do you have?",
  dimensions: ['experience'] as DimensionKey[],
  type: 'choice' as const,
  questionType: 'direct_choice' as QuestionType,
  options: [
    { value: 'new', label: "Pretty new to this" },
    { value: 'learning', label: "Some, but still figuring things out" },
    { value: 'experienced', label: "I know what I'm looking for" }
  ]
}

// Track A: New to dating (concrete scenarios)
const TRACK_A_QUESTIONS = [
  {
    id: 'fun',
    question: "What do you like doing for fun?",
    dimensions: ['energy', 'social'],
    questionType: 'scenario',
    placeholder: "Activities, hobbies, how you spend your time..."
  },
  {
    id: 'intent',
    question: "What are you looking for?",
    dimensions: ['intent'],
    type: 'choice',
    questionType: 'direct_choice',
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
    type: 'choice',
    questionType: 'direct_choice',
    options: [
      { value: 'company', label: "See people" },
      { value: 'depends', label: "Depends on the week" },
      { value: 'alone', label: "Be alone" }
    ]
  },
  {
    id: 'plans',
    question: "Plans change last minute — are you relieved or annoyed?",
    dimensions: ['spontaneity'],
    type: 'choice',
    questionType: 'direct_choice',
    options: [
      { value: 'relieved', label: "Relieved" },
      { value: 'depends', label: "Depends what changes" },
      { value: 'annoyed', label: "Annoyed" }
    ]
  }
]

// Track B: More experienced (reflective)
const TRACK_B_QUESTIONS = [
  {
    id: 'weekend',
    question: "What does your ideal weekend look like?",
    dimensions: ['energy', 'social'],
    questionType: 'reflective',
    placeholder: "What recharges you...",
    followUp: "Is there another way you'd describe how you spend your time?"
  },
  {
    id: 'intent',
    question: "What are you looking for right now?",
    dimensions: ['intent'],
    type: 'choice',
    questionType: 'direct_choice',
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
    placeholder: "How you know when you trust someone..."
  },
  {
    id: 'plans',
    question: "How do you feel when plans change last minute?",
    dimensions: ['spontaneity'],
    questionType: 'reflective',
    placeholder: "Your reaction to unexpected changes..."
  }
]
```

## UI Components

```tsx
// QuestionCard.tsx
interface QuestionCardProps {
  question: Question
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onSkip: () => void
}

// OnboardingQuestionsPage
- State: currentIndex, answers, experienceLevel
- First question determines track
- Progress bar showing 1/5, 2/5, etc.
- Next button saves and advances
- Skip link below
```

---

## Implementation Notes
- Experience question determines track (new/learning → Track A, experienced → Track B)
- Choice questions auto-submit after selection
- Text questions submit on button click or Enter key
- Direct choice answers use `CHOICE_MAPPINGS` from extract-score.ts (no LLM)
- Scenario/reflective answers use LLM extraction via `extractAndSaveScores`
- Original onboarding intro page redirects to `/onboarding/questions`

## Verification
- [ ] Can complete all 5 questions
- [ ] Answers are saved to database
- [ ] Dimension scores are extracted
- [ ] Skip works without error
- [ ] Progress shows correctly
- [ ] Works on mobile

## Completion

**Date:** 2026-02-02
**Summary:** Two-track onboarding questions UI with experience-based routing
**Files changed:**
- web/lib/matching/questions.ts (new)
- web/app/components/QuestionCard.tsx (new)
- web/app/onboarding/questions/page.tsx (new)
- web/app/api/onboarding/experience/route.ts (new)
- web/app/api/onboarding/answer/route.ts (new)
- web/app/onboarding/page.tsx (modified - redirects to questions)
**Notes:** Manual testing needed to verify full flow
