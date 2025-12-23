# Architecture: Slice 1 Refactor - Unified Chat with Context Scope

**Date:** 2025-12-22
**Architect Role:** Design for Option B from PM review
**Mode:** Single-dev
**Goal:** Simplify UX by creating unified chat interface while preserving architectural trust boundaries

---

## Overview

This refactor implements "Option B: Unified Chat with Context Scope" from the PM review (agent ae918ea). We preserve the critical architectural boundary (separate ContextProfile records per relationship context) while simplifying the user interface to feel like a single, unified experience.

**High-level approach:**
- Keep all database schema unchanged (ContextProfile, ChatMessage, Profile tables)
- Replace context-based routing (`/contexts/[context]`) with unified home page (`/home`)
- Add context scope indicator and selector (only visible when user has multiple contexts)
- Preserve all backend APIs and data boundaries
- Maintain separate matching pools per context (no cross-context leakage)

**What changes:** Frontend routing and UI presentation
**What stays the same:** Database architecture, API contracts, matching boundaries, trust model

---

## PM Review Decision Summary

✅ **APPROVED:** Option B - Unified Chat with Context Scope

**Why this approach:**
- Simplifies user experience (single interface instead of mode switching)
- Preserves trust boundaries (separate ContextProfile records prevent cross-context leakage)
- Maintains consent model (users explicitly choose contexts, no ambiguity)
- Enables honest matching (clear context separation for matching algorithm)

**Critical requirements:**
1. Keep separate ContextProfile records in database
2. Visual indicator shows current context scope clearly
3. Context selector only appears when user has multiple contexts
4. Under the hood: separate matching pools and profiles
5. No romantic/friendship crossover without explicit consent

---

## File Structure

### Files to Create
```
web/app/home/
├── page.tsx                    # New unified home page (replaces /contexts/[context])
├── UnifiedChatPanel.tsx        # Refactored chat/profile component with context selector
└── ContextScopeIndicator.tsx   # Visual indicator showing current context
```

### Files to Modify
```
web/app/onboarding/page.tsx     # Redirect to /home instead of /contexts/[context]
```

### Files to Keep (No Changes)
```
web/app/api/chat/route.ts       # API unchanged, still accepts contextType
web/app/api/profile/route.ts    # API unchanged, still uses contextType
web/prisma/schema.prisma        # Database schema unchanged
web/lib/profile.ts              # Profile logic unchanged
```

### Files to Deprecate (Remove Later)
```
web/app/contexts/[context]/     # Old context-based routing
├── page.tsx                    # Will be removed after refactor tested
└── ChatProfilePanel.tsx        # Will be removed, functionality moved to UnifiedChatPanel
```

---

## Component Design

### 1. UnifiedChatPanel Component

**Location:** `web/app/home/UnifiedChatPanel.tsx`

**Purpose:** Main chat and profile interface with context scope awareness

**Props:**
```typescript
type Props = {
  userId: string;
  contextProfiles: Array<{
    id: string;
    contextType: RelationshipContextType;
    tonePreference: string;
  }>;
  defaultContextType: RelationshipContextType;
};
```

**State:**
```typescript
- activeContextType: RelationshipContextType  // Currently selected context
- activeTab: "chat" | "profile"               // Current view tab
- messages: ChatMessage[]                      // Messages for active context
- profile: ProfileResponse                     // Profile for active context
- sending: boolean                             // Message send state
- offRecord: boolean                           // Off-record toggle
- messageInput: string                         // Message input value
```

**Key Behaviors:**
1. **Context Switching:**
   - When user changes context dropdown, refetch messages and profile for new context
   - Call `/api/chat/context?contextType=[new]` to load context data
   - Clear current messages/profile state before loading new context data

2. **Context Selector Visibility:**
   - If `contextProfiles.length === 1`: Hide selector completely
   - If `contextProfiles.length > 1`: Show dropdown selector
   - Show visual indicator (badge/chip) for current context at all times

3. **Preserve Current Behavior:**
   - Chat tab with off-record toggle
   - Profile tab with form fields
   - Quick actions ("Keep it light", "Go deeper")
   - All API calls include `contextType` parameter

