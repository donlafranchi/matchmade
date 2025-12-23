# Slice 1a: Schema & Data Migration

**Mode:** Swarm
**Brief:** N/A (Refactor - Option 1 Implementation)
**Build Order:** 3/10 (Refactoring Brief 3)
**Architecture:** `dev/logs/slice-1-option1-architecture-2025-12-22.md`
**Created:** 2025-12-22

---

## Goal

Migrate the database schema from ContextProfile-scoped profiles to a single unified Profile per user with context-specific ContextIntent records. This additive migration creates new models, migrates existing data without loss, and verifies integrity before enabling the new API layer.

## User Story

As a developer, I want to migrate profile data from the old ContextProfile-scoped system to the new unified Profile + ContextIntent system so that we can support shared profile data across contexts while maintaining context-specific intent fields.

## Acceptance Criteria

- [ ] Prisma schema updated with new Profile model (userId FK, not contextProfileId)
- [ ] Prisma schema includes ContextIntent model with all context-specific fields
- [ ] Profile model includes: coreValues, beliefs, interactionStyle, lifestyle, constraints (Json fields)
- [ ] Profile model includes: location, ageRange (scalar fields)
- [ ] ContextIntent model includes all 5 context types' fields (romantic, friendship, professional, creative, service)
- [ ] ContextIntent has composite unique key on [userId, contextType]
- [ ] Prisma migration file generated successfully (additive only, no destructive changes)
- [ ] Data migration script created in `prisma/scripts/migrate-to-option1.ts`
- [ ] Migration script handles all edge cases:
  - [ ] Users with no existing Profile data
  - [ ] Users with conflicting data across contexts (logs conflicts)
  - [ ] Users with contextProfile but no Profile record
  - [ ] Users with unmapped fields in old Profile.data Json blob
- [ ] Migration script aggregates shared data correctly:
  - [ ] location: takes first non-null value
  - [ ] ageRange: takes first non-null value
  - [ ] coreValues: merges unique values from all contexts
  - [ ] beliefs: merges objects from all contexts
  - [ ] interactionStyle: merges objects from all contexts
  - [ ] lifestyle: merges objects from all contexts
  - [ ] constraints: merges unique values from all contexts
- [ ] Migration script extracts context-specific fields into ContextIntent per context
- [ ] Migration script calculates completeness scores for Profile and ContextIntent
- [ ] Migration script generates verification report (data counts, conflicts, unmapped fields)
- [ ] Dry-run test completed on local database copy
- [ ] All existing chat messages remain linked to correct contextProfileId
- [ ] No data loss verified (all old Profile.data fields accounted for)
- [ ] Rollback plan documented (keep old Profile table, feature flag ready)
- [ ] Interface feels easy and natural (gets out of the way)
- [ ] No security vulnerabilities introduced
- [ ] Migration completes within 5 minutes for 1000 users

## Dependencies

### Prerequisites (must exist):
- [ ] Current Prisma schema with User, ContextProfile, Profile models exists
- [ ] Node.js environment with Prisma CLI installed
- [ ] Local database copy available for testing
- [ ] Backup of production database available

### Blockers (if any):
- None

## Technical Requirements

### Database Changes

**New Models:**

```prisma
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

  // Legacy field (for backward compatibility during migration)
  name             String?

  // Metadata
  completeness     Int             @default(0)
  missing          String[]
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
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
```

**User Model Updates:**
```prisma
model User {
  // ... existing fields ...

  // Single profile per user (shared across contexts)
  profile         Profile?

  // Context-specific intents
  contextIntents  ContextIntent[]
}
```

**Migration Script Structure:**

File: `prisma/scripts/migrate-to-option1.ts`

```typescript
import { PrismaClient } from '@prisma/client';

async function migrateProfileData() {
  // 1. Load all users with contextProfiles and profiles
  // 2. For each user:
  //    - Aggregate shared data from all Profile.data blobs
  //    - Create single Profile record
  //    - Extract context-specific fields for each context
  //    - Create ContextIntent records
  // 3. Generate verification report
  // 4. Log conflicts and unmapped fields
}

function aggregateSharedData(contextProfiles) {
  // Merge coreValues, beliefs, interactionStyle, lifestyle, constraints
  // Take first non-null for location, ageRange
  // Log conflicts
}

function extractContextIntent(contextType, profileData) {
  // Map old Profile.data fields to ContextIntent fields
  // Handle context-specific field extraction
}

function calculateSharedCompleteness(profileData) {
  // Calculate % of required shared fields filled
}

function calculateIntentCompleteness(contextType, intentData) {
  // Calculate % of required context-specific fields filled
}
```

