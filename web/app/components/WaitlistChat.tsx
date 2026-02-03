"use client";

import { useState, useEffect, useRef } from "react";
import {
  SCRIPT,
  getInitialStep,
  getStep,
  getCompletionMessage,
  type StepId,
  type Step,
  type ButtonOption,
} from "@/lib/waitlist/script";
import { METRO_AREAS, searchMetros } from "@/lib/waitlist/metros";

type Message = {
  id: number;
  text: string;
  isAgent: boolean;
};

export function WaitlistChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentStep, setCurrentStep] = useState<Step>(getInitialStep());
  const [isTyping, setIsTyping] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [selectedMetro, setSelectedMetro] = useState<string | null>(null);
  const [metroSearch, setMetroSearch] = useState("");
  const [showMetroDropdown, setShowMetroDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waitlistResult, setWaitlistResult] = useState<{
    position: number;
    regionPosition: number;
    location: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const metroInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus inputs when relevant step
  useEffect(() => {
    if (currentStep.type === "email" && !isTyping) {
      emailInputRef.current?.focus();
    }
    if (currentStep.type === "location" && !isTyping) {
      metroInputRef.current?.focus();
    }
  }, [currentStep, isTyping]);

  // Initial message
  useEffect(() => {
    const timer = setTimeout(() => {
      addAgentMessage(currentStep.message);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAgentMessage = (text: string) => {
    setIsTyping(true);
    const delay = 600 + Math.random() * 400;
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text, isAgent: true },
      ]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text, isAgent: false },
    ]);
  };

  const handleButtonClick = (option: ButtonOption) => {
    // Add user's choice as a message
    addUserMessage(option.label);

    // Get next step
    const nextStep = getStep(option.nextStep);
    setCurrentStep(nextStep);

    // Show next agent message after a brief delay
    setTimeout(() => {
      addAgentMessage(nextStep.message);
    }, 300);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("That doesn't look like a valid email. Mind trying again?");
      return;
    }

    // Add email as user message (masked for privacy display)
    addUserMessage(email);

    // Move to location step
    const locationStep = getStep("location");
    setCurrentStep(locationStep);

    setTimeout(() => {
      addAgentMessage(locationStep.message);
    }, 300);
  };

  const handleMetroSelect = async (metro: string) => {
    setSelectedMetro(metro);
    setMetroSearch(metro);
    setShowMetroDropdown(false);

    // Add location as user message
    addUserMessage(metro);

    // Submit to waitlist
    await submitToWaitlist(email, metro);
  };

  const submitToWaitlist = async (userEmail: string, location: string) => {
    setIsSubmitting(true);
    setIsTyping(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, location }),
      });

      const result = await res.json();

      if (res.ok && result.ok) {
        setWaitlistResult({
          position: result.position,
          regionPosition: result.regionPosition,
          location: result.location,
        });

        const completeStep = getStep("complete");
        setCurrentStep(completeStep);

        // Show completion message
        const completionMsg = result.alreadyExists
          ? `Looks like you're already on the waitlist! You're #${result.regionPosition} in ${result.location}.`
          : getCompletionMessage(result.regionPosition, result.location);

        setIsTyping(false);
        addAgentMessage(completionMsg);
      } else {
        throw new Error(result.error || "Failed to join waitlist");
      }
    } catch (err) {
      console.error("Waitlist submission failed:", err);
      setIsTyping(false);
      addAgentMessage("Something went wrong. Please try again.");
      // Go back to email step
      setCurrentStep(getStep("email"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMetros = searchMetros(metroSearch);

  // Render the input/buttons based on current step type
  const renderInteraction = () => {
    if (isTyping) return null;

    switch (currentStep.type) {
      case "buttons":
        return (
          <div className="flex flex-wrap gap-2 pt-4">
            {currentStep.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleButtonClick(option)}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2.5 text-[15px] text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-50 active:bg-zinc-100"
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      case "email":
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-2 pt-4">
            {emailError && <p className="text-sm text-red-600">{emailError}</p>}
            <div className="flex gap-2">
              <input
                ref={emailInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isSubmitting}
                autoComplete="email"
                className="flex-1 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!email.trim() || isSubmitting}
                className="rounded-full bg-black px-5 py-3 text-[15px] text-white transition hover:bg-zinc-800 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </form>
        );

      case "location":
        return (
          <div className="relative pt-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={metroInputRef}
                  type="text"
                  value={metroSearch}
                  onChange={(e) => {
                    setMetroSearch(e.target.value);
                    setShowMetroDropdown(true);
                    setSelectedMetro(null);
                  }}
                  onFocus={() => setShowMetroDropdown(true)}
                  placeholder="Search for your city..."
                  disabled={isSubmitting}
                  className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-400 focus:bg-white disabled:opacity-50"
                />
                {showMetroDropdown && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-lg">
                    {filteredMetros.length > 0 ? (
                      filteredMetros.map((metro) => (
                        <button
                          key={metro}
                          type="button"
                          onClick={() => handleMetroSelect(metro)}
                          className="w-full px-4 py-2.5 text-left text-[15px] text-zinc-800 transition hover:bg-zinc-50"
                        >
                          {metro}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-zinc-500">
                        No cities found. Try a different search.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "complete":
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 rounded-2xl bg-white p-8 shadow-sm">
      {/* Messages */}
      <div className="min-h-[200px] space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.isAgent ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                msg.isAgent ? "bg-zinc-100 text-zinc-900" : "bg-black text-white"
              }`}
            >
              <p className="text-[15px] leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-zinc-100 px-5 py-3">
              <div className="flex space-x-2">
                <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Interaction area (buttons, inputs) */}
      {renderInteraction()}

      {/* Close dropdown when clicking outside */}
      {showMetroDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMetroDropdown(false)}
        />
      )}
    </div>
  );
}
