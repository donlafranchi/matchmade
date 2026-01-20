# Profile as Interpretation: Psychological Analysis Architecture

**Date:** 2025-12-24
**Status:** Core Product Vision
**Type:** Architectural Direction

---

## Vision Statement

Move away from rigid dropdown forms toward conversational profiling with therapeutic interpretation. The profile becomes a reflective mirror: "Here's what we're hearing from you" based on psychological frameworks and language analysis.

---

## Core Principles

### 1. Conversational Collection
- Users share information naturally through chat
- No rigid forms or forced categorization
- Natural language reveals more than dropdowns ever could

### 2. Interpreted Patterns
- Profile displays insights, not data fields
- Use therapeutic frameworks to understand underlying patterns:
  - **Gabor Maté:** Attachment styles, emotional patterns, underlying needs
  - **Other modalities:** Domain-specific expertise as needed
- Show what patterns we're observing, not what boxes they checked

### 3. "Here's What We're Hearing"
- Reflective, empathetic tone
- Mirror back their language and values
- Build trust through understanding, not data extraction

### 4. Fuzzy Boundaries
- No discrete categories (casual/close/best friend)
- Use spectrums and continuums (e.g., "seriousness of friendship")
- Capture nuance that rigid options miss

---

## Profile View Structure

### Current (Slice 1c Implementation)
```
Shared Profile Form:
- Name: [text input]
- Location: [text input]
- Age Range: [dropdown]
- Core Values: [csv input]
- Constraints: [csv input]

Context Intent Form (Romantic):
- Relationship Timeline: [dropdown]
- Exclusivity Expectation: [dropdown]
- Family Intentions: [dropdown]
- Attraction Importance: [dropdown]
```

### Target Vision
```
Shared Understanding:
"Here's what we're hearing from you..."

- Values & Identity
  "You seem to prioritize authenticity and growth. You've mentioned
   wanting connections where you can be fully yourself."

- Living Situation
  "You're based in San Francisco, navigating the tension between
   career ambition and creative pursuits."

- Stage of Life
  "In your early 30s, you're in a transition phase - questioning
   what success really means to you."

Context-Specific: Romantic
"In romantic relationships, we're noticing..."

- Attachment & Pacing
  "You express a desire to take things slow, which might indicate
   anxious-avoidant patterns or simply valuing emotional safety
   before physical intimacy."

- Connection Style
  "Your language suggests you value deep emotional connection over
   surface-level compatibility. Words like 'authentic', 'vulnerable',
   'growth' come up frequently."

- Future Orientation
  "You're open about family intentions but not fixated - suggests
   flexibility and presence over rigid life planning."

[Edit my interpretation] button
```

---

## Therapeutic Frameworks to Integrate

### 1. Gabor Maté - Core Framework
**Focus Areas:**
- Attachment theory (secure, anxious, avoidant patterns)
- Trauma responses and coping mechanisms
- Authentic self vs adapted self
- Emotional needs beneath surface wants
- Connection between early experiences and current patterns

**Application:**
- Analyze language for attachment cues
- Identify defense mechanisms in stated preferences
- Distinguish stated wants from underlying needs
- Recognize trauma-informed responses

**Example Analysis:**
- User says: "I want someone independent who doesn't need me"
- Maté lens: Possible avoidant attachment, fear of enmeshment, need for autonomy while desiring connection
- Profile shows: "You value independence and space. This might reflect a pattern of protecting yourself from emotional overwhelm while still desiring meaningful connection."

### 2. Esther Perel - Romantic/Erotic Context
**Focus Areas:**
- Desire and intimacy dynamics
- Cultural narratives around relationships
- Paradoxes (security vs passion, autonomy vs togetherness)
- Erotic intelligence and playfulness

**Application:**
- Analyze tension between stated wants and desires
- Recognize cultural scripts user is following vs authentic wants
- Identify paradoxes in romantic preferences

### 3. John Gottman - Relationship Patterns
**Focus Areas:**
- Communication styles (Four Horsemen: criticism, contempt, defensiveness, stonewalling)
- Conflict resolution approaches
- Emotional bids and turning toward/away
- Love languages and expressions of care

**Application:**
- Detect communication patterns in how user talks about relationships
- Identify conflict avoidance or confrontation tendencies
- Recognize how user expresses and receives care

### 4. Internal Family Systems (IFS) - Parts Work
**Focus Areas:**
- Different "parts" of self (inner critic, wounded child, protector)
- Self-energy vs parts-driven behavior
- Polarized parts creating internal conflict

