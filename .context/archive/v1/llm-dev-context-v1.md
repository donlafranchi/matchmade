LLM build packet: minimal context to construct the relationship-builder app (romantic + friendship tracks) with vibe honesty baked in.

---

## Product Essence

Easy, natural, values-first relationship builder that gets people meeting in real life—where chemistry actually happens. Users share information conversationally; the system interprets patterns using therapeutic frameworks (Gabor Mate, Esther Perel, Gottman, IFS, Attachment Theory) to build profiles as "Here's what we're hearing from you." The interface gets out of your way. The app reduces tedious work through listening and interpretation rather than endless forms, avoids awkward wrong-fit dates through deeper pattern matching, and skips pen-pal texting. It supports romantic and non-romantic relationships using the same principles: honesty, deep understanding, real-world connection. It optimizes for conditions where chemistry can emerge; it never promises chemistry.

**Note on Current Implementation:** The rigid dropdown forms in early builds (Slice 1c) are temporary scaffolding. The real product vision is conversational profiling with therapeutic interpretation. Build the scaffolding to enable functionality, but understand the destination is interpreted profiles that make users feel deeply understood.

## Platform & Stack

PWA, mobile-first. Next.js + TypeScript + Tailwind + Postgres + Prisma. Auth via magic link (email/password acceptable). In-app + email notifications; web push optional later.

## Non-Negotiables

- No infinite feeds or engagement optimization; one primary action per screen.
- Values/intent alignment before attraction UI. Attraction is private, fast, photos-only (no text during attraction step).
- Real about who's available ("No matches yet"; no padding).
- Skip the pen-pal phase: coordination-only messaging; default CTA is meeting IRL.
- Sensitive disclosures: support "off the record" + "forget that"; do not store raw sensitive text.
- Interface gets out of your way: uncluttered, one clear action; no fireworks on match reveal.

## Build Order (follow in sequence)

**Phase 1: Functional Scaffolding (Rigid Forms - Temporary)**
1) Auth + context selection + basic routing
2) Agent chat UI; store normal messages; implement off-the-record (do NOT store raw)
3) DerivedProfile extraction stub (rule-based first with rigid forms as temporary UI)
4) Profile preview + completeness nudges
5) Media upload + gallery
6) Attraction mode + persistence + rate limit
7) Matching engine + match reveal
8) Events: seeded list + match-linked interest + RSVP
9) Notifications inbox
10) Feedback + trust aggregate

**Phase 2: Therapeutic Interpretation Engine (Real Product)**
11) Analysis pipeline: LLM prompts for each therapeutic framework
12) Schema additions: Profile.interpretations, ContextIntent.interpretations JSON fields
13) Pattern extraction from chat transcripts (themes, word frequency, tone)
14) Multi-framework synthesis (Mate + Perel + Gottman + IFS + Attachment)
15) Confidence scoring and evidence tracking

**Phase 3: Profile View Redesign (Interpretive UI)**
16) Replace rigid forms with interpreted insights display
17) "Here's what we're hearing from you" profile structure
18) Chat-based refinement flow ("Edit my interpretation")
19) Continuous re-analysis as users share more
20) Matching algorithm based on interpreted patterns

## Values Schema (v2) — working set for all contexts

Single schema that adapts per relationship track (romantic, friendship, professional, creative, service). Key fields to support:

* relationship_context (type, openness_to_overlap)
* orientation (seeking, commitment_horizon, availability_level)
* core_values (closed list: honesty, reliability, respect, growth, curiosity, ambition, creativity, stability, independence, generosity, community, discretion) with weights
* beliefs (politics/religion importance, money risk tolerance, hierarchy vs equality)
* interaction_style (tone, energy_level, communication_preference, pace) — this is where "vibe" lives without promising chemistry
* collaboration_signals (follow_through, planning_vs_improvisation, conflict_handling, accountability_style)
* constraints (location_radius_km, schedule_overlap, exclusivity_required, compensation_expected)
* optional_depth (attachment_style_inferred, enneagram, risk_flags)
* ephemeral_insights (intimacy_openness_level, novelty_preference, discretion_importance) — derived, forget raw
* agent_summary (alignment_strengths, likely_friction_points, best_contexts, chemistry_uncertainty)
* Matching philosophy: we don't match roles; chemistry is discovered; attraction is a filter; alignment creates conditions.

