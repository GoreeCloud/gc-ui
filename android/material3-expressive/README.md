# GoreeCloud Material 3 Expressive — Android source adapter

This is an alpha Kotlin / Jetpack Compose library source module, **not** a released
binary, SDK, signed APK or proof that consuming applications have adopted it.

## Build

From this folder (Gradle 9.4.1 / JDK 17 / Android SDK platform 37.1):

    gradle :gc-ui-compose:assembleDebug

Android Studio can open this folder as its own Gradle project. The module uses
Material 3 1.5.0 stable, Compose 1.13.0, AGP 9.2.0 and Kotlin Compose plugin 2.2.10.
No Maven publication is configured. Include the module source in a consuming
app's Gradle project; do not pretend an AAR is published.

## Compose usage

    GoreeCloudExpressiveTheme(accent = GoreeAccent.Iris) {
        // Standard Material 3 components
    }

For apps with 3–5 primary destinations, place GoreeFloatingNavigationBar in a
Scaffold bottomBar, reserve scaffold contentPadding for scrolling content,
and use the supplied onDestinationSelected callback for real navigation.

## Contracts

- Canonical JSON: ../../tokens/gc.tokens.json
- Rebuild generated Kotlin: node scripts/generate-compose-tokens.mjs --write
  (run from the repository root).
- Check reproducibility: node scripts/generate-compose-tokens.mjs --check.
- Accents: Iris, Lagoon, Ember, Moss; light and dark are supported.
- Wallpaper color is **opt-in** on Android 12+ and may override GC UI brand colors.
- Consumer-supplied reduceMotion uses standard Material motion instead of Expressive;
  the consumer must additionally honor its Android user/system animation preferences.
- Keep Cloud Lens floating with a solid fallback; retain rounded shapes, safe insets,
  TalkBack and responsive layouts. No storage, telemetry, credential access or network.
- Color candidates remain provisional until founder visual and device acceptance.

Other approved Android stacks (Flutter, React Native + Expo, Kotlin Multiplatform +
Compose Multiplatform) must implement the same GC UI and expressive behavior through
compatible supported components. This Kotlin module does **not** satisfy their
framework or runtime requirements by itself.
