# Slice 1b: Backend API Refactor

**Mode:** Swarm
**Brief:** N/A (Refactor - Option 1 Implementation)
**Build Order:** 3/10 (Refactoring Brief 3)
**Architecture:** `dev/logs/slice-1-option1-architecture-2025-12-22.md`
**Created:** 2025-12-22

---

## Goal

Refactor backend API layer to use the new unified Profile + ContextIntent models. This includes creating shared profile CRUD logic, context intent management, unified completeness calculation, and updating all API routes to interact with the new schema while maintaining backward compatibility.

## User Story

As a backend developer, I want to refactor the API layer to use the new Profile and ContextIntent models so that the system can manage shared profile data separately from context-specific intent fields with clear, maintainable endpoints.

## Acceptance Criteria

- [ ] File `/lib/profile-shared.ts` created with shared profile CRUD functions (~80 LOC)
  - [ ] `getOrCreateSharedProfile(userId)` - Fetches or creates Profile
  - [ ] `updateSharedProfile(userId, patch)` - Updates Profile fields
  - [ ] `getSharedProfileDto(userId)` - Returns ProfileDto with completeness
  - [ ] Handles Json field serialization/deserialization correctly
- [ ] File `/lib/context-intent.ts` created with context intent CRUD functions (~120 LOC)
  - [ ] `getOrCreateContextIntent(userId, contextType)` - Fetches or creates ContextIntent
  - [ ] `updateContextIntent(userId, contextType, patch)` - Updates ContextIntent fields
  - [ ] `getContextIntentDto(userId, contextType)` - Returns ContextIntentDto with completeness
  - [ ] `extractIntentFromMessage(contextType, message)` - Parses user message for intent updates
  - [ ] Validates context-specific fields per contextType
- [ ] File `/lib/completeness.ts` created with unified completeness logic (~60 LOC)
  - [ ] `calculateSharedCompleteness(profile)` - Returns 0-100 score for Profile
  - [ ] `calculateIntentCompleteness(contextType, intent)` - Returns 0-100 score for ContextIntent
  - [ ] `findMissingSharedFields(profile)` - Returns array of missing required fields
  - [ ] `findMissingIntentFields(contextType, intent)` - Returns array of missing fields
  - [ ] Defines required fields per context type
- [ ] File `/app/api/profile/intent/route.ts` created (~70 LOC)
  - [ ] GET endpoint: Returns ContextIntent for specified contextType
  - [ ] PUT endpoint: Updates ContextIntent for specified contextType
  - [ ] Requires authentication via `requireSessionUser()`
  - [ ] Returns ContextIntentDto with completeness and missing fields
  - [ ] Validates contextType parameter
- [ ] File `/app/api/profile/route.ts` updated to handle shared Profile only (~30 LOC)
  - [ ] GET endpoint: Returns shared Profile (no contextType needed)
  - [ ] PUT endpoint: Updates shared Profile fields only
  - [ ] Removes contextType parameter (now handled by /intent endpoint)
  - [ ] Returns ProfileDto with completeness and missing fields
- [ ] File `/app/api/chat/route.ts` updated to write to both Profile AND ContextIntent (~40 LOC)
  - [ ] Agent extraction logic separates shared vs intent updates
  - [ ] Updates Profile for shared fields (coreValues, location, etc.)
  - [ ] Updates ContextIntent for context-specific fields
  - [ ] Returns both profileUpdated and intentUpdated flags
  - [ ] Agent sees full Profile + all ContextIntents in system prompt
- [ ] File `/lib/types.ts` updated with new DTOs (~40 LOC)
  - [ ] `ProfileDto` type defined with shared fields
  - [ ] `RomanticIntentDto` type defined with romantic fields
  - [ ] `FriendshipIntentDto` type defined with friendship fields
  - [ ] `ProfessionalIntentDto` type defined with professional fields
  - [ ] `CreativeIntentDto` type defined with creative fields
  - [ ] `ServiceIntentDto` type defined with service fields
  - [ ] `ContextIntentDto` union type of all intent DTOs
- [ ] All API responses include correct completeness scores
- [ ] All API endpoints require authentication and validate user ownership
- [ ] Error handling for missing models (returns 404 with clear message)
- [ ] Json fields (coreValues, beliefs, etc.) properly serialized/deserialized
- [ ] Backward compatibility maintained (old endpoints still work during transition)
- [ ] Interface feels easy and natural (gets out of the way)
- [ ] No security vulnerabilities introduced (auth, validation, SQL injection prevention)
- [ ] All endpoints tested with Postman/curl (manual API testing)

