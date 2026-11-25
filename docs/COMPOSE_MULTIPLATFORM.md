# Compose Multiplatform — GoreeCloud Kotlin UI standard

| Control | Value |
| --- | --- |
| Founder direction | November 20, 2026 |
| Scope | Shared Kotlin-first presentation across applicable GoreeCloud clients |
| Design authority | GoreeCloud UI / this repository |
| Canonical tokens | tokens/gc.tokens.json |
| Implementation | compose-multiplatform/gc-ui-compose, source-level alpha |
| Android presentation | Material 3 Expressive (mandatory, existing Android adapter) |
| Delivery | PR review and independent CI/device acceptance required |

## Normative architecture

**Compose Multiplatform is the default shared Kotlin UI foundation** for GoreeCloud projects selecting shared Kotlin/Compose presentation, subject to each platform's governing primary-framework rules and validated device support. It is not a blanket replacement for approved non-Kotlin frameworks, the existing web npm design-system implementation, or native Linux graphical frameworks.

1. **Canonical ownership.** GoreeCloud UI supplies semantic roles, tokens, components, layouts, typography, accessible interaction contracts and visual identity. No client maintains a forked brand token source. The Kotlin generator writes *identical* canonical eight-palette role values to Android and Compose Multiplatform source; do not maintain these by hand.
2. **Shared Kotlin UI.** The in-repository Gradle module owns common Compose palette resolution, Material 3 baseline theme, common panels, semantic actions and consumer-controlled navigation. Shared commonMain is UI only; it does not silently integrate network, storage, tracking or identity.
3. **Android specializations.** Use [Android Material 3 Expressive](ANDROID_MATERIAL3_EXPRESSIVE.md) and the source module in android/material3-expressive as the host app's **outer** Material theme. Android native motion, system settings, optional wallpaper colors, gesture insets, TalkBack and Android window behavior remain Android-specific. Reusable common components read the host MaterialTheme so they can be rendered under Android Expressive without nesting a conflicting baseline MaterialTheme.
4. **iOS.** Compose Multiplatform shared components may use GoreeCloudMultiplatformTheme, with Apple-native permissions, safe areas, VoiceOver, keyboard, offline behavior and signed packaging independently verified. iOS binaries cannot be compiled or signed on Linux. Intel iOS simulator (iosX64) is excluded pending compatible dependencies; Apple Silicon ARM64 targets remain. No App Store or iOS runtime acceptance exists from source alone.
5. **Linux primary UI restriction.** Qt Quick **6.12.0**, Flutter Linux Desktop and Slint remain the *only* permitted primary UI frameworks. Kotlin shared models can feed those approved UIs, but a Compose UI Linux window is **not approved**; no Linux target is configured here.
6. **Web primary UI restriction.** Independent browser apps retain Next.js, React, Vue.js or SvelteKit as their principal JS/TS framework. The Kotlin Gradle source module is not a web app and has no Kotlin/JS/Wasm target configured.
7. **Other platforms.** Windows, macOS, TV, wearable and other targets require separately justified SDK targets, source integration, native window management, accessible layouts, packaging and physical-runtime evidence before any supported-platform claim.

## Implementation structure

- compose-multiplatform/settings.gradle.kts and root build.gradle.kts: independent pinned build, no automatic publication or dependency on web npm.
- compose-multiplatform/gc-ui-compose/src/commonMain: first-party composables, semantic palette and shapes.
- compose-multiplatform/gc-ui-compose/src/commonTest: source-level common unit tests.
- .github/workflows/compose-ios.yml: isolated, nonpublishing Apple Silicon macOS source-compile check for iosSimulatorArm64. Its CI result must be confirmed independently; it is not a simulator run, an iPhone test, an iOS app, or signed distribution.
- android/material3-expressive: merged Android Expressive host adapter; its independent Gradle/Android CI has passed. The source-linked integration fixture in samples/android-compose-integration also compiled both actual library projects in one Android debug APK under CI run https://github.com/GoreeCloud/gc-ui/actions/runs/44705429234.
- scripts/generate-compose-tokens.mjs: deterministic, local-only generation of both Kotlin palettes from tokens/gc.tokens.json.
- tests/compose-multiplatform-contract.test.js: parity, code boundary and version declarations; Node checks are *not* Kotlin compilation.