**Layout:**
```
┌─────────────────────────────────────────┐
│ [Context Selector] (only if multiple)  │
│ ┌─ Current: Romantic ▼                │
│                                         │
│ [Chat Tab] [Profile Tab]               │
│                                         │
│ [Chat/Profile Content Area]            │
│                                         │
└─────────────────────────────────────────┘
```

---

### 2. ContextScopeIndicator Component

**Location:** `web/app/home/ContextScopeIndicator.tsx`

**Purpose:** Visual badge showing current context scope (always visible)

**Props:**
```typescript
type Props = {
  contextType: RelationshipContextType;
  size?: "small" | "medium" | "large";
};
```

**Styling:**
- Badge with context name (e.g., "Romantic", "Friendship")
- Subtle background color differentiation per context:
  - Romantic: soft pink/rose tint
  - Friendship: soft blue tint
  - Professional: soft gray tint
  - Creative: soft purple tint
  - Service: soft green tint
- Always visible, even for single-context users
- Uncluttered, minimal design

**Example:**
```tsx
<div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-900">
  <span className="h-2 w-2 rounded-full bg-rose-400" />
  <span className="capitalize">Romantic</span>
</div>
```

---

### 3. Home Page

**Location:** `web/app/home/page.tsx`

**Purpose:** Unified landing page for authenticated users

**Server Component Flow:**
1. Require authenticated user (`requireSessionUser()`)
2. Fetch all ContextProfile records for user
3. If no context profiles exist, redirect to `/onboarding`
4. Determine default context (first context, or most recently used)
5. Fetch initial messages and profile for default context
6. Pass data to `UnifiedChatPanel` client component

**Pseudocode:**
```typescript
export default async function HomePage() {
  const user = await requireSessionUser();

  // Fetch all context profiles for this user
  const contextProfiles = await prisma.contextProfile.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });

  if (contextProfiles.length === 0) {
    redirect("/onboarding");
  }

  // Default to first context (or implement "last used" logic later)
  const defaultContext = contextProfiles[0];

  // Fetch initial data for default context
  const messagesData = await prisma.chatMessage.findMany({
    where: { contextProfileId: defaultContext.id },
    orderBy: { createdAt: "asc" },
  });

  const profileData = await getOrCreateProfile(defaultContext.id);
  const profileDto = toDto(profileData);

  // Transform messages for client
  const messages: ChatMessage[] = messagesData.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    offRecord: msg.offRecord,
    createdAt: msg.createdAt.toISOString(),
  }));

  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 px-6 py-12">
      <main className="w-full max-w-3xl">
        <UnifiedChatPanel
          userId={user.id}
          contextProfiles={contextProfiles}
          defaultContextType={defaultContext.contextType}
          initialMessages={messages}
          initialProfile={profileDto}
        />
      </main>
    </div>
  );
}
```

---

## API Changes

### No Changes Required

All existing API routes remain unchanged:

**`/api/chat` (POST):**
- Still accepts `contextType` parameter
- Still validates context exists for user
- Still stores messages linked to ContextProfile

**`/api/profile` (PUT):**
- Still accepts `contextType` parameter
- Still updates Profile linked to specific ContextProfile

**`/api/onboarding` (POST):**
- Still creates separate ContextProfile records per context
- Still maintains trust boundaries

### New API Endpoint (Optional)

**`/api/chat/context` (GET):**
- Fetch messages and profile for a specific context
- Used when user switches contexts in UI

**Request:**
```typescript
GET /api/chat/context?contextType=friendship
```

**Response:**
```typescript
{
  messages: ChatMessage[],
  profile: ProfileResponse,
  contextProfile: {
    id: string,
    contextType: string,
    tonePreference: string
  }
}
```

**Implementation:**
```typescript
// Validate user owns this context
// Fetch messages for contextProfileId
// Fetch profile for contextProfileId
// Return data
```

**Alternative:** Client can call existing APIs separately, but this endpoint reduces round trips.

---

## State Management

### Context Switching Flow

**When user selects new context from dropdown:**

1. **Client-side state update:**
   ```typescript
   setActiveContextType(newContextType);
   setSending(true);
   ```

2. **Fetch new context data:**
   ```typescript
   const res = await fetch(`/api/chat/context?contextType=${newContextType}`);
   const data = await res.json();
   ```

