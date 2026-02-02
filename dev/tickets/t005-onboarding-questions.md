# T005 - Onboarding Questions UI

## Goal
Build the 5-question onboarding flow with open-ended responses.

## Acceptance Criteria
- [ ] 5 core questions displayed one at a time
- [ ] Text area for open-ended responses
- [ ] "Describe it differently" option for alternative phrasing
- [ ] Skip option for each question
- [ ] Progress indicator
- [ ] Saves after each question (no lost progress)
- [ ] Extracts and saves dimension scores on submit

## Constraints
- Mobile-first design
- Keep it conversational, not form-like
- Use existing UI components where possible

## Plan
1. Define CORE_QUESTIONS constant
2. Create QuestionCard component
3. Create onboarding flow page
4. Wire up API to save answers and extract scores
5. Add progress indicator

## Questions

```typescript
const CORE_QUESTIONS = [
  {
    id: 'weekend',
    question: "What does your ideal weekend look like?",
    dimensions: ['energy', 'social'],
    followUp: "Is there another way you'd describe how you like to spend your time?",
    placeholder: "Describe what recharges you..."
  },
  {
    id: 'intent',
    question: "What are you looking for right now?",
    dimensions: ['intent'],
    type: 'choice',
    options: [
      { value: 'casual', label: "Something casual" },
      { value: 'open', label: "Open to something serious" },
      { value: 'serious', label: "Looking for a relationship" },
      { value: 'marriage_track', label: "Want to find my person" },
      { value: 'figuring_it_out', label: "Still figuring it out" }
    ]
  },
  {
    id: 'trust',
    question: "What does trust look like to you?",
    dimensions: ['trust'],
    followUp: "What does it feel like when trust is broken?",
    placeholder: "How do you know when you trust someone..."
  },
  {
    id: 'plans',
    question: "How do you feel when plans change last minute?",
    dimensions: ['spontaneity'],
    followUp: "Is that something you've always felt?",
    placeholder: "Describe how you handle unexpected changes..."
  },
  {
    id: 'support',
    question: "What do you need when things get hard?",
    dimensions: ['independence', 'conflict'],
    followUp: "What doesn't help, even when people mean well?",
    placeholder: "What kind of support works for you..."
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
  onSkip: () => void
  showAlternate: boolean
  onToggleAlternate: () => void
}

// OnboardingFlow.tsx
- State: currentIndex, answers
- Progress bar showing 1/5, 2/5, etc.
- Next button saves and advances
- Skip link below text area
- "Describe it differently" toggle
```

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Can complete all 5 questions
- [ ] Answers are saved to database
- [ ] Dimension scores are extracted
- [ ] Skip works without error
- [ ] Progress shows correctly
- [ ] Works on mobile

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
