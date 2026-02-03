# PRODUCT.md

> PM-owned. Agents read-only.

## The Pitch

**We get it. You're tired.**

Tired of swiping through endless profiles only to match with people who aren't worth your time. It's like house hunting in California—everything interesting is out of reach, so you're stuck searching for diamonds in the rough. And when you finally find someone promising? The texting goes nowhere. Or worse, you meet up and there's nothing there.

All that effort. For nothing.

This app does things differently.

**Character first. Attraction second. Meeting as soon as possible.**

- **No endless swiping.** An AI agent learns who you are through conversation—your values, your lifestyle, what you need right now.
- **No wading through mismatches.** We filter on character compatibility *before* showing you anyone.
- **No pen-pals.** The app gets you meeting in real life, not texting into oblivion.
- **No flakes without consequence.** People who ghost or waste your time get filtered out.
- **No outdated profiles.** You're always changing. Just have another conversation when you come back.

The goal is **coordinated serendipity**—the app handles the logistics so you can just show up and see what happens. Like passing notes in class, but for adults who've got better things to do than swipe all day.

---

## Core Philosophy

### What We're Solving

| Problem | Current Apps | Our Solution |
|---------|--------------|---------------|
| Attractiveness inequality | Some people drowning in matches, others starving | Character-first filtering equalizes the funnel |
| Wasted effort | Swiping, texting, profile crafting → no chemistry IRL | Minimize pre-work, get to meeting fast |
| Unserious users | Ghosters and pen-pals face no consequences | Feedback/reputation creates accountability |
| Static identity | Profile is a snapshot; people change | Conversational agent captures who you are *now* |
| Endless texting | People text forever and never meet | No direct messaging—meeting is the product |

### Design Principles

1. **Minimal information, maximum authenticity** — Learn about each other in person
2. **Character first, attraction second** — Filter on values/lifestyle, then show photos
3. **Meeting is the product** — Everything drives toward IRL connection
4. **Optional but incentivized** — Participation unlocks benefits
5. **User-moderated** — Community keeps everyone honest
6. **Works for anyone** — Romance, friendship, travel—meet whoever fits

---

## The Living Profile

### Agent-Based Onboarding

No forms. A conversation with an AI agent extracts:

- **Values** — What matters fundamentally
- **Lifestyle** — How they live day-to-day
- **Current interests** — What they're into right now
- **What they're looking for** — At this stage in life

**Why this works:**
- No profile maintenance
- Natural language captures nuance
- Can update anytime: "Anything changed?"
- Matching weights recent preferences

### Photos: Separate Layer

Photos exist but are evaluated independently. Two-stage filter:

1. Character/values/lifestyle match?
2. Mutual attraction?

Both required before someone appears in your pool.

---

## The Match Pool

Users don't get "matched." They see a **match pool**—people they *could* meet.

**What users see:**
- Photos of compatible people
- Compatibility indicators (not detailed profiles)
- Events those people are interested in

**What users don't see:**
- Detailed profiles to browse
- Chat history
- Compatibility percentages

Information scarcity forces genuine discovery in person.

---

## The Transition: App to Meeting IRL

No direct messaging. The app facilitates the journey from interest to in-person meeting.

### The Interaction Flow

| Action | Who (Default) | Description |
|--------|---------------|-------------|
| **Nudge** | Her | Signals openness to being invited |
| **Wink** | Either | Acknowledges interest |
| **Crush Note** | Him | Proposes a meetup |
| **Counter** | Her | Suggests an alternative |
| **Playful Decline** | Her | Passes on this one, invites another try |
| **Accept** | Her | Confirms the plan |

This mirrors how it works naturally:
1. She signals interest
2. He proposes
3. She accepts or adjusts
4. Both show up

### Crush Notes

Remember passing notes in class? "Do you like me? ☐ Yes ☐ No"

Crush Notes are the grown-up version—structured proposals instead of free text:

**He selects:**
- Activity: Coffee / Drinks / Walk / Activity
- Timing: Morning / Afternoon / Evening / Weeknight / Weekend
- Location: Selected from maps (can add brief context)

**She responds:**
- Accept with timing preference
- Counter with alternative
- Playful decline (invites another attempt)
- Pass

**Decline limits:**
- Two playful declines allowed
- After two, the ball moves to her court
- She proposes or passes entirely

### Agent-Facilitated Coordination

Agents act as go-betweens:

> **Her agent:** "Someone from your list is interested. Likes hiking, has a dog. Send a nudge?"
>
> **Him, after receiving nudge:** "Send a crush note—coffee this weekend"
>
> **Her agent:** "He suggested coffee downtown this weekend. Accept, counter, or pass?"

Benefits:
- Human-directed, agent-facilitated
- No messaging rabbit hole
- Light and playful, not transactional
- Async-friendly

---

## Meeting Modes

### Group Events (Primary)

Users browse local events:
- Trivia nights, hiking groups, art shows, concerts, markets

