# GC UI — Implementation Status & Production Readiness
**Recorded:** 2026-10-16. **Status:** Specification candidate / runnable web lab / production release NOT approved.

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

## Remaining before stable / production-ready release
- Component library implementation for all 63 patterns with versioned APIs, stories, a11y examples, async/validation states and no dependency on the demo DOM.
- Outstanding platform and multi-device assistive-technology audits (VoiceOver, NVDA, Firefox/Orca and desktop); the Android TalkBack 12-case checklist is **user-reported 12/12 PASS**, without individual spoken transcripts archived. Native adapter/ergonomics reviews remain.
- Contrast audit for every non-text indicator, semi-transparent Lens composite over every specified reference image class, forced color behavior and dynamic color seed.
- Visual snapshots: Chrome, Firefox, Safari; responsive breakpoints, 200–400% zoom, RTL, multiple fonts/complex scripts, 1x/2x DPR.
- Full original vector glyph collection, icon licensing records and selected variants.
- Production wallpaper/platform provider integrations with consent, versioned palette algorithms and cross-platform output parity.
- Performance profiling for blur, scrolling and animation on representative lower-powered hardware.
- Release engineering: published packages, changelog, docs site, migration guides, semantic-versioned API guarantees, security review.

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
