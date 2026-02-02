# Bump Chemistry

**Status:** Concept exploration

---

## Overview

Allow two people who meet in the wild to "bump phones" and get an instant Chemistry Matching indicator. No details revealed - just a signal of whether there's potential worth exploring.

---

## Use Cases

### 1. Organic Meeting Accelerator
Two people hit it off at a bar, coffee shop, or event. Instead of exchanging numbers blindly, they bump phones and get a quick read on paper compatibility before deciding to pursue.

### 2. Women-Led Acquisition
Women meet interesting men IRL and invite them to bump. Men download the app, build a quick profile, and both see if there's anything to explore. Lowers the barrier for men to join while giving women agency.

### 3. Social Icebreaker
Fun interaction at parties or social gatherings. "Want to see if we're compatible?" becomes a playful way to start conversations without the awkwardness of traditional app swiping.

### 4. Event Integration
At Matchmade events, attendees could bump with people they're curious about to get a hint before deeper conversation.

---

## How It Works (Conceptual)

```
1. Both users open app → "Bump" mode
2. Phones detect proximity (NFC, Bluetooth, or QR scan)
3. Backend compares profiles (no raw data exchanged)
4. Both users see same result simultaneously
5. Result is vague but meaningful
```

---

## Result Display Options

### Option A: Single Indicator
```
┌─────────────────────────┐
│                         │
│      ✨ Spark ✨        │
│                         │
│   "Worth a conversation"│
│                         │
└─────────────────────────┘
```

Possible results:
- **Spark** - Strong overlap, worth exploring
- **Curious** - Some overlap, could be interesting
- **Different paths** - Not much overlap (gentle rejection)

### Option B: Dimension Hints
```
┌─────────────────────────┐
│                         │
│   Lifestyle: ●●●○○      │
│   Values:    ●●●●○      │
│                         │
│   "Something here"      │
│                         │
└─────────────────────────┘
```

Shows vague indicators per dimension without revealing specifics.

### Option C: Mysterious Insight
```
┌─────────────────────────┐
│                         │
│  "You both value the    │
│   same thing in how     │
│   you spend Sundays"    │
│                         │
└─────────────────────────┘
```

One cryptic hint that sparks curiosity without revealing profile details.

---

## Technical Approaches

### NFC Bump
- True "bump" experience
- Requires NFC hardware (most modern phones)
- iOS limitations may complicate

### Bluetooth Proximity
- Detect nearby devices running the app
- Less precise, more battery drain
- Works across platforms

### QR Code Scan
- One person shows code, other scans
- Most reliable technically
- Less magical but more practical

### Shared Gesture
- Both shake phones simultaneously
- App detects matching accelerometer patterns
- Fun but potentially unreliable

---

## Privacy Considerations

1. **No profile data exchanged** - only match score computed server-side
2. **Mutual consent required** - both must initiate bump mode
3. **No history stored** - bump results don't persist (or opt-in only)
4. **Can't identify strangers** - only works when both actively bumping

---

## Acquisition Flow (New User)

```
Person A (existing user): "Want to bump?"
Person B (no account): Scans QR or taps link
  → Lands on quick signup
  → Answers 5-10 essential questions (2 min)
  → Bump completes
  → Both see result
  → Person B invited to complete full profile later
```

### Minimum Viable Profile for Bump
What's the smallest profile that gives a meaningful signal?
- Location (implicit)
- Age range
- 3-5 core values (quick select)
- Relationship intent
- 2-3 lifestyle questions

---

## Integration with Matching Philosophy

Bump result should reflect the hierarchy:
1. **Lifestyle overlap** - Can you actually spend time together?
2. **Values alignment** - Do you want the same things?

Attraction isn't computed (that's what meeting IRL is for).

---

## Potential Concerns

### Gaming the System
- Could people fake profiles to get good bump results?
- Mitigation: Results are vague enough that gaming isn't worth it

### Rejection in Public
- Awkward if bump shows "Different paths" while standing together
- Mitigation: Frame all results positively, never harsh rejection

### Superficial Interactions
- Does this reduce depth of organic meetings?
- Counter: It's opt-in, adds info, doesn't replace conversation

### Privacy Anxiety
- "What if someone bumps me without consent?"
- Mitigation: Requires active bump mode from both parties

---

## Open Questions

1. **Result persistence:** Should bumps be saved? Could create a "people I've bumped" list
2. **Follow-up flow:** After a good bump, what's the CTA? Exchange contact? In-app match?
3. **Minimum profile:** What's the smallest profile that gives meaningful signal?
4. **Event mode:** Special bump features for Matchmade events?
5. **Viral mechanics:** How do we make bumping feel fun and shareable?
6. **Technical choice:** NFC vs QR vs Bluetooth - what's the best UX tradeoff?

---

## Success Metrics

- Bump → Full profile completion rate
- Bump → Continued conversation rate
- New user acquisition via bump invites
- User sentiment ("Was bumping fun?")

---

*This is an acquisition and engagement feature, not core matching. Build after core product is solid.*
