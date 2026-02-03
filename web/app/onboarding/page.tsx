"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type MessageType = {
  id: number;
  text: string;
  isAgent: boolean;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    // Show messages sequentially with natural delays
    const timers: NodeJS.Timeout[] = [];

    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 1,
            text: "This isn't like other apps. No endless swiping, no games. We do the filtering so you can focus on actually meeting people.",
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
            text: "We match people based on values and interests - the stuff that actually matters for a real connection. Chemistry? That's what meeting in person is for.",
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
            text: "This works for more than dating. Maybe you moved to a new city and want to make friends. Or you're picking up a new hobby and want to meet people who share that interest. We can help with that too.",
            isAgent: true,
          },
        ]);
      }, 5000)
    );

    timers.push(
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: 4,
            text: "I'll ask you some questions to understand what you're looking for. The more honest you can be, the better matches we can find. And just so you know - we never share your information with anyone, for any reason.",
            isAgent: true,
          },
        ]);
        setShowContinue(true);
      }, 7500)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleContinue = async () => {
    setShowContinue(false);
    setIsProcessing(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Let's start with a few quick questions.",
          isAgent: true,
        },
      ]);

      setTimeout(() => {
        router.push("/onboarding/questions");
      }, 1000);
    }, 500);
  };

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-800">
            How this works
          </h1>
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

          {/* Continue button */}
          {showContinue && !isProcessing && (
            <div className="pt-4">
              <button
                onClick={handleContinue}
                className="w-full rounded-xl bg-black px-5 py-4 text-[15px] text-white transition hover:bg-zinc-800"
              >
                Let's get started
              </button>
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
          Your information stays private. Always.
        </p>
      </main>
    </div>
  );
}
