# GC UI — Implementation Status & Production Readiness

**Current release distinction (2026-10-17):** [Foundations v1.0.0](https://github.com/GoreeCloud/gc-ui/releases/tag/foundations-v1.0.0) is officially stable for the published tokens/color/theme-controller scope under Apache-2.0. Source tag `foundations-v1.0.0` resolves to `1d8e25330a49cdab4412c1323e95baafd136b7b2` and the [exact-head CI](https://github.com/GoreeCloud/gc-ui/actions/runs/39098058411) passed. The archive checksum was verified through the publicly downloadable files. The larger GC UI workspace remains alpha and downstream migration/retirement is incomplete. Historical checkpoints below remain dated evidence, not current publication status.
**Recorded:** 2026-10-16. **Status:** Specification candidate / runnable web lab / production release NOT approved.

## 2026-10-17 integrated Foundations and native-host stability checkpoint

- [PR #20](https://github.com/GoreeCloud/gc-ui/pull/20) makes `createThemeController` restore consuming applications' existing inline color declarations and priorities, while preserving newer external style changes. [PR #23](https://github.com/GoreeCloud/gc-ui/pull/23) verifies this using actual Chromium/Firefox CSSOM behavior.
- [PR #21](https://github.com/GoreeCloud/gc-ui/pull/21) assigns distinct request IDs across concurrent native-host clients, protecting response correlation and replaced-client lifetimes.
- [PR #22](https://github.com/GoreeCloud/gc-ui/pull/22) makes shared Android transport callback subscriptions independent and safely disposable in either order, retaining pre-existing callbacks and failing closed after external replacement. An initial Android CI attempt encountered Maven Central HTTP 429 dependency throttling; the exact-head job rerun subsequently **passed**, without changing or bypassing build gates.
- **Fully integrated `main` source:** `f5719c9abd5695bdea3a06d7a6deb4d43d940d0e`. [Core quality gates](https://github.com/GoreeCloud/gc-ui/actions/runs/39092293044) and [native host quality gates](https://github.com/GoreeCloud/gc-ui/actions/runs/39092293073) **both passed on this identical merged revision**, including Chromium, Firefox, Android debug APK compilation and Electron host validation.
- **Release identity unchanged:** private `0.2.0-alpha.1` root source; private, unsigned, `UNLICENSED` Foundations `1.0.0-rc.1` candidate. No stable tag, published npm package, production deployment, verified downstream GC UI migration, ecosystem-wide Glaze retirement, or completed manual Firefox/Orca acceptance is claimed.

## 2026-10-17 latest source-stability checkpoint

- [PR #16](https://github.com/GoreeCloud/gc-ui/pull/16) corrects the source-authority guard's handling of Git-ignored Android generated assets after local Gradle builds; first-party source remains guarded.
- [PR #17](https://github.com/GoreeCloud/gc-ui/pull/17) checks complete SHA-256 provenance against the files actually installed from the private Foundations candidate tarball, not only staging.
- [PR #18](https://github.com/GoreeCloud/gc-ui/pull/18) prevents existing Android `onmessage` callbacks from blocking native bridge responses when they throw or are invalid; receiver and unsubscribe behavior have tests.
- **Exact integrated source:** `dfdea3f6fcdf4fc0e3b4eff81accf21f048327db`. The [core quality gates](https://github.com/GoreeCloud/gc-ui/actions/runs/39090043620) and [native host quality gates](https://github.com/GoreeCloud/gc-ui/actions/runs/39090043583) both completed successfully on that same main commit.
- **No status promotion:** root remains `0.2.0-alpha.1`, Foundations remains private `1.0.0-rc.1` / `UNLICENSED`, and no native installer or public package was released. Actual GC UI adoption is still unevaluated for the 18 legacy inventory entries. Firefox/Orca post-remediation acceptance in issues [#5](https://github.com/GoreeCloud/gc-ui/issues/5) and [#6](https://github.com/GoreeCloud/gc-ui/issues/6) remains pending; its optional broader platform coverage is governed by [Stable Release Scope](STABLE_RELEASE_SCOPE.md), not assumed passed.

## 2026-10-17 Website legacy source probe (feature checkout only)
- [Read-only Website probe](QA_WEBSITE_LEGACY_PROBE_2026_10_17.md): scanned 125 files from a clean local feature checkout; found 358 active-reference line matches, 226 review-only matches and 122 historical/informational references. This is **not** the Website current main SHA and does not establish loaded runtime dependencies or GC UI consumer acceptance.
- Improved the legacy consumer auditor so non-executable historical acceptance/evidence records are classified informational without hiding executable old scripts or active CSS.

## 2026-10-17 Live GitHub consumer identity reconciliation
- [Current reconciliation](CURRENT_CONSUMER_RECONCILIATION_2026_10_17.md) verifies 14 current product repository identities across the dated 18-entry legacy inventory, with four application source subtrees. Three mappings still need product confirmation and Notes remains unresolved. [Ledger](../registry/consumer-migration-reconciliation.v1.json) pins exact GitHub revisions and records **zero GC UI consumer migrations**.
- The former Android app-defaults Launcher/Keyboard/Gallery/Since paths are obsolete; do not treat their scaffold standalone repositories as working or accepted GC UI consumers.

## 2026-10-17 Read-only legacy consumer audit checkpoint
- The [consumer migration auditor](CONSUMER_MIGRATION_AUDIT.md) and [dated historical consumer snapshot](CONSUMER_MIGRATION_INVENTORY_2026_10_17.md) identify old packages, imports, tokens, assets and historical documentation in an explicitly chosen authorized checkout. Read-only bounded scans generate no source excerpts, reject symlinks/incomplete evidence, and support strict CI exit codes.
- **No downstream app has been migrated, no Google Drive authority changed, and no ecosystem-wide Glaze retirement is claimed** from this tool; consumer acceptance remains separately required.

## 2026-10-17 owner decision — exclusive GoreeCloud UI succession

The owner has directed that **GoreeCloud UI permanently replaces Glaze**, not that both coexist. [Succession plan and authority registry](DESIGN_SYSTEM_SUCCESSION.md) define source isolation, platform governance update, consumer migration and retirement verification; current package/source remains alpha, and Drive policies naming the prior authority remain unchanged under this project's read-only access. **No ecosystem-wide completion claim** is authorized yet.

## 2026-10-17 Foundations v1 installable release candidate
- [Foundations RC](FOUNDATIONS_RELEASE_CANDIDATE_2026_10_17.md): a separate, installable \`@goreecloud/gc-ui@1.0.0-rc.1\` **private staged artifact** containing only seven supported JS exports, a semantic token JSON/CSS pair, types and provenance. A real offline consumer and pinned TypeScript compilation verify package usability; CI will attach unsigned QA tarballs.
- The release candidate does **not** stabilize the root experimental web component APIs or native hosts, change the root \`0.2.0-alpha.1\` version, publish npm, grant a new license, or tag 1.0.0. Licensing/registry ownership and final public release approval remain independent steps.

## Current release policy clarification — 2026-10-17

**The owner confirms that the residual hardware/power/platform-human-test items are NOT stable design-system release requirements.** The authoritative [Stable Release Scope](STABLE_RELEASE_SCOPE.md) supersedes prior dated notes that labeled a second physical Android phone, unplugged energy measurements, full GPU profiling, human desktop Orca/VoiceOver/NVDA sessions or unshipped signed native installers as universal stable blockers.

A stable release is judged on the **actually supported shipped APIs/components**: documented versioned exports, functional/accessible/security safeguards, reproducible artifacts, applicable regressions and owner approval. Optional QA remains valuable and historically accurate but may not block a scoped release. The project remains at **private 0.2.0-alpha.1**, so no stable package is automatically announced by this correction.


## 2026-10-17 Remaining native-gate checkpoint
- [Remaining native-gates QA](QA_REMAINING_NATIVE_GATES_2026_10_17.md) adds read-only fail-closed power/device preflight. **Hosted macOS and Windows Electron preview security/semantic/keyboard jobs both PASSED**, as did Linux native Android build/host and Chromium/Firefox (5/5 native, 3/3 core jobs on source commit ebaa536).
- Only one USB-charging physical phone is connected; unplugged-power consumption and a second physical device are **not verified**.
- Desktop native launch automation does not prove human NVDA/VoiceOver speech or signed distribution; Android TalkBack user-confirmed 12/12 PASS remains accepted.

## 2026-10-17 Deep Native Verification — Android 35, WebView Perfetto and Orca
- [Deep native QA](QA_DEEP_NATIVE_VERIFICATION_2026_10_17.md) records Android 35 emulator rendering and navigation on older WebView 124, alongside the API 36 physical-device WebView 152 baseline. The API coverage gate is broader, but a second physical phone is still unavailable.
- Restricted Perfetto app/WebView/SurfaceFlinger traces include actual GC UI draw, Skia-related CPU slices and sandbox renderer CPU scheduling; they do not prove Conservation savings or hardware GPU energy.
- Actual Orca 42 generated four expected speech announcements from Electron focus transitions in an isolated Linux session. User-audible manual Orca navigation, Windows NVDA and macOS VoiceOver remain separate.
- Disconnected battery-power measurement is blocked by the physical USB connection; a second physical phone is not connected. Android TalkBack user-confirmed 12/12 PASS remains accepted.

## 2026-10-17 Activity HWUI GPU and Linux AT-SPI checkpoint
- The [GPU and AT-SPI QA report](QA_NATIVE_GPU_ATSPI_2026_10_17.md) adds real Android Activity HWUI GPU histogram profiling (8 runs, debug mode verified), a reproducible parser/CI test, and real Linux Electron AT-SPI exposure with 10/10 required names/roles among 156 visited nodes. The live AT-SPI probe passed on the workstation only; hosted Ubuntu could not register Electron in AT-SPI, so CI retains parser checks and Electron keyboard semantics instead.
- HWUI p90/p95 timing buckets were lower for Conservation in this short workload, but **WebView renderer/compositor GPU timing, battery energy and statistical significance remain unverified**.
- The existing tablet emulator provides another form factor/WebView version, but **not** another physical device or API. Human Orca/VoiceOver/NVDA speech review remains open; Android TalkBack user-reported 12/12 PASS stays accepted.

## 2026-10-17 Compositor timing and tablet verification
- [Native compositor/tablet QA](QA_NATIVE_COMPOSITOR_TABLET_2026_10_17.md) records GC UI SurfaceFlinger presentation intervals, a separate Android 36 tablet emulator with verified Tablet host profile, and Linux Electron accessible name/role and keyboard smoke checks.
- The physical phone shows nearly identical Normal and Conservation presentation pacing during a four-run exploratory workload; **not** a GPU-time or battery-energy measurement. Tablet boot showed initial WebView rendering delay before successfully displaying the Studio.
- Android TalkBack 12/12 user-reported acceptance remains completed. Separate physical-device, OS-version, actual Orca/VoiceOver/NVDA and energy/GPU release gates remain.

## 2026-10-17 Android TalkBack completion update

- **12/12 Android TalkBack cases TB-01 through TB-12 PASS — user-reported.** The test operator confirmed completing every case; see [TalkBack manual acceptance](QA_TALKBACK_USER_ACCEPTANCE_2026_10_17.md).
- Older ADB notes showing TalkBack disabled refer to earlier assistant-run sessions and remain valid historical observations, not the current status of the user-completed checklist.
- Verbatim spoken output, the operator session's device/build and TalkBack version were not furnished. Other platform accessibility reviews, device coverage, GPU/energy and production certification remain open.

## 2026-10-17 Native verification checkpoint
- Independently retested the published e77d207 source with 122 core tests, 18 native contracts, 31 Chromium and 10 Firefox targeted browser checks. See [Native Verifications](QA_NATIVE_VERIFICATIONS_2026_10_17.md) and the two successful hosted CI runs.
- The rebuilt Android debug APK launched on the API 36 OnePlus device; local navigation and Back returned correctly. A fresh four-run comparison did not demonstrate consistent performance or energy improvements.
- TalkBack remained disabled; spoken/gesture acceptance, disconnected power and WebView compositor profiling remain open. Production certification is not claimed.

## 2026-10-17 Performance/accessibility instrumentation addendum
- A reversible Studio conservation preview and debug-only Android launch fixture support repeatable app presentation comparisons without changing global device settings.
- The [Android QA benchmark](QA_ANDROID_PERFORMANCE_2026_10_17.md) includes an anonymized eight-run data record on Android API 36, with 4 runs/mode and honest Activity UI-frame versus GPU/power limitations. Automated browser and native protocol checks passed locally.
- [TalkBack manual acceptance](ANDROID_TALKBACK_ACCEPTANCE.md) is still required: the device accessibility service was disabled during testing, and no spoken output or user gestures were validated. Neither beta release nor WCAG certification is inferred.
- Next decision gates: human TalkBack pass on Android WebView, disconnected-power instrumentation, additional lower-capability devices, and actual WebView compositor/GPU profiling.

## 2026-10-17 Native host milestone addendum
- Experimental Android WebView host and sandboxed Electron desktop host are implemented and retained as isolated, optional preview projects. Android was built, installed and launched on a connected API 36 phone, including native capability/profile reporting, system-bar safe areas, dark appearance and selection feedback.
- Native host messaging is versioned, bounded, allowlisted and origin-restricted. Android denies nonlocal subresources and Electron denies non-public repo files, remote resources and arbitrary OS permissions.
- Optional desktop host uses pinned Electron 44.9.0; local and GitHub-hosted Linux native launch both passed. Core GC UI still has no Electron or Android runtime dependency.
- GitHub native-host workflow run [39048783630](https://github.com/GoreeCloud/gc-ui/actions/runs/39048783630): **three of three jobs passed** (Android build, Electron desktop launch and native contract checks). GC UI core run [39048783701](https://github.com/GoreeCloud/gc-ui/actions/runs/39048783701): **three of three jobs passed** (tokens/unit and Chromium/Firefox browser checks).
- These checks support continued alpha development. They are **not** release signing, OS integration certification or manual assistive technology approval. Remaining native release gates are in [Native Host Integration](NATIVE_HOSTS.md).

## Completed and present in repository
- Original GC UI philosophy and Canvas / Surface / Lens material contracts.
- Normative design language, color/theming, 63-component pattern catalog, typography/glyph construction, motion/input, adaptive/platform, accessibility gates and token implementation docs.
- DTCG-style v1 reference tokens with 4 palettes and light/dark roles, component geometry and motion definitions.
- Pure script that reproducibly exports v1 CSS variables; generated CSS committed.
- Separate interactive web lab with appearance, palette, material and local custom color seed.
- Independent experimental OKLCH seed palette engine, gamut handling, contrast checks for enumerated on-color pairs.
- Node test suites for token shape, generated CSS parity, predefined color contrast, sampled dynamic seed contrast, alpha markup.
- GitHub Actions for syntax, token and unit-contract testing.

## Scope-dependent work for stable package; optional broader roadmap
- **Stable-scope requirement:** Select and implement the actual **public component subset**, with versioned contracts and useful examples; the full 63-pattern specification is not a shipment prerequisite.
- **Optional evidence:** Extra desktop VoiceOver/NVDA/Orca sessions, wider hardware/platform matrices and native adapter ergonomics. Android TalkBack **12/12 user-reported PASS** remains completed; a specific accessibility claim may need targeted additional validation.
- Contrast audit for every non-text indicator, semi-transparent Lens composite over every specified reference image class, forced color behavior and dynamic color seed.
- Visual snapshots: Chrome, Firefox, Safari; responsive breakpoints, 200–400% zoom, RTL, multiple fonts/complex scripts, 1x/2x DPR.
- **Scoped:** Ensure all **included** assets and glyphs have valid license records; finishing every planned original vector/glyph variant is optional.
- **Optional integration:** Platform wallpaper/native provider implementations, consent flows and parity, unless the stable package expressly includes them.
- **Ongoing quality:** Functional/performance regressions for shipped materials; extended low-end physical hardware GPU/power profiling is optional, not a stable-release prerequisite.
- **Stable-scope requirement:** Versioned tested distributable, install/usage docs, changelog/migration policy, exported API compatibility and applicable security/license checks. A complete docs site or native installers are optional unless included in the release.

## Release decision
- Alpha lab: usable as a design reference, **not** shipped as a supported component package.
- V1 design specification: candidate; stable only after stakeholder review and resolved tracked changes.
- Custom seed engine: experimental. WCAG contrast of selected role pairs is tested programmatically, but color gamut/perceptual and comprehensive a11y audits remain.
- No statement of global WCAG conformance or universal platform support is authorized until evidence is collected.

## Proposed milestones
1. **0.2 Foundations:** strengthen type, elevation, accessible theme states; complete contrast composites and generated tokens.
2. **0.3 Primitives:** action, focus, input, menu, dialog, surface, navigation APIs with Storybook-like fixtures.
3. **0.4 Adaptation:** foldables/TV/RTL, native theme bindings and dynamic color provider.
4. **0.5 Integration:** packages, multi-browser regression matrix, screen-reader proof, localization.
5. **1.0 Stable:** evidence-backed spec + accessible tested implementation, semver support.
