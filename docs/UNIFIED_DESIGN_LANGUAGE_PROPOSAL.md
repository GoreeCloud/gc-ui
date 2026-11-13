# GoreeCloud UI — Unified Design Language

**Classification:** Founder-supplied proposed design standard for review, November 12, 2026  
**Scope:** GoreeCloud applications, websites, dashboards, and internal interfaces  
**Repository state:** Documentation proposal only; no implementation, acceptance, release, or conformance claim  
**Related authority:** `docs/DESIGN_LANGUAGE.md`, `tokens/gc.tokens.json`, `docs/ACCESSIBILITY.md`, and approved founder design principles. Existing governance remains controlling until explicit reconciliation.

## 1. Vision and philosophy

GoreeCloud UI unifies the ecosystem through premium, accessible, minimalist experiences combining realistic frosted glass, atmospheric illumination, precise geometry, refined typography, and fluid, purposeful motion. Dark atmospheric elegance is a signature creative direction; light appearance is equally supported. Transparency, lighting, movement, and depth must communicate hierarchy, state, and usability, never gratuitous decoration.

**Principle:** Atmospheric elegance meets realistic frosted glass. Every surface is purposeful, every interaction is clear, and every component belongs to one cohesive ecosystem.

## 2. Materials and glass hierarchy

Glass must convey realistic dimensional integration: selective backdrop blur, controlled opacity and saturation, diffused highlight/refraction cues, fine illuminated edge borders, low-noise shadows, and coherent transitions among transparent, translucent, and opaque states.

| Proposed visual role | Intended use | Existing alpha mapping; review required |
| --- | --- | --- |
| Base Glass | Sidebars, persistent navigation | Cloud Lens where appropriate; Cloud Surface where readability requires |
| Elevated Glass | Cards, floating controls and toolbars | Cloud Surface / Cloud Lens depending on actual elevation |
| Overlay Glass | Menus, popovers and dialogs with stronger obscuration | Cloud Lens plus scrim |
| Solid Surface | Dense content, sensitive content, inaccessible or unsupported transparency | Cloud Surface / Lens solid fallback |

These are proposed *visual roles*, not an immediate renaming of the existing Cloud Canvas / Cloud Surface / Cloud Lens implementation. Surface material must never reduce contrast or responsiveness.

## 3. Appearance, color, and atmospheric light

**Dark signature direction:** navy, midnight blue, charcoal and rich blue-gray foundations; subtle electric-blue selected/focus accents, indigo/violet undertones, muted metallic secondary tones, diffused radial illumination and delicate white glass-edge reflections.

**Light direction:** soft white, pearl and cool-gray foundations; tinted frosted-white surfaces, restrained cool accents, legible typography, delicate shadows and atmospheric gradients.

**Lighting behavior:** establish a consistent plausible light direction; use diffuse ambient depth, avoiding dominating neon, gradients or effects that compete with content. Increase luminosity only to signal meaningful state. All production values come from approved semantic tokens.

**Governance conflict requiring decision:** The currently documented `docs/DESIGN_LANGUAGE.md` explicitly states **no mandatory global/default/system/brand hue**, and individual apps may choose any appropriate hue. Therefore the above blue direction is *a signature aesthetic proposal, not a compulsory global color or a silent repeal of the founder color-freedom rule*. Existing Iris, Lagoon, Ember and Moss alpha presets remain optional. Founder's approval of palette governance and verified brand color values is required before changes to canonical token roles or defaults.

## 4. Geometry, typography and icons

Use rounded windows, panels and containers; proportional corner-radius relationships; pills for suitable primary buttons, segmented controls and toolbars; softly rounded inputs; understated dividers and borders; purposeful whitespace and disciplined elevation. Shared radius/spacing/border/elevation tokens govern.

Use crisp, high-legibility sans-serif typography with semibold headings, measured line heights, consistent vertical rhythm, high-contrast primary text, legible secondary text and responsive scaling. Inter- or SF Pro-inspired aesthetics are permissible only with platform and font licensing compatibility; do not bundle proprietary fonts without rights. Prefer the existing system-font token unless a reviewed change is approved. Icons use coherent minimalist outlines, stroke weights, optical alignment and sizes; state cannot be conveyed by color alone.

## 5. Components and interaction states

Buttons, inputs, form elements, navigation, contextual toolbars, menus, popovers and dialogs must have predictable, legible default, hover, pressed, focused, selected, loading, disabled, error and destructive states. Strong focus indication, associated labels, validation text, touch targets, keyboard semantics, focus return, predictable Escape/dismissal and screen-reader announcements are required. Primary and secondary actions must be distinct. Visual feedback must never imply an operation succeeded before its backing result is confirmed.

