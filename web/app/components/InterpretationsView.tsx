'use client';

/**
 * Interpretations View Component
 * Displays therapeutic profile insights from analysis pipeline
 * Supports multiple states: loading, empty, processing, completed, failed
 */

import { useEffect, useState } from 'react';
import {
  InterpretationsResponse,
  GaborMateInterpretation,
} from '@/lib/interpretation/api-types';

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
      const res = await fetch(
        `/api/profile/interpretations?contextType=${contextType}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setData(data);
    } catch (error) {
      console.error('Failed to fetch interpretations:', error);
      setData(null);
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
        body: JSON.stringify({ contextType }),
      });

      // Poll for completion (check every 2 seconds, max 30 attempts = 1 minute)
      let attempts = 0;
      const pollInterval = setInterval(async () => {
        attempts++;
        const res = await fetch(
          `/api/profile/interpretations?contextType=${contextType}`
        );
        const newData = await res.json();

        if (
          newData.meta.status === 'completed' ||
          newData.meta.status === 'failed' ||
          attempts > 30
        ) {
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

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error fetching data
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
    return (
      <FailedState
        error={data.meta.error}
        onRetry={handleRefresh}
        refreshing={refreshing}
      />
    );
  }

  // Completed - show interpretations
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
          className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Refresh interpretations"
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
      {data.contextSpecific && data.contextSpecific.summary && (
        <Section title={`In ${contextType} relationships`}>
          <p className="text-gray-700 mb-6 leading-relaxed">
            {data.contextSpecific.summary}
          </p>

          {/* Esther Perel (romantic only) - future enhancement */}
          {data.contextSpecific.frameworks.esther_perel &&
            contextType === 'romantic' && (
              <EstherPerelSection
                insights={data.contextSpecific.frameworks.esther_perel}
              />
            )}
        </Section>
      )}

      {/* Empty interpretations (low confidence) */}
      {!data.shared && !data.contextSpecific && (
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <p className="text-gray-700">
            We need a bit more conversation to understand your patterns. Keep
            sharing and we'll generate insights soon.
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="bg-white rounded-lg border border-gray-200 p-6"
      aria-labelledby={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <h3
        id={`section-${title.toLowerCase().replace(/\s+/g, '-')}`}
        className="text-lg font-medium text-gray-900 mb-4"
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function GaborMateSection({
  insights,
}: {
  insights: GaborMateInterpretation;
}) {
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
            You seem to prioritize:{' '}
            {insights.underlying_needs.primary.join(', ')}
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
          evidence={insights.authentic_vs_adapted.evidence || []}
        />
      )}

      {/* Trauma Patterns (optional) */}
      {insights.trauma_patterns && (
        <div className="border-l-4 border-purple-200 pl-4">
          <h4 className="font-medium text-gray-800 mb-2">Patterns & Coping</h4>
          {insights.trauma_patterns.defense_mechanisms && (
            <p className="text-gray-700 text-sm mb-1">
              <span className="font-medium">Defense mechanisms:</span>{' '}
              {insights.trauma_patterns.defense_mechanisms.join(', ')}
            </p>
          )}
          {insights.trauma_patterns.coping_strategies && (
            <p className="text-gray-700 text-sm mb-2">
              <span className="font-medium">Coping strategies:</span>{' '}
              {insights.trauma_patterns.coping_strategies.join(', ')}
            </p>
          )}
          <ConfidenceBadge confidence={insights.trauma_patterns.confidence} />
        </div>
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
          evidence={insights.desire_paradox.evidence || []}
        />
      )}
      {insights.intimacy_style && (
        <InsightCard
          title="Intimacy Style"
          confidence={insights.intimacy_style.confidence}
          insight={insights.intimacy_style.insight}
          evidence={insights.intimacy_style.evidence || []}
        />
      )}
    </div>
  );
}

function InsightCard({
  title,
  confidence,
  insight,
  evidence,
}: {
  title: string;
  confidence: number;
  insight: string;
  evidence: string[];
}) {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="border-l-4 border-indigo-200 pl-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
        <h4 className="font-medium text-gray-800">{title}</h4>
        <ConfidenceBadge confidence={confidence} />
      </div>
      <p className="text-gray-700 text-sm leading-relaxed mb-3">{insight}</p>
      {evidence && evidence.length > 0 && (
        <>
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="text-xs text-gray-500 hover:text-gray-700 underline focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 rounded"
            aria-expanded={showEvidence}
            aria-controls={`evidence-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {showEvidence ? 'Hide' : 'Show'} evidence
          </button>
          {showEvidence && (
            <ul
              id={`evidence-${title.toLowerCase().replace(/\s+/g, '-')}`}
              className="mt-2 space-y-1"
            >
              {evidence.map((item, i) => (
                <li key={i} className="text-xs text-gray-600 italic">
                  "{item}"
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const percent = Math.round(confidence * 100);
  const color =
    confidence >= 0.8
      ? 'bg-green-100 text-green-700'
      : confidence >= 0.7
        ? 'bg-yellow-100 text-yellow-700'
        : 'bg-gray-100 text-gray-600';

  return (
    <span
      className={`text-xs px-2 py-1 rounded ${color} whitespace-nowrap`}
      aria-label={`${percent} percent confident`}
    >
      {percent}% confident
    </span>
  );
}

// State components
function LoadingState() {
  return (
    <div
      className="flex items-center justify-center py-12"
      role="status"
      aria-live="polite"
    >
      <div className="text-center">
        <div
          className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-gray-900 rounded-full mx-auto mb-4"
          aria-hidden="true"
        />
        <p className="text-gray-600">Loading your insights...</p>
      </div>
    </div>
  );
}

function EmptyState({ messageCount }: { messageCount: number }) {
  const needed = Math.max(0, 10 - messageCount);

  return (
    <div
      className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Share more to see insights
      </h3>
      <p className="text-gray-600 mb-4">
        You have {messageCount} {messageCount === 1 ? 'message' : 'messages'}.
        Share {needed} more to generate your profile interpretation.
      </p>
      <p className="text-sm text-gray-500">
        The more you share in conversation, the better we can understand your
        patterns and needs.
      </p>
    </div>
  );
}

function ProcessingState() {
  return (
    <div
      className="bg-blue-50 rounded-lg border border-blue-200 p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="animate-pulse h-8 w-8 bg-blue-400 rounded-full mx-auto mb-4"
        aria-hidden="true"
      />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Analyzing your conversation...
      </h3>
      <p className="text-gray-600">
        This usually takes 30-60 seconds. Feel free to continue chatting.
      </p>
    </div>
  );
}

function FailedState({
  error,
  onRetry,
  refreshing,
}: {
  error?: string;
  onRetry: () => void;
  refreshing?: boolean;
}) {
  return (
    <div
      className="bg-red-50 rounded-lg border border-red-200 p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Analysis failed
      </h3>
      <p className="text-gray-600 mb-4">
        {error || 'Something went wrong. Please try again.'}
      </p>
      <button
        onClick={onRetry}
        disabled={refreshing}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {refreshing ? 'Retrying...' : 'Try again'}
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Couldn't load interpretations
      </h3>
      <p className="text-gray-600 mb-4">
        There was an error loading your profile insights.
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
  if (minutes < 60) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  if (hours < 24) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (days < 7) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  return date.toLocaleDateString();
}
