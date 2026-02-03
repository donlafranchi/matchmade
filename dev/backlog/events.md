# Group Events System

## Goal
Facilitate in-person meetings through group events — the **primary meeting mode** that's lower stakes than 1:1 dates.

## Context (from PRODUCT.md)

### Group Events (Primary Meeting Mode)

Users browse local events:
- Trivia nights, hiking groups, art shows, concerts, markets

**What they see:**
- Event details
- Photos of people from their match pool who are interested
- No commitment to any single person

**Flow:**
1. RSVP to event
2. Day of: receive ice breaker
3. Meet multiple people in one outing
4. Natural filtering happens in person
5. Post-event: feedback, option to connect further

**Why it works:**
- Lower stakes than a date
- Multiple connections per outing
- Activity provides conversation starter
- Can still nudge/wink within the group context

### User-Generated Events

Users create their own meetups:
- Must be public venues
- Visible to match pool
- Solves "no good events nearby" problem

## Acceptance Criteria

### Phase 1: Event Browsing
- [ ] Event listing page
- [ ] Event details (time, place, activity type)
- [ ] RSVP functionality
- [ ] Show compatible attendees from match pool (photos + compatibility indicator)

### Phase 2: Event Day
- [ ] Day-of notification with ice breakers for compatible attendees
- [ ] "Who's going" final list

### Phase 3: Post-Event
- [ ] Feedback collection (T006 integration)
- [ ] "Connect further" option for people you met
- [ ] Update reputation based on show-up rate

### Phase 4: User-Generated
- [ ] Create event form (public venues only)
- [ ] Visibility to match pool
- [ ] Host reputation tracking

## Constraints
- Events are primary, not required
- No commitment to any single attendee
- Group setting reduces pressure
- Public venues only for user-generated events

## Plan
1. Event and Venue schema
2. Event listing and details pages
3. RSVP API and UI
4. Compatible attendee display (from match pool)
5. Day-of ice breaker delivery
6. Post-event feedback flow
7. User-generated event creation

## Dependencies
- Photo upload system
- Match pool (T007)
- Compatibility scoring (T004)
- Ice breakers system
- Feedback system (T006)

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Events display with details
- [ ] RSVP works correctly
- [ ] Compatible attendees shown (not everyone, just from match pool)
- [ ] Day-of ice breakers delivered
- [ ] Post-event feedback captured
- [ ] User-generated events work

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