3. **Update UI state:**
   ```typescript
   setMessages(data.messages);
   setProfile(data.profile);
   setSending(false);
   ```

4. **Visual feedback:**
   - Loading spinner while fetching
   - Context scope indicator updates
   - Messages and profile refresh

### Preserving Context Boundaries

**Critical:** Even though UI is unified, each API call MUST include `contextType` parameter:

```typescript
// Chat API call
await fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify({
    contextType: activeContextType,  // Always include current context
    message: messageInput,
    offRecord: offRecord
  })
});

// Profile API call
await fetch("/api/profile", {
  method: "PUT",
  body: JSON.stringify({
    contextType: activeContextType,  // Always include current context
    patch: profileForm
  })
});
```

**This ensures:**
- Messages are stored in correct ContextProfile
- Profile updates affect correct Profile record
- No data leakage between contexts
- Matching algorithm can filter by context cleanly

---

## Routing Changes

### Before (Current):
```
/onboarding → /contexts/[context]
Example: /contexts/romantic, /contexts/friendship
```

### After (Refactor):
```
/onboarding → /home
Single page with context selector
```

### Update Required:

**File:** `web/app/onboarding/page.tsx`

**Line 130:**
```typescript
// OLD:
router.push(`/contexts/${contextArray[0]}`);

// NEW:
router.push('/home');
```

---

## Database Schema

### NO CHANGES REQUIRED

The existing schema perfectly supports Option B:

```prisma
model ContextProfile {
  id             String                   @id @default(cuid())
  user           User                     @relation(fields: [userId], references: [id])
  userId         String
  contextType    RelationshipContextType
  tonePreference TonePreference

  @@unique([userId, contextType])
  chatMessages ChatMessage[]
  profile      Profile?
}
```

**Key points:**
- `@@unique([userId, contextType])` ensures one profile per context per user
- `chatMessages` are linked to specific ContextProfile (trust boundary)
- `profile` (DerivedProfile) is linked to specific ContextProfile (trust boundary)
- Future matching queries will filter by `contextType` (no cross-context matching)

**What this preserves:**
1. Users can have multiple contexts (romantic + friendship)
2. Each context has its own chat history
3. Each context has its own profile data
4. Matching engine can query by context to maintain boundaries
5. No accidental cross-context data leakage

---

## Security Considerations

### Trust Boundaries Preserved

1. **Separate ContextProfile records:**
   - Each relationship context (romantic, friendship, professional) has its own ContextProfile
   - Messages linked to specific ContextProfile.id
   - Profiles linked to specific ContextProfile.id

2. **API validation:**
   - All API routes validate user owns the requested context
   - Cannot access another user's context
   - Cannot create messages/profiles for non-owned contexts

3. **No cross-context queries:**
   - Chat queries: `WHERE contextProfileId = [specific context]`
   - Profile queries: `WHERE contextProfileId = [specific context]`
   - Future match queries: `WHERE contextType = [specific context] AND userId != [current user]`

### User Consent Model

**Explicit, not inferred:**
- User explicitly chooses contexts during onboarding (checkboxes)
- Context selector explicitly shows which context is active
- No "smart" cross-context suggestions
- No "you might also like friendship" nudges when in romantic mode

