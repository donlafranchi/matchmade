# DECISIONS.md

> Append-only log of significant decisions.

Add entries when making choices that affect architecture, constrain future options, or involve tradeoffs.

---

## Log

### 2026-01-24 - Project Workflow Scaffolding

**Context:** Project needed standardized workflow structure for Claude Code sessions.

**Decision:** Adopted bootstrap workflow with CLAUDE.md, docs/{PRODUCT,ROADMAP,STATUS,DECISIONS}.md, design/ folder for specs in progress, and clear permissions model.

**Alternatives considered:**
- Keep existing dev/project-state.md only - less structured, harder for new sessions to pick up

**Rationale:** Clear separation between PM-owned docs (PRODUCT, ROADMAP, design/) and agent-writable docs (STATUS, DECISIONS). Existing dev/ structure preserved and integrated.

---

### 2026-01-19 - Multi-Provider LLM Client

**Context:** Needed flexibility to switch between Claude API and local LLMs for cost/privacy.

**Decision:** Built unified LLM client supporting Anthropic and Ollama with OpenAI-compatible interface.

**Alternatives considered:**
- Single provider only - less flexible for testing and deployment options
- LangChain - too heavy for our needs

**Rationale:** Simple abstraction that lets us use Claude for production quality and local LLMs for development/testing.

---

### 2026-01-19 - Profile Extraction Every 5 Messages

**Context:** Need to extract profile data from natural conversation without being intrusive.

**Decision:** Run extraction agent every 5 messages, accumulating data progressively.

**Alternatives considered:**
- Extract after every message - too resource intensive
- Extract only on completion - miss progressive updates

**Rationale:** Balance between responsiveness and efficiency. Users see their profile "fill in" as they chat.

---

*See dev/decisions.md for historical decisions prior to workflow restructuring.*
