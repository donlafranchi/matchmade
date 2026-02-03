# Phase 2, Ticket 03: Background Job System for Analysis Triggers

**Mode:** Single-Dev
**Brief:** Phase 2 - Interpretation Engine (from `/dev/vision/profile-as-interpretation.md`)
**Build Order:** Phase 2, Step 3 (after MVP pipeline)
**Prerequisites:** Ticket 2-02 complete (analyzeUserProfile function exists)
**Created:** 2025-12-24

---

## Goal

Implement a background job system that automatically triggers profile interpretation analysis at strategic moments (after chat messages, on profile view, manual refresh) with intelligent caching, retry logic, and rate limiting to control LLM costs.

## User Story

As a system, I want to automatically analyze user profiles in the background so that interpretations stay up-to-date as users share more information, without blocking the user experience or incurring excessive LLM costs.

## Acceptance Criteria

- [ ] Background job queue system implemented (using existing Next.js infrastructure)
- [ ] Analysis triggered automatically after every Nth chat message (configurable, default: N=5)
- [ ] Analysis triggered when user views profile AND interpretations are stale (>1 hour old)
- [ ] Manual "Refresh my profile" trigger exposed via API
- [ ] Staleness detection: Skip analysis if lastAnalyzed < 1 hour ago
- [ ] Minimum message threshold: Skip if <10 new messages since last analysis
- [ ] Job retry logic: 3 retries with exponential backoff on LLM failure
- [ ] Rate limiting: Max 1 analysis per user per hour (prevent abuse)
- [ ] Job status tracking: pending, processing, completed, failed
- [ ] Cost monitoring: Log token usage per job, daily cost summary
- [ ] Failed job alerts: Log errors for manual review
- [ ] Queue prioritization: Manual refresh > profile view > auto-trigger
- [ ] Graceful degradation: If queue full, drop lowest priority jobs
- [ ] Database field: Profile.analysisStatus ('pending', 'processing', 'completed', 'failed')
- [ ] Database field: Profile.analysisError (stores last error message)
- [ ] Background jobs don't block user requests (async processing)
- [ ] Analysis completes within 2 minutes for 95% of jobs
- [ ] No security vulnerabilities (authenticated triggers only)

## Dependencies