The selected evaluation versions (Kotlin + compiler plugin **2.4.21**, Compose Multiplatform **1.12.2**, Android KMP library plugin **AGP 9.2.0**, Gradle **9.4.1**) come from current official compatibility guidance. They are not unchangeable brand standards. The Android Expressive adapter retains separately pinned Kotlin/Compose versions. An isolated Android Gradle composite fixture has **compiled both libraries into one debug APK** at the declared versions (CI run https://github.com/GoreeCloud/gc-ui/actions/runs/44705429234). This establishes source-linkage at this revision, **not** consumer binary/version-matrix compatibility or runtime/device acceptance. No Maven publishing or consumer migration has been performed.

## Semantic component hardening — 25 November 2026

The shared Kotlin color accessor now exposes all canonical state pairs (including on-positive/on-warning/on-negative), outlines, lens and scrim roles without inventing palette values. Both shared Compose Material 3 and the Android-specific Material 3 Expressive host explicitly map container surfaces from the canonical Canvas/Surface/Tonal roles. Material's default container surfaces must not silently drift to unrelated color families.

The common floating navigation applies the operating system safe area **once**: outer navigationBarsPadding with inner NavigationBar windowInsets set to zero, matching the existing Android native adapter. Its pure GoreeNavigationContract validates 3–5 unique, nonblank destinations, rejects unknown selections, and prevents duplicated selection callbacks; real authorization and routing remain consumer-owned. Common Kotlin tests cover invariants and color pairing. Compilation and focused source checks are necessary but not a replacement for TalkBack/VoiceOver, real navigation, foldable, insets and visual acceptance.

## Adoption rule and verification gates

For every Kotlin UI client: inventory actual platform(s), source, feature behavior, user data, native integrations and CI; select compliant shared-UI or Kotlin-only architecture; preserve working behavior and rollback; import GC UI source/tokens; use Android Expressive where Android is targeted; provide real routing and authorization; test deterministic token output, Gradle compile, accessibility, theme modes, keyboard/gesture navigation, large fonts, reduced motion, device insets, offline/recovery, and target packaging; only then mark the client adopted.

**Status (2026-11-20):** Kotlin source foundation is merged on protected main; shared Android compilation and the isolated Android Expressive + shared Compose APK build passed CI at their recorded commits. This does **not** assert all GoreeCloud applications are migrated, iOS binaries are produced, human accessibility or device acceptance passed, or a release was published. Maintainers should track consumer-by-consumer adoption and explicit exceptions in the owning repositories.

## Third-party dependency and security assessment

Evaluate official Kotlin, JetBrains Compose and AndroidX upstream dependencies before release. This repository does not vendor their source or assets. Compile-time and runtime dependency graphs need lockfile/provenance checks and license/known-vulnerability review; published open-source licenses and supply-chain findings have not been blanket-audited. Use constrained CI and pinned trusted actions; do not embed production credentials, telemetry or background network calls in presentation controls.

References: [JetBrains project structure](https://kotlinlang.org/docs/multiplatform/multiplatform-project-recommended-structure.html), [Compose compiler versions](https://kotlinlang.org/docs/multiplatform/compose-compiler.html), [Compose platform/Jetpack compatibility](https://kotlinlang.org/docs/multiplatform/compose-compatibility-and-versioning.html).

## Rollback

Revert the reviewable Compose Multiplatform commit(s) and re-run source CI; no stored data or consumer applications change in this source-only step. If client integrations later land, each owning app must support an independent, tested rollback path.
