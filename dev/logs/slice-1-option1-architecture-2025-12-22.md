# Slice 1: Option 1 Architecture - Single Profile + Context-Specific Intent Fields

**Date:** 2025-12-22
**Author:** Architect Agent
**Status:** Design Phase
**Target:** Migration from ContextProfile-scoped profiles to Single Profile + ContextIntent model

## Executive Summary

This document outlines the complete architecture for migrating from the current ContextProfile-based system to Option 1: Single Profile + Context-Specific Intent Fields. The migration will consolidate shared profile data (coreValues, beliefs, interactionStyle, lifestyle, constraints, location, ageRange) into a single Profile model per user, while extracting context-specific intent fields into a separate ContextIntent model.

**Key Insight:** This is a substantial refactor (~1,250 LOC) that requires splitting into 3 slices. The agent sees full user picture, trust boundaries enforced via matching query filters (not database separation).

---

## 1. New Prisma Schema Design

### 1.1 Complete Schema

```prisma
model User {
  id              String           @id @default(cuid())
  email           String           @unique
  name            String?
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  // Single profile per user (shared across contexts)
  profile         Profile?

  // Context preferences (tone, etc.)
  contextProfiles ContextProfile[]

  // Context-specific intents
  contextIntents  ContextIntent[]

  // Chat messages
  chatMessages    ChatMessage[]
}

model Profile {
  id               String          @id @default(cuid())
  user             User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId           String          @unique

  // Shared fields (Json for flexible structure)
  coreValues       Json            @default("[]")    // Array of strings
  beliefs          Json            @default("{}")    // Object with belief categories
  interactionStyle Json            @default("{}")    // Object with style preferences
  lifestyle        Json            @default("{}")    // Object with lifestyle info
  constraints      Json            @default("[]")    // Array of constraint strings

  // Shared scalar fields
  location         String?
  ageRange         String?

  // Legacy fields (for backward compatibility during migration)
  name             String?

  // Metadata
  completeness     Int             @default(0)
  missing          String[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}

model ContextProfile {
  id             String                   @id @default(cuid())
  user           User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId         String
  contextType    RelationshipContextType
  tonePreference TonePreference
  createdAt      DateTime                 @default(now())
  updatedAt      DateTime                 @updatedAt

  @@unique([userId, contextType])
  chatMessages   ChatMessage[]
}

model ContextIntent {
  id          String                   @id @default(cuid())
  user        User                     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  contextType RelationshipContextType

  // Romantic context fields
  relationshipTimeline      String?  // "taking_my_time" | "open_to_soon" | "actively_looking"
  exclusivityExpectation    String?  // "monogamous" | "open" | "figuring_it_out"
  familyIntentions          String?  // "want_kids" | "dont_want_kids" | "open" | "already_have"
  attractionImportance      String?  // "critical" | "important" | "balanced" | "less_important"

  // Friendship context fields
  friendshipDepth           String?  // "casual" | "close" | "best_friend"
  groupActivityPreference   String?  // "one_on_one" | "small_group" | "large_group" | "flexible"
  emotionalSupportExpectation String? // "minimal" | "moderate" | "high"

  // Professional context fields
  partnershipType           String?  // "cofounder" | "collaborator" | "advisor" | "employee" | "contractor"
  commitmentHorizon         String?  // "project_based" | "ongoing" | "long_term"
  complementarySkills       Json?    // Array of strings
  equityOrRevShare          String?  // "equity" | "rev_share" | "salary" | "hybrid" | "tbd"

  // Creative context fields
  creativeType              String?  // "music" | "writing" | "visual_art" | "film" | "performance" | "other"
  roleNeeded                String?  // "co_creator" | "contributor" | "feedback" | "production"
  processStyle              String?  // "structured" | "spontaneous" | "hybrid"
  egoBalance                String?  // "shared_vision" | "lead_follow" | "independent"
  compensationExpectation   String?  // "paid" | "profit_share" | "free" | "depends"

  // Service context fields
  serviceType               String?  // "offering" | "seeking"
  budgetRange               String?  // "under_1k" | "1k_5k" | "5k_20k" | "20k_plus" | "flexible"
  timelineNeeded            String?  // "urgent" | "weeks" | "months" | "flexible"
  credentialsRequired       String?  // "licensed" | "experienced" | "portfolio" | "flexible"

  // Metadata
  completeness     Int             @default(0)
  missing          String[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@unique([userId, contextType])
}

model ChatMessage {
  id               String                @id @default(cuid())
  user             User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId           String
  contextProfile   ContextProfile        @relation(fields: [contextProfileId], references: [id], onDelete: Cascade)
  contextProfileId String
  role             ChatRole
  content          String?
  offRecord        Boolean               @default(false)
  createdAt        DateTime              @default(now())
}

enum RelationshipContextType {
  romantic
  friendship
  professional
  creative
  service
}

enum TonePreference {
  light
  balanced
  serious
}

enum ChatRole {
  user
  assistant
  system
}
```

