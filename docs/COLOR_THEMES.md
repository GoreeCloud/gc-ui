# GC UI — Color, Theme & Personalization Specification
**Status:** candidate contract for production implementations. Current alpha UI remains curated-only until wired to the v1 engine.

## 1. Role taxonomy
Define colors by **meaning** rather than component or literal hue. Primitive swatches are internal. Reference palette scales are neutral, neutralVariant, primary, secondary, tertiary, plus fixed semantic families success, warning, danger, info. Public semantic roles:
- Core: canvas, onCanvas, surface, onSurface, surfaceRaised, surfaceTonal, surfaceInset, onSurfaceMuted, inverseSurface, inverseOnSurface.
- Accents: primary/onPrimary, primaryContainer/onPrimaryContainer, secondary/onSecondary, secondaryContainer/onSecondaryContainer, tertiary/onTertiary, tertiaryContainer/onTertiaryContainer.
- Controls: outline, outlineStrong, divider, focusRing, selection, onSelection, link, visitedLink, scrim.
- Feedback: success/onSuccess/successContainer/onSuccessContainer; warning/onWarning/warningContainer/onWarningContainer; danger/onDanger/dangerContainer/onDangerContainer; info/onInfo/infoContainer/onInfoContainer.
- Materials: lensFill, lensStroke, lensHighlight, lensShadow, mediaScrim.
Foreground must use the matching on-role; don't infer foreground by background brightness at render time.

## 2. Seed processing (GC UI's algorithm requirements)
Input: user-selected hex, OS-supplied dynamic palette, permitted image color suggestion, or one of the curated starter palettes (Iris, Lagoon, Ember, Moss). Output: a fully validated semantic scheme per appearance.
1. Validate input format and sRGB gamut. Reject invalid/transparent colors and reserve brand and semantic error roles.
2. Convert to a perceptual cylindrical color model (OKLCH recommended), derive primary seed hue/chroma. Construct secondary at 35–55% relative chroma; tertiary at hue offset +45–75° with limited chroma; neutral at <=0.025 C and neutralVariant at <=0.045 C.
3. For each family derive lightness stops corresponding to 0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100. Gamut-map by lowering chroma before clamping RGB channels, to limit hue shifts.
4. Assign color roles from the generated tonal families using a versioned mapping table. Generate light and dark independently; **do not** invert colors or apply a global filter.
5. Validate role/on-role pairs with sRGB WCAG contrast. When insufficient, adjust foreground tone first, then background within permitted role intervals. Reject/prompt for fallback when still insufficient. Test composited backgrounds for all semi-transparent roles.
6. Clamp extremes for coherent chroma, bound surface tint to a subtle range, retain distinctly recognizable danger/warning semantics even when seed is red/yellow.
7. Store theme seed and generator version, not a cache of ad hoc hex values. Theme recalculation occurs at personalization changes and is stable between renders.
8. Never claim a raw wallpaper import on the web: browsers cannot generally read a user's OS wallpaper. Native opt-in platform providers MAY supply system dynamic schemes; web MAY allow explicit image upload with local-only processing and clear permission.

## 3. Baseline semantic pairs (starter scheme)
These are initial default values used for reference and documentation; implementers MUST validate effective contrast with actual background and typography. These are *GC UI choices*, not Google's Material hex exports.

| Role | Light | Dark |
|---|---|---|
| canvas | #ECF0F8 | #10131E |
| onCanvas | #20243A | #F2F2FA |
| surface | #F9FAFD | #1D2231 |
| surfaceRaised | #FFFFFF | #252B3D |
| surfaceTonal | #E5EBF6 | #292F40 |
| onSurface | #20243A | #F2F2FA |
| onSurfaceMuted | #5F657B | #B3B9CF |
| outline | #8990A7 | #747C99 |
| outlineStrong | #777E99 | #AEB6D0 |
| divider | #E5E7F0 | #373C50 |
| focusRing | #4132B3 | #D8D2FF |
| success | #206A46 | #9CE3B9 |
| onSuccess | #FFFFFF | #173B28 |
| warning | #875500 | #FFD28A |
| onWarning | #FFFFFF | #4D3100 |
| danger | #A73549 | #FFB5BE |
| onDanger | #FFFFFF | #5B1827 |
| info | #136B8F | #9CDFF7 |
| onInfo | #FFFFFF | #153E4E |
For final production ship, audit all pairs and run the theme verifier for each curated theme; a table is not evidence of passing WCAG. The light-mode baseline now uses tonal Canvas/Surface separation; the brighter #FFFFFF is reserved for the raised plane.

