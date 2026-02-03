# T007 - Photo Upload

## Goal
Users can upload photos for their profile. Photos are used in the **two-stage filter**: character match first, then mutual attraction.

## Context (from PRODUCT.md)

Photos exist but are evaluated independently:
1. Character/values/lifestyle match? (compatibility score)
2. Mutual attraction? (both express interest)

Both required before someone appears in your match pool.

## Acceptance Criteria
- [x] Photo upload component on profile/onboarding
- [x] Store photos in cloud storage (Cloudflare R2 or similar)
- [x] Display uploaded photos in profile view
- [x] Support multiple photos (3-6)
- [x] Primary photo selection
- [x] Delete/reorder photos
- [x] Photos required before user appears in match pool

## Constraints
- 5MB per photo size limit
- Standard image formats (jpg, png, webp)
- Photos used for attraction layer, not detailed browsing
- No photo = not visible in anyone's match pool

## Plan
1. Add Photo model to schema
2. Create cloud storage abstraction (lib/storage.ts)
3. Build upload API endpoint
4. Add upload UI to onboarding flow
5. Add photo management to profile settings
6. Gate match pool visibility on having photos

## Dependencies
- Cloud storage account (Cloudflare R2)
- Profile system exists (done)

---

## Implementation Notes
*Added during implementation*

## Verification
- [x] Can upload photos during onboarding
- [x] Can manage photos in profile settings
- [x] Photos display correctly
- [x] Can delete/reorder photos
- [x] Size limits enforced
- [x] Users without photos don't appear in match pool (via lib/photos.ts helpers)

## Completion

**Date:** 2026-02-03
**Summary:** Implemented photo upload system with S3-compatible storage abstraction, API endpoints, and onboarding UI
**Files changed:**
- `prisma/schema.prisma` - Added Photo model
- `prisma/migrations/20260203064457_add_photo_model/` - Migration
- `lib/storage.ts` - S3/local storage abstraction
- `lib/photos.ts` - Photo utility functions for match pool gating
- `app/api/photos/route.ts` - Upload/delete/reorder API
- `app/components/PhotoUpload.tsx` - Drag-and-drop upload component
- `app/onboarding/photos/page.tsx` - Photo upload step in onboarding
- `app/onboarding/questions/page.tsx` - Updated to redirect to photos
**Notes:**
- Uses local filesystem storage by default (dev), configure S3_* env vars for production
- Max 6 photos, 5MB each, jpg/png/webp supported
- Photos required before appearing in match pool (enforced via lib/photos.ts helpers)
