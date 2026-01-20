"use client";

import { useState, useEffect } from "react";

type DebugData = {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  profile: {
    name: string | null;
    location: string | null;
    ageRange: string | null;
    coreValues: string[];
    constraints: string[];
    completeness: number;
    missing: string[];
    interpretations: any;
    rawPatterns: any;
  } | null;
  contextProfiles: Array<{
    contextType: string;
    messageCount: number;
    messages: Array<{
      role: string;
      content: string | null;
      createdAt: string;
    }>;
  }>;
  contextIntents: Array<{
    contextType: string;
    completeness: number;
    missing: string[];
    [key: string]: any;
  }>;
};

export default function DebugPage() {
  const [data, setData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/debug/profile");
      if (!res.ok) {
        if (res.status === 401) {
          setError("Not logged in. Go to / to sign in first.");
        } else {
          setError(`Error: ${res.status}`);
        }
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
        <p>No data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Debug View</h1>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-zinc-700 rounded hover:bg-zinc-600 text-sm"
          >
            Refresh
          </button>
        </div>

        {/* User Info */}
        <Section title="User">
          <Row label="ID" value={data.user.id} />
          <Row label="Email" value={data.user.email} />
        </Section>

        {/* Profile */}
        <Section title="Shared Profile">
          {data.profile ? (
            <>
              <Row label="Name" value={data.profile.name} />
              <Row label="Location" value={data.profile.location} />
              <Row label="Age Range" value={data.profile.ageRange} />
              <Row
                label="Core Values"
                value={data.profile.coreValues?.join(", ") || "None"}
              />
              <Row
                label="Constraints"
                value={data.profile.constraints?.join(", ") || "None"}
              />
              <Row
                label="Completeness"
                value={`${data.profile.completeness}%`}
              />
              <Row
                label="Missing Fields"
                value={data.profile.missing?.join(", ") || "None"}
              />
              {data.profile.interpretations && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 uppercase mb-2">
                    Interpretations (raw)
                  </p>
                  <pre className="text-xs bg-zinc-800 p-3 rounded overflow-auto max-h-40">
                    {JSON.stringify(data.profile.interpretations, null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <p className="text-zinc-500">No profile yet</p>
          )}
        </Section>

        {/* Context Intents */}
        {data.contextIntents.map((intent) => (
          <Section
            key={intent.contextType}
            title={`Intent: ${intent.contextType}`}
          >
            <Row
              label="Completeness"
              value={`${intent.completeness}%`}
            />
            <Row
              label="Missing"
              value={intent.missing?.join(", ") || "None"}
            />
            {Object.entries(intent)
              .filter(
                ([k, v]) =>
                  !["id", "contextType", "completeness", "missing"].includes(k) &&
                  v !== null
              )
              .map(([k, v]) => (
                <Row
                  key={k}
                  label={k}
                  value={Array.isArray(v) ? v.join(", ") : String(v)}
                />
              ))}
          </Section>
        ))}

        {/* Chat Messages */}
        {data.contextProfiles.map((cp) => (
          <Section
            key={cp.contextType}
            title={`Chat: ${cp.contextType} (${cp.messageCount} messages)`}
          >
            <div className="space-y-2 max-h-96 overflow-auto">
              {cp.messages.length === 0 ? (
                <p className="text-zinc-500">No messages yet</p>
              ) : (
                cp.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm ${
                      msg.role === "user"
                        ? "bg-blue-900/30 ml-8"
                        : "bg-zinc-800 mr-8"
                    }`}
                  >
                    <span className="text-xs text-zinc-500 uppercase">
                      {msg.role}
                    </span>
                    <p className="text-zinc-200">{msg.content || "(empty)"}</p>
                  </div>
                ))
              )}
            </div>
          </Section>
        ))}
      </div>
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
    <div className="bg-zinc-800/50 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3 text-zinc-300">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between py-1 border-b border-zinc-700/50 last:border-0">
      <span className="text-zinc-400 text-sm">{label}</span>
      <span className="text-zinc-200 text-sm">
        {value || <span className="text-zinc-600">—</span>}
      </span>
    </div>
  );
}
