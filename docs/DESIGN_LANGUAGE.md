# GoreeCloud UI (GC UI) — Design Language v0.1

**Design-standard status:** **Active founder-approved GoreeCloud UI design and UX standard**, effective November 3, 2026. The canonical GoreeCloud Drive `GoreeCloud/Projects/GoreeCloud UI/DESIGN-LANGUAGE-AND-100-UI-UX-PRINCIPLES.md` is the authoritative full 100-principle reference; this repository page is a compact implementation-facing guide, not a replacement for that standard.

**Implementation maturity:** The current `0.2.0-alpha.1` workspace and experimental component demos remain alpha. Separately released **Stable Foundations 1.0.1** covers only its explicitly shipped token, color and theme-control contract. An active design standard does not certify consumer migration, production readiness or accessibility acceptance. Verified repository tokens, component APIs and governance controls remain the code-level contract until formally reconciled.

## 1. Identity

**Name:** GoreeCloud UI (short form: GC UI). This is the canonical public full name; "GoreeCloud User Interface" may explain the acronym but is not the preferred full product name.

**Mandatory Integrated Platform System:** GC UI is GoreeCloud's sole designated design and experience authority. The current founder requirement has five MIPS: GoreeCloud UI, GoreeShield, Wardveil, GoreeCloud Identity and GoreeCloud Mesh. See [MIPS classification](DESIGN_SYSTEM_SUCCESSION.md#goreecloud-ui-as-a-mandatory-integrated-platform-system).

GC UI is GoreeCloud's **designated permanent successor** to the prior Glaze design system. The target is **one authoritative design language**, never two long-term systems. This implementation remains original: predecessor source, tokens and assets must not be renamed or embedded. The [succession plan](DESIGN_SYSTEM_SUCCESSION.md) tracks still-pending platform-governance and consumer migrations; it does not claim those cutovers have happened.

### Design philosophy

*Clear by default. Consistent by nature. Fluid by design.*

### Promise

*Calm information. Expressive personality. Purposeful depth.*

### Mandatory premium interface standard

**Founder directive — mandatory across every GoreeCloud product and platform (October 31, 2026).**

Every GoreeCloud application, website, dashboard, service interface, and other user-facing product **MUST be beautiful, modern, polished, premium, visually engaging, and eye-catching**. GoreeCloud **does not accept plain, basic, boring, generic, dated, amateurish, unfinished, or merely functional user interfaces**. Meeting feature requirements or passing technical tests alone does not satisfy visual acceptance.

**Founder reinforcement — November 5, 2026 (mandatory).** Every GoreeCloud application must **never** look **overcrowded, basic, boring, plain, colorless, misaligned, or ugly**. Every application **must** look **polished, eye-catching, premium, modern, beautiful, and elegant** throughout its complete user experience. This founder clarification strengthens the existing October 31 premium-interface standard; it is a non-optional design and review requirement, not a claim of existing product compliance.

**Practical interpretation.** Use harmonious, purposeful semantic color rather than colorless austerity or indiscriminate saturation; precise alignment and balanced, breathable spacing rather than cramped layouts; distinct yet readable hierarchy, thoughtfully crafted surfaces, refined typography, and tasteful interaction polish rather than generic default styling. Visually rich must not mean visually busy. Achieve beauty and distinctiveness without sacrificing accessibility, clear navigation, contrast, native-platform fit, responsiveness, security, or performance.

Deliver a distinctive and intentional GoreeCloud experience through strong composition and information hierarchy, refined and readable typography, harmonious semantic color, excellent spacing and alignment, purposeful depth and material treatment, consistent iconography, thoughtfully polished controls, and cohesive interaction feedback. Apply the same standard to navigation, onboarding, dialogs, forms, settings, empty/loading/error states, and responsive layouts rather than polishing only a showcase screen.

**Premium does not mean cluttered.** Visual ambition must coexist with accessibility, legibility, performance, discoverability, responsive behavior, reduced-motion and high-contrast support, and applicable native-platform conventions. Avoid excessive ornament, arbitrary gradients, effects without purpose, or visual complexity that impairs use.

**Acceptance and enforcement:** Review complete interfaces against approved GC UI requirements, founder-provided references, and the applicable product brief. Reject weak placeholder styling, generic uncustomized component-library presentations, and screens that look bland or incomplete. Require appropriate visual improvements, functional/accessibility regression checks, and verification across relevant screen sizes, themes, and states before declaring a design accepted or a release visually ready.

This is a **mandatory design and review requirement**, not a claim that existing GoreeCloud applications already comply. Implementation and migration status must be verified product by product.

### Principles

The following six implementation-facing summaries complement, but do **not** replace, the active founder-approved **100 essential UI/UX principles**. Apply the complete standard to layout, readability, responsive interaction, visual refinement, accessibility, feedback, performance and relevant light/dark/high-contrast and reduced-motion states. The 100 principles are requirements for review and design decisions, **not** a claim that all 100 have been implemented or audited across products.

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
