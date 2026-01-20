# Phase 2, Ticket 05: Basic Profile View with Interpretations Display

**Mode:** Single-Dev
**Brief:** Phase 2 - Interpretation Engine (from `/dev/vision/profile-as-interpretation.md`)
**Build Order:** Phase 2, Step 5 (MVP completion)
**Prerequisites:** Ticket 2-04 complete (API endpoint exists)
**Created:** 2025-12-24

---

## Goal

Create a basic profile view UI that displays therapeutic interpretations alongside (or replacing) the existing form-based profile, demonstrating the "Here's what we're hearing from you" experience with appropriate loading states and fallbacks.

## User Story

As a user, I want to see interpreted insights about my relationship patterns and needs so that I feel deeply understood rather than reduced to form fields and checkboxes.

## Acceptance Criteria

- [ ] New component: `InterpretationsView.tsx` displays therapeutic insights
- [ ] Component fetches interpretations from GET /api/profile/interpretations
- [ ] Loading state while interpretations are being generated
- [ ] Empty state when <10 messages ("Share more to see insights")
- [ ] Completed state shows insights in human-readable format
- [ ] Failed state with retry button
- [ ] Interpretations organized by framework:
  - [ ] Gabor Maté section (attachment, needs)
  - [ ] Context-specific sections (Esther Perel for romantic, etc.)
- [ ] Each insight shows:
  - [ ] Human-readable interpretation text
  - [ ] Confidence indicator (subtle, not prominent)
  - [ ] Optional: Collapsible evidence quotes
- [ ] "Refresh interpretations" button (calls POST /api/profile/analyze)
- [ ] Last analyzed timestamp displayed
- [ ] Smooth transitions between states (loading → completed)
- [ ] Responsive design (mobile-first)
- [ ] Accessibility: Screen reader friendly, keyboard navigation
- [ ] Interface feels easy and gets out of the way (not overwhelming)
- [ ] Messaging is real and honest (no overpromising)
- [ ] No security vulnerabilities

## Dependencies

### Prerequisites (must exist):
- [x] Ticket 2-04: GET /api/profile/interpretations endpoint
- [x] POST /api/profile/analyze endpoint (from Ticket 2-03)
- [x] Existing profile view page at /contexts/[context]/page.tsx
- [x] Tailwind CSS configured

### Blockers (if any):
- None

## Technical Requirements

### New Files

**`app/components/InterpretationsView.tsx`** (~350 LOC)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { InterpretationsResponse, GaborMateInterpretation } from '@/lib/interpretation/api-types';

interface Props {
  contextType: string;
}

