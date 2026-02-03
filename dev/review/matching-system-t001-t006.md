# Review: Matching System (T001-T006)

**Implemented:** 2026-02-02

---

## Quick Start

```bash
cd web
npm run dev
```

Open http://localhost:3000

---

## What to Test

### 1. Onboarding Questions Flow

**URL:** http://localhost:3000/onboarding → redirects to /onboarding/questions

**Test the gate question:**
- [ ] First question asks about dating experience
- [ ] "Pretty new to this" → Track A (scenario questions)
- [ ] "I know what I'm looking for" → Track B (reflective questions)

**Test Track A (new users):**
- [ ] "What do you like doing for fun?" (text input)
- [ ] "What are you looking for?" (choice buttons)
- [ ] "After a long week..." (choice buttons)
- [ ] "Plans change last minute..." (choice buttons)

**Test Track B (experienced users):**
- [ ] "What does your ideal weekend look like?" (text input)
- [ ] "What are you looking for right now?" (choice buttons)
- [ ] "What does trust look like to you?" (text input)
- [ ] "How do you feel when plans change..." (text input)

**General:**
- [ ] Progress bar updates correctly
- [ ] Skip button works on each question
- [ ] Choice questions auto-advance after selection
- [ ] Text questions require Continue button
- [ ] Completes and redirects to /contexts/romantic

---

### 2. Score Extraction (Backend)

**Verify via database or debug endpoint:**
- [ ] ProfileDimension records created for answered questions
- [ ] `questionType` field set correctly (scenario/reflective/direct_choice)
- [ ] `formation`, `position`, `importance` populated
- [ ] Direct choice answers mapped without LLM (check logs)

**Check User record:**
- [ ] `experienceLevel` saved ('new'/'learning'/'experienced')

---

### 3. Feedback Form

**URL:** http://localhost:3000/feedback/test-match?to=test-user-id

**Test gate question:**
- [ ] "Got a minute?" appears first
- [ ] "Sure" → shows feedback questions
- [ ] "Not yet" → shows "No problem" message
- [ ] "No thanks" → shows "No problem" message

**Test feedback questions (after opting in):**
- [ ] "Should this person be removed?" (yes/no)
- [ ] "Were they who they appeared to be?" (3 options)
- [ ] "Would you want to see them again?" (3 options)
- [ ] Optional notes field
- [ ] Submit shows "Thanks for the feedback"

**Verify data:**
- [ ] FeedbackResponse record created
- [ ] `shouldRemove` boolean set correctly
- [ ] `profileAccuracy` and `seeAgain` saved

---

### 4. Compatibility Calculation (Backend)

**Not exposed in UI yet.** Test via code or REPL:

```typescript
import { calculateMatch } from '@/lib/matching/compatibility'

const result = await calculateMatch(userAId, userBId)
// Returns { compatible: true, lifestyle, values, overall, confidence }
// Or { compatible: false, reason: [...] }
```

**Test cases:**
- [ ] Two users with overlapping dimensions → compatible with scores
- [ ] User A has dealbreaker, B doesn't match → compatible: false
- [ ] Sparse profiles → lower confidence score
- [ ] Missing dealbreaker dimension → compatible: false

---

## Key Files

| Purpose | Location |
|---------|----------|
| Questions | `web/lib/matching/questions.ts` |
| Dimensions | `web/lib/matching/dimensions.ts` |
| Score Extraction | `web/lib/matching/extract-score.ts` |
| Compatibility | `web/lib/matching/compatibility.ts` |
| Feedback Questions | `web/lib/feedback/questions.ts` |
| Onboarding Page | `web/app/onboarding/questions/page.tsx` |
| Feedback Page | `web/app/feedback/[matchId]/page.tsx` |

---

## Schema Changes

**ProfileDimension** - stores dimension scores per user
- `formation` (0-4), `position` (-2 to +2), `importance` (0-3)
- `dealbreaker` boolean
- `questionType` ('scenario'/'reflective'/'direct_choice')

**FeedbackResponse** - post-date feedback
- `shouldRemove` boolean (safety flag)
- `profileAccuracy`, `seeAgain` strings

**User** - experience tracking
- `experienceLevel` ('new'/'learning'/'experienced')
- `experiencePreference` ('similar'/'any'/'more_experienced')

---

## Known Limitations

1. **Compatibility not surfaced in UI** — calculation exists but no match display yet
2. **Feedback requires manual URL** — no link from chat/match yet
3. **No moderation queue** — shouldRemove flags exist but no admin view
4. **No photo upload** — profile is text-only for now

---

## Sign-off

- [ ] Onboarding flow works end-to-end
- [ ] Data saved correctly to database
- [ ] Feedback form captures all fields
- [ ] Mobile responsive
