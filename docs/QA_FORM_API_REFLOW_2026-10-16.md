# GoreeCloud UI — Experimental Form API and Reflow QA

**Date:** 2026-10-16
**Verified source commit:** `2e14e5151cf938fe7be2fc0ce72ef24f0cbcf7d0`
**Repository:** `GoreeCloud/gc-ui` only
**Maturity:** `@goreecloud/gc-ui@0.2.0-alpha.1`, private/unpublished; **32 experimental, 31 specification-only, zero stable patterns**

## Purpose

This checkpoint follows the physical Android Firefox and owner-confirmed TalkBack spoken-output PASS. The focus is converting the smallest validated demo behaviors into reusable, typed experimental source APIs while protecting large-text reflow, without altering the owner's phone settings or advancing component stability without broader acceptance.

## Implemented reusable experimental behavior

`src/gc-form-controls.mjs` is exported through `src/index.mjs` and documented in `types/index.d.ts`.

- **`initPasswordReveal(input,button)`:** Requires native `input[type=password]` and a `button[type=button]` with a stable accessible name (`aria-label` or `aria-labelledby`). It toggles the visible Show/Hide text and `aria-pressed`, preserves the sample value, and automatically re-masks a revealed field during `destroy()`. It removes listeners and prevents controller actions after destruction.
- **`initNumberStepper(input,decrease,increase,{onChange})`:** Requires a native `input[type=number]`, two `type=button` controls, finite safe integer min/max, and a positive integer step dividing the interval. It normalizes manual edits on change rather than each keystroke, clamps/snap-rounds values, disables end controls at boundaries, focuses the input after step activation, and cleans up listeners. It returns `get()`, `set(value)` and `destroy()`.
- The Forms Lab now imports both helpers instead of embedding separate copies. **Search suggestions, error summaries, native select status and simulated retry remain local demo logic.** None of these controls store credentials, transmit form entries or make network calls.

The forms registry maturity and its 63-pattern inventory did not change.

## Reflow regression gate

`e2e/reflow.spec.mjs` adds five Chromium tests—one per lab (Foundations, Components, Registry, Adaptive and Forms). Each checks **320, 375, 600 and 768 CSS px**, with document/body text set to **32px** and `dir=rtl`, rejecting horizontal document overflow. `npm run test:e2e:reflow` is now included in the Chromium CI pipeline between interaction and automated axe gates.

**Limitation:** This is a doubled-text and RTL reflow screen, not browser-native 400% zoom, full translated string coverage or actual screen-reader validation.

## Observed laptop and GitHub checks

| Gate | Verified outcome |
|---|---|
| `npm run check` | **81/81 Node tests** passed, including 5 direct form-controller unit scenarios |
| Chromium interaction smoke | **36/36 passed** |
| Chromium text reflow/RTL | **5/5 passed** |
| Chromium axe A/AA smoke states | **15/15 passed**, incomplete results still require manual judgment |
| Chromium visual evidence captures | **13/13 passed**; not approved visual baselines |
| Firefox interaction smoke (single worker) | **36/36 passed** |
| Opaque color audit | **7,988 samples** passed across 722 generated theme schemes; not composite contrast certification |
| Package dry-run | **49 distributable files**, all **14 required exports/metadata paths** included, no lab/test output; not published |
| GitHub Actions | [run 38985325187](https://github.com/GoreeCloud/gc-ui/actions/runs/38985325187), **all 3 jobs passed** (core, Chromium, Firefox), job-level verified |

**Total: 186 passing automated test executions** (81 Node + 36 Chromium interaction + 5 reflow + 15 axe + 13 visual capture + 36 Firefox interaction). The 7,988 semantic color audit samples are separate and are not counted as standalone test cases. These outcomes were verified on the authorized Linux laptop at the source commit above; its checkout was synchronized and clean.

## Manual acceptance still open

- Real browser-level 200%/400% zoom, large system font-size settings, translated copy, complex RTL page content, and narrow landscape keyboard occlusion.
- TalkBack repeat coverage for the new experimental controller semantics (pressed reveal state, numeric bounds), plus VoiceOver, NVDA and cross-platform support. The **earlier physical TalkBack spoken-flow PASS remains valid only for the interactions actually tested**.
- Actual account-backed error/retry and async search correctness, full screenshot design approval, security and framework packaging review.

**No phone accessibility settings or personal data were changed or copied during this wave.** The project remains an experimental alpha, not a WCAG-certified or production-stable package.

## Reproduce

```sh
cd ~/gc-ui
npm run check
npm run test:e2e
npm run test:e2e:firefox
```
