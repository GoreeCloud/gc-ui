# GC UI — Concurrent native readiness verification

**Date:** 2026-10-17. **Repository:** GoreeCloud/gc-ui. **Status:** Experimental alpha. No battery savings, human VoiceOver/NVDA signoff or production signing claimed.

## Equipment and disconnected-power gate

A new read-only [power/device preflight](../scripts/qa-android-power-readiness.py) inspected connected devices and BatteryManager status. It changes no ADB/network, charging, accessibility, brightness or app settings.

| Gate | Observed state |
|---|---|
| Authorized physical Android count | **1** — OnePlus DE2117, API 36 |
| USB power | **Connected** |
| Battery status | **Charging** |
| Charge/thermal context | About 91% / 31.6 °C |
| Disconnected-power workload readiness | **BLOCKED, fail-closed** |
| Second physical phone | **NOT AVAILABLE** |
| Joules or mWh actually measured | **NO** |

The [anonymized preflight result](qa/android-device-power-preflight-2026-10-17.json) contains no device serial. Six parser/contract tests exercise unknown fields, USB-powered false positives, discharging state, battery/temperature thresholds and emulator-vs-physical counting.

The strict preflight intentionally exits 2 unless it observes both an authorized second physical phone and one safe unplugged discharging device. Even readiness would not itself measure consumption: controlled workloads and validated unplugged telemetry or a calibrated external power meter are needed. Do not enable insecure wireless ADB, change charging controls or infer power savings from a USB charging snapshot.

## Windows/macOS portable Electron acceptance track

Added dedicated Windows/macOS hosted jobs for the optional pinned Electron 44.9.0 GC UI Studio. Each independently installs locked optional desktop dependencies, validates local lab resources and private-package/lockfile status, enforces native IPC and file-deny-list contracts, and attempts the same real Electron semantic/keyboard appearance-launch smoke as Linux. Screenshot output uses the OS-native temporary directory. The web security, preload isolation, sandbox and local-resource allowlist remain unchanged.

**Hosted result: PASS for both macOS and Windows** on source commit ebaa5363c9c79ad6e943ad46e6eaf06f244f3be0. [Native CI run 39079696322](https://github.com/GoreeCloud/gc-ui/actions/runs/39079696322) completed **5/5**: Android debug build, native contracts/power parser, Linux Electron preview, macOS pinned Electron preview, and Windows pinned Electron preview. Both new desktop jobs passed actual application launch, native-host profile, accessible control roles, keyboard appearance switching, lockfile/resource integrity and deny-by-default host protocol checks.

[Core CI run 39079696359](https://github.com/GoreeCloud/gc-ui/actions/runs/39079696359) completed **3/3**: token/source integrity, Chromium, Firefox.

These are **real hosted GUI smoke passes**, but not signed Windows/macOS installers or human VoiceOver/NVDA listening tests. No speech output on those operating systems was claimed.

## Distinct manual and physical release acceptance

- **Unplugged power:** An authorized wireless-debug session that does not expose insecure ADB transport, or an external calibrated power meter, plus a charged, disconnected and thermally controlled phone. Record comparable ABBA workloads and an actual joule or mWh measurement. The preflight cannot substitute for this.
- **Second physical phone:** Connect and authorize another phone, record model/API/WebView, verify the Studio launch, navigation, large type/rotation, and native accessibility. Emulators do not count as physical devices.
- **Desktop spoken screen readers:** Actual human navigation/listening on Linux Orca, Windows NVDA and macOS VoiceOver. Prior local Orca speech-output events are real software emissions but not a human listener report.
- **Distribution:** Properly signed Windows/macOS installers and release validation remain open.

Previously completed Android TalkBack TB-01 through TB-12 user-reported PASS remains unchanged.

## Reproducible commands

Read-only Android preflight:

    npm run test:android:power-readiness:parsers
    npm run qa:android:power-readiness
    python3 scripts/qa-android-power-readiness.py --strict

Strict mode is **expected to reject current hardware**, not record a pass.

With optional Electron dependencies installed from the pinned desktop lockfile:

    npm run qa:desktop:portability
    npm run test:native:contracts
    npm run qa:native:desktop:direct

Headless Linux continues to use the Xvfb-based qa:native:desktop script.

**Release decision:** Retain experimental alpha and differentiate successful automated coverage from unverified physical or human acceptance.