### Integration Points

- Connects to existing User model via userId foreign key
- Preserves ContextProfile records (needed for tonePreference and chat history)
- ChatMessage.contextProfileId remains unchanged
- Old Profile records remain in database during transition (not dropped)

## Constraints

- ≤ 330 LOC per slice
- ≤ 2 new dependencies (should be 0 - only using existing Prisma)
- ≤ 2 new database tables (Profile with userId, ContextIntent)
- Must be additive only (no destructive changes in initial migration)
- Must maintain backward compatibility during transition
- Must complete migration within reasonable time (<5 min for 1000 users)
- Must log all conflicts and data issues for review

## Test Plan

### Unit Tests

- Test `aggregateSharedData()` with:
  - Empty contextProfiles array → returns defaults
  - Single contextProfile with complete data → returns that data
  - Multiple contextProfiles with non-conflicting data → merges correctly
  - Multiple contextProfiles with conflicting data → logs conflict, takes first non-null
  - Multiple contextProfiles with arrays (coreValues) → de-duplicates correctly

- Test `extractContextIntent()` with:
  - Romantic context + valid Profile.data → extracts relationshipTimeline, exclusivityExpectation, etc.
  - Friendship context + valid Profile.data → extracts friendshipDepth, groupActivityPreference, etc.
  - Professional context + valid Profile.data → extracts partnershipType, commitmentHorizon, etc.
  - Creative context + valid Profile.data → extracts creativeType, roleNeeded, etc.
  - Service context + valid Profile.data → extracts serviceType, budgetRange, etc.
  - Unknown context type → returns empty object
  - Missing Profile.data → returns empty object

- Test `calculateSharedCompleteness()` with:
  - Empty profile → returns 0
  - Fully complete profile → returns 100
  - Partially complete profile → returns correct percentage

- Test `calculateIntentCompleteness()` with:
  - Empty intent → returns 0
  - Fully complete intent for each context type → returns 100
  - Partially complete intent → returns correct percentage

### Integration Tests

- Test Prisma migration:
  - Run `prisma migrate dev` → migration file generated
  - Migration applies cleanly to empty database
  - Migration applies cleanly to database with existing data
  - Migration is reversible (can roll back)

- Test data migration script:
  - Run on empty database → creates no records, no errors
  - Run on database with 1 user, 1 contextProfile, 1 profile → creates 1 Profile, 1 ContextIntent
  - Run on database with 1 user, 3 contextProfiles → creates 1 Profile, 3 ContextIntents
  - Run on database with multiple users → all users migrated correctly
  - Verification report generated with correct counts

### Manual Testing Checklist

- [ ] Clone production database to local environment
- [ ] Run migration script in dry-run mode (no writes)
- [ ] Review generated report for conflicts and unmapped fields
- [ ] Run migration script in write mode
- [ ] Verify using SQL queries:
  ```sql
  -- Count of new Profile records should equal count of Users
  SELECT COUNT(*) FROM Profile;
  SELECT COUNT(*) FROM User;

  -- Count of ContextIntent records should equal count of ContextProfiles
  SELECT COUNT(*) FROM ContextIntent;
  SELECT COUNT(*) FROM ContextProfile;

  -- Check for orphaned records
  SELECT * FROM Profile WHERE userId NOT IN (SELECT id FROM User);
  SELECT * FROM ContextIntent WHERE userId NOT IN (SELECT id FROM User);

  -- Sample data checks
  SELECT * FROM Profile LIMIT 5;
  SELECT * FROM ContextIntent WHERE contextType = 'romantic' LIMIT 5;
  ```
- [ ] Check ChatMessage records still linked correctly (contextProfileId intact)
- [ ] Review migration logs for conflicts
- [ ] Test rollback: drop new tables, verify old data intact
- [ ] Run migration again on fresh copy to verify idempotency

### Product Validation

- [ ] No user-facing changes in this slice (backend only)
- [ ] No security vulnerabilities introduced (same auth model)
- [ ] Data integrity maintained (all old data preserved or migrated)
- [ ] Rollback plan tested and documented

