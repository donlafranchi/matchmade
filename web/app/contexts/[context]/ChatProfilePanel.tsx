"use client";

import { useState, useRef, useEffect } from "react";
import type { ChatMessage, ProfileDto, ContextIntentDto } from "@/lib/types";

type Props = {
  contextType: string;
  tonePreference: string; // kept for API compatibility
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
};

export default function ChatProfilePanel({
  contextType,
  initialMessages,
  sharedProfile: initialSharedProfile,
  contextIntent: initialContextIntent,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState(initialMessages);
  const [sharedProfile, setSharedProfile] = useState(initialSharedProfile);
  const [contextIntent, setContextIntent] = useState(initialContextIntent);
  const [sending, setSending] = useState(false);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  // Sync state when props change
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    setSharedProfile(initialSharedProfile);
  }, [initialSharedProfile]);

  useEffect(() => {
    setContextIntent(initialContextIntent);
  }, [initialContextIntent]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(message: string) {
    if (sending || !message.trim()) return;

    const trimmedMessage = message.trim();
    setSending(true);
    setWaitingForAgent(true);

    // Optimistically add user message to UI
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
      offRecord: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setMessageInput("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextType,
          message: trimmedMessage,
        }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        return;
      }

      const data = await res.json();

      // Replace temp message with real one and add agent response
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempUserMsg.id);
        const newMessages = [...withoutTemp, data.userMessage];
        if (data.agentMessage) {
          newMessages.push(data.agentMessage);
        }
        return newMessages;
      });

      // Update profile and intent state
      if (data.profile) {
        setSharedProfile({
          profile: data.profile,
          completeness: data.completeness?.profile || 0,
          missing: data.missing?.profile || [],
        });
      }

      if (data.intent) {
        setContextIntent({
          intent: data.intent,
          completeness: data.completeness?.intent || 0,
          missing: data.missing?.intent || [],
        });
      }
    } finally {
      setSending(false);
      setWaitingForAgent(false);
    }
  }

  return (
    <div className="flex flex-col rounded-xl bg-white shadow-sm">
      {/* Chat Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {messages.length === 0 && !waitingForAgent ? (
          <div className="space-y-4">
            {/* Welcome message */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl bg-zinc-200 px-4 py-2 text-sm text-zinc-800">
                Hey! I&apos;m here to help you figure out what you&apos;re looking for. Unlike other apps that have you swiping endlessly, we focus on values and compatibility first - physical chemistry is something you discover in person. If you&apos;re curious about how this works or why we do things differently, just ask. Otherwise, tell me what brings you here.
              </div>
            </div>
            {/* Starter prompts */}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => sendMessage("I'm looking for something serious")}
                disabled={sending}
                className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Looking for something serious
              </button>
              <button
                onClick={() => sendMessage("Just exploring, not sure what I want yet")}
                disabled={sending}
                className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Just exploring
              </button>
              <button
                onClick={() => sendMessage("How is this different from other dating apps?")}
                disabled={sending}
                className="rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                How is this different?
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                  msg.role === "assistant"
                    ? "bg-zinc-200 text-zinc-800"
                    : "bg-zinc-900 text-white"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {waitingForAgent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl bg-zinc-200 px-4 py-2 text-sm text-zinc-500">
              <span className="animate-pulse">Typing</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: "150ms" }}>.</span>
              <span className="animate-bounce inline-block" style={{ animationDelay: "300ms" }}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(messageInput);
        }}
        className="flex gap-2 border-t border-zinc-100 p-4"
      >
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || !messageInput.trim()}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {sending ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
}
