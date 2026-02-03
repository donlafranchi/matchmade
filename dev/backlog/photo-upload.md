# Photo Upload

## Goal
Users can upload photos for their profile and attraction matching.

## Acceptance Criteria
- [ ] Photo upload component on profile page
- [ ] Store photos in cloud storage (Cloudflare R2 or similar)
- [ ] Display uploaded photos in profile view
- [ ] Support multiple photos (3-5 max)
- [ ] Delete photos

## Constraints
- 5MB per photo size limit
- Standard image formats (jpg, png, webp)
- Photos used for attraction matching, not profile browsing

## Plan
1. Add Photo model to schema
2. Create cloud storage abstraction (lib/storage.ts)
3. Build upload API endpoint
4. Add upload UI to profile page
5. Display photos in profile view

## Dependencies
- Cloud storage account (Cloudflare R2)
- Profile page exists

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Can upload photos from profile
- [ ] Photos display correctly
- [ ] Can delete photos
- [ ] Size limits enforced

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
