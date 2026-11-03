# GC UI — Selected non-text symbol semantics (2026-11-02)

**Scope:** Experimental reference labs only, current source baseline `e209730f7f92`. This is a **semantic and redundancy review**, not a blanket WCAG non-text contrast determination.

The axe incomplete triage currently identifies 17 distinct non-text-symbol review targets involving 55 affected node occurrences (historical totals retained until next fresh manifest). Several symbols are decorative glyphs paired with visible labels or ARIA-named controls, and others appear inside a disabled or decorative context. Their mere `aria-hidden` state does not automatically exempt any essential visual information from WCAG 1.4.11.

## Verified, bounded change

The v1 Materials reference used `<span>◈</span> LENS` for a decorative glyph next to the visible text LENS and an independently named Apply button. The glyph did not have `aria-hidden`, unlike equivalent glyphs in Components/Adaptive. The regression test failed in the unmodified baseline for compact light/dark/RTL cases. Adding **only** `aria-hidden="true"` to this glyph preserves the visible design and prevents redundant symbol exposure through the accessibility tree.

A new Chromium/Firefox test covers four display and viewport environments (320px light, 375px dark, 768px RTL, 1440px forced colors). Each scenario verifies the now-hidden v1 decorative glyph and visible LENS/Apply controls, Components menu and floating-control symbols paired with labeled controls, Forms stepper's explicit Remove one collaborator button name and decorative recovery preview, and Adaptive desktop/compact navigation glyphs accompanied by route text and metric/activity symbols accompanied by written information.

**Local result:** 4/4 Chromium and 4/4 Firefox tests passed after the single-markup fix. The full existing automated axe suite also passed **27/27**, the independent report verifier passed **27/27**, and refreshed manual triage retained exactly **30 checks / 318 occurrences / 180 distinct targets**, including all **17 non-text-symbol targets / 55 occurrences**. Source/package check passed. The test is wired into both browser interaction suites. These contract tests show semantic redundancy in specific reference states; they do not establish 3:1 contrast for any icon that independently conveys required information.

**Remaining:** The whole 17-target/55-occurrence historical group is **not** marked resolved by these tests. Any informational/interactive icon without an equivalent accessible indicator needs actual rendered/composited contrast review (typically 3:1 where applicable), including target OS/theme/forced colors and zoom. Keep source axe incompletes intact, do not suppress or waive targets, and retain owner visual, localized RTL, other-platform assistive-technology, and experimental Stable/Seal gates.

