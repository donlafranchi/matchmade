# Phase 4: Production Readiness

**Goal:** Prepare the app for beta deployment with production-grade authentication
**Status:** In Progress

---

## The Problem

**Current state:**
- Dev-only email login (no password, no OAuth)
- Custom HMAC session management
- Not secure enough for production
- No social login options

**What's broken:**
- Can't deploy to real users
- No Apple/Google sign-in (industry standard)
- No email verification
- Manual session management

---

## The Solution

**After Phase 4:**
- Apple Sign-In (required for App Store)
- Google Sign-In (covers Android + desktop users)
- Email magic link (privacy-friendly fallback)
- Production-grade session management via NextAuth.js
- Proper logout and account deletion

---

## Tickets

### 4.1: OAuth Authentication (✅ Complete)

**Goal:** Replace custom auth with NextAuth.js supporting Apple, Google, and Email

**Status:** Complete

**What was done:**
- Added Account, Session, VerificationToken models to Prisma
- Configured NextAuth.js with Google, Apple, and Email providers
- Updated login page with OAuth buttons
- Updated ProfileShell with signOut
- Created verify and error pages
- Build passing

**What remains:**
- Configure OAuth credentials (Google Cloud Console, Apple Developer)
- Set up Resend for email magic links
- Test all auth flows in development

---

## Environment Variables Needed

```env
# Auth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Apple OAuth (from Apple Developer Portal)
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=noreply@yourdomain.com
```

---

## Timeline

| Ticket | Status |
|--------|--------|
| 4.1: OAuth Authentication | ✅ Complete (code) |
| Configure Google OAuth | Not started |
| Configure Apple OAuth | Not started |
| Configure Resend | Not started |
| Test all flows | Not started |

---

## Success Criteria

- [ ] All three auth methods working (Google, Apple, Email)
- [ ] Logout works correctly
- [ ] Account deletion works correctly
- [ ] Session persists across browser refresh
- [ ] 30-day session expiry maintained
