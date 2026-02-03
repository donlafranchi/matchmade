# Phase 2, Ticket 02: MVP Interpretation Pipeline (Gabor Maté Framework)

**Mode:** Single-Dev
**Brief:** Phase 2 - Interpretation Engine (from `/dev/vision/profile-as-interpretation.md`)
**Build Order:** Phase 2, Step 2 (after schema migration)
**Prerequisites:** Ticket 2-01 complete (interpretation fields exist)
**Created:** 2025-12-24

---

## Goal

Build a minimal viable interpretation pipeline that analyzes chat transcripts using the Gabor Maté therapeutic framework (attachment theory, trauma-informed needs analysis) and stores structured insights in the Profile.interpretations field. This establishes the foundation for all future therapeutic frameworks.

## User Story

As a system, I want to analyze user chat messages through the Gabor Maté lens so that I can generate insights about attachment styles, underlying emotional needs, and relationship patterns that help users feel deeply understood.

## Acceptance Criteria

- [ ] Analysis service created at `lib/interpretation/analyze.ts`
- [ ] Gabor Maté prompt template created at `lib/interpretation/prompts/gabor-mate.ts`
- [ ] Pattern extraction function analyzes chat transcript for:
  - [ ] Word frequency analysis (top 20 meaningful words)
  - [ ] Repeated themes (attachment, safety, authenticity, etc.)
  - [ ] Emotional tone (reflective, anxious, confident, etc.)
  - [ ] Message count and conversation depth metrics
- [ ] LLM integration calls OpenAI/Anthropic API with structured output
- [ ] Gabor Maté analysis detects:
  - [ ] Primary attachment style (secure, anxious, avoidant, disorganized) with confidence 0-1
  - [ ] Underlying emotional needs (safety, authenticity, acceptance, etc.) with evidence
  - [ ] Trauma-informed patterns (defense mechanisms, coping strategies) when present
  - [ ] Authentic self vs adapted self indicators
- [ ] Analysis output stored in Profile.interpretations following JSON schema
- [ ] Raw pattern data stored in Profile.rawPatterns
- [ ] Profile.lastAnalyzed timestamp updated after successful analysis
- [ ] Analysis triggered manually via function call (background jobs in later ticket)
- [ ] Error handling for LLM API failures (retry logic, fallback)
- [ ] Token usage tracking for cost monitoring
- [ ] Confidence threshold: Only store insights with ≥70% confidence
- [ ] Analysis only uses non-off-the-record messages
- [ ] Minimum message threshold: Requires ≥10 messages to analyze
- [ ] Analysis completes within 30 seconds for 100 messages
- [ ] No security vulnerabilities (API keys secured, user data protected)

## Dependencies

### Prerequisites (must exist):
- [x] Ticket 2-01 complete (Profile.interpretations, rawPatterns, lastAnalyzed exist)
- [x] ChatMessage table with stored messages
- [x] OpenAI or Anthropic API credentials configured
- [ ] Environment variables: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`

### Blockers (if any):
- None (can use either OpenAI or Anthropic)

## Technical Requirements

### New Files

**`lib/interpretation/types.ts`** (~80 LOC)
```typescript
export interface InterpretationFramework {
  name: string;
  insights: FrameworkInsight[];
}

export interface FrameworkInsight {
  category: string;
  primary: string | string[];
  confidence: number;  // 0.0 to 1.0
  evidence: string[];
  insight?: string;    // Human-readable interpretation
}