## Dependencies

### Prerequisites (must exist):
- [x] **Slice 1a complete:** Schema updated and data migrated
- [x] Profile model exists with userId FK
- [x] ContextIntent model exists with all context fields
- [x] Prisma Client regenerated with new models

### Blockers (if any):
- **BLOCKER:** Cannot proceed until Slice 1a schema migration is deployed and verified

## Technical Requirements

### API Endpoints

#### **GET /api/profile** (Updated)
Fetches shared profile for authenticated user.

**Request:**
```typescript
GET /api/profile
Headers: { Cookie: session }
```

**Response:**
```typescript
{
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
  completeness: number;  // 0-100
  missing: string[];     // e.g., ["location", "ageRange"]
}
```

**Changes from current:**
- Removes `contextType` query parameter
- Returns only shared profile fields (not context-specific)
- Completeness calculated only on shared fields

#### **PUT /api/profile** (Updated)
Updates shared profile for authenticated user.

**Request:**
```typescript
PUT /api/profile
Headers: { Cookie: session }
Body: {
  patch: {
    location?: string;
    ageRange?: string;
    coreValues?: string[];
    // ... any ProfileDto fields
  }
}
```

**Response:**
```typescript
{
  ok: boolean;
  profile: ProfileDto;
  completeness: number;
  missing: string[];
}
```

#### **GET /api/profile/intent** (New)
Fetches context intent for authenticated user and specified context.

**Request:**
```typescript
GET /api/profile/intent?contextType=romantic
Headers: { Cookie: session }
```

**Response:**
```typescript
{
  intent: {
    relationshipTimeline?: string;
    exclusivityExpectation?: string;
    familyIntentions?: string;
    attractionImportance?: string;
    // ... fields vary by contextType
  };
  completeness: number;
  missing: string[];
}
```

**Validation:**
- contextType must be valid enum value
- Returns 400 if contextType missing or invalid
- Returns 404 if ContextIntent not found (should auto-create)

#### **PUT /api/profile/intent** (New)
Updates context intent for authenticated user and specified context.

**Request:**
```typescript
PUT /api/profile/intent
Headers: { Cookie: session }
Body: {
  contextType: "romantic" | "friendship" | "professional" | "creative" | "service";
  patch: {
    relationshipTimeline?: string;
    // ... any ContextIntentDto fields for this context
  }
}
```

**Response:**
```typescript
{
  ok: boolean;
  intent: ContextIntentDto;
  completeness: number;
  missing: string[];
}
```

#### **POST /api/chat** (Updated)
Handles chat messages and updates Profile + ContextIntent.

**Request:**
```typescript
POST /api/chat
Body: {
  contextType: RelationshipContextType;
  message: string;
  offRecord?: boolean;
}
```

**Response:**
```typescript
{
  ok: boolean;
  profileUpdated: boolean;    // New: indicates Profile was updated
  intentUpdated: boolean;     // New: indicates ContextIntent was updated
  profile: ProfileDto;        // Updated shared profile
  intent: ContextIntentDto;   // Updated context intent
  completeness: number;       // Combined or separate?
}
```

**Changes from current:**
- Agent system prompt now includes full Profile + all ContextIntents
- Agent extraction logic determines which model to update
- Returns both profile and intent in response
- Two database writes (Profile + ContextIntent) instead of one

### New Library Files

#### `/lib/profile-shared.ts` (~80 LOC)

```typescript
import { PrismaClient } from '@prisma/client';
import { ProfileDto } from './types';
import { calculateSharedCompleteness, findMissingSharedFields } from './completeness';

const prisma = new PrismaClient();

export async function getOrCreateSharedProfile(userId: string): Promise<Profile> {
  // Fetch or create Profile with userId
  // Initialize with defaults if creating
}

export async function updateSharedProfile(
  userId: string,
  patch: Partial<ProfileDto>
): Promise<Profile> {
  // Update Profile fields
  // Recalculate completeness
  // Update missing array
}

export async function getSharedProfileDto(userId: string): Promise<{
  profile: ProfileDto;
  completeness: number;
  missing: string[];
}> {
  // Fetch Profile
  // Calculate completeness
  // Return DTO format
}

function serializeJsonFields(profile: Profile): ProfileDto {
  // Parse Json fields to correct types
  // Handle null/undefined cases
}
```

