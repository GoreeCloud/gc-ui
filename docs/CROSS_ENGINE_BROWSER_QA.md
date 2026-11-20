# Opt-in Firefox and WebKit source-lab acceptance

**Evidence scope:** local, reproducible read-only acceptance of the GoreeCloud UI design lab in independently launched Firefox and WebKit automation engines. This is **not** a universal Firefox/Safari support claim, OS-native Safari test, human screen-reader session, real consumer migration, physical-device test, or Stable release gate approval.

## Purpose and verified scope

On November 20, 2026, the protected-main alpha source was exercised in two additional real browser engines using a previously installed, inspected Apache-2.0 Playwright Core 1.64.1 runtime with locally cached Firefox and WebKit executables. No browser, npm dependency, plugin, credential or remote application was downloaded or installed by the test. The six acceptance scenarios verify that the actual `/lab/` source loads through a loopback-only read-only HTTP fixture with source import and zero uncaught page errors.

| Engine | CSS viewport | Appearance / accent | Interaction |
| --- | --- | --- | --- |
| Firefox | 900 × 800 | Light / Iris | Theme, native action focus, form availability notice and dismiss |
| Firefox | 390 × 844 | Dark / Lagoon, reduced motion | Floating navigation last-link focus/scroll, notice and dismiss |
| Firefox | 320 × 760 | Light / Moss | Reflow, floating navigation last-link focus/scroll, notice and dismiss |
| WebKit | 900 × 800 | Light / Iris | Theme, native action focus, form availability notice and dismiss |
| WebKit | 390 × 844 | Dark / Lagoon, reduced motion | Floating navigation last-link focus/scroll, notice and dismiss |
| WebKit | 320 × 760 | Light / Moss | Reflow, floating navigation last-link focus/scroll, notice and dismiss |

Every scenario checks the CSS viewport, the four major design-lab section bounds, **no horizontal document overflow**, native keyboard focus and theme/independent accent choice. The planned Mesh connection form must show a truthful unavailable status without navigating or making a connection. The notification dismiss button must remain one readable line within its bounds, and actually remove the status when clicked.

These tests exposed a genuine small-screen regression: a shared generic button-wrap rule allowed the notification's single-word Dismiss action to split into two lines. The shared component fix gives the status message flexible space and the action a non-shrinking, single-line target. This was rechecked in both engines. The CI runner captures the **initial lab view before submitting the synthetic form**, then verifies an actual click on the expiring notice's dismiss button and captures a **post-dismiss** view. This sequencing prevents a slow hosted WebKit screenshot from outlasting the short-lived notice and falsely appearing as failed click acceptance; the click-and-removal assertion remains mandatory. Automated screenshots are written to ignored `qa/screenshots/gc-ui-{firefox,webkit}-*.png` and visually inspected; they are **not** a substitute for founder signoff.

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
