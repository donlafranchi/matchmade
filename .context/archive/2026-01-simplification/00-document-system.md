# Essential Living Documents System

**Purpose:** Maintain only what's necessary, update in place, avoid document proliferation
**Last Updated:** 2025-12-27

---

## The Problem with Document Proliferation

Traditional software projects accumulate documents:
- Multiple specs that contradict each other
- Outdated briefs that never get deleted
- Proposals that were never implemented
- Logs that pile up until cleanup is needed
- READMEs that get stale

**The result:** Confusion, wasted time searching, unclear source of truth

---

## Our Solution: Essential Living Documents Only

### The Core Principle

**One source of truth per topic. Update in place. Archive major versions. Delete nothing else.**

### The Essential Documents

```
.context/
├── what-we-are-building.md   ← SHORT concise doc (for you)
├── product-spec.md           ← Detailed product vision (for LLM agents)
├── compatibility-hierarchy.md ← Detailed algorithm (for LLM agents)
├── roadmap.md                ← Living plan (for LLM agents)
├── DOCUMENT-SYSTEM.md        ← This file (how to maintain docs)
│
├── vision/
│   └── profile-as-interpretation.md ← Technical vision (for LLM agents)
│
└── archive/
    ├── v1/                   ← Old versions (reference only)
    ├── roadmap/              ← Old roadmap versions
    └── compatibility-hierarchy/ ← Old hierarchy versions
```

**That's it.** Six living documents + archives.

**For you:** Read `what-we-are-building.md` (short, plain English, no examples)
**For LLM agents:** Use product-spec, compatibility-hierarchy, roadmap (detailed, wordy, examples)

---

## Document Roles & Update Cadence

### 1. what-we-are-building.md
**Role:** Concise product definition (for you)
**Owner:** Product vision (you)
**Update frequency:** When core understanding changes
**Contains:**
- What the product is (1 paragraph)
- How matching works (hierarchy: attraction → lifestyle → values)
- How profiles work (conversational, interpreted, progressive)
- How events work (group matching, mysterious insights)
- Why it works (lifestyle overlooked, decency foundation, mystery)
- Build order (list only)

**Style:** Plain English, concise, NO examples, NO wordiness

**When to update:**
- Core hierarchy changes
- Product understanding shifts
- Build order changes

**When NOT to update:**
- Implementation details (those go in other docs)
- Examples (keep it abstract)
- Verbose explanations (keep it SHORT)

### 2. product-spec.md
**Role:** Detailed product definition (for LLM agents)
**Owner:** Product vision (you)
**Update frequency:** When product direction changes
**Style:** Can be wordy, include examples, detailed
**Contains:**
- Product vision and success metrics
- Core principles (non-negotiables)
- Values schema
- Build order (high-level phases)
- UX/tone guidelines
- Data models (Prisma)
- Development workflow

**When to update:**
- Product vision shifts
- New non-negotiables discovered
- Schema changes (significant)
- Build order changes

**When NOT to update:**
- Individual feature details (those go in roadmap)
- Implementation logs (those go in dev/logs/)
- Bug fixes or minor changes

### 3. compatibility-hierarchy.md
**Role:** Core matching algorithm—the science of relationship duration
**Owner:** Matching logic (you + data)
**Update frequency:** When matching algorithm changes
**Contains:**
- The five layers (Attraction → Lifestyle → Decency → Values → Psychology)
- Why each layer matters
- Scoring formulas (phase by phase)
- Progressive profiling mechanics
- Group event matching system
- Implementation roadmap (summary)

**When to update:**
- Scoring formula changes
- New compatibility factors discovered
- Phase timing shifts
- User research reveals new insights

**When NOT to update:**
- Individual feature implementations (those go in roadmap)
- Specific question wording (those go in roadmap)
- Bug fixes in scoring

### 4. roadmap.md
**Role:** Living plan—what we're working on right now
**Owner:** Development team
**Update frequency:** Weekly during active development
**Contains:**
- Current phase status (✅ 🔄 🎯 ⏳ 💭)
- Completed features (leave for reference)
- Features in progress
- Features upcoming
- Acceptance criteria per feature
- Schema changes needed
- Success metrics per phase

**When to update:**
- Feature completed (mark ✅)
- Starting new feature (mark 🔄)
- Priorities shift (re-order)
- New feature discovered (add to appropriate phase)
- Acceptance criteria met (check off)

