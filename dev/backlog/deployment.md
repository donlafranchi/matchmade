# Deployment

## Goal
Deploy app to Vercel with production database for beta users.

## Acceptance Criteria
- [ ] App deployed to Vercel
- [ ] Database migrated (Podman → Railway/Supabase)
- [ ] Production env vars configured
- [ ] LLM server reachable (Claude API)
- [ ] Full conversation flow works end-to-end

## Plan
1. Test build locally (`npm run build`)
2. Deploy to Vercel
3. Provision production database
4. Migrate schema
5. Set production env vars
6. Test end-to-end

## Dependencies
- Vercel account
- Database provider (Railway/Supabase)
- Anthropic API key for production

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] App loads at production URL
- [ ] Auth flow works
- [ ] Chat with agent works
- [ ] Data persists correctly

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
