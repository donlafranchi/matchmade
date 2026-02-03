# T009 - Deployment for User Testing

## Goal
Deploy the app to the web so real users can test it. Move from local dev to a production-ready environment.

## Current State
- App runs locally on `localhost:3000`
- Database: Podman PostgreSQL on `localhost:5433`
- Photos: Local filesystem (`public/uploads/photos/`)
- Auth: Google OAuth configured for localhost only

## Target State
- App accessible at a public URL
- Managed PostgreSQL database
- Photo storage on Cloudflare R2
- Auth working with production domain
- Environment variables properly configured

## Acceptance Criteria

### Infrastructure
- [ ] Vercel project created and connected to repo
- [ ] Production PostgreSQL database provisioned (Neon, Supabase, or Railway)
- [ ] Cloudflare R2 bucket created for photo storage
- [ ] Domain configured (or use Vercel's `.vercel.app` subdomain)

### Configuration
- [ ] Production environment variables set in Vercel:
  - `DATABASE_URL` - Production Postgres connection string
  - `AUTH_SECRET` - Secure random string
  - `NEXTAUTH_URL` - Production URL
  - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Updated for production domain
  - `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`
  - `ANTHROPIC_API_KEY`
- [ ] Google OAuth updated with production redirect URI
- [ ] Cloudflare R2 CORS configured for production domain

### Database
- [ ] Run `prisma migrate deploy` on production database
- [ ] Verify schema matches local

### Verification
- [ ] App loads at production URL
- [ ] Google sign-in works
- [ ] Photo upload works (stored in R2)
- [ ] Onboarding flow completes
- [ ] Match pool displays

## Plan

### 1. Database Setup (Neon recommended)
```bash
# Create account at neon.tech
# Create new project → get connection string
# Add DATABASE_URL to Vercel env vars
```

### 2. Cloudflare R2 Setup
```bash
# Cloudflare Dashboard → R2 → Create bucket "matchmade-photos"
# R2 → Manage R2 API Tokens → Create API token
# Note: Account ID, Access Key ID, Secret Access Key
# Set bucket CORS policy for your domain
```

R2 CORS example:
```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com", "https://*.vercel.app"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedHeaders": ["*"]
  }
]
```

### 3. Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd web && vercel link

# Set environment variables
vercel env add DATABASE_URL production
vercel env add AUTH_SECRET production
# ... etc for all vars

# Deploy
vercel --prod
```

### 4. Google OAuth Update
```
# Google Cloud Console → APIs & Services → Credentials
# Edit OAuth 2.0 Client
# Add Authorized redirect URI: https://yourdomain.com/api/auth/callback/google
```

### 5. Database Migration
```bash
# Run migrations on production
DATABASE_URL="production-connection-string" npx prisma migrate deploy
```

## Environment Variables Checklist

| Variable | Source | Notes |
|----------|--------|-------|
| `DATABASE_URL` | Neon/Supabase | Postgres connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` | Unique per environment |
| `NEXTAUTH_URL` | Your domain | e.g., `https://app.matchmade.com` |
| `BASE_URL` | Same as NEXTAUTH_URL | |
| `GOOGLE_CLIENT_ID` | Google Cloud Console | |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console | |
| `S3_ENDPOINT` | Cloudflare R2 | `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_ACCESS_KEY_ID` | Cloudflare R2 | |
| `S3_SECRET_ACCESS_KEY` | Cloudflare R2 | |
| `S3_BUCKET` | Cloudflare R2 | e.g., `matchmade-photos` |
| `S3_PUBLIC_URL` | Optional | If using R2 public bucket or CDN |
| `ANTHROPIC_API_KEY` | Anthropic Console | For LLM features |

## Constraints
- Don't expose API keys in client-side code
- Use Vercel's encrypted environment variables
- Keep production database separate from development

## Dependencies
- Vercel account
- Cloudflare account (for R2)
- Neon/Supabase/Railway account (for Postgres)
- Google Cloud project with OAuth configured

---

## Implementation Notes
*Added during implementation*

## Verification
- [ ] Production URL loads
- [ ] Sign in with Google works
- [ ] Complete onboarding (questions → photos)
- [ ] Photos upload to R2 (check bucket)
- [ ] Match pool displays
- [ ] No console errors

## Completion

**Date:**
**Summary:**
**Files changed:**
**Notes:**
