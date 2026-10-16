# GC UI — Design Language v0.1

**Status:** Working alpha foundation (16 October 2026)

## 1. Identity

GC UI exists as a distinct GoreeCloud design language. It is **not Glaze UI**, does not incorporate Glaze UI as a base, and will not rename Glaze UI assets as GC UI. A separate migration plan may eventually replace Glaze UI, but GC UI development must remain self-contained.

### Promise

*Calm information. Expressive personality. Purposeful depth.*

### Principles

1. **Content before effect** — legibility and comprehension outlast decoration.
2. **Personal, not random** — a chosen color is translated into stable semantic roles.
3. **Depth communicates function** — elevation distinguishes navigation and ephemeral controls from content.
4. **Fluid continuity** — smooth form, pacing, and transitions connect related states.
5. **One system, many contexts** — adapt composition to screen size, input mode, and accessibility preferences.
6. **Original by design** — learn from platform conventions without reproducing their proprietary visual assets or libraries.

## 2. Material architecture

| Layer | Name | Responsibility | Defaults | Examples |
| --- | --- | --- | --- | --- |
| 0 | **Canvas** | Backdrop and spatial context | opaque, quiet, low visual noise | screen background, workspace |
| 1 | **Surface** | Readable content hierarchy | solid or tonal; clear outlines | cards, sheets, form containers, lists |
| 2 | **Lens** | Floating action/navigation controls | limited translucency, edge highlight, safe fallback | sidebar, floating toolbar, navigation dock |

Lens is a **functional material**, not a global card style. Limit the number of Lens surfaces on a given screen. Do not place long reading passages on unconstrained transparency. Focus rings, text color, and selected indicators must remain intelligible with Lens disabled.

Apple's public HIG describes Liquid Glass as a functional navigation and control layer, and advises keeping it out of the ordinary content layer. GC UI treats this as an important hierarchy lesson, not a mandate to copy the native effect exactly.

## 3. Color

GC UI employs two connected layers of color definitions:

- **Palette seeds** supply brand / on-brand / brand-container / on-brand-container colors. Starter seeds: Iris, Lagoon, Ember, Moss.
- **Semantic roles** determine usage: `canvas`, `surface`, `surface-tonal`, `text`, `text-soft`, `outline`, `positive`, `negative`, `lens-fill`, etc.

Mode is independent of palette: each accent works in light or dark appearance. The current alpha uses **curated palettes**, not automatic wallpaper or image extraction. Full tonal palette generation is planned. Do not describe these four seeds as a Material 3 algorithm implementation.

In code, semantic variables take the `--gc-` prefix, e.g. `--gc-brand` or `--gc-surface`.

### On-color rule

Foreground colors must use their paired `on-*` role instead of guessing black or white. In particular, dark-mode primary controls use dark foreground text on a lighter accent background.

## 4. Shape and spacing

GC UI's default corner progression is **12 / 18 / 26 / 36 / full**. Use smaller radii for inputs and compact controls, medium radius for floating actions, and larger radii for major regions. The relationship between nested corners should be preserved: the outer corner should usually equal the inner corner plus its inset.

Spacing is based on four CSS pixels. Core values: 4, 8, 12, 16, 20, 24, 32, 40, 48, and 64. Defaults are comfortable; a compact density configuration is reserved for information-rich desktop layouts.

## 5. Typography

Use native system sans-serif faces where available, with an accessible fallback stack. Let variable type widths and weights evolve per platform. Starter roles:

| Role | Approximate CSS size | Function |
| --- | --- | --- |
| Display | 44–70px fluid | expressive, short phrases |
| Title | 22–28px | section hierarchy |
| Heading | 16–20px | content groups |
| Body | 15px | primary reading |
| Support | 11–13px | short helper text |
| Label | 10–12px | controls / tags; avoid for long text |

Minimum sizes in production interfaces must be reviewed per context, especially at high zoom. Don't rely on tracking or uppercase text to replace labels.

## 6. Motion

Motion begins with utility. Three durations: `fast` 120ms (feedback), `base` 220ms (states), `slow` 380ms (entry or reconfiguration). Standard easing `[.2,.8,.2,1]`; expressive easing `[.16,1,.3,1]`. Never delay a task for animation. With `prefers-reduced-motion`, remove nonessential animation and scrolling.

## 7. Interaction

- Minimum comfortable interactive height: **44 CSS px** in alpha defaults.
- Visible keyboard focus and semantic state changes are mandatory.
- Use native form controls where possible and label them explicitly.
- Emphasized, secondary, outline and quiet actions form one hierarchy.
- Navigation must reflect location (e.g. `aria-current="page"`).
- Any transient status should not steal keyboard focus.
- Modal dialogs must use focus-management semantics; the reference uses native `<dialog>`.

## 8. Responsiveness

Desktop: a persistent sidebar and content area. Tablet: compress spacing and reorganize content. Mobile: replace the rail with a reachable bottom navigation; stack multicolumn content. Translucent surfaces remain optional. Support pointer, touch and keyboard affordances rather than designing exclusively for mouse input.

## 9. Boundaries and provenance

**Inspirations:** Apple's public Liquid Glass hierarchy guidance and Google's Material You/M3 personalization and semantic color roles. **GC UI originals:** the three named layers, token prefix, curated palette set, alpha mark, component styling, and demonstration composition. Any future native platform support should preserve GC UI semantics and use appropriate system primitives.
