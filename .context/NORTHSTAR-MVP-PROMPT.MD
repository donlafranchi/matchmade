# Relationship Builder PWA — NORTH STAR MVP (v3)

## Mission
Build a relationship builder PWA that performs honest matchmaking (intent + values + lifestyle + tastes), gates attraction privately, and moves users into real-world interaction via events.

## Core Rules
- No bios. No swipe feeds. No engagement optimization.
- Users talk with a personal matchmaker (software-based), not with matches.
- Profiles are constructed by the system from conversation.
- Values/lifestyle/tastes first; attraction second.
- Honest scarcity: show “No matches right now” when true.
- Minimal messaging: coordination only.
- Sensitive disclosures support “off the record” and “forget” (no raw storage).

## Platform
PWA, mobile-first.
Stack: Next.js + TypeScript + Tailwind + Postgres + Prisma.
Auth: magic link.
Notifications: in-app + email fallback.

---

## MVP FLOWS

### 1) Auth + Relationship Context
- Sign up / sign in
- Select one or more contexts:
  romantic, friendship, professional, creative, service
- Select preferred interaction tone: light / balanced / serious

### 2) Matchmaker Chat (per context)
- Private chat with matchmaker (not other users)
- Controls:
  - “Keep it light / Go deeper”
  - “Off the record”
  - “Forget last message / Forget topic”
- Storage:
  - Normal messages stored
  - Off-the-record messages NEVER stored in raw form
- Agent asks one small question at a time only when needed

### 3) Derived Profile (agent-built)
Per-user-per-context DerivedProfile with:

A) Intent
- commitment_horizon: days | weeks | months | years
- availability_level: low | medium | high

B) Values & Beliefs
- values_top5 (weighted)
- politics_importance 0..1
- political_cluster_inferred (internal only)

C) Lifestyle
- sleep_window: early | flexible | late
- social_nights_per_week: low | medium | high
- activity_level: low | medium | high
- substance_context: none | social | frequent

D) Tastes & Preferences (long list, prioritized)
- likes[] and dislikes[] allowed to be long
- each item has: tag, strength (must/nice/avoid), importance
- system computes:
  - prioritized_must[]
  - prioritized_avoid[]
  - like_dislike_ratio (soft signal)

E) Interaction Style
- tone, pace, communication preference, conflict/repair style (derived)

Metadata:
- completeness_score
- missing_fields[]
- confidence_by_field

### 4) Profile Preview
- Human-readable summary
- Highlights: intent, values, lifestyle, favorite things, avoids
- CTA: “Improve matching” → returns to chat

### 5) Media Upload
- 3–6 photos required for romantic context
- Optional short video (5–10s)

### 6) Attraction Mode
- Photos-only cards
- Yes / No / Skip
- Rate limit: 20/day
- Persist AttractionVote

### 7) Matching Engine
Eligibility:
- same context
- location radius
- completeness threshold
- required media present

Scoring:
- values similarity
- lifestyle compatibility
- interaction style fit
- tastes/preferences:
  - heavy penalty if candidate hits prioritized_avoid
  - boosts for prioritized_must/nice overlap
- politics: importance × distance penalty

Surface match ONLY if:
- score >= threshold
- mutual attraction == Yes

Honest states:
- “No matches right now”
- “You’re close—answer 1–2 things”

### 8) Match Reveal + Coordination
- Understated reveal (“Worth meeting”)
- Capped chat OR quick-plan template
- Default guidance: public/group meet

### 9) Events
- Invited list only (no browsy feed)
- Seeded + small app-created events
- Match-linked suggestions:
  - show 1–3 events both likely enjoy
  - both mark “Interested” → notify
- RSVP: going / maybe / can’t

### 10) Feedback & Trust
- Post-meet private feedback:
  honesty, respect, intent alignment, safety
- Internal TrustAggregate only
- Repeated misrepresentation → soft limiting

---

## Acceptance
- New user chats → derived profile preview exists
- Long likes/dislikes prioritized correctly
- Like/dislike ratio computed
- No padded matches
- Off-the-record text not retrievable
- Match → event interest → mutual notification

Ship v1.
