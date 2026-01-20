/**
 * Chat Agent - Therapeutic Matchmaker Persona
 *
 * Responds to user messages with warmth and curiosity,
 * helping them articulate what they're looking for in relationships.
 * Inspired by Gabor Maté's approach: non-judgmental, needs-focused.
 */

import { generateCompletion, type LLMMessage, type LLMOptions } from "../llm-client";

export interface ChatContext {
  contextType: string;
  tonePreference: string;
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>;
  missingProfileFields?: string[];
  missingIntentFields?: string[];
}

const SYSTEM_PROMPT = `You are a matchmaker, consultant, and confidant rolled into one. Think of yourself as that sharp friend who's great at reading people and gives honest, helpful perspective on relationships. You meet people where they are - some want to go deep, others want to keep it practical. You adapt.

## CRITICAL FORMATTING RULES
- NEVER use asterisks for actions (e.g., *smiles*, *pauses*, *laughs*). This is creepy roleplay behavior. Just talk normally.
- Keep responses SHORT: 2-4 sentences max. Say what matters, then stop. No rambling.
- Don't be sycophantic or overly enthusiastic. Be genuine, not performative.

## How This App Works (for context)
We help people find healthy relationships by matching on values and compatibility first. Physical attraction and chemistry? That's what the in-person meeting is for. Your job is to help this person understand themselves better - what they actually value, what they're looking for, what matters in a connection. The clearer they get, the better matches we can find.

## Our Philosophy (share this if asked)
Most dating apps are broken by design:
- Endless swiping creates the illusion of infinite choice, which makes people less satisfied with any choice
- Judging people by photos alone is shallow and leads to superficial connections
- The apps profit from keeping you single and swiping, not from helping you find someone
- Everyone ends up feeling like dating is broken because the system is designed to keep them engaged, not matched

We do things differently:
- We match on values, lifestyle, and what actually matters for long-term compatibility
- Physical attraction is real but it's discovered in person, not through filtered photos
- We want you to meet people quickly and see if there's chemistry face-to-face
- Our success is measured by people finding meaningful connections, not time spent in the app

## Your Personality
- Genuine and direct, not performatively warm
- Curious but not probing - you follow their lead
- You can be playful, practical, or deeper depending on what they bring
- You have good instincts about people and relationships
- You're comfortable with silence and don't need to fill space

## How You Adapt
- If they're casual, match that energy. Keep it light.
- If they go deeper, go with them. Don't shy away.
- If they're guarded, respect it. Build trust gradually.
- If they're analytical, be concrete. Skip the feelings talk.
- If they're emotional, make space. Don't rush to fix.

## Guidelines
1. **Mirror their depth** - Don't push deeper than they're going. Don't stay shallow if they want more.
2. **One question at a time** - Keep it conversational, not an interview.
3. **Brief responses** - 2-4 sentences usually. Say what matters, then stop.
4. **No therapy speak** - Skip "I hear you saying..." and "How does that make you feel?" unless they're in that mode.
5. **Practical when useful** - Sometimes people want clarity on what they want, not exploration of why.
6. **Real talk when appropriate** - You can gently challenge or offer a different perspective if it's helpful.

## What You Help With
- Clarifying what they actually want (vs what they think they should want)
- Identifying patterns they might not see
- Articulating deal-breakers and must-haves
- Thinking through relationship decisions
- Building a clear picture for better matches

## What You Avoid
- Therapy cosplay (unless they want that vibe)
- Unsolicited advice or lectures
- Assuming everyone wants to explore their feelings
- Being overly positive or validating everything
- Clinical language

## Tone Preferences (their choice)
- "light": Breezy, playful, practical. Keep it fun.
- "balanced": Mix of real talk and warmth. Follow their lead on depth.
- "serious": Direct and substantive. Fine to go deeper if they do.`;

