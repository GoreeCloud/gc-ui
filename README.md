# GoreeCloud UI (GC UI)


**License:** Original GoreeCloud UI source is Apache-2.0 (see [LICENSE](LICENSE)). Third-party assets under `assets/third-party/` retain their own upstream licenses and attribution; they are not part of the scoped Foundations package. The full source workspace remains an experimental alpha. A versioned Foundations 1.0.0 release has a separate, narrow supported export contract, verified independently.

**The original adaptive interface design language for GoreeCloud.**

**GoreeCloud UI** is the full public product name; **GC UI** is its short form. See [Brand naming](docs/BRAND_NAMING.md) for usage rules.

GC UI is GoreeCloud's **designated permanent successor** to the earlier Glaze design system, developed independently rather than derived from predecessor code or assets. Its foundation combines expressive personal color, focused depth, and consistent cross-device interaction. Apple Liquid Glass and Google Material You provide *reference principles*, not source code, branding, or component implementations.

## Current source of GC UI adoption work

The [live consumer repository reconciliation](docs/CURRENT_CONSUMER_RECONCILIATION_2026_10_17.md) corrects the predecessor's stale paths with exact-head GitHub evidence, and [its guarded JSON ledger](registry/consumer-migration-reconciliation.v1.json) distinguishes verified repositories from scaffold-only sources, tentative mappings and unresolved products. All consumer migration acceptance remains **not evaluated**. Run \`npm run migration:reconcile:check\` before planning any downstream adoption.

## Read-only migration evidence for consumer applications

