# Matchmade Product Specification v2

**Version 2.0** - Incorporates therapeutic interpretation engine (Dec 2025)
**Previous versions**: See `.context/archive/v1/`

---

## Product Vision

An easier, more natural way to meet people you actually click with—skip the tedious work, find people based on compatible patterns, get back to real life where chemistry happens.

### What We're Building

A relationship builder (romantic + friendship) that uses conversational profiling with therapeutic interpretation. Users talk with a personal matchmaker system that listens, interprets, and represents them through psychological frameworks—not endless forms or swipes.

**Profiles are interpreted, not authored.** The system becomes "Here's what we're hearing from you"—a reflective mirror based on therapeutic frameworks (Gabor Maté, Esther Perel, Gottman, IFS, Attachment Theory).

### Success Metrics

- Users feeling deeply understood ("This really gets me")
- Fewer but better matches based on compatible patterns
- Less tedious work (no endless forms)
- Faster movement to real-world meetings
- Users needing the app less over time

---

## Core Principles

### 1. Chemistry Is Discovered, Not Predicted

The system doesn't promise chemistry. It creates conditions where chemistry has room to emerge. Meeting in person is where you find out if you actually click.

**Copy anchors:**
- "We don't promise chemistry. We promise honesty."
- "Not every good match becomes a spark. But sparks need the right conditions to exist."
- "Attraction matters. But it isn't static. And it isn't everything."

### 2. Conversational Profiling

Users share information naturally through chat—no rigid forms. The system listens and interprets patterns using therapeutic frameworks rather than forcing categorization.

### 3. Values Before Attraction

Alignment comes first, photos reveal later. One card/decision at a time. This reduces premature rejection and anti-vibe mismatches without removing attraction from the process.

### 4. Interface Gets Out of Your Way

Uncluttered, one clear action per screen. No infinite feeds, engagement optimization, or dopamine loops. The app helps you meet people, then gets out of the way.

### 5. Real About Limits

- "No matches yet" when there aren't any (no padding)
- "We're still looking" without urgency or consolation
- No overpromising language ("aligned", "worth exploring", "potential match")

### 6. Skip the Pen-Pal Phase

Coordination-focused messaging with message caps. Default CTA is meeting IRL (group/activity cues for friendship). Chemistry develops in person, not through endless texting.

---

## Platform & Stack

PWA, mobile-first. Next.js + TypeScript + Tailwind + Postgres + Prisma. Auth via magic link. In-app + email notifications.

**Future**: Native iOS/Android apps will share this unified product spec and dev operations at root level.

---

## Non-Negotiables

- One primary action per screen (no feeds)
- Values/intent alignment before attraction UI
- Attraction is private, fast, photos-only (no text during attraction step)
- Real about availability—no fake matches or padding
- Coordination-only messaging, not pen-pal texting
- Sensitive disclosures: "off the record" + "forget that" support (do NOT store raw text)
- Interface stays uncluttered: warm neutrals, soft type, plenty of space

---

## Values Schema v2

Single schema adapting per relationship track (romantic, friendship, professional, creative, service).

### Key Fields

**Relationship Context:**
- Type (romantic, friendship, professional, creative, service)
- Openness to overlap
- Explicit intent per track (prevents mismatched expectations)

**Orientation:**
- What seeking (connection, collaboration, support, growth)
- Commitment horizon (days, weeks, months, years)
- Availability level (low, medium, high)

**Core Values** (closed list with weights):
- honesty, reliability, respect, growth, curiosity, ambition, creativity, stability, independence, generosity, community, discretion

**Beliefs:**
- Politics/religion importance
- Money risk tolerance
- Hierarchy vs equality preference

**Interaction Style** (where "vibe" lives without promising chemistry):
- Tone (light, balanced, serious)
- Energy level (low, medium, high)
- Communication preference (direct, reflective, casual)
- Pace (slow, moderate, fast)

**Collaboration Signals:**
- Follow-through, planning vs improvisation, conflict handling, accountability style

**Constraints:**
- Location radius, schedule overlap, exclusivity required, compensation expected

**Optional Depth** (opt-in, abstracted):
- Attachment style inferred (secure, anxious, avoidant, mixed)
- Enneagram type with confidence
- Risk flags (overextended, conflict-avoidant)

**Ephemeral Insights** (derived, raw content destroyed):
- Intimacy openness level, novelty preference, discretion importance

