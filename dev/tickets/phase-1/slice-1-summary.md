# Feature Planning Summary: Option 1 Implementation (3 Slices)

**Date:** 2025-12-22
**Feature Planner:** Agent
**Architecture Reference:** `dev/logs/slice-1-option1-architecture-2025-12-22.md`

---

## Overview

This planning session created 3 detailed slice tickets for implementing Option 1: Single Profile + Context-Specific Intent Fields. The total implementation is estimated at ~1,250 LOC, requiring 3 slices to stay within swarm budget constraints (≤400 LOC per slice).

## Current State Assessment

**Build Order Position:** 3/10 (Brief 3: DerivedProfile extraction stub)

**Recently Completed:**
- Brief 1: Auth + context selection + basic routing (complete)
- Brief 2: Agent chat UI + message storage + off-the-record (complete)

**In Progress:**
- Brief 3 refactor: Migrating from ContextProfile-scoped profiles to unified Profile + ContextIntent

**Codebase State:**
- Current schema: User → ContextProfile → Profile (1:1 with ContextProfile)
- Profile data stored in unstructured Json blob (Profile.data)
- Chat agent extracts profile data during conversations
- Multiple contexts supported (romantic, friendship, professional, creative, service)

**Architecture Completed:**
- Full architecture document exists at `dev/logs/slice-1-option1-architecture-2025-12-22.md`
- Schema design complete (Profile with userId FK, ContextIntent model)
- Migration strategy defined (additive, data migration script, verification)
- API contract changes specified
- UI component structure designed
- Budget breakdown: 330 + 300 + 620 = 1,250 LOC total

## Next Feature Identified

**Feature:** Option 1 Implementation - Single Profile + Context-Specific Intent Fields
**Architecture:** `dev/logs/slice-1-option1-architecture-2025-12-22.md`
**Build Order Position:** 3/10 (Refactoring Brief 3)
**Rationale:** This refactor enables shared profile data across contexts while maintaining context-specific intent fields, improving data model clarity and reducing duplication.

## Dependencies Check

All prerequisites for implementation are met:

- [x] Architecture document complete and reviewed
- [x] Current schema understood (User → ContextProfile → Profile)
- [x] Prisma ORM in use (migration tooling available)
- [x] Next.js 16 API routes (endpoints can be updated)
- [x] React 19 components (UI can be refactored)
- [x] TailwindCSS 4 (styling system available)
- [ ] No blockers for Slice 1a (schema + migration)
- [ ] Slice 1b blocked until 1a complete (needs new schema)
- [ ] Slice 1c blocked until 1b complete (needs new API endpoints)

**Sequential Dependencies:**
- Slice 1a must complete before 1b can start (schema must exist)
- Slice 1b must complete before 1c can start (API must exist)
- All 3 slices should deploy together to avoid compatibility issues

## Scope Assessment

**Mode:** Swarm (3 slices)

**Reasoning:**
- Total implementation: ~1,250 LOC (exceeds 400 LOC single-dev limit)
- Spans multiple areas: database schema, backend API, frontend UI
- Complex integration requiring coordination between layers
- Benefits from sequential execution (schema → API → UI)
- Each slice can be reviewed independently

**Estimated LOC Breakdown:**
- Slice 1a: ~330 LOC (schema + migration script)
- Slice 1b: ~300 LOC (API refactor + CRUD logic)
- Slice 1c: ~620 LOC (UI components + page updates)

**Complexity Factors:**
- Data migration requires careful handling (no data loss)
- API contract changes (breaking if not managed carefully)
- UI refactor touches multiple components
- Edge cases: conflicting data, missing profiles, validation

**Roles Needed:**
- Backend Specialist (Slices 1a, 1b): Database schema, API logic
- Frontend Specialist (Slice 1c): React components, forms, UI
- QA/Testing (All slices): Verification, edge case testing
- Architect (Review): Ensure consistency across slices

## Slice Breakdown

### Slice 1a: Schema & Data Migration (~330 LOC)
**File:** `dev/tickets/slice-1a-schema-migration.md`

**Scope:**
- Update Prisma schema with Profile (userId FK) and ContextIntent models
- Create Prisma migration files (additive only)
- Write data migration script in `prisma/scripts/migrate-to-option1.ts`
- Test migration on local database copy
- Verify data integrity with SQL queries
- Handle edge cases: no data, conflicting data, unmapped fields

**Key Deliverables:**
- Profile model with userId FK and Json fields (coreValues, beliefs, etc.)
- ContextIntent model with all 5 context types' fields
- Migration script with aggregation and extraction logic
- Verification report (data counts, conflicts, unmapped fields)
- Rollback plan documented

