# Phase 3: Fluid Context-Aware Attribute Interpretation

**Status**: Future Vision - NOT for immediate implementation
**Prerequisites**:
- Complete Phase 2 (interpretation engine with Gabor Maté framework)
- Onboard 50+ real users
- Gather data on what actually makes people compatible
- Document compatibility framework with real-world examples

**Copied from planning session**: 2025-12-26

---

## Overview

Transform from rigid forms to **passive, always-listening interpretation** where the bot automatically extracts and classifies:
- Values, interests, beliefs, lifestyle from natural conversation
- Which contexts each attribute applies to (romantic, friendship, professional, universal)
- Context-specific weights for matching algorithms

**Key Principle**: User doesn't explicitly "switch modes". They naturally talk about different relationship types, and the bot understands context from conversation.

---

## Design Philosophy

### FROM: Form-Based Profiles
- User fills out dropdown menus
- Checkbox matching: "We both like hiking"
- Rigid categories
- Same fields for romantic and friendship

### TO: Interpreted Attributes with Context Awareness
- User chats naturally: "I love hiking on weekends with close friends"
- Bot extracts: interest=hiking, contexts=[friendship,romantic], frequency=weekly
- Pattern matching: "You both value active outdoor time with intimate groups"
- Different matching weights by context (political alignment matters more in romantic)

---

## What Needs to Be Defined (With Real Examples)

Before implementing this phase, we need to document:

### 1. What Makes People Compatible?

**Romantic Relationships:**
- [ ] Add your own examples of what made past romantic connections work/not work
- [ ] What values were non-negotiable?
- [ ] What interests created bonding?
- [ ] What lifestyle factors caused friction?

**Friendships:**
- [ ] What makes a great friendship for you?
- [ ] What shared interests matter most?
- [ ] What values align with your close friends?

**See**: `/Users/don/Projects/matchmade/dev/vision/compatibility-framework.md` (to be created)

### 2. Context-Specific Weights

Which attributes matter more in which contexts?

Example structure (fill in with your experience):
```
Romantic:
- Political alignment: Critical (9/10) - "I can't date someone with opposite politics"
- Shared interests: Important (7/10) - "Nice to have but not a dealbreaker"
- Social style: Important (7/10) - "I need someone who likes intimate gatherings"

Friendship:
- Political alignment: Moderate (4/10) - "Can disagree and still be friends"
- Shared interests: Critical (9/10) - "Need activities to do together"
- Social style: Critical (8/10) - "Similar energy levels matter"
```

### 3. Hierarchy of Attributes

Which attributes are:
- Universal (apply to all relationships)?
- Context-specific (only romantic, or only friendship)?
- Conditional (depends on the person)?

---

## Technical Architecture (Rough Sketch)

### Schema Changes
- Add `Profile.attributes` JSON field for interpreted attributes
- Each attribute tagged with applicable contexts
- Confidence scores and evidence quotes

### Interpretation Pipeline
- Extract values, interests, beliefs, lifestyle from chat
- Classify which contexts apply to each attribute
- Merge with existing attributes (don't overwrite unless contradicted)

### Matching Algorithm
- Apply context-specific weights
- Filter attributes by active context
- Score compatibility based on overlap + complementary patterns

---

## Why Wait?

1. **Need real data**: We don't know yet what actually predicts good matches
2. **Need user language**: Your own examples will make this authentic
3. **Complex change**: This touches schema, interpretation, matching - high risk
4. **Phase 2 incomplete**: Need to validate current interpretation engine first

---

## Next Steps (When Ready)

1. **Document compatibility framework** with real examples
2. **Run Phase 2 with real users** (50-100 conversations)
3. **Analyze what patterns** correlate with successful matches
4. **Refine attribute extraction** based on user feedback
5. **Design context-aware matching** with validated weights
6. **Implement Phase 3** with proven approach

---

**Full technical plan**: See `/Users/don/.claude/plans/squishy-snacking-lollipop.md`

**For now**: Focus on Phase 2 testing and gathering real user data.
