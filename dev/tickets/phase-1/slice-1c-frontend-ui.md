# Slice 1c: Frontend UI Refactor

**Mode:** Swarm
**Brief:** N/A (Refactor - Option 1 Implementation)
**Build Order:** 3/10 (Refactoring Brief 3)
**Architecture:** `dev/logs/slice-1-option1-architecture-2025-12-22.md`
**Created:** 2025-12-22

---

## Goal

Refactor the frontend UI to display and edit the new unified Profile + ContextIntent models. This includes creating a context scope indicator, splitting profile forms into shared vs context-specific sections, dynamically rendering intent fields based on context type, and updating all relevant pages to fetch both models.

## User Story

As a user, I want to see which profile information is shared across all my contexts and which is specific to each context, so I can understand how my profile appears in different relationship contexts and maintain accurate, context-appropriate information.

## Acceptance Criteria

- [ ] Component `/app/components/ContextScopeIndicator.tsx` created (~50 LOC)
  - [ ] Shows current context with visual badge (romantic, friendship, etc.)
  - [ ] Explains that some fields are shared, others are context-specific
  - [ ] Uses simple, honest language (no marketing speak)
  - [ ] Styled with TailwindCSS, matches existing design system
- [ ] Component `/app/components/SharedProfileForm.tsx` created (~100 LOC)
  - [ ] Displays all shared profile fields (location, ageRange, coreValues, beliefs, lifestyle, constraints)
  - [ ] Handles Json fields correctly (arrays, objects)
  - [ ] Has save button that calls `updateSharedProfile()` API
  - [ ] Shows validation errors inline
  - [ ] Shows completeness indicator for shared profile
- [ ] Component `/app/components/ContextIntentForm.tsx` created (~150 LOC)
  - [ ] Dynamically renders fields based on contextType prop
  - [ ] Romantic context: shows relationshipTimeline, exclusivityExpectation, familyIntentions, attractionImportance
  - [ ] Friendship context: shows friendshipDepth, groupActivityPreference, emotionalSupportExpectation
  - [ ] Professional context: shows partnershipType, commitmentHorizon, complementarySkills, equityOrRevShare
  - [ ] Creative context: shows creativeType, roleNeeded, processStyle, egoBalance, compensationExpectation
  - [ ] Service context: shows serviceType, budgetRange, timelineNeeded, credentialsRequired
  - [ ] Has save button that calls `updateContextIntent()` API
  - [ ] Shows validation errors inline
  - [ ] Shows completeness indicator for context intent
- [ ] Page `/app/contexts/[context]/page.tsx` updated (~30 LOC)
  - [ ] Fetches shared Profile via `getSharedProfileDto(userId)`
  - [ ] Fetches ContextIntent via `getContextIntentDto(userId, context)`
  - [ ] Passes both to ChatProfilePanel component
  - [ ] Handles loading states gracefully
  - [ ] Shows error message if fetches fail
- [ ] Component `/app/contexts/[context]/ChatProfilePanel.tsx` refactored (~100 LOC)
  - [ ] Accepts both `sharedProfile` and `contextIntent` props
  - [ ] Profile tab displays ContextScopeIndicator at top
  - [ ] Profile tab shows SharedProfileForm first
  - [ ] Profile tab shows divider with text "Context-Specific Intent"
  - [ ] Profile tab shows ContextIntentForm below divider
  - [ ] Chat functionality unchanged (still updates both models via `/api/chat`)
  - [ ] Completeness display combines both scores or shows separately (design decision)
- [ ] Onboarding welcome messages updated (minor, ~10 LOC)
  - [ ] Adjust first message to explain shared vs context-specific info
  - [ ] Example: "Let's start with what matters to you in life generally - your values, lifestyle - then we'll get into what you're looking for [romantically/in friendships/etc.]"
- [ ] All forms validate user input before submission
- [ ] All forms show helpful error messages (not cryptic codes)
- [ ] Loading states display spinners or skeletons (not blank screens)
- [ ] Forms disable save buttons during submission (prevent double-submit)
- [ ] Successful saves show brief confirmation (toast or inline message)
- [ ] Forms support keyboard navigation (tab order logical)
- [ ] Interface feels easy and natural (gets out of the way)
- [ ] Messaging is real and honest (no overpromising)
- [ ] No security vulnerabilities (XSS prevention, CSRF tokens)
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Existing chat functionality continues to work (messages saved, extraction works)

