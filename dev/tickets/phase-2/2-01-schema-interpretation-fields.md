# Phase 2, Ticket 01: Schema Migration - Interpretation Fields

**Mode:** Single-Dev
**Brief:** Phase 2 - Interpretation Engine (from `/dev/vision/profile-as-interpretation.md`)
**Build Order:** Phase 2 Start (after Phase 1 complete)
**Prerequisites:** Slice 1a/1b/1c complete (Profile + ContextIntent models exist)
**Created:** 2025-12-24

---

## Goal

Add interpretation-specific fields to existing Profile and ContextIntent models to support storing LLM-generated therapeutic interpretations, pattern analysis, and metadata for the interpretation engine.

## User Story

As a system architect, I want to add interpretation fields to the database schema so that the system can store therapeutic insights, raw pattern data, and analysis metadata alongside user profile data.

## Acceptance Criteria

- [ ] Profile model includes `interpretations` Json field (default: `{}`)
- [ ] Profile model includes `rawPatterns` Json field (default: `{}`)
- [ ] Profile model includes `lastAnalyzed` DateTime? field (nullable, default: null)
- [ ] ContextIntent model includes `interpretations` Json field (default: `{}`)
- [ ] ContextIntent model includes `rawPatterns` Json field (default: `{}`)
- [ ] ContextIntent model includes `lastAnalyzed` DateTime? field (nullable, default: null)
- [ ] New InterpretationFeedback model created with fields:
  - [ ] id (cuid primary key)
  - [ ] userId (String, FK to User)
  - [ ] interpretationId (String - references path in interpretations JSON)
  - [ ] accurate (Boolean - user marked as accurate/inaccurate)
  - [ ] userCorrection (String? - what user said it should be)
  - [ ] createdAt (DateTime)
- [ ] Prisma migration file generated successfully
- [ ] Migration is additive only (no destructive changes)
- [ ] All existing Profile and ContextIntent records retain existing data
- [ ] Migration applies cleanly to existing database
- [ ] TypeScript types regenerated via `prisma generate`
- [ ] No security vulnerabilities introduced
- [ ] Migration completes within 30 seconds for 1000 users

## Dependencies

### Prerequisites (must exist):
- [x] Profile model exists with userId FK (from Slice 1a)
- [x] ContextIntent model exists with userId + contextType (from Slice 1a)
- [x] User model exists
- [x] Prisma CLI installed and configured

### Blockers (if any):
- None

## Technical Requirements

### Database Changes

**Update Profile Model:**
```prisma
model Profile {
  id               String   @id @default(cuid())
  userId           String   @unique
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Existing shared fields
  coreValues       Json     @default("[]")
  beliefs          Json     @default("{}")
  interactionStyle Json     @default("{}")
  lifestyle        Json     @default("{}")
  constraints      Json     @default("[]")
  location         String?
  ageRange         String?
  name             String?
  completeness     Int      @default(0)
  missing          String[]

  // NEW: Interpretation fields
  interpretations  Json     @default("{}")  // Therapeutic insights
  rawPatterns      Json     @default("{}")  // Word freq, themes, tone
  lastAnalyzed     DateTime?                 // When last analyzed

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@map("ProfileNew")
}
```

**Update ContextIntent Model:**
```prisma
model ContextIntent {
  id          String                   @id @default(cuid())
  userId      String
  contextType RelationshipContextType
  user        User                     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Existing context-specific fields (all nullable)
  // ... romantic, friendship, professional, creative, service fields ...

  // Existing metadata
  completeness     Int      @default(0)
  missing          String[]

  // NEW: Interpretation fields
  interpretations Json     @default("{}")  // Context-specific insights
  rawPatterns     Json     @default("{}")  // Context patterns
  lastAnalyzed    DateTime?                // When last analyzed

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@unique([userId, contextType])
}
```

**New InterpretationFeedback Model:**
```prisma
model InterpretationFeedback {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  interpretationId String   // e.g., "profile.gabor_mate.attachment_style"
  accurate         Boolean  // User marked as accurate/inaccurate
  userCorrection   String?  // What user said it should be
  createdAt        DateTime @default(now())

  @@index([userId])
  @@index([interpretationId])
}
```