## Intent & Modes

* Onboarding requires explicit intent: romantic, friendship, or both (kept separate; no leakage across modes).
* No "friends → dating" nudging without explicit consent.
* No attraction scoring/visuals in friendship mode; feedback centers on clarity, trust, reliability.

## Vibe & Attraction Truths (from the-art-of-vibes.md)

* Chemistry is discovered in person, not predicted by systems. System reduces anti-vibe mismatches and gets people to meet; it does not guarantee spark.
* Initial attraction is a filter, not a verdict; alignment can let attraction grow.
* Landing copy spine: "Not every good match becomes a spark. Sparks need the right conditions to exist."

## Core Behaviors

* Values and intent gathered conversationally; adapt to user's communication style.
* System listens and interprets patterns using therapeutic frameworks rather than forcing rigid categorization.
* Profile becomes "Here's what we're hearing from you" - reflective interpretation, not data collection.
* Users refine interpretations through conversation when system misses the mark.
* Values/direction before attraction; photos reveal later; one card/decision at a time.
* Avoid feeds, rankings, or overpromising language ("aligned", "worth exploring", "potential match").
* Encourage early, low-pressure real-world meetings (group/activity cues especially for friendship).
* Show real limits ("No matches yet"; "We're still looking") without urgency or consolation.
* Attraction UX: private, fast, photos-only; no text during attraction step; rate-limit cards to prevent feed behavior.
* Skip the pen-pal phase: coordination-focused messaging; default CTA is meeting IRL.
* Matching based on compatible patterns (complementary attachment styles, aligned values, compatible communication) not checkbox overlap.

## UX/Tone Cues for the Assistant

* Conversational, thoughtful, lightly self-aware; never preachy.
* Easy flow; no hype, no countdowns, no urgency badges.
* Copy examples to reuse: "We don't promise chemistry. We promise honesty." / "Sometimes you're looking for a partner. Sometimes you're just looking for your people." / "Attraction matters. But it isn't static. And it isn't everything."

## Guardrails & Trust

* Honor user requests to forget sensitive inputs.
* Keep tracks parallel; do not recommend across modes.
* Do not inflate options or feign matches; surface real availability.
* Goal is less tedious work, more real meetings; avoid endless chatting and dopamine loops.
* Sensitive content: support "off the record" and "forget that"; do not store raw sensitive text; zero out derived fields when forgetting.

## Visual/Flow Anchors (for UI builds)

* First-run: Arrival (warm, human moment) → Reframing (values-first prompt) → Promise (one simple card; CTA "Get started"; include mode choice line).
* Visual vibe: warm neutrals, soft type, plenty of space; no grids of faces or busy feeds.

## MVP Flows (must-deliver)

* Auth + context selection (romantic/friendship/professional/creative/service) and tone preference.
* Per-context agent chat with controls: Keep it light/Go deeper, Off the record (ephemeral, not stored), Forget last message/topic (delete stored + derived).
* DerivedProfile (schema-backed) per context with completeness_score/missing_fields/confidence_by_field; user edits via chat only.
* Profile preview: "How you'll be represented" + Improve matching CTA that asks only the next missing field.
* Media upload: 3–6 photos required for romantic; optional video; mark attraction_set.
* Attraction mode: photos-only cards; Yes/No/Skip; rate limit (~20/day); enable after alignment readiness threshold.
* Matching engine: same context, within radius, completeness threshold, required media; score by values similarity + interaction_style, politics importance penalty; surface only when compatibility >= threshold AND mutual attraction.
* Real states: "No matches yet"; "You're close—share 1-2 more things to find better matches."
* Match reveal + skip-the-pen-pal coordination (cap messages) or quick plan; default public/group meet.
* Events: seeded/small events; invited list only; suggest 1–3 events for matches; RSVP states going/maybe/can't; notify when both interested.
* Feedback/trust: post-event/meet feedback (honesty, respect, intent alignment, safety 1–5 + note); internal trust aggregates; misrepresentation soft-limits reach.