**What they see:**
- Event details
- Photos of people from their pool who are interested
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

### Crush Notes (1:1 Coordination)

For direct meetups when events don't fit:

1. She nudges (or shows interest via event attendance)
2. He sends crush note
3. She accepts, counters, or declines
4. Both get ice breaker + location
5. They meet

### User-Generated Events

Users create their own meetups:
- Must be public venues
- Visible to match pool
- Solves "no good events nearby" problem

---

## Fast Track (Future)

For people with more money than time.

Current thinking:
- Pay to send Crush Notes immediately (no nudge-first requirement)
- Pay to appear in more match pools
- Pay to unlock 1:1 meetups without earning it through group events first

Open questions:
- How do we keep this from undermining the character-first philosophy?
- Does the recipient know it's a paid fast track?
- Should free users be able to filter out fast-track approaches?

*This feature needs more design work. The goal is saving time, not buying access to people who wouldn't otherwise match.*

---

## Bump Chemistry

**Use case:** Vet someone you met in real life.

### QR Code Flow

1. She shares QR code: "Fill this out"
2. He scans → abbreviated agent conversation
3. Agent asks her 3-5 hardline questions (her dealbreakers)
4. Agent asks lifestyle/fun questions
5. App shows compatibility breakdown

### Compatibility Display

Simple visual indicators per dimension:
- Aligned
- Misaligned
- Unclear/no data

**Tongue-in-cheek messaging for long shots:**
- "Well... opposites attract, right?"
- "This could be an adventure"
- "You'll have plenty to talk about (argue about?)"

### NFC Tap (Both Have App)

- Tap phones → instant compatibility check
- Fun party trick, also useful
- Viral growth loop

---

## Tribe Discovery

Find your people through timely cultural moments.

**How it works:**
- Daily/weekly prompts on current events
- "Today's topic: the Super Bowl halftime show"
- "Hot take: [new show/movie/album]"
- See who responds similarly

**Why it matters:**
- Reveals compatibility beyond static profiles
- Keeps the app feeling alive
- Creates engagement beyond matching
- Shared wavelength > shared checkboxes

---

## Ice Breakers

Both users have seen photos and know there's compatibility. Ice breakers give them something to **talk about**:

- Asymmetric (each gets different info)
- Lightweight and fun
- Pulled from agent conversation

**Examples:**
- "She just got into rock climbing"
- "Ask him about his pizza opinions"
- "She has thoughts about that show you like"

---

## Reputation & Feedback

### What We Track

- Show-up rate
- Post-meetup feedback
- Response-to-invite ratio
- Profile accuracy

### Post-Meetup Questions (Lightweight)

- Any no-shows?
- Anyone not as they appeared?
- Anyone unkind?
- Any concerns?

### No-Show Policy

**Ghosting is a cardinal sin.**

Users who don't show up without notice get put in timeout. We keep it tongue-in-cheek:
- "Looks like you forgot about someone. That's not very cash money of you."
- "Timeout activated. Use this time to reflect on your choices."
- "Ready to be a grown-up? Welcome back."

### Reputation is Private

- Users see their own feedback
- System uses it for queue priority and feature access
- Others don't see scores directly

### User Moderation

- Flag system with community review
- Transparency reports
- Escalation to team for contested issues

---

## Re-Engagement

For users who've met:
- Send cards in the app
- "Take this quiz together"
- Keeps connection warm without unlimited texting

---

## LGBTQ+ Considerations

The "who proposes" dynamic is less scripted for same-sex matching:

- Users set preference: "I prefer to initiate" / "I prefer to be approached" / "Either"
- Or default to symmetric
- System is flexible enough to handle it

---

## Hidden Depth

The app rewards exploration:

- Secret "friends only" mode
- Travel mode (meet locals)
- Wildcard events (surprise activities)
- Reputation unlocks
- Easter eggs for active users

---

## Key Development Questions

### Rollout Strategy

Minimum viable density: hundreds to ~1,000 users per market.

**The chicken-and-egg problem:** How to get enough men AND women to give both options?

Ideas to explore:
- Launch city by city with waitlist building anticipation
- Women-first invites (create scarcity for men)
- Event partnerships to bootstrap initial meetups
- Bump Chemistry as standalone viral feature

### The Compatibility Line

**This is the million-dollar question.**

Where do we draw the line between:
- Values alignment (must match)
- Lifestyle overlap (should match)
- Interests (nice to have)

Too strict = empty pools. Too loose = defeats the purpose.

This will be the differentiator. Needs ongoing refinement based on user feedback and match success rates.

---

## Product Identity

This isn't a dating app. It's a **social discovery platform**.

More like a private social club:
- Agent conversation as vetting
- Reputation matters
- Community accountability
- Events as primary venue
- Minimal digital interaction by design

The romantic angle is the wedge. The real product is **facilitating authentic IRL connections**—romance, friendship, travel, tribe.

**Coordinated serendipity.**

---
*Last updated: 2026-02-02*
