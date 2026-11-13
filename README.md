# GoreeCloud UI

**Official identity:** The founder-approved Aperture Weave [logo, favicon and interface artwork](docs/OFFICIAL_IDENTITY.md) are centrally maintained in GoreeCloud/brand-assets and integrated into the experimental lab. Consumer visual acceptance remains separate from Stable release status.


**Clear by default. Consistent by nature. Fluid by design.**

GoreeCloud UI (GC UI) is the mandatory design language for GoreeCloud-controlled applications, websites, dashboards and future operating-system interfaces. It synthesizes ergonomic layout, adaptive semantic color and purposeful translucent depth into an original visual system.

> **Maturity: 0.1.0-alpha.0, not Stable.** GoreeCloud UI is a new greenfield project, with no inherited code or releases. The initial alpha establishes its design language and implementation contracts. Semantic roles follow the founder-approved standard, while specific new palette values are provisional alpha candidates pending visual acceptance.

## Implemented here

- **Cloud Canvas / Cloud Surface / Cloud Lens** material hierarchy with solid-glass alternatives.
- **Iris / Lagoon / Ember / Moss** accent families, separately defined light and dark palettes, and high-contrast, reduced-motion and reduced-transparency rules.
- Shared tokens for color, typography, four-pixel spacing, shape, elevation, motion, icon size, control dimensions, breakpoints and z-index.
- Native-first styled buttons, cards, form fields, switches, tabs, chips, badges, alerts, dialogs, accordions, drawers, range sliders, breadcrumbs, steppers, structured detail lists, toolbars, **adaptive collapsible tablet/desktop/web navigation rails**, navigation tables, toasts, progress and loading patterns.
- An original 24px line-glyph icon set with optional GC icon custom element.
- Framework-independent JS utilities for themes, reactive custom accents on OS appearance changes, tabs, native disclosure groups, roving button selection, range outputs, modal drawers, dialog focus return and toasts.
- Static reference lab, tests, GitHub CI and machine-readable design authority registry.

There is no tracking, persistence, network access, third-party font, or bundled outside artwork.

The availability-feedback controller now also captures planned form submissions (including Enter and requestSubmit) and planned submitters, without altering implemented forms. Real backend permissions remain independent.

## Planned-feature feedback (alpha)

The shared `initAvailabilityFeedback()` controller keeps intentionally planned native button/link actions visible and announces truthful, accessible "Not available yet" feedback without side effects. It intercepts only marked native controls and is **not** a security or authorization gate. The reference lab includes a planned Mesh integrations control; other applications are not yet migrated. See [availability-feedback contract and safety boundaries](docs/AVAILABILITY_FEEDBACK.md).

## Native-ready color resource generation

Run `npm run export:platform` to generate deterministic color resources for Android XML, SwiftUI, Windows XAML and GTK CSS, plus a portable eight-palette JSON manifest. Run `npm run export:check` to verify generated resources match the canonical token file. These assets are **token bridges, not compiled native component SDKs**. See [platform resource bridge](docs/PLATFORM_BRIDGE.md).

## Run locally

Open the lab from a static local web server:

    python3 -m http.server 8080
    # http://localhost:8080/lab/

Use web CSS from the package exports in a bundler: @goreecloud/ui/tokens.css and @goreecloud/ui/components.css. Import applyTheme and defineCustomElements from @goreecloud/ui as needed. Add class gc-app to the document body and use native buttons/labels/inputs. Test changes with npm test or npm run check. The package **is not currently published to npm**.

## Contracts and documentation

