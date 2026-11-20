# GoreeCloud UI — Compose Multiplatform source library

**Status: source-level alpha; no published Maven coordinates, supported binary, installed application or physical-device acceptance.**

This is GoreeCloud's standard **shared Kotlin presentation toolkit**, located inside the design-authority repository. It is a separate Gradle build so the existing web npm package and the currently reviewed Android Material 3 Expressive adapter are not disrupted.

- Canonical source: ../tokens/gc.tokens.json; the library does not define a competing brand palette.
- Android: **Material 3 Expressive remains mandatory**. Android applications use the adjacent [Android Material 3 Expressive adapter](../android/material3-expressive/README.md) for their outer Material theme and can render the theme-agnostic shared controls under it. Do not nest a second MaterialTheme over the Android expressive theme.
- iOS: use GoreeCloudMultiplatformTheme for shared Kotlin UI. Native iOS navigation, safe areas, VoiceOver, permissions and packaging remain consumer responsibilities.
- Linux: Compose Multiplatform is **not** an approved primary graphical UI (Qt Quick 6.12.0, Flutter Linux Desktop or Slint only). Kotlin shared state/business logic can coexist with an approved primary Linux UI but this library is not a Linux UI exemption.
- Browser apps: principal UI still uses Next.js, React, Vue or SvelteKit; this Gradle module does not establish a compliant primary web app.
- Windows/macOS: target adoption requires separate project justification and actual compilation/acceptance; no desktop targets are currently configured in this module.
- GoreeShield owns privacy; Wardveil owns security; Mesh integration and Identity access control are not implemented by presentation controls.

## Pinned evaluation toolchain

Gradle 9.4.1, JDK 17+, Kotlin and Compose compiler plugins 2.4.21, Compose Multiplatform plugin 1.12.2, AGP 9.2.0 and Android SDK 37.1. These are source dependency declarations, not verified published-binary guarantees. Before consuming, verify dependency licenses, advisories, repository provenance and application-specific minimums. Android/iOS CI jobs and real devices must independently validate behavior.

## Generate and build

From the repository root:

    node scripts/generate-compose-tokens.mjs --check
    node --test tests/compose-multiplatform-contract.test.js

From this directory, with Gradle 9.4.1 installed and Android SDK configured:

    gradle :gc-ui-compose:assemble --no-daemon

Intel iOS simulator (iosX64) is not configured because the evaluated Compose 1.12.2 dependencies did not expose a compatible ios_x64 variant. Apple Silicon devices/simulators remain targets.

An Apple build needs macOS, Xcode and signing/CI infrastructure:

    gradle :gc-ui-compose:compileKotlinIosSimulatorArm64 --no-daemon

The module is **not** published to Maven and cannot be consumed by adding an invented artifact coordinate. Include it as source or use a configured composite build, validate dependency resolution, then compile your consumer.

## Example shared UI

    GoreeCloudMultiplatformTheme(accent = GoreeAccent.Lagoon) {
        GoreeCloudPanel {
            GoreeCloudAction(label = "Save", onClick = ::save)
        }
    }

On Android use GoreeCloudExpressiveTheme as the *outer theme* instead of GoreeCloudMultiplatformTheme. Navigation callbacks are never placeholders: the consumer owns verified routing, authorization and availability feedback.

## Validation and rollout boundary

Automated source-contract tests check deterministic parity between the generated Android and common Kotlin palettes, dependency declarations, portable API surfaces, and framework boundaries. A successful common metadata compile is not iOS/Xcode, Android device, accessibility, runtime, release, deployment or downstream adoption evidence. See [architecture and phased rollout](../docs/COMPOSE_MULTIPLATFORM.md).
