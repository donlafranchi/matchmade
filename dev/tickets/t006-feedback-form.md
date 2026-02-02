# T006 - Post-Date Feedback Form

## Goal
Build a simple feedback form for after dates/meetings.

## Acceptance Criteria
- [ ] 3-question feedback form
- [ ] Accessible via link (e.g., /feedback/[matchId])
- [ ] Saves response to FeedbackResponse table
- [ ] Optional notes field
- [ ] Gentle, non-judgmental tone

## Constraints
- Keep it quick (< 30 seconds to complete)
- Frame positively, not as rating the person
- Anonymous aggregation later (not this ticket)

## Plan
1. Create feedback page at app/feedback/[matchId]/page.tsx
2. Create FeedbackForm component
3. Create API endpoint to save feedback
4. Add success confirmation

## Questions

```typescript
const FEEDBACK_QUESTIONS = [
  {
    id: 'ease',
    question: "How did it feel to spend time with them?",
    options: [
      { value: 4, label: "Easy and natural" },
      { value: 3, label: "Good but took some warming up" },
      { value: 2, label: "A bit awkward" },
      { value: 1, label: "Not a fit" }
    ]
  },
  {
    id: 'notes',
    question: "Anything stand out?",
    type: 'text',
    optional: true,
    placeholder: "Optional - anything you noticed..."
  },
  {
    id: 'seeAgain',
    question: "Would you see them again?",
    options: [
      { value: 3, label: "Definitely" },
      { value: 2, label: "Maybe" },
      { value: 1, label: "Probably not" }
    ]
  }
]
```

## UI

```
┌─────────────────────────────────────┐
│                                     │
│  How did it go?                     │
│                                     │
│  How did it feel to spend time      │
│  with them?                         │
│                                     │
│  ○ Easy and natural                 │
│  ○ Good but took some warming up    │
│  ○ A bit awkward                    │
│  ○ Not a fit                        │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Anything stand out? (optional)     │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Would you see them again?          │
│                                     │
│  ○ Definitely                       │
│  ○ Maybe                            │
│  ○ Probably not                     │
│                                     │
│           [ Submit ]                │
│                                     │
└─────────────────────────────────────┘
```

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Form loads for valid matchId
- [ ] All required fields must be filled
- [ ] Saves to FeedbackResponse table
- [ ] Shows confirmation on submit
- [ ] Works on mobile

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