**Update User Model:**
```prisma
model User {
  // ... existing fields ...
  profile                Profile?
  contextIntents         ContextIntent[]

  // NEW: Interpretation feedback
  interpretationFeedback InterpretationFeedback[]
}
```

### Example JSON Structures

**Profile.interpretations:**
```json
{
  "frameworks": {
    "gabor_mate": {
      "attachment_style": {
        "primary": "anxious-avoidant",
        "confidence": 0.75,
        "evidence": ["mentions fear of being 'too much'", "desires independence but expresses loneliness"],
        "insight": "You seem to want closeness but protect yourself from vulnerability..."
      },
      "underlying_needs": {
        "primary": ["safety", "authenticity", "acceptance"],
        "confidence": 0.85,
        "evidence": ["repeated use of 'authentic', 'safe space', 'accepted for who I am'"]
      }
    }
  },
  "summary": "You value deep emotional connection and authenticity...",
  "generated_at": "2025-12-24T10:30:00Z",
  "version": "1.0"
}
```

**Profile.rawPatterns:**
```json
{
  "word_frequency": {
    "authentic": 12,
    "safe": 8,
    "connection": 15,
    "vulnerable": 6
  },
  "themes": ["authenticity", "emotional_safety", "growth"],
  "tone": "reflective",
  "message_count": 45,
  "analyzed_at": "2025-12-24T10:30:00Z"
}
```

**ContextIntent.interpretations (romantic context):**
```json
{
  "frameworks": {
    "esther_perel": {
      "desire_paradox": {
        "tension": "security vs novelty",
        "confidence": 0.65,
        "evidence": ["wants 'stable' but also 'spontaneous'"],
        "insight": "You're navigating the paradox of wanting both security and excitement..."
      }
    }
  },
  "summary": "In romantic relationships, you value stability while staying open to spontaneity...",
  "generated_at": "2025-12-24T10:30:00Z",
  "version": "1.0"
}
```

### Integration Points

- Connects to existing Profile and ContextIntent models
- InterpretationFeedback connects to User model
- No changes to ChatMessage, ContextProfile, or other existing models
- Backward compatible: existing records get default empty Json objects

## Constraints

- ≤ 150 LOC (schema changes only)
- ≤ 0 new dependencies (Prisma already installed)
- ≤ 3 new database fields per model (interpretations, rawPatterns, lastAnalyzed)
- ≤ 1 new database table (InterpretationFeedback)
- Must be additive only (no breaking changes)
- Must maintain backward compatibility

## Test Plan

### Unit Tests

N/A for schema migration (integration/manual testing only)

### Integration Tests

- Test Prisma migration generation:
  ```bash
  npx prisma migrate dev --name add_interpretation_fields
  ```
  - Verify migration file created in `prisma/migrations/`
  - Verify migration SQL includes all new fields
  - Verify migration includes InterpretationFeedback table creation

- Test Prisma client generation:
  ```bash
  npx prisma generate
  ```
  - Verify TypeScript types include new fields
  - Verify `interpretations` typed as `Prisma.JsonValue`
  - Verify `lastAnalyzed` typed as `Date | null`

### Manual Testing Checklist

- [ ] Run migration on local development database:
  ```bash
  npx prisma migrate dev --name add_interpretation_fields
  ```
- [ ] Verify migration completes without errors
- [ ] Check database schema:
  ```sql
  \d "ProfileNew"
  -- Verify interpretations, rawPatterns, lastAnalyzed columns exist

  \d "ContextIntent"
  -- Verify interpretations, rawPatterns, lastAnalyzed columns exist

  \d "InterpretationFeedback"
  -- Verify table exists with all columns
  ```
- [ ] Test reading existing Profile records:
  ```typescript
  const profile = await prisma.profile.findUnique({ where: { userId: 'test' } });
  console.log(profile.interpretations); // Should be {}
  console.log(profile.lastAnalyzed);     // Should be null
  ```