The [consumer migration audit](docs/CONSUMER_MIGRATION_AUDIT.md) adds an explicit-root, bounded, non-mutating scanner for legacy design-system packages, imports, tokens, components and assets. Run \`npm run migration:audit -- --root /authorized/absolute/checkout --json --strict\` to produce a privacy-conscious report without copied source content. It **does not change other repositories, declare a consumer migrated, or override existing Drive governance**. An incomplete source scan fails closed.

## Exclusive design-system succession

**Owner direction (2026-10-17):** GoreeCloud UI replaces the old Glaze design system as GoreeCloud's intended **single future design authority**. See [exclusive succession, migration proof gates and scope limitations](docs/DESIGN_SYSTEM_SUCCESSION.md) and the [machine-readable authority decision](registry/design-authority.v1.json). No GC UI source, assets or runtime imports from the predecessor are permitted. Prior Google Drive Standards/Policies and consuming repositories have **not yet been amended or migrated**; this repo is not claiming the cutover complete. Release stage and licensing remain separately governed.

## Version

**0.2.0-alpha.1 — Design-System Implementation Alpha**. This experimental source package extends the original 0.1 playground with typed modules, high-contrast themes, working components, and a machine-readable 63-component registry. It is **not published or stable**.

## Run locally

Requirements: any modern browser and Python 3 for the optional local server.

```bash
cd gc-ui
python3 -m http.server 4173
# Open http://localhost:4173
```

No dependencies or build tool are required. Alternatively, run `npm run dev` if Node.js is available.

```bash
npm test
```

## What's included

- **Original three-layer material model**: Canvas (background), Surface (content), Lens (floating navigation and controls).
- **Four starter accent palettes**: Iris, Lagoon, Ember, and Moss.
- **Light and dark themes**, automatic system preference on first visit, persisted user choice.
- **Reduced-transparency and reduced-motion fallbacks**, plus an explicit solid-Lens switch.
- **Reference components**: buttons, selectable controls, fields, checkboxes, range input, progress, status chips, toast, dialog, responsive navigation, and task lists.
- **Token contract** in `tokens/gc.tokens.json` and CSS implementation in `styles/tokens.css`.
- **Interactive sample workspace** demonstrating GC UI in a realistic context.

## Structure

```text
index.html                 Interactive reference site
assets/gc-mark.svg         Official product icon (brand-repository derivative)
styles/tokens.css          Semantic and foundation CSS variables
styles/components.css      Component patterns and layouts
src/main.js                Accessible interactions and theme controls
tokens/gc.tokens.json      Machine-readable draft token contract
docs/                     Specification, accessibility, and roadmap
tests/                    Dependency-free token contract tests
```

## Design direction

**Calm information. Expressive personality. Purposeful depth.** Read the [language specification](docs/DESIGN_LANGUAGE.md) and [component contract](docs/COMPONENTS.md) before adding new UI.

## Balanced Surface Color

Light GC UI screens use a softly colored **Canvas**, an off-white **Surface**, a bright **Raised Surface**, and clearly differentiated **Tonal/Inset Surfaces** rather than defaulting to an almost fully white page. The Foundations Lab includes a four-plane comparison; the Adaptive Shell demonstrates restrained primary, secondary, and tertiary container colors for information cards. Custom-seed themes follow the same hierarchy. High-contrast and forced-colors remain authoritative.

See [Color and theme policy](docs/COLOR_THEMES.md) for the normative anti-whiteout principle. It is a design review guideline, not an inflexible percentage cap on white pixels.

## First installable GC UI Foundations release candidate

The [Foundations v1 release candidate](docs/FOUNDATIONS_RELEASE_CANDIDATE_2026_10_17.md) stages a strictly supported seven-export color/theme API with semantic token JSON/CSS and TypeScript types. The build produces a nine-file **offline-installable npm tarball**, runs a real consumer smoke test and can typecheck from that tarball; GitHub CI retains a candidate QA artifact. **No npm publication, license change, stable tag or native release** occurs. The root project remains private \`0.2.0-alpha.1\` and experimental component APIs stay outside the candidate contract.

## Stable release scope — owner-approved

The [stable release scope](docs/STABLE_RELEASE_SCOPE.md) governs GC UI design-system releases: ship a documented, versioned, tested **supported subset**, not the entire aspirational 63-pattern/native-platform catalog. A second physical Android phone, unplugged energy/GPU instrumentation, and additional manual desktop VoiceOver/NVDA/Orca sessions are **optional QA**, not blockers for a scoped stable design-system release. Accessibility/security functionality of what *is* shipped remains mandatory; do not claim unverified WCAG certification, native installers, AT parity or power savings. The source remains experimental \`0.2.0-alpha.1\` until a real scoped package is approved.

## Concurrent power readiness and desktop portability gates

The [remaining native-gates QA](docs/QA_REMAINING_NATIVE_GATES_2026_10_17.md) adds an Android read-only power/device preflight and hosted macOS/Windows pinned Electron launch checks. USB battery snapshots are not energy savings and automated GUI tests are not VoiceOver/NVDA spoken acceptance. Android TalkBack user-reported 12/12 PASS remains complete.

## Android 35, restricted WebView Perfetto and real Orca speech diagnostics

The [deep native QA checkpoint](docs/QA_DEEP_NATIVE_VERIFICATION_2026_10_17.md) documents Android 35 emulator install/render/navigation, aggregate WebView/Sandbox Renderer/SurfaceFlinger traces, and genuine Orca-generated speech in the sandboxed Electron preview. This does **not** establish unplugged energy consumption, a second physical device or human desktop screen-reader listening acceptance. Android TalkBack 12/12 user-confirmed PASS remains complete.

## GPU instrumentation and Linux AT-SPI verification

The [GPU/AT-SPI QA checkpoint](docs/QA_NATIVE_GPU_ATSPI_2026_10_17.md) records eight Android Activity HWUI graphics runs and real Electron AT-SPI role/name verification. Native CI includes GPU and AT-SPI parser contracts and Electron keyboard semantics; the real Linux AT-SPI inspection passes locally but is not a hosted runner acceptance gate. Battery-energy and human desktop speech testing remain open; Android TalkBack 12/12 user-confirmed PASS remains complete.

## Extended native compositor and tablet QA

The [SurfaceFlinger presentation probe](scripts/qa-android-compositor.py) now measures aggregate GC UI layer-presentation timing without claiming GPU energy savings. The [tablet and compositor QA report](docs/QA_NATIVE_COMPOSITOR_TABLET_2026_10_17.md) covers real Android and a separately created GC UI-only tablet emulator, alongside automated Electron keyboard/semantics checks. The user-completed Android TalkBack 12/12 manual acceptance remains recorded separately.

## Native host previews — Android and desktop

The [Android local-asset WebView host](native/android) and [sandboxed Electron desktop host](native/desktop) now communicate with the Experience Studio through a [versioned, allowlisted message client](src/gc-native-host.mjs). Android exposes native platform signals, appearance bar styling and selection haptics; Electron exposes native window appearance through a restricted preload. Neither host permits arbitrary OS commands or remote web navigation. Both are optional; all web labs still run unhosted. Native hosts are separate from the npm core package, and **host packaging/device certification is still an alpha QA task**. Follow [Native Host Integration](docs/NATIVE_HOSTS.md) and the [native QA record](docs/QA_NATIVE_HOSTS_2026_10_17.md) for reproducible build, device and test evidence. See also the [security hardening checkpoint](docs/QA_NATIVE_SECURITY_2026_10_17.md) and [native build CI](.github/workflows/native-hosts.yml). The optional Electron host uses the current [pinned desktop runtime](docs/QA_DESKTOP_ELECTRON_2026_10_17.md), verified in a real launch. [Native lifecycle adaptation](docs/QA_NATIVE_LIFECYCLE_2026_10_17.md) keeps host accessibility and battery-saver signals effective after resume. The [Android benchmark and TalkBack acceptance protocol](docs/QA_ANDROID_PERFORMANCE_2026_10_17.md) separates instrumentation from human screen-reader checks.

## Experience Studio — semantic depth, original illustration, platform profiles

The [Experience Studio](lab/experience-studio.html) adds three original, semantic-color SVG scenes (workspace, reading, analysis); constrained depth tiers E0–E3; cancellable choreography of at most three visual groups; and **explicit** responsive web, phone, tablet, desktop, television, wearable and spatial *design profiles*. Profiles do not install native SDK adapters or infer the user's hardware. Materials degrade to nondecorative surfaces in high-contrast, forced-colors and resource-limited settings. See the [experience implementation contract](docs/EXPERIENCE_STUDIO.md) and [October 17 QA record](docs/QA_EXPERIENCE_STUDIO_2026_10_17.md). The work remains experimental.

## Parallel material, asset and motion extensions

Three isolated development branches were integrated together: (1) **logical lighting direction** (overhead, leading, trailing), RTL mirroring and reduced-data fallback; (2) **33 vetted local glyphs across nine open-source families** with a searchable [Icon Atlas](lab/icon-atlas.html); and (3) a cancel-safe managed **motion coordinator** with a [Motion Gallery](lab/motion-gallery.html). The original GC glyphs remain the default, and no third-party animation runtime is required.

## Contextual surfaces and licensed extensions

The [Material Environment Lab](lab/environment.html) demonstrates a **static ambient lighting system**, reading/workspace/analysis/media surface contexts, adaptive quiet/balanced/expressive tonal intensity, functional Surface/Lens distinctions, and native Web Animations presets. The reusable [material CSS](styles/gc.v1.materials.css), [surface controller](src/gc-surface-runtime.mjs), and [motion presets](src/gc-motion-presets.mjs) are experimental and require device/accessibility review.

An opt-in [third-party asset registry](registry/third-party-assets.v1.json) catalogs **33 locally bundled SVGs from nine icon families**, with their exact license files in assets/third-party. These do *not* replace original GC icons. [Motion, AutoAnimate and Lottie Web adapters](integrations/optional-motion.mjs) accept independently installed libraries; the base package loads no third-party runtime or CDN. Animation data and media content have their own licenses. See [material system](docs/SURFACES_ENVIRONMENT.md), [asset policy](docs/THIRD_PARTY_ASSETS.md), and the [October 17 verification record](docs/QA_MATERIAL_ENVIRONMENT_2026_10_17.md).

## Open decisions

Token naming, iconographic geometry, full dynamic color generation, bidirectional layouts, high-contrast themes, platform bindings, and component APIs require future design review. Do not interpret the alpha as a complete accessibility certification or finished system.

## Reference inspirations

- [Apple Human Interface Guidelines — Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Google — Adding dynamic color to your app](https://codelabs.developers.google.com/codelabs/apply-dynamic-color)
- [Google — Customizing Material color](https://codelabs.developers.google.com/customizing-material-color)

GC UI and its assets are original GoreeCloud work. Apple, Liquid Glass, Google, Material You and Material Design are the property of their respective owners.

## GC UI v1 design-language candidate (October 2026)
The existing v0.1 playground remains an **alpha reference**; the new v1 documents are a **normative specification candidate** and are not a claim of an audited, production-ready library.

### Start here
1. [Complete design language specification](docs/GC_UI_1_0_SPECIFICATION.md) — identity, materials, color, typography, geometry, governance.
2. [Color, dynamic theme policy and premium modes](docs/COLOR_THEMES.md).
3. [Typography, original icons and glyph geometry](docs/TYPOGRAPHY_ICONS.md).
4. [63-component canonical catalog](docs/COMPONENT_CATALOG_V1.md).
5. [Motion and multimodal input](docs/MOTION_INPUT.md).
6. [Adaptive layouts, TV, foldables, wearables and spatial](docs/LAYOUT_PLATFORMS.md).
7. [Accessibility criteria and release gates](docs/ACCESSIBILITY_RELEASE.md).
8. [Developer implementation and token governance](docs/TOKENS_IMPLEMENTATION.md).
9. [Original GC icon set and usage](docs/ICONS_LIBRARY.md).
10. [Release plan and production-quality gates](docs/RELEASE_PLAN_V1.md).
11. [Experimental web API and quick start](docs/WEB_API_ALPHA.md).
12. [Machine-readable component registry](registry/components.v1.json).
13. [Verification and quality gates](docs/TESTING.md).

### Live reference labs
Open [GC UI v1 Design Lab](lab/v1.html), [GC UI Components Lab](lab/components.html), [Adaptive Shell Lab](lab/adaptive.html), [Forms Lab](lab/forms.html), and [Searchable Component Registry](lab/catalog.html) through a local server. Both consume the v1 semantic tokens; the Components Lab additionally uses [reusable CSS primitives](styles/gc.v1.components.css), [theme runtime](src/gc-theme-runtime.mjs), and [interaction bindings](src/gc-interactions.mjs). Neither replaces the original 0.1 playground.

~~~bash
npm run dev
# Open http://localhost:4173/lab/v1.html
# Or http://localhost:4173/lab/components.html
# Or http://localhost:4173/lab/catalog.html
# Or http://localhost:4173/lab/adaptive.html
npm test
npm run tokens:check
~~~

### Concurrent implementation milestone (October 16, 2026)
- Corrected the custom color engine to reference only generated tonal stops; expanded tests reject undefined semantic role colors.
- Implemented a dependency-free theme controller for curated/custom accents, auto appearance, solid/translucent selection, and system accessibility overrides.
- Implemented web interaction bindings for tabs (including RTL keyboard navigation), native dialogs, toasts, and async actions.
- Added accessible component CSS, interactive Components Lab, and CI checks for all new modules and local assets; added 12 original outline glyphs with structural tests.
- Stress-tested 361 seed colors across both appearances: 722 themes and 7,220 foreground pairs met the 4.5:1 contrast threshold. This is not a comprehensive visual or accessibility audit.

### Machine-readable source
- [v1 DTCG-style tokens](tokens/gc.v1.tokens.json): semantic light/dark schemes, four accent palettes, typography, space, radius, motion, focus, control geometry.
- [CSS token compiler](scripts/build-v1-tokens.mjs) and [generated CSS](styles/gc.v1.generated.css).
- [Token/contrast tests](tests/v1-contract.test.mjs); GitHub Actions checks the generated output.

**Implementation boundaries:** CSS variables, reference lab and automated checks exist. Production React/Vue/SwiftUI/Compose component libraries, a fully audited wallpaper color system (experimental validated custom-seed theming is implemented), all 63 components, original complete SVG icon set, native platform adapters, screenshot baselines and manual assistive-technology audits remain to be built and verified. See [accessibility and release requirements](docs/ACCESSIBILITY_RELEASE.md). Do not market candidate documentation as application-level WCAG conformance.

### Component delivery status
The v1 component catalog contains **63 specified patterns**, represented in `registry/components.v1.json`. At the current alpha milestone, **32** have experimental web references, **31** remain specification-only, and **0** are stable components. Browse them at `/lab/catalog.html`; the `tests/component-registry.test.mjs` check prevents docs/registry drift. The original v0.1 alpha playground remains available at the site root. Package publishing remains disabled.

### Current engineering wave — verified source milestone
GC UI now includes native-first experimental styles and Components Lab examples for icon buttons, checkboxes, radio groups, sliders, cards, accordions, badges and determinate progress, alongside the original ten web references. The component registry is the authoritative maturity inventory. Keyboard controller updates reject foreign tab selection, skip newly disabled tabs, and handle vertical tab orientation. A separate Chromium Playwright smoke suite covers interactive workflows; its GitHub Actions job is configured but remote execution and manual AT audits must be verified before claiming browser conformance.

Run `npm run check` for dependency-free source verification. To run browser tests locally, install `@playwright/test@1.64.1`, install the Chromium browser with `npx playwright install chromium`, then execute `npm run test:e2e`. CI installs this test runner in a separate job; the project remains private to package registries.

### Browser and visual verification
GitHub Actions now includes an independent Chromium Playwright job. The suite covers keyboard tabs and menus, native controls, accessibility material overrides, responsive navigation, and searchable catalog behavior. A dedicated `e2e/visual-capture.spec.mjs` creates five reviewable screenshot attachments (light, dark, high-contrast, compact and registry). These are **evidence captures, not approved pixel regression baselines**. Manual design and assistive-technology signoff remains required.

### Shared theme and keyboard interaction hardening
Both reference laboratories now use `createThemeController()`. Custom seed colors are not applied as inline overrides while system or user high contrast is active; the effective material is visibly announced in the Foundations Lab. Command menus are distributed in the component CSS, suppress duplicate native button activation, and permit ordinary Tab / Shift+Tab focus movement before focus-exit dismissal. Browser regression scenarios and unit/source contracts protect these behaviors.

### Adaptive navigation and overlays
The adaptive reference shell lives at `/lab/adaptive.html`, demonstrating a semantic app bar, compact bottom navigation, medium-width navigation rail, expanded sidebar, breadcrumbs and a modal side sheet backed by native `<dialog>`. The reusable styles are exported at `@goreecloud/gc-ui/css/navigation`; theme and focus behavior reuse `src/gc-theme-runtime.mjs` and `src/gc-interactions.mjs`. The machine-readable catalog records 32 experimental web patterns and 31 specification-only patterns (0 stable). This is a demonstration, not an app router or supported production shell.

See [Adaptive shell architecture](docs/ADAPTIVE_SHELL.md) for breakpoint, route/focus and modal-sheet contracts. Automated browser checks cover the three navigation modes and accessibility behavior; they are not a substitute for device testing.

### Verified laptop and Android Firefox QA (2026-10-16)
A connected Linux laptop completed **55/55 Node tests**, **7,988/7,988 opaque color-role checks**, and **19/19 Chromium browser tests**. A OnePlus N200 running Android Firefox loaded the adaptive shell over USB and passed manual touch tests for the mobile navigation and side-sheet dismissal. Hardware Android Back behavior with the modal remains under investigation. See [physical-device test evidence](docs/DEVICE_TESTING_2026_10_16.md); these results do not establish production accessibility certification.

### Official GC UI branding
GC UI's official v1 identity (app icon, transparent symbol and outlined light/dark wordmarks) is maintained in the separate authoritative [GoreeCloud branding-assets product namespace](https://github.com/GoreeCloud/branding-assets/tree/main/products/gc-ui). Its 23 PNG exports, favicon, SVG masters, manifest, and deterministic raster build remain there. This repo carries **exact synchronized vector derivatives** only for offline previews and package distribution; see [brand provenance and usage rules](docs/BRANDING.md). Package exports: `./brand/icon`, `./brand/symbol`, `./brand/logo`, and `./brand/logo-dark`. The interface theme can change, but the logo's official colors do not.

### Accessibility smoke check
The browser pipeline includes pinned axe-core WCAG A/AA smoke checks as well as interaction and visual capture tests. This does not constitute WCAG certification; inconclusive color contrast / ARIA checks are retained for manual review. See [testing guidance](docs/TESTING.md).

### Latest stabilization checkpoint
The [concurrent stabilization QA report](docs/QA_CONCURRENT_STABILIZATION_2026-10-16.md) documents laptop-verified 66 core tests, 22 Chromium and 22 Firefox interactions, 10 axe accessibility state screens, 10 screenshot captures, and a verified successful three-job GitHub Actions run. GoreeCloud UI remains an unpublished experimental alpha; screen-reader/device signoff is still outstanding.

### Forms and search reference
The [Forms Lab](lab/forms.html) demonstrates eight experimental web treatments: F10 textarea, F11 combobox search, F12 revealable passphrase, F17 native select, F21 bounded number stepper, F22 linked validation summary, O53 empty state and O54 error/retry. See the [forms interaction contract](docs/FORMS_CONTRACT.md). The registry now counts **32 experimental**, **31 specified**, and **0 stable** patterns out of 63; no web components are production-certified.

The [Forms Lab QA checkpoint](docs/QA_FORMS_2026-10-16.md) records the verified 153-test laptop run, successful three-job GitHub Actions check, and remaining manual screen-reader/device gates.

The Forms Lab additionally covers IME-safe search and simulated error/retry behavior. The controller source is experimental demonstration code, not a stable public form API.

The [native forms stabilization checkpoint](docs/QA_NATIVE_FORMS_2026-10-16.md) records 173 passing source/browser/axe/visual tests and verified [three-job CI success](https://github.com/GoreeCloud/gc-ui/actions/runs/38978706036). The module remains experimental, not stable or published.

### Physical Android Firefox QA
The [real-device Android Firefox checkpoint](docs/QA_ANDROID_FIREFOX_REAL_DEVICE_2026-10-16.md) verifies touch navigation, theme, native Details/Back, on-screen keyboard, local form validation, and landscape adaptation on an authorized USB phone. It also documents a **physically discovered and fixed footer touch-clearance issue**. The implementation passed **175 automated test executions** and a [successful three-job CI run](https://github.com/GoreeCloud/gc-ui/actions/runs/38979945053). Real TalkBack and cross-device signoff are still open.

### Physical TalkBack focus checks
The [physical Android Firefox TalkBack checkpoint](docs/QA_TALKBACK_ANDROID_FIREFOX_2026-10-16.md) documents successful accessibility focus, route activation, modal isolation, and linked form errors. The **device owner heard the tested spoken output and explicitly confirmed it was accurate — PASS**. Audio was not independently recorded and this is not complete screen-reader acceptance or WCAG certification. TalkBack was subsequently disabled at the owner's request.

### Experimental form-controller and reflow milestone
Native password reveal and bounded integer-stepper behaviors now ship as **typed experimental source exports** (`initPasswordReveal` and `initNumberStepper`) rather than duplicated lab handlers. The form demo still uses local-only sample inputs; no credentials are stored or sent. [Web API guidance](docs/WEB_API_ALPHA.md) describes the lifecycle and constraints. A new `npm run test:e2e:reflow` gate checks RTL and doubled text at four narrow/medium viewport sizes across all five labs. The canonical registry remains **32 experimental, 31 specification-only and zero stable**.

The [experimental form API and reflow QA checkpoint](docs/QA_FORM_API_REFLOW_2026-10-16.md) confirms **186 passing automated test executions** and a [successful three-job GitHub Actions run](https://github.com/GoreeCloud/gc-ui/actions/runs/38985325187) for the verified source commit. Owner-attested physical TalkBack speech remains a separate, scoped PASS; untested AT, browser zoom, translations and platform adapters are still release gates.


### Toast interaction stabilization
The [toast hover/focus QA checkpoint](docs/QA_TOAST_FOCUS_2026-10-16.md) records a narrow accessibility-lifecycle fix: auto-dismissal now stays paused while a timed toast is hovered **or** keyboard-focused, without allowing stale toast events to affect newer messages. The source remains experimental and any accessibility acceptance requires real assistive-technology review.


### Effective viewport reflow verification
The experimental browser suite now includes `npm run test:e2e:effective-zoom`: at 1280×800 as a reference physical window, it verifies **200%-equivalent (640×400 CSS px)** and **400%-equivalent (320×200 CSS px)** viewport layouts in LTR and RTL across all five labs. It also exercises native forms, menus, compact navigation, modal focus and footer links at the smallest size. This uses viewport equivalence, **not** browser-toolbar zoom; true 200%/400% browser zoom and hardware assistive technology still require manual verification. See [effective-viewport QA](docs/QA_EFFECTIVE_ZOOM_2026-10-16.md).


### Toast lifecycle verification
The [toast controller teardown QA record](docs/QA_TOAST_TEARDOWN_2026-10-16.md) documents another experimental lifecycle safeguard: `destroy()` cancels the active notification and permanently retires that instance; old dismissal handles cannot disrupt a replacement controller on the same region. The API remains experimental.


### Genuine browser zoom acceptance (Linux X11)
`npm run qa:native-zoom:chromium` and `npm run qa:native-zoom:firefox` open full browsers on **isolated Xvfb displays**, send native browser-window zoom shortcuts and verify device-pixel ratio/actual viewport changes. Both commands exercise all five labs at **200% and 400%** in LTR and RTL, capture screenshots, and check 400% navigation, dialogs, footer links, and form focus. They complement—not replace—the existing effective-viewport simulation, and require Linux/Xvfb/X11/XTest/Python. See [real-zoom and assistive technology QA](docs/QA_REAL_BROWSER_ZOOM_2026-10-16.md). Manual assistive technology speech and Safari browser zoom still require human signoff.
