# Compose + Android Expressive — emulator runtime QA

**Status:** development-only synthetic fixture test. Does not certify a physical
Android device, TalkBack, Android release signing, production app installation or
consumer adoption. GoreeCloud UI still follows the independent Stable release
and founder visual/assistive-technology acceptance gates.

## Tested on November 20, 2026

- Source revision: protected main `1c2db317afa0a8e8132d6b6639b25fa5dd0a78de`.
- Fixture: `samples/android-compose-integration`, one Android Gradle composite that
  imports both in-repository Compose Multiplatform controls and the Android
  Material 3 Expressive outer theme.
- An isolated Linux offline Gradle 9.5.0 build assembled the dev APK after
  reviewing the in-repository source; hosting CI builds use pinned Gradle 9.4.1.
  Local file SHA-256:
  `3f4113408d1640a98d85d1cf004e0a8dd91ff75d4accc0d65cec3dcf624b9fa3`.
  Size: 12,933,585 bytes. Package
  `com.goreecloud.ui.samples.interop`, version `0.0.0-dev`.
- APK verified with Android SDK `apksigner`; the merged manifest requests
  only the app-specific signature-protected AndroidX
  `DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`. It does not request INTERNET,
  contacts, camera, microphone or storage access. CI separately guards this
  permission boundary on compiled APKs.
- A hardware-accelerated Android API 36 x86_64 AVD
  `GC_UI_QA_TABLET_API36` was run in read-only, no-snapshot, no-window,
  no-metrics mode. It is an emulator, **not** a physical Android phone.
- At 1280×800 and density 160 in light mode, the Activity launched, its
  native Compose accessibility tree exposed the local title, count, button
  and no-live-services disclaimer. Two real input taps changed the displayed
  counter from 0 to 2; no matching FATAL EXCEPTION was found in sampled logs.
- At 1080×1920 and density 420 in dark mode, the same Activity and labels
  rendered and a tap changed the count from 0 to 1; the screenshot was
  visually inspected for legible text, canonical colors, button shape and
  clipped/obscured content. The screenshot demonstrated the fixture, not a
  final designed consumer app. Changing device configuration re-creates
  in-memory fixture state; no data persistence is claimed.

## Reproducible, fail-closed developer test

From a verified `gc-ui` checkout:

```sh
gradle -p samples/android-compose-integration :app:assembleDebug --no-daemon
# Explicitly install only on your own disposable emulator, never a user phone:
adb -s emulator-5554 install -r samples/android-compose-integration/app/build/outputs/apk/debug/app-debug.apk
npm run android:emulator:smoke -- --serial emulator-5554
```

The script `scripts/verify-android-emulator.mjs` requires an explicitly named
already-online `emulator-NNNN` and kernel `ro.kernel.qemu=1`. It fails closed
for a physical/ambiguous device, unfinished boot, absent/wrong-version fixture,
or unrelated merged permissions. It never discovers devices, installs an APK,
mutates user data, toggles system colors, launches network services or saves
telemetry. It restarts only its known synthetic test Activity, reads the native
accessibility hierarchy, touches the visible Compose button and verifies the
counter changed 0→1. Its uniquely named temporary Android XML file is removed
after use. Source-only contract tests use a fake ADB executable so ordinary
Node CI cannot touch a real device.

Do not run the smoke command on an emulator containing valuable data; it
intentionally restarts the synthetic fixture. The emulator owner is responsible
for startup/shutdown, safe display settings, and snapshot protection. No
emulator is launched automatically by the npm command.

## Remaining acceptance

Independent device, platform/browser and assistive-technology acceptance
remains **OPEN**: actual Android handset/tablet runtime, TalkBack exploration,
rotation/insets across device manufacturers, screen zoom and font magnification,
user-facing onboarding/navigation and real consumer route/data behavior,
battery/performance, and founder visual approval. The source CI and emulator
smoke do not themselves satisfy Stable 1.0 release controls or app adoption.
