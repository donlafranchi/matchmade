/**
 * Data Migration Script: Option 1 (Single Profile + Context-Specific Intent Fields)
 *
 * This script migrates profile data from the old ContextProfile-scoped system
 * to the new unified Profile + ContextIntent system.
 *
 * Run with: npx tsx prisma/scripts/migrate-to-option1.ts [--dry-run]
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from project root
config({ path: resolve(__dirname, '../../.env') });

import { PrismaClient, RelationshipContextType } from '../../app/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface MigrationReport {
  usersProcessed: number;
  profilesCreated: number;
  contextIntentsCreated: number;
  conflicts: Array<{
    userId: string;
    field: string;
    values: any[];
    chosen: any;
  }>;
  unmappedFields: Array<{
    userId: string;
    contextType: RelationshipContextType;
    fields: Record<string, any>;
  }>;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

const report: MigrationReport = {
  usersProcessed: 0,
  profilesCreated: 0,
  contextIntentsCreated: 0,
  conflicts: [],
  unmappedFields: [],
  errors: [],
};

// Fields that are shared across contexts
const SHARED_FIELDS = [
  'coreValues',
  'beliefs',
  'interactionStyle',
  'lifestyle',
  'constraints',
  'location',
  'ageRange',
  'name',
];

// Context-specific fields mapping
const CONTEXT_INTENT_FIELDS: Record<RelationshipContextType, string[]> = {
  romantic: [
    'relationshipTimeline',
    'exclusivityExpectation',
    'familyIntentions',
    'attractionImportance',
  ],
  friendship: [
    'friendshipDepth',
    'groupActivityPreference',
    'emotionalSupportExpectation',
  ],
  professional: [
    'partnershipType',
    'commitmentHorizon',
    'complementarySkills',
    'equityOrRevShare',
  ],
  creative: [
    'creativeType',
    'roleNeeded',
    'processStyle',
    'egoBalance',
    'compensationExpectation',
  ],
  service: [
    'serviceType',
    'budgetRange',
    'timelineNeeded',
    'credentialsRequired',
  ],
};

/**
 * Aggregate shared data from multiple Profile records
 * Takes first non-null value for scalars, merges arrays/objects
 */
function aggregateSharedData(profileDataList: Array<{ contextType: RelationshipContextType; data: any }>) {
  const aggregated: any = {
    coreValues: [],
    beliefs: {},
    interactionStyle: {},
    lifestyle: {},
    constraints: [],
    location: null,
    ageRange: null,
    name: null,
  };

  for (const { contextType, data } of profileDataList) {
    if (!data || typeof data !== 'object') continue;

    // Handle coreValues (array - merge and deduplicate)
    if (Array.isArray(data.coreValues)) {
      aggregated.coreValues = Array.from(new Set([...aggregated.coreValues, ...data.coreValues]));
    }

    // Handle constraints (array - merge and deduplicate)
    if (Array.isArray(data.constraints)) {
      aggregated.constraints = Array.from(new Set([...aggregated.constraints, ...data.constraints]));
    }

    // Handle beliefs (object - merge)
    if (data.beliefs && typeof data.beliefs === 'object') {
      aggregated.beliefs = { ...aggregated.beliefs, ...data.beliefs };
    }

    // Handle interactionStyle (object - merge)
    if (data.interactionStyle && typeof data.interactionStyle === 'object') {
      aggregated.interactionStyle = { ...aggregated.interactionStyle, ...data.interactionStyle };
    }

    // Handle lifestyle (object - merge)
    if (data.lifestyle && typeof data.lifestyle === 'object') {
      aggregated.lifestyle = { ...aggregated.lifestyle, ...data.lifestyle };
    }

    // Handle scalar fields (take first non-null)
    if (data.location && !aggregated.location) {
      aggregated.location = data.location;
    } else if (data.location && aggregated.location !== data.location) {
      // Log conflict
      report.conflicts.push({
        userId: '', // Will be filled by caller
        field: 'location',
        values: [aggregated.location, data.location],
        chosen: aggregated.location,
      });
    }

    if (data.ageRange && !aggregated.ageRange) {
      aggregated.ageRange = data.ageRange;
    } else if (data.ageRange && aggregated.ageRange !== data.ageRange) {
      report.conflicts.push({
        userId: '',
        field: 'ageRange',
        values: [aggregated.ageRange, data.ageRange],
        chosen: aggregated.ageRange,
      });
    }

    if (data.name && !aggregated.name) {
      aggregated.name = data.name;
    }
  }

  return aggregated;
}

