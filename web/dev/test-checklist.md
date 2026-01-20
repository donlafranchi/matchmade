# Test Checklist

## OAuth Implementation Status: Code Complete

The OAuth implementation code is complete. These tests require configuring OAuth credentials first.

---

## Authentication Tests

### Google OAuth
- [ ] Configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- [ ] Click "Continue with Google" on login page
- [ ] Redirects to Google consent screen
- [ ] After consent, redirects back and creates session
- [ ] User record created with correct email
- [ ] Account record links Google provider

### Apple OAuth
- [ ] Configure APPLE_CLIENT_ID and APPLE_CLIENT_SECRET
- [ ] Click "Continue with Apple" on login page
- [ ] Redirects to Apple sign-in
- [ ] After consent, redirects back and creates session
- [ ] User record created (may have private relay email)
- [ ] Account record links Apple provider

### Email Magic Link
- [ ] Configure RESEND_API_KEY and EMAIL_FROM
- [ ] Enter email, click "Continue with email"
- [ ] Redirects to /auth/verify page
- [ ] Email received with sign-in link
- [ ] Clicking link creates session and redirects to /onboarding
- [ ] Link expires after use

### Cross-Provider
- [ ] Same email via Google and Email creates single user
- [ ] Can sign in with either method for same account

---

## Account Management Tests

### Logout Flow
- [ ] Click "Sign out" button on Profile page
- [ ] Verify redirect to home page
- [ ] Verify session is cleared (can't access protected pages)
- [ ] Verify can log back in

### Account Deletion Flow
- [ ] Click "Delete account" on Profile page
- [ ] Verify confirmation UI appears
- [ ] Typing wrong text keeps button disabled
- [ ] Typing "delete my account" enables delete button
- [ ] Click "Cancel" - form resets
- [ ] Click "Delete" - redirect to home, all data deleted
- [ ] Can create new account with same email

---

## Navigation Tests
- [ ] Bottom nav shows: Profile | Chat | Discover | Events (left to right)
- [ ] Profile tab highlights when on /contexts/[context]/profile
- [ ] Chat tab highlights when on /contexts/[context]
- [ ] Discover and Events are placeholder links (#)

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

## Setup Instructions

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select a project
3. Enable Google+ API
4. Go to Credentials > Create OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to .env

### Apple OAuth Setup
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Create an App ID with "Sign in with Apple" capability
3. Create a Services ID
4. Create a Key for Sign in with Apple
5. Set return URL: `http://localhost:3000/api/auth/callback/apple`
6. Generate client secret (requires private key)

### Resend Setup
1. Go to [Resend](https://resend.com/)
2. Create an account and verify your domain
3. Create an API key
4. Copy API key to .env
