# Architecture: Therapeutic Interpretation Engine (Phase 2)

## Overview

The Therapeutic Interpretation Engine is the core intelligence layer that transforms raw chat transcripts into therapeutic insights. This system analyzes user conversations through multiple therapeutic frameworks (Gabor Maté, Esther Perel, John Gottman, IFS, Attachment Theory) to generate empathetic, evidence-based interpretations about the user's emotional patterns, relational dynamics, and underlying needs.

The architecture follows a **pipeline model**: chat messages trigger background analysis jobs that invoke Claude (Anthropic) with framework-specific prompts, extract structured interpretations, and store them in the existing Profile and ContextIntent models. The system is designed to be incremental (analyzing only new messages), cost-conscious (caching aggressively), and privacy-first (all interpretations are user-scoped and encrypted at rest).

This phase integrates seamlessly with the existing Profile/ContextIntent foundation (Slice 1) by adding interpretation fields to those models rather than creating new tables. The engine supports user feedback loops: users can flag inaccurate interpretations, triggering re-analysis with additional context.

**Key Architectural Decisions**:
- **Anthropic Claude 3.5 Sonnet** as the LLM (structured outputs, large context window, cost-effective)
- **Background job queue** (using a simple database-backed task queue initially, scalable to BullMQ later)
- **Incremental analysis**: Track `lastAnalyzedMessageId` to avoid re-processing entire chat histories
- **Dual storage**: Interpretations stored in both Profile (shared insights) and ContextIntent (context-specific insights)
- **Caching layer**: Redis-backed interpretation cache (1 hour TTL) to avoid redundant API calls
- **Extensible framework system**: Each therapeutic framework is a separate module for easy addition of new frameworks

## File Structure

```
lib/
├── interpretation/
│   ├── engine.ts                    # Main orchestration layer (trigger, queue, analyze)
│   ├── analyzer.ts                  # LLM invocation + structured output parsing
│   ├── frameworks/
│   │   ├── index.ts                 # Framework registry
│   │   ├── gabor-mate.ts            # Attachment + trauma lens
│   │   ├── esther-perel.ts          # Desire + paradox (romantic only)
│   │   ├── john-gottman.ts          # Communication patterns
│   │   ├── ifs.ts                   # Internal Family Systems
│   │   └── attachment-theory.ts     # Attachment styles
│   ├── prompts.ts                   # LLM prompt templates
│   ├── schemas.ts                   # Zod schemas for structured outputs
│   ├── cache.ts                     # Redis caching layer
│   ├── cost-tracker.ts              # Token usage monitoring
│   └── types.ts                     # TypeScript types
├── interpretation-storage.ts        # Store interpretations in Profile/ContextIntent
├── background-jobs.ts               # Task queue implementation
└── anthropic.ts                     # Anthropic SDK client singleton

prisma/
└── schema.prisma                    # Updated with interpretation fields

app/api/
├── interpretation/
│   ├── analyze/route.ts             # POST - trigger manual analysis
│   ├── feedback/route.ts            # POST - submit interpretation feedback
│   └── status/route.ts              # GET - check analysis status
└── webhooks/
    └── background-jobs/route.ts     # POST - process queued jobs (internal)

app/components/
├── InterpretationPanel.tsx          # Display interpretations on profile view
├── InterpretationFeedback.tsx       # User feedback UI (flag/clarify)
└── AnalysisProgress.tsx             # Real-time progress indicator

.env
# Add ANTHROPIC_API_KEY
# Add REDIS_URL (optional, falls back to in-memory)
```

## Database Schema Changes

```prisma
// Add to existing Profile model
model Profile {
  // ... existing fields ...

  // NEW: Therapeutic interpretations (shared across contexts)
  interpretations      Json            @default("{}")
  // Structure: { [frameworkId]: { insights: Insight[], confidence: number, lastUpdated: DateTime } }

  // NEW: Raw pattern analysis
  rawPatterns         Json            @default("{}")
  // Structure: { wordFrequency: {}, themes: [], sentimentScores: [], toneAnalysis: {} }

  // NEW: Tracking for incremental updates
  lastAnalyzedAt      DateTime?
  lastAnalyzedMessageId String?
  analysisVersion     Int             @default(1)  // Bump when we change analysis logic

  // NEW: User feedback tracking
  feedbackCount       Int             @default(0)
  feedbackData        Json            @default("[]")  // Array of feedback objects
}

// Add to existing ContextIntent model
model ContextIntent {
  // ... existing fields ...

  // NEW: Context-specific interpretations
  interpretations      Json            @default("{}")
  // Structure: { [frameworkId]: { insights: Insight[], confidence: number, lastUpdated: DateTime } }

  // NEW: Context-specific raw patterns
  rawPatterns         Json            @default("{}")

  // NEW: Tracking for incremental updates
  lastAnalyzedAt      DateTime?
  lastAnalyzedMessageId String?
  analysisVersion     Int             @default(1)

  // NEW: User feedback tracking
  feedbackCount       Int             @default(0)
  feedbackData        Json            @default("[]")
}

// NEW: Background job queue model
model BackgroundJob {
  id              String          @id @default(cuid())
  jobType         BackgroundJobType
  status          JobStatus       @default(pending)
  priority        Int             @default(5)      // 1 (highest) to 10 (lowest)

  // Job payload (userId, contextType, etc.)
  payload         Json

  // Execution tracking
  attempts        Int             @default(0)
  maxAttempts     Int             @default(3)
  lastError       String?

  // Result storage
  result          Json?

  // Timing
  createdAt       DateTime        @default(now())
  scheduledFor    DateTime        @default(now())
  startedAt       DateTime?
  completedAt     DateTime?

  @@index([status, scheduledFor, priority])
  @@index([jobType, status])
}

enum BackgroundJobType {
  interpret_chat      // Analyze chat messages
  reanalyze_profile   // Re-run analysis with new feedback
  refresh_stale       // Refresh analyses older than threshold
}

enum JobStatus {
  pending
  running
  completed
  failed
  cancelled
}
```

### Migration Considerations

