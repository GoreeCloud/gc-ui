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

## 2026-11-01 current-main evidence expansion

At main d66b0dde31ced73ab7e8027ec43ff7c18966959d, **27/27** axe scenario reports were verified with no confirmed violations, while **30 checks / 316 node occurrences remain inconclusive**: 25 color-contrast checks (311 nodes) and five ARIA attribute-value checks (five nodes). Counts were neither suppressed nor considered automatic passes.

All five ARIA checks relate to the Components action-menu trigger and its existing menu target. In a local isolated Chromium/Orca/AT-SPI session, browser roles and names were exposed, and real Orca generated the expected menu and Forms fixture speech. The added diagnostics and three parser tests reproduce the bounded check. This is additional evidence for the tested Linux browser/Orca configuration, **not** a universal resolution of the axe incompletes or a human-heard acceptance.

The 311 contrast node occurrences remain open for pixel/composited-color and manual evaluation. See [expanded QA checkpoint](QA_EXPANDED_VISUAL_AT_RELEASE_2026_11_01.md). The original October 28 figures above remain historical.

## 2026-11-01 follow-up: evidence-preserving manual-review priorities

On unchanged main baseline a62c6e156158aed0354b3a76ad97e17ef15f0d86, 27 axe scenarios produced **30 inconclusive checks / 316 node occurrences across 179 distinct review targets**. The new npm script qa:accessibility:triage generates a report at dist/qa/accessibility-triage/manual-review.json from the verified axe manifest, validates unchanged totals, and marks **every target manual-review-required**.

| Review category | Unique targets | Node occurrences | Next review |
| --- | ---: | ---: | --- |
| Possible obstruction | 13 | 21 | Scroll and hit-test live controls; inspect composited text background |
| Composited/complex background | 147 | 234 | Inspect gradient, image and transparent surfaces in actual pixels |
| ARIA relationship | 1 | 5 | Browser accessibility tree and real assistive-technology corroboration |
| Non-text symbols | 17 | 55 | Review actual non-text contrast and semantics; aria-hidden is not an automatic waiver |
| Other unresolved text/control | 1 | 1 | Inspect the actual content and foreground |
| **Total still open** | **179** | **316** | **No suppression or accessibility certification** |

The initial high-priority overlap review targeted the repeated Forms #brief-notes textarea. **4/4 Chromium plus 4/4 Firefox tests passed** at 320, 375, 768 and 1440 px with light, dark and RTL states. At three sample points, the scroll-into-view editable surface was reachable by browser hit-testing; filling the textarea succeeded. This rebuts a simple obstruction hypothesis for those exact scroll states, but **does not resolve effective color contrast or axe incompletes**, including that textarea's five repeated occurrences. Other overlapping targets remain open.

Review order is operational only; it is not a determination of severity or a substitute for pixel-level measurement, human AT testing, or full product signoff. The triage tool produces a separate CI artifact and never edits original axe evidence. Regenerate the verified axe manifest immediately before running triage because subsequent Playwright suites reset the test-results directory.

## 2026-11-01 second independent review: Adaptive rendered gradient text

The existing Components real-pixel contrast suite was refactored to share its original pixel-backdrop sampler with a new Adaptive Shell test. This avoids duplicating approximate screenshot math and now restores any original inline color value **and CSS priority** after temporary screenshot-only hiding of text.

