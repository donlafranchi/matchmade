# DECISIONS.md

> Append-only log of significant decisions.

Add entries when making choices that affect architecture, constrain future options, or involve tradeoffs.

---

## Log

### 2026-01-24 - Project Workflow Scaffolding
Adopted CLAUDE.md + docs/{PRODUCT,ROADMAP,STATUS,DECISIONS}.md + design/ folder. PM owns PRODUCT/ROADMAP/design, agents write STATUS/DECISIONS.

### 2026-01-19 - Multi-Provider LLM Client
Unified client supporting Anthropic and Ollama. Claude for production, local LLMs for dev/testing.

### 2026-01-19 - Profile Extraction Every 5 Messages
Extract profile data every 5 messages, accumulating progressively. Users see profile "fill in" as they chat.

### 2026-02-02 - Experience-Aware Profiling
Two tracks based on `User.experienceLevel` ('new'|'learning'|'experienced'):
- New users get scenario questions ("Plans change - relieved or annoyed?")
- Experienced users get reflective questions ("What does trust look like?")

Both extract to same dimensions via `ProfileDimension.questionType`.

### 2026-02-02 - User-Defined Dealbreakers
Any dimension can be marked `dealbreaker: true`. Dealbreakers filter out matches entirely (positions >2 apart or missing = no match).

### 2026-02-02 - No Fixed Profile Minimums
Sparse profiles = smaller candidate pool, not lower scores. Confidence score ('low'|'medium'|'high') reflects completeness. Incentivize through value, not gates.

### 2026-02-02 - Scenario Questions Extract Same Dimensions
Scenario and reflective questions measure same dimensions. Different LLM prompts handle different answer styles. Direct choice answers map without LLM (`mapDirectChoice()`).

---

*See dev/decisions.md for historical decisions prior to workflow restructuring.*
