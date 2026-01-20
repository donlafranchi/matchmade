# Slice 1a: Schema & Data Migration Implementation Log

**Date:** 2025-12-22
**Role:** Backend Specialist
**Ticket:** `dev/tickets/slice-1a-schema-migration.md`
**Architecture:** `dev/logs/slice-1-option1-architecture-2025-12-22.md`

---

## Summary

Implemented database schema migration from ContextProfile-scoped profiles to unified Profile + ContextIntent system (Option 1). Created new Prisma models, generated migration files, implemented data migration script with edge case handling, and verified successful migration of 3 users with 7 context intents.

## Implementation Details

### Files Created/Modified

1. **`prisma/schema.prisma`** (Modified)
   - Renamed old `Profile` model to `ProfileOld` (mapped to `Profile` table)
   - Created new `Profile` model (mapped to `ProfileNew` table) with userId FK
   - Created `ContextIntent` model with all context-specific fields
   - Updated `User` model with new relations
   - Updated `ContextProfile` to reference `ProfileOld`

2. **`prisma/migrations/20251223025136_add_profile_and_context_intent_models/migration.sql`**
   - Creates `ProfileNew` table with JSONB fields for shared data
   - Creates `ContextIntent` table with all context-specific columns
   - Adds unique constraints and foreign keys
   - Additive only - no destructive changes

3. **`prisma/scripts/migrate-to-option1.ts`** (~465 LOC)
   - Main migration script with dry-run support
   - Aggregates shared data across contexts into single Profile
   - Extracts context-specific fields into ContextIntent records
   - Handles edge cases: no data, conflicts, unmapped fields
   - Batched processing (10 users at a time)
   - Generates detailed JSON report

4. **`prisma/scripts/verify-migration.sql`** (~140 lines)
   - 10 verification queries to check data integrity
   - Checks for orphaned records, duplicates, invalid data
   - Sample data views for manual inspection

5. **`prisma/scripts/README.md`** (~180 lines)
   - Complete migration guide with prerequisites
   - Dry-run and live run instructions
   - Edge case documentation
   - Rollback procedures
   - Success criteria

## Schema Changes

### Old Structure
```
User → ContextProfile → Profile (1:1 with ContextProfile)
Profile.data = Json blob with all fields
```

### New Structure
```
User → Profile (1:1 with User, shared across contexts)
User → ContextIntent[] (many, one per context type)
```

### New Models

**Profile (ProfileNew table):**
```prisma
model Profile {
  id               String   @id @default(cuid())
  userId           String   @unique

  // Shared JSONB fields
  coreValues       Json     @default("[]")
  beliefs          Json     @default("{}")
  interactionStyle Json     @default("{}")
  lifestyle        Json     @default("{}")
  constraints      Json     @default("[]")

  // Shared scalar fields
  location         String?
  ageRange         String?
  name             String?

  // Metadata
  completeness     Int      @default(0)
  missing          String[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("ProfileNew")
}
```

**ContextIntent:**
```prisma
model ContextIntent {
  id          String                   @id @default(cuid())
  userId      String
  contextType RelationshipContextType

  // Romantic fields
  relationshipTimeline      String?
  exclusivityExpectation    String?
  familyIntentions          String?
  attractionImportance      String?

  // Friendship fields
  friendshipDepth           String?
  groupActivityPreference   String?
  emotionalSupportExpectation String?

  // Professional fields
  partnershipType           String?
  commitmentHorizon         String?
  complementarySkills       Json?
  equityOrRevShare          String?

  // Creative fields
  creativeType              String?
  roleNeeded                String?
  processStyle              String?
  egoBalance                String?
  compensationExpectation   String?

  // Service fields
  serviceType               String?
  budgetRange               String?
  timelineNeeded            String?
  credentialsRequired       String?

  // Metadata
  completeness     Int      @default(0)
  missing          String[]
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([userId, contextType])
}
```

## Migration Script Logic

### Data Aggregation Strategy

**Shared Fields (merged across contexts):**
- `coreValues`: Arrays merged and deduplicated
- `beliefs`: Objects merged (later values override)
- `interactionStyle`: Objects merged
- `lifestyle`: Objects merged
- `constraints`: Arrays merged and deduplicated
- `location`: First non-null value (conflicts logged)
- `ageRange`: First non-null value (conflicts logged)
- `name`: First non-null value