**When NOT to update:**
- Don't delete completed phases (mark complete, leave context)
- Don't create separate phase documents (keep all here)
- Don't split into multiple roadmaps (one source of truth)

### 5. profile-as-interpretation.md
**Role:** Technical vision for how profiles work
**Owner:** Interpretation engine design
**Update frequency:** When interpretation approach changes
**Contains:**
- Core principles (conversational, interpreted, fuzzy)
- Therapeutic frameworks (Maté, Perel, Gottman, IFS, Attachment)
- Profile structure (how insights are displayed)
- Implementation phases (detailed)
- Privacy and ethics considerations

**When to update:**
- Interpretation approach changes
- New therapeutic framework added
- Profile display structure changes
- Privacy concerns emerge

**When NOT to update:**
- Individual prompt engineering (implementation details)
- Specific LLM models used (those are ephemeral)
- Bug fixes in interpretation

### 00. DOCUMENT-SYSTEM.md (This File)
**Role:** How to maintain the document system itself
**Owner:** Project maintainer
**Update frequency:** When document protocol changes
**Contains:**
- Document roles and responsibilities
- Update cadence and criteria
- Archival protocol
- What NOT to do

**When to update:**
- Document structure changes
- New document added to core set
- Update protocol changes

---

## What Goes Where?

### Implementation Logs → dev/logs/
**Format:** `{feature}-implementation-{date}.md` or `{ticket-number}-{date}.md`
**When to create:** After significant implementation work
**Contains:**
- What was built
- Why decisions were made
- Tests run and results
- Follow-up items
- Blockers encountered

**Lifecycle:**
- Created after work completes
- Referenced in commits
- Archived when old (move to dev/logs/archive/)
- Never referenced as source of truth

### Tickets → dev/tickets/
**Format:** `ticket-{number}-{feature-name}.md` or organized in `phase-N/` subdirectories
**When to create:** When planning a feature
**Contains:**
- Feature scope (in/out)
- Acceptance criteria
- Models touched
- UX states
- Guardrails

**Lifecycle:**
- Created before work starts
- Updated during work
- Marked complete when done
- Archived in phase folders (e.g., dev/tickets/phase-1/)
- Never deleted (historical reference)

### Proposals → dev/proposals/
**Format:** `{feature-name}-proposal-{date}.md`
**When to create:** When exploring an approach (not yet decided)
**Contains:**
- Problem statement
- Multiple solution options
- Trade-offs
- Recommendation