- [ ] Test writing to new fields:
  ```typescript
  await prisma.profile.update({
    where: { userId: 'test' },
    data: {
      interpretations: { frameworks: { gabor_mate: { test: 'value' } } },
      rawPatterns: { word_frequency: { test: 5 } },
      lastAnalyzed: new Date()
    }
  });
  ```
- [ ] Test creating InterpretationFeedback:
  ```typescript
  await prisma.interpretationFeedback.create({
    data: {
      userId: 'test',
      interpretationId: 'profile.gabor_mate.attachment_style',
      accurate: false,
      userCorrection: 'This is not quite right...'
    }
  });
  ```
- [ ] Verify all existing tests still pass after schema change
- [ ] Run TypeScript compilation: `npm run build` (should succeed)

### Product Validation

- [ ] No user-facing changes in this ticket (schema only)
- [ ] No security vulnerabilities introduced (same auth model)
- [ ] Data integrity maintained (all existing data preserved)
- [ ] Rollback plan: Drop new fields/table, revert migration

## Readiness

- [x] All dependencies met and verified
- [x] No blockers
- [x] Technical requirements clearly defined
- [x] Test plan comprehensive
- [x] Prerequisites from Phase 1 complete

## Implementation Notes

### Critical Details

**Migration Strategy:**
- Additive only: No existing fields removed or modified
- Default values ensure backward compatibility
- Json fields default to empty objects `{}`
- lastAnalyzed defaults to null (no analysis yet)

**Performance Considerations:**
- Json fields are indexed efficiently in PostgreSQL
- lastAnalyzed can be indexed if needed for query performance
- InterpretationFeedback should have indices on userId and interpretationId for fast lookups

**Security Considerations:**
- InterpretationFeedback.userId validated against authenticated user
- Interpretations should never be shared across users
- userCorrection field may contain sensitive data (treat like chat content)

**JSON Schema Validation:**
- Consider adding JSON schema validation in application layer
- Version field in interpretations allows for schema evolution
- Unknown fields in interpretations Json are preserved (forward compatible)

### Verification Queries

```sql
-- After migration, verify:

-- 1. All Profile records have default empty interpretations
SELECT COUNT(*) FROM "ProfileNew" WHERE interpretations::text = '{}';

-- 2. All ContextIntent records have default empty interpretations
SELECT COUNT(*) FROM "ContextIntent" WHERE interpretations::text = '{}';

-- 3. All lastAnalyzed fields are null initially
SELECT COUNT(*) FROM "ProfileNew" WHERE lastAnalyzed IS NOT NULL;
SELECT COUNT(*) FROM "ContextIntent" WHERE lastAnalyzed IS NOT NULL;

-- 4. InterpretationFeedback table exists and is empty
SELECT COUNT(*) FROM "InterpretationFeedback";
```

## Next Steps

After this ticket is complete:
1. Verify migration applied successfully
2. Regenerate Prisma client types
3. Update TypeScript types in application code if needed
4. **Proceed to Ticket 2-02:** MVP Interpretation Pipeline (Gabor Maté analysis)
5. Keep schema flexible for additional frameworks in later tickets

## Migration Rollback Plan

If migration fails or issues discovered:

1. **Immediate Rollback (before code deploy):**
   ```bash
   npx prisma migrate reset
   # Or manually:
   ALTER TABLE "ProfileNew" DROP COLUMN interpretations;
   ALTER TABLE "ProfileNew" DROP COLUMN rawPatterns;
   ALTER TABLE "ProfileNew" DROP COLUMN lastAnalyzed;
   ALTER TABLE "ContextIntent" DROP COLUMN interpretations;
   ALTER TABLE "ContextIntent" DROP COLUMN rawPatterns;
   ALTER TABLE "ContextIntent" DROP COLUMN lastAnalyzed;
   DROP TABLE "InterpretationFeedback";
   ```

2. **Revert Migration:**
   ```bash
   # Find migration file in prisma/migrations/
   # Delete migration folder
   # Run: npx prisma migrate resolve --rolled-back <migration-name>
   ```

**Success Criteria for Proceeding:**
- Migration applies cleanly
- All verification queries pass
- Existing tests still pass
- TypeScript compilation succeeds
- No errors in application logs
