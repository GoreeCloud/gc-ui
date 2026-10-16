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
