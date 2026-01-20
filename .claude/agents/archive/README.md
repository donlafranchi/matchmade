# .claude/agents/ Directory

**Purpose:** Executable agent definitions used by Claude Code.

**Note:** For workflow role concepts, see `dev/roles/`.

---

## Active Agents (5)

1. **system-architect.md** - Plans architecture and designs implementation strategies
2. **code-implementer.md** - Implements features and writes code
3. **feature-planner.md** - Plans features and breaks down work
4. **product-manager.md** - Assists with product decisions (human is ultimate product manager)
5. **project-manager.md** - Maintains project organization per protocol

---

## Usage

These agent definitions are loaded by Claude Code via `.claude/context.md`.

**To invoke an agent:**
- Reference by role name in prompts
- Claude Code will use the definitions here

**To add a new agent:**
1. Create `{agent-name}.md` in this directory
2. Update `.claude/context.md` to reference it
3. Document responsibilities clearly

**To mark draft/future agents:**
- Use `[DRAFT]-{agent-name}.md` prefix
- Document why it's draft and when it will be activated

---

## Relationship to dev/roles/

`dev/roles/` contains **workflow role descriptions** (what roles do conceptually).
`.claude/agents/` contains **executable agent prompts** (how Claude Code runs them).

Keep both in sync conceptually, but `.claude/agents/` is the canonical location for agent execution.

---

*For organizational protocol, see `.claude/organization-protocol.md`*
