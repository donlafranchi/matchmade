# Values Schema v2

**Status:** Design spec (not yet implemented)

---

## Overview

Single schema for user profiles. Organized by the compatibility hierarchy:

| Layer | Purpose | Required? |
|-------|---------|-----------|
| **Lifestyle** | Can you spend time together? | Yes |
| **Values** | Do you want the same things? | Yes |
| **Psychology** | How do you relate to each other? | Optional |

Decency is tracked separately via behavioral feedback (not self-reported).

---

## Layer 1: Lifestyle (Required)

Day-to-day compatibility. The most overlooked but critical factor.

### Schedule & Rhythm
- **schedule_preference:** morning | night | flexible
- **work_style:** 9-5 | flexible | irregular | not_working

### Energy & Activity
- **energy_level:** 1-5 scale
- **activity_preference:** homebody | balanced | always_out

### Social Style
- **social_preference:** introvert | ambivert | extrovert
- **group_size_preference:** one_on_one | small_groups | large_groups | any

### Planning Style
- **spontaneity:** 1-5 scale (planner to improviser)

### Location
- **location:** city/neighborhood
- **location_flexibility:** fixed | flexible | relocating

---

## Layer 2: Values (Required)

Long-term alignment. What keeps people together.

### Core Values (pick top 5, ranked)
Closed list:
- honesty
- reliability
- respect
- growth
- curiosity
- ambition
- creativity
- stability
- independence
- generosity
- community
- discretion
- adventure
- tradition

### Relationship Intent
- **relationship_type:** casual | serious | marriage_track | figuring_it_out
- **timeline:** no_rush | within_year | soon | open

### Life Goals
- **children_intent:** want | open | no | have_kids
- **career_priority:** primary | balanced | secondary

### Beliefs (importance level: not_important | somewhat | very | dealbreaker)
- **politics_alignment:** importance level
- **religion_alignment:** importance level
- **lifestyle_values:** importance level (e.g., health, finances)

---

## Layer 3: Psychology (Optional, Opt-in)

How people relate. Derived from self-reflection or inferred from conversation.

### Attachment Style
Based on attachment theory (Bowlby, Ainsworth):
- **attachment_style:** secure | anxious | avoidant | disorganized | unknown
- **attachment_confidence:** 0-100 (how certain are we?)
- **attachment_source:** self_reported | inferred | quiz

*Used for matching: Secure pairs well with most. Anxious + avoidant is a known difficult pairing.*

### Communication Style
Based on Gottman's research:
- **communication_style:** direct | reflective | casual
- **conflict_approach:** discuss | avoid | confront | accommodate
- **emotional_expression:** reserved | moderate | expressive

*Used for matching: Compatible communication styles reduce friction.*

### Relational Patterns
Inspired by IFS and Esther Perel:
- **independence_need:** high | moderate | low
- **intimacy_comfort:** high | moderate | low
- **novelty_seeking:** high | moderate | low

*Used for matching: Complementary patterns (not identical) often work best.*

---

## Compatibility Hierarchy Integration

How these layers feed into matching (see matching-algorithm.md):

```
┌─────────────────────────────────────────┐
│           DECENCY FILTER                │
│     (must pass to be matchable)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         MUTUAL ATTRACTION               │
│        (binary gate - both yes)         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│      LIFESTYLE SCORE (0-100)            │
│   schedule + energy + social + spontan. │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       VALUES SCORE (0-100)              │
│   core values + intent + life goals     │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     PSYCHOLOGY MODIFIER (0.8-1.2)       │
│   attachment + communication (if opted) │
└─────────────────────────────────────────┘
                    ↓
         FINAL COMPATIBILITY SCORE
```

---

## Data Collection Methods

**We don't ask people to describe themselves. We ask about their experiences.**

See `experiential-profiling.md` for the full interview approach.

### Interview-Based (Primary)
Questions about experiences reveal patterns:
- "What does your ideal weekend look like?" → Energy + Social
- "What does trust look like to you?" → Trust style
- "What do you need when things get hard?" → Support style

### Direct (Only Where Necessary)
Some things are fine to ask directly:
- Location
- Relationship intent
- Dealbreakers (kids, religion, etc.)

### Feedback-Based (Post-Interaction)
Real data from real interactions:
- Post-date feedback from both parties
- Aggregated patterns ("Easy to talk to")
- Decency signals from behavior

### Behavioral (From App Usage)
- Response times → schedule patterns
- Message length → communication style
- Event attendance → social preference

---

## Minimum Viable Profile

What's required before someone can match?

**Hard requirements:**
- Location
- Relationship intent
- 3+ core values selected
- schedule_preference
- energy_level
- social_preference

**Soft requirements (improve match quality):**
- All lifestyle fields
- All values fields
- At least one psychology field (opt-in)

---

## Framework Attribution

The psychological dimensions are informed by established frameworks:

| Dimension | Framework Source |
|-----------|------------------|
| Attachment style | Bowlby, Ainsworth (Attachment Theory) |
| Communication/conflict | John Gottman |
| Independence/intimacy | Esther Perel |
| Parts/patterns | Internal Family Systems (IFS) |
| Underlying needs | Gabor Maté |

These are presented as **self-discovery tools**, not clinical diagnoses. See privacy-ethics.md for guidelines.

---

## Open Questions

1. How do weights work for core values? Rank order or percentage?
2. Should psychology be purely opt-in or gently encouraged?
3. What's the UX for collecting lifestyle data? Quiz? Chat? Progressive?
4. How do we handle users who refuse psychology opt-in? Still match them?
5. Should users see how their values affect their matches?

---

*This schema feeds into matching-algorithm.md. See privacy-ethics.md for data handling principles.*
