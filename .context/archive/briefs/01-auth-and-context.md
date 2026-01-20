Feature: Auth + Conversational Onboarding + Basic Routing

Goal: Enable sign up/in, conversationally determine what they're looking for, explain how the app works, and land in per-context workspace.

Scope (In):
- Magic link or email/password auth.
- Conversational onboarding where agent:
  - Introduces itself naturally (cool, California vibe - not kitschy)
  - Explains what it can help with (friends, romance, professional networking, creative collabs)
  - Asks what they're looking for right now
  - Explains app philosophy: values-first, attraction second, meet in real life, honest matching
  - Determines context(s) from conversation
- Create ContextProfile records per selected context; default tone to 'light' (can adapt later).
- Basic routing to per-context chat workspace.

Scope (Out):
- Full profile building (that happens in chat after onboarding).
- Media upload; notifications; matching.
- Tone preference selection (agent adapts naturally; user doesn't need to choose upfront).

Models touched:
- User, ContextProfile.

UX states:
- Auth screen (sign up/in).
- Conversational onboarding (chat-style interface, agent-led).
- Success redirect to selected context chat.

Conversational Flow:
1. Agent intro: "Hey, I'm here to help you meet the right people—whether that's finding new friends, meeting someone you could fall for, or networking personally or professionally."
2. Explains approach: "Here's how this works: we focus on what matters to you first (values, lifestyle, what you're actually looking for), then attraction, then we help you meet in real life. No endless swiping. No games. Just honest connections."
3. Asks: "So what brings you here? What are you hoping to find right now?"
4. Based on response, creates context(s) and lands in chat.

Guardrails / Non-negotiables:
- Keep it cool and natural, not kitschy or corny.
- No gamification/feeds; one primary action per screen.
- Respect explicit context tracks (no blending).
- Don't ask about "tone preference" upfront - agent stays light and cool initially, can adapt later.
- Focus on what they're looking for, not how they want to be talked to.

Acceptance checks:
- New user can sign up and have a natural conversation about what they're looking for.
- Agent explains app philosophy clearly.
- ContextProfile created based on what user says they want.
- User lands in per-context chat workspace.

Tests:
- Auth flow happy path.
- Conversational onboarding creates correct context(s).
- User lands in chat after onboarding.
- Context tracks stay separate.