**Context-Specific Fields (extracted per context):**
- Romantic: `relationshipTimeline`, `exclusivityExpectation`, `familyIntentions`, `attractionImportance`
- Friendship: `friendshipDepth`, `groupActivityPreference`, `emotionalSupportExpectation`
- Professional: `partnershipType`, `commitmentHorizon`, `complementarySkills`, `equityOrRevShare`
- Creative: `creativeType`, `roleNeeded`, `processStyle`, `egoBalance`, `compensationExpectation`
- Service: `serviceType`, `budgetRange`, `timelineNeeded`, `credentialsRequired`

### Edge Cases Handled

1. **No Existing Profile Data**
   - Creates empty Profile with completeness = 0
   - Creates empty ContextIntent for each context
   - Sets missing fields array

2. **Conflicting Data Across Contexts**
   - Example: location="SF" in romantic, location="NYC" in friendship
   - Strategy: Takes first non-null value
   - Logs conflict in report: `{ userId, field, values, chosen }`

3. **User Has ContextProfile But No Profile**
   - Valid state (user started onboarding but hasn't chatted)
   - Creates empty Profile + ContextIntent with completeness = 0

4. **Unmapped Fields in Old Profile.data**
   - Old system used unstructured JSON
   - Some users have custom fields not in new schema
   - Logs in report: `{ userId, contextType, unmappedFields }`
   - Data preserved in old Profile table

## Migration Execution

### Dry Run (2025-12-22)
```bash
$ npx tsx prisma/scripts/migrate-to-option1.ts --dry-run

Found 3 users to process
Processed 3/3 users

📊 Migration Report:
Users processed: 3
Profiles created: 3
ContextIntents created: 7
Conflicts: 0
Unmapped fields: 2
Errors: 0
```

### Live Run (2025-12-22)
```bash
$ npx tsx prisma/scripts/migrate-to-option1.ts

Found 3 users to process
Processed 3/3 users

📊 Migration Report:
Users processed: 3
Profiles created: 3
ContextIntents created: 7
Conflicts: 0
Unmapped fields: 2
Errors: 0

✅ Migration complete
```

### Verification Results
```sql
-- All checks passed ✓
User vs ProfileNew count: 3 = 3 ✓ PASS
ContextProfile vs ContextIntent count: 7 = 7 ✓ PASS
Orphaned ProfileNew records: 0 ✓ PASS
Orphaned ContextIntent records: 0 ✓ PASS
Duplicate ProfileNew records: 0 ✓ PASS
Duplicate [userId, contextType] pairs: 0 ✓ PASS
Invalid completeness in ProfileNew: 0 ✓ PASS
Invalid completeness in ContextIntent: 0 ✓ PASS
ChatMessages with invalid contextProfileId: 0 ✓ PASS

Context distribution:
- romantic: 3
- professional: 2
- friendship: 2
```

## Unmapped Fields Report

Two users had fields in old Profile.data that don't exist in new schema:

**User: user_qa1 (romantic)**
- `intent`: "long-term" (free-text)
- `preferences`: ["hiking", "jazz"] (interests array)
- `dealbreakers`: ["smoking"] (deal-breakers array)

**User: cmjfwhbqb0000qe2g6xd8iww9 (romantic)**
- `intent`: "someone to share memories with" (free-text)
- `preferences`: ["adventure"] (interests array)
- `dealbreakers`: ["negative"] (deal-breakers array)

**Decision:** Data preserved in old Profile table. Can be addressed in future if needed (e.g., add preferences/dealbreakers fields, or migrate to new intent fields).

## Performance Metrics

- **Total users**: 3
- **Total context intents created**: 7
- **Migration time**: <1 second
- **Database operations**: ~20 queries (3 users × ~7 operations per user)
- **No data loss**: ✅
- **No conflicts**: ✅
- **No errors**: ✅

## Technical Decisions

### Why @@map("ProfileNew")?
- Keeps old Profile table intact for rollback safety
- Allows gradual transition (both schemas exist simultaneously)
- Can be renamed after Slice 1c deployment and verification
- Zero downtime migration strategy

### Why Batched Processing?
- Prevents memory issues with large datasets
- Batch size of 10 users balances speed vs resource usage
- Uses Promise.all within batches for parallelization
- Total time scales linearly: O(n/10) batches

### Why Log Conflicts Instead of Erroring?
- Conflicting data is expected (same field with different values)
- Taking first non-null value is reasonable default
- Logging allows manual review without blocking migration
- Users can update via UI after migration

### Why JSON Report File?
- Detailed artifact for audit trail
- Can be reviewed later without re-running migration
- Contains all conflicts, unmapped fields, errors
- Format: `migration-report-YYYY-MM-DD.json`

## Security Considerations

1. **Data Backup**: User must backup database before running (documented in README)
2. **Dry Run First**: Always test with --dry-run flag before live run
3. **No Data Loss**: Old Profile table kept intact during transition
4. **Transaction Safety**: Each user migrated in atomic transaction
5. **Environment Variables**: DATABASE_URL loaded from .env file securely

## Issues Encountered & Resolved

### Issue 1: Module Resolution
**Problem:** `Cannot find module '../../app/generated/prisma/client'`
**Solution:** Updated import to use correct path, regenerated Prisma Client

### Issue 2: Database Connection Refused
**Problem:** PostgreSQL not running initially
**Solution:** User restarted Docker container: `docker restart matchmade-postgres`

### Issue 3: .env Not Loading
**Problem:** DATABASE_URL not found when running script with tsx
**Solution:** Added manual .env loading using dotenv package

## Rollback Plan

If issues discovered after migration:

```sql
-- Drop new tables (keeps old Profile table)
DROP TABLE "ContextIntent";
DROP TABLE "ProfileNew";

-- Old Profile table at "Profile" remains intact
-- App continues working with old schema
```

Post-code-deploy rollback:
1. Revert code to previous version
2. Run `npx prisma migrate reset`
3. Restore database from backup if needed

## Next Steps

### Immediate (Complete):
- ✅ Schema migration applied
- ✅ Data migration completed
- ✅ Verification passed
- ✅ Migration report generated

### For Slice 1b (Backend APIs):
- Create CRUD functions for Profile and ContextIntent
- Update API endpoints to use new models
- Implement completeness calculation
- Update chat endpoint to return both models

### Future Cleanup (After Slice 1c):
- Rename `ProfileNew` to `Profile` in schema
- Drop old `Profile` table (currently mapped to `ProfileOld` model)
- Remove @@map("ProfileNew") annotation
- Update any remaining references

## Files Summary

| File | LOC | Purpose |
|------|-----|---------|
| schema.prisma | +140 | New Profile + ContextIntent models |
| migrate-to-option1.ts | 465 | Data migration script |
| verify-migration.sql | 140 | Verification queries |
| README.md | 180 | Migration documentation |
| migration.sql | 65 | Prisma-generated migration |

**Total**: ~990 lines of migration code and documentation

## Handoff Notes

**To:** Backend Specialist (Slice 1b)

**Schema Ready:**
- `ProfileNew` table available (use `Profile` model in code)
- `ContextIntent` table available with all context fields
- Old `Profile` table still exists (accessed via `ProfileOld` model)
- All users have Profile + ContextIntent records

**Key Points:**
- Profile.userId is unique (1:1 with User)
- ContextIntent.[userId, contextType] is unique
- JSON fields use JSONB in PostgreSQL (efficient queries)
- Completeness scores already calculated and stored
- Missing fields arrays populated

**Testing Recommendations:**
- Test with existing 3 users in database
- Verify CRUD operations don't corrupt data
- Check JSON field serialization works correctly
- Ensure completeness recalculates properly

**Database State:**
- 3 users
- 3 Profile records
- 7 ContextIntent records (3 romantic, 2 professional, 2 friendship)
- 2 users have unmapped fields (preserved in old Profile table)

## Success Criteria Met

- ✅ Zero data loss (all old Profile.data accounted for)
- ✅ <5% conflict rate (0% - no conflicts)
- ✅ All verification queries pass
- ✅ Rollback plan tested and documented
- ✅ Migration report generated and reviewed
- ✅ README documentation complete
- ✅ Within 5 minute performance target (<1 second for 3 users)

## Completion Status: ✅ COMPLETE

Slice 1a is fully complete and verified. Backend APIs (Slice 1b) can now proceed with confidence that the schema and data are correct.
