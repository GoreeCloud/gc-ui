# GoreeCloud UI — Premium visual quality contract

**Status:** Mandatory design quality requirement. Implementation remains alpha pending evidence.  
**Authority:** Founder-approved GoreeCloud UI design language and 100 UI/UX principles in the authorized GoreeCloud Drive.

## Non-negotiable identity

**Clear by default. Consistent by nature. Fluid by design.**  
**Calm information. Expressive personality. Purposeful depth.**

No GoreeCloud product should ship with a generic, unfinished, flat-by-default or unconsidered interface. Premium does not mean gratuitous glass, ornamental gradients, saturated colors everywhere, animation without meaning, illegible text, or imitation of another brand. Premium requires distinct and coherent polish that survives screen size, workflow density, device capabilities and accessibility preferences.

## Exceptional craftsmanship and rejection of generic design

**Mandatory founder directive (November 14, 2026):** Every GoreeCloud-controlled screen must exhibit exceptional craftsmanship, intentional hierarchy, coherent product character, and distinctive polish. The [authoritative craftsmanship and anti–AI-slop standard](https://drive.google.com/file/d/1IAcE_0j-FGu_qi3nhzfHvDINfuI_lVVR/view) strengthens the existing visual-audit procedure. These requirements apply equally to first-party and imported/rebranded interfaces; implementation, adoption and visual acceptance remain independently verified.

Review the **whole rendered workflow**, not just a marketing hero or a single attractive component:

- **Shell, sidebar and navigation:** Confirm that grouping, active states, collapsed/expanded behavior, labels, icon optical weight, boundaries and negative space are intentional at each supported viewport. No generic administration-rail clone or deserted empty frame should pass through visual review.
- **Typography and composition:** Inspect text rhythm, contrast, line lengths, optical alignment, whitespace, density and primary/secondary emphasis. A default font stack or token library does not by itself prove typographic craft.
- **Controls and states:** Verify focus, hover, pressed, selected, busy, disabled, validation, offline, empty, loading and recovery treatments. A polished default state cannot excuse a degraded or misleading failure state.
- **Purposeful material and motion:** Use Cloud Canvas, Surface and Lens according to their documented roles. Frosted glass and subtle elevation should communicate layering, not cover weak geometry or obscure reading; reduced-effects modes must remain thoughtfully composed.
- **Originality without template churn:** Reject repetitive card farms, interchangeable hero patterns, stock dashboard conventions, decorative glow/gradients, arbitrary glass layering and borrowed styling without a product-specific reason. Reuse canonical components where they fit; do not copy the same visual composition into every product.
- **Legibility and functional honesty:** Reflow across supported phone/tablet/desktop views, window sizes, zoom, input methods, themes and contrast preferences. Every advertised control must have accurate behavior or honest availability feedback under the separate Complete UI requirement.

The term **“AI slop”** describes an unacceptable *design outcome*, not the mere use of generative tools. AI assistance never reduces the required originality, provenance, security, usability or visual acceptance standard. Do not invent a mandatory palette, unapproved logo, arbitrary typeface or unsupported release status while trying to make a design look more premium.

### Visual review evidence and disposition

Before declaring a relevant visual change accepted, record: the **source commit**, exact screens and states inspected, supported viewports/themes/zoom and input conditions, authoritative references, actual rendered evidence, defects with severity and corrective actions, and any untested conditions. Perform a second visual inspection after each material correction. Use the existing professional visual-quality audit standard and its dispositions: **passed**, **passed with documented nonblocking findings**, **failed / correction required**, or **not adequately audited**.

Record visual/design decisions separately from technical evidence. Passing Node tests, Chromium geometry checks, generated screenshots or a CI badge does not by itself prove exceptional craftsmanship, real-device acceptance, screen-reader acceptance, publication or deployment. If the full rendered experience was not inspected, report the gap instead of asserting premium compliance.

A concrete [before/after reference critique](CRAFTED_WORKSPACE_REVIEW_20261117.md)
compares the former empty chromatic screenshot with a composed Wardveil
held-file example across four browser conditions. The example illustrates
reviewable professional art direction and genuine native interactions; it is
**not** an accepted Wardveil UI or evidence that other GoreeCloud applications
have received an equivalent redesign.

## Repeatable quality requirements

1. **Signature hierarchy.** Establish display, title, section, body, supporting and label hierarchy with canonical typography and readable line lengths. Give the primary action clear priority.
2. **Material architecture.** Cloud Canvas is quiet opaque context; Cloud Surface protects reading and interaction; Cloud Lens is reserved for floating navigation or ephemeral controls. Keep essential text on predictable, opaque surfaces.
3. **Expressive without copying.** Derive accents, outlines and material colors from existing semantic tokens. Use original glyphs and compositions, not vendor graphics, fonts or platform clones.
4. **Spatial rhythm and responsive reach.** Honor touch minimums and safe areas. Reflow hero, dense workspace and controls at actual narrow CSS widths; avoid page-level horizontal overflow.
5. **Layering and states.** Polish hover, pressed, focus, selected, busy, disabled, empty and error feedback. Optical alignment, restrained highlight and shadows must communicate hierarchy.
6. **Motion with intent.** Use short, nonblocking transitions that never gate task completion. Remove nonessential movement under reduced-motion preferences; never require ornamental perpetual animation.
7. **Accessible elegance.** Supply reduced-transparency, forced-colors, large-text, keyboard, RTL, and screen-reader alternatives; never hide essential content to preserve an effect.
8. **Functional honesty.** Premium visuals cannot disguise inert controls. Every action must be meaningful, authorized and accurately reported after actual completion.

## Reusable composition API

Core component CSS provides the premium shell, showcase composition, content/visual/floating/metrics elements, editorial overline, metric, and three-up responsive feature tiles. These are shared application primitives, not showcase-only mockups. Dense settings, operating-system utilities and dashboards can remain premium through consistent typography, spacing, focus, refinement and selective depth without adding decorative marketing heroes to every view.

Ambient decoration stays behind opaque content; the floating showcase uses the solid Cloud Lens fallback. All color derives from the canonical semantic variables rather than independent hardcoded accent hex. High contrast, reduced transparency, forced colors, mobile reflow and reduced motion have explicit fallbacks.

### Avoiding the white-card default

Use the opt-in `gc-scene` / `gc-scene__rail` / `gc-scene__header` /
`gc-scene__content` pattern in product shells only when it improves the actual
workflow. Its accented context region and tonal navigation establish identity
without tinting every reading surface. A `gc-context-band` can identify one
important workflow scope and `gc-card--accent` can emphasize one meaningful
item; neither is a license to create a bigger grid of colored cards.

The default white `--gc-surface` in light mode is intentional for readable
content and remains unchanged. **The failure is monotonous composition and
unverified consumer adoption**, not the existence of a white token. Product
teams must provide real source/rendered evidence before claiming this solves
their experience. Avoid a shared forced hue, automatic mass restyling or an
unreviewed global palette replacement.

### Seamless motion and meaningful color

Every GoreeCloud-controlled digital experience must be intentionally
art-directed for smooth feedback, clear state changes, purposeful color-coding
and refined material effects. Reuse the alpha
[motion and effects contract](MOTION_AND_EFFECTS.md) when suitable: real
actions get responsive interaction feedback, state changes retain context,
and positive/warning/negative meanings use semantic roles plus words or icons.
Never add indiscriminate gradients, looping sparkle, hover jitter, invasive
page transitions or inaccessible effects merely to appear premium. Respect
reduced-motion and high-contrast preferences, and make real-browser
interaction and screenshot acceptance separate release evidence.

## Review and acceptance

Review actual application screenshots at mobile, tablet and desktop sizes across supported color appearances and accents. Record source SHA, device/browser version, visual hierarchy, text and nontext contrast, keyboard and touch flows, localization, real 200% and 400% zoom, reduced motion/transparency, forced colors, and screen-reader results. Review the application as a whole, including empty/error/offline states.

Automated checks verify the CSS contracts and some actual Chromium geometry and computed styles. They do not certify aesthetic excellence or accessibility. A generated screenshot proves that the browser rendered something, not that it looks premium.

**Release boundary:** The composition library is alpha. Native OS component parity, actual consumer adoption, signed stable release and complete human accessibility acceptance remain unverified.