**Budget:**
- ≤ 330 LOC
- ≤ 2 new database tables (Profile, ContextIntent)
- ≤ 0 new dependencies (using existing Prisma)

**Status:** Ready to implement (no blockers)

### Slice 1b: Backend API Refactor (~300 LOC)
**File:** `dev/tickets/slice-1b-backend-api.md`

**Scope:**
- Create `/lib/profile-shared.ts` - Shared profile CRUD logic (80 LOC)
- Create `/lib/context-intent.ts` - Context intent CRUD logic (120 LOC)
- Create `/lib/completeness.ts` - Unified completeness calculation (60 LOC)
- Create `/app/api/profile/intent/route.ts` - Context intent API endpoint (70 LOC)
- Update `/app/api/profile/route.ts` - Handle shared profile only (30 LOC)
- Update `/app/api/chat/route.ts` - Update both Profile AND ContextIntent (40 LOC)
- Update `/lib/types.ts` - Add ProfileDto, ContextIntentDto types (40 LOC)

**Key Deliverables:**
- GET/PUT /api/profile endpoints (shared profile only)
- GET/PUT /api/profile/intent endpoints (context-specific intent)
- POST /api/chat updates both Profile and ContextIntent
- Completeness calculation functions
- TypeScript DTOs for all models

**Budget:**
- ≤ 300 LOC
- ≤ 0 new dependencies
- ≤ 0 new database tables (added in 1a)

**Status:** Blocked until Slice 1a complete (needs new schema)

### Slice 1c: Frontend UI Refactor (~620 LOC)
**File:** `dev/tickets/slice-1c-frontend-ui.md`

**Scope:**
- Create `/app/components/ContextScopeIndicator.tsx` (50 LOC)
- Create `/app/components/SharedProfileForm.tsx` (100 LOC)
- Create `/app/components/ContextIntentForm.tsx` - Dynamic form based on contextType (150 LOC)
- Update `/app/contexts/[context]/page.tsx` - Fetch shared + intent (30 LOC)
- Refactor `/app/contexts/[context]/ChatProfilePanel.tsx` - Split profile display (100 LOC)
- Update onboarding welcome messages (10 LOC)

**Key Deliverables:**
- ContextScopeIndicator component (explains shared vs context-specific)
- SharedProfileForm component (edits location, values, lifestyle, etc.)
- ContextIntentForm component (dynamic fields per context type)
- Updated ChatProfilePanel (displays both forms)
- Responsive, accessible forms with validation

**Budget:**
- ≤ 620 LOC
- ≤ 0 new dependencies
- ≤ 0 new database tables

**Status:** Blocked until Slice 1b complete (needs new API endpoints)

## Tickets Created

All 3 tickets have been created in `dev/tickets/`:

1. **`dev/tickets/slice-1a-schema-migration.md`** (~330 LOC)
   - Database schema updates
   - Data migration script
   - Verification and rollback plan

2. **`dev/tickets/slice-1b-backend-api.md`** (~300 LOC)
   - API endpoint refactor
   - CRUD logic for Profile and ContextIntent
   - Completeness calculation

3. **`dev/tickets/slice-1c-frontend-ui.md`** (~620 LOC)
   - UI components for profile editing
   - Dynamic forms per context type
   - Responsive, accessible design

**Total:** 1,250 LOC across 3 slices

## Key Acceptance Criteria Highlights

### Slice 1a (Schema & Migration)
- Prisma schema updated with Profile (userId FK) and ContextIntent models
- Migration script handles all edge cases (no data, conflicts, unmapped fields)
- Data aggregation correct (merges shared fields, extracts intent per context)
- Verification report generated (counts, conflicts, unmapped fields)
- Rollback plan tested and documented
- No data loss verified

### Slice 1b (Backend API)
- GET/PUT /api/profile endpoints handle shared profile
- GET/PUT /api/profile/intent endpoints handle context-specific intent
- POST /api/chat updates both Profile and ContextIntent
- Completeness scores calculated correctly
- All endpoints require authentication
- Json fields properly serialized/deserialized
- Error handling with clear messages

### Slice 1c (Frontend UI)
- ContextScopeIndicator shows current context and explains data scope
- SharedProfileForm displays all shared fields with save functionality
- ContextIntentForm dynamically renders fields based on contextType
- ChatProfilePanel refactored to show both forms
- Forms validate input and show helpful errors
- Responsive design works on mobile, tablet, desktop
- Accessible (keyboard navigation, screen readers)

## Recommendations

### Implementation Order

