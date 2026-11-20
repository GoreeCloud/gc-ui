# Opt-in Firefox and WebKit source-lab acceptance

**Evidence scope:** local, reproducible read-only acceptance of the GoreeCloud UI design lab in independently launched Firefox and WebKit automation engines. This is **not** a universal Firefox/Safari support claim, OS-native Safari test, human screen-reader session, real consumer migration, physical-device test, or Stable release gate approval.

## Purpose and verified scope

On November 20, 2026, the protected-main alpha source was exercised in two additional real browser engines using a previously installed, inspected Apache-2.0 Playwright Core 1.64.1 runtime with locally cached Firefox and WebKit executables. No browser, npm dependency, plugin, credential or remote application was downloaded or installed by the test. The eight acceptance scenarios verify that the actual `/lab/` source loads through a loopback-only read-only HTTP fixture with source import and zero uncaught page errors.

| Engine | CSS viewport | Appearance / accent | Interaction |
| --- | --- | --- | --- |
| Firefox | 900 × 800 | Light / Iris | Theme, native action focus, form availability notice and dismiss |
| Firefox | 390 × 844 | Dark / Lagoon, reduced motion | Floating navigation last-link focus/scroll, notice and dismiss |
| Firefox | 320 × 760 | Light / Moss | Reflow, floating navigation last-link focus/scroll, notice and dismiss |
| WebKit | 900 × 800 | Light / Iris | Theme, native action focus, form availability notice and dismiss |
| WebKit | 390 × 844 | Dark / Lagoon, reduced motion | Floating navigation last-link focus/scroll, notice and dismiss |
| WebKit | 320 × 760 | Light / Moss | Reflow, floating navigation last-link focus/scroll, notice and dismiss |
| Firefox | 390 × 844 | Light / Ember, RTL, 200% CSS root text | RTL direction, enlarged text, reflow, last-link keyboard focus, form notice and native dismiss |
| WebKit | 390 × 844 | Light / Ember, RTL, 200% CSS root text | Same RTL and enlarged-text checks on the independent Linux engine |

Every scenario checks the CSS viewport, the four major design-lab section bounds, **no horizontal document overflow**, native keyboard focus and theme/independent accent choice. The extra RTL cases explicitly set document direction and **200% CSS root text scaling** and verify enlarged computed font size, section bounds, and navigation focus. CSS root text scaling is **not native browser zoom**, and the fixture's English labels are not a translated-language acceptance test. The twelve SHA-256-validated CI screenshot files now also include an RTL large-text focus-state image and post-dismiss image for each independent browser engine; screenshots are captured only after the natural focus/scroll assertion passes. The planned Mesh connection form must show a truthful unavailable status without navigating or making a connection. The notification dismiss button must remain one readable line within its bounds, and actually remove the status when clicked.

The new RTL/enlarged-text case revealed a separate **Firefox keyboard reachability defect**: at 390 CSS px, the last focused destination was partially offscreen (focused item left `-5.6px`, navigation left `16px`, navigation scrollLeft `0`, scrollable width `387px` versus client width `356px`). To address that observed difference, the first-party bottom-navigation controller now scrolls an enabled destination only when its native `focusin` bounding box is clipped. It uses `scrollIntoView({block:"nearest",inline:"nearest",behavior:"instant"})`, preserving actual route/selection and removing its handler on dispose. The Node regression tests cover clipped, already-visible, disabled, and disposed cases; real-browser outcome is tracked separately in exact-source CI and is not assumed from the code change alone.

**Additional compact RTL typography correction, November 20:** actual Firefox/WebKit `390×844` source-lab screenshots at `dir=rtl` and 200% CSS root text showed the existing long, truthful Mesh-unavailable notice squeezed into a narrow vertical word-breaking column beside an enlarged Dismiss button. The shared `.gc-toast` now wraps its children on compact viewports (480 CSS px and below), giving the message a full row and moving the still-single-line dismiss action onto a separate row aligned to inline-end. Both engines were retested with a persistent synthetic test notification, actual mouse dismissal, no page overflow and a post-dismiss screenshot; visual review confirmed intact words and readable line lengths. This is **responsive CSS text reflow**, not native browser zoom, automatic screen-reader approval or full message localization support. It does not change status semantics, timers, API behavior or authentication.

These tests exposed a genuine small-screen regression: a shared generic button-wrap rule allowed the notification's single-word Dismiss action to split into two lines. The shared component fix gives the status message flexible space and the action a non-shrinking, single-line target. This was rechecked in both engines. The CI runner captures the **initial lab view before submitting the synthetic form** and verifies that the form produces its truthful, auto-expiring unavailability notice. For the separate actual pointer-click acceptance, it creates a **non-expiring, entirely synthetic local notification** via the same first-party `toast()` component with `duration:0`, verifies its geometry, requires a native browser click on its Dismiss action and confirms that exact test notification is removed. This prevents a slow hosted WebKit screenshot from consuming the time-limited business notice while **retaining a real click-and-removal assertion**. A post-dismiss visual is captured separately. Automated screenshots are written to ignored `qa/screenshots/gc-ui-{firefox,webkit}-*.png` and visually inspected; they are **not** a substitute for founder signoff.

## Reproduction

Use a verified local checkout, Node 20+, **previously reviewed** Playwright Core runtime and installed Firefox/WebKit-compatible binaries. Set **all three** absolute, already-existing paths explicitly; the script intentionally fails when any is missing.

```sh
GC_PLAYWRIGHT_CORE_MODULE=/absolute/reviewed/playwright-core/index.mjs \
GC_FIREFOX_BIN=/absolute/verified/firefox \
GC_WEBKIT_BIN=/absolute/verified/webkit/launcher \
npm run browser:cross-engine
```

Playwright Core and the browser executable must be version-compatible; do **not** assume an arbitrary cached browser revision is certified. The workflow uses new ephemeral browser contexts, disallows navigation outside its temporary loopback origin, does not submit live forms, and closes all contexts, browser processes and the HTTP server on completion or assertion failure.

The source-controlled Node contract can be checked without Playwright or browsers, so the existing package and Node/Chromium quality gates retain **zero extra published dependencies**. A new, **separate nonpublishing** GitHub `cross-engine-lab` job now provisions an explicitly pinned, previously reviewed Playwright Core **1.64.1** and its matching Linux Firefox/WebKit runtime browsers **inside the ephemeral CI runner only**. This provisioning downloads browser/runtime dependencies in CI; it is **not** performed by the fail-closed, operator-supplied local test script, and is not part of the published GoreeCloud UI package. The CI job checks out the exact branch source, resolves concrete browser executable paths, runs these six local-only scenarios, then records observed browser versions and a SHA-256 + PNG dimensions manifest for eight synthetic screenshots. The screenshot hashes and source SHA travel together in a 7-day CI artifact. The actual job result, rather than a workflow definition, determines whether this qualification passed. The job does **not** change Stable-release gates or declare official Safari, complete supported browser versions, consumer-wide usability, or human AT approval.

**Still open:** official Safari on Apple platforms, Firefox supported versions beyond the observed runner, real-world consumers/routes, 400% *actual* Firefox/Safari browser zoom, long-form translated content, human NVDA/VoiceOver/Orca, physical device, native platform parity, complete visual acceptance and all eight Stable release gates. Chromium browser zoom is independently tested by `npm run browser:smoke` and must not be conflated with these normal-viewport tests.