**Migration Steps**:
1. Add new fields to Profile and ContextIntent with safe defaults (empty JSON objects)
2. Create BackgroundJob table
3. Add indexes for job queue performance
4. No data migration needed (fields start empty, populated on first analysis)

**Performance Implications**:
- JSON fields are indexed by PostgreSQL's GIN indexes for fast querying
- Job queue indexes on `(status, scheduledFor, priority)` for efficient polling
- Consider partitioning BackgroundJob table by createdAt after 100k+ jobs

## Components

### InterpretationPanel

- **Purpose**: Displays therapeutic interpretations on the profile/context view
- **Location**: `/Users/don/Projects/matchmade/web/app/components/InterpretationPanel.tsx`
- **Props Interface**:
```typescript
interface InterpretationPanelProps {
  userId: string;
  contextType?: RelationshipContextType;  // If present, shows context-specific insights
  onFeedback?: (interpretationId: string, feedback: FeedbackData) => void;
}
```
- **State Management**: Fetches interpretations from Profile/ContextIntent via API, displays by framework
- **Key Behaviors**:
  - Groups interpretations by framework (tabs or accordion)
  - Shows confidence scores as visual indicators (0-100%)
  - Displays evidence quotes from chat in expandable sections
  - Renders "last updated" timestamp
  - Provides feedback buttons (helpful/not helpful) per interpretation
  - Shows loading state while analysis is running
- **Dependencies**: InterpretationFeedback component, AnalysisProgress component

### InterpretationFeedback

- **Purpose**: Modal/drawer for users to provide detailed feedback on interpretations
- **Location**: `/Users/don/Projects/matchmade/web/app/components/InterpretationFeedback.tsx`
- **Props Interface**:
```typescript
interface InterpretationFeedbackProps {
  interpretationId: string;
  framework: TherapeuticFramework;
  insight: Insight;
  onSubmit: (feedback: FeedbackData) => Promise<void>;
  onClose: () => void;
}
```
- **State Management**: Local form state (feedback type, clarification text)
- **Key Behaviors**:
  - Radio buttons: "Accurate", "Partially accurate", "Inaccurate", "Missing context"
  - Text area for clarification (optional)
  - Submit triggers re-analysis job with feedback context
  - Shows success message after submission
- **Dependencies**: API route `/api/interpretation/feedback`

### AnalysisProgress

- **Purpose**: Real-time progress indicator during interpretation analysis
- **Location**: `/Users/don/Projects/matchmade/web/app/components/AnalysisProgress.tsx`
- **Props Interface**:
```typescript
interface AnalysisProgressProps {
  userId: string;
  contextType?: RelationshipContextType;
}
```
- **State Management**: Polls `/api/interpretation/status` every 2 seconds
- **Key Behaviors**:
  - Shows spinner + message: "Analyzing your conversations..."
  - Displays framework completion: "✓ Attachment patterns identified"
  - Shows estimated time remaining (based on message count)
  - Auto-hides when analysis completes
  - Shows error state if analysis fails
- **Dependencies**: Status API polling

## Type Definitions

```typescript
// lib/interpretation/types.ts

export type TherapeuticFramework =
  | 'gabor_mate'
  | 'esther_perel'
  | 'john_gottman'
  | 'ifs'
  | 'attachment_theory';

export type InsightType =
  | 'pattern'          // Recurring behavioral/emotional pattern
  | 'need'             // Underlying psychological need
  | 'dynamic'          // Relational dynamic or tension
  | 'strength'         // Positive capacity or resource
  | 'growth_edge';     // Area for development

export interface Evidence {
  messageId: string;
  quote: string;          // Exact text from chat
  timestamp: string;      // ISO datetime
}

export interface Insight {
  id: string;             // Unique ID for this insight
  type: InsightType;
  title: string;          // Short label (e.g., "Anxious attachment pattern")
  description: string;    // Empathetic explanation (2-3 sentences)
  confidence: number;     // 0-100
  evidence: Evidence[];   // Supporting quotes from chat
  createdAt: string;      // ISO datetime
  updatedAt: string;      // ISO datetime
}

export interface FrameworkInterpretation {
  framework: TherapeuticFramework;
  insights: Insight[];
  confidence: number;     // Overall confidence for this framework (0-100)
  lastUpdated: string;    // ISO datetime
  messageCount: number;   // Number of messages analyzed
}

export interface RawPatterns {
  // Word frequency analysis
  wordFrequency: Record<string, number>;
  topWords: Array<{ word: string; count: number; sentiment: number }>;

  // Thematic analysis
  themes: Array<{
    theme: string;
    prevalence: number;  // 0-1
    examples: string[];
  }>;

  // Sentiment analysis
  overallSentiment: number;  // -1 to 1
  sentimentByMessage: Array<{
    messageId: string;
    sentiment: number;
    magnitude: number;
  }>;

  // Tone analysis
  tone: {
    formality: number;    // 0-1
    emotionality: number; // 0-1
    assertiveness: number; // 0-1
  };
}

export interface InterpretationStorage {
  [frameworkId: string]: FrameworkInterpretation;
}

export type FeedbackType =
  | 'accurate'
  | 'partially_accurate'
  | 'inaccurate'
  | 'missing_context';

export interface FeedbackData {
  interpretationId: string;
  framework: TherapeuticFramework;
  feedbackType: FeedbackType;
  clarification?: string;
  timestamp: string;
}

export interface AnalysisResult {
  userId: string;
  contextType: RelationshipContextType | null;
  frameworks: FrameworkInterpretation[];
  rawPatterns: RawPatterns;
  messageCount: number;
  tokensUsed: number;
  analysisTimeMs: number;
}

export interface AnalysisJobPayload {
  userId: string;
  contextType?: RelationshipContextType;
  fromMessageId?: string;  // For incremental analysis
  feedbackContext?: FeedbackData[];  // Include user feedback for re-analysis
  priority?: number;
}

export interface AnalysisStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: {
    currentFramework: TherapeuticFramework;
    completedFrameworks: TherapeuticFramework[];
    totalFrameworks: number;
  };
  result?: AnalysisResult;
  error?: string;
}
```

## API Endpoints

### POST /api/interpretation/analyze

