# Migration Scripts for Option 1 Implementation

## Overview

This directory contains scripts for migrating from the old ContextProfile-scoped profile system to the new unified Profile + ContextIntent system (Option 1).

## Files

- **`migrate-to-option1.ts`**: Data migration script that transforms old profile data into the new schema
- **`verify-migration.sql`**: SQL queries to verify the migration was successful
- **`README.md`**: This file

## Prerequisites

Before running the migration:

1. **Backup your database**: Always backup before running migrations
   ```bash
   pg_dump -U your_user -d matchmade > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Ensure the schema migration is applied**:
   ```bash
   npx prisma migrate dev
   ```

3. **Database must be running**: The PostgreSQL database should be accessible at the connection string specified in `DATABASE_URL`

## Running the Migration

### Step 1: Dry Run (Recommended First)

Always run a dry-run first to see what would happen without making any changes:

```bash
npx tsx prisma/scripts/migrate-to-option1.ts --dry-run
```

This will:
- Process all users
- Show what would be migrated
- Generate a report of conflicts and unmapped fields
- **NOT** write any data to the database

Review the generated report at `migration-report-YYYY-MM-DD.json` to check for:
- Data conflicts (same field with different values across contexts)
- Unmapped fields (fields in old profiles that don't map to new schema)
- Any errors

### Step 2: Live Run

Once you've reviewed the dry-run report and everything looks good:

```bash
npx tsx prisma/scripts/migrate-to-option1.ts
```

This will:
- Process all users in batches of 10
- Create one Profile record per user
- Create one ContextIntent record per context per user
- Generate a detailed migration report

### Step 3: Verify

After the migration completes, verify data integrity:

```bash
psql -U your_user -d matchmade -f prisma/scripts/verify-migration.sql
```

All checks should show `✓ PASS`. If any show `✗ FAIL`, investigate before proceeding.

## Migration Details

### What Gets Migrated

**Shared fields** (aggregated across all contexts into single Profile):
- `coreValues`: Arrays are merged and deduplicated
- `beliefs`: Objects are merged
- `interactionStyle`: Objects are merged
- `lifestyle`: Objects are merged
- `constraints`: Arrays are merged and deduplicated
- `location`: First non-null value (conflicts logged)
- `ageRange`: First non-null value (conflicts logged)
- `name`: First non-null value

**Context-specific fields** (extracted per context into ContextIntent):
- Romantic: `relationshipTimeline`, `exclusivityExpectation`, `familyIntentions`, `attractionImportance`
- Friendship: `friendshipDepth`, `groupActivityPreference`, `emotionalSupportExpectation`
- Professional: `partnershipType`, `commitmentHorizon`, `complementarySkills`, `equityOrRevShare`
- Creative: `creativeType`, `roleNeeded`, `processStyle`, `egoBalance`, `compensationExpectation`
- Service: `serviceType`, `budgetRange`, `timelineNeeded`, `credentialsRequired`

### Edge Cases Handled

1. **No existing profile data**: Creates empty Profile and ContextIntent records with `completeness = 0`
2. **Conflicting data across contexts**: Takes first non-null value, logs conflict in report
3. **User has ContextProfile but no Profile**: Creates empty records (valid state)
4. **Unmapped fields in old Profile.data**: Logs in report for manual review

### Performance

- Processes users in batches of 10
- Uses Prisma transactions for atomicity per user
- Should complete in <5 minutes for 1000 users

## Rollback

If something goes wrong:

### Immediate Rollback (before code changes deployed)

```sql
-- Drop new tables
DROP TABLE "ContextIntent";
DROP TABLE "ProfileNew";

-- Old Profile table remains intact at "Profile"
-- App continues working with old schema
```

### Post-Code-Deploy Rollback

1. Revert code to previous version
2. Run Prisma migration rollback: `npx prisma migrate reset`
3. Restore database from backup if needed

## Migration Report

The script generates a JSON report containing:

```json
{
  "usersProcessed": 123,
  "profilesCreated": 123,
  "contextIntentsCreated": 456,
  "conflicts": [
    {
      "userId": "...",
      "field": "location",
      "values": ["SF", "NYC"],
      "chosen": "SF"
    }
  ],
  "unmappedFields": [
    {
      "userId": "...",
      "contextType": "romantic",
      "fields": {
        "customField": "value"
      }
    }
  ],
  "errors": []
}
```

Review this report carefully:
- **Conflicts**: Decide if the "chosen" value is appropriate, or if manual intervention is needed
- **Unmapped fields**: Check if any important data was missed
- **Errors**: Investigate and fix before proceeding

## Success Criteria

Before proceeding to Slice 1b:

- ✅ Zero data loss (all old Profile.data accounted for)
- ✅ <5% conflict rate (logged and reviewable)
- ✅ All verification queries pass
- ✅ Rollback plan tested and ready
- ✅ Migration report reviewed and approved

## Next Steps

After successful migration verification:

1. Deploy Slice 1b (Backend API refactor) - See `dev/tickets/slice-1b-backend-api.md`
2. Keep old Profile table until Slice 1c is fully deployed and verified
3. Once all slices are stable, clean up: `ALTER TABLE "ProfileNew" RENAME TO "Profile"; DROP TABLE "ProfileOld";`
