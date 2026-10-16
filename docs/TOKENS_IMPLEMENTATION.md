# GC UI — Token System, Naming, Implementation and Distribution
**Version:** v1 candidate. Canonical machine-readable source: tokens/gc.v1.tokens.json.

## 1. Build contract
GC UI uses DTCG 2025.10 token leaf conventions: each token has $type and $value. The registry separates foundation primitives, semantic color roles, and component usage values. Foundation measurements are web CSS pixel references; native adapters map them to platform logical units and font scaling.
Run:
~~~sh
node scripts/build-v1-tokens.mjs
node scripts/build-v1-tokens.mjs --check
npm test
~~~
The resulting CSS is styles/gc.v1.generated.css and is committed for zero-dependency reference use. CI must reject drift. The original 0.1 alpha token files are preserved for backward compatibility; v1 naming is namespaced until deliberate migration.

## 2. Token naming
**Registry source:** foundation.space.four, foundation.radius.lg, foundation.typography.size.body, color.light.surface, color.accent.lagoon.dark.primary, component.button.height.medium.  
**Generated web CSS:** --gc-v1-foundation-space-four, --gc-v1-foundation-radius-lg, --gc-v1-foundation-typography-size-body, --gc-v1-color-surface, --gc-v1-component-button-height-medium.  
Color mode is resolved through selectors, not embedded in the public CSS var. Accent is similarly resolved by semantic overriding. This avoids components branching on mode.
Avoid: --blue-500 inside a feature component, hardcoded #..., --card-purple, --primary-color-light-button, unversioned vendor-specific tokens.

## 3. Theme selectors
~~~html
<html data-gc-mode="light" data-gc-accent="iris">
<link rel="stylesheet" href="/styles/gc.v1.generated.css">
~~~
data-gc-mode accepts light/dark; auto mode belongs to host runtime, which must reflect OS settings while no explicit override exists. data-gc-accent accepts iris/lagoon/ember/moss in v1 reference CSS. Unknown values fall back to Iris; arbitrary hex seeds can be previewed using the experimental, independent OKLCH color engine in src/gc-color-engine.mjs. It enforces foreground/body contrast for generated roles, but is not yet validated for every background/non-text pairing or approved for production. Version 1 does not claim wallpaper extraction is shipped.

## 4. Component example
~~~css
.gc-v1-button {
  min-block-size: var(--gc-v1-component-button-height-medium);
  border-radius: var(--gc-v1-component-button-radius);
  padding-inline: var(--gc-v1-component-button-padding-medium);
  background: var(--gc-v1-color-primary);
  color: var(--gc-v1-color-on-primary);
  border: 1px solid transparent;
}
.gc-v1-button:focus-visible {
  outline: var(--gc-v1-component-focus-width) solid var(--gc-v1-color-focus-ring);
  outline-offset: var(--gc-v1-component-focus-offset);
}
~~~
Use semantic foreground pairs. Never create a glass background for text without an opaque escape route.

## 5. Cross-platform adapters
- Web: generated custom properties, CSS forced-colors mode, optional progressive backdrop filter.
- Android: map semantic roles into Compose ColorScheme or a GC UI theme wrapper; consume system dynamicColorScheme only where approved. Do not claim source token equivalence with Google palettes.
- Apple: map appearance, semantic colors and dynamic type to SwiftUI/AppKit/UIKit theme environment; prefer native system materials where they improve familiar interactions, without claiming to reimplement Liquid Glass proprietary optics.
- Windows: semantic resource dictionaries + system high contrast; support mouse/keyboard/multi-window.
- TV: remote focus theme + typography and target overrides.
- Spatial/wearable: host-native window materials and native accessibility systems; tokens determine foreground hierarchy, not simulated background refractive physics.

## 6. Token lifecycle and migration
SemVer for shipped packages. Additive roles can arrive in minor versions; removal or rename requires a major version. Every token has an owner, description and at least one example before stable. Use alias/deprecation period of at least one minor release whenever practical. CSS generated from tokens is a derivative; change the JSON first. Existing alpha tokens remain supported until an explicit migration ticket and test.

## 7. Implementation patterns
Prefer native DOM/ARIA controls. Style visual states separately from semantics. Expose props with defaults and validation: variant, size, density, tone/intent, disabled, busy, loading announcement and slots. Do not overload semantic colors for arbitrary business labels. To guarantee stability, a component should read only its component tokens and semantic roles, not other components' private vars.

## 8. Security, performance and third-party IP
No runtime CDN font requirement. Avoid dynamic CSS from untrusted seed text; hex must be validated and perceptually mapped. Escape HTML labels and use safe text nodes. Never import Glaze UI source. Prefer no opaque backdrop animations on low-end hardware; render the same interface in solid mode. Apple and Google references are inspiration, not dependency or license to republish proprietary icons/material implementations.

## 9. Current state
v1 token JSON, CSS generator, CSS artifact, catalog, and test contract are created. Framework packages, production validated tonal palette generation, native adapters, full icon vectors, visual snapshots, and manual assistive-technology audits are NOT completed. Production-ready release is gated by ACCESSIBILITY_RELEASE.md.
