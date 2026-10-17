# GC UI — Verification and Quality Gates
**Status:** 0.2.0-alpha.1 working agreement. This document distinguishes test execution from accessibility or visual signoff.

## 1. Source-level checks (dependency-free)
Run `npm run check` from the repository root. It runs:
- `npm run tokens:check`: regenerates token CSS and compares byte-for-byte with `styles/gc.v1.generated.css`.
- `npm test`: Node tests for color roles, high-contrast and forced-color mapping, theme runtime, menus, tabs, dialogs, native component semantics, icon sprite structure, type/package exports, and implementation-registry traceability.
- `npm run audit:colors`: samples 361 hexadecimal seed colors in both appearances (722 generated schemes), checks foreground and background pairs, baseline accent pairings and high contrast.
- `node tests/check-lab-references.mjs`: rejects broken local asset references in the five browser labs.
The seed sample tests **opaque color roles**. It is not a proof that overlay text contrasts against arbitrary photos/videos or that all possible sRGB seeds pass.

## 2. Browser interaction checks (Playwright)
The alpha suite currently defines 36 interaction scenarios across Components, Foundations, Registry, Adaptive and Forms labs, 15 axe-core accessibility smoke scenarios, and 13 independent screenshot-capture tests. This is a test inventory, not a claim that GitHub Actions or browser audits passed.
The optional browser suite is in `e2e/*.spec.mjs`. GitHub Actions installs `@playwright/test@1.64.1` and Chromium in a separate job, then runs `npm run test:e2e`. To run locally:
```sh
npm install --no-save --no-package-lock @playwright/test@1.64.1 axe-core@4.10.3
npx playwright install chromium
npm run test:e2e
```
The Playwright config starts a local Python static server, so no production deployment is needed. Browser tests also assert cross-page theme preferences, high-contrast custom-seed suppression, natural forward/reverse menu Tab focus movement, and keyboard menu action results. Supported smoke scenarios: native checkboxes/radios, toggle button labeling, focus/keyboard tabs, menu keyboard behavior and Escape focus recovery, light/dark and forced-colors preference changes, high-contrast precedence over curated palettes, native progress and disclosure, catalog search/status filtering, custom seed generation, and compact 320px layouts.

## 3. Visual evidence
`e2e/visual-capture.spec.mjs`, `e2e/adaptive-visual.spec.mjs`, and `e2e/forms-visual.spec.mjs` capture **13 screenshot fixtures** on Chromium:
- components lab, desktop light, 1440x900
- components lab, desktop dark, 1440x900
- components lab, high-contrast dark, 1440x900
- components lab, compact light, 375x812
- component registry, desktop, 1440x900
- adaptive shell at 320x740 and 375x812 (light/dark), 840x900, and 1440x900
- forms lab at 1440x900 (light), 375x812 (dark), and compact validation/retry state at 375x812

GitHub Actions uploads these as browser QA evidence. The screenshot artifacts have **no approved visual baseline** and must be reviewed by a human before considering typography, spacing, optical geometry, or Lens effects stable.

## 4. Manual accessibility and UX gates (not complete)
- VoiceOver/Safari, NVDA/Chrome+Firefox, TalkBack/Chrome, keyboard-only.
- Screen-reader verbosity and focus history when menus/dialogs open and close.
- Test 200% and 400% zoom including keyboard occlusion and focus visibility.
- Motion/transparency reduction, forced colors, high contrast and dark mode.
- RTL layout and directional navigation, long translations, touch, stylus and remote.
- Lens material over worst-case photographs/video, including moving saturation and specular highlights.
- Native TV, spatial, wearable and foldable device testing after adapters exist.

## 5. Release labels
- **Specified:** design contract exists, implementation may not.
- **Experimental:** functioning reference exists, not audited or stable.
- **Beta:** framework packaging and broad browser/AT testing with known limitations documented.
- **Stable:** supported API, audit evidence, visual approval, representative-platform tests and published migration/release notes.

Only `registry/components.v1.json` is authoritative for component maturity. Do not update the registry without a source implementation, a lab example and a test. CI success is a prerequisite for release, not sufficient proof of WCAG conformance.

For adaptive navigation contract details, see [Adaptive shell architecture](ADAPTIVE_SHELL.md). Review all 13 screenshots for overflow, hierarchy, focus boundaries and dark/high-contrast usability.

## Verified implementation checkpoint (2026-10-16)
The complete Node source gate and Chromium Playwright suite passed on a connected Linux laptop, and limited Android Firefox touch/navigation tests were performed on a OnePlus N200. See the [dated device testing record](DEVICE_TESTING_2026_10_16.md) for exact counts, first-run failures and their corrections, transport setup, and open browser compatibility findings.

