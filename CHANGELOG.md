# GC UI Changelog

## Exception-safe experimental stepper mount (2026-10-19)
- A rejected initial host `onChange` callback no longer leaves active click/change listeners, changed input contents or leaked button disabled states. Initialization precedes event registration, with ownership-respecting rollback on failure.
- Added negative-before-fix Node tests and real DOM rerender/remount regression; no stable Foundations contract change.

## Public registry distribution attestation preflight (2026-10-19)
- Added an unauthenticated read-only `@goreecloud/gc-ui@1.0.1` npm registry readback with strict package identity/origin, dist integrity and exact GitHub release SHA-256 verification.
- Distinguishes unavailable public metadata (blocked, no scope-ownership claim) from integrity/network failures (hard error) and verified immutable distribution, with strict readiness exit status and positive/negative injected-network tests. Does not publish or authenticate.

## Consistent high-contrast motion permission (2026-10-19)
- The shared motion predicate now suppresses direct WAAPI presets and optional injected motion adapters when `prefers-contrast: more` is active; individual unavailable media queries no longer mask a valid accessibility preference.
- Single-element and group animation managers use the same shared predicate without duplicate contrast tests. Negative-path Node regression and real-DOM browser checks added; no Foundations stable contract or third-party dependency changed.

## Fail-closed ecosystem consumer cutover readiness (2026-10-18)
- Introduced a versioned, dependency-free, **read-only** readiness report generated from GC UI's 18-consumer identity ledger and exclusive-successor authority registry, without contacting or editing owning repositories.
- Distinguished zero accepted migrations and four external governance/rollout/retirement proofs from a valid report: normal CI check succeeds for honest blocked evidence, while `--strict` exits 2 until real migration acceptance exists.
- Confirmed npm registry publication is a parallel route rather than a universal prerequisite for using a verified GitHub release tarball. No consumer, Drive, npm, or predecessor repository state was changed.

## Verified Foundations v1.0.1 npm handoff preflight (2026-10-18)
- Added a strictly read-only exact-archive preflight pinned to the v1.0.1 authority digest, asserting ten allowlisted regular tar members, release/source provenance hashes, scoped public exports, Apache-2.0 license, and no package install scripts or dependencies.
- Independently downloaded and SHA-256-checked the actual GitHub release archive, then installed and exercised its ESM, JSON, CSS and color contract in an offline throwaway consumer.
- npm registry identity remains **unauthenticated** (ENEEDAUTH); registry metadata returns 404, which does not prove ownership. No npm publication, new release/tag, root alpha package promotion or consumer migration occurred.

## Native tabs teardown ownership (2026-10-18)
- Experimental tab controllers now restore original tab ARIA, tab stop attributes and panel `hidden` states on disposal only when still controller-owned; preserve later application edits and prohibit use after destroy.
- Added negative-before-positive Node tests and real DOM Chromium/Firefox teardown regressions without expanding stable Foundations exports or changing consumer applications.

## Consumer auditor TypeScript module coverage (2026-10-18)
- Fixed false-clean migration scans for TypeScript ESM/CJS `.mts`, `.cts` and corresponding declaration-module files.
- Added fail-before-fix direct and strict-CLI tests ensuring old imports are classified as active evidence; kept scans read-only and explicitly **not** proof of consumer migration or production acceptance.
- No consumer repository, npm release, or governance records were changed.

## Isolated concurrent Playwright runner (2026-10-18)
- Introduced opt-in `test:e2e:isolated` to allocate distinct loopback ports and artifact directories for overlapping browser runs, preventing test trace deletion and stale-server reuse.
- Validates output IDs against path traversal while preserving the standard local and CI test commands unchanged; adds config and real-run verification.
- No runtime UI bundle, native host, npm release or consumer source modified.

## Accessibility motion interruption (2026-10-18)
- Cancel already-running single-element animations immediately when reduced-motion, forced-colors, high-contrast theme or increased-contrast preferences activate.
- Unsubscribe media/theme listeners on controller disposal and retain the original native Web Animations fallback.
- Add deliberately failing-before-fix Node regression coverage and real Chromium reduced-motion/high-contrast switch tests; alpha APIs and stable Foundations packaging unchanged.

