-- Verification Queries for Option 1 Migration
-- Run these after the data migration script completes

-- 1. Count of new Profile records should equal count of Users
SELECT
  'User vs ProfileNew count' as check_name,
  (SELECT COUNT(*) FROM "User") as user_count,
  (SELECT COUNT(*) FROM "ProfileNew") as profile_count,
  CASE
    WHEN (SELECT COUNT(*) FROM "User") = (SELECT COUNT(*) FROM "ProfileNew")
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 2. Count of ContextIntent records should equal count of ContextProfiles
SELECT
  'ContextProfile vs ContextIntent count' as check_name,
  (SELECT COUNT(*) FROM "ContextProfile") as context_profile_count,
  (SELECT COUNT(*) FROM "ContextIntent") as context_intent_count,
  CASE
    WHEN (SELECT COUNT(*) FROM "ContextProfile") = (SELECT COUNT(*) FROM "ContextIntent")
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status;

-- 3. Check for orphaned Profile records
SELECT
  'Orphaned ProfileNew records' as check_name,
  COUNT(*) as orphaned_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM "ProfileNew"
WHERE "userId" NOT IN (SELECT id FROM "User");

-- 4. Check for orphaned ContextIntent records
SELECT
  'Orphaned ContextIntent records' as check_name,
  COUNT(*) as orphaned_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM "ContextIntent"
WHERE "userId" NOT IN (SELECT id FROM "User");

-- 5. Every user should have exactly one Profile
SELECT
  'Users with duplicate ProfileNew records' as check_name,
  COUNT(*) as duplicate_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM (
  SELECT "userId", COUNT(*)
  FROM "ProfileNew"
  GROUP BY "userId"
  HAVING COUNT(*) > 1
) as duplicates;

-- 6. No duplicate [userId, contextType] pairs in ContextIntent
SELECT
  'Duplicate [userId, contextType] pairs' as check_name,
  COUNT(*) as duplicate_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM (
  SELECT "userId", "contextType", COUNT(*)
  FROM "ContextIntent"
  GROUP BY "userId", "contextType"
  HAVING COUNT(*) > 1
) as duplicates;

-- 7. Completeness scores are valid (0-100)
SELECT
  'Invalid completeness in ProfileNew' as check_name,
  COUNT(*) as invalid_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM "ProfileNew"
WHERE completeness < 0 OR completeness > 100;

SELECT
  'Invalid completeness in ContextIntent' as check_name,
  COUNT(*) as invalid_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM "ContextIntent"
WHERE completeness < 0 OR completeness > 100;

-- 8. Sample data checks (first 5 records from each table)
SELECT 'Sample ProfileNew records' as info;
SELECT id, "userId", location, "ageRange", completeness, "missing", "createdAt"
FROM "ProfileNew"
LIMIT 5;

SELECT 'Sample ContextIntent records (romantic)' as info;
SELECT id, "userId", "contextType", "relationshipTimeline", "exclusivityExpectation", completeness, "missing", "createdAt"
FROM "ContextIntent"
WHERE "contextType" = 'romantic'
LIMIT 5;

SELECT 'Sample ContextIntent records (friendship)' as info;
SELECT id, "userId", "contextType", "friendshipDepth", "groupActivityPreference", completeness, "missing", "createdAt"
FROM "ContextIntent"
WHERE "contextType" = 'friendship'
LIMIT 5;

-- 9. ChatMessage integrity check (should still be linked correctly)
SELECT
  'ChatMessages with invalid contextProfileId' as check_name,
  COUNT(*) as invalid_count,
  CASE
    WHEN COUNT(*) = 0
    THEN '✓ PASS'
    ELSE '✗ FAIL'
  END as status
FROM "ChatMessage"
WHERE "contextProfileId" NOT IN (SELECT id FROM "ContextProfile");

-- 10. Distribution of contexts
SELECT
  'Context distribution' as info,
  "contextType",
  COUNT(*) as count
FROM "ContextIntent"
GROUP BY "contextType"
ORDER BY COUNT(*) DESC;