## Dependencies

### Prerequisites (must exist):
- [x] **Slice 1a complete:** Schema migrated, data exists in new models
- [x] **Slice 1b complete:** API endpoints available and functional
- [x] GET /api/profile endpoint returns ProfileDto
- [x] PUT /api/profile endpoint updates Profile
- [x] GET /api/profile/intent?contextType=X endpoint returns ContextIntentDto
- [x] PUT /api/profile/intent endpoint updates ContextIntent
- [x] POST /api/chat endpoint updates both Profile and ContextIntent

### Blockers (if any):
- **BLOCKER:** Cannot proceed until Slice 1b API refactor is deployed and tested

## Technical Requirements

### UI Components

#### **ContextScopeIndicator** (~50 LOC)

**Purpose:** Clarify for users which context they're in and explain data scope.

**Design:**
```tsx
export function ContextScopeIndicator({
  currentContext
}: {
  currentContext: RelationshipContextType
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-zinc-700">
          Current context:
        </span>
        <span className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white capitalize">
          {currentContext}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Some profile fields (like values and lifestyle) are shared across all contexts.
        Intent fields below are specific to {currentContext} relationships.
      </p>
    </div>
  );
}
```

**Key Features:**
- Clear visual indicator of current context
- Explains shared vs specific in plain language
- Uncluttered design, one clear takeaway
- No jargon or marketing speak

#### **SharedProfileForm** (~100 LOC)

**Purpose:** Allow users to view and edit shared profile fields.

**Fields:**
- Name (text input)
- Location (text input)
- Age Range (dropdown: 18-24, 25-34, 35-44, 45-54, 55+)
- Core Values (multi-select or tag input, array of strings)
- Beliefs (structured input - TBD, could be key-value pairs)
- Interaction Style (structured input - TBD)
- Lifestyle (structured input - TBD)
- Constraints (tag input, array of strings)

**Behavior:**
- Fetches initial data from props
- Local state for form fields
- Save button calls PUT /api/profile
- Shows completeness bar (e.g., "60% complete")
- Shows missing fields hint (e.g., "Add location and age range to improve matches")
- Validates required fields before submit
- Shows success message on save
- Shows error message on failure

