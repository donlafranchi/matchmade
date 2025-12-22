# Next Steps After Re-Organization

**Date:** 2025-12-20
**Status:** Re-org complete, Slice 1 complete

---

## ✅ What Was Just Completed

### 1. Structure Re-Organization
- Moved `web/dev/` → `dev/` (unified dev ops at root)
- Created comprehensive context files (`.codex/context.md`, `.claude/context.md`)
- Updated `.context/start-session.md` with entry points
- Created two protocol files (`single-dev.md`, `swarm-dev.md`)
- Consolidated all roles into `dev/roles/` (12 roles total)
- Created new roles: `product-manager.md`, `feature-planner.md`
- Created `dev/roles/README.md` (comprehensive role usage guide)
- Removed redundant directories

### 2. Slice 1 Implementation (Chat → Profile)
- Backend: APIs for chat + profile (POST /api/chat, GET/PUT /api/profile)
- Frontend: ChatProfilePanel with tabs, off-record toggle, profile editing
- DB: Profile model with completeness tracking
- QA: All acceptance criteria met
- Status: ✅ COMPLETE
- Ticket recreated: `dev/tickets/slice-1-chat-profile.md`

---

## 🎯 Immediate Next Steps (Today)

### Step 1: Verify Everything Still Works
```bash
cd /Users/don/Projects/matchmade/web

# Start dev server
npm run dev -- --hostname 127.0.0.1 --port 3001

# Test in browser:
# 1. Navigate to context page (romantic/friendship)
# 2. Send a chat message
# 3. Toggle off-record, send another message
# 4. Switch to Profile tab
# 5. Verify completeness % shows
# 6. Edit profile fields
# 7. Verify changes persist
```

**Expected results:**
- Chat tab: messages display, off-record toggle works
- Profile tab: completeness bar, missing fields, editable form
- No console errors
- API calls succeed

---

### Step 2: Commit the Re-Organization

**Option A: Separate commits (recommended)**
```bash
cd /Users/don/Projects/matchmade

# Commit 1: Structure re-org
git add .claude/ .codex/ .context/start-session.md dev/ -A
git add -u .  # Remove deleted files
git commit -m "chore: reorganize dev ops structure

- Move web/dev/ to root dev/
- Create unified context files (.codex/context.md, .claude/context.md)
- Add protocols (single-dev, swarm-dev)
- Consolidate all roles to dev/roles/
- Add new roles: product-manager, feature-planner
- Create comprehensive role usage guide (dev/roles/README.md)
- Update start-session.md with new entry points

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

```bash
cd web

# Commit 2: Slice 1 work (if not already committed)
git add .
git commit -m "feat: implement chat and profile panel (slice 1)

- Add ChatProfilePanel with tab navigation (Chat/Profile)
- Implement chat UI with off-record toggle
- Implement profile view with completeness tracking
- Add API routes: POST /api/chat, GET/PUT /api/profile
- Add Profile model with completeness calculation
- Create shared types in lib/types.ts

Closes slice-1-chat-profile

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Option B: Combined commit (if you prefer)**
```bash
cd /Users/don/Projects/matchmade

git add -A
git commit -m "chore: reorganize dev ops + complete slice 1

Structure changes:
- Move web/dev/ to root dev/
- Create unified context files and protocols
- Add product-manager and feature-planner roles

Feature changes (slice 1):
- Implement chat and profile panel
- Add off-record messaging
- Add profile completeness tracking

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Step 3: Update Your Workflow

**From now on, start every session with:**

**For Codex:**
```
Load .codex/context.md and follow the instructions for my task.
```

**For Claude Code:**
```
Load .claude/context.md and follow the instructions for my task.
```

**Or use the router:**
```
Load .context/start-session.md
```

These files contain all the copy-paste prompts you need for any role.

---

## 🗺️ Where Are We in the Build Order?

### Build Order (from .context/llm-dev-context.md:22-33)

1. ✅ Auth + context selection + basic routing - COMPLETE
2. ✅ Agent chat UI; store normal messages; implement off-the-record - COMPLETE (Slice 1)
3. ⚠️ DerivedProfile extraction stub (rule-based first; LLM hook later) - PARTIAL (stub exists)
4. ⬜ Profile preview + completeness nudges - NEXT
5. ⬜ Media upload + gallery
6. ⬜ Attraction mode + persistence + rate limit
7. ⬜ Matching engine + match reveal
8. ⬜ Events: seeded list + match-linked interest + RSVP
9. ⬜ Notifications inbox
10. ⬜ Feedback + trust aggregate

**Current Position:** 2.5/10 complete

---

## 🚀 What to Build Next

### Option 1: Complete Brief 03 (DerivedProfile Extraction)
**Status:** Stub implementation exists, needs full extraction logic

**What's needed:**
- Agent-Logic role (swarm specialist)
- Implement actual extraction from chat messages
- Use `.context/values-schema.md` for extraction rules
- Store extraction prompts in `playbooks/`
- Add confidence scoring

**When to do this:**
- Now, if you want to fully complete the chat → profile flow
- OR defer until you've built more features and can test extraction comprehensively

**Ticket to create:**
```
Activate Feature Planner:
- Feature: Profile extraction from chat (Brief 03)
- Create: dev/tickets/slice-3-profile-extraction.md
```

---

### Option 2: Build Brief 04 (Profile Preview Page)
**Status:** Not started

**What's needed:**
- Single-dev mode (simple feature)
- New page: `/profile/preview`
- Shows completeness bar, missing fields
- CTA: "Improve matching" → opens chat with targeted question
- Calm UI, honest messaging

**When to do this:**
- Good next step if you want to keep building features
- Simpler than extraction (no AI logic needed)
- Completes the profile visualization flow

**Ticket to create:**
```
Activate Feature Planner:
- Feature: Profile preview page (Brief 04)
- Create: dev/tickets/profile-preview.md
```

---

## 📋 Recommended Path Forward

### Path A: Build Features in Order (Recommended)

**Week 1-2:**
1. ✅ Slice 1 complete
2. Build Brief 04: Profile preview page (single-dev, ~1-2 days)
3. Build Brief 05: Media upload (single-dev, ~2-3 days)

**Week 3-4:**
4. Build Brief 03 fully: Profile extraction (agent-logic, ~2-3 days)
5. Build Brief 06: Attraction mode (swarm, ~3-4 days)

**Benefits:**
- Follows natural user flow
- Builds UI features first (easier to test)
- Defers complex AI logic until more features exist
- Can test each feature independently

---

### Path B: Complete AI Logic First

**Week 1:**
1. ✅ Slice 1 complete
2. Build Brief 03 fully: Profile extraction (agent-logic, ~2-3 days)

**Week 2:**
3. Build Brief 04: Profile preview (single-dev, ~1-2 days)
4. Build Brief 05: Media upload (single-dev, ~2-3 days)

**Benefits:**
- Completes core AI functionality early
- Profile extraction informs other features
- Can tune extraction before building more on top

---

### Path C: MVP Speed Run

**Focus on minimum viable features:**
1. ✅ Slice 1 (Chat + Profile) - complete
2. Brief 04: Profile preview - ~1 day
3. Brief 05: Media upload (photos only) - ~2 days
4. Brief 06: Attraction mode (basic swipe) - ~2 days
5. Brief 07: Matching engine (simple scoring) - ~3 days
6. Skip: Events, Notifications, Feedback (defer post-MVP)

**Benefits:**
- Fastest path to working matching
- Can test core flow end-to-end
- Defer nice-to-haves

---

## 🎬 How to Start Your Next Session

### Example 1: Build Profile Preview (Single-Dev)

```
Load .codex/context.md

