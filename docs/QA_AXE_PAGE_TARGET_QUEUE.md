# GC UI — page-scoped accessibility review targets

**Scope:** experimental GC UI labs. **Evidence:** actual 27-screen axe A/AA JSON inventory and 22 captured full-page screenshots. **Status:** review queue; no WCAG certification.

The original `incomplete` results contain multiple instances of the same rule, CSS selector and failure reason across responsive, light/dark, focused and forced-colors states. They should not be counted as distinct defects solely because the same element appears in several scenarios.

The CI report verifier now records each source `pagePath` (a local `/lab/*.html` path without host, query or fragment) and emits a sorted `incompleteReviewTargets` array in `accessibility-review/manifest.json`. Each entry includes:

- The actual lab page, axe rule ID, exact selector target array and normalized axe explanation.
- The total number of occurrences of that combination across reports.
- The scenario names where it occurred.

The `uniqueIncompleteReviewTargets` count is distinct from both the 30 axe incomplete *checks* and the 334 per-state *node occurrences* in the October 28 baseline. It is **not** a count of confirmed accessibility defects or necessarily of unique elements: CSS selectors may match several nodes, and separate failure reasons are separate review tasks.

**Important disambiguation:** `h1`, `footer` and generic component selectors appear on several independent lab pages. The queue never merges those merely because their CSS selectors are identical. Only matching `pagePath`, rule, selector array and reason are grouped. The complete scenario-specific JSON remains the source of truth.

For each top-ranked review target, locate the element in the relevant screenshot and running page, inspect its rendered pixels and computed context, reproduce across named scenarios, and then decide whether the inconclusive axe result is a real deficiency. Use browser-computed ARIA trees only as supplementary evidence; perform screen-reader and OS accessibility checks where appropriate.

The manifest verifier rejects missing page origin or malformed node targets. It retains original report SHA-256 digests and the existing `incompleteByRule` and `incompleteByReason` aggregates. No report is modified or suppressed to manufacture a passing compliance result.

See [axe rule/reason triage](QA_AXE_INCOMPLETE_TRIAGE.md), [reason priority](QA_AXE_REASON_PRIORITY_2026_10_28.md), and [stabilization issue #78](https://github.com/GoreeCloud/gc-ui/issues/78).
