# GC UI

**GoreeCloud's original adaptive interface design language.**

GC UI is a separate design system, built independently and without Glaze UI dependencies. Its foundation combines expressive personal color, focused depth, and consistent cross-device interaction. Apple Liquid Glass and Google Material You provide *reference principles*, not source code, branding, or component implementations.

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
assets/gc-mark.svg         Original alpha mark
styles/tokens.css          Semantic and foundation CSS variables
styles/components.css      Component patterns and layouts
src/main.js                Accessible interactions and theme controls
tokens/gc.tokens.json      Machine-readable draft token contract
docs/                     Specification, accessibility, and roadmap
tests/                    Dependency-free token contract tests
```

## Design direction

**Calm information. Expressive personality. Purposeful depth.** Read the [language specification](docs/DESIGN_LANGUAGE.md) and [component contract](docs/COMPONENTS.md) before adding new UI.

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
Open [GC UI v1 Design Lab](lab/v1.html), [GC UI Components Lab](lab/components.html), [Adaptive Shell Lab](lab/adaptive.html), and [Searchable Component Registry](lab/catalog.html) through a local server. Both consume the v1 semantic tokens; the Components Lab additionally uses [reusable CSS primitives](styles/gc.v1.components.css), [theme runtime](src/gc-theme-runtime.mjs), and [interaction bindings](src/gc-interactions.mjs). Neither replaces the original 0.1 playground.

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
The v1 component catalog contains **63 specified patterns**, represented in `registry/components.v1.json`. At the current alpha milestone, **24** have experimental web references, **39** remain specification-only, and **0** are stable components. Browse them at `/lab/catalog.html`; the `tests/component-registry.test.mjs` check prevents docs/registry drift. The original v0.1 alpha playground remains available at the site root. Package publishing remains disabled.

### Current engineering wave — verified source milestone
GC UI now includes native-first experimental styles and Components Lab examples for icon buttons, checkboxes, radio groups, sliders, cards, accordions, badges and determinate progress, alongside the original ten web references. The component registry is the authoritative maturity inventory. Keyboard controller updates reject foreign tab selection, skip newly disabled tabs, and handle vertical tab orientation. A separate Chromium Playwright smoke suite covers interactive workflows; its GitHub Actions job is configured but remote execution and manual AT audits must be verified before claiming browser conformance.

Run `npm run check` for dependency-free source verification. To run browser tests locally, install `@playwright/test@1.64.1`, install the Chromium browser with `npx playwright install chromium`, then execute `npm run test:e2e`. CI installs this test runner in a separate job; the project remains private to package registries.

### Browser and visual verification
GitHub Actions now includes an independent Chromium Playwright job. The suite covers keyboard tabs and menus, native controls, accessibility material overrides, responsive navigation, and searchable catalog behavior. A dedicated `e2e/visual-capture.spec.mjs` creates five reviewable screenshot attachments (light, dark, high-contrast, compact and registry). These are **evidence captures, not approved pixel regression baselines**. Manual design and assistive-technology signoff remains required.

### Shared theme and keyboard interaction hardening
Both reference laboratories now use `createThemeController()`. Custom seed colors are not applied as inline overrides while system or user high contrast is active; the effective material is visibly announced in the Foundations Lab. Command menus are distributed in the component CSS, suppress duplicate native button activation, and permit ordinary Tab / Shift+Tab focus movement before focus-exit dismissal. Browser regression scenarios and unit/source contracts protect these behaviors.

### Adaptive navigation and overlays
The adaptive reference shell lives at `/lab/adaptive.html`, demonstrating a semantic app bar, compact bottom navigation, medium-width navigation rail, expanded sidebar, breadcrumbs and a modal side sheet backed by native `<dialog>`. The reusable styles are exported at `@goreecloud/gc-ui/css/navigation`; theme and focus behavior reuse `src/gc-theme-runtime.mjs` and `src/gc-interactions.mjs`. The machine-readable catalog records 24 experimental web patterns and 39 specification-only patterns (0 stable). This is a demonstration, not an app router or supported production shell.

See [Adaptive shell architecture](docs/ADAPTIVE_SHELL.md) for breakpoint, route/focus and modal-sheet contracts. Automated browser checks cover the three navigation modes and accessibility behavior; they are not a substitute for device testing.

### Verified laptop and Android Firefox QA (2026-10-16)
A connected Linux laptop completed **55/55 Node tests**, **7,988/7,988 opaque color-role checks**, and **19/19 Chromium browser tests**. A OnePlus N200 running Android Firefox loaded the adaptive shell over USB and passed manual touch tests for the mobile navigation and side-sheet dismissal. Hardware Android Back behavior with the modal remains under investigation. See [physical-device test evidence](docs/DEVICE_TESTING_2026_10_16.md); these results do not establish production accessibility certification.
