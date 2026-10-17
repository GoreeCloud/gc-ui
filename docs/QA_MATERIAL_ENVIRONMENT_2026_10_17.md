# GC UI Material Environment & Licensed Asset QA — 2026-10-17

**Scope:** GoreeCloud/gc-ui only. Experimental, not a stable release, visual certification or WCAG certification.

## Implemented
- Reusable context-aware material CSS and a small persisted controller that reflects forced-colors, high-contrast, reduced-transparency and reduced-motion.
- Static Canvas lighting, four content contexts, three resolved tonal strengths, illumination off and six non-default material treatments.
- Native, non-autoplay WAAPI presets; optional adapters for MIT-licensed Motion, AutoAnimate and Lottie Web.
- 21 self-hosted original-source SVG icons from seven permissive icon sources, a namespaced derived sprite, exact upstream commit provenance and vendored license texts.
- Material Environment Lab and contextual lighting in the existing Adaptive Shell, driven by active route.

## Source and browser evidence
- npm run check: **93/93 Node tests passed**; token build consistency and package manifest validated.
- Color audit: **722 generated light/dark themes, 7,988 checked opaque color pairs, zero failures**.
- npm run test:e2e:interaction: **43/43 Chromium interaction tests passed**, including context switching, forced-colors suppression, reduced motion and legacy navigation/forms behavior.
- Targeted axe/reflow/visual suite: **27/27 Chromium tests passed**, including environment lab light/dark, compact screens, an axe baseline and dark reading state, 320px/reflow with larger text and RTL.
- Screenshot review performed for desktop light, desktop dark, and mobile at 375px; images stayed in local temporary QA output and are not approved pixel-regression baselines.
- npm pack dry-run: **90 package files**, all 18 required exports present; additionally verifies all seven license notices and all 21 source SVGs are shipped with the sprite.

## Known limitations and next gates
- Third-party adapters are supplied and tested through stubs; actual installed Motion/AutoAnimate/Lottie host projects still require integration testing. No third-party Lottie JSON or animation marketplace content has been imported.
- WCAG automated smoke tests cannot replace manual assistive-technology, zoom, Safari, native Android and iOS, or low-end GPU/power profiling.
- Custom-seed composite background contrast, translated copy, rendered icon weight at 16/20/24/32px, and native platform bindings remain to be reviewed before stabilization.
- Bundled assets represent small opt-in selections, not vendored complete catalogs. Each further asset requires exact license and provenance review.

**Release status remains alpha.** This report records local test evidence for this implementation, not a certification or claim of CI passing on a later deployment.
