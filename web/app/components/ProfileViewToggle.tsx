'use client';

/**
 * Profile View Toggle Component
 * Allows switching between form-based profile view and interpretations view
 */

import { useState } from 'react';
import { InterpretationsView } from './InterpretationsView';
import ChatProfilePanel from '../contexts/[context]/ChatProfilePanel';
import type { ChatMessage, ProfileDto, ContextIntentDto } from '@/lib/types';

interface Props {
  contextType: string;
  tonePreference: string;
  initialMessages: ChatMessage[];
  sharedProfile: {
    profile: ProfileDto;
    completeness: number;
    missing: string[];
  };
  contextIntent: {
    intent: ContextIntentDto;
    completeness: number;
    missing: string[];
  };
}

export function ProfileViewToggle({
  contextType,
  tonePreference,
  initialMessages,
  sharedProfile,
  contextIntent,
}: Props) {
  const [view, setView] = useState<'form' | 'interpretations'>('form');

  return (
    <div className="space-y-6">
      {/* Toggle Buttons */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setView('form')}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
            view === 'form'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-current={view === 'form' ? 'page' : undefined}
        >
          Profile Form
          {view === 'form' && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
              aria-hidden="true"
            />
          )}
        </button>
        <button
          onClick={() => setView('interpretations')}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${
            view === 'interpretations'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          aria-current={view === 'interpretations' ? 'page' : undefined}
        >
          Interpretations
          {view === 'interpretations' && (
            <span
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
              aria-hidden="true"
            />
          )}
        </button>
      </div>

      {/* Content */}
      {view === 'form' ? (
        <ChatProfilePanel
          contextType={contextType}
          tonePreference={tonePreference}
          initialMessages={initialMessages}
          sharedProfile={sharedProfile}
          contextIntent={contextIntent}
        />
      ) : (
        <InterpretationsView contextType={contextType} />
      )}
    </div>
  );
}