### Prerequisites (must exist):
- [x] Ticket 2-02 complete (analyzeUserProfile function)
- [x] ChatMessage.offRecord field (don't trigger on off-the-record)
- [ ] Background job infrastructure (choose: Inngest, BullMQ, or Next.js API routes)

### Blockers (if any):
- None (can use simple polling or webhook-based jobs)

## Technical Requirements

### Architecture Decision: Job System

**Option A: Inngest (Recommended)**
- Pros: Built for Next.js, serverless-friendly, retries/logging built-in
- Cons: External dependency, $20/mo after free tier
- Implementation: ~200 LOC

**Option B: BullMQ + Redis**
- Pros: Self-hosted, robust, production-grade
- Cons: Requires Redis instance, more complex setup
- Implementation: ~300 LOC

**Option C: Simple Database Polling**
- Pros: No external dependencies, works everywhere
- Cons: Less scalable, manual retry logic needed
- Implementation: ~250 LOC

**Recommendation:** Start with Option C (database polling) for MVP, migrate to Inngest later if needed.

### New Files

**`lib/interpretation/jobs/queue.ts`** (~150 LOC)
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AnalysisJob {
  id: string;
  userId: string;
  contextType: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  retries: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Add job to queue
export async function enqueueAnalysis(
  userId: string,
  contextType: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
  source: 'chat' | 'view' | 'manual'
): Promise<void> {
  // Check if already queued or recently analyzed
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) return;

  // Rate limit: Skip if analyzed < 1 hour ago
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (profile.lastAnalyzed && profile.lastAnalyzed > oneHourAgo) {
    console.log(`Skipping analysis for ${userId}: analyzed recently`);
    return;
  }

  // Check if already pending/processing
  const existingJob = await prisma.analysisJob.findFirst({
    where: {
      userId,
      contextType,
      status: { in: ['pending', 'processing'] }
    }
  });

  if (existingJob) {
    console.log(`Job already queued for ${userId}`);
    return;
  }

  // Create job
  await prisma.analysisJob.create({
    data: {
      userId,
      contextType,
      priority,
      status: 'pending',
      retries: 0,
      source
    }
  });

  console.log(`Enqueued analysis job for ${userId} (${source}, priority: ${priority})`);
}

// Process next job from queue
export async function processNextJob(): Promise<boolean> {
  // Get highest priority pending job
  const job = await prisma.analysisJob.findFirst({
    where: { status: 'pending' },
    orderBy: [
      { priority: 'asc' },  // high=1, medium=2, low=3 (alphabetical)
      { createdAt: 'asc' }
    ]
  });

  if (!job) return false;

  // Mark as processing
  await prisma.analysisJob.update({
    where: { id: job.id },
    data: {
      status: 'processing',
      startedAt: new Date()
    }
  });

  try {
    // Run analysis
    const { analyzeUserProfile } = await import('../analyze');
    const result = await analyzeUserProfile(job.userId, job.contextType);

    if (result) {
      // Success
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });
      console.log(`Analysis completed for ${job.userId}`);
      return true;
    } else {
      // No result (insufficient messages or low confidence)
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          error: 'Insufficient data or low confidence'
        }
      });
      return true;
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Retry logic
    if (job.retries < 3) {
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'pending',
          retries: job.retries + 1,
          error: errorMessage
        }
      });
      console.log(`Retrying job ${job.id} (attempt ${job.retries + 1}/3)`);
    } else {
      // Max retries reached
      await prisma.analysisJob.update({
        where: { id: job.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          error: errorMessage
        }
      });
      console.error(`Job ${job.id} failed after 3 retries:`, errorMessage);
    }

    return false;
  }
}

// Background polling worker
export async function startJobWorker(intervalMs: number = 10000): Promise<void> {
  console.log('Starting analysis job worker...');

  setInterval(async () => {
    try {
      const processed = await processNextJob();
      if (processed) {
        // Process another immediately if one succeeded
        await processNextJob();
      }
    } catch (error) {
      console.error('Job worker error:', error);
    }
  }, intervalMs);
}
```

**`lib/interpretation/jobs/triggers.ts`** (~100 LOC)
```typescript
import { enqueueAnalysis } from './queue';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Trigger after chat message
export async function triggerAfterChatMessage(
  userId: string,
  contextType: string
): Promise<void> {
  // Count messages since last analysis
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          chatMessages: {
            where: {
              offRecord: false,
              createdAt: {
                gt: profile?.lastAnalyzed || new Date(0)
              }
            }
          }
        }
      }
    }
  });

  const newMessageCount = profile?.user?.chatMessages?.length || 0;

  // Trigger if 5+ new messages
  if (newMessageCount >= 5) {
    await enqueueAnalysis(userId, contextType, 'low', 'chat');
  }
}

// Trigger on profile view
export async function triggerOnProfileView(
  userId: string,
  contextType: string
): Promise<void> {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile) return;

  // Check staleness
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const isStale = !profile.lastAnalyzed || profile.lastAnalyzed < oneHourAgo;

  if (isStale) {
    await enqueueAnalysis(userId, contextType, 'medium', 'view');
  }
}