**Application:**
- Recognize when different parts are speaking
- Identify protective parts vs vulnerable parts
- Map internal conflicts in stated preferences

### 5. Attachment Theory (Bowlby, Ainsworth)
**Focus Areas:**
- Secure, anxious, avoidant, disorganized patterns
- Protest behavior, hyperactivation, deactivation
- Working models of self and others

**Application:**
- Core framework underlying most interpretations
- Pattern recognition in language about relationships
- Predict relationship dynamics based on attachment cues

---

## Relationship to Compatibility Hierarchy

**See `.context/compatibility-hierarchy.md` for full architecture.**

This interpretation engine supports the compatibility hierarchy:
- **Phase 2 (Lifestyle):** Interpret lifestyle patterns from natural language
- **Phase 3 (Decency):** Aggregate behavioral feedback, flag concerning patterns
- **Phase 4 (Values):** Interpret stated values vs underlying needs
- **Phase 5 (Psychology):** Therapeutic framework analysis (attachment, communication, desire)

Interpretation enables:
- Progressive profiling (users share naturally, system interprets)
- Pattern recognition (familiar vs growth, secure vs insecure)
- Matching on compatibility (not checkbox overlap)

---

## Implementation Phases

### Phase 1: Foundation ✅ Complete
- ✅ Unified Profile + ContextIntent data model
- ✅ Chat interface for data collection
- ✅ Separate shared/context-specific storage
- ⚠️ Still using rigid forms (temporary)

### Phase 2: Lifestyle Interpretation (Week 3-4)
**Goal:** Interpret day-to-day compatibility from natural language

**Focus:**
- Extract lifestyle patterns from chat (morning/night, energy, social preference)
- Calculate lifestyle compatibility scores
- Power mysterious insights: "Someone here shares your energy level"

**Why first:** Lifestyle is ironically critical—determines if people can spend time together

### Phase 3: Interpretation Engine + Decency (Week 5-6)
**Goal:** Build LLM-powered analysis that interprets user language through therapeutic frameworks

**Components:**
- **Analysis Prompt Library:** Structured prompts for each framework (Maté, Perel, Gottman, etc.)
- **Pattern Extraction:** Extract themes, repeated words, emotional tone from chat transcripts
- **Multi-Framework Synthesis:** Combine insights from different therapeutic lenses
- **Confidence Scoring:** How certain are we about each interpretation?
- **Update Mechanism:** Continuously refine interpretations as user shares more

**Data Flow:**
```
User Chat Message
  ↓
Store in ChatMessage table
  ↓
Trigger Analysis Pipeline
  ↓
Run through therapeutic frameworks:
  - Gabor Maté lens (attachment, needs, trauma)
  - Esther Perel lens (desire, paradox) [if romantic context]
  - Gottman lens (communication patterns)
  - IFS lens (parts work)
  ↓
Generate interpretations for:
  - Shared profile insights
  - Context-specific insights
  ↓
Store in Profile.interpretations (new JSON field)
Store in ContextIntent.interpretations (new JSON field)
  ↓
Display in profile view
```

**New Schema Fields:**
```prisma
model Profile {
  // ... existing fields
  interpretations Json @default("{}") // Structured therapeutic insights
  rawPatterns     Json @default("{}") // Word frequency, themes, tone
  lastAnalyzed    DateTime?           // When interpretations were last updated
}

model ContextIntent {
  // ... existing fields
  interpretations Json @default("{}") // Context-specific insights
  rawPatterns     Json @default("{}") // Context-specific patterns
  lastAnalyzed    DateTime?
}
```

**Example interpretations JSON:**
```json
{
  "frameworks": {
    "gabor_mate": {
      "attachment_style": {
        "primary": "anxious-avoidant",
        "confidence": 0.75,
        "evidence": ["mentions fear of being 'too much'", "desires independence but expresses loneliness"],
        "insight": "You seem to want closeness but protect yourself from vulnerability..."
      },
      "underlying_needs": {
        "primary": ["safety", "authenticity", "acceptance"],
        "confidence": 0.85,
        "evidence": ["repeated use of 'authentic', 'safe space', 'accepted for who I am'"]
      }
    },
    "esther_perel": {
      "desire_paradox": {
        "tension": "security vs novelty",
        "confidence": 0.65,
        "evidence": ["wants 'stable' but also 'spontaneous'"],
        "insight": "You're navigating the paradox of wanting both security and excitement..."
      }
    }
  },
  "summary": "You value deep emotional connection and authenticity...",
  "generated_at": "2025-12-24T10:30:00Z"
}
```

