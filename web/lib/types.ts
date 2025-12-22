export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | null;
  offRecord: boolean;
  createdAt: string;
};

export type ProfileDto = {
  name?: string;
  ageRange?: "18-24" | "25-34" | "35-44" | "45-54" | "55+";
  location?: string;
  intent?: string;
  dealbreakers?: string[];
  preferences?: string[];
};

export type ProfileResponse = {
  profile: ProfileDto | null;
  completeness: number;
  missing: string[];
};