**Example of WRONG approach (we're NOT doing this):**
```typescript
// ❌ WRONG - Fuzzy intent stored as profile data
profile.intent = "Looking for romance, but open to friendship too"
// This creates ambiguity and pressure
```

**Example of CORRECT approach (what we ARE doing):**
```typescript
// ✅ CORRECT - Explicit context with clear boundaries
contextProfiles = [
  { contextType: "romantic", ... },
  { contextType: "friendship", ... }
]
// User explicitly chose both, data kept separate
```

---

## UX Flow Examples

### Single-Context User (Romantic Only)

**Onboarding:**
1. User checks "Looking for romance" only
2. Redirects to `/home`

**Home page experience:**
3. No context selector shown (only one context)
4. Context scope indicator shows "Romantic" badge (subtle, always visible)
5. User sees chat interface
6. All messages/profile tied to romantic context

**Result:** Feels like simple, focused app. No context switching needed.

---

### Multi-Context User (Romantic + Friendship)

**Onboarding:**
1. User checks both "Looking for romance" and "Looking for friends"
2. Redirects to `/home`

**Home page experience:**
3. Context selector dropdown shown at top: "Romantic ▼"
4. Context scope indicator shows "Romantic" badge
5. User chats, sees romantic context messages/profile

**Switching contexts:**
6. User clicks dropdown, selects "Friendship"
7. UI shows loading spinner briefly
8. Context scope indicator updates to "Friendship" badge
9. Messages and profile refresh to show friendship context data
10. User chats, sees friendship context messages/profile

**Result:** Clear, explicit context switching. User always knows which "mode" they're in. No ambiguity.

---

### Visual Design Principles

**From .context/the-art-of-vibes.md:**
- Easy and natural (flows without effort)
- Gets out of the way (uncluttered, one clear action)
- Real and honest (no overpromising)

**Applying to this refactor:**

1. **Context selector (if shown):**
   - Minimal, clean dropdown
   - Not prominent unless needed
   - Clear labels (capitalize context names)

2. **Context scope indicator:**
   - Subtle badge, always visible
   - Soft colors (not loud)
   - Provides certainty without noise

3. **Overall layout:**
   - Same clean, spacious design as current implementation
   - No visual clutter added
   - Tab structure preserved (Chat / Profile)

---

## Testing Plan

### Unit Tests

**UnifiedChatPanel Component:**
- Test context switching updates state correctly
- Test messages filtered by active context
- Test profile updates use correct contextType parameter
- Test context selector only renders when multiple contexts exist
- Test context scope indicator always renders with correct context

**ContextScopeIndicator Component:**
- Test renders correct label for each context type
- Test applies correct styling per context
- Test size prop variations

### Integration Tests

**API Routes (existing tests still pass):**
- `/api/chat` still accepts contextType and stores correctly
- `/api/profile` still accepts contextType and updates correctly
- Context validation still prevents unauthorized access

**New API Route:**
- `/api/chat/context` returns correct data for valid context
- Returns 404 for context user doesn't own
- Returns messages and profile for requested context

### Manual Testing

**Single-context user flow:**
- [ ] Onboard with only romantic context
- [ ] Redirect to /home
- [ ] No context selector visible
- [ ] Context scope indicator shows "Romantic"
- [ ] Chat and profile work as expected
- [ ] All messages stored in romantic ContextProfile

**Multi-context user flow:**
- [ ] Onboard with romantic + friendship contexts
- [ ] Redirect to /home
- [ ] Context selector dropdown visible
- [ ] Default shows first context (romantic)
- [ ] Switch to friendship context
- [ ] Messages and profile refresh
- [ ] Context scope indicator updates
- [ ] Send message in friendship context
- [ ] Switch back to romantic
- [ ] Verify friendship message stored in correct context (not in romantic)

**Trust boundary validation:**
- [ ] Messages in romantic context don't appear in friendship context
- [ ] Profile edits in romantic context don't affect friendship profile
- [ ] No UI elements suggesting cross-context connections
- [ ] API calls always include contextType parameter

### Product Validation

- [ ] Interface feels easy and natural (gets out of the way)
- [ ] Context switching is clear and explicit (no ambiguity)
- [ ] Single-context users see no unnecessary complexity
- [ ] Multi-context users can switch explicitly when needed
- [ ] Visual indicator provides certainty about current scope
- [ ] No overpromising or engagement tricks
- [ ] Messaging is real and honest

---

## Migration Strategy

### Phase 1: Build New Components
1. Create `UnifiedChatPanel.tsx` with context switching logic
2. Create `ContextScopeIndicator.tsx`
3. Create `/home/page.tsx` with unified interface
4. Create `/api/chat/context` endpoint (optional, for cleaner context switching)

### Phase 2: Update Routing
1. Update `onboarding/page.tsx` to redirect to `/home`
2. Test new flow end-to-end
3. Verify trust boundaries preserved

### Phase 3: Deprecate Old Routes
1. Mark `/contexts/[context]/*` as deprecated
2. Add redirect from `/contexts/*` to `/home` (for any old bookmarks)
3. Remove old files after 1-2 weeks of validation

### Phase 4: Cleanup
1. Remove old `ChatProfilePanel.tsx`
2. Remove old `/contexts/[context]/page.tsx`
3. Update any documentation references

**Rollback plan:** If issues discovered, revert routing change in onboarding. Old `/contexts/[context]` pages remain functional until new `/home` is proven.

---

## Implementation Estimate

**Complexity:** Medium (mostly frontend refactor)

**Estimated LOC:**
- UnifiedChatPanel.tsx: ~400 LOC (similar to current ChatProfilePanel)
- ContextScopeIndicator.tsx: ~30 LOC
- /home/page.tsx: ~100 LOC (similar to current context page)
- /api/chat/context route: ~50 LOC (optional)
- Onboarding route update: 1 line change

**Total: ~580 LOC (within single-dev range)**

**Time estimate:** 2-4 hours
- Component creation: 1-2 hours
- Testing and refinement: 1-2 hours

**Dependencies:** None (all prerequisites met)

**Risks:** Low
- Frontend-only changes
- Database unchanged
- APIs unchanged (just called from different UI)
- Easy to test and validate

---

## Non-Goals (Out of Scope)

This refactor does NOT include:

- ❌ Changing database schema
- ❌ Modifying matching algorithm
- ❌ Adding new API endpoints (besides optional `/api/chat/context`)
- ❌ Changing how contexts are created during onboarding
- ❌ Adding "smart" context suggestions
- ❌ Combining contexts into single data model
- ❌ Timeline/history view (future feature)
- ❌ User profile settings page (future feature)

These remain as separate features in the build order.

---

## Success Criteria

✅ **Must Achieve:**

1. **Single-context users see simplified interface:**
   - No context selector visible
   - Context scope indicator present but unobtrusive
   - Chat and profile work identically to current implementation

2. **Multi-context users can switch contexts explicitly:**
   - Context selector dropdown visible
   - Switching contexts refreshes messages and profile
   - Visual indicator always shows current context
   - No confusion about which context is active

3. **Trust boundaries preserved:**
   - Messages stored in correct ContextProfile
   - Profile updates affect correct Profile record
   - No cross-context data leakage
   - All API calls include contextType parameter

4. **User experience improvements:**
   - Interface feels unified and natural
   - Explicit context switching (no ambiguity)
   - Visual certainty about current scope
   - No added complexity for single-context users

5. **Code quality:**
   - Tests pass (existing + new)
   - No security vulnerabilities introduced
   - Type-safe TypeScript throughout
   - Follows existing code patterns

---

## Follow-Up Tasks (Post-Implementation)

1. **Monitor usage:**
   - Track how often multi-context users switch contexts
   - Identify if default context logic needs improvement

2. **Consider enhancements:**
   - "Last used" context as default (instead of first)
   - Keyboard shortcut for context switching (if users request)
   - Context-specific unread message counts

3. **Documentation:**
   - Update dev logs with implementation notes
   - Document new component patterns for future features
   - Create session log summarizing refactor

---

## Architectural Integrity Check

**Does this design preserve product principles?**

✅ **Easy and natural:**
- Single interface, no mode switching pages
- Context selector only shown when needed
- Feels unified while maintaining clear boundaries

✅ **Gets out of the way:**
- Minimal UI changes
- Context indicator subtle but always present
- No added complexity for single-context users

✅ **Real and honest:**
- Explicit context switching (no ambiguity)
- Visual indicator provides certainty
- No "smart" suggestions or nudges
- Trust boundaries preserved

✅ **No cross-context leakage:**
- Separate ContextProfile records maintained
- All APIs validate and use contextType
- Messages and profiles kept separate
- Future matching will filter by context

**Verdict:** This design fully aligns with Option B requirements and product principles.

---

## Next Steps

1. **Review this architecture document** with product/engineering stakeholders
2. **Get final approval** before implementation
3. **Implement components** following this design
4. **Test thoroughly** using manual test plan above
5. **Update project-state.md** with implementation progress
6. **Create session log** documenting refactor completion

---

**Architecture approved by:** [Pending review]
**Implementation assigned to:** Implement role
**Estimated completion:** 2025-12-22 (same day, if started immediately)
