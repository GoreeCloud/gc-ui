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

No network, login, persistence, secret handling or telemetry. The manifest requests no INTERNET permission, disables backup and cleartext traffic, and the sole action updates a local count rather than pretending to save to a service. CI additionally inspects the **merged APK manifest**, rejecting every requested permission even if introduced by a transitive library; verifies debug signing, and logs a SHA-256 receipt. Do not ship this demo or treat it as a production application.

**Evidence boundary:** successful compilation proves Android source linkage of the two adapters at the pinned versions. It does not prove emulator/physical-device runtime, visual accessibility, screen-reader acceptance, native animation quality, release signing, or rollout in any consumer.