### 1.2 Key Schema Changes

**Removed:**
- `Profile.contextProfileId` (was 1:1 with ContextProfile)
- `Profile.data` (Json blob - replacing with structured fields)

**Added:**
- `Profile.userId` (1:1 with User instead of ContextProfile)
- `Profile.coreValues`, `beliefs`, `interactionStyle`, `lifestyle`, `constraints` (Json fields)
- `Profile.location`, `ageRange` (shared scalar fields)
- `ContextIntent` model (entirely new, holds context-specific fields)

**Preserved:**
- `ContextProfile` (still needed for tonePreference and chat message relationship)
- `ChatMessage.contextProfileId` (maintains chat history per context)

---

## 2. Data Migration Strategy

### 2.1 Migration Phases

**Phase 1: Add New Models (Additive)**
1. Run Prisma migration to add `Profile` with `userId` and `ContextIntent` model
2. Old `Profile` table with `contextProfileId` still exists (no breaking changes yet)

**Phase 2: Data Migration Script**
```
For each User:
  1. Find all ContextProfile records
  2. Aggregate shared data from all Profile.data blobs:
     - location: take first non-null
     - ageRange: take first non-null
     - name: take from any profile
     - coreValues: merge unique values
     - beliefs: merge objects
     - interactionStyle: merge objects
     - lifestyle: merge objects
     - constraints: merge unique values

  3. Create single Profile record linked to userId

  4. For each context, extract context-specific fields:
     - Parse Profile.data for context-specific fields
     - Create ContextIntent record with contextType
     - Populate fields based on contextType

  5. Calculate completeness for Profile and each ContextIntent
```

**Phase 3: Code Migration**
1. Update API routes to use new Profile/ContextIntent models
2. Update UI components to fetch/display unified profile
3. Deploy code changes

**Phase 4: Cleanup**
1. Drop old `Profile.contextProfileId` foreign key
2. Drop old `Profile` table entirely if fully replaced
3. Remove migration code

### 2.2 Migration Script Outline

```typescript
// prisma/migrations/migrate-to-option1.ts

import { PrismaClient } from '@prisma/client';

async function migrateProfileData() {
  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    include: {
      contextProfiles: {
        include: { profile: true }
      }
    }
  });

  for (const user of users) {
    // 1. Aggregate shared data
    const sharedData = aggregateSharedData(user.contextProfiles);

    // 2. Create single Profile
    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        ...sharedData,
        completeness: calculateSharedCompleteness(sharedData),
        missing: findMissingSharedFields(sharedData)
      }
    });

    // 3. Create ContextIntent for each context
    for (const contextProfile of user.contextProfiles) {
      const intentData = extractContextIntent(
        contextProfile.contextType,
        contextProfile.profile?.data
      );

      await prisma.contextIntent.create({
        data: {
          userId: user.id,
          contextType: contextProfile.contextType,
          ...intentData,
          completeness: calculateIntentCompleteness(contextProfile.contextType, intentData),
          missing: findMissingIntentFields(contextProfile.contextType, intentData)
        }
      });
    }
  }
}

function aggregateSharedData(contextProfiles) {
  // Logic to merge data from multiple context profiles
  // Prioritize non-null values, merge arrays/objects intelligently
}

function extractContextIntent(contextType, profileData) {
  // Extract context-specific fields based on contextType
  // Map old field names to new ContextIntent field names
}
```

### 2.3 Handling Edge Cases

**Scenario 1: User has no existing Profile data**
- Create empty Profile with userId
- Create empty ContextIntent records for each contextType
- Completeness = 0, missing = all fields

