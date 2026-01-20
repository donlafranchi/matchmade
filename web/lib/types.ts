export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string | null;
  offRecord: boolean;
  createdAt: string;
};

// NEW: Shared Profile DTO (Option 1)
export type ProfileDto = {
  coreValues?: string[];
  beliefs?: Record<string, unknown>;
  interactionStyle?: Record<string, unknown>;
  lifestyle?: Record<string, unknown>;
  constraints?: string[];
  location?: string;
  ageRange?: string;
  name?: string;
};

// NEW: Context-specific Intent DTOs
export type RomanticIntentDto = {
  contextType: 'romantic';
  relationshipTimeline?: string;
  exclusivityExpectation?: string;
  familyIntentions?: string;
  attractionImportance?: string;
};

export type FriendshipIntentDto = {
  contextType: 'friendship';
  friendshipDepth?: string;
  groupActivityPreference?: string;
  emotionalSupportExpectation?: string;
};

export type ProfessionalIntentDto = {
  contextType: 'professional';
  partnershipType?: string;
  commitmentHorizon?: string;
  complementarySkills?: string[];
  equityOrRevShare?: string;
};

export type CreativeIntentDto = {
  contextType: 'creative';
  creativeType?: string;
  roleNeeded?: string;
  processStyle?: string;
  egoBalance?: string;
  compensationExpectation?: string;
};

export type ServiceIntentDto = {
  contextType: 'service';
  serviceType?: string;
  budgetRange?: string;
  timelineNeeded?: string;
  credentialsRequired?: string;
};

export type ContextIntentDto =
  | RomanticIntentDto
  | FriendshipIntentDto
  | ProfessionalIntentDto
  | CreativeIntentDto
  | ServiceIntentDto;

// Generic patch type that allows all possible intent fields
export type ContextIntentPatch = {
  // Romantic fields
  relationshipTimeline?: string;
  exclusivityExpectation?: string;
  familyIntentions?: string;
  attractionImportance?: string;
  // Friendship fields
  friendshipDepth?: string;
  groupActivityPreference?: string;
  emotionalSupportExpectation?: string;
  // Professional fields
  partnershipType?: string;
  commitmentHorizon?: string;
  complementarySkills?: string[];
  equityOrRevShare?: string;
  // Creative fields
  creativeType?: string;
  roleNeeded?: string;
  processStyle?: string;
  egoBalance?: string;
  compensationExpectation?: string;
  // Service fields
  serviceType?: string;
  budgetRange?: string;
  timelineNeeded?: string;
  credentialsRequired?: string;
};

export type ProfileResponse = {
  profile: ProfileDto | null;
  completeness: number;
  missing: string[];
};
