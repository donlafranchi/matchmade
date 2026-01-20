"use client";

import { useState } from "react";
import type { ContextIntentDto, ContextIntentPatch } from "@/lib/types";

type ContextIntentFormProps = {
  contextType: string;
  intent: ContextIntentDto;
  onSave: (patch: ContextIntentPatch) => Promise<void>;
};

export function ContextIntentForm({
  contextType,
  intent,
  onSave,
}: ContextIntentFormProps) {
  const [formData, setFormData] = useState<ContextIntentDto>(intent);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Extract only the fields relevant to this context (remove contextType)
      const { contextType: _, ...patch } = formData;
      await onSave(patch as ContextIntentPatch);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save intent");
    } finally {
      setSaving(false);
    }
  };

  const renderFields = () => {
    switch (contextType) {
      case "romantic":
        return (
          <>
            <SelectField
              label="Relationship Timeline"
              id="relationshipTimeline"
              value={
                (formData as { relationshipTimeline?: string })
                  .relationshipTimeline || ""
              }
              options={[
                { value: "taking_my_time", label: "Taking my time" },
                { value: "open_to_soon", label: "Open to soon" },
                { value: "actively_looking", label: "Actively looking" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  relationshipTimeline: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Exclusivity Expectation"
              id="exclusivityExpectation"
              value={
                (formData as { exclusivityExpectation?: string })
                  .exclusivityExpectation || ""
              }
              options={[
                { value: "monogamous", label: "Monogamous" },
                { value: "open", label: "Open" },
                { value: "figuring_it_out", label: "Figuring it out" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  exclusivityExpectation: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Family Intentions"
              id="familyIntentions"
              value={
                (formData as { familyIntentions?: string }).familyIntentions ||
                ""
              }
              options={[
                { value: "want_kids", label: "Want kids" },
                { value: "dont_want_kids", label: "Don't want kids" },
                { value: "open", label: "Open" },
                { value: "already_have", label: "Already have kids" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  familyIntentions: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Attraction Importance"
              id="attractionImportance"
              value={
                (formData as { attractionImportance?: string })
                  .attractionImportance || ""
              }
              options={[
                { value: "critical", label: "Critical" },
                { value: "important", label: "Important" },
                { value: "balanced", label: "Balanced" },
                { value: "less_important", label: "Less important" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  attractionImportance: v,
                } as ContextIntentDto)
              }
            />
          </>
        );

      case "friendship":
        return (
          <>
            <SelectField
              label="Friendship Depth"
              id="friendshipDepth"
              value={
                (formData as { friendshipDepth?: string }).friendshipDepth || ""
              }
              options={[
                { value: "casual", label: "Casual" },
                { value: "close", label: "Close" },
                { value: "best_friend", label: "Best friend" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  friendshipDepth: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Group Activity Preference"
              id="groupActivityPreference"
              value={
                (formData as { groupActivityPreference?: string })
                  .groupActivityPreference || ""
              }
              options={[
                { value: "one_on_one", label: "One-on-one" },
                { value: "small_group", label: "Small group" },
                { value: "large_group", label: "Large group" },
                { value: "flexible", label: "Flexible" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  groupActivityPreference: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Emotional Support Expectation"
              id="emotionalSupportExpectation"
              value={
                (formData as { emotionalSupportExpectation?: string })
                  .emotionalSupportExpectation || ""
              }
              options={[
                { value: "minimal", label: "Minimal" },
                { value: "moderate", label: "Moderate" },
                { value: "high", label: "High" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  emotionalSupportExpectation: v,
                } as ContextIntentDto)
              }
            />
          </>
        );

      case "professional":
        return (
          <>
            <SelectField
              label="Partnership Type"
              id="partnershipType"
              value={
                (formData as { partnershipType?: string }).partnershipType || ""
              }
              options={[
                { value: "cofounder", label: "Cofounder" },
                { value: "collaborator", label: "Collaborator" },
                { value: "advisor", label: "Advisor" },
                { value: "employee", label: "Employee" },
                { value: "contractor", label: "Contractor" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  partnershipType: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Commitment Horizon"
              id="commitmentHorizon"
              value={
                (formData as { commitmentHorizon?: string })
                  .commitmentHorizon || ""
              }
              options={[
                { value: "project_based", label: "Project-based" },
                { value: "ongoing", label: "Ongoing" },
                { value: "long_term", label: "Long-term" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  commitmentHorizon: v,
                } as ContextIntentDto)
              }
            />
            <div className="space-y-1">
              <label
                htmlFor="complementarySkills"
                className="text-sm font-medium text-zinc-700"
              >
                Complementary Skills (comma-separated)
              </label>
              <input
                id="complementarySkills"
                type="text"
                value={
                  (formData as { complementarySkills?: string[] })
                    .complementarySkills?.join(", ") || ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complementarySkills: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  } as ContextIntentDto)
                }
                placeholder="Design, Engineering, Marketing, Sales"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
              />
            </div>
            <SelectField
              label="Equity or Rev Share"
              id="equityOrRevShare"
              value={
                (formData as { equityOrRevShare?: string }).equityOrRevShare ||
                ""
              }
              options={[
                { value: "equity", label: "Equity" },
                { value: "rev_share", label: "Rev share" },
                { value: "salary", label: "Salary" },
                { value: "hybrid", label: "Hybrid" },
                { value: "tbd", label: "TBD" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  equityOrRevShare: v,
                } as ContextIntentDto)
              }
            />
          </>
        );

      case "creative":
        return (
          <>
            <SelectField
              label="Creative Type"
              id="creativeType"
              value={(formData as { creativeType?: string }).creativeType || ""}
              options={[
                { value: "music", label: "Music" },
                { value: "writing", label: "Writing" },
                { value: "visual_art", label: "Visual art" },
                { value: "film", label: "Film" },
                { value: "performance", label: "Performance" },
                { value: "other", label: "Other" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  creativeType: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Role Needed"
              id="roleNeeded"
              value={(formData as { roleNeeded?: string }).roleNeeded || ""}
              options={[
                { value: "co_creator", label: "Co-creator" },
                { value: "contributor", label: "Contributor" },
                { value: "feedback", label: "Feedback" },
                { value: "production", label: "Production" },
              ]}
              onChange={(v) =>
                setFormData({ ...formData, roleNeeded: v } as ContextIntentDto)
              }
            />
            <SelectField
              label="Process Style"
              id="processStyle"
              value={(formData as { processStyle?: string }).processStyle || ""}
              options={[
                { value: "structured", label: "Structured" },
                { value: "spontaneous", label: "Spontaneous" },
                { value: "hybrid", label: "Hybrid" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  processStyle: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Ego Balance"
              id="egoBalance"
              value={(formData as { egoBalance?: string }).egoBalance || ""}
              options={[
                { value: "shared_vision", label: "Shared vision" },
                { value: "lead_follow", label: "Lead/follow" },
                { value: "independent", label: "Independent" },
              ]}
              onChange={(v) =>
                setFormData({ ...formData, egoBalance: v } as ContextIntentDto)
              }
            />
            <SelectField
              label="Compensation Expectation"
              id="compensationExpectation"
              value={
                (formData as { compensationExpectation?: string })
                  .compensationExpectation || ""
              }
              options={[
                { value: "paid", label: "Paid" },
                { value: "profit_share", label: "Profit share" },
                { value: "free", label: "Free" },
                { value: "depends", label: "Depends" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  compensationExpectation: v,
                } as ContextIntentDto)
              }
            />
          </>
        );

      case "service":
        return (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                Service Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="serviceType"
                    value="offering"
                    checked={
                      (formData as { serviceType?: string }).serviceType ===
                      "offering"
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceType: e.target.value,
                      } as ContextIntentDto)
                    }
                    className="h-4 w-4 border-zinc-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-zinc-700">Offering</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="serviceType"
                    value="seeking"
                    checked={
                      (formData as { serviceType?: string }).serviceType ===
                      "seeking"
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        serviceType: e.target.value,
                      } as ContextIntentDto)
                    }
                    className="h-4 w-4 border-zinc-300 text-black focus:ring-black"
                  />
                  <span className="text-sm text-zinc-700">Seeking</span>
                </label>
              </div>
            </div>
            <SelectField
              label="Budget Range"
              id="budgetRange"
              value={(formData as { budgetRange?: string }).budgetRange || ""}
              options={[
                { value: "under_1k", label: "Under $1k" },
                { value: "1k_5k", label: "$1k-5k" },
                { value: "5k_20k", label: "$5k-20k" },
                { value: "20k_plus", label: "$20k+" },
                { value: "flexible", label: "Flexible" },
              ]}
              onChange={(v) =>
                setFormData({ ...formData, budgetRange: v } as ContextIntentDto)
              }
            />
            <SelectField
              label="Timeline Needed"
              id="timelineNeeded"
              value={
                (formData as { timelineNeeded?: string }).timelineNeeded || ""
              }
              options={[
                { value: "urgent", label: "Urgent" },
                { value: "weeks", label: "Weeks" },
                { value: "months", label: "Months" },
                { value: "flexible", label: "Flexible" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  timelineNeeded: v,
                } as ContextIntentDto)
              }
            />
            <SelectField
              label="Credentials Required"
              id="credentialsRequired"
              value={
                (formData as { credentialsRequired?: string })
                  .credentialsRequired || ""
              }
              options={[
                { value: "licensed", label: "Licensed" },
                { value: "experienced", label: "Experienced" },
                { value: "portfolio", label: "Portfolio" },
                { value: "flexible", label: "Flexible" },
              ]}
              onChange={(v) =>
                setFormData({
                  ...formData,
                  credentialsRequired: v,
                } as ContextIntentDto)
              }
            />
          </>
        );

      default:
        return <p className="text-sm text-zinc-500">Unknown context type</p>;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold capitalize text-zinc-900">
          {contextType} Intent
        </h3>
        <p className="text-sm text-zinc-600">
          These preferences are specific to {contextType} relationships.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderFields()}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {success && (
            <span className="text-sm text-green-600">Saved successfully!</span>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">Error: {error}</p>
        )}
      </form>
    </div>
  );
}

// Helper component for select fields
function SelectField({
  label,
  id,
  value,
  options,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
