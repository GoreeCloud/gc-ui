# GC UI — Official Identity and Brand Asset Provenance

**Brand owner / source of truth:** [GoreeCloud/branding-assets](https://github.com/GoreeCloud/branding-assets/tree/main/products/gc-ui)  
**Official GC UI identity:** version 1.0.0  
**Canonical publication commit:** `29ea759c167a86390a2b4ff559e5fc40ec7c99a3` (vector sources and catalog)  
**Verified derivative publication commit:** `dd13aad` (PNG/icon derivatives and reproducible export script)

GC UI is its own design language and product identity, designated to **permanently replace** the predecessor Glaze design system. **It is not the GoreeCloud platform symbol and not a relabeling of predecessor artwork.** `GoreeCloud/branding-assets` is authoritative, and local SVG files in this repository are exact synchronized derivatives for standalone hosting, offline documentation, demos, and package consumption.

## Canonical → GC UI consumer mapping

| Branding source | GC UI local derivative | Use | Canonical source Git blob |
| --- | --- | --- | --- |
| `products/gc-ui/app-icon.svg` | `assets/gc-mark.svg` | App icon, favicon, lab branding | `d3d2f4f2ae241e172691de8c8f6bef628331a350` |
| `products/gc-ui/gc-ui-symbol.svg` | `assets/gc-symbol.svg` | Transparent GC monogram | `613dfb1747f251d86a1faa6e12c83836b2a950b7` |
| `products/gc-ui/gc-ui-logo.svg` | `assets/gc-logo.svg` | Light-background lockup | `95a7b63c6928d4e2d79f6afbd41025bc887d7c1c` |
| `products/gc-ui/gc-ui-logo-dark.svg` | `assets/gc-logo-dark.svg` | Dark-background lockup | `9c36aec87107552fa703798a2b09adb610175572` |

## Usage rules

1. Use the canonical icon for launchers, favicons, small navigation identity, and social avatars. Do not embed an alternate G-shaped placeholder.
2. Use the horizontal full-color logo in appropriately wide header/splash contexts, and the outlined reversed logo for dark backgrounds.
3. Keep icon/wordmark proportions and source colors unchanged. Avoid extending official imagery with extra blur, outline, glow, shadow, or logo reinterpretation.
4. For standalone rendering, include informative alternative text as appropriate; if adjacent text already says “GC UI”, the icon image can use `alt=""` to avoid repeating the name.
5. Only reproduce raster/icon versions from the SVG master in branding-assets. Do not independently recolor or redraw consumer artwork.
6. The identity is stable even when the interface uses a user-selected theme accent; the icon does **not** change along with application theme color.
7. Branding authority does not imply product stability, accessibility certification, security, or any other operational claim.

## Checks

`tests/branding.test.mjs` verifies exact source Git blob IDs for all four synchronized SVG files. If the brand master changes, update branding-assets **first**, replace consumer copies from the new canonical files, then deliberately update the pinned blob identifiers here and in the regression test.

The original GC UI component-glyph sprite (`assets/gc-glyphs.svg`) is an independent iconography library and should not be confused with the GC UI identity mark.
