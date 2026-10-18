# GC UI — Website read-only legacy evidence probe

**Date:** 2026-10-17. **Purpose:** validate the migration auditor against a real authorized GoreeCloud consumer source checkout; **not** a current-production or current-main verdict.

## Exact source and execution boundary

- **Consumer repository:** [GoreeCloud/static-websites](https://github.com/GoreeCloud/static-websites).
- **Local checkout branch inspected:** `feature/donations-page-20261010`.
- **Local checked-out source SHA:** `ba4a8a866d48395bfa953e98dc0efce9eb8692a1`.
- **Scanned subtree:** `sites/main/` (source paths below relative to that subtree).
- **Different live main baseline:** `4746af244b8e59f4939fb327f923e3bbfff5e335`, verified separately from GitHub on October 17. **The feature checkout does not prove any finding at this different main revision.**
- **Tool:** `scripts/audit-legacy-consumer.mjs` with explicit, read-only `--root`, using the updated historical-evidence classifier.
- **Side effects:** No writes to the Website checkout; its Git worktree was clean. The report was computed to temporary local output. No consumer code, GitHub repository or Drive policy was changed.

## Results — limited static evidence

| Measure | Observed |
|---|---:|
| Scanned text files | **125** |
| Active predecessor-reference findings | **358** |
| Unclassified references needing human review | **226** |
| Historical/informational findings | **122** |
| Incomplete/unreadable scans | **0** |
| Distinct files containing active findings | **40** |
| Classification | `legacy-dependency-evidence` |

The active findings cluster in `css/glaze.css`, `css/glaze-polish.css`, `css/repositories.css`, `css/glaze-v1.4.0.css`, `css/platform.css`, selected HTML templates, and legacy validation scripts. This is actionable **migration-discovery evidence**, not a diagnosis that all 358 lines are executed at runtime or unique dependencies. A finding represents a matched file/line, not a unique independently functioning Glaze module.

The scanner distinguishes archived `acceptance/` and `evidence/` text/JSON/YAML from runnable source and presentation files. Historical certificates/reports are retained as provenance; they **must not be deleted merely to improve audit counts**. The scanner is static and may overclassify comments, dead CSS, obsolete builders, or decorative artwork as active. Actual browser navigation, loaded resources, computed styles, responsive behavior, assistive-technology semantics and supported GC UI replacements require separate verification.

## Next Website adoption sequence

1. Fetch and verify the exact current `GoreeCloud/static-websites` `main` source; rerun the audit on that revision **before treating these findings as current**. No source changes in the older donation feature branch.
2. Inventory stylesheets actually loaded by `sites/main/index.html` and the other published entrypoints. Identify imported legacy CSS and assets; retain original source provenance.
3. For each *live* legacy presentation role, use original GC UI Canvas/Surface/Lens architecture, semantic tokens and the **actually supported** GC UI package exports. No filename/text replacement as a substitute for tested behavior.
4. Verify browser UI, keyboard/focus, contrast, zoom/reflow and fallbacks in the migrated consumer at an exact source revision; do not impose unrelated physical hardware QA as a generic release blocker.
5. Confirm owner-approved consumer write scope and governed release migration separately before modifying or deploying the Website. The GC UI-only project did not authorize consumer mutations here.

**No current Website GC UI adoption acceptance recorded.** The [consumer reconciliation ledger](../registry/consumer-migration-reconciliation.v1.json) deliberately continues to show `staticSourceAudit:not-run` for the **verified main SHA**, because this check was from a different feature branch.