## Readiness

- [x] All dependencies met and verified (existing Prisma schema)
- [x] Architecture exists and reviewed (see Architecture §1-2)
- [x] No blockers
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive

## Implementation Notes

### Critical Details from Architecture (§2.2-2.3)

**Migration Phases:**
1. **Additive First:** New models added without touching old ones (zero downtime)
2. **Data Migration:** Script runs offline or during maintenance window
3. **Code Deployment:** Backend API switches to new models (Slice 1b)
4. **Cleanup:** Old Profile.contextProfileId dropped after verification (later)

**Edge Case Handling:**

1. **No Existing Profile Data:**
   - Create empty Profile with userId
   - Create empty ContextIntent for each contextType user has selected
   - completeness = 0, missing = all required fields

2. **Conflicting Data Across Contexts:**
   - Example: User has location="SF" in romantic, location="NYC" in friendship
   - Strategy: Take first non-null value encountered
   - **MUST LOG:** `{ userId, field: "location", values: ["SF", "NYC"], chosen: "SF" }`
   - Future: Could add UI to let user choose or override per context

3. **User Has ContextProfile But No Profile:**
   - This is valid (user started onboarding but hasn't chatted yet)
   - Create empty Profile + ContextIntent records
   - No error, just completeness = 0

4. **Unmapped Fields in Old Profile.data:**
   - Old system used unstructured Json blobs
   - Some users might have custom fields not in new schema
   - **MUST LOG:** `{ userId, contextType, unmappedFields: { oldFieldName: value } }`
   - Consider adding `Profile.legacyData` Json field temporarily for manual review

**Performance Considerations:**

- For large datasets (>1000 users), use batching:
  ```typescript
  const batchSize = 100;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await Promise.all(batch.map(user => migrateUser(user)));
  }
  ```
- Use Prisma transactions for atomicity per user
- Consider running migration in background job (not during request)

**Security Considerations:**

- No auth changes (same user can only access their own data)
- Ensure migration script uses service account with proper permissions
- Backup database before running migration in production
- Run migration on staging first

**Verification Queries:**

```sql
-- After migration, these should be true:
-- 1. Every user has exactly one Profile
SELECT userId, COUNT(*) FROM Profile GROUP BY userId HAVING COUNT(*) > 1;

-- 2. Every ContextIntent has a valid userId and contextType
SELECT * FROM ContextIntent WHERE userId NOT IN (SELECT id FROM User);

-- 3. No duplicate [userId, contextType] pairs
SELECT userId, contextType, COUNT(*) FROM ContextIntent
GROUP BY userId, contextType HAVING COUNT(*) > 1;

-- 4. Completeness scores are valid (0-100)
SELECT * FROM Profile WHERE completeness < 0 OR completeness > 100;
SELECT * FROM ContextIntent WHERE completeness < 0 OR completeness > 100;
```

## Next Steps

After this slice is complete:
1. Review migration report for conflicts and unmapped fields
2. Deploy schema changes to staging environment
3. Run data migration script on staging database
4. Verify data integrity using verification queries
5. **Activate Slice 1b:** Backend API refactor (depends on this slice)
6. Keep old Profile table until Slice 1c fully deployed and verified
7. Document rollback procedure (drop new tables, revert schema)

## Migration Rollback Plan

If migration fails or data issues discovered:

1. **Immediate Rollback (before code deploy):**
   - Drop new Profile table: `DROP TABLE Profile;`
   - Drop new ContextIntent table: `DROP TABLE ContextIntent;`
   - Old data remains intact, app continues using old schema
   - No code changes needed

2. **Post-Code-Deploy Rollback:**
   - Revert code to previous version
   - Drop new tables
   - Run Prisma migration rollback: `prisma migrate reset`
   - Restore database from backup if needed

3. **Partial Migration Rollback:**
   - If only some users migrated incorrectly
   - Delete affected Profile/ContextIntent records
   - Re-run migration script for those users only
   - Use `WHERE userId IN (...)` filters

**Success Criteria for Proceeding:**
- Zero data loss (all old Profile.data accounted for)
- <5% conflict rate (logged and reviewable)
- All verification queries pass
- Staging environment tested successfully
- Rollback plan tested and ready