**Purpose**: Manually trigger interpretation analysis for a user's chat history

**Request**:
```typescript
interface AnalyzeRequest {
  contextType?: RelationshipContextType;  // If omitted, analyzes shared profile
  force?: boolean;  // Skip cache, re-analyze everything
}
```

**Response**:
```typescript
interface AnalyzeResponse {
  jobId: string;
  status: 'queued' | 'running' | 'completed';
  estimatedSeconds?: number;
}
```

**Logic Flow**:
1. Authenticate user (requireSessionUser)
2. Check if analysis is already in progress for this user+context
3. Check cache: if interpretations exist and fresh (< 1 hour), return immediately
4. Create BackgroundJob with type=interpret_chat, priority=3 (user-initiated)
5. If queue is empty, process immediately; otherwise return job ID
6. Return job status

**Error Handling**:
- 401: Unauthorized (no session)
- 409: Analysis already in progress
- 500: Failed to queue job

### POST /api/interpretation/feedback

**Purpose**: Submit user feedback on a specific interpretation

**Request**:
```typescript
interface FeedbackRequest {
  interpretationId: string;
  framework: TherapeuticFramework;
  feedbackType: FeedbackType;
  clarification?: string;
  contextType?: RelationshipContextType;
}
```

**Response**:
```typescript
interface FeedbackResponse {
  success: boolean;
  reanalysisJobId: string;  // Job ID for re-analysis triggered by feedback
}
```

**Logic Flow**:
1. Authenticate user
2. Append feedback to Profile.feedbackData or ContextIntent.feedbackData (JSON array)
3. Increment feedbackCount
4. Create BackgroundJob with type=reanalyze_profile, priority=2 (higher than normal)
5. Include feedback in job payload for LLM to consider
6. Return job ID

**Error Handling**:
- 401: Unauthorized
- 404: Interpretation not found
- 400: Invalid feedback data
- 500: Failed to store feedback

### GET /api/interpretation/status

**Purpose**: Check analysis job status and retrieve results when complete

**Query Params**:
- `jobId` (optional): Check specific job
- `contextType` (optional): Get latest analysis status for context

**Response**:
```typescript
interface StatusResponse {
  status: JobStatus;
  progress?: {
    currentFramework: TherapeuticFramework;
    completedFrameworks: TherapeuticFramework[];
    totalFrameworks: number;
  };
  result?: {
    interpretations: InterpretationStorage;
    rawPatterns: RawPatterns;
  };
  error?: string;
}
```

**Logic Flow**:
1. Authenticate user
2. If jobId provided, query BackgroundJob table
3. If contextType provided, check Profile/ContextIntent for lastAnalyzedAt
4. Return current status + result if completed

**Error Handling**:
- 401: Unauthorized
- 404: Job not found
- 500: Database error

### POST /api/webhooks/background-jobs (Internal)

**Purpose**: Process queued background jobs (called by cron or worker process)

**Authentication**: Internal only (validate secret token)

**Logic Flow**:
1. Query pending jobs ordered by (priority ASC, scheduledFor ASC)
2. Take oldest high-priority job
3. Update status to 'running', set startedAt
4. Execute job based on jobType
5. Store result, update status to 'completed', set completedAt
6. On failure: increment attempts, update lastError, reset to pending if attempts < maxAttempts

## Core Services

### InterpretationEngine (lib/interpretation/engine.ts)

**Purpose**: Orchestrates the entire interpretation analysis pipeline

**Key Functions**:

```typescript
export async function triggerAnalysis(
  userId: string,
  contextType?: RelationshipContextType,
  options?: { force?: boolean; priority?: number }
): Promise<string> {
  // Check cache
  // Create BackgroundJob
  // Return job ID
}

export async function processAnalysisJob(jobId: string): Promise<AnalysisResult> {
  // Load job payload
  // Fetch chat messages (incremental: only new since lastAnalyzedMessageId)
  // Invoke analyzer for each framework
  // Aggregate results
  // Store in Profile/ContextIntent
  // Update cache
  // Return result
}

export async function getInterpretations(
  userId: string,
  contextType?: RelationshipContextType
): Promise<InterpretationStorage> {
  // Check cache first
  // Fall back to database
  // Return interpretations
}

export async function shouldAnalyze(
  userId: string,
  contextType?: RelationshipContextType
): Promise<boolean> {
  // Check if lastAnalyzedAt is > 1 hour ago
  // Check if new messages exist since lastAnalyzedMessageId
  // Return true if stale or new data available
}
```

**Dependencies**: analyzer.ts, interpretation-storage.ts, cache.ts, background-jobs.ts

### Analyzer (lib/interpretation/analyzer.ts)

**Purpose**: Invokes Claude with therapeutic framework prompts and extracts structured insights

**Key Functions**:

```typescript
export async function analyzeMessages(
  messages: ChatMessage[],
  framework: TherapeuticFramework,
  contextType?: RelationshipContextType,
  feedbackContext?: FeedbackData[]
): Promise<FrameworkInterpretation> {
  // Load framework module
  // Build prompt with messages + feedback
  // Invoke Claude with structured output schema
  // Parse and validate response
  // Extract insights + confidence
  // Return FrameworkInterpretation
}

export async function analyzeRawPatterns(
  messages: ChatMessage[]
): Promise<RawPatterns> {
  // Extract word frequency (exclude stopwords)
  // Identify themes using Claude
  // Calculate sentiment per message
  // Analyze tone characteristics
  // Return RawPatterns
}
```

**Dependencies**: anthropic.ts, prompts.ts, schemas.ts, frameworks/

### Framework Modules (lib/interpretation/frameworks/)

Each framework module exports:

```typescript
export interface FrameworkModule {
  id: TherapeuticFramework;
  name: string;
  description: string;
  applicableContexts: RelationshipContextType[] | 'all';
  buildPrompt: (
    messages: ChatMessage[],
    contextType?: RelationshipContextType,
    feedbackContext?: FeedbackData[]
  ) => string;
  extractInsights: (claudeResponse: any) => Insight[];
}
```

**Example: Gabor Maté Framework** (lib/interpretation/frameworks/gabor-mate.ts)

