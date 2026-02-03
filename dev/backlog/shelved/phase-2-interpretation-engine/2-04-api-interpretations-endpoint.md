# Phase 2, Ticket 04: API Endpoint for Fetching Interpretations

**Mode:** Single-Dev
**Brief:** Phase 2 - Interpretation Engine (from `/dev/vision/profile-as-interpretation.md`)
**Build Order:** Phase 2, Step 4 (after background jobs)
**Prerequisites:** Tickets 2-01, 2-02, 2-03 complete
**Created:** 2025-12-24

---

## Goal

Create API endpoints that allow the frontend to fetch therapeutic interpretations for display in the profile view, with proper authentication, error handling, and graceful degradation when interpretations don't exist yet.

## User Story

As a frontend developer, I want API endpoints to fetch user profile interpretations so that I can display therapeutic insights in the profile view with appropriate loading states and fallbacks.

## Acceptance Criteria

- [ ] GET /api/profile/interpretations endpoint created
- [ ] Endpoint returns both shared and context-specific interpretations
- [ ] Query parameter: `contextType` (romantic, friendship, professional, creative, service)
- [ ] Response includes Profile.interpretations (shared insights)
- [ ] Response includes ContextIntent.interpretations (context-specific insights)
- [ ] Response includes Profile.rawPatterns for debugging/transparency
- [ ] Response includes Profile.lastAnalyzed timestamp
- [ ] Response includes analysis status (pending, processing, completed, failed)
- [ ] Authentication required (user can only fetch their own interpretations)
- [ ] Graceful handling when interpretations don't exist (empty state)
- [ ] Graceful handling when analysis failed (error state)
- [ ] Response format optimized for frontend display (human-readable insights)
- [ ] No sensitive data leaked (only show insights, not raw LLM prompts)
- [ ] Endpoint responds within 200ms (database query only, no LLM calls)
- [ ] TypeScript types exported for frontend usage
- [ ] Error handling for missing profile/context
- [ ] No security vulnerabilities (CSRF protection, auth validation)

## Dependencies

### Prerequisites (must exist):
- [x] Ticket 2-01: Profile.interpretations, rawPatterns, lastAnalyzed fields
- [x] Ticket 2-02: Analysis pipeline populates interpretations
- [x] Ticket 2-03: Background jobs trigger analysis
- [x] Next-auth session management

### Blockers (if any):
- None

## Technical Requirements

### New Files

**`lib/interpretation/api-types.ts`** (~80 LOC)
```typescript
// Shared types between backend and frontend

export interface InterpretationInsight {
  category: string;
  confidence: number;
  evidence: string[];
  insight: string;
}

export interface GaborMateInterpretation {
  attachment_style?: InterpretationInsight;
  underlying_needs?: {
    primary: string[];
    confidence: number;
    evidence: string[];
  };
  trauma_patterns?: InterpretationInsight;
  authentic_vs_adapted?: InterpretationInsight;
}

export interface EstherPerelInterpretation {
  desire_paradox?: InterpretationInsight;
  intimacy_style?: InterpretationInsight;
}

export interface InterpretationsResponse {
  // Shared interpretations (from Profile)
  shared: {
    frameworks: {
      gabor_mate?: GaborMateInterpretation;
    };
    summary: string;
    generated_at: string;
  } | null;

  // Context-specific interpretations (from ContextIntent)
  contextSpecific: {
    frameworks: {
      esther_perel?: EstherPerelInterpretation;
      // More frameworks in future tickets
    };
    summary: string;
    generated_at: string;
  } | null;

  // Metadata
  meta: {
    lastAnalyzed: string | null;
    status: 'not_started' | 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    messageCount: number;
    hasMinimumData: boolean;
  };

  // Optional: Raw patterns for transparency
  patterns?: {
    word_frequency: Record<string, number>;
    themes: string[];
    tone: string;
  };
}
```

