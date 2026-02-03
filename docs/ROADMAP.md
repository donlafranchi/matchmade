# ROADMAP.md

> PM-owned. Agents read-only.

## Current Phase: Match Pool & Attraction

---

## Technical Infrastructure

Foundation work that enables features.

### Auth & User Management
- [x] OAuth (Google sign-in)
- [x] Session management
- [x] User model with profiles

### Database & Schema
- [x] PostgreSQL + Prisma setup
- [x] Podman containerization
- [x] Profile dimensions model (T001)
- [x] Feedback response model

### AI/LLM Integration
- [x] Multi-provider LLM client (Anthropic + Ollama)
- [x] Chat agent with adaptive persona
- [x] Profile extraction agent
- [ ] Agent-facilitated coordination (for Crush Notes)

### Deployment
- [x] Local dev environment
- [ ] VPS setup with vLLM (self-hosted inference)
- [ ] Vercel deployment
- [ ] Production database

---

## Feature Phases

### Phase 1: Living Profile (Complete)
Agent-based onboarding that learns who you are.

- [x] Conversational chat interface
- [x] AI agent extracts values/lifestyle/interests
- [x] Profile extraction runs automatically
- [x] Profile shell UI shows what we're learning
- [x] Dimension scoring system (T002)
- [x] LLM-based score extraction (T003)
- [x] Onboarding questions UI (T005)
- [x] Experience-based question routing

### Phase 2: Match Pool & Attraction (Current)
Show compatible people, enable photo-based attraction.

- [ ] Photo upload and management
- [ ] Match pool calculation (T004 compatibility + mutual attraction)
- [ ] Match pool UI (photos + compatibility indicators)
- [ ] Two-stage filter: character match → attraction check
- [ ] "Who's interested in you" indicators

### Phase 3: Interaction Flow
The Nudge → Wink → Crush Note → Accept flow.

- [ ] Nudge action (signal openness)
- [ ] Wink action (acknowledge interest)
- [ ] Crush Note creation (activity, timing, location)
- [ ] Counter/Decline/Accept responses
- [ ] Decline limits (two playful declines → ball in her court)
- [ ] LGBTQ+ preference settings (initiate/be approached/either)

### Phase 4: Meeting Coordination
Agent-facilitated logistics to get people meeting IRL.

- [ ] Ice breaker generation (from agent conversations)
- [ ] Agent notifications ("Someone's interested...")
- [ ] Meetup confirmation flow
- [ ] Day-of reminders

### Phase 5: Group Events
Lower-stakes way to meet multiple people.

- [ ] Event browsing (local events)
- [ ] RSVP system
- [ ] Show compatible attendees (from match pool)
- [ ] Event-day ice breakers
- [ ] Post-event feedback flow
- [ ] User-generated events

### Phase 6: Reputation & Trust
Accountability for real-world behavior.

- [x] Basic feedback form (T006)
- [ ] Show-up rate tracking
- [ ] No-show timeout system
- [ ] Profile accuracy feedback
- [ ] Response-to-invite ratio
- [ ] Reputation-based queue priority
- [ ] Flag system with community review

---

## Future / Icebox

Features to explore after core flow is solid.

### Bump Chemistry
- [ ] QR code flow (vet someone you met IRL)
- [ ] Abbreviated agent conversation
- [ ] Compatibility display
- [ ] NFC tap (both have app)

### Tribe Discovery
- [ ] Daily/weekly cultural prompts
- [ ] See who responds similarly
- [ ] Shared wavelength matching

### Re-Engagement
- [ ] Send cards in-app
- [ ] "Take this quiz together"
- [ ] Keep connections warm

### Hidden Depth
- [ ] Friends-only mode
- [ ] Travel mode (meet locals)
- [ ] Wildcard events
- [ ] Reputation unlocks
- [ ] Easter eggs

### Fast Track (Monetization)
- [ ] Pay to skip nudge requirement
- [ ] Pay for more match pool visibility
- [ ] Design work needed to avoid undermining character-first philosophy

---

## Rollout Strategy

**Minimum viable density:** ~1,000 users per market

Launch approach:
1. Waitlist building anticipation (in progress)
2. City-by-city launches
3. Women-first invites (create scarcity)
4. Event partnerships to bootstrap meetups
5. Bump Chemistry as standalone viral feature

---
*Last updated: 2026-02-02*
