/**
 * Extraction Agent - Extracts structured profile data from conversations
 *
 * Analyzes chat messages to extract:
 * - Shared profile fields (location, age, values, etc.)
 * - Context-specific intent fields (relationship goals, preferences)
 *
 * Only extracts high-confidence data (≥0.80) to avoid bad inferences.
 */

import { generateCompletion, type LLMMessage, type LLMOptions } from "../llm-client";
import { ProfileDto, ContextIntentPatch } from "../types";

export interface ExtractionResult {
  profile: Partial<ProfileDto>;
  intent: ContextIntentPatch;
  confidence: {
    profile: Record<string, number>;
    intent: Record<string, number>;
  };
}

const CONFIDENCE_THRESHOLD = 0.80;

function buildExtractionPrompt(contextType: string): string {
  const intentFields: Record<string, string> = {
    romantic: `
- relationshipTimeline: What pace they want (e.g., "taking it slow", "ready for commitment", "open to seeing where it goes")
- exclusivityExpectation: Monogamy preference (e.g., "strictly monogamous", "open to non-monogamy", "polyamorous")
- familyIntentions: Kids/family goals (e.g., "wants kids", "doesn't want kids", "already has kids", "undecided")
- attractionImportance: How much physical attraction matters (e.g., "very important", "matters but not everything", "personality first")`,
    friendship: `
- friendshipDepth: Type of friendship sought (e.g., "casual hangout buddy", "deep meaningful friendship", "activity partner")
- groupActivityPreference: Social style (e.g., "one-on-one", "small groups", "larger social gatherings")
- emotionalSupportExpectation: Support level expected (e.g., "someone to vent to", "mutual support", "keeping it light")`,
    professional: `
- partnershipType: What they're looking for (e.g., "co-founder", "advisor", "collaborator", "mentor")
- commitmentHorizon: Time commitment (e.g., "full-time", "part-time", "project-based", "advisory")
- complementarySkills: Skills they're seeking (array of skills)
- equityOrRevShare: Compensation expectations (e.g., "equity split", "revenue share", "paid contractor")`,
    creative: `
- creativeType: Creative domain (e.g., "music", "visual art", "writing", "film", "design")
- roleNeeded: What role they need (e.g., "collaborator", "producer", "performer", "technical")
- processStyle: How they like to work (e.g., "structured", "improvisational", "iterative")
- egoBalance: Credit/control preferences (e.g., "equal partners", "I lead", "supporting role")
- compensationExpectation: Payment expectations (e.g., "passion project", "revenue share", "paid work")`,
    service: `
- serviceType: What service they need (e.g., "therapist", "coach", "contractor", "consultant")
- budgetRange: Budget level (e.g., "budget-conscious", "mid-range", "premium")
- timelineNeeded: Urgency (e.g., "ASAP", "within a month", "flexible")
- credentialsRequired: Credential preferences (e.g., "licensed required", "experience over credentials", "referrals preferred")`,
  };

  return `You are an extraction agent analyzing a conversation to build a relationship profile.

## Your Task
Extract structured data from the conversation. Only extract information that is **clearly stated or strongly implied**. Do not infer or guess.

## Shared Profile Fields (apply to all contexts)
- location: Where they live or are based (city, region, or country)
- ageRange: Their age or age range (e.g., "early 30s", "mid-20s", "45")
- name: Their name if mentioned
- coreValues: Core values they express (array, e.g., ["honesty", "adventure", "family"])
- constraints: Hard boundaries or dealbreakers (array, e.g., ["no smoking", "must love dogs"])

## Context-Specific Intent Fields (${contextType})
${intentFields[contextType] || "No specific fields for this context."}

## Rules
1. **High confidence only**: Only include a field if you're ≥80% confident based on what they said
2. **Direct evidence**: Base extractions on explicit statements, not assumptions
3. **Conservative**: When in doubt, leave it out
4. **Exact language**: Use their words when possible, don't over-interpret

## Output Format
Return valid JSON with this structure:
{
  "profile": {
    "location": "string or null",
    "ageRange": "string or null",
    "name": "string or null",
    "coreValues": ["value1", "value2"] or null,
    "constraints": ["constraint1"] or null
  },
  "intent": {
    // Only include fields relevant to ${contextType} context
    // Set to null if not mentioned or uncertain
  },
  "confidence": {
    "profile": {
      "location": 0.0-1.0,
      "ageRange": 0.0-1.0,
      // ... for each extracted field
    },
    "intent": {
      // ... for each extracted field
    }
  }
}

IMPORTANT:
- Use null for fields with no evidence
- Confidence must reflect how certain you are based on explicit statements
- Only include fields in confidence that you attempted to extract`;
}

