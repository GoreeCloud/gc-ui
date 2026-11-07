# GoreeCloud UI (GC UI) — Design Language v0.1

**Design-standard status:** **Active founder-approved GoreeCloud UI design and UX standard**, effective November 3, 2026. The canonical GoreeCloud Drive `GoreeCloud/Projects/GoreeCloud UI/DESIGN-LANGUAGE-AND-100-UI-UX-PRINCIPLES.md` is the authoritative full 100-principle reference; this repository page is a compact implementation-facing guide, not a replacement for that standard.

**Implementation maturity:** The current `0.2.0-alpha.1` workspace and experimental component demos remain alpha. Separately released **Stable Foundations 1.0.1** covers only its explicitly shipped token, color and theme-control contract. An active design standard does not certify consumer migration, production readiness or accessibility acceptance. Verified repository tokens, component APIs and governance controls remain the code-level contract until formally reconciled.

## Founder clarification — November 6, 2026: color freedom and floating mobile navigation

**Owner decision, effective now:** Neither GoreeCloud nor GoreeCloud UI has an official default color, mandated color family, or required operating-system color. **Any application, service, wallpaper, icon, illustration, or other GoreeCloud surface may choose any color**, independently of other products and artworks. Iris, Lagoon, Ember, Moss, Ocean and Neutral in existing alpha/stable code are optional, historically versioned example presets and technical fallbacks, **not** GoreeCloud brand colors. Existing published Foundations 1.0.1 fallback values remain byte-stable for compatibility; a fallback when no preference exists is not a mandatory identity color. The approved Aperture Weave artwork retains its authored colors without obligating other apps or icons to use them.

**The common design language governs quality, not hue.** Any color must still support semantic foreground/background roles, focus, errors, success and warning meanings, readable WCAG contrast, forced-colors and light/dark contexts. Do not turn a demo palette, device wallpaper, system accent or one app's color into an ecosystem default. Independent multicolor artwork is welcome.

**Mobile application rule:** All primary mobile app navigation bars are **floating bottom docks**, detached from screen edges, respecting device safe areas and on-screen keyboards. The top bar contains identity, context, search and page actions, not a second primary navigation strip. Content tabs, breadcrumbs, browser address entry, system permission/navigation surfaces, temporary sheets and OS controls retain proper non-primary semantics. Preserve minimum 44px targets, named landmarks, active state, focus, touch, RTL, zoom, reduced motion/transparency and footer clearance.

**Acceptance:** The policy applies across GoreeCloud now, but each app and reference lab requires a separate source audit, migration, rendered screenshot and target-device verification. A shared CSS pattern does not certify all mobile apps. The founder also considers the current GC UI insufficiently premium; improve actual screens through screenshot-led iteration rather than assuming an approved logo makes the interface beautiful.

## 1. Identity

**Name:** GoreeCloud UI (short form: GC UI). This is the canonical public full name; "GoreeCloud User Interface" may explain the acronym but is not the preferred full product name.

**Mandatory Integrated Platform System:** GC UI is GoreeCloud's sole designated design and experience authority. The current founder requirement has five MIPS: GoreeCloud UI, GoreeShield, Wardveil, GoreeCloud Identity and GoreeCloud Mesh. See [MIPS classification](DESIGN_SYSTEM_SUCCESSION.md#goreecloud-ui-as-a-mandatory-integrated-platform-system).

GC UI is GoreeCloud's **designated permanent successor** to the prior Glaze design system. The target is **one authoritative design language**, never two long-term systems. This implementation remains original: predecessor source, tokens and assets must not be renamed or embedded. The [succession plan](DESIGN_SYSTEM_SUCCESSION.md) tracks still-pending platform-governance and consumer migrations; it does not claim those cutovers have happened.

### Design philosophy

*Clear by default. Consistent by nature. Fluid by design.*

### Promise

*Calm information. Expressive personality. Purposeful depth.*

### Mandatory premium interface standard