```typescript
export const gaborMateFramework: FrameworkModule = {
  id: 'gabor_mate',
  name: 'Attachment & Trauma Lens',
  description: 'Identifies attachment styles, emotional patterns, and underlying needs through a compassionate, trauma-informed lens',
  applicableContexts: 'all',

  buildPrompt: (messages, contextType, feedbackContext) => {
    return `You are a compassionate therapist trained in Gabor Maté's approach...

    Analyze these chat messages to identify:
    1. Attachment patterns (secure, anxious, avoidant)
    2. Emotional regulation strategies
    3. Underlying needs that may be unmet
    4. Patterns of self-compassion or self-criticism

    Messages:
    ${messages.map(m => `[${m.createdAt}] ${m.role}: ${m.content}`).join('\n')}

    ${feedbackContext ? `Previous feedback to consider:\n${feedbackContext.map(f => f.clarification).join('\n')}` : ''}

    Respond with empathetic, non-judgmental insights...`;
  },

  extractInsights: (response) => {
    // Parse Claude's structured response
    // Map to Insight[] format
    return insights;
  }
};
```

**Other Frameworks**:

- **Esther Perel** (esther-perel.ts): Romantic context only. Analyzes desire, paradox, intimacy vs. autonomy tensions
- **John Gottman** (john-gottman.ts): Communication patterns, Four Horsemen (criticism, contempt, defensiveness, stonewalling), repair attempts
- **IFS** (ifs.ts): Identifies internal parts (managers, firefighters, exiles), internal conflicts
- **Attachment Theory** (attachment-theory.ts): Deep dive into attachment styles with specific behavioral examples

### Prompt Templates (lib/interpretation/prompts.ts)

**Purpose**: Reusable prompt components and formatting utilities

```typescript
export function buildSystemPrompt(framework: TherapeuticFramework): string {
  // Returns framework-specific system prompt
}

export function formatMessages(messages: ChatMessage[]): string {
  // Formats messages for Claude input
  // Handles off-record markers
  // Adds timestamps
}

export function buildFeedbackContext(feedback: FeedbackData[]): string {
  // Formats user feedback for inclusion in prompt
}

export const SHARED_INSTRUCTIONS = `
When generating insights:
- Use empathetic, non-judgmental language
- Focus on patterns, not single events
- Provide specific evidence from the chat
- Assign confidence scores (0-100) based on evidence strength
- Frame insights as "Here's what we're noticing..." rather than definitive statements
`;
```

### Structured Output Schemas (lib/interpretation/schemas.ts)

**Purpose**: Zod schemas for validating Claude's structured responses

```typescript
import { z } from 'zod';

export const InsightSchema = z.object({
  type: z.enum(['pattern', 'need', 'dynamic', 'strength', 'growth_edge']),
  title: z.string(),
  description: z.string(),
  confidence: z.number().min(0).max(100),
  evidence: z.array(z.object({
    quote: z.string(),
    messageId: z.string(),
  })),
});

export const FrameworkInterpretationSchema = z.object({
  insights: z.array(InsightSchema),
  overallConfidence: z.number().min(0).max(100),
  summary: z.string(),
});

export function validateInterpretation(data: unknown): FrameworkInterpretation {
  // Validates and parses Claude response
  const parsed = FrameworkInterpretationSchema.parse(data);
  return {
    framework: '...', // set by caller
    insights: parsed.insights.map(i => ({
      id: generateId(),
      ...i,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    confidence: parsed.overallConfidence,
    lastUpdated: new Date().toISOString(),
    messageCount: 0, // set by caller
  };
}
```

### Anthropic Client (lib/anthropic.ts)

**Purpose**: Singleton client for Anthropic API

```typescript
import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

export async function invokeClaudeStructured<T>(
  prompt: string,
  systemPrompt: string,
  schema: z.ZodSchema<T>,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<T> {
  const client = getAnthropicClient();

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  // Extract text content
  const text = response.content[0].type === 'text'
    ? response.content[0].text
    : '';

  // Parse as JSON and validate with schema
  const json = JSON.parse(text);
  const validated = schema.parse(json);

  // Track token usage
  await trackTokenUsage(response.usage);

  return validated;
}
```

### Interpretation Storage (lib/interpretation-storage.ts)

**Purpose**: Store and retrieve interpretations from Profile/ContextIntent

```typescript
export async function storeInterpretations(
  userId: string,
  interpretations: FrameworkInterpretation[],
  rawPatterns: RawPatterns,
  lastAnalyzedMessageId: string,
  contextType?: RelationshipContextType
): Promise<void> {
  const interpretationsObj = interpretations.reduce((acc, fi) => {
    acc[fi.framework] = fi;
    return acc;
  }, {} as InterpretationStorage);

  if (contextType) {
    // Store in ContextIntent
    await prisma.contextIntent.update({
      where: { userId_contextType: { userId, contextType } },
      data: {
        interpretations: interpretationsObj,
        rawPatterns,
        lastAnalyzedAt: new Date(),
        lastAnalyzedMessageId,
        analysisVersion: 1,
      },
    });
  } else {
    // Store in Profile
    await prisma.profile.update({
      where: { userId },
      data: {
        interpretations: interpretationsObj,
        rawPatterns,
        lastAnalyzedAt: new Date(),
        lastAnalyzedMessageId,
        analysisVersion: 1,
      },
    });
  }
}

export async function getInterpretations(
  userId: string,
  contextType?: RelationshipContextType
): Promise<InterpretationStorage> {
  if (contextType) {
    const intent = await prisma.contextIntent.findUnique({
      where: { userId_contextType: { userId, contextType } },
      select: { interpretations: true },
    });
    return (intent?.interpretations as InterpretationStorage) || {};
  } else {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { interpretations: true },
    });
    return (profile?.interpretations as InterpretationStorage) || {};
  }
}

export async function appendFeedback(
  userId: string,
  feedback: FeedbackData,
  contextType?: RelationshipContextType
): Promise<void> {
  const currentData = contextType
    ? await prisma.contextIntent.findUnique({
        where: { userId_contextType: { userId, contextType } },
        select: { feedbackData: true, feedbackCount: true },
      })
    : await prisma.profile.findUnique({
        where: { userId },
        select: { feedbackData: true, feedbackCount: true },
      });

  const feedbackArray = (currentData?.feedbackData as FeedbackData[]) || [];
  feedbackArray.push(feedback);

  if (contextType) {
    await prisma.contextIntent.update({
      where: { userId_contextType: { userId, contextType } },
      data: {
        feedbackData: feedbackArray,
        feedbackCount: { increment: 1 },
      },
    });
  } else {
    await prisma.profile.update({
      where: { userId },
      data: {
        feedbackData: feedbackArray,
        feedbackCount: { increment: 1 },
      },
    });
  }
}
```