/**
 * Extract context-specific intent fields from profile data
 */
function extractContextIntent(contextType: RelationshipContextType, profileData: any) {
  if (!profileData || typeof profileData !== 'object') {
    return {};
  }

  const intentFields = CONTEXT_INTENT_FIELDS[contextType] || [];
  const extracted: any = {};
  const unmapped: any = {};

  for (const [key, value] of Object.entries(profileData)) {
    if (SHARED_FIELDS.includes(key)) {
      // Skip shared fields
      continue;
    } else if (intentFields.includes(key)) {
      // This is a context-specific field
      extracted[key] = value;
    } else {
      // Unmapped field
      unmapped[key] = value;
    }
  }

  return { extracted, unmapped };
}

/**
 * Calculate completeness score for shared profile
 */
function calculateSharedCompleteness(profileData: any): { completeness: number; missing: string[] } {
  const requiredFields = ['coreValues', 'location', 'ageRange'];
  const optionalFields = ['beliefs', 'interactionStyle', 'lifestyle', 'constraints'];

  let filled = 0;
  let total = requiredFields.length;
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = profileData[field];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        filled++;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        filled++;
      } else if (typeof value === 'string' && value.length > 0) {
        filled++;
      } else {
        missing.push(field);
      }
    } else {
      missing.push(field);
    }
  }

  // Optional fields count as 0.5 each
  for (const field of optionalFields) {
    const value = profileData[field];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        filled += 0.5;
        total += 0.5;
      } else if (typeof value === 'object' && Object.keys(value).length > 0) {
        filled += 0.5;
        total += 0.5;
      }
    }
  }

  const completeness = total > 0 ? Math.round((filled / total) * 100) : 0;
  return { completeness, missing };
}

/**
 * Calculate completeness score for context-specific intent
 */
function calculateIntentCompleteness(
  contextType: RelationshipContextType,
  intentData: any
): { completeness: number; missing: string[] } {
  const requiredFields = CONTEXT_INTENT_FIELDS[contextType] || [];
  let filled = 0;
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = intentData[field];
    if (value !== null && value !== undefined) {
      if (Array.isArray(value) && value.length > 0) {
        filled++;
      } else if (typeof value === 'string' && value.length > 0) {
        filled++;
      } else {
        missing.push(field);
      }
    } else {
      missing.push(field);
    }
  }

  const completeness = requiredFields.length > 0 ? Math.round((filled / requiredFields.length) * 100) : 0;
  return { completeness, missing };
}

/**
 * Migrate a single user's profile data
 */