export interface GaborMateAnalysis {
  attachment_style: {
    primary: 'secure' | 'anxious' | 'avoidant' | 'disorganized' | 'mixed';
    confidence: number;
    evidence: string[];
    insight: string;
  };
  underlying_needs: {
    primary: string[];  // ["safety", "authenticity", "acceptance", ...]
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

export interface RawPatterns {
  word_frequency: Record<string, number>;
  themes: string[];
  tone: string;
  message_count: number;
  analyzed_at: string;  // ISO timestamp
}

export interface AnalysisResult {
  frameworks: {
    gabor_mate: GaborMateAnalysis;
  };
  summary: string;
  generated_at: string;  // ISO timestamp
  version: string;
}
```

**`lib/interpretation/patterns.ts`** (~120 LOC)
```typescript
import { ChatMessage } from '@prisma/client';

export async function extractPatterns(messages: ChatMessage[]): Promise<RawPatterns> {
  // Filter: only user messages, not off-the-record
  const userMessages = messages
    .filter(m => m.role === 'user' && !m.offRecord)
    .map(m => m.content)
    .filter(Boolean) as string[];

  // Word frequency (exclude common stop words)
  const wordFreq = calculateWordFrequency(userMessages);

  // Theme extraction (pattern matching for keywords)
  const themes = extractThemes(userMessages);

  // Tone analysis (simple heuristics + LLM optional)
  const tone = analyzeTone(userMessages);

  return {
    word_frequency: wordFreq,
    themes,
    tone,
    message_count: userMessages.length,
    analyzed_at: new Date().toISOString()
  };
}

function calculateWordFrequency(messages: string[]): Record<string, number> {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'i', 'you', 'me', 'my']);

  const words: Record<string, number> = {};
  messages.forEach(msg => {
    const tokens = msg.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    tokens.forEach(word => {
      if (!stopWords.has(word)) {
        words[word] = (words[word] || 0) + 1;
      }
    });
  });

  // Return top 20
  return Object.fromEntries(
    Object.entries(words)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
  );
}

function extractThemes(messages: string[]): string[] {
  const themeKeywords = {
    authenticity: ['authentic', 'real', 'genuine', 'honest', 'true self'],
    emotional_safety: ['safe', 'safety', 'secure', 'trust', 'comfortable'],
    attachment: ['close', 'closeness', 'distance', 'independence', 'together'],
    vulnerability: ['vulnerable', 'open', 'sharing', 'expose', 'reveal'],
    growth: ['grow', 'growth', 'learn', 'develop', 'evolve'],
    control: ['control', 'manage', 'handle', 'protect', 'guard']
  };

  const text = messages.join(' ').toLowerCase();
  const detectedThemes: string[] = [];

  Object.entries(themeKeywords).forEach(([theme, keywords]) => {
    if (keywords.some(kw => text.includes(kw))) {
      detectedThemes.push(theme);
    }
  });

  return detectedThemes;
}

function analyzeTone(messages: string[]): string {
  const text = messages.join(' ').toLowerCase();

  // Simple heuristic analysis
  if (text.match(/\b(worried|anxious|scared|fear|nervous)\b/)) return 'anxious';
  if (text.match(/\b(think|consider|reflect|understand|wonder)\b/)) return 'reflective';
  if (text.match(/\b(confident|sure|certain|know|believe)\b/)) return 'confident';
  if (text.match(/\b(want|need|hope|wish|desire)\b/)) return 'aspirational';

  return 'neutral';
}
```

**`lib/interpretation/prompts/gabor-mate.ts`** (~150 LOC)
```typescript
import { RawPatterns } from '../types';