**Example Structure:**
```tsx
export function SharedProfileForm({
  profile,
  onSave
}: {
  profile: ProfileDto;
  onSave: (patch: Partial<ProfileDto>) => Promise<void>;
}) {
  const [formData, setFormData] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      // Show success toast
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Shared Profile</h3>
      <p className="text-sm text-zinc-600">
        This information appears in all your contexts.
      </p>

      {/* Form fields */}
      <input
        type="text"
        value={formData.location || ''}
        onChange={(e) => setFormData({...formData, location: e.target.value})}
        placeholder="Location"
      />

      {/* ... more fields ... */}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

#### **ContextIntentForm** (~150 LOC)

**Purpose:** Allow users to view and edit context-specific intent fields.

**Dynamic Fields Based on contextType:**

**Romantic:**
- Relationship Timeline (dropdown: Taking my time, Open to soon, Actively looking)
- Exclusivity Expectation (dropdown: Monogamous, Open, Figuring it out)
- Family Intentions (dropdown: Want kids, Don't want kids, Open, Already have kids)
- Attraction Importance (dropdown: Critical, Important, Balanced, Less important)

**Friendship:**
- Friendship Depth (dropdown: Casual, Close, Best friend)
- Group Activity Preference (dropdown: One-on-one, Small group, Large group, Flexible)
- Emotional Support Expectation (dropdown: Minimal, Moderate, High)

**Professional:**
- Partnership Type (dropdown: Cofounder, Collaborator, Advisor, Employee, Contractor)
- Commitment Horizon (dropdown: Project-based, Ongoing, Long-term)
- Complementary Skills (multi-select: Design, Engineering, Marketing, Sales, etc.)
- Equity or Rev Share (dropdown: Equity, Rev share, Salary, Hybrid, TBD)

**Creative:**
- Creative Type (dropdown: Music, Writing, Visual art, Film, Performance, Other)
- Role Needed (dropdown: Co-creator, Contributor, Feedback, Production)
- Process Style (dropdown: Structured, Spontaneous, Hybrid)
- Ego Balance (dropdown: Shared vision, Lead/follow, Independent)
- Compensation Expectation (dropdown: Paid, Profit share, Free, Depends)

**Service:**
- Service Type (radio: Offering, Seeking)
- Budget Range (dropdown: Under $1k, $1k-5k, $5k-20k, $20k+, Flexible)
- Timeline Needed (dropdown: Urgent, Weeks, Months, Flexible)
- Credentials Required (dropdown: Licensed, Experienced, Portfolio, Flexible)

**Behavior:**
- Renders only fields relevant to contextType
- Fetches initial data from props
- Save button calls PUT /api/profile/intent
- Shows completeness bar
- Validates fields before submit

**Example Structure:**
```tsx
export function ContextIntentForm({
  contextType,
  intent,
  onSave
}: {
  contextType: RelationshipContextType;
  intent: ContextIntentDto;
  onSave: (patch: Partial<ContextIntentDto>) => Promise<void>;
}) {
  const [formData, setFormData] = useState(intent);
  const [saving, setSaving] = useState(false);

  const renderFields = () => {
    switch (contextType) {
      case 'romantic':
        return (
          <>
            <SelectField
              label="Relationship Timeline"
              value={formData.relationshipTimeline}
              options={['taking_my_time', 'open_to_soon', 'actively_looking']}
              onChange={(v) => setFormData({...formData, relationshipTimeline: v})}
            />
            {/* ... other romantic fields ... */}
          </>
        );
      case 'friendship':
        return (
          <>
            <SelectField
              label="Friendship Depth"
              value={formData.friendshipDepth}
              options={['casual', 'close', 'best_friend']}
              onChange={(v) => setFormData({...formData, friendshipDepth: v})}
            />
            {/* ... other friendship fields ... */}
          </>
        );
      // ... other contexts ...
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold capitalize">
        {contextType} Intent
      </h3>
      <p className="text-sm text-zinc-600">
        These preferences are specific to {contextType} relationships.
      </p>

      {renderFields()}

      <button
        onClick={() => onSave(formData)}
        disabled={saving}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  );
}
```

### Page Updates

#### `/app/contexts/[context]/page.tsx` (~30 LOC changed)

**Current Implementation:**
```typescript
// Fetches ContextProfile with nested Profile
const profileRow = await getOrCreateProfile(contextProfile.id);
```

**New Implementation:**
```typescript
// Fetch shared Profile and ContextIntent separately
const [sharedProfile, contextIntent] = await Promise.all([
  getOrCreateSharedProfile(user.id),
  getOrCreateContextIntent(user.id, context)
]);

// Convert to DTOs
const sharedProfileDto = await getSharedProfileDto(user.id);
const contextIntentDto = await getContextIntentDto(user.id, context);

// Pass both to component
<ChatProfilePanel
  contextType={context}
  tonePreference={contextProfile.tonePreference}
  initialMessages={messages}
  sharedProfile={sharedProfileDto}
  contextIntent={contextIntentDto}
/>
```

#### `/app/contexts/[context]/ChatProfilePanel.tsx` (~100 LOC changed)

**Current Structure:**
- Profile tab shows single ProfileForm
- Chat tab shows chat interface

**New Structure:**
- Profile tab shows:
  1. ContextScopeIndicator (top)
  2. SharedProfileForm (middle)
  3. Divider with text "Context-Specific Intent"
  4. ContextIntentForm (bottom)
- Chat tab unchanged

**State Management:**
- Split `profile` state into `sharedProfile` and `contextIntent`
- Two separate save handlers: `handleSaveShared()` and `handleSaveIntent()`
- Update completeness calculation (combined or separate?)

**Example:**
```tsx
export function ChatProfilePanel({
  contextType,
  sharedProfile,
  contextIntent,
  initialMessages,
  tonePreference
}: {
  contextType: RelationshipContextType;
  sharedProfile: { profile: ProfileDto; completeness: number; missing: string[] };
  contextIntent: { intent: ContextIntentDto; completeness: number; missing: string[] };
  initialMessages: ChatMessage[];
  tonePreference: TonePreference;
}) {
  const [activeTab, setActiveTab] = useState<'chat' | 'profile'>('chat');

  const handleSaveShared = async (patch: Partial<ProfileDto>) => {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch })
    });
    // Update local state
  };

  const handleSaveIntent = async (patch: Partial<ContextIntentDto>) => {
    const res = await fetch('/api/profile/intent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextType, patch })
    });
    // Update local state
  };

  return (
    <div>
      {/* Tab switcher */}

      {activeTab === 'profile' && (
        <div className="space-y-6 p-4">
          <ContextScopeIndicator currentContext={contextType} />

          <SharedProfileForm
            profile={sharedProfile.profile}
            onSave={handleSaveShared}
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-zinc-500">
                Context-Specific Intent
              </span>
            </div>
          </div>

          <ContextIntentForm
            contextType={contextType}
            intent={contextIntent.intent}
            onSave={handleSaveIntent}
          />
        </div>
      )}

      {activeTab === 'chat' && (
        <ChatInterface
          contextType={contextType}
          messages={initialMessages}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}
```

### Integration Points

- Fetches data from `/api/profile` and `/api/profile/intent` endpoints
- Updates via PUT requests to same endpoints
- Chat interface continues to use POST `/api/chat` (updates both models)
- Uses existing auth (session cookie)
- Uses TailwindCSS for styling (matches existing design)
- Integrates with existing ContextProfile for tonePreference and chat history

## Constraints

- ≤ 620 LOC per slice
- ≤ 2 new dependencies (likely 0 - using existing React, Next.js, Tailwind)
- Must maintain product principles (easy, natural, honest)
- Must be responsive (mobile, tablet, desktop)
- Must be accessible (keyboard navigation, screen readers)
- Must validate all user input client-side before API calls

## Test Plan

### Component Tests

- Test `ContextScopeIndicator`:
  - Renders current context name correctly
  - Shows explanation text
  - Capitalizes context name
  - Matches snapshot

- Test `SharedProfileForm`:
  - Renders all shared fields
  - Populates with initial data
  - Updates local state on field change
  - Calls onSave with correct patch on submit
  - Shows validation errors for required fields
  - Disables save button while saving
  - Shows error message on API failure
  - Shows success message on API success

- Test `ContextIntentForm` for each context:
  - Romantic: renders relationshipTimeline, exclusivityExpectation, familyIntentions, attractionImportance
  - Friendship: renders friendshipDepth, groupActivityPreference, emotionalSupportExpectation
  - Professional: renders partnershipType, commitmentHorizon, complementarySkills, equityOrRevShare
  - Creative: renders all creative fields
  - Service: renders all service fields
  - Populates with initial data
  - Calls onSave with correct patch
  - Validates context-specific fields

- Test `ChatProfilePanel`:
  - Renders both tabs (chat, profile)
  - Switches between tabs correctly
  - Passes sharedProfile and contextIntent to child components
  - Handles save actions from both forms
  - Updates completeness displays after saves
  - Chat functionality still works (sends messages, updates profile)

### Integration Tests

- Test profile page load:
  - Visit `/contexts/romantic` → fetches shared profile and romantic intent
  - Visit `/contexts/friendship` → fetches shared profile and friendship intent
  - Profile tab shows correct intent fields for context
  - Completeness scores displayed accurately

- Test profile updates:
  - Edit location in SharedProfileForm → saves to database, updates display
  - Edit relationshipTimeline in ContextIntentForm → saves to database, updates display
  - Both completeness scores update after edits
  - Changes persist after page reload

- Test chat updates:
  - Send message "I live in SF" → updates shared profile location
  - Send message "I'm taking my time with dating" → updates romantic intent relationshipTimeline
  - Profile tab shows updated data immediately
  - Completeness scores update after chat extraction

### Manual Testing Checklist

- [ ] Load `/contexts/romantic` page:
  - [ ] ContextScopeIndicator shows "romantic"
  - [ ] SharedProfileForm displays current profile data
  - [ ] ContextIntentForm shows romantic fields only
  - [ ] Save button works for both forms
  - [ ] Completeness displays correctly

- [ ] Load `/contexts/friendship` page:
  - [ ] ContextScopeIndicator shows "friendship"
  - [ ] ContextIntentForm shows friendship fields only

- [ ] Test all 5 contexts (romantic, friendship, professional, creative, service):
  - [ ] Each shows correct intent fields
  - [ ] Each saves correctly to database

- [ ] Test form validation:
  - [ ] Required fields show errors when empty
  - [ ] Invalid inputs rejected (e.g., non-numeric for age)
  - [ ] Submit button disabled until valid

- [ ] Test loading states:
  - [ ] Page shows loading indicator while fetching
  - [ ] Save buttons show "Saving..." during request
  - [ ] No flashing or layout shifts

- [ ] Test error states:
  - [ ] API failure shows error message (not silent fail)
  - [ ] Network error shows helpful message
  - [ ] Can retry after error

- [ ] Test chat integration:
  - [ ] Send message mentioning location → updates SharedProfile
  - [ ] Send message mentioning relationship intent → updates ContextIntent
  - [ ] Profile tab reflects changes immediately

- [ ] Test responsive design:
  - [ ] Mobile (320px width): forms stack vertically, readable
  - [ ] Tablet (768px width): comfortable spacing, no overflow
  - [ ] Desktop (1280px width): optimal layout, not too stretched

- [ ] Test accessibility:
  - [ ] Tab through forms: logical order
  - [ ] Screen reader: labels read correctly
  - [ ] Keyboard only: can complete all actions
  - [ ] Focus indicators visible

### Product Validation

- [ ] Interface gets out of the way (uncluttered, one clear action path)
  - Forms are simple, not overwhelming
  - Save buttons clearly labeled
  - No confusing options or jargon

- [ ] Messaging is real and honest (no overpromising)
  - Explanations use plain language
  - No "Your perfect match is waiting!" marketing speak
  - Errors are clear and helpful

- [ ] Moves people toward real meetings (where chemistry happens)
  - Profile completion encourages filling useful info
  - Intent fields help clarify what user wants
  - No gamification or endless swiping

- [ ] No security vulnerabilities
  - All forms validated before submit
  - API calls authenticated
  - No XSS (user input sanitized)
  - No CSRF (using Next.js built-in protection)

## Readiness

- [ ] **BLOCKED:** Waiting for Slice 1b to complete (API endpoints must be functional)
- [x] Architecture exists and reviewed (see Architecture §4-5)
- [ ] No other blockers once Slice 1b complete
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive

## Implementation Notes

### Critical Details from Architecture (§4.1-4.3)

**Form Field UI Guidelines:**

1. **Shared Profile Fields:**
   - Use simple, intuitive inputs (text, dropdown, multi-select)
   - For Json fields (beliefs, interactionStyle, lifestyle), start simple:
     - Could be key-value pairs (e.g., "Religion: Spiritual but not religious")
     - Or structured form (multiple dropdowns/inputs)
     - **Recommendation:** Start with text area, structure later

2. **Context Intent Fields:**
   - All are dropdowns or multi-selects (predefined options)
   - Use human-readable labels (not enum values)
   - Example: "taking_my_time" → "Taking my time"
   - Group related fields visually (e.g., all romantic fields together)

3. **Completeness Display:**
   - Show as percentage with progress bar
   - Option A: Combined score (shared + intent averaged)
   - Option B: Two separate scores shown
   - **Recommendation:** Combined score with breakdown on hover/tooltip

4. **Validation:**
   - Client-side validation for immediate feedback
   - Server-side validation as safety net
   - Show errors inline near relevant field (not in modal)
   - Use red text and/or icons for errors

### UX Considerations

**Onboarding Message Updates:**

Current welcome messages are context-specific. Update to reflect shared + intent flow:

```typescript
const welcomeMessages = {
  romantic: "Cool. So you're here to meet someone you could fall for. Let's start with what matters to you in life generally - your values, lifestyle, where you're at. Then we'll get into what you're looking for romantically.",

  friendship: "Great. You're looking for real friendships. Let's start with who you are - your values, interests, lifestyle. Then we'll talk about what kind of friendships you're after.",

  professional: "Right. So you need a professional connection. Let's start with the basics - your location, what you do, your working style. Then we'll get into what kind of partnership you're looking for.",

  // ... similar updates for creative and service
};
```

**Key Change:** Explicitly mention "let's start with general info, then context-specific" to set expectations.

### Styling Guidelines

Use existing TailwindCSS design system:

- **Colors:**
  - Primary: black (`bg-black`, `text-white`)
  - Secondary: zinc shades (`text-zinc-600`, `border-zinc-200`)
  - Error: red (`text-red-600`)
  - Success: green (`text-green-600`)

- **Spacing:**
  - Component padding: `p-4` or `p-6`
  - Stack spacing: `space-y-4` or `space-y-6`
  - Consistent margins

- **Typography:**
  - Headings: `text-lg font-semibold` or `text-xl font-bold`
  - Body: `text-sm` or `text-base`
  - Labels: `text-sm font-medium`

- **Borders:**
  - Rounded: `rounded-lg`
  - Border color: `border-zinc-200`
  - Focus rings: `focus:ring-2 focus:ring-black`

- **Buttons:**
  - Primary: `bg-black text-white px-4 py-2 rounded-lg hover:bg-zinc-800`
  - Disabled: `opacity-50 cursor-not-allowed`

### Performance Considerations

- Use React.memo for expensive components (forms with many fields)
- Debounce autosave if implementing (wait 500ms after typing stops)
- Lazy load ContextIntentForm fields (only render current context)
- Use React.Suspense for async data fetching (Next.js 16 supports)

### Accessibility Requirements

- All form inputs must have labels (visible or aria-label)
- Use semantic HTML (form, label, input, button)
- Keyboard navigation: Tab order logical, Enter submits forms
- Focus indicators visible (don't disable outline without alternative)
- Error messages associated with inputs (aria-describedby)
- Screen reader announcements for async updates (aria-live)
- Color contrast meets WCAG AA standards (4.5:1 for text)

### Security Considerations

1. **XSS Prevention:**
   - Never use `dangerouslySetInnerHTML` with user input
   - React escapes by default, but be cautious with Json fields
   - Sanitize user input before displaying (use DOMPurify if needed)

2. **CSRF Prevention:**
   - Next.js API routes have built-in CSRF protection
   - Use fetch with credentials: 'same-origin'

3. **Input Validation:**
   - Validate all form inputs before API calls
   - Don't trust client-side validation alone (backend validates too)
   - Sanitize inputs (trim whitespace, remove special chars where appropriate)

4. **Authentication:**
   - All API calls include session cookie automatically
   - Don't expose userId in client-side code (backend extracts from session)

### Edge Cases to Handle

1. **User has no profile data yet:**
   - Forms show empty fields with placeholders
   - Completeness = 0%
   - Missing fields list shown

2. **User switches contexts mid-edit:**
   - Warn about unsaved changes before switching
   - OR: Auto-save on context switch
   - **Recommendation:** Show "You have unsaved changes" warning

3. **API request fails:**
   - Show error message with retry button
   - Don't lose user's input (keep form state)
   - Log error for debugging

4. **Slow network:**
   - Show loading indicators immediately
   - Disable inputs during save (prevent conflicts)
   - Timeout after 10 seconds, show error

5. **User enters invalid data:**
   - Validate on blur (not on every keystroke)
   - Show inline error message
   - Prevent submit until fixed

### Testing Strategy

**Priority 1 (Must Test Manually):**
- All 5 contexts render correct intent fields
- Forms save correctly to database
- Chat updates both models correctly
- Responsive design on mobile/desktop

**Priority 2 (Test If Time):**
- Component unit tests (Jest + React Testing Library)
- Accessibility audit (axe-core, manual keyboard test)
- Cross-browser testing (Chrome, Firefox, Safari)

**Priority 3 (Future):**
- E2E tests (Playwright)
- Performance profiling (React DevTools)
- Load testing (many fields, slow network)

## Next Steps

After this slice is complete:
1. Deploy to staging environment
2. Manual QA testing on all 5 contexts
3. Test on real devices (iOS Safari, Android Chrome)
4. User acceptance testing with 2-3 real users
5. Fix any bugs or UX issues discovered
6. Deploy to production (coordinate with Slice 1a + 1b)
7. Monitor Sentry for frontend errors
8. Collect user feedback on new profile UI
9. Consider future enhancements:
   - Combined completeness tooltip showing breakdown
   - Profile preview mode (how others see you)
   - Contextual help text for fields
   - Field suggestions based on other users

## Success Criteria

This slice is successful when:
- Users can view and edit shared profile fields
- Users can view and edit context-specific intent fields
- UI clearly explains which fields are shared vs specific
- Forms save correctly to database via API
- Chat functionality continues to work (updates both models)
- Completeness scores display accurately
- No user-reported bugs or confusion about new UI
- Mobile experience is smooth and usable
- Page load time < 2 seconds on 3G
- No accessibility violations (aXe audit passes)