### Phase 4: Profile View Redesign (Month 2)
**Goal:** Replace forms with interpreted insights

**Changes:**
- Remove all dropdown/input forms
- Display interpretations as readable, empathetic text
- Add "Edit my interpretation" flow (chat-based refinement)
- Show confidence levels (subtle UI cues)
- Allow users to flag inaccurate interpretations

**UI Structure:**
```
[Context Indicator: Romantic]

Shared Understanding
━━━━━━━━━━━━━━━━━━━

Values & Identity
"Here's what we're hearing from you about what matters most..."
[interpreted text based on analysis]

Living & Logistics
"You're based in [location], in your [age range]..."
[interpreted text with concrete details]

━━━━━━━━━━━━━━━━━━━
Romantic Context
━━━━━━━━━━━━━━━━━━━

Attachment & Connection
"In romantic relationships, we're noticing..."
[Gabor Maté lens interpretation]

Desire & Intimacy
"When it comes to attraction and desire..."
[Esther Perel lens interpretation]

Communication & Conflict
"Your language suggests you approach disagreements by..."
[Gottman lens interpretation]

[💬 Refine these interpretations] button
```

### Phase 5: Continuous Refinement (Month 3-4)
**Goal:** Interpretations improve over time as user shares more

**Features:**
- Every chat message triggers re-analysis
- Compare new interpretations to old (did patterns shift?)
- Surface pattern changes to user: "We're noticing a shift in how you talk about..."
- Allow user to confirm/reject interpretations
- Learn from user feedback to improve future analysis

### Phase 6: Matching Based on Interpretation (Month 5+)
**Goal:** Match users based on compatible patterns, not checkbox overlap

**Matching Logic:**
- Complementary attachment styles (secure + anxious works better than anxious + avoidant)
- Compatible communication styles
- Aligned underlying needs
- Attraction to each other's growth edges
- Shared values (not just shared hobbies)

**Example Match Insight:**
```
Match with Alex (85% compatible)

Why we think you'd connect:
- Both of you are navigating anxious-avoidant patterns and
  actively working on secure attachment
- Your communication styles complement (you're reflective,
  they're direct - creates balance)
- Shared underlying need for authenticity and growth
- You're attracted to their confidence, they're drawn to
  your emotional depth
```

---

## Technical Architecture

### Analysis Pipeline

**Trigger Points:**
1. After every chat message (background job)
2. When user visits profile view (if stale > 1 hour)
3. Manual "refresh my profile" button

**LLM Prompt Structure:**
```
System: You are a therapeutic interpreter combining insights from
Gabor Maté (attachment, trauma, needs), Esther Perel (desire, paradox),
and John Gottman (communication patterns). Analyze the user's language
with empathy and nuance.

User Chat Transcript:
[last 50 messages in context]

Current Context: Romantic

Task: Generate interpretations for:
1. Attachment style (primary + confidence)
2. Underlying emotional needs
3. Communication patterns
4. Desire/intimacy orientation (if romantic context)
5. Key themes and repeated language

Format: JSON with structure matching schema above
Tone: Empathetic, reflective, non-judgmental
Confidence: Only surface patterns you're 70%+ confident about
```

**Caching Strategy:**
- Cache interpretations for 1 hour
- Invalidate on new chat messages
- Store full LLM response for debugging
- Track cost per analysis (monitor token usage)

### Database Schema Changes

```prisma
model Profile {
  id               String   @id @default(cuid())
  userId           String   @unique

  // Existing fields
  coreValues       Json     @default("[]")
  beliefs          Json     @default("{}")
  interactionStyle Json     @default("{}")
  lifestyle        Json     @default("{}")
  constraints      Json     @default("[]")
  location         String?
  ageRange         String?
  name             String?

  // NEW: Interpretation fields
  interpretations  Json     @default("{}") // Structured insights
  rawPatterns      Json     @default("{}") // Word freq, themes, tone
  lastAnalyzed     DateTime?               // When last analyzed

  completeness     Int      @default(0)
  missing          String[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model ContextIntent {
  id          String                   @id @default(cuid())
  userId      String
  contextType RelationshipContextType

  // Existing rigid fields (keep for now, phase out)
  relationshipTimeline      String?
  exclusivityExpectation    String?
  // ... other fields ...

  // NEW: Interpretation fields
  interpretations Json     @default("{}") // Context-specific insights
  rawPatterns     Json     @default("{}") // Context patterns
  lastAnalyzed    DateTime?

  completeness     Int      @default(0)
  missing          String[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([userId, contextType])
}

// NEW: Track interpretation feedback
model InterpretationFeedback {
  id               String   @id @default(cuid())
  userId           String
  interpretationId String   // References specific insight in interpretations JSON
  accurate         Boolean  // User marked as accurate/inaccurate
  userCorrection   String?  // What user said it should be
  createdAt        DateTime @default(now())
}
```

