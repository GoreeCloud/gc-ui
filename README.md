# GoreeCloud UI

**Clear by default. Consistent by nature. Fluid by design.**

GoreeCloud UI (GC UI) is the mandatory design language for GoreeCloud-controlled applications, websites, dashboards and future operating-system interfaces. It synthesizes ergonomic layout, adaptive semantic color and purposeful translucent depth into an original visual system.

> **Maturity: 0.1.0-alpha.0, not Stable.** GoreeCloud UI is a new greenfield project, with no inherited code or releases. The initial alpha establishes its design language and implementation contracts. Semantic roles follow the founder-approved standard, while specific new palette values are provisional alpha candidates pending visual acceptance.

## Implemented here

- **Cloud Canvas / Cloud Surface / Cloud Lens** material hierarchy with solid-glass alternatives.
- **Iris / Lagoon / Ember / Moss** accent families, separately defined light and dark palettes, and high-contrast, reduced-motion and reduced-transparency rules.
- Shared tokens for color, typography, four-pixel spacing, shape, elevation, motion, icon size, control dimensions, breakpoints and z-index.
- Native-first styled buttons, cards, form fields, switches, tabs, chips, badges, alerts, dialog, navigation, tables, toasts, progress and loading patterns.
- An original 24px line-glyph icon set with optional GC icon custom element.
- Framework-independent JS utilities for themes, safe custom accents, tabs, dialog focus return and toasts.
- Static reference lab, tests, GitHub CI and machine-readable design authority registry.

There is no tracking, persistence, network access, third-party font, or bundled outside artwork.

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
- [Accessibility and validation](docs/ACCESSIBILITY.md)
- [Native and OS integration roadmap](docs/PLATFORM_ADAPTERS.md)
- [Native color-resource bridge](docs/PLATFORM_BRIDGE.md)
- [Machine-readable authority](registry/design-authority.v1.json)
- [Founder-approved 100 principles](https://drive.google.com/file/d/1JQiGg1ZC7Xgg2VH8ctN2qaPdIBVkrCp5/view) (authorized Drive account)

## Scope, provenance and compliance

GC UI is GoreeCloud's sole visual and experience authority. Using this package does not, by itself, establish consumer migration, native OS support, screen-reader acceptance or a released product. Interfaces must still be reviewed for correct behavior and actual platform integrations. GoreeCloud Mesh, Identity, GoreeShield (privacy) and Wardveil (cybersecurity) remain separate system responsibilities.

Design influences are broad usability principles and material aesthetics, not copied Samsung, Google or Apple code, brand assets, proprietary fonts or glyphs. This repository includes original implementation source and no third-party runtime dependencies.

**License:** MIT; copyright 2026 GoreeCloud.
