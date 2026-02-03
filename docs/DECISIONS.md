# DECISIONS.md

> Append-only log of significant decisions.

Add entries when making choices that affect architecture, constrain future options, or involve tradeoffs.

---

## Current Decisions

### 2026-02-02 - Experience-Aware Profiling
Two question tracks based on experience level:
- **Track A (New/Learning):** Scenario questions, simple choices
- **Track B (Experienced):** Reflective questions, nuance welcome

**Why:** Meet users where they are. Young users can't answer "what does trust look like?" — scenarios let them answer about reactions they can imagine.

### 2026-02-02 - User-Defined Dealbreakers
Any dimension can be marked `dealbreaker: true`. Dealbreakers filter out matches entirely.

**Why:** Users know their own hard requirements.

### 2026-02-02 - No Fixed Profile Minimums
Sparse profiles = smaller pool, not blocked. Confidence score reflects completeness.

**Why:** Incentivize through value, not gates.

### 2026-01-24 - Project Workflow Structure
CLAUDE.md + docs/{PRODUCT,ROADMAP,STATUS,DECISIONS}.md + design/. PM owns PRODUCT/ROADMAP/design, agents write STATUS/DECISIONS.

**Why:** Clear separation. New sessions pick up context quickly.

### 2026-01-19 - Multi-Provider LLM Client
Unified client supporting Anthropic and Ollama. Claude for production, local for dev.

**Why:** Flexibility for cost/privacy tradeoffs without LangChain complexity.

### 2026-01-19 - Skip Self-Hosted LLM (For Now)
Staying with Claude API instead of Ollama/vLLM.

**Why:** Tested models (Vicuna, Claude 3.5 Sonnet) performed poorly — slow, cringey, or didn't follow instructions. Claude Sonnet 4 quality worth the API cost during beta.

### 2026-01-19 - Profile Extraction Every Message (While Incomplete)
Extract profile data every message until basics complete, then stop.

**Why:** During onboarding, critical info (name, age, location) must be captured immediately. Once complete, nightly batch handles updates.

### 2026-01-19 - Adaptive Chat Agent Persona
Agent mirrors user's depth/tone rather than pushing therapeutic approach.

**Why:** Not everyone wants therapy-speak. Trust builds when agent meets them where they are.

---

## Historical Decisions

### Dec 2025 - Magic Link Authentication
Passwordless email auth instead of password or OAuth.

**Why:** Low friction, secure, modern pattern for relationship apps.

### Dec 2025 - Single Profile + Context Intent
One Profile (shared values/lifestyle) + separate ContextIntent per context (romantic, friendship, etc).

**Why:** Agent needs full picture for matching. Context-specific fields don't make sense globally.

### Dec 2025 - JSON Fields for Flexible Data
Using Postgres JSON for coreValues, beliefs, interpretations rather than normalized tables.

**Why:** Schema flexibility, fewer migrations, rich nested data. TypeScript types kept in sync manually.

### Dec 2025 - Off-the-Record Messages
`off_record=true` messages not stored in database.

**Why:** Privacy-first. Sensitive disclosures shouldn't persist. Honor "forget that" requests truly.

---

## Shelved Decisions

*These were made for features that are now shelved. Kept for reference if revisited.*

### Interpretation Engine (Phase 2) - SHELVED
Multi-framework therapeutic interpretation with transparent display. Background job queue with database polling.

**Why shelved:** Simpler dimension-based matching approach is sufficient for MVP. May revisit post-launch.

---
*Last updated: 2026-02-02*
