# Single-Dev Protocol

## When to Use
- Small features (can be completed in one session)
- Bug fixes
- Refactoring tasks
- Documentation updates
- Code improvements
- One developer owns end-to-end implementation

## Not Suitable For
- Large features spanning multiple areas
- Features requiring parallel work across stack layers
- Complex integrations with multiple touch points
- Features that benefit from specialist expertise

---

## Workflow Overview

Single-dev mode follows a linear workflow where one agent handles all phases:

```
Read Context → Plan → Design → Implement → Test → Review → Log → Commit
```

---

## Session Flow

### 1. Load Context

**Read First (Every Session):**
- **`dev/project-state.md`** - ALWAYS START HERE (single source of truth for current state)
- `.context/llm-dev-context.md` - Product essence and constraints
- `.context/values-schema.md` - Data model and matching philosophy
- Relevant brief from `.context/briefs/[step].md`
- Latest 3-5 session logs from `.context/session-logs/` (if needed for deeper context)

**Check Current State:**
- Read "Active Work" section in project-state.md
- Read "Next Up" section to see what's ready to build
- Check for any blockers or dependencies
- Identify where you are in the build order

### 2. Define the Task

**Options:**
- **New Feature**: Pick next item from build order (.context/llm-dev-context.md:22-33)
- **Bug Fix**: Describe the issue and reproduction steps
- **Improvement**: Describe what needs to be enhanced

**Clarify:**
- What are the acceptance criteria?
- What are the constraints?
- What files/areas will be affected?

### 3. Architect (Design Phase)

**Activate Role:** `dev/roles/architect.md`

**Tasks:**
1. Understand requirements and constraints
2. Review existing codebase patterns
3. Identify files to create/modify
4. Design solution:
   - Component structure (if UI)
   - API contracts (if backend)
   - Database schema changes (if data)
   - State management approach
   - Integration points
5. Document architecture in `dev/logs/[feature]-architecture-[date].md`

**Output:**
- File structure plan
- Component/function responsibilities
- Type definitions
- API contracts (if applicable)
- Database changes (if applicable)
- Integration approach

### 4. Implement (Coding Phase)

**Activate Role:** `dev/roles/implement.md`

**Tasks:**
1. Review your architecture document
2. Implement all files per specification
3. Follow existing code patterns and style
4. Maintain type safety (TypeScript strict mode)
5. Write tests:
   - Unit tests for business logic
   - Integration tests for APIs
   - Component tests for UI
6. Document non-obvious logic with comments

