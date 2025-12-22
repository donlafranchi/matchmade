"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type MessageType = {
  id: number;
  text: string;
  isAgent: boolean;
};

type ContextOption = "romantic" | "friendship" | "professional";

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showChoices, setShowChoices] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedContexts, setSelectedContexts] = useState<Set<ContextOption>>(
    new Set()
  );

  useEffect(() => {
    // Show messages sequentially with natural delays
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 1,
            text: "Hey, I'm here to help you meet the right people—whether that's finding new friends, meeting someone you could fall for, or networking personally or professionally.",
            isAgent: true,
          },
        ]);
      }, 500)
    );

    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 2,
            text: "Here's how this works: we focus on what matters to you first (values, lifestyle, what you're actually looking for), then attraction, then we help you meet in real life. No endless swiping. No games. Just honest connections.",
            isAgent: true,
          },
        ]);
      }, 2500)
    );

    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 3,
            text: "So what brings you here? What are you hoping to find right now?",
            isAgent: true,
          },
        ]);
        setShowChoices(true);
      }, 5000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const toggleContext = (context: ContextOption) => {
    setSelectedContexts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(context)) {
        newSet.delete(context);
      } else {
        newSet.add(context);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedContexts.size === 0) return;

    setShowChoices(false);
    setIsProcessing(true);

    const contextArray = Array.from(selectedContexts);
    const choiceText =
      contextArray.length === 1
        ? contextArray[0] === "romantic"
          ? "Looking for romance"
          : contextArray[0] === "friendship"
            ? "Looking for friends"
            : "Professional networking"
        : `Looking for ${contextArray.length} things`;

    // Add user's choice to messages
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: choiceText,
        isAgent: false,
      },
    ]);

    // Create context profiles
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contexts: contextArray }),
      });

      if (response.ok) {
        // Show confirmation message
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              text: "Cool. Let's get started.",
              isAgent: true,
            },
          ]);

          // Redirect to first context
          setTimeout(() => {
            router.push(`/contexts/${contextArray[0]}`);
          }, 1500);
        }, 800);
      }
    } catch (error) {
      console.error("Error creating contexts:", error);
      setIsProcessing(false);
      setShowChoices(true);
    }
  };

  const contextOptions: { value: ContextOption; label: string }[] = [
    { value: "friendship", label: "Looking for friends" },
    { value: "romantic", label: "Looking for romance" },
    { value: "professional", label: "Professional networking" },
  ];

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Welcome
          </p>
        </div>

        {/* Chat container */}
        <div className="space-y-4 rounded-2xl bg-white p-8 shadow-sm">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isAgent ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  message.isAgent
                    ? "bg-zinc-100 text-zinc-900"
                    : "bg-black text-white"
                }`}
              >
                <p className="text-[15px] leading-relaxed">{message.text}</p>
              </div>
            </div>
          ))}

          {/* Choice checkboxes */}
          {showChoices && !isProcessing && (
            <div className="space-y-4 pt-4">
              <div className="space-y-3">
                {contextOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 rounded-xl border-2 px-5 py-4 cursor-pointer transition ${
                      selectedContexts.has(option.value)
                        ? "border-black bg-zinc-50"
                        : "border-zinc-200 bg-white hover:border-zinc-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedContexts.has(option.value)}
                      onChange={() => toggleContext(option.value)}
                      className="h-5 w-5 rounded border-zinc-300 text-black focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-[15px]">{option.label}</span>
                  </label>
                ))}
              </div>

              {selectedContexts.size > 0 && (
                <button
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-black px-5 py-4 text-[15px] text-white transition hover:bg-zinc-800"
                >
                  Continue
                </button>
              )}
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-start pt-4">
              <div className="rounded-2xl bg-zinc-100 px-5 py-3">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subtle footer */}
        <p className="text-center text-sm text-zinc-500">
          One step at a time. Keep it real.
        </p>
      </main>
    </div>
  );
}
