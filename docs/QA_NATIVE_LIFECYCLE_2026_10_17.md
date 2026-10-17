# GC UI Native Accessibility and Resume — QA (2026-10-17)

**Scope:** GoreeCloud/gc-ui experimental alpha native hosts and Experience Studio. This checkpoint is not a device performance certification, TalkBack acceptance, or store release approval.

## Changes
- Host/browser accessibility preferences are merged monotonically (strictest wins). Native reduced motion, high contrast, reduced transparency and low-power hints cannot weaken matching browser preferences or forced colors.
- Resource conservation removes ornamental environmental lighting/shadows/blur, caps semantic elevation, and skips choreography. Content semantics, focus order, touch controls and foreground text colors remain intact.
- Native capabilities refresh on visible focus/visibility restoration, with concurrent refreshes coalesced. Invalid or unavailable host replies disable native feedback while preserving browser functionality.
- Android WebView now forwards native Activity pause/resume, restoring saved system-bar treatment when resumed.
- Optional GC_PLAYWRIGHT_PORT isolates a worktree browser server; the default port 4173 previously reused another branch and yielded false failures.
- Native CI path filters include the material CSS and native bridge integration tests.

## Verified tests
- Targeted Chromium tests passed **6/6** against the correct isolated server. Cases cover low-power surface suppression, high-contrast Lens fallback, native reduced-motion skip, preferred platform profile preservation and invalid host refresh fallback.
- Source checks passed **116/116 Node tests**; generated tokens and opaque semantic color pairs passed existing checks (7,988 across 722 generated schemes). This does not certify composited contrast.
- Native contracts passed **15/15 tests** including conservative preference merge and Android lifecycle source coverage.
- Full isolated Chromium interaction suite passed **52/52** with the dedicated worktree server (GC_PLAYWRIGHT_PORT=4197).
- Targeted Firefox host integration passed **4/4**. Automated axe WCAG A/AA smoke states passed **20/20**; this is not a manual screen-reader acceptance result.
- The pinned Electron 44.9.0 preview launched successfully in an isolated run after a concurrent browser+Electron test caused a resource-contention timeout. The smoke test now provides explicit diagnostic host-state output on future connection timeouts.

## Connected Android device
- Android Gradle debug build succeeded using local JDK 21, Android SDK 36 and Gradle 9.5.
- Updated APK installed and cold-launched on a connected Android API 36 device. The WebView survived Home/background and foreground return; task state remained and native Android Phone-profile handshake was visible.
- Screenshot review verified legible text, a correct dark palette and unoccluded status/navigation bars; captures were not committed.
- A separate local-navigation check on Android API 36 followed the Studio brand link to the GC UI foundations page, then used the system Back key to return to the Studio. Both transitions rendered correctly and preserved dark appearance. This establishes one software Back-key path, not predictive-back gesture coverage.
- One Android dumpsys meminfo snapshot returned approximately **69 MB total PSS**. This is only a single memory diagnostic, not a measurement of battery savings, frame time, retained-memory growth or energy consumption. No system accessibility, animation or power settings were changed.

## Open release gates
- Manual TalkBack, real-time native system preference switching, orientation, keyboard, predictive-back swipe gestures and long-running state restoration require further validation. One local WebView Back-key navigation path was verified on device.
- Low-power/GPU measurement needs a repeatable brightness, thermal, network and scroll protocol on representative slower devices; no savings percentage is claimed.
- Windows/macOS native host signoff, code signing, production updates, Android Play readiness and independent security testing remain open.
- These automated checks do not certify general WCAG conformance or native platform production readiness.

**Decision:** Suitable for continued experimental GC UI development and CI, not stable distribution.
