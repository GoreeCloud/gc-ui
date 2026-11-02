# GC UI — Forms and Components popup effective-contrast assessment

**Recorded 2026-11-01** · **Scope:** six focused browser tests for experimental Forms and Components overlays · **Status:** sampled foreground/background contrast verified; other axe inconclusives remain open.

## Verified defect and correction

The existing Forms autocomplete used `Highlight` with `HighlightText` for `aria-selected=true` in forced-colors mode. **Firefox 157** resolved that system palette to an observed **2.94:1** foreground/background pair on the selected “Studio refresh” option, below the 4.5:1 text criterion. This is a confirmed browser/theme-specific problem, not merely an axe incomplete classification.

The small corrective CSS change uses `Canvas` with `CanvasText` for the selected option, with a 3px `Highlight` outline to preserve a strong system-palette selected-state indicator and native option/keyboard/ARIA semantics. No runtime controller logic, icons, third-party assets or ordinary light/dark visual styles changed.

## Reproducible browser coverage

`e2e/popup-effective-contrast.spec.mjs` opens the actual overlays, scrolls them into the viewport, samples each enabled option/command’s browser-computed foreground and background, and conservatively composes the popup surface over *both fully black and fully white opaque underlays* using Canvas RGBA math. The test asserts a **minimum 4.5:1** enabled text ratio and checks the selected Forms forced-colors outline. Disabled “Archive (unavailable)” is identified separately and is not treated as an enabled-action text-conformance obligation.

| Target | 375px tested state | Lowest observed baseline contrast |
| --- | --- | --- |
| Forms autocomplete | Chromium light/dark | `14.23:1` |
| Components action menu | Chromium light/dark | `8.48:1` |
| Forms autocomplete | Firefox forced colors **before fix** | `2.94:1` (**failure**) |
| Forms + Components | Firefox/Chromium forced colors **after fix** | Passes `>=4.5:1` and selected-state outline |
| Forms + Components | Firefox light/dark **after fix** | Passes `>=4.5:1` |

Values are contextual to the selected observed browser and theme; differences in browser color resolution may change the least ratio. The `gc-lens` Components menu uses an approximately 84%-opaque surface, so assessing both extreme underlays is a conservative bound for a **uniform sRGB backdrop**. Actual photographs, OS compositor effects, subpixel text antialiasing and arbitrary background filters were not pixel-sampled. The test samples **CSS-computed semantic colors**, not screenshot pixels; it does not automatically close the original axe incomplete rule-level reports.

## Exception disposition

- **Sampled enabled popup text:** contrast passes in the tested ordinary light/dark/forced-colors states after the Firefox fix. The one confirmed forced-colors defect was corrected with a regression.
- **12 overlap incomplete occurrences:** the separate popup hit-test suite previously passed 7/7 Chromium and 7/7 Firefox after scrolling controls into view. This excludes sampled hit-target obstruction, not every possible overlap.
- **Other gradients, non-text glyphs, mobile/OS palettes, 5 ARIA references:** still inconclusive or out of this test scope; no global WCAG claim. Real Orca/NVDA/VoiceOver **menu speech** is still unverified: local Orca 46.1 is installed but its Python AT-SPI binding and the diagnostic's pinned Electron runtime are missing, and the existing native-host diagnostic does not target these browser controls.

This changes the SHA-256 of the **unpublished** 15-file `0.2.0-seal.0` QA artifact; update the candidate evidence and checksum before treating this new build as qualified. No release, production deployment, owner visual-scope change, or accessibility certification is authorized by the fix.

See [issue #78](https://github.com/GoreeCloud/gc-ui/issues/78) and [candidate browser contract](../release/seal/BROWSER_SUPPORT_CONTRACT_2026_11_01.md).
