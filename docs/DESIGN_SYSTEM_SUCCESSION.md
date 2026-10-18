# GoreeCloud UI — Exclusive design-system succession

**Owner direction:** 2026-10-17. **Destination:** permanent replacement of Glaze with **GoreeCloud UI (GC UI)**. **Repository execution scope:** `GoreeCloud/gc-ui` only. **Status:** authorized direction and migration plan; ecosystem cutover **not yet complete**.

## 1. Decision and authority boundaries

The owner has selected **GoreeCloud UI as the sole destination design system for GoreeCloud**. Glaze is the **legacy predecessor scheduled for permanent retirement**, not a second supported long-term design language, a base for rebranding, a plugin, or a required runtime dependency.

GC UI is an original design language with its own material architecture (Canvas, Surface, Lens), semantic tokens, color engine, interactions, components, illustrations, documentation and release cadence. It may learn from public platform conventions without copying proprietary implementations or redistributing someone else's code without permission.

**This record makes the owner decision explicit for GC UI development; it does not falsify ecosystem-wide governance or external repository state.** At the time of this decision, active records in the owner's **read-only** Google Drive `GoreeCloud/Standards` and `GoreeCloud/Policies` still identify Glaze as the current approved presentation authority. They require **controlled replacement and versioned supersession** in their actual governing directories. This project cannot edit those Drive files and has no authorization to modify any repository other than `GoreeCloud/gc-ui`.

The eventual exclusive authority is **GC UI**, but it is not truthful to say Glaze is technically retired everywhere, the existing policies have been replaced, downstream apps have migrated, or GC UI has already been qualified for the old platform-wide acceptance contract. Retain those as open work, not implied passes.

## 2. Non-negotiable migration invariants

1. **One destination:** no new GoreeCloud app should be designed to depend on Glaze for its future target state; GC UI is the intended single semantic design authority. A consumer still using the old contract is **migration pending**, not secretly compliant.
2. **No superficial renaming:** no copying, mass-relabeling, rebranding, wrapping, or silently relicensing Glaze source, design tokens, themes, glyphs, or assets as GC UI. Independently implement mapped semantics. Preserve historical records and original attribution.
3. **Bounded compatibility:** where deployed consumers require temporary legacy support, handle it as a **time-limited migration bridge outside the public GC UI core contract**, with explicit contract, security review and retirement gate. Never call this permanent co-governance.
4. **Evidence before claims:** source packaging, accessibility, security, visual QA, supported platforms and exact-candidate release checks must be independently verified. The existing 12/12 owner-reported Android TalkBack acceptance remains historical evidence; it is not a blanket cross-platform certification.
5. **Respect authorization:** only this repository may be changed in this project. Drive Standards/Policies are **read-only**; retiring other repositories, services, assets or permissions requires an authorized, separately scoped operation. Never delete evidence or create broken consumers in an attempt to expedite retirement.
6. **Licensing remains independent:** existing GC UI alpha and private Foundations RC are `UNLICENSED` in metadata. The active GoreeCloud Software Licensing policy selects **AGPL-3.0-or-later as a fallback**, and allows a documented project-specific choice appropriate to a library/SDK. It does **not** grant license clearance for GC UI third-party assets or authorize a specific outgoing GC UI license. Record and approve that choice before distribution.

## 3. Transition sequence and proof gates

