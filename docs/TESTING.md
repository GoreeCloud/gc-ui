# GC UI — Verification and Quality Gates
**Status:** 0.2.0-alpha.1 working agreement. This document distinguishes test execution from accessibility or visual signoff.

## 1. Source-level checks (dependency-free)
Run `npm run check` from the repository root. It runs:
- `npm run tokens:check`: regenerates token CSS and compares byte-for-byte with `styles/gc.v1.generated.css`.
- `npm test`: Node tests for color roles, high-contrast and forced-color mapping, theme runtime, menus, tabs, dialogs, native component semantics, icon sprite structure, type/package exports, and implementation-registry traceability.
- `npm run audit:colors`: samples 361 hexadecimal seed colors in both appearances (722 generated schemes), checks foreground and background pairs, baseline accent pairings and high contrast.
- `node tests/check-lab-references.mjs`: rejects broken local asset references in the four browser labs.
The seed sample tests **opaque color roles**. It is not a proof that overlay text contrasts against arbitrary photos/videos or that all possible sRGB seeds pass.

## 2. Browser interaction checks (Playwright)
The alpha suite currently defines 20 interaction scenarios across Components, Foundations, Registry and Adaptive labs, four axe-core accessibility smoke scenarios, and eight independent screenshot-capture tests. This is a test inventory, not a claim that GitHub Actions or browser audits passed.
The optional browser suite is in `e2e/*.spec.mjs`. GitHub Actions installs `@playwright/test@1.64.1` and Chromium in a separate job, then runs `npm run test:e2e`. To run locally:
```sh
npm install --no-save --no-package-lock @playwright/test@1.64.1
npx playwright install chromium
npm run test:e2e
```
The Playwright config starts a local Python static server, so no production deployment is needed. Browser tests also assert cross-page theme preferences, high-contrast custom-seed suppression, natural forward/reverse menu Tab focus movement, and keyboard menu action results. Supported smoke scenarios: native checkboxes/radios, toggle button labeling, focus/keyboard tabs, menu keyboard behavior and Escape focus recovery, light/dark and forced-colors preference changes, high-contrast precedence over curated palettes, native progress and disclosure, catalog search/status filtering, custom seed generation, and compact 320px layouts.

## 3. Visual evidence
`e2e/visual-capture.spec.mjs` captures **eight screenshot fixtures** on Chromium:
- components lab, desktop light, 1440x900
- components lab, desktop dark, 1440x900
- components lab, high-contrast dark, 1440x900
- components lab, compact light, 375x812
- component registry, desktop, 1440x900
- adaptive shell at 375x812, 840x900, and 1440x900

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

For adaptive navigation contract details, see [Adaptive shell architecture](ADAPTIVE_SHELL.md). Review all eight screenshots for overflow, hierarchy, focus boundaries and dark/high-contrast usability.

## Verified implementation checkpoint (2026-10-16)
The complete Node source gate and Chromium Playwright suite passed on a connected Linux laptop, and limited Android Firefox touch/navigation tests were performed on a OnePlus N200. See the [dated device testing record](DEVICE_TESTING_2026_10_16.md) for exact counts, first-run failures and their corrections, transport setup, and open browser compatibility findings.

## Browser execution order (hardware-tested)
Run `npm run test:e2e` to execute 20 interaction scenarios first, four axe accessibility screens second, followed by eight independent screenshot-capture tests using one browser worker and a 90-second timeout per capture. This prevents concurrent full-page screenshots from delaying interaction assertions. To isolate a stage, use `npm run test:e2e:interaction` or `npm run test:e2e:visual`. A passing browser run verifies only the scripted scenarios; hardware and screen-reader signoff remain separate.

## Firefox engine smoke testing
Run `npm run test:e2e:firefox` after `npx playwright install firefox`. It runs the same 17 interactive scenarios in the Firefox desktop browser engine. It does **not** simulate physical Android Firefox or approve accessibility. A separate optional Firefox CI job provides recurrence; only completed run results count as verified.

## Automated accessibility smoke gate
`npm run test:e2e:accessibility` runs pinned axe-core 4.10.3 on the four GC UI labs using Chromium and the WCAG 2.0/2.1 A/AA rule tags. Run `npm install --no-save --no-package-lock @playwright/test@1.64.1 axe-core@4.10.3` first. Confirmed axe violations fail; inconclusive checks and details are attached to the Playwright report as JSON for manual review. This is not a conformance claim, and CSS gradients, translucent materials, actual assistive technology, and touch hardware require manual evaluation. Full `npm run test:e2e` now runs 20 interaction tests, 4 automated accessibility screens, and 8 visual capture tests in separate stages. Firefox runs the interaction subset.