### Background Jobs (lib/background-jobs.ts)

**Purpose**: Database-backed task queue for background analysis jobs

```typescript
export async function enqueueJob(
  jobType: BackgroundJobType,
  payload: AnalysisJobPayload,
  priority: number = 5
): Promise<string> {
  const job = await prisma.backgroundJob.create({
    data: {
      jobType,
      payload: payload as any,
      priority,
      scheduledFor: new Date(),
    },
  });
  return job.id;
}

export async function getNextJob(): Promise<BackgroundJob | null> {
  // Fetch oldest pending job with highest priority
  const job = await prisma.backgroundJob.findFirst({
    where: {
      status: 'pending',
      scheduledFor: { lte: new Date() },
    },
    orderBy: [
      { priority: 'asc' },
      { scheduledFor: 'asc' },
    ],
  });

  if (!job) return null;

  // Mark as running
  await prisma.backgroundJob.update({
    where: { id: job.id },
    data: {
      status: 'running',
      startedAt: new Date(),
    },
  });

  return job;
}

export async function completeJob(
  jobId: string,
  result: any
): Promise<void> {
  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: 'completed',
      result: result as any,
      completedAt: new Date(),
    },
  });
}

export async function failJob(
  jobId: string,
  error: string
): Promise<void> {
  const job = await prisma.backgroundJob.findUnique({
    where: { id: jobId },
    select: { attempts: true, maxAttempts: true },
  });

  if (!job) return;

  const newAttempts = job.attempts + 1;
  const shouldRetry = newAttempts < job.maxAttempts;

  await prisma.backgroundJob.update({
    where: { id: jobId },
    data: {
      status: shouldRetry ? 'pending' : 'failed',
      attempts: newAttempts,
      lastError: error,
      scheduledFor: shouldRetry
        ? new Date(Date.now() + 60000 * Math.pow(2, newAttempts)) // Exponential backoff
        : undefined,
    },
  });
}

export async function getJobStatus(jobId: string): Promise<AnalysisStatus> {
  const job = await prisma.backgroundJob.findUnique({
    where: { id: jobId },
  });

  if (!job) {
    throw new Error('Job not found');
  }

  return {
    status: job.status,
    result: job.result as AnalysisResult | undefined,
    error: job.lastError || undefined,
  };
}
```

### Cache Layer (lib/interpretation/cache.ts)

**Purpose**: Redis-backed caching to avoid redundant LLM calls

```typescript
import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

function getRedisClient() {
  if (!redisClient) {
    const url = process.env.REDIS_URL;
    if (url) {
      redisClient = createClient({ url });
      redisClient.connect();
    }
  }
  return redisClient;
}

const CACHE_TTL = 60 * 60; // 1 hour

export async function getCachedInterpretations(
  userId: string,
  contextType?: RelationshipContextType
): Promise<InterpretationStorage | null> {
  const client = getRedisClient();
  if (!client) return null; // No Redis configured, skip cache

  const key = contextType
    ? `interpretations:${userId}:${contextType}`
    : `interpretations:${userId}:shared`;

  const cached = await client.get(key);
  return cached ? JSON.parse(cached) : null;
}

export async function setCachedInterpretations(
  userId: string,
  interpretations: InterpretationStorage,
  contextType?: RelationshipContextType
): Promise<void> {
  const client = getRedisClient();
  if (!client) return; // No Redis configured, skip cache

  const key = contextType
    ? `interpretations:${userId}:${contextType}`
    : `interpretations:${userId}:shared`;

  await client.setEx(key, CACHE_TTL, JSON.stringify(interpretations));
}

export async function invalidateCache(
  userId: string,
  contextType?: RelationshipContextType
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  const key = contextType
    ? `interpretations:${userId}:${contextType}`
    : `interpretations:${userId}:shared`;

  await client.del(key);
}
```

### Cost Tracker (lib/interpretation/cost-tracker.ts)

**Purpose**: Monitor token usage and estimate costs

```typescript
interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  model: string;
  timestamp: Date;
  userId: string;
  framework?: TherapeuticFramework;
}

// Claude 3.5 Sonnet pricing (as of Dec 2024)
const PRICING = {
  'claude-3-5-sonnet-20241022': {
    inputPer1M: 3.00,    // $3 per 1M input tokens
    outputPer1M: 15.00,  // $15 per 1M output tokens
  },
};

export async function trackTokenUsage(
  usage: Anthropic.Usage,
  userId: string,
  framework?: TherapeuticFramework
): Promise<void> {
  const record: TokenUsage = {
    inputTokens: usage.input_tokens,
    outputTokens: usage.output_tokens,
    model: 'claude-3-5-sonnet-20241022',
    timestamp: new Date(),
    userId,
    framework,
  };

  // Store in database for analytics
  // (Could be a separate CostTracking model or append to BackgroundJob.result)

  console.log(`[CostTracker] User ${userId}: ${usage.input_tokens} in, ${usage.output_tokens} out`);
}

export function estimateCost(usage: Anthropic.Usage, model: string): number {
  const pricing = PRICING[model as keyof typeof PRICING];
  if (!pricing) return 0;

  const inputCost = (usage.input_tokens / 1_000_000) * pricing.inputPer1M;
  const outputCost = (usage.output_tokens / 1_000_000) * pricing.outputPer1M;

  return inputCost + outputCost;
}

export async function getTotalCost(userId: string, startDate?: Date): Promise<number> {
  // Aggregate token usage from database
  // Return total cost in USD
  return 0; // Placeholder
}
```