## 4. Accent reference palettes
| Palette | Seed | Emotional register | Good for |
|---|---|---|---|
| Iris | #5145D9 | focused, expressive violet | productivity / creativity |
| Lagoon | #087C8D | composed, aquatic teal | dashboards / wellness |
| Ember | #AE4D3F | grounded, energetic terracotta | commerce / lifestyle |
| Moss | #3F744B | natural, reassuring green | planning / environment |
Primary is not the only expressive color. Secondary is contextual; tertiary introduces contrast in controlled doses. Accent coverage guidance: <=15% of an informational view, and no competing multicolor CTA clusters.

## 4a. Balanced Surface Color — anti-whiteout rule
**Design intent:** GC UI light themes SHOULD feel bright without becoming an almost entirely white, visually flat canvas. The goal is differentiated tonal space, not greater saturation or mandatory decoration. This rule applies to websites, applications, and adaptive shells.

- **Canvas is atmospheric, not blank:** Prefer a subtly tinted neutral/neutralVariant Canvas instead of assigning `#FFFFFF` to the entire viewport.
- **Surface roles express hierarchy:** Use `surfaceTonal` and `surfaceInset` for section groups, navigation bodies and secondary regions. Reserve the brightest `surface` or `surfaceRaised` for reading panes, active work areas and overlays where additional clarity is useful.
- **Color comes from roles:** Introduce secondary/tertiary containers for selective contextual sections and meaningful highlights, while keeping the existing <=15% informational-view accent guidance. Do not scatter unrelated bright colors or use a different hue for every card.
- **Glass is selective:** Lens adds focus to transient controls; it is not a solution for a visually monotonous, white-on-white layout.
- **Composition matters:** Adjacent planes SHOULD be distinguishable through tone, boundary, geometry or elevation. If a reference screenshot looks like one uninterrupted near-white sheet, review its hierarchy before shipping. Do not impose a rigid percentage cap on white pixels; dense documents, accessibility modes and content-specific layouts are valid exceptions.
- **Theme parity:** Apply the equivalent tonal-hierarchy principle to dark schemes without turning every plane pure black. Never sacrifice readable contrast, reduced-transparency behavior, or forced-colors semantics to meet a visual-style target.

**Review prompt:** Does this screen still communicate Canvas / Surface / Lens hierarchy, grouping and actionable emphasis with its accent temporarily hidden? Is each white area intentional rather than simply an unstyled default?

## 5. Appearance and precedence