**Scenario 2: Conflicting data across contexts**
- For location/ageRange: take first non-null value
- For Json fields (coreValues, etc.): merge intelligently, de-duplicate arrays
- Log conflicts for manual review

**Scenario 3: User has contextProfile but no Profile**
- Create Profile and ContextIntent with defaults
- No data loss (was already empty)

---

## 3. API Contract Changes

### 3.1 Routes Requiring Updates

#### `/api/profile` (PUT/GET)
**Current:** Accepts `contextType`, operates on ContextProfile-scoped Profile
**New:** Two modes:
1. `/api/profile` - Operates on shared Profile (no contextType needed)
2. `/api/profile/intent` - Operates on ContextIntent (requires contextType)

**New Request/Response Structures:**

```typescript
// GET /api/profile (shared profile)
Response: {
  profile: {
    coreValues: string[];
    beliefs: Record<string, unknown>;
    interactionStyle: Record<string, unknown>;
    lifestyle: Record<string, unknown>;
    constraints: string[];
    location?: string;
    ageRange?: string;
    name?: string;
  };
  completeness: number;
  missing: string[];
}

// PUT /api/profile (update shared profile)
Request: {
  patch: Partial<ProfileDto>
}

// GET /api/profile/intent?contextType=romantic
Response: {
  intent: {
    relationshipTimeline?: string;
    exclusivityExpectation?: string;
    familyIntentions?: string;
    attractionImportance?: string;
  };
  completeness: number;
  missing: string[];
}

// PUT /api/profile/intent
Request: {
  contextType: RelationshipContextType;
  patch: Partial<ContextIntentDto>
}
```

#### `/api/chat` (POST)
**Current:** Extracts profile data into ContextProfile.profile
**New:** Extracts shared data into Profile, context-specific into ContextIntent

**Changes:**
- Chat agent now updates TWO models: Profile AND ContextIntent
- Agent sees full Profile + all ContextIntent records (full user picture)
- User only sees data relevant to current context in UI

```typescript
// POST /api/chat
Request: {
  contextType: RelationshipContextType;
  message: string;
  offRecord?: boolean;
}

Response: {
  ok: boolean;
  profileUpdated: boolean;
  intentUpdated: boolean;
  profile: ProfileDto;
  intent: ContextIntentDto;
  completeness: number;  // Combined or separate?
}
```

#### `/api/onboarding` (POST)
**Current:** Creates ContextProfile records
**New:** Creates ContextProfile + empty Profile + ContextIntent records

**Changes:**
```typescript
// POST /api/onboarding
Request: {
  contexts: RelationshipContextType[];
}

// After creating ContextProfiles:
1. Create Profile if doesn't exist (userId)
2. Create ContextIntent for each selected context
3. Return redirect to /profile or /contexts/[first]
```

### 3.2 New Routes

**`/api/profile/intent`** - CRUD for context-specific intents
**`/api/profile/completeness`** - GET combined completeness score

### 3.3 Authentication/Authorization

**No changes needed:**
- All routes already use `requireSessionUser()`
- User can only access their own Profile/ContextIntent
- Trust boundaries enforced in matching queries (not in these routes)

---

## 4. UI Component Updates

### 4.1 Component Refactoring

#### `/app/contexts/[context]/page.tsx`
**Current:** Fetches ContextProfile with nested Profile
**New:** Fetches ContextProfile + shared Profile + ContextIntent

**Changes (~30 LOC):**
```typescript
// Old
const profileRow = await getOrCreateProfile(contextProfile.id);

// New
const [sharedProfile, contextIntent] = await Promise.all([
  getOrCreateSharedProfile(user.id),
  getOrCreateContextIntent(user.id, context)
]);

// Pass both to ChatProfilePanel
<ChatProfilePanel
  contextType={context}
  tonePreference={contextProfile.tonePreference}
  initialMessages={messages}
  sharedProfile={sharedProfileDto}
  contextIntent={contextIntentDto}
/>
```

#### `/app/contexts/[context]/ChatProfilePanel.tsx`
**Current:** Single profile tab showing all fields
**New:** Two tabs or sections:
1. "Shared Profile" - Shows coreValues, beliefs, lifestyle, location, ageRange
2. "Context Intent" - Shows context-specific fields (dynamic based on contextType)