## Integration Points

### Inbound

**What calls this feature**:
- **Chat submission flow** (`/app/api/chat/route.ts:48`): After storing a chat message, trigger background analysis if conditions are met
- **Profile view** (`/app/contexts/[context]/ChatProfilePanel.tsx`): On mount, check if interpretations are stale (> 1 hour) and trigger refresh
- **User-initiated refresh**: "Refresh insights" button in InterpretationPanel triggers `/api/interpretation/analyze`
- **Feedback submission**: InterpretationFeedback component calls `/api/interpretation/feedback`

**Entry points**:
- `POST /api/interpretation/analyze` - Manually trigger analysis
- `POST /api/interpretation/feedback` - Submit feedback and re-analyze
- `triggerAnalysis()` from engine.ts - Called by chat route

### Outbound

**What this calls**:
- **Anthropic API** (Claude 3.5 Sonnet): All LLM invocations via `lib/anthropic.ts`
- **Prisma database**: Store interpretations in Profile/ContextIntent via `lib/interpretation-storage.ts`
- **Redis** (optional): Cache interpretations via `lib/interpretation/cache.ts`
- **Background job queue**: Enqueue analysis jobs via `lib/background-jobs.ts`

**External services**:
- Anthropic Claude API: `https://api.anthropic.com/v1/messages`
- Redis (optional): For caching (if REDIS_URL is configured)

### Existing Code References

**Chat message storage pattern** (`/app/api/chat/route.ts:40-48`):
- Follow this pattern for triggering post-message analysis
- Add call to `triggerAnalysis()` after line 48 (after message creation)
- Check `offRecord` flag: skip analysis if true

**Profile/Intent update pattern** (`/lib/profile-shared.ts:35-81`):
- Follow this pattern for storing interpretations
- Use similar completeness calculation approach
- Match error handling style

**Authentication pattern** (`/app/api/chat/route.ts:14`):
- All new API routes must use `requireSessionUser()` from `/lib/auth.ts`
- Store userId in job payload for background processing

**JSON field handling** (`/lib/context-intent.ts:120-173`):
- Follow serializeIntentToDto pattern for reading interpretations from JSON fields
- Type-cast JSON fields carefully with runtime validation

## State Management

**Approach**: Server-driven state with client-side polling for real-time updates

**State Shape**:

```typescript
// Client-side state (React component)
interface InterpretationState {
  interpretations: InterpretationStorage | null;
  rawPatterns: RawPatterns | null;
  loading: boolean;
  error: string | null;
  analysisInProgress: boolean;
  currentJobId: string | null;
}

// Server-side state (Database)
// Stored in Profile.interpretations and ContextIntent.interpretations as JSON
```

**State Transitions**:

1. **Initial Load**: Component fetches interpretations from Profile/ContextIntent via existing profile API
2. **Stale Detection**: If `lastAnalyzedAt` > 1 hour ago OR new messages exist, show "Refresh insights" prompt
3. **Analysis Triggered**: User clicks refresh → POST `/api/interpretation/analyze` → Receive jobId → Start polling
4. **Polling**: Every 2 seconds, GET `/api/interpretation/status?jobId=X` until status = 'completed' or 'failed'
5. **Completion**: Fetch updated interpretations, update state, stop polling
6. **Feedback**: User submits feedback → POST `/api/interpretation/feedback` → New analysis triggered → Resume polling

**Caching Strategy**:
- Redis cache (1 hour TTL) for completed interpretations
- Browser cache: None (always fetch latest from server)
- Invalidation: On new analysis completion, invalidate cache for that user+context

## Security Considerations

**Authentication Requirements**:
- All API routes require authenticated session via `requireSessionUser()`
- Background job webhook (`/api/webhooks/background-jobs`) requires secret token (env var `BACKGROUND_JOB_SECRET`)

**Authorization Checks**:
- Users can only trigger analysis for their own profile (userId from session)
- Users can only view their own interpretations (enforce userId match)
- Users can only submit feedback on their own interpretations

**Data Validation**:
- Validate all input with Zod schemas before processing
- Sanitize chat message content before passing to LLM (strip PII if needed)
- Validate Claude responses against structured schemas

**Sensitive Data Handling**:
- Interpretations contain sensitive psychological insights → Encrypt at rest (PostgreSQL transparent data encryption recommended)
- Never log chat message content or interpretations to console/files
- Redact interpretations from error messages
- Include privacy notice in UI: "Interpretations are private and not shared with anyone"

**Rate Limiting**:
- Manual analysis endpoint: 3 requests per user per hour
- Feedback endpoint: 10 requests per user per hour
- Background job webhook: IP-based rate limiting (100 req/min)

## Performance Considerations

**Caching Strategy**:
- Redis cache for interpretations (1 hour TTL)
- Pre-compute interpretations on chat message submission (background)
- Cache framework modules in memory (loaded once at startup)

**Database Query Optimization**:
- Index on `BackgroundJob(status, scheduledFor, priority)` for fast job polling
- Index on `ChatMessage(userId, contextProfileId, createdAt)` for fetching recent messages
- Use `select` projections to fetch only needed fields (avoid loading entire Profile/ContextIntent)
- Consider partitioning BackgroundJob table by createdAt if job volume exceeds 100k

**LLM Optimization**:
- **Incremental analysis**: Only analyze messages since `lastAnalyzedMessageId` (reduces tokens by 80-90% on subsequent runs)
- **Batch frameworks**: Run all framework analyses in parallel (5 concurrent Claude API calls) to reduce total time
- **Prompt efficiency**: Keep prompts concise, use examples sparingly
- **Model selection**: Use Claude 3.5 Sonnet (fast + cost-effective) instead of Opus

**Bundle Size Impact**:
- Anthropic SDK (~50KB gzipped) only loaded server-side (no client bundle impact)
- Redis client (~30KB) only loaded server-side if REDIS_URL is configured
- Zod schemas (~10KB) used for validation (server-side only)

**Estimated Response Times**:
- Initial analysis (100 messages, 5 frameworks): 15-20 seconds
- Incremental analysis (5 new messages): 3-5 seconds
- Cached retrieval: < 100ms

