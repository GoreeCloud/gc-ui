# GC UI — Inconclusive accessibility evidence triage

**Recorded:** 2026-10-28. **Scope:** experimental workspace. **Status:** manual acceptance open.

Automated axe WCAG A/AA checks include a separate `incomplete` array for results that cannot be classified as passes or violations. These are **not confirmed accessibility failures** and must not be hidden or characterized as successful compliance. The individual retained `accessibility-review/<scenario>.json` reports contain CSS selectors and failure summaries for inspection.

## Verified pre-change baseline

In the exact-main [browser QA archive](https://github.com/GoreeCloud/gc-ui/actions/runs/40788946875/artifacts/12860033871), all 26 reports, all 21 full-page visual screenshots, and zero confirmed axe rule violations were retained. The archive contained:

| Rule | Scenario-level inconclusive results | Individual affected nodes | Meaning |
| --- | ---: | ---: | --- |
| `color-contrast` | 24 | 324 | Effective composited contrast cannot be determined automatically across some backdrops, glyphs, gradients and overlays |
| `aria-valid-attr-value` | 4 | 4 | Axe cannot resolve the Components action-menu trigger's `aria-controls` target in four states |
| **Total** | **28** | **328** | Further review required; not 328 verified violations |

The existing menu `#gc-file-actions` is present in markup and open/close keyboard behavior is tested. That fact alone does not prove how every assistive-technology/browser combination announces or relates the control.

## Triage workflow

1. Verify that every current axe scenario produced one complete JSON report and that the manifest references the expected current revision.
2. Compare **rule-level checks** separately from **affected DOM node counts**. A rule may contain many nodes; comparing only the count of checks obscures large exposure areas.
3. Start manual composited-color evaluation with text-bearing nodes on critical workflows, including Forms, Adaptive and Components. Review light/dark, high contrast, text zoom and real backgrounds. Distinguish ordinary solid-surface ratios from translucent, blended and image-backed surfaces.
4. Inspect the Components menu relationship in actual Chromium/Firefox accessibility trees with its collapsed and expanded states, focus movement, keyboard activation and assistive technology. Do not change `aria-controls` merely to suppress an inconclusive axe rule if the relationship is valid.
5. Capture before/after screenshots and direct runtime results for confirmed defects. Retain evidence and re-run the full QA gates. Do not declare WCAG conformance or the experimental GC UI workspace Stable from a green automated manifest.

The manifest now includes `incompleteChecks`, `incompleteNodes` and a sorted `incompleteByRule` array with scenario membership; this makes it possible to prioritize while keeping every original report unchanged. The node totals may change as UI states and axe itself change. No fixed thresholds or automatic suppression are introduced.
