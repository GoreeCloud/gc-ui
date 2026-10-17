# GC UI — Deep Native Verification

**Date:** 2026-10-17. **Scope:** GoreeCloud/gc-ui only. **Status:** Experimental alpha, not power or accessibility certification.

## Results

- **Android 15 / API 35 emulator: PASS.** A dedicated GC UI-only Pixel 2-style emulator running Android API 35 and com.android.webview 124.0.6367.219 installed and launched the GC UI debug APK, recovered from first-boot WebView initialization, rendered the Experience Studio, opened the GC UI design-language page, and returned to Studio using Android Back. The emulator was shut down afterwards. The Android API 36 physical-phone/WebView 152 baseline remains verified separately. This is a second **API version**, but NOT a second physical device.
- **Perfetto app/WebView/SurfaceFlinger trace: PASS for narrow process aggregation.** The only authorized physical Android phone (OnePlus DE2117, API 36) produced two controlled eight-second binary traces with actual Normal/Conservation readbacks and five scrolling gestures in each mode. The locally downloaded official Perfetto Trace Processor queried the GC UI process, sandboxed WebView renderer and SurfaceFlinger CPU slices. Raw system traces were discarded from the temporary query directories and never committed.
- **Actual Orca-generated speech: PASS for four expected events.** Genuine Orca 42 on an isolated Xvfb/D-Bus session emitted expected SPEECH OUTPUT events when the real sandboxed Electron 44.9.0 Studio controls were focused through AT-SPI. The platform selector role, Desktop value, resource-conservation unchecked role/state and theme-dependent appearance action were observed. All three focus grabs were accepted. This test intentionally suppresses sound to the operator's speakers, so **human audible listening/gesture acceptance remains OPEN**.
- **Unplugged battery-power and second physical phone: BLOCKED by connected hardware.** The OnePlus phone remains USB-powered and it is the only connected authorized physical Android device. Neither requirement is marked PASS.
- **Android TalkBack 12/12 manual user-reported PASS:** Previously completed and unchanged. This work does not reopen it.

## Perfetto two-mode comparison

[Sanitized metric record](qa/android-perfetto-webview-2026-10-17.json) contains only named GC UI/WebView/SurfaceFlinger aggregates without raw system events, serials or traces.

| Metric | Normal | Conservation |
|---|---:|---:|
| WebViewFunctor::drawGl CPU slices | 250 | 255 |
| Mean WebView draw CPU slice | 1.085 ms | 1.115 ms |
| Maximum WebView draw CPU slice | 3.723 ms | 3.066 ms |
| Mean GC UI Skia GPU-related CPU slice | 0.104 ms | 0.092 ms |
| Mean SurfaceFlinger Skia GPU-related CPU slice | 0.387 ms | 0.379 ms |
| WebView sandbox renderer scheduled CPU slices | 2,861 | 2,908 |
| Mean sandbox renderer scheduled CPU slice | 0.175 ms | 0.178 ms |

These are **CPU trace slices and scheduling intervals**, not executed hardware GPU instructions, a system-wide WebView GPU trace, battery energy in joules, or a statistically supported performance difference. The modest variation is mixed; Conservation did not show consistently lower WebView draw duration. The trace includes additional graphics event labels but publishing the original OS-wide binary trace is inappropriate for privacy.

The bounded [Perfetto probe](../scripts/qa-android-perfetto.py) discards raw trace files after computing aggregates. It requires an official locally installed Trace Processor; GitHub CI checks its dependency-free parser contracts rather than running without an Android device.

## Orca generated-speech checkpoint

[Sanitized result](qa/electron-orca-generated-speech-2026-10-17.json) records four required speech-output assertions and accepted focus transitions on the actual Electron accessibility tree.

| UI focus | Observed Orca speech generation |
|---|---|
| Platform selection | “Platform profile combo box.” |
| Selected platform | “Desktop.” |
| Resource-conservation checkbox | “Preview resource conservation check box not checked.” |
| Appearance control | “Switch to dark appearance push button.” or correctly theme-dependent light counterpart |

The Linux workstation was evaluated in a dedicated virtual display and temporary D-Bus session, with separate Orca preferences. Raw speech-debug logs and temporary preferences are not published. The repeatable [Orca probe](../scripts/qa-orca-speech.py) is workstation-only and checks real Orca SPEECH OUTPUT lines; CI runs safe parser checks. Human listening, reading order, keyboard gestures, Orca usability, Windows NVDA and macOS VoiceOver are still distinct acceptance requirements.

## Remaining hardware-dependent gates

| Gate | Result | Why it is still open |
|---|---|---|
| Unplugged/external power measurement | **BLOCKED** | USB-powered phone; no independent calibrated power meter or unplugged trace/return capture. No battery-savings percentage is claimed |
| Second physical Android device | **BLOCKED** | Only one physical phone connected. Emulator API 35 expands software versions but does not count as a physical second device |
| End-to-end hardware WebView/GPU energy | **OPEN** | Perfetto CPU/renderer and graphics labels do not measure physical GPU energy or end-to-end latency |
| Human Linux Orca listening/gesture acceptance | **OPEN** | Genuine utterances generated; no human audible navigation report |
| Windows NVDA / macOS VoiceOver | **OPEN** | No authorized systems running these platform screen readers available |
| Native release signing and installers | **OPEN** | Debug preview verification is not signed production distribution |

### Repeatable commands

On an authorized Android device running the GC UI debug APK, with the official Perfetto Trace Processor installed locally:

    npm run test:android:perfetto:parsers
    python3 scripts/qa-android-perfetto.py --serial YOUR_DEVICE_SERIAL --trace-processor /path/to/trace_processor_shell --output /tmp/gcui-perfetto.json

On a Linux workstation with Orca, Python AT-SPI, Xvfb, a D-Bus session and pinned Electron preview dependencies:

    npm run test:desktop:orca:parsers
    npm run qa:desktop:orca:generated-speech

**Release decision:** Keep GC UI experimental alpha. This closes API 35 emulator compatibility and verified Orca speech generation, while clearly retaining true power, multi-physical-device and manual desktop signoff gates.
