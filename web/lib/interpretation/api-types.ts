/**
 * Shared types between backend and frontend for interpretation API
 * Used by GET /api/profile/interpretations endpoint
 */

export interface InterpretationInsight {
  category?: string;
  primary?: string;
  confidence: number;
  evidence: string[];
  insight: string;
}

export interface GaborMateAttachmentStyle {
  primary: string; // "secure" | "anxious" | "avoidant" | "anxious-avoidant"
  confidence: number;
  insight: string;
  evidence: string[];
}

export interface GaborMateUnderlyingNeeds {
  primary: string[]; // ["safety", "authenticity", "acceptance"]
  confidence: number;
  evidence: string[];
}

export interface GaborMateTraumaPatterns {
  defense_mechanisms: string[];
  coping_strategies: string[];
  confidence: number;
  evidence: string[];
}

export interface GaborMateAuthenticVsAdapted {
  indicators: string[];
  confidence: number;
  insight: string;
  evidence: string[];
}

export interface GaborMateInterpretation {
  attachment_style: GaborMateAttachmentStyle;
  underlying_needs: GaborMateUnderlyingNeeds;
  trauma_patterns?: GaborMateTraumaPatterns;
  authentic_vs_adapted?: GaborMateAuthenticVsAdapted;
}

export interface EstherPerelInterpretation {
  desire_paradox?: InterpretationInsight;
  intimacy_style?: InterpretationInsight;
}

export interface SharedInterpretations {
  frameworks: {
    gabor_mate?: GaborMateInterpretation;
  };
  summary: string;
  generated_at: string;
  version: string;
}

export interface ContextSpecificInterpretations {
  frameworks: {
    esther_perel?: EstherPerelInterpretation;
    // More frameworks in future tickets
  };
  summary?: string;
  generated_at?: string;
  version?: string;
}

export interface RawPatterns {
  message_count: number;
  word_frequency: Record<string, number>;
  themes: string[];
  tone: string;
}

export type AnalysisStatus =
  | "not_started" // <10 messages, never analyzed
  | "pending" // Job queued
  | "processing" // Job running
  | "completed" // Analysis done
  | "failed"; // Analysis failed

export interface InterpretationsMeta {
  lastAnalyzed: string | null;
  status: AnalysisStatus;
  error?: string;
  messageCount: number;
  hasMinimumData: boolean; // true if messageCount >= 10
}

export interface InterpretationsResponse {
  // Shared interpretations (from Profile)
  shared: SharedInterpretations | null;

  // Context-specific interpretations (from ContextIntent)
  contextSpecific: ContextSpecificInterpretations | null;

  // Metadata
  meta: InterpretationsMeta;

  // Optional: Raw patterns for transparency/debugging
  patterns?: RawPatterns;
}
