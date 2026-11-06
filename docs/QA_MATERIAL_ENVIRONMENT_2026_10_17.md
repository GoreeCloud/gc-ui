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


## November 6, 2026 — verified desktop lens/content occlusion repair candidate

**Starting point:** 27-screen Chromium axe evidence from [PR #203 quality run 42308126579](https://github.com/GoreeCloud/gc-ui/actions/runs/42308126579) lists the Material Environment Ambient description as one **incomplete possible-obstruction** node. Inspecting its actual 1440px light full-page capture confirms the separately styled **Temporary lens** visually covered the Ambient description. A focused local browser probe of the unchanged source at `476eab15f5ea0dcd3ca24a7a2732ee72bcd2f8d5` measured conservative text/actual-backdrop minimum **1.4388:1**, while 320px light and 375px dark had **5.3943:1** and **7.6394:1** respectively. This is a real scoped layout defect, not a claim that all axe inconclusives are confirmed failures.

**Correction:** In `lab/environment.css`, replace the desktop absolute-positioned material lens with an explicit **second grid row** spanning both columns, end-aligned on desktop and start-aligned at the established compact breakpoint. The two content columns remain intact and the lens cannot cover the hero, the tonal/ambient side cards or their text. The fix changes no design tokens, JS controller, package APIs, release artifacts or deployment configuration.

**Local browser validation:** A new 8-case Playwright regression runs in **Chromium 8/8** and **Firefox 8/8** on 320px light, 375px dark, 768px RTL, 901px breakpoint, 1024px dark, 1440px light, 1440px dark and 1440px forced-colors. It requires an in-flow lens, at least 8px clearance below both card columns, no card/text/hero overlap, an in-bounds lens, no document horizontal overflow, and selected ambient paragraph pixel-backdrop ratio **≥4.5:1** in the seven non-forced variants. The repaired 1440px light ratio is **5.3943:1** in Chromium; the 375px dark sample remains **7.6394:1**. Captured actual preview screenshots were inspected for mobile light, desktop light and desktop dark composition. The test attaches per-case PNG plus geometry/contrast JSON to the normal browser artifact.

**Important limitation:** In OS forced-colors mode the browser ignores the sampler's temporary transparent CSS text ink, yielding a false 1:1 ratio even with readable system-colored text. That variant validates real layout, focus-visible review surface and active forced-colors media only; it **does not claim a measured forced-colors contrast ratio**. The sampled text-free backdrop minimum is not exact antialiased glyph-stroke contrast. The remaining axe incompletes, other whole-screen visual paths, localization, human assistive-technology/device review, and Stable/Seal acceptance remain OPEN. **Hosted exact-head CI and postmerge source status are pending for this candidate**; do not assert a merge or release from this local evidence.