export function InterpretationsView({ contextType }: Props) {
  const [data, setData] = useState<InterpretationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchInterpretations();
  }, [contextType]);

  async function fetchInterpretations() {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/interpretations?contextType=${contextType}`);
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error('Failed to fetch interpretations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      // Trigger analysis
      await fetch('/api/profile/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextType })
      });

      // Poll for completion
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const res = await fetch(`/api/profile/interpretations?contextType=${contextType}`);
        const newData = await res.json();

        if (newData.meta.status === 'completed' || attempts > 30) {
          clearInterval(pollInterval);
          setData(newData);
          setRefreshing(false);
        }
      }, 2000);

    } catch (error) {
      console.error('Failed to refresh:', error);
      setRefreshing(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!data) {
    return <ErrorState onRetry={fetchInterpretations} />;
  }

  // Not started or insufficient data
  if (data.meta.status === 'not_started' || !data.meta.hasMinimumData) {
    return <EmptyState messageCount={data.meta.messageCount} />;
  }

  // Pending or processing
  if (data.meta.status === 'pending' || data.meta.status === 'processing') {
    return <ProcessingState />;
  }

  // Failed
  if (data.meta.status === 'failed') {
    return <FailedState error={data.meta.error} onRetry={handleRefresh} />;
  }

  // Completed - show interpretations
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-light text-gray-900">
            Here's what we're hearing from you
          </h2>
          {data.meta.lastAnalyzed && (
            <p className="text-sm text-gray-500 mt-1">
              Updated {formatRelativeTime(data.meta.lastAnalyzed)}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Shared Interpretations */}
      {data.shared && (
        <Section title="Your Profile">
          <p className="text-gray-700 mb-6 leading-relaxed">
            {data.shared.summary}
          </p>

          {data.shared.frameworks.gabor_mate && (
            <GaborMateSection insights={data.shared.frameworks.gabor_mate} />
          )}
        </Section>
      )}

      {/* Context-Specific Interpretations */}
      {data.contextSpecific && (
        <Section title={`In ${contextType} relationships`}>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {data.contextSpecific.summary}
          </p>

          {/* Esther Perel (romantic only) */}
          {data.contextSpecific.frameworks.esther_perel && contextType === 'romantic' && (
            <EstherPerelSection insights={data.contextSpecific.frameworks.esther_perel} />
          )}
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function GaborMateSection({ insights }: { insights: GaborMateInterpretation }) {
  return (
    <div className="space-y-6">
      {/* Attachment Style */}
      {insights.attachment_style && (
        <InsightCard
          title="Attachment & Connection"
          confidence={insights.attachment_style.confidence}
          insight={insights.attachment_style.insight}
          evidence={insights.attachment_style.evidence}
        />
      )}

      {/* Underlying Needs */}
      {insights.underlying_needs && (
        <div className="border-l-4 border-blue-200 pl-4">
          <h4 className="font-medium text-gray-800 mb-2">Core Needs</h4>
          <p className="text-gray-700 text-sm mb-2">
            You seem to prioritize: {insights.underlying_needs.primary.join(', ')}
          </p>
          <ConfidenceBadge confidence={insights.underlying_needs.confidence} />
        </div>
      )}

      {/* Authentic vs Adapted (optional) */}
      {insights.authentic_vs_adapted && (
        <InsightCard
          title="Authentic Self"
          confidence={insights.authentic_vs_adapted.confidence}
          insight={insights.authentic_vs_adapted.insight}
          evidence={insights.authentic_vs_adapted.evidence}
        />
      )}
    </div>
  );
}

function EstherPerelSection({ insights }: { insights: any }) {
  return (
    <div className="space-y-6">
      {insights.desire_paradox && (
        <InsightCard
          title="Desire & Intimacy"
          confidence={insights.desire_paradox.confidence}
          insight={insights.desire_paradox.insight}
          evidence={insights.desire_paradox.evidence}
        />
      )}
    </div>
  );
}

function InsightCard({ title, confidence, insight, evidence }: {
  title: string;
  confidence: number;
  insight: string;
  evidence: string[];
}) {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="border-l-4 border-indigo-200 pl-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-800">{title}</h4>
        <ConfidenceBadge confidence={confidence} />
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {insight}
      </p>
      {evidence && evidence.length > 0 && (
        <button
          onClick={() => setShowEvidence(!showEvidence)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          {showEvidence ? 'Hide' : 'Show'} evidence
        </button>
      )}
      {showEvidence && (
        <ul className="mt-2 space-y-1">
          {evidence.map((item, i) => (
            <li key={i} className="text-xs text-gray-600 italic">
              "{item}"
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100);
  const color = confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                confidence >= 0.7 ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600';

  return (
    <span className={`text-xs px-2 py-1 rounded ${color}`}>
      {percent}% confident
    </span>
  );
}

// State components
function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4" />
        <p className="text-gray-600">Loading your insights...</p>
      </div>
    </div>
  );
}

function EmptyState({ messageCount }: { messageCount: number }) {
  const needed = Math.max(0, 10 - messageCount);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Share more to see insights
      </h3>
      <p className="text-gray-600 mb-4">
        You have {messageCount} messages. Share {needed} more to generate your profile interpretation.
      </p>
      <p className="text-sm text-gray-500">
        The more you share in conversation, the better we can understand your patterns and needs.
      </p>
    </div>
  );
}

function ProcessingState() {
  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center">
      <div className="animate-pulse h-8 w-8 bg-blue-400 rounded-full mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Analyzing your conversation...
      </h3>
      <p className="text-gray-600">
        This usually takes 30-60 seconds. Feel free to continue chatting.
      </p>
    </div>
  );
}

function FailedState({ error, onRetry }: { error?: string; onRetry: () => void }) {
  return (
    <div className="bg-red-50 rounded-lg border border-red-200 p-8 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Analysis failed
      </h3>
      <p className="text-gray-600 mb-4">
        {error || 'Something went wrong. Please try again.'}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Couldn't load interpretations
      </h3>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 mt-4"
      >
        Retry
      </button>
    </div>
  );
}

function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minutes ago`;
  if (hours < 24) return `${hours} hours ago`;
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString();
}
```

**Update `app/contexts/[context]/page.tsx`** (~50 LOC addition)
```typescript
import { InterpretationsView } from '@/app/components/InterpretationsView';