## 6. Motion and depth

Motion supports spatial continuity, hierarchy and immediate feedback: refined fades, restrained spring dynamics, selection movement, minimal scale and elevation, and coordinated opacity/position effects. **150–250 ms is the proposed typical microinteraction interval**, not an instruction to overwrite existing `fast=120ms`, `base=220ms`, `slow=380ms` tokens without testing. Longer sequences must be justified by comprehension. Respect reduced-motion preferences.

Depth layers are, in order: atmospheric backdrop; stable readable content; light navigation/supporting surfaces; elevated contextual controls; transient menus/dialogs. Differentiate layers using *combined* opacity, contrast, border, blur, edge highlight and shadow—not shadow alone. Limit stacked blur.

## 7. Layout and platform environment

Use shared spacing scales, purposeful negative space and structured grids. Adapt navigation, controls and content to mobile reach, tablet reflow, desktop density and multiple input methods rather than scaling desktop UIs down. Support safe areas, RTL, zoom, text scaling, high density and different pixel ratios.

Maintain recognizable GoreeCloud identity within native OS conventions. Prefer native translucency/vibrancy and platform-aware windows when actually supported; provide graceful nonblur fallbacks. Rounded desktop/window aesthetics remain subject to actual platform capabilities.

## 8. Accessibility, performance and adaptation

**Target WCAG 2.2 AA** through real consumer-level validation. Test ordinary text and essential UI element contrast, transparent overlays against variable backdrops, keyboard navigation, screen readers, zoom, large text, reduced motion, forced colors, increased contrast, reduced transparency and comfortable targets. Use opaque fallback surfaces whenever glass threatens readability. Never communicate essential information using color, animation or blur alone.

Use bounded, GPU-efficient visual effects; avoid expensive overlapping backdrops, continuous rendering, long transitions or battery-heavy effects. Respect constrained devices and power modes, and verify representative desktop, mobile, web and administrative interfaces.

## 9. Centralized tokens, components and governance

The central design authority must cover semantic appearance tokens; materials, opacities and blur; typography; spacing, radii and size; lighting, elevation and shadows; motion and easing; iconography; component states; responsive behavior; and platform accessibility adaptations. Version and test all changes; regenerate derived browser/native token resources from one verified manifest; validate consumers across variants. Do not invent final brand hex values or assert that prototypes prove deployed adoption.

## 10. Ecosystem responsibilities

- **GoreeCloud UI — design language:** shared presentation, interaction, accessibility and reusable UI foundations.
- **GoreeCloud Mesh — integration:** connectivity, synchronization and cross-product workflows; UI only presents verified state.
- **GoreeCloud Identity — identity:** authentication, authorization, session and account interfaces; actual enforcement belongs to Identity/backends.
- **GoreeShield — privacy:** consent, transparency, retention, data-sharing and privacy controls; visual indicators must reflect real enforcement.
- **Wardveil — cybersecurity:** threats, alerts, protection and incident workflows; visuals do not themselves detect or block threats.

Visual consistency must not blur the distinct operational responsibilities of the mandatory integrated platform systems.

## 11. Signature qualities and final principle

**Premium, minimal, atmospheric, translucent, fluid, modern, immersive, elegant, consistent, accessible and timeless.**

**GoreeCloud UI is atmospheric elegance expressed through realistic glass, intelligent layering, precise geometry and fluid interaction.** Its identity depends on coherence, restraint and quality, not the quantity of visual effects.

**One ecosystem. One design language. One cohesive experience.**

## 12. Adoption and acceptance gates

1. Reconcile blue-signature direction with the current founder-approved **no mandatory global hue** rule; preserve user-defined and app-defined choices.
2. Map proposed four-role glass vocabulary to the current three-layer implementation without needless breaking renames; specify solid fallbacks and accessibility behavior.
3. Add approved semantic material and lighting tokens only after values and behavior are reviewed; regenerate web and native exports and run deterministic token checks.
4. Validate visual contrast against variable glass backdrops and complete light/dark, forced-colors, reduced-transparency and reduced-motion matrix tests.
5. Validate responsive layouts, touch, keyboard and assistive technology on representative platforms and devices.
6. Confirm compatibility, migration plans, screenshots and cross-product review before promotion to an approved standard or stable release.

**Traceability:** This document records the founder-provided 15-section design-language specification as a faithful engineering-oriented standard proposal. It intentionally separates proposed appearance rules from the verified 0.1.0-alpha.0 token implementation and existing authority. No implementation or deployment is implied.
