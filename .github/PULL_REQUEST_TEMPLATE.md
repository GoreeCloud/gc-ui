# GoreeCloud UI change review

## Purpose and scope

<!-- Describe what changed, why it was necessary, and which products/screens/platforms are affected. Distinguish design proposals from implemented code. -->

## Mandatory quality review

<!-- If this change does not affect a user-facing interface, state 'No UI change' here and mark UI-specific items N/A with a reason; do not claim a visual review you did not perform. -->

> Every GoreeCloud product must be **beautiful, modern, polished, premium, distinctive, and eye-catching**. Plain, basic, boring, generic, or merely functional interfaces do not meet acceptance. See the [GoreeCloud premium interface standard](https://github.com/GoreeCloud/gc-ui/blob/main/docs/DESIGN_LANGUAGE.md#mandatory-premium-interface-standard) and [visual acceptance gate](https://github.com/GoreeCloud/gc-ui/blob/main/docs/COMPONENTS.md#mandatory-visual-acceptance-gate).
>
> **Mandatory founder clarification (November 5, 2026):** Reject overcrowded, basic, boring, plain, colorless, misaligned, or ugly interfaces. Require polished, eye-catching, premium, modern, beautiful, and elegant presentation across all affected states, without sacrificing readability or accessibility.
> A checked box is a contributor attestation, **not** independent proof of release readiness. Do not claim platform-wide compliance from one screen.

- [ ] I assessed the changed UI against founder-provided visual references, the product brief, and the approved GoreeCloud UI design language.
- [ ] Visual hierarchy, typography, semantic color, spacing, alignment, depth, iconography, and controls are intentional and premium—not uncustomized template styling.
- [ ] I reviewed all affected navigation, dialogs, forms, menus, empty/loading/error states, and interaction feedback—not only a marketing or showcase view.
- [ ] I verified relevant narrow/mobile, tablet, and desktop layouts; light/dark presentation; zoom; and relevant high-contrast/reduced-motion behavior.
- [ ] I checked keyboard operation, focus visibility, accessible labels, screen-reader semantics where applicable, contrast, loading behavior, and basic performance.
- [ ] All visible controls perform meaningful actions. I did not present placeholders, mockups, or previews as implemented functionality.
- [ ] I reviewed current rendered screenshots or other reproducible UI evidence and corrected visible quality issues; untested states and deviations are documented.
- [ ] I explicitly checked for cramped information density, misalignment, overly plain or colorless styling, visual clutter, and unfinished aesthetics; I addressed each issue with cohesive color and refined, accessible composition.
- [ ] I ran relevant build, test, lint, accessibility, and regression checks, or disclosed why each could not run.

## Mobile-screen review (only if the PR changes a mobile screen or journey)

Use the [GC UI mobile screen design and QA workflow](https://github.com/GoreeCloud/gc-ui/blob/main/docs/MOBILE_SCREEN_DESIGN_QA.md). For a non-mobile or non-UI PR, write **N/A — no mobile UI change** and skip this subsection.

- [ ] I checked the full changed journey, including Back/Up, overlays, system keyboard, interruption/recovery, and applicable platform navigation semantics.
- [ ] I reviewed applicable empty/loading/error/offline/unsaved/permission states and recorded those not exercised.
- [ ] I assessed native controls, GC UI token/component usage, theme and text-scale behavior, and real rendered mobile UI.
- [ ] I recorded any available full-motion walkthrough or explicitly marked motion/device evidence **Not tested**.
- [ ] I documented actual accessibility, performance and privacy checks without inferring unmeasured or untested compliance.

**Mobile journey and tested platform/device (or N/A):**

**Back/Up, input, lifecycle and state evidence (or Not tested):**

**Motion/video and performance measurements (or Not tested):**

## Evidence

<!-- Attach or link before/after screenshots from actual builds, relevant devices and viewport sizes, tests, and accessibility results. Do not include credentials or private user data. -->

**Screenshots/rendered evidence:** 

**Validation commands and results:** 

**Affected platforms, themes, and states checked:** 

**Known limitations, deviations, and follow-up work:**

<!-- Leave items unchecked when not verified. A reviewer should not approve a premium visual acceptance claim without supporting evidence. -->
