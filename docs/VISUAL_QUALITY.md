# GoreeCloud UI — Premium visual quality contract

**Status:** Mandatory design quality requirement. Implementation remains alpha pending evidence.  
**Authority:** Founder-approved GoreeCloud UI design language and 100 UI/UX principles in the authorized GoreeCloud Drive.

## Non-negotiable identity

**Clear by default. Consistent by nature. Fluid by design.**  
**Calm information. Expressive personality. Purposeful depth.**

No GoreeCloud product should ship with a generic, unfinished, flat-by-default or unconsidered interface. Premium does not mean gratuitous glass, ornamental gradients, saturated colors everywhere, animation without meaning, illegible text, or imitation of another brand. Premium requires distinct and coherent polish that survives screen size, workflow density, device capabilities and accessibility preferences.

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

## Review and acceptance

Review actual application screenshots at mobile, tablet and desktop sizes across supported color appearances and accents. Record source SHA, device/browser version, visual hierarchy, text and nontext contrast, keyboard and touch flows, localization, real 200% and 400% zoom, reduced motion/transparency, forced colors, and screen-reader results. Review the application as a whole, including empty/error/offline states.

Automated checks verify the CSS contracts and some actual Chromium geometry and computed styles. They do not certify aesthetic excellence or accessibility. A generated screenshot proves that the browser rendered something, not that it looks premium.

**Release boundary:** The composition library is alpha. Native OS component parity, actual consumer adoption, signed stable release and complete human accessibility acceptance remain unverified.
