# .context/vision/ Directory

**Purpose:** Strategic vision documents and philosophical frameworks (aspirational, not prescriptive).

---

## Current Vision Documents

### [profile-as-interpretation.md](profile-as-interpretation.md)
**Purpose:** Therapeutic interpretation architecture and vision
**Contains:** Framework details (Maté, Perel, Gottman, IFS, Attachment), profile structure, interpretation display design
**Status:** Aspirational - guides Phase 2/3 implementation
**Use when:** Understanding future direction for interpretation engine

---

## What Belongs Here

Vision docs are forward-looking documents that describe where the product is heading, not necessarily where it is today.

**Examples of vision docs:**
- Philosophical frameworks (therapeutic approaches)
- Future feature explorations
- Strategic pivots or expansions
- Aspirational UX patterns

**What does NOT belong here:**
- Current product spec → `.context/product-spec.md`
- Feature requirements → `.context/briefs/`
- Implementation details → `dev/logs/`

---

## Relationship to Product Spec

**product-spec.md** = Current product (what we're building now)
**vision/** = Future product (where we're heading)

Vision documents may be incorporated into product-spec.md as they become reality. When that happens, version the spec (v2, v3) and note the integration in `dev/decisions.md`.

---

*Vision documents inspire and guide. Product spec directs implementation.*
