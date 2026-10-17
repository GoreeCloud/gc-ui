# GC UI — Android HWUI GPU and Linux AT-SPI checkpoint

**Date:** 2026-10-17. **Project:** GoreeCloud/gc-ui only. **Status:** Experimental alpha, not a production release, power-efficiency certification or spoken screen-reader acceptance.

## Subsequent owner release-scope decision

**Owner clarification (2026-10-17):** Additional physical Android devices, disconnected-energy measurements, full GPU profiling, and extra human desktop VoiceOver/NVDA/Orca sessions are **optional QA**, **not stable GC UI design-system release requirements**. Older "release gate"/"BLOCKED" labels below describe that session's test status, not universal stable-release blockers. Existing evidence and claim limitations are unchanged. See [Stable Release Scope](STABLE_RELEASE_SCOPE.md).

## Concurrent workstreams

**Physical Android graphics:** The connected OnePlus DE2117 (API 36) was tested in eight balanced Normal/Conservation runs (Normal, Conserve, Conserve, Normal; Conserve, Normal, Normal, Conserve). Every run confirmed the actual native resource mode through the debug-only readback, cleared only the GC UI Activity graphics counters, and used six scrolling gestures. The probe reads the Activity Hardware UI renderer (HWUI) GPU histogram, including the pipeline identifier and exceptional 4950 ms bucket instead of hiding outliers. The new parser has four regression tests and is checked by native CI.

**Linux accessibility:** In a temporary Xvfb and D-Bus session, sandboxed Electron 44.9.0 was launched with the Chromium diagnostic force-renderer-accessibility flag. Orca successfully enumerated the Electron app. Python AT-SPI inspected 156 accessibility nodes, including headings, combo boxes, both preview checkboxes, native selection feedback, motion controls and the appearance button. Ten required document/role/name assertions passed. The real AT-SPI test passed on the Linux workstation. Its three policy parser tests run in hosted CI. The real AT-SPI probe remains a separately executable workstation acceptance diagnostic because GitHub's minimal runner did not register Electron with AT-SPI.

**Physical-power and extra-device limitations:** The phone remained USB-powered. No external current/power meter or disconnected-phone telemetry was available, and there is only one authorized physical Android phone connected. The existing separate Android 36 tablet emulator expands form-factor and WebView-provider coverage, but is neither an extra physical phone nor an extra OS API version. No other repository or emulator profile was changed.

## Eight-run HWUI GPU bucket medians

| Measurement, four runs per mode | Normal | Conservation |
|---|---:|---:|
| Samples per run | 317 | 318 |
| 50th-percentile GPU duration bucket | 4 ms | 3.5 ms |
| 90th-percentile GPU duration bucket | 7 ms | 4 ms |
| 95th-percentile GPU duration bucket | 7.5 ms | 5 ms |
| Histogram buckets above 16 ms | 0% | 0% |

Conservation had lower HWUI GPU bucket medians in this short workload. This is **exploratory**. It does not establish repeatable efficiency gains, statistical significance, full Android WebView GPU performance, battery drain, or energy savings. GPU work done by separate WebView processes is not captured as a full-system measurement by Activity gfxinfo. The [sanitized numeric record](qa/android-hwui-gpu-2026-10-17.json) includes all eight run summaries, without device serials or raw logs.

## Native Linux accessibility acceptance boundary

The [real AT-SPI inspection record](qa/electron-atspi-2026-10-17.json) shows ten required role/name assertions passed and 156 visited accessibility nodes. The Chrome/Electron diagnostic accessibility switch was used. This confirms machine-readable exposure, **not actual Orca narration, reading order, keyboard gesture usability, NVDA or VoiceOver**. No desktop screen-reader human signoff is claimed. The user-completed **Android TalkBack 12/12 manual PASS remains accepted**, unchanged by these checks.

## Repeat the verification

With the signed-off GC UI debug APK on an ADB-authorized Android device:

    npm run test:android:gpu:parsers
    python3 scripts/qa-android-gpu.py --serial YOUR_DEVICE_SERIAL --blocks 2 --swipes 6 --output /tmp/gc-ui-hwui-gpu.json

On Linux with pinned optional Electron node dependencies plus installed Xvfb, dbus-run-session and distro Python AT-SPI packages:

    npm run test:desktop:atspi:parsers
    npm run qa:desktop:atspi

Two attempts to run the *real* AT-SPI probe on the GitHub Ubuntu runner failed for environment reasons: direct Electron could not start with the default sandbox, then (under a diagnostic test-only no-sandbox flag) Electron started but did not expose an AT-SPI application. These attempts are NOT claimed as passing or as system sandbox proof. The actual workstation's isolated Xvfb/DBus probe passed with its default sandbox. CI therefore checks fail-closed AT-SPI parser policy and actual Electron keyboard/semantics via Playwright, not live AT-SPI. Real Linux screen-reader acceptance remains a distinct workstation/manual gate.

The test tools do not change system brightness, battery saver, accessibility services, network or energy settings. The real AT-SPI test runs in an isolated virtual graphical session, not the desktop user's working session.

## Remaining separate release gates

- Human Linux Orca spoken/navigation acceptance, Windows NVDA and macOS VoiceOver testing.
- Actual WebView compositor/system-wide GPU tracing and repeatable high-load/thermal profiling.
- Battery-disconnected or external power-meter instrumentation; USB-charging state cannot substitute for energy measurement.
- Second authorized physical Android device and an additional Android OS API version.
- Production signing, packaging, device-family ergonomics and independent accessibility conformance evidence.

**Release decision:** Retain GC UI experimental alpha while continuing evidence-backed checks.