---

## User Experience Flow

### Current Experience (Slice 1c)
```
1. User visits /contexts/romantic
2. Sees rigid forms with dropdowns
3. Fills out "Relationship Timeline: Taking my time"
4. Saves form
5. Data stored as discrete enum values
```

### Target Experience
```
1. User visits /contexts/romantic
2. Sees "Here's what we're hearing from you..."
3. Reads interpreted insights about their patterns
4. Clicks [💬 Refine these interpretations]
5. Chat opens: "Is there anything we're getting wrong?"
6. User: "I'm not actually avoidant, I'm just careful"
7. System: "Got it. So you're deliberate about who you let in,
   not avoiding connection itself. Let me update that."
8. Profile refreshes with refined interpretation
```

### Edit/Refinement Flow
```
[Profile View]
━━━━━━━━━━━━━━━━━━━
Attachment & Connection
"You express a desire to take things slow, which might indicate
anxious-avoidant patterns..."

[This doesn't feel right] button
  ↓
Opens chat overlay:
"What did we get wrong? Help us understand you better."
  ↓
User clarifies in natural language
  ↓
System re-analyzes with new context
  ↓
Profile updates with refined interpretation
  ↓
"Thanks for helping us understand you better. Updated ✓"
```

---

## Privacy & Ethics Considerations

### Transparency
- Always show users what we're interpreting
- Never hide analysis or use it only for matching
- Users should understand what patterns we're seeing
- Clear language about confidence levels

### User Control
- Users can reject any interpretation
- Users can pause analysis entirely
- Users can delete all interpretations and start fresh
- No psychological profiling without explicit consent

### Therapeutic vs Diagnostic
- **We are not diagnosing** (not "you have anxious attachment disorder")
- **We are reflecting patterns** ("we notice you express...")
- Use non-judgmental, growth-oriented language
- Avoid pathologizing normal relationship patterns

### Data Sensitivity
- Interpretations are highly personal, secure storage
- Never share interpretations with matches directly
- Only use for matching algorithm (invisible to other users)
- Clear data deletion policy

---

## Success Metrics

### User Trust
- % of users who engage with "refine interpretations" flow
- % of interpretations marked as accurate by users
- Qualitative feedback: "This feels like someone really gets me"

### Profile Depth
- Avg length of interpretation text (richer = better)
- Number of therapeutic frameworks triggered per user
- Diversity of patterns detected

### Matching Quality
- Do interpretation-based matches lead to better conversations?
- Do users report feeling "seen" by their matches?
- Reduction in mismatched expectations

---

## Next Steps

### Immediate (Fix Slice 1c Issues First)
1. Fix context windows issue - verify profile view works as intended
2. Make name field required
3. Remove off-the-record checkbox
4. Fix CSV input for core values/constraints

### Phase 2 Planning (Interpretation Engine)
1. Design interpretation JSON schema in detail
2. Build therapeutic prompt library (Maté, Perel, Gottman)
3. Create analysis pipeline (trigger, LLM call, store, display)
4. Add interpretations fields to Prisma schema
5. Build minimal profile view showing interpretations
6. Test with real user conversations

### Future Phases
- Continuous refinement based on user feedback
- Multi-framework synthesis
- Matching algorithm based on interpretations
- "Growth edges" and "shadow work" insights (advanced)

---

## Open Questions

1. **How much interpretation is too much?** Risk of feeling "psychoanalyzed" vs "understood"
2. **How do we handle disagreement?** User says we're wrong - do we defer to them or surface the disconnect?
3. **Cultural sensitivity:** Therapeutic frameworks are Western-centric - how do we adapt?
4. **Timing:** When is it too early to show interpretations? (after 5 messages? 20 messages?)
5. **Confidence thresholds:** What % confidence before we show an interpretation?
6. **Multiple frameworks contradicting:** Maté says one thing, Perel says another - how do we synthesize?

---

## Related Documents
- `/dev/tickets/slice-1-issues.md` - Current implementation issues
- `/dev/tickets/slice-1c-frontend-ui.md` - Current profile view implementation
- `/dev/logs/slice-1-option1-architecture-2025-12-22.md` - Data model architecture

---

**This is the north star.** The current rigid forms are a temporary scaffold. The real product is therapeutic interpretation that makes users feel deeply understood.