| Phase | Work | Truthful completion evidence | Current state |
| --- | --- | --- | --- |
| A — GC UI authority definition | Record owner's sole-successor decision, keep identity and token namespace original, reject legacy dependencies in first-party implementation and package metadata | This document, `registry/design-authority.v1.json`, and `npm run authority:check` | In this repository |
| B — Governance supersession | Review and amend the current Glaze-bearing Policies, Standards, platform design contract, nomenclature and downstream conformance controls to name **GoreeCloud UI** as authority | Approved updated governing files in their authorized directories, effective dates and history preserved | **Outstanding — Drive read-only here** |
| C — Consumer inventory and migration | Identify consuming apps, actual old tokens/assets/APIs, route changes through each authorized repo, build GC UI replacements and versioned migration guides | Per-consumer interface mapping, relevant accessibility/visual/host validation and verified switched imports | **Outstanding — other repos off limits here** |
| D — GC UI qualification | Finish supported scoped package, project-specific outbound license, relevant conformance/security/accessibility and release evidence; apply lifecycle **Seal → Anchor** where genuinely qualified | Exact source SHA, CI results, contents, consumers, licenses, artifact hash, approval; no unverified product-wide claim | Foundations `1.0.0-rc.1` only, **not Anchor** |
| E — Legacy retirement | After migration, terminate active legacy authority, new adoption paths, builds, packages, service dependencies and production usage; preserve auditable history and lawful attributions | No live consumers/imports; separately authorized archival, repository/status change and final owner acceptance | **Outstanding — not authorized in other repos** |

**Permanent** means the intended end state is no active Glaze design authority or runtime/design dependency. It does **not** mean destructive erasure of legally required notices, release provenance, backups or historic decisions. The removal procedure must avoid breaking supported products.

### Read-only consumer preflight available

[Consumer migration audit](CONSUMER_MIGRATION_AUDIT.md) and [dated consumer discovery snapshot](CONSUMER_MIGRATION_INVENTORY_2026_10_17.md) now provide an explicit-root, fail-closed static inventory for consumer legacy imports, tokens, assets and documentation. **It changes no consumer source** and does not count a source-clean finding as migration acceptance; governance and all production consumers remain unverified.

### Current product source identities

The [live provider-verified consumer reconciliation](CURRENT_CONSUMER_RECONCILIATION_2026_10_17.md) resolves 14 historical products to verifiable repository identities, leaves three product mappings pending and one unresolved. Exact revisions are pinned in the [read-only ledger](../registry/consumer-migration-reconciliation.v1.json). These are *not* successful consumer migrations.

## 4. Official authority and migration language

**Preferred:** “GoreeCloud UI is GoreeCloud's successor design and interaction language. The prior Glaze system is being permanently retired through a verified migration.”

**Do not claim yet:** “Glaze has been deleted everywhere,” “all applications are GC UI-conformant,” “all GoreeCloud policies now say GC UI,” “GC UI v1.0 is Anchor,” or “GC UI and Glaze are two long-term production design authorities.”

Current project components use `@goreecloud/gc-ui`, `--gc-`, `gc-` and original assets. These namespaces stay stable unless an intentionally versioned GC UI breaking change is approved. Product identity assets remain governed by their existing legitimate canonical provenance, which this decision does not grant permission to alter outside this repository.

## 5. Governing references and future coordination

Relevant records read on 2026-10-17 from the owner's authorized **GoreeCloud/** Drive tree include **Policy — Glaze Application Conformance**, **Standard — Glaze V1.7+ Universal Interface and Design**, **Standard — Application and Service Release Lifecycle**, **Standard — Platform Enforcement and Conformance**, **Policy — Software Licensing**, **Policy — Open-Source Licensing and Third-Party Code Governance**, and **Policy — Solo-Maintainer Development, Review, and Validation**. This repository document does not supersede those records in Drive; their controlled amendments remain separately required.

**Design-language migration is separate from release-stage promotion.** In the established ecosystem vocabulary, *Seal* is a candidate and *Anchor* is evidence-backed production qualification. GC UI's source remains `0.2.0-alpha.1`; the separate installable Foundations `1.0.0-rc.1` is not a public stable/Anchor package.

**Implementation status is machine-readable:** `registry/design-authority.v1.json`. Its booleans track verified facts and must not be changed optimistically. The automatic guard catches **explicit predecessor names and namespaces** in GC UI source, tokens, styles, assets and first-party release sources. It is not a replacement for a provenance, copyright, component-level license or independently implemented-code audit; relabeled copied code would require separate review. Historical text in this decision record and changelog is allowed as migration evidence.
