# Slice 1 Implementation Issues

**Date:** 2025-12-24
**Status:** Open Issues from Slice 1c Testing

---

## Issues Found

### 1. Different relationship context windows still visible
**Priority:** High
**Status:** Open
**Description:** After implementing Slice 1c frontend refactor, the UI still shows different relationship context windows instead of the unified shared profile + context-specific intent view.

**Expected behavior:**
- Single shared profile visible across all contexts
- Only intent fields should differ per context

**Actual behavior:**
- Still seeing separate context windows (needs investigation)

**Possible causes:**
- [ ] Cache issue in browser/Next.js
- [ ] Old data structure still in database
- [ ] Component not rendering correctly
- [ ] Page routing issue

**Next steps:**
- Clear browser cache and hard refresh
- Check database to verify migration completed
- Verify API endpoints returning correct data structure
- Check server/client component hydration

---

### 2. User name field should be required
**Priority:** Medium
**Status:** Open
**Description:** The user's name is currently optional in the Profile model, but we need to collect this as required information.

**Current state:**
- Profile.name is nullable/optional (String?)
- Form allows empty name field
- Completeness calculation may not require name

**Required changes:**
- [ ] Update Prisma schema: make Profile.name required (String, not String?)
- [ ] Update ProfileDto type to make name required
- [ ] Update SharedProfileForm to validate name as required field
- [ ] Update completeness calculation to include name as required
- [ ] Add migration to handle existing profiles without names
- [ ] Update onboarding flow to collect name early
- [ ] Add validation in API endpoints to reject empty names

### 3. Remove "off the record" checkbox, add redaction message
**Priority:** Medium
**Status:** Open
**Description:** The "off the record" checkbox is unclear to users. Instead, we should inform users they can request redaction of any information at any time.

**Current state:**
- Checkbox labeled "Off the record (we won't store the text, just that you used it)"
- Unclear what "off the record" means in practice
- Confusing user experience

**Required changes:**
- [ ] Remove offRecord checkbox from ChatProfilePanel
- [ ] Remove offRecord state management
- [ ] Remove offRecord parameter from /api/chat endpoint
- [ ] Add informational text near chat input explaining redaction rights
- [ ] Suggested text: "Remember, you can tell us to forget any and all information you've told us and we'll remove it."
- [ ] Update ChatMessage model/API to handle redaction requests (future feature)
- [ ] Remove offRecord field from message display badges

**Implementation notes:**
- Keep the offRecord column in database for now (backward compatibility)
- Just stop using it in the UI and API
- Future: implement actual redaction command (e.g., "forget my location")

### 4. Core values and constraints fields not accepting commas/spaces
**Priority:** High
**Status:** Open
**Description:** The core values and constraints input fields in SharedProfileForm aren't properly handling comma-separated values - commas and spaces may be getting stripped or blocked.

**Current state:**
- Users cannot type commas or spaces in these fields
- CSV input not working as intended
- Fields expect comma-separated values but input is broken

**Expected behavior:**
- User should be able to type: "authenticity, growth, creativity"
- Should split on commas and trim whitespace
- Should display as array in database

**Required changes:**
- [ ] Debug SharedProfileForm input handlers for coreValues field
- [ ] Debug SharedProfileForm input handlers for constraints field
- [ ] Check if input type or className is blocking characters
- [ ] Test onChange handler splits on comma correctly
- [ ] Add placeholder text showing example: "authenticity, growth, creativity"
- [ ] Consider alternative: multi-select tags component instead of CSV input

**Investigation needed:**
- Check browser console for errors
- Test if issue is with input sanitization
- Verify the split/map/filter logic in onChange handler

---

## Resolution Checklist

Once all issues are resolved:
- [ ] Test all 5 context types (romantic, friendship, professional, creative, service)
- [ ] Verify shared profile shows same data across all contexts
- [ ] Verify intent fields show different data per context
- [ ] Test form saves work correctly
- [ ] Test chat updates both models
- [ ] Mobile responsive design works
- [ ] No console errors in browser
- [ ] TypeScript builds without errors
- [ ] All acceptance criteria from slice-1c-frontend-ui.md met
