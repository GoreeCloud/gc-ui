# GoreeCloud UI — Platform token bridge

**Status:** Generated source resources are an alpha integration aid. Native controls, packaging, platform conformance and visual acceptance are not implemented by this bridge.

## Commands

- npm run export:platform — deterministically write platform/generated under the repository.
- npm run export:check — fail if any required output differs from the current tokens/gc.tokens.json.
- npm run check — validate JS and regenerate/check the assets, then execute source and contrast tests.
- npm pack --dry-run --json — inspect distributable package contents (prepack generates the resources).

The generator uses built-in Node APIs only; it requires no network, telemetry, credential or third-party package. It validates every color, supports #RRGGBB and numeric rgba, and converts CSS opacity into eight-digit #AARRGGBB for native color resources.

## Generated files

| File | Use | Limitations |
| --- | --- | --- |
| platform/generated/GCUI.palettes.json | Eight accent×appearance palette records, spacing, radius and motion | Portable data, not a native toolkit |
| platform/generated/android/gc-colors.xml | Android <color> resources, 4 accents × 2 appearance modes × 21 semantic roles | Explicit keys; consumer chooses appropriate color at runtime |
| platform/generated/android/gc-dimensions.xml | Android dp resources for shared spacing and corner sizes | OS text scaling, typography and animation are consumer responsibilities |
| platform/generated/swift/GCUIColors.swift | SwiftUI Color dictionaries for each palette | Requires Xcode/device compilation before adoption |
| platform/generated/windows/GCUIColors.xaml | XAML Color resources keyed by accent, mode and semantic role | Consuming Windows app resolves brushes and high-contrast behavior |
| platform/generated/gtk/gc-colors.css | GTK @define-color roles for each accent/mode | Linux UI integrates and switches its preferred palette explicitly |

## Token mapping

For example: Iris light + brand is gc_iris_light_brand (Android/GTK), GcIrisLightBrand (XAML), and irisLight["brand"] (SwiftUI). All exports use source semantic roles such as canvas, surface, surface-tonal, text, brand/on-brand, outline, focus-ring, lens-fill and error/success roles. Transparent lens values use alpha but must still provide the opaque lens-solid fallback.

## Platform responsibility boundaries

The exports intentionally do not implement native windows, icon integration, font licensing, platform widgets, interaction semantics, screen reader behaviors, keyboard/remote navigation, dynamic wallpaper extraction, live theme subscription or packaged app releases. Consumers must own these. GoreeCloud Identity, GoreeShield privacy, Wardveil cybersecurity and GoreeCloud Mesh integration remain separately governed systems.

## Acceptance

Before consumers adopt a resource export, compile on their actual OS toolchain, test all supported palette combinations, verify keyboard/touch/assistive behavior, dynamic contrast and color management, handle dark/high contrast and reduced translucency, and record actual device results. A passing JSON/XML file generator does not establish native platform support.