## Form ownership and source guard stabilization (2026-10-18)
- Fixed experimental password reveal teardown to preserve nested host-owned icons and explicitly marked text labels, restore pre-existing ARIA/text only when still controller-owned, and always re-mask the input on dispose (issue #41).
- Restored number-stepper button disabled states on teardown without clobbering later host changes.
- Prevented externally hidden action menus from treating a resulting focusout as controller-owned visibility.
- Expanded the legacy-design source guard to inspect `.mts` and `.cts` modules, closing a verifiable first-party source scanning gap.
- Added negative-path Node and real-DOM Chromium regressions; **no broader alpha-to-stable promotion or downstream consumer migration is claimed**.

## Opt-in licensed glyphs and native pattern expansion (2026-10-18)
- Added **18** upstream SVG glyphs from already-pinned Lucide, Tabler and Heroicons sources, increasing the offline optional atlas from 33 to 51; full source/commit/license provenance remains in the registry and local directories.
- Introduced deterministic, allowlisted SVG sprite assembly and drift detection; no third-party runtime or remote CDN required.
- Built experimental original-GC choice chips and native disclosure controllers, optional pattern CSS, and a working Pattern Workbench featuring chips, status, progress, and attributed glyphs.
- Added four bounded native motion presets (surface enter/exit, pressed feedback, RTL-aware nudge), along with unit and browser accessibility/reflow coverage.
- The workspace remains alpha; this does not add stable Foundations exports, expand the supported 63-pattern registry or change downstream consumer readiness.

## Accessible menu controller teardown isolation (2026-10-18)
- Restored the consuming application's pre-existing menu trigger ARIA state, menu visibility, and menu item tab order when an experimental action-menu controller is destroyed.
- Only restore values still owned by the controller; keep newer host-app changes intact and move focus to the live trigger if teardown hides the currently focused menu.
- Added Node lifecycle regressions and a real-DOM browser test. This is a narrowly scoped alpha controller stability fix; no stable Foundations artifact or downstream app is changed.

GC UI is an original independent design system. This changelog tracks implementations, not just specification intent.

## Theme ownership and native-client lifecycle stabilization (2026-10-17)
- [PR #20](https://github.com/GoreeCloud/gc-ui/pull/20) restores pre-existing app-owned inline theme roles and CSS declaration priorities when custom accents are changed or the Foundations controller is destroyed, while protecting newer external changes.
- [PR #21](https://github.com/GoreeCloud/gc-ui/pull/21) prevents native host response-ID collisions across multiple simultaneous clients and stale responses across client lifetimes.
- [PR #22](https://github.com/GoreeCloud/gc-ui/pull/22) replaces stacked Android `onmessage` wrappers with a shared, independently disposable dispatcher; earlier callback and externally replaced handler ownership are preserved. The initially failing Android hosted job retried successfully after Maven Central returned HTTP 429 dependency-download responses.
- [PR #23](https://github.com/GoreeCloud/gc-ui/pull/23) covers color restoration using the **real** browser CSSOM in Chromium and Firefox, supplementing direct Node contract tests.
- All four are merged into `GoreeCloud/gc-ui`. **The root package is still private alpha `0.2.0-alpha.1`, the Foundations RC remains private `1.0.0-rc.1` and no consumer cutover or production release occurred.**

## Source and native stability verification (2026-10-17)
- [PR #16](https://github.com/GoreeCloud/gc-ui/pull/16) prevented the exclusive-design-authority guard from mistaking regenerated, Git-ignored Android APK assets for first-party source. A regression test now reproduces the post-build condition without weakening checks on actual implementation files.
- [PR #17](https://github.com/GoreeCloud/gc-ui/pull/17) extended the private Foundations candidate's offline consumer verification: the provenance manifest must cover all eight non-manifest package files, and every file must match its SHA-256 digest **after installation**, not only in staging.
- [PR #18](https://github.com/GoreeCloud/gc-ui/pull/18) isolated failures in a previously registered Android message callback so GC UI native replies still reach the versioned client. Tests also verify receiver binding, malformed prior handlers, and unsubscribe cleanup.
- These changes add **no public package**, stable tag, migrated consuming app, native production installer, or broad accessibility certification. The source remains `0.2.0-alpha.1` and Foundations remains a private `1.0.0-rc.1` candidate.

## Read-only Website legacy evidence classifier (2026-10-17)
- Improved historical provenance classification: prior acceptance/evidence Markdown/JSON/YAML is informational rather than an active runtime dependency; executable scripts remain subject to strict legacy detection. Added tests preserving active source visibility.
- Audited an **older Website feature checkout read-only** (not main): 125 text files, 358 active source matches, 226 review items, 122 historical records; no source changes or GC UI migration claim.

## Live consumer source reconciliation (2026-10-17)
- Cross-checked the canonical October 12 GoreeCloud Drive repository index with live GitHub repository IDs, exact commits and source trees for the 18 historical Glaze consumer entries. Identified 14 verified product repositories, 4 known app subtrees, 3 tentative product mappings and 1 unresolved product; **zero downstream migrations claimed**.
- Replaced stale Android monorepo target assumptions with verified standalone Launcher, Keyboard, Gallery and Since repositories; marked scaffold and docs-only source appropriately. Added integrity checks prohibiting invented GC UI acceptance, fabricated evidence or reintroduction of obsolete ownership paths.

## Read-only design-system consumer audit (2026-10-17)
- Added a bounded, explicit-root migration-inventory CLI for old package/import/token/component/asset references, with strict inconclusive-scan semantics and privacy-conscious path/line evidence only. No automatic replacement or consumer writes.
- Documented conceptual Canvas/Surface/Lens crosswalk, per-consumer evidence requirements and the still-active predecessor governance sources; no downstream migration or release promotion claimed.

## Owner decision — exclusive GoreeCloud UI design succession (2026-10-17)
- The owner has designated **GoreeCloud UI** the **permanent exclusive replacement** for Glaze. No dual long-term design authority or predecessor-code/asset relabeling is supported.
- Recorded a [succession plan](docs/DESIGN_SYSTEM_SUCCESSION.md), machine-readable authority status and fail-fast guard blocking predecessor namespaced content in active implementation files. Ecosystem policy supersession and downstream adoption are **still pending**; history and actual governance statuses are preserved.
- Package source remains private alpha, Foundations remains an unsigned/private release candidate, and no third-party/repository deletions or license changes occurred.

## Foundations 1.0.0-rc.1 candidate — 2026-10-17
- Staged an **installable, unsigned/private** GC UI Foundations tarball with seven limited ESM exports, semantic tokens/CSS and typed declarations, excluding experimental component and native host APIs.
- Added deterministic build, nine-file npm pack audit, SHA-256 file provenance, offline consumer installation, unsafe subpath exclusion, and TypeScript 5.9.3 consumer checks.
- **No public release yet:** Source remains \`0.2.0-alpha.1\`; candidate remains \`1.0.0-rc.1\` / private / UNLICENSED pending owner decisions about redistribution and final public v1 release. See [Foundations release candidate](docs/FOUNDATIONS_RELEASE_CANDIDATE_2026_10_17.md).

## Native host bridge: Android and Electron desktop — 2026-10-17
- Added a minimal **versioned, allowlisted GC UI native host client** with request validation, capability handshake, timeouts, response correlation, browser fallback and documented TypeScript APIs.
- Added an Android SDK 36 / WebViewAssetLoader host with restricted main-frame origin messaging, optional haptic selection feedback, native theme/system-bar updates, edge-to-edge safe-area handling and persisted native appearance.
- Added an optional sandboxed Electron desktop preview, context-isolated preload, denied remote/permission requests, testable narrow IPC policy and verified native appearance integration.
- **Real-device validation:** Android debug APK assembled, installed and cold-started; Phone profile auto-selected, native feedback returned success, status/navigation safe areas and system icon contrast reviewed in light/dark; dark native bars remained synchronized after repeated cold starts.
- **Tests:** 114 Node unit/source tests, 11 native-contract tests, 50 Chromium interactions and targeted hosted/unhosted browser tests passed; real Electron Xvfb smoke passed. 7,988 semantic color checks passed, and npm pack verified 21 exports. Results and open release gates: [Native QA](docs/QA_NATIVE_HOSTS_2026_10_17.md).
- Native host source is optional and **not** part of the browser core dependency graph. No production signing, installers or manual assistive-technology signoff is claimed.

## Experimental typed form-controller and reflow wave — 2026-10-16
- Extracted native password reveal and bounded number controls from the Forms Lab into `src/gc-form-controls.mjs`, exported as experimental typed helpers in `src/index.mjs`.
- Added direct controller lifecycle/privacy/bounds tests; password controllers now reject buttons without a stable accessible name and re-mask exposed values on teardown.
- Added an automated RTL and doubled-text reflow stage across five labs at 320, 375, 600 and 768 CSS px, executed in the Chromium CI pipeline.
- Aligned README current catalog figures to **32 experimental**, **31 specification-only**, and **0 stable**; older dated test checkpoints remain historical, not current QA claims.
- Verified **186 passing automated executions** (81 Node, 36 Chromium interactions, 5 reflow, 15 axe, 13 screenshot captures, 36 Firefox interactions) and [all three GitHub Actions jobs](https://github.com/GoreeCloud/gc-ui/actions/runs/38985325187). See [QA checkpoint](docs/QA_FORM_API_REFLOW_2026-10-16.md).

## Physical Android Firefox validation and mobile footer fix — 2026-10-16
- Exercised the actual USB Android Firefox UI: touch bottom navigation, light/dark mode, Details sheet, Android Back, virtual keyboard, linked validation errors, local success, and landscape two-column content.
- Found cramped footer links against the fixed bottom bar; expanded compact footer end padding from 112px to 168px plus safe-area inset, added 320/360/375px hit-target clearance regression, and **visually verified the fix on a freshly loaded physical phone page**.
- Latest implementation checkpoint: **175 passing scripted tests** (75 Node, 36 Chromium interactions, 36 Firefox interactions, 15 axe screens, 13 screenshot captures) and [all three successful GitHub Actions jobs](https://github.com/GoreeCloud/gc-ui/actions/runs/38979945053).
- Device accessibility settings were left untouched. TalkBack, screen-reader quality, and additional physical form controls remain pending. See [real-device QA report](docs/QA_ANDROID_FIREFOX_REAL_DEVICE_2026-10-16.md).

## Native-first settings and recovery wave — 2026-10-16
- Extended the [Forms Lab](lab/forms.html) with F12 Password reveal, F17 native Select, F21 bounded Stepper/number and O54 Error/retry state.
- Hardened search against IME composition events; added associated source/browser tests, stateful axe screens, and a compact error/retry visual capture. The Forms Lab's offscreen skip link also stays outside scrolled full-page screenshots while remaining visible on focus.
- Current catalog maturity: **32 experimental**, **31 specified**, **0 stable** (63 total). All examples remain local-only; none are stable component exports.
- Verified **173 total automated executions** (75 Node, 35 Chromium, 35 serial Firefox, 15 axe, 13 screenshots) and [all three GitHub Actions jobs](https://github.com/GoreeCloud/gc-ui/actions/runs/38978706036).
- Firefox smoke runs use one worker by default on laptops to avoid concurrent browser resource contention.
- See [forms reference contract](docs/FORMS_CONTRACT.md) and [native forms QA checkpoint](docs/QA_NATIVE_FORMS_2026-10-16.md) for accessible labels, bounds, recovery and remaining manual validation.

## Native-first forms and component lifecycle wave — 2026-10-16
- Added the [Forms Lab](lab/forms.html) with four experimental patterns: F10 Text area, F11 Search field, F22 Form validation summary, and O53 Empty state.
- Registry maturity now reads **28 experimental**, **35 specification-only**, **0 stable** (63 documented patterns).
- Stabilized tab initialization with ARIA-disabled selected items and guarded toast timers against detached historical events.
- Expanded Node and browser regression coverage, automated forms accessibility states, and screenshot fixtures. **153 total test executions passed** locally (72 Node, 28 Chromium, 28 Firefox, 13 axe, 12 visual capture) with a [successful three-job GitHub Actions run](https://github.com/GoreeCloud/gc-ui/actions/runs/38976905865).
- Fixed the previously visible unfocused forms skip link and doubled Chromium search clear icons after inspecting light/dark screenshots. See [QA checkpoint](docs/QA_FORMS_2026-10-16.md). The [forms contract](docs/FORMS_CONTRACT.md) documents the interaction boundaries and open manual QA.
- No package release or native platform adapter was published.

## Concurrent stabilization checkpoint — 2026-10-16
- Restored the 44px mobile appearance toggle, fixed logical RTL side-sheet anchoring, and improved compact badge wrapping.
- Expanded the browser quality gate to **22 Chromium interactions, 22 Firefox interactions, 10 axe-core state audits, and 10 screenshot captures**.
- Added a nonpublishing npm archive contract check: 42 files, all 14 required export/metadata paths included and tests/labs excluded.
- **66 Node tests** and all browser tests passed locally (130 automated executions total); **7,988** opaque role-contrast comparisons passed.
- Independently verified [GitHub Actions success for source commit d2d1e55](https://github.com/GoreeCloud/gc-ui/actions/runs/38973136941): all three jobs passed.
- See [concurrent stabilization report](docs/QA_CONCURRENT_STABILIZATION_2026-10-16.md). These checks do not establish visual or WCAG certification.

## Unreleased alpha development — 2026-10-16
### Verified on a connected laptop and phone
- **55/55 Node tests** and **19/19 Playwright Chromium tests** passed locally, alongside an opaque-color audit with **7,988 checks and no failures**.
- Fixed the test-only TypeScript generic function matcher and browser automation of visually hidden switch controls (via clickable labels).
- Validated the adaptive mobile layout and side-sheet touch dismissal on OnePlus N200 Android Firefox over USB. The first Android system Back attempt did not dismiss the modal; tracked as an open compatibility observation. Detailed evidence is in `docs/DEVICE_TESTING_2026_10_16.md`.

### Added
- Eight native-first reference component treatments: icon buttons, checkboxes, radio groups, sliders, cards, accordions, badges and determinate progress.
- Machine-readable maturity registry updated to 24 experimental and 39 specification-only patterns.
- Twelve Chromium smoke tests in `e2e/gc-ui.spec.mjs`, plus five visual QA screenshots covering desktop light/dark/high-contrast, mobile and the registry, with a pinned Playwright CI job and uploaded evidence.
- Adaptive navigation and native modal side sheet: app bar, compact bottom nav, medium rail, expanded sidebar, breadcrumbs, and a side-sheet with native dialog semantics.
- Five adaptive viewport/interaction browser checks and three responsive screenshot fixtures, extending the existing 12 smoke scenarios to 17 (plus visual capture tests).
### Fixed
- Route-change announcement, document title update and focus transfer for hash navigation, without focus theft on initial render.
- Public tab controller rejects selections outside the tablist, reacts to disabled-state changes, and supports vertical tab orientation.
- Icon-button toggle retains a stable accessible name while `aria-pressed` expresses its state.
- Shared theme runtime across both labs, including a visible effective-material status and cross-page persistence coverage.
- Reusable action-menu stylesheet, native keyboard Tab and Shift+Tab focus-exit handling, and duplicate-activation guard.
- SVG glyph fragment integrity checking in local asset verification.
### Not verified yet
- Full Chromium CI success, cross-browser manual behavior, and real assistive-technology use are release gates, not completed claims.

## 0.2.0-alpha.1 — 2026-10-16
### Added
- Independent versioned design specification and 63-pattern component catalog with platform, interaction and accessibility guidance.
- DTCG-format v1 semantic token source, CSS generator, curated palette tokens and complete light/dark high-contrast role mapping.
- Web custom-seed OKLCH color engine, theme controller (system appearance, accessibility preference precedence, private storage fallback), accessible interaction bindings and native dialog handling.
- Experimental typed package entry `src/index.mjs`, `types/index.d.ts`, export map for tokens/CSS/glyphs; package publishing remains disabled.
- Original 12-symbol outline sprite and icon policy, Components Lab plus existing foundation reference lab.
- Keyboard action menu, unit and structural tests, reproducible color audit, automated generated-token integrity and CI workflow.

### Fixed
- Tonal stop selection returning undefined for some custom seeds.
- Solid Lens fallback and high-contrast semantic colors no longer dependent on mere material opacity.
- Forced-colors system color override precedence, system high-contrast preference precedence, storage-denial handling.
- Native dialog open/close idempotence and stale toast-dismiss callback affecting a newer message.
- Color-choice target ergonomics (44px).

### Not yet shipped
- Production-versioned web component library, full icon family, actual wallpaper extraction, native adapters, Playwright visual regression and manual assistive-technology sign-off. This release is **alpha** and must not be described as fully production-ready.

## 0.1.0 — Foundation Alpha
- Initial GC UI Canvas / Surface / Lens playground, foundational palettes, basic semantic components and accessibility fallbacks.

No Glaze UI source, tokens or assets have been imported.