## Testing Approach

**Unit Tests**:
- Framework modules: Test prompt building, insight extraction with mock Claude responses
- Analyzer: Test structured output parsing, error handling
- Storage layer: Test JSON serialization/deserialization
- Cache layer: Test Redis operations, fallback behavior when Redis unavailable
- Background jobs: Test job queue operations, retry logic

**Integration Tests**:
- End-to-end analysis pipeline: Chat message → Background job → Claude API → Store interpretations → Retrieve
- Feedback flow: Submit feedback → Re-analysis triggered → Updated interpretations
- Incremental updates: Add new messages → Only new messages analyzed
- Cache invalidation: Analysis completes → Cache updated → Subsequent requests served from cache

**E2E Test Scenarios**:
- User submits chat messages → Views profile → Sees interpretations appear
- User flags interpretation as inaccurate → Submits clarification → Sees updated interpretation
- User with stale interpretations (> 1 hour) → Views profile → Sees "Refresh insights" prompt → Clicks → Analysis runs → New insights appear
- User submits 100 messages → Analysis runs incrementally over multiple background jobs → All messages eventually analyzed

**Load Testing**:
- Simulate 100 concurrent users triggering analysis → Measure job queue throughput
- Simulate 1000 users with cached interpretations → Measure cache hit rate
- Test Claude API rate limits (100 req/min) → Implement exponential backoff

**Mock LLM Responses**:
- Use pre-recorded Claude responses for deterministic testing
- Test edge cases: empty insights, low confidence, parsing errors

## Cost Estimation

**Token Usage per Analysis**:

| Scenario | Input Tokens | Output Tokens | Cost |
|----------|--------------|---------------|------|
| Initial analysis (100 msgs, 5 frameworks) | ~50,000 | ~8,000 | $0.27 |
| Incremental (5 new msgs, 5 frameworks) | ~5,000 | ~1,500 | $0.04 |
| Re-analysis with feedback | ~10,000 | ~2,000 | $0.06 |

**Assumptions**:
- Average message length: 100 tokens
- Framework prompt overhead: 500 tokens
- Output per framework: 1,500 tokens (5-10 insights @ 200 tokens each)

**Monthly Cost Projections**:

| User Count | Avg Msgs/User/Month | Total Cost |
|------------|---------------------|------------|
| 100 | 50 | $135 |
| 1,000 | 50 | $1,350 |
| 10,000 | 50 | $13,500 |

**Cost Optimization Strategies**:
1. **Aggressive caching**: 1-hour TTL reduces redundant analyses by ~90%
2. **Incremental updates**: Only analyze new messages (saves 80-90% on repeat analyses)
3. **Framework selection**: Allow users to choose which frameworks to enable (reduce from 5 to 2-3)
4. **Batch processing**: Wait for 5+ new messages before triggering analysis (reduce API calls)
5. **Tiered pricing**: Free tier = 1 analysis/week, paid tier = unlimited

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Set up database schema, background job queue, and Anthropic integration

**Tasks**:
1. Add interpretation fields to Profile and ContextIntent (Prisma migration)
2. Create BackgroundJob model and migration
3. Implement `lib/anthropic.ts` (client singleton + structured output invocation)
4. Implement `lib/background-jobs.ts` (enqueue, process, complete, fail)
5. Add ANTHROPIC_API_KEY to .env
6. Write unit tests for background job queue

**Deliverables**:
- Database migration scripts
- Working background job queue (tested with mock jobs)
- Anthropic client ready for use

**Estimated LOC**: ~800 lines

### Phase 2: Single Framework Implementation (Week 2)

**Goal**: Build end-to-end pipeline for one therapeutic framework (Gabor Maté)

**Tasks**:
1. Implement `lib/interpretation/frameworks/gabor-mate.ts`
2. Implement `lib/interpretation/prompts.ts` (prompt templates)
3. Implement `lib/interpretation/schemas.ts` (Zod schemas for validation)
4. Implement `lib/interpretation/analyzer.ts` (analyze single framework)
5. Implement `lib/interpretation-storage.ts` (store/retrieve interpretations)
6. Implement `lib/interpretation/engine.ts` (triggerAnalysis, processAnalysisJob)
7. Create POST `/api/interpretation/analyze` endpoint
8. Integration test: Trigger analysis → Store → Retrieve

**Deliverables**:
- Working analysis pipeline for Gabor Maté framework
- API endpoint for triggering analysis
- Stored interpretations in database

**Estimated LOC**: ~1,200 lines

### Phase 3: Multi-Framework + Cache (Week 3)

**Goal**: Add remaining frameworks, implement caching, optimize performance

**Tasks**:
1. Implement remaining framework modules (Esther Perel, Gottman, IFS, Attachment)
2. Implement `lib/interpretation/frameworks/index.ts` (framework registry)
3. Update analyzer to process multiple frameworks in parallel
4. Implement `lib/interpretation/cache.ts` (Redis caching)
5. Implement incremental analysis (only new messages since lastAnalyzedMessageId)
6. Add Redis to .env and docker-compose (optional)
7. Performance testing: 100-message analysis, measure time + cost

**Deliverables**:
- All 5 frameworks operational
- Caching layer working
- Incremental updates implemented
- Performance benchmarks documented

**Estimated LOC**: ~1,500 lines

### Phase 4: UI + User Feedback (Week 4)

**Goal**: Build user-facing components for viewing and refining interpretations

**Tasks**:
1. Implement `InterpretationPanel.tsx` (display interpretations)
2. Implement `AnalysisProgress.tsx` (real-time progress)
3. Implement `InterpretationFeedback.tsx` (feedback modal)
4. Create POST `/api/interpretation/feedback` endpoint
5. Create GET `/api/interpretation/status` endpoint
6. Implement feedback-driven re-analysis in engine
7. Update profile view to include InterpretationPanel
8. Add "Refresh insights" button
9. E2E testing: Submit feedback → Re-analysis → Updated insights

**Deliverables**:
- Complete UI for viewing interpretations
- Feedback loop functional
- Real-time progress updates

