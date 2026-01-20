/**
 * Main interpretation engine - Gabor Maté framework analysis
 * Analyzes chat transcripts and generates therapeutic insights
 */

import { prisma } from "../prisma";
import { generateSimpleCompletion } from "../llm-client";
import { extractPatterns } from "./patterns";
import { buildGaborMatePrompt } from "./prompts/gabor-mate";
import {
  AnalysisResult,
  GaborMateAnalysis,
} from "./types";

/**
 * Analyze user profile using Gabor Maté framework
 * Returns analysis result or null if insufficient data/confidence
 */
export async function analyzeUserProfile(
  userId: string,
  contextType: string
): Promise<AnalysisResult | null> {
  console.log(
    `[Interpretation] Starting analysis for user ${userId}, context: ${contextType}`
  );

  // 1. Fetch all non-off-the-record chat messages for this user/context
  const contextProfile = await prisma.contextProfile.findUnique({
    where: {
      userId_contextType: {
        userId,
        contextType: contextType as any,
      },
    },
    include: {
      chatMessages: {
        where: { offRecord: false },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!contextProfile) {
    console.log(`[Interpretation] No context profile found`);
    return null;
  }

  const messageCount = contextProfile.chatMessages.length;
  console.log(`[Interpretation] Found ${messageCount} messages`);

  // Check minimum message threshold
  if (messageCount < 10) {
    console.log(
      `[Interpretation] Insufficient messages for analysis (need ≥10, have ${messageCount})`
    );
    return null;
  }

  // 2. Extract raw patterns
  const patterns = await extractPatterns(contextProfile.chatMessages);
  console.log(
    `[Interpretation] Extracted patterns: ${patterns.themes.length} themes, tone: ${patterns.tone}`
  );

  // 3. Build chat transcript (user messages only)
  const chatTranscript = contextProfile.chatMessages
    .filter((m) => m.role === "user" && m.content)
    .map((m) => `User: ${m.content}`)
    .join("\n\n");

  if (!chatTranscript) {
    console.log(`[Interpretation] No user messages found`);
    return null;
  }

  // 4. Build Gabor Maté prompt
  const prompt = buildGaborMatePrompt(chatTranscript, patterns, contextType);

  // 5. Call LLM with structured output
  try {
    console.log(`[Interpretation] Calling LLM API...`);

    const responseText = await generateSimpleCompletion(prompt, {
      temperature: 0.7,
      max_tokens: 2000,
    });

    if (!responseText) {
      throw new Error("Empty LLM response");
    }

    console.log(`[Interpretation] Received LLM response`);

    // Parse JSON response
    const gaborMateAnalysis: GaborMateAnalysis = parseAnalysisResponse(responseText);

    // 6. Validate confidence thresholds
    if (gaborMateAnalysis.attachment_style.confidence < 0.7) {
      console.log(
        `[Interpretation] Attachment style confidence too low (${gaborMateAnalysis.attachment_style.confidence}), skipping`
      );
      return null;
    }

    if (gaborMateAnalysis.underlying_needs.confidence < 0.7) {
      console.log(
        `[Interpretation] Underlying needs confidence too low (${gaborMateAnalysis.underlying_needs.confidence}), skipping`
      );
      return null;
    }

    console.log(
      `[Interpretation] Analysis passed confidence thresholds. Attachment: ${gaborMateAnalysis.attachment_style.primary} (${gaborMateAnalysis.attachment_style.confidence})`
    );

    // 7. Build final result
    const result: AnalysisResult = {
      frameworks: {
        gabor_mate: gaborMateAnalysis,
      },
      summary: generateSummary(gaborMateAnalysis),
      generated_at: new Date().toISOString(),
      version: "1.0",
    };

    // 8. Store in database
    await prisma.profile.update({
      where: { userId },
      data: {
        interpretations: result as any,
        rawPatterns: patterns as any,
        lastAnalyzed: new Date(),
      },
    });

    console.log(`[Interpretation] Analysis complete`);

    return result;
  } catch (error) {
    console.error("[Interpretation] LLM analysis failed:", error);
    // Don't crash - return null to indicate failure
    return null;
  }
}

/**
 * Parse JSON response from LLM, handling potential formatting issues
 */
function parseAnalysisResponse(responseText: string): GaborMateAnalysis {
  try {
    // Try to find JSON in response (sometimes LLM adds markdown formatting)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!parsed.attachment_style || !parsed.underlying_needs) {
      throw new Error("Missing required fields in response");
    }

    return parsed as GaborMateAnalysis;
  } catch (error) {
    console.error(
      "[Interpretation] Failed to parse LLM response:",
      responseText.substring(0, 200)
    );
    throw new Error(`Failed to parse LLM response: ${error}`);
  }
}

/**
 * Generate human-readable summary from Gabor Maté analysis
 */
function generateSummary(analysis: GaborMateAnalysis): string {
  const needs = analysis.underlying_needs.primary.slice(0, 3).join(", ");
  const attachmentInsight = analysis.attachment_style.insight;

  return `You value ${needs} in relationships. ${attachmentInsight}`;
}

/**
 * Check if user has been analyzed recently (for caching/rate limiting)
 */
export async function needsAnalysis(
  userId: string,
  maxAgeHours: number = 24
): Promise<boolean> {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { lastAnalyzed: true },
  });

  if (!profile || !profile.lastAnalyzed) {
    return true; // Never analyzed
  }

  const hoursSinceAnalysis =
    (Date.now() - profile.lastAnalyzed.getTime()) / (1000 * 60 * 60);

  return hoursSinceAnalysis >= maxAgeHours;
}