**Agent Summary** (human-readable, private):
- Alignment strengths, likely friction points, best contexts, chemistry uncertainty

### Matching Philosophy

**The Hierarchy of Relationship Duration (3 core layers):**
- Attraction alone = days to weeks
- Attraction + Lifestyle = weeks to months
- Attraction + Lifestyle + Values = lifetime potential

**Filters (not hierarchy):**
- Decency = safety check (like breathing—necessary but not what makes relationships last)
- Psychology = readiness filter (helps filter who's ready, nice-to-have depth)

**See `.context/what-we-are-building.md` (concise) or `.context/compatibility-hierarchy.md` (detailed).**

**Core Principles:**
- Chemistry discovered in person, not predicted
- Lifestyle compatibility is ironically critical (most overlooked)
- Decency tracked through real behavior (not self-reported)
- Progressive profiling: depth unlocks access, filters naturally
- Match on compatible patterns, not checkbox overlap

---

## Build Order (Sequential)

**See `.context/roadmap.md` for detailed living roadmap.**

### Phase 1: Attraction Foundation ✅ Complete

Basic scaffolding with temporary rigid forms:
1. Auth + context selection + basic routing
2. Agent chat UI with off-the-record (do NOT store raw)
3. DerivedProfile extraction stub (rule-based first, rigid forms as temporary UI)
4. Profile preview + completeness nudges
5. Media upload + gallery
6. Attraction mode + persistence + rate limit
7. Matching engine + match reveal (attraction-only)
8. Events: seeded list + match-linked interest + RSVP
9. Notifications inbox
10. Feedback + trust aggregate (stub)

**Compatibility:** Attraction only (days to weeks)
**Note:** Rigid dropdown forms are temporary scaffolding.

### Phase 2: Lifestyle Compatibility Layer 🎯 Next

Add the most critical compatibility factor (day-to-day fit):
11. 10-15 lifestyle compatibility questions (energy, social preference, spontaneity, etc.)
12. Lifestyle scoring algorithm (0-100)
13. Update matching engine: attraction × lifestyleScore
14. Mysterious insights powered by lifestyle ("Someone here shares your energy level")
15. Event recommendations based on lifestyle fit

**Compatibility:** Attraction × Lifestyle (weeks to months)
**Duration:** Week 3-4 of user journey

### Phase 3: Decency Foundation & Therapeutic Interpretation

Build safety through behavioral feedback + introduce interpretation:
16. Post-event feedback forms (behavioral ratings)
17. Decency score aggregation and status tracking
18. Update matching: attraction × (decency + lifestyle)
19. Analysis pipeline: LLM prompts for therapeutic frameworks
20. Schema additions: Profile.interpretations, ContextIntent.interpretations (JSON fields)
21. Pattern extraction from chat transcripts (themes, word frequency, tone)
22. Multi-framework synthesis (Maté + Perel + Gottman + IFS + Attachment)
23. Replace rigid forms with interpreted insights display
24. "Here's what we're hearing from you" profile structure
25. Chat-based refinement flow ("Edit my interpretation")

**Compatibility:** Attraction × (Decency + Lifestyle) (years)
**Duration:** Week 5-6 of user journey

### Phase 4: Values Alignment

Add long-term compatibility factors:
26. 8-12 values questions (children, marriage, career, family, beliefs)
27. Values scoring algorithm (0-100)
28. Update matching: full formula with values
29. Matching algorithm based on interpreted patterns + values

**Compatibility:** Attraction × (Decency + Lifestyle + Values) (lifetime potential)
**Duration:** Month 2 of user journey

### Phase 5: Psychological Depth (Progressive Profiling)

Add optional depth layer, motivation-driven:
30. Optional attachment style questions
31. Communication preference questions
32. Progressive profiling nudges (attraction-driven depth)
33. Familiar vs growth pattern detection
34. familiarityBoost and longTermConcern modifiers
35. Continuous re-analysis as users share more

**Compatibility:** Full formula with psychology (lifetime partnership)
**Duration:** Month 3-4 of user journey

### Phase 6: Advanced Group Dynamics

Optimize event composition and recommendations:
36. Event recommendation engine (which events for which users)
37. Group composition optimization
38. Compatibility filtering (paid feature)
39. Advanced mysterious insights
40. "Personality Hire" event facilitation

---

## Therapeutic Interpretation Framework

### Core Approach

The system interprets language patterns through five therapeutic frameworks:

**1. Gabor Maté** (Core Framework):
- Attachment theory (secure, anxious, avoidant patterns)
- Trauma responses and coping mechanisms
- Authentic self vs adapted self
- Emotional needs beneath surface wants

**2. Esther Perel** (Romantic/Erotic Context):
- Desire and intimacy dynamics
- Cultural narratives around relationships
- Paradoxes (security vs passion, autonomy vs togetherness)

**3. John Gottman** (Relationship Patterns):
- Communication styles (Four Horsemen: criticism, contempt, defensiveness, stonewalling)
- Conflict resolution approaches
- Emotional bids and turning toward/away

**4. Internal Family Systems (IFS)** (Parts Work):
- Different "parts" of self (inner critic, wounded child, protector)
- Self-energy vs parts-driven behavior
- Polarized parts creating internal conflict

**5. Attachment Theory** (Bowlby, Ainsworth):
- Secure, anxious, avoidant, disorganized patterns
- Protest behavior, hyperactivation, deactivation
- Working models of self and others

### Profile Structure

The profile becomes layers of understanding built conversationally:

**Shared Understanding** (all contexts):
1. Values & Identity (core values emerge through language patterns)
2. Lifestyle & Living Patterns (rhythm, activity level, schedule, life stage)
3. Tastes & Preferences (food, music, activities, routines)

**Context-Specific** (romantic, friendship, etc.):
4. Intent & Relationship Context (what they're seeking, timeline)
5. Connection Style & Attachment (how it feels to relate to them)
6. Constraints (kids, location, schedule, relationship structure)
7. Trust & Feedback (private, internal signals)

### Interpretation Display

```
Shared Understanding
━━━━━━━━━━━━━━━━━━━

Values & Identity
"Here's what we're hearing from you about what matters most..."
[Interpreted text based on Maté framework]

Living & Logistics
"You're based in [location], in your [age range]..."
[Interpreted text with concrete details]

━━━━━━━━━━━━━━━━━━━
Romantic Context
━━━━━━━━━━━━━━━━━━━

Attachment & Connection
"In romantic relationships, we're noticing..."
[Gabor Maté lens: attachment patterns, underlying needs]

Desire & Intimacy
"When it comes to attraction and desire..."
[Esther Perel lens: paradoxes, desire dynamics]

Communication & Conflict
"Your language suggests you approach disagreements by..."
[Gottman lens: communication patterns, conflict style]

[💬 Refine these interpretations] button
```

### Transparency & Ethics

- **Always show** users what we're interpreting
- **Never hide** analysis or use only algorithmically
- **Reflective, not diagnostic** ("we notice you express..." not "you have anxious attachment disorder")
- **User control**: Reject interpretations, pause analysis, delete and start fresh
- **Growth-oriented** language, no pathologizing

---

## Data Models (Prisma)

### Phase 1 (Current - Scaffolding)

**User, ContextProfile** (user_id, context_type, tone_preference)
**ChatMessage** (context_profile_id, role, content, flags: off_record)
**DerivedProfile** (context_profile_id, json_blob, completeness_score, missing_fields)
**MediaAsset** (user_id, context_type, url, type, attraction_set)
**AttractionVote** (viewer_user_id, viewed_user_id, context_type, decision)
**Match** (user_a_id, user_b_id, context_type, score, status)
**Event** (title, location, time, tags/interests, created_by, context_type)
**EventRSVP** (event_id, user_id, status)
**Notification** (user_id, type, payload, read_at)
**Feedback** (from_user_id, to_user_id, event_id?, ratings, note)
**TrustAggregate** (user_id, scores, flags)

### Phase 2 (Interpretation Engine - In Progress)

**Add to Profile:**
- interpretations (Json) - Structured therapeutic insights
- rawPatterns (Json) - Word frequency, themes, tone
- lastAnalyzed (DateTime)

**Add to ContextIntent:**
- interpretations (Json) - Context-specific insights
- rawPatterns (Json) - Context patterns
- lastAnalyzed (DateTime)

**New: InterpretationFeedback**
- user_id, interpretation_id, accurate (boolean), user_correction (text), created_at

**Interpretations JSON Structure:**
```json
{
  "frameworks": {
    "gabor_mate": {
      "attachment_style": {
        "primary": "anxious-avoidant",
        "confidence": 0.75,
        "evidence": ["mentions fear of being 'too much'"],
        "insight": "You value independence and space..."
      },
      "underlying_needs": {
        "primary": ["safety", "authenticity"],
        "confidence": 0.85
      }
    },
    "esther_perel": {
      "desire_paradox": {
        "tension": "security vs novelty",
        "confidence": 0.65
      }
    }
  },
  "summary": "You value deep emotional connection...",
  "generated_at": "2025-12-24T10:30:00Z"
}
```

---

## Intent & Modes

- Onboarding requires explicit intent: romantic, friendship, or both (kept separate; no leakage)
- No "friends → dating" nudging without consent
- No attraction scoring/visuals in friendship mode
- Feedback centers on clarity, trust, reliability (not attraction) in friendship mode

---

## UX/Tone Guidelines

### Voice

Conversational, thoughtful, lightly self-aware; never preachy. Easy flow; no hype, no countdowns, no urgency badges.

### Copy Patterns to Reuse

**Easy, natural flow:**
- "Skip the tedious work"
- "Meet people you actually click with"
- "Gets out of your way"

**Real about chemistry:**
- "We don't promise chemistry. We promise honesty."
- "Chemistry happens in person, not on screens."
- "We create the conditions. You discover the spark."

**Avoiding wrong-fit dates:**
- "No awkward first dates with wrong-fit people"
- "Skip the pen-pal texting that goes nowhere"
- "Fewer dates, better matches"

### Visual Vibe

Warm neutrals, soft type, plenty of space. No grids of faces or busy feeds.

### First-Run Flow

1. **Arrival** (warm, human moment)
2. **Reframing** (values-first prompt)
3. **Promise** (one simple card; CTA "Get started"; include mode choice line)

---

## Guardrails & Trust

- Honor user requests to forget sensitive inputs
- Keep tracks parallel (romantic/friendship); do not recommend across modes
- Do not inflate options or feign matches; surface real availability
- Goal: less tedious work, more real meetings (avoid endless chatting and dopamine loops)
- Sensitive content: support "off the record" and "forget that"; do NOT store raw text; zero out derived fields when forgetting

---

## MVP Acceptance Criteria

- [ ] New user can sign up, pick context, chat, see derived profile preview
- [ ] User can upload photos and enter attraction mode
- [ ] Two aligned users with mutual attraction become a match
- [ ] "No matches yet" state shows when empty
- [ ] Matched users can coordinate via quick plan and mark interest in events
- [ ] Both users notified when both interested in same event
- [ ] Off-the-record message is NOT stored and cannot be retrieved
- [ ] "Forget last message" removes stored + derived fields

---

## Development Workflow

### Per Feature/Session

1. **Read-in**: Open `.context/product-spec.md` (this file) and relevant briefs. Summarize constraints.
2. **Plan**: Draft 3-5 steps, confirm scope.
3. **Build**: Implement minimal changes; reference schema fields explicitly.
4. **Test**: Run relevant tests/lints; capture results.
5. **Log**: Create implementation log in `dev/logs/{feature}-{role}-{date}.md` if significant.
6. **Update state**: Update `dev/project-state.md` with current status.
7. **Commit**: One feature = one commit. Message: `feat: <short feature>`, `fix: ...`, `chore: ...`

### Best Practices

- Always restate constraints from product-spec.md before major edits
- Keep feature branches/commits small and labeled
- Prefer explicit schema references over ad-hoc fields
- Keep tracks parallel (romantic/friendship)
- Use structured notes (What/Why/Tests/Follow-ups)
- Default to honesty in UX: show real availability, no overpromising
- Preserve privacy: forget raw sensitive inputs after deriving fields

---

## Quick Reference

**What is this?** Relationship builder using conversational profiling with therapeutic interpretation
**Who's it for?** People tired of endless swiping, mismatched dates, and pen-pal texting
**What makes it different?** Profiles are interpreted ("Here's what we're hearing"), not authored; chemistry discovered in person, not predicted
**Current phase:** Phase 2 (Interpretation Engine) - building therapeutic analysis pipeline
**Previous phase:** Phase 1 (Scaffolding) - rigid forms were temporary, now being replaced

---

*This living document consolidates all product knowledge. Update as product evolves. Version major changes (v3, v4, etc.) and archive old versions in `.context/archive/`.*