#### `/lib/context-intent.ts` (~120 LOC)

```typescript
import { PrismaClient, RelationshipContextType } from '@prisma/client';
import { ContextIntentDto } from './types';
import { calculateIntentCompleteness, findMissingIntentFields } from './completeness';

const prisma = new PrismaClient();

export async function getOrCreateContextIntent(
  userId: string,
  contextType: RelationshipContextType
): Promise<ContextIntent> {
  // Fetch or create ContextIntent for [userId, contextType]
  // Initialize with defaults if creating
}

export async function updateContextIntent(
  userId: string,
  contextType: RelationshipContextType,
  patch: Partial<ContextIntentDto>
): Promise<ContextIntent> {
  // Validate fields match contextType
  // Update ContextIntent fields
  // Recalculate completeness
  // Update missing array
}

export async function getContextIntentDto(
  userId: string,
  contextType: RelationshipContextType
): Promise<{
  intent: ContextIntentDto;
  completeness: number;
  missing: string[];
}> {
  // Fetch ContextIntent
  // Calculate completeness
  // Return DTO format
}

export function validateIntentFields(
  contextType: RelationshipContextType,
  patch: Partial<ContextIntentDto>
): boolean {
  // Check that fields are valid for this contextType
  // E.g., can't set relationshipTimeline on friendship context
}

export function extractIntentFromMessage(
  contextType: RelationshipContextType,
  message: string
): Partial<ContextIntentDto> {
  // Helper for chat agent: parse message for intent updates
  // Returns partial DTO with extracted fields
  // Used by /api/chat route
}
```

#### `/lib/completeness.ts` (~60 LOC)

```typescript
import { Profile, ContextIntent, RelationshipContextType } from '@prisma/client';

// Define required fields per model
const REQUIRED_SHARED_FIELDS = [
  'location',
  'ageRange',
  'coreValues',  // Must have at least 1
  'interactionStyle',
  'lifestyle'
];

const REQUIRED_INTENT_FIELDS: Record<RelationshipContextType, string[]> = {
  romantic: ['relationshipTimeline', 'exclusivityExpectation', 'familyIntentions'],
  friendship: ['friendshipDepth', 'groupActivityPreference'],
  professional: ['partnershipType', 'commitmentHorizon'],
  creative: ['creativeType', 'roleNeeded', 'processStyle'],
  service: ['serviceType', 'budgetRange', 'timelineNeeded']
};

export function calculateSharedCompleteness(profile: Profile): number {
  // Count filled required fields
  // Return percentage (0-100)
}

export function calculateIntentCompleteness(
  contextType: RelationshipContextType,
  intent: ContextIntent
): number {
  // Count filled required fields for this context
  // Return percentage (0-100)
}

export function findMissingSharedFields(profile: Profile): string[] {
  // Return array of missing required field names
}

export function findMissingIntentFields(
  contextType: RelationshipContextType,
  intent: ContextIntent
): string[] {
  // Return array of missing required field names for this context
}
```

### Integration Points

- Uses Prisma Client with new Profile and ContextIntent models
- Integrates with existing auth layer (`requireSessionUser()`)
- Chat agent system prompt needs updating to include full user context
- Onboarding flow needs to create Profile + ContextIntent (update in future)
- Completeness calculation feeds into UI components (Slice 1c)

## Constraints

- ≤ 300 LOC per slice
- ≤ 2 new dependencies (should be 0 - using existing stack)
- ≤ 1 new database table (0 in this slice - added in 1a)
- Must maintain product principles (easy, natural, honest)
- Must validate all user input (prevent injection attacks)
- Must maintain backward compatibility during transition

## Test Plan

### Unit Tests

- Test `getOrCreateSharedProfile()`:
  - User has existing Profile → returns existing
  - User has no Profile → creates new with defaults
  - User doesn't exist → throws error

- Test `updateSharedProfile()`:
  - Valid patch → updates fields, recalculates completeness
  - Invalid userId → throws error
  - Empty patch → no changes, returns current profile

- Test `getOrCreateContextIntent()`:
  - User has existing ContextIntent for context → returns existing
  - User has no ContextIntent for context → creates new with defaults
  - Invalid contextType → throws error

