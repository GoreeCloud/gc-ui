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

**Orca is installed on the authorized Linux laptop, but automated DOM and X11 checks alone cannot establish what a person hears**. The user has now confirmed an audible toast announcement and native dialog announcement/focus return in the human listening session below; the remaining screen-reader scenarios have not been signed off. Manual Safari/macOS and Windows/browser zoom, OS text scaling and a visual-review signoff likewise remain unverified. Do not claim WCAG certification or stable-component maturity based solely on this checkpoint.

## Human Orca listening session (2026-10-16)

Environment: authorized Linux laptop, Orca 42.0, Firefox with GC UI Components Lab (`http://127.0.0.1:4173/lab/components.html`). The assistant verified that Orca and speech processes were running, the Firefox window was exposed through AT-SPI, and a PulseAudio sink was present; the assistant cannot hear laptop audio.

- **Toast live announcement — user-reported PASS.** The user confirmed the listening test after activating the “Show notification” control, for the text “A quiet notification with an accessible live announcement.” This establishes one human-reported audible announcement; it does **not** establish timing under interruption, hover/focus persistence, visual review, or full screen-reader acceptance.
- **Native modal dialog announcement, Escape dismissal and trigger focus restoration — user-reported PASS.** The user confirmed all four steps of Test 2: activating the Components Lab “Delete” button, hearing the “Delete this example?” title and description, pressing Escape to dismiss, and returning to the Delete button. This is human-reported Orca/Firefox behavior for this scenario, not independent audio capture or a cross-screen-reader certification.
- **Form validation summary and error-link focus — user-reported PASS.** The user confirmed Test 3 in Firefox/Orca: submitting the empty project brief, hearing the “Check these fields” validation summary, discovering its errors, activating the Project name error link, and reaching the corresponding field with its error announced. This is one human-reported keyboard/audio scenario, not independent audio capture or a broad accessibility certification.
- **Route announcement, focused heading and current-page semantics — user-reported PASS.** In Test 4, the user confirmed that choosing Activity in the Adaptive Shell prompted an audible “Now viewing Your activity.” or equivalent announcement, moved focus to the “Your activity.” heading, and identified Activity as the current page on revisiting its navigation link. This is human-reported Orca/Firefox behavior for this scenario, not independent audio recording.
- **Toast dismissal design limitation — observed from implementation, not user-reported.** The Components Lab's notification is plain text in a polite status region, defaults to a 6-second timeout, and has no tabbable close control. Hover can pause the timeout; the controller supports focus-pausing if the toast contains a focusable descendant, but this lab toast has none. Therefore keyboard dismissal is **not an available lab interaction** and must not be presented as a passed assistive-technology check. Persistent essential information must not rely solely on this transient toast; further design review is required if user-dismissible notifications are part of the acceptance criteria.
- **Repeated toast announcements after expiration — user-reported PASS.** In Test 5, the user confirmed that Orca announced the notification on first activation, the toast expired after waiting approximately seven seconds, and the same notification was announced again after a second activation without being cut off or remaining silent. This is human-reported Orca/Firefox behavior, not an audio recording or verification of every timing/interrupt condition.
- **200% native Firefox zoom with Orca — user-reported PASS.** In Test 6, the user confirmed reaching 200% via Firefox browser zoom, then navigating with Tab to the “Show notification” and “Workspace actions” controls. Orca read both controls, keyboard focus remained visible, and the controls were usable without unintended horizontal scrolling. This is a human-reported test of specific controls, not a full-page visual audit.
- **Still pending:** the corresponding human Orca review at 400% native zoom, toast timing during concurrent interaction, retained typed data, other focus/visibility scenarios, and other manual release criteria.