**`app/api/profile/interpretations/route.ts`** (~180 LOC)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { InterpretationsResponse } from '@/lib/interpretation/api-types';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  // 1. Auth check
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // 2. Parse query params
  const { searchParams } = new URL(req.url);
  const contextType = searchParams.get('contextType');
  const includePatterns = searchParams.get('includePatterns') === 'true';

  if (!contextType) {
    return NextResponse.json(
      { error: 'contextType query parameter required' },
      { status: 400 }
    );
  }

  // Validate contextType
  const validContexts = ['romantic', 'friendship', 'professional', 'creative', 'service'];
  if (!validContexts.includes(contextType)) {
    return NextResponse.json(
      { error: 'Invalid contextType' },
      { status: 400 }
    );
  }

  try {
    // 3. Fetch profile with interpretations
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id }
    });

    // 4. Fetch context intent with interpretations
    const contextIntent = await prisma.contextIntent.findUnique({
      where: {
        userId_contextType: {
          userId: session.user.id,
          contextType
        }
      }
    });

    // 5. Check for active/pending jobs
    const activeJob = await prisma.analysisJob.findFirst({
      where: {
        userId: session.user.id,
        contextType,
        status: { in: ['pending', 'processing'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 6. Count messages for metadata
    const contextProfile = await prisma.contextProfile.findUnique({
      where: {
        userId_contextType: {
          userId: session.user.id,
          contextType
        }
      },
      include: {
        chatMessages: {
          where: { offRecord: false }
        }
      }
    });

    const messageCount = contextProfile?.chatMessages.length || 0;
    const hasMinimumData = messageCount >= 10;

    // 7. Determine status
    let status: InterpretationsResponse['meta']['status'] = 'not_started';
    let error: string | undefined;

    if (activeJob) {
      status = activeJob.status as 'pending' | 'processing';
      error = activeJob.error || undefined;
    } else if (profile?.lastAnalyzed) {
      status = 'completed';
    } else if (!hasMinimumData) {
      status = 'not_started';
    }

    // 8. Build response
    const response: InterpretationsResponse = {
      shared: profile?.interpretations
        ? (profile.interpretations as any)
        : null,

      contextSpecific: contextIntent?.interpretations
        ? (contextIntent.interpretations as any)
        : null,

      meta: {
        lastAnalyzed: profile?.lastAnalyzed?.toISOString() || null,
        status,
        error,
        messageCount,
        hasMinimumData
      },

      // Optional: Include raw patterns for debugging
      ...(includePatterns && profile?.rawPatterns && {
        patterns: profile.rawPatterns as any
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch interpretations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Integration Points

- Reads from Profile table (interpretations, rawPatterns, lastAnalyzed)
- Reads from ContextIntent table (interpretations)
- Reads from AnalysisJob table (status of pending jobs)
- Reads from ChatMessage count (for hasMinimumData check)
- Used by frontend profile view component

### Example API Response

**Successful response with interpretations:**
```json
{
  "shared": {
    "frameworks": {
      "gabor_mate": {
        "attachment_style": {
          "primary": "anxious-avoidant",
          "confidence": 0.78,
          "evidence": [
            "mentions fear of being 'too much'",
            "desires independence but expresses loneliness"
          ],
          "insight": "You seem to want closeness but protect yourself from vulnerability. This pattern often emerges when we've learned that connection can feel overwhelming."
        },
        "underlying_needs": {
          "primary": ["safety", "authenticity", "acceptance"],
          "confidence": 0.85,
          "evidence": [
            "repeated use of 'authentic'",
            "safe space mentioned 8 times",
            "accepted for who I am"
          ]
        }
      }
    },
    "summary": "You value deep emotional connection and authenticity in relationships. Safety and acceptance seem to be core needs.",
    "generated_at": "2025-12-24T10:30:00Z"
  },
  "contextSpecific": {
    "frameworks": {
      "esther_perel": {
        "desire_paradox": {
          "category": "intimacy",
          "confidence": 0.72,
          "evidence": [
            "wants 'stable' but also 'spontaneous'",
            "values routine and adventure"
          ],
          "insight": "You're navigating the paradox of wanting both security and excitement in romantic relationships. This is a common tension - we want the comfort of home and the thrill of exploration."
        }
      }
    },
    "summary": "In romantic relationships, you seek balance between stability and spontaneity.",
    "generated_at": "2025-12-24T10:30:00Z"
  },
  "meta": {
    "lastAnalyzed": "2025-12-24T10:30:00Z",
    "status": "completed",
    "messageCount": 47,
    "hasMinimumData": true
  }
}
```

**Response when analysis pending:**
```json
{
  "shared": null,
  "contextSpecific": null,
  "meta": {
    "lastAnalyzed": null,
    "status": "pending",
    "messageCount": 12,
    "hasMinimumData": true
  }
}
```

**Response when insufficient data:**
```json
{
  "shared": null,
  "contextSpecific": null,
  "meta": {
    "lastAnalyzed": null,
    "status": "not_started",
    "messageCount": 4,
    "hasMinimumData": false
  }
}
```

## Constraints

- ≤ 300 LOC
- ≤ 0 new dependencies
- Response time <200ms (no LLM calls)
- Must handle missing data gracefully
- Must not leak sensitive information

## Test Plan

### Unit Tests

- Test response structure:
  - With complete interpretations → returns all fields
  - With null interpretations → returns null with correct meta
  - With pending job → status = 'pending'
  - With failed job → status = 'failed', includes error
  - With <10 messages → hasMinimumData = false

- Test authentication:
  - Without session → returns 401
  - With valid session → returns 200

- Test query parameters:
  - Missing contextType → returns 400
  - Invalid contextType → returns 400
  - includePatterns=true → includes patterns in response
  - includePatterns=false → excludes patterns

### Integration Tests

- Test full flow:
  - User with completed analysis → GET endpoint → verify interpretations returned
  - User with pending job → GET endpoint → verify status='pending'
  - User with no messages → GET endpoint → verify status='not_started'
  - User with 5 messages → GET endpoint → verify hasMinimumData=false

- Test error handling:
  - Database error → returns 500
  - Missing profile → returns empty state (not error)

### Manual Testing Checklist

- [ ] Create test user with completed analysis
- [ ] Call GET /api/profile/interpretations?contextType=romantic
- [ ] Verify response matches InterpretationsResponse type
- [ ] Verify interpretations displayed correctly
- [ ] Test without auth → verify 401
- [ ] Test with different contextTypes → verify context-specific data
- [ ] Test includePatterns=true → verify rawPatterns included
- [ ] Test user with pending job → verify status='pending'
- [ ] Test user with <10 messages → verify hasMinimumData=false
- [ ] Test response time with console.time() → verify <200ms
- [ ] Verify no sensitive data in response (no LLM prompts, API keys, etc.)

### Product Validation

- [ ] Response format is frontend-friendly (no complex transformations needed)
- [ ] Error states clearly distinguish: not started, pending, failed
- [ ] Human-readable insights ready for display
- [ ] Confidence scores help UI decide what to show
- [ ] Evidence quotes can be displayed for transparency

## Readiness

- [x] Tickets 2-01, 2-02, 2-03 complete
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive
- [x] No blockers

## Implementation Notes

### Critical Details

**Authentication:**
- Use Next-auth getServerSession()
- User can only fetch their own interpretations
- No admin/elevated access in MVP

**Response Optimization:**
- Only database queries (no LLM calls)
- Use Prisma select to only fetch needed fields
- Cache-Control header: private, max-age=60 (can cache for 1 minute)

**Graceful Degradation:**
- Missing interpretations → return null, not error
- Frontend can show "Share more to see insights" state
- Missing profile → return empty state with status='not_started'
- Failed analysis → return status='failed' with error message

**Status States:**
- **not_started:** <10 messages, never analyzed
- **pending:** Job queued, waiting to process
- **processing:** Job currently running
- **completed:** Analysis done, interpretations available
- **failed:** Analysis failed after retries

**Security Considerations:**
- Never expose:
  - LLM prompts or API keys
  - Other users' interpretations
  - Internal analysis logic
  - Raw chat transcripts (only processed insights)
- Rate limiting: Consider adding in production (100 req/min per user)

**Frontend Usage:**
```typescript
// Example frontend hook
async function useInterpretations(contextType: string) {
  const response = await fetch(`/api/profile/interpretations?contextType=${contextType}`);
  const data: InterpretationsResponse = await response.json();

  if (data.meta.status === 'completed' && data.shared) {
    // Display interpretations
    return { interpretations: data.shared, loading: false };
  } else if (data.meta.status === 'pending' || data.meta.status === 'processing') {
    // Show loading state
    return { interpretations: null, loading: true };
  } else {
    // Show "Share more" state
    return { interpretations: null, loading: false, needsMoreData: !data.meta.hasMinimumData };
  }
}
```

### Edge Cases

1. **User has Profile but no ContextIntent for requested context:**
   - Return shared interpretations only
   - contextSpecific = null
   - This is valid (user hasn't entered that context yet)

2. **Analysis completed but interpretations are empty object:**
   - This happens if confidence was too low
   - Treat as completed but show "Insufficient confidence" message

3. **User requests interpretations for context they haven't selected:**
   - Return 404 or empty state
   - Don't create ContextIntent automatically

4. **lastAnalyzed is very old (>1 week):**
   - Still return interpretations
   - Frontend can show "Updated 7 days ago" indicator
   - Consider triggering re-analysis if stale

5. **Multiple concurrent requests for same user:**
   - Database handles this fine (read-only queries)
   - No race conditions

### Future Enhancements (Not in This Ticket)

- Pagination for evidence quotes (if >10 quotes)
- Versioning: Return interpretation version number
- Diff API: Show what changed since last analysis
- Admin endpoint: Fetch any user's interpretations (with proper auth)
- Analytics: Track which insights users click on
- A/B testing: Different prompt versions

## Next Steps

After this ticket is complete:
1. Test API with Postman/curl
2. Verify response format matches frontend needs
3. Add rate limiting if production load high
4. **Proceed to Ticket 2-05:** Basic Profile View with Interpretations Display (frontend UI)