async function migrateUser(userId: string, dryRun: boolean) {
  try {
    // Fetch all context profiles and their profiles for this user
    const contextProfiles = await prisma.contextProfile.findMany({
      where: { userId },
      include: {
        profileOld: true,
      },
    });

    if (contextProfiles.length === 0) {
      // User has no context profiles - skip
      return;
    }

    // Aggregate shared data from all profiles
    const profileDataList = contextProfiles
      .filter((cp) => cp.profileOld)
      .map((cp) => ({
        contextType: cp.contextType,
        data: cp.profileOld!.data,
      }));

    const aggregatedData = aggregateSharedData(profileDataList);

    // Fix userId in conflicts
    report.conflicts
      .filter((c) => c.userId === '')
      .forEach((c) => {
        c.userId = userId;
      });

    // Calculate completeness for shared profile
    const { completeness: sharedCompleteness, missing: sharedMissing } = calculateSharedCompleteness(aggregatedData);

    // Create unified Profile record
    if (!dryRun) {
      await prisma.profile.create({
        data: {
          userId,
          coreValues: aggregatedData.coreValues,
          beliefs: aggregatedData.beliefs,
          interactionStyle: aggregatedData.interactionStyle,
          lifestyle: aggregatedData.lifestyle,
          constraints: aggregatedData.constraints,
          location: aggregatedData.location,
          ageRange: aggregatedData.ageRange,
          name: aggregatedData.name,
          completeness: sharedCompleteness,
          missing: sharedMissing,
        },
      });
    }
    report.profilesCreated++;

    // Extract and create ContextIntent records for each context
    for (const cp of contextProfiles) {
      const profileData = cp.profileOld?.data;
      if (!profileData) {
        // No profile data - create empty intent
        const { completeness, missing } = calculateIntentCompleteness(cp.contextType, {});
        if (!dryRun) {
          await prisma.contextIntent.create({
            data: {
              userId,
              contextType: cp.contextType,
              completeness,
              missing,
            },
          });
        }
        report.contextIntentsCreated++;
        continue;
      }

      const { extracted, unmapped } = extractContextIntent(cp.contextType, profileData);

      // Log unmapped fields
      if (Object.keys(unmapped).length > 0) {
        report.unmappedFields.push({
          userId,
          contextType: cp.contextType,
          fields: unmapped,
        });
      }

      // Calculate completeness
      const { completeness, missing } = calculateIntentCompleteness(cp.contextType, extracted);

      // Create ContextIntent record
      if (!dryRun) {
        await prisma.contextIntent.create({
          data: {
            userId,
            contextType: cp.contextType,
            ...extracted,
            completeness,
            missing,
          },
        });
      }
      report.contextIntentsCreated++;
    }

    report.usersProcessed++;
  } catch (error: any) {
    report.errors.push({
      userId,
      error: error.message,
    });
  }
}

/**
 * Main migration function
 */
async function migrate(dryRun: boolean) {
  console.log(`\n🚀 Starting migration (${dryRun ? 'DRY RUN' : 'LIVE RUN'})...\n`);

  // Fetch all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true },
  });

  console.log(`Found ${users.length} users to process\n`);

  // Process users in batches
  const batchSize = 10;
  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize);
    await Promise.all(batch.map((user) => migrateUser(user.id, dryRun)));
    console.log(`Processed ${Math.min(i + batchSize, users.length)}/${users.length} users`);
  }

  // Print report
  console.log('\n📊 Migration Report:\n');
  console.log(`Users processed: ${report.usersProcessed}`);
  console.log(`Profiles created: ${report.profilesCreated}`);
  console.log(`ContextIntents created: ${report.contextIntentsCreated}`);
  console.log(`\nConflicts: ${report.conflicts.length}`);
  if (report.conflicts.length > 0) {
    console.log('\n⚠️  Data conflicts detected:');
    report.conflicts.slice(0, 10).forEach((c) => {
      console.log(`  - User ${c.userId}: ${c.field} = ${c.values.join(' vs ')} (chose ${c.chosen})`);
    });
    if (report.conflicts.length > 10) {
      console.log(`  ... and ${report.conflicts.length - 10} more`);
    }
  }

  console.log(`\nUnmapped fields: ${report.unmappedFields.length}`);
  if (report.unmappedFields.length > 0) {
    console.log('\n⚠️  Unmapped fields detected:');
    report.unmappedFields.slice(0, 10).forEach((u) => {
      console.log(`  - User ${u.userId} (${u.contextType}): ${Object.keys(u.fields).join(', ')}`);
    });
    if (report.unmappedFields.length > 10) {
      console.log(`  ... and ${report.unmappedFields.length - 10} more`);
    }
  }

  console.log(`\nErrors: ${report.errors.length}`);
  if (report.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    report.errors.forEach((e) => {
      console.log(`  - User ${e.userId}: ${e.error}`);
    });
  }

  console.log(`\n${dryRun ? '✅ Dry run complete' : '✅ Migration complete'}\n`);

  // Write detailed report to file
  const reportPath = `./migration-report-${new Date().toISOString().slice(0, 10)}.json`;
  const fs = require('fs');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Detailed report written to: ${reportPath}\n`);
}

// Run migration
const dryRun = process.argv.includes('--dry-run');
migrate(dryRun)
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