## Data Model Targets (Prisma-ish)

**Phase 1 (Current - Scaffolding):**
User, ContextProfile (user_id, context_type, tone_preference), ChatMessage (context_profile_id, role, content, flags: off_record), DerivedProfile (context_profile_id, json_blob, completeness_score, missing_fields), MediaAsset (user_id, context_type, url, type, attraction_set), AttractionVote (viewer_user_id, viewed_user_id, context_type, decision), Match (user_a_id, user_b_id, context_type, score, status), Event (title, location, time, tags/interests, created_by, context_type), EventRSVP (event_id, user_id, status), Notification (user_id, type, payload, read_at), Feedback (from_user_id, to_user_id, event_id?, ratings, note), TrustAggregate (user_id, scores, flags).

**Phase 2 (Interpretation Engine - Upcoming):**
Add to Profile: interpretations (Json), rawPatterns (Json), lastAnalyzed (DateTime)
Add to ContextIntent: interpretations (Json), rawPatterns (Json), lastAnalyzed (DateTime)
New: InterpretationFeedback (user_id, interpretation_id, accurate boolean, user_correction text, created_at)

Interpretations JSON structure contains therapeutic framework insights (gabor_mate: attachment_style, underlying_needs; esther_perel: desire_paradox; gottman: communication_patterns; IFS: parts_work) with confidence scores and evidence from language patterns.

## Acceptance Checks (manual)

- New user can sign up, pick context, chat, and see derived profile preview.
- User can upload photos and enter attraction mode.
- Two aligned users with mutual attraction become a match; "No matches yet" state shows when empty.
- Matched users can coordinate via quick plan and mark interest in an event; both get notified.
- Off-the-record message is not stored and cannot be retrieved; "Forget last message" removes stored + derived fields.

## Memoryless Workflow (per feature/session)

1) Read-in: Open `llm-dev-context.md`, `values-schema.md`, and the specific feature brief. Summarize constraints before coding.
2) Plan: Draft a short plan (3–5 steps), confirm scope.
3) Build: Implement minimal changes; reference schema fields explicitly.
4) Test: Run relevant tests/lints; capture results. If no tests, state what was validated.
5) Log: Append a brief dev note (what changed, why, tests) to the session log (or PR description).
6) Commit: One feature = one commit. Branch convention: `feat/<area>-<short>` (or `fix/…`, `chore/…`). Message pattern: `feat: <short feature>`, `fix: …`, `chore: …`.
7) Hand-off: Note follow-ups, TODOs, and any data migrations.

## Sample Prompts for Codex (drop-in)

*Startup for any task*
"Load `llm-dev-context.md` and `values-schema.md`. Summarize key constraints for a romance+friendship flow. Then plan and implement <feature>, run tests, and give a concise diff/validation report."

*Schema-aware change*
"Using the values schema fields (context, orientation, values with weights, beliefs, interaction_style, collaboration_signals, constraints, optional_depth, ephemeral_insights), add backend models and basic validation for <track>. Keep friendship/romantic tracks separate."

*No-memory sanity*
"Assume no prior context. Re-read `llm-dev-context.md`. Restate the product guardrails, then propose a 3-step plan to ship <feature> with tests and a single git commit."

*Testing expectation*
"After coding, run the relevant tests or linters for <component>. If tests are missing, outline the minimal test to add next."

*Release note/log*
"Summarize today's changes for the dev log: what changed, why, and test results."

## Best Practices (LLM dev hygiene)

* Always restate constraints from `llm-dev-context.md` and `values-schema.md` before major edits.
* Keep feature branches/commits small and labeled; avoid mixing refactors with features.
* Prefer explicit schema references over ad-hoc fields; keep tracks parallel.
* Use structured notes (What/Why/Tests/Follow-ups) per session to survive stateless runs.
* Default to honesty in UX: show real availability, no overpromising chemistry, no cross-mode leakage.
* Preserve privacy: forget raw sensitive inputs after deriving stored fields.
* When unsure, ask clarifying questions, but still propose a minimal, reversible plan.
