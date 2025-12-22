"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ChatMessage, ProfileDto, ProfileResponse } from "@/lib/types";

type Props = {
  contextType: string;
  tonePreference: string;
  initialMessages: ChatMessage[];
  initialProfile: ProfileResponse;
};

const toneCopy: Record<string, string> = {
  light: "Cruisey, gentle, low-pressure",
  balanced: "A mix of playful and direct",
  serious: "Direct, to the point",
};

const ageRangeOptions = ["18-24", "25-34", "35-44", "45-54", "55+"] as const;

export default function ChatProfilePanel({
  contextType,
  tonePreference,
  initialMessages,
  initialProfile,
}: Props) {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<"chat" | "profile">("chat");
  const [messages, setMessages] = useState(initialMessages);
  const [profile, setProfile] = useState<ProfileResponse>(initialProfile);
  const [sending, setSending] = useState(false);
  const [offRecord, setOffRecord] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileDto>(
    initialProfile.profile || {}
  );
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync messages when props change (after router.refresh)
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setProfile(initialProfile);
    setProfileForm(initialProfile.profile || {});
  }, [initialProfile]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(message: string) {
    if (sending || (!message.trim() && !offRecord)) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextType, message: message.trim(), offRecord }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
        return;
      }

      const data = await res.json();
      setProfile({
        profile: data.profile,
        completeness: data.completeness,
        missing: data.missing,
      });

      setMessageInput("");
      setOffRecord(false);
      router.refresh();
    } finally {
      setSending(false);
    }
  }

  async function handleQuickAction(action: string) {
    await sendMessage(action);
  }

  async function updateProfile(patch: Partial<ProfileDto>) {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contextType, patch }),
      });

      if (!res.ok) {
        console.error("Failed to update profile");
        return;
      }

      const data = await res.json();
      setProfile(data);
      setProfileForm(data.profile || {});
    } finally {
      setSavingProfile(false);
    }
  }

  function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateProfile(profileForm);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
          Context
        </p>
        <h1 className="text-3xl font-semibold capitalize">{contextType}</h1>
        <p className="text-zinc-600">
          Tone: <span className="font-medium">{toneCopy[tonePreference] || tonePreference}</span>
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "chat"
              ? "border-b-2 border-zinc-900 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 text-sm font-medium transition ${
            activeTab === "profile"
              ? "border-b-2 border-zinc-900 text-zinc-900"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Profile ({profile.completeness}%)
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-zinc-800">Chat</p>
              <p className="text-sm text-zinc-600">
                One small question at a time. Off the record stays off.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                onClick={() => handleQuickAction("Keep it light")}
                disabled={sending}
                className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700 transition hover:border-zinc-400 disabled:opacity-50"
              >
                Keep it light
              </button>
              <button
                onClick={() => handleQuickAction("Go deeper")}
                disabled={sending}
                className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-700 transition hover:border-zinc-400 disabled:opacity-50"
              >
                Go deeper
              </button>
              <button
                disabled
                title="Coming soon"
                className="rounded-full border border-zinc-200 px-3 py-1 text-zinc-400 cursor-not-allowed"
              >
                Forget last message
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="max-h-80 space-y-2 overflow-y-auto rounded-lg border border-zinc-100 bg-zinc-50 p-3">
              {messages.length === 0 ? (
                <p className="text-sm text-zinc-500">No messages yet.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
                      {msg.role === "user" ? "You" : msg.role}
                      {msg.offRecord && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                          Off the record
                        </span>
                      )}
                    </div>
                    <div className="text-zinc-800">
                      {msg.offRecord ? "Not stored (off the record)" : msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(messageInput);
              }}
              className="space-y-2"
            >
              <label className="flex items-start gap-2">
                <input
                  type="checkbox"
                  checked={offRecord}
                  onChange={(e) => setOffRecord(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-zinc-300 text-black focus:ring-0"
                />
                <span className="text-sm text-zinc-700">
                  Off the record (we won&apos;t store the text, just that you used it)
                </span>
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask for help, share context, or set boundaries..."
                  disabled={sending}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none ring-0 transition focus:border-zinc-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sending || (!messageInput.trim() && !offRecord)}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50 sm:w-32"
                >
                  {sending ? "Sending..." : "Send"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          {/* Completeness Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-zinc-800">Profile Completeness</span>
              <span className="text-zinc-600">{profile.completeness}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100">
              <div
                className="h-2 rounded-full bg-zinc-900 transition-all"
                style={{ width: `${profile.completeness}%` }}
              />
            </div>
            {profile.missing.length > 0 && (
              <p className="text-sm text-zinc-500">
                Missing: {profile.missing.join(", ")}
              </p>
            )}
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Name</label>
              <input
                type="text"
                value={profileForm.name || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, name: e.target.value })
                }
                placeholder="Your name or nickname"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Age Range</label>
              <select
                value={profileForm.ageRange || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    ageRange: e.target.value as ProfileDto["ageRange"],
                  })
                }
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
              >
                <option value="">Select age range</option>
                {ageRangeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Location</label>
              <input
                type="text"
                value={profileForm.location || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, location: e.target.value })
                }
                placeholder="City or region"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">Intent</label>
              <textarea
                value={profileForm.intent || ""}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, intent: e.target.value })
                }
                placeholder="What are you looking for?"
                rows={2}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                Dealbreakers (comma-separated)
              </label>
              <input
                type="text"
                value={profileForm.dealbreakers?.join(", ") || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    dealbreakers: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Things you absolutely won't accept"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700">
                Preferences (comma-separated)
              </label>
              <input
                type="text"
                value={profileForm.preferences?.join(", ") || ""}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    preferences: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="Things you'd like in a match"
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
