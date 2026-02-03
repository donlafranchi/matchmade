# T008 - Match Pool Display

## Goal
Show users their compatible matches as a **match pool** — people they *could* meet, not individual "matches."

## Context (from PRODUCT.md)

Users don't get "matched." They see a match pool of compatible people.

**What users see:**
- Photos of compatible people
- Compatibility indicators (not detailed profiles)
- Events those people are interested in

**What users DON'T see:**
- Detailed profiles to browse
- Chat history
- Compatibility percentages

Information scarcity forces genuine discovery in person.

## Acceptance Criteria

### Phase 1: Basic Pool Display
- [ ] Match pool page showing compatible users
- [ ] User cards with photo + minimal info
- [ ] Compatibility indicator (visual, not percentage)
- [ ] Filter by basic criteria (location, age range)
- [ ] Empty state for sparse pools

### Phase 2: Interaction Hooks (prep for T008)
- [ ] "Interested" action on user cards (becomes Nudge in T008)
- [ ] Show mutual interest indicator
- [ ] Track who user has expressed interest in

## How It Works

1. **Compatibility calculation** runs (T004 already built)
2. **Two-stage filter:**
   - Character/values/lifestyle match (compatibility score threshold)
   - Mutual attraction (both need to express interest in photos)
3. **Pool display:**
   - Grid/stack of user photo cards
   - Subtle compatibility indicators (vibes, not numbers)
   - Events they're interested in (Phase 5 feature, placeholder for now)

## UI Components

### Match Pool Page (`/pool` or `/matches`)
- Header: "People you could meet"
- Grid of user cards
- Pull-to-refresh or auto-refresh

### User Card
- Primary photo (square or 3:4)
- First name, age
- Compatibility indicator (icon/color, not score)
- Location (neighborhood or distance)
- "Interested" button

### Compatibility Indicator Options
- Color gradient (warm = high compatibility)
- Simple icons (✨ = strong match)
- Text hints ("Similar energy", "Complementary styles")
- **NOT:** Percentages or detailed breakdowns

### Empty States
- No matches yet: "We're still learning about you..."
- Sparse pool: "Fewer matches in your area — expand your radius?"
- All viewed: "You've seen everyone. Check back soon."

## Constraints

- No direct messaging — this leads to Crush Notes (Phase 3)
- No detailed profiles — info scarcity is intentional
- No compatibility percentages — keep it mysterious
- Photos must exist before appearing in pool
- Respect dealbreakers as hard filters (already in T004)

## Dependencies

- T004 Compatibility Calculation (done)
- T007 Photo Upload (needed before this)

## Plan

1. Create `/pool` page route
2. Build match pool query (users with compatibility score > threshold)
3. Create UserCard component
4. Implement "Interested" action (store in DB)
5. Add mutual interest detection
6. Style with compatibility indicators
7. Handle empty/sparse states

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Pool shows only users above compatibility threshold
- [ ] Dealbreakers filter out incompatible users
- [ ] No percentage scores visible to users
- [ ] "Interested" action persists correctly
- [ ] Mutual interest is detected
- [ ] Empty states display appropriately
- [ ] Photos required before user appears in pool

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
