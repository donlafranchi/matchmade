Below is a **clean, unified Values Schema (v2)** designed to support **all relationship types**
— romantic, friendship, professional, creative, service-based —
without turning into a form, a marketplace, or an interrogation.

This is the **north-star schema** the system grows from.

---

# Unified Relationship Values Schema (v2)

## Design Principles

* One schema, many relationship contexts
* Values > vibes > roles
* Agents infer; users don’t self-diagnose
* Works even with sparse input
* Honest about uncertainty

---

## 0. Relationship Context (explicit, first-class)

Users choose intent **per relationship track**.

```json
relationship_context: {
  type: ["romantic", "friendship", "professional", "creative", "service"],
  openness_to_overlap: ["none", "friendship_only", "contextual"]
}
```

Examples:

* Romantic only
* Friendship + creative
* Business partner only
* Realtor (service) only

No ambiguity. No guessing.

---

## 1. Core Orientation (why they’re here)

```json
orientation: {
  seeking: ["connection", "collaboration", "support", "growth"],
  commitment_horizon: ["days", "weeks", "months", "years"],
  availability_level: ["low", "medium", "high"]
}
```

Used to prevent:

* Casual users matching with long-term seekers
* Time-wasters entering serious contexts

---

## 2. Core Values (forced tradeoffs, universal)

Same values across all relationship types.

```json
values: [
  { key: "honesty", weight: 0.25 },
  { key: "reliability", weight: 0.20 },
  { key: "growth", weight: 0.20 },
  { key: "respect", weight: 0.20 },
  { key: "curiosity", weight: 0.15 }
]
```

Canonical list (closed, evolvable):

* honesty
* reliability
* respect
* growth
* curiosity
* ambition
* creativity
* stability
* independence
* generosity
* community
* discretion

---

## 3. Belief & Worldview Axes (context-weighted)

Not every axis matters in every context.

```json
beliefs: {
  politics_importance: 0.0-1.0,
  political_orientation_inferred: ["progressive", "moderate", "conservative", "mixed"],
  religion_importance: 0.0-1.0,
  money_risk_tolerance: 0.0-1.0,
  hierarchy_vs_equality: 0.0-1.0
}
```

Examples:

* High relevance for romantic / friendship
* Lower relevance for realtor / service
* Medium relevance for business partners

Agent adjusts weight automatically.

---

## 4. Interaction Style (how it feels to relate)

This is where **vibe lives**, without claiming to predict chemistry.

```json
interaction_style: {
  tone: ["light", "balanced", "serious"],
  energy_level: ["low", "medium", "high"],
  communication_preference: ["direct", "reflective", "casual"],
  pace: ["slow", "moderate", "fast"]
}
```

Used to:

* Reduce friction
* Avoid obvious non-vibes
* Never promise chemistry

---

## 5. Collaboration & Reliability Signals (non-romantic critical)

Especially important for:

* Business partners
* Creatives
* Realtors / service providers

```json
collaboration_signals: {
  follow_through: 0.0-1.0,
  planning_vs_improvisation: 0.0-1.0,
  conflict_handling: ["address", "delay", "avoid"],
  accountability_style: ["self-driven", "external", "shared"]
}
```

Derived from behavior, not claims.

---

## 6. Boundaries & Constraints (contextual, not absolute)

```json
constraints: {
  location_radius_km: number,
  schedule_overlap: ["low", "medium", "high"],
  exclusivity_required: boolean,
  compensation_expected: boolean
}
```

Different defaults per context:

* Romantic → exclusivity relevant
* Friendship → not relevant
* Realtor → compensation required
* Creative → mixed

---

## 7. Optional Depth Layers (opt-in, abstracted)

Never required. Never exposed.

```json
optional_depth: {
  attachment_style_inferred: ["secure", "anxious", "avoidant", "mixed"],
  enneagram: { type: 1-9, confidence: 0.0-1.0 },
  risk_flags: ["overextended", "conflict_avoidant"]
}
```

Used to **adjust expectations**, not exclude people.

---

## 8. Ephemeral Preferences (forgettable by design)

```json
ephemeral_insights: {
  intimacy_openness_level: ["low", "medium", "high"],
  novelty_preference: 0.0-1.0,
  discretion_importance: 0.0-1.0
}
```

Derived → stored abstractly → raw content destroyed.

---

## 9. Agent Summary (human-readable, private)

```json
agent_summary: {
  alignment_strengths: ["values", "communication_style"],
  likely_friction_points: ["pace", "politics"],
  best_contexts: ["friendship", "creative"],
  chemistry_uncertainty: "medium"
}
```

Explicitly acknowledges uncertainty.

---

## 10. Matching Philosophy (unchanged, now universal)

* **We don’t match roles. We match people.**
* Chemistry is discovered, not predicted.
* Attraction is a filter, not a verdict.
* Alignment creates conditions; real life decides.

---

## Why This Scales Cleanly

* Same schema → different weights per context
* New relationship types don’t require redesign
* Friendship and professional use reduce pressure
* Romantic matching becomes *more honest*, not diluted

---

## One-Line North Star (Schema Version)

> A single, honest system for matching people across all kinds of relationships—by values, not performance, and with reality as the final judge.

If you want next:

* How weighting changes per relationship type
* Example: romantic vs business partner match
* How events unify all relationship contexts
