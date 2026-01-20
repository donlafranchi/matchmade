"use client";

import { useState } from "react";
import type { ProfileDto } from "@/lib/types";

type SharedProfileFormProps = {
  profile: ProfileDto;
  onSave: (patch: Partial<ProfileDto>) => Promise<void>;
};

const ageRangeOptions = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;

export function SharedProfileForm({ profile, onSave }: SharedProfileFormProps) {
  const [formData, setFormData] = useState<ProfileDto>(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await onSave(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">Shared Profile</h3>
        <p className="text-sm text-zinc-600">
          This information appears in all your contexts.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1">
          <label
            htmlFor="name"
            className="text-sm font-medium text-zinc-700"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name || ""}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Your name or nickname"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Location */}
        <div className="space-y-1">
          <label
            htmlFor="location"
            className="text-sm font-medium text-zinc-700"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={formData.location || ""}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="City or region"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Age Range */}
        <div className="space-y-1">
          <label
            htmlFor="ageRange"
            className="text-sm font-medium text-zinc-700"
          >
            Age Range
          </label>
          <select
            id="ageRange"
            value={formData.ageRange || ""}
            onChange={(e) =>
              setFormData({ ...formData, ageRange: e.target.value })
            }
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
          >
            <option value="">Select age range</option>
            {ageRangeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Core Values */}
        <div className="space-y-1">
          <label
            htmlFor="coreValues"
            className="text-sm font-medium text-zinc-700"
          >
            Core Values (comma-separated)
          </label>
          <input
            id="coreValues"
            type="text"
            value={formData.coreValues?.join(", ") || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                coreValues: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="authenticity, growth, creativity"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Constraints (formerly dealbreakers) */}
        <div className="space-y-1">
          <label
            htmlFor="constraints"
            className="text-sm font-medium text-zinc-700"
          >
            Constraints (comma-separated)
          </label>
          <input
            id="constraints"
            type="text"
            value={formData.constraints?.join(", ") || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                constraints: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Things you absolutely need or can't accept"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Save Button */}
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
