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

### 2026-02-02 - Experience-Aware Profiling (Two Tracks)

**Context:** Our profiling questions assume relationship experience and self-awareness that young/inexperienced users don't have. Questions like "What does trust look like to you?" require experience they haven't had yet.

**Decision:** Implement two onboarding tracks based on self-reported experience level:
- **Track A (New):** Concrete scenario questions, simple choices, validates "figuring it out"
- **Track B (Experienced):** Reflective questions with follow-ups, nuance welcome

**Schema changes:**
- `User.experienceLevel`: 'new' | 'learning' | 'experienced'
- `User.experiencePreference`: 'similar' | 'any' | 'more_experienced'
- `ProfileDimension.questionType`: 'scenario' | 'reflective' | 'direct_choice'

**Alternatives considered:**
- Single track with simpler questions for everyone - loses depth for experienced users
- Infer experience from answers only - delays personalization, awkward early experience

**Rationale:** Meet users where they are. New users get concrete scenarios they can answer honestly. Experienced users get depth they can engage with. Same dimensions measured, different questions asked.

---

### 2026-02-02 - User-Defined Dealbreakers

**Context:** Original design had hardcoded dealbreakers (intent, children). But users have different hard requirements - some care about politics, religion, distance, lifestyle factors.

**Decision:** Any dimension can be marked as a dealbreaker by the user via `ProfileDimension.dealbreaker` flag. Dealbreakers filter out matches entirely, not just lower scores.

**Matching logic:**
- If A marks dimension X as dealbreaker, B must have answered X
- If positions are >2 apart on spectrum, no match
- Missing required dimension = no match (not neutral score)

**Alternatives considered:**
- Hardcoded dealbreaker dimensions - too rigid, misses user priorities
- Soft penalties for mismatches - doesn't respect firm boundaries

**Rationale:** Users know their own dealbreakers better than we do. Someone who won't do long distance shouldn't see long-distance matches, period.

---

### 2026-02-02 - No Fixed Profile Minimums

**Context:** Originally planned to require X core questions answered before matching. But this creates friction and assumes everyone has the same depth of self-knowledge.

**Decision:** No fixed minimums. Sparse profiles = smaller candidate pool (fewer people pass their dealbreaker checks), not lower scores. Users are incentivized to provide more data by getting more/better matches, not by gating.

**Implications:**
- Profile with 1 dimension can match, just with very few people
- Confidence score reflects data completeness ('low' | 'medium' | 'high')
- Progressive feature unlocking based on engagement (future: photo fidelity, etc.)

**Alternatives considered:**
- Require 5 core questions - friction, assumes self-knowledge
- Penalize sparse profiles with lower scores - punishes honest "I don't know" answers

**Rationale:** Incentivize through value, not gates. Users who engage more get better matches naturally.

---

### 2026-02-02 - Scenario Questions Extract Same Dimensions

**Context:** Scenario questions ("Plans change last minute - relieved or annoyed?") feel different from reflective questions ("What does trust look like to you?") but should measure the same things.

**Decision:** Both question types extract to the same dimensions (e.g., `spontaneity`, `trust`). Different LLM prompts handle the different answer styles. Direct choice answers map without LLM.

**Extraction approach:**
- `REFLECTIVE_PROMPT`: Expects elaboration, looks for depth and nuance
- `SCENARIO_PROMPT`: Expects reactions, infers position from response
- `mapDirectChoice()`: Direct mapping for multiple choice, no LLM needed

**Rationale:** The dimensions are what matter for matching. How we discover them can vary by user. New users answer scenarios → same `spontaneity` score as experienced user answering reflectively.

---

*See dev/decisions.md for historical decisions prior to workflow restructuring.*
