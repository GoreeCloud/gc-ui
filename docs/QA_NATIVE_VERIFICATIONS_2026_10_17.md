# GC UI — Native, accessibility and performance verification checkpoint

**Date:** October 17, 2026 — afternoon checkpoint.
**Tested source:** e77d207a451853134cb0cefc68b81caccc3d3301 in GoreeCloud/gc-ui.
**Status:** Experimental alpha; not WCAG certification or production-release approval.

## Later manual TalkBack acceptance report

On 2026-10-17 the person conducting the Android TalkBack walkthrough confirmed **all twelve TB-01 through TB-12 tests PASSED**. See the [user-reported acceptance record](QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md). Earlier statements about a disabled screen reader below describe the assistant's *previous* ADB session only; they are not a current claim that the user has not performed the manual tests. Actual individual spoken phrases were not supplied and are not invented here.

## Verification method

Verified the published source in an isolated local Git worktree, with dedicated Playwright server ports to prevent reusing another branch's web server. Rebuilt and installed the latest Android debug APK over the GC UI preview application only. No device-wide accessibility, animation, battery-saver, brightness, or navigation settings were changed. Android screenshots and hierarchy XML stayed on the authorized laptop and are not publicly uploaded.

## Hosted CI

| Gate | Result | Reference |
|---|---|---|
| Core hosted workflow at e77d207 | PASS | [Core CI run 39071766068](https://github.com/GoreeCloud/gc-ui/actions/runs/39071766068) |
| Native-host hosted workflow at e77d207 | PASS | [Native CI run 39071766121](https://github.com/GoreeCloud/gc-ui/actions/runs/39071766121) |

## Repeated local checks

| Gate | Observed |
|---|---|
| Node/source tests | 122/122 passed |
| Native host contracts | 18/18 passed |
| Android performance parser tests | 4/4 passed |
| Chromium targeted axe, native-host and composited checks | 31/31 passed |
| Firefox native-host and composited checks | 10/10 passed |
| Color-role audit | 7,988 pairs, zero failures |
| Analytic composited-material contrast | 7,260 checks across 726 schemes, zero failures |
| npm dry-run | 124 public package files, all 21 required exports |
| Real Electron 44.9.0 Linux launch | PASS: native desktop profile and appearance change |
| Android debug APK | PASS: rebuilt with SDK 36 and JDK 21, installed and launched on physical device |

Browser axe scanning is not an Android screen-reader spoken-output test.

## Physical Android read-only observations

- OnePlus DE2117, Android API 36, WebView provider com.android.webview version 152.0.7977.64.
- GC UI Experience Studio rendered in its existing dark appearance, with readable foregrounds and unoccluded system bars in the inspected viewport.
- The local brand link opened the GC UI foundations page. The Android Back key returned to the Studio with dark appearance preserved. This is not predictive-back gesture verification.
- The GC UI app remained running and exposed app memory counters; this standalone snapshot does not establish memory longevity or battery efficiency.
- TalkBack package is installed, but the enabled accessibility setting remained zero, with no bound accessibility services. No TalkBack speech was observed.
- Read-only UI Automator hierarchy contained five nodes including the WebView container and no HTML descendants with TalkBack disabled. That is inconclusive, not a TalkBack pass or failure.

Manual TalkBack acceptance is still **NOT VERIFIED**. Use the existing [12-case Android TalkBack acceptance protocol](ANDROID_TALKBACK_ACCEPTANCE.md) with a human operator to evaluate spoken labels, focus order, gestures and live announcements.

## New four-run performance comparison

A normal / conserve / conserve / normal sequence used six scroll gestures per run, a two-second warm-up and current resource-mode log verification on every pass. The machine-readable numeric evidence is [late-afternoon performance comparison](qa/android-performance-2026-10-17-late.json). The Android device remained USB-powered, at approximately 76% battery with measured temperature around 30.1–30.3 °C.

| Metric, median of two passes per mode | Normal | Conservation |
|---|---:|---:|
| Activity UI-thread frames | 325 | 328 |
| Activity UI-thread jank percentage | 0.46% | 0.30% |
| Activity 90th-percentile UI frame duration | 9 ms | 10 ms |
| App proportional memory PSS | 166,492.5 KiB (~162.6 MiB) | 167,169 KiB (~163.3 MiB) |

The conservation mode had slightly less reported jank but **slightly higher p90 frame duration and process PSS** during this short run. Unlike the earlier eight-run results, there is no consistently lower median. These small, noisy samples do not show statistically established performance improvements, GPU/WebView compositor savings or actual energy savings. Android Activity gfxinfo omits separate WebView compositor work, and USB power prevents a battery-drain comparison.

## Outstanding acceptance and release boundaries

Verified: source contracts, analytic contrast model, automated browser accessibility states, Android debug-build/display/basic Back navigation, desktop host launch and repeatable instrumentation.

Open: actual TalkBack narration/gesture/focus review with its service enabled, font-size/rotation and predictive-back real-device tests, a second Android device class, disconnected-power consumption, WebView compositor/GPU profiling, longer thermal/memory runs and Windows/macOS screen-reader acceptance. The UI remains experimental alpha.

**Required next human step:** On the authorized device, enable TalkBack through Android Accessibility settings and run TB-01 to TB-12 in [TalkBack acceptance](ANDROID_TALKBACK_ACCEPTANCE.md). Record actual announced names/states and focus behavior. Do not automatically mutate global accessibility settings or interpret a read-only hierarchy dump as a human listening test.
