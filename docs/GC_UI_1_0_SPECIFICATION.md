# GC UI — Design Language Specification 1.0
**Status:** normative design specification candidate; implementation maturity tracked separately.  
**Scope:** mobile, tablet, foldable, desktop, ultrawide, television, wearable, and spatial experiences.  
**Owner:** GoreeCloud. **Identity:** original; no dependency on Glaze UI.

## 0. What this document is
MUST means required to claim GC UI compliance; SHOULD means strongly preferred; MAY is an intentional extension. This is a design contract, not an assertion that every component or platform implementation already exists. Values are GC UI decisions unless explicitly marked as external guidance. Read this alongside COLOR_THEMES, COMPONENT_CATALOG, MOTION_INPUT, LAYOUT_PLATFORMS, ICONOGRAPHY, ACCESSIBILITY_RELEASE, and TOKENS_IMPLEMENTATION.

## 1. Identity and the six principles
**Promise:** Calm information. Expressive personality. Purposeful depth.  
**Personality:** precise, warm, articulate, responsive, softly dimensional, understated.  
**Not:** indiscriminate frosted cards; neon glow everywhere; constant bouncing; low-contrast decoration; platform mimicry.
1. **Content before effect:** remove every blur, highlight and animation and the hierarchy MUST still work.
2. **Personal, not random:** theme inputs are seeds; applications consume semantic roles, never seeds directly.
3. **Depth is a verb:** depth indicates separation, attachment, navigation and transience.
4. **Fluid continuity:** changes preserve the relationship between origin, destination and state.
5. **One identity, native instincts:** component intent stays consistent; navigation and input adapt to the host.
6. **Inclusive by default:** contrast, focus, target sizes, reduced effects and assistive semantics are acceptance criteria, not alternate themes.
Design quality test: Can a user identify the primary task in under 3 seconds? Is every surface necessary? Can the UI survive 400% zoom, reduced motion and solid materials? Are irreversible actions conspicuous and deliberate?

## 2. Three-layer architecture
| Plane | Material | Purpose | Behavior | Forbidden use |
|---|---|---|---|---|
| 0 | **Canvas** | Ambient scene or workspace | always provides opaque fallback; minimal contrast-changing decoration | busy texture behind reading text |
| 1 | **Surface** | information, cards, forms, lists, tables | solid/tonal preferred; coherent grouping | translucent body copy or arbitrary glass grid |
| 2 | **Lens** | floating navigation, temporary controls, compact inspector | adaptable blur, bounded transparency, separation edge, shadow | full-page text container or nested glass-on-glass |
**Lens budget:** at most one dominant Lens region per viewport and up to two independent auxiliary Lens elements; additional floating elements require explicit usability review. Two nested Lens layers are prohibited. Lens text MUST meet contrast on the actual composited background; if background cannot be bounded, switch to solid. Decorative glow never communicates status.

## 3. Design vocabulary
- **Accent:** user-facing color identity, applied to primary actions, selection and small moments of emphasis.
- **Tone:** relative lightness within a hue family; paired on-colors determine readable foregrounds.
- **Plane:** Canvas, Surface, Lens.
- **Elevation:** depth cue with tokens E0–E4, distinct from modal stacking order.
- **Density:** comfortable (default), compact (fine pointer), spacious (large display).
- **Character:** Quiet, Signature, Atelier. Character changes shape, texture and animation *within guardrails*, never semantics.
- **Intent:** action semantics (primary, neutral, success, caution, danger, information).
- **Adaptive:** layout recalculates for container width, pointer capability and text scaling—not device marketing labels.

## 4. Geometry
All dimensions use CSS px on web, logical dp/pt equivalents on native; **never** interpret CSS px as hardware pixels.
- Grid: 4px base, extended scale 2,4,8,12,16,20,24,32,40,48,64,80,96.
- Control heights: compact 36px where pointer-dense and suitable; default 44px; touch comfortable 48px; hero 56px. Regardless of visible bounds, interactive hit area SHOULD be >=44x44 CSS px; television focus target >=64x64 logical units.
- Corner sizes: 0 / 6 / 12 / 18 / 26 / 36 / pill. Recommended: chip 12; field 12; button 18; surface 26; dialog/sheet 36. Nested corner: outer radius approximately inner radius + inset, capped by half-edge.
- Stroke: 1px hairline (1 device physical pixel where feasible), 1.5px active, 2–3px focus; no hairline-only differentiation.
- Responsive reading width: 60–75ch, longform heading width <=18ch; application data tables exempt.
- Grid gutters: 16 mobile, 24 medium, 32 large, 48 ultrawide. No viewport-edge content beneath a floating nav without a safe-area inset.