**Lifecycle:**
- Created during exploration
- Discussed and decided
- Either implemented (→ roadmap) or rejected (→ archive)
- Archived after decision made (don't leave orphaned proposals)

### Decisions → dev/decisions.md
**Format:** Single file with dated entries
**When to update:** After making a significant decision
**Contains:**
- Date
- Decision made
- Context/why
- Alternatives considered
- Who decided

**Lifecycle:**
- Updated in place (append new decisions)
- Never delete old decisions (historical record)
- Reference when revisiting decisions

---

## Archival Protocol

### When to Archive

**Archive a document when:**
- Major version change (v1 → v2)
- Fundamental approach shifts
- Historical reference needed but no longer current

**Do NOT archive:**
- Minor updates (those update in place)
- Work in progress (wait until major milestone)
- Individual features (those aren't versioned)

### How to Archive

1. Copy current document to `.context/archive/{document-name}/v{N}.md`
2. Add header to archived version: "Archived - Superseded by v{N+1}"
3. Continue updating main document
4. Link to archive from main document if helpful

**Example:**
```bash
# Archiving product-spec v1 → v2
cp .context/product-spec.md .context/archive/product-spec/v1.md
# Add "Archived - Superseded by v2" to v1
# Continue editing .context/product-spec.md
```

---

## What NOT to Do

### ❌ Don't Create Multiple Roadmaps
**Wrong:**
- roadmap-2025-q1.md
- roadmap-2025-q2.md
- roadmap-phase-1.md
- roadmap-phase-2.md

**Right:**
- roadmap.md (update in place, mark phases complete)

### ❌ Don't Create Duplicate Specs
**Wrong:**
- product-spec.md
- product-spec-v2.md
- product-spec-new.md
- product-requirements.md

**Right:**
- product-spec.md (update in place)
- .context/archive/product-spec/v1.md (archived versions only)

### ❌ Don't Let Briefs Proliferate
**Wrong:**
- 10 separate brief files that never get updated
- Outdated briefs that contradict roadmap
- Briefs that are never referenced

**Right:**
- Consolidate briefs into roadmap.md
- Archive old briefs in .context/archive/briefs/ (if needed for reference)
- Update roadmap as work progresses

### ❌ Don't Create "Working" or "Draft" Documents
**Wrong:**
- working-spec.md
- draft-roadmap.md
- notes-for-later.md
- ideas.md

**Right:**
- Update the main document directly
- Use comments (<!-- TODO: ... -->) for WIP sections
- Use git branches if you need to experiment

### ❌ Don't Create Documents for Every Session
**Wrong:**
- session-log-2025-12-15.md
- session-log-2025-12-16.md
- session-log-2025-12-17.md
- ...50 session logs later...

**Right:**
- Implementation logs only for significant work (in dev/logs/)
- Archive logs when old
- Reference commits for detailed history

---

## Document Maintenance Checklist

### Weekly During Active Development
- [ ] Update roadmap.md (mark completed items ✅)
- [ ] Move current focus forward (mark 🔄 → 🎯)
- [ ] Add new discoveries to appropriate phase
- [ ] Archive old implementation logs (if pile-up)

### When Major Milestone Reached
- [ ] Update product-spec.md (if direction changed)
- [ ] Update compatibility-hierarchy.md (if formula changed)
- [ ] Archive old version (if major version bump)
- [ ] Update roadmap.md (mark phase complete)

### When Product Direction Shifts
- [ ] Update product-spec.md (non-negotiables, principles)
- [ ] Update compatibility-hierarchy.md (if affects matching)
- [ ] Update roadmap.md (reprioritize phases)
- [ ] Document decision in dev/decisions.md

### Monthly Review
- [ ] Are all living documents current?
- [ ] Are there orphaned proposals? (archive them)
- [ ] Are there outdated briefs? (archive them)
- [ ] Is dev/logs/ getting too large? (archive old logs)
- [ ] Do we need to archive a major version?

---

## Benefits of This System

### 1. Single Source of Truth
- No confusion about which document is current
- No contradictory specs
- Clear ownership per document

### 2. Update in Place (No Proliferation)
- Document count stays constant (5 core documents)
- No cleanup needed (nothing piles up)
- Easy to find what you need

### 3. Historical Context Preserved
- Completed phases stay in roadmap (marked ✅)
- Old decisions stay in decisions.md (dated)
- Major versions archived (reference only)

### 4. Low Maintenance Burden
- Weekly updates only
- No separate "cleanup" phase needed
- Documents stay current naturally

### 5. Clear Update Criteria
- Know when to update (criteria defined)
- Know when NOT to update (avoid churn)
- Know when to archive (major milestones only)

---

## FAQ

### Q: What if I need to experiment with a new approach?
**A:** Use git branches or proposals. Propose → Decide → Update main docs or archive proposal.

### Q: What if a document gets too long?
**A:** Split ONLY if there's a clear separation of concerns. Update this file to document the new structure.

### Q: What if briefs/ directory has 20 files and is confusing?
**A:** Consolidate into roadmap.md, archive old briefs in .context/archive/briefs/. We've done this already.

### Q: What about session logs and working notes?
**A:** Create in dev/logs/ only for significant work. Archive when old. Use git commits for detailed history.

### Q: How do I know if something should be a new document?
**A:** Ask: Is this a new SOURCE OF TRUTH that will be updated independently? If no, add to existing document or create a proposal.

### Q: What about README files in subdirectories?
**A:** Acceptable for explaining directory structure or how to run code. But keep brief and link to main docs.

---

## Summary: The Six Essential Documents

**For you (short, plain English):**
1. **what-we-are-building.md** - Everything in one place, concise

**For LLM agents (detailed, wordy):**
2. **product-spec.md** - What we're building (product vision)
3. **compatibility-hierarchy.md** - How matching works (algorithm)
4. **roadmap.md** - What we're working on (living plan)
5. **vision/profile-as-interpretation.md** - How profiles work (technical vision)
6. **DOCUMENT-SYSTEM.md** - How to maintain docs (this file)

**Everything else:**
- Implementation logs → dev/logs/ (archive when old)
- Tickets → dev/tickets/ (organize in phase folders)
- Proposals → dev/proposals/ (archive after decision)
- Decisions → dev/decisions.md (single file, append new entries)
- Archives → .context/archive/ (reference only, never current)

**Keep it simple. Update in place. Archive major versions. Delete nothing else.**

---

*This system prevents document proliferation while maintaining historical context. Follow it consistently and documentation will stay clean, current, and useful.*
