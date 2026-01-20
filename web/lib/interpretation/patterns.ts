/**
 * Pattern extraction from chat transcripts
 * Analyzes word frequency, themes, and tone for input to LLM analysis
 */

import { RawPatterns } from "./types";

interface ChatMessage {
  role: string;
  content: string | null;
  offRecord: boolean;
}

/**
 * Extract raw patterns from chat messages
 * Filters to user messages only, excludes off-the-record
 */
export async function extractPatterns(
  messages: ChatMessage[]
): Promise<RawPatterns> {
  // Filter: only user messages, not off-the-record
  const userMessages = messages
    .filter((m) => m.role === "user" && !m.offRecord)
    .map((m) => m.content)
    .filter(Boolean) as string[];

  if (userMessages.length === 0) {
    return {
      word_frequency: {},
      themes: [],
      tone: "neutral",
      message_count: 0,
      analyzed_at: new Date().toISOString(),
    };
  }

  // Word frequency (exclude common stop words)
  const wordFreq = calculateWordFrequency(userMessages);

  // Theme extraction (pattern matching for keywords)
  const themes = extractThemes(userMessages);

  // Tone analysis (simple heuristics)
  const tone = analyzeTone(userMessages);

  return {
    word_frequency: wordFreq,
    themes,
    tone,
    message_count: userMessages.length,
    analyzed_at: new Date().toISOString(),
  };
}

/**
 * Calculate word frequency from messages
 * Excludes common stop words, returns top 20 meaningful words
 */
function calculateWordFrequency(messages: string[]): Record<string, number> {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "is",
    "are",
    "was",
    "were",
    "i",
    "you",
    "me",
    "my",
    "your",
    "that",
    "this",
    "it",
    "have",
    "has",
    "had",
    "be",
    "been",
    "being",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "can",
    "may",
    "might",
    "must",
    "shall",
    "from",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "between",
    "under",
    "again",
    "further",
    "then",
    "once",
  ]);

  const words: Record<string, number> = {};
  messages.forEach((msg) => {
    // Extract words: 4+ characters, letters only
    const tokens = msg.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    tokens.forEach((word) => {
      if (!stopWords.has(word)) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  // Return top 20
  return Object.fromEntries(
    Object.entries(words)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
  );
}

/**
 * Extract psychological themes from messages
 * Based on keyword matching for common relationship/emotional themes
 */
function extractThemes(messages: string[]): string[] {
  const themeKeywords: Record<string, string[]> = {
    authenticity: ["authentic", "real", "genuine", "honest", "true self"],
    emotional_safety: [
      "safe",
      "safety",
      "secure",
      "trust",
      "comfortable",
      "protected",
    ],
    attachment: [
      "close",
      "closeness",
      "distance",
      "independence",
      "together",
      "alone",
      "connection",
    ],
    vulnerability: [
      "vulnerable",
      "open",
      "sharing",
      "expose",
      "reveal",
      "weakness",
    ],
    growth: [
      "grow",
      "growth",
      "learn",
      "develop",
      "evolve",
      "improve",
      "better",
    ],
    control: [
      "control",
      "manage",
      "handle",
      "protect",
      "guard",
      "defensive",
    ],
    intimacy: [
      "intimate",
      "intimacy",
      "close",
      "deep",
      "meaningful",
      "emotional",
    ],
    boundaries: [
      "boundary",
      "boundaries",
      "space",
      "limits",
      "respect",
      "personal",
    ],
    fear: ["fear", "scared", "afraid", "worry", "anxious", "nervous"],
    desire: ["want", "need", "hope", "wish", "desire", "looking for"],
  };

  const text = messages.join(" ").toLowerCase();
  const detectedThemes: string[] = [];

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    if (keywords.some((kw) => text.includes(kw))) {
      detectedThemes.push(theme);
    }
  });

  return detectedThemes;
}

/**
 * Analyze overall tone of messages
 * Simple heuristic-based classification
 */
function analyzeTone(messages: string[]): string {
  const text = messages.join(" ").toLowerCase();

  // Count sentiment indicators
  const anxiousWords = text.match(
    /\b(worried|anxious|scared|fear|nervous|stress|overwhelm)\b/g
  );
  const reflectiveWords = text.match(
    /\b(think|consider|reflect|understand|wonder|realize|notice)\b/g
  );
  const confidentWords = text.match(
    /\b(confident|sure|certain|know|believe|clear)\b/g
  );
  const aspirationalWords = text.match(
    /\b(want|need|hope|wish|desire|dream|goal)\b/g
  );

  const counts = {
    anxious: anxiousWords?.length || 0,
    reflective: reflectiveWords?.length || 0,
    confident: confidentWords?.length || 0,
    aspirational: aspirationalWords?.length || 0,
  };

  // Return dominant tone
  const maxCount = Math.max(...Object.values(counts));
  if (maxCount === 0) return "neutral";

  const dominantTone = Object.entries(counts).find(
    ([, count]) => count === maxCount
  )?.[0];
  return dominantTone || "neutral";
}
