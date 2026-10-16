# GC UI — Typography, Icons & Glyph Construction
**Status:** GC UI geometry and readability standards.

## Typography: families
Native-first system stack; retain the platform's rendering metrics and assistive text scaling. Desktop web default: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif. Android native: Roboto or host-native family. Apple native: SF through system APIs, never bundled/repackaged proprietary font files. Windows: Segoe UI. Use appropriate system fallbacks for Arabic, Indic, Thai, CJK and emoji. Allow locale to choose fonts; never force Latin-specific letter spacing onto connected scripts.

## Type roles (CSS pixel reference at 100% scale)
| Token | Size | Leading | Weight | Tracking | Use |
|---|---:|---:|---:|---:|---|
| displayL | 72 responsive down to 40 | 1.04 | 680 | -0.035em | large, short hero |
| displayM | 52 responsive down to 34 | 1.10 | 660 | -0.03em | campaign title |
| headline | 30 | 1.20 | 650 | -0.025em | screen title |
| titleL | 24 | 1.25 | 620 | -0.02em | section heading |
| titleM | 20 | 1.30 | 620 | -0.01em | cards |
| titleS | 17 | 1.35 | 620 | -0.005em | dialog headings |
| bodyL | 18 | 1.55 | 400 | 0 | editorial body |
| body | 16 | 1.55 | 400 | 0 | content |
| bodyS | 14 | 1.50 | 400 | +0.005em | auxiliary |
| labelL | 14 | 1.35 | 600 | +0.005em | control labels |
| labelS | 12 | 1.30 | 600 | +0.01em | short chips |
| caption | 12 | 1.45 | 450 | +0.005em | timestamps / metadata |

Type MUST respond to OS text size / browser zoom. Clamp display type but do not apply a max that defeats font scaling. Long passages remain 16px or greater by default. Use 60–75ch measure; split dense prose into meaningful headings. Avoid font-weight 300 on text over a Lens. Numerical tables: font-variant-numeric: tabular-nums; aligned decimals; values are localized.

## Typography mechanics
- Heading letter spacing is a starting point; adjust optical kerning for actual font and script.
- Max two type families per view, preferably just one. A distinct editorial face is optional in Atelier but not mandated.
- Use font-weight 600–700 for headings and 400–500 for body; do not use weight alone as the only status cue.
- Truncation requires an accessible full-name path (tooltip, expanded detail or similar). Forms show complete labels and error help.
- Monospaced blocks need horizontal scrolling rather than forced wrapping that corrupts commands.

## Icon language — original GC geometry
**Grid:** 24x24 SVG viewBox, normal content inside 2–22, nominal 1.75 stroke, 2px visual clearance, round caps and joins.  
**Sizes:** 16 compact/support, 20 dense control, 24 standard, 28 prominence, 32–48 illustration-led; when using 16 remove secondary detail.  
**Variants:** outline (idle), filled (active/high emphasis), duotone optional only for oversized illustrations. Filled and outline pair MUST maintain identical center of mass, bounding footprint, and semantic metaphor.  
**Alignment:** position by perceived weight; circles and diagonals may optically overshoot 0.25–0.5 units; visually similar sizes should have equal occupied ink.  
**Stroke:** 1.75px default at 24px; 2px bold; 1.5px for large sparse glyphs. Never blindly scale stroke down below readable rasterization.  
**Motion:** 120–220ms state change; animate opacity/transform or defined paths without distracting rotation loops; honor reduced motion.  
**RTL:** directional icons (back/forward/next) mirror; physical hardware/location icons do not; canonical arrows obey text direction.  
**Labels:** icons supplement text except universally recognizable, frequent actions; every icon-only interactive target has programmatic accessible name.

## Glyph semantic categories
- Navigation: home, back, forward, chevron, search, menu, close, overflow, disclosure, filter.
- Actions: add, edit, remove, share, download, upload, refresh, undo, redo, copy, save.
- System: settings, help, info, warning, success, error, lock, unlock, visibility, notification.
- Media: play, pause, stop, volume, mute, expand, picture-in-picture, captions.
- Data: sort, ascending, descending, calendar, clock, tag, pin, folder, grid, list, table.
- Input: check, minus, plus, clear, keyboard, microphone, pointer, pen, drag-handle.
The list is **semantic coverage**, not a claim that icon vector assets exist. Each production glyph MUST ship with outlined/filled SVG source, stable name, 16/20/24 render fixtures, RTL designation, license record and accessibility example.

## Symbol restrictions
Do not use emoji as the default product icon set: color, shape, and baseline vary wildly across devices. Preserve locally recognizable native platform symbols for OS-specific concepts when appropriate, but don't reproduce restricted third-party artwork. Error icons never rely on red alone; success glyphs pair with words in feedback.

## Asset export
Source: human-editable vector geometry; rendered SVG must include viewBox and should use currentColor unless intentionally multicolored. Use IDs namespaced gc-; strip editor metadata, avoid filters and embedded raster content in basic glyphs. Mark decorative icons aria-hidden=true; interactive icon buttons use an explicit accessible name on their button. Test on light, dark, high contrast and 125%/200% scale.
