# Review: T008 - Match Pool Display

## Summary
Match pool page showing compatible users with photos, compatibility indicators, and interest tracking.

## What to Test

### Setup
1. Start database: `podman start matchmade-postgres`
2. Start dev server: `cd web && npm run dev`
3. Open http://localhost:3000
4. Need at least 2 users with photos and completed onboarding for full testing

### Test: Pool Page Access
1. Sign in
2. Navigate to http://localhost:3000/pool
3. Verify page loads with header "People you could meet"

### Test: User Cards Display
1. If compatible users exist, verify cards show:
   - Photo
   - Name and age
   - Location (if set)
   - Compatibility indicator (colored dot + text hint)
2. Verify NO percentage scores are shown

### Test: Empty States
1. If no compatible users, verify empty state message
2. Check "All", "Interested", "Mutual" tabs each have appropriate empty states

### Test: Express Interest
1. Click heart button on a user card
2. Verify heart fills in (pink)
3. Verify "Interested" count increases in tab
4. Refresh page — verify interest persists

### Test: Remove Interest
1. Click heart button on an interested user
2. Verify heart empties
3. Verify "Interested" count decreases

### Test: Mutual Interest
1. Have a second user express interest in first user
2. First user expresses interest back
3. Verify "Mutual" badge appears on card
4. Verify "Mutual" tab count updates
5. Verify card appears in "Mutual" filter

### Test: Filter Tabs
1. Click "All" — shows all compatible users
2. Click "Interested" — shows only users you're interested in
3. Click "Mutual" — shows only mutual interests

### Test: Compatibility Filtering
1. Verify users with dealbreaker conflicts don't appear
2. Verify users without photos don't appear
3. Verify users below 40 compatibility don't appear

## Expected Behavior
- Pool shows compatible users (score >= 40, no dealbreakers, have photos)
- Compatibility shown as hints ("Strong match", "Good potential", etc.)
- Interest toggles correctly and persists
- Mutual interest detected when both users express interest

## Files Changed
- `web/prisma/schema.prisma` - Interest model
- `web/app/api/pool/route.ts` - Pool API
- `web/app/api/interest/route.ts` - Interest API
- `web/app/components/UserCard.tsx` - User card component
- `web/app/pool/page.tsx` - Pool page

## Status
- [ ] Tested by human
- [ ] Issues found (list below)

## Issues Found
*None yet*
