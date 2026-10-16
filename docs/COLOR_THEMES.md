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
| canvas | #F7F8FC | #10131E |
| onCanvas | #20243A | #F2F2FA |
| surface | #FFFFFF | #1D2231 |
| surfaceRaised | #FFFFFF | #252B3D |
| surfaceTonal | #F4F5FA | #292F40 |
| onSurface | #20243A | #F2F2FA |
| onSurfaceMuted | #5F657B | #B3B9CF |
| outline | #CDD1E0 | #747C99 |
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
For final production ship, audit all pairs and run the theme verifier for each curated theme; a table is not evidence of passing WCAG.

## 4. Accent reference palettes
| Palette | Seed | Emotional register | Good for |
|---|---|---|---|
| Iris | #5145D9 | focused, expressive violet | productivity / creativity |
| Lagoon | #087C8D | composed, aquatic teal | dashboards / wellness |
| Ember | #AE4D3F | grounded, energetic terracotta | commerce / lifestyle |
| Moss | #3F744B | natural, reassuring green | planning / environment |
Primary is not the only expressive color. Secondary is contextual; tertiary introduces contrast in controlled doses. Accent coverage guidance: <=15% of an informational view, and no competing multicolor CTA clusters.

## 5. Appearance and precedence
User overrides > accessibility system preference > explicit product configuration > OS appearance > GC UI default. Accessibility overrides are *orthogonal*: increased contrast, reduced transparency, reduced motion, larger type, color-filter support, forced colors. Never infer accessibility needs based on appearance alone.
- **Light:** bright Canvas, opaque information Surfaces, restrained shadow; darker primary actions.
- **Dark:** non-black near-neutral Canvas, raised Surfaces slightly lighter than resting, luminous but desaturated primary, distinct edges.
- **Auto:** follows host appearance changes live while preserving user-selected palette; explicit light/dark preference persists until reset to Auto.
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