**Must follow sequence:**
1. Implement Slice 1a (schema + migration)
2. Deploy Slice 1a to staging
3. Verify migration successful (no data loss)
4. Implement Slice 1b (API refactor)
5. Test API endpoints manually (Postman/curl)
6. Deploy Slice 1b to staging
7. Implement Slice 1c (UI refactor)
8. Manual QA on all 5 contexts
9. Deploy all 3 slices to production together

**Rationale:** Sequential dependencies require this order. Deploying all together avoids backward compatibility issues.

### Testing Strategy

**Slice 1a:**
- Test migration script on local database copy FIRST
- Verify data integrity with SQL queries
- Test rollback procedure
- Dry-run on staging before production

**Slice 1b:**
- Manual API testing with Postman/curl
- Verify database writes with SQL queries
- Test error cases (invalid input, missing auth)
- Verify completeness calculations

**Slice 1c:**
- Manual QA on all 5 contexts (romantic, friendship, professional, creative, service)
- Test responsive design (mobile, tablet, desktop)
- Test accessibility (keyboard, screen reader)
- Test chat integration (messages update both models)

### Risk Mitigation

**Risk 1: Data Loss During Migration**
- **Mitigation:** Backup database, test on staging, keep old tables during transition
- **Severity:** HIGH
- **Status:** Addressed in Slice 1a ticket

**Risk 2: Conflicting Data Across Contexts**
- **Mitigation:** Migration script logs conflicts, takes first non-null value
- **Severity:** MEDIUM
- **Status:** Addressed in Slice 1a ticket

**Risk 3: API Backward Compatibility**
- **Mitigation:** Deploy all slices together, OR add compatibility shim
- **Severity:** MEDIUM
- **Status:** Recommend deploying together

**Risk 4: UI Complexity (620 LOC)**
- **Mitigation:** Use component composition, defer nice-to-haves
- **Severity:** LOW
- **Status:** Slice 1c ticket keeps scope focused

### Potential Alternative Approaches

**Alternative 1: Deploy slices incrementally with feature flag**
- Pros: Can test in production with subset of users
- Cons: More complex, requires feature flag logic
- **Recommendation:** Only if deployment takes >1 week

**Alternative 2: Combine Slices 1a + 1b**
- Pros: Fewer handoffs, single backend deploy
- Cons: 630 LOC (exceeds swarm limit)
- **Recommendation:** Not advised, too large

**Alternative 3: Split Slice 1c into 2 sub-slices (components + pages)**
- Pros: Stays under 400 LOC per slice
- Cons: More coordination overhead
- **Recommendation:** Only if 620 LOC proves too large in practice

## Next Steps

**Immediate actions:**
1. Review all 3 tickets for completeness and clarity
2. Confirm architecture document is final (no changes expected)
3. Activate Backend Specialist to begin Slice 1a
4. Schedule checkpoint after Slice 1a to verify migration success

**After Slice 1a Complete:**
1. Review migration report (conflicts, unmapped fields)
2. Deploy schema changes to staging
3. Run data migration on staging database
4. Verify with SQL queries
5. Activate Backend Specialist for Slice 1b

**After Slice 1b Complete:**
1. Test API endpoints manually (Postman/curl)
2. Verify database writes
3. Deploy API changes to staging
4. Activate Frontend Specialist for Slice 1c

**After Slice 1c Complete:**
1. Manual QA on staging (all 5 contexts)
2. Test responsive design and accessibility
3. User acceptance testing (2-3 real users)
4. Deploy all to production (coordinate all 3 slices)
5. Monitor for errors (Sentry, logs)
6. Collect user feedback

## Summary

Successfully created 3 detailed slice tickets for Option 1 implementation (Single Profile + Context-Specific Intent Fields). Total scope is ~1,250 LOC split across:

- **Slice 1a:** Schema & Data Migration (330 LOC) - Ready to start
- **Slice 1b:** Backend API Refactor (300 LOC) - Blocked until 1a complete
- **Slice 1c:** Frontend UI Refactor (620 LOC) - Blocked until 1b complete

All tickets include:
- Comprehensive acceptance criteria (testable, specific)
- Detailed test plans (unit, integration, manual)
- Edge case handling (no data, conflicts, validation)
- Security considerations (auth, validation, XSS/CSRF prevention)
- Performance considerations (batching, caching, indexing)
- Accessibility requirements (keyboard nav, screen readers)
- Rollback plans (for migration)

**Current Status:** Ready for Backend Specialist to begin Slice 1a (no blockers).

**Success Criteria:**
- All profile data migrated without loss
- API endpoints functional and tested
- UI clearly explains shared vs context-specific fields
- No breaking changes for existing users
- Completeness scores accurate
- Matching queries enforce trust boundaries correctly

**Recommended Next Action:** Activate Backend Specialist role to implement Slice 1a (schema + data migration).
