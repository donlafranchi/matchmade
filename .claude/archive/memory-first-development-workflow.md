# Memory-First Architecture for Agentic Development Workflow

**Date:** 2025-12-28
**Purpose:** Apply memory-first architecture principles to Claude Code agents and development workflow
**Context:** Improve context management, reduce token costs, and enhance agent reasoning during development

---

## Executive Summary

Your current development workflow with Claude Code agents has strong foundations but can significantly benefit from memory-first principles. The goal is to make agents more effective by treating **context as a compiled view** rather than forcing them to read entire transcripts of past work.

**Current State:**
- ✅ Good separation: [dev/project-state.md](dev/project-state.md) as single source of truth
- ✅ Good logging: Architecture docs, implementation logs, session logs
- ✅ Good structure: Tickets, decisions, handoffs documented
- ⚠️  **Issue:** Agents still read FULL context (all logs, all tickets, all files)
- ⚠️  **Issue:** No tiered memory (working context vs long-term memory)
- ⚠️  **Issue:** No retrieval system (agents inherit everything)
- ⚠️  **Issue:** No strategy evolution (agents don't learn from past work)

---

## The Core Problem

**Current Agent Activation:**
```
Activate ARCHITECT role.

Load:
- dev/roles/architect.md
- dev/project-state.md (current state)
- dev/tickets/[ticket-name].md
- .context/llm-dev-context.md
- .context/values-schema.md

Context: [Describe the feature to architect]
```

**What happens:**
- Agent reads 5+ files (10,000+ tokens)
- Most content is NOT relevant to current task
- Signal-to-noise ratio is low
- Agent context window fills with historical data
- Cost and latency increase linearly with project size

**As your project grows:**
- 50 tickets → agent reads all 50 (even if only 2 are relevant)
- 30 session logs → agent reads all 30 (even if only last 3 matter)
- 20 implementation logs → agent reads all 20 (even if current task is unrelated)

---

## Memory-First Principles Applied to Development

### Principle 1: Context as Compiled View

**INSTEAD OF:** Agent inherits all project history
**DO THIS:** Agent receives a **minimal, relevance-filtered** view

#### Current Activation (Bloated Context)
```markdown
Activate ARCHITECT role.

Load:
- dev/project-state.md (1500 lines)
- All 15 files in dev/tickets/ (3000+ lines)
- All 30 files in .context/session-logs/ (10,000+ lines)
- .context/llm-dev-context.md (500 lines)
- .context/values-schema.md (400 lines)

Total: ~15,000+ tokens just to start
```

#### Memory-First Activation (Compiled Context)
```markdown
Activate ARCHITECT role.

**Current Task:** Design architecture for Lifestyle Compatibility Layer (Phase 2)

**Compiled Context:**
- **Project State**: Phase 2 started, Phase 1 complete
- **Relevant Decisions**:
  - Schema: Single Profile + ContextIntent model (see dev/decisions.md:45-67)
  - Analysis: Gabor Maté framework implemented (Phase 2, Ticket 2-02)
- **Recent Relevant Work**:
  - Ticket 2-05 complete: Profile view with interpretations (2025-12-26)
  - Background job system working (Ticket 2-03, 2025-12-26)
- **Dependencies**: Profile model exists, AnalysisJob model exists
- **Constraints**: Must align with compatibility hierarchy (Attraction → Lifestyle → Values)

**Your Task:**
Design 10-15 lifestyle compatibility questions and scoring algorithm.

**Reference if needed (don't load unless relevant):**
- dev/decisions.md:45-67 - Schema design rationale
- dev/logs/ticket-2-03-implementation-2025-12-26.md - Job queue architecture
```

**Token Reduction: 15,000 → ~500 tokens (30x reduction)**

---

### Principle 2: Tiered Memory Model

Build a **4-tier memory system** for development context:

#### Tier 1: Working Context (Per-Agent View)
**Purpose:** Minimal context for current task only
**Lifespan:** Single agent invocation (ephemeral)

**Structure:**
```markdown
# Working Context: system-architect agent

## Current Goal
Design Lifestyle Compatibility Layer architecture

## Immediate Dependencies
- Profile model (ProfileNew table, userId FK)
- ContextIntent model (userId + contextType FK)
- Existing analysis pipeline (analyzeUserProfile function)

## Relevant Patterns
- Question storage: Use Json field (see Profile.interpretations pattern)
- Scoring: 0-100 scale (align with existing completeness pattern)
- API: Follow GET /api/profile/interpretations pattern

## Known Constraints
- Must not require new database tables (Phase 2 constraint)
- Must align with 3-layer hierarchy (Attraction → Lifestyle → Values)
- Questions stored in config file, not hardcoded

## Previous Similar Work
- Profile.interpretations JSON structure (Ticket 2-01)
- Pattern extraction logic (web/lib/interpretation/patterns.ts)
```

**Token Budget:** ~500 tokens
**Agent sees ONLY what's needed for current task**

#### Tier 2: Session Memory (Structured Event Log)
**Purpose:** Record trajectory of decisions during this work session
**Lifespan:** Current development session

**Structure:**
```typescript
// dev/sessions/2025-12-28-lifestyle-layer.json
{
  "sessionId": "session_2025-12-28_lifestyle",
  "startedAt": "2025-12-28T10:30:00Z",
  "goal": "Design and implement Lifestyle Compatibility Layer",

  "events": [
    {
      "type": "agent_activated",
      "agent": "system-architect",
      "timestamp": "2025-12-28T10:30:15Z",
      "task": "Design lifestyle questions"
    },
    {
      "type": "decision_made",
      "agent": "system-architect",
      "decision": "Store questions in JSON config file",
      "rationale": "Easier to iterate without code changes",
      "timestamp": "2025-12-28T10:35:22Z"
    },
    {
      "type": "architecture_created",
      "agent": "system-architect",
      "artifact": "dev/logs/lifestyle-layer-architecture-2025-12-28.md",
      "timestamp": "2025-12-28T10:45:00Z"
    },
    {
      "type": "agent_activated",
      "agent": "code-implementer",
      "timestamp": "2025-12-28T11:00:00Z",
      "task": "Implement lifestyle questions"
    },
    {
      "type": "file_created",
      "agent": "code-implementer",
      "file": "web/lib/lifestyle/questions.ts",
      "loc": 85,
      "timestamp": "2025-12-28T11:20:00Z"
    }
  ],

  "handoffs": [
    {
      "from": "system-architect",
      "to": "code-implementer",
      "artifact": "dev/logs/lifestyle-layer-architecture-2025-12-28.md",
      "context": "Architecture complete, ready for implementation"
    }
  ],

  "completedAt": null // Still in progress
}
```

**Benefits:**
- Next agent can see **trajectory of decisions**, not just final artifacts
- Can replay session to understand "why" decisions were made
- Structured format enables programmatic querying

#### Tier 3: Long-Term Memory (Durable Project Knowledge)
**Purpose:** Searchable, queryable project knowledge base
**Lifespan:** Entire project lifetime

**Current Structure (Good!):**
```
dev/
├── project-state.md        # Current state (single source of truth)
├── decisions.md            # Key architectural decisions
├── tickets/                # Work specifications
├── logs/                   # Architecture & implementation docs
│   ├── README.md
│   └── archive/           # Old logs (context reduction)
.context/
├── session-logs/          # Historical session records
└── vision/                # Strategic documents
```

**Memory-First Enhancement:**

Add **structured index** for retrieval:

```typescript
// dev/memory/index.json
{
  "decisions": [
    {
      "id": "decision_001",
      "decision": "Single Profile + ContextIntent model (Option 1)",
      "date": "2025-12-22",
      "context": "Schema refactor for Phase 2",
      "rationale": "Agent sees full picture, trust boundary in matching filter",
      "references": ["dev/decisions.md:45-67"],
      "supersedes": ["decision_000"],
      "tags": ["schema", "architecture", "phase-2"]
    }
  ],

  "patterns": [
    {
      "id": "pattern_001",
      "pattern": "JSON fields for flexible schema",
      "examples": [
        "Profile.interpretations",
        "Profile.rawPatterns",
        "ContextIntent.interpretations"
      ],
      "whenToUse": "When structure may evolve or vary by context",
      "references": ["web/prisma/schema.prisma:104-106"],
      "tags": ["database", "schema-design"]
    }
  ],

  "implementations": [
    {
      "id": "impl_001",
      "feature": "Background job queue system",
      "date": "2025-12-26",
      "files": [
        "web/lib/interpretation/jobs/queue.ts",
        "web/lib/interpretation/jobs/triggers.ts"
      ],
      "approach": "Database polling with priority queue",
      "artifacts": ["dev/logs/ticket-2-03-implementation-2025-12-26.md"],
      "reusableFor": ["background processing", "async tasks", "rate limiting"],
      "tags": ["background-jobs", "queue", "phase-2"]
    }
  ]
}
```

**Retrieval Query Examples:**
```typescript
// Agent needs to know: "How do we handle background processing?"
query({ tags: ["background-jobs", "async tasks"] })
// Returns: impl_001 (job queue pattern)

// Agent needs to know: "What schema patterns exist?"
query({ tags: ["schema-design"] })
// Returns: pattern_001 (JSON fields for flexible schema)

// Agent needs to know: "Why did we choose Option 1 schema?"
query({ decision: "Schema refactor", tags: ["phase-2"] })
// Returns: decision_001 with rationale
```

#### Tier 4: Artifacts (Large Objects by Handle)
**Purpose:** Store full content separately, reference by pointer
**Lifespan:** Permanent, but not loaded unless explicitly retrieved

**Current:** Large files are directly loaded into agent context
**Memory-First:** Reference by handle, retrieve on demand

**Example:**

```markdown
# Working Context for code-implementer

## Architecture Reference
**Document:** dev/logs/lifestyle-layer-architecture-2025-12-28.md
**Handle:** artifact://arch_lifestyle_2025_12_28
**Summary:** 10-15 lifestyle questions stored in JSON config, scoring 0-100

**Key Sections:**
- Questions structure: JSON array with id, text, responseType, weight
- Scoring algorithm: Weighted average with normalization
- API endpoint: GET /api/profile/lifestyle-score

**Retrieve full document:** If you need detailed type definitions or integration points, use:
`retrieve_artifact(handle: "artifact://arch_lifestyle_2025_12_28")`

**For now, you have enough context to start implementation.**
```

**Benefits:**
- Agent context stays minimal
- Full architecture document (2000+ tokens) not loaded unless needed
- Agent can request specific sections if needed

---

### Principle 3: Scope by Default (Retrieval Over Inheritance)

**Current Problem:**
```markdown
Activate FEATURE PLANNER role.

Load:
- dev/roles/feature-planner.md
- .context/llm-dev-context.md (build order)
- .context/briefs/[XX-feature-name].md
- All files in dev/tickets/ (50 tickets)
- All directories in dev/slices/
- Latest 5 session logs in .context/session-logs/
```

**Agent inherits 50 tickets even though only 2 are relevant.**

**Memory-First Approach:**

```markdown
Activate FEATURE PLANNER role.

**Default Context:** EMPTY (agent starts with nothing)

**Available Retrieval Tools:**
- retrieve_project_state() → Current phase, active work, blockers
- retrieve_build_order() → Next features in sequence
- retrieve_recent_completions(count: 5) → Last 5 completed features
- search_tickets(query: "lifestyle", status: "open") → Relevant tickets
- search_decisions(tags: ["phase-2"]) → Relevant past decisions

**Your Task:**
What feature should we build next?

**Process:**
1. Retrieve project state to understand where we are
2. Retrieve build order to see what's next
3. Retrieve recent completions to avoid duplicates
4. If needed, search tickets/decisions for context
```

**Agent actively pulls what it needs, rather than passively inheriting everything.**

**Implementation:**

```typescript
// dev/memory/retrieval.ts

export function retrieve_project_state(): ProjectState {
  // Return ONLY: current phase, active work, blockers
  // Do NOT return: full history, all tickets, all logs

  return {
    currentPhase: "Phase 2 - Interpretation Engine",
    activeWork: "Phase 2 complete, ready for Phase 3",
    blockers: [],
    lastCompleted: "Ticket 2-05 (Profile view with interpretations)",
    completedDate: "2025-12-27"
  };
}

export function retrieve_build_order(currentPhase: string): BuildOrder {
  // Return ONLY: next 3 features in sequence
  // Do NOT return: entire roadmap

  return {
    currentPhase: "Phase 2",
    nextPhases: [
      { id: "phase-3", name: "Profile View Redesign", status: "not_started" },
      { id: "phase-4", name: "Media Upload", status: "not_started" },
      { id: "phase-5", name: "Attraction Mode", status: "not_started" }
    ]
  };
}

export function search_tickets(query: {
  text?: string;
  status?: "open" | "complete";
  tags?: string[]
}): Ticket[] {
  // Semantic search or tag-based filtering
  // Return top 5 relevant tickets only

  const allTickets = loadAllTickets(); // From dev/tickets/
  const relevant = filterByRelevance(allTickets, query);
  return relevant.slice(0, 5); // Top 5 only
}
```

---

### Principle 4: Schema-Driven Summarization (Reversible)

**Current State:** Session logs and implementation logs are free-form text
**Issue:** Hard to query, hard to extract structured information

**Memory-First Approach:** Use structured schemas that preserve evidence trails

#### Implementation Log Schema (Reversible)

```typescript
// dev/memory/schemas/implementation-log.schema.json
{
  "logId": "impl_2025_12_28_lifestyle",
  "feature": "Lifestyle Compatibility Layer",
  "date": "2025-12-28",
  "agent": "code-implementer",

  // Structured changes (machine-readable)
  "filesCreated": [
    {
      "path": "web/lib/lifestyle/questions.ts",
      "loc": 85,
      "purpose": "Lifestyle question definitions and types",
      "exports": ["lifestyleQuestions", "LifestyleQuestion", "calculateLifestyleScore"]
    }
  ],

  "filesModified": [
    {
      "path": "web/app/api/profile/route.ts",
      "linesChanged": [145, 167],
      "changeType": "add_endpoint",
      "purpose": "Add GET /api/profile/lifestyle-score endpoint"
    }
  ],

  // Key decisions (reversible - can trace back)
  "decisions": [
    {
      "decision": "Store questions in TS file, not database",
      "rationale": "Easier to version control and iterate",
      "evidence": "Architecture doc specified JSON config",
      "references": ["dev/logs/lifestyle-layer-architecture-2025-12-28.md:45"]
    }
  ],

  // Tests (verifiable)
  "testsCoverage": {
    "unit": [
      {
        "file": "web/lib/lifestyle/__tests__/scoring.test.ts",
        "covers": ["calculateLifestyleScore", "normalizeAnswers"],
        "cases": 8
      }
    ],
    "integration": [
      {
        "file": "web/app/api/profile/__tests__/lifestyle.test.ts",
        "covers": ["GET /api/profile/lifestyle-score"],
        "cases": 4
      }
    ]
  },

  // Reversibility: Full free-form log still exists
  "fullLogArtifact": "dev/logs/lifestyle-layer-implementation-2025-12-28.md",

  // Can reconstruct "why" for any change
  "reconstructible": true
}
```

**Benefits:**
- Structured data can be queried programmatically
- Evidence trails preserved (references to architecture docs)
- Can answer: "Why did we make this decision?" → Trace back to rationale
- Full free-form log still exists for human review

---

### Principle 5: Sub-Agents to Isolate State

**Current State:** Single agent reads all context, does all work
**Issue:** Context explosion, cognitive overload

**Memory-First Approach:** Specialized sub-agents with narrow, isolated scope

#### Example: Feature Planner Agent (Current)

```markdown
Activate FEATURE PLANNER role.

Load: [15,000+ tokens of context]

Tasks:
1. Review current state
2. Identify next feature
3. Read relevant brief
4. Define acceptance criteria
5. List dependencies
6. Create test plan
7. Output ticket
```

**Agent does 7 tasks with full project context (expensive, slow)**

#### Memory-First: Coordinator + Sub-Agents

```markdown
# Parent: Feature Planning Coordinator

## Task: Determine next feature to build

## Sub-Agent 1: Project State Assessor
**Scope:** ONLY current state (no history)
**Context:** dev/project-state.md (500 tokens)
**Task:** What phase are we in? What's complete? What's next?
**Output:** { phase: "Phase 2", lastComplete: "Ticket 2-05", next: "Phase 3" }

## Sub-Agent 2: Build Order Navigator
**Scope:** ONLY build order (no project history)
**Context:** .context/roadmap.md (300 tokens)
**Task:** What's Phase 3? What are its prerequisites?
**Output:** { phase3: "Profile View Redesign", prerequisites: ["Phase 2 complete"] }

## Sub-Agent 3: Dependency Checker
**Scope:** ONLY Phase 3 dependencies
**Context:** Search results for "Phase 3" (200 tokens)
**Task:** Are all prerequisites met?
**Output:** { ready: true, blockers: [] }

## Sub-Agent 4: Ticket Writer
**Scope:** ONLY ticket template + Phase 3 info
**Context:** Phase 3 definition + template (400 tokens)
**Task:** Write ticket for first Phase 3 feature
**Output:** dev/tickets/phase-3-profile-redesign.md
```

**Token Reduction: 15,000 → ~1,400 tokens (10x reduction)**
**Benefits:** Each sub-agent has minimal, focused context

---

### Principle 6: Prompt Caching and Prefix Stability

**Current Agent Prompt Structure (Inefficient):**

```markdown
You are an expert Software System Architect...

[2000 tokens of role definition - changes rarely]

## Your Process
[800 tokens of instructions - never changes]

## Your Guidelines
[600 tokens of best practices - never changes]

## Current Task
Design architecture for Lifestyle Compatibility Layer
[Project-specific context - changes every call]
```

**Every agent invocation costs: 3,400 input tokens**

**Memory-First Approach (Cached Prefix):**

```markdown
# CACHED PREFIX (reused across all invocations)
You are an expert Software System Architect...

[2000 tokens of role definition]

## Your Process
[800 tokens of instructions]

## Your Guidelines
[600 tokens of best practices]

## Output Format
[500 tokens of format specs]

---

# VARIABLE SUFFIX (changes per task)
## Current Task
Design architecture for Lifestyle Compatibility Layer

## Relevant Context
- Phase: Phase 2 complete
- Dependencies: Profile model, AnalysisJob model
- Constraints: No new DB tables

## Your Output
Create: dev/logs/lifestyle-layer-architecture-2025-12-28.md
```

**With Anthropic Prompt Caching:**
- First call: 3,400 tokens (3,900 tokens with suffix)
- Subsequent calls: 500 tokens (only variable suffix)

**Savings: 87% reduction on input tokens after first call**

**Implementation:**

```typescript
// .claude/agents/system-architect.md (cached prefix)
const CACHED_PREFIX = `
You are an expert Software System Architect...
[Full role definition - never changes]
`;

// Per-invocation context (variable suffix)
const variableSuffix = `
## Current Task
${task}

## Relevant Context
${compileRelevantContext(task)}
`;

// API call with caching
await anthropic.messages.create({
  model: "claude-sonnet-4.5",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: CACHED_PREFIX,
          cache_control: { type: "ephemeral" } // Cache this!
        },
        {
          type: "text",
          text: variableSuffix // Fresh every time
        }
      ]
    }
  ]
});
```

---

### Principle 7: Agent Strategies Evolve

**Current State:** Agent definitions are static ([.claude/agents/*.md](.claude/agents/))
**Issue:** Agents don't improve from experience, same mistakes repeat

**Memory-First Approach:** Agents learn from execution feedback

#### Strategy Evolution Example

**Scenario:** system-architect agent repeatedly forgets to check existing patterns

**Feedback Loop:**

```typescript
// After architecture document created
const feedback = {
  agentId: "system-architect",
  sessionId: "session_2025_12_28",
  issue: "Architecture didn't reference existing job queue pattern",
  correction: "Should have searched for 'background-jobs' tag before designing new queue",
  timestamp: "2025-12-28T11:45:00Z"
};

// Update agent strategy incrementally
await evolveAgentStrategy("system-architect", {
  adjustment: `
## Enhanced Process Step

Before designing background job systems:
1. Search memory index for tag: "background-jobs"
2. Review existing patterns: web/lib/interpretation/jobs/queue.ts
3. Reuse pattern if applicable, justify if diverging
`,
  trigger: feedback,
  version: "1.1"
});
```

**Result:** Next time system-architect designs a background task, it retrieves existing queue pattern first

**Agent Evolution Schema:**

```typescript
// .claude/agents/system-architect.versions/
{
  "agentId": "system-architect",
  "currentVersion": "1.1",

  "versions": [
    {
      "version": "1.0",
      "createdAt": "2025-12-15",
      "promptFile": ".claude/agents/system-architect.md",
      "performanceMetrics": {
        "avgTokenUsage": 5200,
        "avgAccuracyScore": 0.82,
        "commonIssues": ["missed existing patterns", "verbose output"]
      }
    },
    {
      "version": "1.1",
      "createdAt": "2025-12-28",
      "promptFile": ".claude/agents/system-architect.v1.1.md",
      "changesFrom": "1.0",
      "improvements": [
        "Added memory index search before designing patterns",
        "Added explicit step to review similar implementations"
      ],
      "performanceMetrics": {
        "avgTokenUsage": 4800,
        "avgAccuracyScore": 0.91,
        "commonIssues": ["verbose output"]
      }
    }
  ]
}
```

---

## Implementation Roadmap

### Phase 1: Compile Context (High Impact, Low Effort)
**Goal:** Stop forcing agents to read entire project history

**Changes:**
1. Create `compileContext()` helper function
2. Update agent activation prompts to use compiled context
3. Reduce default context load by 80%

**Files to modify:**
- [.claude/context.md:166-186](.claude/context.md#L166-L186) - Replace full file loads with compiled context
- Create: `dev/memory/compile-context.ts` (helper script)

**Expected Impact:**
- 5-10x token reduction per agent invocation
- Faster agent startup
- Better focus (less noise)

**Estimated Effort:** 4-6 hours

---

### Phase 2: Structured Session Logs (Medium Impact, Medium Effort)
**Goal:** Record structured event logs during development sessions

**Changes:**
1. Create session log schema (JSON format)
2. Add session tracking to each agent handoff
3. Build event recording into workflow

**Files to create:**
- `dev/sessions/` directory (structured session logs)
- `dev/memory/schemas/session-log.schema.json`
- `dev/memory/session-tracker.ts` (helper)

**Expected Impact:**
- Agents can see decision trajectory, not just final artifacts
- Easier to debug "why" decisions were made
- Structured data enables programmatic queries

**Estimated Effort:** 8-10 hours

---

### Phase 3: Memory Index (High Impact, Medium Effort)
**Goal:** Build searchable index of project knowledge

**Changes:**
1. Create structured index for decisions, patterns, implementations
2. Add tagging system to logs and tickets
3. Build retrieval interface for agents

**Files to create:**
- `dev/memory/index.json` (knowledge index)
- `dev/memory/retrieval.ts` (query interface)
- `dev/memory/update-index.sh` (script to rebuild index)

**Expected Impact:**
- Agents can retrieve relevant context on demand
- Scales to hundreds of tickets/logs without bloat
- Discovery of similar patterns improves

**Estimated Effort:** 12-16 hours

---

### Phase 4: Sub-Agent Architecture (Medium Impact, High Effort)
**Goal:** Split complex agents into specialized sub-agents

**Changes:**
1. Identify agents that do too much (feature-planner, system-architect)
2. Create coordinator agents
3. Build sub-agents with narrow scope

**Files to create:**
- `.claude/agents/coordinators/` directory
- `.claude/agents/sub-agents/` directory
- Update existing agents to use coordinators

**Expected Impact:**
- Better reasoning (less cognitive load per agent)
- Parallelization opportunities
- Easier debugging (isolated failures)

**Estimated Effort:** 16-20 hours

---

### Phase 5: Prompt Caching (Low Effort, Immediate ROI)
**Goal:** Use Anthropic prompt caching to reduce costs

**Changes:**
1. Split agent prompts into cached prefix + variable suffix
2. Add cache_control to API calls (if using Task tool programmatically)
3. Structure stable content for maximum cache reuse

**Files to modify:**
- All agent definition files in [.claude/agents/](.claude/agents/)
- Add caching instructions to each agent's frontmatter

**Expected Impact:**
- 80-90% reduction in input token costs (after first call)
- 10x cheaper agent invocations

**Estimated Effort:** 2-4 hours

---

### Phase 6: Agent Evolution (Low Impact, Medium Effort)
**Goal:** Let agents improve through execution feedback

**Changes:**
1. Create agent versioning system
2. Build feedback collection mechanism
3. Implement incremental prompt updates

**Files to create:**
- `.claude/agents/[agent].versions/` directories
- `dev/memory/agent-feedback.json`
- `dev/memory/evolve-agent.ts` (helper)

**Expected Impact:**
- Agents get smarter over time
- Common mistakes automatically corrected
- Performance metrics tracked

**Estimated Effort:** 10-14 hours

---

## Recommended Priority Order

**Quick Wins (Do First):**
1. **Phase 5: Prompt Caching** (2-4 hours, 10x cost savings)
2. **Phase 1: Compile Context** (4-6 hours, 5-10x token reduction)

**Foundation (Do Next):**
3. **Phase 3: Memory Index** (12-16 hours, enables retrieval)

**Advanced (Do Later):**
4. **Phase 2: Structured Logs** (8-10 hours, better debugging)
5. **Phase 4: Sub-Agents** (16-20 hours, improved reasoning)
6. **Phase 6: Evolution** (10-14 hours, long-term improvement)

---

## Cost Comparison: Before vs After

### Current Architecture (Per Agent Invocation)

**system-architect agent:**
- Context loaded: 15,000+ tokens (all tickets, all logs, all docs)
- Agent prompt: 3,000 tokens (role definition)
- Input total: ~18,000 tokens
- Output: ~2,000 tokens
- Cost: $0.054 input + $0.030 output = **$0.084 per invocation**

**Feature session (5 agents):**
- feature-planner → system-architect → code-implementer → review → qa
- Total cost: ~$0.42 per feature

**Project (50 features):**
- Total agent cost: ~$21.00

---

### Memory-First Architecture (Per Agent Invocation)

**system-architect agent (with optimizations):**
- Compiled context: 500 tokens (only relevant info)
- Cached prefix: 3,000 tokens (free after first use)
- Variable suffix: 500 tokens
- Input total: ~1,000 tokens (cached) or ~4,000 (first call)
- Output: ~2,000 tokens
- Cost: $0.003 input + $0.030 output = **$0.033 per invocation (60% savings)**

**Feature session (5 agents with sub-agents):**
- Coordinator splits into 3 sub-agents (parallel)
- Total cost: ~$0.15 per feature (64% savings)

**Project (50 features):**
- Total agent cost: ~$7.50 (64% savings = **$13.50 saved**)

---

## Open Questions to Resolve

1. **Memory Index Format:** JSON file vs SQLite database?
   - JSON: Simpler, version controlled
   - SQLite: Faster queries, more powerful

2. **Session Tracking:** Automatic vs manual?
   - Automatic: Less friction, but harder to control
   - Manual: More explicit, but requires discipline

3. **Sub-Agent Granularity:** How fine-grained?
   - Option A: 3-5 sub-agents per coordinator (simple)
   - Option B: 10+ micro-agents (maximum isolation)

4. **Caching Strategy:** How to structure agent prompts?
   - All instructions cached (stable)
   - Only role definition cached (flexible)

5. **Evolution Pace:** How often to evolve agent strategies?
   - Per feedback (immediate improvement)
   - Weekly reviews (batched updates)
   - Manual only (safest, slowest)

---

## Next Steps

1. **Review this analysis** and prioritize phases
2. **Resolve open questions** above
3. **Start with Phase 5** (prompt caching) - easiest win
4. **Then Phase 1** (compile context) - biggest impact
5. **Build foundation** (Phase 3: memory index)
6. **Iterate and improve** based on results

---

## References

- Memory-first architecture principles from video
- Google ADK: Tiered memory systems
- Anthropic ACE: Adaptive context engineering
- Nanis paper: Context reduction strategies

**Related Project Docs:**
- [dev/project-state.md](dev/project-state.md) - Current state management
- [.claude/context.md](.claude/context.md) - Agent activation patterns
- [dev/roles/README.md](dev/roles/README.md) - Role descriptions

---

*This document provides a roadmap for transitioning your Claude Code development workflow to memory-first principles. Each phase is actionable, measurable, and designed to improve agent effectiveness while reducing costs.*