I want to build the next feature in single-dev mode.

Context: We just completed Slice 1 (chat + profile). I want to build Brief 04: Profile Preview page.

Tasks:
1. Check current state (what's complete, what's next)
2. Activate Feature Planner to create ticket
3. Then Architect → Implement → Review → QA workflow

Let's start.
```

---

### Example 2: Complete Profile Extraction (Swarm)

```
Load .codex/context.md

I want to complete profile extraction in swarm mode.

Context: We have a stub extraction in Slice 1. I want to build the full extraction logic that pulls profile fields from chat messages using the values schema.

Tasks:
1. Check current state
2. Activate Feature Planner to create slice-3 ticket
3. Then Architect → Agent-Logic → QA workflow

Let's start.
```

---

### Example 3: Just Check Status

```
Load .codex/context.md

Before I start working, help me understand the current state:

1. Read the 3 most recent files in .context/session-logs/
2. List all files in dev/tickets/
3. Summarize: What features are complete? What's in progress? What's next?

Output a brief status report.
```

---

## 📚 Resources

### Key Files to Reference:
- **Product vision:** `.context/northstar.md`
- **Product constraints:** `.context/llm-dev-context.md`
- **Briefs:** `.context/briefs/01-` through `10-feedback-trust.md`
- **Values schema:** `.context/values-schema.md`
- **Session logs:** `.context/session-logs/` (for progress tracking)

### Context Files (Entry Points):
- **Codex:** `.codex/context.md`
- **Claude Code:** `.claude/context.md`
- **Start prompt:** `.context/start-session.md`

### Protocols:
- **Single-dev:** `dev/protocols/single-dev.md`
- **Swarm:** `dev/protocols/swarm-dev.md`

### Roles:
- **All roles:** `dev/roles/`
- **Usage guide:** `dev/roles/README.md`

---

## 🐛 Known Issues / Follow-Ups

### From Slice 1:
- [ ] Add automated API integration tests
- [ ] Implement full profile extraction (agent-logic)
- [ ] Implement "forget message/topic" functionality
- [ ] Add rate limiting for chat
- [ ] Add extraction confidence scoring

### General:
- [ ] Set up CI/CD
- [ ] Add E2E tests
- [ ] Set up staging environment
- [ ] Add error monitoring (Sentry?)

---

## 🎉 Summary

**You now have:**
1. ✅ Unified dev ops structure at root level
2. ✅ Comprehensive context files with copy-paste prompts
3. ✅ 12 roles with clear usage guides
4. ✅ Two development protocols (single-dev, swarm)
5. ✅ Slice 1 complete and documented
6. ✅ Clear next steps for any path forward

**Next action:**
1. Test the implementation (Step 1 above)
2. Commit your work (Step 2 above)
3. Choose your path (A, B, or C)
4. Start your next session with context file

**You're ready to build! 🚀**

---

## Questions?

Load `.codex/context.md` or `.claude/context.md` and ask:
- "What should I build next?" → Activates Feature Planner
- "Is this feature aligned?" → Activates Product Manager
- "How do I start?" → Walks you through the workflow

The new structure is designed to make this easy!
