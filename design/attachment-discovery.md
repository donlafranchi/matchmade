# Attachment & Self-Discovery

**Status:** Design spec (optional feature)

---

## Overview

Help users learn about their attachment styles and relational patterns. This is a **self-discovery tool**, not therapy. Users opt-in to learn about themselves and optionally use this for better matching.

---

## What This Is

- A way for users to understand their attachment style
- Optional insights into communication and relational patterns
- An additional matching dimension (if opted in)
- Educational content about healthy relationships

## What This Is NOT

- Therapy or counseling
- Clinical diagnosis
- Required for using the app
- A substitute for professional help

---

## User Journey

### 1. Discovery Prompt
After basic profile is complete, offer the option:

```
"Want to learn about your attachment style?"

Understanding how you connect can help you find
better matches - and understand yourself better.

[Learn More]  [Maybe Later]
```

### 2. Attachment Quiz (Optional)
Short quiz (10-15 questions) based on established attachment research.

Questions explore:
- How you feel when partners need space
- How you respond to conflict
- What closeness feels like
- How you handle uncertainty in relationships

### 3. Results & Education
Show results with educational context:

```
Your Attachment Style: Anxious-Leaning

What this means:
You tend to seek closeness and reassurance in relationships.
You're attuned to your partner's moods and may worry about
the relationship when things feel uncertain.

Strengths:
- Emotionally aware and expressive
- Committed and caring
- Good at reading emotional cues

Growth edges:
- Learning to self-soothe during uncertainty
- Trusting that space doesn't mean disconnection
- Communicating needs directly vs seeking reassurance

[Learn more about attachment styles]
[How this affects matching]
[Retake quiz]
```

### 4. Matching Integration (Opt-in)
User decides whether to use this for matching:

```
"Use attachment style for matching?"

When enabled, we'll factor in attachment compatibility.
For example: secure attachment pairs well with most styles,
while some combinations may need more intentional work.

Your attachment style is never shown to matches directly.

[Yes, use for matching]  [No, just for me]
```

---

## Attachment Styles

Based on Bowlby and Ainsworth's research:

### Secure
- Comfortable with intimacy and independence
- Trusts partners, communicates openly
- Recovers well from conflict
- **Matches well with:** Most styles

### Anxious (Preoccupied)
- Seeks closeness, fears abandonment
- Highly attuned to partner's moods
- May need more reassurance
- **Matches well with:** Secure, sometimes anxious

### Avoidant (Dismissive)
- Values independence, uncomfortable with too much closeness
- May withdraw when things get intense
- Self-reliant, sometimes to a fault
- **Matches well with:** Secure

### Disorganized (Fearful-Avoidant)
- Mixed patterns, both craving and fearing closeness
- May have inconsistent behavior in relationships
- Often linked to past difficult experiences
- **Matches well with:** Secure (with patience)

### The Anxious-Avoidant Trap
Classic difficult pairing: one pursues, one withdraws, creating a cycle. We gently flag this pattern without forbidding it.

---

## Additional Frameworks (Supplementary)

Beyond attachment, we can offer insights from:

### Communication Style (Gottman)
- How you handle conflict
- How you express care
- Whether you turn toward or away from bids for connection

### Independence-Intimacy Balance (Perel)
- How much autonomy you need
- Comfort level with closeness
- Desire for novelty vs stability

### Self-Awareness (IFS-inspired)
- Recognizing different "parts" of yourself
- When you're reactive vs grounded
- Patterns that might show up under stress

These are presented as **"things to notice about yourself"** - not diagnoses.

---

## Data Model

```typescript
interface PsychologyProfile {
  // Attachment
  attachmentStyle: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | null
  attachmentConfidence: number  // 0-100
  attachmentSource: 'quiz' | 'self_reported' | 'inferred'
  attachmentOptedIn: boolean    // Use for matching?

  // Communication (optional)
  communicationStyle: 'direct' | 'reflective' | 'casual' | null
  conflictApproach: 'discuss' | 'avoid' | 'confront' | 'accommodate' | null

  // Relational patterns (optional)
  independenceNeed: 'high' | 'moderate' | 'low' | null
  intimacyComfort: 'high' | 'moderate' | 'low' | null

  // Metadata
  quizCompletedAt: Date | null
  lastUpdated: Date
}
```

---

## Matching Logic

If user opts in, psychology affects matching:

```typescript
function psychologyModifier(a: Profile, b: Profile): number {
  // No data = neutral
  if (!a.attachmentStyle || !b.attachmentStyle) return 1.0
  if (!a.attachmentOptedIn || !b.attachmentOptedIn) return 1.0

  // Secure + anything = slight bonus
  if (a.attachmentStyle === 'secure' || b.attachmentStyle === 'secure') {
    return 1.1
  }

  // Anxious + avoidant = slight penalty (known difficult pairing)
  if (isAnxiousAvoidantPairing(a, b)) {
    return 0.85
  }

  // Same insecure style = slight penalty
  if (a.attachmentStyle === b.attachmentStyle) {
    return 0.95
  }

  return 1.0
}
```

---

## What Users See About Matches

**Never shown:**
- Match's specific attachment style
- Raw psychological data
- "They're avoidant, you're anxious"

**Optionally shown (if both opted in):**
- Vague compatibility hint: "You may connect easily" or "May take some intentional work"
- Educational prompt: "Learn about anxious-avoidant dynamics"

---

## Gentle Nudges (Limited Intervention)

We are NOT therapists. But in specific situations, we offer brief, gentle nudges:

### When to Nudge
1. **Crisis language detected** - Self-harm, severe distress
2. **Impulsive patterns** - About to unmatch everyone, delete account in anger
3. **Not in a good space** - Repeated negative patterns suggesting they need a break

### How to Nudge
```
"Hey, want to take a break?

Sometimes stepping away for a bit helps.
Your profile will be here when you're ready.

[Take a break]  [I'm okay]"
```

### Rules
- One nudge, then back off
- Never preachy or persistent
- Offer resources, don't prescribe
- Link to external help for serious situations

---

## Educational Content

Provide articles/content users can explore:

- "What's attachment style and why does it matter?"
- "The anxious-avoidant dance: what it looks like"
- "Moving toward secure attachment"
- "How to communicate your needs"
- "When patterns repeat: breaking cycles"

This is evergreen content, not personalized therapy.

---

## Open Questions

1. **Quiz design:** How many questions? Validated instruments or custom?
2. **Re-assessment:** Can attachment change? How often to re-quiz?
3. **Inference:** Should we infer attachment from conversation, or only use explicit quiz?
4. **Visibility:** Should users ever see match's attachment style (with consent)?
5. **Educational depth:** How much content is too much? Keep it light?

---

## Success Metrics

- % of users who take the quiz
- % who opt-in to matching integration
- Self-reported helpfulness ("Did this help you understand yourself?")
- Do psychology-informed matches lead to better outcomes?

---

*This is an optional self-discovery feature, not core to the product. Build after core matching works.*
