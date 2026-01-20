/**
 * Type definitions for the Interpretation Engine (Phase 2)
 * Defines structures for therapeutic framework analysis and insights
 */

export interface InterpretationFramework {
  name: string;
  insights: FrameworkInsight[];
}

export interface FrameworkInsight {
  category: string;
  primary: string | string[];
  confidence: number; // 0.0 to 1.0
  evidence: string[];
  insight?: string; // Human-readable interpretation
}

/**
 * Gabor Maté Framework Analysis
 * Focus: Attachment theory, trauma-informed needs, authentic vs adapted self
 */
export interface GaborMateAnalysis {
  attachment_style: {
    primary: "secure" | "anxious" | "avoidant" | "disorganized" | "mixed";
    confidence: number;
    evidence: string[];
    insight: string;
  };
  underlying_needs: {
    primary: string[]; // ["safety", "authenticity", "acceptance", ...]
    confidence: number;
    evidence: string[];
  };
  trauma_patterns?: {
    defense_mechanisms: string[];
    coping_strategies: string[];
    confidence: number;
    evidence: string[];
  };
  authentic_vs_adapted?: {
    indicators: string[];
    confidence: number;
    evidence: string[];
    insight: string;
  };
}

/**
 * Raw pattern data extracted from chat transcripts
 * Used as input to LLM analysis
 */
export interface RawPatterns {
  word_frequency: Record<string, number>;
  themes: string[];
  tone: string;
  message_count: number;
  analyzed_at: string; // ISO timestamp
}

/**
 * Complete analysis result stored in Profile.interpretations
 */
export interface AnalysisResult {
  frameworks: {
    gabor_mate: GaborMateAnalysis;
  };
  summary: string;
  generated_at: string; // ISO timestamp
  version: string;
}