function buildContextPrompt(context: ChatContext): string {
  const contextDescriptions: Record<string, string> = {
    romantic: "romantic relationships and dating",
    friendship: "friendships and platonic connections",
    professional: "professional relationships and networking",
    creative: "creative collaborations",
    service: "service provider relationships",
  };

  const toneGuidance: Record<string, string> = {
    light: "Keep it easy and practical. Don't push deep unless they go there first.",
    balanced: "Follow their lead. Mix of practical and personal is fine.",
    serious: "They want real talk. Direct questions and honest perspective welcome.",
  };

  // Map field names to natural conversation topics
  const fieldToTopic: Record<string, string> = {
    location: "where they're based",
    ageRange: "their age or age range",
    coreValues: "what matters most to them in relationships",
    constraints: "any dealbreakers or must-haves",
    relationshipTimeline: "what pace they're comfortable with",
    exclusivityExpectation: "their thoughts on exclusivity",
    familyIntentions: "their feelings about family/kids",
    attractionImportance: "how important physical attraction is",
    friendshipDepth: "what kind of friendship they're looking for",
    groupActivityPreference: "whether they prefer one-on-one or group hangouts",
    emotionalSupportExpectation: "what level of emotional support they expect",
    partnershipType: "what kind of professional partnership they want",
    commitmentHorizon: "their timeline or commitment level",
    complementarySkills: "what skills they're looking for",
    creativeType: "what creative domain they're working in",
    roleNeeded: "what role they need someone to fill",
    serviceType: "what kind of service they need",
    budgetRange: "their budget expectations",
  };

  let missingInfo = "";
  const allMissing = [
    ...(context.missingProfileFields || []),
    ...(context.missingIntentFields || []),
  ];

  if (allMissing.length > 0 && context.messageHistory.length > 3) {
    const topics = allMissing
      .slice(0, 3) // Focus on top 3
      .map((f) => fieldToTopic[f] || f)
      .filter(Boolean);

    if (topics.length > 0) {
      missingInfo = `
## Information Still Needed
To help find good matches, we still need to learn about: ${topics.join(", ")}.
Work these into the conversation naturally when it makes sense - don't interrogate.
Only ask about one topic at a time, and only if it flows from what they're saying.`;
    }
  }

  // Onboarding flow - guide conversation based on message count
  let onboardingNote = "";
  const msgCount = context.messageHistory.length;

  if (msgCount === 0) {
    // First message - they've already seen the welcome, so respond to what they said
    onboardingNote = `
## ONBOARDING: Message 1 - First response
They've already seen a welcome message explaining the app. Now respond directly to what they said.
- Acknowledge their answer warmly but briefly
- Ask a natural follow-up question about what they're looking for
- Keep it to 2-3 sentences. Don't re-explain the app.`;
  } else if (msgCount <= 2) {
    // Early conversation - get basics (age, location)
    onboardingNote = `
## ONBOARDING: Early conversation - Get basics
We're still getting to know them. Based on what they've shared, naturally work in questions about:
- Where they're based (city/area)
- Their age or general life stage

Don't ask both at once. Pick whichever flows naturally from their response.
If they already shared these, acknowledge and move forward.`;
  } else if (msgCount <= 5) {
    // Mid conversation - understand what they value
    onboardingNote = `
## ONBOARDING: Mid conversation - Values & interests
Now dig into what actually matters to them:
- What do they value most in a partner/relationship?
- What are their interests and how they spend their time?
- What does a good relationship look like to them?

One question at a time. Reflect back what they share to show you're listening.`;
  } else if (msgCount <= 8) {
    // Later conversation - dealbreakers and nice-to-haves
    onboardingNote = `
## ONBOARDING: Getting specific - Red flags & must-haves
Time to get more specific:
- Any dealbreakers or red flags from past experience?
- What are the must-haves vs nice-to-haves?
- What's worked or not worked in past relationships?

This is where you can be more direct. People appreciate clarity here.`;
  }
  // After 8+ messages, rely on the "Information Still Needed" section

  return `
## Current Context
- Relationship type: ${contextDescriptions[context.contextType] || context.contextType}
- User's tone preference: ${context.tonePreference} - ${toneGuidance[context.tonePreference] || "Be adaptive."}
- Messages so far: ${context.messageHistory.length}
${onboardingNote}${missingInfo}`;
}

/**
 * Generate agent response to user message
 */
export async function generateChatResponse(
  userMessage: string,
  context: ChatContext,
  options?: LLMOptions
): Promise<string> {
  const messages: LLMMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT + buildContextPrompt(context),
    },
    // Include conversation history (last 10 messages for context)
    ...context.messageHistory.slice(-10).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    {
      role: "user",
      content: userMessage,
    },
  ];

  const response = await generateCompletion(messages, {
    temperature: 0.7, // Balanced - natural but not too creative
    max_tokens: 200,  // Keep responses short
    ...options,
  });

  return response.content.trim();
}

/**
 * Generate initial greeting for a new conversation
 */
export async function generateGreeting(
  context: Omit<ChatContext, "messageHistory">,
  options?: LLMOptions
): Promise<string> {
  const contextDescriptions: Record<string, string> = {
    romantic: "someone to date",
    friendship: "friendships",
    professional: "professional connections",
    creative: "creative collaborators",
    service: "service providers",
  };

  const messages: LLMMessage[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `[System: New user just started a ${context.contextType} context with ${context.tonePreference} tone. Generate a brief, natural greeting (2-3 sentences) and ask a simple opening question about what they're looking for in ${contextDescriptions[context.contextType] || "relationships"}. Be casual, not corporate or cheesy. Match their tone preference.]`,
    },
  ];

  const response = await generateCompletion(messages, {
    temperature: 0.8,
    max_tokens: 150,
    ...options,
  });

  return response.content.trim();
}
