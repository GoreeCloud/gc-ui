# GC UI Changelog

GC UI is an original independent design system. This changelog tracks implementations, not just specification intent.

## Native-first forms and component lifecycle wave — 2026-10-16
- Added the [Forms Lab](lab/forms.html) with four experimental patterns: F10 Text area, F11 Search field, F22 Form validation summary, and O53 Empty state.
- Registry maturity now reads **28 experimental**, **35 specification-only**, **0 stable** (63 documented patterns).
- Stabilized tab initialization with ARIA-disabled selected items and guarded toast timers against detached historical events.
- Expanded Node and browser regression coverage, automated forms accessibility states, and screenshot fixtures. **153 total test executions passed** locally (72 Node, 28 Chromium, 28 Firefox, 13 axe, 12 visual capture) with a [successful three-job GitHub Actions run](https://github.com/GoreeCloud/gc-ui/actions/runs/38976905865).
- Fixed the previously visible unfocused forms skip link and doubled Chromium search clear icons after inspecting light/dark screenshots. See [QA checkpoint](docs/QA_FORMS_2026-10-16.md). The [forms contract](docs/FORMS_CONTRACT.md) documents the interaction boundaries and open manual QA.
- No package release or native platform adapter was published.

## Concurrent stabilization checkpoint — 2026-10-16
- Restored the 44px mobile appearance toggle, fixed logical RTL side-sheet anchoring, and improved compact badge wrapping.
- Expanded the browser quality gate to **22 Chromium interactions, 22 Firefox interactions, 10 axe-core state audits, and 10 screenshot captures**.
- Added a nonpublishing npm archive contract check: 42 files, all 14 required export/metadata paths included and tests/labs excluded.
- **66 Node tests** and all browser tests passed locally (130 automated executions total); **7,988** opaque role-contrast comparisons passed.
- Independently verified [GitHub Actions success for source commit d2d1e55](https://github.com/GoreeCloud/gc-ui/actions/runs/38973136941): all three jobs passed.
- See [concurrent stabilization report](docs/QA_CONCURRENT_STABILIZATION_2026-10-16.md). These checks do not establish visual or WCAG certification.

## Unreleased alpha development — 2026-10-16
### Verified on a connected laptop and phone
- **55/55 Node tests** and **19/19 Playwright Chromium tests** passed locally, alongside an opaque-color audit with **7,988 checks and no failures**.
- Fixed the test-only TypeScript generic function matcher and browser automation of visually hidden switch controls (via clickable labels).
- Validated the adaptive mobile layout and side-sheet touch dismissal on OnePlus N200 Android Firefox over USB. The first Android system Back attempt did not dismiss the modal; tracked as an open compatibility observation. Detailed evidence is in `docs/DEVICE_TESTING_2026_10_16.md`.

### Added
- Eight native-first reference component treatments: icon buttons, checkboxes, radio groups, sliders, cards, accordions, badges and determinate progress.
- Machine-readable maturity registry updated to 24 experimental and 39 specification-only patterns.
- Twelve Chromium smoke tests in `e2e/gc-ui.spec.mjs`, plus five visual QA screenshots covering desktop light/dark/high-contrast, mobile and the registry, with a pinned Playwright CI job and uploaded evidence.
- Adaptive navigation and native modal side sheet: app bar, compact bottom nav, medium rail, expanded sidebar, breadcrumbs, and a side-sheet with native dialog semantics.
- Five adaptive viewport/interaction browser checks and three responsive screenshot fixtures, extending the existing 12 smoke scenarios to 17 (plus visual capture tests).
### Fixed
- Route-change announcement, document title update and focus transfer for hash navigation, without focus theft on initial render.
- Public tab controller rejects selections outside the tablist, reacts to disabled-state changes, and supports vertical tab orientation.
- Icon-button toggle retains a stable accessible name while `aria-pressed` expresses its state.
- Shared theme runtime across both labs, including a visible effective-material status and cross-page persistence coverage.
- Reusable action-menu stylesheet, native keyboard Tab and Shift+Tab focus-exit handling, and duplicate-activation guard.
- SVG glyph fragment integrity checking in local asset verification.
### Not verified yet
- Full Chromium CI success, cross-browser manual behavior, and real assistive-technology use are release gates, not completed claims.

## 0.2.0-alpha.1 — 2026-10-16
### Added
- Independent versioned design specification and 63-pattern component catalog with platform, interaction and accessibility guidance.
- DTCG-format v1 semantic token source, CSS generator, curated palette tokens and complete light/dark high-contrast role mapping.
- Web custom-seed OKLCH color engine, theme controller (system appearance, accessibility preference precedence, private storage fallback), accessible interaction bindings and native dialog handling.
- Experimental typed package entry `src/index.mjs`, `types/index.d.ts`, export map for tokens/CSS/glyphs; package publishing remains disabled.
- Original 12-symbol outline sprite and icon policy, Components Lab plus existing foundation reference lab.
- Keyboard action menu, unit and structural tests, reproducible color audit, automated generated-token integrity and CI workflow.

### Fixed
- Tonal stop selection returning undefined for some custom seeds.
- Solid Lens fallback and high-contrast semantic colors no longer dependent on mere material opacity.
- Forced-colors system color override precedence, system high-contrast preference precedence, storage-denial handling.
- Native dialog open/close idempotence and stale toast-dismiss callback affecting a newer message.
- Color-choice target ergonomics (44px).

### Not yet shipped
- Production-versioned web component library, full icon family, actual wallpaper extraction, native adapters, Playwright visual regression and manual assistive-technology sign-off. This release is **alpha** and must not be described as fully production-ready.

## 0.1.0 — Foundation Alpha
- Initial GC UI Canvas / Surface / Lens playground, foundational palettes, basic semantic components and accessibility fallbacks.

No Glaze UI source, tokens or assets have been imported.