// Manual refresh trigger
export async function triggerManualRefresh(
  userId: string,
  contextType: string
): Promise<void> {
  // High priority, bypass staleness check
  await enqueueAnalysis(userId, contextType, 'high', 'manual');
}
```

**`app/api/profile/analyze/route.ts`** (~80 LOC)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { triggerManualRefresh } from '@/lib/interpretation/jobs/triggers';

export async function POST(req: NextRequest) {
  // Auth check
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { contextType } = await req.json();

  if (!contextType) {
    return NextResponse.json({ error: 'contextType required' }, { status: 400 });
  }

  // Enqueue analysis job
  await triggerManualRefresh(session.user.id, contextType);

  return NextResponse.json({
    message: 'Analysis queued',
    status: 'pending'
  });
}

// GET status of analysis job
export async function GET(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get('contextType');

  if (!contextType) {
    return NextResponse.json({ error: 'contextType required' }, { status: 400 });
  }

  // Check job status
  const job = await prisma.analysisJob.findFirst({
    where: {
      userId: session.user.id,
      contextType,
      status: { in: ['pending', 'processing'] }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (job) {
    return NextResponse.json({
      status: job.status,
      retries: job.retries,
      error: job.error
    });
  }

  // Check last completed analysis
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  return NextResponse.json({
    status: profile?.lastAnalyzed ? 'completed' : 'not_started',
    lastAnalyzed: profile?.lastAnalyzed
  });
}
```

**Update `app/api/chat/route.ts`** (~20 LOC addition)
```typescript
// After saving chat message:
import { triggerAfterChatMessage } from '@/lib/interpretation/jobs/triggers';

// ... existing chat message save logic ...

// Trigger analysis if threshold met
await triggerAfterChatMessage(session.user.id, contextType);
```

### Database Schema Additions

**New AnalysisJob Model:**
```prisma
model AnalysisJob {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  contextType String
  priority    String   // 'high' | 'medium' | 'low'
  status      String   // 'pending' | 'processing' | 'completed' | 'failed'
  source      String   // 'chat' | 'view' | 'manual'
  error       String?
  retries     Int      @default(0)
  createdAt   DateTime @default(now())
  startedAt   DateTime?
  completedAt DateTime?

  @@index([userId])
  @@index([status])
  @@index([priority])
}
```

### Integration Points

- Triggered from POST /api/chat after message save
- Triggered from profile view page load
- Triggered from POST /api/profile/analyze (manual)
- Calls analyzeUserProfile() from Ticket 2-02
- Updates Profile.lastAnalyzed on success

## Constraints

- ≤ 550 LOC
- ≤ 1 new dependency (none if using database polling)
- Max 1 analysis per user per hour (rate limit)
- Background jobs don't block requests
- Retry failed jobs up to 3 times
- Queue processing every 10 seconds (configurable)

## Test Plan

### Unit Tests

- Test `enqueueAnalysis()`:
  - Creates job with correct priority
  - Skips if recently analyzed (<1 hour)
  - Skips if job already pending
  - Handles missing profile gracefully

- Test `processNextJob()`:
  - Processes highest priority first
  - Marks job as processing
  - Calls analyzeUserProfile correctly
  - Updates status to completed on success
  - Increments retries on failure
  - Marks failed after 3 retries

- Test `triggerAfterChatMessage()`:
  - Enqueues job after 5+ new messages
  - Skips if <5 new messages
  - Counts messages since last analysis

- Test `triggerOnProfileView()`:
  - Enqueues if lastAnalyzed > 1 hour ago
  - Skips if recently analyzed
  - Handles never-analyzed profile

### Integration Tests

- Test full job lifecycle:
  - Enqueue job → process job → verify completion
  - Enqueue job → simulate failure → verify retry → verify eventual completion
  - Enqueue job → simulate 3 failures → verify marked as failed

- Test API endpoints:
  - POST /api/profile/analyze → returns success
  - GET /api/profile/analyze?contextType=romantic → returns status
  - POST without auth → returns 401

- Test triggers in chat flow:
  - Save 5 messages → verify job enqueued
  - Save 3 messages → verify no job enqueued

### Manual Testing Checklist

- [ ] Start job worker: `startJobWorker()` in server startup
- [ ] Create test user with 15 chat messages
- [ ] Manually trigger analysis: POST /api/profile/analyze
- [ ] Check job status: GET /api/profile/analyze?contextType=romantic
- [ ] Verify job processes within 30 seconds
- [ ] Check Profile.lastAnalyzed updated
- [ ] Check Profile.interpretations populated
- [ ] Test rate limiting:
  - [ ] Trigger analysis → wait 30 minutes → trigger again → verify skipped
  - [ ] Wait 1 hour → trigger again → verify allowed