## 5. Material and illumination
- **Canvas** opaque tonal fields; artwork and gradients behind content only when a stable scrim protects reading.
- **Surface** opaque or >=0.96 equivalent fill when used for text; E0/E1; outline on adjacent close-toned surfaces.
- **Lens/regular** supported backdrop blur target 18–28 CSS px, conditional tint and 1px highlight edge. The effective background MUST be contrast tested for any position over which it floats. No universal opacity guarantees legibility.
- **Lens/clear** only for short, icon-led controls above imagery; labels require local opaque pill/scrim; never long text. Use solid fallback automatically when contrast cannot be guaranteed.
- **Lens/solid** same geometry and state behavior, opaque fill with outline.
- **Lighting:** one soft ambient upper-edge reflection, broad shadows below; avoid multiple competing specular highlights.
- Shadow scale: E0 none; E1 0 2px 8px rgba(12,18,40,.07); E2 0 8px 24px rgba(12,18,40,.10); E3 0 16px 40px rgba(12,18,40,.16); E4 0 24px 64px rgba(12,18,40,.22). Dark themes rely more on tone and outline, less on shadow.
- Backdrop blur is an **optional enhancement**. System contrast, reduced transparency, forced-colors, GPU constraints or unsupported browsers require Lens/solid.

## 6. Color architecture
Five families: primary, secondary, tertiary, neutral, neutral-variant. Semantic roles: canvas, on-canvas, surface, surface-raised, surface-tonal, on-surface, on-surface-muted, surface-inverse, on-surface-inverse; primary/on-primary, secondary/on-secondary, tertiary/on-tertiary; containers/on-containers; outline/outline-strong/divider; success, warning, danger, info each with on and container pair; focus; selection; scrim; link; visited-link; lens-fill/lens-border. Never expose raw palette values to feature components.
Colors MUST be evaluated in light, dark, increased contrast and on actual backdrops. Refer to COLOR_THEMES for algorithms and seed fallback rules. Status is never color alone.

## 7. Typography
System-native first: -apple-system/BlinkMacSystemFont on Apple, Roboto or host default on Android, Segoe UI on Windows, platform UI faces elsewhere. Fallback: ui-sans-serif, system-ui, sans-serif. No cross-app dependency on commercial fonts. Body default 16px/1.55, labels 14px/1.35; never reduce 16px body to fit a screen. Dynamic Type/font scaling MUST be honored. Optical sizes, letter spacing and weight changes are permitted, not forced; avoid faux bold.
| Role | Size / line height | Weight | Tracking |
|---|---|---|---|
| Display L | clamp(40px,5vw,72px) / 1.04 | 620–700 | -0.035em |
| Display M | clamp(34px,4vw,52px) / 1.10 | 620–700 | -0.03em |
| Headline | 30px / 1.20 | 650 | -0.025em |
| Title L | 24px / 1.25 | 620 | -0.02em |
| Title M | 20px / 1.30 | 620 | -0.01em |
| Title S | 17px / 1.35 | 620 | -0.005em |
| Body L | 18px / 1.55 | 400 | 0 |
| Body | 16px / 1.55 | 400 | 0 |
| Body S | 14px / 1.50 | 400 | 0.005em |
| Label L | 14px / 1.35 | 600 | 0.005em |
| Label S | 12px / 1.30 | 600 | 0.01em |
| Caption | 12px / 1.45 | 450 | 0.005em |
No all-caps paragraphs; uppercase micro-labels optional only when still legible. Numeric data use tabular figures; code uses native monospace. Localize for script and word-break; do not letter-space connected scripts.

