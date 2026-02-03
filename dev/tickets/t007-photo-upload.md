# T007 - Photo Upload

## Goal
Users can upload photos for their profile. Photos are used in the **two-stage filter**: character match first, then mutual attraction.

## Context (from PRODUCT.md)

Photos exist but are evaluated independently:
1. Character/values/lifestyle match? (compatibility score)
2. Mutual attraction? (both express interest)

Both required before someone appears in your match pool.

## Acceptance Criteria
- [ ] Photo upload component on profile/onboarding
- [ ] Store photos in cloud storage (Cloudflare R2 or similar)
- [ ] Display uploaded photos in profile view
- [ ] Support multiple photos (3-6)
- [ ] Primary photo selection
- [ ] Delete/reorder photos
- [ ] Photos required before user appears in match pool

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
- [ ] Can upload photos during onboarding
- [ ] Can manage photos in profile settings
- [ ] Photos display correctly
- [ ] Can delete/reorder photos
- [ ] Size limits enforced
- [ ] Users without photos don't appear in match pool

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
