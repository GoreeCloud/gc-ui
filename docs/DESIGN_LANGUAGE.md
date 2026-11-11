# GoreeCloud UI — Design language and token contract

**Status:** Alpha implementation specification, November 10, 2026. Founder-approved design philosophy and rules are active; this newly generated palette is provisional pending design acceptance.

## Identity

**Clear by default. Consistent by nature. Fluid by design.**

**Calm information. Expressive personality. Purposeful depth.**

GoreeCloud UI combines ergonomic reach and content hierarchy, adaptable semantic color, and selectively translucent materials. This is a distinct GoreeCloud system and does not duplicate vendor APIs or graphics.

## Three material layers

| Material | Layer | Role |
| --- | --- | --- |
| Cloud Canvas | 0 | Calm, opaque application backdrop |
| Cloud Surface | 1 | Readable cards, forms, workspaces and tonal grouping |
| Cloud Lens | 2 | Floating navigation, menus, overlays and transient controls |

Glass must be purposeful; provide solid fallback and maintain contrast. Never put essential reading content over unpredictable photographs or translucent layers.

## Authoritative token roles and alpha values

Alpha source JSON: [gc.tokens.json](../tokens/gc.tokens.json). Browser CSS contract: [tokens.css](../src/tokens.css). Project JSON is a practical token manifest, **not a claimed fully DTCG-conformant file**. CSS custom properties use prefix --gc-.

| CSS role | Purpose |
| --- | --- |
| --gc-canvas | App backdrop |
| --gc-surface / --gc-surface-tonal | Main and grouped surfaces |
| --gc-brand / --gc-on-brand | Primary action and readable foreground |
| --gc-brand-container / --gc-on-brand-container | Tonal brand emphasis |
| --gc-text / --gc-text-soft | Main and supporting content |
| --gc-outline / --gc-outline-soft | Boundaries and separators |
| --gc-positive / --gc-warning / --gc-negative | Status color, never the only signal |
| --gc-on-positive / --gc-on-warning / --gc-on-negative | Readable foreground for filled statuses |
| --gc-lens-fill / --gc-lens-solid | Floating material and fallback |
| --gc-focus-ring / --gc-scrim | Focus and modal dimming |

Four accent families are **Iris, Lagoon, Ember and Moss**. Accent and appearance must remain independent. Appearance modes are light, dark and auto; increased contrast is normal or more. Light and dark semantics are both defined directly, and CSS auto uses prefers-color-scheme. A constrained deriveAccent helper adjusts user-provided opaque hex locally; it is not a full Material Color Utilities/wallpaper generation pipeline.

Foundations: spacing 4/8/12/16/20/24/32/40/48/64 pixels; radius 12/18/26/36/full; motion 120/220/380 milliseconds with restrained easing; typography uses system UI fonts and 16px preferred body; icon canvas 24px and optical sizes 16/20/24/32; 44px touch-control baseline; five elevation levels, readable width and logical-direction layout.

Example HTML root attributes:

    <html data-gc-theme="auto" data-gc-accent="iris" data-gc-contrast="normal">

## Layout and behaviors

Mobile prioritizes reachable actions, readable vertical rhythm, safe area and legibility. Tablet reflows; desktop supports stable rail/sidebar, keyboard workflows and denser workspaces. Design states include default, hover, focus, pressed, selected, busy, disabled, invalid, success, permission denied, offline, empty and recovery. Motion is informative and must have a reduced-motion fallback. Transparent Lens material must degrade gracefully with reduced-transparency and forced-color preferences.

## Review and governance

Every consumer design must be visually and functionally reviewed against actual device sizes, theme combinations, contrast, text scaling, keyboard flows, operating system conventions and true backing operations. WCAG AA contrast guidance is 4.5:1 for ordinary text and 3:1 for large text and applicable nontext indicators, with standards-defined exceptions. Tests in this repo do not certify application-wide accessibility.

The [active founder-approved GoreeCloud UI design language and 100 UI/UX principles](https://drive.google.com/file/d/1JQiGg1ZC7Xgg2VH8ctN2qaPdIBVkrCp5/view) are the governing visual and interaction source. This is a new design system with no predecessor implementation. Each new capability must be validated in its own right.

### Deterministic token generation

The JSON manifest follows a GC UI alpha-specific structure rather than claiming full Design Tokens Community Group conformance. Regenerate browser CSS with `npm run tokens:generate`; CI requires `npm run tokens:check`. The same source drives native-platform token exports. Alpha color values remain candidates pending actual visual/device acceptance.

### Automated contrast evidence and limits

`npm run contrast:check` fails if any of the currently defined 82 opaque foreground/background combinations falls below the relevant threshold (4.5:1 text or 3:1 focus ring). Pair inventory: text, supporting text, positive/warning/negative on Canvas/Surface/tonal, filled status on-colors, focus on all three surfaces, brand on those surfaces, and brand-container on-colors in Iris/Lagoon/Ember/Moss and both appearances. Its audit deliberately excludes variable-compositor translucent Lens backdrops, images, essential nontext indicators, visual effects and assistive-technology behavior; those must be reviewed separately on actual screens. This audit is alpha evidence, not device-wide acceptance or certification.

## Premium visual quality is mandatory

GoreeCloud UI must remain distinct, polished and modern across supported apps, dashboards and future operating systems. Generic unfinished defaults are unacceptable. Premium means original expressive hierarchy, balanced space, refined controls and purposeful depth—not indiscriminate blur or decoration. Use semantic tokens and three material roles, maintain opaque legibility and accessible modes, and require real visual acceptance. See [Premium visual quality](VISUAL_QUALITY.md).

## Rounded application windows (founder requirement)

Every GoreeCloud application window, including compact, modal and maximized frames, has rounded corners. Web gc-window and overlay primitives use the canonical 36px XL or compact 26px LG radii. See WINDOWS_AND_NAVIGATION.md. Native OS chrome requires independently verified platform adapters; no native implementation is claimed.

## Floating application bottom navigation

Use a rounded floating Cloud Lens bottom destination bar whenever a GoreeCloud app has multiple primary destinations. Preserve gesture safe areas, semantic links, RTL keyboard navigation and opaque high-contrast fallbacks. Refer to WINDOWS_AND_NAVIGATION.md and COMPONENTS.md; native adapters are not implemented yet.


## Founder color freedom — no mandatory GoreeCloud hue

GoreeCloud UI has **no mandatory global/default/system/brand color**. Individual apps, services, window surfaces, icons and other authorized visual contexts may choose **any** hue independently, while respecting user-provided color choices and privacy preferences. Iris, Lagoon, Ember and Moss are curated **optional demonstration presets**, not a compulsory identity palette. The alpha theme utility currently uses Iris only as a no-configuration technical/demo fallback; consumer applications should explicitly choose or derive their own permitted palette. The lab's Iris default is not a universal brand requirement.

All choices must still preserve semantic foreground/background roles, text and focus contrast, forced-colors and reduced-transparency support, and independent light/dark behavior. Current local deriveAccent supports opaque hex custom colors with contrast adjustment, not comprehensive wallpaper-derived color or native platform harmonization. The written design authority retains its 100 active UX principles; this clarifies the founder's separate no-mandated-hue decision rather than replacing it.
