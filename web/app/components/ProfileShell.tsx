"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut({ callbackUrl: "/" });
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "delete my account") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (res.ok) {
        router.push("/");
      } else {
        setIsDeleting(false);
      }
    } catch {
      setIsDeleting(false);
    }
  }

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

      {/* Account Actions */}
      <div className="mt-6 pt-4 border-t border-zinc-100">
        <p className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          Account
        </p>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
        >
          {isLoggingOut ? "Signing out..." : "Sign out"}
        </button>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
          >
            Delete account
          </button>
        ) : (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-xs text-red-700 mb-2">
              This will permanently delete your profile and chat history.
              Type <span className="font-mono font-medium">delete my account</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="delete my account"
              className="w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-red-300"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "delete my account" || isDeleting}
                className="flex-1 rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