## 8. Shapes and iconography
A GC glyph uses a 24x24 viewBox, 20x20 normal drawing field, nominal 1.75 stroke, round joins/caps, optical rather than purely mathematical centering. Small icons simplify detail, not scale a dense drawing down. Provide outline (default) and filled (selected/high-emphasis) variants with identical metaphors and baselines. Icon-only actions require accessible names. See ICONOGRAPHY for full construction and delivery rules.

## 9. Motion
Durations: immediate 0–80ms, fast 120ms, standard 220ms, entrance 320ms, expansive 440ms. Use standard [.2,.8,.2,1], emphasized [.16,1,.3,1] and exit [.4,0,1,1]; platform-native spring may override only when critically damped and predictable. Never animate essential text or inaccessible focus position. Motion reduced means no morph, parallax, scale celebration, moving backgrounds or smooth scroll. See MOTION_INPUT.

## 10. Content and navigation
Information architecture: application -> destination -> collection -> item -> detail -> action. Main navigation never becomes a menu of every feature; 3–5 primary mobile destinations, up to 7 large-screen top-level groups with overflow. Keep current destination, back affordance and breadcrumbs unambiguous. Search is global only when it searches across the product; scoped search announces scope. Preserve scroll/filter state on reversible navigation.

## 11. Component contract
Every component MUST document: role and anatomy; required and optional slots; variants; token references; interactive states; keyboard and screen-reader behavior; responsive and input adaptations; error/loading/empty behavior; localization/RTL; test cases; breaking-change/version note.
Canonical interactive states: idle, hover (where available), focus-visible, pressed, selected, expanded, dragging, indeterminate, disabled, read-only, busy, invalid, success and pending. State combinations have explicit priority; see COMPONENT_CATALOG.

## 12. Layout and platforms
Define adaptive composition by *available container space*: compact <600, medium 600–839, expanded 840–1199, wide 1200–1599, ultrawide >=1600 CSS px. These are GC UI starting thresholds, not an external OS standard. Device class does not determine modality: touchscreen desktops, keyboards on tablets and screen readers all remain first-class. Foldable hinges are exclusion regions. On TV, focus, distance and remote controls dominate. Spatial systems require world-anchored depth with host-native materials and no proprietary glass imitation. See LAYOUT_PLATFORMS.

## 13. Accessibility
Target WCAG 2.2 AA on web with AAA-friendly enhancements where practical. 4.5:1 normal text, 3:1 large text and required non-text indicators; target size >=24x24 CSS px or WCAG exceptions, GC UI ergonomic policy >=44x44 by default. Visible focus, 200/400% zoom, 320px reflow, accessibility APIs, descriptive errors, non-color indicators, reduced motion/transparency and forced-color fallback MUST pass before stable release. Compliance is **verified**, not declared by presence of tokens.

## 14. Quality, governance and versioning
- **Design tokens:** primitive -> reference palette -> semantic alias -> component tokens. Product CSS imports semantic/component tokens, never palette hex values.
- **Compatibility:** immutable token IDs within major versions; deprecate before removal. A rename is breaking.
- **Reviews:** contrast pair snapshots; keyboard/screen-reader manual audit; light/dark/contrast/solid variants; touch/fine-pointer, internationalization, RTL; performance budgets.
- **Definition of done:** documented, coded, tested, examples updated, release notes, backward compatibility assessed. Alpha playground is NOT the production component package.
- **Visual QA:** compare 1x and 2x DPR screenshots; verify blur fallbacks; check real platform fonts, text overflow and animation cancellation.
- **Performance budgets (GC UI aspirational, hardware-dependent):** avoid per-frame JS layout; only animate transform/opacity unless essential; reserve backdrop-filter to small bounded areas; avoid >2 overlapping backdrop-filter areas in the main interaction zone.

## 15. Inspiration and independence
Apple HIG, Materials: https://developer.apple.com/design/human-interface-guidelines/materials (functional control layer).  
Android Developers, M3: https://developer.android.com/develop/ui/compose/designsystems/material3 (semantic roles, color/shape/type theming).  
W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/ (accessibility requirements).  
DTCG 2025.10: https://www.designtokens.org/TR/2025.10/ (interchange format; a community report, not a W3C Recommendation).
GC UI does not use Apple or Google proprietary code, brand artwork or design assets. Glaze UI remains a separate system and is not a dependency.