The new test samples **six actual Adaptive text elements** (#page-title, #page-subtitle, .gc-page-header .gc-eyebrow, #content-title, #feed-title and .gc-shell-note) in **320px compact and 1440px desktop**, each in **light and dark** modes. For each text element it temporarily hides only that element's text color, captures the actual element-sized rendered backdrop, computes foreground-versus-sampled pixel contrast, and requires at least 4.5:1. In Chromium, **4/4 new Adaptive scenarios and the combined 22/22 Components+Adaptive pixel tests passed**. In Firefox, **4/4 new Adaptive scenarios and the combined 22/22 Components+Adaptive pixel tests also passed**. Observed Firefox Adaptive minimum sampled ratios were about 5.01:1 (320px light), 5.06:1 (1440px light), 9.17:1 (320px dark) and 9.42:1 (1440px dark).

**Limit:** These are 24 selected element/state pairs, not 234 separately resolved axe occurrences. The sampler evaluates every third screenshot pixel, sRGB computed foreground, and a temporarily text-free backdrop; it does not certify subpixel antialiasing, composited OS effects, all gradients, disabled controls, image classes, or full WCAG. No axe incomplete disposition or design language release status changes from this evidence.


## 2026-11-01 real-browser ambient-text contrast review (Catalog repair)

A new selected-element rendered-pixel sampler uses the existing shared screenshot backdrop helper against six text selectors each in Catalog, Material Environment and Experience Studio, at 320px/1440px and actual light/dark color-scheme preferences. The browser OS preference **must** drive the real GC theme controller; merely changing the root dark-mode attribute leaves semantic color roles out of sync and creates false dark-mode failures.

On the valid original light-mode configuration, Catalog hero lead and registry-section description returned approximate minimum sampled ratios of **4.236:1** (320px) and **4.207:1** (1440px), below the conservative 4.5:1 review threshold. Both texts sit directly over the ambient canvas gradient, not an opaque surface. Their two local CSS roles were changed from on-surface-muted to the matching semantic on-canvas foreground. Repeated browser tests then passed all **12/12 Chromium scenarios** with a lowest sampled Catalog ratio of approximately **5.059:1 light / 9.487:1 dark**. The independent Firefox suite also passed **12/12** with the same Catalog minima of approximately **5.059:1 light / 9.487:1 dark**. Real-browser mobile/desktop light/dark screenshots were inspected for visible layout and readability; no new clipping or hierarchy regression was found in the inspected frames.

This validates the selected 18 text-bearing selectors under four tested combinations per lab. It does **not** resolve or suppress axe's broader manual-review incompletes, certify every image/blur compositor, or declare human accessibility/visual signoff.

## 2026-11-02 cross-revision axe evidence reconciliation

The experimental lab accessibility run was regenerated on three exact revisions with the same local browser toolchain. Each passed **27/27 scenarios** with **zero confirmed axe violations** and **30 inconclusive rule checks**; no rule was suppressed or treated as automatically resolved:

| Revision | Distinct incomplete review targets | Incomplete node occurrences | Scope |
| --- | ---: | ---: | --- |
| `a62c6e156158` | 179 | 316 | Before the new bidi-isolation markup |
| `77ef77525826` | 180 | 318 | After the RTL heading/section bidi changes, before Catalog contrast CSS repair |
| `ae1d8b7df65` | 180 | 318 | After Catalog contrast repair |

A source-manifest comparison between the first and last revisions shows that most changed selectors are the same phrases re-targeted to new semantic `bdi[dir=auto]` children rather than their former parent headings/paragraphs. The **net +2 occurrences / +1 distinct review target** are from the Material Environment hero's nested bidi-isolation/emphasis structure: its bold/italic line now presents both a text-isolation span and an emphasized child for which axe cannot determine a gradient backdrop. The previous heading and emphasis nodes were already inconclusive. This is an **axe element-level counting/targeting change**, not evidence of a confirmed new contrast defect, nor permission to waive either node.

This comparison also proves the increase **precedes PR #162**, since the pre-Catalog and post-Catalog revisions both have the same 318/180 inventory. The separately tested Catalog foreground-token correction passed sampled real-pixel contrast checks, but axe still cannot automatically decide many actual gradient backdrops. Keep all 318 occurrences marked for targeted/manual review and distinguish this latest baseline from the historical 316-node checkpoints above. Human-readable text, emphasized text, contrast, RTL semantics and screen-reader announcements remain subject to their respective independent acceptance gates.

## 2026-11-02 non-text symbol semantic corroboration

The current 17 non-text-symbol targets / 55 occurrences still appear in the fresh 27/27 axe evidence after a single semantic markup repair. The v1 Materials demo decorative Lens glyph now has `aria-hidden="true"`, matching its adjacent visible LENS label and Apply button. Four Chromium and four Firefox browser cases verify the changed decoration plus representative labeled Components, Forms and Adaptive controls across light/dark, compact, RTL and forced colors. The source triage remains **30 inconclusive checks / 318 node occurrences / 180 targets** and no axe rule was suppressed. This confirms only sampled redundant-symbol relationships; it does not prove 3:1 visual contrast for any essential non-text icon or waive the remaining manual obligations. See [dated semantic review](QA_NONTEXT_SYMBOL_SEMANTICS_2026_11_02.md).