**Major Changes (~80 LOC):**
- Split profile state into `sharedProfile` and `contextIntent`
- Two separate forms with separate save handlers
- Update completeness calculation (combined or separate display?)
- Add visual indicator: "This is shared across all contexts" vs "This is only for [context]"

**New Component Structure:**
```tsx
<div className="space-y-6">
  <ContextScopeIndicator currentContext={contextType} />

  {activeTab === "profile" && (
    <>
      <SharedProfileForm
        profile={sharedProfile}
        onSave={updateSharedProfile}
      />

      <Divider text="Context-Specific Intent" />

      <ContextIntentForm
        contextType={contextType}
        intent={contextIntent}
        onSave={updateContextIntent}
      />
    </>
  )}
</div>
```

#### **New Component: `ContextScopeIndicator`**
**Purpose:** Show user which context they're in and clarify data scope

**Design (~50 LOC):**
```tsx
export function ContextScopeIndicator({ currentContext }: { currentContext: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Current context:</span>
        <span className="rounded-full bg-black px-3 py-1 text-sm text-white capitalize">
          {currentContext}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Some profile fields (like values and lifestyle) are shared across all contexts.
        Intent fields are specific to this context.
      </p>
    </div>
  );
}
```

### 4.2 New Routing Structure

**No routing changes needed** - `/contexts/[context]` still works.

**Optional Enhancement:** Add `/profile` route for unified profile view (not required for MVP)

### 4.3 Form Field Mapping

#### Shared Profile Fields (all contexts see these)
- Name (legacy, might move to User.name)
- Location
- Age Range
- Core Values (multi-select or text array)
- Beliefs (structured input - TBD on UI)
- Interaction Style (structured input)
- Lifestyle (structured input)
- Constraints (text array)

#### Context-Specific Intent Fields

**Romantic:**
- Relationship Timeline (dropdown)
- Exclusivity Expectation (dropdown)
- Family Intentions (dropdown)
- Attraction Importance (dropdown)

**Friendship:**
- Friendship Depth (dropdown)
- Group Activity Preference (dropdown)
- Emotional Support Expectation (dropdown)

**Professional:**
- Partnership Type (dropdown)
- Commitment Horizon (dropdown)
- Complementary Skills (multi-select)
- Equity or Rev Share (dropdown)

**Creative:**
- Creative Type (dropdown)
- Role Needed (dropdown)
- Process Style (dropdown)
- Ego Balance (dropdown)
- Compensation Expectation (dropdown)

**Service:**
- Service Type (radio: offering/seeking)
- Budget Range (dropdown)
- Timeline Needed (dropdown)
- Credentials Required (dropdown)

---

## 5. File Structure

### 5.1 Files to Create

| File Path | Purpose | Est. LOC |
|-----------|---------|----------|
| `/lib/profile-shared.ts` | Shared profile CRUD logic | 80 |
| `/lib/context-intent.ts` | Context intent CRUD logic | 120 |
| `/lib/completeness.ts` | Unified completeness calculation | 60 |
| `/app/api/profile/intent/route.ts` | Context intent API endpoint | 70 |
| `/app/components/ContextScopeIndicator.tsx` | UI component | 50 |
| `/app/components/SharedProfileForm.tsx` | Shared profile form | 100 |
| `/app/components/ContextIntentForm.tsx` | Dynamic intent form | 150 |
| `/prisma/migrations/[timestamp]_add_option1_models.sql` | Additive schema migration | 50 |
| `/prisma/scripts/migrate-to-option1.ts` | Data migration script | 200 |

**Total New Files:** ~880 LOC

### 5.2 Files to Modify

| File Path | Changes | Est. LOC Changed |
|-----------|---------|------------------|
| `/prisma/schema.prisma` | Add Profile (userId), ContextIntent models | +80 |
| `/app/contexts/[context]/page.tsx` | Fetch shared + intent, pass to component | ~30 |
| `/app/contexts/[context]/ChatProfilePanel.tsx` | Split profile into shared + intent | ~100 |
| `/app/api/chat/route.ts` | Update both Profile + ContextIntent | ~40 |
| `/app/api/profile/route.ts` | Handle shared profile only | ~30 |
| `/lib/profile.ts` | Rename/refactor for shared profile | ~50 |
| `/lib/types.ts` | Add ProfileDto, ContextIntentDto types | +40 |

