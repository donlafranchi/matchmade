// Waitlist conversation script with branching button-based flow
// Users click options instead of typing (except for email)

export type StepId =
  | "opening"
  | "dig_deeper_exhausted"
  | "dig_deeper_break"
  | "dig_deeper_not_great"
  | "approach_swiping"
  | "approach_conversations"
  | "approach_compatibility"
  | "promise"
  | "tell_me_more"
  | "whats_different"
  | "email"
  | "location"
  | "complete";

export type StepType = "buttons" | "email" | "location" | "complete";

export type ButtonOption = {
  label: string;
  nextStep: StepId;
  // Optional: store a tag to personalize later messages
  tag?: string;
};

export type Step = {
  id: StepId;
  type: StepType;
  message: string;
  options?: ButtonOption[];
};

// The conversation script
export const SCRIPT: Record<StepId, Step> = {
  opening: {
    id: "opening",
    type: "buttons",
    message:
      "Hey. Before I tell you what Matchmade is, I'm curious — how's dating going for you right now?",
    options: [
      {
        label: "Honestly? I'm exhausted.",
        nextStep: "dig_deeper_exhausted",
        tag: "exhausted",
      },
      {
        label: "Taking a break. Had to.",
        nextStep: "dig_deeper_break",
        tag: "break",
      },
      {
        label: "Still trying, but it's rough.",
        nextStep: "dig_deeper_not_great",
        tag: "not_great",
      },
    ],
  },

  dig_deeper_exhausted: {
    id: "dig_deeper_exhausted",
    type: "buttons",
    message:
      "Yeah. That tracks. The swiping, the matches that go nowhere, the first dates where you know in thirty seconds it's not right. Dating shouldn't feel like a second job. What's been the hardest part?",
    options: [
      {
        label: "Too many matches, too little substance.",
        nextStep: "approach_swiping",
        tag: "swiping",
      },
      {
        label: "Endless texting that never turns into anything.",
        nextStep: "approach_conversations",
        tag: "conversations",
      },
      {
        label: "Meeting people who aren't actually a fit.",
        nextStep: "approach_compatibility",
        tag: "compatibility",
      },
    ],
  },

  dig_deeper_break: {
    id: "dig_deeper_break",
    type: "buttons",
    message:
      "Smart. Apps can drain you — all that effort, filtering through people who aren't right, just hoping something sticks. What pushed you to step away?",
    options: [
      {
        label: "It started feeling like a chore.",
        nextStep: "approach_swiping",
        tag: "swiping",
      },
      {
        label: "Bad dates with people who seemed fine on paper.",
        nextStep: "approach_compatibility",
        tag: "compatibility",
      },
      {
        label: "I was putting in all the work for nothing.",
        nextStep: "approach_swiping",
        tag: "swiping",
      },
    ],
  },

  dig_deeper_not_great: {
    id: "dig_deeper_not_great",
    type: "buttons",
    message:
      "There's hope in trying, but that nagging feeling that something's off — that the system isn't actually working for you — that's real. What's been most frustrating?",
    options: [
      {
        label: "Sorting through so many wrong-fit people.",
        nextStep: "approach_swiping",
        tag: "swiping",
      },
      {
        label: "The people I meet don't match who I am.",
        nextStep: "approach_compatibility",
        tag: "compatibility",
      },
      {
        label: "Everyone wants to text forever and never meet.",
        nextStep: "approach_conversations",
        tag: "conversations",
      },
    ],
  },

  approach_swiping: {
    id: "approach_swiping",
    type: "buttons",
    message:
      "That's the thing — most apps dump hundreds of profiles in your lap and call it a feature. You're doing all the work, filtering through people who were never going to be right for you. We think that's backwards. What if you only saw people who'd already been filtered for you? Not just who thinks you're attractive, but who actually fits — your values, how you live, what you're looking for. We do the work so you don't have to. What matters most to you in someone you'd date?",
    options: [
      {
        label: "That we want similar things from life.",
        nextStep: "promise",
        tag: "values",
      },
      {
        label: "That we'd actually enjoy our day-to-day together.",
        nextStep: "promise",
        tag: "lifestyle",
      },
      { label: "Both, really.", nextStep: "promise", tag: "both" },
    ],
  },

  approach_conversations: {
    id: "approach_conversations",
    type: "buttons",
    message:
      "The pen-pal problem. Apps accidentally train people to text forever because it feels safe. But you can't tell if there's chemistry through a screen. We skip that. Matchmade learns what actually matters to you — through conversation, not forms — and finds people whose lives would naturally fit with yours. When we think there's real potential, we help you meet. In person. Where you can actually tell if there's something there. What would make meeting someone feel worth your time?",
    options: [
      {
        label: "Knowing we're aligned on the things that matter.",
        nextStep: "promise",
        tag: "values",
      },
      {
        label: "Believing we'd actually enjoy being around each other.",
        nextStep: "promise",
        tag: "lifestyle",
      },
      { label: "Both of those.", nextStep: "promise", tag: "both" },
    ],
  },

  approach_compatibility: {
    id: "approach_compatibility",
    type: "buttons",
    message:
      "Those dates where you know in the first five minutes it's not going anywhere — but you're stuck there anyway. The problem is apps match on attraction alone. Attraction without compatibility is just awkward dinners. We flip it. Matchmade learns about you deeply — your values, interests, how you actually live — and only shows you people who'd naturally fit. The filtering happens before you ever see anyone. So when you do meet, there's a real chance it could go somewhere. What would make a first date feel worth showing up for?",
    options: [
      {
        label: "Knowing we actually want the same things.",
        nextStep: "promise",
        tag: "values",
      },
      {
        label: "Feeling like we'd get along in real life.",
        nextStep: "promise",
        tag: "lifestyle",
      },
      { label: "Both.", nextStep: "promise", tag: "both" },
    ],
  },

  promise: {
    id: "promise",
    type: "buttons",
    message:
      "That's what we're building. Matchmade learns what actually matters to you — not through endless forms, but through real conversation. We can match on almost anything that's important to you. Then we find people who fit. Fewer, better matches. Higher quality connections. We're not live yet, but we're close. Want early access?",
    options: [
      { label: "Yes, I'm in.", nextStep: "email" },
      { label: "Tell me a bit more first.", nextStep: "tell_me_more" },
    ],
  },

  tell_me_more: {
    id: "tell_me_more",
    type: "buttons",
    message:
      "Here's the short version: You talk with your personal matchmaker — that's me, sort of. I learn what matters to you through conversation. Not checkboxes, not rigid forms. I can adapt to whatever's important to you. Then I find people whose values, interests, and lifestyles actually align with yours. You see their photos, they see yours. If it's mutual, you meet. In person. The goal is fewer, higher quality connections — people actually worth your time. Sound like something worth trying?",
    options: [
      { label: "Okay, I'm in.", nextStep: "email" },
      {
        label: "What actually makes you different?",
        nextStep: "whats_different",
      },
    ],
  },

  whats_different: {
    id: "whats_different",
    type: "buttons",
    message:
      "Other apps talk about 'meaningful connections' while designing every feature to maximize your time swiping. We do the opposite. We filter deeply before you see anyone. We match on values, interests, lifestyle — not just who finds you attractive. We measure success by the quality of connections, not how long you stay on the app. That's the difference. Ready to see what that looks like?",
    options: [{ label: "Let's do it.", nextStep: "email" }],
  },

  email: {
    id: "email",
    type: "email",
    message:
      "Great. Drop your email and I'll let you know when we're ready for you.",
  },

  location: {
    id: "location",
    type: "location",
    message:
      "One more thing — where are you based? We're launching city by city, so this helps us know where to go first.",
  },

  complete: {
    id: "complete",
    type: "complete",
    message: "", // Set dynamically based on position and location
  },
};

export function getCompletionMessage(
  regionPosition: number,
  location: string
): string {
  return `You're in. You're number ${regionPosition} on the waitlist for ${location}. We'll reach out when it's your turn.`;
}

export function getInitialStep(): Step {
  return SCRIPT.opening;
}

export function getStep(id: StepId): Step {
  return SCRIPT[id];
}
