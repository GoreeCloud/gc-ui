# Android Performance and Accessibility — Instrumented QA (2026-10-17)

**Project:** GoreeCloud/gc-ui, experimental Android WebView Experience Studio.
**Release status:** Alpha, not performance certification or native accessibility acceptance.

## Scope and reproducibility

A reversible Studio checkbox, **Preview resource conservation**, applies the same presentational restrictions as a native low-power hint: decorative environment lighting, static shadows, Lens blur and coordinated motion are suppressed, while content and controls remain. It is not an Android OS battery-saver toggle. Android's debug build accepts a bounded launch extra named gcui_preview_mode with only the value conserve recognized; release builds ignore this extra. Local debug WebView evaluates a static dataset attribute and logs only the current mode, allowing the ADB test to refuse mismatched states.

The standard-library Python benchmark at scripts/qa-android-performance.py uses an ADB-authorized device, restarts only the GC UI preview package between passes, performs six alternating-direction swipe gestures per run and collects app UI-thread gfxinfo frame summaries, app PSS/RSS memory, and battery status/temperature. It never changes system settings, brightness, developer mode, TalkBack, network, or charging state. A unique device-log marker precedes every run to prevent old mode readbacks from being mistaken for current evidence. Tests for parsing and summaries are included and gated in native CI.

Reproduce from repo root with the development-signed debug APK installed:

    python3 scripts/qa-android-performance.py --serial YOUR_ADB_SERIAL --rounds 2 --swipes 6 --settle 2 --output /tmp/gc-ui-android-performance.json

A small run with rounds=1 is suitable for diagnostics. The complete eight-run anonymized numeric report is at [android-performance-2026-10-17.json](qa/android-performance-2026-10-17.json). The device serial is excluded; screenshots, raw hierarchy dumps and the full device log are not published.

## Environment

| Variable | Observed |
|---|---|
| Device model | DE2117 (Android SDK API 36) |
| SoC and RAM | SM4350, approximately 3.5 GB memory |
| Screen | 1080 × 2400 physical pixels |
| Battery | 100%, USB-powered |
| Temperature | Approximately 29.2 °C at first sample, approximately 29.3–29.6 °C over the eight-run sequence |
| Mode order | Normal–Conserve–Conserve–Normal / Conserve–Normal–Normal–Conserve |
| Workload | App cold start, 2 s warm-up, 6 ADB touch swipes, Activity gfxinfo/meminfo snapshot, four runs per mode |
| Host verification | Local GCUI.Perf readback verified the actual rendered resource mode for every run |

## Measurements

All values are **descriptive medians of four runs per mode**, not inferred hardware benchmarks or confidence intervals.

| Metric | Normal | Conserve |
|---|---:|---:|
| Activity UI-thread frames counted | 331 | 329 |
| Activity UI-thread janky frames | 2.0 | 0.5 |
| Activity UI-thread jank percent | 0.60% | 0.15% |
| 90th percentile Activity UI-frame time | 9.5 ms | 9.0 ms |
| App PSS | 150,137 KiB (146.6 MiB) | 146,788 KiB (143.3 MiB) |
| App RSS | 260,798 KiB | 257,610 KiB |

Interpretation: Both modes showed low reported app UI-thread jank in this short workload; the conservation preview produced modestly lower medians. With only four samples per mode, app-memory variability, warm-up and USB power, this does **not establish meaningful performance gain or battery-life savings**. Android Activity gfxinfo does not capture all separate WebView compositor process and GPU work. No frame-time target certification or energy-use percentage is claimed. The report is primarily a repeatable baseline for future hardware profiling.

## Verification matrix

| Gate | Observed result |
|---|---|
| Android Gradle 9.5 / AGP 9.2.1 debug APK build | PASS; BuildConfig generation explicitly enabled for development-only instrumentation |
| APK installation and debug mode logging on Android API 36 | PASS, eight current-mode readbacks verified |
| Core GC UI Node/source checks | 116/116 passed; 21 package exports present |
| Native allowlist and host contracts | 15/15 passed |
| Performance parser and stale-log marker safeguards | 4/4 tests passed |
| Chromium full interaction suite | 54/54 passed |
| Targeted Firefox native-host interactions | 6/6 passed |
| Browser axe A/AA accessibility states + native host UI flows | 27/27 passed in combined run (21 axe states + 6 native-host interactions) |
| Sandboxed Electron 44.9.0 native smoke | PASS, isolated Linux desktop launch and appearance update |
| Human TalkBack with speech output | NOT RUN; service disabled on device |

## Accessibility validation status

- TalkBack package is installed, but accessibility_enabled was 0 when inspected. No device-wide settings were altered.
- A read-only UI Automator dump exposed only the native android.webkit.WebView container and no descendant HTML control nodes while TalkBack was disabled. This neither proves nor disproves screen-reader operability; **TalkBack manual acceptance is still BLOCKED / NOT VERIFIED**.
- Browser tests validate reversible conservation preview, semantics/content persistence, label text and Tab continuity. Automated axe A/AA checks include the conservation preview state. Browser axe is not native TalkBack verification.
- The human-operated [TalkBack acceptance checklist](ANDROID_TALKBACK_ACCEPTANCE.md) defines 12 focused manual cases covering announcement, navigation, label/state, contrast, Back and resume, font expansion, and system accessibility preferences. System settings remain under the device operator's control.

## Production release gates

Manual TalkBack speech/gesture testing with an operator, multi-Android-version coverage, Android WebView accessibility hierarchy with TalkBack enabled, battery-disconnected power measurement, WebView compositor/GPU frame profiling, longer-run memory/thermal sampling, and varied low-end hardware remain open. This experiment should not be used to claim performance or WCAG certification.

**Decision:** The instrumentation and reversible preview are appropriate for continued alpha development; the native release gate remains open.
