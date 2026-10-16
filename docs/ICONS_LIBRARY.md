# GC UI Glyph Starter Library — v1 candidate

GC UI's iconography uses a distinct optical construction: 24×24 viewBox, 20×20 nominal drawing field, 1.75-unit stroke, round caps/joins, and consistent visual weight. Names are stable semantic concepts, not copies of Apple SF Symbols or Material Icons.

## Implemented outline glyphs
`check`, `close`, `search`, `arrow-right`, `arrow-left`, `layers`, `spark`, `sliders`, `plus`, `minus`, `warning`, `info`.

Source: [assets/gc-glyphs.svg](../assets/gc-glyphs.svg). Preview: [Components Lab](../lab/components.html#glyphs). **Current status:** twelve experimental outline SVG symbols. Filled variants, small-size redrawing, all planned icon metaphors, and platform adapters are not yet complete. The SVG uses original geometries and no third-party icon font.

## Use
```html
<svg width="24" height="24" aria-hidden="true">
  <use href="/assets/gc-glyphs.svg#gc-search"></use>
</svg>
<button type="button" aria-label="Search">
  <svg width="24" height="24" aria-hidden="true">
    <use href="/assets/gc-glyphs.svg#gc-search"></use>
  </svg>
</button>
```
If an icon supplements visible text, mark the image decorative. If it is the only visible label in a button, name the **button** programmatically. Don't use `title` alone as the accessible name. Do not use emoji as a substitute.

## Rules
- Use `currentColor` to inherit a matching semantic foreground role.
- Only directional metaphors reflect in RTL; explicitly choose the directional variant instead of blindly mirroring all SVGs.
- No inline script, foreignObject, external image references, proprietary fonts, embedded raster assets or network dependencies.
- At 16px, remove minor strokes in a dedicated small-size drawing; do not blindly compress complex 24px glyphs.
- A filled counterpart must preserve symbol recognition and optical bounds.
- Non-text contrast target: 3:1 for necessary affordances and state indications. Color must not be the sole signal.
- Export name and icon ID are stable within the major version; deprecated replacements require mapping and release notes.

## Open visual review
Raster rendering at 16/20/24/32px, baseline consistency in platform fonts, RTL examples, and filled/outlined matched pairs require a deliberate visual QA pass. Unit tests enforce structural constraints but cannot certify visual quality.