export default function ContextPage({ params }: { params: { context: string } }) {
  const [showInterpretations, setShowInterpretations] = useState(false);

  return (
    <div>
      {/* Existing chat UI */}
      <ChatInterface contextType={params.context} />

      {/* Toggle between form view and interpretations view */}
      <div className="mt-8">
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setShowInterpretations(false)}
            className={showInterpretations ? 'text-gray-500' : 'text-gray-900 font-medium'}
          >
            Form View
          </button>
          <button
            onClick={() => setShowInterpretations(true)}
            className={showInterpretations ? 'text-gray-900 font-medium' : 'text-gray-500'}
          >
            Interpretations View
          </button>
        </div>

        {showInterpretations ? (
          <InterpretationsView contextType={params.context} />
        ) : (
          <>
            {/* Existing form components */}
            <SharedProfileForm />
            <ContextIntentForm contextType={params.context} />
          </>
        )}
      </div>
    </div>
  );
}
```

### Integration Points

- Fetches from GET /api/profile/interpretations
- Triggers POST /api/profile/analyze for refresh
- Displays alongside existing form-based profile view (toggle between them)
- Uses existing Tailwind CSS styles
- Responsive on mobile (primary target)

## Constraints

- ≤ 450 LOC
- ≤ 0 new dependencies (use existing React, Tailwind)
- Must work on mobile (320px width minimum)
- Smooth loading transitions
- No layout shift between states

## Test Plan

### Component Tests

- Test InterpretationsView rendering:
  - With completed analysis → shows insights
  - With pending analysis → shows processing state
  - With <10 messages → shows empty state
  - With failed analysis → shows error state

- Test state transitions:
  - Loading → Completed
  - Loading → Empty
  - Completed → Refreshing → Completed
  - Failed → Retry → Completed

- Test InsightCard component:
  - Shows/hides evidence on button click
  - Displays confidence badge correctly
  - Renders insight text without breaking layout

### Manual Testing Checklist

- [ ] Test with completed analysis:
  - [ ] Interpretations display correctly
  - [ ] Gabor Maté section shows attachment style
  - [ ] Evidence quotes expand/collapse
  - [ ] Confidence badges show correctly
  - [ ] Refresh button works
- [ ] Test with <10 messages:
  - [ ] Empty state shows message count
  - [ ] Calculates needed messages correctly
- [ ] Test with pending analysis:
  - [ ] Processing state displays
  - [ ] Polls and updates when complete
- [ ] Test mobile responsive:
  - [ ] View on 320px width (iPhone SE)
  - [ ] Text readable, no horizontal scroll
  - [ ] Buttons accessible
- [ ] Test accessibility:
  - [ ] Tab through with keyboard
  - [ ] Screen reader announces states
  - [ ] ARIA labels present
- [ ] Test loading performance:
  - [ ] Initial load <1 second
  - [ ] Smooth transitions (no jank)

### Product Validation

- [ ] Interface gets out of the way (not overwhelming)
- [ ] Messaging is honest and empathetic (not clinical)
- [ ] Users feel understood (not analyzed)
- [ ] Evidence quotes build trust (show our work)
- [ ] Confidence indicators subtle (not alarming)
- [ ] Easy to refresh when needed

## Readiness

- [x] Ticket 2-04 complete (API endpoint)
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive
- [x] No blockers

## Implementation Notes

### Critical Details

**Toggle Between Views:**
- Keep existing forms visible via toggle
- Don't force users into interpretations-only view yet
- This allows A/B testing and gradual rollout
- Future: Replace forms entirely (Phase 3)

**Loading States:**
- Optimistic UI: Show last known interpretations while refreshing
- Poll every 2 seconds during analysis (max 30 attempts = 1 minute)
- Show spinner during initial load, subtle indicator during refresh

**Evidence Display:**
- Collapsed by default (don't overwhelm)
- Expandable on user click
- Shows actual quotes from user messages
- Builds trust ("here's how we know")

**Confidence Display:**
- Subtle badges (not prominent)
- Color-coded: green (≥80%), yellow (70-79%), gray (<70%)
- Don't filter by confidence in UI (backend already did that)
- Help users understand certainty level

**Accessibility:**
- Semantic HTML (headings, sections, buttons)
- ARIA labels for state indicators
- Keyboard navigation (tab through insights)
- Screen reader announces state changes
- Color not sole indicator (use text too)

**Mobile-First:**
- Single column layout
- Touch targets ≥44px
- Readable font sizes (≥16px body)
- No horizontal scroll
- Sticky header optional

### Design Principles

**"Here's what we're hearing from you":**
- Use reflective language ("You seem to...", "We're noticing...")
- Avoid diagnostic language ("You have X disorder")
- Frame as observations, not judgments
- Always empathetic, never clinical

**Evidence as Trust-Building:**
- Show actual user quotes
- Transparent about confidence
- Admit when unsure
- Users can verify interpretations match their words

**Progressive Disclosure:**
- Summary first, details on demand
- Evidence collapsed by default
- Framework names subtle (not prominent)
- Focus on insights, not methodology

**Graceful Degradation:**
- Empty state feels encouraging, not blocking
- Failed state gives clear retry path
- Processing state doesn't feel broken
- Missing frameworks don't break UI

### Edge Cases

1. **Analysis returns empty interpretations {}:**
   - This means confidence too low
   - Show message: "We need a bit more conversation to understand your patterns"

2. **User refreshes multiple times rapidly:**
   - Disable refresh button during processing
   - Rate limit enforced on backend (Ticket 2-03)

3. **Very long insight text (>500 chars):**
   - Allow text to wrap naturally
   - Consider truncating with "Read more" if needed

4. **Multiple frameworks return conflicting insights:**
   - Show both (synthesis in future ticket)
   - Label by framework name
   - Let user see different perspectives

5. **User has romantic context but no Esther Perel insights:**
   - This is valid (future ticket adds that framework)
   - Show only available frameworks
   - No error

### Future Enhancements (Not in This Ticket)

- User feedback buttons ("This feels right" / "Not quite")
- Compare interpretations over time (show changes)
- Export/share interpretations
- Print-friendly view
- Dark mode support
- Animation between state transitions
- Voice-over/audio version of insights

## Next Steps

After this ticket is complete:
1. Test with 10 real users
2. Gather feedback on interpretation quality
3. Adjust UI based on user reactions
4. **Proceed to Ticket 2-06:** User Refinement Flow (let users correct misinterpretations)
5. **Or Ticket 2-07:** Additional Framework - Esther Perel (add romantic-specific insights)
