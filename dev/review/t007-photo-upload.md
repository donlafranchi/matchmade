# Review: T007 - Photo Upload

## Summary
Photo upload system for user profiles. Enables the two-stage filter (character → attraction).

## What to Test

### Setup
1. Start database: `podman start matchmade-postgres`
2. Start dev server: `cd web && npm run dev`
3. Open http://localhost:3000

### Test: Onboarding Flow
1. Sign in with Google (or available auth)
2. Complete onboarding intro → questions
3. After questions, should redirect to `/onboarding/photos`
4. Verify "Add your photos" page loads

### Test: Photo Upload
1. Click "Add photo" button
2. Select a JPG/PNG/WebP image under 5MB
3. Verify photo uploads and displays in grid
4. Verify "Primary" badge on first photo

### Test: Multiple Photos
1. Upload 2-3 more photos
2. Verify all display in grid
3. Verify count doesn't exceed 6

### Test: Reorder Photos
1. Drag a photo to a new position
2. Verify order updates
3. Verify "Primary" badge moves to first position
4. Refresh page — verify order persists

### Test: Delete Photo
1. Click X button on a photo
2. Verify photo is removed
3. Verify remaining photos reorder correctly

### Test: Size Limit
1. Try uploading a file > 5MB
2. Verify error message displays

### Test: Continue Flow
1. With at least 1 photo, click "Continue"
2. Verify redirects to `/contexts/romantic`
3. Test "Skip for now" — should also redirect

## Expected Behavior
- Photos upload to local filesystem (dev) or S3 (production)
- First photo marked as primary
- Drag-and-drop reordering works
- Delete removes from storage and database
- Skip works but user won't appear in match pool

## Files Changed
- `web/prisma/schema.prisma` - Photo model
- `web/lib/storage.ts` - Storage abstraction
- `web/lib/photos.ts` - Photo utilities
- `web/app/api/photos/route.ts` - API endpoints
- `web/app/components/PhotoUpload.tsx` - Upload component
- `web/app/onboarding/photos/page.tsx` - Onboarding step
- `web/app/onboarding/questions/page.tsx` - Updated redirect

## Status
- [ ] Tested by human
- [ ] Issues found (list below)

## Issues Found
*None yet*
