# Android design foundation — Material 3 Expressive

**Founder's directive: 20 November 2026.** Material 3 Expressive is the required
Android presentation foundation for all GoreeCloud Android-targeting applications.
GoreeCloud UI remains the sole design authority for semantic palette, materials,
shapes, navigation, accessibility, branding and visual-quality acceptance.

## Framework compatibility

This foundation **does not supersede** the canonical Drive Android framework
standard's four allowed application stacks: Jetpack Compose + Kotlin (preferred
for Android-only apps), Flutter, React Native + Expo, and Kotlin Multiplatform +
Compose Multiplatform. For non-Compose stacks, implement supported expressive
equivalents and shared GoreeCloud UI roles. No web-view wrapper qualifies merely
by looking similar. Avoid rewriting a working client without a controlled plan.

## Required integration contract

1. Import semantic tokens from tokens/gc.tokens.json, retaining light/dark and
   Iris, Lagoon, Ember and Moss; never invent a universal GoreeCloud hue.
2. Use native Material 3 Expressive components and purposeful expressive motion.
   Respect reduced motion, Android system settings and appropriate fallbacks.
3. Preserve GC UI shapes: 12/18/26/36 logical units and pill geometry; no
   unintentional square app-owned controls.
4. Primary Android navigation must be rounded, visibly floating, safely inset
   and content-aware. Phone layouts generally have 3–5 labeled destinations;
   tablets and foldables require responsive navigation selection.
5. Implement TalkBack, accessible state labels and focus, useful touch targets,
   scalable typography, bidirectional text, screen resizing, keyboard/gesture
   behavior, dark/light and high contrast, and non-obscured scrolling.
6. Use Cloud Canvas/Surface for reading surfaces; Cloud Lens is appropriate for
   elevated navigation but requires an opaque fallback.
7. No silent telemetry, wallpaper tracking, credentials access or persistence.
   GoreeShield privacy, Wardveil security, Identity and Mesh remain distinct.
8. Validate every consuming app individually before declaring compliance or a
   release. A library commit does not establish downstream adoption.

## Current implementation evidence

- Source-level alpha Kotlin library: android/material3-expressive.
- Deterministic color bridge from canonical tokens; run npm test or generator --check.
- Native theme with MaterialTheme and MotionScheme.expressive, optional wallpaper
  colors, a consumer-exposed reduced-motion mode and floating phone navigation.
- Android native compile CI and the separate Compose Multiplatform Android compile workflow passed on merged source. A source-linked Android development fixture compiled both modules into one debug APK in [run 44705429234](https://github.com/GoreeCloud/gc-ui/actions/runs/44705429234). Runtime/device acceptance is still open.
- No verified app-specific integration, emulator/physical device visual acceptance,
  artifact publication, Flutter/RN/KMP bridge or ecosystem-wide migration yet.

The Compose Material 3 version was verified as stable 1.5.0 on 2026-11-18.
Sources: https://developer.android.com/jetpack/androidx/releases/compose-material3
and https://developer.android.com/develop/ui/compose/designsystems/material3.

## Rollout checklist per consuming application

Inspect actual build, UI framework, theme, navigation, screen sizes, release status
and accessibility behavior. Design a safe migration. Integrate this native module
or an equivalent in the approved stack, test both appearances and four accents,
validate device insets and reduced-motion/contrast behavior, and migrate through
the application's own reviewable PR/CI workflow. Record actual test, release and
deployment evidence separately. Preserve offline operation and user data.


## Compose Multiplatform shared toolkit

The newly added [Compose Multiplatform Kotlin toolkit](COMPOSE_MULTIPLATFORM.md)
provides a common-first component and palette foundation, not a replacement
Android host. Android apps use the GoreeCloudExpressiveTheme adapter as their
outer Material theme and consume portable controls without a nested baseline
theme. Both Kotlin builds use the same deterministic token-generator output;
their plugin versions and Android target runtime must be reconciled and tested
in a real consumer before qualifying integrated adoption.


## Flutter source adapter — partial Expressive parity

Flutter clients can consume the new source-level [GC UI Flutter adapter](../flutter/gc_ui_expressive/README.md). Its eight light/dark accent palettes are generated deterministically from canonical tokens, with rounded Material 3 controls and floating compact navigation. Flutter's official Expressive component ecosystem is still evolving; this adapter does not claim full native Compose motion, spring or widget parity. Consumer apps must apply reduced-motion preferences, test platform insets and accessibility, and validate visuals on real devices. Source availability alone is not a verified downstream migration.
