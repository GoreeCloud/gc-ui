# GoreeCloud UI — composed workflow design review (2026-11-17)

**Scope:** An opt-in, nonproduction Wardveil *held-file review* UI composition within the GoreeCloud UI development lab. Design authority: canonical GoreeCloud UI tokens, original icon pack, founder anti–AI-slop requirement and professional visual audit. This is not an approval or deployment of Wardveil Scan, nor a redesign of any live consumer application.

## Before → after

**Before candidate:** Chrome screenshot from the original chromatic-workspace draft (base `34d95e0e75e8cce02b646a3cc062cb640c691479`), recorded locally under `qa/screenshots/gc-ui-chromatic-scene-light-iris-desktop.png`.

- **Major / content anatomy:** A huge empty white content block filled almost the entire screen, no workflow progression or useful information architecture.
- **Major / navigation and meaning:** Left rail contained only “Navigation,” header only “Workspace,” content only “Ready,” warning band and a generic button. Token compliance was mistaken for an actual product composition.
- **Major / credibility:** Generic words and a disconnected action made the layout easy to swap onto an unrelated app without materially changing its identity.

**Revised alpha candidate:** `tests/craft-workspace.html`, built with the existing `gc-scene` primitives and new, opt-in workflow typography/layout patterns in `src/components.css`, linked in `lab/index.html`. All displayed content explicitly identifies itself as synthetic and preview-only. Original `gc-icon` glyphs are shared, not emoji or remote assets. The only active controls are meaningful same-document links and a native disclosure; accessible current-location state follows the actual fragment.

Rendered Chrome screenshot paths (local, synthetic only; do **not** claim this is real Wardveil):
- `qa/screenshots/gc-ui-crafted-workspace-light-iris-desktop.png` — 1440×850, desktop, light Iris.
- `qa/screenshots/gc-ui-crafted-workspace-dark-lagoon-mobile.png` — 390×850, mobile dark Lagoon.
- `qa/screenshots/gc-ui-crafted-workspace-reduced-ember-mobile.png` — 320×850, mobile Ember, reduced motion.
- `qa/screenshots/gc-ui-crafted-workspace-forced-moss-tablet.png` — 900×850, tablet Moss, forced colors.

## Actual inspected findings

- **Desktop / hierarchy:** Contextual branded header, branded rail, status context, numbered workflow and complementary rights boundary replace the featureless white card. The reading region remains opaque. The second column is functional reference material, not a tile grid or fake metrics.
- **Mobile / proportion:** Navigation becomes horizontally scrollable rather than clipped or hidden. Header, scoped preview notice, numbered steps and long body copy wrap without horizontal document overflow. At 320px the user scrolls vertically for later steps; compactness and device-specific spacing warrant additional product review.
- **Iconography / typography:** Every shown glyph is from the original GC UI `gc-icon` family; typographic hierarchy uses existing type and space roles, not new brand choices.
- **Motion / accessibility:** The static reference does not animate to hide essential content. Browser tests separately verify existing opt-in motion, reduced-motion, forced-colors and status behavior. Reference links and disclosure are exercised in Chromium. The current location is updated by actual hash navigation, not frozen on “Overview.”
- **Forced colors:** Strong boundaries and selected location remain identifiable at 900px. CSS uses Canvas/CanvasText/Highlight system roles, preserving contrast without unsupported custom palettes.

**Technical tests:** `npm run check` validates token/type/icon/package checks and the complete Node test suite; `GC_CHROME_BIN=<verified local Chromium> npm run browser:smoke` records the four scenario screenshots and checks responsive geometry, original icons, target anchors, accessible current location and disclosure behavior. Exact PR/source SHA and final CI status must be recorded in the GitHub review when published; passing tests alone are not subjective visual approval.

## Outstanding acceptance

**Overall product disposition: NOT ADEQUATELY AUDITED.** This is a better, specifically composed *development specimen*, not product-wide acceptance. The review did not exercise actual GoreeCloud consumer routes, physical devices, screen readers, every appearance/accent combination, product-owned empty/offline/loading/error states, localization, or the deployed Wardveil browser application. At 320px the stage is vertically long and mobile navigation uses horizontal scrolling; these are candidates for further human/device review rather than a claim of flawless compactness. Browser zoom and lab accessibility tests exist elsewhere but do not substitute for real 400% audit of this specific specimen.

A future product release must show its **own** routing, meaning, density, task completion, icons, transitions, responsive reflow, privacy/security states and current screenshots. Never copy this Wardveil composition onto unrelated GoreeCloud products as an interchangeable shell; reuse the design *discipline*, not a template.
