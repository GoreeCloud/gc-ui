# GoreeCloud UI Flutter Material 3 expressive-equivalent

This Flutter package is a **source-level, unpublished** adapter for the
founder-approved Flutter Android stack (and its shared Linux/iOS targets).

It uses Flutter's supported Material 3 controls with canonical GoreeCloud UI
light/dark palettes, Iris/Lagoon/Ember/Moss accent families, rounded controls
and a compact floating, inset-aware navigation component. It is **not**
the full native Jetpack Compose Material 3 Expressive implementation: Flutter's
official expressive motion/component library remains in development.

## Source integration

Copy this directory into the consumer repository from a reviewed and pinned
gc-ui source commit. Retain MIT provenance and add a local path dependency:

    dependencies:
      goreecloud_ui_expressive:
        path: ../vendor/gc_ui_expressive

Consumer code:

    MaterialApp(
      theme: GoreeCloudFlutterTheme.build(brightness: Brightness.light),
      darkTheme: GoreeCloudFlutterTheme.build(brightness: Brightness.dark),
      themeMode: ThemeMode.system,
    )

A consumer may render GoreeCloudFloatingNavigation in
Scaffold.bottomNavigationBar for 2–5 genuinely useful primary destinations.
Do not create fake routes. The consumer must select appropriate expanded
navigation for tablets/foldables and test keyboard focus, RTL and screen readers.

GoreeCloudMotion.reduced(context) reports the OS animation preference.
**Consumers must apply the preference** to their own animated workflows:
the theme alone does not disable all Flutter animations.

## Token authority and testing

Canonical source: tokens/gc.tokens.json. Generate and verify from repository
root using these nonprivileged, offline commands:

    node scripts/generate-flutter-tokens.mjs --write
    node scripts/generate-flutter-tokens.mjs --check

Flutter CI runs analyzer and widget tests on Flutter 3.27.4, while Node checks
the exact generated token values. No remote API, credentials, storage, analytics
or app-level user-data access is added by this adapter.

Flutter source testing is not device visual acceptance, a signed APK,
material-expressive feature parity certification, or a consumer migration.

References:
- https://docs.flutter.dev/release/breaking-changes/material-3-default
- https://flutter.dev/blog/decoupling-material-cupertino
- https://github.com/GoreeCloud/gc-ui/blob/main/docs/ANDROID_MATERIAL3_EXPRESSIVE.md

## Canonical text contrast and motion tests

Source-level Flutter tests now verify **WCAG 2 AA 4.5:1 or better** for seven opaque reading/text semantic color pairs in every Iris/Lagoon/Ember/Moss light/dark palette. Additional widget tests check the OS disabled-animation preference helper and the inset, floating navigation container. These tests require no network or customer data and run with the dedicated Flutter CI workflow. This is **token and widget-level evidence** only: rendered large-font, right-to-left, TalkBack, screenreader, high-contrast settings, navigation keyboard focus and physical-device appearance still require downstream acceptance.