- [ ] Test retry logic:
  - [ ] Temporarily break LLM API (invalid key)
  - [ ] Trigger analysis → verify job retries 3 times
  - [ ] Verify job marked as failed after 3 retries
  - [ ] Fix API key → trigger again → verify success
- [ ] Test priority queue:
  - [ ] Enqueue 3 jobs: low, high, medium
  - [ ] Verify high processed first, then medium, then low
- [ ] Monitor logs for token usage tracking

### Product Validation

- [ ] Analysis happens in background (doesn't block user)
- [ ] Profile updates feel responsive (within 1-2 minutes)
- [ ] Rate limiting prevents excessive LLM costs
- [ ] Failed jobs don't cause user-facing errors
- [ ] Manual refresh works when users want it

## Readiness

- [x] Ticket 2-02 complete (analyzeUserProfile function)
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive
- [x] No blockers

## Implementation Notes

### Critical Details

**Rate Limiting Strategy:**
- Max 1 analysis per user per hour prevents abuse
- Manual refresh bypasses queue but still rate-limited
- Profile view triggers only if stale (>1 hour)
- Chat triggers only after 5+ new messages

**Priority Queue:**
- **High:** Manual refresh (user explicitly requested)
- **Medium:** Profile view (user is waiting for updated view)
- **Low:** Auto-trigger after chat (background, no rush)

**Cost Control:**
- Rate limit: 1 per user per hour
- Staleness check: Skip recent analyses
- Message threshold: Skip if <10 total messages
- Confidence threshold: Skip if LLM returns low confidence
- Estimated cost: ~$0.04 per analysis, max ~$1/user/day (25 analyses)

**Retry Strategy:**
- Exponential backoff: 1s → 5s → 25s between retries
- Max 3 retries per job
- Failed jobs logged for manual review
- Don't retry if confidence too low (not a failure, just skip)

**Job Worker:**
- Polls every 10 seconds (configurable)
- Processes 1 job per poll
- If job succeeds, immediately process another
- If queue empty, waits for next poll
- Can run multiple workers in parallel (for scale)

**Database Polling vs Queue System:**
- Database polling: Simple, works everywhere, good for <1000 users
- If scaling beyond 1000 users, migrate to Inngest/BullMQ
- AnalysisJob table acts as simple queue
- Status transitions: pending → processing → completed/failed

### Edge Cases

1. **User triggers analysis while previous job processing:**
   - New job not created (check for existing job)
   - User sees "Analysis in progress" status

2. **Job worker crashes mid-processing:**
   - Jobs stuck in "processing" status
   - Add cleanup task: Mark processing >5 minutes as failed

3. **Multiple workers process same job:**
   - Use database transaction to claim job
   - Add `WHERE status = 'pending'` to prevent race condition

4. **User deletes account while job processing:**
   - onDelete: Cascade handles cleanup
   - Job will fail gracefully (user not found)

5. **LLM API down for hours:**
   - Jobs retry 3 times then fail
   - Queue builds up
   - When API recovers, jobs process normally
   - Consider: Pause queue if >10 consecutive failures

### Future Enhancements (Not in This Ticket)

- Exponential backoff between retries (current: fixed interval)
- Job prioritization based on user tier (premium users first)
- Batch processing (analyze multiple users in one LLM call)
- Dead letter queue for permanently failed jobs
- Admin dashboard for monitoring queue health
- Webhook notifications when analysis complete

## Next Steps

After this ticket is complete:
1. Monitor job processing in production
2. Track token costs and adjust triggers if needed
3. Optimize queue processing interval based on load
4. **Proceed to Ticket 2-04:** API Endpoint for Fetching Interpretations (expose to frontend)
