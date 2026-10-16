# GC UI

**GoreeCloud's original adaptive interface design language.**

GC UI is a separate design system, built independently and without Glaze UI dependencies. Its foundation combines expressive personal color, focused depth, and consistent cross-device interaction. Apple Liquid Glass and Google Material You provide *reference principles*, not source code, branding, or component implementations.

## Version

**0.1.0 — Foundation Alpha**. This is an exploratory component playground and initial token contract, **not** a stable or published production library.

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

### Live reference lab
Open [GC UI v1 Lab](lab/v1.html) through a local server. This stand-alone demo consumes the v1 generated token CSS without replacing the original 0.1 playground.

~~~bash
npm run dev
# Open http://localhost:4173/lab/v1.html
npm test
npm run tokens:check
~~~

### Machine-readable source
- [v1 DTCG-style tokens](tokens/gc.v1.tokens.json): semantic light/dark schemes, four accent palettes, typography, space, radius, motion, focus, control geometry.
- [CSS token compiler](scripts/build-v1-tokens.mjs) and [generated CSS](styles/gc.v1.generated.css).
- [Token/contrast tests](tests/v1-contract.test.mjs); GitHub Actions checks the generated output.

**Implementation boundaries:** CSS variables, reference lab and automated checks exist. Production React/Vue/SwiftUI/Compose component libraries, a fully audited arbitrary-seed or wallpaper system (the experimental OKLCH seed engine is present), all 63 components, original complete SVG icon set, native platform adapters, screenshot baselines and manual assistive-technology audits remain to be built and verified. See [accessibility and release requirements](docs/ACCESSIBILITY_RELEASE.md). Do not market candidate documentation as application-level WCAG conformance.
