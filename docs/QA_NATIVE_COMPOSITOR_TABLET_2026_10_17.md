# GC UI — Native compositor, tablet and desktop accessibility QA

**Checkpoint:** October 17, 2026. **Repository:** GoreeCloud/gc-ui only. **Maturity:** experimental alpha; not a stable native or energy-optimized release.

## Purpose and scope

Extended the existing native-host checks beyond Android Activity UI-thread frame counters. The new [SurfaceFlinger presentation probe](../scripts/qa-android-compositor.py) samples **only the GC UI drawable SurfaceFlinger layer** on an authorized Android test phone. It performs balanced Normal/Conservation scroll sequences, verifies the current rendered mode using the debug-only log readback and records aggregate frame-presentation intervals. No global brightness, accessibility, battery-saver, navigation or energy settings were changed. The only local system diagnostic mutation is clearing **GC UI's own per-layer latency history** at the start of each run.

SurfaceFlinger presentation intervals describe when that window's layer appears to present frames. **They do not measure GPU render time, GPU utilization, battery energy, WebView renderer thread latency, total end-to-end response time, or proof of actual energy savings.** Samples are from a debug APK and one USB-powered phone. Raw logs, screenshots, emulator profile state and device serials were not published.

## Phone SurfaceFlinger results

- Device: OnePlus DE2117, Android API 36, 1080×2400 physical resolution.
- Order: Normal → Conserve → Conserve → Normal; six bidirectional touch swipes per run, debug current-mode readback before every measurement.
- Window layer: the GC UI drawable leaf, not an Activity parent container or an unrelated app.
- Display vsync period reported by SurfaceFlinger: about 11.111 ms.
- Raw timestamp fields were parsed as desired / **actual-presented** / ready. Invalid/empty presentations are rejected.
- [Aggregated run-level numeric record](qa/android-surface-presentation-2026-10-17.json) contains no device serial or raw timestamps.

| Metric (median of two runs per mode) | Normal | Conservation |
|---|---:|---:|
| Presented frames per run | 63 | 63 |
| Median presentation interval | 11.11 ms | 11.11 ms |
| 90th-percentile presentation interval | 11.39 ms | 11.41 ms |
| Intervals over 1.5× the measured display-vsync period | 1.61% | 1.61% |

**Interpretation:** Presentation pacing is comparable for this short workload. Differences of hundredths of a millisecond are not a reproducible performance improvement. The 1.5× threshold is an interval descriptor, **not** certified dropped-frame or GPU-jank classification. There is no demonstrated battery improvement; separate GPU and power instrumentation remain open.

## Form-factor and WebView-provider coverage

A **GC UI-only** Android 36 virtual device was created with the profile GC_UI_QA_TABLET_API36, using the existing Android 36 default x86_64 image and Pixel C tablet definition. Existing non-GC UI emulator profiles were not modified.

| Environment | Result | Verified scope |
|---|---|---|
| Physical OnePlus DE2117 phone, Android 36, WebView 152.0.7977.64 | PASS (earlier physical-device acceptance) | Studio renders, local navigation/Back and Phone host profile; separate TalkBack 12-case user-reported PASS is not linked to a verified device/build from the user session |
| Temporary GC UI Pixel C-style tablet emulator, Android 36, built-in WebView 133.0.6943.137 | PASS after first WebView initialization | APK installs/launches, Studio visibly renders at 1280×800 / 160 dpi, selects Tablet profile, displays navigation-rail semantic status and confirms Android native host connection |
| Linux Electron 44.9.0 desktop | PASS automated smoke | Sandboxed preload, Desktop profile, runtime pin, labeled selector/checkbox, Studio heading, keyboard-focused appearance control and Enter-key appearance activation |

The tablet's first screenshot (within seconds of a clean emulator boot) was blank while WebView was initializing; a later capture displayed the complete Studio and native host controls. No controlled first-content-paint timing was collected. This is a **cold-start performance follow-up**, not a persistent functionality failure. The emulator is a second **form factor / WebView version**, not a second physical device and not a substitute for a different Android API or manual tablet assistive-technology acceptance. It was shut down after verification to free machine resources.

The new Chromium/Firefox host regression forces an Android Tablet capability reply at 1280×800 and asserts accessible control semantics, the Tablet profile, navigation-rail description, and native feedback. Linux Electron's new semantic-role/key activation assertions also do **not** establish actual Orca, NVDA or VoiceOver spoken output.

## Repeatable commands

From GC UI repository root:

    npm run test:android:compositor:parsers
    npm run test:native:contracts
    npx playwright test e2e/native-host.spec.mjs

With an authorized physical Android device running the **GC UI debug APK** and ADB connected:

    python3 scripts/qa-android-compositor.py --serial YOUR_ADB_SERIAL --blocks 1 --swipes 6 --output /tmp/gc-ui-surface-presentation.json

A separate GC UI-only tablet emulator can use the Android SDK's existing system-images/android-36/default/x86_64 image, without reusing or resetting an unrelated AVD. Keep performance and visual observations separate from physical-device usability claims. Do not publish raw ADB logs, private status-bar captures or device identifiers.

## Verification and remaining boundaries

**Local passes:** 122 core Node tests, 18 native contract tests, 5 SurfaceFlinger parser tests, 8 targeted native-host interactions each in Chromium and Firefox, 67/67 full Chromium interaction tests, and an actual Electron 44.9.0 launch with keyboard/semantic assertions. The hosted native contract job also runs the five new parser tests.

**Android TalkBack:** The previously completed **12/12 user-reported manual PASS** remains accepted; see [TalkBack record](QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md). Nothing in this checkpoint reopens that test.

**Still open:** macOS/Windows native screen readers, actual Linux Orca speech review, a second *physical* Android device and an additional API release, formal cold-start timing on constrained devices, actual WebView compositor/GPU timing, disconnected-power energy measurement, production signing and cross-platform release packaging. Neither this QA nor green automated CI justifies a blanket WCAG or energy-efficiency claim.

**Release decision:** Experimental alpha; suitable for further GC UI development and measurable regression checks.