- Test `updateContextIntent()`:
  - Valid patch for romantic context → updates relationshipTimeline, etc.
  - Valid patch for friendship context → updates friendshipDepth, etc.
  - Patch with fields from wrong context → validates and rejects
  - Empty patch → no changes

- Test `calculateSharedCompleteness()`:
  - Empty profile → returns 0
  - Profile with all required fields → returns 100
  - Profile with 2/5 required fields → returns 40

- Test `calculateIntentCompleteness()` for each context:
  - Empty romantic intent → returns 0
  - Complete romantic intent → returns 100
  - Partial friendship intent → returns correct percentage

- Test `validateIntentFields()`:
  - Romantic patch on romantic context → valid
  - Romantic patch on friendship context → invalid
  - Empty patch → valid

### Integration Tests

- Test GET /api/profile:
  - Authenticated user with profile → returns ProfileDto
  - Authenticated user without profile → auto-creates, returns empty ProfileDto
  - Unauthenticated request → returns 401

- Test PUT /api/profile:
  - Valid patch → updates profile, returns updated ProfileDto
  - Invalid patch (wrong types) → returns 400
  - Unauthenticated → returns 401

- Test GET /api/profile/intent?contextType=romantic:
  - Authenticated user with intent → returns RomanticIntentDto
  - Authenticated user without intent → auto-creates, returns empty dto
  - Missing contextType param → returns 400
  - Invalid contextType → returns 400
  - Unauthenticated → returns 401

- Test PUT /api/profile/intent:
  - Valid romantic patch → updates intent, returns updated dto
  - Valid friendship patch → updates intent
  - Patch with wrong context fields → returns 400 validation error
  - Missing contextType in body → returns 400
  - Unauthenticated → returns 401

- Test POST /api/chat:
  - Message with shared info (location) → updates Profile, profileUpdated=true
  - Message with intent info (relationship timeline) → updates ContextIntent, intentUpdated=true
  - Message with both → updates both models
  - Off-record message → doesn't update profile/intent
  - Unauthenticated → returns 401

### Manual Testing Checklist

- [ ] Use Postman/curl to test all endpoints:
  ```bash
  # Get shared profile
  curl -X GET http://localhost:3000/api/profile \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json"

  # Update shared profile
  curl -X PUT http://localhost:3000/api/profile \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json" \
    -d '{"patch": {"location": "San Francisco", "ageRange": "25-34"}}'

  # Get romantic intent
  curl -X GET "http://localhost:3000/api/profile/intent?contextType=romantic" \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json"

  # Update romantic intent
  curl -X PUT http://localhost:3000/api/profile/intent \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json" \
    -d '{"contextType": "romantic", "patch": {"relationshipTimeline": "taking_my_time"}}'

  # Send chat message
  curl -X POST http://localhost:3000/api/chat \
    -H "Cookie: session=..." \
    -H "Content-Type: application/json" \
    -d '{"contextType": "romantic", "message": "I live in SF and want to take things slow"}'
  ```

- [ ] Verify database writes:
  ```sql
  SELECT * FROM Profile WHERE userId = 'test-user-id';
  SELECT * FROM ContextIntent WHERE userId = 'test-user-id';
  ```

- [ ] Test error cases:
  - Invalid contextType → 400 error
  - Missing auth → 401 error
  - Invalid userId → 404 error
  - Malformed JSON → 400 error

- [ ] Test completeness calculations:
  - Empty profile → completeness = 0
  - Partially filled → completeness between 0-100
  - Fully filled → completeness = 100
  - Missing fields array accurate

- [ ] Test Json field handling:
  - coreValues array serializes correctly
  - beliefs object serializes correctly
  - Empty arrays/objects handled gracefully

### Product Validation

- [ ] API responses are clear and useful (no cryptic errors)
- [ ] Error messages are honest and helpful (no overpromising)
- [ ] No security vulnerabilities (SQL injection, XSS, CSRF)
- [ ] Authentication enforced on all endpoints
- [ ] User can only access their own data

## Readiness

- [x] **COMPLETE:** Slice 1a schema + migration deployed ✅
- [x] Architecture exists and reviewed (see Architecture §3-5)
- [x] No blockers
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive

## Status: ✅ COMPLETE (2025-12-22)

**Implementation Log:** `dev/logs/slice-1b-backend-implementation-2025-12-22.md`

