# GoreeCloud UI — Zoom-Equivalent Viewport Reflow QA

**Date:** 2026-10-16
**Repository:** `GoreeCloud/gc-ui` only
**Maturity:** unpublished `0.2.0-alpha.1`; 32 experimental, 31 specified, zero stable

## Why this wave

The earlier RTL and doubled-text `e2e/reflow.spec.mjs` gate checks 320, 375, 600 and 768 CSS px at a fixed 700px height. It does not exercise the very short viewport produced when a 1280×800 window is enlarged to approximately 400%, nor interactive access beneath fixed navigation.

The new `e2e/effective-zoom.spec.mjs` adds deterministic cross-engine **effective CSS viewport** checks, with no component/registry maturity promotions and no changes to design tokens:

- Five labs × two equivalent scales: **640×400 CSS px (200%)**, **320×200 CSS px (400%)**.
- LTR and RTL overflow checks at both widths/heights (20 observed layout/direction combinations per browser per complete run).
- At 320×200, compact route navigation, native dialog operation and focus return, footer-link hit testing and navigation.
- At 320×200, stepper keyboard focus, linked validation-summary focus and field navigation; tab/menu and catalog search.
- Added `npm run test:e2e:effective-zoom` to the Chromium pipeline, and the same eight cases to the serial Firefox smoke command. CI syntax validation covers the new suite.

## Scope and test development notes

This **does not simulate real browser-toolbar zoom**. Headless Playwright keyboard zoom shortcuts did not change layout scale in the experimental probes. Applying only `document.documentElement.style.zoom` left media-query breakpoints at the original viewport width and therefore produced misleading overflow; it was rejected as a substitute for browser zoom. Setting the *effective CSS viewport* models responsive reflow and interaction reachability without claiming rendering parity.

During initial Firefox test development, checking the footer immediately after `window.scrollTo()` read a position before the scroll had completed. A deterministic `scrollIntoView({block:'center',behavior:'instant'})` followed by a hit test and real click now tests reachability without mistaking scroll timing for an obstruction. No production UI regression was established by that initial test failure.

## Observed laptop verification and CI requirement

- The new targeted gate passed **8/8 Chromium** and **8/8 Firefox** cases (serial) after correcting a test-fixture scroll timing assumption.
- `npm run check`: **82/82 Node tests** passed, **7,988 opaque color-role comparisons** passed across 722 generated schemes, token output and local assets resolved, and package dry-run contained **52 files with all 14 required exports**.
- The existing Chromium interaction gate passed **37/37** before the connected laptop became heavily overloaded (system load above 35 and nearly full swap; another independent browser workload was active).
- The subsequent legacy 32px/RTL reflow run passed **4/5** locally; the adaptive case reached the 30-second timeout inside `page.evaluate`. This is a **load-contaminated/inconclusive** laptop execution, not proof of UI failure or a green complete local suite. No unrelated device processes were stopped. The remaining local browser stages were not run.
- Final correctness therefore requires the three GitHub Actions jobs to pass on the reviewed branch. **Do not claim 205/205 locally** from these partial observations.

The expected CI inventory is **205 automated test executions** (82 Node + 37 Chromium interactions + 5 text reflow + 8 effective-zoom + 15 axe + 13 visual captures + 45 Firefox interaction/effective-zoom). This total is an inventory until verified by the remote CI jobs; the separate color audit samples are not additional test executions.

## Open release acceptance

- Actual browser-toolbar **200% and 400% zoom** in Chromium, Firefox and Safari on supported host OS devices.
- Dynamic text scaling from the OS, long translations, screen-reader output, keyboard occlusion and touch focus at high magnification.
- Manual signoff of all visual evidence and accessibility focus order. No WCAG certification is inferred from passing automated checks.