**Estimated LOC**: ~900 lines (frontend + backend)

### Phase 5: Background Automation + Polish (Week 5)

**Goal**: Automate analysis triggers, add cost tracking, polish UX

**Tasks**:
1. Implement automatic analysis trigger in `/app/api/chat/route.ts` (after message creation)
2. Implement stale detection: Trigger analysis if lastAnalyzedAt > 1 hour on profile view
3. Implement `lib/interpretation/cost-tracker.ts` (token usage + cost estimation)
4. Create internal webhook `/api/webhooks/background-jobs` for cron-based job processing
5. Set up cron job (Vercel Cron or external service) to process background jobs every 30 seconds
6. Add cost dashboard for admin (optional)
7. Add privacy notice to UI ("Your interpretations are private")
8. Polish UI: Loading states, error messages, empty states
9. Write comprehensive documentation

**Deliverables**:
- Fully automated analysis pipeline
- Cost tracking operational
- Production-ready UI
- Documentation complete

**Estimated LOC**: ~600 lines

### Total Estimated LOC: ~5,000 lines

### Total Estimated Timeline: 5 weeks (1 developer)

## Open Questions

1. **Framework Priority**: Should all 5 frameworks run on every analysis, or allow users to select? (Cost vs. insight depth trade-off)

2. **Real-time vs. Batch**: Should analysis trigger immediately after each message, or batch after N messages? (Latency vs. cost trade-off)

3. **Confidence Thresholds**: Should we hide low-confidence insights (< 30%) from users, or show them with disclaimers?

4. **Feedback Mechanism**: Should feedback trigger immediate re-analysis (costly) or queue for next scheduled analysis?

5. **Context Switching**: Should romantic-context frameworks (Esther Perel) be disabled for non-romantic contexts, or adapt prompts?

6. **Data Retention**: How long should we keep old interpretations? Should we version them or overwrite on re-analysis?

7. **Privacy Review**: Does storing therapeutic interpretations require additional HIPAA/privacy compliance? (Consult legal)

8. **Redis Requirement**: Should Redis be required or optional? (Affects deployment complexity vs. performance)

9. **Rate Limiting**: What are appropriate rate limits for manual analysis to prevent abuse while allowing legitimate use?

10. **Error UX**: If analysis fails (Claude API error), should we retry automatically or prompt user to try again?

## Appendix: Example Interpretation Output

```json
{
  "gabor_mate": {
    "framework": "gabor_mate",
    "insights": [
      {
        "id": "ins_abc123",
        "type": "pattern",
        "title": "Anxious attachment pattern",
        "description": "We're noticing a pattern where you seek frequent reassurance about the relationship. This might reflect an anxious attachment style, where you deeply value connection but sometimes worry about its stability. This is a common and understandable response to past experiences.",
        "confidence": 78,
        "evidence": [
          {
            "messageId": "msg_xyz789",
            "quote": "I keep wondering if they're still interested in me...",
            "timestamp": "2025-12-24T10:30:00Z"
          },
          {
            "messageId": "msg_xyz790",
            "quote": "I need to hear from them or I start feeling really anxious",
            "timestamp": "2025-12-24T11:15:00Z"
          }
        ],
        "createdAt": "2025-12-24T14:00:00Z",
        "updatedAt": "2025-12-24T14:00:00Z"
      },
      {
        "id": "ins_def456",
        "type": "need",
        "title": "Need for emotional safety",
        "description": "Underneath the anxiety, there's a deep need to feel emotionally safe in relationships. You're looking for a partner who can provide consistent reassurance and presence. This need is valid and important.",
        "confidence": 85,
        "evidence": [
          {
            "messageId": "msg_xyz791",
            "quote": "I just want to feel secure that they're not going anywhere",
            "timestamp": "2025-12-24T12:00:00Z"
          }
        ],
        "createdAt": "2025-12-24T14:00:00Z",
        "updatedAt": "2025-12-24T14:00:00Z"
      },
      {
        "id": "ins_ghi789",
        "type": "strength",
        "title": "Self-awareness and reflection",
        "description": "You demonstrate strong self-awareness by recognizing your patterns and exploring them in conversation. This capacity for reflection is a powerful resource in building healthier relationships.",
        "confidence": 92,
        "evidence": [
          {
            "messageId": "msg_xyz792",
            "quote": "I know this is probably my anxiety talking, but...",
            "timestamp": "2025-12-24T13:00:00Z"
          }
        ],
        "createdAt": "2025-12-24T14:00:00Z",
        "updatedAt": "2025-12-24T14:00:00Z"
      }
    ],
    "confidence": 85,
    "lastUpdated": "2025-12-24T14:00:00Z",
    "messageCount": 47
  },
  "attachment_theory": {
    "framework": "attachment_theory",
    "insights": [
      {
        "id": "ins_jkl012",
        "type": "pattern",
        "title": "Protest behaviors",
        "description": "When you feel disconnected, you sometimes engage in 'protest behaviors' like excessive texting or seeking reassurance. These are attempts to restore closeness, which is understandable but may sometimes push people away. Recognizing this pattern is the first step toward healthier connection strategies.",
        "confidence": 72,
        "evidence": [
          {
            "messageId": "msg_xyz793",
            "quote": "I texted them like 5 times yesterday and they didn't respond",
            "timestamp": "2025-12-24T13:30:00Z"
          }
        ],
        "createdAt": "2025-12-24T14:00:00Z",
        "updatedAt": "2025-12-24T14:00:00Z"
      }
    ],
    "confidence": 72,
    "lastUpdated": "2025-12-24T14:00:00Z",
    "messageCount": 47
  }
}
```

---

## Next Steps

1. **Review & Approve**: Product team reviews architecture, approves scope and cost estimates
2. **Technical Review**: Engineering reviews database schema, API design, and security measures
3. **Phase 1 Kickoff**: Begin database migrations and background job infrastructure
4. **Incremental Delivery**: Ship Phase 2 (single framework) to beta users for feedback before building remaining phases

---

**Document Version**: 1.0
**Last Updated**: 2025-12-24
**Author**: System Architect
**Status**: Draft - Awaiting Review