Related: [Axe triage](QA_AXE_INCOMPLETE_TRIAGE.md), [GoreeCloud UI stabilization #78](https://github.com/GoreeCloud/gc-ui/issues/78).

## November 3, 2026 — refreshed inventory and broadened semantic regression

From the downloaded [PR #178 Chromium QA archive](https://github.com/GoreeCloud/gc-ui/actions/runs/41718140521/artifacts/13271012823), the generated manual-triage report recorded **30 inconclusive checks, 321 node occurrences and 183 unique review targets**. These are scoped to that archived CI run's merge-test revision, not a universal or immutable count. The **non-text-symbol** category remained **17 distinct targets / 55 occurrences**, despite changes in other categories. All 55 remain inconclusive; the test does not suppress or reclassify axe results.

The existing semantic browser review already covered Components' labeled controls, Forms' recovery preview and icon-only stepper, Adaptive's labeled routes/metrics/activity symbols, and the v1 Lens reference. The review now additionally asserts that:

- The v1 status pill's visible `Foundation ready` text accompanies its hidden decorative check glyph.
- The Material Environment Lens contains visible `Temporary lens` and `Adaptive material` labels next to its hidden decorative diamond.
- The functional Forms stepper's minus glyph retains the explicit accessible name `Remove one collaborator` and is enabled in its normal state.

The extended `e2e/nontext-symbol-semantics.spec.mjs` passed **4/4 Chromium and 4/4 Firefox** targeted local browser scenarios against a temporary checkout of main commit `57b34be354097a555cde974354fcd717dc33f01f`, across compact light, mobile dark, RTL and forced-colors fixture variants. This broadens bounded **semantic redundancy and accessible-name** verification; it is **not** a 3:1 pixel-level acceptance of all 17 targets, a human screen-reader judgment or a release gate completion.

The separate `forms-stepper-contrast.spec.mjs` already checks accessible control names, at-least-44px targets and computed opaque foreground/background ratios. A generic full-button pixel minimum can also include borders and forced-color substitutions, so it must not be mistaken for a validated measurement of the minus glyph ink without a fit-for-purpose sampling method. Retain the remaining effective-pixel review and owner visual acceptance obligations without fabricating passes or modifying GC UI theme tokens.

### November 3 — targeted rendered button-interior contrast evidence

The Forms Lab's **enabled** `#demo-decrease` (minus) and `#demo-increase` (plus) controls received an additional reproducible screenshot-based regression in the existing `forms-stepper-contrast.spec.mjs`. The reusable `sampleTextControlInteriorBackdrop` helper photographs the **interior** of each fixed-size text-only control after temporarily hiding only its glyph via `font-size: 0` (rather than `color: transparent`, which OS forced-colors can override). It compares the original computed ink color against actual composited interior pixels, samples 121 points inside an 8px border inset, restores prior inline style/priority, and requires unchanged geometry/background plus **at least 3:1** sampled contrast. This complements rather than replaces the existing computed opaque-color, 44px-target, accessible-label and disabled-boundary assertions.

In isolated local tests on the recorded main checkout, **4/4 Chromium and 4/4 Firefox** scenarios passed across light, dark, high-contrast and forced-colors. Both controls produced the following conservative per-interior-sample minima: light **12.76:1**, dark **11.97:1**, high-contrast **15.34:1**, forced-colors **21:1**. The captured browser pixels avoid misleading control borders and forced-color transparency substitutions seen with a naïve full-button minimum. The test logs the actual ratios and sample counts in CI; hosted exact-head results are independently verified only after that run finishes.

**Limits:** This evidence concerns two enabled, opaque, fixed-geometry Forms stepper controls in four local browser configurations. It is **not** a measurement of antialiased glyph stroke rasterization, disabled icon contrast, different device color profiles, all 17 non-text target identities, every historical 55 axe occurrence, whole-screen WCAG conformance or native OS UI. It does not alter original axe incompletes or authorize GC UI Stable/Seal promotion.

## November 3, 2026 — three additional decorative symbol pixel samples

**Scope:** The existing `e2e/nontext-rendered-pixel.spec.mjs` previously sampled five selected non-text glyph/background contexts in Adaptive and Forms. It now also samples three **previously semantically reviewed decorative** symbols accompanied by visible text: the v1 `Foundation ready` status check glyph, the Material Environment `Temporary lens / Adaptive material` diamond, and the Components `Lens controls` floating-control glyph. They retain their existing `aria-hidden` and labeled context; no markup or colors change.

The same reusable, source-owned `sampleBackdrop` method hides each glyph's ink temporarily, samples actual browser-rendered backdrop pixels, verifies restoration of the original inline color and requires conservative **3:1 minimum sampled glyph-vs-backdrop contrast**. The existing suite captures per-lab screenshots, measurements and QA attachments for **320 light, 320 dark, 1440 light, 1440 dark and 768 light RTL**. New labs add 15 screenshot/measurement contexts; existing selected contexts remain included.

**Isolated local results:** Both Chromium **5/5** and Firefox **5/5** combined non-text rendered-pixel scenarios passed after adding the three selectors. Across all measured selected symbols and the five scenarios, the lowest recorded ratio was approximately **5.46:1** (v1 status glyph in light mode), exceeding the scoped 3:1 test threshold; the Environment and Components selected glyphs measured higher in the preliminary light/dark/RTL diagnostic. The full `npm run check` passed in the same isolated checkout. GitHub exact-branch CI is independently assessed when available.

**Limitations:** This is **sampled rendered backdrop contrast for selected glyph/background pairs**, not antialiased glyph rasterization, whole-component state coverage, native browser/device color-profile validation, a human visual judgment or universal WCAG 1.4.11 compliance. Other non-text targets and the historical **17 target / 55 occurrence** axe-incomplete category remain **inconclusive** and are neither suppressed nor reclassified. Forced-colors is not part of these five backdrop variants; do not claim those results. Keep wider release and premium visual acceptance open.