## Browser execution order (hardware-tested)
Run `npm run test:e2e` to execute 36 interaction scenarios first, 15 axe accessibility screens second, followed by 13 independent screenshot-capture tests using one browser worker and a 90-second timeout per capture. This prevents concurrent full-page screenshots from delaying interaction assertions. To isolate a stage, use `npm run test:e2e:interaction` or `npm run test:e2e:visual`. A passing browser run verifies only the scripted scenarios; hardware and screen-reader signoff remain separate.

## Firefox engine smoke testing
Run `npm run test:e2e:firefox` after `npx playwright install firefox`. It runs the same 36 interactive scenarios in the Firefox desktop browser engine. It does **not** simulate physical Android Firefox or approve accessibility. A separate optional Firefox CI job provides recurrence; only completed run results count as verified.

## Automated accessibility smoke gate
`npm run test:e2e:accessibility` runs pinned axe-core 4.10.3 on the five GC UI labs and eight additional interactive states using Chromium and the WCAG 2.0/2.1 A/AA rule tags. Run `npm install --no-save --no-package-lock @playwright/test@1.64.1 axe-core@4.10.3` first. Confirmed axe violations fail; inconclusive checks and details are attached to the Playwright report as JSON for manual review. This is not a conformance claim, and CSS gradients, translucent materials, actual assistive technology, and touch hardware require manual evaluation. Full `npm run test:e2e` now runs 36 interaction tests, 15 automated accessibility screens, and 13 visual capture tests in separate stages. Firefox runs the interaction subset.

## Alpha package integrity
`npm run pack:check` performs a local `npm pack --dry-run --ignore-scripts` and checks that every published API export is included, development labs/test output are excluded, and the alpha package remains private. The check does not create a release or publish to npm. It also runs in `npm run check` and the core CI job.

## Forms lab scope
The new [forms and search contract](FORMS_CONTRACT.md) documents text area, accessible search suggestions, validation summary, and empty-state recovery. The browser test cases verify keyboard interactions, input preservation, invalid-to-valid recovery, pointer/keyboard reset, and 320px dark layouts. Form states are also included in automated accessibility checks. The sample data is local-only.

The [Forms Lab QA checkpoint](QA_FORMS_2026-10-16.md) records the later 72-test core and 28-case browser matrix, 13 axe states, 13 screenshot fixtures, and verified GitHub Actions success. Its screenshot fixes are included in the source and smoke tests, but manual AT/visual signoff remains open.

Native form extensions add password reveal/visibility checks, select behavior, number bounds and focus recovery, simulated error/retry, and a synthetic IME composition contract. Accessibility screens include revealed sample passphrase and an open retry alert. Real IME keyboard and screen-reader testing is still required.

The focus-only Forms Lab skip link is positioned outside the document when idle and becomes fixed in the viewport when focused. A dedicated browser test ensures it does not contaminate scrolled full-page screenshots.

### Firefox local concurrency safety
The Firefox interaction smoke command uses **one browser worker**. On a laptop with an interactive Firefox session, two parallel test workers triggered sporadic navigation/timeouts despite successful GitHub Actions results. The three affected cases all passed when isolated with one worker. A final complete one-worker run is required before claiming local Firefox verification; CI remains a separate gate.

## Physical Android Firefox evidence
See [October 16 real-device QA](QA_ANDROID_FIREFOX_REAL_DEVICE_2026-10-16.md) for the first hands-on USB Android Firefox tests, including successful Android Back and keyboard behavior, landscape persistence, and the discovered footer-touch overlap. Automated `e2e/adaptive.spec.mjs` now protects a minimum mobile footer navigation clearance at 320/360/375 CSS widths. The updated suite runs **36 Chromium interactions and 36 serial Firefox interactions**. Installed TalkBack was not enabled; manual spoken accessibility remains a release gate.

## TalkBack hardware checkpoint
[Physical Android Firefox TalkBack QA](QA_TALKBACK_ANDROID_FIREFOX_2026-10-16.md) verifies selected navigation focus, double-tap activation, dialog accessibility isolation, and focusable error-summary links on a real device. The desktop connection cannot record TalkBack speech, but the **device owner listened to the tested interactions and explicitly confirmed the output was read properly and accurately — PASS**. Exact wording was not transcribed; untested spoken outcomes and WCAG certification remain open. At the owner's subsequent request, TalkBack was turned off via USB and Android verified `accessibility_enabled=0` with no active accessibility services.