export function buildGaborMatePrompt(
  chatTranscript: string,
  patterns: RawPatterns,
  contextType: string
): string {
  return `You are a therapeutic interpreter trained in Gabor Maté's framework of attachment theory, trauma-informed psychology, and emotional needs analysis. Your role is to analyze user language patterns with empathy, nuance, and without pathologizing normal relationship patterns.

## Context
- Relationship context: ${contextType}
- Number of messages analyzed: ${patterns.message_count}
- Detected themes: ${patterns.themes.join(', ')}
- Overall tone: ${patterns.tone}

## Chat Transcript (User Messages Only)
${chatTranscript}

## Word Frequency Patterns
${Object.entries(patterns.word_frequency).slice(0, 10).map(([word, count]) => `- "${word}": ${count} times`).join('\n')}

## Your Task

Analyze this user's language through the Gabor Maté lens and generate insights about:

1. **Attachment Style**: Identify primary attachment pattern (secure, anxious, avoidant, disorganized, or mixed) based on:
   - How they describe relationships and connection
   - Their expressed needs for closeness vs distance
   - Fear patterns (abandonment vs engulfment)
   - Self-descriptions and relationship history cues

2. **Underlying Emotional Needs**: Beyond stated wants, what core needs emerge?
   - Safety, authenticity, acceptance, autonomy, belonging, growth, etc.
   - Look for repeated language revealing unmet needs

3. **Trauma-Informed Patterns** (only if clearly present):
   - Defense mechanisms (intellectualization, avoidance, projection)
   - Coping strategies (hypervigilance, people-pleasing, withdrawal)
   - Do NOT diagnose trauma - only note patterns IF confidence >70%

4. **Authentic Self vs Adapted Self**:
   - Indicators of who they really are vs who they've learned to be
   - Tension between stated values and expressed fears
   - Signs of self-awareness about patterns

## Important Guidelines

- **Confidence Threshold**: Only include insights where you're ≥70% confident based on evidence
- **Non-Judgmental Tone**: Reflect patterns, don't pathologize
- **Evidence-Based**: Every insight must cite specific language examples
- **Admit Uncertainty**: If insufficient data, say "insufficient evidence" for that category
- **Growth-Oriented**: Frame patterns as understandable responses, not flaws
- **No Diagnosis**: You're interpreting patterns, not diagnosing disorders

## Output Format (JSON)

Respond with valid JSON matching this structure:

{
  "attachment_style": {
    "primary": "secure" | "anxious" | "avoidant" | "disorganized" | "mixed",
    "confidence": 0.70-1.0,
    "evidence": ["specific quote 1", "specific quote 2", ...],
    "insight": "Human-readable interpretation: 'You seem to...'"
  },
  "underlying_needs": {
    "primary": ["need1", "need2", "need3"],
    "confidence": 0.70-1.0,
    "evidence": ["specific evidence 1", "specific evidence 2", ...]
  },
  "trauma_patterns": {  // Only include if confidence ≥70%
    "defense_mechanisms": ["mechanism1", ...],
    "coping_strategies": ["strategy1", ...],
    "confidence": 0.70-1.0,
    "evidence": ["specific evidence 1", ...]
  },
  "authentic_vs_adapted": {  // Only include if confidence ≥70%
    "indicators": ["indicator1", "indicator2", ...],
    "confidence": 0.70-1.0,
    "evidence": ["specific evidence 1", ...],
    "insight": "Human-readable interpretation"
  }
}

Begin analysis:`;
}
```

**`lib/interpretation/analyze.ts`** (~200 LOC)
```typescript
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { extractPatterns } from './patterns';
import { buildGaborMatePrompt } from './prompts/gabor-mate';
import { AnalysisResult, GaborMateAnalysis } from './types';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeUserProfile(
  userId: string,
  contextType: string
): Promise<AnalysisResult | null> {
  // 1. Fetch all non-off-the-record chat messages for this user/context
  const contextProfile = await prisma.contextProfile.findUnique({
    where: { userId_contextType: { userId, contextType } },
    include: {
      chatMessages: {
        where: { offRecord: false },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!contextProfile || contextProfile.chatMessages.length < 10) {
    console.log(`Insufficient messages for analysis (need ≥10, have ${contextProfile?.chatMessages.length || 0})`);
    return null;
  }

  // 2. Extract raw patterns
  const patterns = await extractPatterns(contextProfile.chatMessages);

  // 3. Build chat transcript (user messages only)
  const chatTranscript = contextProfile.chatMessages
    .filter(m => m.role === 'user' && m.content)
    .map(m => `User: ${m.content}`)
    .join('\n\n');

  // 4. Build Gabor Maté prompt
  const prompt = buildGaborMatePrompt(chatTranscript, patterns, contextType);

  // 5. Call LLM with structured output
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-08-06',  // Supports structured output
      messages: [
        { role: 'system', content: 'You are a therapeutic interpreter using Gabor Maté\'s framework.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) throw new Error('Empty LLM response');

    const gaborMateAnalysis: GaborMateAnalysis = JSON.parse(responseText);

    // 6. Validate confidence thresholds
    if (gaborMateAnalysis.attachment_style.confidence < 0.7) {
      console.log('Attachment style confidence too low, skipping');
      return null;
    }

    // 7. Build final result
    const result: AnalysisResult = {
      frameworks: {
        gabor_mate: gaborMateAnalysis
      },
      summary: generateSummary(gaborMateAnalysis),
      generated_at: new Date().toISOString(),
      version: '1.0'
    };

    // 8. Store in database
    await prisma.profile.update({
      where: { userId },
      data: {
        interpretations: result as any,
        rawPatterns: patterns as any,
        lastAnalyzed: new Date()
      }
    });

    // Log token usage for cost monitoring
    console.log(`Analysis complete. Tokens used: ${completion.usage?.total_tokens || 0}`);

    return result;

  } catch (error) {
    console.error('LLM analysis failed:', error);
    // TODO: Implement retry logic in later ticket
    throw error;
  }
}

function generateSummary(analysis: GaborMateAnalysis): string {
  const needs = analysis.underlying_needs.primary.slice(0, 3).join(', ');
  return `You value ${needs} in relationships. ${analysis.attachment_style.insight}`;
}
```

### Integration Points

- Reads from ChatMessage table (non-off-the-record messages only)
- Writes to Profile.interpretations, Profile.rawPatterns, Profile.lastAnalyzed
- Connects to ContextProfile to filter messages by context
- Calls OpenAI API (or Anthropic as alternative)

### API/LLM Configuration

**Environment Variables:**
```env
OPENAI_API_KEY=sk-...
# Or alternatively:
ANTHROPIC_API_KEY=sk-ant-...
```

**Cost Estimation:**
- ~2000 tokens per analysis (estimate)
- GPT-4o: $0.005/1K input tokens + $0.015/1K output = ~$0.04 per analysis
- For 1000 users = ~$40 (one-time analysis)
- Re-analysis trigger strategy in later ticket will control costs

## Constraints

- ≤ 620 LOC per slice
- ≤ 2 new dependencies (OpenAI SDK or Anthropic SDK + stop-words library)
- Must handle LLM API failures gracefully
- Must respect rate limits (implement basic retry logic)
- Confidence threshold ≥70% for storing insights
- Minimum 10 messages required for analysis

## Test Plan

### Unit Tests

- Test `extractPatterns()`:
  - With 0 messages → returns empty patterns
  - With 5 user messages → calculates word frequency correctly
  - With off-the-record messages → excludes them from analysis
  - With varied content → detects themes correctly
  - With emotional language → identifies tone correctly

- Test `calculateWordFrequency()`:
  - Filters stop words correctly
  - Returns top 20 words
  - Handles empty input
  - Case-insensitive matching

- Test `extractThemes()`:
  - Detects 'authenticity' theme when keywords present
  - Detects 'emotional_safety' theme when keywords present
  - Returns empty array when no themes detected
  - Handles multiple overlapping themes

- Test `buildGaborMatePrompt()`:
  - Includes chat transcript
  - Includes pattern data
  - Includes context type
  - Valid prompt structure

### Integration Tests

- Test `analyzeUserProfile()` (using mock LLM):
  - With <10 messages → returns null
  - With 10+ messages → calls LLM and stores result
  - With LLM returning low confidence → returns null
  - With LLM returning high confidence → stores in Profile.interpretations
  - Updates Profile.lastAnalyzed timestamp
  - Stores rawPatterns correctly

- Test LLM integration (real API, dev environment):
  - Call with sample chat transcript → receives valid JSON response
  - Response matches GaborMateAnalysis type
  - Confidence scores are 0-1 range
  - Evidence arrays contain strings

### Manual Testing Checklist

- [ ] Set up OpenAI API key in environment
- [ ] Create test user with 15+ chat messages
- [ ] Run `analyzeUserProfile(userId, 'romantic')`
- [ ] Verify Profile.interpretations contains Gabor Maté analysis
- [ ] Verify Profile.rawPatterns contains word frequency data
- [ ] Verify Profile.lastAnalyzed is recent timestamp
- [ ] Check analysis quality:
  - [ ] Attachment style seems reasonable based on chat content
  - [ ] Evidence quotes are actual user messages
  - [ ] Insights are empathetic and non-judgmental
  - [ ] Confidence scores are ≥0.7
- [ ] Test with insufficient messages (< 10) → returns null
- [ ] Test with all off-the-record messages → returns null
- [ ] Monitor token usage in console logs
- [ ] Verify error handling: Set invalid API key → graceful failure

### Product Validation

- [ ] Analysis feels empathetic and understanding (not clinical)
- [ ] Insights are evidence-based (cite actual user language)
- [ ] No pathologizing or diagnostic language
- [ ] Confidence threshold prevents low-quality insights
- [ ] Users would feel "seen" by these interpretations

## Readiness

- [x] Ticket 2-01 complete (schema migration)
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive
- [x] No blockers

## Implementation Notes

### Critical Details

**Minimum Message Threshold:**
- Require ≥10 non-off-the-record user messages
- This ensures enough data for meaningful analysis
- Return null if insufficient messages (no error, just skip)

**Confidence Filtering:**
- Only store insights with confidence ≥0.7
- This prevents speculative or low-quality interpretations
- Better to have no insight than wrong insight

**Cost Control:**
- Log token usage for every analysis
- Monitor costs in development
- Future ticket will add caching and re-analysis triggers
- Current approach: manual trigger only (no automatic background jobs yet)

**LLM Choice:**
- OpenAI GPT-4o recommended (supports structured output)
- Anthropic Claude 3.5 Sonnet alternative (use claude-3-5-sonnet-20241022)
- Either works, implement one first (OpenAI easier for structured JSON)

**Error Handling:**
- Log LLM API failures but don't crash
- Return null on failure (retry in later ticket)
- Don't store partial/incomplete analysis
- Validate JSON structure before storing

**Privacy & Security:**
- Never log full chat transcripts to external services (truncate in logs)
- API keys secured in environment variables
- Analysis happens server-side only (never client-side)
- Off-the-record messages excluded automatically

### Edge Cases

1. **User has only assistant messages (no user messages):**
   - Should return null (can't analyze empty user input)

2. **User messages are very short (1-2 words each):**
   - Pattern extraction still runs
   - LLM may return low confidence → filtered out

3. **Chat is in non-English language:**
   - Current implementation assumes English
   - Future: Language detection + multilingual prompts

4. **User discusses multiple relationships/contexts:**
   - Analysis is per-context (romantic, friendship, etc.)
   - Each context analyzed separately

5. **LLM returns invalid JSON:**
   - Catch parse error, log, return null
   - Don't store invalid data

### Future Enhancements (Not in This Ticket)

- Retry logic for LLM failures (Ticket 2-04)
- Background job triggers (Ticket 2-04)
- Caching/staleness detection (Ticket 2-04)
- Additional frameworks (Tickets 2-07, 2-08)
- Multi-framework synthesis (Ticket 2-09)
- User feedback loop (Ticket 2-10)

## Next Steps

After this ticket is complete:
1. Test analysis on 5-10 real user transcripts
2. Evaluate quality of Gabor Maté insights
3. Adjust prompt if needed for better results
4. Monitor token costs and optimize if needed
5. **Proceed to Ticket 2-03:** LLM Prompt Library (organize prompts as reusable templates)
6. **Or Ticket 2-04:** Background Job System (automate analysis triggers)