All acceptance criteria met:
- [x] All library files created (completeness, profile-shared, context-intent)
- [x] All API endpoints implemented (profile, profile/intent, chat)
- [x] All DTOs defined in types.ts
- [x] Authentication enforced on all endpoints
- [x] Validation for context-specific fields
- [x] Error handling with clear messages
- [x] Prisma Client regenerated
- [x] Project state updated with handoff to Slice 1c

## Implementation Notes

### Critical Details from Architecture (§3.1-3.3)

**Agent Extraction Logic (Architecture §6.1):**

The chat agent needs to determine whether to update Profile or ContextIntent based on conversation content.

**Agent System Prompt Structure:**
```
User's Shared Profile:
- Location: San Francisco
- Age Range: 25-34
- Core Values: ["authenticity", "growth", "creativity"]
- Beliefs: {...}
- Interaction Style: {...}
- Lifestyle: {...}
- Constraints: [...]

User's Romantic Intent:
- Relationship Timeline: taking_my_time
- Exclusivity: figuring_it_out
- Family Intentions: open
- Attraction Importance: balanced

User's Professional Intent:
- Partnership Type: collaborator
- Commitment Horizon: ongoing
- Complementary Skills: [...]

Current Context: romantic

Instructions:
- Update shared profile fields (location, values, lifestyle) when user discusses general life info
- Update romantic intent when user discusses relationship goals, timeline, exclusivity, family
- Return JSON: { profileUpdates: {...}, intentUpdates: {...} }
```

**Field Classification:**

Shared (Profile):
- location, ageRange
- coreValues, beliefs, interactionStyle, lifestyle, constraints
- name (legacy)

Context-Specific (ContextIntent):
- Romantic: relationshipTimeline, exclusivityExpectation, familyIntentions, attractionImportance
- Friendship: friendshipDepth, groupActivityPreference, emotionalSupportExpectation
- Professional: partnershipType, commitmentHorizon, complementarySkills, equityOrRevShare
- Creative: creativeType, roleNeeded, processStyle, egoBalance, compensationExpectation
- Service: serviceType, budgetRange, timelineNeeded, credentialsRequired

**Handling Ambiguity:**
- If user says "I want to meet someone to start a business" in romantic context:
  - This is actually professional intent, but user is in wrong context
  - Strategy: Still update romantic intent fields if mentioned, but suggest switching contexts
  - OR: Ignore cross-context statements (safer for MVP)
- **Recommendation:** Default to updating current context intent, don't cross-update

### Security Considerations

1. **Authentication:**
   - All endpoints MUST call `requireSessionUser()` first
   - Extract userId from session, never trust request body

2. **Validation:**
   - Validate contextType is valid enum value
   - Validate patch fields match expected types
   - Sanitize all user input before database writes

3. **Authorization:**
   - User can only access/update their own Profile/ContextIntent
   - No admin override in this slice

4. **SQL Injection Prevention:**
   - Use Prisma parameterized queries (already safe)
   - Never concatenate user input into raw SQL

5. **XSS Prevention:**
   - API returns JSON only (no HTML rendering)
   - Frontend responsible for sanitizing before display

### Performance Considerations

- Use Prisma transactions for multi-model updates (Profile + ContextIntent)
- Cache completeness calculations (recalculate only on update)
- Consider using Prisma `upsert` for getOrCreate operations
- Index on userId and [userId, contextType] already defined in schema

### Backward Compatibility

During transition period (Slice 1a-1c deployed but old code still running):
- Old `/api/profile?contextType=X` requests should still work
- Consider adding compatibility shim in route handler
- OR: Deploy all slices together in maintenance window

**Recommendation:** Deploy Slice 1a-1c together to avoid compatibility issues.

### Error Handling

All API routes should return consistent error format:

```typescript
// Success
{ ok: true, data: {...} }

// Error
{ ok: false, error: "Human-readable error message" }

// Validation Error
{ ok: false, error: "Invalid contextType", details: { field: "contextType", issue: "..." } }
```

## Next Steps

After this slice is complete:
1. Test all API endpoints manually with Postman/curl
2. Verify database writes are correct (check Profile and ContextIntent tables)
3. Run integration tests (if time permits)
4. **Activate Slice 1c:** Frontend UI refactor (depends on this slice)
5. Monitor API logs for errors after deployment
6. Update API documentation (if exists)
7. Consider adding OpenAPI/Swagger spec for new endpoints
