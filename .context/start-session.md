# Start Session Prompt

Copy/paste ONE of these at the start of every session:

---

## For Codex Users:

```
Load .codex/context.md and follow the instructions for my task.
```

**What this does:**
- Loads the comprehensive Codex development context
- Shows you all available roles and their activation prompts
- Guides you through checking current state
- Provides copy-paste prompts for each role
- Explains both single-dev and swarm modes

---

## For Claude Code Users:

```
Load .claude/context.md and follow the instructions for my task.
```

**What this does:**
- Loads the comprehensive Claude Code development context
- Shows you all available roles and their activation prompts
- Guides you through checking current state
- Provides copy-paste prompts for each role
- Explains both single-dev and swarm modes

---

## What's in the Context Files?

Both `.codex/context.md` and `.claude/context.md` contain:

### 1. Project Overview
- What we're building (Matchmade)
- Stack and approach
- Development philosophy

### 2. Directory Map
- Where everything lives
- Product docs, briefs, tickets, slices, logs
- Quick navigation guide

### 3. How to Start
- Check current state prompt
- Choose your mode (single-dev vs swarm)
- Step-by-step guidance

### 4. Role Activation Prompts
Complete copy-paste prompts for every role:
- **Product Manager** - Strategic validation
- **Feature Planner** - Tactical planning
- **Architect** - Design contracts
- **Implement** - Write code (single-dev)
- **Backend** - API + DB (swarm)
- **Frontend** - UI (swarm)
- **Agent-Logic** - LLM/AI logic (swarm)
- **QA** - Testing & validation
- **Review** - Code review
- **Debug** - Issue investigation
- **Optimize** - Performance tuning
- **Planner** - Task planning

### 5. Progress Tracking
- How to check what's been done
- How to log your work
- How to keep roles up-to-date

### 6. Quick Reference
- Common workflow patterns
- When to use which role
- How roles hand off to each other

---

## Quick Start Examples

### "I want to build the next feature"
```
Load .codex/context.md
→ Follow "Check Current State" prompt
→ Activate Feature Planner role
→ Create ticket for next feature
```

### "I want to validate a feature idea"
```
Load .codex/context.md
→ Activate Product Manager role
→ Describe the feature
→ Get go/no-go decision
```

### "I want to implement a small feature"
```
Load .codex/context.md
→ Choose Single-Dev mode
→ Activate Architect → Implement → Review
→ Log and commit
```

### "I want to build a large feature with a team"
```
Load .codex/context.md
→ Choose Swarm mode
→ Feature Planner creates ticket
→ Architect defines contracts
→ Backend/Frontend/Agent-Logic implement in parallel
→ QA validates
```

---

## Traditional Workflow (Pre-Unified Structure)

**If you prefer the old approach, you can still:**

Read files directly:
- `.context/llm-dev-context.md` - Product essence
- `.context/values-schema.md` - Data model
- `.context/session-log-template.md` - Log format
- `.context/briefs/[step].md` - Feature brief

Then follow memoryless workflow:
1. Restate key constraints
2. Create/append session log
3. Propose 3-5 step plan
4. Execute
5. Run tests/lints
6. Prepare commit and note follow-ups

---

## Key Differences: New Structure vs Old

### Old Approach:
- Manual file navigation
- Remember all file paths
- Self-directed workflow
- No standardized role prompts

### New Approach:
- Guided navigation via context files
- All paths documented in one place
- Standardized role activation prompts
- Clear workflow protocols (single-dev vs swarm)
- Progress tracking built-in

**Both approaches work!** The new structure just makes it easier to get started and stay consistent.

---

## Summary

**For every session:**
1. Load `.codex/context.md` OR `.claude/context.md`
2. Follow the prompts for your task
3. All role activation prompts are copy-paste ready
4. All workflows are documented
5. Progress tracking is built-in

This ensures consistency across sessions and makes it easy for any LLM (or human) to jump in and start working.

---

End of start-session guide. Load your context file to begin.
