# GC UI — Accessibility and Validation

GC UI targets **WCAG 2.2 AA** as an accessibility design/verification goal; the alpha is **not audited or certified**. A global WCAG certificate or human screen-reader matrix is not an automatic prerequisite for a scoped stable design-system release. See [Stable Release Scope](STABLE_RELEASE_SCOPE.md).

## Existing safeguards

- Native HTML buttons, controls, labels, keyboard navigable links, and a native `<dialog>`.
- `:focus-visible` outlines and skip-to-content link.
- `aria-current` for route changes, `aria-pressed` for mutually-selected buttons.
- Semantic live region for action feedback, dynamic progress attributes.
- Translucency can be disabled with a setting; OS reduced-transparency and increased-contrast preferences receive opaque fallbacks.
- Motion durations become effectively zero under `prefers-reduced-motion`.
- Mobile navigation uses a reachable dock and stable touch regions.

## Required for a scoped stable web design-system release

1. Verified text/nontext and composited-material contrast for **shipped** semantic role pairs and interactive states, with accurate forced-colors/high-contrast fallbacks.
2. Accessible names, roles, values, keyboard/focus behavior, route/feedback semantics and reduced-motion behavior in supported shipped components, verified with applicable automated and targeted functional evidence.
3. Documented supported browser/viewport matrix with passing interaction, responsive, zoom/reflow and basic localization/RTL checks for shipped functionality.
4. Versioned public API, security boundaries, documentation and a tested distribution artifact.

**Recommended, not universally blocking:** broad VoiceOver/NVDA/Orca human listening sessions, every OS/browser permutation, extra physical phones, and energy profiling. These become conditional only when expressly promised for a particular distributed native product or compatibility claim. See [Stable Release Scope](STABLE_RELEASE_SCOPE.md).

## Validation tools

- `npm test`: checks foundational token consistency and key semantic markup.
- `node --check src/main.js`: syntax check.
- Future: automated Playwright, axe-core, contrast calculation and token snapshots.