/**
 * Extract profile data from chat messages
 */
export async function extractFromMessages(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  contextType: string,
  options?: LLMOptions
): Promise<ExtractionResult | null> {
  // Need at least a few messages to extract meaningfully
  if (messages.length < 3) {
    return null;
  }

  // Build conversation transcript (user messages are most important)
  const transcript = messages
    .map((m) => `${m.role === "user" ? "User" : "Agent"}: ${m.content}`)
    .join("\n\n");

  const llmMessages: LLMMessage[] = [
    {
      role: "system",
      content: buildExtractionPrompt(contextType),
    },
    {
      role: "user",
      content: `## Conversation Transcript\n\n${transcript}\n\n## Extract Now\nAnalyze the conversation above and extract profile data. Return JSON only.`,
    },
  ];

  try {
    const response = await generateCompletion(llmMessages, {
      temperature: 0.3, // Low temperature for consistent extraction
      max_tokens: 1000,
      ...options,
    });

    // Parse JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[Extraction] No JSON found in response");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Filter to only high-confidence extractions
    const result = filterByConfidence(parsed);

    return result;
  } catch (error) {
    console.error("[Extraction] Failed:", error);
    return null;
  }
}

/**
 * Filter extraction result to only include high-confidence fields
 */
function filterByConfidence(parsed: any): ExtractionResult {
  const result: ExtractionResult = {
    profile: {},
    intent: {},
    confidence: {
      profile: {},
      intent: {},
    },
  };

  // Filter profile fields
  if (parsed.profile && parsed.confidence?.profile) {
    for (const [field, value] of Object.entries(parsed.profile)) {
      const confidence = parsed.confidence.profile[field];
      if (value !== null && confidence >= CONFIDENCE_THRESHOLD) {
        (result.profile as any)[field] = value;
        result.confidence.profile[field] = confidence;
      }
    }
  }

  // Filter intent fields
  if (parsed.intent && parsed.confidence?.intent) {
    for (const [field, value] of Object.entries(parsed.intent)) {
      const confidence = parsed.confidence.intent[field];
      if (value !== null && confidence >= CONFIDENCE_THRESHOLD) {
        (result.intent as any)[field] = value;
        result.confidence.intent[field] = confidence;
      }
    }
  }

  return result;
}

/**
 * Check if extraction result has any data worth saving
 */
export function hasExtractedData(result: ExtractionResult): boolean {
  const profileFields = Object.keys(result.profile).length;
  const intentFields = Object.keys(result.intent).length;
  return profileFields > 0 || intentFields > 0;
}

/**
 * Get summary of what was extracted (for logging)
 */
export function getExtractionSummary(result: ExtractionResult): string {
  const profileFields = Object.keys(result.profile);
  const intentFields = Object.keys(result.intent);

  if (profileFields.length === 0 && intentFields.length === 0) {
    return "No high-confidence data extracted";
  }

  const parts: string[] = [];
  if (profileFields.length > 0) {
    parts.push(`Profile: ${profileFields.join(", ")}`);
  }
  if (intentFields.length > 0) {
    parts.push(`Intent: ${intentFields.join(", ")}`);
  }

  return parts.join(" | ");
}