**Total Modified:** ~370 LOC

### 5.3 Files to Delete (After Migration Complete)

- None immediately (keep old Profile model during transition)
- Eventually: old `Profile.contextProfileId` foreign key

**Grand Total Estimate:** 880 (new) + 370 (modified) = **~1,250 LOC**

**Budget Concern:** This exceeds a 400 LOC swarm. **Recommendation: Split into 3 slices:**
1. **Slice 1a:** Schema + migration script (~330 LOC)
2. **Slice 1b:** Backend API updates (~300 LOC)
3. **Slice 1c:** Frontend UI refactor (~620 LOC)

---

## 6. Integration Points

### 6.1 Chat Messages and Contexts

**Current:** `ChatMessage.contextProfileId` links to ContextProfile
**New:** No change - maintains context-specific chat history

**Agent Behavior:**
- Agent sees full Profile + all ContextIntent records in system prompt
- Agent updates appropriate model based on conversation content
- If user mentions shared info (values, location) → updates Profile
- If user mentions context-specific intent → updates ContextIntent for current context

**Example Agent Prompt:**
```
User's Shared Profile:
- Location: San Francisco
- Age Range: 25-34
- Core Values: ["authenticity", "growth", "creativity"]
- ...

User's Romantic Intent:
- Relationship Timeline: taking_my_time
- Exclusivity: figuring_it_out
- ...

User's Professional Intent:
- Partnership Type: collaborator
- ...

Current Context: romantic

Instructions: Update shared profile or romantic intent based on conversation.
```

### 6.2 Matching Queries (Trust Boundary)

**Trust Boundary Enforcement:**

```typescript
// Matching query pseudo-code
function findMatches(userId: string, contextType: RelationshipContextType) {
  // 1. Get user's profile and intent for this context
  const userProfile = await prisma.profile.findUnique({ where: { userId } });
  const userIntent = await prisma.contextIntent.findUnique({
    where: { userId_contextType: { userId, contextType } }
  });

  // 2. Query other users WHO ALSO HAVE THIS CONTEXT
  const candidates = await prisma.user.findMany({
    where: {
      contextIntents: {
        some: { contextType }  // ← TRUST BOUNDARY: must have same context
      }
    },
    include: {
      profile: true,
      contextIntents: {
        where: { contextType }  // Only show intent for THIS context
      }
    }
  });

  // 3. Score based on shared profile + context intent compatibility
  return scoreAndRankMatches(userProfile, userIntent, candidates);
}
```

**Key Insight:**
- Database doesn't hide data (agent sees everything)
- Matching queries filter by `contextType` presence
- Users can't see each other's profiles for contexts they're not in

### 6.3 Onboarding Flow Changes

**Current:** User selects contexts → creates ContextProfile
**New:** User selects contexts → creates ContextProfile + Profile + ContextIntent

