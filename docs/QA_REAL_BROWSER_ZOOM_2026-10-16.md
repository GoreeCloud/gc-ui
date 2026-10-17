# GoreeCloud UI — Genuine Browser Zoom and Assistive Technology Acceptance

**Date:** 2026-10-16
**Scope:** `GoreeCloud/gc-ui` only
**Status:** experimental `0.2.0-alpha.1`; no stable-component or WCAG promotion

## Verified method

The previous [effective-viewport gate](QA_EFFECTIVE_ZOOM_2026-10-16.md) used narrow CSS viewports equivalent to 200%/400% zoom, but **did not alter real browser zoom**. This checkpoint adds a complementary real-browser mechanism: an isolated Xvfb server, fully headed Chromium/Firefox, no Playwright viewport override, and genuine Ctrl+= commands sent to the browser window through X11 XTest (Python ctypes). The automation verifies `window.devicePixelRatio` and the *actual* `window.innerWidth`, not merely `document.documentElement.style.zoom`.

Observed starting viewport on the authorized Linux laptop (at 100%):
- Chromium: **1280×713 CSS px**, device-pixel ratio 1.
- Firefox: **1280×724 CSS px**, device-pixel ratio 1.

At **200%** the CSS viewport width is 640 px with DPR 2; at **400%** it is 320 px with DPR 4. Chrome steps reach 200% at five zoom increments and 400% at eight. Firefox uses different increments (200% at ten), which the tool detects dynamically rather than assuming fixed key counts.

## Automated observation on Linux laptop

- **Chromium:** 20 layout/direction combinations (5 labs × 200%/400% × LTR/RTL) passed with horizontal overflow <=1px and actual zoom verified. 400% navigation, modal focus recovery, footer link and native form focus checks passed.
- **Firefox:** the same 20 layout/direction combinations passed, and 400% navigation, modal, footer and form controls succeeded using a verified X11 mouse click for bottom navigation and keyboard Enter for other controls.
- Up to ten native-browser screenshots per engine and `metrics.json` evidence are generated to ignored `test-results/real-browser-zoom/<engine>/`. Remote CI should publish them as short-lived job artifacts. Screenshot capture can fail in a CI Xvfb/GPU combination even when zoom, layout and interaction assertions pass; the script records any missing images as explicit warnings and failures in `metrics.json`, not fabricated visual evidence. Human visual inspection is still a separate release gate.
- Both engines reset successfully from 400% to 100% using the browser's native reset shortcut.

**Testing pitfall discovered:** At Firefox native 400% zoom, Playwright `locator.click()` incorrectly reported the header as a pointer interceptor even when `document.elementFromPoint` reported the correct bottom-nav icon. A real X11 physical pointer event at the browser-content coordinates *did* produce `pointerdown`, `pointerup`, `click` and navigate to `#library`. This is **not supported evidence of a product header overlap defect**; no speculative CSS fix was made. The suite uses XTest pointer input and keyboard navigation for Firefox instead of relying on that synthetic locator.

## CI and release gates

**Remote CI verified:** [GC UI quality gates run 38992357848](https://github.com/GoreeCloud/gc-ui/actions/runs/38992357848) completed successfully for reviewed PR head `8f611643cff8e1c1d3ecdc1834172c0ad576cb13`. All three jobs passed. The pre-existing **208 automated test executions** remain green, plus **two native browser zoom suites**: Chromium and Firefox each passed 20 real-zoom layout/direction cases (40 total), their 400% interaction journeys, native zoom reset, and all ten requested screenshot captures (**20/20 CI images, 0 screenshot failures**). [PR #4](https://github.com/GoreeCloud/gc-ui/pull/4) was squash-merged into `main` as `4a05854c3fbcea9a0740701e4a16ee78b8b7b0ad`. The initial CI attempt had a transient Chromium screenshot API failure; the final successful run recorded none. Screenshot generation is evidence capture, not a human visual approval.

### Human assistive-technology checklist — not yet signed off

A human must confirm, with a real screen reader and audio output:
1. Focus order and discernible focus indicators at native 200% and 400% zoom.
2. Toast polite announcement timing, interruption behavior, focus/hover persistence, user dismissal and replacement under live speech.
3. Validation-summary announcement, linked errors and retained typed values.
4. Route announcements, dialog entry/exit/close and restored trigger focus.
5. High contrast, reduced transparency, keyboard occlusion and long text at native zoom.

**Orca is installed on the authorized Linux laptop, but automated DOM and X11 checks alone cannot establish what a person hears**. Orca spoken utterances and user comprehension have not been owner-confirmed for this wave. Manual Safari/macOS and Windows/browser zoom, OS text scaling and a visual-review signoff likewise remain unverified. Do not claim WCAG certification or stable-component maturity based solely on this checkpoint.

## Human Orca listening session (2026-10-16)

Environment: authorized Linux laptop, Orca 42.0, Firefox with GC UI Components Lab (`http://127.0.0.1:4173/lab/components.html`). The assistant verified that Orca and speech processes were running, the Firefox window was exposed through AT-SPI, and a PulseAudio sink was present; the assistant cannot hear laptop audio.

- **Toast live announcement — user-reported PASS.** The user confirmed the listening test after activating the “Show notification” control, for the text “A quiet notification with an accessible live announcement.” This establishes one human-reported audible announcement; it does **not** establish timing under interruption, hover/focus persistence, visual review, or full screen-reader acceptance.
- Dialog announcement, focus restoration, route changes, validation-summary speech and remaining manual checks: **not yet tested by user in this listening session**.
