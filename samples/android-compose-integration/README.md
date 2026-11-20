# Android Expressive + Compose Multiplatform source integration fixture

**Development-only source and APK compile smoke, not a product release or signed distribution artifact.**

This isolated Gradle composite build integrates both canonical GoreeCloud UI source modules without inventing Maven publication coordinates:

- `compose-multiplatform/gc-ui-compose`: shared Kotlin semantic colors, panel and action controls.
- `android/material3-expressive/gc-ui-compose`: outer Android Material 3 Expressive theme.
- `app`: Android Activity displaying a themed common panel and a real in-memory tap count.

The fixture pins Gradle 9.4.1, AGP 9.2.0, Kotlin Compose compiler 2.4.21, AndroidX Activity Compose 1.13.0 and SDK 37.1. Composite dependency substitutions use source; both included builds retain their separately governed toolchains, which should be harmonized only after tested compatibility.

From this directory with Gradle, JDK 17 and Android SDK configured:

```sh
gradle :app:assembleDebug --no-daemon
```

## Opt-in emulator runtime smoke

The fixture's shared Kotlin panel and native Android Expressive host can also be
exercised on an **already-running disposable Android emulator**. This step is
strictly local, never auto-installs, rejects physical-device serials and checks
the installed development app's package/version/permission contract before
touching anything. It restarts **only the synthetic fixture**, checks actual
Android UIAutomator accessibility labels, taps the real Compose button through
its on-screen bounds, and verifies the local counter changes from zero to one.

From repository root, first build and **explicitly install only on your own test
emulator** (not a user phone), then run:

```sh
adb -s emulator-5554 install -r samples/android-compose-integration/app/build/outputs/apk/debug/app-debug.apk
npm run android:emulator:smoke -- --serial emulator-5554
```

Substitute your own verified emulator serial. The command requires an online
QEMU emulator and already-installed `0.0.0-dev` fixture, never enumerates
devices, never alters system theme/density, and removes its temporary accessibility
XML. The owner should separately verify dark/light, phone/tablet geometry,
touch targets and screenshots; see [runtime QA boundaries](../../docs/ANDROID_EMULATOR_RUNTIME_QA.md).

No network, login, persistence, secret handling or telemetry. The manifest requests no INTERNET permission, disables backup and cleartext traffic, and the sole action updates a local count rather than pretending to save to a service. CI additionally inspects the **merged APK manifest**. It permits only the app-scoped, signature-protected AndroidX dynamic-receiver guard when present, and rejects every other requested permission—including networking or data access—even when injected by a transitive library. CI also verifies debug signing and logs a SHA-256 receipt. Do not ship this demo or treat it as a production application.

**Evidence boundary:** successful CI compilation proves Android source linkage of the two adapters at the pinned versions. A **separate local emulator test** can now verify one real touch interaction and exposed accessibility names for this exact synthetic fixture, but CI compilation alone does not establish runtime. Neither check proves physical-device operation, human TalkBack, production-quality motion/accessibility, consumer migration, release signing or publishing.
