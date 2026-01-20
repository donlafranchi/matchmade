# Database Connection Troubleshooting

**Date:** 2025-12-26
**Issue:** Recurring ECONNREFUSED errors when running test scripts with Prisma
**Status:** RESOLVED

---

## Problem Summary

Test scripts consistently fail with `ECONNREFUSED` errors when trying to connect to PostgreSQL via Prisma, even though:
- PostgreSQL is running on port 5433 (verified with `lsof` and Docker)
- Direct `psql` connections work
- The Next.js dev server connects successfully
- `DATABASE_URL` is correctly set in `.env`

---

## Root Cause

**Environment variables not loaded before Prisma client initialization.**

The issue occurs because:
1. Prisma's `lib/prisma.ts` imports `pg` Pool and initializes it immediately
2. Test scripts execute before `.env` file is loaded
3. The `pg` Pool constructor receives `undefined` for `DATABASE_URL`
4. Connection fails silently during initialization

---

## Solution

Add `import "dotenv/config"` at the top of `web/lib/prisma.ts`:

```typescript
import "dotenv/config";  // ← Must be FIRST import
import { PrismaClient, ChatRole, RelationshipContextType, TonePreference } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

**Why this works:**
- `dotenv/config` is a side-effect import that loads `.env` immediately
- It executes before any other code in the module
- Subsequent Pool initialization has access to `process.env.DATABASE_URL`

---

## What We Tried (And Why They Didn't Work)

### ❌ Adding `dotenv.config()` to test scripts
```typescript
// In scripts/test-analysis-live.ts
import * as dotenv from 'dotenv';
dotenv.config();

import { prisma } from '../lib/prisma';  // ← Too late! Pool already initialized
```

**Problem:** By the time the test script loads dotenv, `lib/prisma.ts` has already been imported and the Pool is already initialized with `undefined` URL.

### ❌ Using `prisma.config.ts` with dotenv
```typescript
// prisma.config.ts already has:
import "dotenv/config";
```

**Problem:** This only affects Prisma CLI commands (like `prisma db push`). The runtime Prisma client used by application code doesn't use this config file.

### ❌ Regenerating Prisma client
```bash
npx prisma generate
```

**Problem:** The issue isn't with the generated client code, but with how environment variables are loaded at runtime.

---

## Related Issues Encountered

### Secondary Issue: Deprecated Claude Model

While troubleshooting, we also discovered the Claude API model was deprecated:
- Original: `claude-3-sonnet-20240229` (404 error)
- Attempted: `claude-3-5-sonnet-20241022` (404 error)
- Working: `claude-3-haiku-20240307`

**Fixed in:** `web/lib/interpretation/analyze.ts:90`

---

## How to Debug This Issue in the Future

If you see `ECONNREFUSED` errors with Prisma:

1. **Verify database is running:**
   ```bash
   docker ps | grep postgres
   lsof -i :5433
   ```

2. **Test direct connection:**
   ```bash
   docker exec matchmade-postgres psql -U postgres -d matchmade -c "SELECT 1;"
   ```

3. **Test pg Pool directly:**
   ```typescript
   import { Pool } from "pg";
   import * as dotenv from "dotenv";
   dotenv.config();

   const pool = new Pool({ connectionString: process.env.DATABASE_URL });
   const client = await pool.connect();
   // If this works, problem is in Prisma initialization order
   ```

4. **Check environment variable loading order:**
   - Is `dotenv/config` imported FIRST in `lib/prisma.ts`?
   - Are test scripts importing prisma AFTER loading dotenv?
   - Is the Next.js app loading environment variables differently?

---

## Prevention

### For New Test Scripts

Always add dotenv at the top:
```typescript
import "dotenv/config";  // First import!
import { prisma } from '../lib/prisma';
```

### For Library Code That Needs Environment Variables

If a library file needs environment variables at import time (like `lib/prisma.ts`):
- Add `import "dotenv/config"` as the first line
- Document WHY it's there (prevent future removal)
- Add a test that verifies the connection works

---

## Files Modified

- `web/lib/prisma.ts:1` - Added `import "dotenv/config"`
- `web/scripts/test-analysis-live.ts:6-7` - Added dotenv import (redundant but safe)
- `web/scripts/test-anthropic-api.ts:5` - Added dotenv import
- `web/lib/interpretation/analyze.ts:90` - Updated Claude model to `claude-3-haiku-20240307`

---

## Test Results After Fix

```
✓ Database connected successfully
✓ Found test user with 15 messages
✓ Pattern extraction: 10 themes detected
✓ LLM Analysis completed in 4.69s
✓ Analysis stored in database
✓ Cost: $0.0131 (2,065 tokens)
```

---

## Key Takeaway

**When using environment variables with immediate initialization (like pg Pool), ensure dotenv loads BEFORE any code that needs those variables executes.**

This is a module initialization order issue, not a Prisma configuration issue.