**Updated Flow:**
1. User selects contexts (romantic, friendship, etc.)
2. Backend creates:
   - ContextProfile for each (with tonePreference)
   - Single Profile (if doesn't exist)
   - ContextIntent for each context
3. Redirect to `/contexts/[first]` or `/profile` (new unified view)
4. Chat agent fills in Profile + ContextIntent fields progressively

**Welcome Message Update:**
```typescript
// In /api/onboarding
const welcomeMessages = {
  romantic: "Cool. So you're here to meet someone you could fall for. Let's start with what matters to you in life generally - your values, lifestyle - then we'll get into what you're looking for romantically.",
  // ... adjust messages to reflect shared + context flow
};
```

---

## 7. Budget Verification

### 7.1 Total LOC Estimate

| Category | LOC |
|----------|-----|
| New Files | 880 |
| Modified Files | 370 |
| **Total** | **1,250** |

**Budget Status:** EXCEEDS 400 LOC swarm limit

### 7.2 Recommended Slice Breakdown

**Slice 1a: Schema & Data Migration** (~330 LOC)
- Prisma schema updates
- Migration scripts
- Data migration script
- Verification queries

**Slice 1b: Backend API Refactor** (~300 LOC)
- `/lib/profile-shared.ts`, `/lib/context-intent.ts`, `/lib/completeness.ts`
- Update `/app/api/chat/route.ts`
- Create `/app/api/profile/intent/route.ts`
- Update `/app/api/profile/route.ts`
- Update `/lib/types.ts`

**Slice 1c: Frontend UI Refactor** (~620 LOC)
- Update `/app/contexts/[context]/page.tsx`
- Refactor `/app/contexts/[context]/ChatProfilePanel.tsx`
- Create `ContextScopeIndicator`, `SharedProfileForm`, `ContextIntentForm`
- Update onboarding welcome messages

### 7.3 New Dependencies

**None required.** All changes use existing stack:
- Next.js 16
- Prisma 7
- React 19
- TailwindCSS 4

### 7.4 Database Changes

**Schema Changes:**
1. Add `Profile` table with `userId` foreign key
2. Add `ContextIntent` table with `userId` + `contextType` composite unique key
3. Add columns for shared fields (coreValues, beliefs, etc.)
4. Add columns for all context-specific intent fields

**Migration Risk:** MEDIUM
- Additive first (low risk)
- Data migration script required (test on staging first)
- Rollback plan: keep old Profile table until verified

---

## 8. Risks and Open Questions

### 8.1 Risks

**Risk 1: Data Loss During Migration**
- **Severity:** HIGH
- **Mitigation:**
  - Dry-run migration script on production copy
  - Backup database before migration
  - Keep old Profile table during transition
  - Verify data integrity post-migration

**Risk 2: Conflicting Data Across Contexts**
- **Severity:** MEDIUM
- **Example:** User has different locations in romantic vs friendship profiles
- **Mitigation:**
  - Migration script logs conflicts
  - Take first non-null value (document in migration log)
  - Manual review process for conflicts
  - Consider adding "override per context" feature later

**Risk 3: Scope Creep in UI**
- **Severity:** MEDIUM
- **Issue:** 620 LOC for frontend is substantial
- **Mitigation:**
  - Use component composition (SharedProfileForm, ContextIntentForm)
  - Defer "nice-to-haves" (like /profile unified view)
  - Focus on minimal UI changes first

**Risk 4: Agent Extraction Logic Complexity**
- **Severity:** MEDIUM
- **Issue:** Agent must now decide: update Profile or ContextIntent?
- **Mitigation:**
  - Clear prompt engineering
  - Structured output from agent (JSON with `profileUpdates` and `intentUpdates` keys)
  - Fallback: default to ContextIntent for ambiguous statements

### 8.2 Open Questions

**Q1: How to handle "name" field?**
- Option A: Move to `User.name` (shared across all contexts)
- Option B: Keep in `Profile.name` (might want different names per context?)
- **Recommendation:** Start in Profile, migrate to User.name in later slice

**Q2: Combined or separate completeness scores?**
- Option A: Single score (average of shared + intent)
- Option B: Two scores (shared: 80%, intent: 40%)
- **Recommendation:** Start with combined, show breakdown on hover

**Q3: Json field structure - how rigid?**
- `coreValues`, `beliefs`, `interactionStyle`, `lifestyle` are Json
- Do we define schemas now or keep flexible?
- **Recommendation:** Define TypeScript interfaces, validate client-side, keep DB flexible

**Q4: When to show shared vs intent fields?**
- Option A: Always show both in profile tab
- Option B: Separate tabs ("About Me" vs "[Context] Intent")
- **Recommendation:** Single profile tab, two sections (see UI mockup)

**Q5: Migration rollback plan?**
- If migration fails mid-way, how to revert?
- **Recommendation:**
  - Additive first (can always roll back code)
  - Don't drop old tables until verified
  - Feature flag to switch between old/new APIs

**Q6: How do we handle old Profile.data blob fields not in new schema?**
- Some users might have custom fields in Json blob
- **Recommendation:**
  - Log unmapped fields during migration
  - Store in `Profile.legacy` Json field temporarily
  - Manual review for important data

---

## 9. Implementation Sequence

### Phase 1: Schema & Migration (Slice 1a)
1. Update `schema.prisma` with new models
2. Run `prisma migrate dev --create-only`
3. Write data migration script
4. Test on local copy of production data
5. Run migration in staging
6. Verify data integrity
7. Deploy schema changes to production (additive, non-breaking)

### Phase 2: Backend Refactor (Slice 1b)
1. Create `/lib/profile-shared.ts`, `/lib/context-intent.ts`
2. Update `/app/api/profile/route.ts` for shared profile
3. Create `/app/api/profile/intent/route.ts`
4. Update `/app/api/chat/route.ts` to write to both models
5. Update `/lib/types.ts` with new DTOs
6. Test API endpoints manually (Postman/curl)
7. Deploy backend changes

### Phase 3: Frontend Refactor (Slice 1c)
1. Create `ContextScopeIndicator` component
2. Create `SharedProfileForm` component
3. Create `ContextIntentForm` component (dynamic fields)
4. Update `ChatProfilePanel.tsx` to use new components
5. Update `/app/contexts/[context]/page.tsx` to fetch both models
6. Update onboarding welcome messages
7. Test UI flows manually
8. Deploy frontend changes

### Phase 4: Cleanup & Verification
1. Monitor production for errors
2. Verify completeness scores are calculating correctly
3. Check agent is updating correct models
4. User acceptance testing
5. Drop old Profile foreign key (if fully migrated)

---

## 10. Success Criteria

Migration is considered successful when:

1. **Data Integrity:** All existing profile data migrated without loss
2. **API Functional:** All endpoints return correct data for shared + intent
3. **UI Clarity:** Users understand shared vs context-specific fields
4. **Agent Accuracy:** Chat agent updates correct model (80%+ accuracy)
5. **No Breaking Changes:** Existing users can continue using app seamlessly
6. **Completeness Scores:** Calculate correctly based on new schema
7. **Matching Queries:** Filter by contextType correctly (trust boundary enforced)

---

## Appendix A: Field Mapping Reference

### Current Profile.data → New Schema Mapping

| Old Field (in Json blob) | New Location | New Field Name |
|--------------------------|--------------|----------------|
| `name` | Profile | `name` |
| `ageRange` | Profile | `ageRange` |
| `location` | Profile | `location` |
| `intent` (romantic) | ContextIntent | `relationshipTimeline` (partially) |
| `dealbreakers` | Profile | `constraints` |
| `preferences` | ContextIntent | (split by context) |

**Note:** Most fields need extraction logic since current implementation uses unstructured Json.

---

## Appendix B: Type Definitions

```typescript
// Shared Profile DTO
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

// Context Intent DTOs (union type based on context)
export type RomanticIntentDto = {
  relationshipTimeline?: "taking_my_time" | "open_to_soon" | "actively_looking";
  exclusivityExpectation?: "monogamous" | "open" | "figuring_it_out";
  familyIntentions?: "want_kids" | "dont_want_kids" | "open" | "already_have";
  attractionImportance?: "critical" | "important" | "balanced" | "less_important";
};

export type FriendshipIntentDto = {
  friendshipDepth?: "casual" | "close" | "best_friend";
  groupActivityPreference?: "one_on_one" | "small_group" | "large_group" | "flexible";
  emotionalSupportExpectation?: "minimal" | "moderate" | "high";
};

export type ProfessionalIntentDto = {
  partnershipType?: "cofounder" | "collaborator" | "advisor" | "employee" | "contractor";
  commitmentHorizon?: "project_based" | "ongoing" | "long_term";
  complementarySkills?: string[];
  equityOrRevShare?: "equity" | "rev_share" | "salary" | "hybrid" | "tbd";
};

export type CreativeIntentDto = {
  creativeType?: "music" | "writing" | "visual_art" | "film" | "performance" | "other";
  roleNeeded?: "co_creator" | "contributor" | "feedback" | "production";
  processStyle?: "structured" | "spontaneous" | "hybrid";
  egoBalance?: "shared_vision" | "lead_follow" | "independent";
  compensationExpectation?: "paid" | "profit_share" | "free" | "depends";
};

export type ServiceIntentDto = {
  serviceType?: "offering" | "seeking";
  budgetRange?: "under_1k" | "1k_5k" | "5k_20k" | "20k_plus" | "flexible";
  timelineNeeded?: "urgent" | "weeks" | "months" | "flexible";
  credentialsRequired?: "licensed" | "experienced" | "portfolio" | "flexible";
};

export type ContextIntentDto =
  | RomanticIntentDto
  | FriendshipIntentDto
  | ProfessionalIntentDto
  | CreativeIntentDto
  | ServiceIntentDto;
```

---

**END OF ARCHITECTURE DOCUMENT**