**GoreeCloud UI — Mandatory Premium Visual Excellence Standard**  
**Status:** Mandatory founder directive  
**Effective:** November 5, 2026  
**Scope:** All GoreeCloud applications, websites, dashboards, and user-facing interfaces.

**Background:** This November 5 founder directive reinforces the existing mandatory October 31, 2026 premium-interface requirement. It establishes a visual-design acceptance condition; it does not certify current application compliance or change implementation-level token and component contracts.

#### Non-negotiable design requirement

As the founder of GoreeCloud, **I require every GoreeCloud application to always present a polished, eye-catching, premium, modern, beautiful, and elegant user interface.** A merely functional, technically correct screen does not satisfy this requirement.

GoreeCloud interfaces **must never appear**:

- Overcrowded, cramped, or visually overwhelming.
- Basic, boring, plain, or generic.
- Colorless, lifeless, or visually unappealing.
- Misaligned, inconsistent, or poorly organized.
- Ugly, amateurish, unfinished, or outdated.

#### Mandatory design expectations

Every interface **must demonstrate**:

- Intentional visual composition and a clear, compelling information hierarchy.
- Harmonious, expressive, purposeful semantic color, including accessible theme variants.
- Precise alignment, balanced and breathable spacing, and controlled content density.
- Refined, readable typography and attractive, purposeful surfaces.
- Cohesive components, consistent iconography, distinctive but restrained visual character, and thoughtfully polished interactions.
- Appropriate states throughout navigation, onboarding, forms, dialogs, settings, empty/loading/error views, and responsive layouts.

**Visual richness must never become clutter. Elegant simplicity must never become blandness.** Avoid both indiscriminate effects and sterile defaults. Premium aesthetics must coexist with **usability, accessibility, responsiveness, readability, performance, and native-platform conventions**. Approved GC UI semantic tokens and components remain the implementation contract; use purposeful gradients, depth, translucency, and motion only where they improve the experience.

#### Enforcement and visual acceptance

This standard is **mandatory throughout design, development, review, and visual acceptance**. For each affected interface, reviewers and implementers must:

1. Assess the actual rendered interface against the founder's directions, relevant product references, and current GoreeCloud UI requirements; inspect entire screens, not only isolated components or mockups.
2. Check composition, color, typography, alignment, spacing, density, surfaces, component coherence, and interaction states, including relevant viewport sizes, light/dark themes, and platform contexts.
3. Check usability, readability, accessibility, keyboard and touch operation, responsive behavior, and performance alongside aesthetics.
4. **Withhold visual-design acceptance** when any material expectation is unmet; improve the actual interface and re-evaluate it before acceptance.
5. Retain proportionate rendered before-and-after evidence and the required functional, regression, and accessibility verification. Documentation, mockups, source code, or an untested visual description alone do **not** establish compliance.

This is a mandatory requirement for all GoreeCloud-controlled user experiences, **not a statement that existing products are already visually accepted, deployed, or compliant**. Product-by-product acceptance remains evidence-based.

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

- **Palette seeds** supply brand / on-brand / brand-container / on-brand-container colors. Optional compatibility examples: Iris, Lagoon, Ember, Moss; none is an ecosystem default or required product hue.
- **Semantic roles** determine usage: `canvas`, `surface`, `surface-tonal`, `text`, `text-soft`, `outline`, `positive`, `negative`, `lens-fill`, etc.

Mode is independent of palette: each accent works in light or dark appearance. The current alpha has optional curated presets and an existing arbitrary custom seed engine, not automatic wallpaper or image extraction. Full tonal palette generation is planned. Do not describe these four seeds as a Material 3 algorithm implementation.

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

**Inspirations:** Apple's public Liquid Glass hierarchy guidance and Google's Material You/M3 personalization and semantic color roles. **GC UI originals:** the three named layers, token prefix, optional demo presets, alpha mark, component styling, and demonstration composition. Any future native platform support should preserve GC UI semantics and use appropriate system primitives.
