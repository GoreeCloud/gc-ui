# GC UI Changelog

GC UI is an original independent design system. This changelog tracks implementations, not just specification intent.

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