**Founder-directed application default (2026-10-29):** As GoreeCloud's founder, I require every GoreeCloud application to start in **Light** when there is no valid saved user appearance choice, regardless of the host's current light/dark preference. Every application must permit the user to switch appearance **at any time in Settings**; explicit Light or Dark selections must be honored and persisted. **Auto / Follow system** is permitted as a user-selectable option, **not** the automatic first-run choice. Resetting or clearing appearance returns to Light. The requirement applies to all supported clients and is detailed in [the product theme policy](PRODUCT_THEME_POLICY.md#mandatory-appearance-baseline--founder-direction-2026-10-29).

**Appearance selection precedence:** A valid saved explicit user selection takes priority. Light and Dark remain fixed despite OS appearance changes; an explicitly selected Auto resolves to the OS appearance and follows changes. When no valid selection exists, use the **Light** GoreeCloud baseline—not the OS appearance. Accessibility-related system requirements (including forced colors and increased contrast) continue to govern applicable accessibility rendering and are not diminished by a user appearance choice. Product accent suggestion and color-personality precedence remain separately defined by the product theme policy.

**Current-state distinction (2026-10-29):** The experimental browser implementation still uses `GC_THEME_DEFAULTS.mode = 'auto'` in [`src/gc-theme-runtime.mjs`](../src/gc-theme-runtime.mjs), and the reference UI's [`src/main.js`](../src/main.js) resolves an unset mode from the host appearance. This is an existing implementation gap, not compliant default behavior. Runtime changes, consumer migrations, and tests are still required before implementation claims can be made.

User-selectable appearance and accessible system presentation have distinct precedence as specified above. Accessibility overrides are *orthogonal*: increased contrast, reduced transparency, reduced motion, larger type, color-filter support, forced colors. Never infer accessibility needs based on appearance alone.
- **Light:** bright Canvas, opaque information Surfaces, restrained shadow; darker primary actions.
- **Dark:** non-black near-neutral Canvas, raised Surfaces slightly lighter than resting, luminous but desaturated primary, distinct edges.
- **Auto:** an *explicit opt-in* to follow host appearance changes live while preserving user-selected palette; explicit Light/Dark preferences persist until changed or cleared, and clearing returns to Light.
- **High contrast:** stronger outlines, opaque Lens, more prominent focus indicator, no pastel-on-pastel text.
- **Quiet premium:** lower chroma (0.75–0.85 multiplier), reduced gradients, standard motion.
- **Signature premium:** default chroma, wider but still bounded highlights, expressive entrance motion.
- **Atelier premium:** editorial headings and tactile tonal surfaces, reduced ambient effects, no contrast regressions.
- **Media immersive:** dimmable Lens/clear controls only over photos/video; app data panels remain Surface.

## 6. Transparency and compositing
**Material modes**: auto, translucent, solid. Auto resolves to solid if OS/user asks for reduced transparency/forced colors, if unsupported, or when content backdrop is unpredictable.
- Regular Lens: reference blur radius 24px; fill compositing begins around 0.76 light and 0.82 dark, but MUST increase opacity when required for contrast.
- Clear Lens: only on short-lived media chrome; backdrop may need a localized 35% dark scrim for bright imagery. Text-on-clear without measured contrast is forbidden.
- Boundary: 1px bright highlight on top/leading edge and muted outline beneath; shadows indicate separation, not volume illusion.
- Never blur critical text, error messages, keyboard focus regions or content panels to imply hierarchy.
- In forced-colors: use system Canvas/CanvasText/ButtonFace/ButtonText/Highlight/HighlightText; disable background-image decoration and backdrop filters.
- Gradients: ambient Canvas gradient limited to very low contrast; decorative light spots cannot create contrast failure or reduce legibility.

## 7. Component color mapping
| Component | Default | Selected/emphasis | Feedback |
|---|---|---|---|
| Primary button | primary/onPrimary | pressed overlay on role | loading retains label and accessible busy |
| Secondary button | secondaryContainer/onSecondaryContainer | state overlay | no semantic accent shift |
| Quiet button | transparent/onSurface | selection role | visible focus ring |
| Text field | surface/onSurface + outline | outlineStrong + focusRing | danger + readable helper copy |
| Card | surface/onSurface | subtle primaryContainer border / selected indicator | colored status icon **and text** |
| Navigation | Lens/regular + onSurface | selection container + indicator | focus independent of selection |
| Banner | semantic container/onContainer | not applicable | icon + severity word |
| Chart | categorical color ramp with distinct markers | selected series outline | shape/label equivalent |
A disabled element uses neutral roles and opacity only if composited contrast and discoverability remain adequate. Active and selected are not synonyms.

## 8. Theme API and persistence
Canonical shape: theme = {appearance: 'auto'|'light'|'dark', palette: 'iris'|'lagoon'|'ember'|'moss'|userSeed, character: 'quiet'|'signature'|'atelier', material: 'auto'|'solid'|'translucent', density: 'comfortable'|'compact'|'spacious', contrast: 'system'|'standard'|'high'}. Validate before applying. OS theme changes don't override explicit user appearance; changes MUST update visible components atomically, without flashing an unstyled theme on load.

## 9. Validation matrix
Every starter palette x light/dark x material solid/translucent x standard/high contrast. Verify primary and status on-pairs, text on every surface, outlines vs adjacent surfaces, focus ring, disabled vs enabled, and data-viz legends. Sample wallpaper extremes: black, white, high-frequency photograph, saturated red/blue, low-contrast beige. Record actual composite pixel colors rather than checking only source RGBA hex.

## 10. Working seed generator (experimental)
The repository includes [src/gc-color-engine.mjs](../src/gc-color-engine.mjs), an original pure JavaScript OKLCH conversion/gamut-mapping engine for explicit #RRGGBB color seeds. It generates five tonal families and assigns readable on-colors with a minimum 4.5:1 body-text check, with a safe black/white fallback. The [v1 reference lab](../lab/v1.html) can preview a custom user-supplied color locally. It is **not** Google's proprietary/HCT algorithm; it does not read wallpapers. Contrast is checked for a sampled seed set by unit tests, but non-text roles, color-deficiency experience, perceptual quality and real-image overlays need product review before production use.
