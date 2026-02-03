# DECISIONS.md

> Append-only log of significant decisions.

Add entries when making choices that affect architecture, constrain future options, or involve tradeoffs.

---

## Log

### 2026-01-24 - Project Workflow Scaffolding
Adopted CLAUDE.md + docs/{PRODUCT,ROADMAP,STATUS,DECISIONS}.md + design/ folder. PM owns PRODUCT/ROADMAP/design, agents write STATUS/DECISIONS.

**Rationale:** Clear separation of concerns. New Claude sessions can pick up context quickly.

### 2026-01-19 - Multi-Provider LLM Client
Unified client supporting Anthropic and Ollama. Claude for production, local LLMs for dev/testing.

**Rationale:** Simple abstraction without LangChain weight. Flexibility for cost/privacy tradeoffs.

### 2026-01-19 - Profile Extraction Every 5 Messages
Extract profile data every 5 messages, accumulating progressively. Users see profile "fill in" as they chat.

**Rationale:** Balance between responsiveness and efficiency. Every message is too expensive, only at end misses the progressive reveal.

### 2026-02-02 - Experience-Aware Profiling (Two Tracks)
Two tracks based on `User.experienceLevel` ('new'|'learning'|'experienced'):
- **Track A (New):** Scenario questions ("Plans change - relieved or annoyed?"), simple choices
- **Track B (Experienced):** Reflective questions ("What does trust look like?"), nuance welcome

Both extract to same dimensions via `ProfileDimension.questionType`.

**Rationale:** Meet users where they are. Young/inexperienced users can't answer "what does trust look like?" — they haven't had the experiences yet. Scenarios let them answer honestly about reactions they can imagine.

### 2026-02-02 - User-Defined Dealbreakers
Any dimension can be marked `dealbreaker: true`. Dealbreakers filter out matches entirely (positions >2 apart or missing = no match).

**Rationale:** Users know their own hard requirements. Someone who won't do long distance shouldn't see long-distance matches.

### 2026-02-02 - No Fixed Profile Minimums
Sparse profiles = smaller candidate pool, not lower scores. Confidence score ('low'|'medium'|'high') reflects completeness.

**Rationale:** Incentivize through value, not gates. Requiring X questions creates friction and assumes everyone has the same self-knowledge.

### 2026-02-02 - Scenario Questions Extract Same Dimensions
Scenario and reflective questions measure same dimensions. Different LLM prompts handle different answer styles. Direct choice answers map without LLM (`mapDirectChoice()`).

**Rationale:** The dimensions are what matter for matching. How we discover them can vary by user.

---

*See dev/decisions.md for historical decisions prior to workflow restructuring.*