- [Design language and semantic roles](docs/DESIGN_LANGUAGE.md)
- [Component patterns](docs/COMPONENTS.md)
- [Adaptive collapsible navigation rail](docs/NAVIGATION_RAIL.md)
- [Accessibility and validation](docs/ACCESSIBILITY.md)
- [Native and OS integration roadmap](docs/PLATFORM_ADAPTERS.md)
- [Native color-resource bridge](docs/PLATFORM_BRIDGE.md)
- [Machine-readable authority](registry/design-authority.v1.json)
- [Founder-approved 100 principles](https://drive.google.com/file/d/1JQiGg1ZC7Xgg2VH8ctN2qaPdIBVkrCp5/view) (authorized Drive account)

## Scope, provenance and compliance

GC UI is GoreeCloud's sole visual and experience authority. Using this package does not, by itself, establish consumer migration, native OS support, screen-reader acceptance or a released product. Interfaces must still be reviewed for correct behavior and actual platform integrations. GoreeCloud Mesh, Identity, GoreeShield (privacy) and Wardveil (cybersecurity) remain separate system responsibilities.

Design influences are broad usability principles and material aesthetics, not copied Samsung, Google or Apple code, brand assets, proprietary fonts or glyphs. This repository includes original implementation source and no third-party runtime dependencies.

**License:** MIT; copyright 2026 GoreeCloud.

## Browser token integrity

The canonical JSON token file generates the browser stylesheet. Run `npm run tokens:generate` after changing `tokens/gc.tokens.json` and commit the generated `src/tokens.css`. CI and npm packaging require `npm run tokens:check`; inconsistent styles fail closed. Platform exports remain derived independently from the same JSON source.

## Semantic color contrast screening

Run `npm run contrast:check` to test 82 intended solid foreground/background pairs across light, dark, and all four curated accent families. Machine-readable results: `node scripts/audit-contrast.mjs --json`. This is not a WCAG certification: translucent glass against mixed backdrops, nontext icons, screen reader interactions, browser behavior and native devices still require independent inspection.

## Original icon registry and sprite

GoreeCloud UI includes an original 42-glyph family. The canonical path shapes remain in `src/icons.js`; `npm run icons:generate` builds an offline SVG symbol sprite at `assets/gc-icons.svg` and a registry at `assets/gc-icons.json`. CI and npm packaging run `npm run icons:check` to reject stale glyph exports. Give each icon-only control an accessible label; the icon itself is decorative unless explicitly named. Native applications must implement and verify their own appropriate vector adapters.

## Browser interaction and screenshot QA

`npm run browser:smoke` exercises a local-only headless Chrome fixture and captures desktop/light and mobile/dark reference lab screenshots. A separate pinned GitHub Actions job runs it on Ubuntu 24.04 (where Chrome is included). Screenshots are retained as short-lived CI artifacts for human review; the browser job has no write token, credentials, dependency installer or remote backend. Passing these smoke checks does **not** certify human visual quality, zoom, RTL, physical-device ergonomics or screen-reader accessibility. See [browser QA](docs/BROWSER_QA.md).

## Command palette

The new `initCommandPalette()` adds a searchable, keyboard-operated action launcher to a native `<dialog>`. It requires an explicit `onSelect` callback so every command has an actual consumer action. Open with a labeled button or the optional Ctrl/⌘K shortcut. Filtering compares normalized text, without injected HTML, regex evaluation or network access. An asynchronous action keeps the palette open until its callback resolves; a rejected action remains open and presents an error message. See the component documentation and live lab.

## Native popover action menu

`initActionMenu()` adds a keyboard-operated, edge-aware menu to a native HTML popover. It provides outside-dismissal, focus return, disabled-item handling, an opt-in asynchronous action callback and a privacy-preserving error state, without external dependencies or network activity. See `docs/COMPONENTS.md` and the interactive lab. No native OS menu SDK is implied.

## Sortable native tables

The @goreecloud/ui/table controller implements stable local sorting for native table rows, including aria-sort, localized text, strict numeric/date comparisons, and explicit reset. It never fetches remote records or implies that unseen server pages are sorted. See the design lab and component documentation.

## Offline npm consumer verification

Run `npm run verify:package` to assemble a real local tarball and install only that tarball with npm's offline, ignore-scripts options into an isolated temporary consumer. The check verifies public JS imports, bundled CSS, icon assets and machine-readable design tokens. Temporary files are deleted afterwards. This is not npm publication, third-party supply-chain certification, a product migration or native SDK acceptance.

## Hierarchical navigation tree

`initTreeView` adds a keyboard-accessible, single-selection tree for file browsers, settings, and dashboards. It supports RTL-aware direction keys, typeahead, explicit consumer activation callbacks, and safe focus management. No filesystem operation, backend access, persistence, or telemetry is included. Browser and assistive-technology review remain required for alpha adoption.

## Searchable combobox

The `@goreecloud/ui/combobox` module adds an editable, accessible local suggestion picker with native input focus, arrow-key active-descendant navigation, safe text filtering, disabled choices and optional asynchronous selection callbacks. It does not fetch remote suggestions or persist values. See `docs/COMPONENTS.md` and the design lab.

## Mandatory premium design standard

GoreeCloud UI must be visually distinctive, premium and modern in every supported application context. The shared implementation includes semantic signature composition (`gc-premium-shell`, `gc-showcase`, `gc-feature-grid`), polished controls and purposeful Canvas/Surface/Lens depth. See [Visual quality contract](docs/VISUAL_QUALITY.md). CI rendering does not replace human design acceptance.

## Rounded application windows

All GoreeCloud application windows must have rounded corners. The web library provides gc-window with rounded titlebar/body/controls/statusbar, including compact/floating variants, and four-corner dialogs/drawers. See docs/WINDOWS_AND_NAVIGATION.md. Native OS chrome remains a separate verified-adapter requirement.

## Floating bottom navigation

The responsive gc-bottom-nav capsule floats above device gesture insets, with native links, original icons, visible labels, selected-state contrast, mobile reflow and an optional keyboard/route controller. See docs/COMPONENTS.md. Actual routing authorization and native OS navigation remain consumer responsibilities.

When a browser `hashchange` or `popstate` leaves the dock's known same-origin destinations, the controller now clears stale `aria-current` and active styling. A recognized route restores exactly one current destination. On initialization it also clears any stale server-rendered current marker for an unrecognized fragment or pathname; an explicit same-document initial marker is retained only when the URL has no fragment. This updates only presentation; consumers remain responsible for real navigation, history state, and authorization.

### Color choice is application- and user-directed

**There is no required GoreeCloud brand/system hue.** Iris, Lagoon, Ember and Moss are optional example accents; each app or authorized user may choose an independent hue through semantic color roles and custom-accent support. Iris is only the alpha no-configuration fallback for demonstrations, not a cross-product mandate. Contrast and accessibility rules still apply. See [Design language](docs/DESIGN_LANGUAGE.md).

### Floating navigation in rounded application windows

For a desktop-like app frame, pair `gc-window--app-shell` with `gc-bottom-nav--window` and a scrollable `gc-window__body`; choose this **instead of** the viewport-fixed dock for a consuming app. The component library does not impose a window height or claim native OS chrome support. See [Windows and navigation](docs/WINDOWS_AND_NAVIGATION.md).

## Independent application color and appearance (web alpha)

GoreeCloud UI has **no required hue, optional-preset restriction or mandatory light/dark theme**. Applications may independently select a curated example accent, an arbitrary six-digit hex color, and light, dark or auto appearance. Iris is a technical fallback, not the brand mandate.

Use `applyTheme(document.documentElement, { mode: "auto", customAccent: "#B13571" })` for full-page apps, or `applyTheme(appRoot, { mode: "dark", accent: "lagoon" })` on separate `.gc-app` elements to isolate palette roles. A scoped root must be explicitly configured; unconfigured apps inherit the host's palette. Verify contrast, OS appearance updates, overlays, forced colors and reduced-transparency on actual consumers. See the [scoped theme contract](docs/DESIGN_LANGUAGE.md#per-application-color-and-appearance-scope-web-alpha).

## Optional frosted Cloud Lens materials

The independently importable `@goreecloud/ui/glass.css` adds opt-in atmospheric materials. It does **not** require a particular color, system theme or glass treatment on every surface. Import `tokens.css` and `components.css` first; use a native element with `class="gc-glass-base"` and `data-gc-translucent="true"` to opt in. Essential reading content remains on opaque Cloud Surface.

Apps embedded in one document can choose light/dark/auto appearance, accents and `transparency: "reduce"` independently using `applyTheme(appRoot, options)` on an explicitly configured `.gc-app` root. Real Chromium regression checks exercise sibling isolation, the Signal Constellation Lens, and forced-colors fallback. See [glass material guidance](docs/GLASS_SURFACES.md). Consumer and native device acceptance remain separate.
