# MVP Acceptance Criteria

**Status:** Checklist for launch readiness

---

## Core User Flows

- [ ] New user can sign up, pick context, chat, see derived profile preview
- [ ] User can upload photos and enter attraction mode
- [ ] Two aligned users with mutual attraction become a match
- [ ] "No matches yet" state shows when empty (no fake padding)
- [ ] Matched users can coordinate via quick plan
- [ ] Matched users can mark interest in events
- [ ] Both users notified when both interested in same event

---

## Privacy & Trust

- [ ] Off-the-record message is NOT stored and cannot be retrieved
- [ ] "Forget last message" removes stored content + zeroes derived fields
- [ ] Sensitive disclosures are not persisted in raw form
- [ ] User can delete their account and all associated data

---

## Quality Bars

- [ ] Profile view loads in < 2 seconds
- [ ] Chat responses feel natural (< 3 second latency)
- [ ] No fake matches or inflated availability
- [ ] Clear error states when things fail

---

## Platform Requirements

- [ ] Works on mobile Safari (iOS)
- [ ] Works on mobile Chrome (Android)
- [ ] Works on desktop browsers
- [ ] Magic link auth works reliably

---

## What's NOT Required for MVP

- Premium tiers
- Advanced matching algorithms
- Event creation (can use seeded events)
- Full therapeutic interpretation (can use simpler extraction)
- Multiple relationship contexts simultaneously
- Push notifications (email is fine)

---

*Update this checklist as features are completed. Move to done/ when all boxes are checked.*
