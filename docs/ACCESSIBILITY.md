# GC UI — Accessibility and Validation

GC UI targets **WCAG 2.2 AA** as a future release gate, but the alpha is **not audited or certified**.

## Existing safeguards

- Native HTML buttons, controls, labels, keyboard navigable links, and a native `<dialog>`.
- `:focus-visible` outlines and skip-to-content link.
- `aria-current` for route changes, `aria-pressed` for mutually-selected buttons.
- Semantic live region for action feedback, dynamic progress attributes.
- Translucency can be disabled with a setting; OS reduced-transparency and increased-contrast preferences receive opaque fallbacks.
- Motion durations become effectively zero under `prefers-reduced-motion`.
- Mobile navigation uses a reachable dock and stable touch regions.

## Required before stable release

1. Contrast measurements for every semantic on-color pairing, including all 4 palettes in both appearances, using effective composited backgrounds (target >= 4.5:1 for normal text, >= 3:1 for large text and nontext indicators when applicable).
2. Screen-reader verification (VoiceOver, TalkBack, NVDA), including route announcements, modal focus return, and component feedback.
3. Keyboard audit: focus order, `Esc` closing dialogs, reduced-motion behavior, selected controls, 200% and 400% zoom.
4. Browser matrix: Chrome, Firefox, Safari; high contrast/forced colors; Windows, macOS, Android, iOS.
5. Touch target audit, text reflow, localization, RTL, and complex script rendering.
6. Human usability review with both default and assistive input modes.

## Validation tools

- `npm test`: checks foundational token consistency and key semantic markup.
- `node --check src/main.js`: syntax check.
- Future: automated Playwright, axe-core, contrast calculation and token snapshots.
