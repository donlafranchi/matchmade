"use client";

import type { ProfileDto, ContextIntentDto } from "@/lib/types";

type Props = {
  contextType: string;
  profile: ProfileDto;
  intent: ContextIntentDto;
  completeness: number;
};

// Human-readable field labels
const profileFieldLabels: Record<string, string> = {
  location: "Where you're based",
  ageRange: "Your age",
  name: "Your name",
  coreValues: "What you value most",
  constraints: "Your dealbreakers",
};

const intentFieldLabels: Record<string, Record<string, string>> = {
  romantic: {
    relationshipTimeline: "Your pace",
    exclusivityExpectation: "Exclusivity preference",
    familyIntentions: "Family goals",
    attractionImportance: "Physical attraction importance",
  },
  friendship: {
    friendshipDepth: "Friendship style",
    groupActivityPreference: "Social preference",
    emotionalSupportExpectation: "Support expectations",
  },
  professional: {
    partnershipType: "What you're looking for",
    commitmentHorizon: "Time commitment",
    complementarySkills: "Skills you need",
    equityOrRevShare: "Compensation expectations",
  },
  creative: {
    creativeType: "Creative domain",
    roleNeeded: "Role you need",
    processStyle: "Work style",
    egoBalance: "Credit/control balance",
    compensationExpectation: "Compensation",
  },
  service: {
    serviceType: "Service needed",
    budgetRange: "Budget",
    timelineNeeded: "Timeline",
    credentialsRequired: "Credentials preference",
  },
};

function FieldRow({
  label,
  value,
  filled,
}: {
  label: string;
  value?: string | string[];
  filled: boolean;
}) {
  const displayValue = Array.isArray(value)
    ? value.length > 0
      ? value.join(", ")
      : null
    : value;

  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
      <span className={`text-sm ${filled ? "text-zinc-800" : "text-zinc-400"}`}>
        {label}
      </span>
      <span
        className={`text-sm ${filled ? "text-zinc-900 font-medium" : "text-zinc-300 italic"}`}
      >
        {filled ? displayValue : "Not yet"}
      </span>
    </div>
  );
}

export function ProfileShell({ contextType, profile, intent, completeness }: Props) {
  // Get relevant intent fields for this context
  const intentLabels = intentFieldLabels[contextType] || {};

  // Check which fields are filled
  const isProfileFieldFilled = (field: string) => {
    const value = (profile as any)[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  };

  const isIntentFieldFilled = (field: string) => {
    const value = (intent as any)[field];
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && value !== "";
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-800">What we're learning</h3>
        <span className="text-xs text-zinc-500">{completeness}% complete</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-zinc-100 mb-4">
        <div
          className="h-1.5 rounded-full bg-zinc-800 transition-all duration-500"
          style={{ width: `${completeness}%` }}
        />
      </div>

      {/* About You section */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
          About You
        </p>
        {Object.entries(profileFieldLabels).map(([field, label]) => (
          <FieldRow
            key={field}
            label={label}
            value={(profile as any)[field]}
            filled={isProfileFieldFilled(field)}
          />
        ))}
      </div>

      {/* Context-specific section */}
      {Object.keys(intentLabels).length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            What You're Looking For
          </p>
          {Object.entries(intentLabels).map(([field, label]) => (
            <FieldRow
              key={field}
              label={label}
              value={(intent as any)[field]}
              filled={isIntentFieldFilled(field)}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-400 mt-4 text-center">
        Just chat naturally - we'll fill this in as we go
      </p>
    </div>
  );
}