**Guidelines:**
- Follow architecture exactly (don't deviate without reason)
- Match existing code style and conventions
- Use established patterns from codebase
- Keep code simple and readable
- Handle errors appropriately
- Don't add unspecified features
- Don't premature optimize

**Output:**
- Working code
- Tests covering critical paths
- Implementation notes in `dev/logs/[feature]-implementation-[date].md`

### 5. Test (Validation Phase)

**Tasks:**
1. Run all tests: `npm test` or relevant test command
2. Run linter: `npm run lint`
3. Run type checker: `npm run type-check` or `tsc --noEmit`
4. Manual testing checklist:
   - Happy path validation
   - Edge case testing
   - Error handling verification
5. Capture test results and any failures

**Output:**
- Test results (pass/fail counts)
- Lint results (no errors)
- Type check results (no errors)
- Manual test checklist (completed)

### 6. Review (Self-Review Phase)

**Activate Role:** `dev/roles/review.md`

**Tasks:**
1. Review your own code:
   - Does it meet requirements?
   - Is it type-safe?
   - Are there security issues? (XSS, SQL injection, etc.)
   - Does it follow product principles? (honest UX, calm UI, no overpromising)
   - Is it well-tested?
2. Check against architecture document
3. Verify code quality and style
4. Validate test coverage

**Output:**
- Self-review checklist (completed)
- Any issues to address before committing

### 7. Log (Documentation Phase)

**Create Session Log:**

File: `.context/session-logs/[feature-name]-[date].md`

Use template from `.context/session-log-template.md`:

```markdown
# Session Log: [Feature Name]

**Date:** YYYY-MM-DD
**Author:** [Your role/name]
**Branch:** feat/[feature-name]
**Mode:** Single-dev

## Context
[Brief description of what was built and why]

## Constraints
[Key constraints from llm-dev-context.md - non-negotiables, stack, etc.]

## Plan
[3-5 step plan that was followed]

## Changes
### Files Modified
- `path/to/file.ts:45-67` - Added function for X
- `path/to/file.ts:12` - Modified import

### Implementation Notes
[Decisions made, approaches taken, deviations from plan]

## Tests
- Unit tests: [pass count]
- Integration tests: [pass count]
- Manual testing: [checklist completed]
- Coverage: [percentage if available]

## Validation
- [ ] All tests pass
- [ ] Types check
- [ ] Lint passes
- [ ] Manual testing complete
- [ ] Product principles followed (honest UX, calm tone)
- [ ] Security reviewed (no XSS, injection, etc.)

## Follow-ups
[Any TODOs, blockers, or next steps]
```

**Also Create/Update:**
- `dev/logs/[feature-name]-[date].md` with detailed implementation notes

### 8. Update Project State & Handoff

**Update `dev/project-state.md`:**

1. **Mark task complete in "Active Work":**
   - Clear the owner
   - Mark status as complete

2. **Add handoff entry in "Recent Handoffs":**
   ```markdown
   ### YYYY-MM-DD: [Feature Name] Complete
   - **From:** [Your Role]
   - **To:** [Next Role/Agent or "Ready for next feature"]
   - **Artifacts:**
     - `.context/session-logs/[feature]-[date].md`
     - `dev/logs/[feature]-implementation-[date].md`
     - Code files: [list key files]
   - **Status:** ✅ Complete
   - **Next:** [Specific next step]
   ```

3. **Update "Next Up" section:**
   - What feature is ready to build next?
   - Who should work on it?
   - What do they need to read?

4. **Update "Build Order Progress":**
   - Check off completed brief
   - Update percentage complete

**Example Update:**
```markdown
## Active Work
### Current Task
- **Owner:** None (ready for next session)
- **Task:** Determine next feature
- **Blocked by:** None

## Recent Handoffs
### 2025-12-22: Profile Preview Complete
- **From:** Implement (single-dev)
- **To:** Feature Planner (for next feature)
- **Artifacts:**
  - `.context/session-logs/profile-preview-2025-12-22.md`
  - `dev/logs/profile-preview-implementation-2025-12-22.md`
  - `web/app/profile/preview/page.tsx`
  - `web/components/ProfilePreview.tsx`
- **Status:** ✅ Complete
- **Next:** Feature Planner to identify Brief 05 (Media Upload)
```

### 9. Commit (Version Control)

**Branch Convention:**
- `feat/[area]-[short-description]` for features
- `fix/[area]-[short-description]` for bug fixes
- `chore/[area]-[short-description]` for maintenance

**Commit Message:**
```
feat: [short feature description]

[Optional longer description]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Example:**
```bash
git checkout -b feat/chat-offrecord
git add .
git commit -m "feat: add off-the-record chat mode

Implements ephemeral messaging that is not stored in the database.
Adds UI toggle and backend support for temporary conversations.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Roles Used in Single-Dev Mode

### Primary Roles:
1. **Architect** (`dev/roles/architect.md`) - Design the solution
2. **Implement** (`dev/roles/implement.md`) - Write the code
3. **Review** (`dev/roles/review.md`) - Self-review the work

### Supporting Roles (as needed):
- **Debug** (`dev/roles/debug.md`) - If issues arise during development
- **Optimize** (`dev/roles/optimize.md`) - If performance tuning is needed

---

## Progress Tracking

### Before Starting:
**ALWAYS read `dev/project-state.md` first to understand:**
- Current phase and build order progress
- Active work (who's working on what)
- Recent completions (what just finished)
- Next up (what's ready to build)
- Blockers and dependencies

**Then read supporting context:**
- Recent session logs (if needed for deeper context)
- Active tickets in `dev/tickets/`
- Latest implementation logs in `dev/logs/`

### After Completing:
1. **Update `dev/project-state.md`** (most important)
   - Mark task complete
   - Add handoff entry
   - Update "Next Up"
   - Update build order progress
2. Create session log in `.context/session-logs/`
3. Create implementation log in `dev/logs/`
4. Update any relevant tickets in `dev/tickets/` (mark complete)
5. Note any follow-ups or blockers in project-state.md

---

## Example Session

**Task:** "Add profile preview page"

**Step 1 - Load Context:**
```
Read (in order):
- dev/project-state.md (current state, what's next)
- .context/llm-dev-context.md (product essence)
- .context/values-schema.md (data model)
- .context/briefs/04-profile-preview.md (feature spec)
- Last 3 session logs (if needed for context)
```

**Step 2 - Architect:**
```
Plan:
- Create page: web/app/profile/preview/page.tsx
- Create component: web/components/ProfilePreview.tsx
- Add API route: web/app/api/profile/route.ts
- Types: web/types/profile.ts

Design decisions:
- Show completeness score
- Display missing fields with nudges
- CTA to improve profile via chat
```

**Step 3 - Implement:**
```
- Write page component
- Write ProfilePreview component
- Write API route to fetch derived profile
- Add tests for API route
- Add component tests
```

**Step 4 - Test:**
```
npm test
npm run lint
npm run type-check
Manual: Navigate to /profile/preview, verify display
```

**Step 5 - Review:**
```
✓ Meets acceptance criteria
✓ Type-safe
✓ No security issues
✓ Follows product principles (calm UI, honest messaging)
✓ Tests pass
```

**Step 6 - Log:**
```
Create .context/session-logs/profile-preview-2025-12-20.md
Create dev/logs/profile-preview-implementation-2025-12-20.md
```

**Step 7 - Update State:**
```
Update dev/project-state.md:
- Mark task complete in "Active Work"
- Add handoff to "Recent Handoffs"
- Update "Next Up" (Feature Planner for Brief 05)
- Check off Brief 04 in "Build Order Progress"
```

**Step 8 - Commit:**
```
git checkout -b feat/profile-preview
git add .
git commit -m "feat: add profile preview page..."
```

---

## Quick Reference

**Start Single-Dev Session:**
```
1. Read dev/project-state.md (ALWAYS FIRST)
2. Load role context files
3. Check what's next
4. Architect → Implement → Test → Review → Log → Update State → Commit
```

**Key Principles:**
- One agent, end-to-end ownership
- Follow architecture before coding
- Test thoroughly
- Self-review before committing
- Document in session logs
- Keep changes focused and small

---

End of Single-Dev Protocol
